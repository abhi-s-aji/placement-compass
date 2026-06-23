export const dynamic = 'force-dynamic';

import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Profile, Progress } from '@/lib/types';

export const metadata = { title: 'Mentor Overview - Placement Compass' };

export default async function MentorOverview() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'mentor' && auth.role !== 'admin') {
    redirect('/student');
  }

  const supabase = await createClient();
  const user = auth.user;


  // Fetch all students and their scores
  const [
    { data: students },
    { data: progressList },
    { data: tasks },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('role', 'student').order('full_name', { ascending: true }),
    supabase.from('progress').select('*'),
    supabase.from('tasks').select('*').eq('mentor_id', user.id),
  ]);

  const studentsCount = students?.length ?? 0;
  const scores = (progressList || []) as Progress[];
  const averageScore = scores.length > 0 
    ? Math.round(scores.reduce((sum, s) => sum + s.overall_score, 0) / scores.length)
    : 0;

  const belowTargetCount = scores.filter(s => s.overall_score < 60).length;
  const pendingTasksCount = (tasks || []).filter(t => t.status === 'pending').length;

  // Combine student details with score
  const studentSummaries = (students || []).map(student => {
    const studentProgress = scores.find(s => s.user_id === student.id);
    return {
      profile: student as Profile,
      overallScore: studentProgress?.overall_score ?? 0,
    };
  }).sort((a, b) => b.overallScore - a.overallScore); // Sort by highest score first

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Overview</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/mentor/tasks" className="btn btn-secondary btn-sm">Assign Task</Link>
          <Link href="/mentor/feedback" className="btn btn-primary btn-sm">Add Feedback</Link>
        </div>
      </div>

      <div className="page-body">
        {/* Stats Grid */}
        <div className="grid-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="stat-card">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{studentsCount}</span>
            <span className="stat-change">Active mentees registered</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Average Readiness Score</span>
            <span className="stat-value" style={{ color: averageScore >= 70 ? 'var(--color-success)' : averageScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {averageScore}/100
            </span>
            <span className="stat-change">Cohort readiness average</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Students Below Target</span>
            <span className="stat-value" style={{ color: belowTargetCount > 0 ? 'var(--color-error)' : 'var(--color-text-primary)' }}>
              {belowTargetCount}
            </span>
            <span className="stat-change">Overall score under 60%</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Pending Mentor Tasks</span>
            <span className="stat-value">{pendingTasksCount}</span>
            <span className="stat-change">Assigned tasks awaiting completion</span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid-2" style={{ gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Top Students */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Top Students by Readiness</h3>
                <p className="card-subtitle">Cohort ordered by overall readiness score</p>
              </div>
              <Link href="/mentor/students" className="btn btn-ghost btn-sm">View Directory</Link>
            </div>

            {studentSummaries.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <div className="empty-state-title">No students registered yet</div>
                <div className="empty-state-description">Students will appear here once they sign up and log in.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {studentSummaries.slice(0, 5).map(({ profile: s, overallScore }) => {
                  const initials = (s.full_name || s.email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                  return (
                    <div
                      key={s.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 'var(--font-size-xs)' }}>
                          {initials}
                        </div>
                        <div>
                          <Link href={`/mentor/students/${s.id}`} className="text-sm font-semibold text-primary hover:underline">
                            {s.full_name || s.email}
                          </Link>
                          <div className="text-xs text-muted">
                            {s.department || 'N/A'} &bull; Class of {s.graduation_year || 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="text-sm font-bold" style={{ color: overallScore >= 80 ? 'var(--color-success)' : overallScore >= 60 ? 'var(--color-info)' : overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>
                          {overallScore}%
                        </span>
                        <div className="text-xs text-muted">Readiness</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Action Center / Quick Assist */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <h3 className="card-title">Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <h4 className="text-xs font-semibold text-secondary mb-1">Struggling Students</h4>
                <p className="text-xs text-muted mb-2">Identify students needing immediate resume or coding guidance.</p>
                <Link href="/mentor/students" className="btn btn-secondary btn-sm btn-full" style={{ justifyContent: 'center' }}>
                  Open Mentees Directory
                </Link>
              </div>

              <div
                style={{
                  padding: 'var(--space-3)',
                  backgroundColor: 'var(--color-bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border-subtle)',
                }}
              >
                <h4 className="text-xs font-semibold text-secondary mb-1">Cohort Performance</h4>
                <p className="text-xs text-muted mb-2">View analytics on what categories students are falling behind in.</p>
                <Link href="/mentor" className="btn btn-ghost btn-sm btn-full" style={{ justifyContent: 'center', pointerEvents: 'none', opacity: 0.5 }}>
                  Detailed Analytics (Admin Only)
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
