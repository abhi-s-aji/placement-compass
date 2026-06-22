'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Task } from '@/lib/types';
import { formatDate, getDaysUntil, getPriorityClass, getStatusClass } from '@/lib/score';

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const supabase = createClient();

  async function loadTasks() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tasks')
        .select('*, mentor:mentor_id(full_name)')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data as unknown as Task[]);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function toggleStatus(taskId: string, currentStatus: string) {
    setUpdatingId(taskId);
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = newStatus === 'completed' ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: completedAt })
      .eq('id', taskId);

    if (error) {
      console.error('Failed to update task status:', error);
      setUpdatingId(null);
      return;
    }

    startTransition(() => {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, status: newStatus as any, completed_at: completedAt }
            : t
        )
      );
      setUpdatingId(null);
    });
  }

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status !== 'completed';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

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
          <h1 className="page-header-title">Mentor-Assigned Tasks</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          >
            All Tasks
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`btn btn-sm ${filter === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="page-body">
        {filteredTasks.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <div className="empty-state-title">No tasks found</div>
            <div className="empty-state-description">
              {filter === 'all'
                ? 'Your mentor has not assigned you any tasks yet.'
                : filter === 'pending'
                ? 'You do not have any pending tasks.'
                : 'You have not completed any tasks yet.'}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {filteredTasks.map((task) => {
              const daysLeft = getDaysUntil(task.deadline);
              const isOverdue = daysLeft !== null && daysLeft < 0 && task.status !== 'completed';
              const isUpdating = updatingId === task.id;

              return (
                <div
                  key={task.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--space-4)',
                    padding: 'var(--space-4)',
                    borderLeft: task.status === 'completed' 
                      ? '4px solid var(--color-success)' 
                      : isOverdue 
                      ? '4px solid var(--color-error)' 
                      : '4px solid var(--color-border)',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                      <span
                        className="text-sm font-semibold text-primary truncate"
                        style={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}
                      >
                        {task.title}
                      </span>
                      <span className={`badge ${getPriorityClass(task.priority)}`}>{task.priority}</span>
                      <span className={`badge ${getStatusClass(task.status)}`}>{task.status.replace('_', ' ')}</span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-secondary mt-1" style={{ lineHeight: 1.5 }}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex gap-4 items-center mt-2 flex-wrap text-xs text-muted">
                      <span>Category: <strong className="text-secondary">{task.category}</strong></span>
                      <span>Assigned by: <strong className="text-secondary">{task.mentor?.full_name || 'Mentor'}</strong></span>
                      {task.deadline && (
                        <span className={isOverdue ? 'text-error font-medium' : ''}>
                          Due: {formatDate(task.deadline)} 
                          {task.status !== 'completed' && (
                            <span> ({isOverdue ? `${Math.abs(daysLeft!)}d overdue` : `${daysLeft}d left`})</span>
                          )}
                        </span>
                      )}
                      {task.completed_at && (
                        <span className="text-success">Completed: {formatDate(task.completed_at)}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleStatus(task.id, task.status)}
                    disabled={isUpdating}
                    className={`btn btn-sm ${task.status === 'completed' ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ flexShrink: 0 }}
                  >
                    {isUpdating ? (
                      <span className="spinner spinner-sm" style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
                    ) : task.status === 'completed' ? (
                      'Mark Incomplete'
                    ) : (
                      'Mark Complete'
                    )}
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
