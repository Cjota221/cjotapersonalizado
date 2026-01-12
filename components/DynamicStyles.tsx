'use client'

import { useEffect } from 'react'

interface DynamicStylesProps {
  colors?: {
    primary?: string
    button?: string
  }
}

export default function DynamicStyles({ colors }: DynamicStylesProps) {
  useEffect(() => {
    const primaryColor = colors?.primary || '#3b82f6'
    const buttonColor = colors?.button || '#3b82f6'

    // Aplicar CSS variables
    document.documentElement.style.setProperty('--store-primary', primaryColor)
    document.documentElement.style.setProperty('--store-button', buttonColor)

    return () => {
      // Cleanup
      document.documentElement.style.removeProperty('--store-primary')
      document.documentElement.style.removeProperty('--store-button')
    }
  }, [colors])

  return null
}
