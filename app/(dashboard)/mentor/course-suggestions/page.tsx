import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Unauthorized from '@/components/Unauthorized';
import CourseSuggestionsClient from '@/components/CourseSuggestionsClient';
import { Profile } from '@/lib/types';

export const metadata = { title: 'Course Suggestions - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function CourseSuggestionsPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'mentor' && auth.role !== 'admin') {
    return <Unauthorized />;
  }

  const supabase = await createClient();
  const user = auth.user;

  // Mentors only see their assigned students, admins can see all students
  let query = supabase.from('profiles').select('*').eq('role', 'student');
  if (auth.role === 'mentor') {
    query = query.eq('mentor_id', user.id);
  }

  const { data: assignedStudents } = await query.order('full_name', { ascending: true });

  return (
    <CourseSuggestionsClient 
      assignedStudents={(assignedStudents || []) as Profile[]} 
    />
  );
}
