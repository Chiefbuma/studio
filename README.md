# WhiskeDelights: Application Documentation

Welcome to the full technical documentation for the WhiskeDelights web application. This document provides a comprehensive overview of the technologies used, the core design principles applied, and the project's file structure.

## 1. Technology Stack

-   **Next.js**: A React framework that provides a production-ready foundation. We use its App Router for file-based routing and Server Components for performance.
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

1.  Copy the example `env.local.example` to a new file named `.env`.
2.  Fill in the values:
    -   `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: Your public key from the Paystack dashboard.
    -   `NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER`: Your business WhatsApp number.
    -   `NEXT_PUBLIC_API_URL`: The URL for your backend API. For this Docker setup, it is pre-configured and should be `http://localhost:3001/api`.

### c. How to Run the Application

1.  **Start the services**:
    Make sure Docker Desktop is running. Then, from the project root, run:
    ```bash
    docker-compose up --build -d
    ```
    This command will build the images and start the Next.js app, MySQL database, and phpMyAdmin in detached mode.

2.  **Access the services**:
    -   **Application**: `http://localhost:3000`
    -   **phpMyAdmin**: `http://localhost:8080` (Log in with user `root` and password `secret`)

3.  **Stopping the services**:
    To stop all running containers, run:
    ```bash
    docker-compose down
    ```

## 3. Database Schema & Seeding

Your backend API will need a database. The `docker-compose.yml` file automatically creates a MySQL database named `WhiskeDelightsDB`.

### a. Database Credentials

Your backend API should use the following credentials to connect to the database.

-   **Host**: `mysql` (when running inside Docker) or `127.0.0.1` (if backend is outside Docker)
-   **Port**: `3306`
-   **Database**: `WhiskeDelightsDB`
-   **User**: `whiskedelight_user`
-   **Password**: `secret`

### b. SQL Schema

Use the following SQL scripts to create the necessary tables in your `WhiskeDelightsDB` database.

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
*Creates the table to store admin user credentials.*

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

## 4. API Endpoints

The frontend is configured to communicate with a backend API available at the URL specified in `NEXT_PUBLIC_API_URL`. Below is a summary of the expected endpoints.

-   `GET /api/cakes`: Get all available cakes.
-   `GET /api/cakes/:id`: Get a single cake by its ID.
-   `POST /api/cakes`: Create a new cake (Admin only).
-   `DELETE /api/cakes/:id`: Delete a cake (Admin only).
-   `GET /api/special-offer`: Get the current special offer.
-   `PUT /api/special-offer`: Update the special offer (Admin only).
-   `GET /api/customizations`: Get all customization options.
-   `POST /api/customizations/:category`: Add a new customization option (Admin only).
-   `DELETE /api/customizations/:category/:id`: Delete a customization option (Admin only).
-   `GET /api/orders`: Get all orders (Admin only).
-   `PUT /api/orders/:id/status`: Update an order's status (Admin only).
-   `POST /api/orders`: Place a new order.
-   `POST /api/auth/login`: Authenticate an admin user.

## 5. Transitioning from Mock Data to a Live API

This application is currently running in a "prototype" mode, using mock data to simulate a full-stack experience. The following guide outlines the files you will need to modify to connect the frontend to a real, live backend API.

### a. `docker-compose.yml` & `.env` (Environment Configuration)

*   **`docker-compose.yml`**: This file already configures and runs your `mysql` database container. Your separate backend API service (not included in this repository) should be configured to connect to this database using the credentials specified here (host: `mysql`, user: `whiskedelight_user`, etc.).
*   **`.env`**: This file contains the `NEXT_PUBLIC_API_URL`. To connect to your real backend, you must ensure this variable points to the correct URL where your API is running (e.g., `http://localhost:3001/api`).

### b. `src/services/cake-service.ts` (Data Fetching Service)

*   **How it Works**: This file acts as the data layer for the frontend. It currently contains functions like `getCakes`, `getSpecialOffer`, and `getOrders`. Each function has two versions:
    1.  A **mock implementation** that returns hardcoded data from `src/lib/data.ts` (currently active).
    2.  A **real implementation** that uses `fetch` to call the backend API (currently commented out).
*   **To Switch to Real Data**: For each function in this file, comment out the mock implementation and uncomment the `fetch`-based implementation. This will switch the application from using local mock data to fetching live data from your API.

### c. `src/lib/actions.ts` (Server Actions for Data Mutation)

*   **How it Works**: This file handles server-side logic initiated from the client, such as placing an order. The `placeOrder` function currently simulates creating an order.
*   **To Switch to Real Data**: You will need to modify the `placeOrder` function to make a `POST` request to your `/api/orders` endpoint, sending the order payload and returning the result from your backend.

### d. Admin Panel Pages (`app/admin/(protected)/**/*.tsx`)

*   **How They Work**: The pages in the admin panel (e.g., `cakes/page.tsx`, `orders/page.tsx`) contain handler functions for actions like creating, editing, and deleting items (e.g., `handleCreate`, `handleDelete`, `handleUpdateStatus`). These handlers currently perform mock operations and show a toast notification.
*   **To Switch to Real Data**: You must update these handler functions. Instead of just simulating the action, they should call new functions in `src/services/cake-service.ts` that make the appropriate API requests (e.g., `DELETE /api/cakes/:id`, `PUT /api/orders/:id/status`). After a successful API call, they should then re-fetch the data to update the UI.
