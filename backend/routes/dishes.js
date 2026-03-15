const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const FoodItem = require('../models/FoodItem');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Auth middleware for restaurant
const { verifyToken, authorize } = require('../middleware/auth');
const requireRestaurant = [verifyToken, authorize('restaurant')];

// Multer config for dish images
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dest = path.join(__dirname, '../../public/images');
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `dish_${Date.now()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 3 * 1024 * 1024 },
});

// ── GET /api/dishes/restaurant/:restaurantId ───────────────────────────────
router.get('/restaurant/:restaurantId', async (req, res) => {
    try {
        const { restaurantId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(restaurantId))
            return res.status(400).json({ success: false, message: 'Invalid Restaurant ID.' });

        const dishes = await FoodItem.find({ restaurantId }).sort({ createdAt: -1 });
        res.json({ success: true, dishes });
    } catch (err) {
        console.error('Fetch dishes error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── POST /api/dishes (Add new dish) ──────────────────────────────────────────
router.post('/', ...requireRestaurant, upload.single('image'), async (req, res) => {
    try {
        const { food_name, description, price, category, is_featured } = req.body;
        const restaurantId = req.user.id;

        if (!food_name || !price || !category)
            return res.json({ success: false, message: 'Name, price, and category are required.' });

        const imageFile = req.file ? `/images/${req.file.filename}` : '/images/default.jpg';

        const dish = await FoodItem.create({
            food_name: food_name.trim(),
            description: description ? description.trim() : '',
            price: parseFloat(price),
            category: category.trim(),
            image: imageFile,
            is_featured: !!is_featured,
            restaurantId,
            availability: true
        });

        res.json({ success: true, message: 'Dish added successfully!', dish });
    } catch (err) {
        console.error('Add dish error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── PUT /api/dishes/:id (Update dish) ─────────────────────────────────────────
router.put('/:id', ...requireRestaurant, upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: 'Invalid Dish ID.' });

        const { food_name, description, price, category, is_featured, availability } = req.body;
        
        const updates = {
            food_name: food_name ? food_name.trim() : undefined,
            description: description !== undefined ? description.trim() : undefined,
            price: price ? parseFloat(price) : undefined,
            category: category ? category.trim() : undefined,
            is_featured: is_featured !== undefined ? !!is_featured : undefined,
            availability: availability !== undefined ? (availability === 'true' || availability === true) : undefined
        };

        // Remove undefined fields
        Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

        if (req.file) updates.image = `/images/${req.file.filename}`;

        const dish = await FoodItem.findOneAndUpdate(
            { _id: id, restaurantId: req.user.id },
            updates,
            { new: true }
        );

        if (!dish) return res.status(404).json({ success: false, message: 'Dish not found or unauthorized.' });

        res.json({ success: true, message: 'Dish updated successfully!', dish });
    } catch (err) {
        console.error('Update dish error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── DELETE /api/dishes/:id (Delete dish) ──────────────────────────────────────
router.delete('/:id', ...requireRestaurant, async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: 'Invalid Dish ID.' });
        
        const dish = await FoodItem.findOneAndDelete({ _id: id, restaurantId: req.user.id });

        if (!dish) return res.status(404).json({ success: false, message: 'Dish not found or unauthorized.' });

        res.json({ success: true, message: 'Dish deleted successfully!' });
    } catch (err) {
        console.error('Delete dish error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

// ── PATCH /api/dishes/:id/availability ────────────────────────────────────────
router.patch('/:id/availability', ...requireRestaurant, async (req, res) => {
    try {
        const { id } = req.params;
        const { availability } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id))
            return res.status(400).json({ success: false, message: 'Invalid Dish ID.' });

        const dish = await FoodItem.findOneAndUpdate(
            { _id: id, restaurantId: req.user.id },
            { availability },
            { new: true }
        );

        if (!dish) return res.status(404).json({ success: false, message: 'Dish not found or unauthorized.' });

        res.json({ success: true, message: `Dish availability updated to ${availability ? 'Available' : 'Out of Stock'}`, dish });
    } catch (err) {
        console.error('Toggle availability error:', err);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});

module.exports = router;
