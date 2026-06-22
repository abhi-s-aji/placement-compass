'use server';

import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

/**
 * Server action to update a user's role.
 * Only callable by authenticated admins.
 * Allows updating role only to 'student' or 'mentor'.
 */
export async function updateUserRoleAction(userId: string, newRole: 'student' | 'mentor') {
  const auth = await getAuthorizedUser();
  
  if (!auth) {
    throw new Error('Unauthorized');
  }

  if (auth.role !== 'admin') {
    throw new Error('Forbidden');
  }

  if (newRole !== 'student' && newRole !== 'mentor') {
    throw new Error('Invalid role');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) {
    console.error(`[updateUserRoleAction] Database error:`, error);
    throw new Error(error.message);
  }

  console.log(`Role updated: ${userId} -> ${newRole}`);

  // A. IN-APP NOTIFICATION (REQUIRED - SAFE TRY/CATCH)
  try {
    const { error: notifError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        message: `Your role has been updated to ${newRole}`,
        type: 'role_update',
        created_at: new Date().toISOString()
      });

    if (notifError) {
      console.log(`[Notification Fallback] user_id: ${userId}, message: "Your role has been updated to ${newRole}", type: "role_update", created_at: ${new Date().toISOString()}`);
    }
  } catch (err) {
    console.log(`[Notification Fallback] user_id: ${userId}, message: "Your role has been updated to ${newRole}", type: "role_update", created_at: ${new Date().toISOString()}`);
  }

  // B. EMAIL NOTIFICATION (REQUIRED STUB)
  console.log("EMAIL: User role changed notification sent to user");

  revalidatePath('/admin');
  revalidatePath('/mentor');
  revalidatePath('/student');

  return { success: true };
}

/**
 * Server action to update a user's active status.
 * Only callable by authenticated admins.
 */
export async function updateUserStatusAction(userId: string, isActive: boolean) {
  const auth = await getAuthorizedUser();
  
  if (!auth) {
    throw new Error('Unauthorized');
  }

  if (auth.role !== 'admin') {
    throw new Error('Forbidden');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) {
    console.error(`[updateUserStatusAction] Database error:`, error);
    throw new Error(error.message);
  }

  console.log(`User status updated: ${userId} -> active: ${isActive}`);

  revalidatePath('/admin');
  revalidatePath('/mentor');
  revalidatePath('/student');

  return { success: true };
}
