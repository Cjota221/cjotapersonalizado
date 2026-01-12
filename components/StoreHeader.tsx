'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/contexts/CartContext'

interface StoreHeaderProps {
  slug: string
  storeName: string
  logo?: string
}

export default function StoreHeader({ slug, storeName, logo }: StoreHeaderProps) {
  const { totalItems } = useCart()

  return (
    <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#ffffff', borderColor: '#eeeeee' }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Nome */}
          <Link href={`/${slug}`} className="flex items-center gap-3">
            {logo && (
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image src={logo} alt={storeName} fill className="object-cover" />
              </div>
            )}
            <span className="text-xl font-bold" style={{ color: '#1a1a1a' }}>
              {storeName}
            </span>
          </Link>

          {/* Botão Carrinho */}
          <Link
            href={`/${slug}/carrinho`}
            className="relative flex items-center gap-2 px-4 py-2 font-medium rounded-full transition-all"
            style={{ 
              backgroundColor: '#000000',
              color: '#ffffff'
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <span className="hidden md:inline">Carrinho</span>
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold rounded-full" style={{ backgroundColor: '#ff0000', color: '#ffffff' }}>
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
