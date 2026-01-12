-- =====================================================
-- SCRIPT PARA CRIAR USUÁRIO E LOJA DE TESTE
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- IMPORTANTE: Este script cria um usuário na tabela 'users'
-- mas NÃO cria um usuário de autenticação do Supabase Auth
-- Você precisa criar o usuário no Supabase Auth primeiro!

-- Dados de teste:
-- Email: carolineazevedo075@gmail.com
-- Senha: Cjota@015 (defina no Supabase Auth)

-- =====================================================
-- 1. CRIAR LOJA PARA O USUÁRIO
-- =====================================================

-- Primeiro, pegue o UUID do usuário criado no Supabase Auth
-- Substitua 'SEU_USER_UUID_AQUI' pelo UUID real do auth.users

DO $$
DECLARE
  v_user_id UUID;
  v_store_id UUID;
  v_product_id1 UUID;
  v_product_id2 UUID;
BEGIN
  -- Buscar o usuário pelo email (assumindo que já foi criado no Supabase Auth)
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = 'carolineazevedo075@gmail.com' 
  LIMIT 1;

  -- Se não encontrou, criar na tabela users (mas o Auth precisa existir!)
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'ATENÇÃO: Usuário não encontrado no auth.users!';
    RAISE NOTICE 'Crie primeiro o usuário em: Authentication > Users > Invite user';
    RAISE NOTICE 'Email: carolineazevedo075@gmail.com';
    RAISE NOTICE 'Senha: Cjota@015';
    RETURN;
  END IF;

  RAISE NOTICE 'Usuário encontrado: %', v_user_id;

  -- Criar a loja
  INSERT INTO stores (
    id,
    owner_id,
    slug,
    store_name,
    logo_url,
    colors,
    loja_configurada
  ) VALUES (
    uuid_generate_v4(),
    v_user_id,
    'boutique-carol',
    'Boutique da Carol',
    NULL,
    '{"primary":"#000000","button":"#000000","background":"#ffffff"}'::jsonb,
    false
  )
  RETURNING id INTO v_store_id;

  RAISE NOTICE 'Loja criada: %', v_store_id;

  -- Criar produto 1: Vestido Floral
  INSERT INTO products (
    id,
    sku,
    name,
    description,
    images,
    active
  ) VALUES (
    uuid_generate_v4(),
    'VEST001',
    'Vestido Floral Primavera',
    'Lindo vestido floral perfeito para a primavera. Tecido leve e confortável, ideal para dias quentes.',
    '["https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800"]'::jsonb,
    true
  )
  RETURNING id INTO v_product_id1;

  -- Variações do vestido
  INSERT INTO product_variants (product_id, size, color, stock, price_cents, active) VALUES
    (v_product_id1, 'P', 'Floral', 10, 12990, true),
    (v_product_id1, 'M', 'Floral', 15, 12990, true),
    (v_product_id1, 'G', 'Floral', 8, 12990, true);

  -- Vincular produto à loja
  INSERT INTO reseller_products (store_id, product_id, active, price_cents_override)
  VALUES (v_store_id, v_product_id1, true, 12990);

  RAISE NOTICE 'Produto 1 criado: Vestido Floral';

  -- Criar produto 2: Blusa Básica
  INSERT INTO products (
    id,
    sku,
    name,
    description,
    images,
    active
  ) VALUES (
    uuid_generate_v4(),
    'BLUS001',
    'Blusa Lisa Básica',
    'Blusa básica lisa, essencial para qualquer guarda-roupa. Disponível em várias cores.',
    '["https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800"]'::jsonb,
    true
  )
  RETURNING id INTO v_product_id2;

  -- Variações da blusa
  INSERT INTO product_variants (product_id, size, color, stock, price_cents, active) VALUES
    (v_product_id2, 'P', 'Branca', 20, 4990, true),
    (v_product_id2, 'M', 'Branca', 25, 4990, true),
    (v_product_id2, 'G', 'Branca', 15, 4990, true),
    (v_product_id2, 'P', 'Preta', 18, 4990, true),
    (v_product_id2, 'M', 'Preta', 22, 4990, true),
    (v_product_id2, 'G', 'Preta', 12, 4990, true);

  -- Vincular produto à loja
  INSERT INTO reseller_products (store_id, product_id, active, price_cents_override)
  VALUES (v_store_id, v_product_id2, true, 4990);

  RAISE NOTICE 'Produto 2 criado: Blusa Básica';

  RAISE NOTICE '✅ SETUP COMPLETO!';
  RAISE NOTICE 'Acesse: https://cjotapersonalizado.netlify.app/boutique-carol';
  
END $$;
