const express = require('express');
const router = express.Router();
const { register, login, googleAuth, getMe, getUsage, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login',    login);
router.post('/google',   googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me',        protect, getMe);
router.get('/usage',     protect, getUsage);  // daily usage status

module.exports = router;