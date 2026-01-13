// POST /api/bulk-import/[id]/create-products - Cria produtos a partir dos rascunhos
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: importId } = context.params;

    // Buscar rascunhos prontos
    const { data: drafts, error: draftsError } = await supabase
      .from('draft_products')
      .select('*, draft_images(*)')
      .eq('import_id', importId)
      .in('status', ['draft', 'ready']);

    if (draftsError) throw draftsError;

    const results = {
      created: [],
      failed: []
    };

    // Buscar store_id da importação
    const { data: importData } = await supabase
      .from('bulk_imports')
      .select('store_id')
      .eq('id', importId)
      .single();

    if (!importData) {
      throw new Error('Importação não encontrada');
    }

    // Criar cada produto
    for (const draft of drafts) {
      try {
        // Validação básica
        if (!draft.name || draft.name.trim().length === 0) {
          throw new Error('Nome do produto é obrigatório');
        }

        if (!draft.draft_images || draft.draft_images.length === 0) {
          throw new Error('Produto precisa ter pelo menos uma imagem');
        }

        // Criar produto
        const { data: product, error: productError } = await supabase
          .from('products')
          .insert({
            store_id: importData.store_id,
            name: draft.name,
            description: draft.description || '',
            sku: draft.sku,
            price: draft.price,
            compare_at_price: draft.compare_at_price,
            cost: draft.cost,
            stock_quantity: draft.stock_quantity || 0,
            track_inventory: draft.track_inventory !== false,
            category_id: draft.category_id,
            tags: draft.tags,
            is_active: draft.is_active !== false
          })
          .select()
          .single();

        if (productError) throw productError;

        // Copiar imagens para storage permanente e criar registros
        for (const img of draft.draft_images) {
          // Extrair path do temp storage
          const tempPath = img.temp_url.split('/products/')[1];
          const permanentPath = tempPath.replace(`temp-imports/${importId}/`, 'products/');

          // Copiar arquivo
          const { error: copyError } = await supabase.storage
            .from('products')
            .copy(tempPath, permanentPath);

          if (copyError) {
            console.error('Erro ao copiar imagem:', copyError);
            // Usar URL temporária se falhar
            await supabase.from('product_images').insert({
              product_id: product.id,
              url: img.temp_url,
              is_primary: img.is_primary,
              sort_order: img.sort_order
            });
            continue;
          }

          const { data: { publicUrl } } = supabase.storage
            .from('products')
            .getPublicUrl(permanentPath);

          // Criar registro de imagem
          await supabase.from('product_images').insert({
            product_id: product.id,
            url: publicUrl,
            is_primary: img.is_primary,
            sort_order: img.sort_order
          });
        }

        // Marcar rascunho como criado
        await supabase
          .from('draft_products')
          .update({ status: 'created' })
          .eq('id', draft.id);

        // Registrar no log
        await supabase.from('bulk_import_products').insert({
          import_id: importId,
          draft_product_id: draft.id,
          product_id: product.id,
          created_successfully: true
        });

        results.created.push({
          draft_id: draft.id,
          product_id: product.id,
          name: product.name
        });

      } catch (error: any) {
        console.error(`Erro ao criar produto do rascunho ${draft.id}:`, error);
        
        // Registrar falha
        await supabase.from('bulk_import_products').insert({
          import_id: importId,
          draft_product_id: draft.id,
          created_successfully: false,
          error_message: error.message
        });

        results.failed.push({
          draft_id: draft.id,
          name: draft.name,
          error: error.message
        });
      }
    }

    // Atualizar importação como concluída
    await supabase
      .from('bulk_imports')
      .update({ 
        status: 'completed',
        total_products_created: results.created.length,
        completed_at: new Date().toISOString()
      })
      .eq('id', importId);

    return NextResponse.json({
      success: true,
      created_count: results.created.length,
      failed_count: results.failed.length,
      created: results.created,
      failed: results.failed
    });

  } catch (error: any) {
    console.error('Erro ao criar produtos:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
