# Restaurant Management System

A comprehensive restaurant management system with QR code-based ordering, kitchen management, inventory tracking, and analytics.

## Features

### For Customers
- **QR Code Table Scanning**: Customers scan a QR code on their table to access the restaurant's menu
- **Digital Menu Browsing**: View categories, subcategories, and menu items with images
- **Ordering System**: Place orders directly from their phone with special instructions
- **Order Status Tracking**: Monitor the status of their order in real-time
- **Call Captain Feature**: Request staff assistance with a single tap

### For Staff

#### Captain Dashboard
- **Table Management**: View all tables and their current status
- **Order Approval**: Review and approve customer orders before sending to kitchen
- **Call Management**: Respond to customer assistance requests
- **Order Status Updates**: Update order status for customers to track

#### Kitchen Dashboard
- **Order Queue**: View pending and in-progress orders
- **Real-time Updates**: Update order status when food is ready
- **Inventory Integration**: Automatic inventory deduction when orders are processed
- **Low Stock Alerts**: Get notified when ingredients fall below threshold

#### Cashier Dashboard
- **Billing Management**: View tables with active bills
- **Invoice Generation**: Create invoices for completed orders
- **Discount Application**: Apply available discounts to orders
- **Payment Processing**: Record payments with different payment methods
- **Receipt Generation**: Create digital receipts for customers

#### Manager Analytics
- **Sales Reports**: View daily, weekly, and monthly sales data
- **Menu Performance**: Analyze top-selling items and categories
- **Inventory Usage**: Track inventory consumption and costs
- **Revenue Comparisons**: Compare current and previous period performance
- **Real-time Dashboard**: Get an overview of current restaurant operations

### For Administrators
- **Multi-restaurant Management**: Manage multiple restaurant locations
- **User Management**: Create and manage staff accounts with role-based permissions
- **Menu Management**: Add, update, and remove menu items, categories, and subcategories
- **Inventory Management**: Manage inventory items, suppliers, and stock levels
- **Settings & Configuration**: Customize system settings for each restaurant

## Technology Stack

- **Backend**: Node.js with Express
- **Database**: MySQL
- **Authentication**: JWT-based authentication
- **API Documentation**: Swagger

## API Endpoints

### Authentication
- POST `/api/user`: Login
- POST `/api/user/register`: Register new user

### Menu Management
- GET `/api/menu/main`: Get restaurant main menu
- GET `/api/categories`: Get all categories
- GET `/api/sub_categories`: Get all subcategories
- GET `/api/items`: Get all menu items
- GET `/api/items/get_by_sub_cat_id`: Get items by subcategory

### Order Management
- GET `/api/captain/orders/pending`: Get pending orders
- GET `/api/captain/orders/active`: Get active orders
- PUT `/api/captain/orders/:order_id/status`: Update order status
- GET `/api/kitchen/orders/pending`: Get pending kitchen orders
- GET `/api/kitchen/orders/in-progress`: Get in-progress kitchen orders
- POST `/api/kitchen/orders/:order_id/start`: Start processing an order
- POST `/api/kitchen/orders/:order_id/complete`: Complete an order

### Billing & Payments
- GET `/api/cashier/tables`: Get tables with active bills
- GET `/api/cashier/table/:table_id/orders`: Get orders for billing
- GET `/api/cashier/discounts`: Get available discounts
- POST `/api/cashier/invoice`: Create invoice
- GET `/api/cashier/invoice/:invoice_id`: Get invoice details
- POST `/api/cashier/invoice/:invoice_id/receipt`: Generate receipt PDF
- GET `/api/cashier/report`: Get cashier sales report

### Analytics
- GET `/api/analytics/dashboard`: Get dashboard summary
- GET `/api/analytics/daily-sales`: Get daily sales data
- GET `/api/analytics/sales-by-category`: Get sales by category
- GET `/api/analytics/top-selling-items`: Get top selling items
- GET `/api/analytics/hourly-sales`: Get hourly sales distribution
- GET `/api/analytics/inventory-usage`: Get inventory usage report
- GET `/api/analytics/revenue-comparison`: Get revenue comparison

## Database Schema

The system uses a comprehensive database schema with the following main tables:

- **Users & Authentication**: `users`, `roles`, `permissions`, `departments`
- **Restaurant Management**: `restaurants`, `restaurant_settings`, `tables`, `qr_codes`
- **Menu Management**: `categories`, `sub_categories`, `items`, `images`
- **Inventory Management**: `inventory`, `inventory_items`, `stock_movements`, `suppliers`, `purchase_orders`
- **Order Processing**: `orders`, `order_items`, `order_statuses`, `order_status_history`, `captain_calls`
- **Payment Processing**: `invoices`, `invoice_items`, `payments`, `discounts`, `receipts`
- **Analytics**: `sales_summaries`, `staff_performance`, `customer_feedback`

## Installation

### Prerequisites
- Node.js 14+
- MySQL 5.7+
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/yourusername/restaurant-management.git
cd restaurant-management
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env file with your database credentials and other settings
```

4. Import database schema
```bash
mysql -u username -p database_name < kitedb.sql
```

5. Start the server
```bash
npm run dev
# or
yarn dev
```

6. Access the API at http://localhost:8000/api and Swagger documentation at http://localhost:8000/swagger

## Deployment

### Production Setup
1. Build the application
```bash
npm run build
# or
yarn build
```

2. Start the production server
```bash
npm start
# or
yarn start
```

### Docker Deployment
```bash
docker build -t restaurant-management .
docker run -p 8000:8000 restaurant-management
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.