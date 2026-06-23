import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import MockInterviewClient from '@/components/MockInterviewClient';

interface PageProps {
  params: Promise<{ company: string }> | { company: string };
}

export const metadata = { title: 'Mock Interview Prep - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function CompanyMockInterviewPage({ params }: PageProps) {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'student') {
    redirect(`/${auth.role}`);
  }

  const resolvedParams = await params;
  const companyName = decodeURIComponent(resolvedParams.company);

  return <MockInterviewClient companyName={companyName} />;
}
