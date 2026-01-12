import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'

export default async function PersonalizacaoPage() {
  const supabase = await createClient()
  
  const { data: store } = await supabase.from('stores').select('*').limit(1).single()
  const { data: banners } = await supabase
    .from('site_banners')
    .select('*')
    .eq('store_id', store?.id || '')
    .order('display_order')
  
  return (
    <AdminLayout storeName={store?.store_name} storeSlug={store?.slug}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Personalização da Loja</h1>
        <p className="text-sm text-gray-500 mt-1">Configure a aparência e identidade visual da sua loja</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Identidade Visual</h2>
            
            <div className="space-y-6">
              <div>
                <label className="form-label">Logo da Loja</label>
                <div className="mt-2 flex items-center gap-4">
                  {store?.logo_url ? (
                    <div className="w-24 h-24 border-2 border-gray-200 rounded-lg overflow-hidden">
                      <img src={store.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <button className="btn btn-secondary btn-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Fazer upload
                    </button>
                    <p className="text-xs text-gray-500 mt-2">PNG ou JPG até 2MB. Recomendado: 200x200px</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Cor Primária</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      defaultValue={store?.primary_color || '#3b82f6'}
                      className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      defaultValue={store?.primary_color || '#3b82f6'}
                      className="form-input flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="form-label">Cor Secundária</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      defaultValue={store?.secondary_color || '#10b981'}
                      className="h-10 w-20 rounded-md border border-gray-300 cursor-pointer"
                    />
                    <input 
                      type="text" 
                      defaultValue={store?.secondary_color || '#10b981'}
                      className="form-input flex-1 font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <button className="btn btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Banners da Home</h2>
                <p className="text-sm text-gray-500 mt-1">Gerencie os banners exibidos na página inicial</p>
              </div>
              <button className="btn btn-primary btn-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Banner
              </button>
            </div>
            
            {banners && banners.length > 0 ? (
              <div className="space-y-4">
                {banners.map((banner: any, index: number) => (
                  <div key={banner.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {banner.image_url ? (
                          <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{banner.title || 'Sem título'}</h3>
                        <p className="text-sm text-gray-500 mt-1">{banner.subtitle || 'Sem subtítulo'}</p>
                        {banner.link_url && (
                          <p className="text-xs text-blue-600 mt-2 font-mono">{banner.link_url}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="btn btn-secondary btn-sm">Editar</button>
                        <button className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Nenhum banner cadastrado</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <div className="card sticky top-24">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-white p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  {store?.logo_url ? (
                    <img src={store.logo_url} alt="Logo" className="h-8" />
                  ) : (
                    <div className="text-lg font-bold" style={{ color: store?.primary_color || '#3b82f6' }}>
                      {store?.store_name || 'Sua Loja'}
                    </div>
                  )}
                  <div className="w-6 h-6 rounded-full" style={{ backgroundColor: store?.primary_color || '#3b82f6' }}></div>
                </div>
              </div>
              <div className="bg-gray-50 p-8 text-center">
                <p className="text-xs text-gray-500">Preview da loja</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
