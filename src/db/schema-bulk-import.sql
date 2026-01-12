-- ====================================
-- SCHEMA: CADASTRO EM MASSA DE PRODUTOS
-- Sistema de Pedidos por Encomenda - CJota
-- ====================================

-- Tabela de processos de importação em massa
CREATE TABLE IF NOT EXISTS bulk_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'aguardando_processamento', -- aguardando_processamento, processando, agrupamento, revisao, concluido, erro
  total_files INTEGER DEFAULT 0,
  total_products_generated INTEGER DEFAULT 0,
  default_settings TEXT, -- JSON: {"price_cents": 5000, "stock": 10, "category": "Novidades"}
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabela de produtos rascunho (pré-cadastro)
CREATE TABLE IF NOT EXISTS draft_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bulk_import_id INTEGER NOT NULL,
  group_key TEXT NOT NULL, -- Chave de agrupamento (ex: "produto-azul", "vestido-01")
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price_cents INTEGER,
  stock_quantity INTEGER,
  category TEXT,
  tags TEXT, -- JSON array
  status TEXT DEFAULT 'rascunho', -- rascunho, pronto_para_criar, criado, erro
  raw_data TEXT, -- JSON: informações extras do processamento
  main_image_id INTEGER, -- ID da imagem principal
  created_product_id INTEGER, -- ID do produto criado na tabela products
  error_message TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bulk_import_id) REFERENCES bulk_imports(id) ON DELETE CASCADE,
  FOREIGN KEY (main_image_id) REFERENCES draft_images(id)
);

-- Tabela de imagens dos rascunhos
CREATE TABLE IF NOT EXISTS draft_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_product_id INTEGER NOT NULL,
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT,
  file_size INTEGER,
  mime_type TEXT,
  is_main INTEGER DEFAULT 0, -- 0 = não, 1 = sim (imagem principal)
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_product_id) REFERENCES draft_products(id) ON DELETE CASCADE
);

-- Tabela de variações dos rascunhos (tamanhos/cores)
CREATE TABLE IF NOT EXISTS draft_variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  draft_product_id INTEGER NOT NULL,
  size TEXT,
  color TEXT,
  stock INTEGER DEFAULT 0,
  price_cents INTEGER,
  sku TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (draft_product_id) REFERENCES draft_products(id) ON DELETE CASCADE
);

-- Índices para otimização
CREATE INDEX IF NOT EXISTS idx_bulk_imports_store ON bulk_imports(store_id);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_status ON bulk_imports(status);
CREATE INDEX IF NOT EXISTS idx_draft_products_import ON draft_products(bulk_import_id);
CREATE INDEX IF NOT EXISTS idx_draft_products_status ON draft_products(status);
CREATE INDEX IF NOT EXISTS idx_draft_products_group ON draft_products(group_key);
CREATE INDEX IF NOT EXISTS idx_draft_images_product ON draft_images(draft_product_id);
CREATE INDEX IF NOT EXISTS idx_draft_variants_product ON draft_variants(draft_product_id);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_bulk_imports_timestamp 
AFTER UPDATE ON bulk_imports
FOR EACH ROW
BEGIN
  UPDATE bulk_imports SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_draft_products_timestamp 
AFTER UPDATE ON draft_products
FOR EACH ROW
BEGIN
  UPDATE draft_products SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
