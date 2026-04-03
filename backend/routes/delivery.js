const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');

const { verifyToken, authorize, JWT_SECRET } = require('../middleware/auth');
const requireDelivery = [verifyToken, authorize('delivery')];

// ── POST /api/delivery/signup ──────────────────────────────────────────────
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password, vehicle_type } = req.body;
        
        const existing = await DeliveryPartner.findOne({ $or: [{ email }, { phone }] });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email or phone already registered.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newPartner = await DeliveryPartner.create({
            name, email, phone, vehicle_type, password: hashedPassword
        });

        const token = jwt.sign({ id: newPartner._id, role: 'delivery' }, JWT_SECRET, { expiresIn: '7d' });
        
        res.status(201).json({ 
            success: true, 
            token, 
            partner: { id: newPartner._id, name: newPartner.name, is_online: newPartner.is_online } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during signup' });
    }
});

// ── POST /api/delivery/login ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const partner = await DeliveryPartner.findOne({ email });
        if (!partner) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, partner.password);
        if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });

        const token = jwt.sign({ id: partner._id, role: 'delivery' }, JWT_SECRET, { expiresIn: '7d' });
        
        // Reset session earnings on login as requested (session-based display)
        partner.sessionEarnings = 0;
        await partner.save();

        res.json({ 
            success: true, 
            token, 
            partner: { id: partner._id, name: partner.name, is_online: partner.is_online, averageRating: partner.averageRating } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
});

// ── GET /api/delivery/me ───────────────────────────────────────────────────
router.get('/me', ...requireDelivery, async (req, res) => {
    try {
        const partner = await DeliveryPartner.findById(req.user.id).select('-password');
        if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
        
        res.json({ success: true, partner });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── POST /api/delivery/toggle-status ───────────────────────────────────────
router.post('/toggle-status', ...requireDelivery, async (req, res) => {
    try {
        const { is_online } = req.body;
        const partner = await DeliveryPartner.findByIdAndUpdate(
            req.user.id, 
            { is_online }, 
            { new: true }
        ).select('-password');
        
        res.json({ success: true, is_online: partner.is_online, partner });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── GET /api/delivery/orders ────────────────────────────────────────────────
router.get('/orders', ...requireDelivery, async (req, res) => {
    try {
        // Find orders assigned to this partner that are not Delivered or Cancelled
        const orders = await Order.find({ 
            delivery_partner_id: req.user.id,
            orderStatus: { $in: ['Preparing', 'Out for Delivery'] }
        }).populate('restaurantId', 'restaurantName branchName')
          .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching orders' });
    }
});

// ── POST /api/delivery/orders/:id/status ───────────────────────────────────
router.post('/orders/:id/status', ...requireDelivery, async (req, res) => {
    try {
        const { id } = req.params;
        const { status, verificationCode } = req.body;
        
        const validStatuses = ['Picked Up', 'Out for Delivery', 'Delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const order = await Order.findOne({ _id: id, delivery_partner_id: req.user.id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });

        if (status === 'Delivered') {
            if (!verificationCode) {
                return res.status(400).json({ success: false, message: 'Verification code is required' });
            }
            if (String(order.verificationCode).trim() !== String(verificationCode).trim()) {
                return res.status(400).json({ success: false, message: 'Incorrect verification code. Access denied.' });
            }
        }

        const updateData = {};
        if (status === 'Picked Up') {
            updateData.orderStatus = 'Out for Delivery'; // Mapped 'Picked Up' to Order schema's 'Out for Delivery' conceptually, but let's just make it 'Out for Delivery' officially to match schema.
            updateData['timeline.picked_up_at'] = new Date();
        } else if (status === 'Out for Delivery') {
            updateData.orderStatus = 'Out for Delivery';
        } else if (status === 'Delivered') {
            updateData.orderStatus = 'Delivered';
            updateData['timeline.delivered_at'] = new Date();
        }

        const updatedOrder = await Order.findOneAndUpdate(
            { _id: id, delivery_partner_id: req.user.id },
            updateData,
            { new: true }
        );

        if (!updatedOrder) return res.status(404).json({ success: false, message: 'Order not found or not assigned to you' });

        // If delivered, credit earnings to rider (fixed ₹50 per delivery)
        if (status === 'Delivered') {
            await DeliveryPartner.findByIdAndUpdate(req.user.id, {
                $inc: { earnings: 50, sessionEarnings: 50, total_deliveries: 1 }
            });
        }

        // Notify via socket.io
        req.app.emit('order_status_update', { orderId: updatedOrder._id, status: updatedOrder.orderStatus });

        res.json({ success: true, order: updatedOrder });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ success: false, message: 'Server error updating status' });
    }
});

// ── GET /api/delivery/earnings ──────────────────────────────────────────────
router.get('/earnings', ...requireDelivery, async (req, res) => {
    try {
        const partner = await DeliveryPartner.findById(req.user.id).select('earnings sessionEarnings total_deliveries');
        if (!partner) return res.status(404).json({ success: false, message: 'Partner not found' });
        
        res.json({ success: true, earnings: partner });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error fetching earnings' });
    }
});

// ── POST /api/delivery/logout ───────────────────────────────────────────────
router.post('/logout', ...requireDelivery, async (req, res) => {
    try {
        await DeliveryPartner.findByIdAndUpdate(req.user.id, { is_online: false, sessionEarnings: 0 });
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
});

module.exports = router;
