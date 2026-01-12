import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  
  const { data: store } = await supabase.from('stores').select('*').limit(1).single()
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('store_id', store?.id || '')
    .single()
  
  return (
    <AdminLayout storeName={store?.store_name} storeSlug={store?.slug}>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Configurações</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie as configurações gerais do sistema</p>
      </div>
      
      <div className="max-w-3xl space-y-6">
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Informações da Loja</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Nome da Loja</label>
              <input 
                type="text" 
                className="form-input" 
                defaultValue={store?.store_name || ''}
                placeholder="Digite o nome da sua loja"
              />
            </div>
            
            <div>
              <label className="form-label">Slug da URL</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">cjotapersonalizado.netlify.app/</span>
                <input 
                  type="text" 
                  className="form-input flex-1" 
                  defaultValue={store?.slug || ''}
                  placeholder="minha-loja"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Use apenas letras minúsculas, números e hífens</p>
            </div>
            
            <div>
              <label className="form-label">Descrição</label>
              <textarea 
                className="form-input min-h-[100px] resize-y" 
                defaultValue={store?.description || ''}
                placeholder="Descreva sua loja em poucas palavras"
              />
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Contato</h2>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">WhatsApp Oficial</label>
              <input 
                type="tel" 
                className="form-input" 
                defaultValue={settings?.whatsapp_number || ''}
                placeholder="5562981234567"
              />
              <p className="text-xs text-gray-500 mt-1">Código do país + DDD + número (sem espaços ou caracteres especiais)</p>
            </div>
            
            <div>
              <label className="form-label">E-mail de Contato</label>
              <input 
                type="email" 
                className="form-input" 
                defaultValue={settings?.contact_email || ''}
                placeholder="contato@minhaloja.com"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Instagram</label>
                <input 
                  type="text" 
                  className="form-input" 
                  defaultValue={settings?.instagram_url || ''}
                  placeholder="@minhaloja"
                />
              </div>
              
              <div>
                <label className="form-label">Facebook</label>
                <input 
                  type="text" 
                  className="form-input" 
                  defaultValue={settings?.facebook_url || ''}
                  placeholder="facebook.com/minhaloja"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Mensagens Automáticas</h2>
          
          <div className="space-y-5">
            <div>
              <label className="form-label">Mensagem de Boas-vindas (WhatsApp)</label>
              <textarea 
                className="form-input min-h-[120px] resize-y" 
                defaultValue={settings?.welcome_message || 'Olá! Obrigada pelo interesse. Vou verificar a disponibilidade dos produtos e retorno em breve.'}
                placeholder="Digite a mensagem que será enviada ao abrir o WhatsApp"
              />
              <p className="text-xs text-gray-500 mt-1">Esta mensagem aparecerá automaticamente quando o cliente finalizar o pedido</p>
            </div>
            
            <div>
              <label className="form-label">Texto do Rodapé</label>
              <textarea 
                className="form-input min-h-[80px] resize-y" 
                defaultValue={settings?.footer_text || ''}
                placeholder="Informações exibidas no rodapé do site"
              />
            </div>
          </div>
        </div>
        
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Sistema de Pedidos por Encomenda</h3>
              <p className="text-sm text-blue-800">
                Este sistema não processa pagamentos online. Todos os pedidos são enviados via WhatsApp para negociação manual de preço, frete e forma de pagamento.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button className="btn btn-secondary">Cancelar</button>
          <button className="btn btn-primary">Salvar Configurações</button>
        </div>
      </div>
    </AdminLayout>
  )
}
