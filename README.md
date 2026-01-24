# Cake Paradise: Application Documentation

Welcome to the full technical documentation for the Cake Paradise web application. This document provides a comprehensive overview of the technologies used, the core design principles applied, the project's file structure, and a clear roadmap for future backend integration.

## 1. Technology Stack

This application is built on a modern, robust, and scalable technology stack designed for performance and developer experience.

-   **Next.js**: A React framework that provides a production-ready foundation. We use its App Router for file-based routing, Server Components for performance, and Server Actions for secure backend communication without creating separate API endpoints.

-   **React**: The core library for building the user interface. The entire application is composed of interactive and reusable React components.

-   **TypeScript**: A typed superset of JavaScript that enhances code quality, improves maintainability, and provides excellent editor support.

-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces. It's used for all styling in the application.

-   **ShadCN/UI**: A collection of beautifully designed, accessible, and reusable UI components built on top of Radix UI and Tailwind CSS. This accelerates UI development and ensures consistency.

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

## 3. File-by-File Breakdown

Here is an explanation of the key files and directories in the project.

-   `src/app/`
    -   `layout.tsx`, `globals.css`, `page.tsx`, `checkout/page.tsx`: These files define the main customer-facing application layout, styles, and page views.

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
    -   **Email**: `admin@cakeparadise.com`
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

-   **One-to-Many**: An `orders` record can have multiple `order_items`.
-   **Many-to-One**: Many `order_items` records point to one `orders` record.
-   **Many-to-One**: An `order_item` points to one `cakes` record.
-   **One-to-One**: A `special_offers` record points to one `cakes` record.

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
| `customer_email`| `VARCHAR(255)` | |
| `delivery_method`| `ENUM('delivery', 'pickup')` | Not Null |
| `delivery_address`| `TEXT` | Nullable |
| `pickup_location`| `VARCHAR(255)` | Nullable |
| `delivery_date`| `DATE` | Nullable |
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
| `customizations_json`| `JSON` | Nullable |

---
### c. Customization Option Tables
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

### d. MS SQL Server Table Creation Scripts

You can use a database migration tool (like Prisma, Drizzle) to generate tables from a schema, or create them directly using these SQL scripts in a tool like SQL Server Management Studio (SSMS) or Azure Data Studio.

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
    customer_email NVARCHAR(255),
    delivery_method NVARCHAR(10) NOT NULL CHECK (delivery_method IN ('delivery', 'pickup')),
    delivery_address NVARCHAR(MAX),
    pickup_location NVARCHAR(255),
    delivery_date DATE,
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

-- Note on updated_at: For automatic updates on change, a trigger would be required in MS SQL.
-- Example trigger for the 'cakes' table:
/*
CREATE TRIGGER trg_cakes_updated_at
ON cakes
AFTER UPDATE
AS
BEGIN
    UPDATE cakes
    SET updated_at = GETDATE()
    FROM inserted
    WHERE cakes.id = inserted.id;
END;
*/
```

### e. Local MS SQL Server Setup (using Docker)

The easiest way to run a local MS SQL database is with Docker. This avoids installing it directly on your system.

**Prerequisites:**
-   **Docker Desktop**: Make sure it is installed and running on your machine.
-   **Database Tool**: A tool to connect to and manage the database. **Azure Data Studio** is recommended for MS SQL, but others like DBeaver or the SQL Server extension for VS Code also work.

**Step-by-Step Instructions:**

1.  **Create a Database Docker Compose File:**
    In the root of your project, create a new file named `docker-compose.sql.yml` (to keep it separate from the app's `docker-compose.yml`) and add the following content:

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
    > **Important:** Change `your_Strong_Password123` to a secure password.

2.  **Start the Database Container:**
    Open your terminal in the project root and run the following command:
    ```bash
    docker-compose -f docker-compose.sql.yml up -d
    ```
    This will download the MS SQL Server image and start it in the background. The `-d` flag means "detached mode".

3.  **Connect to Your Local Database:**
    -   Open Azure Data Studio (or your preferred tool).
    -   Create a new connection with the following settings:
        -   **Server**: `localhost`
        -   **Authentication type**: `SQL Login`
        -   **User name**: `sa` (this is the default System Administrator user)
        -   **Password**: The password you set in the `docker-compose.sql.yml` file.
        -   **Database Name**: You can leave this blank for now.
    -   Connect. You are now connected to your local SQL Server instance!

4.  **Create the Database and Tables:**
    -   Once connected, open a new query editor.
    -   First, create the database by running:
        ```sql
        CREATE DATABASE CakeParadiseDB;
        ```
    -   Then, switch your connection to use this new database.
    -   Finally, copy all the `CREATE TABLE` scripts from the section above and run them in the query editor to create all your application's tables.

Your local database is now set up and ready to be used by a backend application.

### f. Connecting a Backend to Your Database

This Next.js app is a **frontend** and **should not connect directly to the database**. You must build a **backend API** (e.g., using Node.js/Express, ASP.NET, or even Next.js API Routes) that handles database operations.

In your backend application's environment file (e.g., `.env`), you would add a connection string like this:

```
DATABASE_URL="sqlserver://localhost:1433;database=CakeParadiseDB;user=sa;password=your_Strong_Password123;encrypt=false;trustServerCertificate=true"
```
Your backend code would then use this string with a library like `node-mssql` or an ORM like Prisma to execute queries against the database and expose the data via the API endpoints defined in section 5a.

## 7. Local Development Setup

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
    The application will be available at `http://localhost:9002`.
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
