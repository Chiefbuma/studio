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

## 3. File-by-File Breakdown

Here is an explanation of the key files and directories in the project.

-   `src/app/`
    -   `layout.tsx`: The root layout for the entire application. It includes the main HTML structure, font imports, and global providers like the `CartProvider`.
    -   `globals.css`: The global stylesheet, which includes Tailwind CSS directives and the application's color theme (CSS variables for light/dark mode).
    -   `page.tsx`: The entry point and main component for the homepage view. It controls which view (Cover, Offer, Menu) is displayed.
    -   `checkout/page.tsx`: The component for the `/checkout` route. It manages the two-step checkout process (delivery and payment).

-   `src/components/`
    -   `cake-paradise/`: Contains all the custom components specific to this application.
        -   `customization/`: Components related to the cake customization modal and forms.
        -   `cart-icon.tsx` & `cart-sheet.tsx`: The floating cart button and the slide-out cart panel.
        -   `cover-page.tsx`, `special-offer.tsx`, `menu.tsx`: The three main views of the homepage.
    -   `ui/`: Contains the ShadCN/UI components (e.g., `Button.tsx`, `Card.tsx`, `Dialog.tsx`). These are general-purpose, reusable UI primitives.

-   `src/hooks/`
    -   `use-cart.tsx`: The most important hook for client-side state. It provides the cart's state and functions to manipulate it to any component wrapped in `CartProvider`.
    -   `use-cake-data.ts`: Fetches all initial cake data and handles the loading state, simplifying the main page component.
    -   `use-toast.ts`: A hook for showing toast notifications.

-   `src/lib/`
    -   `actions.ts`: Contains Next.js Server Actions. `placeOrder` is defined here.
    -   `data.ts`: **(Mock Backend)** Contains the hardcoded array of cakes, special offers, and customization options. This file acts as our temporary database.
    -   `placeholder-images.ts` & `.json`: Defines and exports all placeholder image data to ensure consistency.
    -   `types.ts`: Contains all TypeScript type definitions for the application's data structures (e.g., `Cake`, `CartItem`).
    -   `utils.ts`: Utility functions, like `cn` for merging CSS classes and `formatPrice` for currency formatting.

-   `src/services/`
    -   `cake-service.ts`: **(Data Access Layer)** This service contains functions (`getCakes`, `getSpecialOffer`, etc.) that simulate fetching data with a delay. It currently imports from `src/lib/data.ts`.

-   `package.json`: Lists all project dependencies and scripts.
-   `.env`: **(Important)** This file is for environment variables. You must add your Paystack public key here for payments to work.

## 4. How to Connect a Real Backend API

This application was designed to make backend integration straightforward. You only need to modify a few specific places.

### a. Fetching Data (Cakes, Offers)

-   **File to Modify**: `src/services/cake-service.ts`
-   **Current Implementation**: Functions in this file return a `Promise` that resolves with mock data from `src/lib/data.ts`.
-   **Future Implementation**:
    1.  Delete the import from `src/lib/data.ts`.
    2.  Inside each function (e.g., `getCakes`), use the `fetch` API to call your real backend endpoint (e.g., `https://api.yourdomain.com/cakes`).
    3.  Parse the JSON response and return it.
    4.  The rest of the application, including the `useCakeData` hook and all components, will work without any changes because they rely on the service, not the data source itself.

    ```typescript
    // Example of future src/services/cake-service.ts
    import type { Cake } from '@/lib/types';

    const API_BASE_URL = 'https://your-api-backend.com/api';

    export async function getCakes(): Promise<Cake[]> {
      const response = await fetch(`${API_BASE_URL}/cakes`);
      if (!response.ok) {
        throw new Error('Failed to fetch cakes');
      }
      return response.json();
    }
    // ... implement for getSpecialOffer, etc.
    ```

### b. Placing an Order

-   **File to Modify**: `src/lib/actions.ts` (the `placeOrder` function).
-   **Current Implementation**: This function simulates creating an order number and returns a success response.
-   **Future Implementation**:
    1.  Inside `placeOrder`, make a `fetch` call to your backend with the `POST` method.
    2.  Send the `payload` (containing cart items and delivery info) in the request body.
    3.  Your backend will save the order to a database and return a real order number.
    4.  Return the response from your backend.

### c. Verifying Payments

-   **File to Modify**: `src/app/checkout/page.tsx` (the `handlePaymentSuccess` function).
-   **Current Implementation**: When payment succeeds, it shows a toast message and clears the cart.
-   **Future Implementation**:
    1.  In `handlePaymentSuccess`, after a successful payment response from Paystack, make a call to your backend.
    2.  Send the payment `reference` and `orderNumber` to a secure backend endpoint (e.g., `/api/verify-payment`).
    3.  Your backend should then call the Paystack Verification API to confirm the payment is valid. If it is, update the order status to "Paid" in your database.

## 5. Database Schema

While this application currently uses mock data, it is designed to seamlessly transition to a real database. Below is the recommended database schema based on the application's data structures. When implementing a backend, these definitions can be used to create migration files with an ORM like Prisma, Drizzle, or TypeORM.

### Core Tables

**1. `cakes` Table**
Stores the details for each standard cake available for sale.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **Primary Key.** A unique identifier (e.g., 'red-velvet-delight'). |
| `name` | `VARCHAR(255)` | The name of the cake. |
| `description`| `TEXT` | A detailed description of the cake. |
| `base_price` | `DECIMAL(10, 2)` | The starting price before any customization. |
| `image_id` | `VARCHAR(255)` | Identifier for the cake's image (could be a foreign key to an `images` table). |
| `rating` | `FLOAT` | The average customer rating (e.g., 4.8). |
| `category` | `VARCHAR(255)` | The category of the cake (e.g., 'Classic', 'Chocolate'). |
| `orders_count` | `INTEGER` | A counter for how many times the cake has been ordered. |
| `ready_time` | `VARCHAR(50)` | Estimated time to prepare the cake (e.g., '24h'). |
| `created_at` | `TIMESTAMP` | When the record was created. |
| `updated_at` | `TIMESTAMP` | When the record was last updated. |

---

**2. `special_offers` Table**
Manages the daily or weekly special offers.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | **Primary Key.** Auto-incrementing unique identifier. |
| `cake_id` | `VARCHAR(255)`| **Foreign Key** to the `cakes.id` table. |
| `discount_percentage` | `INT` | The percentage discount offered (e.g., 20). |
| `special_price`| `DECIMAL(10, 2)`| The final discounted price. |
| `is_active` | `BOOLEAN` | A flag to easily enable or disable the offer. |
| `start_date` | `DATE` | When the offer becomes active. |
| `end_date` | `DATE` | When the offer expires. |

---

**3. `orders` Table**
Stores customer order information, including delivery details.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | **Primary Key.** Auto-incrementing unique identifier. |
| `order_number`| `VARCHAR(255)` | The public-facing unique order number (e.g., 'CP-12345'). |
| `customer_name` | `VARCHAR(255)` | The customer's full name. |
| `customer_phone`| `VARCHAR(20)` | The customer's phone number. |
| `customer_email`| `VARCHAR(255)` | The customer's email address. |
| `delivery_method` | `ENUM('delivery', 'pickup')` | Whether the order is for delivery or pickup. |
| `delivery_address`| `TEXT` | The full delivery address. Null if pickup. |
| `pickup_location` | `VARCHAR(255)` | The selected pickup location. Null if delivery. |
| `delivery_date`| `DATE` | The customer's preferred delivery/pickup date. |
| `special_instructions` | `TEXT` | Any special notes from the customer. |
| `total_price`| `DECIMAL(10, 2)`| The total cost of the entire order. |
| `deposit_amount`| `DECIMAL(10, 2)`| The 80% deposit amount paid. |
| `payment_status`| `ENUM('pending', 'paid')` | The current payment status. |
| `order_status`| `ENUM('processing', 'complete', 'cancelled')` | The current status of the order preparation. |
| `created_at` | `TIMESTAMP` | When the record was created. |

---

**4. `order_items` Table**
A line item in an order. Connects an order to the cakes that were purchased.

| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `INT` | **Primary Key.** Auto-incrementing unique identifier. |
| `order_id` | `INT` | **Foreign Key** to the `orders.id` table. |
| `cake_id` | `VARCHAR(255)` | **Foreign Key** to the `cakes.id` table (even for custom cakes). |
| `quantity` | `INT` | The number of this specific cake item ordered. |
| `price` | `DECIMAL(10, 2)`| The final price for this single item, including customizations. |
| `customizations_json` | `JSON` | A JSON object storing the selected customizations (flavor, size, color, toppings). |

---

### Customization Option Tables

These tables store the available choices for building a custom cake.

**5. `customization_flavors`**
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **Primary Key.** Unique identifier (e.g., 'f1', 'f2'). |
| `name` | `VARCHAR(255)` | Flavor name (e.g., 'Rich Chocolate'). |
| `price` | `DECIMAL(10, 2)`| Additional cost for this flavor. |

**6. `customization_sizes`**
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **Primary Key.** Unique identifier (e.g., 's1', 's2'). |
| `name` | `VARCHAR(255)` | Size name (e.g., '8" Round'). |
| `serves` | `VARCHAR(255)` | Estimated number of servings. |
| `price` | `DECIMAL(10, 2)`| Additional cost for this size. |

**7. `customization_colors`**
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **Primary Key.** Unique identifier (e.g., 'c1', 'c2'). |
| `name` | `VARCHAR(255)` | Color name (e.g., 'Pastel Pink'). |
| `hex_value` | `VARCHAR(7)` | The hex code for the color (e.g., '#FFCDD2'). |
| `price` | `DECIMAL(10, 2)`| Additional cost for this color. |

**8. `customization_toppings`**
| Column Name | Data Type | Description |
| :--- | :--- | :--- |
| `id` | `VARCHAR(255)` | **Primary Key.** Unique identifier (e.g., 't1', 't2'). |
| `name` | `VARCHAR(255)` | Topping name (e.g., 'Fresh Berries'). |
| `price` | `DECIMAL(10, 2)`| Additional cost for this topping. |


## 6. Local Development Setup

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

### c. Standard Installation

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
