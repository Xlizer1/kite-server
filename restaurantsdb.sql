-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jan 04, 2025 at 08:00 PM
-- Server version: 8.3.0
-- PHP Version: 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `restaurantsdb`
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `restaurant_id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 11, 'grilled', '2024-12-18 19:58:28', 1, NULL, NULL, NULL, NULL),
(6, 11, 'Juices', '2025-01-03 11:48:32', 1, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories_image_map`
--

INSERT INTO `categories_image_map` (`id`, `image_id`, `category_id`, `is_primary`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `created_at`) VALUES
(1, 21, 1, 1, 1, NULL, NULL, NULL, NULL, '2024-12-18 19:58:28'),
(6, 29, 6, 1, 1, NULL, NULL, NULL, NULL, '2024-12-18 19:58:28');

-- --------------------------------------------------------

--
-- Table structure for table `currencies`
--

DROP TABLE IF EXISTS `currencies`;
CREATE TABLE IF NOT EXISTS `currencies` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `currency_symbol` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `currencies`
--

INSERT INTO `currencies` (`id`, `name`, `currency_symbol`) VALUES
(1, 'United states Dollar', 'USD'),
(2, 'Iraqi Dinar', 'IQD');

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
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `url`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(17, '/uploads/restaurarnts/restaurant_11_1734395759959.jpg', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(18, '/uploads/restaurarnts/restaurant_11_1734395759963.webp', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(19, '/uploads/restaurarnts/restaurant_11_1734395759967.exe', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(20, '/uploads/restaurarnts/restaurant_11_1734395759970.avif', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(21, '/uploads/restaurarnts/restaurant_1_1734551908709.jpg', '2024-12-18 19:58:28', 1, NULL, NULL, NULL, NULL),
(26, '/uploads/sub_categories/sub_categories_1_1734556023098.jpg', '2024-12-18 21:07:03', 1, NULL, NULL, NULL, NULL),
(27, '/uploads/sub_categories/sub_categories_2_1734556104628.jpg', '2024-12-18 21:08:24', 1, NULL, NULL, NULL, NULL),
(28, '/uploads/sub_categories/sub_categories_3_1734975736690.avif', '2024-12-23 17:42:16', 1, NULL, NULL, NULL, NULL),
(29, '/uploads/categories/categories_6_1734975736690.png', '2024-12-23 17:42:16', 1, NULL, NULL, NULL, NULL),
(30, '/uploads/restaurarnts/restaurant_5_1735907277516.jpeg', '2025-01-03 12:27:57', 1, NULL, NULL, NULL, NULL),
(31, '/uploads/restaurarnts/restaurant_6_1735907308130.jpeg', '2025-01-03 12:28:28', 1, NULL, NULL, NULL, NULL),
(32, '/uploads/restaurarnts/restaurant_7_1735907340532.jpeg', '2025-01-03 12:29:00', 1, NULL, NULL, NULL, NULL),
(33, '/uploads/restaurarnts/restaurant_8_1735907350832.jpeg', '2025-01-03 12:29:10', 1, NULL, NULL, NULL, NULL),
(34, '/uploads/restaurarnts/restaurant_9_1735907412910.jpeg', '2025-01-03 12:30:12', 1, NULL, NULL, NULL, NULL),
(35, '/uploads/items/items_10_1735909278302.jpg', '2025-01-03 13:01:18', 1, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `ingredients`
--

DROP TABLE IF EXISTS `ingredients`;
CREATE TABLE IF NOT EXISTS `ingredients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `menu_item_id` int NOT NULL,
  `inv_item_id` int NOT NULL,
  `quantity` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `menu_item_id` (`menu_item_id`),
  KEY `inv_item_id` (`inv_item_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`id`, `sub_category_id`, `restaurant_id`, `name`, `eng_name`, `description`, `eng_description`, `price`, `is_shisha`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(9, 2, 11, 'Tekka', NULL, 'boneless pieces of meat or vegetarian alternatives such as paneer, which are marinated in spices and yogurt and subsequently strung through a skewer to be cooked', NULL, 20000.00, 0, '2025-01-03 12:30:12', 1, NULL, NULL, NULL, NULL),
(10, 4, 11, 'Orange Juice', NULL, 'Natural Orange Juice', NULL, 5000.00, 0, '2025-01-03 13:01:18', 1, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `items_image_map`
--

INSERT INTO `items_image_map` (`id`, `image_id`, `item_id`, `is_primary`, `created_by`, `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 34, 9, 1, 1, '2025-01-03 12:30:12', NULL, NULL, NULL, NULL),
(2, 35, 10, 1, 1, '2025-01-03 13:01:18', NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`) VALUES
(1, 'Cash'),
(2, 'Credit Card'),
(3, 'Digital Wallet');

-- --------------------------------------------------------

--
-- Table structure for table `payment_statuses`
--

DROP TABLE IF EXISTS `payment_statuses`;
CREATE TABLE IF NOT EXISTS `payment_statuses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payment_statuses`
--

INSERT INTO `payment_statuses` (`id`, `name`) VALUES
(1, 'Pending'),
(2, 'Paid'),
(3, 'Failed');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `qr_codes`
--

INSERT INTO `qr_codes` (`id`, `table_id`, `qr_code`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(2, 2, 'data:image/png;base64,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', '2025-01-03 13:20:22', 1, NULL, NULL, NULL, NULL);

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
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `parent_rest_id` (`parent_rest_id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`id`, `parent_rest_id`, `name`, `tagline`, `description`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(11, NULL, 'THE GRINDERS', 'AWAKE EVERY SENSE', 'مختصون في تحضير القهوة', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurants_image_map`
--

INSERT INTO `restaurants_image_map` (`id`, `image_id`, `restaurant_id`, `is_primary`, `created_by`, `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(6, 17, 11, 1, 1, '2024-12-17 00:35:59', NULL, NULL, NULL, NULL),
(7, 18, 11, 0, 1, '2024-12-17 00:35:59', NULL, NULL, NULL, NULL),
(8, 19, 11, 0, 1, '2024-12-17 00:35:59', NULL, NULL, NULL, NULL),
(9, 20, 11, 0, 1, '2024-12-17 00:35:59', NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `restaurant_settings`
--

INSERT INTO `restaurant_settings` (`id`, `restaurant_id`, `primary_color`, `secondary_color`) VALUES
(1, 11, '#213555', '#3E5879');

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
-- Table structure for table `stock_movements`
--

DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ingredient_id` int NOT NULL,
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
  KEY `ingredient_id` (`ingredient_id`),
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
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `restaurant_id`, `category_id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(2, 11, 1, 'Meat', '2024-12-18 21:08:24', 1, NULL, NULL, NULL, NULL),
(4, 11, 6, 'Cold Juices', '2025-01-03 11:49:17', 1, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sub_categories_image_map`
--

INSERT INTO `sub_categories_image_map` (`id`, `image_id`, `sub_category_id`, `is_primary`, `created_by`, `created_at`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 27, 2, 1, 1, '2024-12-18 21:08:24', NULL, NULL, NULL, NULL),
(2, 28, 4, 1, 1, '2024-12-23 17:42:16', NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `restaurant_id`, `number`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(2, 11, 1, NULL, '2025-01-03 13:20:22', 1, NULL, NULL, NULL, NULL);

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
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
(3, 'Piece', 'pc'),
(4, 'Box', 'bx');

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `department_id`, `restaurant_id`, `name`, `username`, `email`, `phone`, `password`, `enabled`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 1, NULL, 'mustafa', 'mustafa', 'mustafa@mail.com', '009647733002075', '$2b$10$BBet3mxW7qFLW6Wqzf9qHuNorbA6bClr7NCIJX3Vc5Q2eRuCfWE6u', 1, '2024-12-16 22:42:35', 0, NULL, NULL, NULL, NULL);

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
  ADD CONSTRAINT `ingredients_ibfk_2` FOREIGN KEY (`inv_item_id`) REFERENCES `inventory` (`id`);

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
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`ingredient_id`) REFERENCES `inventory` (`id`),
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
