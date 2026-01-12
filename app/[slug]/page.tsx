import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import StoreHeader from '@/components/StoreHeader'
import DynamicStyles from '@/components/DynamicStyles'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  // Buscar loja
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store) {
    notFound()
  }

  // Buscar produtos da loja
  const { data: resellerProducts } = await supabase
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
    .eq('store_id', store.id)
    .eq('active', true)

  // Buscar configurações do site
  const { data: siteSettings } = await supabase
    .from('site_settings')
    .select('*')
    .single()

  // Buscar banners ativos
  const { data: banners } = await supabase
    .from('site_banners')
    .select('*')
    .eq('active', true)
    .order('order_position', { ascending: true })

  const products = resellerProducts?.map(rp => {
    const product = rp.product as any
    return {
      ...product,
      price_cents: rp.price_cents_override || 0,
      reseller_id: rp.id
    }
  }) || []

  // Cores da loja ou padrão
  const colors = store.colors as any || {}
  const primaryColor = colors.primary || '#3b82f6'
  const buttonColor = colors.button || '#3b82f6'

  return (
    <>
      <DynamicStyles colors={{ primary: primaryColor, button: buttonColor }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <StoreHeader 
          slug={slug} 
          storeName={store.store_name} 
          logo={store.logo_url || undefined}
        />

        {/* Hero Banner */}
        {banners && banners.length > 0 && (
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <div className="container mx-auto px-4 py-16 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {banners[0].title}
              </h2>
              {banners[0].subtitle && (
                <p className="text-xl md:text-2xl text-blue-100 mb-8">
                  {banners[0].subtitle}
                </p>
              )}
              {banners[0].button_text && (
                <a 
                  href={banners[0].link_url || '#produtos'}
                  className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
                >
                  {banners[0].button_text}
                </a>
              )}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <section className="container mx-auto px-4 py-12" id="produtos">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Nossos Produtos</h2>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const firstImage = product.images?.[0] || '/placeholder.png'
                const price = product.price_cents / 100

                return (
                  <Link 
                    key={product.id}
                    href={`/${slug}/produto/${product.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-200 overflow-hidden group"
                  >
                    <div className="relative aspect-square bg-gray-100">
                      <Image
                        src={firstImage}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-gray-900">
                          R$ {price.toFixed(2)}
                        </span>
                        <span className="text-sm text-blue-600 font-medium">
                          Ver detalhes →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Nenhum produto disponível no momento
              </h3>
              <p className="text-gray-600">
                Em breve teremos novidades!
              </p>
            </div>
          )}
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white mt-16">
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4">{store.store_name}</h3>
                <p className="text-gray-400">
                  Sistema de pedidos por encomenda
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Contato</h3>
                {siteSettings?.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${siteSettings.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-2"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
                {siteSettings?.email && (
                  <a 
                    href={`mailto:${siteSettings.email}`}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email
                  </a>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-bold mb-4">Links</h3>
                <Link href={`/${slug}`} className="block text-gray-400 hover:text-white transition-colors mb-2">
                  Produtos
                </Link>
                <Link href={`/${slug}/carrinho`} className="block text-gray-400 hover:text-white transition-colors">
                  Meu Carrinho
                </Link>
              </div>
            </div>
            
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
              <p>© {new Date().getFullYear()} {store.store_name}. Sistema CJota Catálogo.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
