// =====================================================
// SERVIÇO: CADASTRO EM MASSA DE PRODUTOS
// Inspirado no Automágico - Upload, Agrupamento, Revisão
// =====================================================

const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

class BulkImportService {
  
  // ====================================
  // 1. CRIAR SESSÃO DE IMPORTAÇÃO
  // ====================================
  
  /**
   * Cria uma nova sessão de importação em massa
   * @param {string} storeId - UUID da loja
   * @param {string} adminUserId - UUID do admin
   * @returns {Promise<string>} - ID da importação criada
   */
  async createImport(storeId, adminUserId) {
    const { data, error } = await supabase
      .from('bulk_imports')
      .insert({
        store_id: storeId,
        admin_user_id: adminUserId,
        status: 'uploading',
        total_files: 0,
        total_groups: 0
      })
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar importação: ${error.message}`);
    return data.id;
  }

  // ====================================
  // 2. UPLOAD DE ARQUIVOS
  // ====================================
  
  /**
   * Faz upload de múltiplas imagens para o storage temporário
   * @param {string} importId - UUID da importação
   * @param {File[]} files - Array de arquivos (imagens ou zip)
   * @returns {Promise<Object[]>} - Lista de URLs das imagens uploadadas
   */
  async uploadFiles(importId, files) {
    const uploadedImages = [];

    for (const file of files) {
      // Se for ZIP, extrair imagens
      if (file.mimetype === 'application/zip' || file.name.endsWith('.zip')) {
        const extractedFiles = await this.extractZipFile(file);
        uploadedImages.push(...extractedFiles);
      } 
      // Se for imagem, fazer upload direto
      else if (file.mimetype.startsWith('image/')) {
        const uploaded = await this.uploadSingleImage(importId, file);
        uploadedImages.push(uploaded);
      }
    }

    // Atualizar total de arquivos
    await supabase
      .from('bulk_imports')
      .update({ 
        total_files: uploadedImages.length,
        status: 'processing'
      })
      .eq('id', importId);

    return uploadedImages;
  }

  /**
   * Extrai imagens de um arquivo ZIP
   * @param {File} zipFile - Arquivo ZIP
   * @returns {Promise<Object[]>} - Lista de imagens extraídas
   */
  async extractZipFile(zipFile) {
    const zip = new AdmZip(zipFile.buffer || zipFile.path);
    const zipEntries = zip.getEntries();
    const images = [];

    for (const entry of zipEntries) {
      // Filtrar apenas imagens
      if (!entry.isDirectory && /\.(jpg|jpeg|png|webp|gif)$/i.test(entry.entryName)) {
        images.push({
          name: entry.entryName,
          buffer: entry.getData(),
          mimetype: this.getMimeTypeFromExtension(entry.entryName)
        });
      }
    }

    return images;
  }

  /**
   * Upload de uma imagem individual para o storage
   * @param {string} importId - UUID da importação
   * @param {Object} file - Arquivo da imagem
   * @returns {Promise<Object>} - Informações da imagem uploadada
   */
  async uploadSingleImage(importId, file) {
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `temp-imports/${importId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('products')
      .upload(filePath, file.buffer || file, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) throw new Error(`Erro ao fazer upload: ${error.message}`);

    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);

    return {
      filename: file.name,
      temp_url: publicUrl,
      file_size: file.size,
      mime_type: file.mimetype,
      width: null, // Poderia usar sharp para extrair
      height: null
    };
  }

  // ====================================
  // 3. AGRUPAMENTO INTELIGENTE
  // ====================================
  
  /**
   * Agrupa imagens por padrão de nome (algoritmo simples)
   * @param {Object[]} images - Lista de imagens uploadadas
   * @returns {Object} - Grupos: { "produto-azul": [...], "camisa": [...] }
   */
  groupImagesByPattern(images) {
    const groups = {};

    for (const image of images) {
      const groupKey = this.extractGroupKey(image.filename);
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(image);
    }

    return groups;
  }

  /**
   * Extrai a chave de agrupamento do nome do arquivo
   * Exemplos:
   * - "produto-azul-1.jpg" → "produto-azul"
   * - "camisa_p.jpg" → "camisa"
   * - "001-frente.jpg" → "001"
   * 
   * @param {string} filename - Nome do arquivo
   * @returns {string} - Chave de agrupamento
   */
  extractGroupKey(filename) {
    // Remove extensão
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
    
    // Remove números finais e separadores (_-, etc)
    const cleaned = nameWithoutExt
      .replace(/-\d+$/, '')        // Remove "-1", "-2", etc no final
      .replace(/_\d+$/, '')        // Remove "_1", "_2", etc no final
      .replace(/\d+$/, '')         // Remove números soltos no final
      .replace(/[-_](frente|costas|lateral|detalhe)$/i, '') // Remove palavras comuns
      .trim();

    return cleaned || nameWithoutExt;
  }

  /**
   * Cria rascunhos de produtos a partir dos grupos
   * @param {string} importId - UUID da importação
   * @param {Object} groups - Grupos de imagens
   * @returns {Promise<Object[]>} - Rascunhos criados
   */
  async createDraftsFromGroups(importId, groups) {
    const drafts = [];
    let sortOrder = 0;

    for (const [groupKey, images] of Object.entries(groups)) {
      // Criar rascunho do produto
      const { data: draft, error: draftError } = await supabase
        .from('draft_products')
        .insert({
          import_id: importId,
          group_key: groupKey,
          name: this.generateProductName(groupKey),
          original_filenames: images.map(img => img.filename),
          status: 'draft',
          sort_order: sortOrder++,
          raw_data: {
            auto_grouped: true,
            images_count: images.length
          }
        })
        .select()
        .single();

      if (draftError) {
        console.error('Erro ao criar rascunho:', draftError);
        continue;
      }

      // Criar registros de imagens
      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await supabase.from('draft_images').insert({
          draft_product_id: draft.id,
          temp_url: image.temp_url,
          filename: image.filename,
          file_size: image.file_size,
          mime_type: image.mime_type,
          is_primary: i === 0, // Primeira imagem é principal
          sort_order: i
        });
      }

      drafts.push(draft);
    }

    // Atualizar total de grupos
    await supabase
      .from('bulk_imports')
      .update({ 
        total_groups: drafts.length,
        status: 'grouping'
      })
      .eq('id', importId);

    return drafts;
  }

  /**
   * Gera nome provisório do produto a partir da chave de grupo
   * @param {string} groupKey - Chave de agrupamento
   * @returns {string} - Nome sugerido
   */
  generateProductName(groupKey) {
    return groupKey
      .replace(/[-_]/g, ' ')      // Trocar separadores por espaço
      .replace(/\b\w/g, l => l.toUpperCase()) // Capitalizar
      .trim();
  }

  // ====================================
  // 4. MANIPULAÇÃO DE GRUPOS
  // ====================================
  
  /**
   * Divide um grupo em dois
   * @param {string} draftId - UUID do rascunho original
   * @param {string[]} imagesToSplit - IDs das imagens a separar
   * @returns {Promise<Object>} - Novo rascunho criado
   */
  async splitGroup(draftId, imagesToSplit) {
    // Buscar rascunho original
    const { data: original } = await supabase
      .from('draft_products')
      .select('*, draft_images(*)')
      .eq('id', draftId)
      .single();

    // Criar novo rascunho
    const { data: newDraft } = await supabase
      .from('draft_products')
      .insert({
        import_id: original.import_id,
        group_key: `${original.group_key}-split`,
        name: `${original.name} (Dividido)`,
        status: 'draft',
        sort_order: original.sort_order + 0.5
      })
      .select()
      .single();

    // Mover imagens selecionadas para o novo grupo
    await supabase
      .from('draft_images')
      .update({ draft_product_id: newDraft.id })
      .in('id', imagesToSplit);

    return newDraft;
  }

  /**
   * Une dois grupos em um
   * @param {string} targetDraftId - UUID do rascunho que receberá as imagens
   * @param {string} sourceDraftId - UUID do rascunho a ser mesclado
   * @returns {Promise<void>}
   */
  async mergeGroups(targetDraftId, sourceDraftId) {
    // Mover todas as imagens do source para o target
    await supabase
      .from('draft_images')
      .update({ draft_product_id: targetDraftId })
      .eq('draft_product_id', sourceDraftId);

    // Deletar rascunho vazio
    await supabase
      .from('draft_products')
      .delete()
      .eq('id', sourceDraftId);
  }

  /**
   * Troca a imagem principal de um rascunho
   * @param {string} draftId - UUID do rascunho
   * @param {string} newPrimaryImageId - UUID da nova imagem principal
   * @returns {Promise<void>}
   */
  async changePrimaryImage(draftId, newPrimaryImageId) {
    // Remover flag de todas as imagens
    await supabase
      .from('draft_images')
      .update({ is_primary: false })
      .eq('draft_product_id', draftId);

    // Marcar nova imagem como principal
    await supabase
      .from('draft_images')
      .update({ is_primary: true })
      .eq('id', newPrimaryImageId);
  }

  // ====================================
  // 5. CONFIGURAÇÕES PADRÃO DO LOTE
  // ====================================
  
  /**
   * Aplica configurações padrão a todos os rascunhos do lote
   * @param {string} importId - UUID da importação
   * @param {Object} defaults - Valores padrão
   * @returns {Promise<void>}
   */
  async applyBatchDefaults(importId, defaults) {
    const { default_price, default_stock, default_category_id, default_tags } = defaults;

    // Salvar configurações
    await supabase.from('bulk_import_defaults').upsert({
      import_id: importId,
      default_price,
      default_stock,
      default_category_id,
      default_tags,
      apply_to_all: true
    });

    // Aplicar aos rascunhos
    const updates = {};
    if (default_price) updates.price = default_price;
    if (default_stock) updates.stock_quantity = default_stock;
    if (default_category_id) updates.category_id = default_category_id;
    if (default_tags) updates.tags = default_tags;

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('draft_products')
        .update(updates)
        .eq('import_id', importId);
    }
  }

  // ====================================
  // 6. VALIDAÇÃO E CRIAÇÃO FINAL
  // ====================================
  
  /**
   * Valida todos os rascunhos antes de criar produtos
   * @param {string} importId - UUID da importação
   * @returns {Promise<Object>} - Resultado da validação
   */
  async validateDrafts(importId) {
    const { data: drafts } = await supabase
      .from('draft_products')
      .select('*, draft_images(count)')
      .eq('import_id', importId);

    const errors = [];

    for (const draft of drafts) {
      const draftErrors = [];

      if (!draft.name || draft.name.trim().length === 0) {
        draftErrors.push('Nome do produto é obrigatório');
      }

      if (!draft.draft_images || draft.draft_images.length === 0) {
        draftErrors.push('Produto precisa ter pelo menos uma imagem');
      }

      if (draft.price && draft.price < 0) {
        draftErrors.push('Preço não pode ser negativo');
      }

      if (draftErrors.length > 0) {
        errors.push({
          draft_id: draft.id,
          draft_name: draft.name,
          errors: draftErrors
        });

        // Atualizar status do rascunho
        await supabase
          .from('draft_products')
          .update({ 
            status: 'error',
            validation_errors: draftErrors
          })
          .eq('id', draft.id);
      } else {
        // Marcar como pronto
        await supabase
          .from('draft_products')
          .update({ status: 'ready' })
          .eq('id', draft.id);
      }
    }

    return {
      valid: errors.length === 0,
      total_drafts: drafts.length,
      errors
    };
  }

  /**
   * Cria produtos reais a partir dos rascunhos
   * @param {string} importId - UUID da importação
   * @returns {Promise<Object>} - Resultado da criação
   */
  async createProductsFromDrafts(importId) {
    const { data: drafts } = await supabase
      .from('draft_products')
      .select('*, draft_images(*)')
      .eq('import_id', importId)
      .eq('status', 'ready');

    const results = {
      created: [],
      failed: []
    };

    for (const draft of drafts) {
      try {
        // Copiar imagens do storage temporário para permanente
        const permanentImages = await this.copyImagesToPermament(draft.draft_images, draft.import_id);

        // Criar produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            store_id: draft.import_id, // Pegar store_id do import
            name: draft.name,
            description: draft.description,
            sku: draft.sku,
            price: draft.price,
            compare_at_price: draft.compare_at_price,
            cost: draft.cost,
            stock_quantity: draft.stock_quantity,
            track_inventory: draft.track_inventory,
            category_id: draft.category_id,
            tags: draft.tags,
            is_active: draft.is_active
          })
          .select()
          .single();

        if (productError) throw productError;

        // Criar registros de imagens do produto
        for (const img of permanentImages) {
          await supabase.from('product_images').insert({
            product_id: product.id,
            url: img.final_url,
            is_primary: img.is_primary,
            sort_order: img.sort_order
          });
        }

        // Registrar no log
        await supabase.from('bulk_import_products').insert({
          import_id: importId,
          draft_product_id: draft.id,
          product_id: product.id,
          created_successfully: true
        });

        // Atualizar status do rascunho
        await supabase
          .from('draft_products')
          .update({ status: 'created' })
          .eq('id', draft.id);

        results.created.push({
          draft_id: draft.id,
          product_id: product.id,
          name: product.name
        });

      } catch (error) {
        // Registrar falha
        await supabase.from('bulk_import_products').insert({
          import_id: importId,
          draft_product_id: draft.id,
          created_successfully: false,
          error_message: error.message
        });

        results.failed.push({
          draft_id: draft.id,
          name: draft.name,
          error: error.message
        });
      }
    }

    // Atualizar importação como concluída
    await supabase
      .from('bulk_imports')
      .update({ 
        status: 'completed',
        total_products_created: results.created.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', importId);

    return results;
  }

  /**
   * Copia imagens do storage temporário para permanente
   * @param {Object[]} images - Imagens temporárias
   * @param {string} importId - UUID da importação
   * @returns {Promise<Object[]>} - Imagens com URLs permanentes
   */
  async copyImagesToPermament(images, importId) {
    const permanentImages = [];

    for (const img of images) {
      const tempPath = img.temp_url.split('/products/')[1];
      const permanentPath = tempPath.replace(`temp-imports/${importId}/`, 'products/');

      // Copiar arquivo no storage
      const { data, error } = await supabase.storage
        .from('products')
        .copy(tempPath, permanentPath);

      if (error) {
        console.error('Erro ao copiar imagem:', error);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(permanentPath);

      permanentImages.push({
        ...img,
        final_url: publicUrl
      });
    }

    return permanentImages;
  }

  // ====================================
  // 7. FUNÇÕES AUXILIARES
  // ====================================
  
  /**
   * Obtém resumo de uma importação
   * @param {string} importId - UUID da importação
   * @returns {Promise<Object>} - Dados resumidos
   */
  async getImportSummary(importId) {
    const { data, error } = await supabase
      .from('bulk_imports_summary')
      .select('*')
      .eq('id', importId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Lista todos os rascunhos de uma importação
   * @param {string} importId - UUID da importação
   * @returns {Promise<Object[]>} - Lista de rascunhos
   */
  async getDraftsByImport(importId) {
    const { data, error } = await supabase
      .from('draft_products_with_images')
      .select('*')
      .eq('import_id', importId)
      .order('sort_order', { ascending: true });

    if (error) throw error;
    return data;
  }

  /**
   * Atualiza dados de um rascunho
   * @param {string} draftId - UUID do rascunho
   * @param {Object} updates - Campos a atualizar
   * @returns {Promise<Object>} - Rascunho atualizado
   */
  async updateDraft(draftId, updates) {
    const { data, error } = await supabase
      .from('draft_products')
      .update(updates)
      .eq('id', draftId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deleta um rascunho (e suas imagens em cascata)
   * @param {string} draftId - UUID do rascunho
   * @returns {Promise<void>}
   */
  async deleteDraft(draftId) {
    // As imagens serão deletadas em cascata
    const { error } = await supabase
      .from('draft_products')
      .delete()
      .eq('id', draftId);

    if (error) throw error;
  }

  /**
   * Limpa arquivos temporários após conclusão
   * @param {string} importId - UUID da importação
   * @returns {Promise<void>}
   */
  async cleanupTempFiles(importId) {
    const { data: files } = await supabase.storage
      .from('products')
      .list(`temp-imports/${importId}`);

    if (files && files.length > 0) {
      const filePaths = files.map(f => `temp-imports/${importId}/${f.name}`);
      await supabase.storage.from('products').remove(filePaths);
    }
  }

  /**
   * Obtém tipo MIME a partir da extensão
   * @param {string} filename - Nome do arquivo
   * @returns {string} - MIME type
   */
  getMimeTypeFromExtension(filename) {
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'application/octet-stream';
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
