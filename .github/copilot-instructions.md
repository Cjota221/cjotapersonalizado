# Sistema de Catálogo Personalizado - CJota

## Sobre o Projeto

Sistema completo de catálogo online personalizado por revendedora/franqueada com integração WhatsApp.

### Stack Técnica
- **Backend**: Node.js + Express
- **Banco de Dados**: SQLite
- **Front-end**: EJS (Server-Side Rendering)
- **Upload**: Multer
- **Autenticação**: express-session + bcryptjs

### Características Principais
- ✅ Personalização visual por loja (logo, cores, estilos)
- ✅ Catálogo de produtos com variações (tamanhos/grades)
- ✅ Montagem de pedidos pelo cliente
- ✅ Finalização via WhatsApp (sem pagamento online)
- ✅ Dashboard administrativo para revendedoras
- ✅ Sistema de pré-pedidos com tracking

### Limitações Intencionais
- ❌ Sem pagamento online
- ❌ Sem cálculo de frete
- ❌ Sem emissão automática de NF

Essas funcionalidades são tratadas manualmente via WhatsApp.

## Como Usar

### Inicializar o Projeto
```bash
npm install
npm run init-db
npm start
```

### Acessar
- Home: http://localhost:3000
- Loja exemplo: http://localhost:3000/boutique-carol
- Dashboard: http://localhost:3000/dashboard

### Credenciais de Teste
- Email: carol@example.com
- Senha: senha123

## Estrutura do Projeto

```
src/
├── db/           # Banco de dados (schema, init, wrapper)
├── routes/       # Rotas (API, loja pública, dashboard)
├── utils/        # Funções auxiliares
├── views/        # Templates EJS
└── server.js     # Servidor principal

public/
├── css/          # Estilos
└── uploads/      # Logos das lojas
```

## Desenvolvimento

Para desenvolvimento com auto-reload:
```bash
npm run dev
```

Para rodar testes:
```bash
npm test
```

## Documentação Completa

Consulte o `README.md` para documentação detalhada sobre:
- Modelagem de dados
- API REST
- Fluxos de uso
- Evolução futura
