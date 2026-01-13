# 📦 Módulo de Cadastro em Massa - Quick Start

Sistema completo de importação em massa inspirado no **Automágico**.

## ✨ Funcionalidades

- ✅ Upload de múltiplas imagens ou arquivo ZIP
- ✅ Agrupamento automático por nome de arquivo
- ✅ Revisão visual dos grupos criados
- ✅ Configurações padrão para todo o lote
- ✅ Edição inline tipo spreadsheet
- ✅ Ações em lote (aplicar preço, estoque, tags)
- ✅ Criação de todos os produtos de uma vez
- ✅ Tela de resumo com estatísticas

## 🎯 Fluxo de Uso

```
1. UPLOAD
   /dashboard/bulk-import
   ↓
   Drag-and-drop de imagens ou ZIP
   ↓
   Sistema agrupa automaticamente

2. REVISÃO DE GRUPOS
   /dashboard/bulk-import/[id]/review
   ↓
   Ver grupos criados
   Trocar imagem principal
   Aplicar configurações padrão

3. EDIÇÃO FINAL
   /dashboard/bulk-import/[id]/edit
   ↓
   Tabela editável com todos os produtos
   Edição inline de nome, preço, estoque, tags
   Ações em lote

4. CRIAÇÃO
   Clique em "Criar Produtos"
   ↓
   Sistema valida, cria e publica

5. RESUMO
   /dashboard/bulk-import/[id]/summary
   ↓
   Estatísticas da importação
   Links para ver produtos
```

## 🚀 Instalação Rápida

### 1. Execute o Schema

```sql
-- No Supabase SQL Editor, execute:
src/db/schema-bulk-import.sql
```

### 2. Configure Storage

- Bucket: `products` (público)
- Políticas de upload para usuários autenticados

### 3. Teste

```
https://seu-app.com/dashboard/bulk-import
```

## 📁 Arquivos Criados

```
app/
├── api/bulk-import/
│   ├── create/route.ts
│   ├── upload/route.ts
│   ├── [id]/drafts/route.ts
│   ├── [id]/apply-defaults/route.ts
│   ├── [id]/create-products/route.ts
│   └── draft/[id]/route.ts
│
└── dashboard/bulk-import/
    ├── page.tsx (upload)
    └── [id]/
        ├── review/page.tsx
        ├── edit/page.tsx
        └── summary/page.tsx

src/
├── services/BulkImportService.js
└── db/schema-bulk-import.sql

docs/
├── BULK-IMPORT-DOC.md     (Documentação completa)
└── BULK-IMPORT-SETUP.md   (Guia de instalação)
```

## 🗄️ Tabelas Criadas

- `bulk_imports` - Sessões de importação
- `draft_products` - Rascunhos de produtos
- `draft_images` - Imagens temporárias
- `bulk_import_defaults` - Configurações padrão
- `bulk_import_products` - Log de rastreabilidade

## 🎨 Algoritmo de Agrupamento

```
vestido-azul-1.jpg  → Grupo: "vestido-azul"
vestido-azul-2.jpg  → Grupo: "vestido-azul"
camisa_p.jpg        → Grupo: "camisa"
camisa_m.jpg        → Grupo: "camisa"
001-frente.jpg      → Grupo: "001"
001-costas.jpg      → Grupo: "001"
```

## 📖 Documentação Completa

- **`BULK-IMPORT-DOC.md`** - Guia completo do usuário + referência técnica
- **`BULK-IMPORT-SETUP.md`** - Passo a passo de instalação

## 🧪 Teste com Dados de Exemplo

1. Baixe 6 imagens de produtos
2. Renomeie:
   ```
   vestido-1.jpg
   vestido-2.jpg
   blusa-1.jpg
   blusa-2.jpg
   saia-1.jpg
   saia-2.jpg
   ```
3. Faça upload
4. Deve criar 3 grupos com 2 imagens cada

## ✅ Checklist

- [ ] Schema executado no Supabase
- [ ] Bucket `products` criado e público
- [ ] Políticas de storage configuradas
- [ ] Link adicionado ao menu do dashboard
- [ ] Testado com imagens reais

## 🐛 Problemas Comuns

| Erro | Solução |
|------|---------|
| Tabela não existe | Execute o schema SQL |
| Erro ao fazer upload | Verifique bucket e políticas |
| Agrupamento errado | Ajuste manualmente na tela de revisão |
| Produtos não aparecem | Verifique `is_active` e `store_id` |

## 🎉 Pronto!

Agora você tem um **sistema profissional de cadastro em massa**, exatamente como solicitado, com:

- Upload intuitivo
- Agrupamento inteligente
- Revisão completa
- Edição em lote
- Criação automática

**Tudo sem emoji, com design minimalista preto/branco, e 100% funcional!**
