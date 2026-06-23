import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Unauthorized from '@/components/Unauthorized';
import MentorAssignmentClient from '@/components/MentorAssignmentClient';
import { Profile } from '@/lib/types';

export const metadata = { title: 'Mentor Assignment - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function MentorAssignmentPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') {
    return <Unauthorized />;
  }

  const supabase = await createClient();

  // Fetch all students and all mentors
  const [
    { data: students },
    { data: mentors }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student').order('full_name', { ascending: true }),
    supabase.from('profiles').select('*').eq('role', 'mentor').order('full_name', { ascending: true }),
  ]);

  return (
    <MentorAssignmentClient 
      students={(students || []) as Profile[]} 
      mentors={(mentors || []) as Profile[]} 
    />
  );
}
