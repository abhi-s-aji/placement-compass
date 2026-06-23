'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, MentorRequest, Feedback } from '@/lib/types';
import { submitMentorRequestAction, getStudentMentorRequestsAction } from '@/app/actions/mentor-request';
import { formatDate } from '@/lib/score';
import { useSearchParams, useRouter } from 'next/navigation';
import StudentMentorChatClient from './StudentMentorChatClient';

export default function MentorRequestClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'chat';

  const [profile, setProfile] = useState<Profile | null>(null);
  const [mentors, setMentors] = useState<Profile[]>([]);
  const [requests, setRequests] = useState<MentorRequest[]>([]);
  const [assignedMentor, setAssignedMentor] = useState<Profile | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['chat', 'recommendations'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Fetch current profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData as Profile);

      // 2. Fetch all mentors
      const { data: mentorsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .order('full_name', { ascending: true });

      setMentors((mentorsData as Profile[]) || []);

      // 3. Fetch current mentor and chat history if assigned
      if (profileData?.mentor_id) {
        const [mentorDataRes, feedbackDataRes] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', profileData.mentor_id).single(),
          supabase.from('feedback').select('*').eq('student_id', user.id).eq('mentor_id', profileData.mentor_id).order('created_at', { ascending: true })
        ]);
        setAssignedMentor(mentorDataRes.data as Profile);
        setFeedbackHistory((feedbackDataRes.data as Feedback[]) || []);
      }

      // 4. Fetch requests history
      const reqRes = await getStudentMentorRequestsAction();
      if (reqRes.success) {
        setRequests(reqRes.data as unknown as MentorRequest[]);
      }
    } catch (err) {
      console.error('Failed to load mentor request page data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!selectedMentorId) {
      setError('Please select a mentor.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await submitMentorRequestAction(selectedMentorId, message);
      if (res.success) {
        setSuccess(true);
        setMessage('');
        setSelectedMentorId('');
        // Reload data
        await loadData();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit mentor request.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  const hasPendingRequest = requests.some(r => r.status === 'pending');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Panel</h1>
        </div>
      </div>

      <div className="page-body">
        {assignedMentor ? (
          <div className="flex flex-col gap-6">
            {/* Assigned Mentor Display */}
            <div className="card card-lg animate-fade-in" style={{ borderLeft: '4px solid var(--color-success)' }}>
              <h2 className="card-title text-success mb-2">Assigned Mentor</h2>
              <p className="text-sm text-secondary mb-4">
                You are assigned to the following mentor. You can communicate with them or complete tasks assigned by them.
              </p>
              <div className="flex items-start gap-4">
                <div
                  className="sidebar-user-avatar"
                  style={{ width: 48, height: 48, fontSize: 'var(--font-size-md)' }}
                >
                  {(assignedMentor.full_name || assignedMentor.email)
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)}
                </div>
                <div>
                  <div className="text-md font-bold text-primary">{assignedMentor.full_name || 'N/A'}</div>
                  <div className="text-sm text-muted">{assignedMentor.email}</div>
                  {assignedMentor.department && (
                    <div className="text-xs text-secondary mt-1">
                      Department: <strong>{assignedMentor.department}</strong>
                    </div>
                  )}
                  {assignedMentor.skills && assignedMentor.skills.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-2">
                      {assignedMentor.skills.map(s => (
                        <span key={s} className="badge badge-muted" style={{ fontSize: '10px' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab navigation */}
            <div className="flex gap-2 border-b border-zinc-800 pb-2">
              <button
                onClick={() => {
                  setActiveTab('chat');
                  router.replace('/student/mentor-request?tab=chat');
                }}
                className={`btn btn-sm ${activeTab === 'chat' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Chat with Mentor
              </button>
              <button
                onClick={() => {
                  setActiveTab('recommendations');
                  router.replace('/student/mentor-request?tab=recommendations');
                }}
                className={`btn btn-sm ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-ghost'}`}
              >
                Resource Recommendations
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'chat' ? (
              <StudentMentorChatClient initialFeedback={feedbackHistory} mentor={assignedMentor} />
            ) : (
              <div className="card animate-fade-in">
                <h3 className="card-title mb-4">Recommendations from {assignedMentor.full_name || 'Mentor'}</h3>
                {feedbackHistory.filter(f => f.type === 'suggestion').length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                    <div className="empty-state-title">No recommendations yet</div>
                    <div className="empty-state-description">Your mentor has not suggested any courses or resources yet.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {feedbackHistory.filter(f => f.type === 'suggestion').map((s) => {
                      const details = s.suggestion_details as any;
                      return (
                        <div
                          key={s.id}
                          style={{
                            padding: 'var(--space-4)',
                            borderRadius: 'var(--radius-md)',
                            borderLeft: '4px solid var(--color-info)',
                            backgroundColor: 'rgba(59, 130, 246, 0.06)',
                          }}
                        >
                          <div className="flex justify-between items-start gap-2 flex-wrap mb-1">
                            <span className="text-sm font-semibold text-primary">{details?.title || s.message}</span>
                            <span className="badge badge-info">{details?.platform || 'Resource'}</span>
                          </div>
                          {details?.url && (
                            <a
                              href={details.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-brand hover:underline mt-1 block truncate"
                            >
                              {details.url}
                            </a>
                          )}
                          {s.message && s.message !== `Course Suggestion: ${details?.title} on ${details?.platform}` && (
                            <p className="text-xs text-secondary mt-2 bg-zinc-950 p-2 rounded" style={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                              Note: {s.message}
                            </p>
                          )}
                          <div className="text-xs text-muted mt-2">
                            Suggested on {formatDate(s.created_at)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="alert alert-info mb-6 animate-fade-in">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
              <span>You do not currently have an assigned mentor. Browse mentors below and request one.</span>
            </div>

            <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
              {/* Left Column: Form or status */}
              <div>
                <div className="card">
                  <h2 className="card-title mb-4">Request a Mentor</h2>
                  {success && (
                    <div className="alert alert-success mb-4">
                      <span>Your mentor request has been submitted successfully and is pending review!</span>
                    </div>
                  )}
                  {error && <div className="alert alert-error mb-4">{error}</div>}

                  {hasPendingRequest ? (
                    <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                      <div className="empty-state-title">Pending Request Active</div>
                      <div className="empty-state-description">
                        You already have a pending mentor request. Please wait for an administrator to review it.
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                      <div className="form-group">
                        <label className="form-label" htmlFor="mentor-select">
                          Select a Mentor
                        </label>
                        <select
                          id="mentor-select"
                          className="input"
                          value={selectedMentorId}
                          onChange={(e) => setSelectedMentorId(e.target.value)}
                          style={{ cursor: 'pointer' }}
                          required
                        >
                          <option value="">-- Choose Mentor --</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.full_name || m.email} {m.department ? `(${m.department})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="request-message">
                          Message / Statement of Purpose
                        </label>
                        <textarea
                          id="request-message"
                          className="input"
                          rows={5}
                          placeholder="Explain why you want this mentor to guide you (e.g. shared interest in Web Dev, DSA guidance, etc.)..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ alignSelf: 'flex-start' }}
                      >
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                    </form>
                  )}
                </div>

                {/* Mentor suggestions/directory */}
                <div className="card mt-6">
                  <h2 className="card-title mb-4">Available Mentors</h2>
                  {mentors.length === 0 ? (
                    <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                      <div className="empty-state-title">No mentors available</div>
                      <div className="empty-state-description">Check back later once mentors register on the platform.</div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {mentors.map((m) => {
                        const initials = (m.full_name || m.email)
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2);
                        return (
                          <div
                            key={m.id}
                            style={{
                              padding: 'var(--space-3)',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--color-border-subtle)',
                              backgroundColor: 'var(--color-bg-tertiary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 'var(--space-4)',
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="sidebar-user-avatar" style={{ width: 36, height: 36, fontSize: '10px' }}>
                                {initials}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-primary">{m.full_name || m.email}</div>
                                <div className="text-xs text-muted">{m.department || 'N/A'}</div>
                                {m.skills && m.skills.length > 0 && (
                                  <div className="flex gap-1 flex-wrap mt-1">
                                    {m.skills.slice(0, 3).map((s) => (
                                      <span key={s} className="badge badge-muted" style={{ fontSize: '9px', padding: '1px 4px' }}>
                                        {s}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            {!assignedMentor && !hasPendingRequest && (
                              <button
                                onClick={() => setSelectedMentorId(m.id)}
                                className="btn btn-secondary btn-sm"
                              >
                                Select
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Request History */}
              <div className="card">
                <h2 className="card-title mb-4">Request History</h2>
                {requests.length === 0 ? (
                  <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
                    <div className="empty-state-title">No requests submitted</div>
                    <div className="empty-state-description">Your submitted requests will be displayed here.</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {requests.map((r) => {
                      const statusBadgeClass =
                        r.status === 'approved'
                          ? 'badge-success'
                          : r.status === 'rejected'
                          ? 'badge-danger'
                          : 'badge-warning';

                      return (
                        <div
                          key={r.id}
                          style={{
                            padding: 'var(--space-3)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-border-subtle)',
                            backgroundColor: 'var(--color-bg-secondary)',
                          }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <div className="text-xs text-muted">Requested Mentor</div>
                              <div className="text-sm font-semibold text-primary">
                                {r.mentor?.full_name || r.mentor?.email || 'N/A'}
                              </div>
                            </div>
                            <span className={`badge ${statusBadgeClass}`} style={{ textTransform: 'capitalize' }}>
                              {r.status}
                            </span>
                          </div>
                          {r.message && (
                            <p className="text-xs text-secondary mb-2" style={{ fontStyle: 'italic', wordBreak: 'break-word' }}>
                              &quot;{r.message}&quot;
                            </p>
                          )}
                          <div className="text-xs text-muted" style={{ fontSize: '9px' }}>
                            Submitted on {formatDate(r.created_at)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
