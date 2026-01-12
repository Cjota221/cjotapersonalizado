-- EXTENSÃO DO SCHEMA: Sistema de Branding e Personalização
-- Adicionar ao schema.sql existente

-- Tabela de configurações gerais do site
CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  logo_url TEXT,
  favicon_url TEXT,
  site_name TEXT DEFAULT 'CJota Catálogo',
  site_description TEXT,
  
  -- Cores do tema (JSON ou colunas separadas)
  color_primary TEXT DEFAULT '#1a1a1a',
  color_secondary TEXT DEFAULT '#4a5568',
  color_accent TEXT DEFAULT '#3b82f6',
  color_surface TEXT DEFAULT '#ffffff',
  color_background TEXT DEFAULT '#f7fafc',
  color_text_primary TEXT DEFAULT '#1a202c',
  color_text_secondary TEXT DEFAULT '#718096',
  color_border TEXT DEFAULT '#e2e8f0',
  color_success TEXT DEFAULT '#10b981',
  color_warning TEXT DEFAULT '#f59e0b',
  color_error TEXT DEFAULT '#ef4444',
  
  -- Tipografia
  font_primary TEXT DEFAULT 'Inter, system-ui, sans-serif',
  font_headings TEXT DEFAULT 'Inter, system-ui, sans-serif',
  
  -- Contato
  whatsapp_number TEXT,
  email TEXT,
  
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de banners do site
CREATE TABLE IF NOT EXISTS site_banners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text TEXT,
  display_order INTEGER DEFAULT 0,
  active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_site_banners_active ON site_banners(active, display_order);

-- Inserir configuração padrão
INSERT OR IGNORE INTO site_settings (id) VALUES (1);
