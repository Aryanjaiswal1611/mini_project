# 🍔 QuickBite – Food Delivery App

A full-stack food delivery web application built with **Node.js + Express** backend and a modern **HTML/CSS/JS** frontend.

> ✅ PHP has been fully removed. The project runs entirely on Node.js.

---

## 🚀 Quick Start

### 1. Import Database
Open **phpMyAdmin** and import:
```
database/food_delivery.sql
```

### 2. Configure Environment
Edit `backend/.env`:
```env
DB_HOST=localhost
DB_USER=root
DB_PASS=           # your MySQL password
DB_NAME=food_delivery
SESSION_SECRET=quickbite_super_secret_key_2024
PORT=3000
```

### 3. Install & Run
```bash
cd backend
npm install
node app.js
```

### 4. Open Browser
```
http://localhost:3000
```

---

## 📁 Project Structure

```
food-delivery-app/
├── backend/                 ← Node.js + Express server
│   ├── app.js               ← Entry point
│   ├── .env                 ← Configuration
│   ├── package.json
│   ├── config/db.js         ← MySQL pool
│   ├── middleware/auth.js   ← Session auth
│   └── routes/
│       ├── auth.js          ← /api/login, /api/signup, /api/logout
│       ├── food.js          ← /api/foods, /api/foods/featured
│       ├── cart.js          ← /api/cart (CRUD)
│       ├── orders.js        ← /api/orders/place, /api/orders/history
│       └── admin.js         ← /api/admin/* (dashboard, foods, orders)
├── public/                  ← Static HTML frontend (auto-served)
│   ├── index.html           ← Homepage
│   ├── menu.html            ← Food menu with search/filter
│   ├── cart.html            ← Shopping cart
│   ├── checkout.html        ← Checkout & order placement
│   ├── login.html           ← User login
│   ├── signup.html          ← User registration
│   ├── order_history.html   ← Order tracking
│   ├── order_success.html   ← Order confirmation
│   ├── css/style.css        ← Global styles
│   ├── js/script.js         ← Frontend JS (API calls, cart, auth)
│   ├── images/              ← Food images
│   └── admin/               ← Admin panel pages
│       ├── admin_login.html
│       ├── dashboard.html
│       ├── food_list.html
│       ├── add_food.html
│       ├── edit_food.html
│       └── manage_orders.html
└── database/
    └── food_delivery.sql    ← MySQL schema + seed data
```

---

## 🔑 Default Login Credentials

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@food.com     | admin123  |
| User  | Sign up to create  | —         |

---

## 🌐 API Reference

| Method | Endpoint                       | Auth     | Description              |
|--------|--------------------------------|----------|--------------------------|
| POST   | `/api/login`                   | —        | User login               |
| POST   | `/api/signup`                  | —        | User registration        |
| POST   | `/api/logout`                  | —        | Logout                   |
| GET    | `/api/me`                      | —        | Session info             |
| GET    | `/api/foods`                   | —        | All food items           |
| GET    | `/api/foods/featured`          | —        | Featured items           |
| GET    | `/api/cart`                    | User     | Get cart                 |
| POST   | `/api/cart/add`                | User     | Add to cart              |
| PUT    | `/api/cart/update`             | User     | Update quantity          |
| DELETE | `/api/cart/remove`             | User     | Remove from cart         |
| POST   | `/api/orders/place`            | User     | Place order              |
| GET    | `/api/orders/history`          | User     | Order history            |
| GET    | `/api/admin/stats`             | Admin    | Dashboard stats          |
| GET    | `/api/admin/foods`             | Admin    | List all food items      |
| POST   | `/api/admin/foods`             | Admin    | Add food item            |
| PUT    | `/api/admin/foods/:id`         | Admin    | Edit food item           |
| DELETE | `/api/admin/foods/:id`         | Admin    | Delete food item         |
| GET    | `/api/admin/orders`            | Admin    | All orders               |
| PUT    | `/api/admin/orders/:id/status` | Admin    | Update order status      |

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, express-session, bcryptjs, multer, mysql2
- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Font Awesome
- **Database**: MySQL (MariaDB compatible)
