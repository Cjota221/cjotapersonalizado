# 🚀 Deploy no Render.com

## Passo a Passo (5 minutos)

### 1. Acesse o Render
👉 https://render.com/
- Crie conta (pode usar GitHub)

### 2. Criar Web Service
1. Click em **"New +"** → **"Web Service"**
2. Conecte seu repositório: `Cjota221/cjotapersonalizado`
3. Configurações:
   - **Name**: `cjota-catalogo`
   - **Region**: `Oregon (US West)` ou mais próximo
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Configurar Variáveis de Ambiente
No painel do Render, vá em **"Environment"** e adicione:

```
NODE_ENV=production
PORT=10000
SESSION_SECRET=seu_secret_super_seguro_aqui_min_32_caracteres
SUPABASE_URL=https://rqlirjpkxlxmnzqcuhtc.supabase.co
SUPABASE_ANON_KEY=eyJhbGci...VL1I
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...Lx4s
FACTORY_WHATSAPP_NUMBER=+55XXXXXXXXXXX
```

**⚠️ IMPORTANTE:** Copie as chaves do seu arquivo `.env` local!

### 4. Deploy
Click em **"Create Web Service"** e aguarde ~5 minutos.

### 5. Executar Schema no Supabase
Antes de usar, execute o schema no Supabase:

1. Acesse: https://supabase.com/dashboard/project/rqlirjpkxlxmnzqcuhtc/sql
2. Copie e cole TODO conteúdo de `src/db/supabase-schema.sql`
3. Click em **"Run"**

### 6. Acessar Aplicação
Seu site estará em: `https://cjota-catalogo.onrender.com`

---

## 📝 Notas

### Plano Free do Render:
- ✅ 750 horas/mês (suficiente para 1 app)
- ⚠️ Entra em "sleep" após 15min sem uso (primeira requisição demora ~30s)
- ✅ SSL automático (HTTPS)
- ✅ Deploy automático a cada git push

### Desativar Sleep (upgrade $7/mês):
Se quiser app sempre online:
1. Upgrade para **Starter Plan**
2. App responde instantaneamente 24/7

---

## 🔧 Alternativas

### Railway.app
```bash
# Instalar CLI
npm install -g railway

# Login e deploy
railway login
railway init
railway up
```

### Vercel (serverless)
⚠️ Requer refatoração do código para serverless functions

---

## 🆘 Troubleshooting

### Erro "Module not found"
```bash
git add .
git commit -m "fix: add missing dependencies"
git push
```

### Erro de porta
Render passa a porta via variável `PORT=10000`. Seu código já está correto:
```javascript
const PORT = process.env.PORT || 3000;
```

### Uploads não funcionam
Use **Supabase Storage** em vez de filesystem local:
- Render não persiste arquivos entre deploys
- Já implementamos o método `uploadImage()` no wrapper

---

## ✅ Checklist Pré-Deploy

- [x] Schema SQL pronto (`supabase-schema.sql`)
- [x] Variáveis de ambiente configuradas
- [x] `render.yaml` criado
- [x] `package.json` com engine Node.js
- [x] Código no GitHub
- [ ] Executar schema no Supabase
- [ ] Configurar env vars no Render
- [ ] Primeiro deploy
