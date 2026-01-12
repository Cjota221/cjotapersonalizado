# 🏪 Sistema de Catálogo Personalizado por Revendedora

Sistema completo de catálogo online personalizado por revendedora/franqueada, com integração WhatsApp para fechamento de pedidos.

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Características](#características)
- [Limitações Intencionais](#limitações-intencionais)
- [Arquitetura](#arquitetura)
- [Instalação](#instalação)
- [Uso](#uso)
- [Modelagem de Dados](#modelagem-de-dados)
- [API REST](#api-rest)
- [Evolução Futura](#evolução-futura)
- [Tecnologias](#tecnologias)

---

## 🎯 Visão Geral

Este sistema permite que cada revendedora/franqueada tenha sua **própria loja online** personalizada com:

- **Logomarca própria**
- **Cores e estilos customizados**
- **Catálogo de produtos da fábrica**
- **Montagem de pedidos com grade/tamanhos**
- **Fechamento via WhatsApp** (sem pagamento online)

### Objetivo Principal

O sistema **NÃO** faz checkout completo. O objetivo é:
1. Cliente monta o pedido na loja da revendedora
2. Sistema gera um pré-pedido formatado
3. Abre WhatsApp da fábrica com resumo completo
4. Equipe interna finaliza frete + pagamento manualmente

---

## ✨ Características

### Para Revendedoras

- ✅ **Onboarding de personalização**: Upload de logo, escolha de cores
- ✅ **Dashboard administrativo**: Gerenciamento de configurações e pedidos
- ✅ **Banner de alerta**: Lembrete para configurar loja antes de divulgar
- ✅ **Link único**: Cada loja tem seu próprio slug (ex: `/boutique-carol`)
- ✅ **Visualização de pré-pedidos**: Acompanhamento dos pedidos recebidos

### Para Clientes Finais

- ✅ **Loja personalizada**: Logo e cores da revendedora
- ✅ **Catálogo de produtos**: Com fotos, descrições e variações
- ✅ **Montagem de grade**: Selecionar tamanhos e quantidades
- ✅ **Carrinho simples**: Resumo do pedido antes de finalizar
- ✅ **Formulário de dados**: Nome, WhatsApp, cidade/UF
- ✅ **Finalização via WhatsApp**: Redirecionamento automático com mensagem

---

## ⚠️ Limitações Intencionais

Esta primeira versão **NÃO inclui**:

- ❌ **Pagamento online** (sem integração com gateways)
- ❌ **Cálculo de frete** (sem integração com Correios/transportadoras)
- ❌ **Emissão de nota fiscal** (sem geração automática)

**Motivo**: Todas essas etapas são tratadas manualmente pela equipe da fábrica via WhatsApp.

---

## 🏗️ Arquitetura

### Stack Técnica

- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite (fácil de migrar para Postgres/MySQL)
- **Templating**: EJS (server-side rendering)
- **Upload de arquivos**: Multer
- **Sessões**: express-session
- **Segurança**: bcryptjs para senhas

### Estrutura de Pastas

```
cjota-logomarca/
├── src/
│   ├── db/
│   │   ├── schema.sql          # Esquema do banco
│   │   ├── init.js             # Script de inicialização
│   │   └── database.js         # Wrapper para operações
│   ├── routes/
│   │   ├── api.js              # Rotas da API REST
│   │   ├── store.js            # Rotas públicas da loja
│   │   └── dashboard.js        # Rotas do painel da revendedora
│   ├── utils/
│   │   └── helpers.js          # Funções auxiliares
│   ├── views/
│   │   ├── index.ejs           # Página inicial do sistema
│   │   ├── store/              # Templates da loja pública
│   │   │   ├── home.ejs
│   │   │   ├── product.ejs
│   │   │   └── cart.ejs
│   │   ├── dashboard/          # Templates do painel
│   │   │   ├── index.ejs
│   │   │   ├── store-settings.ejs
│   │   │   └── orders.ejs
│   │   ├── 404.ejs
│   │   └── error.ejs
│   └── server.js               # Servidor principal
├── public/
│   ├── css/
│   │   ├── main.css
│   │   ├── store.css
│   │   └── dashboard.css
│   └── uploads/                # Logos das lojas
├── package.json
├── .env.example
└── README.md
```

---

## 🚀 Instalação

### Pré-requisitos

- Node.js v16+ instalado
- npm ou yarn

### Passo a Passo

1. **Clone ou navegue até o diretório do projeto**

```bash
cd cjota-logomarca
```

2. **Instale as dependências**

```bash
npm install
```

3. **Configure o arquivo .env**

```bash
cp .env.example .env
```

Edite o `.env` e configure:

```env
PORT=3000
FACTORY_WHATSAPP_NUMBER=5511999999999  # Número da fábrica (formato internacional)
SESSION_SECRET=seu-secret-super-seguro-aqui
```

4. **Inicialize o banco de dados**

```bash
npm run init-db
```

Este comando cria:
- Todas as tabelas necessárias
- Usuário de exemplo: `carol@example.com` / `senha123`
- Loja de exemplo: `boutique-carol`
- Produtos de demonstração

5. **Inicie o servidor**

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

6. **Acesse no navegador**

- **Home do sistema**: http://localhost:3000
- **Loja exemplo**: http://localhost:3000/boutique-carol
- **Dashboard**: http://localhost:3000/dashboard

---

## 📖 Uso

### 1. Configurar a Loja (Revendedora)

1. Acesse `/dashboard`
2. Se a loja não está configurada, verá um banner de alerta
3. Clique em "Configurações da Loja"
4. Faça upload da logomarca
5. Escolha as cores (mínimo: cor principal e cor dos botões)
6. Salve as configurações

A loja será marcada como "configurada" quando tiver:
- ✅ Logo enviado
- ✅ Cores personalizadas (diferentes do padrão)

### 2. Divulgar a Loja

Após configurar, compartilhe o link:
```
http://seudominio.com/sua-loja-slug
```

### 3. Cliente Monta o Pedido

1. Cliente acessa a loja da revendedora
2. Navega pelos produtos
3. Clica em "Ver Detalhes" em um produto
4. Seleciona tamanhos e quantidades
5. Adiciona ao carrinho
6. Preenche seus dados (nome, WhatsApp, cidade/UF)
7. Clica em "Finalizar pelo WhatsApp"

### 4. Finalização

O sistema:
1. Cria um registro do pré-pedido no banco
2. Gera mensagem formatada com todos os dados
3. Abre WhatsApp Web/App com a mensagem pronta
4. Cliente confirma o envio
5. Equipe da fábrica recebe e finaliza manualmente

---

## 🗄️ Modelagem de Dados

### Tabela: `users`
Usuárias revendedoras/contas

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| email | TEXT | Email único |
| password_hash | TEXT | Senha criptografada |
| name | TEXT | Nome da usuária |
| created_at | DATETIME | Data de criação |

### Tabela: `stores`
Lojas das revendedoras

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| owner_id | INTEGER | FK para users |
| slug | TEXT | URL única da loja |
| store_name | TEXT | Nome da loja |
| logo_url | TEXT | Caminho da logomarca |
| colors | JSON | Cores personalizadas |
| theme_settings | JSON | Configurações de tema |
| loja_configurada | BOOLEAN | Se está configurada |
| created_at | DATETIME | Data de criação |

**Exemplo de `colors`:**
```json
{
  "primary": "#ff69b4",
  "button": "#ff1493",
  "background": "#fff5f7",
  "secondary": "#6c757d"
}
```

### Tabela: `products`
Base central de produtos da fábrica

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| sku | TEXT | Código único |
| name | TEXT | Nome do produto |
| description | TEXT | Descrição |
| images | JSON | Array de URLs |
| active | BOOLEAN | Se está ativo |
| created_at | DATETIME | Data de criação |

### Tabela: `product_variants`
Variações dos produtos (tamanhos/cores)

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| product_id | INTEGER | FK para products |
| variant_sku | TEXT | SKU da variação |
| size | TEXT | Tamanho (P/M/G/36/38) |
| color | TEXT | Cor |
| stock | INTEGER | Quantidade em estoque |
| price_cents | INTEGER | Preço em centavos |
| active | BOOLEAN | Se está ativa |

### Tabela: `reseller_products`
Vinculação produto ↔ revendedora

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| store_id | INTEGER | FK para stores |
| product_id | INTEGER | FK para products |
| active | BOOLEAN | Liberado na loja? |
| price_cents_override | INTEGER | Preço customizado |
| margin_percent | REAL | Margem de lucro |
| created_at | DATETIME | Data de criação |

### Tabela: `pre_orders`
Pré-pedidos enviados via WhatsApp

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | INTEGER | Chave primária |
| store_id | INTEGER | FK para stores |
| customer_name | TEXT | Nome do cliente |
| customer_whatsapp | TEXT | WhatsApp do cliente |
| customer_city | TEXT | Cidade |
| customer_state | TEXT | UF |
| items | JSON | Array de itens |
| note | TEXT | Observações |
| whatsapp_message | TEXT | Mensagem gerada |
| status | TEXT | Status do pedido |
| created_at | DATETIME | Data de criação |

**Status possíveis:**
- `pending`: Enviado, aguardando contato
- `contacted`: Equipe iniciou contato
- `confirmed`: Pedido finalizado
- `cancelled`: Cancelado

---

## 🔌 API REST

### Rotas Públicas

#### `GET /api/stores/:slug`
Retorna dados públicos da loja

**Resposta:**
```json
{
  "id": 1,
  "slug": "boutique-carol",
  "store_name": "Boutique da Carol",
  "logo_url": "/uploads/logo-123.jpg",
  "colors": { "primary": "#ff69b4", "button": "#ff1493" },
  "loja_configurada": 1
}
```

#### `GET /api/stores/:slug/products`
Lista produtos ativos da loja

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Vestido Floral",
    "images": ["/images/vestido-1.jpg"],
    "variants": [
      { "id": 1, "size": "P", "color": "Floral", "stock": 10, "price_cents": 12990 }
    ],
    "final_price": 12990
  }
]
```

#### `GET /api/products/:id`
Detalhes de um produto específico

#### `POST /api/pre_orders`
Cria um pré-pedido

**Payload:**
```json
{
  "store_slug": "boutique-carol",
  "customer": {
    "name": "Maria Silva",
    "whatsapp": "11999999999",
    "city": "São Paulo",
    "state": "SP"
  },
  "items": [
    {
      "product_id": 1,
      "product_name": "Vestido Floral",
      "variant_id": 1,
      "variant_size": "M",
      "variant_color": "Floral",
      "qty": 2,
      "price_cents": 12990
    }
  ],
  "note": "Entregar junto"
}
```

**Resposta:**
```json
{
  "success": true,
  "preOrder": { "id": 1, "created_at": "2026-01-12T10:30:00" },
  "whatsappUrl": "https://wa.me/5511999999999?text=..."
}
```

### Rotas Administrativas

#### `GET /dashboard`
Página inicial do dashboard

#### `GET /dashboard/store-settings`
Formulário de configurações da loja

#### `POST /dashboard/store-settings`
Salva configurações (com upload de logo)

#### `GET /dashboard/orders`
Lista pré-pedidos recebidos

---

## 🔧 Funções Auxiliares

### `isStoreConfigured(store)`
Verifica se a loja está configurada

```javascript
const configured = isStoreConfigured(store);
// true se: tem logo + cores customizadas
```

### `buildWhatsAppMessage(data)`
Gera mensagem formatada para WhatsApp

```javascript
const message = buildWhatsAppMessage({
  storeName: "Boutique da Carol",
  customer: { name: "Maria", whatsapp: "11999999999" },
  items: [...],
  note: "Observação"
});
```

Retorna:
```
🏪 *Loja:* Boutique da Carol

👤 *Cliente:* Maria
📱 *WhatsApp:* 11999999999
📍 *Localidade:* São Paulo / SP

🛍️ *Pedido pré-montado:*

1. *Vestido Floral* (M) - Floral
   Quantidade: 2 - R$ 129,90

⚠️ _Por favor, confirmar frete e forma de pagamento._
```

### `buildWhatsAppUrl(phoneNumber, message)`
Gera URL do WhatsApp

```javascript
const url = buildWhatsAppUrl('5511999999999', message);
// https://wa.me/5511999999999?text=...
```

---

## 🚀 Evolução Futura

### Como Adicionar Pagamento Online

1. **Criar módulo `PaymentService`**:
   - Integrar com gateway (Stripe, PagSeguro, Mercado Pago)
   - Converter `pre_order` em `order` definitivo após pagamento

2. **Adicionar campo `payment_status` em `orders`**:
   - `pending`, `paid`, `refunded`

3. **Fluxo**:
   - Cliente escolhe forma de pagamento antes de finalizar
   - Sistema processa pagamento
   - Se aprovado, cria `order` e envia confirmação

### Como Adicionar Cálculo de Frete

1. **Criar módulo `FreightService`**:
   - Integrar com API dos Correios / Melhor Envio

2. **Adicionar campos em `pre_orders`**:
   - `freight_method`, `freight_cost_cents`, `freight_deadline`

3. **Fluxo**:
   - Cliente informa CEP
   - Sistema calcula opções de frete
   - Cliente escolhe antes de finalizar

### Como Adicionar Nota Fiscal

1. **Integrar com API de NF-e** (ex: NFe.io, Plugnotas)
2. **Criar pipeline**: `order` → emitir NF-e → salvar chave/XML
3. **Enviar por email automaticamente**

### Arquitetura Preparada

A arquitetura atual **não será quebrada** ao adicionar esses módulos:
- `pre_orders` continua como rastro inicial
- Novos módulos se conectam via eventos/hooks
- Banco de dados já preparado para expansão

---

## 🛠️ Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Node.js | 16+ | Runtime |
| Express | 4.x | Framework web |
| SQLite | 5.x | Banco de dados |
| EJS | 3.x | Template engine |
| Multer | 1.x | Upload de arquivos |
| bcryptjs | 2.x | Criptografia de senhas |
| express-session | 1.x | Gerenciamento de sessões |

---

## 📝 Scripts Disponíveis

```bash
# Instalar dependências
npm install

# Inicializar banco de dados (rodar apenas uma vez)
npm run init-db

# Iniciar servidor (produção)
npm start

# Iniciar servidor com auto-reload (desenvolvimento)
npm run dev

# Executar testes (futuro)
npm test
```

---

## 🐛 Troubleshooting

### Erro: "SQLITE_CANTOPEN"
- Execute `npm run init-db` para criar o banco

### Logo não aparece
- Verifique se a pasta `public/uploads` existe e tem permissões
- Confirme que o arquivo foi enviado com sucesso

### WhatsApp não abre
- Verifique se o número da fábrica está correto em `.env`
- Formato: `5511999999999` (código do país + DDD + número)

### Erro ao fazer upload
- Tamanho máximo: 5MB
- Formatos aceitos: JPG, PNG, GIF, WEBP

---

## 📄 Licença

MIT

---

## 👥 Contato

Para dúvidas ou sugestões, entre em contato com a equipe de desenvolvimento.

---

## 🎉 Créditos

Desenvolvido para **CJota** - Sistema de Catálogo Personalizado v1.0

---

**Última atualização:** Janeiro 2026
