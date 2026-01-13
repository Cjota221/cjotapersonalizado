import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'

export default function AdminLayout({
  children,
  storeName,
  storeSlug
}: {
  children: React.ReactNode
  storeName?: string
  storeSlug?: string
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <AdminTopbar storeName={storeName} storeSlug={storeSlug} />
      
      <main className="ml-64 pt-16">
        {children}
      </main>
    </div>
  )
}
