import { getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import TasksClient from '@/components/TasksClient';

export const metadata = { title: 'Mentor Tasks - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function TasksPage() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'mentor' && auth.role !== 'admin') {
    redirect('/student');
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Task Console</h1>
        </div>
      </div>
      <div className="page-body">
        <Suspense fallback={<div className="spinner" />}>
          <TasksClient />
        </Suspense>
      </div>
    </div>
  );
}
