// POST /api/bulk-import/[id]/apply-defaults - Aplica configurações padrão ao lote
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: importId } = await params;
    const body = await request.json();
    const { default_price, default_stock, default_category_id, default_tags } = body;

    // Aplicar aos rascunhos
    const updates: any = {};
    if (default_price !== undefined) updates.price = default_price;
    if (default_stock !== undefined) updates.stock_quantity = default_stock;
    if (default_category_id) updates.category_id = default_category_id;
    if (default_tags) updates.tags = default_tags;

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from('draft_products')
        .update(updates)
        .eq('import_id', importId);

      if (error) throw error;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Configurações aplicadas ao lote'
    });

  } catch (error: any) {
    console.error('Erro ao aplicar configurações:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
