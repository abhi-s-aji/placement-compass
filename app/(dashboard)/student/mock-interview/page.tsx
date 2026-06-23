import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MockInterviewsOverviewClient from '@/components/MockInterviewsOverviewClient';

export const metadata = { title: 'Mock Interview Hub - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function StudentMockInterviewsPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'student') {
    redirect(`/${auth.role}`);
  }

  return <MockInterviewsOverviewClient />;
}
