# WhiskeDelights: Application Documentation

Welcome to the full technical documentation for the WhiskeDelights web application. This document provides a comprehensive overview of the technologies used, the core design principles applied, and the project's file structure. This version of the application operates on mock data for frontend development and prototyping.

## 1. Technology Stack

-   **Next.js**: A React framework that provides a production-ready foundation. We use its App Router for file-based routing and Server Components for performance.
-   **React**: The core library for building the user interface. The entire application is composed of interactive and reusable React components.
-   **TypeScript**: A typed superset of JavaScript that enhances code quality, improves maintainability, and provides excellent editor support.
-   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom user interfaces. It's used for all styling in the application.
-   **ShadCN/UI**: A collection of beautifully designed, accessible, and reusable UI components built on top of Radix UI and Tailwind CSS.
-   **OpenStreetMap (Nominatim)**: Integrated for an intelligent address search with autocomplete.
-   **Paystack**: A payment gateway integrated for processing M-Pesa payments securely.

## 2. Design Principles & Architecture

The application is structured following modern software design principles to ensure it is clean, scalable, and easy to maintain.

### a. Component-Based Architecture

The UI is broken down into small, reusable components located in `src/components`.
-   **Presentational Components**: Most components are "dumb" and focus on rendering UI based on the props they receive.
-   **Container Components**: Page-level components (`src/app/page.tsx`) act as containers that manage state and pass it down.

### b. Separation of Concerns

-   **UI (`src/components`, `src/app`):** Responsible for presentation and user interaction.
-   **State Management (`src/hooks`):**
    -   `useCart`: Manages the global shopping cart state and persists it to `localStorage`.
    -   `useCakeData`: Manages the fetching and loading state of all mock cake data.
-   **Data Fetching (`src/services`):** The `cake-service.ts` file abstracts the data source. Currently, it retrieves data from the mock data file (`src/lib/data.ts`).
-   **Server-Side Logic (`src/lib/actions.ts`):** Next.js Server Actions are used to simulate backend operations like placing an order.

### c. Admin Panel Architecture (Prototype)

The admin panel is a client-side application that simulates data management.
-   **Authentication**: It uses `localStorage` to persist the admin's login state for local development.
-   **Data Management**: The admin panel reads from the mock data files (`src/lib/data.ts`). Actions like "Create," "Update," and "Delete" are simulated and show toast notifications, but do not permanently alter the mock data as it is read-only.

## 3. File-by-File Breakdown

-   `src/app/`: Contains all routing, pages, and layouts.
    -   `checkout/page.tsx`: A responsive, single-page checkout flow.
    -   `admin/`: Contains the prototype admin panel.
        -   `login/page.tsx`: The mock login page.
        -   `(protected)/...`: The protected admin pages.
-   `src/components/`: Contains all UI components.
    -   `cake-paradise/`: Custom components for this application.
    -   `ui/`: ShadCN/UI components.
-   `src/hooks/`: Contains custom React hooks for shared logic.
-   `src/lib/`:
    -   `actions.ts`: Contains mock Server Actions.
    -   `data.ts`: **(Mock Backend)** This file contains all the mock data for the application.
    -   `types.ts`: Contains all TypeScript type definitions.
-   `src/services/`:
    -   `cake-service.ts`: This service abstracts data fetching from the mock data file.

## 4. The Admin Panel (Prototype)

The application includes a comprehensive admin panel for demonstrating management functionality.

### a. Functionality

-   **Dashboard**: View key metrics based on mock data.
-   **Order Management**: View a list of mock orders.
-   **Cake Management**: View and manage available cakes.
-   **Offer Management**: Update the daily special offer.
-   **Customization Management**: Manage cake customization options.

**Note:** All data management in the admin panel is a simulation. Changes are not persisted.

### b. How to Access and Log In

1.  Navigate to the site's footer and click the "Admin Panel" link, or go directly to `/admin/login`.
2.  Use the following credentials:
    -   **Email**: `admin@whiskedelights.com`
    -   **Password**: `admin`

## 5. Local Development Setup

Follow these instructions to get the application running on your local machine.

### a. Prerequisites

- **Node.js**: Version 20.x or higher.
- **npm**: A Node.js package manager (v10+).
- **Docker**: (Optional) For a consistent, containerized environment.

### b. Environment Variables

1.  Create a file named `.env` in the root of the project.
2.  Add the following lines, replacing placeholders with your keys:

    ```
    # Your public key from the Paystack dashboard (required for payments)
    NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
    
    # Your WhatsApp number including country code (e.g., 254712345678)
    NEXT_PUBLIC_OWNER_WHATSAPP_NUMBER=2547xxxxxxxx
    ```

### c. Running with Docker

This is the recommended way to run the application.

1.  **Build and run the container:**
    Make sure Docker Desktop is running. Then, from the project root, run:
    ```bash
    docker-compose up --build
    ```
2.  **Access the application:**
    The application will be available at `http://localhost:3000`.
