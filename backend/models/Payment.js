const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    method: {
        type: String,
        enum: ['COD', 'Online', 'Wallet'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    transactionId: {
        type: String
    },
    paymentGateway: {
        type: String,
        enum: ['Razorpay', 'Stripe', 'None'],
        default: 'None'
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
