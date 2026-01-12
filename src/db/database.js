// Wrapper para operações do banco de dados
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
      }
    });
  }

  // Métodos utilitários
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // Métodos específicos para stores
  async getStoreBySlug(slug) {
    const store = await this.get(
      `SELECT * FROM stores WHERE slug = ?`,
      [slug]
    );
    if (store && store.colors) {
      store.colors = JSON.parse(store.colors);
    }
    if (store && store.theme_settings) {
      store.theme_settings = JSON.parse(store.theme_settings);
    }
    return store;
  }

  async getStoreById(id) {
    const store = await this.get(
      `SELECT * FROM stores WHERE id = ?`,
      [id]
    );
    if (store && store.colors) {
      store.colors = JSON.parse(store.colors);
    }
    if (store && store.theme_settings) {
      store.theme_settings = JSON.parse(store.theme_settings);
    }
    return store;
  }

  async updateStore(id, data) {
    const { logo_url, colors, theme_settings, loja_configurada } = data;
    return this.run(
      `UPDATE stores 
       SET logo_url = COALESCE(?, logo_url),
           colors = COALESCE(?, colors),
           theme_settings = COALESCE(?, theme_settings),
           loja_configurada = COALESCE(?, loja_configurada)
       WHERE id = ?`,
      [logo_url, colors, theme_settings, loja_configurada, id]
    );
  }

  // Métodos para produtos
  async getProductsByStore(storeId) {
    const sql = `
      SELECT p.*, 
             rp.price_cents_override,
             rp.margin_percent
      FROM products p
      INNER JOIN reseller_products rp ON p.id = rp.product_id
      WHERE rp.store_id = ? 
        AND p.active = 1 
        AND rp.active = 1
      ORDER BY p.created_at DESC
    `;
    const products = await this.all(sql, [storeId]);
    return products.map(p => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : []
    }));
  }

  async getProductById(id) {
    const product = await this.get(
      `SELECT * FROM products WHERE id = ?`,
      [id]
    );
    if (product && product.images) {
      product.images = JSON.parse(product.images);
    }
    return product;
  }

  async getProductVariants(productId) {
    return this.all(
      `SELECT * FROM product_variants 
       WHERE product_id = ? AND active = 1
       ORDER BY size, color`,
      [productId]
    );
  }

  // Métodos para pré-pedidos
  async createPreOrder(data) {
    const {
      store_id,
      customer_name,
      customer_whatsapp,
      customer_city,
      customer_state,
      items,
      note,
      whatsapp_message
    } = data;

    const result = await this.run(
      `INSERT INTO pre_orders 
       (store_id, customer_name, customer_whatsapp, customer_city, customer_state, items, note, whatsapp_message, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        store_id,
        customer_name,
        customer_whatsapp,
        customer_city,
        customer_state,
        JSON.stringify(items),
        note,
        whatsapp_message
      ]
    );

    return this.get(`SELECT * FROM pre_orders WHERE id = ?`, [result.id]);
  }

  async getPreOrdersByStore(storeId) {
    const orders = await this.all(
      `SELECT * FROM pre_orders WHERE store_id = ? ORDER BY created_at DESC`,
      [storeId]
    );
    return orders.map(o => ({
      ...o,
      items: JSON.parse(o.items)
    }));
  }

  close() {
    this.db.close();
  }
}

module.exports = Database;
