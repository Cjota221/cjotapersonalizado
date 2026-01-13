// =====================================================
// API: CADASTRO EM MASSA DE PRODUTOS
// Endpoints para o fluxo completo de importação
// =====================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import BulkImportService from '@/src/services/BulkImportService';

const bulkService = new BulkImportService();

// ====================================
// POST /api/bulk-import/create
// Cria nova sessão de importação
// ====================================
export async function POST_create(request: Request) {
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
    const importId = await bulkService.createImport(store.id, user.id);

    return NextResponse.json({ 
      success: true,
      import_id: importId 
    });

  } catch (error: any) {
    console.error('Erro ao criar importação:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// POST /api/bulk-import/upload
// Upload de arquivos (imagens ou zip)
// ====================================
export async function POST_upload(request: Request) {
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

    // Upload dos arquivos
    const uploadedImages = await bulkService.uploadFiles(importId, files);

    // Agrupar imagens automaticamente
    const groups = bulkService.groupImagesByPattern(uploadedImages);

    // Criar rascunhos a partir dos grupos
    const drafts = await bulkService.createDraftsFromGroups(importId, groups);

    return NextResponse.json({
      success: true,
      total_files: uploadedImages.length,
      total_groups: Object.keys(groups).length,
      drafts: drafts.map(d => ({
        id: d.id,
        name: d.name,
        group_key: d.group_key,
        images_count: groups[d.group_key].length
      }))
    });

  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// GET /api/bulk-import/[id]
// Busca dados de uma importação
// ====================================
export async function GET_import(importId: string) {
  try {
    const summary = await bulkService.getImportSummary(importId);
    return NextResponse.json(summary);

  } catch (error: any) {
    console.error('Erro ao buscar importação:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// GET /api/bulk-import/[id]/drafts
// Lista rascunhos de uma importação
// ====================================
export async function GET_drafts(importId: string) {
  try {
    const drafts = await bulkService.getDraftsByImport(importId);
    return NextResponse.json({ drafts });

  } catch (error: any) {
    console.error('Erro ao buscar rascunhos:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// PUT /api/bulk-import/draft/[id]
// Atualiza um rascunho
// ====================================
export async function PUT_draft(draftId: string, request: Request) {
  try {
    const updates = await request.json();
    const updated = await bulkService.updateDraft(draftId, updates);

    return NextResponse.json({ 
      success: true,
      draft: updated
    });

  } catch (error: any) {
    console.error('Erro ao atualizar rascunho:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// POST /api/bulk-import/draft/split
// Divide um grupo em dois
// ====================================
export async function POST_split(request: Request) {
  try {
    const { draft_id, image_ids } = await request.json();

    if (!draft_id || !image_ids || image_ids.length === 0) {
      return NextResponse.json({ 
        error: 'draft_id e image_ids são obrigatórios' 
      }, { status: 400 });
    }

    const newDraft = await bulkService.splitGroup(draft_id, image_ids);

    return NextResponse.json({ 
      success: true,
      new_draft: newDraft
    });

  } catch (error: any) {
    console.error('Erro ao dividir grupo:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// POST /api/bulk-import/draft/merge
// Une dois grupos
// ====================================
export async function POST_merge(request: Request) {
  try {
    const { target_draft_id, source_draft_id } = await request.json();

    if (!target_draft_id || !source_draft_id) {
      return NextResponse.json({ 
        error: 'target_draft_id e source_draft_id são obrigatórios' 
      }, { status: 400 });
    }

    await bulkService.mergeGroups(target_draft_id, source_draft_id);

    return NextResponse.json({ 
      success: true,
      message: 'Grupos unidos com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao unir grupos:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// POST /api/bulk-import/draft/change-primary
// Troca imagem principal
// ====================================
export async function POST_changePrimary(request: Request) {
  try {
    const { draft_id, image_id } = await request.json();

    if (!draft_id || !image_id) {
      return NextResponse.json({ 
        error: 'draft_id e image_id são obrigatórios' 
      }, { status: 400 });
    }

    await bulkService.changePrimaryImage(draft_id, image_id);

    return NextResponse.json({ 
      success: true,
      message: 'Imagem principal alterada'
    });

  } catch (error: any) {
    console.error('Erro ao trocar imagem principal:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// POST /api/bulk-import/[id]/apply-defaults
// Aplica configurações padrão ao lote
// ====================================
export async function POST_applyDefaults(importId: string, request: Request) {
  try {
    const defaults = await request.json();

    await bulkService.applyBatchDefaults(importId, defaults);

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

// ====================================
// POST /api/bulk-import/[id]/validate
// Valida todos os rascunhos
// ====================================
export async function POST_validate(importId: string) {
  try {
    const validation = await bulkService.validateDrafts(importId);

    return NextResponse.json(validation);

  } catch (error: any) {
    console.error('Erro ao validar rascunhos:', error);
    return NextResponse.json({ 
      error: error.message 
    }, { status: 500 });
  }
}

// ====================================
// POST /api/bulk-import/[id]/create-products
// Cria produtos a partir dos rascunhos
// ====================================
export async function POST_createProducts(importId: string) {
  try {
    const results = await bulkService.createProductsFromDrafts(importId);

    // Limpar arquivos temporários em background
    bulkService.cleanupTempFiles(importId).catch(console.error);

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

// ====================================
// DELETE /api/bulk-import/draft/[id]
// Deleta um rascunho
// ====================================
export async function DELETE_draft(draftId: string) {
  try {
    await bulkService.deleteDraft(draftId);

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
