import { ReactNode } from 'react'
import StoreLayoutClient from './layout-client'

interface StoreLayoutProps {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export default async function StoreLayout({ children, params }: StoreLayoutProps) {
  const { slug } = await params

  return <StoreLayoutClient storeSlug={slug}>{children}</StoreLayoutClient>
}
