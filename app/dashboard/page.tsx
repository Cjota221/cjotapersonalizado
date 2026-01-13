import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Verificar autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }
  
  // Buscar ou criar loja
  let { data: store } = await supabase.from('stores').select('*').eq('owner_id', user.id).single()
  
  // Se não tem loja, criar uma automaticamente
  if (!store) {
    const { data: newStore, error } = await supabase.from('stores').insert({
      owner_id: user.id,
      slug: `loja-${user.email?.split('@')[0] || 'user'}`,
      store_name: `Loja de ${user.email?.split('@')[0] || 'Usuário'}`,
      colors: { primary: '#000000', button: '#000000', background: '#ffffff' },
      loja_configurada: false
    }).select().single()
    
    if (error) {
      console.error('Erro ao criar loja:', error)
    } else {
      store = newStore
    }
  }
  
  // Se ainda não tem loja, mostrar erro amigável
  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>Erro ao carregar loja</h1>
          <p className="text-sm mb-6" style={{ color: '#666666' }}>
            Não foi possível criar sua loja automaticamente. Entre em contato com o suporte.
          </p>
          <Link href="/login" className="px-6 py-2 rounded-full font-semibold" style={{ backgroundColor: '#000000', color: '#ffffff' }}>
            Voltar para Login
          </Link>
        </div>
      </div>
    )
  }
  
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: ordersCount } = await supabase.from('pre_orders').select('*', { count: 'exact', head: true }).eq('store_id', store.id)
  const { data: recentOrders } = await supabase
    .from('pre_orders')
    .select('*')
    .eq('store_id', store.id)
    .order('created_at', { ascending: false })
    .limit(5)
  
  return (
    <AdminLayout storeName={store?.store_name} storeSlug={store?.slug}>
      {/* REDUZIDO: mb-8 para mb-6 */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Visão geral do seu sistema de pedidos</p>
      </div>
      
      {/* REDUZIDO: gap-6 para gap-4, mb-8 para mb-6 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Produtos</p>
              {/* REDUZIDO: text-3xl para text-2xl, mt-2 para mt-1 */}
              <p className="text-2xl font-bold text-gray-900 mt-1">{productsCount || 0}</p>
            </div>
            {/* REDUZIDO: w-12 h-12 para w-10 h-10, w-6 h-6 para w-5 h-5 */}
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Pedidos Pendentes</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{ordersCount || 0}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Sua Loja</p>
              {/* REDUZIDO: text-lg para text-base, mt-2 para mt-1 */}
              <p className="text-base font-semibold text-gray-900 mt-1">{store?.store_name || 'Não configurada'}</p>
              <p className="text-xs text-gray-500">/{store?.slug || 'sem-slug'}</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        {/* REDUZIDO: mb-6 para mb-4 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            {/* REDUZIDO: text-lg para text-base */}
            <h2 className="text-base font-semibold text-gray-900">Pedidos Recentes</h2>
            <p className="text-sm text-gray-500 mt-1">Últimos pedidos recebidos pelo sistema</p>
          </div>
          <Link href="/dashboard/pedidos" className="btn btn-secondary btn-sm">
            Ver todos
          </Link>
        </div>
        
        {recentOrders && recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order: any) => (
                  <tr key={order.id}>
                    <td className="font-medium">{order.customer_name}</td>
                    <td>{order.customer_whatsapp}</td>
                    <td>
                      <span className={`badge ${
                        order.status === 'pending' ? 'badge-warning' :
                        order.status === 'confirmed' ? 'badge-success' :
                        'badge-primary'
                      }`}>
                        {order.status === 'pending' ? 'Pendente' :
                         order.status === 'confirmed' ? 'Confirmado' : 'Processando'}
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td>
                      <Link href={`/dashboard/pedidos/${order.id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-500 text-sm">Nenhum pedido recebido ainda</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
