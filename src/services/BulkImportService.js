// ====================================
// SERVIÇO: CADASTRO EM MASSA DE PRODUTOS
// Sistema de Pedidos por Encomenda - CJota
// ====================================

const path = require('path');
const fs = require('fs').promises;
const Database = require('../db/database');

class BulkImportService {
  constructor() {
    this.db = new Database();
  }

  /**
   * Cria um novo processo de importação em massa
   */
  async createBulkImport(storeId, userId) {
    const result = await this.db.run(
      `INSERT INTO bulk_imports (store_id, user_id, status, total_files) 
       VALUES (?, ?, 'aguardando_processamento', 0)`,
      [storeId, userId]
    );
    
    return result.lastID;
  }

  /**
   * Processa arquivos enviados e cria rascunhos
   */
  async processUploadedFiles(importId, files, defaultSettings = {}) {
    try {
      // Atualizar status para processando
      await this.db.run(
        'UPDATE bulk_imports SET status = ?, total_files = ? WHERE id = ?',
        ['processando', files.length, importId]
      );

      // Agrupar arquivos por nome base (remove números e extensões)
      const groups = this.groupFilesByPattern(files);

      // Criar rascunhos para cada grupo
      let totalProducts = 0;
      for (const [groupKey, groupFiles] of Object.entries(groups)) {
        const productName = this.generateProductNameFromGroup(groupKey);
        
        // Criar rascunho de produto
        const draftId = await this.createDraftProduct(importId, {
          group_key: groupKey,
          name: productName,
          price_cents: defaultSettings.price_cents || null,
          stock_quantity: defaultSettings.stock_quantity || null,
          category: defaultSettings.category || null,
          tags: defaultSettings.tags ? JSON.stringify(defaultSettings.tags) : null,
          raw_data: JSON.stringify({
            original_filenames: groupFiles.map(f => f.originalname),
            auto_grouped: true
          })
        });

        // Criar imagens do rascunho
        for (let i = 0; i < groupFiles.length; i++) {
          const file = groupFiles[i];
          await this.createDraftImage(draftId, {
            url: `/uploads/bulk-import/${file.filename}`,
            filename: file.filename,
            original_filename: file.originalname,
            file_size: file.size,
            mime_type: file.mimetype,
            is_main: i === 0 ? 1 : 0, // Primeira imagem é principal
            sort_order: i
          });
        }

        totalProducts++;
      }

      // Atualizar importação para status de agrupamento/revisão
      await this.db.run(
        `UPDATE bulk_imports 
         SET status = 'revisao', 
             total_products_generated = ?,
             default_settings = ?
         WHERE id = ?`,
        [totalProducts, JSON.stringify(defaultSettings), importId]
      );

      return { success: true, totalProducts };
    } catch (error) {
      // Registrar erro
      await this.db.run(
        'UPDATE bulk_imports SET status = ?, error_message = ? WHERE id = ?',
        ['erro', error.message, importId]
      );
      throw error;
    }
  }

  /**
   * Agrupa arquivos por padrão de nome
   * Ex: "vestido-azul-1.jpg", "vestido-azul-2.jpg" -> grupo "vestido-azul"
   */
  groupFilesByPattern(files) {
    const groups = {};
    
    for (const file of files) {
      const basename = path.basename(file.originalname, path.extname(file.originalname));
      
      // Remove números finais e underscores/hífens
      const groupKey = basename
        .replace(/[-_]\d+$/, '')
        .replace(/\d+$/, '')
        .toLowerCase()
        .trim();
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(file);
    }
    
    return groups;
  }

  /**
   * Gera nome de produto a partir da chave do grupo
   */
  generateProductNameFromGroup(groupKey) {
    return groupKey
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Cria um rascunho de produto
   */
  async createDraftProduct(importId, data) {
    const result = await this.db.run(
      `INSERT INTO draft_products 
       (bulk_import_id, group_key, name, description, sku, price_cents, 
        stock_quantity, category, tags, status, raw_data, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho', ?, ?)`,
      [
        importId,
        data.group_key,
        data.name,
        data.description || null,
        data.sku || null,
        data.price_cents,
        data.stock_quantity,
        data.category,
        data.tags,
        data.raw_data,
        data.sort_order || 0
      ]
    );
    
    return result.lastID;
  }

  /**
   * Cria uma imagem de rascunho
   */
  async createDraftImage(draftProductId, data) {
    const result = await this.db.run(
      `INSERT INTO draft_images 
       (draft_product_id, url, filename, original_filename, file_size, 
        mime_type, is_main, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        draftProductId,
        data.url,
        data.filename,
        data.original_filename,
        data.file_size,
        data.mime_type,
        data.is_main,
        data.sort_order
      ]
    );
    
    return result.lastID;
  }

  /**
   * Busca todos os rascunhos de uma importação
   */
  async getDraftProducts(importId) {
    const drafts = await this.db.all(
      `SELECT 
        dp.*,
        GROUP_CONCAT(di.url) as image_urls,
        (SELECT di2.url FROM draft_images di2 WHERE di2.draft_product_id = dp.id AND di2.is_main = 1 LIMIT 1) as main_image_url
       FROM draft_products dp
       LEFT JOIN draft_images di ON dp.id = di.draft_product_id
       WHERE dp.bulk_import_id = ?
       GROUP BY dp.id
       ORDER BY dp.sort_order, dp.created_at`,
      [importId]
    );
    
    return drafts.map(draft => ({
      ...draft,
      image_urls: draft.image_urls ? draft.image_urls.split(',') : [],
      tags: draft.tags ? JSON.parse(draft.tags) : [],
      raw_data: draft.raw_data ? JSON.parse(draft.raw_data) : {}
    }));
  }

  /**
   * Atualiza um rascunho de produto
   */
  async updateDraftProduct(draftId, updates) {
    const fields = [];
    const values = [];
    
    const allowedFields = ['name', 'description', 'sku', 'price_cents', 'stock_quantity', 'category', 'tags', 'status'];
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        fields.push(`${field} = ?`);
        values.push(field === 'tags' ? JSON.stringify(updates[field]) : updates[field]);
      }
    }
    
    if (fields.length === 0) return;
    
    values.push(draftId);
    
    await this.db.run(
      `UPDATE draft_products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  /**
   * Aplica configurações padrão a múltiplos rascunhos
   */
  async applyDefaultSettingsToDrafts(importId, settings) {
    const updates = [];
    const params = [];
    
    if (settings.price_cents !== undefined) {
      updates.push('price_cents = ?');
      params.push(settings.price_cents);
    }
    
    if (settings.stock_quantity !== undefined) {
      updates.push('stock_quantity = ?');
      params.push(settings.stock_quantity);
    }
    
    if (settings.category !== undefined) {
      updates.push('category = ?');
      params.push(settings.category);
    }
    
    if (settings.tags !== undefined) {
      updates.push('tags = ?');
      params.push(JSON.stringify(settings.tags));
    }
    
    if (updates.length === 0) return;
    
    params.push(importId);
    
    await this.db.run(
      `UPDATE draft_products 
       SET ${updates.join(', ')}
       WHERE bulk_import_id = ? AND status = 'rascunho'`,
      params
    );
  }

  /**
   * Divide um rascunho em dois (separar imagens)
   */
  async splitDraftProduct(draftId, imagesToSplit) {
    // Buscar rascunho original
    const original = await this.db.get('SELECT * FROM draft_products WHERE id = ?', [draftId]);
    
    // Criar novo rascunho
    const newDraftId = await this.createDraftProduct(original.bulk_import_id, {
      group_key: `${original.group_key}-split-${Date.now()}`,
      name: `${original.name} (dividido)`,
      price_cents: original.price_cents,
      stock_quantity: original.stock_quantity,
      category: original.category,
      tags: original.tags,
      raw_data: JSON.stringify({ split_from: draftId })
    });
    
    // Mover imagens selecionadas para o novo rascunho
    await this.db.run(
      `UPDATE draft_images 
       SET draft_product_id = ?
       WHERE id IN (${imagesToSplit.map(() => '?').join(',')})`,
      [newDraftId, ...imagesToSplit]
    );
    
    return newDraftId;
  }

  /**
   * Une dois ou mais rascunhos em um só
   */
  async mergeDraftProducts(targetDraftId, sourceDraftIds) {
    // Mover todas as imagens para o rascunho alvo
    await this.db.run(
      `UPDATE draft_images 
       SET draft_product_id = ?
       WHERE draft_product_id IN (${sourceDraftIds.map(() => '?').join(',')})`,
      [targetDraftId, ...sourceDraftIds]
    );
    
    // Deletar rascunhos de origem
    await this.db.run(
      `DELETE FROM draft_products WHERE id IN (${sourceDraftIds.map(() => '?').join(',')})`,
      sourceDraftIds
    );
  }

  /**
   * Define qual imagem é a principal de um rascunho
   */
  async setMainImage(draftId, imageId) {
    // Remove "is_main" de todas as imagens do rascunho
    await this.db.run(
      'UPDATE draft_images SET is_main = 0 WHERE draft_product_id = ?',
      [draftId]
    );
    
    // Define a nova imagem principal
    await this.db.run(
      'UPDATE draft_images SET is_main = 1 WHERE id = ?',
      [imageId]
    );
    
    // Atualiza referência no rascunho
    await this.db.run(
      'UPDATE draft_products SET main_image_id = ? WHERE id = ?',
      [imageId, draftId]
    );
  }

  /**
   * Cria produtos reais no catálogo a partir dos rascunhos
   */
  async createProductsFromDrafts(importId) {
    try {
      const drafts = await this.db.all(
        'SELECT * FROM draft_products WHERE bulk_import_id = ? AND status = "rascunho"',
        [importId]
      );
      
      const importData = await this.db.get('SELECT store_id FROM bulk_imports WHERE id = ?', [importId]);
      
      let createdCount = 0;
      let errorCount = 0;
      
      for (const draft of drafts) {
        try {
          // Buscar imagens do rascunho
          const images = await this.db.all(
            'SELECT url FROM draft_images WHERE draft_product_id = ? ORDER BY sort_order',
            [draft.id]
          );
          
          // Criar produto na tabela products
          const productResult = await this.db.run(
            `INSERT INTO products (sku, name, description, images, active)
             VALUES (?, ?, ?, ?, 1)`,
            [
              draft.sku || `AUTO-${Date.now()}-${draft.id}`,
              draft.name,
              draft.description,
              JSON.stringify(images.map(img => img.url))
            ]
          );
          
          const productId = productResult.lastID;
          
          // Vincular produto à loja (reseller_products)
          await this.db.run(
            `INSERT INTO reseller_products (store_id, product_id, active, price_cents_override)
             VALUES (?, ?, 1, ?)`,
            [importData.store_id, productId, draft.price_cents]
          );
          
          // Se tiver variantes, criar também
          // (implementar lógica de variantes se necessário)
          
          // Marcar rascunho como criado
          await this.db.run(
            'UPDATE draft_products SET status = ?, created_product_id = ? WHERE id = ?',
            ['criado', productId, draft.id]
          );
          
          createdCount++;
        } catch (error) {
          // Marcar rascunho com erro
          await this.db.run(
            'UPDATE draft_products SET status = ?, error_message = ? WHERE id = ?',
            ['erro', error.message, draft.id]
          );
          errorCount++;
        }
      }
      
      // Atualizar importação para concluída
      await this.db.run(
        'UPDATE bulk_imports SET status = ? WHERE id = ?',
        ['concluido', importId]
      );
      
      return { createdCount, errorCount };
    } catch (error) {
      await this.db.run(
        'UPDATE bulk_imports SET status = ?, error_message = ? WHERE id = ?',
        ['erro', error.message, importId]
      );
      throw error;
    }
  }
}

module.exports = BulkImportService;
