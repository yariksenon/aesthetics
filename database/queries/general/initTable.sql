-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    subscription BOOLEAN DEFAULT FALSE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(50) DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'seller', 'manager')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица категорий
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100)
);

-- Таблица подкатегорий
CREATE TABLE IF NOT EXISTS sub_category (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES category(id),
    name VARCHAR(100) 
);

-- Таблица адресов пользователей
CREATE TABLE IF NOT EXISTS user_address (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_line VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    summary VARCHAR(255),
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    sub_category_id INTEGER REFERENCES sub_category(id) ON DELETE SET NULL,
    color VARCHAR(50),
    size VARCHAR(50),
    sku VARCHAR(100)  NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    quantity SMALLINT DEFAULT 0 CHECK (quantity >= 0),
    currency VARCHAR(10),
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица списка желаний
CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE
);

-- Таблица корзины
CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

-- Таблица элементов корзины
CREATE TABLE IF NOT EXISTS cart_item (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    quantity SMALLINT DEFAULT 1 CHECK (quantity > 0)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_provider VARCHAR(100),
    payment_status VARCHAR(50) CHECK (payment_status IN ('pending', 'completed', 'failed')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Таблица элементов заказа
CREATE TABLE IF NOT EXISTS order_item (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE SET NULL,
    quantity SMALLINT DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для ускорения работы
CREATE INDEX IF NOT EXISTS idx_user_address_user_id ON user_address(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_order_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_item_order_id ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_product_sku ON product(sku);
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id);