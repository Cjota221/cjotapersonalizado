-- =====================================================
-- CORREÇÃO DEFINITIVA DO PROBLEMA
-- Execute este script NO SUPABASE SQL EDITOR
-- =====================================================

-- 1. Remover a constraint de foreign key que causa o erro
ALTER TABLE stores 
DROP CONSTRAINT IF EXISTS stores_owner_id_fkey;

-- 2. Remover tabela users (não é usada, o Supabase Auth gerencia em auth.users)
DROP TABLE IF EXISTS users CASCADE;

-- 3. Limpar lojas duplicadas se houver
DELETE FROM stores WHERE slug = 'boutique-carol';

-- 4. Criar a loja corretamente
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
WHERE email = 'carolineazevedo075@gmail.com';

-- 5. Verificar
SELECT 
  s.id,
  s.owner_id,
  s.slug,
  s.store_name,
  u.email as owner_email,
  s.loja_configurada
FROM stores s
JOIN auth.users u ON u.id = s.owner_id
WHERE s.slug = 'boutique-carol';
