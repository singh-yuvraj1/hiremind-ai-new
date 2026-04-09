// ============================================================
//  middleware/usageLimiter.js  —  HireMind AI
//  Enforces daily usage quotas for free users.
//  Premium users bypass all limits.
//
//  FREE USER limits (reset daily):
//    • 3 interviews/day  (EASY only)
//    • 2 mock tests/day
//    • 2 resume checks/day
//    • Cannot apply to jobs
//
//  PREMIUM USER:
//    • Unlimited everything
//    • All difficulties
//    • Can apply to jobs
// ============================================================

const User = require('../models/User');

const FREE_LIMITS = {
  interviews:   3,
  tests:        2,
  resumeChecks: 2,
};

/**
 * Get today's date string 'YYYY-MM-DD' in local time.
 */
const todayStr = () => new Date().toISOString().slice(0, 10);

/**
 * Load user + reset daily counters if it's a new day.
 */
const getUserWithReset = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = todayStr();
  if (user.dailyUsage.lastResetDate !== today) {
    user.dailyUsage.interviews    = 0;
    user.dailyUsage.tests         = 0;
    user.dailyUsage.resumeChecks  = 0;
    user.dailyUsage.lastResetDate = today;
    await user.save();
  }

  return user;
};

/**
 * Build the 429 response payload.
 */
const limitExceededResponse = (feature, used, limit, isPremium) => ({
  success: false,
  limitExceeded: true,
  feature,
  used,
  limit,
  message: `Daily ${feature} limit reached (${used}/${limit}). Upgrade to Premium for unlimited access.`,
  upgradeRequired: true,
});

/* ── INTERVIEW LIMITER ────────────────────────────────────────────── */

/**
 * POST /api/interviews — gate for free users
 * Also enforces: free users can only start EASY difficulty interviews.
 */
const limitInterviews = async (req, res, next) => {
  try {
    const user = await getUserWithReset(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Premium users bypass all limits
    if (user.isPremium) return next();

    // Check difficulty restriction for free users
    const difficulty = (req.body.difficulty || 'medium').toLowerCase();
    if (difficulty !== 'easy') {
      return res.status(403).json({
        success: false,
        limitExceeded: true,
        feature: 'difficulty',
        message: 'Free users can only access EASY difficulty interviews. Upgrade to Premium for Medium and Hard.',
        upgradeRequired: true,
        currentDifficulty: difficulty,
      });
    }

    // Check daily count
    const used  = user.dailyUsage.interviews;
    const limit = FREE_LIMITS.interviews;

    if (used >= limit) {
      return res.status(429).json(limitExceededResponse('interviews', used, limit, false));
    }

    // Attach user to request for controllers to access without re-fetching
    req.userDoc = user;
    next();
  } catch (err) {
    console.error('[usageLimiter] limitInterviews error:', err.message);
    next(err);
  }
};

/* ── MOCK TEST LIMITER ────────────────────────────────────────────── */

/**
 * POST /api/mock/submit — gate for free users
 */
const limitMockTests = async (req, res, next) => {
  try {
    const user = await getUserWithReset(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isPremium) return next();

    const used  = user.dailyUsage.tests;
    const limit = FREE_LIMITS.tests;

    if (used >= limit) {
      return res.status(429).json(limitExceededResponse('mock tests', used, limit, false));
    }

    req.userDoc = user;
    next();
  } catch (err) {
    console.error('[usageLimiter] limitMockTests error:', err.message);
    next(err);
  }
};

/* ── RESUME CHECK LIMITER ─────────────────────────────────────────── */

/**
 * POST /api/resume/analyze — gate for free users
 */
const limitResumeChecks = async (req, res, next) => {
  try {
    const user = await getUserWithReset(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isPremium) return next();

    const used  = user.dailyUsage.resumeChecks;
    const limit = FREE_LIMITS.resumeChecks;

    if (used >= limit) {
      return res.status(429).json(limitExceededResponse('resume checks', used, limit, false));
    }

    req.userDoc = user;
    next();
  } catch (err) {
    console.error('[usageLimiter] limitResumeChecks error:', err.message);
    next(err);
  }
};

/* ── PREMIUM GUARD ────────────────────────────────────────────────── */

/**
 * Middleware: only allow premium users through.
 * Use on routes like job apply.
 */
const requirePremium = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('isPremium premiumExpiry name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.isPremium) {
      return res.status(403).json({
        success: false,
        upgradeRequired: true,
        message: 'This feature requires a Premium subscription (Rs. 199/month). Upgrade now to apply to jobs.',
      });
    }

    // Check if premium has expired
    if (user.premiumExpiry && new Date() > new Date(user.premiumExpiry)) {
      // Auto-downgrade expired premium
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

    next();
  } catch (err) {
    console.error('[usageLimiter] requirePremium error:', err.message);
    next(err);
  }
};

/* ── USAGE STATUS ─────────────────────────────────────────────────── */

/**
 * Returns current daily usage for a user.
 * Used by Profile page to display remaining counts.
 */
const getUsageStatus = async (userId) => {
  const user = await getUserWithReset(userId);
  if (!user) return null;

  if (user.isPremium) {
    return {
      isPremium: true,
      plan: 'premium',
      usage: { interviews: user.dailyUsage.interviews, tests: user.dailyUsage.tests, resumeChecks: user.dailyUsage.resumeChecks },
      limits: { interviews: Infinity, tests: Infinity, resumeChecks: Infinity },
      remaining: { interviews: Infinity, tests: Infinity, resumeChecks: Infinity },
    };
  }

  return {
    isPremium: false,
    plan: 'free',
    usage: {
      interviews:   user.dailyUsage.interviews,
      tests:        user.dailyUsage.tests,
      resumeChecks: user.dailyUsage.resumeChecks,
    },
    limits: FREE_LIMITS,
    remaining: {
      interviews:   Math.max(0, FREE_LIMITS.interviews   - user.dailyUsage.interviews),
      tests:        Math.max(0, FREE_LIMITS.tests        - user.dailyUsage.tests),
      resumeChecks: Math.max(0, FREE_LIMITS.resumeChecks - user.dailyUsage.resumeChecks),
    },
  };
};

module.exports = {
  limitInterviews,
  limitMockTests,
  limitResumeChecks,
  requirePremium,
  getUsageStatus,
  FREE_LIMITS,
};
