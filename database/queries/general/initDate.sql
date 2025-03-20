INSERT INTO users (first_name, last_name, username, email, subscription, password, phone, role, created_at)
VALUES
    ('admin', 'admin', 'admin', 'yariksen.exe@gmai.com', 't', '040206', '1234567890', 'admin', CURRENT_TIMESTAMP),
    ('user', 'user', 'user', 'user@gmail.com', 't', '040206', '1234567890', 'customer', CURRENT_TIMESTAMP),
    ('manager', 'manager', 'manager', 'manager@gmail.com', 't', '040206', '1234567890', 'manager', CURRENT_TIMESTAMP),
    ('John', 'Doe', 'john_doe', 'john.doe@gmail.com', 't', 'password123', '1234567891', 'customer', CURRENT_TIMESTAMP),
    ('Jane', 'Smith', 'jane_smith', 'jane.smith@gmail.com', 'f', 'password456', '1234567892', 'customer', CURRENT_TIMESTAMP),
    ('Alice', 'Johnson', 'alice_j', 'alice.j@gmail.com', 't', 'password789', '1234567893', 'customer', CURRENT_TIMESTAMP),
    ('Bob', 'Brown', 'bob_brown', 'bob.brown@gmail.com', 'f', 'password101', '1234567894', 'customer', CURRENT_TIMESTAMP),
    ('Charlie', 'Davis', 'charlie_d', 'charlie.d@gmail.com', 't', 'password202', '1234567895', 'customer', CURRENT_TIMESTAMP),
    ('Eva', 'Green', 'eva_g', 'eva.g@gmail.com', 'f', 'password303', '1234567896', 'customer', CURRENT_TIMESTAMP),
    ('Frank', 'White', 'frank_w', 'frank.w@gmail.com', 't', 'password404', '1234567897', 'customer', CURRENT_TIMESTAMP),
    ('Grace', 'Black', 'grace_b', 'grace.b@gmail.com', 'f', 'password505', '1234567898', 'customer', CURRENT_TIMESTAMP)
ON CONFLICT (username)
DO NOTHING;