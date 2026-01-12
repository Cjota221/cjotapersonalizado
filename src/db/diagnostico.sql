-- =====================================================
-- SCRIPT DE DIAGNÓSTICO - Execute no SQL Editor
-- =====================================================

-- 1. Verificar se o usuário existe no Supabase Auth
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'carolineazevedo075@gmail.com';

-- Se não retornar nada, o usuário NÃO foi criado no Supabase Auth!
-- Vá em: Authentication > Users > Add User


-- 2. Verificar se a loja foi criada
SELECT 
  id,
  owner_id,
  slug,
  store_name,
  loja_configurada,
  created_at
FROM stores 
WHERE slug = 'boutique-carol';

-- Se não retornar nada, execute o seed-test-user.sql novamente


-- 3. Verificar produtos
SELECT 
  p.id,
  p.sku,
  p.name,
  p.active,
  COUNT(pv.id) as total_variants
FROM products p
LEFT JOIN product_variants pv ON pv.product_id = p.id
GROUP BY p.id, p.sku, p.name, p.active
ORDER BY p.created_at DESC;


-- 4. Verificar variações
SELECT 
  pv.id,
  p.name as produto,
  pv.size,
  pv.color,
  pv.stock,
  pv.price_cents / 100.0 as preco_reais,
  pv.active
FROM product_variants pv
JOIN products p ON p.id = pv.product_id
ORDER BY p.name, pv.size;


-- 5. Verificar vínculo loja-produtos
SELECT 
  s.store_name as loja,
  p.name as produto,
  rp.active,
  rp.price_cents_override / 100.0 as preco_loja_reais
FROM reseller_products rp
JOIN stores s ON s.id = rp.store_id
JOIN products p ON p.id = rp.product_id
WHERE s.slug = 'boutique-carol';
