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
      
      {/* REDUZIDO: padding de 2rem para 1.5rem */}
      <main style={{ marginLeft: '256px', paddingTop: '56px' }}>
        <div style={{ padding: '1.5rem' }}>
          {children}
        </div>
      </main>
    </div>
  )
}
