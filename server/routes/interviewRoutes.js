const express = require('express');
const router  = express.Router();

const {
  getInterviewQuestions,
  saveInterviewSession,
  getUserSessions,
  getSession,
  deleteSession,
  getAvailableRoles,
} = require('../controllers/interviewController');

const { protect }          = require('../middleware/authMiddleware');
const { limitInterviews }  = require('../middleware/usageLimiter');

// GET  /api/interviews/roles
router.get('/roles',     protect, getAvailableRoles);

// GET  /api/interviews/questions?role=backend&difficulty=medium&count=5
router.get('/questions', protect, getInterviewQuestions);

// GET  /api/interviews  — paginated session history
router.get('/',          protect, getUserSessions);

// POST /api/interviews  — save session + get evaluation (usage limited)
router.post('/',         protect, limitInterviews, saveInterviewSession);

// GET  /api/interviews/:id
router.get('/:id',       protect, getSession);

// DELETE /api/interviews/:id
router.delete('/:id',    protect, deleteSession);

module.exports = router;