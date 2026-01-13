// GET /api/bulk-import/[id]/drafts - Lista rascunhos de uma importação
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: importId } = params;

    // Buscar rascunhos com imagens
    const { data: drafts, error } = await supabase
      .from('draft_products')
      .select(`
        *,
        draft_images(*)
      `)
      .eq('import_id', importId)
      .order('sort_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      drafts 
    });

  } catch (error: any) {
    console.error('Erro ao buscar rascunhos:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
