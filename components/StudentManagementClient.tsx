'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Progress, MockInterviewSession } from '@/lib/types';
import { assignStudentToMentorAction } from '@/app/actions/admin';
import Link from 'next/link';

interface StudentData {
  profile: Profile;
  progress: Progress | null;
  interviews: MockInterviewSession[];
}

export default function StudentManagementClient() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filters
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [scoreFilter, setScoreFilter] = useState('all');
  
  // Selected student for detail modal
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [assigningMentorId, setAssigningMentorId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  async function loadData() {
    try {
      const [
        { data: profilesData },
        { data: progressData },
        { data: interviewsData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('full_name', { ascending: true }),
        supabase.from('progress').select('*'),
        supabase.from('mock_interview_sessions').select('*').order('created_at', { ascending: false }),
      ]);

      const allProfiles = (profilesData || []) as Profile[];
      const studentsList = allProfiles.filter(p => p.role === 'student');
      const mentorsList = allProfiles.filter(p => p.role === 'mentor');
      
      const studentsMapped: StudentData[] = studentsList.map(s => {
        const prog = (progressData || []).find(p => p.user_id === s.id) || null;
        const studentInterviews = (interviewsData || []).filter(i => i.user_id === s.id) as unknown as MockInterviewSession[];
        return {
          profile: s,
          progress: prog as Progress | null,
          interviews: studentInterviews,
        };
      });

      setStudents(studentsMapped);
      setMentors(mentorsList);
    } catch (err) {
      console.error('Error loading admin students data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Update selectedStudent reference if student list changes
  useEffect(() => {
    if (selectedStudent) {
      const updated = students.find(s => s.profile.id === selectedStudent.profile.id);
      if (updated) {
        setSelectedStudent(updated);
      }
    }
  }, [students]);

  async function handleAssignMentor(studentId: string, mentorId: string | '') {
    const selectedMentorId = mentorId === '' ? null : mentorId;
    setUpdatingId(studentId);

    try {
      await assignStudentToMentorAction(studentId, selectedMentorId);
      
      // Update in state
      setStudents(prev =>
        prev.map(s => {
          if (s.profile.id === studentId) {
            return {
              ...s,
              profile: {
                ...s.profile,
                mentor_id: selectedMentorId as any
              }
            };
          }
          return s;
        })
      );
      
      const mentorObj = mentors.find(m => m.id === selectedMentorId);
      const mentorName = mentorObj ? (mentorObj.full_name || mentorObj.email) : 'None';
      window.alert(`Successfully assigned mentor to: ${mentorName}`);
    } catch (error: any) {
      console.error('Failed to assign mentor:', error);
      window.alert(error.message || 'Failed to assign mentor');
    } finally {
      setUpdatingId(null);
    }
  }

  // Filter students
  const filteredStudents = students.filter(({ profile: p, progress: pr }) => {
    const fullName = (p.full_name || '').toLowerCase();
    const email = p.email.toLowerCase();
    const dept = (p.department || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch =
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      dept.includes(searchLower) ||
      p.skills.some(s => s.toLowerCase().includes(searchLower));

    const matchesDept = deptFilter === 'all' || p.department === deptFilter;
    const matchesYear = yearFilter === 'all' || String(p.graduation_year) === yearFilter;

    let matchesScore = true;
    const score = pr?.overall_score ?? 0;
    if (scoreFilter === 'high') matchesScore = score >= 80;
    else if (scoreFilter === 'medium') matchesScore = score >= 50 && score < 80;
    else if (scoreFilter === 'low') matchesScore = score < 50;

    return matchesSearch && matchesDept && matchesYear && matchesScore;
  });

  const departments = Array.from(
    new Set(students.map(({ profile }) => profile.department).filter(Boolean))
  ) as string[];

  const graduationYears = Array.from(
    new Set(students.map(({ profile }) => profile.graduation_year).filter(Boolean))
  ).map(String) as string[];

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
          <h1 className="page-header-title">Student Directory</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Search & Filters */}
        <div className="card mb-6 flex gap-4 items-center flex-wrap">
          {/* Search bar */}
          <div className="form-group" style={{ flex: 2, minWidth: 240, margin: 0 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by name, skills, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Department Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 140, margin: 0 }}>
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

          {/* Year Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 120, margin: 0 }}>
            <select
              className="input"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Grad Years</option>
              {graduationYears.map((year) => (
                <option key={year} value={year}>
                  Class of {year}
                </option>
              ))}
            </select>
          </div>

          {/* Score Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 140, margin: 0 }}>
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

        {/* Students Table */}
        {filteredStudents.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No students found</div>
            <div className="empty-state-description">Try adjusting your filters or search query.</div>
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
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ASSIGNED MENTOR</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((sData) => {
                  const s = sData.profile;
                  const score = sData.progress?.overall_score ?? 0;
                  const scoreColor =
                    score >= 80
                      ? 'var(--color-success)'
                      : score >= 60
                      ? 'var(--color-info)'
                      : score >= 40
                      ? 'var(--color-warning)'
                      : 'var(--color-error)';
                  
                  const assignedMentor = mentors.find(m => m.id === s.mentor_id);
                  const isUpdating = updatingId === s.id;

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }} className="table-row-hover">
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            className="input"
                            value={s.mentor_id || ''}
                            disabled={isUpdating}
                            onChange={(e) => handleAssignMentor(s.id, e.target.value)}
                            style={{ cursor: 'pointer', padding: '4px var(--space-2)', fontSize: '11px', width: 'auto', minWidth: '150px' }}
                          >
                            <option value="">-- Unassigned --</option>
                            {mentors.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.full_name || m.email}
                              </option>
                            ))}
                          </select>
                          {isUpdating && <span className="spinner spinner-sm" />}
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <button
                          onClick={() => setSelectedStudent(sData)}
                          className="btn btn-secondary btn-sm"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Student Details Modal */}
      {selectedStudent && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-4)',
          }}
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '750px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--color-bg-secondary)',
              border: '1px solid var(--color-border)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedStudent(null)}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                fontSize: '24px',
                cursor: 'pointer',
              }}
            >
              &times;
            </button>

            <h2 className="card-title text-lg mb-2">Student Profile Overview</h2>
            <div className="flex gap-4 items-start mb-6 pb-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <div
                className="sidebar-user-avatar"
                style={{ width: 56, height: 56, fontSize: 'var(--font-size-lg)' }}
              >
                {(selectedStudent.profile.full_name || selectedStudent.profile.email)
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <h3 className="text-md font-bold text-primary">{selectedStudent.profile.full_name || 'N/A'}</h3>
                <p className="text-sm text-muted mb-1">{selectedStudent.profile.email}</p>
                <div className="text-xs text-secondary flex flex-wrap gap-x-4 gap-y-1">
                  <span>College: <strong>{selectedStudent.profile.college || 'N/A'}</strong></span>
                  <span>Dept: <strong>{selectedStudent.profile.department || 'N/A'}</strong></span>
                  <span>Grad Year: <strong>{selectedStudent.profile.graduation_year || 'N/A'}</strong></span>
                </div>
              </div>
            </div>

            <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-5)', alignItems: 'start' }}>
              {/* Left Column: Progress / Scores */}
              <div>
                <h4 className="text-xs font-semibold text-secondary uppercase mb-3">Readiness Scores</h4>
                {selectedStudent.progress ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold text-primary">Overall Score</span>
                        <strong className="text-primary">{selectedStudent.progress.overall_score}%</strong>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${selectedStudent.progress.overall_score}%`,
                            backgroundColor: 'var(--color-brand)',
                          }}
                        />
                      </div>
                    </div>
                    {/* Categories */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
                      {[
                        { label: 'Resume', val: selectedStudent.progress.resume_score },
                        { label: 'GitHub', val: selectedStudent.progress.github_score },
                        { label: 'LinkedIn', val: selectedStudent.progress.linkedin_score },
                        { label: 'Projects', val: selectedStudent.progress.project_score },
                        { label: 'Coding', val: selectedStudent.progress.coding_score },
                        { label: 'Aptitude', val: selectedStudent.progress.aptitude_score },
                        { label: 'Interview', val: selectedStudent.progress.interview_score },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted">{item.label}</span>
                            <span className="font-bold text-secondary">{item.val}%</span>
                          </div>
                          <div className="progress-bar-track" style={{ height: 6 }}>
                            <div
                              className="progress-bar-fill"
                              style={{
                                width: `${item.val}%`,
                                backgroundColor: item.val >= 70 ? 'var(--color-success)' : item.val >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted">No progress score calculated yet.</p>
                )}

                {/* Profile Links & Skills */}
                <h4 className="text-xs font-semibold text-secondary uppercase mt-6 mb-3">Portfolio Details</h4>
                <div className="flex flex-col gap-2 mb-4">
                  {selectedStudent.profile.resume_url && (
                    <a
                      href={selectedStudent.profile.resume_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs link"
                    >
                      📄 View Resume File
                    </a>
                  )}
                  {selectedStudent.profile.github_username && (
                    <a
                      href={`https://github.com/${selectedStudent.profile.github_username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs link"
                    >
                      🔗 GitHub Profile: @{selectedStudent.profile.github_username}
                    </a>
                  )}
                  {selectedStudent.profile.linkedin_url && (
                    <a
                      href={selectedStudent.profile.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs link"
                    >
                      🔗 LinkedIn Profile
                    </a>
                  )}
                </div>

                <div>
                  <div className="text-xs text-muted mb-2 font-semibold">Declared Skills:</div>
                  {selectedStudent.profile.skills && selectedStudent.profile.skills.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {selectedStudent.profile.skills.map((s) => (
                        <span key={s} className="badge badge-muted">
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted italic">No skills listed.</p>
                  )}
                </div>
              </div>

              {/* Right Column: Mock Interview History */}
              <div>
                <h4 className="text-xs font-semibold text-secondary uppercase mb-3">Mock Interview History</h4>
                {selectedStudent.interviews.length === 0 ? (
                  <p className="text-xs text-muted italic">No mock interview sessions started.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxHeight: '320px', overflowY: 'auto' }}>
                    {selectedStudent.interviews.map((session) => (
                      <div
                        key={session.id}
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--color-border-subtle)',
                          backgroundColor: 'var(--color-bg-tertiary)',
                          fontSize: '12px',
                        }}
                      >
                        <div className="flex justify-between font-semibold mb-1">
                          <span className="text-primary">{session.company}</span>
                          <span
                            style={{
                              color:
                                session.score >= 80
                                  ? 'var(--color-success)'
                                  : session.score >= 50
                                  ? 'var(--color-warning)'
                                  : 'var(--color-error)',
                            }}
                          >
                            {session.score}/100
                          </span>
                        </div>
                        <div className="flex justify-between text-muted text-xs">
                          <span>{session.category}</span>
                          <span>{session.completed_questions}/{session.total_questions} questions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <button
                onClick={() => setSelectedStudent(null)}
                className="btn btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
