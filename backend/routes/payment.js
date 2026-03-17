const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { verifyToken, authorize } = require('../middleware/auth');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId12345',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummyKeySecret1234567890'
});

const requireUser = [verifyToken, authorize('user')];

// ── POST /api/payments/process ─────────────────────────────────────────────
router.post('/process', ...requireUser, async (req, res) => {
    try {
        const { orderId, method, paymentGateway = 'None', transactionId = '' } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID.' });
        }

        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found.' });
        }

        const payment = new Payment({
            orderId,
            userId: req.user.id,
            amount: order.totalPrice,
            method,
            paymentGateway,
            transactionId,
            status: method === 'COD' ? 'Pending' : 'Completed'
        });

        await payment.save();

        // Update Order status
        if (payment.status === 'Completed') {
            order.paymentStatus = 'Paid';
            await order.save();
        }

        res.json({ success: true, message: `Payment ${payment.status}`, payment });
    } catch (err) {
        console.error('Payment error:', err);
        res.status(500).json({ success: false, message: 'Server error processing payment.' });
    }
});

// ── GET /api/payments/order/:orderId ────────────────────────────────────────
router.get('/order/:orderId', ...requireUser, async (req, res) => {
    try {
        const { orderId } = req.params;
        const payment = await Payment.findOne({ orderId, userId: req.user.id }).sort({ createdAt: -1 });
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found.' });
        res.json({ success: true, payment });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── POST /api/payments/create-order ────────────────────────────────────────
router.post('/create-order', verifyToken, async (req, res) => {
    try {
        const { amount } = req.body; // Amount in INR
        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }

        const isDummy = (process.env.RAZORPAY_KEY_ID || 'rzp_test_dummyKeyId12345').includes('dummy');
        if (isDummy) {
            // Mock razorpay order
            return res.json({
                success: true,
                order: { id: 'order_mock_' + Date.now(), amount: amount * 100, currency: 'INR' },
                isDummy: true
            });
        }

        const options = {
            amount: amount * 100, // paise
            currency: 'INR',
            receipt: 'receipt_order_' + Date.now()
        };

        const order = await razorpay.orders.create(options);
        res.json({ success: true, order, isDummy: false });
    } catch (err) {
        console.error('Error creating Razorpay order:', err);
        res.status(500).json({ success: false, message: 'Server error creating Razorpay order.' });
    }
});

// ── POST /api/payments/verify-payment ──────────────────────────────────────
router.post('/verify-payment', verifyToken, async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            isDummy
        } = req.body;

        if (isDummy) {
            return res.json({ success: true, message: 'Mock payment verified successfully.' });
        }

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'dummyKeySecret1234567890')
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            res.json({ success: true, message: 'Payment verified successfully.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid Signature' });
        }
    } catch (err) {
        console.error('Error verifying payment:', err);
        res.status(500).json({ success: false, message: 'Server error verifying payment.' });
    }
});

module.exports = router;
