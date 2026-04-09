// ============================================================
//  controllers/jobController.js  —  HireMind AI
//  Updated: apply endpoint with premium gate + optional auth
// ============================================================

const Job  = require('../models/Job');
const User = require('../models/User');

/* ── GET /api/jobs ── list with filters + search (optional auth) ──── */
const getJobs = async (req, res) => {
  try {
    const { role, location, type, remote, search, page = 1, limit = 12 } = req.query;
    const filter = {};

    if (role && role !== 'all')       filter.role = role;
    if (type && type !== 'all')       filter.type = type;
    if (remote === 'true')            filter.remote = true;
    if (location && location !== 'all') {
      filter.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      filter.$or = [
        { title:   { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { tags:    { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const skip  = (parseInt(page) - 1) * parseInt(limit);
    const total = await Job.countDocuments(filter);
    const jobs  = await Job.find(filter)
      .sort({ featured: -1, postedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // mark which ones the user has saved (only if authenticated)
    let savedSet    = new Set();
    let isPremium = false;

    if (req.user) {
      const u = await User.findById(req.user._id).select('savedJobs isPremium');
      savedSet  = new Set((u?.savedJobs || []).map(id => id.toString()));
      isPremium = u?.isPremium || false;
    }

    const jobsWithSaved = jobs.map(j => ({
      ...j.toObject(),
      isSaved:    savedSet.has(j._id.toString()),
      canApply:   isPremium,         // tells frontend whether to show Apply or Upgrade
    }));

    res.json({
      success: true,
      jobs: jobsWithSaved,
      total,
      page:  parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      userPlan: req.user ? (isPremium ? 'premium' : 'free') : 'guest',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/jobs/:id ─────────────────────────────────────────────── */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });

    let canApply = false;
    if (req.user) {
      const u = await User.findById(req.user._id).select('isPremium');
      canApply = u?.isPremium || false;
    }

    res.json({ success: true, job: { ...job.toObject(), canApply } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/jobs/:id/save ── toggle save (requires auth) ────────── */
const toggleSaveJob = async (req, res) => {
  try {
    const user  = await User.findById(req.user._id);
    const jobId = req.params.id;

    const idx = user.savedJobs.findIndex(id => id.toString() === jobId);
    if (idx > -1) {
      user.savedJobs.splice(idx, 1);
    } else {
      user.savedJobs.push(jobId);
    }
    await user.save();

    res.json({ success: true, saved: idx === -1, savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── GET /api/jobs/saved ── user saved jobs ─────────────────────────── */
const getSavedJobs = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('savedJobs')
      .select('savedJobs isPremium');

    const isPremium = user?.isPremium || false;
    const jobs = (user?.savedJobs || []).map(j => ({
      ...j.toObject(),
      isSaved:  true,
      canApply: isPremium,
    }));

    res.json({ success: true, jobs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── POST /api/jobs/:id/apply ── Premium-gated apply ───────────────── */
/**
 * This endpoint is hit when a Premium user clicks "Apply Now".
 * It returns the real application link and logs the application.
 * requirePremium middleware ensures only premium users reach here.
 */
const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }

    if (!job.link) {
      return res.status(400).json({
        success: false,
        message: 'This job does not have a direct application link. Please visit the company website.',
      });
    }

    // Validate URL format
    let applyUrl = job.link;
    if (!applyUrl.startsWith('http://') && !applyUrl.startsWith('https://')) {
      applyUrl = 'https://' + applyUrl;
    }

    res.json({
      success:  true,
      applyUrl,
      job: {
        title:   job.title,
        company: job.company,
        link:    applyUrl,
      },
      message: `Redirecting you to apply at ${job.company}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getJobs, getJobById, toggleSaveJob, getSavedJobs, applyToJob };
