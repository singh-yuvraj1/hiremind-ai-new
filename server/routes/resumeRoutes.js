const express  = require('express');
const router   = express.Router();

const { analyzeResume, getLastAnalysis } = require('../controllers/resumeController');
const { protect }                        = require('../middleware/authMiddleware');
const { uploadSinglePDF, handleMulterError } = require('../utils/multerConfig');
const { limitResumeChecks }              = require('../middleware/usageLimiter');

// POST /api/resume/analyze — PDF only, usage limited
router.post(
  '/analyze',
  protect,
  limitResumeChecks,               // freemium quota check BEFORE multer
  uploadSinglePDF('resume'),       // multer: memory storage, PDF only, 5 MB
  handleMulterError,               // multer-specific error handling
  analyzeResume
);

// GET /api/resume/last
router.get('/last', protect, getLastAnalysis);

module.exports = router;
