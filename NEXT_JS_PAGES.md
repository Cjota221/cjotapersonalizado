# Páginas para o Projeto Next.js

## 1. Dashboard Principal
**Caminho:** `app/dashboard/page.tsx`
✅ JÁ CRIADO!

---

## 2. Página de Produtos
**Caminho:** `app/dashboard/produtos/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProdutosPage() {
  const supabase = await createClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false })
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6"><h1 className="text-2xl font-bold text-blue-600">CJota Admin</h1></div>
        <nav className="px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">📊 Dashboard</Link>
          <Link href="/dashboard/produtos" className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">📦 Produtos</Link>
          <Link href="/dashboard/pedidos" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">🛒 Pedidos</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Produtos</h2>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
            + Novo Produto
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Imagem</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nome</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">SKU</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Variações</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products?.map((product: any) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {product.main_image_url ? (
                      <img 
                        src={product.main_image_url} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                        📷
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</p>
                  </td>
                  <td className="px-6 py-4 text-gray-700">{product.sku}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      product.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {product.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {product.product_variants?.length || 0} variações
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800 font-medium">
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!products || products.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
```

---

## 3. Página de Pedidos
**Caminho:** `app/dashboard/pedidos/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function PedidosPage() {
  const supabase = await createClient()
  const { data: store } = await supabase.from('stores').select('*').limit(1).single()
  const { data: orders } = await supabase
    .from('pre_orders')
    .select('*')
    .eq('store_id', store?.id)
    .order('created_at', { ascending: false })
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-6"><h1 className="text-2xl font-bold text-blue-600">CJota Admin</h1></div>
        <nav className="px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">📊 Dashboard</Link>
          <Link href="/dashboard/produtos" className="block px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg">📦 Produtos</Link>
          <Link href="/dashboard/pedidos" className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">🛒 Pedidos</Link>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Pedidos</h2>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Cliente</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">WhatsApp</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Itens</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`https://wa.me/${order.customer_whatsapp}`}
                      target="_blank"
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {order.customer_whatsapp}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Pendente' :
                       order.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {JSON.parse(order.items || '[]').length} item(ns)
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(order.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(!orders || orders.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">Nenhum pedido encontrado</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
```

---

## 4. Como Aplicar no Projeto Next.js

1. **Abra o projeto correto:**
   - File → Open Folder
   - Navegue até: `c:\Users\carol\Downloads\cjota-nextjs`

2. **Crie os arquivos:**
   - ✅ `app/dashboard/page.tsx` (já criado)
   - 📝 `app/dashboard/produtos/page.tsx` (copie o código acima)
   - 📝 `app/dashboard/pedidos/page.tsx` (copie o código acima)

3. **Teste localmente:**
   ```bash
   npm run dev
   ```
   
4. **Acesse:**
   - http://localhost:3000/dashboard
   - http://localhost:3000/dashboard/produtos
   - http://localhost:3000/dashboard/pedidos

5. **Faça deploy:**
   ```bash
   git add .
   git commit -m "feat: Recriar todas as páginas do dashboard"
   git push
   ```
