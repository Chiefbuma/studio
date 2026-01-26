# WhiskeDelights: Application Documentation

Welcome to the full technical documentation for the WhiskeDelights web application. This document provides a comprehensive overview of the technologies used, the core design principles applied, and the project's file structure.

## 1. Technology Stack

-   **Next.js**: A React framework that provides a production-ready foundation. We use its App Router for file-based routing and **API Routes** for the backend logic.
-   **React**: The core library for building the user interface.
-   **TypeScript**: Enhances code quality and improves maintainability.
-   **Tailwind CSS**: A utility-first CSS framework for all styling.
-   **ShadCN/UI**: A collection of accessible and reusable UI components.
-   **Paystack**: Integrated for processing M-Pesa payments securely.
-   **Docker**: For creating a consistent and reproducible development environment.
-   **MySQL**: The database for storing all application data.

## 2. Full-Stack Docker Environment

This project is configured to run in a multi-container Docker environment using `docker-compose`. This is the recommended way to run the application for development, as it sets up the Next.js frontend, a MySQL database, and a database management tool (phpMyAdmin) with a single command.

### a. Prerequisites

- **Node.js**: Version 20.x or higher.
- **npm**: A Node.js package manager (v10+).
- **Docker & Docker Compose**: For running the containerized environment.

### b. Environment Variables

Before starting, create a `.env` file in the project root. This file is ignored by Git and holds your secret keys.

1.  Copy the example `.env.example` to a new file named `.env`.
2.  Fill in the values:
    -   `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your public key from the Paystack dashboard.
    -   `NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER`: Your business WhatsApp number.
    -   `NEXT_PUBLIC_API_URL`: The URL for your backend API. For this setup, it should be `http://localhost:3000/api`.
    -   The `DB_*` variables are pre-configured for the Docker environment.

### c. How to Run the Application

1.  **Start the services**:
    Make sure Docker Desktop is running. Then, from the project root, run:
    ```bash
    docker-compose up --build -d
    ```
    This command will build the images and start the Next.js app, MySQL database, and phpMyAdmin in detached mode.

2.  **Access the services**:
    -   **Application**: `http://localhost:3000`
    -   **API Test**: `http://localhost:3000/api/cakes` (You should see JSON data from your database)
    -   **phpMyAdmin**: `http://localhost:8080` (Log in with user `root` and password `secret`)

3.  **Stopping the services**:
    To stop all running containers, run:
    ```bash
    docker-compose down
    ```

## 3. Database Schema & Seeding

The `docker-compose.yml` file automatically creates a MySQL database named `WhiskeDelightsDB`.

### a. Database Credentials

-   **Host**: `mysql` (when running inside Docker) or `127.0.0.1` (if backend is outside Docker)
-   **Port**: `3306`
-   **Database**: `WhiskeDelightsDB`
-   **User**: `whiskedelight_user`
-   **Password**: `secret`

### b. SQL Schema

Use the following SQL scripts to create the necessary tables in your `WhiskeDelightsDB` database via phpMyAdmin.

#### Admins Table
```sql
CREATE TABLE `admins` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Cakes, Customizations, and Orders
```sql
-- Core table for all available cakes
CREATE TABLE `cakes` (
  `id` VARCHAR(255) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `base_price` DECIMAL(10, 2) NOT NULL,
  `image_id` VARCHAR(255) NOT NULL,
  `rating` DECIMAL(3, 2) NOT NULL,
  `category` VARCHAR(255) NOT NULL,
  `orders_count` INT NOT NULL,
  `ready_time` VARCHAR(50) NOT NULL,
  `defaultFlavorId` VARCHAR(255),
  `customizable` BOOLEAN NOT NULL DEFAULT false
);

-- Customization options
CREATE TABLE `flavors` ( `id` VARCHAR(255) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `price` DECIMAL(10, 2) NOT NULL, `description` VARCHAR(255), `color` VARCHAR(50) );
CREATE TABLE `sizes` ( `id` VARCHAR(255) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `serves` VARCHAR(100), `price` DECIMAL(10, 2) NOT NULL );
CREATE TABLE `colors` ( `id` VARCHAR(255) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `hex_value` VARCHAR(7), `price` DECIMAL(10, 2) NOT NULL );
CREATE TABLE `toppings` ( `id` VARCHAR(255) PRIMARY KEY, `name` VARCHAR(255) NOT NULL, `price` DECIMAL(10, 2) NOT NULL );

-- Special offer table (links to one cake)
CREATE TABLE `special_offers` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cake_id` VARCHAR(255) NOT NULL UNIQUE,
  `discount_percentage` INT NOT NULL,
  FOREIGN KEY (`cake_id`) REFERENCES `cakes`(`id`) ON DELETE CASCADE
);

-- Orders and their associated items
CREATE TABLE `orders` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_number` VARCHAR(255) NOT NULL UNIQUE,
  `customer_name` VARCHAR(255) NOT NULL,
  `customer_phone` VARCHAR(50) NOT NULL,
  `delivery_method` ENUM('delivery', 'pickup') NOT NULL,
  `delivery_address` TEXT,
  `latitude` DECIMAL(10, 8),
  `longitude` DECIMAL(11, 8),
  `pickup_location` VARCHAR(255),
  `delivery_date` VARCHAR(255),
  `special_instructions` TEXT,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `deposit_amount` DECIMAL(10, 2) NOT NULL,
  `payment_status` ENUM('pending', 'paid') DEFAULT 'pending',
  `order_status` ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `order_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `order_id` INT NOT NULL,
  `cake_id` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `quantity` INT NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `customizations` JSON,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE
);
```

### c. Database Seed Script (MySQL/MariaDB)

Run these `INSERT` statements in phpMyAdmin to populate your database with the initial data.

```sql
-- Seed Admins
INSERT INTO `admins` (`name`, `email`, `password_hash`) VALUES ('Admin', 'admin@whiskedelights.com', '$2b$10$your_bcrypt_hash_for_password_admin'); -- Replace with a real hash

-- Seed Cakes
INSERT INTO `cakes` (`id`, `name`, `description`, `base_price`, `image_id`, `rating`, `category`, `orders_count`, `ready_time`, `defaultFlavorId`, `customizable`) VALUES
('chocolate-fudge-delight', 'Chocolate Fudge Delight', 'A rich and decadent chocolate fudge cake...', 3200.00, 'special-offer-cake', 4.9, 'Chocolate', 150, '24h', 'f2', true),
('red-velvet-delight', 'Red Velvet Delight', 'The timeless classic...', 2800.00, 'red-velvet-delight', 4.8, 'Classic', 120, '24h', 'f3', true),
('strawberry-dream', 'Strawberry Dream', 'A light and fluffy vanilla sponge cake...', 2500.00, 'strawberry-dream', 4.7, 'Fruit', 95, '24h', NULL, false),
('lemon-zest-creation', 'Lemon Zest Creation', 'A zesty and refreshing lemon cake...', 2600.00, 'lemon-zest-creation', 4.6, 'Fruit', 80, '24h', NULL, false),
('vanilla-bean-classic', 'Vanilla Bean Classic', 'A simple yet elegant cake...', 2400.00, 'vanilla-bean-classic', 4.5, 'Classic', 110, '24h', 'f1', true),
('matcha-elegance', 'Matcha Elegance', 'An earthy and refined cake...', 3000.00, 'matcha-elegance', 4.7, 'Specialty', 60, '48h', 'f1', true),
('custom-cake', 'Custom Creation', 'Design your own cake from scratch...', 1200.00, 'custom-cake-placeholder', 0, 'Custom', 0, '48h+', NULL, true);

-- Seed Flavors
INSERT INTO `flavors` (`id`, `name`, `price`, `description`, `color`) VALUES
('f1', 'Classic Vanilla', 0.00, 'A timeless, aromatic flavor.', '#F3E5AB'),
('f2', 'Rich Chocolate', 200.00, 'Deep, decadent, and dark.', '#5D4037'),
('f3', 'Red Velvet', 250.00, 'A Southern classic with a hint of cocoa.', '#9B2C2C'),
('f4', 'Zesty Lemon', 150.00, 'Bright, citrusy, and refreshing.', '#FBC02D');

-- Seed Sizes
INSERT INTO `sizes` (`id`, `name`, `serves`, `price`) VALUES
('s1', '6" Cake', '6-8 people', 0.00),
('s2', '8" Cake', '10-12 people', 500.00),
('s3', '10" Cake', '15-20 people', 1000.00);

-- Seed Colors
INSERT INTO `colors` (`id`, `name`, `hex_value`, `price`) VALUES
('c1', 'Classic White', '#FFFFFF', 0.00),
('c2', 'Pastel Pink', '#FFD1DC', 100.00),
('c3', 'Sky Blue', '#87CEEB', 100.00),
('c4', 'Vibrant Red', '#FF0000', 150.00);

-- Seed Toppings
INSERT INTO `toppings` (`id`, `name`, `price`) VALUES
('t1', 'Rainbow Sprinkles', 50.00),
('t2', 'Chocolate Drizzle', 100.00),
('t3', 'Fresh Berries', 250.00),
('t4', 'Edible Flowers', 300.00);

-- Seed Special Offer
INSERT INTO `special_offers` (`cake_id`, `discount_percentage`) VALUES ('chocolate-fudge-delight', 20);
```

## 4. API Endpoints and Database Connection

This project uses Next.js API Routes to create a backend directly within the Next.js application. This avoids the need for a separate backend server.

### a. Backend Architecture

1.  **File-based Routing**: Any file named `route.ts` inside the `app/api` directory becomes an API endpoint. For example, `app/api/cakes/route.ts` creates the `/api/cakes` endpoint.

2.  **Database Connection Utility (`src/lib/db.ts`)**: This file manages the connection to your MySQL database. It uses the `mysql2` library and reads the database credentials securely from your `.env` file (`DB_HOST`, `DB_USER`, etc.). It creates a connection pool, which is an efficient way to handle multiple database requests.

3.  **Authentication Utility (`src/lib/auth-utils.ts`)**: This file provides a helper function, `verifyAuth`, which checks for a valid JSON Web Token (JWT) in the `Authorization` header of incoming requests. This is used to protect admin-only endpoints.

4.  **API Route Logic**: Each `route.ts` file contains the server-side logic for its specific resource. It imports the database `pool`, defines `async` functions for HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), executes SQL queries, and returns data using `NextResponse.json(...)`.

### b. API Endpoint Documentation

Here is a complete list of all backend API endpoints implemented in this project. The admin-only endpoints are consumed by the forms and actions within the `/admin` section of the application to perform CRUD (Create, Read, Update, Delete) operations. These operations directly modify the live data in the MySQL database.

-   **`app/api/auth/login/route.ts`**
    -   `POST /api/auth/login`: Authenticates an admin user based on email and password. It checks credentials against the `admins` table and, if successful, returns a secure JWT.

-   **`app/api/cakes/route.ts`**
    -   `GET /api/cakes`: Fetches a list of all cakes from the database.
    -   `POST /api/cakes`: Creates a new cake via the "Create Cake" form in the admin panel. (Admin Only)

-   **`app/api/cakes/[id]/route.ts`**
    -   `GET /api/cakes/:id`: Fetches a single cake by its ID.
    -   `PUT /api/cakes/:id`: Updates an existing cake's details via the "Edit Cake" form. (Admin Only)
    -   `DELETE /api/cakes/:id`: Deletes a cake from the database. (Admin Only)

-   **`app/api/customizations/route.ts`**
    -   `GET /api/customizations`: Fetches all customization options, grouped by category (flavors, sizes, colors, toppings).

-   **`app/api/customizations/[category]/route.ts`**
    -   `POST /api/customizations/:category`: Adds a new customization option (e.g., a new flavor) via the forms in the customization manager. (Admin Only)

-   **`app/api/customizations/[category]/[id]/route.ts`**
    -   `PUT /api/customizations/:category/:id`: Updates a specific customization option via the "Edit" forms. (Admin Only)
    -   `DELETE /api/customizations/:category/:id`: Deletes a specific customization option. (Admin Only)

-   **`app/api/orders/route.ts`**
    -   `GET /api/orders`: Fetches a list of all orders, including their associated items. (Admin Only)
    -   `POST /api/orders`: Places a new order. This is a complex transaction that creates an entry in the `orders` table and multiple entries in the `order_items` table.

-   **`app/api/orders/[id]/status/route.ts`**
    -   `PUT /api/orders/:id/status`: Updates the `order_status` of a specific order (e.g., to 'complete' or 'cancelled') via the actions dropdown in the orders list. (Admin Only)

-   **`app/api/special-offer/route.ts`**
    -   `GET /api/special-offer`: Fetches the current special offer by joining the `special_offers` and `cakes` tables.
    -   `PUT /api/special-offer`: Updates the special offer using the form on the "Offers" page. This action first removes the old offer and then inserts the new one. (Admin Only)
