import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import StoreHeader from '@/components/StoreHeader'
import AddToCartButton from '@/components/AddToCartButton'

interface PageProps {
  params: Promise<{
    slug: string
    id: string
  }>
}

export default async function ProductPage({ params }: PageProps) {
  const { slug, id } = await params
  const supabase = await createClient()

  // Buscar loja
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!store) notFound()

  // Buscar produto
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  // Buscar variações do produto
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)
    .eq('active', true)

  // Buscar preço na tabela reseller_products
  const { data: resellerProduct } = await supabase
    .from('reseller_products')
    .select('*')
    .eq('store_id', store.id)
    .eq('product_id', id)
    .single()

  const price = resellerProduct?.price_cents_override || 0
  const images = (product.images as string[]) || []
  const sizes = [...new Set(variants?.map(v => v.size).filter(Boolean))]
  const colors = [...new Set(variants?.map(v => v.color).filter(Boolean))]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ffffff' }}>
      {/* Header */}
      <StoreHeader 
        slug={slug} 
        storeName={store.store_name} 
        logo={store.logo_url || undefined}
      />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm mb-8" style={{ color: '#666666' }}>
          <Link href={`/${slug}`} className="hover:underline" style={{ color: '#000000' }}>
            Início
          </Link>
          <span>/</span>
          <span>Produtos</span>
          <span>/</span>
          <span style={{ color: '#000000', fontWeight: 500 }}>{product.name}</span>
        </nav>

        {/* Layout Principal: 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Coluna 1: Galeria de Imagens */}
          <div className="space-y-4">
            {/* Imagem Principal */}
            <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: '#f5f5f5' }}>
              {images[0] ? (
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg className="w-24 h-24" style={{ color: '#cccccc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-square rounded-lg overflow-hidden cursor-pointer transition-all hover:opacity-80"
                    style={{ backgroundColor: '#f5f5f5', border: '2px solid #eeeeee' }}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coluna 2: Informações do Produto */}
          <div className="space-y-6">
            {/* Badge NOVO */}
            <div>
              <span className="inline-block px-3 py-1 text-xs font-bold text-white rounded-full" style={{ backgroundColor: '#000000' }}>
                NOVO
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl font-bold leading-tight" style={{ color: '#1a1a1a' }}>
              {product.name}
            </h1>

            {/* Preço */}
            <div className="py-6 px-6 rounded-2xl" style={{ backgroundColor: '#f5f5f5' }}>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold" style={{ color: '#000000' }}>
                  R$ {(price / 100).toFixed(2)}
                </span>
              </div>
              <p className="text-sm mt-2" style={{ color: '#666666' }}>
                ou 3x de R$ {(price / 300).toFixed(2)} sem juros
              </p>
            </div>

            {/* Descrição */}
            {product.description && (
              <div className="py-4">
                <h2 className="text-lg font-semibold mb-3" style={{ color: '#1a1a1a' }}>
                  Descrição
                </h2>
                <p className="leading-relaxed" style={{ color: '#666666', lineHeight: '1.8' }}>
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart Component */}
            <div className="pt-4">
              <AddToCartButton
                productId={product.id}
                productName={product.name}
                productPrice={price}
                productSku={product.sku}
                productImage={images[0] || '/placeholder.png'}
                storeSlug={slug}
                availableSizes={sizes as string[]}
                availableColors={colors as string[]}
              />
            </div>

            {/* Informações Adicionais */}
            <div className="mt-8 p-6 rounded-2xl" style={{ backgroundColor: '#f9f9f9' }}>
              <h3 className="font-semibold mb-4" style={{ color: '#1a1a1a' }}>
                Informações do Produto
              </h3>
              <ul className="space-y-2 text-sm" style={{ color: '#666666' }}>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  SKU: {product.sku}
                </li>
                {sizes.length > 0 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Tamanhos disponíveis: {sizes.join(', ')}
                  </li>
                )}
                {colors.length > 0 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-5 h-5" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Cores disponíveis: {colors.join(', ')}
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Entrega rápida para todo Brasil
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Parcele em até 3x sem juros
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="py-12 border-t" style={{ borderColor: '#eeeeee' }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                <svg className="w-8 h-8" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h4 className="font-semibold mb-1" style={{ color: '#1a1a1a' }}>Entrega Rápida</h4>
              <p className="text-sm" style={{ color: '#666666' }}>Em todo Brasil</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                <svg className="w-8 h-8" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-1" style={{ color: '#1a1a1a' }}>Compra Segura</h4>
              <p className="text-sm" style={{ color: '#666666' }}>100% protegida</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                <svg className="w-8 h-8" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-1" style={{ color: '#1a1a1a' }}>Parcele em 3x</h4>
              <p className="text-sm" style={{ color: '#666666' }}>Sem juros</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
                <svg className="w-8 h-8" style={{ color: '#000000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="font-semibold mb-1" style={{ color: '#1a1a1a' }}>Atendimento</h4>
              <p className="text-sm" style={{ color: '#666666' }}>Rápido via WhatsApp</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
