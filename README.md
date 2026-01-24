# WhiskeDelights: Application Documentation

Welcome to the full technical documentation for the WhiskeDelights web application. This document provides a comprehensive overview of the technologies used, the core design principles applied, the project's file structure, and a clear roadmap for future backend integration.

## 1. Technology Stack

-   **Next.js**: A React framework that provides a production-ready foundation. We use its App Router for file-based routing, Server Components for performance, and Server Actions for secure backend communication without creating separate API endpoints.

-   **React**: The core library for building the user interface. The entire application is composed of interactive and reusable React components.

-   **TypeScript**: A typed superset of JavaScript that enhances code quality, improves maintainability, and provides excellent editor support.

-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces. It's used for all styling in the application.

-   **ShadCN/UI**: A collection of beautifully designed, accessible, and reusable UI components built on top of Radix UI and Tailwind CSS. This accelerates UI development and ensures consistency.

-   **OpenStreetMap (Nominatim)**: Integrated for an intelligent address search with autocomplete. This provides a free and open-source alternative to other mapping services for accurate delivery location capture.

-   **Paystack**: A payment gateway integrated for processing M-Pesa payments securely. The integration uses the official Paystack inline popup.

## 2. Design Principles & Architecture

The application is structured following modern software design principles to ensure it is clean, scalable, and easy to maintain.

### a. Component-Based Architecture

The UI is broken down into small, reusable components located primarily in `src/components`. This is a core principle of React.
-   **Presentational Components**: Most components are "dumb" and focus on rendering UI based on the props they receive (e.g., `Button`, `Card`).
-   **Container Components**: Page-level components (`src/app/page.tsx`, `src/app/checkout/page.tsx`) act as containers that fetch data and manage the overall state for a view, passing it down to presentational components.

### b. Separation of Concerns

Logic is clearly separated into different layers of the application.

-   **UI (`src/components`, `src/app`):** Responsible only for presentation and user interaction.
-   **State Management (`src/hooks`):** Reusable, stateful logic is extracted into custom hooks.
    -   `useCart`: Manages the global shopping cart state (adding, removing, updating items) and persists it to `localStorage`.
    -   `useCakeData`: Manages the fetching and loading state of all initial cake data for the application.
-   **Data Fetching (`src/services`):** The `cake-service.ts` file is responsible for all data retrieval. It abstracts the data source from the rest of the application. **This is the key to easy backend integration.**
-   **Server-Side Logic (`src/lib/actions.ts`):** Next.js Server Actions are used to handle secure operations that should run on the server, such as placing an order. This avoids the need to create and expose traditional API endpoints.

### c. Admin Panel Architecture

The admin panel is a client-side rendered application within the Next.js framework.
-   **Authentication**: It uses `localStorage` to persist the admin's login state. This is a simulation for local development. A real-world application would use secure, HTTP-only cookies with tokens managed by a backend server.
-   **Data Management**: The admin panel reads and simulates "writing" to the mock data files (`src/lib/data.ts`). This allows for a fully interactive prototype without requiring a database. All UI components are ready to be wired to API calls to a real backend.

### d. Checkout Flow

The checkout process (`src/app/checkout/page.tsx`) is designed to be a smooth, responsive, and intuitive single-page experience.

-   **Streamlined Single-Page Flow**: The entire checkout process happens on a single, responsive page, ensuring a seamless experience on all devices.
-   **Collapsible Order Summary**: The order summary is tucked into a collapsible section at the top, saving screen space while keeping the total price visible and accessible with a single tap.
-   **Intelligent Address Search**: The address field uses OpenStreetMap's free Nominatim service for autocomplete suggestions. It also includes a "Use my location" button to automatically detect the user's address and coordinates, making address entry fast and accurate.
-   **Direct Payment**: After filling out their delivery details, the customer clicks a single "Place Order & Pay" button. This action securely creates their order in the system and immediately opens the Paystack M-Pesa payment interface, removing the need for an extra payment review step and creating a faster, more seamless transaction.

## 3. File-by-File Breakdown

Here is an explanation of the key files and directories in the project.

-   `src/app/`
    -   `layout.tsx`, `globals.css`, `page.tsx`: These files define the main customer-facing application layout, styles, and page views.
    -   `checkout/page.tsx`: A responsive, single-page checkout flow with a collapsible order summary and OpenStreetMap address search.

-   `src/app/admin/`
    -   `login/page.tsx`: The dedicated login page for the admin panel.
    -   `(protected)/layout.tsx`: A special layout that protects all admin routes, redirecting unauthenticated users to the login page. It also contains the main sidebar navigation for the admin panel.
    -   `(protected)/dashboard/page.tsx`: The main dashboard page for the admin, showing key metrics.
    -   `(protected)/orders/page.tsx`: Renders a table of all orders.
    -   `(protected)/cakes/page.tsx`: Renders a table of all available cakes.
    -   `(protected)/offers/page.tsx`: Provides a form to manage the daily special offer.
    -   `(protected)/customizations/page.tsx`: A tabbed interface to manage all cake customization options (flavors, sizes, etc.).

-   `src/components/`
    -   `cake-paradise/`: Contains all custom components specific to this application, such as the cart, menu, and checkout forms.
    -   `ui/`: Contains the ShadCN/UI components (e.g., `Button.tsx`, `Card.tsx`, `Dialog.tsx`).

-   `src/hooks/`: Contains custom React hooks for shared logic, such as `useCart` and `useCakeData`.

-   `src/lib/`
    -   `actions.ts`: Contains Next.js Server Actions.
    -   `data.ts`: **(Mock Backend)** Contains the hardcoded array of cakes, offers, customizations, and orders. This file acts as our temporary database.
    -   `types.ts`: Contains all TypeScript type definitions for the application's data structures.

-   `src/services/`:
    -   `cake-service.ts`: **(Data Access Layer)** This service abstracts data fetching. It currently reads from the mock data but is the single point of modification needed to connect to a real API.

-   `Dockerfile`, `docker-compose.yml`: Files required to build and run the application using Docker.

-   `package.json`: Lists all project dependencies and scripts.
-   `.env`: **(Important)** This file is for environment variables. You must create it for local development.

## 4. The Admin Panel

The application includes a comprehensive admin panel for managing the shop's data.

### a. Functionality

-   **Dashboard**: View key metrics like total revenue, total orders, and customer count.
-   **Order Management**: View a list of all orders with customer details, status, and total price.
-   **Cake Management**: View and manage all available cakes.
-   **Offer Management**: Update the daily special offer.
-   **Customization Management**: Add, view, or remove options for cake flavors, sizes, colors, and toppings.

### b. How to Access and Log In

1.  Navigate to the site's footer and click the "Admin Panel" link, or go directly to `/admin/login`.
2.  Use the following credentials to log in:
    -   **Email**: `admin@whiskedelights.com`
    -   **Password**: `admin`

This provides access to all the protected admin routes. The login state is stored in the browser's `localStorage` for the prototype.

## 5. How to Connect a Real Backend API

This application was designed to make backend integration straightforward. You only need to modify a few specific places to switch from mock data to a real API.

### a. API Endpoint Blueprint

A real-world backend for this application would need to expose the following API endpoints. The frontend, including the admin panel, is ready to be connected to them.

| Method | Endpoint | Description | Used In |
| :--- | :--- | :--- | :--- |
| **Auth** | | |
| `POST` | `/api/auth/login` | Authenticate an admin user and return a token. | Admin Login |
| **Cakes** | | |
| `GET` | `/api/cakes` | Get a list of all cakes. | Menu, Admin |
| `POST`| `/api/cakes` | Create a new cake. | Admin |
| `PUT` | `/api/cakes/:id` | Update an existing cake. | Admin |
| `DELETE`| `/api/cakes/:id` | Delete a cake. | Admin |
| **Special Offers** | | |
| `GET` | `/api/special-offer` | Get the current active special offer. | Homepage, Admin |
| `PUT` | `/api/special-offer` | Update the special offer. | Admin |
| **Orders** | | |
| `GET` | `/api/orders` | Get a list of all orders. | Admin |
| `POST`| `/api/orders` | **Place a new customer order.** | Checkout |
| `PUT` | `/api/orders/:id/status`| Update an order's status. | Admin |
| `POST`| `/api/payments/verify` | Verify a payment with Paystack. | Checkout |
| **Customizations**| | |
| `GET` | `/api/customizations`| Get all customization options. | Customization Modal, Admin |
| `POST`| `/api/customizations/flavors` | Add a new flavor. | Admin |
| `PUT` | `/api/customizations/flavors/:id` | Update a flavor. | Admin |
| `DELETE`| `/api/customizations/flavors/:id` | Delete a flavor. | Admin |
| ... | *(similar endpoints for sizes, colors, toppings)* | | Admin |

### b. Implementation Steps

1.  **Data Fetching (GET requests)**:
    -   **File to Modify**: `src/services/cake-service.ts`
    -   **Action**: Replace the mock data imports and `setTimeout` functions with `fetch` calls to your real API endpoints (e.g., `fetch('/api/cakes')`). The rest of the application, including all React components and hooks, will automatically start using the real data without any other changes.

2.  **Data Mutation (POST, PUT, DELETE requests)**:
    -   **File to Modify (Orders)**: `src/lib/actions.ts` (the `placeOrder` function).
    -   **Action**: Modify this function to send the order payload to your `POST /api/orders` endpoint.
    -   **File to Modify (Admin)**: The various admin pages in `src/app/admin/(protected)/`.
    -   **Action**: Wire up the "Create", "Update", and "Delete" buttons in the admin panel to make API calls to the corresponding endpoints (e.g., `POST /api/cakes`).

## 6. Database Setup & Schema

This section provides the blueprint for your backend database and instructions on how to set it up locally.

### a. Table Relationships

-   **`orders` (1) -> (∞) `order_items`**: An order can have many items. `order_items.order_id` is a foreign key to `orders.id`.
-   **`cakes` (1) -> (∞) `order_items`**: A specific cake can be part of many different order items. `order_items.cake_id` is a foreign key to `cakes.id`.
-   **`cakes` (1) -> (1) `special_offers`**: A special offer is tied to a single cake. `special_offers.cake_id` is a foreign key to `cakes.id`.
-   **`customization_*` Tables**: These are lookup tables (for flavors, sizes, etc.) and do not have direct relationships with the `orders` table. Customization choices for an order are stored in the `order_items.customizations_json` column.

### b. Core Tables

**1. `cakes` Table**
| Column Name | Data Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **Primary Key** |
| `name` | `VARCHAR(255)` | Not Null |
| `description`| `TEXT` | |
| `base_price` | `DECIMAL(10, 2)`| Not Null |
| `image_id` | `VARCHAR(255)` | |
| `rating` | `FLOAT` | Default: 0 |
| `category` | `VARCHAR(255)` | |
| `customizable` | `BIT` / `BOOLEAN` | Default: `1` / `TRUE`. Determines if a user can customize the cake. |
| `orders_count` | `INTEGER` | Default: 0 |
| `ready_time` | `VARCHAR(50)` | |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` |
| `updated_at` | `TIMESTAMP` | Updates on change |

---
**2. `special_offers` Table**
| Column Name | Data Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `INT` | **Primary Key**, Auto-increment |
| `cake_id` | `VARCHAR(255)`| **Foreign Key** -> `cakes.id` |
| `discount_percentage` | `INT` | Not Null |
| `is_active` | `BOOLEAN` | Default: `true` |
| `start_date` | `DATE` | |
| `end_date` | `DATE` | |

---
**3. `orders` Table**
| Column Name | Data Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `INT` | **Primary Key**, Auto-increment |
| `order_number`| `VARCHAR(255)` | Unique, Not Null |
| `customer_name`| `VARCHAR(255)` | Not Null |
| `customer_phone`| `VARCHAR(20)` | Not Null |
| `delivery_method`| `ENUM('delivery', 'pickup')` | Not Null |
| `delivery_address`| `TEXT` | Nullable |
| `latitude` | `DECIMAL(10, 8)` | Nullable, for map coordinates |
| `longitude`| `DECIMAL(11, 8)` | Nullable, for map coordinates |
| `pickup_location`| `VARCHAR(255)` | Nullable |
| `delivery_date`| `DATE` | Nullable |
| `special_instructions`| `TEXT` | Nullable |
| `total_price`| `DECIMAL(10, 2)`| Not Null |
| `payment_status`| `ENUM('pending', 'paid')` | Default: `'pending'` |
| `order_status`| `ENUM('processing', 'complete', 'cancelled')` | Default: `'processing'` |
| `created_at` | `TIMESTAMP` | Default: `CURRENT_TIMESTAMP` |

---
**4. `order_items` Table**
| Column Name | Data Type | Constraints / Notes |
| :--- | :--- | :--- |
| `id` | `INT` | **Primary Key**, Auto-increment |
| `order_id` | `INT` | **Foreign Key** -> `orders.id` |
| `cake_id` | `VARCHAR(255)` | **Foreign Key** -> `cakes.id` |
| `quantity` | `INT` | Not Null, Default: 1 |
| `price_at_purchase` | `DECIMAL(10, 2)`| Not Null |
| `customizations_json`| `JSON` | Nullable. **Crucial for storing customization data.** |

---
### c. How Customizations are Stored & Handled

The database is designed to flexibly handle complex user customizations. Here's the data flow:

1.  **Customizable Flag**: The process begins with the `cakes` table, where each cake has a `customizable` flag. If this flag is `false`, the customer can add the cake directly to their cart without customization. The following steps apply only to cakes marked as `customizable`.

2.  **Customer Selection**: The customer uses the `CustomizationModal` to select their desired flavor, size, color, and toppings. These selections are stored in the frontend's state.

3.  **Order Payload**: When the order is placed, these selections are passed as a `customizations` object within each `CartItem`. For example:
    ```json
    {
      "flavor": "f2",
      "size": "s3",
      "color": "c2",
      "toppings": ["t1", "t2"]
    }
    ```

4.  **Database Storage**: The backend API receives this payload. For each cake in the order, it creates a record in the `order_items` table. The `customizations` object is then serialized into a JSON string and saved in the `customizations_json` column.

5.  **Admin View**: When an admin views an order's details, the backend retrieves the order, including its `order_items`. The frontend then parses the `customizations_json` string for each item and displays the chosen options in a human-readable format. This ensures the admin knows the exact specifications for preparing each cake.

---
### d. Customization Option Tables
These tables store the available choices for building a custom cake.

| Table Name | Column Name | Data Type | Constraints / Notes |
| :--- | :--- | :--- | :--- |
| **customization_flavors** | `id` | `VARCHAR(255)` | **Primary Key** |
| | `name`| `VARCHAR(255)` | Not Null |
| | `price`| `DECIMAL(10, 2)` | Not Null |
| **customization_sizes** | `id` | `VARCHAR(255)` | **Primary Key** |
| | `name`| `VARCHAR(255)` | Not Null |
| | `serves`| `VARCHAR(255)` | |
| | `price`| `DECIMAL(10, 2)` | Not Null |
| **customization_colors** | `id` | `VARCHAR(255)` | **Primary Key** |
| | `name`| `VARCHAR(255)` | Not Null |
| | `hex_value`| `VARCHAR(7)` | |
| | `price`| `DECIMAL(10, 2)` | Not Null |
| **customization_toppings**| `id` | `VARCHAR(255)` | **Primary Key** |
| | `name`| `VARCHAR(255)` | Not Null |
| | `price`| `DECIMAL(10, 2)` | Not Null |

### e. MS SQL Server Table Creation Scripts

You can use these SQL scripts to create all required tables in a tool like SQL Server Management Studio (SSMS) or Azure Data Studio.

```sql
-- This script is for Microsoft SQL Server.

-- 1. Cakes Table
CREATE TABLE cakes (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    base_price DECIMAL(10, 2) NOT NULL,
    image_id NVARCHAR(255),
    rating FLOAT DEFAULT 0,
    category NVARCHAR(255),
    customizable BIT DEFAULT 1,
    orders_count INT DEFAULT 0,
    ready_time NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- 2. Special Offers Table
CREATE TABLE special_offers (
    id INT PRIMARY KEY IDENTITY(1,1),
    cake_id NVARCHAR(255) FOREIGN KEY REFERENCES cakes(id) ON DELETE SET NULL,
    discount_percentage INT NOT NULL,
    is_active BIT DEFAULT 1,
    start_date DATE,
    end_date DATE
);

-- 3. Orders Table
CREATE TABLE orders (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_number NVARCHAR(255) NOT NULL UNIQUE,
    customer_name NVARCHAR(255) NOT NULL,
    customer_phone NVARCHAR(20) NOT NULL,
    delivery_method NVARCHAR(10) NOT NULL CHECK (delivery_method IN ('delivery', 'pickup')),
    delivery_address NVARCHAR(MAX),
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    pickup_location NVARCHAR(255),
    delivery_date DATE,
    special_instructions NVARCHAR(MAX) NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status NVARCHAR(10) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    order_status NVARCHAR(15) DEFAULT 'processing' CHECK (order_status IN ('processing', 'complete', 'cancelled')),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- 4. Order Items Table
CREATE TABLE order_items (
    id INT PRIMARY KEY IDENTITY(1,1),
    order_id INT NOT NULL FOREIGN KEY REFERENCES orders(id) ON DELETE CASCADE,
    cake_id NVARCHAR(255) NOT NULL FOREIGN KEY REFERENCES cakes(id),
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    customizations_json NVARCHAR(MAX) CHECK (ISJSON(customizations_json) > 0)
);

-- 5. Customization Flavors Table
CREATE TABLE customization_flavors (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 6. Customization Sizes Table
CREATE TABLE customization_sizes (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    serves NVARCHAR(255),
    price DECIMAL(10, 2) NOT NULL
);

-- 7. Customization Colors Table
CREATE TABLE customization_colors (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    hex_value NVARCHAR(7),
    price DECIMAL(10, 2) NOT NULL
);

-- 8. Customization Toppings Table
CREATE TABLE customization_toppings (
    id NVARCHAR(255) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
```

### f. MySQL / MariaDB Table Creation Scripts (for XAMPP users)
If you are using XAMPP, use these scripts in phpMyAdmin or a similar tool.

```sql
-- This script is for MySQL or MariaDB.

-- 1. Cakes Table
CREATE TABLE cakes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    image_id VARCHAR(255),
    rating FLOAT DEFAULT 0,
    category VARCHAR(255),
    customizable BOOLEAN DEFAULT TRUE,
    orders_count INT DEFAULT 0,
    ready_time VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Special Offers Table
CREATE TABLE special_offers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    cake_id VARCHAR(255),
    discount_percentage INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (cake_id) REFERENCES cakes(id) ON DELETE SET NULL
);

-- 3. Orders Table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_number VARCHAR(255) NOT NULL UNIQUE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_method ENUM('delivery', 'pickup') NOT NULL,
    delivery_address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    pickup_location VARCHAR(255),
    delivery_date DATE,
    special_instructions TEXT,
    total_price DECIMAL(10, 2) NOT NULL,
    payment_status ENUM('pending', 'paid') DEFAULT 'pending',
    order_status ENUM('processing', 'complete', 'cancelled') DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Order Items Table
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    cake_id VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    customizations_json JSON,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (cake_id) REFERENCES cakes(id)
);

-- 5. Customization Flavors Table
CREATE TABLE customization_flavors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- 6. Customization Sizes Table
CREATE TABLE customization_sizes (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serves VARCHAR(255),
    price DECIMAL(10, 2) NOT NULL
);

-- 7. Customization Colors Table
CREATE TABLE customization_colors (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    hex_value VARCHAR(7),
    price DECIMAL(10, 2) NOT NULL
);

-- 8. Customization Toppings Table
CREATE TABLE customization_toppings (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);
```

### g. Local Database Setup

The Next.js frontend **should not** connect directly to the database for security reasons. It must communicate with a **backend API**. The following instructions are for setting up the database that your future backend API will connect to.

#### Option 1: Local MS SQL Server Setup (using Docker)

The easiest way to run a local MS SQL database is with Docker.

**Prerequisites:**
-   **Docker Desktop**: Make sure it is installed and running on your machine.
-   **Database Tool**: **Azure Data Studio** is recommended for MS SQL.

**Step-by-Step Instructions:**

1.  **Create a Database Docker Compose File:**
    In the root of your project, create a new file named `docker-compose.sql.yml` and add the following:

    ```yml
    version: '3.8'
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2022-latest
        container_name: mssql_server_local
        ports:
          - "1433:1433"
        environment:
          SA_PASSWORD: "your_Strong_Password123" # CHANGE THIS to a strong password
          ACCEPT_EULA: "Y"
        volumes:
          - sqlserver_data:/var/opt/mssql

    volumes:
      sqlserver_data:
    ```

2.  **Start the Database Container:**
    Open your terminal in the project root and run:
    ```bash
    docker-compose -f docker-compose.sql.yml up -d
    ```

3.  **Connect to Your Local Database:**
    -   Open Azure Data Studio.
    -   Create a new connection:
        -   **Server**: `localhost`
        -   **Authentication type**: `SQL Login`
        -   **User name**: `sa`
        -   **Password**: The password you set in the `docker-compose.sql.yml` file.
    -   Connect.

4.  **Create the Database and Tables:**
    -   Open a new query editor.
    -   Run `CREATE DATABASE WhiskeDelightsDB;`
    -   Switch your connection to use this new database.
    -   Copy and run the **MS SQL Server** `CREATE TABLE` scripts from the section above.

#### Option 2: Using XAMPP for the Database (MySQL/MariaDB)

If you prefer to use XAMPP, you can use its included MySQL/MariaDB server.

1. **Start XAMPP**: Open the XAMPP Control Panel and start the `Apache` and `MySQL` modules.
2. **Open phpMyAdmin**: Click the `Admin` button next to the MySQL module. This will open phpMyAdmin in your browser.
3. **Create the Database**:
   - In phpMyAdmin, click on the `Databases` tab.
   - Enter `WhiskeDelightsDB` in the "Create database" field and click `Create`.
4. **Run SQL Scripts**:
   - Select the `WhiskeDelightsDB` database from the left-hand sidebar.
   - Click on the `SQL` tab.
   - Copy all the **MySQL/MariaDB** `CREATE TABLE` scripts from the section above and paste them into the query box.
   - Click the `Go` button to create all the tables.


### h. Connecting a Backend to Your Database

Your backend application (e.g., using Node.js/Express, ASP.NET) will handle the database operations. In that **separate backend project**, you would have an environment file (`.env`) with a connection string like this:

**For MS SQL Server:**
```
DATABASE_URL="sqlserver://localhost:1433;database=WhiskeDelightsDB;user=sa;password=your_Strong_Password123;encrypt=false;trustServerCertificate=true"
```
**For MySQL/MariaDB (XAMPP):**
```
DATABASE_URL="mysql://root:@localhost:3306/WhiskeDelightsDB"
```
Your backend code would then use this string to connect to the database and expose the API endpoints listed in section 5a.

## 7. Security Overview

This section details the security architecture of the application, measures taken to protect user data, and best practices for a production environment.

### a. Core Architectural Principles

-   **Frontend/Backend Separation**: The most critical security principle is the strict separation between the Next.js frontend and a backend API. The frontend never connects directly to the database. This prevents exposure of database credentials and other sensitive information to the client's browser.
-   **Next.js Server Actions**: Operations that involve business logic (like placing an order) are implemented as Server Actions (`src/lib/actions.ts`). These actions run securely on the server, not the client, making it impossible for a user to tamper with logic such as prices or product details.
-   **Environment Variable Management**: Sensitive keys (like payment provider secret keys or database connection strings) are **not** stored in this project. They belong exclusively in the backend API's environment. The frontend `.env` file requires public keys, which are designed to be safely used in the browser.

### b. Payment Security (Paystack Integration)

The application ensures payment security by delegating all sensitive operations to Paystack, a PCI-DSS compliant Payment Service Provider.

-   **No Sensitive Data Handled**: The application **never** sees, handles, or stores any M-Pesa PINs or credit card numbers. All payment information is entered directly into a secure iframe controlled by Paystack.
-   **Transaction Verification (The Critical Step)**:
    -   The `callback` function in the Paystack popup is only for providing immediate UI feedback (e.g., "Payment successful!"). It **cannot be trusted** as a definitive confirmation of payment.
    -   **True verification must happen on the backend**. For every payment, Paystack can send a **webhook** to a secure endpoint on your backend API. Your backend code must:
        1.  Receive this webhook and verify its authenticity using the signature provided by Paystack.
        2.  Check the event type (e.g., `charge.success`).
        3.  Verify the transaction amount and currency match the order total.
        4.  Update the `payment_status` in your `orders` table from `pending` to `paid`.
    -   This webhook-based approach prevents a malicious user from simply triggering the success function on the frontend to get an order for free and ensures no duplicate orders are processed.

### c. Admin Panel & Authentication

-   **Brute-Force Attack Prevention**: The current mock login is for demonstration only. A production backend must implement measures to prevent brute-force attacks on the admin login page, including:
    -   **Rate Limiting**: Block an IP address after a set number of failed login attempts.
    -   **Account Lockout**: Temporarily lock the `admin` account after too many consecutive failures.
    -   **CAPTCHA**: Introduce a CAPTCHA challenge after several failed attempts.
-   **Authentication Method**: A production system should use secure, HTTP-only cookies with JWTs (JSON Web Tokens) to manage admin sessions, rather than `localStorage`.

### d. Threat Mitigation Strategies

-   **DDoS (Distributed Denial-of-Service) Attacks**: The primary defense against DDoS attacks is the hosting infrastructure. Deploying this application on a modern cloud platform like Firebase App Hosting, Vercel, or AWS provides significant, built-in protection at the network edge. Additionally, the backend API should implement its own rate-limiting rules.
-   **Cross-Site Scripting (XSS)**: React and Next.js provide strong, built-in protection against XSS attacks by automatically escaping data rendered in JSX. This prevents malicious scripts injected into data fields (e.g., a cake description) from being executed in the browser.
-   **Cross-Site Request Forgery (CSRF)**: Next.js Server Actions have built-in CSRF protection. When a form is submitted, Next.js automatically creates and validates a unique token, ensuring that the request legitimately originated from your application.
-   **Data Validation**: All data coming from the client must be re-validated on the backend API before being processed or saved to the database. Never trust client-side input, as it can be manipulated.

By following this layered security approach, the application ensures a robust defense against common web vulnerabilities.

## 8. Local Development Setup

Follow these instructions to get the application running on your local machine.

### a. Prerequisites

- **Node.js**: Version 20.x or higher.
- **npm**: A Node.js package manager (v10+).
- **Docker**: (Optional) For running the application in a containerized environment.

### b. Environment Variables

For the application to run correctly, especially for payment integration, you must provide an environment variable.

1.  Create a new file named `.env` in the root of the project.
2.  Add the following line to the file, replacing the placeholder with your actual key:

    ```
    # Your public key from the Paystack dashboard (required for payments)
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

### c. Standard Installation (npm)

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    The application will be available at `http://localhost:3000`.
    ```bash
    npm run dev
    ```

### d. Running with Docker

This is the recommended way to run the application to ensure a consistent environment.

1.  **Build the Docker image and run the container:**
    Make sure Docker Desktop is running on your machine. Then, from the root of the project, run:
    ```bash
    docker-compose up --build
    ```
2.  **Access the application:**
    The application will be available at `http://localhost:3000`.

To stop the application, press `CTRL+C` in the terminal.
