const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payments');
const { verifyUser, checkAdmin } = require('../middleware/middleware.js')


router.post('/create-payment-intent', paymentController.createPaymentIntent);
router.post('/buy-storage/:userId', verifyUser, paymentController.buyStorage);

module.exports = router;
