# QuickBite Food Delivery App - Backend Documentation

## Overview

A full-stack food delivery web application built with Node.js + Express backend, MongoDB database, and HTML/CSS/JS frontend. The backend provides RESTful APIs with JWT authentication, Socket.io for real-time updates, and integrates with Razorpay for payments.

---

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **Express.js** | Web framework |
| **MongoDB + Mongoose** | Database & ODM |
| **Socket.io** | Real-time communication |
| **JWT** | Authentication |
| **bcryptjs** | Password hashing |
| **Razorpay** | Payment gateway |
| **Multer** | File uploads |
| **express-rate-limit** | Rate limiting |
| **express-session** | Session management |
| **dotenv** | Environment variables |

---

## Project Structure

```
backend/
├── app.js                 # Main Express application entry point
├── .env                   # Environment variables (gitignored)
├── config/
│   └── db.js             # MongoDB connection configuration
├── middleware/
│   └── auth.js           # JWT authentication & authorization middleware
├── models/               # Mongoose database schemas
├── routes/               # Express route handlers
├── seeders/
│   └── foodSeeder.js     # Database seeding script
└── test_*.js            # Test scripts
```

---

## Configuration

### Environment Variables (.env)

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGO_URI=mongodb://localhost:27017/food_delivery
SESSION_SECRET=your_secret_key_here
JWT_SECRET=your_jwt_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Database Connection (config/db.js)

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/food_delivery');
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    }
};

module.exports = connectDB;
```

---

## Models

### 1. User Model (`models/User.js`)

User accounts for customers and admins.

```javascript
{
    name: String,           // required
    email: String,         // required, unique, lowercase
    phone: String,
    password: String,      // required, minlength 6
    role: Enum['user', 'admin'],  // default: 'user'
    createdAt: Date,
    updatedAt: Date
}
```

### 2. FoodItem Model (`models/FoodItem.js`)

Menu items with pricing and availability.

```javascript
{
    food_name: String,           // required
    description: String,
    price: Number,               // required, min 0
    category: String,            // required
    image: String,              // default: 'default.jpg'
    is_featured: Boolean,       // default: false
    restaurantId: ObjectId,      // ref: Restaurant, required
    availability: Boolean,      // default: true
    orderCount: Number,         // default: 0
    createdAt: Date,
    updatedAt: Date
}
```

### 3. Cart Model (`models/Cart.js`)

Shopping cart items per user.

```javascript
{
    user_id: ObjectId,    // ref: User, required
    food_id: ObjectId,    // ref: FoodItem, required
    quantity: Number,      // default: 1, min: 1
    createdAt: Date,
    updatedAt: Date
}

// Unique compound index on (user_id, food_id)
```

### 4. Order Model (`models/Order.js`)

Orders with items, delivery, and payment information.

```javascript
{
    userId: ObjectId,           // ref: User
    restaurantId: ObjectId,     // ref: Restaurant
    items: [{
        food_id: ObjectId,
        food_name: String,
        price: Number,
        quantity: Number
    }],
    totalPrice: Number,
    delivery_name: String,
    delivery_phone: String,
    delivery_address: String,
    payment_method: String,      // 'Cash on Delivery' | 'Online Payment'
    paymentDetails: {
        upiId: String,
        cardNumber: String,
        transactionId: String
    },
    orderStatus: Enum['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    restaurantStatus: Enum['Pending', 'Accepted', 'Rejected'],
    estimatedDeliveryTime: String,
    delivery_partner_id: ObjectId,  // ref: DeliveryPartner
    delivery_location: {
        lat: Number,
        lng: Number,
        last_updated: Date
    },
    timeline: {
        assigned_at: Date,
        picked_up_at: Date,
        delivered_at: Date
    },
    paymentStatus: Enum['Pending', 'Paid', 'Refunded'],
    feedbackId: ObjectId,        // ref: Feedback
    verificationCode: String,    // 4-digit code for delivery verification
    createdAt: Date,
    updatedAt: Date
}
```

### 5. Restaurant Model (`models/Restaurant.js`)

Restaurant partner accounts.

```javascript
{
    restaurantName: String,    // required
    branchName: String,       // required
    email: String,           // required, unique
    password: String,        // required
    isLoggedIn: Boolean,     // default: false
    isActive: Boolean,       // default: false (online/offline status)
    createdAt: Date,
    updatedAt: Date
}
```

### 6. DeliveryPartner Model (`models/DeliveryPartner.js`)

Delivery rider profiles and stats.

```javascript
{
    name: String,
    email: String,           // unique
    phone: String,           // unique
    password: String,
    vehicle_type: Enum['Bike', 'Scooter', 'Bicycle'],  // default: 'Bike'
    is_online: Boolean,      // default: false
    current_location: {
        lat: Number,
        lng: Number,
        last_updated: Date
    },
    earnings: Number,         // total earnings
    sessionEarnings: Number,  // earnings in current session
    total_deliveries: Number,
    ratingCount: Number,
    averageRating: Number,   // calculated average
    createdAt: Date,
    updatedAt: Date
}
```

### 7. Payment Model (`models/Payment.js`)

Payment records for orders.

```javascript
{
    orderId: ObjectId,           // ref: Order
    userId: ObjectId,            // ref: User
    amount: Number,
    method: Enum['COD', 'Online', 'Wallet'],
    status: Enum['Pending', 'Completed', 'Failed', 'Refunded'],
    transactionId: String,
    paymentGateway: Enum['Razorpay', 'Stripe', 'None'],
    createdAt: Date,
    updatedAt: Date
}
```

### 8. Feedback Model (`models/Feedback.js`)

Customer reviews and ratings.

```javascript
{
    orderId: ObjectId,           // ref: Order, required
    userId: ObjectId,            // ref: User, required
    restaurantId: ObjectId,      // ref: Restaurant, required
    deliveryPartnerId: ObjectId,  // ref: DeliveryPartner
    rating: Number,              // required, min: 1, max: 5
    comment: String,
    createdAt: Date,
    updatedAt: Date
}
```

---

## API Routes

### Base URL: `/api`

---

## 1. Authentication Routes (`/api/auth`)

### POST /api/signup
Register a new user.

**Request Body:**
```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "confirm_password": "password123",
    "phone": "9876543210"
}
```

**Response:**
```json
{
    "success": true,
    "token": "jwt_token_here",
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user"
    },
    "redirect": "/menu.html?welcome=1"
}
```

### POST /api/login
Authenticate user.

**Request Body:**
```json
{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "token": "jwt_token_here",
    "redirect": "/menu.html",
    "user": {
        "id": "user_id",
        "name": "John Doe",
        "role": "user"
    }
}
```

### POST /api/logout
Logout user.

**Response:**
```json
{
    "success": true,
    "message": "Logged out successfully",
    "redirect": "/login.html"
}
```

### GET /api/me
Get current user info (requires auth token).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "loggedIn": true,
    "user_id": "user_id",
    "user_name": "John Doe",
    "role": "user"
}
```

---

## 2. Food Routes (`/api/foods`)

### GET /api/foods
Get all available food items.

**Response:**
```json
{
    "success": true,
    "foods": [
        {
            "_id": "food_id",
            "food_name": "Margherita Pizza",
            "description": "Classic pizza...",
            "price": 149.00,
            "category": "Pizza",
            "image": "pizza1.jpg",
            "is_featured": true,
            "availability": true
        }
    ]
}
```

### GET /api/foods/categories
Get distinct categories.

**Response:**
```json
{
    "success": true,
    "categories": ["Pizza", "Burger", "Biryani", "Drinks", "Desserts", "Snacks"]
}
```

### GET /api/foods/featured
Get featured food items (max 6).

**Response:**
```json
{
    "success": true,
    "foods": [...]
}
```

### GET /api/foods/recommended
Get popular items by order count (max 4).

**Response:**
```json
{
    "success": true,
    "foods": [...]
}
```

### GET /api/foods/:id
Get single food item by ID.

**Response:**
```json
{
    "success": true,
    "food": { ... }
}
```

---

## 3. Cart Routes (`/api/cart`)

All cart routes require authentication.

### GET /api/cart
Get user's cart items.

**Response:**
```json
{
    "success": true,
    "items": [
        {
            "cart_id": "cart_item_id",
            "quantity": 2,
            "food_id": "food_id",
            "food_name": "Margherita Pizza",
            "price": 149.00,
            "image": "pizza1.jpg"
        }
    ],
    "count": 2,
    "total": 298.00
}
```

### POST /api/cart/add
Add item to cart.

**Request Body:**
```json
{
    "food_id": "food_id"
}
```

**Response:**
```json
{
    "success": true,
    "message": "Added to cart!",
    "cart_count": 3,
    "cart_total": 447.00
}
```

### PUT /api/cart/update
Update item quantity.

**Request Body:**
```json
{
    "cart_id": "cart_item_id",
    "change": 1
}
```

**Response:**
```json
{
    "success": true,
    "cart_id": "cart_item_id",
    "item_qty": 3,
    "item_subtotal": 447.00,
    "cart_count": 3,
    "cart_total": 447.00
}
```

### DELETE /api/cart/remove
Remove item from cart.

**Request Body:**
```json
{
    "cart_id": "cart_item_id"
}
```

**Response:**
```json
{
    "success": true,
    "cart_count": 2,
    "cart_total": 298.00
}
```

---

## 4. Order Routes (`/api/orders`)

### POST /api/orders/place
Place a new order.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
    "delivery_name": "John Doe",
    "delivery_phone": "9876543210",
    "delivery_address": "123 Main St, City",
    "payment_method": "upi",
    "upiId": "john@ybl"
}
```

**Response:**
```json
{
    "success": true,
    "order_id": "order_id",
    "redirect": "/order_success.html?order_id=order_id"
}
```

### GET /api/orders/history
Get user's order history.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "success": true,
    "orders": [...]
}
```

### GET /api/orders/:id
Get single order details.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "success": true,
    "order": { ... },
    "verificationCode": "1234"
}
```

### POST /api/orders/:id/rate-delivery
Rate delivery partner.

**Request Body:**
```json
{
    "rating": 5
}
```

**Response:**
```json
{
    "success": true,
    "message": "Rating submitted successfully!",
    "averageRating": 4.8
}
```

---

## 5. Admin Routes (`/api/admin`)

All admin routes require admin role.

### GET /api/admin/stats
Get dashboard statistics.

**Response:**
```json
{
    "success": true,
    "stats": {
        "foods": 15,
        "users": 100,
        "orders": 50,
        "revenue": 12500.00
    },
    "recentOrders": [...]
}
```

### GET /api/admin/foods
Get all food items.

### POST /api/admin/foods
Add new food item (multipart/form-data with image upload).

**Form Fields:**
- `food_name`, `description`, `price`, `category`
- `is_featured` (optional)
- `restaurantId`
- `image` (file upload)

### PUT /api/admin/foods/:id
Update food item.

### DELETE /api/admin/foods/:id
Delete food item.

### GET /api/admin/orders
Get all orders.

### PUT /api/admin/orders/:id/status
Update order status.

**Request Body:**
```json
{
    "status": "Preparing"
}
```

### GET /api/admin/users
Get all users (excluding admins).

### GET /api/admin/delivery-partners
Get online delivery partners.

### POST /api/admin/orders/:id/assign
Assign delivery partner to order.

**Request Body:**
```json
{
    "partnerId": "delivery_partner_id"
}
```

---

## 6. Restaurant Routes (`/api/restaurant`)

### POST /api/restaurant/signup
Register new restaurant.

**Request Body:**
```json
{
    "restaurantName": "Pizza Palace",
    "branchName": "Downtown",
    "email": "pizza@palace.com",
    "password": "password123"
}
```

### POST /api/restaurant/login
Login restaurant.

**Request Body:**
```json
{
    "email": "pizza@palace.com",
    "password": "password123"
}
```

### GET /api/restaurant/check-auth
Check restaurant authentication status.

### POST /api/restaurant/status
Toggle online/offline status.

**Request Body:**
```json
{
    "isActive": true
}
```

### GET /api/restaurant/orders
Get restaurant's orders.

### POST /api/restaurant/orders/:id/accept
Accept an order.

### POST /api/restaurant/orders/:id/reject
Reject an order.

### POST /api/restaurant/orders/:id/status
Update order status.

**Request Body:**
```json
{
    "status": "Preparing"
}
```

### GET /api/restaurant/stream
SSE endpoint for real-time new order notifications.

---

## 7. Dishes Routes (`/api/dishes`)

Restaurant-specific dish management.

### GET /api/dishes/restaurant/:restaurantId
Get dishes for a restaurant.

### POST /api/dishes
Add new dish (multipart/form-data).

**Form Fields:**
- `food_name`, `description`, `price`, `category`
- `is_featured` (optional)
- `image` (file upload)

### PUT /api/dishes/:id
Update dish.

### DELETE /api/dishes/:id
Delete dish.

### PATCH /api/dishes/:id/availability
Toggle dish availability.

**Request Body:**
```json
{
    "availability": false
}
```

---

## 8. Delivery Routes (`/api/delivery`)

### POST /api/delivery/signup
Register as delivery partner.

**Request Body:**
```json
{
    "name": "Rider John",
    "email": "rider@email.com",
    "phone": "9876543210",
    "password": "password123",
    "vehicle_type": "Bike"
}
```

### POST /api/delivery/login
Login as delivery partner.

### GET /api/delivery/me
Get partner profile.

### POST /api/delivery/toggle-status
Toggle online/offline.

**Request Body:**
```json
{
    "is_online": true
}
```

### GET /api/delivery/orders
Get assigned orders.

### POST /api/delivery/orders/:id/status
Update delivery status.

**Request Body:**
```json
{
    "status": "Delivered",
    "verificationCode": "1234"
}
```

**Valid statuses:** `Picked Up`, `Out for Delivery`, `Delivered`

### GET /api/delivery/earnings
Get earnings information.

### POST /api/delivery/logout
Logout delivery partner.

---

## 9. Payment Routes (`/api/payments`)

### POST /api/payments/process
Process payment for an order.

**Request Body:**
```json
{
    "orderId": "order_id",
    "method": "COD",
    "paymentGateway": "Razorpay",
    "transactionId": "txn_123"
}
```

### GET /api/payments/order/:orderId
Get payment details for an order.

### POST /api/payments/create-order
Create Razorpay order for online payment.

**Request Body:**
```json
{
    "amount": 299.00
}
```

### POST /api/payments/verify-payment
Verify payment signature.

**Request Body:**
```json
{
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "payment_xxx",
    "razorpay_signature": "signature_here",
    "isDummy": false
}
```

---

## 10. Feedback Routes (`/api/feedback`)

### POST /api/feedback/submit
Submit feedback for delivered order.

**Request Body:**
```json
{
    "orderId": "order_id",
    "rating": 5,
    "comment": "Great food and fast delivery!"
}
```

### GET /api/feedback/rider/:riderId
Get reviews for a delivery partner.

---

## Authentication Middleware

### verifyToken (middleware/auth.js)

```javascript
const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1] || req.session?.token;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};
```

### authorize (middleware/auth.js)

Role-based access control.

```javascript
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return res.status(403).json({ success: false, message: 'Forbidden.' });
        }
        next();
    };
};
```

---

## Real-time Features (Socket.io)

### Socket Events

#### Client → Server

| Event | Description |
|-------|-------------|
| `join_order_room` | Join room for order tracking |
| `join_restaurant_room` | Join restaurant's order notifications |
| `delivery_location_update` | Send delivery partner location |

#### Server → Client

| Event | Description |
|-------|-------------|
| `location_update` | Delivery location update |
| `status_update` | Order status change |
| `new_order` | New order notification (restaurant) |

### SSE Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/restaurant/stream` | Real-time order notifications for restaurants |

---

## Rate Limiting

Global rate limit: **100 requests per 10 seconds** per IP

```javascript
const globalLimiter = rateLimit({
    windowMs: 10 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again after 10 sec'
});
```

---

## Order Status Flow

```
User Places Order
       ↓
    [Placed] ──── Restaurant Rejects ──── [Cancelled]
       ↓
Restaurant Accepts
       ↓
   [Preparing]
       ↓
Delivery Partner Assigned
       ↓
Delivery Partner Picks Up ──── [Out for Delivery]
       ↓
Customer Provides Verification Code
       ↓
   [Delivered]
```

---

## Verification Code System

- 4-digit random code generated on order placement
- Delivery partner must enter code to mark order as "Delivered"
- Code displayed to customer on order success page

---

## Payment Methods

| Method | Processing |
|--------|------------|
| COD | Payment collected on delivery |
| Online (Razorpay) | UPI/Card/Net Banking |
| Wallet | Integrated wallet support |

---

## Error Responses

All error responses follow this format:

```json
{
    "success": false,
    "message": "Error description here"
}
```

Or for validation errors:

```json
{
    "success": false,
    "errors": {
        "email": "Invalid email address",
        "password": "Password must be at least 6 characters"
    }
}
```

---

## Running the Server

```bash
# Start in development mode (with auto-reload)
npm run dev

# Start in production mode
npm start

# Run seeder
node backend/seeders/foodSeeder.js
```

Server runs at: `http://localhost:8000`

---

## Database Seeding

Run the seeder to populate initial data:

```bash
node backend/seeders/foodSeeder.js
```

---

## Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Tokens**: 1-day expiry for users, 7-day for delivery partners
3. **Rate Limiting**: Protection against brute force attacks
4. **Input Validation**: Server-side validation on all endpoints
5. **CORS**: Configured for cross-origin requests
6. **HTTP Only Cookies**: Session cookies are HTTP only

---

## API Summary

| Route Prefix | Description |
|--------------|-------------|
| `/api/auth` | User authentication |
| `/api/foods` | Public food browsing |
| `/api/cart` | Shopping cart |
| `/api/orders` | Order management |
| `/api/admin` | Admin dashboard |
| `/api/restaurant` | Restaurant portal |
| `/api/dishes` | Restaurant menu |
| `/api/delivery` | Delivery partner app |
| `/api/payments` | Payment processing |
| `/api/feedback` | Reviews & ratings |

---

## License

This project is part of a mini project for educational purposes.
