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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Produtos
          </h1>
          <p className="text-base text-gray-600">
            Gerencie seu catálogo de produtos
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/dashboard/produtos/novo"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Produto
          </Link>
          <Link
            href="/dashboard/bulk-import"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importar em Massa
          </Link>
        </div>

        {/* Lista de Produtos */}
        {products && products.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Variações
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Estoque
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Preço
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product: any) => {
                    const images = product.images as string[] || []
                    const variants = product.product_variants || []
                    const totalStock = variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
                    const avgPrice = variants.length > 0
                      ? variants.reduce((sum: number, v: any) => sum + (v.price_cents || 0), 0) / variants.length
                      : 0

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        {/* Imagem + Nome */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0 rounded-lg overflow-hidden w-14 h-14 bg-gray-100">
                              {images[0] ? (
                                <Image
                                  src={images[0]}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 text-base">
                                {product.name}
                              </p>
                              {product.description && (
                                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* SKU */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-mono text-gray-600">
                            {product.sku}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          {product.active ? (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Inativo
                            </span>
                          )}
                          </td>

                        {/* Variações */}
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600">
                            {variants.length} {variants.length === 1 ? 'variação' : 'variações'}
                          </span>
                        </td>

                        {/* Estoque */}
                        <td className="px-6 py-4">
                          <span className={`text-sm font-semibold ${totalStock > 0 ? 'text-gray-900' : 'text-red-600'}`}>
                            {totalStock} un.
                          </span>
                        </td>

                        {/* Preço */}
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {avgPrice > 0 ? `R$ ${(avgPrice / 100).toFixed(2)}` : '-'}
                          </span>
                        </td>

                        {/* Ações */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/produtos/${product.id}`}
                              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Editar
                            </Link>
                            <Link
                              href={`/${store.slug}/produto/${product.id}`}
                              target="_blank"
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Visualizar na loja"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-gray-100">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Comece criando seu primeiro produto ou importando vários de uma vez
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/dashboard/produtos/novo"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Primeiro Produto
              </Link>
              <Link
                href="/dashboard/bulk-import"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Importar em Massa
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
