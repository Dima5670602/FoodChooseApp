-- ============================================
-- FOODCHOOSEAPP — Schéma complet v2.0
-- ============================================

CREATE TABLE IF NOT EXISTS companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  sector VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  email VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS restaurants (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  location VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50),
  payment_types JSONB DEFAULT '[]',
  specialties JSONB DEFAULT '[]',
  password_hash VARCHAR(255) NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliations (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, restaurant_id)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  employee_id VARCHAR(100) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  photo_url TEXT,
  drink_preference VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menus (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'plat',
  price DECIMAL(10,2) DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  menu_id INTEGER REFERENCES menus(id),
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  drink_preference VARCHAR(20),
  status VARCHAR(30) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id, order_date)
);

CREATE TABLE IF NOT EXISTS order_batches (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  batch_date DATE NOT NULL,
  status VARCHAR(30) DEFAULT 'pending',
  total_amount DECIMAL(10,2) DEFAULT 0,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(company_id, restaurant_id, batch_date)
);

CREATE TABLE IF NOT EXISTS invoices (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  batch_id INTEGER REFERENCES order_batches(id),
  invoice_date DATE DEFAULT CURRENT_DATE,
  total_amount DECIMAL(10,2),
  items JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  company_id INTEGER REFERENCES companies(id),
  employee_id VARCHAR(100),
  employee_name VARCHAR(255),
  restaurant_name VARCHAR(255),
  menu_name VARCHAR(255),
  order_date DATE,
  drink_preference VARCHAR(20),
  action VARCHAR(50),
  action_timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  sender_type VARCHAR(20) NOT NULL,
  sender_id INTEGER NOT NULL,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  restaurant_id INTEGER REFERENCES restaurants(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_by_company BOOLEAN DEFAULT FALSE,
  read_by_restaurant BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  target_type VARCHAR(20) NOT NULL,
  target_id INTEGER NOT NULL,
  title VARCHAR(255),
  message TEXT,
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  menu_id INTEGER REFERENCES menus(id),
  restaurant_id INTEGER REFERENCES restaurants(id),
  score INTEGER CHECK (score BETWEEN 1 AND 5),
  comment TEXT,
  order_date DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, menu_id, order_date)
);

CREATE TABLE IF NOT EXISTS deletion_feedback (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER,
  reason TEXT,
  experience VARCHAR(100),
  issue TEXT,
  confirmed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_date ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_menus_restaurant ON menus(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(company_id, restaurant_id);
CREATE INDEX IF NOT EXISTS idx_notif_target ON notifications(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_history_date ON order_history(order_date);
