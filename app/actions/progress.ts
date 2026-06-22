'use server';

import { getSessionUser } from '@/lib/supabase/server';
import { getProgress, saveProgress } from '@/lib/supabase/hybrid-db';

const CATEGORY_WEIGHTS: Record<string, number> = {
  resume: 15,
  github: 15,
  linkedin: 10,
  project: 20, // DB column: project_score
  coding: 15,
  aptitude: 15,
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

