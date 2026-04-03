const mongoose = require('mongoose');
const Order = require('./models/Order');

async function testOrderTracking() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/food_delivery', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to DB.');

        // 1. Create a dummy order
        const mockUserId = new mongoose.Types.ObjectId();
        const order = new Order({
            user_id: mockUserId,
            items: [{
                food_id: new mongoose.Types.ObjectId(),
                food_name: 'Test Pizza',
                price: 100,
                quantity: 2
            }],
            total_price: 200,
            delivery_name: 'Test User',
            delivery_phone: '1234567890',
            delivery_address: '123 Test St'
            // status should default to 'Placed'
        });

        const savedOrder = await order.save();
        console.log('Order created with status:', savedOrder.status);

        // 2. Fetch it
        const fetchedOrder = await Order.findById(savedOrder._id);
        console.log('Fetched default status:', fetchedOrder.status);

        // 3. Update status
        fetchedOrder.status = 'Out for Delivery';
        await fetchedOrder.save();
        console.log('Updated status to:', fetchedOrder.status);

        // 4. Verify again
        const finalOrder = await Order.findById(savedOrder._id);
        console.log('Final verified status:', finalOrder.status);

        // Cleanup
        await Order.findByIdAndDelete(savedOrder._id);
        console.log('Cleanup done.');

        process.exit(0);
    } catch (err) {
        console.error('Test failed:', err);
        process.exit(1);
    }
}

testOrderTracking();
