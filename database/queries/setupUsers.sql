INSERT INTO users (id, first_name, last_name, username, email, subscription, password, phone, role, created_at)
VALUES
    (1, 'admin', 'admin', 'admin', 'yariksen.exe@gmai.com', true, '040206', '1234567890', 'admin', CURRENT_TIMESTAMP),
    (2, 'user', 'user', 'user', 'user@gmail.com', true, '040206', '1234567890', 'customer', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
