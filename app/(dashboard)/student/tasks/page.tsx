'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProgressBar from '@/components/ProgressBar';

interface StudentTodo {
  id: string;
  user_id: string;
  title: string;
  description: string;
  completed: boolean;
  tags: string[];
  created_at: string;
}

const AVAILABLE_TAGS = ['Python', 'Java', 'Web', 'DSA', 'System Design', 'General'];

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function TasksPage() {
  const [todos, setTodos] = useState<StudentTodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // New task form fields
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Load user session & todos
  useEffect(() => {
    async function initTodos() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('No user session found');
        }
        setUserId(user.id);
        try {
          localStorage.setItem('sb-current-user', JSON.stringify({ id: user.id }));
        } catch (e) {
          console.error('Failed to cache user ID:', e);
        }

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('student_todos')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setTodos(data as StudentTodo[]);
          // Mirror in localStorage
          localStorage.setItem(`student_todos_${user.id}`, JSON.stringify(data));
        }
      } catch (err) {
        console.warn('Failed to fetch from Supabase, loading from localStorage cache:', err);
        // Fallback to localStorage
        const cached = localStorage.getItem('sb-current-user') || '';
        let localUser = null;
        try {
          if (cached) {
            const parsedUser = JSON.parse(cached);
            localUser = parsedUser?.id || null;
          }
        } catch (e) {
          console.error('Failed to parse cached user:', e);
        }

        const activeId = user_id_hack || localUser || 'offline-user';
        setUserId(activeId);
        if (activeId) {
          try {
            const localData = localStorage.getItem(`student_todos_${activeId}`);
            if (localData) {
              const parsed = JSON.parse(localData);
              if (Array.isArray(parsed)) {
                setTodos(parsed);
              }
            }
          } catch (jsonErr) {
            console.error('Failed to parse cached todo items:', jsonErr);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    
    let user_id_hack: string | null = null;
    initTodos();
  }, []);

  // Save updates helper (syncs to Supabase & localStorage)
  async function syncTodos(updatedList: StudentTodo[]) {
    setTodos(updatedList);
    if (!userId) return;

    // 1. Save to local storage immediately
    try {
      localStorage.setItem(`student_todos_${userId}`, JSON.stringify(updatedList));
    } catch (e) {
      console.error('Failed to write local cache:', e);
    }

    // 2. Save to Supabase (upsert)
    try {
      await supabase.from('student_todos').upsert(
        updatedList.map(t => ({
          id: t.id,
          user_id: t.user_id,
          title: t.title,
          description: t.description,
          completed: t.completed,
          tags: t.tags,
          created_at: t.created_at,
          updated_at: new Date().toISOString()
        }))
      );
    } catch (dbErr) {
      console.warn('Supabase offline, todo auto-saved to localStorage only:', dbErr);
    }
  }

  // Create Task
  async function handleAddTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !userId) return;

    const newTodo: StudentTodo = {
      id: generateUUID(),
      user_id: userId,
      title: newTitle.trim(),
      description: newDesc.trim(),
      completed: false,
      tags: selectedTags,
      created_at: new Date().toISOString()
    };

    const updated = [newTodo, ...todos];
    await syncTodos(updated);

    // Reset form
    setNewTitle('');
    setNewDesc('');
    setSelectedTags([]);
    setShowAddForm(false);
  }

  // Toggle Completion
  async function handleToggleComplete(id: string) {
    const updated = todos.map(todo => {
      if (todo.id === id) {
        return { ...todo, completed: !todo.completed };
      }
      return todo;
    });
    await syncTodos(updated);
  }

  // Delete Task
  async function handleDeleteTodo(id: string) {
    const updated = todos.filter(t => t.id !== id);
    setTodos(updated);

    if (userId) {
      // Update cache
      try {
        localStorage.setItem(`student_todos_${userId}`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      // Delete from Supabase
      try {
        await supabase.from('student_todos').delete().eq('id', id);
      } catch (dbErr) {
        console.warn('Failed to delete from Supabase, synced locally:', dbErr);
      }
    }
  }

  // Tag helper
  function toggleTagSelection(tag: string) {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }

  // Progress metrics
  const totalCount = todos.length;
  const completedCount = todos.filter(t => t.completed).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
          <h1 className="page-header-title">Tasks</h1>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New Task'}
        </button>
      </div>

      <div className="page-body flex flex-col gap-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Progress bar */}
        <div className="card">
          <ProgressBar
            value={completedCount}
            max={totalCount}
            label={`Task Completion Progress (${progressPct}% Completed)`}
            showValue={true}
          />
        </div>

        {/* Create Task Form */}
        {showAddForm && (
          <div className="card flex flex-col gap-4">
            <h3 className="text-md font-semibold text-primary">New Task</h3>
            <form onSubmit={handleAddTodo} className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label" htmlFor="todo-title">Task Title</label>
                <input
                  id="todo-title"
                  className="input"
                  placeholder="What needs to be done?"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="todo-desc">Description (Optional)</label>
                <input
                  id="todo-desc"
                  className="input"
                  placeholder="Add details"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tags (Select Optional tags)</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {AVAILABLE_TAGS.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTagSelection(tag)}
                        className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', borderRadius: '12px' }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }} disabled={!newTitle.trim()}>
                Save Task
              </button>
            </form>
          </div>
        )}

        {/* Task lists UI (Google Tasks Style) */}
        <div className="flex flex-col gap-2">
          {todos.length === 0 ? (
            <div className="card text-center p-8 text-secondary">
              No tasks created yet. Click Add New Task above to start tracking your goals.
            </div>
          ) : (
            todos.map(todo => (
              <div
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px 16px',
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border-subtle)',
                  borderRadius: '6px',
                  transition: 'all 0.15s ease'
                }}
                className="hover-card"
              >
                {/* Round Checkbox */}
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleComplete(todo.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '2px solid var(--color-border)',
                    cursor: 'pointer',
                    marginTop: '2px',
                    accentColor: 'var(--color-brand)'
                  }}
                />

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: todo.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      transition: 'color 0.15s'
                    }}
                  >
                    {todo.title}
                  </div>

                  {todo.description && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-muted)',
                        marginTop: '4px',
                        lineHeight: 1.4
                      }}
                    >
                      {todo.description}
                    </div>
                  )}

                  {/* Tags */}
                  {todo.tags && todo.tags.length > 0 && (
                    <div className="flex gap-1 mt-2">
                      {todo.tags.map(tag => (
                        <span
                          key={tag}
                          className="badge"
                          style={{
                            fontSize: '9px',
                            padding: '1px 6px',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-brand)',
                            border: '1px solid var(--color-border)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <button
                  onClick={() => handleDeleteTodo(todo.id)}
                  className="btn btn-ghost btn-xs text-error"
                  style={{ opacity: 0.8, alignSelf: 'center' }}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
