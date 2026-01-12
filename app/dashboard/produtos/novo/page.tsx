'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Variant {
  id: string
  size: string
  color: string
  stock: number
  price_cents: number
}

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Estados do formulário
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([''])
  const [active, setActive] = useState(true)
  const [variants, setVariants] = useState<Variant[]>([
    { id: '1', size: '', color: '', stock: 0, price_cents: 0 }
  ])

  const addImageField = () => {
    setImages([...images, ''])
  }

  const updateImage = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    setVariants([
      ...variants,
      { id: Date.now().toString(), size: '', color: '', stock: 0, price_cents: 0 }
    ])
  }

  const updateVariant = (id: string, field: keyof Variant, value: any) => {
    setVariants(variants.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (id: string) => {
    if (variants.length > 1) {
      setVariants(variants.filter(v => v.id !== id))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validações
      if (!name.trim()) {
        throw new Error('Nome do produto é obrigatório')
      }
      if (!sku.trim()) {
        throw new Error('SKU é obrigatório')
      }

      // Filtrar imagens vazias
      const validImages = images.filter(img => img.trim() !== '')

      // Preparar dados
      const productData = {
        name: name.trim(),
        sku: sku.trim().toUpperCase(),
        description: description.trim(),
        images: validImages,
        active,
        variants: variants.map(v => ({
          size: v.size.trim(),
          color: v.color.trim(),
          stock: Number(v.stock) || 0,
          price_cents: Math.round(Number(v.price_cents) * 100) || 0
        }))
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erro ao criar produto')
      }

      // Sucesso - redirecionar
      router.push('/dashboard/produtos?success=created')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/dashboard/produtos"
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white transition-colors"
              style={{ color: '#1a1a1a' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
              Novo Produto
            </h1>
          </div>
          <p className="text-sm" style={{ color: '#666666' }}>
            Preencha as informações do produto e suas variações
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card: Informações Básicas */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1a1a1a' }}>
              Informações Básicas
            </h2>

            <div className="space-y-4">
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
                  Nome do Produto *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  placeholder="Ex: Vestido Floral Primavera"
                  required
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
                  SKU (Código) *
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                  style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  placeholder="Ex: VEST001"
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  Código único de identificação do produto
                </p>
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1a1a1a' }}>
                  Descrição
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 min-h-[100px]"
                  style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  placeholder="Descreva o produto, seus detalhes e características..."
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium" style={{ color: '#1a1a1a' }}>
                  Produto ativo (visível na loja)
                </label>
              </div>
            </div>
          </div>

          {/* Card: Imagens */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
                Imagens do Produto
              </h2>
              <button
                type="button"
                onClick={addImageField}
                className="px-3 py-1 text-sm font-medium rounded-lg"
                style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}
              >
                + Adicionar Imagem
              </button>
            </div>

            <div className="space-y-3">
              {images.map((img, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={img}
                    onChange={(e) => updateImage(idx, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="px-3 py-2 rounded-lg hover:bg-red-50"
                      style={{ color: '#ef4444' }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <p className="text-xs mt-3" style={{ color: '#999999' }}>
              Cole as URLs das imagens do produto. A primeira imagem será a principal.
            </p>
          </div>

          {/* Card: Variações */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
                  Variações (Tamanhos e Cores)
                </h2>
                <p className="text-xs mt-1" style={{ color: '#999999' }}>
                  Defina os tamanhos, cores, estoque e preço de cada variação
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1 text-sm font-medium rounded-lg"
                style={{ backgroundColor: '#000000', color: '#ffffff' }}
              >
                + Adicionar Variação
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, idx) => (
                <div key={variant.id} className="p-4 rounded-lg" style={{ backgroundColor: '#f9f9f9' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium" style={{ color: '#666666' }}>
                      Variação #{idx + 1}
                    </span>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(variant.id)}
                        className="text-sm hover:underline"
                        style={{ color: '#ef4444' }}
                      >
                        Remover
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#666666' }}>
                        Tamanho
                      </label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(variant.id, 'size', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                        placeholder="P, M, G, 36..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#666666' }}>
                        Cor
                      </label>
                      <input
                        type="text"
                        value={variant.color}
                        onChange={(e) => updateVariant(variant.id, 'color', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                        placeholder="Azul, Vermelho..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#666666' }}>
                        Estoque
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) => updateVariant(variant.id, 'stock', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: '#666666' }}>
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={variant.price_cents / 100 || ''}
                        onChange={(e) => updateVariant(variant.id, 'price_cents', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                        placeholder="99.90"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#fee2e2', color: '#991b1b' }}>
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 font-semibold rounded-full transition-all disabled:opacity-50"
              style={{ backgroundColor: '#000000', color: '#ffffff' }}
            >
              {loading ? 'Salvando...' : 'Criar Produto'}
            </button>
            <Link
              href="/dashboard/produtos"
              className="px-6 py-3 font-semibold rounded-full"
              style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
