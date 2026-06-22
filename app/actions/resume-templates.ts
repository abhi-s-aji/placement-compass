'use server';

import { createClient, getSessionUser } from '@/lib/supabase/server';

async function getRequiredUser() {
  const { user, error } = await getSessionUser();
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// ============================================================
// TEMPLATE ACTIONS
// ============================================================

export async function saveCustomTemplateAction(
  id: string | undefined,
  name: string,
  layoutConfig: any,
  cssConfig: any = {}
) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const payload: any = {
      user_id: user.id,
      name,
      layout_config: layoutConfig,
      css_config: cssConfig,
    };

    if (id) {
      const { data, error } = await supabase
        .from('user_templates')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('user_templates')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }
  } catch (err: any) {
    console.error('Error saving custom template:', err);
    return { success: false, error: err.message || 'Failed to save template' };
  }
}

export async function getCustomTemplatesAction() {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Error fetching custom templates:', err);
    return { success: false, error: err.message || 'Failed to fetch templates' };
  }
}

export async function shareTemplateAction(templateId: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    // Check if it already has a share code
    const { data: existing } = await supabase
      .from('user_templates')
      .select('share_code')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (existing?.share_code) {
      return { success: true, shareCode: existing.share_code };
    }

    const shareCode = 'T-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const { error } = await supabase
      .from('user_templates')
      .update({ share_code: shareCode, is_public: true })
      .eq('id', templateId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true, shareCode };
  } catch (err: any) {
    console.error('Error sharing template:', err);
    return { success: false, error: err.message || 'Failed to share template' };
  }
}

export async function getSharedTemplateAction(shareCode: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_templates')
      .select('*')
      .eq('share_code', shareCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { success: false, error: 'Shared template not found' };

    return { success: true, data };
  } catch (err: any) {
    console.error('Error getting shared template:', err);
    return { success: false, error: err.message || 'Failed to retrieve shared template' };
  }
}

export async function importSharedTemplateAction(shareCode: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    // Fetch the shared template details first
    const { data: template, error: fetchErr } = await supabase
      .from('user_templates')
      .select('*')
      .eq('share_code', shareCode)
      .maybeSingle();

    if (fetchErr || !template) {
      return { success: false, error: 'Template details could not be found' };
    }

    // Insert as a new template for the current user
    const { data: imported, error: insertErr } = await supabase
      .from('user_templates')
      .insert({
        user_id: user.id,
        name: `${template.name} (Imported)`,
        layout_config: template.layout_config,
        css_config: template.css_config || {},
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    return { success: true, data: imported };
  } catch (err: any) {
    console.error('Error importing template:', err);
    return { success: false, error: err.message || 'Failed to import template' };
  }
}

// ============================================================
// PATHWAY ACTIONS
// ============================================================

export async function saveCustomPathwayAction(
  id: string | undefined,
  title: string,
  description: string,
  steps: any[],
  progress: number = 0
) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const payload: any = {
      user_id: user.id,
      title,
      description,
      steps,
      progress,
      is_custom: true,
    };

    if (id) {
      const { data, error } = await supabase
        .from('user_pathways')
        .update(payload)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } else {
      const { data, error } = await supabase
        .from('user_pathways')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    }
  } catch (err: any) {
    console.error('Error saving pathway:', err);
    return { success: false, error: err.message || 'Failed to save pathway' };
  }
}

export async function getUserPathwaysAction() {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_pathways')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error('Error fetching pathways:', err);
    return { success: false, error: err.message || 'Failed to fetch pathways' };
  }
}

export async function deletePathwayAction(id: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from('user_pathways')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Error deleting pathway:', err);
    return { success: false, error: err.message || 'Failed to delete pathway' };
  }
}

export async function sharePathwayAction(pathwayId: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    // Check if it already has a share code
    const { data: existing } = await supabase
      .from('user_pathways')
      .select('share_code')
      .eq('id', pathwayId)
      .eq('user_id', user.id)
      .single();

    if (existing?.share_code) {
      return { success: true, shareCode: existing.share_code };
    }

    const shareCode = 'P-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    const { error } = await supabase
      .from('user_pathways')
      .update({ share_code: shareCode, is_public: true })
      .eq('id', pathwayId)
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true, shareCode };
  } catch (err: any) {
    console.error('Error sharing pathway:', err);
    return { success: false, error: err.message || 'Failed to share pathway' };
  }
}

export async function getSharedPathwayAction(shareCode: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('user_pathways')
      .select('*')
      .eq('share_code', shareCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { success: false, error: 'Shared pathway not found' };

    return { success: true, data };
  } catch (err: any) {
    console.error('Error getting shared pathway:', err);
    return { success: false, error: err.message || 'Failed to retrieve shared pathway' };
  }
}

export async function importSharedPathwayAction(shareCode: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    // Fetch the shared pathway first
    const { data: pathway, error: fetchErr } = await supabase
      .from('user_pathways')
      .select('*')
      .eq('share_code', shareCode)
      .maybeSingle();

    if (fetchErr || !pathway) {
      return { success: false, error: 'Shared pathway details could not be found' };
    }

    // Reset steps completion status when importing/cloning to user's account
    const cleanSteps = (pathway.steps || []).map((step: any) => ({
      ...step,
      completed: false,
    }));

    const { data: imported, error: insertErr } = await supabase
      .from('user_pathways')
      .insert({
        user_id: user.id,
        title: `${pathway.title} (Imported)`,
        description: pathway.description,
        steps: cleanSteps,
        progress: 0,
        is_custom: true,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;
    return { success: true, data: imported };
  } catch (err: any) {
    console.error('Error importing pathway:', err);
    return { success: false, error: err.message || 'Failed to import pathway' };
  }
}
