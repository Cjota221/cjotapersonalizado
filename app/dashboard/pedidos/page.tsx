import { createClient } from '@/lib/supabase/server'
import AdminLayout from '@/components/admin/AdminLayout'
import Link from 'next/link'

export default async function PedidosPage() {
  const supabase = await createClient()
  
  const { data: store } = await supabase.from('stores').select('*').limit(1).single()
  const { data: orders } = await supabase
    .from('pre_orders')
    .select('*')
    .eq('store_id', store?.id || '')
    .order('created_at', { ascending: false })
  
  return (
    <AdminLayout storeName={store?.store_name} storeSlug={store?.slug}>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Pedidos por Encomenda</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie todos os pedidos recebidos pelo sistema</p>
      </div>
      
      <div className="card">
        {orders && orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Cliente</th>
                  <th>WhatsApp</th>
                  <th>Cidade/UF</th>
                  <th>Status</th>
                  <th>Itens</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any) => {
                  const items = JSON.parse(order.items || '[]')
                  return (
                    <tr key={order.id}>
                      <td className="font-mono text-sm">#{order.id.slice(0, 8)}</td>
                      <td>
                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                      </td>
                      <td>
                        <a 
                          href={`https://wa.me/${order.customer_whatsapp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                        >
                          {order.customer_whatsapp}
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </td>
                      <td className="text-gray-600">
                        {order.customer_city && order.customer_state 
                          ? `${order.customer_city}/${order.customer_state}`
                          : '-'}
                      </td>
                      <td>
                        <span className={`badge ${
                          order.status === 'pending' ? 'badge-warning' :
                          order.status === 'confirmed' ? 'badge-success' :
                          'badge-primary'
                        }`}>
                          {order.status === 'pending' ? 'Pendente' :
                           order.status === 'confirmed' ? 'Confirmado' :
                           order.status === 'cancelled' ? 'Cancelado' : 'Processando'}
                        </span>
                      </td>
                      <td className="text-gray-600">{items.length} item(ns)</td>
                      <td className="text-gray-500">
                        {new Date(order.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <Link 
                          href={`/dashboard/pedidos/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido recebido</h3>
            <p className="text-gray-500 mb-6">Os pedidos feitos pelos clientes aparecerão aqui</p>
            <Link href={`/${store?.slug || ''}`} target="_blank" className="btn btn-primary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Ver minha loja
            </Link>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
