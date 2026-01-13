'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

interface ImportSummary {
  id: string;
  status: string;
  total_files: number;
  total_groups: number;
  total_products_created: number;
  created_at: string;
  completed_at: string;
}

export default function BulkImportSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const importId = resolvedParams.id;
  const router = useRouter();

  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSummary();
  }, [importId]);

  const loadSummary = async () => {
    try {
      const res = await fetch(`/api/bulk-import/${importId}`);
      const data = await res.json();
      setSummary(data);
    } catch (error) {
      console.error('Erro ao carregar resumo:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 text-center">
          <p className="text-gray-500">Carregando resumo...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Importação Concluída!</h1>
          <p className="text-gray-600">
            {summary?.total_products_created || 0} produtos foram criados com sucesso
          </p>
        </div>

        {/* Cards de estatísticas */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold mb-1">{summary?.total_files || 0}</div>
            <div className="text-sm text-gray-600">Arquivos Enviados</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold mb-1">{summary?.total_groups || 0}</div>
            <div className="text-sm text-gray-600">Grupos Criados</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold mb-1">{summary?.total_products_created || 0}</div>
            <div className="text-sm text-gray-600">Produtos Ativos</div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/dashboard/produtos')}
            className="w-full px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 font-medium"
          >
            Ver Todos os Produtos
          </button>
          <button
            onClick={() => router.push('/dashboard/bulk-import')}
            className="w-full px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 font-medium"
          >
            Criar Mais em Lote
          </button>
        </div>

        {/* Info adicional */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium mb-2">Próximos Passos:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>- Verifique se as descrições estão completas</li>
            <li>- Configure variações de tamanho/cor se necessário</li>
            <li>- Revise os preços e estoque</li>
            <li>- Os produtos já estão visíveis na sua loja</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
