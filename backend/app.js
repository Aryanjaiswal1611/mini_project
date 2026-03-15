require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const connectDB = require('./config/db');

// ── Import Routes ─────────────────────────────────────────
const authRoutes = require('./routes/auth');
const foodRoutes = require('./routes/food');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const restaurantRoutes = require('./routes/restaurant');
const dishRoutes = require('./routes/dishes');
const deliveryRoutes = require('./routes/delivery');
const paymentRoutes = require('./routes/payment');
const feedbackRoutes = require('./routes/feedback');

// ── App Initialization ─────────────────────────────────────
const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// ── Connect MongoDB ────────────────────────────────────────
connectDB();

// ── Body Parser ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Session Setup ──────────────────────────────────────────
app.use(session({
    secret: process.env.SESSION_SECRET || 'quickbite_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// ── Static Files ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── API Routes ─────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/restaurant', restaurantRoutes);
app.use('/api/dishes', dishRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/feedback', feedbackRoutes);

// ── Socket.io Setup ────────────────────────────────────────
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

// Make socket accessible in routes
app.set('io', io);

// ── Socket Events ──────────────────────────────────────────
io.on('connection', (socket) => {

    console.log('User connected:', socket.id);

    // Join room for order tracking
    socket.on('join_order_room', (orderId) => {
        socket.join(`order_${orderId}`);
        console.log(`Socket joined order_${orderId}`);
    });

    // Join room for restaurant orders
    socket.on('join_restaurant_room', (restaurantId) => {
        socket.join(`restaurant_${restaurantId}`);
        console.log(`Restaurant room joined: ${restaurantId}`);
    });

    // Delivery partner location update
    socket.on('delivery_location_update', (data) => {

        io.to(`order_${data.orderId}`).emit('location_update', {
            lat: data.lat,
            lng: data.lng,
            time: new Date()
        });

    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
    });

});

// ── Broadcast Order Status Updates ─────────────────────────
app.on('order_status_update', (data) => {

    io.to(`order_${data.orderId}`).emit('status_update', data);

});

// ── Broadcast New Orders to Restaurant ─────────────────────
app.on('new_order', (order) => {

    io.to(`restaurant_${order.restaurantId}`).emit('new_order', order);

});

// ── SPA Fallback (Frontend Routing) ────────────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ── Start Server ───────────────────────────────────────────
server.listen(PORT, () => {

    console.log('=================================');
    console.log(`🚀 QuickBite Server Running`);
    console.log(`🌐 http://localhost:${PORT}`);
    console.log('=================================');

});
