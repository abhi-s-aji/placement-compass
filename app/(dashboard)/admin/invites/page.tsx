import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Unauthorized from '@/components/Unauthorized';
import InvitesClient from '@/components/InvitesClient';

export const metadata = { title: 'Mentor Invites - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function MentorInvitesPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') {
    return <Unauthorized />;
  }

  const supabase = await createClient();
  const { data: invites } = await supabase
    .from('mentor_invites')
    .select('*')
    .order('created_at', { ascending: false });

  return <InvitesClient initialInvites={invites || []} />;
}
