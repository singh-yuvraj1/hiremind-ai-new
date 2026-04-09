const express = require('express');
const router  = express.Router();
const { getJobs, getJobById, toggleSaveJob, getSavedJobs, applyToJob } = require('../controllers/jobController');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { requirePremium } = require('../middleware/usageLimiter');

// Public job listing — optional auth (marks saved/canApply if logged in)
router.get('/',       optionalProtect, getJobs);

// Saved jobs — requires auth
router.get('/saved',   protect, getSavedJobs);

// Single job — optional auth
router.get('/:id',     optionalProtect, getJobById);

// Save / unsave — requires auth
router.post('/:id/save',  protect, toggleSaveJob);

// Apply to job — requires auth + PREMIUM
router.post('/:id/apply', protect, requirePremium, applyToJob);

module.exports = router;
