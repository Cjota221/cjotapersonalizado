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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href={`/${slug}`} className="flex items-center gap-3">
          {logo && (
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image src={logo} alt={storeName} fill className="object-cover" />
            </div>
          )}
          <span className="text-xl font-bold text-gray-900">{storeName}</span>
        </Link>

        <Link
          href={`/${slug}/carrinho`}
          className="relative flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span className="font-medium">Carrinho</span>
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full">
              {totalItems}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
