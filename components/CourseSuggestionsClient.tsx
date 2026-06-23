'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Feedback, TaskCategory } from '@/lib/types';
import { formatDate } from '@/lib/score';
import { suggestCourseAction } from '@/app/actions/student';

interface CourseSuggestionsClientProps {
  assignedStudents: Profile[];
}

export default function CourseSuggestionsClient({ assignedStudents }: CourseSuggestionsClientProps) {
  const [studentId, setStudentId] = useState('');
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState('Coursera');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState<Feedback[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  useEffect(() => {
    async function loadSuggestionsHistory() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('feedback')
          .select('*, student:student_id(full_name, email)')
          .eq('mentor_id', user.id)
          .eq('type', 'suggestion')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setSuggestions((data as unknown as Feedback[]) || []);
      } catch (err) {
        console.error('Failed to load course suggestions history:', err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadSuggestionsHistory();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (!studentId) {
      setErrorMsg('Please select a student.');
      return;
    }
    if (!title.trim() || !url.trim()) {
      setErrorMsg('Course title and resource URL are required.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await suggestCourseAction(studentId, title, platform, url, category, comment);
      if (!res.success) {
        throw new Error(res.error || 'Failed to submit course suggestion.');
      }

      // Reset form fields
      setTitle('');
      setUrl('');
      setComment('');
      setCategory('general');

      // Optimistically prepend suggestion to list
      if (res.data) {
        startTransition(() => {
          setSuggestions((prev) => [res.data as unknown as Feedback, ...prev]);
        });
      }
      window.alert('Course suggestion sent successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this course suggestion?')) return;

    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;

      startTransition(() => {
        setSuggestions((prev) => prev.filter((s) => s.id !== id));
      });
    } catch (err: any) {
      window.alert(err.message || 'Failed to delete suggestion.');
    }
  }

  return (
    <div className="grid-2 animate-fade-in" style={{ gridTemplateColumns: '380px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
      {/* Suggestion Form */}
      <div className="card">
        <h2 className="card-title mb-4">Suggest Course / Resource</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {errorMsg && <div className="alert alert-error text-xs">{errorMsg}</div>}

          {/* Student Selector */}
          <div className="form-group">
            <label className="form-label" htmlFor="student-select">
              Select Mentee Student
            </label>
            <select
              id="student-select"
              className="input"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="">-- Choose Mentee --</option>
              {assignedStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name || s.email}
                </option>
              ))}
            </select>
          </div>

          {/* Course Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-title">
              Course / Resource Title
            </label>
            <input
              id="course-title"
              type="text"
              className="input"
              placeholder="e.g. Master the Coding Interview"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Platform */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-platform">
              Platform
            </label>
            <select
              id="course-platform"
              className="input"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="Coursera">Coursera</option>
              <option value="Udemy">Udemy</option>
              <option value="YouTube">YouTube</option>
              <option value="edX">edX</option>
              <option value="LeetCode">LeetCode</option>
              <option value="FreeCodeCamp">FreeCodeCamp</option>
              <option value="Other">Other Resource</option>
            </select>
          </div>

          {/* URL */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-url">
              Resource Link (URL)
            </label>
            <input
              id="course-url"
              type="url"
              className="input"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          {/* Focus Area / Category */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-category">
              Focus Category
            </label>
            <select
              id="course-category"
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value as TaskCategory)}
              style={{ cursor: 'pointer' }}
            >
              <option value="general">General</option>
              <option value="resume">Resume</option>
              <option value="github">GitHub</option>
              <option value="linkedin">LinkedIn</option>
              <option value="projects">Projects</option>
              <option value="coding">Coding</option>
              <option value="aptitude">Aptitude</option>
              <option value="interview">Interview</option>
            </select>
          </div>

          {/* Comment */}
          <div className="form-group">
            <label className="form-label" htmlFor="course-comment">
              Notes / Why suggest this?
            </label>
            <textarea
              id="course-comment"
              className="input"
              rows={4}
              placeholder="Optional notes or instructions for the student..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
            style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}
          >
            {submitting ? 'Submitting...' : 'Suggest Course'}
          </button>
        </form>
      </div>

      {/* Suggestion History List */}
      <div className="card">
        <h2 className="card-title mb-4">Course Suggestions History</h2>

        {loadingHistory ? (
          <div className="flex items-center justify-center p-8">
            <div className="spinner" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No course suggestions sent yet</div>
            <div className="empty-state-description">Suggest resources to your students using the form on the left.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {suggestions.map((s) => {
              const details = s.suggestion_details as any;
              return (
                <div
                  key={s.id}
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 'var(--space-4)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span className="text-sm font-semibold text-primary">{details?.title || s.message}</span>
                      <span className="badge badge-info">{details?.platform || 'Resource'}</span>
                      <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{s.category}</span>
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
                    <div className="flex gap-4 items-center mt-2 flex-wrap text-xs text-muted">
                      <span>Student: <strong className="text-secondary">{s.student?.full_name || s.student?.email}</strong></span>
                      <span>Suggested: {formatDate(s.created_at)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(s.id)}
                    className="btn btn-danger btn-sm"
                    style={{ flexShrink: 0 }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
