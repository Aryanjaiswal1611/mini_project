const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    restaurantName: {
        type: String,
        required: true,
        trim: true,
    },
    branchName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    isLoggedIn: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);
