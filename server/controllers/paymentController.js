// ============================================================
//  controllers/paymentController.js  —  HireMind AI
//  Razorpay payment integration for Premium subscription.
//
//  Flow:
//    1. POST /api/payment/create-order  → creates Razorpay order
//    2. Frontend opens Razorpay checkout
//    3. POST /api/payment/verify       → verifies HMAC signature
//    4. On success: user.isPremium = true, expiry = +30 days
// ============================================================

const crypto = require('crypto');
const User   = require('../models/User');

// ── Lazy-load Razorpay (handles missing package gracefully) ──────────
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch {
  console.warn('[Payment] razorpay package not installed. Run: npm install razorpay');
}

const getRazorpayInstance = () => {
  if (!Razorpay) {
    throw Object.assign(new Error('Razorpay package not installed. Run: npm install razorpay in server/'), { status: 503 });
  }
  const keyId     = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret || keyId === 'rzp_test_YOUR_KEY_ID') {
    throw Object.assign(new Error('Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env'), { status: 503 });
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

/* ── PLAN CONFIG ──────────────────────────────────────────────────── */
const PREMIUM_PLAN = {
  amount:      19900,     // Rs. 199 in paise (₹1 = 100 paise)
  currency:    'INR',
  description: 'HireMind AI Premium — 1 Month',
  durationDays: 30,
};

/* ════════════════════════════════════════════════════════════════════
   POST /api/payment/create-order
   Creates a Razorpay order and returns order_id to frontend.
   Body: {} (optional: { plan: 'premium' })
   ════════════════════════════════════════════════════════════════════ */
const createOrder = async (req, res) => {
  try {
    const razorpay = getRazorpayInstance();

    const options = {
      amount:   PREMIUM_PLAN.amount,
      currency: PREMIUM_PLAN.currency,
      receipt:  `hm_${req.user._id}_${Date.now()}`,
      notes: {
        userId:      req.user._id.toString(),
        userEmail:   req.user.email,
        plan:        'premium',
        description: PREMIUM_PLAN.description,
      },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order: {
        id:       order.id,
        amount:   order.amount,
        currency: order.currency,
      },
      keyId:  process.env.RAZORPAY_KEY_ID,
      plan:   PREMIUM_PLAN,
      user: {
        name:  req.user.name,
        email: req.user.email,
      },
    });
  } catch (err) {
    console.error('[createOrder] Error:', err.message);
    res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

/* ════════════════════════════════════════════════════════════════════
   POST /api/payment/verify
   Verifies Razorpay HMAC signature and activates Premium.
   Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
   ════════════════════════════════════════════════════════════════════ */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields.' });
    }

    // ── Verify HMAC SHA-256 signature ─────────────────────────────
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret || keySecret === 'rzp_test_YOUR_KEY_SECRET') {
      return res.status(503).json({ success: false, message: 'Payment system not configured.' });
    }

    const body      = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected  = crypto.createHmac('sha256', keySecret).update(body).digest('hex');

    if (expected !== razorpay_signature) {
      console.error('[verifyPayment] Signature mismatch — possible fraud attempt');
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // ── Signature valid → activate Premium ───────────────────────
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + PREMIUM_PLAN.durationDays);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isPremium:       true,
        premiumExpiry:   expiry,
        'subscription.plan':             'premium',
        'subscription.validUntil':       expiry,
        'subscription.razorpayOrderId':  razorpay_order_id,
        'subscription.razorpayPaymentId': razorpay_payment_id,
      },
      { new: true }
    );

    console.log(`[Payment] ✅ Premium activated for user ${user.email} until ${expiry.toISOString()}`);

    res.json({
      success:     true,
      message:     'Payment verified! Premium activated successfully. 🎉',
      isPremium:   true,
      premiumExpiry: expiry,
      plan:        'premium',
      paymentId:   razorpay_payment_id,
    });
  } catch (err) {
    console.error('[verifyPayment] Error:', err.message);
    res.status(500).json({ success: false, message: 'Payment verification failed.' });
  }
};

/* ════════════════════════════════════════════════════════════════════
   GET /api/payment/status
   Returns current subscription status for the logged-in user.
   ════════════════════════════════════════════════════════════════════ */
const getPaymentStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('isPremium premiumExpiry subscription dailyUsage');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Auto-expire premium if past expiry date
    if (user.isPremium && user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      await User.findByIdAndUpdate(req.user._id, {
        isPremium: false,
        'subscription.plan': 'free',
      });
      return res.json({
        success:   true,
        isPremium: false,
        plan:      'free',
        expired:   true,
        message:   'Your Premium subscription has expired.',
      });
    }

    const daysLeft = user.isPremium && user.premiumExpiry
      ? Math.max(0, Math.ceil((new Date(user.premiumExpiry) - new Date()) / (1000 * 60 * 60 * 24)))
      : 0;

    res.json({
      success:       true,
      isPremium:     user.isPremium,
      plan:          user.subscription?.plan || 'free',
      premiumExpiry: user.premiumExpiry,
      daysLeft,
      planPrice:     { amount: PREMIUM_PLAN.amount / 100, currency: 'INR', label: '₹199/month' },
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || null,
    });
  } catch (err) {
    console.error('[getPaymentStatus] Error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch payment status.' });
  }
};

module.exports = { createOrder, verifyPayment, getPaymentStatus };
