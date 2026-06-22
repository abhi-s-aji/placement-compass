import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ScoreRing from '@/components/ScoreRing';
import ProgressBar from '@/components/ProgressBar';
import { CATEGORY_LABELS, CATEGORY_WEIGHTS, getReadinessStatus, formatDate, getDaysUntil, getPriorityClass } from '@/lib/score';
import { Progress, Task, Feedback, AIReport } from '@/lib/types';

export const metadata = { title: 'Dashboard - Placement Compass' };

export default async function StudentDashboard() {
  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');


  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.role !== 'student') redirect('/login');

  const [
    { data: progress },
    { data: tasks },
    { data: feedback },
    { data: aiReports },
  ] = await Promise.all([
    supabase.from('progress').select('*').eq('user_id', user.id).single(),
    supabase.from('tasks').select('*, mentor:mentor_id(full_name)').eq('student_id', user.id).eq('status', 'pending').order('deadline', { ascending: true }).limit(5),
    supabase.from('feedback').select('*, mentor:mentor_id(full_name)').eq('student_id', user.id).order('created_at', { ascending: false }).limit(3),
    supabase.from('ai_reports').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
  ]);

  const scores = progress as Progress | null;
  const overallScore = scores?.overall_score ?? 0;
  const { label: statusLabel, className: statusClass } = getReadinessStatus(overallScore);

  const categories = Object.keys(CATEGORY_WEIGHTS).map(cat => ({
    key: cat,
    label: CATEGORY_LABELS[cat],
    score: (scores as Record<string, number> | null)?.[`${cat}_score`] ?? 0,
    weight: CATEGORY_WEIGHTS[cat],
  }));

  const latestReport = aiReports?.[0] as AIReport | null;
  const profileComplete = !!(profile.full_name && profile.college && profile.department && profile.github_username);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Dashboard</h1>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/student/ai-analysis" className="btn btn-primary btn-sm">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M10 3L4 10l6 7 6-7-6-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Analyze My Readiness
          </Link>
        </div>
      </div>

      <div className="page-body">
        {!profileComplete && (
          <div className="alert alert-warning mb-6">
            <svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            <span>Your profile is incomplete. <Link href="/student/profile" className="link">Complete your profile</Link> to get accurate readiness scores.</span>
          </div>
        )}

        {/* Score Overview */}
        <div className="card card-lg mb-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex items-center gap-8">
              <ScoreRing score={overallScore} size={140} />
              <div>
                <div className="text-xl font-bold text-primary mb-1">Placement Readiness Score</div>
                <div className={`text-lg font-semibold ${statusClass} mb-2`}>{statusLabel}</div>
                <div className="text-sm text-muted" style={{ maxWidth: 320 }}>
                  {overallScore < 40
                    ? 'Focus on completing your profile, building projects, and practicing coding.'
                    : overallScore < 70
                    ? 'Good progress! Focus on your weakest areas to improve your score.'
                    : 'You are well on your way to being placement ready. Keep it up!'}
                </div>
                <div className="flex gap-3 mt-4">
                  <Link href="/student/progress" className="btn btn-secondary btn-sm">View checklist</Link>
                  <Link href="/student/ai-analysis" className="btn btn-ghost btn-sm">Readiness insights</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Scores Grid */}
        <div className="mb-6">
          <h2 className="text-md font-semibold text-secondary mb-3">Category Breakdown</h2>
          <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
            {categories.map(cat => {
              const pct = cat.score;
              let scoreColor = '#ef4444';
              if (pct >= 70) scoreColor = '#22c55e';
              else if (pct >= 40) scoreColor = '#f59e0b';

              return (
                <Link key={cat.key} href="/student/progress" style={{ textDecoration: 'none' }}>
                  <div className="category-card">
                    <div className="category-card-header">
                      <span className="category-card-name">{cat.label}</span>
                      <span className="text-xs text-muted">{cat.weight}%</span>
                    </div>
                    <div className="category-card-score" style={{ color: scoreColor }}>{pct}</div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: scoreColor,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
          {/* Pending Tasks */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Assigned Tasks</div>
                <div className="card-subtitle">Tasks from your mentor</div>
              </div>
              <Link href="/student/tasks" className="btn btn-ghost btn-sm">View all</Link>
            </div>

            {!tasks || tasks.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="empty-state-title">No pending tasks</div>
                <div className="empty-state-description">Your mentor hasn&apos;t assigned any tasks yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {(tasks as Task[]).map(task => {
                  const daysLeft = getDaysUntil(task.deadline);
                  const isOverdue = daysLeft !== null && daysLeft < 0;

                  return (
                    <div
                      key={task.id}
                      className="flex items-start gap-3"
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="text-sm font-medium text-primary truncate">{task.title}</div>
                        <div className="flex gap-2 items-center mt-1">
                          <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                          {task.deadline && (
                            <span className={`text-xs ${isOverdue ? 'text-error' : 'text-muted'}`}>
                              {isOverdue ? `${Math.abs(daysLeft!)}d overdue` : `${daysLeft}d left`}
                            </span>
                          )}
                        </div>
                      </div>
                      <Link href="/student/tasks" className="btn btn-ghost btn-sm" style={{ flexShrink: 0 }}>View</Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Feedback */}
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Mentor Feedback</div>
                <div className="card-subtitle">Latest guidance from your mentor</div>
              </div>
            </div>

            {!feedback || feedback.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="empty-state-title">No feedback yet</div>
                <div className="empty-state-description">Your mentor hasn&apos;t added any feedback yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {feedback.map((fb: Feedback & { mentor?: { full_name: string } }) => (
                  <div
                    key={fb.id}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '3px solid var(--color-brand)',
                      backgroundColor: 'var(--color-brand-subtle)',
                    }}
                  >
                    <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>{fb.message}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted">{fb.mentor?.full_name ?? 'Mentor'}</span>
                      <span className="text-xs text-muted">{formatDate(fb.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Latest Readiness Report Summary */}
        {latestReport && (
          <div className="card mt-5">
            <div className="card-header">
              <div>
                <div className="card-title">Latest Placement Readiness Analytics</div>
                <div className="card-subtitle">Generated on {formatDate(latestReport.created_at)}</div>
              </div>
              <Link href="/student/ai-analysis" className="btn btn-ghost btn-sm">View full report</Link>
            </div>
            <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <div className="text-sm font-semibold text-success mb-2">Strengths</div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {latestReport.strengths.slice(0, 3).map((s, i) => (
                    <li key={i} className="text-sm text-secondary flex gap-2 items-start">
                      <span style={{ color: 'var(--color-success)', marginTop: 2, flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-sm font-semibold text-error mb-2">Areas to Improve</div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {latestReport.weaknesses.slice(0, 3).map((w, i) => (
                    <li key={i} className="text-sm text-secondary flex gap-2 items-start">
                      <span style={{ color: 'var(--color-warning)', marginTop: 2, flexShrink: 0 }}>
                        <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                      </span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
