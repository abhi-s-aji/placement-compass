'use server';

import { createClient, getSessionUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Save or update a mock interview session
 */
export async function saveMockInterviewSessionAction(payload: {
  company: string;
  category: string;
  completedQuestions: number;
  totalQuestions: number;
  score: number;
  completed: boolean;
  question_text?: string;
  answer_text?: string;
  evaluation_score?: number;
  evaluation_level?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvement_tips?: string[];
  interviewer_feedback?: string;
}) {
  const { user, error } = await getSessionUser();
  if (error || !user) throw new Error('Unauthorized');

  const supabase = await createClient();

  // Check if session already exists for this company + category + question_text
  const query = supabase
    .from('mock_interview_sessions')
    .select('id')
    .eq('user_id', user.id)
    .eq('company', payload.company)
    .eq('category', payload.category);

  if (payload.question_text) {
    query.eq('question_text', payload.question_text);
  } else {
    query.is('question_text', null);
  }

  const { data: existing } = await query.maybeSingle();

  const dbPayload: any = {
    completed_questions: payload.completedQuestions,
    total_questions: payload.totalQuestions,
    score: payload.score,
    completed: payload.completed,
    question_text: payload.question_text || null,
    answer_text: payload.answer_text || null,
    evaluation_score: payload.evaluation_score !== undefined ? payload.evaluation_score : null,
    evaluation_level: payload.evaluation_level || null,
    strengths: payload.strengths || [],
    weaknesses: payload.weaknesses || [],
    improvement_tips: payload.improvement_tips || [],
    interviewer_feedback: payload.interviewer_feedback || null,
  };

  if (existing) {
    // Update existing session
    const { data, error: updateError } = await supabase
      .from('mock_interview_sessions')
      .update(dbPayload)
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) throw new Error(updateError.message);
    revalidatePath('/student/mock-interview');
    return { success: true, data };
  }

  // Insert new session
  const { data, error: insertError } = await supabase
    .from('mock_interview_sessions')
    .insert({
      user_id: user.id,
      company: payload.company,
      category: payload.category,
      ...dbPayload,
    })
    .select()
    .single();

  if (insertError) throw new Error(insertError.message);
  revalidatePath('/student/mock-interview');
  return { success: true, data };
}

/**
 * Get all mock interview sessions for current user
 */
export async function getMockInterviewHistoryAction() {
  const { user, error } = await getSessionUser();
  if (error || !user) return { success: false, data: [] };

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from('mock_interview_sessions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (fetchError) return { success: false, data: [] };
  return { success: true, data: data || [] };
}
