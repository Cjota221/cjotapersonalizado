'use client'

import Link from 'next/link'

interface CartHeaderProps {
  slug: string
}

export default function CartHeader({ slug }: CartHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar para loja
        </Link>
      </div>
    </header>
  )
}
