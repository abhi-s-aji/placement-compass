'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MentorRequest } from '@/lib/types';
import { getAllMentorRequestsAction, approveMentorRequestAction, rejectMentorRequestAction } from '@/app/actions/mentor-request';
import { formatDate } from '@/lib/score';

export default function MentorRequestsAdminClient() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [actionError, setActionError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  async function loadRequests() {
    try {
      const data = await getAllMentorRequestsAction();
      setRequests(data as unknown as MentorRequest[]);
    } catch (err: any) {
      console.error('Failed to load mentor requests:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleApprove(id: string) {
    if (!confirm('Are you sure you want to approve this request and assign this mentor?')) return;
    setActionError(null);
    try {
      const res = await approveMentorRequestAction(id);
      if (res.success) {
        await loadRequests();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to approve request');
    }
  }

  async function handleReject(id: string) {
    if (!confirm('Are you sure you want to reject this request?')) return;
    setActionError(null);
    try {
      const res = await rejectMentorRequestAction(id);
      if (res.success) {
        await loadRequests();
      }
    } catch (err: any) {
      setActionError(err.message || 'Failed to reject request');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  const filteredRequests = requests.filter(r => filter === 'all' || r.status === filter);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Admin Mentor Requests</h1>
        </div>
      </div>

      <div className="page-body">
        {actionError && <div className="alert alert-error mb-4">{actionError}</div>}

        {/* Filters */}
        <div className="card mb-6 flex gap-4 items-center">
          <div className="form-group" style={{ margin: 0 }}>
            <span className="text-xs text-muted mr-3">Status Filter:</span>
            <div className="flex gap-2" style={{ display: 'inline-flex' }}>
              {(['pending', 'approved', 'rejected', 'all'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ textTransform: 'capitalize' }}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No requests found</div>
            <div className="empty-state-description">
              No mentor requests match the current status filter.
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredRequests.map((r) => {
              const statusBadgeClass =
                r.status === 'approved'
                  ? 'badge-success'
                  : r.status === 'rejected'
                  ? 'badge-danger'
                  : 'badge-warning';

              return (
                <div
                  key={r.id}
                  className="card"
                  style={{
                    borderLeft: `4px solid ${
                      r.status === 'approved'
                        ? 'var(--color-success)'
                        : r.status === 'rejected'
                        ? 'var(--color-error)'
                        : 'var(--color-warning)'
                    }`,
                  }}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
                    {/* Student Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div className="text-xs text-muted font-semibold uppercase mb-1">Requested By</div>
                      <div className="text-md font-bold text-primary">{r.student?.full_name || 'N/A'}</div>
                      <div className="text-xs text-muted">{r.student?.email}</div>
                      <div className="text-xs text-secondary mt-1">
                        Dept: <strong>{r.student?.department || 'N/A'}</strong> &bull; Grad Year:{' '}
                        <strong>{r.student?.graduation_year || 'N/A'}</strong>
                      </div>
                    </div>

                    {/* Mentor Info */}
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div className="text-xs text-muted font-semibold uppercase mb-1">Requested Mentor</div>
                      <div className="text-md font-bold text-primary">{r.mentor?.full_name || 'N/A'}</div>
                      <div className="text-xs text-muted">{r.mentor?.email}</div>
                      <div className="text-xs text-secondary mt-1">
                        Dept: <strong>{r.mentor?.department || 'N/A'}</strong>
                      </div>
                    </div>

                    {/* Status & Date */}
                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                      <span className={`badge ${statusBadgeClass} mb-2`} style={{ textTransform: 'capitalize' }}>
                        {r.status}
                      </span>
                      <div className="text-xs text-muted">{formatDate(r.created_at)}</div>
                    </div>
                  </div>

                  {/* Message */}
                  {r.message && (
                    <div
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        border: '1px solid var(--color-border-subtle)',
                        marginBottom: 'var(--space-4)',
                      }}
                    >
                      <div className="text-xs text-muted font-semibold mb-1">Student Message:</div>
                      <p className="text-sm text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {r.message}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(r.id)}
                        className="btn btn-primary btn-sm"
                      >
                        Approve & Assign
                      </button>
                      <button
                        onClick={() => handleReject(r.id)}
                        className="btn btn-danger btn-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
