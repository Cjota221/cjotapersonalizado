'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  size?: string
  color?: string
  quantity: number
  image: string
  sku?: string
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

interface CartProviderProps {
  children: ReactNode
  storeSlug: string
}

export function CartProvider({ children, storeSlug }: CartProviderProps) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Carregar carrinho do localStorage quando montar
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem(`cart_${storeSlug}`)
        if (savedCart) {
          setCart(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error)
      }
      setIsLoaded(true)
    }
    loadCart()
  }, [storeSlug])

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(`cart_${storeSlug}`, JSON.stringify(cart))
    }
  }, [cart, storeSlug, isLoaded])

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCart(currentCart => {
      // Verificar se item já existe no carrinho (mesmo produto + tamanho + cor)
      const existingItemIndex = currentCart.findIndex(
        cartItem =>
          cartItem.productId === item.productId &&
          cartItem.size === item.size &&
          cartItem.color === item.color
      )

      if (existingItemIndex > -1) {
        // Atualizar quantidade do item existente
        const newCart = [...currentCart]
        newCart[existingItemIndex].quantity += item.quantity || 1
        return newCart
      } else {
        // Adicionar novo item
        return [...currentCart, { ...item, quantity: item.quantity || 1 }]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCart(currentCart => currentCart.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    setCart(currentCart =>
      currentCart.map(item => (item.id === id ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setCart([])
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
