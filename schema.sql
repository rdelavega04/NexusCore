-- 1. Create the Customers Table
CREATE TABLE customers (
    customer_id SERIAL PRIMARY KEY,
    customer_number VARCHAR(20) UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state CHAR(2),
    zipcode VARCHAR(10),
    email TEXT UNIQUE
);

-- 2. Seed with 500 Random Customers
INSERT INTO customers (customer_number, first_name, last_name, address, city, state, zipcode, email)
SELECT 
    'CUST-' || (1000 + i), 
    (ARRAY['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth'])[floor(random() * 10 + 1)], 
    (ARRAY['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'])[floor(random() * 10 + 1)], 
    (floor(random() * 9000 + 100)) || ' ' || (ARRAY['Main St', 'Oak Ave', 'Cedar Rd', 'Lake View Dr', 'Park Way'])[floor(random() * 5 + 1)], 
    (ARRAY['Salt Lake City', 'Clinton', 'Ogden', 'Layton', 'Clearfield'])[floor(random() * 5 + 1)], 
    'UT', 
    (floor(random() * 90000 + 10000))::text, 
    'user' || i || '@example.com' 
FROM generate_series(1, 500) s(i);