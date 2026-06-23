import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MentorPanelClient from '@/components/MentorPanelClient';
import Unauthorized from '@/components/Unauthorized';

export const metadata = { title: 'Mentor Panel - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function MentorPanelPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'mentor' && auth.role !== 'admin') {
    return <Unauthorized />;
  }

  return <MentorPanelClient />;
}
