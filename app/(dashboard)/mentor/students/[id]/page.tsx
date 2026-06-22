import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import ScoreRing from '@/components/ScoreRing';
import { CHECKLIST_DEFINITIONS, CATEGORY_LABELS, CATEGORY_WEIGHTS, getReadinessStatus, formatDate, getPriorityClass, getStatusClass } from '@/lib/score';
import { Profile, Progress, Project, Task, Feedback, ChecklistItem } from '@/lib/types';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export const metadata = { title: 'Mentee Details - Placement Compass' };

export default async function StudentDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  const studentId = resolvedParams.id;

  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');


  // Verify that the caller is indeed a mentor or admin
  const { data: mentorProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!mentorProfile || !['mentor', 'admin'].includes(mentorProfile.role)) {
    redirect('/login');
  }

  // Fetch all student information
  const [
    { data: student },
    { data: progress },
    { data: projects },
    { data: checklistItems },
    { data: tasks },
    { data: feedback },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', studentId).single(),
    supabase.from('progress').select('*').eq('user_id', studentId).single(),
    supabase.from('projects').select('*').eq('user_id', studentId),
    supabase.from('checklist_items').select('*').eq('user_id', studentId),
    supabase.from('tasks').select('*').eq('student_id', studentId).order('created_at', { ascending: false }),
    supabase.from('feedback').select('*, mentor:mentor_id(full_name)').eq('student_id', studentId).order('created_at', { ascending: false }),
  ]);

  if (!student) {
    notFound();
  }

  const sProfile = student as Profile;
  const sProgress = progress as Progress | null;
  const overallScore = sProgress?.overall_score ?? 0;
  const { label: statusLabel, className: statusClass } = getReadinessStatus(overallScore);

  // Group checklist items by category
  const completedKeysSet = new Set(
    (checklistItems || [])
      .filter((item) => item.is_completed)
      .map((item) => `${item.category}:${item.item_key}`)
  );

  const categories = Object.keys(CATEGORY_WEIGHTS).map((cat) => {
    const items = CHECKLIST_DEFINITIONS[cat as keyof typeof CHECKLIST_DEFINITIONS] || [];
    const completedCount = items.filter((item) => completedKeysSet.has(`${cat}:${item.key}`)).length;
    const catScore = (sProgress as Record<string, number> | null)?.[`${cat}_score`] ?? 0;

    return {
      key: cat,
      label: CATEGORY_LABELS[cat],
      score: catScore,
      completedCount,
      totalCount: items.length,
      weight: CATEGORY_WEIGHTS[cat],
      items: items.map(item => ({
        ...item,
        isCompleted: completedKeysSet.has(`${cat}:${item.key}`),
      })),
    };
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <Link href="/mentor/students" className="text-xs text-muted hover:underline flex items-center gap-1">
            &larr; Back to Directory
          </Link>
          <span className="text-xs text-muted">/</span>
          <h1 className="page-header-title">{sProfile.full_name || sProfile.email}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/mentor/tasks?studentId=${sProfile.id}`} className="btn btn-secondary btn-sm">
            Assign Task
          </Link>
          <Link href={`/mentor/feedback?studentId=${sProfile.id}`} className="btn btn-primary btn-sm">
            Add Feedback
          </Link>
        </div>
      </div>

      <div className="page-body">
        {/* Student General Profile Summary card */}
        <div className="card mb-6 grid-2" style={{ gridTemplateColumns: '150px 1fr', gap: 'var(--space-6)', alignItems: 'center' }}>
          <div className="flex items-center justify-center">
            <ScoreRing score={overallScore} size={110} />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-lg font-bold text-primary">{sProfile.full_name || 'N/A'}</h2>
              <span className={`badge ${overallScore >= 80 ? 'badge-success' : overallScore >= 50 ? 'badge-info' : 'badge-warning'}`}>
                {statusLabel}
              </span>
            </div>
            <p className="text-xs text-muted mt-1">{sProfile.email}</p>
            <div className="grid-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
              <div>
                <span className="text-xs text-muted block">College / Department</span>
                <span className="text-xs font-semibold text-secondary">{sProfile.college || 'N/A'} &bull; {sProfile.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-muted block">Graduation Year</span>
                <span className="text-xs font-semibold text-secondary">Class of {sProfile.graduation_year || 'N/A'}</span>
              </div>
              <div>
                <span className="text-xs text-muted block">GitHub Account</span>
                {sProfile.github_username ? (
                  <a href={`https://github.com/${sProfile.github_username}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand hover:underline">
                    @{sProfile.github_username}
                  </a>
                ) : (
                  <span className="text-xs text-muted font-semibold">Not Linked</span>
                )}
              </div>
            </div>
            {sProfile.skills && sProfile.skills.length > 0 && (
              <div className="mt-3">
                <span className="text-xs text-muted block mb-1">Key Skills</span>
                <div className="flex gap-1 flex-wrap">
                  {sProfile.skills.map((skill, index) => (
                    <span key={index} className="badge badge-muted">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Score & Checklists */}
        <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Categories Grid */}
          <div className="card">
            <h3 className="card-title mb-4">Readiness by Categories</h3>
            <div className="flex flex-col gap-4">
              {categories.map((cat) => (
                <div key={cat.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-secondary">{cat.label}</span>
                    <span className="text-muted">{cat.score}% ({cat.completedCount}/{cat.totalCount})</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 6 }}>
                    <div
                      className="progress-bar-fill brand"
                      style={{
                        width: `${cat.score}%`,
                        backgroundColor: cat.score >= 80 ? 'var(--color-success)' : cat.score >= 50 ? 'var(--color-info)' : 'var(--color-warning)',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Projects */}
          <div className="card">
            <h3 className="card-title mb-4">Student Projects</h3>
            {!projects || projects.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                <div className="empty-state-title">No projects added yet</div>
                <div className="empty-state-description">The student has not listed any projects.</div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {(projects as Project[]).map((proj) => (
                  <div
                    key={proj.id}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-primary">{proj.title}</span>
                      <div className="flex gap-2">
                        {proj.github_url && (
                          <a href={proj.github_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                            GitHub
                          </a>
                        )}
                        {proj.live_url && (
                          <a href={proj.live_url} target="_blank" rel="noopener noreferrer" className="text-xs text-brand hover:underline">
                            Demo
                          </a>
                        )}
                      </div>
                    </div>
                    {proj.description && <p className="text-xs text-secondary mt-1">{proj.description}</p>}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-2">
                        {proj.technologies.map((t, idx) => (
                          <span key={idx} className="badge badge-muted" style={{ fontSize: '10px' }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Checklist Items & Task/Feedback History */}
        <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Detailed checklists */}
          <div className="card">
            <h3 className="card-title mb-4">Detailed Checklist Status</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {categories.map((cat) => (
                <div
                  key={cat.key}
                  style={{
                    padding: 'var(--space-3)',
                    border: '1px solid var(--color-border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                  }}
                >
                  <h4 className="text-xs font-bold text-primary mb-2 uppercase tracking-wider">{cat.label} Checklist</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {cat.items.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center gap-2"
                        style={{ opacity: item.isCompleted ? 1 : 0.4 }}
                      >
                        <div
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid var(--color-border)',
                            backgroundColor: item.isCompleted ? 'var(--color-success)' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {item.isCompleted && (
                            <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="3">
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-secondary truncate">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Tasks and Feedback History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {/* Mentor Tasks */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Task History</h3>
                <Link href={`/mentor/tasks?studentId=${sProfile.id}`} className="btn btn-ghost btn-sm">Assign Task</Link>
              </div>

              {!tasks || tasks.length === 0 ? (
                <p className="text-xs text-muted">No tasks assigned yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {(tasks as Task[]).map((task) => (
                    <div
                      key={task.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                      }}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs font-semibold text-primary">{task.title}</span>
                        <span className={`badge ${getStatusClass(task.status)}`}>{task.status}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-xs text-muted">
                        <span>Category: {task.category}</span>
                        {task.deadline && <span>Due: {formatDate(task.deadline)}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentor Feedback */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Feedback Log</h3>
                <Link href={`/mentor/feedback?studentId=${sProfile.id}`} className="btn btn-ghost btn-sm">Add Feedback</Link>
              </div>

              {!feedback || feedback.length === 0 ? (
                <p className="text-xs text-muted">No feedback given yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {(feedback as unknown as (Feedback & { mentor?: { full_name: string } })[]).map((fb) => (
                    <div
                      key={fb.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        borderLeft: '3px solid var(--color-brand)',
                        backgroundColor: 'var(--color-brand-subtle)',
                      }}
                    >
                      <p className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>{fb.message}</p>
                      <div className="flex justify-between mt-2 text-xs text-muted">
                        <span>By {fb.mentor?.full_name || 'Mentor'}</span>
                        <span>{formatDate(fb.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
