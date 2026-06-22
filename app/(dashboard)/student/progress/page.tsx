import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ChecklistPageClient from '@/components/ChecklistPageClient';

export const metadata = { title: 'Progress - Placement Compass' };
export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');


  const [{ data: checklist }, { data: progress }] = await Promise.all([
    supabase.from('checklist_items').select('*').eq('user_id', user.id),
    supabase.from('progress').select('*').eq('user_id', user.id).single(),
  ]);

  const progressScores: Record<string, number> = {
    resume: progress?.resume_score ?? 0,
    github: progress?.github_score ?? 0,
    linkedin: progress?.linkedin_score ?? 0,
    projects: progress?.project_score ?? 0,
    coding: progress?.coding_score ?? 0,
    aptitude: progress?.aptitude_score ?? 0,
    interview: progress?.interview_score ?? 0,
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Progress Tracker</h1>
        </div>
      </div>
      <div className="page-body">
        <div className="mb-6">
          <div className="page-section-title">Placement Checklist</div>
          <p className="page-section-subtitle">Check off items as you complete them. Your readiness score updates automatically.</p>
        </div>
        <ChecklistPageClient
          userId={user.id}
          initialChecklist={checklist ?? []}
          initialProgress={progressScores}
          initialOverallScore={progress?.overall_score ?? 0}
        />
      </div>
    </div>
  );
}
