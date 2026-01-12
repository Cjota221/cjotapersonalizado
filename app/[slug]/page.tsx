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

      <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
        {/* Header */}
        <StoreHeader 
          slug={slug} 
          storeName={store.store_name} 
          logo={store.logo_url || undefined}
        />

        {/* Hero Banner - Minimalista e Impactante */}
        {banners && banners.length > 0 && (
          <section className="relative overflow-hidden" style={{ backgroundColor: '#ffffff' }}>
            <div className="container mx-auto px-4 py-16 md:py-24">
              <div className="max-w-2xl">
                <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ color: '#1a1a1a', lineHeight: '1.1' }}>
                  {banners[0].title}
                </h1>
                {banners[0].subtitle && (
                  <p className="text-lg md:text-xl mb-8" style={{ color: '#666666' }}>
                    {banners[0].subtitle}
                  </p>
                )}
                {banners[0].button_text && (
                  <a 
                    href={banners[0].link_url || '#produtos'}
                    className="inline-block px-8 py-4 text-white font-bold rounded-full transition-all hover:shadow-lg text-lg"
                    style={{ backgroundColor: '#000000' }}
                  >
                    {banners[0].button_text}
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Products Grid - Design Limpo e Moderno */}
        <section className="container mx-auto px-4 py-12" id="produtos">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold" style={{ color: '#1a1a1a' }}>
              Produtos
            </h2>
            <div className="text-sm" style={{ color: '#666666' }}>
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </div>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
                const firstImage = product.images?.[0] || '/placeholder.png'
                const price = product.price_cents / 100

                return (
                  <Link
                    key={product.id}
                    href={`/${slug}/produto/${product.id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg overflow-hidden transition-all hover:shadow-xl">
                      {/* Imagem do Produto */}
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <Image
                          src={firstImage}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Badge "Novo" opcional */}
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: '#000000' }}>
                            NOVO
                          </span>
                        </div>
                      </div>
                      
                      {/* Info do Produto */}
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 group-hover:underline" style={{ color: '#1a1a1a', minHeight: '2.5rem' }}>
                          {product.name}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-2xl font-bold" style={{ color: '#000000' }}>
                              R$ {price.toFixed(2)}
                            </p>
                            <p className="text-xs mt-1" style={{ color: '#999999' }}>
                              ou 3x de R$ {(price / 3).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto mb-6" style={{ color: '#cccccc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-2xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                  Em breve!
                </h3>
                <p style={{ color: '#666666' }}>
                  Novos produtos serão adicionados em breve.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Trust Badges - Aumenta Conversão */}
        <section className="border-t border-b" style={{ backgroundColor: '#ffffff', borderColor: '#eeeeee' }}>
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ backgroundColor: '#f5f5f5' }}>
                  <svg className="w-6 h-6" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>Entrega Rápida</h4>
                <p className="text-sm" style={{ color: '#666666' }}>Para todo Brasil</p>
              </div>
              
              <div>
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ backgroundColor: '#f5f5f5' }}>
                  <svg className="w-6 h-6" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>Compra Segura</h4>
                <p className="text-sm" style={{ color: '#666666' }}>Seus dados protegidos</p>
              </div>
              
              <div>
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ backgroundColor: '#f5f5f5' }}>
                  <svg className="w-6 h-6" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>Parcele em até 3x</h4>
                <p className="text-sm" style={{ color: '#666666' }}>Sem juros no cartão</p>
              </div>
              
              <div>
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-full" style={{ backgroundColor: '#f5f5f5' }}>
                  <svg className="w-6 h-6" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h4 className="font-bold mb-1" style={{ color: '#1a1a1a' }}>Atendimento</h4>
                <p className="text-sm" style={{ color: '#666666' }}>Via WhatsApp</p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer Minimalista */}
        <footer style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-bold mb-4">{store.store_name}</h3>
                <p className="text-sm" style={{ color: '#999999' }}>
                  Moda e estilo com qualidade e entrega rápida.
                </p>
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Atendimento</h4>
                {siteSettings?.whatsapp_number && (
                  <a 
                    href={`https://wa.me/${siteSettings.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mb-2 text-sm hover:underline"
                    style={{ color: '#cccccc' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
              
              <div>
                <h4 className="font-bold mb-4">Navegue</h4>
                <Link href={`/${slug}`} className="block mb-2 text-sm hover:underline" style={{ color: '#cccccc' }}>
                  Produtos
                </Link>
                <Link href={`/${slug}/carrinho`} className="block text-sm hover:underline" style={{ color: '#cccccc' }}>
                  Carrinho
                </Link>
              </div>
            </div>
            
            <div className="border-t pt-6 text-center text-sm" style={{ borderColor: '#333333', color: '#666666' }}>
              <p>© {new Date().getFullYear()} {store.store_name}. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
