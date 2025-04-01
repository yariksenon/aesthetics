INSERT INTO users (username, email, password, phone, role, created_at)
VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;