'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'

interface AddToCartButtonProps {
  productId: string
  productName: string
  productPrice: number
  productSku: string
  productImage: string
  storeSlug: string
  availableSizes?: string[]
  availableColors?: string[]
}

export default function AddToCartButton({
  productId,
  productName,
  productPrice,
  productSku,
  productImage,
  storeSlug,
  availableSizes = [],
  availableColors = [],
}: AddToCartButtonProps) {
  const router = useRouter()
  const { addToCart } = useCart()
  
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    availableSizes.length > 0 ? availableSizes[0] : undefined
  )
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    availableColors.length > 0 ? availableColors[0] : undefined
  )
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (availableSizes.length > 0 && !selectedSize) {
      alert('Por favor, selecione um tamanho')
      return
    }

    if (availableColors.length > 0 && !selectedColor) {
      alert('Por favor, selecione uma cor')
      return
    }

    setIsAdding(true)

    // Criar ID único baseado em produto + variações
    const itemId = `${productId}_${selectedSize || 'default'}_${selectedColor || 'default'}`

    addToCart({
      id: itemId,
      productId,
      name: productName,
      price: productPrice,
      size: selectedSize,
      color: selectedColor,
      image: productImage,
      sku: productSku,
      quantity,
    })

    // Feedback visual
    setTimeout(() => {
      setIsAdding(false)
      // Mostrar toast de sucesso (opcional)
      const confirmed = confirm('Produto adicionado ao carrinho! Deseja ir para o carrinho?')
      if (confirmed) {
        router.push(`/${storeSlug}/carrinho`)
      }
    }, 500)
  }

  return (
    <div className="space-y-6">
      {/* Tamanhos */}
      {availableSizes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tamanho</h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                  selectedSize === size
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cores */}
      {availableColors.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Cor</h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`px-4 py-2 border-2 rounded-lg font-medium capitalize transition-all ${
                  selectedColor === color
                    ? 'border-blue-600 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-600 hover:bg-blue-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantidade */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quantidade</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 text-lg font-bold"
          >
            -
          </button>
          <span className="w-16 text-center text-xl font-semibold">{quantity}</span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-100 text-lg font-bold"
          >
            +
          </button>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="flex-1 flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAdding ? (
            <>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adicionando...
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Adicionar ao Carrinho
            </>
          )}
        </button>
      </div>
    </div>
  )
}
