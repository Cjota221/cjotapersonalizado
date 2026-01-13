-- =====================================================
-- SCHEMA PARA CADASTRO EM MASSA DE PRODUTOS
-- Sistema tipo Automágico - Supabase PostgreSQL
-- =====================================================

-- TABELA 1: Importações (sessões de upload)
CREATE TABLE IF NOT EXISTS bulk_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Controle de status
  status VARCHAR(50) NOT NULL DEFAULT 'uploading',
  -- Status: 'uploading', 'processing', 'grouping', 'reviewing', 'completed', 'error'
  
  -- Metadados
  total_files INTEGER DEFAULT 0,
  total_groups INTEGER DEFAULT 0,
  total_products_created INTEGER DEFAULT 0,
  
  -- Logs e erro
  error_message TEXT,
  processing_log JSONB DEFAULT '[]'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- TABELA 2: Rascunhos de produtos
CREATE TABLE IF NOT EXISTS draft_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES bulk_imports(id) ON DELETE CASCADE,
  
  -- Identificação e agrupamento
  group_key VARCHAR(255), -- Prefixo comum usado para agrupar (ex: "camisa-azul")
  original_filenames TEXT[], -- Nomes originais dos arquivos
  
  -- Dados do produto (editáveis)
  name VARCHAR(255),
  description TEXT,
  sku VARCHAR(100),
  
  -- Precificação
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  
  -- Estoque
  stock_quantity INTEGER DEFAULT 0,
  track_inventory BOOLEAN DEFAULT true,
  
  -- Categorização
  category_id UUID REFERENCES categories(id),
  tags TEXT[], -- Array de tags
  
  -- Status e validação
  status VARCHAR(50) DEFAULT 'draft',
  -- Status: 'draft', 'ready', 'error', 'created'
  is_active BOOLEAN DEFAULT true,
  validation_errors JSONB DEFAULT '[]'::jsonb,
  
  -- Dados brutos (para preservar info original)
  raw_data JSONB DEFAULT '{}'::jsonb,
  
  -- Ordem dentro do import (para UI)
  sort_order INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA 3: Imagens temporárias dos rascunhos
CREATE TABLE IF NOT EXISTS draft_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_product_id UUID NOT NULL REFERENCES draft_products(id) ON DELETE CASCADE,
  
  -- URLs (temporária e final)
  temp_url TEXT NOT NULL, -- URL no storage temporário
  final_url TEXT, -- URL após mover para storage permanente
  
  -- Metadados da imagem
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER, -- em bytes
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  
  -- Ordenação e destaque
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA 4: Configurações padrão do lote
CREATE TABLE IF NOT EXISTS bulk_import_defaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES bulk_imports(id) ON DELETE CASCADE,
  
  -- Valores padrão aplicáveis a todos os rascunhos
  default_price DECIMAL(10,2),
  default_stock INTEGER,
  default_category_id UUID REFERENCES categories(id),
  default_tags TEXT[],
  default_is_active BOOLEAN DEFAULT true,
  
  -- Regras de aplicação
  apply_to_all BOOLEAN DEFAULT false,
  override_existing BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TABELA 5: Log de produtos criados (rastreabilidade)
CREATE TABLE IF NOT EXISTS bulk_import_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES bulk_imports(id) ON DELETE CASCADE,
  draft_product_id UUID REFERENCES draft_products(id),
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Status da criação
  created_successfully BOOLEAN DEFAULT false,
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_bulk_imports_store ON bulk_imports(store_id);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_status ON bulk_imports(status);
CREATE INDEX IF NOT EXISTS idx_bulk_imports_admin ON bulk_imports(admin_user_id);

CREATE INDEX IF NOT EXISTS idx_draft_products_import ON draft_products(import_id);
CREATE INDEX IF NOT EXISTS idx_draft_products_status ON draft_products(status);
CREATE INDEX IF NOT EXISTS idx_draft_products_group ON draft_products(group_key);

CREATE INDEX IF NOT EXISTS idx_draft_images_draft ON draft_images(draft_product_id);
CREATE INDEX IF NOT EXISTS idx_draft_images_primary ON draft_images(is_primary);

CREATE INDEX IF NOT EXISTS idx_bulk_import_products_import ON bulk_import_products(import_id);
CREATE INDEX IF NOT EXISTS idx_bulk_import_products_product ON bulk_import_products(product_id);

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_bulk_imports_updated_at ON bulk_imports;
CREATE TRIGGER update_bulk_imports_updated_at
  BEFORE UPDATE ON bulk_imports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_draft_products_updated_at ON draft_products;
CREATE TRIGGER update_draft_products_updated_at
  BEFORE UPDATE ON draft_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_bulk_import_defaults_updated_at ON bulk_import_defaults;
CREATE TRIGGER update_bulk_import_defaults_updated_at
  BEFORE UPDATE ON bulk_import_defaults
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

ALTER TABLE bulk_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE draft_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_defaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_import_products ENABLE ROW LEVEL SECURITY;

-- Apenas o dono da loja pode ver suas importações
CREATE POLICY bulk_imports_policy ON bulk_imports
  FOR ALL
  USING (
    admin_user_id = auth.uid() OR
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid())
  );

CREATE POLICY draft_products_policy ON draft_products
  FOR ALL
  USING (
    import_id IN (
      SELECT id FROM bulk_imports WHERE admin_user_id = auth.uid()
    )
  );

CREATE POLICY draft_images_policy ON draft_images
  FOR ALL
  USING (
    draft_product_id IN (
      SELECT dp.id FROM draft_products dp
      JOIN bulk_imports bi ON dp.import_id = bi.id
      WHERE bi.admin_user_id = auth.uid()
    )
  );

CREATE POLICY bulk_import_defaults_policy ON bulk_import_defaults
  FOR ALL
  USING (
    import_id IN (
      SELECT id FROM bulk_imports WHERE admin_user_id = auth.uid()
    )
  );

CREATE POLICY bulk_import_products_policy ON bulk_import_products
  FOR ALL
  USING (
    import_id IN (
      SELECT id FROM bulk_imports WHERE admin_user_id = auth.uid()
    )
  );

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View: Resumo de importações
CREATE OR REPLACE VIEW bulk_imports_summary AS
SELECT 
  bi.id,
  bi.store_id,
  bi.admin_user_id,
  bi.status,
  bi.total_files,
  bi.total_groups,
  bi.total_products_created,
  COUNT(DISTINCT dp.id) as draft_count,
  COUNT(DISTINCT di.id) as image_count,
  bi.created_at,
  bi.updated_at,
  bi.completed_at
FROM bulk_imports bi
LEFT JOIN draft_products dp ON dp.import_id = bi.id
LEFT JOIN draft_images di ON di.draft_product_id = dp.id
GROUP BY bi.id;

-- View: Rascunhos com imagem principal
CREATE OR REPLACE VIEW draft_products_with_images AS
SELECT 
  dp.*,
  di.temp_url as primary_image_url,
  di.filename as primary_image_filename,
  (SELECT COUNT(*) FROM draft_images WHERE draft_product_id = dp.id) as total_images
FROM draft_products dp
LEFT JOIN draft_images di ON di.draft_product_id = dp.id AND di.is_primary = true;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE bulk_imports IS 'Sessões de importação em massa de produtos';
COMMENT ON TABLE draft_products IS 'Rascunhos de produtos aguardando revisão e criação';
COMMENT ON TABLE draft_images IS 'Imagens temporárias vinculadas aos rascunhos';
COMMENT ON TABLE bulk_import_defaults IS 'Configurações padrão aplicáveis ao lote';
COMMENT ON TABLE bulk_import_products IS 'Log de rastreabilidade entre rascunhos e produtos criados';

COMMENT ON COLUMN bulk_imports.status IS 'uploading | processing | grouping | reviewing | completed | error';
COMMENT ON COLUMN draft_products.status IS 'draft | ready | error | created';
COMMENT ON COLUMN draft_products.group_key IS 'Prefixo comum usado no agrupamento automático';

