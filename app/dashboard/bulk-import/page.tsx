'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';

export default function BulkImportUploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Criar sessão de importação
  const createImportSession = async () => {
    console.log('🆕 Chamando /api/bulk-import/create...');
    const res = await fetch('/api/bulk-import/create', { method: 'POST' });
    const data = await res.json();
    console.log('📋 Resposta da criação:', data);
    if (!data.success) throw new Error(data.error);
    return data.import_id;
  };

  // Upload de arquivos
  const uploadFiles = async (files: File[]) => {
    try {
      console.log('📤 Iniciando uploadFiles com', files.length, 'arquivos');
      setUploading(true);
      setProgress(10);

      // Criar sessão
      console.log('🔄 Criando sessão de importação...');
      const importId = await createImportSession();
      console.log('✅ Sessão criada:', importId);
      setProgress(20);

      // Preparar FormData
      console.log('📦 Preparando FormData...');
      const formData = new FormData();
      formData.append('import_id', importId);
      files.forEach(file => formData.append('files', file));

      setProgress(40);

      // Upload
      console.log('⬆️ Enviando para /api/bulk-import/upload...');
      const res = await fetch('/api/bulk-import/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      console.log('📥 Resposta:', data);
      setProgress(100);

      if (!data.success) throw new Error(data.error);

      // Redirecionar para revisão
      setTimeout(() => {
        router.push(`/dashboard/bulk-import/${importId}/review`);
      }, 500);

    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload: ' + error.message);
      setUploading(false);
      setProgress(0);
    }
  };

  // Handlers de drag and drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  // Processar arquivos selecionados
  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(f => 
      f.type.startsWith('image/') || f.name.endsWith('.zip')
    );

    if (imageFiles.length === 0) {
      alert('Nenhuma imagem ou arquivo ZIP válido foi selecionado.');
      return;
    }

    setSelectedFiles(imageFiles);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleStartUpload = () => {
    console.log('🚀 handleStartUpload chamado');
    console.log('📁 Arquivos selecionados:', selectedFiles.length);
    
    if (selectedFiles.length > 0) {
      console.log('✅ Iniciando upload...');
      uploadFiles(selectedFiles);
    } else {
      console.error('❌ Nenhum arquivo selecionado');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Cadastro em Massa de Produtos</h1>
          <p className="text-gray-600 mt-1">
            Envie múltiplas imagens ou um arquivo ZIP para criar vários produtos de uma vez
          </p>
        </div>

        {/* Card de Upload */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <div
            className={`
              border-2 border-dashed rounded-lg p-12 text-center transition-colors
              ${isDragging ? 'border-black bg-gray-50' : 'border-gray-300'}
              ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,.zip"
              onChange={handleFileInputChange}
              className="hidden"
            />

            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {uploading ? (
              <>
                <p className="text-lg font-medium mb-2">Enviando arquivos...</p>
                <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2 mt-4">
                  <div
                    className="bg-black h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">{progress}%</p>
              </>
            ) : selectedFiles.length > 0 ? (
              <>
                <p className="text-lg font-medium mb-2">
                  {selectedFiles.length} arquivo(s) selecionado(s)
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Clique em "Processar" para continuar
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleStartUpload();
                  }}
                  className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Processar Imagens
                </button>
              </>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  Arraste uma pasta ZIP ou selecione múltiplas imagens
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Aceita: .jpg, .png, .webp, .zip
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                >
                  Selecionar Arquivos
                </button>
              </>
            )}
          </div>

          {/* Lista de arquivos selecionados */}
          {selectedFiles.length > 0 && !uploading && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">Arquivos Selecionados:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-black rounded-full" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dicas */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium mb-2">Dicas para melhor agrupamento:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>Use nomes de arquivo com padrão: produto-azul-1.jpg, produto-azul-2.jpg</li>
            <li>Arquivos com mesmo prefixo serão agrupados automaticamente</li>
            <li>Você poderá revisar e ajustar os agrupamentos na próxima tela</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
