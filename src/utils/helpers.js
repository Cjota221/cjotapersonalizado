// Funções auxiliares do sistema

/**
 * Verifica se a loja está configurada adequadamente
 * @param {Object} store - Objeto da loja
 * @returns {boolean}
 */
function isStoreConfigured(store) {
  if (!store) return false;

  // Verifica se tem logo
  const hasLogo = !!store.logo_url;

  // Verifica se as cores foram customizadas
  const colors = store.colors || {};
  const defaultPrimary = '#000000';
  const defaultButton = '#007bff';

  const primaryDifferent = colors.primary && 
    colors.primary.toLowerCase() !== defaultPrimary.toLowerCase();
  const buttonDifferent = colors.button && 
    colors.button.toLowerCase() !== defaultButton.toLowerCase();

  return hasLogo && primaryDifferent && buttonDifferent;
}

/**
 * Constrói a mensagem formatada para enviar ao WhatsApp
 * @param {Object} data - Dados do pedido
 * @returns {string}
 */
function buildWhatsAppMessage({ storeName, customer, items, note }) {
  const lines = [];

  lines.push(`*Loja:* ${storeName}`);
  lines.push('');
  lines.push(`*Cliente:* ${customer.name}`);
  lines.push(`*WhatsApp:* ${customer.whatsapp}`);
  
  if (customer.city || customer.state) {
    const location = [customer.city, customer.state].filter(Boolean).join(' / ');
    lines.push(`*Localidade:* ${location}`);
  }

  lines.push('');
  lines.push('*Pedido pré-montado:*');
  lines.push('');

  items.forEach((item, idx) => {
    const priceText = item.price_cents 
      ? ` - R$ ${(item.price_cents / 100).toFixed(2)}`
      : '';
    const sizeText = item.variant_size ? ` (${item.variant_size})` : '';
    const colorText = item.variant_color ? ` - ${item.variant_color}` : '';
    
    lines.push(`${idx + 1}. *${item.product_name}*${sizeText}${colorText}`);
    lines.push(`   Quantidade: ${item.qty}${priceText}`);
  });

  if (note) {
    lines.push('');
    lines.push(`*Observações:* ${note}`);
  }

  lines.push('');
  lines.push('_Por favor, confirmar frete e forma de pagamento._');

  return lines.join('\n');
}

/**
 * Gera URL para abrir WhatsApp com mensagem pré-preenchida
 * @param {string} phoneNumber - Número no formato internacional (ex: 5511999999999)
 * @param {string} message - Mensagem a ser enviada
 * @returns {string}
 */
function buildWhatsAppUrl(phoneNumber, message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber}?text=${encoded}`;
}

/**
 * Formata preço de centavos para real
 * @param {number} cents - Valor em centavos
 * @returns {string}
 */
function formatPrice(cents) {
  if (!cents) return 'Consultar';
  return `R$ ${(cents / 100).toFixed(2).replace('.', ',')}`;
}

/**
 * Gera CSS customizado baseado nas cores da loja
 * @param {Object} colors - Objeto com cores
 * @returns {string}
 */
function generateStoreCSS(colors) {
  if (!colors) return '';

  return `
    :root {
      --color-primary: ${colors.primary || '#000'};
      --color-button: ${colors.button || '#007bff'};
      --color-background: ${colors.background || '#fff'};
      --color-secondary: ${colors.secondary || '#6c757d'};
    }
  `;
}

module.exports = {
  isStoreConfigured,
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatPrice,
  generateStoreCSS
};
