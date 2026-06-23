'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Feedback } from '@/lib/types';
import { formatDate } from '@/lib/score';

export default function MentorMessagesClient() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [messages, setMessages] = useState<Feedback[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [mentorId, setMentorId] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMentorId(user.id);

      // Load assigned students
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .eq('mentor_id', user.id)
        .order('full_name', { ascending: true });

      setStudents((studentsData as Profile[]) || []);

      if (studentsData && studentsData.length > 0) {
        setSelectedStudentId(studentsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load mentor messages data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load chat messages when selectedStudentId changes
  async function loadMessages(studentId: string) {
    if (!studentId || !mentorId) return;
    try {
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', studentId)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: true });

      setMessages((data as Feedback[]) || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedStudentId && mentorId) {
      loadMessages(selectedStudentId);
    } else {
      setMessages([]);
    }
  }, [selectedStudentId, mentorId]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending || !selectedStudentId || !mentorId) return;

    setSending(true);

    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          mentor_id: mentorId,
          student_id: selectedStudentId,
          message: newMessage.trim(),
          type: 'feedback',
          category: null,
        })
        .select()
        .single();

      if (error) throw error;

      setNewMessage('');
      if (data) {
        startTransition(() => {
          setMessages((prev) => [...prev, data as unknown as Feedback]);
        });
      }
    } catch (err: any) {
      window.alert(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  const selectedStudentObj = students.find(s => s.id === selectedStudentId);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Student Communications</h1>
        </div>
      </div>

      <div className="page-body">
        {students.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No assigned students</div>
            <div className="empty-state-description">
              You do not have any students assigned to you yet. You will be able to message students once they are assigned to you by an admin.
            </div>
          </div>
        ) : (
          <div className="grid-2" style={{ gridTemplateColumns: '300px 1fr', gap: 'var(--space-6)', alignItems: 'stretch', height: 'calc(100vh - 220px)' }}>
            {/* Sidebar list of students */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
              <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                <h3 className="font-semibold text-secondary text-sm">Assigned Students</h3>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {students.map((s) => {
                  const isSelected = s.id === selectedStudentId;
                  const initials = (s.full_name || s.email)
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        border: 'none',
                        background: isSelected ? 'var(--color-bg-tertiary)' : 'none',
                        borderLeft: isSelected ? '3px solid var(--color-brand)' : '3px solid transparent',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background-color var(--transition-fast)',
                      }}
                      className="table-row-hover"
                    >
                      <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: '10px', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }} className="truncate">
                          {s.full_name || 'N/A'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }} className="truncate">
                          {s.email}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Box */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
              {/* Chat Header */}
              {selectedStudentObj && (
                <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="sidebar-user-avatar" style={{ width: 36, height: 36, fontSize: 'var(--font-size-xs)' }}>
                    {(selectedStudentObj.full_name || selectedStudentObj.email)
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary text-sm" style={{ margin: 0 }}>
                      {selectedStudentObj.full_name || 'N/A'}
                    </h3>
                    <p className="text-xs text-muted" style={{ margin: 0 }}>
                      {selectedStudentObj.department ? `${selectedStudentObj.department} | ` : ''}Class of {selectedStudentObj.graduation_year || 'N/A'}
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: 'var(--color-bg-secondary)',
                }}
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted text-xs">
                    <span>No message history.</span>
                    <span>Send a message to start the conversation!</span>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromStudent = msg.type === 'student' || msg.message.startsWith('Reply:');
                    
                    // Strip the "Reply: " prefix if present for clean display
                    let displayMessage = msg.message;
                    if (isFromStudent && displayMessage.startsWith('Reply: ')) {
                      displayMessage = displayMessage.substring(7);
                    } else if (isFromStudent && displayMessage.startsWith('Reply:')) {
                      displayMessage = displayMessage.substring(6);
                    }

                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isFromStudent ? 'flex-start' : 'flex-end',
                          maxWidth: '75%',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div
                          style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border-subtle)',
                            backgroundColor: isFromStudent
                              ? 'var(--color-bg-tertiary)'
                              : 'var(--color-brand-subtle)',
                          }}
                        >
                          <p className="text-sm text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4, margin: 0 }}>
                            {displayMessage}
                          </p>
                        </div>
                        <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', alignSelf: isFromStudent ? 'flex-start' : 'flex-end', padding: '0 4px' }}>
                          {isFromStudent ? 'Student' : 'You'} &bull; {formatDate(msg.created_at)}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }} className="flex gap-2">
                <input
                  type="text"
                  className="input"
                  placeholder={`Send a reply to ${selectedStudentObj?.full_name || 'student'}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sending || !selectedStudentId}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newMessage.trim() || sending || !selectedStudentId}
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
