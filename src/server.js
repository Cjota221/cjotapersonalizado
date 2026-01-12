// Servidor principal da aplicação
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const { injectSiteSettings } = require('./utils/theme-helpers');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// Sessões
app.use(session({
  secret: process.env.SESSION_SECRET || 'seu-secret-aqui',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // em produção, usar true com HTTPS
}));

// Injetar configurações de tema em todas as views
app.use(injectSiteSettings);

// Rotas
const apiRoutes = require('./routes/api');
const storeRoutes = require('./routes/store');
const dashboardRoutes = require('./routes/dashboard');
const bulkImportRoutes = require('./routes/bulk-import');

app.use('/api', apiRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/dashboard', bulkImportRoutes);
app.use('/', storeRoutes);

// Rota raiz (index)
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Sistema de Catálogo Personalizado'
  });
});

// Tratamento de erros 404
app.use((req, res) => {
  res.status(404).render('404', {
    message: 'Página não encontrada'
  });
});

// Tratamento de erros gerais
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).render('error', {
    message: 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\nServidor rodando em http://localhost:${PORT}`);
  console.log(`\nRotas disponíveis:`);
  console.log(`   - Home: http://localhost:${PORT}`);
  console.log(`   - Loja exemplo: http://localhost:${PORT}/boutique-carol`);
  console.log(`   - Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`   - API: http://localhost:${PORT}/api/stores/:slug`);
  console.log(`\nPara inicializar o banco de dados: npm run init-db\n`);
});

module.exports = app;
