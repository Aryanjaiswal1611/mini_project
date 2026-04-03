const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Feedback = require('../models/Feedback');
const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const { verifyToken, authorize } = require('../middleware/auth');

const requireUser = [verifyToken, authorize('user')];

// ── POST /api/feedback/submit ──────────────────────────────────────────────
router.post('/submit', ...requireUser, async (req, res) => {
    try {
        const { orderId, rating, comment } = req.body;

        if (!mongoose.Types.ObjectId.isValid(orderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID.' });
        }

        const order = await Order.findOne({ _id: orderId, userId: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
        if (order.orderStatus !== 'Delivered') {
            return res.status(400).json({ success: false, message: 'Feedback can only be given for delivered orders.' });
        }
        if (order.feedbackId) {
            return res.status(400).json({ success: false, message: 'Feedback already submitted for this order.' });
        }

        const feedback = new Feedback({
            orderId,
            userId: req.user.id,
            restaurantId: order.restaurantId,
            deliveryPartnerId: order.delivery_partner_id,
            rating,
            comment
        });

        await feedback.save();

        // Update Order with feedbackId
        order.feedbackId = feedback._id;
        await order.save();

        // Update Delivery Partner Rating if assigned
        if (order.delivery_partner_id) {
            const partner = await DeliveryPartner.findById(order.delivery_partner_id);
            if (partner) {
                const totalRating = (partner.averageRating * partner.ratingCount) + rating;
                partner.ratingCount += 1;
                partner.averageRating = totalRating / partner.ratingCount;
                await partner.save();
            }
        }

        res.json({ success: true, message: 'Feedback submitted successfully.', feedback });
    } catch (err) {
        console.error('Feedback submission error:', err);
        res.status(500).json({ success: false, message: 'Server error submitting feedback.' });
    }
});

// ── GET /api/feedback/rider/:riderId ────────────────────────────────────────
router.get('/rider/:riderId', async (req, res) => {
    try {
        const { riderId } = req.params;
        const reviews = await Feedback.find({ deliveryPartnerId: riderId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
