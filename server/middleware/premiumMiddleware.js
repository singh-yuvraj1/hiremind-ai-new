/**
 * middleware/premiumMiddleware.js — HireMind AI
 *
 * Central premium access control.
 *
 * OVERRIDE_EMAILS: any email listed here is ALWAYS treated as premium,
 * regardless of their DB isPremium field.  Add/remove emails here —
 * never scatter email checks elsewhere in the codebase.
 */

const User = require('../models/User');

// ── Emails that always get premium access ─────────────────────────────
const PREMIUM_OVERRIDE_EMAILS = [
  'yuvraj.singh.95928@gmail.com',
];

/**
 * Checks whether a given email qualifies for the permanent premium override.
 * A single place to change if more override users are added.
 */
const isOverrideEmail = (email) =>
  PREMIUM_OVERRIDE_EMAILS.includes((email || '').toLowerCase().trim());

/**
 * ensurePremiumOverride — call this after any login / signup / Google auth.
 *
 * If the user's email is in PREMIUM_OVERRIDE_EMAILS, their isPremium is
 * set to true and saved (only writes DB if a change is needed).
 *
 * @param {Document} user — Mongoose User document
 */
const ensurePremiumOverride = async (user) => {
  if (!user) return;
  if (isOverrideEmail(user.email) && !user.isPremium) {
    user.isPremium = true;
    user.subscription = { ...user.subscription, plan: 'premium' };
    await user.save({ validateBeforeSave: false });
  }
};

/**
 * requirePremium — Express middleware.
 *
 * Blocks the request with 403 if the authenticated user is not premium.
 * Override emails automatically pass.
 *
 * Usage:
 *   router.get('/advanced-analytics', protect, requirePremium, controller);
 */
const requirePremium = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }

    // Re-fetch to get latest isPremium value (JWT may be stale)
    const user = await User.findById(req.user._id).select('isPremium premiumExpiry email subscription');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Apply override if needed (idempotent)
    if (isOverrideEmail(user.email)) {
      if (!user.isPremium) {
        user.isPremium = true;
        user.subscription = { ...user.subscription, plan: 'premium' };
        await user.save({ validateBeforeSave: false });
      }
      return next();
    }

    // Check if premium has expired
    if (user.isPremium && user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      await User.findByIdAndUpdate(req.user._id, {
        isPremium: false,
        'subscription.plan': 'free',
      });
      return res.status(403).json({
        success: false,
        upgradeRequired: true,
        message: 'Your Premium subscription has expired. Please renew to continue.',
      });
    }

    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        upgradeRequired: true,
        message: 'This feature requires a Premium subscription. Upgrade to unlock unlimited access.',
      });
    }

    next();
  } catch (err) {
    console.error('[premiumMiddleware] requirePremium error:', err.message);
    next(err);
  }
};

module.exports = { requirePremium, ensurePremiumOverride, isOverrideEmail, PREMIUM_OVERRIDE_EMAILS };
