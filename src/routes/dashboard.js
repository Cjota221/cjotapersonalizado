// Rotas do painel da revendedora (dashboard)
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Database = require('../db/database');
const { isStoreConfigured } = require('../utils/helpers');
const { loadSiteSettings, saveSiteSettings, loadActiveBanners } = require('../utils/theme-helpers');

const db = new Database();

// Configuração do multer para upload de logos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
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
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// Middleware simples de autenticação (em produção, usar sessões reais)
function requireAuth(req, res, next) {
  // TODO: Implementar autenticação real com sessões
  // Por enquanto, usando store ID fixo para demonstração
  req.userId = 1;
  next();
}

// GET /dashboard - Página inicial do dashboard
router.get('/', requireAuth, async (req, res) => {
  try {
    // Buscar loja do usuário logado (assumindo owner_id = userId)
    const store = await db.get(
      'SELECT * FROM stores WHERE owner_id = ?',
      [req.userId]
    );

    if (!store) {
      return res.status(404).render('error', { 
        message: 'Loja não encontrada' 
      });
    }

    if (store.colors) store.colors = JSON.parse(store.colors);
    if (store.theme_settings) store.theme_settings = JSON.parse(store.theme_settings);

    const configured = isStoreConfigured(store);

    // Buscar estatísticas básicas
    const totalOrders = await db.get(
      'SELECT COUNT(*) as count FROM pre_orders WHERE store_id = ?',
      [store.id]
    );

    const totalProducts = await db.get(
      'SELECT COUNT(*) as count FROM reseller_products WHERE store_id = ? AND active = 1',
      [store.id]
    );

    res.render('dashboard/index', {
      store,
      configured,
      stats: {
        totalOrders: totalOrders.count,
        totalProducts: totalProducts.count
      }
    });
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar dashboard' 
    });
  }
});

// GET /dashboard/store-settings - Configurações da loja
router.get('/store-settings', requireAuth, async (req, res) => {
  try {
    const store = await db.get(
      'SELECT * FROM stores WHERE owner_id = ?',
      [req.userId]
    );

    if (!store) {
      return res.status(404).render('error', { 
        message: 'Loja não encontrada' 
      });
    }

    if (store.colors) store.colors = JSON.parse(store.colors);
    if (store.theme_settings) store.theme_settings = JSON.parse(store.theme_settings);

    res.render('dashboard/store-settings', { store });
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar configurações' 
    });
  }
});

// POST /dashboard/store-settings - Salvar configurações
router.post('/store-settings', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    const store = await db.get(
      'SELECT * FROM stores WHERE owner_id = ?',
      [req.userId]
    );

    if (!store) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    // Preparar dados para atualização
    const updateData = {};

    // Logo upload
    if (req.file) {
      updateData.logo_url = `/uploads/${req.file.filename}`;
    }

    // Cores
    if (req.body.colors) {
      updateData.colors = req.body.colors;
    } else if (req.body.primary || req.body.button || req.body.background) {
      const colors = {
        primary: req.body.primary || '#000000',
        button: req.body.button || '#007bff',
        background: req.body.background || '#ffffff',
        secondary: req.body.secondary || '#6c757d'
      };
      updateData.colors = JSON.stringify(colors);
    }

    // Theme settings
    if (req.body.theme_settings) {
      updateData.theme_settings = req.body.theme_settings;
    } else if (req.body.card_border || req.body.button_shape) {
      const themeSettings = {
        card_border: req.body.card_border || 'rounded',
        button_shape: req.body.button_shape || 'pill'
      };
      updateData.theme_settings = JSON.stringify(themeSettings);
    }

    // Atualizar no banco
    await db.updateStore(store.id, updateData);

    // Verificar se está configurada agora
    const updatedStore = await db.getStoreById(store.id);
    const configured = isStoreConfigured(updatedStore);

    if (configured && !store.loja_configurada) {
      await db.run(
        'UPDATE stores SET loja_configurada = 1 WHERE id = ?',
        [store.id]
      );
    }

    res.json({ 
      success: true, 
      message: 'Configurações salvas com sucesso!',
      configured
    });
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.status(500).json({ error: 'Erro ao salvar configurações' });
  }
});

// GET /dashboard/orders - Listar pré-pedidos
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const store = await db.get(
      'SELECT * FROM stores WHERE owner_id = ?',
      [req.userId]
    );

    if (!store) {
      return res.status(404).render('error', { 
        message: 'Loja não encontrada' 
      });
    }

    const orders = await db.getPreOrdersByStore(store.id);

    res.render('dashboard/orders', { 
      store,
      orders 
    });
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar pedidos' 
    });
  }
});

// GET /dashboard/produtos - Listar produtos
router.get('/produtos', requireAuth, async (req, res) => {
  try {
    const store = await db.get(
      'SELECT * FROM stores WHERE owner_id = ?',
      [req.userId]
    );

    if (!store) {
      return res.status(404).render('error', { 
        message: 'Loja não encontrada' 
      });
    }

    // Buscar produtos com suas variantes
    const products = await db.all(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.images,
        p.sku as product_sku,
        rp.price_cents_override,
        rp.active,
        rp.margin_percent,
        GROUP_CONCAT(DISTINCT pv.size) as sizes,
        GROUP_CONCAT(DISTINCT pv.color) as colors,
        SUM(pv.stock) as stock_quantity,
        MIN(pv.price_cents) as min_price_cents
      FROM reseller_products rp
      JOIN products p ON rp.product_id = p.id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE rp.store_id = ?
      GROUP BY p.id, rp.id
      ORDER BY p.created_at DESC
    `, [store.id]);

    // Processar produtos para extrair primeira imagem do JSON
    const processedProducts = products.map(product => {
      let image_url = null;
      if (product.images) {
        try {
          const images = JSON.parse(product.images);
          image_url = images && images.length > 0 ? images[0] : null;
        } catch (e) {
          image_url = null;
        }
      }
      
      return {
        ...product,
        image_url,
        price_cents: product.price_cents_override || product.min_price_cents,
        sku: product.product_sku
      };
    });

    res.render('dashboard/produtos', { 
      store,
      products: processedProducts 
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar produtos' 
    });
  }
});

// GET /dashboard/branding - Página de personalização do site
router.get('/branding', requireAuth, async (req, res) => {
  try {
    const siteSettings = await loadSiteSettings();
    const activeBanners = await loadActiveBanners();
    
    res.render('dashboard/branding', {
      siteSettings,
      activeBanners,
      success: req.query.success,
      error: req.query.error
    });
  } catch (error) {
    console.error('Erro ao carregar página de branding:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar configurações de branding' 
    });
  }
});

// POST /dashboard/branding - Salvar configurações de branding
router.post('/branding', requireAuth, upload.single('logo'), async (req, res) => {
  try {
    const updates = {
      site_name: req.body.site_name,
      site_description: req.body.site_description,
      whatsapp_number: req.body.whatsapp_number,
      email: req.body.email,
      color_primary: req.body.color_primary,
      color_secondary: req.body.color_secondary,
      color_accent: req.body.color_accent,
      color_success: req.body.color_success,
      color_warning: req.body.color_warning,
      color_error: req.body.color_error
    };
    
    // Se houver upload de logo
    if (req.file) {
      updates.logo_url = '/uploads/' + req.file.filename;
    }
    
    await saveSiteSettings(updates);
    
    res.redirect('/dashboard/branding?success=Configurações salvas com sucesso!');
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    res.redirect('/dashboard/branding?error=Erro ao salvar configurações');
  }
});

module.exports = router;
