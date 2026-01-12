// Testes unitários para funções auxiliares
const { isStoreConfigured, buildWhatsAppMessage, buildWhatsAppUrl, formatPrice } = require('../src/utils/helpers');

describe('Helpers', () => {
  describe('isStoreConfigured', () => {
    test('retorna false se loja não existe', () => {
      expect(isStoreConfigured(null)).toBe(false);
      expect(isStoreConfigured(undefined)).toBe(false);
    });

    test('retorna false se não tem logo', () => {
      const store = {
        logo_url: null,
        colors: { primary: '#ff0000', button: '#00ff00' }
      };
      expect(isStoreConfigured(store)).toBe(false);
    });

    test('retorna false se cores não foram customizadas', () => {
      const store = {
        logo_url: '/uploads/logo.jpg',
        colors: { primary: '#000000', button: '#007bff' } // cores padrão
      };
      expect(isStoreConfigured(store)).toBe(false);
    });

    test('retorna true se tem logo e cores customizadas', () => {
      const store = {
        logo_url: '/uploads/logo.jpg',
        colors: { primary: '#ff69b4', button: '#ff1493' }
      };
      expect(isStoreConfigured(store)).toBe(true);
    });
  });

  describe('buildWhatsAppMessage', () => {
    test('gera mensagem formatada corretamente', () => {
      const data = {
        storeName: 'Boutique Teste',
        customer: {
          name: 'Maria Silva',
          whatsapp: '11999999999',
          city: 'São Paulo',
          state: 'SP'
        },
        items: [
          {
            product_name: 'Vestido Floral',
            variant_size: 'M',
            variant_color: 'Azul',
            qty: 2,
            price_cents: 12990
          }
        ],
        note: 'Embalagem para presente'
      };

      const message = buildWhatsAppMessage(data);

      expect(message).toContain('Boutique Teste');
      expect(message).toContain('Maria Silva');
      expect(message).toContain('11999999999');
      expect(message).toContain('São Paulo / SP');
      expect(message).toContain('Vestido Floral');
      expect(message).toContain('(M)');
      expect(message).toContain('Azul');
      expect(message).toContain('Quantidade: 2');
      expect(message).toContain('Embalagem para presente');
    });

    test('funciona sem localidade', () => {
      const data = {
        storeName: 'Loja',
        customer: { name: 'João', whatsapp: '11999999999' },
        items: [
          { product_name: 'Produto', variant_size: 'P', qty: 1, price_cents: 5000 }
        ]
      };

      const message = buildWhatsAppMessage(data);
      expect(message).toContain('João');
      expect(message).toContain('Produto');
    });

    test('funciona sem observações', () => {
      const data = {
        storeName: 'Loja',
        customer: { name: 'Ana', whatsapp: '11888888888' },
        items: [
          { product_name: 'Item', variant_size: 'G', qty: 3 }
        ],
        note: null
      };

      const message = buildWhatsAppMessage(data);
      expect(message).toContain('Ana');
      expect(message).not.toContain('Observações:');
    });
  });

  describe('buildWhatsAppUrl', () => {
    test('gera URL correta', () => {
      const url = buildWhatsAppUrl('5511999999999', 'Olá mundo');
      expect(url).toBe('https://wa.me/5511999999999?text=Ol%C3%A1%20mundo');
    });

    test('codifica caracteres especiais', () => {
      const url = buildWhatsAppUrl('5511999999999', 'Teste: R$ 100,00');
      expect(url).toContain('wa.me');
      expect(url).toContain('text=');
      expect(url).toContain('%24'); // $
    });
  });

  describe('formatPrice', () => {
    test('formata preço corretamente', () => {
      expect(formatPrice(12990)).toBe('R$ 129,90');
      expect(formatPrice(5000)).toBe('R$ 50,00');
      expect(formatPrice(100)).toBe('R$ 1,00');
    });

    test('retorna "Consultar" se preço não existe', () => {
      expect(formatPrice(null)).toBe('Consultar');
      expect(formatPrice(undefined)).toBe('Consultar');
      expect(formatPrice(0)).toBe('Consultar');
    });
  });
});
