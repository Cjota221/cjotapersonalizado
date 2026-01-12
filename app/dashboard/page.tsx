import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: store } = await supabase.from('stores').select('*').limit(1).single()
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact' }).limit(1)
  const { count: ordersCount } = await supabase.from('pre_orders').select('*', { count: 'exact' }).eq('store_id', store?.id).limit(1)
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6"><h1 className="text-2xl font-bold text-blue-600">CJota Admin</h1></div>
        <nav className="px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">Dashboard</Link>
          <Link href="/dashboard/produtos" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Produtos</Link>
          <Link href="/dashboard/pedidos" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">Pedidos</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Pedidos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{ordersCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Produtos</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{productsCount || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600">Loja</h3>
            <p className="text-sm font-medium text-blue-600 mt-2">{store?.store_name || 'N/A'}</p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2"> Versão de Teste</h3>
          <p className="text-blue-800">Autenticação será implementada em breve!</p>
        </div>
      </main>
    </div>
  )
}
