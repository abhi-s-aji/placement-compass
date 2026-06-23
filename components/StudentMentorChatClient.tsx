'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { Feedback, Profile } from '@/lib/types';
import { sendStudentMessageAction } from '@/app/actions/student';
import { formatDate } from '@/lib/score';

interface StudentMentorChatClientProps {
  initialFeedback: Feedback[];
  mentor: Profile | null;
}

export default function StudentMentorChatClient({ initialFeedback, mentor }: StudentMentorChatClientProps) {
  const [messages, setMessages] = useState<Feedback[]>(initialFeedback);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isPending, startTransition] = useTransition();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on load or new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);

    try {
      const res = await sendStudentMessageAction(newMessage);
      if (!res.success) {
        throw new Error(res.error || 'Failed to send message.');
      }

      setNewMessage('');
      
      if (res.data) {
        startTransition(() => {
          setMessages((prev) => [...prev, res.data as unknown as Feedback]);
        });
      }
    } catch (err: any) {
      window.alert(err.message || 'Could not send message.');
    } finally {
      setSending(false);
    }
  }

  if (!mentor) {
    return (
      <div className="card">
        <h3 className="card-title">Mentor Guidance</h3>
        <p className="text-xs text-muted" style={{ padding: 'var(--space-4) 0' }}>
          You have not been assigned a mentor yet. Please check back later or contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: '450px' }}>
      <div className="card-header" style={{ paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border-subtle)' }}>
        <div>
          <h3 className="card-title" style={{ fontSize: '15px' }}>Mentor Guidance & Suggestions</h3>
          <p className="card-subtitle">
            Chat with <strong className="text-primary">{mentor.full_name || mentor.email}</strong>
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div 
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '12px', 
          padding: '4px',
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted text-xs">
            <span>No messages or suggestions yet.</span>
            <span>Reach out to your mentor if you have questions!</span>
          </div>
        ) : (
          messages.map((msg) => {
            const isStudentMsg = msg.mentor_id === mentor.id && msg.message.startsWith('[Student Reply]') || (msg as any).type === 'student'; // Fallback check
            const isSuggestion = (msg as any).type === 'suggestion';
            const details = (msg as any).suggestion_details;
            
            // To distinguish student replies vs mentor advice, check if creator is student
            // Note: in RLS, student_id = auth.uid() is student. Since we wrote using student actions,
            // we can see if it's a student reply. Let's make it easy: if message starts with or is labeled.
            // Wait, we can check if it is suggestion, else check if the message sender is student.
            // Let's check who sent the message:
            const isFromMentor = msg.mentor_id === mentor.id && !msg.message.startsWith('Reply:'); // standard logic

            return (
              <div
                key={msg.id}
                style={{
                  alignSelf: isFromMentor ? 'flex-start' : 'flex-end',
                  maxWidth: '85%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                }}
              >
                {/* Bubble Container */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-border-subtle)',
                    backgroundColor: isFromMentor 
                      ? (isSuggestion ? 'rgba(59, 130, 246, 0.08)' : 'var(--color-bg-tertiary)') 
                      : 'var(--color-brand-subtle)',
                    borderLeft: isFromMentor && isSuggestion ? '3px solid var(--color-info)' : undefined,
                  }}
                >
                  {isSuggestion && details ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge badge-info" style={{ fontSize: '9px' }}>Course Suggestion</span>
                        <span className="text-xs font-semibold text-secondary">{details.platform}</span>
                      </div>
                      <div className="text-sm font-semibold text-primary mb-1">{details.title}</div>
                      {details.url && (
                        <a 
                          href={details.url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-xs btn-primary mt-1 mb-2 inline-flex"
                          style={{ textDecoration: 'none', display: 'inline-flex', padding: '4px 10px', fontSize: '11px' }}
                        >
                          View Resource &rarr;
                        </a>
                      )}
                      {msg.message && msg.message !== `Course Suggestion: ${details.title} on ${details.platform}` && (
                        <p className="text-xs text-secondary mt-1 pt-1 border-t border-zinc-800">{msg.message}</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-secondary" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.4 }}>
                      {msg.message}
                    </p>
                  )}
                </div>

                {/* Metadata */}
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: isFromMentor ? 'flex-start' : 'flex-end', padding: '0 4px' }}>
                  {isFromMentor ? 'Mentor' : 'You'} &bull; {formatDate(msg.created_at)}
                </span>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <form onSubmit={handleSendMessage} className="flex gap-2 mt-auto" style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)' }}>
        <input
          type="text"
          className="input"
          placeholder="Type your message to mentor..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={sending}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={!newMessage.trim() || sending}>
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
}
