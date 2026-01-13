# 📦 MÓDULO DE CADASTRO EM MASSA DE PRODUTOS

Sistema completo de importação em massa inspirado no Automágico - Upload, agrupamento inteligente, revisão e criação de produtos em lote.

---

## 📋 ÍNDICE

1. [Como Usar (Guia do Admin)](#como-usar-guia-do-admin)
2. [Fluxo Técnico](#fluxo-técnico)
3. [Estrutura de Arquivos](#estrutura-de-arquivos)
4. [Banco de Dados](#banco-de-dados)
5. [API Endpoints](#api-endpoints)
6. [Componentes](#componentes)

---

## 🎯 COMO USAR (GUIA DO ADMIN)

### PASSO 1: ENTRADA - UPLOAD DE IMAGENS

**Acesso:** `/dashboard/bulk-import`

1. Clique em "Cadastro em massa" no menu do painel
2. Você verá uma área de drag-and-drop
3. Arraste e solte:
   - **Múltiplas imagens** (.jpg, .png, .webp)
   - **Arquivo ZIP** contendo uma pasta de imagens
4. Aguarde o upload (barra de progresso)
5. Clique em "Processar Imagens"

**Dica:** Use nomes de arquivo com padrão para melhor agrupamento:
- `vestido-azul-1.jpg`, `vestido-azul-2.jpg` → Agrupa como "Vestido Azul"
- `camisa-p.jpg`, `camisa-m.jpg` → Agrupa como "Camisa"
- `001-frente.jpg`, `001-costas.jpg` → Agrupa como "001"

---

### PASSO 2: AGRUPAMENTO - REVISAR GRUPOS

**Acesso automático após upload:** `/dashboard/bulk-import/[id]/review`

O sistema tenta agrupar imagens do mesmo produto automaticamente.

**O que você pode fazer:**

1. **Ver grupos criados**
   - Cada card mostra um grupo de imagens
   - Número de fotos no canto superior direito

2. **Trocar imagem principal**
   - Clique nas miniaturas na parte inferior do card
   - A imagem com borda preta é a principal

3. **Excluir grupo**
   - Se o sistema agrupou errado
   - Botão "Excluir" no card

4. **Configurações Padrão do Lote**
   - Botão no topo da página
   - Define preço, estoque e tags para TODOS os produtos
   - Valores podem ser editados depois individualmente

5. **Ir para Revisão Final**
   - Quando estiver satisfeito com os grupos
   - Botão no canto superior direito

---

### PASSO 3: REVISÃO FINAL - EDITAR PRODUTOS

**Acesso:** `/dashboard/bulk-import/[id]/edit`

Tela tipo spreadsheet para editar todos os produtos antes de criar.

**Funcionalidades:**

1. **Edição inline**
   - Clique em qualquer célula para editar
   - Campos: Nome, Preço, Estoque, Tags
   - Salva automaticamente ao sair da célula

2. **Seleção múltipla**
   - Checkbox na primeira coluna
   - Selecione vários produtos

3. **Ações em lote**
   - Com produtos selecionados:
   - "Aplicar Preço" → Define mesmo preço para todos
   - Adicione mais ações conforme necessário

4. **Busca**
   - Campo no topo
   - Filtra produtos por nome

5. **Visualização**
   - Foto em miniatura
   - Todos os dados principais visíveis

6. **Criar Produtos**
   - Botão no canto superior direito
   - Confirme a criação
   - Aguarde o processamento

---

### PASSO 4: RESUMO - CONCLUSÃO

**Acesso automático:** `/dashboard/bulk-import/[id]/summary`

Tela de sucesso após criação dos produtos.

**O que você vê:**

- Total de arquivos enviados
- Total de grupos criados
- Total de produtos ativos
- Botão para ver todos os produtos
- Botão para criar mais em lote

**Próximos passos sugeridos:**

- Verificar descrições completas
- Configurar variações (tamanho/cor)
- Revisar preços e estoque
- Os produtos já estão visíveis na loja

---

## 🔧 FLUXO TÉCNICO

### 1. CRIAÇÃO DA SESSÃO

```typescript
POST /api/bulk-import/create

Response: { 
  success: true, 
  import_id: "uuid" 
}
```

Cria registro em `bulk_imports` com status `uploading`.

---

### 2. UPLOAD E PROCESSAMENTO

```typescript
POST /api/bulk-import/upload

FormData:
  - import_id: string
  - files: File[]

Response: {
  success: true,
  total_files: number,
  total_groups: number,
  drafts: Draft[]
}
```

**O que acontece:**

1. Faz upload de cada arquivo para `/temp-imports/[import_id]/`
2. Se for ZIP, extrai todas as imagens
3. **Agrupamento automático:**
   - Extrai prefixo comum dos nomes de arquivo
   - Remove números finais (`-1`, `_2`, etc)
   - Remove palavras comuns (`frente`, `costas`, etc)
   - Agrupa arquivos com mesmo prefixo
4. Cria `draft_products` para cada grupo
5. Cria `draft_images` linkadas aos rascunhos
6. Marca primeira imagem como `is_primary`
7. Atualiza status da importação para `grouping`

---

### 3. MANIPULAÇÃO DE GRUPOS

**Trocar imagem principal:**

```typescript
POST /api/bulk-import/draft/change-primary

Body: {
  draft_id: string,
  image_id: string
}
```

**Deletar rascunho:**

```typescript
DELETE /api/bulk-import/draft/[id]
```

**Aplicar configurações padrão:**

```typescript
POST /api/bulk-import/[id]/apply-defaults

Body: {
  default_price: number,
  default_stock: number,
  default_category_id: string,
  default_tags: string[]
}
```

Atualiza TODOS os rascunhos com esses valores.

---

### 4. EDIÇÃO DE RASCUNHOS

```typescript
PUT /api/bulk-import/draft/[id]

Body: {
  name?: string,
  price?: number,
  stock_quantity?: number,
  tags?: string[]
  // ... qualquer campo do draft_product
}
```

Atualiza um rascunho individual.

---

### 5. CRIAÇÃO FINAL

```typescript
POST /api/bulk-import/[id]/create-products

Response: {
  success: true,
  created_count: number,
  failed_count: number,
  created: Array<{
    draft_id: string,
    product_id: string,
    name: string
  }>,
  failed: Array<{
    draft_id: string,
    name: string,
    error: string
  }>
}
```

**Processo:**

1. Busca todos os rascunhos da importação
2. Para cada rascunho:
   - **Valida:** nome não vazio, pelo menos 1 imagem
   - **Copia imagens:** `/temp-imports/[id]/` → `/products/`
   - **Cria produto:** INSERT em `products`
   - **Cria imagens:** INSERT em `product_images`
   - **Registra log:** INSERT em `bulk_import_products`
   - **Atualiza rascunho:** status = `created`
3. Se houver erro, registra mas continua com próximos
4. Atualiza importação: status = `completed`
5. Limpa arquivos temporários em background

---

## 📁 ESTRUTURA DE ARQUIVOS

```
app/
├── api/
│   └── bulk-import/
│       ├── create/
│       │   └── route.ts           # Criar sessão
│       ├── upload/
│       │   └── route.ts           # Upload e agrupamento
│       ├── [id]/
│       │   ├── drafts/
│       │   │   └── route.ts       # Listar rascunhos
│       │   ├── apply-defaults/
│       │   │   └── route.ts       # Configurações padrão
│       │   └── create-products/
│       │       └── route.ts       # Criação final
│       └── draft/
│           └── [id]/
│               └── route.ts       # Update/Delete rascunho
│
└── dashboard/
    └── bulk-import/
        ├── page.tsx               # Upload (passo 1)
        └── [id]/
            ├── review/
            │   └── page.tsx       # Agrupamento (passo 2)
            ├── edit/
            │   └── page.tsx       # Revisão final (passo 3)
            └── summary/
                └── page.tsx       # Resumo (passo 4)

src/
└── services/
    └── BulkImportService.js       # Lógica de negócio

src/db/
└── schema-bulk-import.sql         # Schema das tabelas
```

---

## 🗄️ BANCO DE DADOS

### Tabelas Principais

#### 1. `bulk_imports`

Sessões de importação.

```sql
CREATE TABLE bulk_imports (
  id UUID PRIMARY KEY,
  store_id UUID REFERENCES stores(id),
  admin_user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50), -- uploading, processing, grouping, reviewing, completed, error
  total_files INTEGER,
  total_groups INTEGER,
  total_products_created INTEGER,
  error_message TEXT,
  processing_log JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

#### 2. `draft_products`

Rascunhos de produtos (pré-criação).

```sql
CREATE TABLE draft_products (
  id UUID PRIMARY KEY,
  import_id UUID REFERENCES bulk_imports(id) ON DELETE CASCADE,
  group_key VARCHAR(255),        -- "vestido-azul"
  original_filenames TEXT[],     -- ["vestido-azul-1.jpg", ...]
  name VARCHAR(255),
  description TEXT,
  sku VARCHAR(100),
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost DECIMAL(10,2),
  stock_quantity INTEGER,
  track_inventory BOOLEAN,
  category_id UUID REFERENCES categories(id),
  tags TEXT[],
  status VARCHAR(50),            -- draft, ready, error, created
  is_active BOOLEAN,
  validation_errors JSONB,
  raw_data JSONB,
  sort_order INTEGER,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 3. `draft_images`

Imagens temporárias dos rascunhos.

```sql
CREATE TABLE draft_images (
  id UUID PRIMARY KEY,
  draft_product_id UUID REFERENCES draft_products(id) ON DELETE CASCADE,
  temp_url TEXT,                 -- URL no storage temporário
  final_url TEXT,                -- URL após copiar para permanente
  filename VARCHAR(255),
  file_size INTEGER,
  mime_type VARCHAR(100),
  width INTEGER,
  height INTEGER,
  is_primary BOOLEAN,
  sort_order INTEGER,
  created_at TIMESTAMP
);
```

#### 4. `bulk_import_defaults`

Configurações padrão do lote.

```sql
CREATE TABLE bulk_import_defaults (
  id UUID PRIMARY KEY,
  import_id UUID REFERENCES bulk_imports(id),
  default_price DECIMAL(10,2),
  default_stock INTEGER,
  default_category_id UUID,
  default_tags TEXT[],
  default_is_active BOOLEAN,
  apply_to_all BOOLEAN,
  override_existing BOOLEAN,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 5. `bulk_import_products`

Log de rastreabilidade (qual rascunho virou qual produto).

```sql
CREATE TABLE bulk_import_products (
  id UUID PRIMARY KEY,
  import_id UUID REFERENCES bulk_imports(id),
  draft_product_id UUID REFERENCES draft_products(id),
  product_id UUID REFERENCES products(id),
  created_successfully BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMP
);
```

### Views Úteis

#### `bulk_imports_summary`

Resumo consolidado de importações.

```sql
CREATE VIEW bulk_imports_summary AS
SELECT 
  bi.id,
  bi.store_id,
  bi.status,
  bi.total_files,
  bi.total_groups,
  bi.total_products_created,
  COUNT(DISTINCT dp.id) as draft_count,
  COUNT(DISTINCT di.id) as image_count,
  bi.created_at,
  bi.completed_at
FROM bulk_imports bi
LEFT JOIN draft_products dp ON dp.import_id = bi.id
LEFT JOIN draft_images di ON di.draft_product_id = dp.id
GROUP BY bi.id;
```

#### `draft_products_with_images`

Rascunhos com imagem principal.

```sql
CREATE VIEW draft_products_with_images AS
SELECT 
  dp.*,
  di.temp_url as primary_image_url,
  di.filename as primary_image_filename,
  (SELECT COUNT(*) FROM draft_images WHERE draft_product_id = dp.id) as total_images
FROM draft_products dp
LEFT JOIN draft_images di ON di.draft_product_id = dp.id AND di.is_primary = true;
```

---

## 🚀 API ENDPOINTS

### Criar Sessão

```
POST /api/bulk-import/create
```

**Response:**
```json
{
  "success": true,
  "import_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

---

### Upload de Arquivos

```
POST /api/bulk-import/upload
```

**Request (FormData):**
```
import_id: string
files: File[]
```

**Response:**
```json
{
  "success": true,
  "total_files": 15,
  "total_groups": 5,
  "drafts": [
    {
      "id": "uuid",
      "name": "Vestido Azul",
      "group_key": "vestido-azul",
      "images_count": 3
    }
  ]
}
```

---

### Listar Rascunhos

```
GET /api/bulk-import/[id]/drafts
```

**Response:**
```json
{
  "success": true,
  "drafts": [
    {
      "id": "uuid",
      "name": "Vestido Azul",
      "price": 99.90,
      "stock_quantity": 10,
      "tags": ["verão", "destaque"],
      "draft_images": [
        {
          "id": "uuid",
          "temp_url": "https://...",
          "is_primary": true
        }
      ]
    }
  ]
}
```

---

### Atualizar Rascunho

```
PUT /api/bulk-import/draft/[id]
```

**Request:**
```json
{
  "name": "Vestido Azul Claro",
  "price": 89.90,
  "stock_quantity": 5
}
```

---

### Aplicar Configurações Padrão

```
POST /api/bulk-import/[id]/apply-defaults
```

**Request:**
```json
{
  "default_price": 99.90,
  "default_stock": 10,
  "default_tags": ["novidade", "verão"]
}
```

---

### Criar Produtos

```
POST /api/bulk-import/[id]/create-products
```

**Response:**
```json
{
  "success": true,
  "created_count": 5,
  "failed_count": 0,
  "created": [
    {
      "draft_id": "uuid",
      "product_id": "uuid",
      "name": "Vestido Azul"
    }
  ],
  "failed": []
}
```

---

### Deletar Rascunho

```
DELETE /api/bulk-import/draft/[id]
```

---

## 🎨 COMPONENTES

### 1. Upload Page (`/dashboard/bulk-import/page.tsx`)

**Funcionalidades:**
- Drag-and-drop de arquivos
- Seleção via input file
- Barra de progresso
- Lista de arquivos selecionados
- Validação de tipos (imagens e ZIP)

**Estados:**
- `isDragging`: Área de drop ativa
- `uploading`: Upload em progresso
- `progress`: Percentual (0-100)
- `selectedFiles`: Arquivos escolhidos

---

### 2. Review Page (`/dashboard/bulk-import/[id]/review/page.tsx`)

**Funcionalidades:**
- Grid de cards com grupos
- Trocar imagem principal (click nas miniaturas)
- Excluir grupo
- Modal de configurações padrão
- Navegação para revisão final

**Estados:**
- `drafts`: Lista de rascunhos
- `showDefaultsModal`: Controle do modal
- `defaults`: Valores padrão do formulário

---

### 3. Edit Page (`/dashboard/bulk-import/[id]/edit/page.tsx`)

**Funcionalidades:**
- Tabela com edição inline
- Seleção múltipla (checkboxes)
- Ações em lote
- Busca por nome
- Botão de criar produtos

**Estados:**
- `drafts`: Lista de rascunhos
- `selectedDrafts`: IDs selecionados
- `searchTerm`: Filtro de busca
- `creating`: Criação em progresso

**Edição inline:**
- Campo de texto salva automaticamente ao perder foco
- `updateDraft()` chamado com debounce

---

### 4. Summary Page (`/dashboard/bulk-import/[id]/summary/page.tsx`)

**Funcionalidades:**
- Estatísticas da importação
- Cards visuais com números
- Botões de ação (ver produtos, criar mais)
- Dicas de próximos passos

---

## 🧩 ALGORITMO DE AGRUPAMENTO

Função `extractGroupKey()` no upload:

```typescript
function extractGroupKey(filename: string): string {
  // Remove extensão
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Remove padrões comuns
  const cleaned = nameWithoutExt
    .replace(/-\d+$/, '')        // "produto-1" → "produto"
    .replace(/_\d+$/, '')        // "produto_1" → "produto"
    .replace(/\d+$/, '')         // "produto1" → "produto"
    .replace(/[-_](frente|costas|lateral|detalhe)$/i, '') // Remove palavras
    .trim();

  return cleaned || nameWithoutExt;
}
```

**Exemplos:**

| Arquivo | Group Key |
|---------|-----------|
| `vestido-azul-1.jpg` | `vestido-azul` |
| `vestido-azul-2.jpg` | `vestido-azul` |
| `camisa_p.jpg` | `camisa` |
| `camisa_m.jpg` | `camisa` |
| `001-frente.jpg` | `001` |
| `001-costas.jpg` | `001` |

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [x] Schema de banco de dados
- [x] Serviço de processamento (BulkImportService)
- [x] API de criação de sessão
- [x] API de upload e agrupamento
- [x] API de listagem de rascunhos
- [x] API de atualização de rascunhos
- [x] API de aplicar defaults
- [x] API de criação de produtos
- [x] Página de upload com drag-and-drop
- [x] Página de revisão de grupos
- [x] Página de edição final (tabela)
- [x] Página de resumo
- [x] Documentação completa

---

## 🔜 MELHORIAS FUTURAS

1. **Processamento de ZIP do lado do servidor**
   - Usar biblioteca no backend para extrair ZIP
   - Evitar limitações de browser

2. **Detecção de duplicatas**
   - Verificar se produto similar já existe
   - Alertar antes de criar

3. **Importação de CSV**
   - Permitir importar dados de planilha
   - Vincular imagens por SKU ou nome

4. **Agendamento de publicação**
   - Criar produtos como `is_active = false`
   - Ativar em data/hora específica

5. **Edição em massa avançada**
   - Aumentar/diminuir preços em %
   - Copiar valores de um produto para outros
   - Adicionar/remover tags em lote

6. **Histórico de importações**
   - Lista de todas as importações anteriores
   - Reprocessar ou reverter

---

## 🐛 TROUBLESHOOTING

### Erro: "Nenhuma imagem foi encontrada"

- Verifique se os arquivos são `.jpg`, `.png`, `.webp`
- Se for ZIP, confirme que as imagens estão na raiz ou em subpastas

### Erro ao criar produtos

- Verifique se o storage do Supabase está configurado
- Confirme que a tabela `products` existe
- Veja os logs no console do navegador

### Agrupamento incorreto

- Renomeie os arquivos com padrão consistente
- Use a tela de revisão para excluir/ajustar grupos
- Edite manualmente na tela de revisão final

### Imagens não aparecem

- Confirme que o bucket `products` existe no Supabase Storage
- Verifique as políticas de RLS do storage
- Teste o acesso público às URLs

---

## 📞 SUPORTE

Para dúvidas ou problemas:

1. Verifique os logs no console do navegador (F12)
2. Consulte a tabela `bulk_imports` para ver o status
3. Verifique a coluna `error_message` se houver falha

---

**Documentação criada em:** Janeiro de 2026  
**Versão:** 1.0.0  
**Autor:** Sistema CJota - Catálogo Personalizado
