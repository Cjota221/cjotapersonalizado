// POST /api/bulk-import/upload - Upload de imagens ou ZIP
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const importId = formData.get('import_id') as string;
    const files = formData.getAll('files') as File[];

    if (!importId) {
      return NextResponse.json({ error: 'import_id é obrigatório' }, { status: 400 });
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const uploadedImages = [];
    const groups: Record<string, any[]> = {};

    // Upload de cada arquivo
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `temp-imports/${importId}/${fileName}`;

      // Upload para Supabase Storage
      const fileBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      const imageData = {
        filename: file.name,
        temp_url: publicUrl,
        file_size: file.size,
        mime_type: file.type
      };

      uploadedImages.push(imageData);

      // Agrupar por prefixo
      const groupKey = extractGroupKey(file.name);
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(imageData);
    }

    // Criar rascunhos para cada grupo
    const drafts = [];
    let sortOrder = 0;

    for (const [groupKey, images] of Object.entries(groups)) {
      // Criar rascunho
      const { data: draft, error: draftError } = await supabase
        .from('draft_products')
        .insert({
          import_id: importId,
          group_key: groupKey,
          name: generateProductName(groupKey),
          original_filenames: images.map((img: any) => img.filename),
          status: 'draft',
          sort_order: sortOrder++
        })
        .select()
        .single();

      if (draftError) {
        console.error('Erro ao criar rascunho:', draftError);
        continue;
      }

      // Criar imagens
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await supabase.from('draft_images').insert({
          draft_product_id: draft.id,
          temp_url: img.temp_url,
          filename: img.filename,
          file_size: img.file_size,
          mime_type: img.mime_type,
          is_primary: i === 0,
          sort_order: i
        });
      }

      drafts.push(draft);
    }

    // Atualizar importação
    await supabase
      .from('bulk_imports')
      .update({ 
        total_files: uploadedImages.length,
        total_groups: drafts.length,
        status: 'grouping'
      })
      .eq('id', importId);

    return NextResponse.json({
      success: true,
      total_files: uploadedImages.length,
      total_groups: drafts.length,
      drafts
    });

  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// Funções auxiliares
function extractGroupKey(filename: string): string {
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  const cleaned = nameWithoutExt
    .replace(/-\d+$/, '')
    .replace(/_\d+$/, '')
    .replace(/\d+$/, '')
    .replace(/[-_](frente|costas|lateral|detalhe)$/i, '')
    .trim();
  return cleaned || nameWithoutExt;
}

function generateProductName(groupKey: string): string {
  return groupKey
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
}
