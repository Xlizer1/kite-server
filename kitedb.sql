-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Mar 09, 2025 at 11:08 AM
-- Server version: 9.1.0
-- PHP Version: 8.3.14

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kitedb`
--

-- --------------------------------------------------------

--
-- Table structure for table `attributes`
--

DROP TABLE IF EXISTS `attributes`;
CREATE TABLE IF NOT EXISTS `attributes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `captain_calls`
--

DROP TABLE IF EXISTS `captain_calls`;
CREATE TABLE IF NOT EXISTS `captain_calls` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  `completed_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `completed_by` (`completed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

DROP TABLE IF EXISTS `carts`;
CREATE TABLE IF NOT EXISTS `carts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `session_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `session_id` (`session_id`),
  KEY `table_id` (`table_id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `cart_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `special_instructions` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cart_id` (`cart_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `restaurant_id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 'Appetizers', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(2, 1, 'Main Course', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(3, 1, 'Desserts', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(4, 1, 'Beverages', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(5, 2, 'Hot Drinks', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(6, 2, 'Cold Drinks', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(7, 2, 'Pastries', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(8, 3, 'Curries', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(9, 3, 'Tandoor', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(10, 3, 'Rice Dishes', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories_image_map`
--

DROP TABLE IF EXISTS `categories_image_map`;
CREATE TABLE IF NOT EXISTS `categories_image_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `category_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `image_id` (`image_id`),
  KEY `category_id` (`category_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
CREATE TABLE IF NOT EXISTS `currencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(25) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `name`, `code`) VALUES
(1, 'United States Dollar', 'USD'),
(2, 'Iraqi Dinar', 'IQD'),
(3, 'Euro', 'EUR');

-- --------------------------------------------------------

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
CREATE TABLE IF NOT EXISTS `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`) VALUES
(1, 'Admin'),
(2, 'Restaurant admin'),
(3, 'Branch admin'),
(4, 'Inventory admin'),
(5, 'Captain'),
(6, 'Kitchen'),
(7, 'Hookah'),
(8, 'Finance');

-- --------------------------------------------------------

--
-- Table structure for table `images`
--

DROP TABLE IF EXISTS `images`;
CREATE TABLE IF NOT EXISTS `images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `url` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE IF NOT EXISTS `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `menu_item_id` int NOT NULL,
  `inv_item_id` int NOT NULL,
  `unit_id` int NOT NULL,
  `quantity` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_item_id` (`menu_item_id`),
  KEY `inv_item_id` (`inv_item_id`),
  KEY `unit_id` (`unit_id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `ingredients`
--

INSERT INTO `ingredients` (`id`, `restaurant_id`, `menu_item_id`, `inv_item_id`, `unit_id`, `quantity`) VALUES
(1, 1, 1, 2, 1, 0.5),
(2, 1, 1, 4, 1, 0.05),
(3, 1, 1, 5, 1, 0.2),
(4, 1, 1, 3, 1, 0.1);

-- --------------------------------------------------------

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `quantity` float DEFAULT NULL,
  `unit_id` int DEFAULT NULL,
  `threshold` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `currency_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `currency_id` (`currency_id`),
  KEY `unit_id` (`unit_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventory`
--

INSERT INTO `inventory` (`id`, `restaurant_id`, `name`, `quantity`, `unit_id`, `threshold`, `price`, `currency_id`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(2, 1, 'Romaine lettuce', 50, 1, 10, 15.00, 2, '2025-01-14 17:11:57', 1, NULL, NULL, NULL, NULL),
(3, 1, 'Croutons', 50, 1, 10, 15.00, 2, '2025-01-14 17:13:34', 1, NULL, NULL, NULL, NULL),
(4, 1, 'Parmesan cheese', 50, 1, 10, 15.00, 2, '2025-01-14 17:13:53', 1, NULL, NULL, NULL, NULL),
(5, 1, 'Caesar dressing', 200, 2, 50, 10.00, 2, '2025-01-14 17:14:29', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_items`
--

DROP TABLE IF EXISTS `inventory_items`;
CREATE TABLE IF NOT EXISTS `inventory_items` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `item_name` varchar(100) NOT NULL,
  `preferred_unit_id` int DEFAULT NULL,
  PRIMARY KEY (`item_id`),
  KEY `preferred_unit_id` (`preferred_unit_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `inventory_items`
--

INSERT INTO `inventory_items` (`item_id`, `item_name`, `preferred_unit_id`) VALUES
(1, 'Rice', 1),
(2, 'Cooking Oil', 2),
(3, 'Chicken', 1),
(4, 'Tomatoes', 1),
(5, 'Coffee Beans', 1),
(6, 'Milk', 2),
(7, 'Sugar', 1),
(8, 'Salt', 1);

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

DROP TABLE IF EXISTS `invoices`;
CREATE TABLE IF NOT EXISTS `invoices` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `total_amount` decimal(10,2) DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoice_items`
--

DROP TABLE IF EXISTS `invoice_items`;
CREATE TABLE IF NOT EXISTS `invoice_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `item_id` int NOT NULL,
  `quantity` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

DROP TABLE IF EXISTS `items`;
CREATE TABLE IF NOT EXISTS `items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_category_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `eng_name` varchar(255) DEFAULT NULL,
  `description` text,
  `eng_description` text,
  `price` decimal(10,2) DEFAULT NULL,
  `currency_id` int NOT NULL,
  `is_shisha` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sub_category_id` (`sub_category_id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `sub_category_id`, `restaurant_id`, `name`, `eng_name`, `description`, `eng_description`, `price`, `currency_id`, `is_shisha`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 1, 'Caesar Salad', 'Caesar Salad', 'Fresh romaine lettuce with classic caesar dressing', 'Fresh romaine lettuce with classic caesar dressing', 12.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(2, 1, 1, 'Greek Salad', 'Greek Salad', 'Mixed greens with feta and olives', 'Mixed greens with feta and olives', 11.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(3, 3, 1, 'Filet Mignon', 'Filet Mignon', 'Premium cut beef tenderloin', 'Premium cut beef tenderloin', 45.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(4, 3, 1, 'Ribeye Steak', 'Ribeye Steak', 'Marbled ribeye with herb butter', 'Marbled ribeye with herb butter', 39.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(5, 7, 2, 'Espresso', 'Espresso', 'Single shot of premium espresso', 'Single shot of premium espresso', 3.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(6, 7, 2, 'Cappuccino', 'Cappuccino', 'Espresso with steamed milk and foam', 'Espresso with steamed milk and foam', 4.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(7, 11, 3, 'Butter Chicken', 'Butter Chicken', 'Creamy tomato based curry with tender chicken', 'Creamy tomato based curry with tender chicken', 16.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL),
(8, 11, 3, 'Paneer Tikka Masala', 'Paneer Tikka Masala', 'Cottage cheese in spiced tomato gravy', 'Cottage cheese in spiced tomato gravy', 14.99, 1, 0, '2025-01-12 17:19:31', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `items_image_map`
--

DROP TABLE IF EXISTS `items_image_map`;
CREATE TABLE IF NOT EXISTS `items_image_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `item_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `image_id` (`image_id`),
  KEY `item_id` (`item_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
CREATE TABLE IF NOT EXISTS `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `action_type` varchar(255) DEFAULT NULL,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `table_name` varchar(255) DEFAULT NULL,
  `record_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `movement_types`
--

DROP TABLE IF EXISTS `movement_types`;
CREATE TABLE IF NOT EXISTS `movement_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `movement_types`
--

INSERT INTO `movement_types` (`id`, `name`) VALUES
(1, 'Purchase'),
(2, 'Usage'),
(3, 'Waste'),
(4, 'Return');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `content` text,
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `status_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`),
  KEY `branch_id` (`restaurant_id`),
  KEY `status_id` (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `order_id` int NOT NULL,
  `item_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `order_id` (`order_id`),
  KEY `item_id` (`item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoice_id` int NOT NULL,
  `payment_status_id` int NOT NULL,
  `payment_method` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `invoice_id` (`invoice_id`),
  KEY `payment_status_id` (`payment_status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`) VALUES
(1, 'Cash'),
(2, 'Credit Card'),
(3, 'Digital Wallet'),
(4, 'Bank Transfer');

-- --------------------------------------------------------

--
-- Table structure for table `payment_statuses`
--

DROP TABLE IF EXISTS `payment_statuses`;
CREATE TABLE IF NOT EXISTS `payment_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_statuses`
--

INSERT INTO `payment_statuses` (`id`, `name`) VALUES
(1, 'Pending'),
(2, 'Paid'),
(3, 'Failed'),
(4, 'Refunded');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`role_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `role_id`, `user_id`) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 2, 1),
(4, 3, 1),
(5, 4, 1),
(6, 5, 1),
(7, 6, 1),
(8, 7, 1),
(9, 8, 1),
(10, 9, 1),
(11, 10, 1),
(12, 11, 1),
(13, 12, 1),
(14, 13, 1);

-- --------------------------------------------------------

--
-- Table structure for table `qr_codes`
--

DROP TABLE IF EXISTS `qr_codes`;
CREATE TABLE IF NOT EXISTS `qr_codes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `table_id` int DEFAULT NULL,
  `qr_code` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `table_id` (`table_id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `qr_codes`
--

INSERT INTO `qr_codes` (`id`, `table_id`, `qr_code`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(5, 3, 'data:image/png;base64,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', '2025-03-06 09:22:33', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
CREATE TABLE IF NOT EXISTS `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `parent_rest_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `description` text,
  `lat` double DEFAULT NULL,
  `long` double DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_rest_id` (`parent_rest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `parent_rest_id`, `name`, `tagline`, `description`, `lat`, `long`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, NULL, 'The Gourmet Kitchen', 'Fine Dining Redefined', 'Experience luxury dining with our chef-crafted menu', 33.24561853950891, 44.367592403160955, '2025-01-12 17:18:09', 1, NULL, NULL, NULL, NULL),
(2, NULL, 'Café Delight', 'Your Daily Coffee Haven', 'Specialty coffee and fresh pastries', 33.24561853950891, 44.367592403160955, '2025-01-12 17:18:09', 1, NULL, NULL, NULL, NULL),
(3, NULL, 'Spice Paradise', 'Authentic Indian Cuisine', 'Traditional flavors with modern presentation', 33.24561853950891, 44.367592403160955, '2025-01-12 17:18:09', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `restaurants_image_map`
--

DROP TABLE IF EXISTS `restaurants_image_map`;
CREATE TABLE IF NOT EXISTS `restaurants_image_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `image_id` (`image_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_settings`
--

DROP TABLE IF EXISTS `restaurant_settings`;
CREATE TABLE IF NOT EXISTS `restaurant_settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `primary_color` varchar(255) DEFAULT NULL,
  `secondary_color` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurant_settings`
--

INSERT INTO `restaurant_settings` (`id`, `restaurant_id`, `primary_color`, `secondary_color`) VALUES
(1, 1, '#213555', '#3E5879'),
(2, 2, '#4A90E2', '#2C3E50'),
(3, 3, '#E67E22', '#D35400');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'View Restaurants'),
(2, 'Create Restaurant'),
(3, 'Update Restaurant'),
(4, 'Delete Restaurant'),
(5, 'View Users'),
(6, 'Create User'),
(7, 'Update User'),
(8, 'Delete User'),
(9, 'View Roles'),
(10, 'Create Roles'),
(11, 'Update Roles'),
(12, 'Delete Roles'),
(13, 'Update User Permissions');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
CREATE TABLE IF NOT EXISTS `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` int DEFAULT NULL,
  `data` JSON DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `last_activity` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `expires_at` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `item_id` int NOT NULL,
  `movement_type_id` int NOT NULL,
  `reference_id` int DEFAULT NULL,
  `quantity` float DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `ingredient_id` (`item_id`),
  KEY `movement_type_id` (`movement_type_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories`
--

DROP TABLE IF EXISTS `sub_categories`;
CREATE TABLE IF NOT EXISTS `sub_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int DEFAULT NULL,
  `category_id` int NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `restaurant_id`, `category_id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 1, 'Salads', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(2, 1, 1, 'Soups', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(3, 1, 2, 'Steaks', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(4, 1, 2, 'Seafood', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(5, 1, 3, 'Cakes', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(6, 1, 4, 'Wines', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(7, 2, 5, 'Coffee', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(8, 2, 5, 'Tea', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(9, 2, 6, 'Smoothies', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(10, 2, 7, 'Croissants', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(11, 3, 8, 'Vegetarian Curries', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(12, 3, 8, 'Non-Veg Curries', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(13, 3, 9, 'Kebabs', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL),
(14, 3, 10, 'Biryani', '2025-01-12 17:19:06', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `sub_categories_image_map`
--

DROP TABLE IF EXISTS `sub_categories_image_map`;
CREATE TABLE IF NOT EXISTS `sub_categories_image_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `sub_category_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `image_id` (`image_id`),
  KEY `sub_category_id` (`sub_category_id`),
  KEY `created_by` (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tables`
--

DROP TABLE IF EXISTS `tables`;
CREATE TABLE IF NOT EXISTS `tables` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `number` int DEFAULT NULL,
  `status` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `restaurant_id`, `number`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(3, 1, 1, NULL, '2025-03-06 09:22:33', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `table_order_statuses`
--

DROP TABLE IF EXISTS `table_order_statuses`;
CREATE TABLE IF NOT EXISTS `table_order_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `table_order_statuses`
--

INSERT INTO `table_order_statuses` (`id`, `name`) VALUES
(1, 'Pending'),
(2, 'In Progress'),
(3, 'Completed'),
(4, 'Cancelled');

-- --------------------------------------------------------

--
-- Table structure for table `table_statuses`
--

DROP TABLE IF EXISTS `table_statuses`;
CREATE TABLE IF NOT EXISTS `table_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `table_statuses`
--

INSERT INTO `table_statuses` (`id`, `name`) VALUES
(1, 'Available'),
(2, 'Occupied'),
(3, 'Reserved'),
(4, 'Out of Service');

-- --------------------------------------------------------

--
-- Table structure for table `units`
--

DROP TABLE IF EXISTS `units`;
CREATE TABLE IF NOT EXISTS `units` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `unit_symbol` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `units`
--

INSERT INTO `units` (`id`, `name`, `unit_symbol`) VALUES
(1, 'Kilogram', 'kg'),
(2, 'Liter', 'L'),
(3, 'Piece', 'pc');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `department_id` int NOT NULL,
  `restaurant_id` int DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `enabled` tinyint NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `users_ibfk_1` (`department_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `department_id`, `restaurant_id`, `name`, `username`, `email`, `phone`, `password`, `enabled`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 1, NULL, 'admin user', 'admin', 'admin@mail.com', '009647733002275', '$2b$10$eRvI9y3.JIXASkCZU/vqc.GeD4V56EZCAvroQwjms2LlJj2yZ7Ymq', 1, '2025-01-12 17:24:28', 0, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users_image_map`
--

DROP TABLE IF EXISTS `users_image_map`;
CREATE TABLE IF NOT EXISTS `users_image_map` (
  `id` int NOT NULL AUTO_INCREMENT,
  `image_id` int NOT NULL,
  `user_id` int NOT NULL,
  `is_primary` tinyint(1) DEFAULT '0',
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `image_id` (`image_id`),
  KEY `user_id` (`user_id`),
  KEY `created_by` (`created_by`),
  KEY `fk_users_updated_by` (`updated_by`),
  KEY `fk_users_deleted_by` (`deleted_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attributes`
--
ALTER TABLE `attributes`
  ADD CONSTRAINT `attributes_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `captain_calls`
--
ALTER TABLE `captain_calls`
  ADD CONSTRAINT `captain_calls_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`),
  ADD CONSTRAINT `captain_calls_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  ADD CONSTRAINT `captain_calls_ibfk_3` FOREIGN KEY (`completed_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`),
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`),
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `categories_image_map`
--
ALTER TABLE `categories_image_map`
  ADD CONSTRAINT `categories_image_map_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  ADD CONSTRAINT `categories_image_map_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `categories_image_map_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `images_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `ingredients`
--
ALTER TABLE `ingredients`
  ADD CONSTRAINT `ingredients_ibfk_1` FOREIGN KEY (`menu_item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `ingredients_ibfk_2` FOREIGN KEY (`inv_item_id`) REFERENCES `inventory` (`id`),
  ADD CONSTRAINT `ingredients_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `ingredients_ibfk_4` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  ADD CONSTRAINT `inventory_ibfk_2` FOREIGN KEY (`currency_id`) REFERENCES `currencies` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `inventory_ibfk_3` FOREIGN KEY (`unit_id`) REFERENCES `units` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `invoices_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`);

--
-- Constraints for table `invoice_items`
--
ALTER TABLE `invoice_items`
  ADD CONSTRAINT `invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  ADD CONSTRAINT `invoice_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`),
  ADD CONSTRAINT `items_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `items_image_map`
--
ALTER TABLE `items_image_map`
  ADD CONSTRAINT `items_image_map_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  ADD CONSTRAINT `items_image_map_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`),
  ADD CONSTRAINT `items_image_map_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`status_id`) REFERENCES `table_order_statuses` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`);

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`payment_status_id`) REFERENCES `payment_statuses` (`id`);

--
-- Constraints for table `permissions`
--
ALTER TABLE `permissions`
  ADD CONSTRAINT `permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `permissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `qr_codes`
--
ALTER TABLE `qr_codes`
  ADD CONSTRAINT `qr_codes_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`parent_rest_id`) REFERENCES `restaurants` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `restaurants_image_map`
--
ALTER TABLE `restaurants_image_map`
  ADD CONSTRAINT `restaurants_image_map_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  ADD CONSTRAINT `restaurants_image_map_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`),
  ADD CONSTRAINT `restaurants_image_map_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `restaurant_settings`
--
ALTER TABLE `restaurant_settings`
  ADD CONSTRAINT `restaurant_settings_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`item_id`) REFERENCES `inventory` (`id`),
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`movement_type_id`) REFERENCES `movement_types` (`id`);

--
-- Constraints for table `sub_categories`
--
ALTER TABLE `sub_categories`
  ADD CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`),
  ADD CONSTRAINT `sub_categories_ibfk_3` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT;

--
-- Constraints for table `sub_categories_image_map`
--
ALTER TABLE `sub_categories_image_map`
  ADD CONSTRAINT `sub_categories_image_map_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  ADD CONSTRAINT `sub_categories_image_map_ibfk_2` FOREIGN KEY (`sub_category_id`) REFERENCES `sub_categories` (`id`),
  ADD CONSTRAINT `sub_categories_image_map_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);

--
-- Constraints for table `tables`
--
ALTER TABLE `tables`
  ADD CONSTRAINT `tables_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`department_id`) REFERENCES `departments` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  ADD CONSTRAINT `users_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

--
-- Constraints for table `users_image_map`
--
ALTER TABLE `users_image_map`
  ADD CONSTRAINT `fk_users_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_deleted_by` FOREIGN KEY (`deleted_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_users_updated_by` FOREIGN KEY (`updated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_image_map_ibfk_1` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`),
  ADD CONSTRAINT `users_image_map_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `users_image_map_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
