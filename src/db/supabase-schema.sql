-- =====================================================
-- SCHEMA COMPLETO PARA SUPABASE (PostgreSQL)
-- Sistema de Catálogo Personalizado por Revendedora
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- =====================================================
-- 1. TABELAS PRINCIPAIS DO SISTEMA
-- =====================================================

-- Tabela de usuários (revendedoras)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de lojas (uma por revendedora)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  store_name TEXT NOT NULL,
  logo_url TEXT,
  colors JSONB,  -- {"primary":"#123456","button":"#ff0033","background":"#fff"}
  theme_settings JSONB,  -- {"card_border":"rounded","button_shape":"pill"}
  loja_configurada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos (base central)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sku TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  images JSONB,  -- array de URLs: ["url1", "url2"]
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de variações dos produtos (numeração/grade)
CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_sku TEXT,
  size TEXT,  -- ex: "P","M","G","36","38"
  color TEXT,
  stock INTEGER DEFAULT 0,
  price_cents INTEGER,  -- preço em centavos
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de vinculação produto ↔ revendedora
CREATE TABLE IF NOT EXISTS reseller_products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  active BOOLEAN DEFAULT TRUE,
  price_cents_override INTEGER,  -- NULL = usar preço base
  margin_percent DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(store_id, product_id)
);

-- Tabela de pré-pedidos (enviados via WhatsApp)
CREATE TABLE IF NOT EXISTS pre_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_whatsapp TEXT NOT NULL,
  customer_city TEXT,
  customer_state TEXT,
  items JSONB NOT NULL,  -- array de itens
  note TEXT,
  whatsapp_message TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS DE PERSONALIZAÇÃO DO SITE
-- =====================================================

-- Configurações globais do site
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'CJota Catálogo',
  site_description TEXT,
  logo_url TEXT,
  whatsapp_number TEXT,
  email TEXT,
  color_primary TEXT DEFAULT '#1a1a1a',
  color_secondary TEXT DEFAULT '#4a5568',
  color_accent TEXT DEFAULT '#3b82f6',
  color_success TEXT DEFAULT '#10b981',
  color_warning TEXT DEFAULT '#f59e0b',
  color_error TEXT DEFAULT '#ef4444',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Banners do site
CREATE TABLE IF NOT EXISTS site_banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT,
  link_url TEXT,
  button_text TEXT,
  order_position INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELAS DO MÓDULO DE CADASTRO EM MASSA
-- =====================================================

-- Processo de importação em massa
CREATE TABLE IF NOT EXISTS bulk_import_processes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'uploading' CHECK (status IN ('uploading', 'processing', 'grouping', 'settings', 'reviewing', 'completed', 'error')),
  total_files INTEGER DEFAULT 0,
  total_products_generated INTEGER DEFAULT 0,
  error_message TEXT,
  metadata JSONB,  -- dados extras do processo
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rascunhos de produtos da importação
CREATE TABLE IF NOT EXISTS bulk_import_product_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  import_process_id UUID NOT NULL REFERENCES bulk_import_processes(id) ON DELETE CASCADE,
  group_key TEXT,  -- chave para agrupar imagens do mesmo produto
  name TEXT NOT NULL,
  description TEXT,
  sku TEXT,
  price_cents INTEGER,
  stock_quantity INTEGER,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'ready', 'error', 'created')),
  error_message TEXT,
  raw_data JSONB,  -- dados brutos do processamento
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Imagens dos rascunhos
CREATE TABLE IF NOT EXISTS bulk_import_draft_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_id UUID NOT NULL REFERENCES bulk_import_product_drafts(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  is_main BOOLEAN DEFAULT FALSE,
  url TEXT NOT NULL,
  order_position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_stores_slug ON stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_reseller_products_store ON reseller_products(store_id);
CREATE INDEX IF NOT EXISTS idx_reseller_products_product ON reseller_products(product_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_store ON pre_orders(store_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_status ON pre_orders(status);
CREATE INDEX IF NOT EXISTS idx_bulk_import_process_store ON bulk_import_processes(store_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_drafts_process ON bulk_import_product_drafts(import_process_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_images_draft ON bulk_import_draft_images(draft_id);

-- =====================================================
-- 5. TRIGGERS PARA UPDATED_AT AUTOMÁTICO
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stores_updated_at BEFORE UPDATE ON stores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reseller_products_updated_at BEFORE UPDATE ON reseller_products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pre_orders_updated_at BEFORE UPDATE ON pre_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_banners_updated_at BEFORE UPDATE ON site_banners
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_import_processes_updated_at BEFORE UPDATE ON bulk_import_processes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bulk_import_product_drafts_updated_at BEFORE UPDATE ON bulk_import_product_drafts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) - SEGURANÇA
-- =====================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE reseller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_product_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_draft_images ENABLE ROW LEVEL SECURITY;

-- Políticas básicas (exemplo - ajustar conforme necessidade de autenticação)
-- Por enquanto, permitir acesso service_role para operações administrativas

CREATE POLICY "Enable all for service role" ON users
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON stores
  FOR ALL USING (true);

CREATE POLICY "Enable read for anon" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Enable all for service role" ON products
  FOR ALL USING (true);

CREATE POLICY "Enable read for anon" ON product_variants
  FOR SELECT USING (active = true);

CREATE POLICY "Enable all for service role" ON product_variants
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON reseller_products
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON pre_orders
  FOR ALL USING (true);

CREATE POLICY "Enable read for all" ON site_settings
  FOR SELECT USING (true);

CREATE POLICY "Enable all for service role" ON site_settings
  FOR ALL USING (true);

CREATE POLICY "Enable read for all" ON site_banners
  FOR SELECT USING (active = true);

CREATE POLICY "Enable all for service role" ON site_banners
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON bulk_import_processes
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON bulk_import_product_drafts
  FOR ALL USING (true);

CREATE POLICY "Enable all for service role" ON bulk_import_draft_images
  FOR ALL USING (true);

-- =====================================================
-- 7. DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir configuração inicial do site (se não existir)
INSERT INTO site_settings (id, site_name, site_description)
SELECT 
  uuid_generate_v4(),
  'CJota Catálogo',
  'Sistema de pedidos por encomenda personalizado'
WHERE NOT EXISTS (SELECT 1 FROM site_settings LIMIT 1);

-- =====================================================
-- CONCLUÍDO
-- =====================================================
-- Execute este script no SQL Editor do Supabase
-- em: https://supabase.com/dashboard/project/rqlirjpkxlxmnzqcuhtc/sql
