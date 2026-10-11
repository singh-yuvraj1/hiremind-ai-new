const express  = require('express');
const router   = express.Router();

const {
  analyzeResume,
  getLastAnalysis,
  getAnalysisHistory,
  getAnalysisById,
} = require('../controllers/resumeController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingleDocument, handleMulterError } = require('../utils/multerConfig');
const { limitResumeChecks } = require('../middleware/usageLimiter');

// POST /api/resume/analyze — PDF, DOCX, TXT support
router.post(
  '/analyze',
  protect,
  limitResumeChecks,               // freemium quota check BEFORE multer
  uploadSingleDocument('resume'),  // multer: memory storage, PDF / DOCX / TXT, 5 MB
  handleMulterError,               // multer-specific error handling
  analyzeResume
);

// GET /api/resume/last — fetch latest analysis
router.get('/last', protect, getLastAnalysis);

// GET /api/resume/history — fetch analysis history for current user
router.get('/history', protect, getAnalysisHistory);

// GET /api/resume/:id — fetch specific analysis by id
router.get('/:id', protect, getAnalysisById);

module.exports = router;
