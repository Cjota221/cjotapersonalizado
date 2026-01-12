'use client'

import Link from 'next/link'

export default function AdminTopbar({ storeName, storeSlug }: { storeName?: string; storeSlug?: string }) {
  return (
    <header style={{
      height: '56px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      position: 'fixed',
      top: 0,
      right: 0,
      left: '256px',
      zIndex: 10
    }}>
      <div style={{
        height: '100%',
        padding: '0 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#111827'
          }}>
            {storeName || 'Painel Administrativo'}
          </h2>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {storeSlug && (
            <Link
              href={`/${storeSlug}`}
              target="_blank"
              className="btn btn-secondary btn-sm"
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver Loja
            </Link>
          )}
          
          <button className="btn btn-secondary btn-sm">
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
