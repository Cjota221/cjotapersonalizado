'use client'

import { CartProvider } from '@/contexts/CartContext'

interface StoreLayoutClientProps {
  children: React.ReactNode
  storeSlug: string
}

export default function StoreLayoutClient({ children, storeSlug }: StoreLayoutClientProps) {
  return <CartProvider storeSlug={storeSlug}>{children}</CartProvider>
}
