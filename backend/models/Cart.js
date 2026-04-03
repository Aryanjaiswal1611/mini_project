const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    food_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
        required: true,
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1,
    },
}, { timestamps: true });

// A user can only have one cart entry per food item
cartSchema.index({ user_id: 1, food_id: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
