const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createPayment, confirmPayment } = require('../controllers/paymentController');

// protected endpoints for creating and confirming payments
router.post('/create', auth, createPayment);
router.post('/confirm', auth, confirmPayment);

module.exports = router;