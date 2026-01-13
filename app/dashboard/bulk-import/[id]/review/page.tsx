'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface DraftProduct {
  id: string;
  name: string;
  group_key: string;
  sort_order: number;
  draft_images: DraftImage[];
}

interface DraftImage {
  id: string;
  temp_url: string;
  filename: string;
  is_primary: boolean;
  sort_order: number;
}

export default function BulkImportReviewPage({ params }: { params: { id: string } }) {
  const importId = params.id;
  const router = useRouter();

  const [drafts, setDrafts] = useState<DraftProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  
  // Configurações padrão
  const [showDefaultsModal, setShowDefaultsModal] = useState(false);
  const [defaults, setDefaults] = useState({
    default_price: '',
    default_stock: '',
    default_category_id: '',
    default_tags: ''
  });

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

  const changePrimaryImage = async (draftId: string, imageId: string) => {
    try {
      await fetch('/api/bulk-import/draft/change-primary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft_id: draftId, image_id: imageId })
      });
      loadDrafts();
    } catch (error) {
      console.error('Erro ao trocar imagem:', error);
    }
  };

  const deleteDraft = async (draftId: string) => {
    if (!confirm('Tem certeza que deseja excluir este grupo?')) return;
    
    try {
      await fetch(`/api/bulk-import/draft/${draftId}`, { method: 'DELETE' });
      setDrafts(drafts.filter(d => d.id !== draftId));
    } catch (error) {
      console.error('Erro ao deletar:', error);
    }
  };

  const applyDefaults = async () => {
    try {
      await fetch(`/api/bulk-import/${importId}/apply-defaults`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(defaults)
      });
      alert('Configurações aplicadas ao lote!');
      setShowDefaultsModal(false);
    } catch (error) {
      console.error('Erro ao aplicar configurações:', error);
    }
  };

  const goToFinalReview = () => {
    router.push(`/dashboard/bulk-import/${importId}/edit`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregando grupos...</p>
        </div>
      </AdminLayout>
    );
  }

  const primaryImage = (draft: DraftProduct) => 
    draft.draft_images.find(img => img.is_primary) || draft.draft_images[0];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Revisar Agrupamentos</h1>
            <p className="text-gray-600 mt-1">
              Verificamos {drafts.length} grupos. Revise se está correto antes de continuar.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowDefaultsModal(true)}
              className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Configurações Padrão
            </button>
            <button
              onClick={goToFinalReview}
              className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800"
            >
              Ir para Revisão Final
            </button>
          </div>
        </div>

        {/* Grid de grupos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drafts.map(draft => {
            const primary = primaryImage(draft);
            return (
              <div
                key={draft.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Imagem principal */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={primary?.temp_url}
                    alt={draft.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded-full">
                    {draft.draft_images.length} fotos
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-medium mb-1">{draft.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{draft.group_key}</p>

                  {/* Miniaturas */}
                  <div className="flex gap-2 mb-3 overflow-x-auto">
                    {draft.draft_images.map(img => (
                      <img
                        key={img.id}
                        src={img.temp_url}
                        alt=""
                        onClick={() => changePrimaryImage(draft.id, img.id)}
                        className={`
                          w-12 h-12 object-cover rounded cursor-pointer
                          ${img.is_primary ? 'ring-2 ring-black' : 'opacity-60 hover:opacity-100'}
                        `}
                      />
                    ))}
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteDraft(draft.id)}
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {drafts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Nenhum grupo encontrado
          </div>
        )}

        {/* Modal de Configurações Padrão */}
        {showDefaultsModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDefaultsModal(false)}>
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4">Configurações Padrão do Lote</h2>
              <p className="text-sm text-gray-600 mb-4">
                Estes valores serão aplicados a todos os produtos
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Preço Base (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={defaults.default_price}
                    onChange={(e) => setDefaults({...defaults, default_price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="99.90"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Padrão</label>
                  <input
                    type="number"
                    value={defaults.default_stock}
                    onChange={(e) => setDefaults({...defaults, default_stock: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={defaults.default_tags}
                    onChange={(e) => setDefaults({...defaults, default_tags: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="novidade, verão, destaque"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowDefaultsModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyDefaults}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800"
                >
                  Aplicar ao Lote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
