-- 1. Сначала создаём таблицы без внешних ключей
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

-- 2. Создаём таблицу категорий (должна быть создана перед product)
CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(20)
);

-- 3. Создаём таблицу подкатегорий (зависит от category)
CREATE TABLE IF NOT EXISTS sub_category (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES category(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

-- 4. Создаём таблицу типов размеров (должна быть перед sizes и product)
CREATE TABLE IF NOT EXISTS size_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- 5. Создаём таблицу размеров
CREATE TABLE IF NOT EXISTS sizes (
    id SERIAL PRIMARY KEY,
    size_type_id INTEGER REFERENCES size_types(id) ON DELETE CASCADE,
    value VARCHAR(20) NOT NULL,
    description VARCHAR(100),
    CONSTRAINT unique_size_per_type UNIQUE (size_type_id, value)
);

CREATE TABLE IF NOT EXISTS brand (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    website VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP
);

-- 6. Теперь создаём таблицу товаров (зависит от category, sub_category, size_types)
CREATE TABLE IF NOT EXISTS product (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    summary VARCHAR(255),
    category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
    sub_category_id INTEGER REFERENCES sub_category(id) ON DELETE SET NULL,
    color VARCHAR(50),
    sku VARCHAR(100) NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    gender VARCHAR(20),
    brand_id INTEGER REFERENCES brand(id) ON DELETE SET NULL,
    image_path VARCHAR(255),
    size_type_id INTEGER REFERENCES size_types(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    image_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    alt_text VARCHAR(255),
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Остальные таблицы с зависимостями
CREATE TABLE IF NOT EXISTS product_sizes (
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    size_id INTEGER REFERENCES sizes(id) ON DELETE CASCADE,
    quantity SMALLINT DEFAULT 0 CHECK (quantity >= 0),
    PRIMARY KEY (product_id, size_id)
);

CREATE TABLE IF NOT EXISTS user_address (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    address_line VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_item (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    size_id INTEGER REFERENCES sizes(id) ON DELETE SET NULL,
    quantity SMALLINT DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    total DECIMAL(10, 2) NOT NULL,
    payment_provider VARCHAR(100),
    address VARCHAR(255),
    city VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_item (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES product(id) ON DELETE SET NULL,
    size_id INTEGER REFERENCES sizes(id) ON DELETE SET NULL,
    quantity SMALLINT DEFAULT 1 CHECK (quantity > 0),
    price_at_purchase NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL REFERENCES product(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES product(id)
);


-- 8. Создаём индексы после создания всех таблиц
CREATE INDEX IF NOT EXISTS idx_user_address_user_id ON user_address(user_id);
CREATE INDEX IF NOT EXISTS idx_product_category ON product(category_id);
CREATE INDEX IF NOT EXISTS idx_product_subcategory ON product(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_product_size_type ON product(size_type_id);
CREATE INDEX IF NOT EXISTS idx_product_sku ON product(sku);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product ON product_sizes(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sizes_size ON product_sizes(size_id);
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_item_product ON cart_item(product_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_user_product ON wishlist(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_item(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
