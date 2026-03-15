-- ============================================================
-- Food Delivery App - Database Schema & Seed Data
-- Database: food_delivery
-- ============================================================

CREATE DATABASE IF NOT EXISTS `food_delivery` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `food_delivery`;

-- ============================================================
-- Table: users
-- ============================================================
CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT(11) NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `role`       ENUM('user','admin') DEFAULT 'user',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: food_items
-- ============================================================
CREATE TABLE IF NOT EXISTS `food_items` (
  `id`          INT(11) NOT NULL AUTO_INCREMENT,
  `food_name`   VARCHAR(150) NOT NULL,
  `description` TEXT,
  `price`       DECIMAL(10,2) NOT NULL,
  `category`    VARCHAR(80) DEFAULT 'Other',
  `image`       VARCHAR(255) DEFAULT 'default.jpg',
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: cart
-- ============================================================
CREATE TABLE IF NOT EXISTS `cart` (
  `id`       INT(11) NOT NULL AUTO_INCREMENT,
  `user_id`  INT(11) NOT NULL,
  `food_id`  INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`) REFERENCES `food_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: orders
-- ============================================================
CREATE TABLE IF NOT EXISTS `orders` (
  `order_id`       INT(11) NOT NULL AUTO_INCREMENT,
  `user_id`        INT(11) NOT NULL,
  `total_price`    DECIMAL(10,2) NOT NULL,
  `delivery_name`  VARCHAR(100),
  `delivery_phone` VARCHAR(20),
  `delivery_address` TEXT,
  `order_date`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `status`         ENUM('Pending','Preparing','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  PRIMARY KEY (`order_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Table: order_items
-- ============================================================
CREATE TABLE IF NOT EXISTS `order_items` (
  `id`       INT(11) NOT NULL AUTO_INCREMENT,
  `order_id` INT(11) NOT NULL,
  `food_id`  INT(11) NOT NULL,
  `quantity` INT(11) NOT NULL DEFAULT 1,
  `price`    DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`food_id`)  REFERENCES `food_items`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Seed: Admin User (password: admin123)
-- ============================================================
-- Admin password: "password" (hashed with PASSWORD_BCRYPT)
-- Admin password: "admin123"  (bcryptjs-compatible hash – works with Node.js bcryptjs)
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES
('Admin', 'admin@food.com', '$2a$10$f44gi7UKWL.yPsDRQHLDkOQnIww4PX/o540wVBszrQOdySDKcE502', 'admin');

-- ============================================================
-- Seed: Sample Food Items
-- ============================================================
INSERT INTO `food_items` (`food_name`, `description`, `price`, `category`, `image`, `is_featured`) VALUES
('Margherita Pizza',      'Classic pizza with fresh tomato sauce, mozzarella, and basil leaves.',               149.00, 'Pizza',    'pizza1.jpg',   1),
('Pepperoni Feast',       'Loaded with spicy pepperoni slices and extra cheese on a crispy base.',               179.00, 'Pizza',    'pizza2.jpg',   1),
('BBQ Chicken Burger',    'Juicy grilled chicken with BBQ sauce, lettuce, and pickles in a sesame bun.',        119.00, 'Burger',   'burger1.jpg',  1),
('Double Smash Burger',   'Two smashed beef patties with American cheese, onions, and special sauce.',          149.00, 'Burger',   'burger2.jpg',  0),
('Veg Burger',            'Crispy veggie patty with fresh veggies and mayo in a toasted bun.',                   99.00, 'Burger',   'burger3.jpg',  0),
('Chicken Biryani',       'Aromatic basmati rice cooked with tender chicken, saffron, and spices.',             159.00, 'Biryani',  'biryani1.jpg', 1),
('Veg Biryani',           'Fragrant rice with fresh vegetables, mint, and whole spices.',                       129.00, 'Biryani',  'biryani2.jpg', 0),
('Mutton Biryani',        'Slow-cooked mutton with premium basmati rice and dum spices.',                       199.00, 'Biryani',  'biryani3.jpg', 0),
('Cold Coffee',           'Creamy cold coffee blended with ice cream and topped with whipped cream.',            89.00, 'Drinks',   'drink1.jpg',   0),
('Mango Lassi',           'Thick and refreshing mango lassi made with fresh mangoes and yogurt.',                79.00, 'Drinks',   'drink2.jpg',   1),
('Fresh Lime Soda',       'Chilled soda with fresh lime juice, mint, and a hint of salt.',                      59.00, 'Drinks',   'drink3.jpg',   0),
('Chocolate Lava Cake',   'Warm chocolate cake with a gooey molten center served with vanilla ice cream.',      129.00, 'Desserts', 'dessert1.jpg', 1),
('Gulab Jamun (6 pcs)',   'Soft milk-solid balls soaked in rose-flavored sugar syrup.',                          89.00, 'Desserts', 'dessert2.jpg', 0),
('Masala French Fries',   'Crispy golden fries tossed with chaat masala, chili, and lemon.',                    79.00, 'Snacks',   'snack1.jpg',   0),
('Paneer Tikka (6 pcs)',  'Marinated and grilled paneer cubes with capsicum and onion in a spicy masala.',      139.00, 'Snacks',   'snack2.jpg',   0);
