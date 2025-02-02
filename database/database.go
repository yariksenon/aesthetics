package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq" // Import PostgreSQL driver
)

func InitDB(user, password, host, port, dbname string) (*sql.DB, error) {
	dsn := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=disable", user, password, host, port, dbname)
	db, err := sql.Open("postgres", dsn)

	if err != nil {
		return nil, fmt.Errorf("can't connect to database: %w", err)
	}

	err = db.Ping()
	if err != nil {
		return nil, fmt.Errorf("unable to ping database: %w", err)
	}

	log.Println("Connected to database")
	return db, nil
}

func InitSchema(db *sql.DB) error {
	query := `
	-- Таблица пользователей
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR,
    last_name VARCHAR,
    username VARCHAR NOT NULL UNIQUE,
    email VARCHAR NOT NULL UNIQUE,
    subscribe BOOLEAN NOT NULL DEFAULT FALSE,
    password VARCHAR,
    phone VARCHAR,
    role VARCHAR DEFAULT 'customer',
    created_at TIMESTAMP
);

-- Таблица адресов пользователей
CREATE TABLE IF NOT EXISTS user_address (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    address_line VARCHAR,
    country VARCHAR,
    city VARCHAR,
    postal_code VARCHAR,
    created_at TIMESTAMP
);

-- Таблица категорий
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Таблица подкатегорий
CREATE TABLE IF NOT EXISTS sub_category (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES category(id),
    name VARCHAR,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    name VARCHAR,
    description VARCHAR,
    summary VARCHAR,
    sub_category_id INTEGER REFERENCES sub_category(id),
    color VARCHAR,
    size VARCHAR,
    sku VARCHAR UNIQUE,
    price NUMERIC,
    quantity INTEGER,
    created_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Таблица списка желаний
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    product_id INTEGER REFERENCES product(id),
    created_at TIMESTAMP,
    deleted_at TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Таблица корзины
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    total DECIMAL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Таблица элементов корзины
CREATE TABLE IF NOT EXISTS cart_item (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart(id),
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Таблица деталей заказа
CREATE TABLE IF NOT EXISTS order_detail (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES "user"(id),
    payment_id INTEGER,
    total DECIMAL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Таблица элементов заказа
CREATE TABLE IF NOT EXISTS order_item (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES order_detail(id),
    product_id INTEGER REFERENCES product(id),
    quantity INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Таблица деталей платежа
CREATE TABLE IF NOT EXISTS payment_detail (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES order_detail(id),
    amount DECIMAL,
    provider VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP
);
	`
	_, err := db.Exec(query)
	if err != nil {
		return fmt.Errorf("can't create user address: %w", err)
	}
	log.Println("Database schema initialized successfully")
	return nil
}
