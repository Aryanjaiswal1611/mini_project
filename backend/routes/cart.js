const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Cart = require('../models/Cart');
const FoodItem = require('../models/FoodItem');
const { verifyToken, authorize } = require('../middleware/auth');
const requireLogin = [verifyToken, authorize('user')];

// Helper: compute cart totals for a user
async function getCartTotals(userId) {
    const cartItems = await Cart.find({ user_id: userId }).populate('food_id', 'price');
    let count = 0;
    let total = 0;
    for (const item of cartItems) {
        if (item.food_id) {
            count += item.quantity;
            total += item.quantity * item.food_id.price;
        }
    }
    return { count, total: parseFloat(total.toFixed(2)) };
}

// ── GET /api/cart ─────────────────────────────────────────────────────────────
router.get('/', ...requireLogin, async (req, res) => {
    try {
        const userId = req.user.id;
        const items = await Cart.find({ user_id: userId })
            .populate('food_id', 'food_name description price image category')
            .sort({ createdAt: -1 });

        const formatted = items
            .filter(item => item.food_id) // skip orphaned refs
            .map(item => ({
                cart_id: item._id,
                quantity: item.quantity,
                food_id:  item.food_id._id,
                food_name:   item.food_id.food_name,
                description: item.food_id.description,
                price:       item.food_id.price,
                image:       item.food_id.image,
                category:    item.food_id.category,
            }));

        const totals = await getCartTotals(userId);
        res.json({ success: true, items: formatted, ...totals });
    } catch (err) {
        console.error('Cart GET error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── POST /api/cart/add ────────────────────────────────────────────────────────
router.post('/add', ...requireLogin, async (req, res) => {
    try {
        const userId = req.user.id;
        const { food_id } = req.body;

        if (!food_id || !mongoose.Types.ObjectId.isValid(food_id))
            return res.json({ success: false, message: 'Invalid food item.' });

        const food = await FoodItem.findById(food_id);
        if (!food)
            return res.json({ success: false, message: 'Food item not found.' });

        // Upsert: increment quantity if exists, else create
        await Cart.findOneAndUpdate(
            { user_id: userId, food_id },
            { $inc: { quantity: 1 } },
            { upsert: true, new: true }
        );

        const totals = await getCartTotals(userId);
        res.json({ success: true, message: 'Added to cart!', cart_count: totals.count, cart_total: totals.total });
    } catch (err) {
        console.error('Cart ADD error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── PUT /api/cart/update ──────────────────────────────────────────────────────
router.put('/update', ...requireLogin, async (req, res) => {
    try {
        const userId = req.user.id;
        const { cart_id, change } = req.body;
        const delta = parseInt(change, 10);

        if (!cart_id || !mongoose.Types.ObjectId.isValid(cart_id))
            return res.json({ success: false, message: 'Invalid cart item.' });

        const cartItem = await Cart.findOne({ _id: cart_id, user_id: userId }).populate('food_id', 'price');
        if (!cartItem) return res.json({ success: false, message: 'Cart item not found.' });

        const newQty = Math.max(1, cartItem.quantity + delta);
        cartItem.quantity = newQty;
        await cartItem.save();

        const totals = await getCartTotals(userId);
        res.json({
            success: true,
            cart_id,
            item_qty: newQty,
            item_subtotal: parseFloat((newQty * cartItem.food_id.price).toFixed(2)),
            cart_count: totals.count,
            cart_total: totals.total,
        });
    } catch (err) {
        console.error('Cart UPDATE error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── DELETE /api/cart/remove ───────────────────────────────────────────────────
router.delete('/remove', ...requireLogin, async (req, res) => {
    try {
        const userId = req.user.id;
        const { cart_id } = req.body;

        if (!cart_id || !mongoose.Types.ObjectId.isValid(cart_id))
            return res.json({ success: false, message: 'Invalid cart item.' });

        await Cart.findOneAndDelete({ _id: cart_id, user_id: userId });
        const totals = await getCartTotals(userId);
        res.json({ success: true, cart_count: totals.count, cart_total: totals.total });
    } catch (err) {
        console.error('Cart REMOVE error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
