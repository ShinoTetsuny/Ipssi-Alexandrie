const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');

router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);

module.exports = router;
