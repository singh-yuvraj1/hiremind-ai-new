const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const makeToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * Build the user payload sent in every auth response.
 * Includes premium status so frontend knows plan immediately on login.
 */
const buildUserPayload = (user) => ({
  id:           user._id,
  name:         user.name,
  email:        user.email,
  avatar:       user.avatar,
  authProvider: user.authProvider,
  isPremium:    user.isPremium  || false,
  premiumExpiry:user.premiumExpiry || null,
  plan:         user.subscription?.plan || (user.isPremium ? 'premium' : 'free'),
  stats:        user.stats,
  dailyUsage:   user.dailyUsage,
});

const sendToken = (user, statusCode, res) => {
  const token = makeToken(user._id);
  res.status(statusCode).json({
    success: true,
    token,
    user: buildUserPayload(user),
  });
};

/* ── REGISTER ─────────────────────────────────────────────────────── */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please fill all fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── LOGIN ────────────────────────────────────────────────────────── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Enter email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GOOGLE AUTH ──────────────────────────────────────────────────── */
const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken:  credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email, picture, sub: googleId } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        avatar:       picture,
        googleId,
        authProvider: 'google',
      });
    } else if (!user.googleId) {
      user.googleId     = googleId;
      user.avatar       = picture;
      user.authProvider = 'google';
      await user.save();
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('Google auth error:', err.message);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

/* ── GET ME ───────────────────────────────────────────────────────── */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Auto-expire premium if needed
    if (user.isPremium && user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      user.isPremium = false;
      user.subscription.plan = 'free';
      await user.save();
    }

    res.json({
      success: true,
      user: buildUserPayload(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET USAGE STATUS ─────────────────────────────────────────────── */
const getUsage = async (req, res) => {
  try {
    const { getUsageStatus } = require('../middleware/usageLimiter');
    const status = await getUsageStatus(req.user._id);
    if (!status) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, ...status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, googleAuth, getMe, getUsage };