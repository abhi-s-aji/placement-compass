'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Progress } from '@/lib/types';
import Link from 'next/link';

interface StudentSummary {
  profile: Profile;
  progress: Progress | null;
}

export default function StudentsDirectoryClient() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');

  const supabase = createClient();

  async function loadStudents() {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setLoading(false);
        return;
      }

      const [
        { data: profilesData, error: profilesError },
        { data: progressData, error: progressError },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student').order('full_name', { ascending: true }),
        supabase.from('progress').select('*'),
      ]);

      if (profilesError) throw profilesError;
      if (progressError) throw progressError;

      const summaries = (profilesData || []).map((p) => {
        const prog = (progressData || []).find((s) => s.user_id === p.id) || null;
        return {
          profile: p as Profile,
          progress: prog as Progress | null,
        };
      });

      setStudents(summaries);
    } catch (err) {
      console.error('Error loading students directory:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  // Filter logic
  const filteredStudents = students.filter(({ profile: p, progress: pr }) => {
    const fullName = (p.full_name || '').toLowerCase();
    const email = p.email.toLowerCase();
    const dept = (p.department || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower) || dept.includes(searchLower);
    const matchesDept = deptFilter === 'all' || p.department === deptFilter;

    let matchesScore = true;
    const score = pr?.overall_score ?? 0;
    if (scoreFilter === 'high') matchesScore = score >= 80;
    else if (scoreFilter === 'medium') matchesScore = score >= 50 && score < 80;
    else if (scoreFilter === 'low') matchesScore = score < 50;

    return matchesSearch && matchesDept && matchesScore;
  });

  // Extract unique departments for filter dropdown
  const departments = Array.from(
    new Set(students.map(({ profile }) => profile.department).filter(Boolean))
  ) as string[];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentees Directory</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Search and Filters */}
        <div className="card mb-6 flex gap-4 items-center flex-wrap">
          {/* Search bar */}
          <div className="form-group" style={{ flex: 2, minWidth: 240 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <select
              className="input"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Score Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 150 }}>
            <select
              className="input"
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Scores</option>
              <option value="high">Placement Ready (80+)</option>
              <option value="medium">Good Progress (50-79)</option>
              <option value="low">Needs Work (&lt;50)</option>
            </select>
          </div>
        </div>

        {/* Directory List */}
        {filteredStudents.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No students found</div>
            <div className="empty-state-description">Try adjusting your search query or filters.</div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>STUDENT</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>DEPARTMENT</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>GRAD YEAR</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>READINESS</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(({ profile: s, progress: pr }) => {
                  const score = pr?.overall_score ?? 0;
                  const scoreColor =
                    score >= 80
                      ? 'var(--color-success)'
                      : score >= 60
                      ? 'var(--color-info)'
                      : score >= 40
                      ? 'var(--color-warning)'
                      : 'var(--color-error)';

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)', transition: 'background-color var(--transition-fast)' }} className="table-row-hover">
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.full_name || 'N/A'}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>{s.department || 'N/A'}</td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>{s.graduation_year || 'N/A'}</td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <span style={{ fontWeight: 700, color: scoreColor }}>
                          {score}%
                        </span>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div className="flex gap-2">
                          <Link href={`/mentor/students/${s.id}`} className="btn btn-secondary btn-sm">
                            View Profile
                          </Link>
                          <Link href={`/mentor/tasks?studentId=${s.id}`} className="btn btn-ghost btn-sm">
                            Assign Task
                          </Link>
                          <Link href={`/mentor/feedback?studentId=${s.id}`} className="btn btn-ghost btn-sm">
                            Send Feedback
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
