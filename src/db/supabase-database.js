// Database Wrapper - Supabase Edition
// Mantém interface compatível com SQLite mas usa Supabase (PostgreSQL)

const { supabaseAdmin } = require('./supabase');

class SupabaseDatabase {
  constructor() {
    this.supabase = supabaseAdmin;
  }

  // ====================================
  // MÉTODOS DE USUÁRIOS
  // ====================================

  async getUserByEmail(email) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = não encontrado
    return data;
  }

  async createUser(email, passwordHash, name = null) {
    const { data, error } = await this.supabase
      .from('users')
      .insert([{ email, password_hash: passwordHash, name }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ====================================
  // MÉTODOS DE LOJAS
  // ====================================

  async getStoreBySlug(slug) {
    const { data, error } = await this.supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getStoreById(storeId) {
    const { data, error } = await this.supabase
      .from('stores')
      .select('*')
      .eq('id', storeId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getStoreByOwnerId(ownerId) {
    const { data, error } = await this.supabase
      .from('stores')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createStore(ownerId, slug, storeName) {
    const { data, error } = await this.supabase
      .from('stores')
      .insert([{
        owner_id: ownerId,
        slug,
        store_name: storeName,
        loja_configurada: false
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateStore(storeId, updates) {
    const { data, error } = await this.supabase
      .from('stores')
      .update(updates)
      .eq('id', storeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ====================================
  // MÉTODOS DE PRODUTOS
  // ====================================

  async getProductsByCatalog(storeId) {
    const { data, error } = await this.supabase
      .from('reseller_products')
      .select(`
        *,
        product:products (
          id,
          sku,
          name,
          description,
          images,
          active
        )
      `)
      .eq('store_id', storeId)
      .eq('active', true);
    
    if (error) throw error;
    return data || [];
  }

  async getProductById(productId) {
    const { data, error } = await this.supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getProductVariants(productId) {
    const { data, error } = await this.supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId)
      .eq('active', true);
    
    if (error) throw error;
    return data || [];
  }

  async createProduct(productData) {
    const { data, error } = await this.supabase
      .from('products')
      .insert([productData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async createProductVariant(variantData) {
    const { data, error } = await this.supabase
      .from('product_variants')
      .insert([variantData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async linkProductToStore(storeId, productId, options = {}) {
    const { data, error } = await this.supabase
      .from('reseller_products')
      .insert([{
        store_id: storeId,
        product_id: productId,
        active: options.active !== undefined ? options.active : true,
        price_cents_override: options.price_cents_override || null,
        margin_percent: options.margin_percent || null
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ====================================
  // MÉTODOS DE PRÉ-PEDIDOS
  // ====================================

  async createPreOrder(orderData) {
    const { data, error } = await this.supabase
      .from('pre_orders')
      .insert([orderData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getPreOrdersByStore(storeId) {
    const { data, error } = await this.supabase
      .from('pre_orders')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async updatePreOrderStatus(orderId, status) {
    const { data, error } = await this.supabase
      .from('pre_orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // ====================================
  // MÉTODOS DE PERSONALIZAÇÃO
  // ====================================

  async getSiteSettings() {
    const { data, error } = await this.supabase
      .from('site_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateSiteSettings(updates) {
    // Buscar ID do registro existente
    const existing = await this.getSiteSettings();
    
    if (existing) {
      const { data, error } = await this.supabase
        .from('site_settings')
        .update(updates)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await this.supabase
        .from('site_settings')
        .insert([updates])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }

  async getActiveBanners() {
    const { data, error } = await this.supabase
      .from('site_banners')
      .select('*')
      .eq('active', true)
      .order('order_position', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  // ====================================
  // MÉTODOS GENÉRICOS (compatibilidade)
  // ====================================

  async get(query, params = []) {
    // Método legado para compatibilidade
    // Implementar conforme necessário
    throw new Error('Método get() não implementado para Supabase. Use métodos específicos.');
  }

  async all(query, params = []) {
    // Método legado para compatibilidade
    throw new Error('Método all() não implementado para Supabase. Use métodos específicos.');
  }

  async run(query, params = []) {
    // Método legado para compatibilidade
    throw new Error('Método run() não implementado para Supabase. Use métodos específicos.');
  }

  // ====================================
  // STORAGE (para uploads de imagens)
  // ====================================

  async uploadImage(bucketName, filePath, fileBuffer, contentType) {
    const { data, error } = await this.supabase
      .storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      });
    
    if (error) throw error;
    
    // Retornar URL pública
    const { data: { publicUrl } } = this.supabase
      .storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrl;
  }

  async deleteImage(bucketName, filePath) {
    const { error } = await this.supabase
      .storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) throw error;
    return true;
  }

  // ====================================
  // MÓDULO DE CADASTRO EM MASSA
  // ====================================

  async createBulkImportProcess(storeId, userId) {
    const { data, error } = await this.supabase
      .from('bulk_import_processes')
      .insert([{
        store_id: storeId,
        user_id: userId,
        status: 'uploading'
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateBulkImportProcess(processId, updates) {
    const { data, error } = await this.supabase
      .from('bulk_import_processes')
      .update(updates)
      .eq('id', processId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getBulkImportProcess(processId) {
    const { data, error } = await this.supabase
      .from('bulk_import_processes')
      .select('*')
      .eq('id', processId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createProductDraft(draftData) {
    const { data, error } = await this.supabase
      .from('bulk_import_product_drafts')
      .insert([draftData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProductDraftsByProcess(processId) {
    const { data, error } = await this.supabase
      .from('bulk_import_product_drafts')
      .select(`
        *,
        images:bulk_import_draft_images(*)
      `)
      .eq('import_process_id', processId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  async updateProductDraft(draftId, updates) {
    const { data, error } = await this.supabase
      .from('bulk_import_product_drafts')
      .update(updates)
      .eq('id', draftId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async createDraftImage(imageData) {
    const { data, error } = await this.supabase
      .from('bulk_import_draft_images')
      .insert([imageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

module.exports = SupabaseDatabase;
