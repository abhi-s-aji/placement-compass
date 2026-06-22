'use client';

import { useState, useEffect, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Profile, Task, TaskCategory, TaskPriority } from '@/lib/types';
import { formatDate, getPriorityClass, getStatusClass } from '@/lib/score';

export default function TasksClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const preselectedStudentId = searchParams.get('studentId') || '';

  const [students, setStudents] = useState<Profile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [studentId, setStudentId] = useState(preselectedStudentId);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('general');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [deadline, setDeadline] = useState('');
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
        { data: tasksData }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student').order('full_name', { ascending: true }),
        supabase.from('tasks').select('*, student:student_id(full_name, email)').eq('mentor_id', user.id).order('created_at', { ascending: false }),
      ]);

      setStudents((studentsData as Profile[]) || []);
      setTasks((tasksData as unknown as Task[]) || []);
    } catch (err) {
      console.error('Failed to load mentor tasks data:', err);
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
    if (!title.trim()) {
      setFormError('Please enter a task title');
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Unauthorized');

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          mentor_id: user.id,
          student_id: studentId,
          title: title.trim(),
          description: description.trim() || null,
          category,
          priority,
          deadline: deadline ? new Date(deadline).toISOString() : null,
          status: 'pending',
        })
        .select('*, student:student_id(full_name, email)')
        .single();

      if (error) throw error;

      // Reset form fields
      setTitle('');
      setDescription('');
      setCategory('general');
      setPriority('medium');
      setDeadline('');

      // Optimistically append the task
      startTransition(() => {
        setTasks((prev) => [data as unknown as Task, ...prev]);
      });
    } catch (err: any) {
      console.error('Error creating task:', err);
      setFormError(err.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (error) {
      console.error('Error deleting task:', error);
      return;
    }

    startTransition(() => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
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
      {/* Create Task Form */}
      <div className="card">
        <h2 className="card-title mb-4">Assign New Task</h2>
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

          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-title">
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              className="input"
              placeholder="e.g., Optimize GitHub Profile Bio"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-desc">
              Description (Optional)
            </label>
            <textarea
              id="task-desc"
              className="input"
              rows={3}
              placeholder="Provide context or guidance on what to accomplish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Category & Priority */}
          <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="task-category">
                Category
              </label>
              <select
                id="task-category"
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

            <div className="form-group">
              <label className="form-label" htmlFor="task-priority">
                Priority
              </label>
              <select
                id="task-priority"
                className="input"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                style={{ cursor: 'pointer' }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Deadline */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-deadline">
              Deadline (Optional)
            </label>
            <input
              id="task-deadline"
              type="date"
              className="input"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={submitting}
            style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}
          >
            {submitting ? 'Assigning...' : 'Assign Task'}
          </button>
        </form>
      </div>

      {/* Tasks List */}
      <div className="card">
        <h2 className="card-title mb-4">Assigned Tasks Directory</h2>

        {tasks.length === 0 ? (
          <div className="empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No tasks assigned yet</div>
            <div className="empty-state-description">Use the form on the left to assign tasks to your students.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {tasks.map((task) => (
              <div
                key={task.id}
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
                    <span className="text-sm font-semibold text-primary">{task.title}</span>
                    <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                    <span className={`badge ${getStatusClass(task.status)}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                  {task.description && (
                    <p className="text-xs text-secondary mt-1" style={{ lineHeight: 1.5 }}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex gap-4 items-center mt-2 flex-wrap text-xs text-muted">
                    <span>Mentee: <strong className="text-secondary">{task.student?.full_name || task.student?.email}</strong></span>
                    <span>Category: <strong className="text-secondary">{task.category}</strong></span>
                    {task.deadline && <span>Due: {formatDate(task.deadline)}</span>}
                    {task.completed_at && <span className="text-success font-medium">Completed {formatDate(task.completed_at)}</span>}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
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
