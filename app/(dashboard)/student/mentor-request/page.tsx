import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MentorRequestClient from '@/components/MentorRequestClient';

export const metadata = { title: 'Mentor Panel - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function StudentMentorRequestPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'student') {
    redirect(`/${auth.role}`);
  }

  return <MentorRequestClient />;
}
