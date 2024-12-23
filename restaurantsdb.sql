-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 23, 2024 at 06:47 PM
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `restaurant_id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 11, 'grilled', '2024-12-18 19:58:28', 1, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories_image_map`
--

INSERT INTO `categories_image_map` (`id`, `image_id`, `category_id`, `is_primary`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `created_at`) VALUES
(1, 21, 1, 1, 1, NULL, NULL, NULL, NULL, '2024-12-18 19:58:28');

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
) ENGINE=InnoDB AUTO_INCREMENT=29 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `images`
--

INSERT INTO `images` (`id`, `url`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(17, 'http://localhost:8000/uploads/restaurarnts/restaurant_11_1734395759959.jpg', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(18, 'http://localhost:8000/uploads/restaurarnts/restaurant_11_1734395759963.webp', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(19, 'http://localhost:8000/uploads/restaurarnts/restaurant_11_1734395759967.exe', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(20, 'http://localhost:8000/uploads/restaurarnts/restaurant_11_1734395759970.avif', '2024-12-17 00:35:59', 1, NULL, NULL, NULL, NULL),
(21, 'http://localhost:8000/uploads/restaurarnts/restaurant_1_1734551908709.jpg', '2024-12-18 19:58:28', 1, NULL, NULL, NULL, NULL),
(26, 'http://localhost:8000/uploads/sub_categories/sub_categories_1_1734556023098.jpg', '2024-12-18 21:07:03', 1, NULL, NULL, NULL, NULL),
(27, 'http://localhost:8000/uploads/sub_categories/sub_categories_2_1734556104628.jpg', '2024-12-18 21:08:24', 1, NULL, NULL, NULL, NULL),
(28, 'http://localhost:8000/uploads/sub_categories/sub_categories_3_1734975736690.avif', '2024-12-23 17:42:16', 1, NULL, NULL, NULL, NULL);

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
  `ingredient_name` varchar(255) DEFAULT NULL,
  `quantity` float DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `threshold` int DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `is_propirty` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `qr_codes`
--

INSERT INTO `qr_codes` (`id`, `table_id`, `qr_code`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 1, 'data:image/png;base64,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', '2024-12-18 18:39:22', 1, NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
  `category_id` int NOT NULL,
  `image_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `updated_by` int DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL,
  `deleted_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `image_id` (`image_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `sub_categories`
--

INSERT INTO `sub_categories` (`id`, `category_id`, `image_id`, `name`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(2, 1, NULL, 'tekka', '2024-12-18 21:08:24', 1, NULL, NULL, NULL, NULL),
(3, 1, NULL, 'tekkaa', '2024-12-23 17:42:16', 1, NULL, NULL, NULL, NULL);

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
(2, 28, 3, 1, 1, '2024-12-23 17:42:16', NULL, NULL, NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `tables`
--

INSERT INTO `tables` (`id`, `restaurant_id`, `number`, `status`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`) VALUES
(1, 11, 1, NULL, '2024-12-18 18:39:22', 1, NULL, NULL, NULL, NULL);

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
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`);

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
  ADD CONSTRAINT `sub_categories_ibfk_2` FOREIGN KEY (`image_id`) REFERENCES `images` (`id`);

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
