# 🔧 Setup do Supabase - Passo a Passo

## ✅ Credenciais de Teste
- **Email**: carolineazevedo075@gmail.com
- **Senha**: Cjota@015

---

## 📋 Passos para Configurar

### 1️⃣ **Criar as Tabelas no Supabase**

1. Acesse seu projeto Supabase: https://supabase.com/dashboard/project/rqlirjpkxlxmnzqcuhtc
2. Vá em **SQL Editor** (ícone de código no menu lateral)
3. Clique em **New Query**
4. Cole TODO o conteúdo do arquivo: `src/db/supabase-schema.sql`
5. Clique em **Run** (ou pressione Ctrl+Enter)
6. Aguarde: "Success. No rows returned"

✅ **Tabelas criadas**: users, stores, products, product_variants, reseller_products, pre_orders, etc.

---

### 2️⃣ **Criar o Usuário de Autenticação**

1. No Supabase, vá em **Authentication** > **Users** (menu lateral)
2. Clique em **Add User** (botão no topo)
3. Escolha **Create new user**
4. Preencha:
   - **Email**: carolineazevedo075@gmail.com
   - **Password**: Cjota@015
   - **Auto Confirm User**: ✅ (marque esta opção!)
5. Clique em **Create User**

✅ **Usuário criado no Supabase Auth**

---

### 3️⃣ **Criar a Loja e Produtos de Teste**

1. Ainda no **SQL Editor**
2. Clique em **New Query**
3. Cole TODO o conteúdo do arquivo: `src/db/seed-test-user.sql`
4. Clique em **Run**
5. Veja as mensagens de sucesso:
   - "Usuário encontrado: [UUID]"
   - "Loja criada: [UUID]"
   - "Produto 1 criado: Vestido Floral"
   - "Produto 2 criado: Blusa Básica"
   - "✅ SETUP COMPLETO!"

---

## 🚀 **Testar o Login**

1. Acesse: https://cjotapersonalizado.netlify.app/login
2. Digite:
   - **Email**: carolineazevedo075@gmail.com
   - **Senha**: Cjota@015
3. Clique em **Entrar**
4. Você será redirecionado para: `/dashboard`

---

## 🏪 **Ver a Loja**

Acesse: https://cjotapersonalizado.netlify.app/boutique-carol

Você verá:
- 2 produtos cadastrados (Vestido Floral e Blusa Básica)
- Design moderno preto/branco
- Cards com hover
- Trust badges

---

## ❌ **Se der erro "Usuário não encontrado"**

O script `seed-test-user.sql` busca o usuário no `auth.users` do Supabase. Se você ver a mensagem:

```
ATENÇÃO: Usuário não encontrado no auth.users!
```

Significa que você pulou o **Passo 2**. Volte e crie o usuário em Authentication > Users.

---

## 🔍 **Verificar se funcionou**

Execute esta query no SQL Editor:

```sql
-- Ver lojas criadas
SELECT * FROM stores;

-- Ver produtos criados
SELECT * FROM products;

-- Ver variações
SELECT * FROM product_variants;
```

Você deve ver:
- 1 loja: "Boutique da Carol" (slug: boutique-carol)
- 2 produtos: "Vestido Floral" e "Blusa Básica"
- 9 variações no total

---

## 🎉 **Pronto!**

Agora você pode:
- ✅ Fazer login no dashboard
- ✅ Ver a loja pública
- ✅ Criar novos produtos
- ✅ Editar produtos existentes
- ✅ Personalizar a loja

---

## 📞 **Suporte**

Se ainda não conseguir entrar, me avise qual erro aparece!
