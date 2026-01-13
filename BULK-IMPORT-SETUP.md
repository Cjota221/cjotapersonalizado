# 🚀 INSTALAÇÃO DO MÓDULO DE CADASTRO EM MASSA

## PASSO 1: EXECUTAR SCHEMA NO SUPABASE

1. Acesse o Supabase SQL Editor:
   ```
   https://supabase.com/dashboard/project/rqlirjpkxlxmnzqcuhtc/sql/new
   ```

2. Execute o arquivo `src/db/schema-bulk-import.sql` completo

3. Verifique se as tabelas foram criadas:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE '%bulk%';
   ```

   **Deve retornar:**
   - bulk_imports
   - draft_products
   - draft_images
   - bulk_import_defaults
   - bulk_import_products

---

## PASSO 2: CONFIGURAR STORAGE

1. No Supabase, vá em **Storage** → Bucket `products`

2. Certifique-se que o bucket `products` existe e é **público**

3. Se não existir, crie:
   ```
   Nome: products
   Public: ✅ Sim
   ```

4. Crie política de acesso para uploads:
   ```sql
   -- Permitir uploads autenticados
   CREATE POLICY "Authenticated users can upload"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'products');

   -- Permitir leitura pública
   CREATE POLICY "Public can view"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'products');
   ```

---

## PASSO 3: ADICIONAR AO MENU DO DASHBOARD

Edite `components/admin/AdminSidebar.tsx` ou o componente de menu:

```tsx
// Adicione este item ao array de links do menu:
{
  href: '/dashboard/bulk-import',
  label: 'Cadastro em Massa',
  icon: '📦'
}
```

---

## PASSO 4: INSTALAR DEPENDÊNCIAS (se necessário)

```bash
npm install adm-zip
```

Para processar arquivos ZIP no backend.

---

## PASSO 5: TESTAR O FLUXO

1. **Login no sistema:**
   ```
   Email: carolineazevedo075@gmail.com
   Senha: Cjota@015
   ```

2. **Acesse o módulo:**
   ```
   https://cjotapersonalizado.netlify.app/dashboard/bulk-import
   ```

3. **Teste com imagens de exemplo:**
   - Baixe 5-10 fotos de produtos
   - Renomeie seguindo o padrão:
     ```
     produto-1-frente.jpg
     produto-1-costas.jpg
     produto-2-frente.jpg
     produto-2-costas.jpg
     ```

4. **Execute o fluxo completo:**
   - Upload → Revisão → Edição → Criar

---

## VERIFICAR SE FUNCIONOU

1. **Após upload, consulte no Supabase:**
   ```sql
   SELECT * FROM bulk_imports ORDER BY created_at DESC LIMIT 1;
   ```

2. **Ver rascunhos criados:**
   ```sql
   SELECT dp.*, COUNT(di.id) as total_images
   FROM draft_products dp
   LEFT JOIN draft_images di ON di.draft_product_id = dp.id
   GROUP BY dp.id;
   ```

3. **Ver produtos criados:**
   ```sql
   SELECT * FROM products ORDER BY created_at DESC LIMIT 10;
   ```

---

## TROUBLESHOOTING

### ❌ Erro "table bulk_imports does not exist"

**Solução:** Execute o schema SQL novamente

---

### ❌ Erro ao fazer upload

**Possíveis causas:**
1. Bucket `products` não existe
2. Políticas de RLS bloqueando
3. Tamanho do arquivo muito grande

**Solução:**
```sql
-- Ver políticas do storage
SELECT * FROM storage.policies WHERE bucket_id = 'products';

-- Remover limite de tamanho (se necessário)
UPDATE storage.buckets 
SET file_size_limit = 10485760 -- 10MB
WHERE id = 'products';
```

---

### ❌ Agrupamento não funcionou

**Normal!** O algoritmo é simples. Na tela de revisão você pode ajustar manualmente.

---

### ❌ Produtos não aparecem na loja

**Verifique:**
1. Campo `is_active` = true
2. Campo `store_id` está correto
3. Imagens foram copiadas para storage permanente

```sql
SELECT 
  p.name,
  p.is_active,
  p.store_id,
  COUNT(pi.id) as images_count
FROM products p
LEFT JOIN product_images pi ON pi.product_id = p.id
GROUP BY p.id;
```

---

## 🎉 PRONTO!

Agora você tem um sistema completo de cadastro em massa, igual ao Automágico!

**Próximos passos:**

1. Personalize os estilos conforme seu design system
2. Adicione validações extras se necessário
3. Configure categorias padrão
4. Teste com volume real de produtos

---

## 📞 SUPORTE TÉCNICO

Consulte `BULK-IMPORT-DOC.md` para:
- Guia completo de uso
- Referência de API
- Estrutura do banco de dados
- Exemplos de código
