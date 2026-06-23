export const dynamic = 'force-dynamic';

import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Profile, Progress } from '@/lib/types';
import { formatDate } from '@/lib/score';
import Unauthorized from '@/components/Unauthorized';

export const metadata = { title: 'Admin Overview - Placement Compass' };

export default async function AdminOverview() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') {
    return <Unauthorized />;
  }

  const supabase = await createClient();

  // Fetch stats from all profiles, progress, mentor requests, and mock interviews
  const [
    { data: profiles },
    { data: progressList },
    { data: pendingRequests },
    { data: interviewSessions },
  ] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('progress').select('*'),
    supabase.from('mentor_requests').select('id').eq('status', 'pending'),
    supabase.from('mock_interview_sessions').select('id'),
  ]);

  const allProfiles = (profiles || []) as Profile[];
  const allProgress = (progressList || []) as Progress[];

  // Compute stats
  const totalUsers = allProfiles.length;
  const studentsCount = allProfiles.filter(p => p.role === 'student').length;
  const mentorsCount = allProfiles.filter(p => p.role === 'mentor').length;
  const adminsCount = allProfiles.filter(p => p.role === 'admin').length;

  const averageScore = allProgress.length > 0
    ? Math.round(allProgress.reduce((sum, p) => sum + p.overall_score, 0) / allProgress.length)
    : 0;

  const readyCount = allProgress.filter(p => p.overall_score >= 80).length;
  const goodCount = allProgress.filter(p => p.overall_score >= 60 && p.overall_score < 80).length;
  const progressCount = allProgress.filter(p => p.overall_score >= 40 && p.overall_score < 60).length;
  const needsWorkCount = allProgress.filter(p => p.overall_score < 40).length;

  const pendingRequestsCount = pendingRequests?.length || 0;
  const interviewSessionsCount = interviewSessions?.length || 0;
  const assignedStudentsCount = allProfiles.filter(p => p.role === 'student' && p.mentor_id).length;

  const recentUsers = allProfiles.slice(0, 5);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Admin Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="btn btn-primary btn-sm">Manage Users</Link>
          <Link href="/admin/analytics" className="btn btn-secondary btn-sm">Full Analytics</Link>
        </div>
      </div>

      <div className="page-body">
        {/* Core Stats */}
        <div className="grid-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="stat-card">
            <span className="stat-label">Total Registered Users</span>
            <span className="stat-value">{totalUsers}</span>
            <span className="stat-change">Active on platform</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Students</span>
            <span className="stat-value">{studentsCount}</span>
            <span className="stat-change">Mentees enrolled</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Total Mentors</span>
            <span className="stat-value">{mentorsCount}</span>
            <span className="stat-change">Faculty & Industry mentors</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Platform Average Score</span>
            <span className="stat-value" style={{ color: averageScore >= 70 ? 'var(--color-success)' : averageScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {averageScore}%
            </span>
            <span className="stat-change">Average readiness score</span>
          </div>
        </div>

        {/* Additional Collaboration Stats */}
        <div className="grid-4 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="stat-card">
            <span className="stat-label">Pending Mentor Requests</span>
            <span className="stat-value" style={{ color: pendingRequestsCount > 0 ? 'var(--color-warning)' : 'inherit' }}>
              {pendingRequestsCount}
            </span>
            <span className="stat-change">Awaiting admin review</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Assigned Mentees</span>
            <span className="stat-value">{assignedStudentsCount}</span>
            <span className="stat-change">Students mapped to mentors</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Mock Interview Rounds</span>
            <span className="stat-value">{interviewSessionsCount}</span>
            <span className="stat-change">Completed by students</span>
          </div>
          
          <div className="stat-card flex flex-col justify-center" style={{ minHeight: '100px', padding: 'var(--space-3) var(--space-4)' }}>
            <span className="stat-label mb-2">Quick Navigation</span>
            <div className="flex gap-2">
              <Link href="/admin/mentor-requests" className="btn btn-secondary btn-xs" style={{ fontSize: '10px', textDecoration: 'none' }}>
                Requests &rarr;
              </Link>
              <Link href="/admin/students" className="btn btn-secondary btn-xs" style={{ fontSize: '10px', textDecoration: 'none' }}>
                Students &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Cohort Readiness Distribution (CSS-only graph/chart) */}
          <div className="card">
            <h3 className="card-title mb-4">Cohort Readiness Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {/* Ready */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-success">Placement Ready (80+)</span>
                  <span className="text-muted">{readyCount} students ({studentsCount > 0 ? Math.round((readyCount / studentsCount) * 100) : 0}%)</span>
                </div>
                <div className="progress-bar-track" style={{ height: 10 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${studentsCount > 0 ? (readyCount / studentsCount) * 100 : 0}%`,
                      backgroundColor: 'var(--color-success)',
                    }}
                  />
                </div>
              </div>

              {/* Good Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-info">Good Progress (60-79)</span>
                  <span className="text-muted">{goodCount} students ({studentsCount > 0 ? Math.round((goodCount / studentsCount) * 100) : 0}%)</span>
                </div>
                <div className="progress-bar-track" style={{ height: 10 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${studentsCount > 0 ? (goodCount / studentsCount) * 100 : 0}%`,
                      backgroundColor: 'var(--color-info)',
                    }}
                  />
                </div>
              </div>

              {/* In Progress */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-warning">In Progress (40-59)</span>
                  <span className="text-muted">{progressCount} students ({studentsCount > 0 ? Math.round((progressCount / studentsCount) * 100) : 0}%)</span>
                </div>
                <div className="progress-bar-track" style={{ height: 10 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${studentsCount > 0 ? (progressCount / studentsCount) * 100 : 0}%`,
                      backgroundColor: 'var(--color-warning)',
                    }}
                  />
                </div>
              </div>

              {/* Needs Work */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-error">Needs Work (&lt;40)</span>
                  <span className="text-muted">{needsWorkCount} students ({studentsCount > 0 ? Math.round((needsWorkCount / studentsCount) * 100) : 0}%)</span>
                </div>
                <div className="progress-bar-track" style={{ height: 10 }}>
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${studentsCount > 0 ? (needsWorkCount / studentsCount) * 100 : 0}%`,
                      backgroundColor: 'var(--color-error)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="card">
            <h3 className="card-title mb-4">Recent Registrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recentUsers.map((u) => {
                const initials = (u.full_name || u.email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between"
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="sidebar-user-avatar" style={{ width: 28, height: 28, fontSize: '10px' }}>
                        {initials}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-primary">{u.full_name || 'N/A'}</div>
                        <div className="text-xs text-muted" style={{ fontSize: '10px' }}>{u.email}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="badge badge-muted" style={{ textTransform: 'capitalize', fontSize: '10px' }}>
                        {u.role}
                      </span>
                      <div className="text-xs text-muted" style={{ fontSize: '9px', marginTop: 2 }}>{formatDate(u.created_at)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
