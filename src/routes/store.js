// Rotas para visualização das páginas públicas (loja)
const express = require('express');
const router = express.Router();
const Database = require('../db/database');
const { generateStoreCSS, formatPrice, isStoreConfigured } = require('../utils/helpers');

const db = new Database();

// Middleware para carregar dados da loja
async function loadStore(req, res, next) {
  try {
    const store = await db.getStoreBySlug(req.params.slug);
    
    if (!store) {
      return res.status(404).render('404', { 
        message: 'Loja não encontrada' 
      });
    }

    res.locals.store = store;
    res.locals.storeCSS = generateStoreCSS(store.colors);
    res.locals.isConfigured = isStoreConfigured(store);
    next();
  } catch (error) {
    console.error('Erro ao carregar loja:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar loja' 
    });
  }
}

// GET /:slug - Página inicial da loja
router.get('/:slug', loadStore, async (req, res) => {
  try {
    const products = await db.getProductsByStore(res.locals.store.id);

    // Carregar variações para mostrar preço
    const productsWithPrice = await Promise.all(
      products.map(async (product) => {
        const variants = await db.getProductVariants(product.id);
        const price = product.price_cents_override || 
          (variants.length > 0 ? variants[0].price_cents : null);
        
        return {
          ...product,
          price_formatted: formatPrice(price),
          first_image: product.images && product.images.length > 0 
            ? product.images[0] 
            : '/images/placeholder.jpg'
        };
      })
    );

    res.render('store/home', {
      store: res.locals.store,
      storeCSS: res.locals.storeCSS,
      products: productsWithPrice,
      isConfigured: res.locals.isConfigured
    });
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar produtos' 
    });
  }
});

// GET /:slug/products/:id - Página de detalhes do produto
router.get('/:slug/products/:id', loadStore, async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).render('404', { 
        message: 'Produto não encontrado' 
      });
    }

    const variants = await db.getProductVariants(product.id);

    res.render('store/product', {
      store: res.locals.store,
      storeCSS: res.locals.storeCSS,
      product,
      variants,
      formatPrice
    });
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    res.status(500).render('error', { 
      message: 'Erro ao carregar produto' 
    });
  }
});

// GET /:slug/cart - Página do carrinho
router.get('/:slug/cart', loadStore, (req, res) => {
  res.render('store/cart', {
    store: res.locals.store,
    storeCSS: res.locals.storeCSS,
    formatPrice
  });
});

module.exports = router;
