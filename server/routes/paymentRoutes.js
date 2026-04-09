// routes/paymentRoutes.js  —  HireMind AI
const express = require('express');
const router  = express.Router();

const { createOrder, verifyPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// All payment routes require authentication
router.post('/create-order', protect, createOrder);   // Step 1: create Razorpay order
router.post('/verify',       protect, verifyPayment); // Step 2: verify signature + activate
router.get('/status',        protect, getPaymentStatus); // Get current plan status

module.exports = router;
