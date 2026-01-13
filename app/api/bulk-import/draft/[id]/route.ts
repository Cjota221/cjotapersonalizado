// PUT /api/bulk-import/draft/[id] - Atualiza um rascunho
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: draftId } = await params;
    const updates = await request.json();

    const { data: draft, error } = await supabase
      .from('draft_products')
      .update(updates)
      .eq('id', draftId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      draft
    });

  } catch (error: any) {
    console.error('Erro ao atualizar rascunho:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// DELETE - Deleta um rascunho
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { id: draftId } = await params;

    const { error } = await supabase
      .from('draft_products')
      .delete()
      .eq('id', draftId);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      message: 'Rascunho deletado'
    });

  } catch (error: any) {
    console.error('Erro ao deletar rascunho:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
