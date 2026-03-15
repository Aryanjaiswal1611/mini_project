const express = require('express');
const router = express.Router();
const FoodItem = require('../models/FoodItem');

// ── GET /api/foods – all food items ──────────────────────────────────────────
router.get('/', async (req, res) => {
    try {
        const foods = await FoodItem.find({ availability: true })
                                    .populate('restaurantId', 'isLoggedIn isActive')
                                    .sort({ category: 1, food_name: 1 });
        res.json({ success: true, foods });
    } catch (err) {
        console.error('Food fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── GET /api/foods/categories – distinct categories ───────────────────────────
// NOTE: must be declared BEFORE /api/foods/:id to avoid route conflict
router.get('/categories', async (req, res) => {
    try {
        const categories = await FoodItem.distinct('category', { availability: true });
        res.json({ success: true, categories: categories.sort() });
    } catch (err) {
        console.error('Category fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── GET /api/foods/featured – featured items for homepage ─────────────────────
router.get('/featured', async (req, res) => {
    try {
        const foods = await FoodItem.find({ availability: true, is_featured: true })
                                    .populate('restaurantId', 'isLoggedIn isActive')
                                    .limit(6);
        res.json({ success: true, foods });
    } catch (err) {
        console.error('Featured fetch error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── GET /api/foods/:id – single food item ─────────────────────────────────────
router.get('/:id', async (req, res) => {
    try {
        const food = await FoodItem.findById(req.params.id);
        if (!food) return res.status(404).json({ success: false, message: 'Food item not found.' });
        res.json({ success: true, food });
    } catch (err) {
        console.error('Food by ID error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
