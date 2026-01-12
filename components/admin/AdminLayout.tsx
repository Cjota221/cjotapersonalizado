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
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <AdminSidebar />
      <AdminTopbar storeName={storeName} storeSlug={storeSlug} />
      
      <main style={{ marginLeft: '256px', paddingTop: '64px' }}>
        <div style={{ padding: '2rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
