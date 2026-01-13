// POST /api/bulk-import/create - Cria nova sessão de importação
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    // Buscar loja do usuário
    const { data: store } = await supabase
      .from('stores')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (!store) {
      return NextResponse.json({ error: 'Loja não encontrada' }, { status: 404 });
    }

    // Criar importação
    const { data: importData, error } = await supabase
      .from('bulk_imports')
      .insert({
        store_id: store.id,
        admin_user_id: user.id,
        status: 'uploading'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      import_id: importData.id 
    });

  } catch (error: any) {
    console.error('Erro ao criar importação:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}
