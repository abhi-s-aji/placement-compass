import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env: Record<string, string> = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function diagnose() {
  console.log('--- STARTING RLS DIAGNOSTIC ---');
  
  const adminClient = createClient(supabaseUrl, serviceKey);
  const userClient = createClient(supabaseUrl, anonKey);

  // 1. Fetch mentor profile
  console.log('1. Fetching mentor profile...');
  const { data: mentors, error: mentorFindError } = await adminClient
    .from('profiles')
    .select('id, email, role')
    .eq('role', 'mentor')
    .limit(1);

  if (mentorFindError || !mentors || mentors.length === 0) {
    console.error('Error finding mentor:', mentorFindError);
    return;
  }

  const mentor = mentors[0];
  console.log('Found mentor:', mentor);

  // 2. Set mentor password to a temporary diagnostic password
  console.log('2. Resetting mentor password for diagnostic login...');
  const { error: resetError } = await adminClient.auth.admin.updateUserById(
    mentor.id,
    { password: 'DiagnosticMentorPassword123!', email_confirm: true }
  );

  if (resetError) {
    console.error('Failed to reset mentor password:', resetError);
    return;
  }

  // 3. Sign in as mentor using anon client
  console.log('3. Signing in as mentor via client-facing auth...');
  const { data: authData, error: authError } = await userClient.auth.signInWithPassword({
    email: mentor.email,
    password: 'DiagnosticMentorPassword123!'
  });

  if (authError || !authData.session) {
    console.error('Failed to authenticate as mentor:', authError);
    return;
  }

  console.log('Logged in successfully. Access token length:', authData.session.access_token.length);

  // 4. Try querying profiles as logged-in mentor
  console.log('4. Fetching profiles as logged-in mentor...');
  const { data: profiles, error: profilesError } = await userClient
    .from('profiles')
    .select('*')
    .eq('role', 'student');

  if (profilesError) {
    console.error('Profiles query failed:', profilesError);
  } else {
    console.log(`Profiles query succeeded. Returned ${profiles?.length || 0} students.`);
    console.log('First student profile snippet:', profiles?.[0] ? { id: profiles[0].id, email: profiles[0].email } : null);
  }

  // 5. Try querying progress as logged-in mentor
  console.log('5. Fetching progress as logged-in mentor...');
  const { data: progress, error: progressError } = await userClient
    .from('progress')
    .select('*');

  if (progressError) {
    console.error('Progress query failed:', progressError);
  } else {
    console.log(`Progress query succeeded. Returned ${progress?.length || 0} rows.`);
  }

  console.log('--- RLS DIAGNOSTIC COMPLETED ---');
}

diagnose();
