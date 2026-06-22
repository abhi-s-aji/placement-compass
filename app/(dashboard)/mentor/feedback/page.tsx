import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import FeedbackClient from '@/components/FeedbackClient';

export const metadata = { title: 'Mentor Feedback - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function FeedbackPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'mentor' && auth.role !== 'admin') {
    redirect('/student');
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Feedback Console</h1>
        </div>
      </div>
      <div className="page-body">
        <Suspense fallback={<div className="spinner" />}>
          <FeedbackClient />
        </Suspense>
      </div>
    </div>
  );
}
