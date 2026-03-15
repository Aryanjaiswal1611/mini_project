const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const { verifyToken } = require('../middleware/auth');

// ── POST /api/orders/place ────────────────────────────────────────────────────
router.post('/place', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { delivery_name, delivery_phone, delivery_address, payment_method, upiId, cardNumber } = req.body;

        if (!delivery_name || !delivery_phone || !delivery_address)
            return res.json({ success: false, message: 'All delivery fields are required.' });

        if (payment_method === 'upi' && !upiId)
            return res.json({ success: false, message: 'UPI ID is required for UPI payment.' });

        if (payment_method === 'card' && !cardNumber)
            return res.json({ success: false, message: 'Card number is required for Card payment.' });

        // Fetch cart with food info and restaurantId
        const cartItems = await Cart.find({ user_id: userId }).populate('food_id');
        if (!cartItems.length)
            return res.json({ success: false, message: 'Your cart is empty.' });

        // Get restaurantId from the first item
        const restaurantId = cartItems[0].food_id.restaurantId;
        
        if (!restaurantId) {
            return res.json({ success: false, message: 'Error: Items in cart are not associated with a restaurant.' });
        }

        // Check restaurant status
        const Restaurant = require('../models/Restaurant');
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant || !restaurant.isLoggedIn || !restaurant.isActive) {
            return res.json({ success: false, message: 'This restaurant is currently unavailable. Please try again later.' });
        }

        // Build order items
        const items = cartItems.map(ci => ({
            food_id:   ci.food_id._id,
            food_name: ci.food_id.food_name,
            price:     ci.food_id.price,
            quantity:  ci.quantity,
        }));

        const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const delivery = 30.00;
        const total_price = parseFloat((subtotal + delivery).toFixed(2));

        // Create order
        const order = await Order.create({
            userId: userId,
            restaurantId: restaurantId,
            items,
            totalPrice: total_price,
            delivery_name,
            delivery_phone,
            delivery_address,
            payment_method: payment_method || 'cod',
            paymentDetails: {
                upiId: upiId || '',
                cardNumber: cardNumber || ''
            },
            orderStatus: 'Placed',
            restaurantStatus: 'Pending',
            estimatedDeliveryTime: '30-45 mins',
        });

        // Emit new order event for SSE
        req.app.emit('new_order', order);

        // Clear cart
        await Cart.deleteMany({ user_id: userId });

        res.json({
            success: true,
            order_id: order._id,
            redirect: `/order_success.html?order_id=${order._id}`,
        });
    } catch (err) {
        console.error('Order place error:', err);
        res.status(500).json({ success: false, message: 'Order placement failed. Please try again.' });
    }
});

// ── GET /api/orders/history ───────────────────────────────────────────────────
router.get('/history', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const orders = await Order.find({ userId: userId }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Order history error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(404).json({ success: false, message: 'Order not found.' });

        const order = await Order.findOne({ _id: id, userId: userId });
        if (!order)
            return res.status(404).json({ success: false, message: 'Order not found.' });

        res.json({ success: true, order });
    } catch (err) {
        console.error('Order by ID error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── GET /api/orders – all orders (admin/dashboard) ───────────────────────────
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find().populate('userId', 'full_name email').sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Fetch all orders error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching orders.' });
    }
});

// ── GET /api/orders/restaurant/:restaurantId ──────────────────────────────────
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
            return res.status(400).json({ success: false, message: 'Invalid Restaurant ID.' });
        }

        const orders = await Order.find({ restaurantId })
                                  .populate('userId', 'name email phone')
                                  .sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        console.error('Fetch restaurant orders error:', err);
        res.status(500).json({ success: false, message: 'Server error fetching orders.' });
    }
});

module.exports = router;
