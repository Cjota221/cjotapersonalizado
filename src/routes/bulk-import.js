// ====================================
// ROTAS: CADASTRO EM MASSA DE PRODUTOS
// Sistema de Pedidos por Encomenda - CJota
// ====================================

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const BulkImportService = require('../services/BulkImportService');
const Database = require('../db/database');

const db = new Database();
const bulkService = new BulkImportService();

// Configuração do multer para upload em massa
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'uploads', 'bulk-import'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const uploadMultiple = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Apenas imagens são permitidas!'));
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB por arquivo
});

// Middleware de autenticação (simplificado)
function requireAuth(req, res, next) {
  req.userId = 1; // TODO: Implementar auth real
  req.storeId = 1; // TODO: Buscar do usuário
  next();
}

// ====================================
// ROTAS DE VISUALIZAÇÃO (DASHBOARD)
// ====================================

/**
 * GET /dashboard/cadastro-massa
 * Tela inicial - Upload de arquivos
 */
router.get('/cadastro-massa', requireAuth, async (req, res) => {
  try {
    const store = await db.get('SELECT * FROM stores WHERE id = ?', [req.storeId]);
    
    // Buscar importações recentes
    const recentImports = await db.all(
      `SELECT * FROM bulk_imports 
       WHERE store_id = ? 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.storeId]
    );
    
    res.render('dashboard/bulk-import/upload', {
      store,
      recentImports
    });
  } catch (error) {
    console.error('Erro ao carregar página de cadastro em massa:', error);
    res.status(500).render('error', { message: 'Erro ao carregar página' });
  }
});

/**
 * GET /dashboard/cadastro-massa/:id/agrupamento
 * Tela de agrupamento de imagens
 */
router.get('/cadastro-massa/:id/agrupamento', requireAuth, async (req, res) => {
  try {
    const store = await db.get('SELECT * FROM stores WHERE id = ?', [req.storeId]);
    const importData = await db.get('SELECT * FROM bulk_imports WHERE id = ? AND store_id = ?', [req.params.id, req.storeId]);
    
    if (!importData) {
      return res.status(404).render('error', { message: 'Importação não encontrada' });
    }
    
    const drafts = await bulkService.getDraftProducts(req.params.id);
    
    res.render('dashboard/bulk-import/grouping', {
      store,
      importData,
      drafts
    });
  } catch (error) {
    console.error('Erro ao carregar agrupamento:', error);
    res.status(500).render('error', { message: 'Erro ao carregar agrupamento' });
  }
});

/**
 * GET /dashboard/cadastro-massa/:id/configuracoes
 * Tela de configurações padrão do lote
 */
router.get('/cadastro-massa/:id/configuracoes', requireAuth, async (req, res) => {
  try {
    const store = await db.get('SELECT * FROM stores WHERE id = ?', [req.storeId]);
    const importData = await db.get('SELECT * FROM bulk_imports WHERE id = ? AND store_id = ?', [req.params.id, req.storeId]);
    
    if (!importData) {
      return res.status(404).render('error', { message: 'Importação não encontrada' });
    }
    
    const defaultSettings = importData.default_settings ? JSON.parse(importData.default_settings) : {};
    
    res.render('dashboard/bulk-import/settings', {
      store,
      importData,
      defaultSettings
    });
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    res.status(500).render('error', { message: 'Erro ao carregar configurações' });
  }
});

/**
 * GET /dashboard/cadastro-massa/:id/revisao
 * Tela de revisão em lote (principal)
 */
router.get('/cadastro-massa/:id/revisao', requireAuth, async (req, res) => {
  try {
    const store = await db.get('SELECT * FROM stores WHERE id = ?', [req.storeId]);
    const importData = await db.get('SELECT * FROM bulk_imports WHERE id = ? AND store_id = ?', [req.params.id, req.storeId]);
    
    if (!importData) {
      return res.status(404).render('error', { message: 'Importação não encontrada' });
    }
    
    const drafts = await bulkService.getDraftProducts(req.params.id);
    
    res.render('dashboard/bulk-import/review', {
      store,
      importData,
      drafts
    });
  } catch (error) {
    console.error('Erro ao carregar revisão:', error);
    res.status(500).render('error', { message: 'Erro ao carregar revisão' });
  }
});

// ====================================
// ROTAS DE API (AJAX)
// ====================================

/**
 * POST /dashboard/cadastro-massa/upload
 * Processa upload de arquivos
 */
router.post('/cadastro-massa/upload', requireAuth, uploadMultiple.array('images', 100), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    // Criar processo de importação
    const importId = await bulkService.createBulkImport(req.storeId, req.userId);
    
    // Processar arquivos em background (ou sícrono para MVP)
    const defaultSettings = {
      price_cents: req.body.default_price ? parseInt(req.body.default_price) * 100 : null,
      stock_quantity: req.body.default_stock ? parseInt(req.body.default_stock) : null,
      category: req.body.default_category || null,
      tags: req.body.default_tags ? req.body.default_tags.split(',') : []
    };
    
    await bulkService.processUploadedFiles(importId, req.files, defaultSettings);
    
    res.json({ 
      success: true, 
      importId,
      message: `${req.files.length} arquivos processados`,
      nextStep: `/dashboard/cadastro-massa/${importId}/revisao`
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dashboard/cadastro-massa/:id/apply-defaults
 * Aplica configurações padrão a todos os rascunhos
 */
router.post('/cadastro-massa/:id/apply-defaults', requireAuth, async (req, res) => {
  try {
    const settings = {
      price_cents: req.body.price_cents ? parseInt(req.body.price_cents) : undefined,
      stock_quantity: req.body.stock_quantity ? parseInt(req.body.stock_quantity) : undefined,
      category: req.body.category,
      tags: req.body.tags ? req.body.tags.split(',').map(t => t.trim()) : undefined
    };
    
    await bulkService.applyDefaultSettingsToDrafts(req.params.id, settings);
    
    res.json({ success: true, message: 'Configurações aplicadas a todos os produtos' });
  } catch (error) {
    console.error('Erro ao aplicar configurações:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /dashboard/cadastro-massa/draft/:id
 * Atualiza um rascunho específico
 */
router.put('/cadastro-massa/draft/:id', requireAuth, async (req, res) => {
  try {
    await bulkService.updateDraftProduct(req.params.id, req.body);
    res.json({ success: true, message: 'Rascunho atualizado' });
  } catch (error) {
    console.error('Erro ao atualizar rascunho:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dashboard/cadastro-massa/draft/:id/split
 * Divide um rascunho em dois
 */
router.post('/cadastro-massa/draft/:id/split', requireAuth, async (req, res) => {
  try {
    const { imageIds } = req.body;
    const newDraftId = await bulkService.splitDraftProduct(req.params.id, imageIds);
    res.json({ success: true, newDraftId });
  } catch (error) {
    console.error('Erro ao dividir rascunho:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dashboard/cadastro-massa/draft/:id/merge
 * Une múltiplos rascunhos
 */
router.post('/cadastro-massa/draft/:id/merge', requireAuth, async (req, res) => {
  try {
    const { sourceDraftIds } = req.body;
    await bulkService.mergeDraftProducts(req.params.id, sourceDraftIds);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao unir rascunhos:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dashboard/cadastro-massa/draft/:id/set-main-image
 * Define imagem principal
 */
router.post('/cadastro-massa/draft/:id/set-main-image', requireAuth, async (req, res) => {
  try {
    const { imageId } = req.body;
    await bulkService.setMainImage(req.params.id, imageId);
    res.json({ success: true });
  } catch (error) {
    console.error('Erro ao definir imagem principal:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /dashboard/cadastro-massa/:id/create-products
 * Cria produtos reais no catálogo
 */
router.post('/cadastro-massa/:id/create-products', requireAuth, async (req, res) => {
  try {
    const result = await bulkService.createProductsFromDrafts(req.params.id);
    
    res.json({ 
      success: true, 
      message: `${result.createdCount} produtos criados com sucesso`,
      createdCount: result.createdCount,
      errorCount: result.errorCount
    });
  } catch (error) {
    console.error('Erro ao criar produtos:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
