// Rotas da API REST
const express = require('express');
const router = express.Router();
const Database = require('../db/database');
const { buildWhatsAppMessage, buildWhatsAppUrl } = require('../utils/helpers');

const db = new Database();

// GET /api/stores/:slug - Obter dados da loja
router.get('/stores/:slug', async (req, res) => {
  try {
    const store = await db.getStoreBySlug(req.params.slug);
    
    if (!store) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    // Retornar apenas dados públicos
    res.json({
      id: store.id,
      slug: store.slug,
      store_name: store.store_name,
      logo_url: store.logo_url,
      colors: store.colors,
      theme_settings: store.theme_settings,
      loja_configurada: store.loja_configurada
    });
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    res.status(500).json({ error: 'Erro ao buscar loja' });
  }
});

// GET /api/stores/:slug/products - Listar produtos da loja
router.get('/stores/:slug/products', async (req, res) => {
  try {
    const store = await db.getStoreBySlug(req.params.slug);
    
    if (!store) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    const products = await db.getProductsByStore(store.id);

    // Buscar variações para cada produto
    const productsWithVariants = await Promise.all(
      products.map(async (product) => {
        const variants = await db.getProductVariants(product.id);
        return {
          ...product,
          variants,
          final_price: product.price_cents_override || 
            (variants.length > 0 ? variants[0].price_cents : null)
        };
      })
    );

    res.json(productsWithVariants);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// GET /api/products/:id - Obter detalhes do produto
router.get('/products/:id', async (req, res) => {
  try {
    const product = await db.getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }

    const variants = await db.getProductVariants(product.id);

    res.json({
      ...product,
      variants
    });
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// POST /api/pre_orders - Criar pré-pedido
router.post('/pre_orders', async (req, res) => {
  try {
    const { store_slug, customer, items, note } = req.body;

    // Validações básicas
    if (!store_slug || !customer || !items || items.length === 0) {
      return res.status(400).json({ 
        error: 'Dados incompletos. Necessário: store_slug, customer, items' 
      });
    }

    if (!customer.name || !customer.whatsapp) {
      return res.status(400).json({ 
        error: 'Dados do cliente incompletos. Necessário: name, whatsapp' 
      });
    }

    // Buscar loja
    const store = await db.getStoreBySlug(store_slug);
    if (!store) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    // Construir mensagem do WhatsApp
    const message = buildWhatsAppMessage({
      storeName: store.store_name,
      customer,
      items,
      note
    });

    // Salvar pré-pedido no banco
    const preOrder = await db.createPreOrder({
      store_id: store.id,
      customer_name: customer.name,
      customer_whatsapp: customer.whatsapp,
      customer_city: customer.city,
      customer_state: customer.state,
      items,
      note,
      whatsapp_message: message
    });

    // Gerar URL do WhatsApp
    const factoryNumber = process.env.FACTORY_WHATSAPP_NUMBER || '5511999999999';
    const whatsappUrl = buildWhatsAppUrl(factoryNumber, message);

    res.json({
      success: true,
      preOrder: {
        id: preOrder.id,
        created_at: preOrder.created_at
      },
      whatsappUrl
    });
  } catch (error) {
    console.error('Erro ao criar pré-pedido:', error);
    res.status(500).json({ error: 'Erro ao criar pré-pedido' });
  }
});

// GET /api/pre_orders/:storeId - Listar pré-pedidos (para painel interno)
router.get('/pre_orders/:storeId', async (req, res) => {
  try {
    const orders = await db.getPreOrdersByStore(req.params.storeId);
    res.json(orders);
  } catch (error) {
    console.error('Erro ao buscar pré-pedidos:', error);
    res.status(500).json({ error: 'Erro ao buscar pré-pedidos' });
  }
});

module.exports = router;
