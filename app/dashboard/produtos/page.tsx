import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProductsPage() {
  const supabase = await createClient()

  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Buscar loja do usuário
  const { data: store } = await supabase
    .from('stores')
    .select('*')
    .eq('owner_id', user.id)
    .single()

  if (!store) redirect('/login')

  // Buscar produtos
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_variants (
        id,
        size,
        color,
        stock,
        price_cents
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: '#1a1a1a' }}>
            Produtos
          </h1>
          <p className="text-sm" style={{ color: '#666666' }}>
            Gerencie seu catálogo de produtos
          </p>
        </div>
        <Link
          href="/dashboard/produtos/novo"
          className="px-4 py-2 font-semibold rounded-full flex items-center gap-2"
          style={{ backgroundColor: '#000000', color: '#ffffff' }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Produto
        </Link>
      </div>

      {/* Lista de Produtos */}
      {products && products.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: '#f9f9f9' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#666666' }}>
                    PRODUTO
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#666666' }}>
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#666666' }}>
                    STATUS
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#666666' }}>
                    VARIAÇÕES
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#666666' }}>
                    ESTOQUE
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold" style={{ color: '#666666' }}>
                    PREÇO
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold" style={{ color: '#666666' }}>
                    AÇÕES
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product: any) => {
                  const images = product.images as string[] || []
                  const variants = product.product_variants || []
                  const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                  const avgPrice = variants.length > 0
                    ? variants.reduce((sum: number, v: any) => sum + (v.price_cents || 0), 0) / variants.length
                    : 0

                  return (
                    <tr key={product.id} className="border-t" style={{ borderColor: '#eeeeee' }}>
                      {/* Imagem + Nome */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="relative flex-shrink-0 rounded-lg overflow-hidden"
                            style={{ width: '48px', height: '48px', backgroundColor: '#f5f5f5' }}
                          >
                            {images[0] ? (
                              <Image
                                src={images[0]}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <svg className="w-6 h-6" style={{ color: '#cccccc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: '#1a1a1a' }}>
                              {product.name}
                            </p>
                            {product.description && (
                              <p className="text-xs mt-0.5 line-clamp-1" style={{ color: '#999999' }}>
                                {product.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono" style={{ color: '#666666' }}>
                          {product.sku}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        {product.active ? (
                          <span
                            className="inline-block px-2 py-1 text-xs font-semibold rounded-full"
                            style={{ backgroundColor: '#d1fae5', color: '#065f46' }}
                          >
                            Ativo
                          </span>
                        ) : (
                          <span
                            className="inline-block px-2 py-1 text-xs font-semibold rounded-full"
                            style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}
                          >
                            Inativo
                          </span>
                        )}
                      </td>

                      {/* Variações */}
                      <td className="px-4 py-4">
                        <span className="text-sm" style={{ color: '#666666' }}>
                          {variants.length} {variants.length === 1 ? 'variação' : 'variações'}
                        </span>
                      </td>

                      {/* Estoque */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold" style={{ color: totalStock > 0 ? '#000000' : '#ef4444' }}>
                          {totalStock} un.
                        </span>
                      </td>

                      {/* Preço */}
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold" style={{ color: '#000000' }}>
                          {avgPrice > 0 ? `R$ ${(avgPrice / 100).toFixed(2)}` : '-'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/dashboard/produtos/${product.id}`}
                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            style={{ color: '#1a1a1a' }}
                          >
                            Editar
                          </Link>
                          <Link
                            href={`/${store.slug}/produto/${product.id}`}
                            target="_blank"
                            className="px-3 py-1.5 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            style={{ color: '#666666' }}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        // Estado Vazio
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: '#f5f5f5' }}>
            <svg className="w-8 h-8" style={{ color: '#cccccc' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#1a1a1a' }}>
            Nenhum produto cadastrado
          </h3>
          <p className="text-sm mb-6" style={{ color: '#666666' }}>
            Comece criando seu primeiro produto para vender na sua loja
          </p>
          <Link
            href="/dashboard/produtos/novo"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-full"
            style={{ backgroundColor: '#000000', color: '#ffffff' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Primeiro Produto
          </Link>
        </div>
      )}
    </div>
  )
}
