const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    food_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodItem',
    },
    food_name: { type: String, required: true },
    price:     { type: Number, required: true },
    quantity:  { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Restaurant',
        required: [true, 'Restaurant ID is required'],
    },
    items: [orderItemSchema],
    totalPrice: { type: Number, required: true },
    delivery_name:    { type: String, required: true },
    delivery_phone:   { type: String, required: true },
    delivery_address: { type: String, required: true },
    payment_method:   { type: String, default: 'Cash on Delivery' },
    paymentDetails: {
        upiId: { type: String, default: '' },
        cardNumber: { type: String, default: '' }
    },
    orderStatus: {
        type: String,
        enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
        default: 'Placed',
    },
    restaurantStatus: {
        type: String,
        enum: ['Pending', 'Accepted', 'Rejected'],
        default: 'Pending',
    },
    estimatedDeliveryTime: { type: String, default: '30-45 mins' },
    
    // Delivery Tracking Fields
    delivery_partner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryPartner',
        default: null
    },
    delivery_location: {
        lat: { type: Number },
        lng: { type: Number },
        last_updated: { type: Date }
    },
    timeline: {
        assigned_at: { type: Date },
        picked_up_at: { type: Date },
        delivered_at: { type: Date }
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Refunded'],
        default: 'Pending'
    },
    feedbackId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Feedback',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
