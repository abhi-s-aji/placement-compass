import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const dynamic = 'force-dynamic';

export default async function MentorStudentRedirectPage({ params }: PageProps) {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'mentor' && auth.role !== 'admin') {
    redirect('/student');
  }

  const resolvedParams = await params;
  redirect(`/mentor/students/${resolvedParams.id}`);
}
