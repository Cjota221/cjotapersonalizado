-- =====================================================
-- SCRIPT DE CORREÇÃO RÁPIDA
-- Execute este script NO SUPABASE SQL EDITOR
-- =====================================================

-- 1. Adicionar coluna loja_configurada se não existir
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS loja_configurada BOOLEAN DEFAULT FALSE;

-- 2. Adicionar coluna theme_settings se não existir
ALTER TABLE stores 
ADD COLUMN IF NOT EXISTS theme_settings JSONB;

-- 3. Criar a loja para o usuário
INSERT INTO stores (
  owner_id,
  slug,
  store_name,
  colors,
  loja_configurada
)
SELECT 
  id,
  'boutique-carol',
  'Boutique da Carol',
  '{"primary":"#000000","button":"#000000","background":"#ffffff"}'::jsonb,
  false
FROM auth.users 
WHERE email = 'carolineazevedo075@gmail.com'
ON CONFLICT (slug) DO NOTHING;

-- 4. Verificar se funcionou
SELECT 
  id,
  owner_id,
  slug,
  store_name,
  loja_configurada
FROM stores 
WHERE slug = 'boutique-carol';
