'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface DraftProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: string;
  tags: string[];
  draft_images: DraftImage[];
}

interface DraftImage {
  temp_url: string;
  is_primary: boolean;
}

export default function BulkImportEditPage({ params }: { params: { id: string } }) {
  const importId = params.id;
  const router = useRouter();

  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadDrafts();
  }, [importId]);

  const loadDrafts = async () => {
    try {
      const res = await fetch(`/api/bulk-import/${importId}/drafts`);
      const data = await res.json();
      if (data.success) {
        setDrafts(data.drafts);
      }
    } catch (error) {
      console.error('Erro ao carregar rascunhos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDraft = async (draftId: string, field: string, value: any) => {
    try {
      await fetch(`/api/bulk-import/draft/${draftId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value })
      });
      
      // Atualizar localmente
      setDrafts(drafts.map((d: DraftProduct) =>
        d.id === draftId ? { ...d, [field]: value } : d
      ));
    } catch (error) {
      console.error('Erro ao atualizar:', error);
    }
  };

  const createProducts = async () => {
    if (!confirm(`Criar ${drafts.length} produtos?`)) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/bulk-import/${importId}/create-products`, {
        method: 'POST'
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`${data.created_count} produtos criados com sucesso!`);
        router.push(`/dashboard/bulk-import/${importId}/summary`);
      } else {
        alert('Erro ao criar produtos');
      }
    } catch (error) {
      console.error('Erro ao criar produtos:', error);
      alert('Erro ao criar produtos');
    } finally {
      setCreating(false);
    }
  };

  const filteredDrafts = drafts.filter((d: DraftProduct) =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (draftId: string) => {
    setSelectedDrafts(prev =>
      prev.includes(draftId)
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  const applyBatch = (field: string, value: any) => {
    if (selectedDrafts.length === 0) {
      alert('Selecione pelo menos um produto');
      return;
    }

    selectedDrafts.forEach(draftId => {
      updateDraft(draftId, field, value);
    });
    
    alert(`Alteração aplicada a ${selectedDrafts.length} produtos`);
    setSelectedDrafts([]);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregando produtos...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revisão Final</h1>
            <p className="text-gray-600 mt-1">
              {filteredDrafts.length} produtos prontos para criar
            </p>
          </div>
          <button
            onClick={createProducts}
            disabled={creating}
            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50"
          >
            {creating ? 'Criando...' : 'Criar Produtos'}
          </button>
        </div>

        {/* Busca e ações em lote */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full"
          />
          {selectedDrafts.length > 0 && (
            <button
              onClick={() => {
                const price = prompt('Preço para aplicar:');
                if (price) applyBatch('price', parseFloat(price));
              }}
              className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Aplicar Preço ({selectedDrafts.length})
            </button>
          )}
        </div>

        {/* Tabela editável */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedDrafts.length === filteredDrafts.length && filteredDrafts.length > 0}
                      onChange={() => {
                        if (selectedDrafts.length === filteredDrafts.length) {
                          setSelectedDrafts([]);
                        } else {
                          setSelectedDrafts(filteredDrafts.map((d: DraftProduct) => d.id));
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th className="w-20 px-4 py-3 text-left text-sm font-medium text-gray-700">Foto</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-700">Preço</th>
                  <th className="w-24 px-4 py-3 text-left text-sm font-medium text-gray-700">Estoque</th>
                  <th className="w-32 px-4 py-3 text-left text-sm font-medium text-gray-700">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrafts.map((draft: DraftProduct) => {
                  const primaryImage = draft.draft_images?.find(img => img.is_primary) || draft.draft_images?.[0];
                  
                  return (
                    <tr key={draft.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedDrafts.includes(draft.id)}
                          onChange={() => toggleSelect(draft.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        {primaryImage && (
                          <img
                            src={primaryImage.temp_url}
                            alt={draft.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={draft.name}
                          onChange={(e) => updateDraft(draft.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          step="0.01"
                          value={draft.price || ''}
                          onChange={(e) => updateDraft(draft.id, 'price', parseFloat(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="0.00"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={draft.stock_quantity || ''}
                          onChange={(e) => updateDraft(draft.id, 'stock_quantity', parseInt(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={draft.tags?.join(', ') || ''}
                          onChange={(e) => updateDraft(draft.id, 'tags', e.target.value.split(',').map((t: string) => t.trim()))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="tag1, tag2"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {filteredDrafts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto para revisar'}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
