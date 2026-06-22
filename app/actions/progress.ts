'use server';

import { getSessionUser } from '@/lib/supabase/server';
import { getProgress, saveProgress } from '@/lib/supabase/hybrid-db';

const CATEGORY_WEIGHTS: Record<string, number> = {
  resume: 15,
  github: 15,
  linkedin: 10,
  project: 20, // DB column: project_score
  coding: 20,
  aptitude: 10,
  interview: 10,
};

function calculateOverallScore(scores: Record<string, number>): number {
  let total = 0;
  let weightSum = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const dbKey = category === 'project' ? 'project_score' : `${category}_score`;
    const score = scores[dbKey] ?? 0;
    total += (score / 100) * weight;
    weightSum += weight;
  }

  return Math.round((total / weightSum) * 100);
}

export async function updateReadinessScoreAction(
  module: 'resume' | 'github' | 'linkedin' | 'projects' | 'coding' | 'aptitude' | 'interview',
  value: number
) {
  try {
    const { user, error } = await getSessionUser();
    if (error || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const userId = user.id;

    // Convert projects/project naming difference
    const moduleKey = module === 'projects' ? 'project' : module;
    const dbColumn = moduleKey === 'project' ? 'project_score' : `${moduleKey}_score`;

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 1. Get current progress explicitly
    let { data: currentProgress, error: fetchErr } = await supabase
      .from('progress')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!currentProgress) {
      // If NOT exists: CREATE row with default structure
      currentProgress = {
        user_id: userId,
        resume_score: 0,
        github_score: 0,
        linkedin_score: 0,
        project_score: 0,
        coding_score: 0,
        aptitude_score: 0,
        interview_score: 0,
        overall_score: 0,
      };
    }

    // 2. Prepare updates
    const updatedScores = {
      ...currentProgress,
      [dbColumn]: Math.min(100, Math.max(0, value)),
    };

    // 3. Recalculate overall score
    const newOverallScore = calculateOverallScore(updatedScores);
    updatedScores.overall_score = newOverallScore;

    // 4. Save using UPSERT logic
    const { data: saved, error: upsertErr } = await supabase
      .from('progress')
      .upsert({
        ...updatedScores,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (upsertErr) {
      throw new Error(upsertErr.message);
    }

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/student');
    revalidatePath('/mentor');
    revalidatePath('/admin');

    return {
      success: true,
      data: saved || updatedScores,
    };
  } catch (err: any) {
    console.error('[updateReadinessScoreAction] Error:', err);
    return {
      success: false,
      error: err.message || 'Failed to update readiness score',
    };
  }
}

export async function toggleChecklistItemAction(
  category: 'resume' | 'github' | 'linkedin' | 'projects' | 'coding' | 'aptitude' | 'interview',
  itemKey: string,
  isCompleted: boolean
) {
  try {
    const { user, error } = await getSessionUser();
    if (error || !user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { createClient } = await import('@/lib/supabase/server');
    const supabase = await createClient();

    // 1. Update checklist items table
    const { error: upsertErr } = await supabase
      .from('checklist_items')
      .upsert({
        user_id: user.id,
        category,
        item_key: itemKey,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }, { onConflict: 'user_id,category,item_key' });

    if (upsertErr) {
      throw new Error(upsertErr.message);
    }

    // 2. Fetch completed checklist items in this category
    const { data: completedItems, error: fetchErr } = await supabase
      .from('checklist_items')
      .select('item_key')
      .eq('user_id', user.id)
      .eq('category', category)
      .eq('is_completed', true);

    if (fetchErr) {
      throw new Error(fetchErr.message);
    }

    const completedKeys = (completedItems || []).map(item => item.item_key);

    // 3. Count completions and calculate score based on definitions
    const { CHECKLIST_DEFINITIONS } = await import('@/lib/score');
    const items = CHECKLIST_DEFINITIONS[category] || [];
    const totalCount = items.length;

    let newCategoryScore = 0;
    if (totalCount > 0) {
      const validCompletedCount = items.filter(item => completedKeys.includes(item.key)).length;
      newCategoryScore = Math.round((validCompletedCount / totalCount) * 100);
    }

    // 4. Update the readiness score (which also saves and revalidates)
    const updateRes = await updateReadinessScoreAction(category, newCategoryScore);
    if (!updateRes.success) {
      throw new Error(updateRes.error);
    }

    return {
      success: true,
      newCategoryScore,
      newOverallScore: updateRes.data?.overall_score ?? 0,
    };
  } catch (err: any) {
    console.error('[toggleChecklistItemAction] Error:', err);
    return {
      success: false,
      error: err.message || 'Failed to toggle checklist item',
    };
  }
}

