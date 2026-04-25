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
//  PREMIUM:
//    • Unlimited everything, all difficulties, job apply
// ============================================================

const User = require('../models/User');
// Re-export from premiumMiddleware — single source of truth
const { requirePremium } = require('./premiumMiddleware');

const FREE_LIMITS = {
  interviews:   3,
  tests:        2,
  resumeChecks: 2,
};

const todayStr = () => new Date().toISOString().slice(0, 10);

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

const limitExceededResponse = (feature, used, limit) => ({
  success: false,
  limitExceeded: true,
  feature,
  used,
  limit,
  message: `Daily ${feature} limit reached (${used}/${limit}). Upgrade to Premium for unlimited access.`,
  upgradeRequired: true,
});

/* ── INTERVIEW LIMITER ────────────────────────────────────────────── */
const limitInterviews = async (req, res, next) => {
  try {
    const user = await getUserWithReset(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isPremium) return next();

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

    const used  = user.dailyUsage.interviews;
    const limit = FREE_LIMITS.interviews;
    if (used >= limit) {
      return res.status(429).json(limitExceededResponse('interviews', used, limit));
    }

    req.userDoc = user;
    next();
  } catch (err) {
    console.error('[usageLimiter] limitInterviews error:', err.message);
    next(err);
  }
};

/* ── MOCK TEST LIMITER ────────────────────────────────────────────── */
const limitMockTests = async (req, res, next) => {
  try {
    const user = await getUserWithReset(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isPremium) return next();

    const used  = user.dailyUsage.tests;
    const limit = FREE_LIMITS.tests;
    if (used >= limit) {
      return res.status(429).json(limitExceededResponse('mock tests', used, limit));
    }

    req.userDoc = user;
    next();
  } catch (err) {
    console.error('[usageLimiter] limitMockTests error:', err.message);
    next(err);
  }
};

/* ── RESUME CHECK LIMITER ─────────────────────────────────────────── */
const limitResumeChecks = async (req, res, next) => {
  try {
    const user = await getUserWithReset(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.isPremium) return next();

    const used  = user.dailyUsage.resumeChecks;
    const limit = FREE_LIMITS.resumeChecks;
    if (used >= limit) {
      return res.status(429).json(limitExceededResponse('resume checks', used, limit));
    }

    req.userDoc = user;
    next();
  } catch (err) {
    console.error('[usageLimiter] limitResumeChecks error:', err.message);
    next(err);
  }
};

/* ── USAGE STATUS ─────────────────────────────────────────────────── */
const getUsageStatus = async (userId) => {
  const user = await getUserWithReset(userId);
  if (!user) return null;

  if (user.isPremium) {
    return {
      isPremium: true,
      plan:      user.subscription?.plan || 'premium',
      usage:     { interviews: user.dailyUsage.interviews, tests: user.dailyUsage.tests, resumeChecks: user.dailyUsage.resumeChecks },
      limits:    { interviews: Infinity, tests: Infinity, resumeChecks: Infinity },
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
  requirePremium,    // re-exported from premiumMiddleware (single source of truth)
  getUsageStatus,
  FREE_LIMITS,
};
