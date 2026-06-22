'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  let role = 'student';

  try {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      return { error: authError.message };
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      return { error: 'Authentication failed.' };
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userData.user.id)
      .single();
    
    role = profileData?.role ?? 'student';
  } catch (err: any) {
    console.error('[LoginAction] Auth error:', err);
    return { error: 'Unable to connect to authentication service. Try again.' };
  }

  revalidatePath('/student');
  revalidatePath('/mentor');
  revalidatePath('/admin');
  redirect(`/${role}`);
}

export async function register(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const fullName = formData.get('fullName') as string;
  const college = formData.get('college') as string;
  const department = formData.get('department') as string;
  const graduationYear = formData.get('graduationYear') as string;
  // SECURITY: Role is ALWAYS 'student' for new registrations.
  // Any role value passed from the client is intentionally ignored.
  const role = 'student' as const;

  // Validation
  if (!email || !password || !fullName) {
    return { error: 'Name, email, and password are required.' };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        // SECURITY: role is intentionally NOT stored in user_metadata.
        // Role is the sole authority of the profiles table in the database.
        full_name: fullName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Registration failed. Please try again.' };
  }

  // Update profile with additional fields.
  // SECURITY: role is hardcoded to 'student' — never from client input.
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      college: college || null,
      department: department || null,
      graduation_year: graduationYear ? parseInt(graduationYear) : null,
      role: 'student',
    })
    .eq('id', data.user.id);

  if (profileError) {
    console.error('Profile update error:', profileError);
  }

  revalidatePath('/student');
  revalidatePath('/mentor');
  revalidatePath('/admin');
  redirect('/student');
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/student');
  revalidatePath('/mentor');
  revalidatePath('/admin');
  redirect('/login');
}

// -------------------------------------------------------
// ADMIN ROLE PROTECTION UTILITIES
// -------------------------------------------------------

/**
 * Checks whether a given userId belongs to a profile with role === 'admin'.
 * Always returns false on error — never throws.
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    if (!userId) return false;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) return false;
    return data.role === 'admin';
  } catch {
    return false;
  }
}

/**
 * Guard function — throws if the caller is NOT an admin.
 * Call this at the top of any admin-only server action before executing privileged logic.
 *
 * Usage:
 *   await requireAdmin(userId);
 *   // ... privileged code continues here
 */
export async function requireAdmin(userId: string): Promise<void> {
  const adminVerified = await isAdmin(userId);
  if (!adminVerified) {
    throw new Error('Unauthorized: Admin access required');
  }
}

// -------------------------------------------------------
// ADMIN: Mentor Invite Generation
// -------------------------------------------------------

import { randomUUID } from 'crypto';

/**
 * Creates a secure mentor invite token.
 * - Caller must be an authenticated admin
 * - Generates a cryptographically secure token via crypto.randomUUID()
 * - Inserts into mentor_invites with 7-day expiry
 * - Returns the invite link path
 */
export async function createMentorInviteAction() {
  try {
    const { getSessionUser } = await import('@/lib/supabase/server');
    const { user, error: authErr } = await getSessionUser();
    if (authErr || !user) {
      return { success: false, error: 'Not authenticated' };
    }

    const adminCheck = await isAdmin(user.id);
    if (!adminCheck) {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    const supabase = await createClient();
    const token = randomUUID();

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { data, error: insertErr } = await supabase
      .from('mentor_invites')
      .insert({
        token,
        role: 'mentor',
        used: false,
        expires_at: expiresAt.toISOString(),
        created_by: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[createMentorInviteAction] Insert error:', insertErr);
      return { success: false, error: insertErr.message };
    }

    return {
      success: true,
      inviteLink: `/accept-invite?token=${token}`,
      token,
      data,
    };
  } catch (err: any) {
    console.error('[createMentorInviteAction] Error:', err);
    return { success: false, error: err.message || 'Unknown error' };
  }
}
