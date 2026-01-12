import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import StoreHeader from '@/components/StoreHeader'
import AddToCartButton from '@/components/AddToCartButton'

interface PageProps {
  params: Promise<{ slug: string; id: string }>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <StoreHeader 
        slug={slug} 
        storeName={store.store_name} 
        logo={store.logo_url || undefined}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href={`/${slug}`} className="hover:text-blue-600">
            Produtos
          </Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <div>
            <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg mb-4">
              <Image
                src={images[0] || '/placeholder.png'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.slice(1, 5).map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-white rounded-lg overflow-hidden shadow cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all">
                    <Image
                      src={img}
                      alt={`${product.name} - ${idx + 2}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">
                R$ {(price / 100).toFixed(2)}
              </span>
              <span className="text-sm text-gray-600 font-mono">
                {product.sku}
              </span>
            </div>

            {product.description && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Descrição</h2>
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Add to Cart Component */}
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

            {/* Product Details */}
            <div className="mt-8 p-6 bg-gray-100 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Informações do Produto</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Produto por encomenda
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Finalização via WhatsApp
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Entrega conforme disponibilidade
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
