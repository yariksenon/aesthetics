INSERT INTO users (first_name, last_name, username, email, subscription, password, phone, role, created_at)
VALUES
    ('admin', 'admin', 'admin', 'yariksen.exe@gmai.com', TRUE, '040206', '+12025550173', 'admin', CURRENT_TIMESTAMP),
    ('user', 'user', 'user', 'user@gmail.com', TRUE, '040206', '+442079460958', 'customer', CURRENT_TIMESTAMP),
    ('manager', 'manager', 'manager', 'manager@gmail.com', TRUE, '040206', '+14165550841', 'manager', CURRENT_TIMESTAMP),
    ('John', 'Doe', 'john_doe', 'john.doe@gmail.com', TRUE, 'password123', '+61298765432', 'customer', CURRENT_TIMESTAMP),
    ('Jane', 'Smith', 'jane_smith', 'jane.smith@gmail.com', FALSE, 'password456', '+49301234567', 'customer', CURRENT_TIMESTAMP),
    ('Alice', 'Johnson', 'alice_j', 'alice.j@gmail.com', TRUE, 'password789', '+74232497777', 'customer', CURRENT_TIMESTAMP),
    ('Bob', 'Brown', 'bob_brown', 'bob.brown@gmail.com', FALSE, 'password101', '+81312345678', 'customer', CURRENT_TIMESTAMP),
    ('Charlie', 'Davis', 'charlie_d', 'charlie.d@gmail.com', TRUE, 'password202', '+375291325538', 'customer', CURRENT_TIMESTAMP),
    ('Eva', 'Green', 'eva_g', 'eva.g@gmail.com', FALSE, 'password303', '+912212345678', 'customer', CURRENT_TIMESTAMP),
    ('Frank', 'White', 'frank_w', 'frank.w@gmail.com', TRUE, 'password404', '+27111234567', 'customer', CURRENT_TIMESTAMP),
    ('Grace', 'Black', 'grace_b', 'grace.b@gmail.com', FALSE, 'password505', '+390612345678', 'customer', CURRENT_TIMESTAMP)
    ON CONFLICT (username)
DO NOTHING;
