'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile, Feedback, TaskCategory } from '@/lib/types';
import { formatDate } from '@/lib/score';

export default function FeedbackClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState<Profile[]>([]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [studentId, setStudentId] = useState(preselectedStudentId);
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Load studentId when query param changes
  useEffect(() => {
    if (preselectedStudentId) {
      setStudentId(preselectedStudentId);
    }
  }, [preselectedStudentId]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [
        { data: studentsData },
        { data: feedbackData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student').order('full_name', { ascending: true }),
        supabase.from('feedback').select('*, student:student_id(full_name, email)').eq('mentor_id', user.id).order('created_at', { ascending: false }),
      ]);

      setStudents((studentsData as Profile[]) || []);
      setFeedbackList((feedbackData as unknown as Feedback[]) || []);
    } catch (err) {
      console.error('Failed to load mentor feedback data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!studentId) {
      setFormError('Please select a student');
      return;
    }
    if (!message.trim()) {
      setFormError('Please enter a feedback message');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      const { data, error } = await supabase
        .from('feedback')
        .insert({
          mentor_id: user.id,
          student_id: studentId,
          message: message.trim(),
          category: category === 'general' ? null : category,
        })
        .select('*, student:student_id(full_name, email)')
        .single();

      if (error) throw error;

      // Reset form fields
      setMessage('');
      setCategory('general');

      // Optimistically append the feedback
      startTransition(() => {
        setFeedbackList((prev) => [data as unknown as Feedback, ...prev]);
      });
    } catch (err: any) {
      console.error('Error creating feedback:', err);
      setFormError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteFeedback(feedbackId: string) {
    if (!confirm('Are you sure you want to delete this feedback entry?')) return;

    const { error } = await supabase.from('feedback').delete().eq('id', feedbackId);

    if (error) {
      console.error('Error deleting feedback:', error);
      return;
    }

    startTransition(() => {
      setFeedbackList((prev) => prev.filter((f) => f.id !== feedbackId));
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="grid-2" style={{ gridTemplateColumns: '380px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
      {/* Add Feedback Form */}
      <div className="card">
        <h2 className="card-title mb-4">Send Mentee Feedback</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {formError && <div className="alert alert-error text-xs">{formError}</div>}

          {/* Student Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="student-select">
              Select Student
            </label>
            <select
              id="student-select"
              className="input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">-- Choose Mentee --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="feedback-category">
              Focus Area / Category
            </label>
            <select
              id="feedback-category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              style={{ cursor: 'pointer' }}
            >
              <option value="general">General Guidance</option>
              <option value="resume">Resume Review</option>
              <option value="github">GitHub Portfolio</option>
              <option value="linkedin">LinkedIn Profile</option>
              <option value="projects">Projects Review</option>
              <option value="coding">Coding Round Prep</option>
              <option value="aptitude">Aptitude Tests</option>
              <option value="interview">Interview Readiness</option>
            </select>
          </div>

          {/* Feedback Message */}
          <div className="form-group">
            <label className="form-label" htmlFor="feedback-message">
              Feedback Message
            </label>
            <textarea
              id="feedback-message"
              className="input"
              rows={6}
              placeholder="Write constructive feedback, improvement tips, or recommendations for the student..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
            style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}
          >
            {submitting ? 'Submitting...' : 'Send Feedback'}
          </button>
        </form>
      </div>

      {/* Feedback Logs */}
      <div className="card">
        <h2 className="card-title mb-4">Feedback Log Directory</h2>

        {feedbackList.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No feedback history found</div>
            <div className="empty-state-description">Send feedback using the form on the left to display logs.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {feedbackList.map((fb) => (
              <div
                key={fb.id}
                style={{
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--color-brand)',
                  backgroundColor: 'var(--color-brand-subtle)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 'var(--space-4)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className="text-sm text-primary" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                    {fb.message}
                  </p>
                  <div className="flex gap-4 items-center mt-3 flex-wrap text-xs text-muted">
                    <span>Mentee: <strong className="text-secondary">{fb.student?.full_name || fb.student?.email}</strong></span>
                    <span>Category: <strong className="text-secondary">{fb.category || 'General'}</strong></span>
                    <span>Sent: <strong className="text-secondary">{formatDate(fb.created_at)}</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => deleteFeedback(fb.id)}
                  className="btn btn-danger btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
