const mongoose = require('mongoose');
require('dotenv').config();
const Order = require('./models/Order');
const connectDB = require('./config/db');

async function testFlow() {
    await connectDB();
    
    // 1. Create a dummy order
    const orderData = {
        userId: new mongoose.Types.ObjectId(),
        restaurantId: new mongoose.Types.ObjectId(),
        items: [{ food_name: 'Test Burger', price: 100, quantity: 1 }],
        totalPrice: 130,
        delivery_name: 'Test User',
        delivery_phone: '1234567890',
        delivery_address: '123 Test St',
        verificationCode: '1234'
    };
    
    const order = await Order.create(orderData);
    console.log('Order created with code:', order.verificationCode);
    
    // 2. Simulate correct code
    if (order.verificationCode === '1234') {
        console.log('SUCCESS: Code matches 1234');
    } else {
        console.log('FAILURE: Code does not match 1234');
    }

    // 3. Clean up
    await Order.findByIdAndDelete(order._id);
    console.log('Test order deleted');
    process.exit(0);
}

testFlow().catch(err => {
    console.error(err);
    process.exit(1);
});
