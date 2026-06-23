import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function MentorMessagesPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  
  // Redirect to new consolidated mentor panel communication tab
  if (auth.role === 'mentor' || auth.role === 'admin') {
    redirect('/mentor/panel?tab=messages');
  }

  redirect(`/${auth.role}`);
}
