import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MentorRequestsAdminClient from '@/components/MentorRequestsAdminClient';

export const metadata = { title: 'Admin Mentor Requests - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function AdminMentorRequestsPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') {
    redirect(`/${auth.role}`);
  }

  return <MentorRequestsAdminClient />;
}
