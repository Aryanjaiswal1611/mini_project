const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { verifyToken, authorize } = require('../middleware/auth');

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

module.exports = router;
