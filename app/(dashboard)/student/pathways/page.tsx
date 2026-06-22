import { getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import PathwaysClient from '@/components/PathwaysClient';

export const metadata = { title: 'Learning Pathways - Placement Compass' };

export default async function PathwaysPage() {
  const { user } = await getSessionUser();
  if (!user) redirect('/login');

  return (
    <PathwaysClient userId={user.id} />
  );
}
