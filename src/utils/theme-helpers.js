// Helpers para gerenciamento de tema e branding
const Database = require('../db/database');

/**
 * Carrega as configurações de branding/tema do banco
 * @returns {Promise<Object>} Configurações do site
 */
async function loadSiteSettings() {
  const db = new Database();
  
  try {
    const settings = await db.get('SELECT * FROM site_settings WHERE id = 1');
    return settings || getDefaultSettings();
  } catch (error) {
    console.error('Erro ao carregar configurações:', error);
    return getDefaultSettings();
  }
}

/**
 * Retorna configurações padrão caso não existam no banco
 */
function getDefaultSettings() {
  return {
    site_name: 'CJota Catálogo',
    color_primary: '#1a1a1a',
    color_secondary: '#4a5568',
    color_accent: '#3b82f6',
    color_surface: '#ffffff',
    color_background: '#f7fafc',
    color_text_primary: '#1a202c',
    color_text_secondary: '#718096',
    color_border: '#e2e8f0',
    color_success: '#10b981',
    color_warning: '#f59e0b',
    color_error: '#ef4444',
    font_primary: 'Inter, system-ui, sans-serif',
    font_headings: 'Inter, system-ui, sans-serif'
  };
}

/**
 * Gera CSS customizado baseado nas configurações do site
 * @param {Object} settings - Configurações carregadas
 * @returns {String} CSS com variáveis customizadas
 */
function generateThemeCSS(settings) {
  return `
    :root {
      --color-primary: ${settings.color_primary};
      --color-secondary: ${settings.color_secondary};
      --color-accent: ${settings.color_accent};
      --color-surface: ${settings.color_surface};
      --color-background: ${settings.color_background};
      --color-text-primary: ${settings.color_text_primary};
      --color-text-secondary: ${settings.color_text_secondary};
      --color-border: ${settings.color_border};
      --color-success: ${settings.color_success};
      --color-warning: ${settings.color_warning};
      --color-error: ${settings.color_error};
      --font-primary: ${settings.font_primary};
      --font-headings: ${settings.font_headings};
    }
  `.trim();
}

/**
 * Salva configurações de branding no banco
 * @param {Object} data - Dados a serem salvos
 * @returns {Promise<Boolean>}
 */
async function saveSiteSettings(data) {
  const db = new Database();
  
  const fields = [];
  const values = [];
  
  const allowedFields = [
    'logo_url', 'favicon_url', 'site_name', 'site_description',
    'color_primary', 'color_secondary', 'color_accent',
    'color_surface', 'color_background',
    'color_text_primary', 'color_text_secondary', 'color_border',
    'color_success', 'color_warning', 'color_error',
    'font_primary', 'font_headings',
    'whatsapp_number', 'email'
  ];
  
  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(data[field]);
    }
  }
  
  if (fields.length === 0) {
    return false;
  }
  
  fields.push('updated_at = CURRENT_TIMESTAMP');
  
  try {
    await db.run(
      `UPDATE site_settings SET ${fields.join(', ')} WHERE id = 1`,
      values
    );
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações:', error);
    return false;
  }
}

/**
 * Carrega banners ativos ordenados
 * @returns {Promise<Array>}
 */
async function loadActiveBanners() {
  const db = new Database();
  
  try {
    const banners = await db.all(
      `SELECT * FROM site_banners 
       WHERE active = 1 
       ORDER BY display_order ASC`
    );
    return banners;
  } catch (error) {
    console.error('Erro ao carregar banners:', error);
    return [];
  }
}

/**
 * Salva ou atualiza um banner
 * @param {Object} bannerData
 * @returns {Promise<Number>} ID do banner
 */
async function saveBanner(bannerData) {
  const db = new Database();
  
  const { id, title, subtitle, description, image_url, link_url, link_text, display_order, active } = bannerData;
  
  try {
    if (id) {
      // Update
      await db.run(
        `UPDATE site_banners 
         SET title = ?, subtitle = ?, description = ?, image_url = ?, 
             link_url = ?, link_text = ?, display_order = ?, active = ?
         WHERE id = ?`,
        [title, subtitle, description, image_url, link_url, link_text, display_order, active, id]
      );
      return id;
    } else {
      // Insert
      const result = await db.run(
        `INSERT INTO site_banners 
         (title, subtitle, description, image_url, link_url, link_text, display_order, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, subtitle, description, image_url, link_url, link_text, display_order || 0, active !== false ? 1 : 0]
      );
      return result.id;
    }
  } catch (error) {
    console.error('Erro ao salvar banner:', error);
    throw error;
  }
}

/**
 * Remove um banner
 * @param {Number} id
 * @returns {Promise<Boolean>}
 */
async function deleteBanner(id) {
  const db = new Database();
  
  try {
    await db.run('DELETE FROM site_banners WHERE id = ?', [id]);
    return true;
  } catch (error) {
    console.error('Erro ao deletar banner:', error);
    return false;
  }
}

/**
 * Valida uma cor hexadecimal
 * @param {String} color
 * @returns {Boolean}
 */
function isValidColor(color) {
  return /^#[0-9A-F]{6}$/i.test(color);
}

/**
 * Middleware para injetar configurações em todas as views
 */
async function injectSiteSettings(req, res, next) {
  try {
    const settings = await loadSiteSettings();
    const banners = await loadActiveBanners();
    
    res.locals.siteSettings = settings;
    res.locals.activeBanners = banners;
    res.locals.themeCSS = generateThemeCSS(settings);
    
    next();
  } catch (error) {
    console.error('Erro ao injetar configurações:', error);
    next();
  }
}

module.exports = {
  loadSiteSettings,
  getDefaultSettings,
  generateThemeCSS,
  saveSiteSettings,
  loadActiveBanners,
  saveBanner,
  deleteBanner,
  isValidColor,
  injectSiteSettings
};
