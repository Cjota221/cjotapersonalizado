-- Schema do banco de dados SQLite
-- Sistema de Catálogo Personalizado por Revendedora

-- Tabela de usuários (revendedoras)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de lojas (uma por revendedora)
CREATE TABLE IF NOT EXISTS stores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  logo_url TEXT,
  colors TEXT,  -- JSON: {"primary":"#123456","button":"#ff0033","background":"#fff"}
  theme_settings TEXT,  -- JSON: {"card_border":"rounded","button_shape":"pill"}
  loja_configurada INTEGER DEFAULT 0,  -- 0 = false, 1 = true
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Tabela de produtos (base central da fábrica)
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  images TEXT,  -- JSON: array de URLs
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de variações dos produtos (numeração/grade)
CREATE TABLE IF NOT EXISTS product_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  variant_sku TEXT,
  size TEXT,  -- ex: "P","M","G","36","38"
  color TEXT,
  stock INTEGER DEFAULT 0,
  price_cents INTEGER,  -- preço em centavos
  active INTEGER DEFAULT 1,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabela de vinculação produto ↔ revendedora
CREATE TABLE IF NOT EXISTS reseller_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  active INTEGER DEFAULT 1,
  price_cents_override INTEGER,  -- NULL = usar preço base
  margin_percent REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  UNIQUE(store_id, product_id)
);

-- Tabela de pré-pedidos (enviados via WhatsApp)
CREATE TABLE IF NOT EXISTS pre_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_city TEXT,
  customer_state TEXT,
  items TEXT NOT NULL,  -- JSON: array de itens
  note TEXT,
  whatsapp_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending, contacted, confirmed, cancelled
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reseller_products_store ON reseller_products(store_id);
CREATE INDEX IF NOT EXISTS idx_reseller_products_product ON reseller_products(product_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_store ON pre_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_status ON pre_orders(status);
