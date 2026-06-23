'use server';

import { createClient, getAuthorizedUser, getSessionUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Student submits a mentor request
 */
export async function submitMentorRequestAction(requestedMentorId: string, message: string) {
  const { user, error } = await getSessionUser();
  if (error || !user) throw new Error('Unauthorized');

  const supabase = await createClient();

  // Check if student already has a pending request
  const { data: existing } = await supabase
    .from('mentor_requests')
    .select('id, status')
    .eq('student_id', user.id)
    .eq('status', 'pending')
    .maybeSingle();

  if (existing) {
    throw new Error('You already have a pending mentor request. Please wait for it to be reviewed.');
  }

  // Check if student already has an assigned mentor
  const { data: profile } = await supabase
    .from('profiles')
    .select('mentor_id')
    .eq('id', user.id)
    .single();

  if ((profile as any)?.mentor_id) {
    throw new Error('You already have an assigned mentor.');
  }

  const { data, error: insertError } = await supabase
    .from('mentor_requests')
    .insert({
      student_id: user.id,
      requested_mentor_id: requestedMentorId,
      message: message.trim() || null,
      status: 'pending',
    })
    .select()
    .single();

  if (insertError) {
    console.error('[submitMentorRequestAction] Error:', insertError);
    throw new Error(insertError.message || 'Failed to submit request');
  }

  revalidatePath('/student/mentor-request');
  return { success: true, data };
}

/**
 * Get current student's mentor requests
 */
export async function getStudentMentorRequestsAction() {
  const { user, error } = await getSessionUser();
  if (error || !user) return { success: false, error: 'Unauthorized', data: [] };

  const supabase = await createClient();
  const { data, error: fetchError } = await supabase
    .from('mentor_requests')
    .select('*, mentor:requested_mentor_id(id, full_name, email, skills, department)')
    .eq('student_id', user.id)
    .order('created_at', { ascending: false });

  if (fetchError) return { success: false, error: fetchError.message, data: [] };
  return { success: true, data: data || [] };
}

/**
 * Admin: Get all pending mentor requests
 */
export async function getAllMentorRequestsAction() {
  const auth = await getAuthorizedUser();
  if (!auth || auth.role !== 'admin') throw new Error('Forbidden');

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mentor_requests')
    .select(`
      *,
      student:student_id(id, full_name, email, department, graduation_year, skills),
      mentor:requested_mentor_id(id, full_name, email, skills, department)
    `)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

/**
 * Admin: Approve a mentor request — sets profiles.mentor_id and updates request status
 */
export async function approveMentorRequestAction(requestId: string) {
  const auth = await getAuthorizedUser();
  if (!auth || auth.role !== 'admin') throw new Error('Forbidden');

  const supabase = await createClient();

  // Fetch the request details
  const { data: request, error: fetchError } = await supabase
    .from('mentor_requests')
    .select('student_id, requested_mentor_id')
    .eq('id', requestId)
    .single();

  if (fetchError || !request) throw new Error('Request not found');

  // Update mentor_id on student profile using existing column (migration 008)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ mentor_id: request.requested_mentor_id })
    .eq('id', request.student_id);

  if (profileError) {
    console.error('[approveMentorRequestAction] Profile update error:', profileError);
    throw new Error(profileError.message);
  }

  // Mark this request as approved and set mentor_id
  const { error: updateError } = await supabase
    .from('mentor_requests')
    .update({ 
      status: 'approved',
      mentor_id: request.requested_mentor_id
    })
    .eq('id', requestId);

  if (updateError) throw new Error(updateError.message);

  // Reject any other pending requests from the same student
  await supabase
    .from('mentor_requests')
    .update({ status: 'rejected' })
    .eq('student_id', request.student_id)
    .eq('status', 'pending')
    .neq('id', requestId);

  revalidatePath('/admin/mentor-requests');
  revalidatePath('/admin');
  revalidatePath('/student/mentor-request');
  return { success: true };
}

/**
 * Admin: Reject a mentor request
 */
export async function rejectMentorRequestAction(requestId: string) {
  const auth = await getAuthorizedUser();
  if (!auth || auth.role !== 'admin') throw new Error('Forbidden');

  const supabase = await createClient();
  const { error } = await supabase
    .from('mentor_requests')
    .update({ status: 'rejected' })
    .eq('id', requestId);

  if (error) throw new Error(error.message);

  revalidatePath('/admin/mentor-requests');
  revalidatePath('/admin');
  return { success: true };
}
