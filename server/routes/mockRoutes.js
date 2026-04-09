const express = require('express');
const router  = express.Router();
const { getMockQuestions, submitMockTest, getMockHistory } = require('../controllers/mockController');
const { protect }        = require('../middleware/authMiddleware');
const { limitMockTests } = require('../middleware/usageLimiter');

router.get('/questions', protect, getMockQuestions);
router.post('/submit',   protect, limitMockTests, submitMockTest); // usage limited
router.get('/history',   protect, getMockHistory);

module.exports = router;