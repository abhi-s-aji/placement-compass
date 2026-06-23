'use client';

import { useState, useTransition } from 'react';
import { Profile } from '@/lib/types';
import { assignStudentToMentorAction } from '@/app/actions/admin';

interface MentorAssignmentClientProps {
  students: Profile[];
  mentors: Profile[];
}

export default function MentorAssignmentClient({ students: initialStudents, mentors }: MentorAssignmentClientProps) {
  const [students, setStudents] = useState<Profile[]>(initialStudents);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleAssignMentor(studentId: string, mentorId: string | '') {
    const selectedMentorId = mentorId === '' ? null : mentorId;
    setUpdatingId(studentId);

    try {
      await assignStudentToMentorAction(studentId, selectedMentorId);
      
      startTransition(() => {
        setStudents((prev) =>
          prev.map((s) => (s.id === studentId ? { ...s, mentor_id: selectedMentorId as any } : s))
        );
        setUpdatingId(null);
      });
      
      const mentorObj = mentors.find(m => m.id === selectedMentorId);
      const mentorName = mentorObj ? (mentorObj.full_name || mentorObj.email) : 'None';
      window.alert(`Successfully updated mentor to: ${mentorName}`);
    } catch (error: any) {
      console.error('Failed to assign mentor:', error);
      window.alert(error.message || 'Failed to assign mentor');
      setUpdatingId(null);
    }
  }

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const fullName = (s.full_name || '').toLowerCase();
    const email = s.email.toLowerCase();
    const dept = (s.department || '').toLowerCase();
    const searchLower = search.toLowerCase();

    const matchesSearch = fullName.includes(searchLower) || email.includes(searchLower) || dept.includes(searchLower);
    const matchesDept = deptFilter === 'all' || s.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  const departments = Array.from(
    new Set(students.map((s) => s.department).filter(Boolean))
  ) as string[];

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Assignment</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Filters */}
        <div className="card mb-6 flex gap-4 items-center flex-wrap">
          {/* Search bar */}
          <div className="form-group" style={{ flex: 2, minWidth: 240 }}>
            <input
              type="text"
              className="input"
              placeholder="Search students by name, email, or department..."
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
        </div>

        {/* Assignment Directory */}
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
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>CURRENT MENTOR</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>ASSIGNMENT ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => {
                  const isUpdating = updatingId === s.id;
                  const currentMentor = mentors.find((m) => m.id === (s as any).mentor_id);

                  return (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border-subtle)' }} className="table-row-hover">
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.full_name || 'N/A'}</div>
                          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>{s.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>{s.department || 'N/A'}</td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        {currentMentor ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-brand)', fontSize: '13px' }}>
                              {currentMentor.full_name || 'Name not set'}
                            </span>
                            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                              {currentMentor.email}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td style={{ padding: 'var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <select
                            className="input"
                            value={(s as any).mentor_id || ''}
                            disabled={isUpdating}
                            onChange={(e) => handleAssignMentor(s.id, e.target.value)}
                            style={{ cursor: 'pointer', padding: '6px var(--space-2)', fontSize: 'var(--font-size-xs)', width: 'auto', minWidth: '180px' }}
                          >
                            <option value="">-- Unassign Mentor --</option>
                            {mentors.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.full_name ? `${m.full_name} (${m.email})` : m.email}
                              </option>
                            ))}
                          </select>
                          {isUpdating && (
                            <span className="spinner spinner-sm" style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
                          )}
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
