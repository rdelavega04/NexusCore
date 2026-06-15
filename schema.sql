-- ==========================================
-- 1. SCHEMA DEFINITION & CLEANUP
-- ==========================================
-- Drops the table if it exists to allow a clean slate on setup re-runs
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_number VARCHAR(50) NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state CHARACTER(2),
    zipcode VARCHAR(10),
    email TEXT NOT NULL
);

-- ==========================================
-- 2. ENTERPRISE DATA SEEDING (1,000,000 ROWS)
-- ==========================================
-- Uses high-performance generate_series to build scale instantly
INSERT INTO customers (customer_number, first_name, last_name, address, city, state, zipcode, email)
SELECT 
    'CUST-' || LPAD(s.id::text, 7, '0') AS customer_number,
    (ARRAY['John', 'Jane', 'Michael', 'Emily', 'Robert', 'Martha', 'David', 'Sarah', 'James', 'Maria', 'Francisco', 'William', 'Jessica', 'Brian', 'Amanda'])[floor(random() * 15 + 1)] AS first_name,
    (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'De La Vega', 'Orozco'])[floor(random() * 17 + 1)] AS last_name,
    (floor(random() * 9999 + 1))::text || ' ' || (ARRAY['Main St', 'Oak Ave', 'Pine Rd', 'Maple Dr', 'Cedar Ln', 'View Way', 'Washington Blvd'])[floor(random() * 7 + 1)] AS address,
    (ARRAY['Clinton', 'Salt Lake City', 'Draper', 'Ogden', 'Houston', 'Dallas', 'Austin', 'Denver', 'Phoenix', 'Seattle', 'Chicago', 'New York'])[floor(random() * 12 + 1)] AS city,
    (ARRAY['UT', 'TX', 'CO', 'AZ', 'WA', 'IL', 'NY', 'CA', 'FL', 'NV'])[floor(random() * 10 + 1)] AS state,
    LPAD(floor(random() * 90000 + 10000)::text, 5, '0') AS zipcode,
    'user' || s.id || '@example.com' AS email
FROM generate_series(1, 1000000) AS s(id);

-- ==========================================
-- 3. PERFORMANCE OPTIMIZATION INDEXES
-- ==========================================
-- Created to optimize O(log n) searches on last_name filter queries
CREATE INDEX IX_customers_last_name ON customers(last_name);