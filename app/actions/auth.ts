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

  revalidatePath('/', 'layout');
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
  let role = (formData.get('role') as string) || 'student';
  if (role !== 'student' && role !== 'mentor') {
    role = 'student';
  }

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
        full_name: fullName,
        role,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: 'Registration failed. Please try again.' };
  }

  // Update profile with additional fields
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      college: college || null,
      department: department || null,
      graduation_year: graduationYear ? parseInt(graduationYear) : null,
      role,
    })
    .eq('id', data.user.id);

  if (profileError) {
    console.error('Profile update error:', profileError);
  }

  revalidatePath('/', 'layout');
  redirect(`/${role}`);
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
