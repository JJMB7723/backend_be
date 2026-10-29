-- ============================================
-- Migration: 001_create_tables.sql
-- Purpose: Create all 8 tables for the B2B Hardware Management system
-- 
-- IMPORTANT: Tables are created in a specific order because some tables
-- reference other tables (foreign keys). The referenced table must exist first.
--
-- Order of creation:
--   1. customers   (no dependencies)
--   2. products    (no dependencies)
--   3. carts       (depends on: customers)
--   4. cart_items   (depends on: carts, products)
--   5. orders      (depends on: customers)
--   6. order_items  (depends on: orders, products)
--   7. manufacturing_jobs (depends on: products)
--   8. deliveries   (depends on: orders)
-- ============================================


-- ============================================
-- TABLE 1: customers
-- Purpose: Stores registered customer accounts for login/authentication
--
-- Why do we need this?
-- Customers need to register and log in to use the cart and place orders.
-- We store their email and a hashed (encrypted) version of their password.
-- We NEVER store plain-text passwords.
-- ============================================

CREATE TABLE IF NOT EXISTS customers (
    -- "id" is the primary key. SERIAL means PostgreSQL automatically
    -- assigns a unique number (1, 2, 3, ...) to each new customer.
    -- PRIMARY KEY means this column uniquely identifies each row.
    id SERIAL PRIMARY KEY,

    -- The customer's full name. VARCHAR(100) means text up to 100 characters.
    -- NOT NULL means this field is required — you cannot leave it empty.
    name VARCHAR(100) NOT NULL,

    -- The customer's email address. Must be unique — no two customers
    -- can register with the same email. This is used for login.
    email VARCHAR(150) NOT NULL UNIQUE,

    -- The hashed password. VARCHAR(255) gives enough room for the hash.
    -- We NEVER store the actual password — only the encrypted version.
    password VARCHAR(255) NOT NULL,

    -- Automatically records when the customer registered.
    -- DEFAULT NOW() means PostgreSQL fills this in automatically
    -- with the current date and time.
    created_at TIMESTAMP DEFAULT NOW()
);


-- ============================================
-- TABLE 2: products
-- Purpose: Stores the hardware products that can be sold
--
-- Examples: RAM, Motherboard, SSD, Power Supply, etc.
-- Each product has a name, description, price, and stock quantity.
-- ============================================

CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,

    -- The product name. Example: "DDR5 RAM 16GB"
    name VARCHAR(150) NOT NULL,

    -- A longer description of the product. TEXT allows unlimited length.
    description TEXT,

    -- The price of one unit. DECIMAL(10, 2) means:
    --   - Up to 10 digits total
    --   - 2 digits after the decimal point
    --   - Example: 12345678.99
    -- CHECK (price >= 0) prevents negative prices.
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),

    -- How many units are currently in stock.
    -- CHECK (stock_quantity >= 0) prevents negative stock.
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),

    created_at TIMESTAMP DEFAULT NOW()
);


-- ============================================
-- TABLE 3: carts
-- Purpose: Each customer has one shopping cart
--
-- Why a separate table?
-- The cart holds a reference to which customer owns it.
-- The actual items in the cart are stored in the "cart_items" table.
-- This is like a shopping cart in an online store — the cart itself
-- is a container, and the items are what's inside it.
-- ============================================

CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,

    -- Which customer owns this cart.
    -- This is a FOREIGN KEY — it points to the "id" column in the "customers" table.
    -- Think of it like a link: "This cart belongs to customer #5."
    --
    -- UNIQUE means each customer can have only ONE cart.
    -- If we didn't add UNIQUE, a customer could accidentally have multiple carts.
    customer_id INTEGER NOT NULL UNIQUE,

    created_at TIMESTAMP DEFAULT NOW(),

    -- FOREIGN KEY tells PostgreSQL: "The customer_id value MUST exist
    -- in the customers table." If you try to create a cart for customer #999
    -- and there is no customer #999, PostgreSQL will reject it.
    --
    -- ON DELETE CASCADE means: "If a customer is deleted, automatically
    -- delete their cart too." This prevents orphan carts.
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);


-- ============================================
-- TABLE 4: cart_items
-- Purpose: Stores each product inside a customer's cart
--
-- Why a separate table from "carts"?
-- A cart can have MANY products. If we tried to put all items inside
-- the carts table, we'd need columns like product1, product2, product3...
-- That doesn't work because we don't know how many items a customer will add.
--
-- Instead, each row in cart_items represents ONE product in ONE cart.
-- Example:
--   cart_items row 1: cart #1, product #3 (RAM), quantity 2
--   cart_items row 2: cart #1, product #7 (SSD), quantity 1
-- ============================================

CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,

    -- Which cart this item belongs to
    cart_id INTEGER NOT NULL,

    -- Which product was added
    product_id INTEGER NOT NULL,

    -- How many units of this product. Must be at least 1.
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- Foreign keys: both cart and product must exist
    FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- ============================================
-- TABLE 5: orders
-- Purpose: Stores completed orders placed by customers
--
-- When a customer checks out their cart, an order is created.
-- The order stores who ordered, the total cost, and the current status.
--
-- Status values:
--   'pending'    → Order just created, waiting to be processed
--   'confirmed'  → Order has been confirmed
--   'shipped'    → Products have been shipped
--   'delivered'  → Customer received the products
--   'cancelled'  → Order was cancelled
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,

    -- Which customer placed this order
    customer_id INTEGER NOT NULL,

    -- The customer's name is stored directly for easy display.
    -- Even if the customer changes their name later, the order
    -- keeps the name from when it was placed.
    customer_name VARCHAR(100) NOT NULL,

    -- Total cost of all items in the order.
    -- This is calculated by the SERVER, never trusted from the client.
    total_amount DECIMAL(10, 2) NOT NULL CHECK (total_amount >= 0),

    -- Current status of the order. Defaults to 'pending'.
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);


-- ============================================
-- TABLE 6: order_items
-- Purpose: Stores each product inside an order
--
-- Same idea as cart_items, but for orders.
-- Once an order is created, these items are permanent records
-- of what was purchased and at what price.
--
-- Why store unit_price here?
-- Product prices can change over time. If a RAM stick costs $50 today
-- and $60 next month, we need to remember that THIS order bought it at $50.
-- That's why we copy the price at the time of purchase.
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,

    -- Which order this item belongs to
    order_id INTEGER NOT NULL,

    -- Which product was ordered
    product_id INTEGER NOT NULL,

    -- How many units were ordered
    quantity INTEGER NOT NULL CHECK (quantity > 0),

    -- Price per unit AT THE TIME OF ORDERING
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),

    -- Subtotal = quantity * unit_price
    -- This is stored for convenience so we don't have to recalculate it.
    subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- ============================================
-- TABLE 7: manufacturing_jobs
-- Purpose: Track manufacturing/production jobs to create more stock
--
-- When stock is low, a manufacturing job is created to produce more units.
-- Example: "Manufacture 100 units of DDR5 RAM"
--
-- Status values:
--   'pending'      → Job created, not started yet
--   'in_progress'  → Currently being manufactured
--   'completed'    → Manufacturing finished, stock has been updated
--   'cancelled'    → Job was cancelled
--
-- Business rule: When a job is marked "completed", the completed_quantity
-- is added to the product's stock_quantity. This happens ONCE.
-- If someone tries to complete the same job again, the system rejects it.
-- ============================================

CREATE TABLE IF NOT EXISTS manufacturing_jobs (
    id SERIAL PRIMARY KEY,

    -- Which product is being manufactured
    product_id INTEGER NOT NULL,

    -- How many units we plan to manufacture
    planned_quantity INTEGER NOT NULL CHECK (planned_quantity > 0),

    -- How many units were actually completed
    -- Defaults to 0 (nothing completed yet)
    completed_quantity INTEGER NOT NULL DEFAULT 0 CHECK (completed_quantity >= 0),

    -- Current status of the job
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);


-- ============================================
-- TABLE 8: deliveries
-- Purpose: Track delivery/shipping for orders
--
-- After an order is confirmed, a delivery record is created
-- to track where it's going and whether it has arrived.
--
-- Status values:
--   'pending'   → Delivery created, not shipped yet
--   'shipped'   → Package is on its way
--   'delivered' → Package has been delivered to the customer
--
-- Business rule: Each order can have only ONE delivery.
-- The UNIQUE constraint on order_id prevents creating duplicate deliveries.
-- ============================================

CREATE TABLE IF NOT EXISTS deliveries (
    id SERIAL PRIMARY KEY,

    -- Which order this delivery is for.
    -- UNIQUE means each order can only have one delivery record.
    order_id INTEGER NOT NULL UNIQUE,

    -- Where to deliver the order
    delivery_address TEXT NOT NULL,

    -- Current delivery status
    status VARCHAR(20) NOT NULL DEFAULT 'pending',

    created_at TIMESTAMP DEFAULT NOW(),

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

