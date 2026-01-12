// Inicialização do banco de dados
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');
const schemaBrandingPath = path.join(__dirname, 'schema-branding.sql');

console.log('Inicializando banco de dados...');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erro ao abrir banco de dados:', err);
    process.exit(1);
  }
  console.log('Conectado ao banco de dados SQLite');
});

// Ler e executar schema
const schema = fs.readFileSync(schemaPath, 'utf8');
const schemaBranding = fs.readFileSync(schemaBrandingPath, 'utf8');

db.exec(schema, (err) => {
  if (err) {
    console.error('Erro ao criar schema:', err);
    db.close();
    process.exit(1);
  }
  console.log('Schema criado com sucesso');

  // Criar tabelas de branding
  db.exec(schemaBranding, (err) => {
    if (err) {
      console.error('Erro ao criar schema de branding:', err);
      db.close();
      process.exit(1);
    }
    console.log('Schema de branding criado com sucesso');

    // Inserir dados de exemplo
    insertSampleData();
  });
});

async function insertSampleData() {
  const passwordHash = await bcrypt.hash('senha123', 10);

  // Usuário de exemplo
  db.run(
    `INSERT OR IGNORE INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
    ['carol@example.com', passwordHash, 'Carol'],
    function (err) {
      if (err) {
        console.error('Erro ao inserir usuário:', err);
      } else {
        console.log('Usuário de exemplo criado (email: carol@example.com, senha: senha123)');
        
        const userId = this.lastID || 1;
        
        // Loja de exemplo
        db.run(
          `INSERT OR IGNORE INTO stores (owner_id, slug, store_name, colors, theme_settings, loja_configurada) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            userId,
            'boutique-carol',
            'Boutique da Carol',
            JSON.stringify({
              primary: '#ff69b4',
              button: '#ff1493',
              background: '#fff5f7'
            }),
            JSON.stringify({
              card_border: 'rounded',
              button_shape: 'pill'
            }),
            0
          ],
          function (err) {
            if (err) {
              console.error('Erro ao inserir loja:', err);
            } else {
              console.log('Loja de exemplo criada (slug: boutique-carol)');
              const storeId = this.lastID || 1;
              
              // Produtos de exemplo
              insertSampleProducts(storeId);
            }
          }
        );
      }
    }
  );
}

function insertSampleProducts(storeId) {
  const products = [
    {
      sku: 'VEST001',
      name: 'Vestido Floral Primavera',
      description: 'Lindo vestido floral perfeito para a primavera',
      images: JSON.stringify(['/images/vestido-floral-1.jpg', '/images/vestido-floral-2.jpg'])
    },
    {
      sku: 'BLUSA001',
      name: 'Blusa Lisa Básica',
      description: 'Blusa lisa em diversas cores, peça essencial no guarda-roupa',
      images: JSON.stringify(['/images/blusa-lisa-1.jpg'])
    }
  ];

  products.forEach((product, index) => {
    db.run(
      `INSERT OR IGNORE INTO products (sku, name, description, images, active) VALUES (?, ?, ?, ?, ?)`,
      [product.sku, product.name, product.description, product.images, 1],
      function (err) {
        if (err) {
          console.error('Erro ao inserir produto:', err);
        } else {
          const productId = this.lastID || (index + 1);
          console.log(`Produto criado: ${product.name}`);
          
          // Variações do produto
          const variants = index === 0 
            ? [
                { size: 'P', color: 'Floral', stock: 10, price_cents: 12990 },
                { size: 'M', color: 'Floral', stock: 15, price_cents: 12990 },
                { size: 'G', color: 'Floral', stock: 8, price_cents: 12990 }
              ]
            : [
                { size: 'P', color: 'Branca', stock: 20, price_cents: 4990 },
                { size: 'M', color: 'Branca', stock: 25, price_cents: 4990 },
                { size: 'G', color: 'Branca', stock: 15, price_cents: 4990 },
                { size: 'P', color: 'Preta', stock: 18, price_cents: 4990 },
                { size: 'M', color: 'Preta', stock: 22, price_cents: 4990 }
              ];

          variants.forEach(variant => {
            db.run(
              `INSERT OR IGNORE INTO product_variants (product_id, size, color, stock, price_cents, active) 
               VALUES (?, ?, ?, ?, ?, ?)`,
              [productId, variant.size, variant.color, variant.stock, variant.price_cents, 1]
            );
          });

          // Vincular produto à loja
          db.run(
            `INSERT OR IGNORE INTO reseller_products (store_id, product_id, active) VALUES (?, ?, ?)`,
            [storeId, productId, 1]
          );
        }
      }
    );
  });

  // Configurações padrão do site
  db.run(
    `INSERT OR IGNORE INTO site_settings (
      id, site_name, site_description, whatsapp_number
    ) VALUES (?, ?, ?, ?)`,
    [1, 'CJota Catálogo', 'Catálogo profissional de produtos', '5511999999999'],
    (err) => {
      if (err) {
        console.error('Erro ao inserir configurações do site:', err);
      } else {
        console.log('Configurações do site criadas');
      }
    }
  );

  // Banner de exemplo
  db.run(
    `INSERT OR IGNORE INTO site_banners (
      title, subtitle, image_url, link_url, link_text, display_order, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      'Nova Coleção',
      'Descubra as últimas tendências',
      '/images/banner-colecao.jpg',
      '/produtos',
      'Ver Produtos',
      1,
      1
    ],
    (err) => {
      if (err) {
        console.error('Erro ao inserir banner:', err);
      } else {
        console.log('Banner de exemplo criado');
      }
    }
  );

  console.log('\nBanco de dados inicializado com sucesso!');
  console.log('Execute "npm start" para iniciar o servidor.');
  
  db.close();
}
