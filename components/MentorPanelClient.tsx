'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Profile, Feedback, MentorRequest, TaskCategory } from '@/lib/types';
import { formatDate } from '@/lib/score';
import { suggestCourseAction } from '@/app/actions/student';

interface StudentSummary {
  profile: Profile;
  overallScore: number;
  tasksCount: number;
}

export default function MentorPanelClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams.get('tab') || 'students';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [loading, setLoading] = useState(true);
  const [mentorId, setMentorId] = useState<string | null>(null);

  // Data states
  const [assignedStudents, setAssignedStudents] = useState<StudentSummary[]>([]);
  const [courseSuggestions, setCourseSuggestions] = useState<Feedback[]>([]);
  
  // Chat specific states
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Feedback[]>([]);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggestion specific states
  const [suggestStudentId, setSuggestStudentId] = useState('');
  const [suggestTitle, setSuggestTitle] = useState('');
  const [suggestPlatform, setSuggestPlatform] = useState('Coursera');
  const [suggestUrl, setSuggestUrl] = useState('');
  const [suggestCategory, setSuggestCategory] = useState<TaskCategory>('general');
  const [suggestComment, setSuggestComment] = useState('');
  const [submittingSuggestion, setSubmittingSuggestion] = useState(false);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  // Handle URL tab query param sync
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['students', 'messages', 'recommendations'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    router.replace(`/mentor/panel?tab=${tab}`);
  };

  // Scroll chat to bottom
  useEffect(() => {
    if (activeTab === 'messages') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setMentorId(user.id);

      // Fetch all data needed
      const [
        { data: studentsData },
        { data: progressList },
        { data: tasksList },
        { data: suggestionsData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'student').eq('mentor_id', user.id).order('full_name', { ascending: true }),
        supabase.from('progress').select('*'),
        supabase.from('tasks').select('*').eq('mentor_id', user.id),
        supabase.from('feedback').select('*, student:student_id(id, full_name, email)').eq('mentor_id', user.id).eq('type', 'suggestion').order('created_at', { ascending: false }),
      ]);

      // Map progress scores and tasks count to students
      const mappedStudents: StudentSummary[] = (studentsData || []).map((student) => {
        const prog = (progressList || []).find((p) => p.user_id === student.id);
        const studentTasksCount = (tasksList || []).filter((t) => t.student_id === student.id).length;
        return {
          profile: student as Profile,
          overallScore: prog?.overall_score ?? 0,
          tasksCount: studentTasksCount,
        };
      });

      setAssignedStudents(mappedStudents);
      setCourseSuggestions((suggestionsData as unknown as Feedback[]) || []);

      // Pre-select student for chat if none selected
      if (studentsData && studentsData.length > 0 && !selectedChatStudentId) {
        setSelectedChatStudentId(studentsData[0].id);
      }
    } catch (err) {
      console.error('Failed to load Mentor Panel data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Load chat messages when selectedChatStudentId changes
  async function loadChatMessages(studentId: string) {
    if (!studentId || !mentorId) return;
    try {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', studentId)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setChatMessages((data as Feedback[]) || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedChatStudentId && mentorId) {
      loadChatMessages(selectedChatStudentId);
    } else {
      setChatMessages([]);
    }
  }, [selectedChatStudentId, mentorId]);

  async function handleSendChatMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newChatMessage.trim() || sendingChat || !selectedChatStudentId || !mentorId) return;

    setSendingChat(true);

    try {
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          mentor_id: mentorId,
          student_id: selectedChatStudentId,
          message: newChatMessage.trim(),
          type: 'feedback',
          category: null,
        })
        .select()
        .single();

      if (error) throw error;

      setNewChatMessage('');
      if (data) {
        startTransition(() => {
          setChatMessages((prev) => [...prev, data as unknown as Feedback]);
        });
      }
    } catch (err: any) {
      window.alert(err.message || 'Failed to send message.');
    } finally {
      setSendingChat(false);
    }
  }

  async function handleSubmitSuggestion(e: React.FormEvent) {
    e.preventDefault();
    setSuggestionError(null);

    if (!suggestStudentId) {
      setSuggestionError('Please select a student.');
      return;
    }
    if (!suggestTitle.trim() || !suggestUrl.trim()) {
      setSuggestionError('Course title and resource URL are required.');
      return;
    }

    setSubmittingSuggestion(true);

    try {
      const res = await suggestCourseAction(
        suggestStudentId,
        suggestTitle,
        suggestPlatform,
        suggestUrl,
        suggestCategory,
        suggestComment
      );

      if (!res.success) {
        throw new Error(res.error || 'Failed to submit suggestion.');
      }

      setSuggestTitle('');
      setSuggestUrl('');
      setSuggestComment('');
      setSuggestCategory('general');

      if (res.data) {
        startTransition(() => {
          setCourseSuggestions((prev) => [res.data as unknown as Feedback, ...prev]);
        });
      }
      window.alert('Course suggestion sent successfully!');
    } catch (err: any) {
      setSuggestionError(err.message || 'Failed to submit suggestion.');
    } finally {
      setSubmittingSuggestion(false);
    }
  }

  async function handleDeleteSuggestion(id: string) {
    if (!confirm('Are you sure you want to delete this course suggestion?')) return;

    try {
      const { error } = await supabase.from('feedback').delete().eq('id', id);
      if (error) throw error;

      startTransition(() => {
        setCourseSuggestions((prev) => prev.filter((s) => s.id !== id));
      });
    } catch (err: any) {
      window.alert(err.message || 'Failed to delete suggestion.');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  const selectedChatStudentObj = assignedStudents.find(s => s.profile.id === selectedChatStudentId)?.profile;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Mentor Panel</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2" style={{ overflowX: 'auto' }}>
          <button
            onClick={() => handleTabChange('students')}
            className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Assigned Students
          </button>
          <button
            onClick={() => handleTabChange('messages')}
            className={`btn btn-sm ${activeTab === 'messages' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Student Communication
          </button>
          <button
            onClick={() => handleTabChange('recommendations')}
            className={`btn btn-sm ${activeTab === 'recommendations' ? 'btn-primary' : 'btn-ghost'}`}
          >
            Course Recommendations
          </button>
        </div>

        {/* Tab 1: Assigned Students */}
        {activeTab === 'students' && (
          <div className="card animate-fade-in">
            <h3 className="card-title mb-2">My Assigned Students</h3>
            <p className="card-subtitle mb-6">List of students currently assigned to you for mentorship guidance</p>

            {assignedStudents.length === 0 ? (
              <div className="empty-state" style={{ padding: 'var(--space-12) 0' }}>
                <div className="empty-state-title">No assigned students</div>
                <div className="empty-state-description">
                  Students will appear here once they are mapped to you by an administrator.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Department</th>
                      <th>Readiness Score</th>
                      <th>Skills Progress</th>
                      <th>Tasks</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignedStudents.map(({ profile: s, overallScore, tasksCount }) => (
                      <tr key={s.id}>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: '10px' }}>
                              {(s.full_name || s.email).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                {s.full_name || 'N/A'}
                              </div>
                              <div className="text-xs text-muted">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="text-sm font-semibold">{s.department || 'N/A'}</div>
                          <div className="text-xs text-muted">Class of {s.graduation_year || 'N/A'}</div>
                        </td>
                        <td>
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: overallScore >= 80 ? 'var(--color-success)' : overallScore >= 60 ? 'var(--color-info)' : overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)'
                            }}
                          >
                            {overallScore}%
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1 flex-wrap" style={{ maxWidth: '300px' }}>
                            {s.skills && s.skills.length > 0 ? (
                              s.skills.slice(0, 4).map(skill => (
                                <span key={skill} className="badge badge-muted" style={{ fontSize: '10px' }}>
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-muted italic">No skills listed</span>
                            )}
                            {s.skills && s.skills.length > 4 && (
                              <span className="badge badge-muted" style={{ fontSize: '10px' }}>
                                +{s.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className="text-sm font-semibold">{tasksCount} assigned</span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-1 justify-end flex-wrap" style={{ maxWidth: '350px' }}>
                            <Link href={`/mentor/students/${s.id}`} className="btn btn-secondary btn-xs" style={{ textDecoration: 'none' }}>
                              Profile
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedChatStudentId(s.id);
                                handleTabChange('messages');
                              }}
                              className="btn btn-ghost btn-xs"
                            >
                              Message
                            </button>
                            <Link href={`/mentor/feedback?studentId=${s.id}`} className="btn btn-ghost btn-xs" style={{ textDecoration: 'none' }}>
                              Feedback
                            </Link>
                            <button
                              onClick={() => {
                                setSuggestStudentId(s.id);
                                handleTabChange('recommendations');
                              }}
                              className="btn btn-ghost btn-xs"
                            >
                              Suggest Course
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Student Communication */}
        {activeTab === 'messages' && (
          <div className="animate-fade-in">
            {assignedStudents.length === 0 ? (
              <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
                <div className="empty-state-title">No assigned students to message</div>
                <div className="empty-state-description">
                  Once students are assigned to you by an admin, you can chat with them here.
                </div>
              </div>
            ) : (
              <div
                className="grid-2"
                style={{
                  gridTemplateColumns: '300px 1fr',
                  gap: 'var(--space-6)',
                  alignItems: 'stretch',
                  height: 'calc(100vh - 280px)',
                }}
              >
                {/* Left side list */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                  <div style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border-subtle)' }}>
                    <h3 className="font-semibold text-secondary text-sm">Select Student</h3>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {assignedStudents.map(({ profile: s }) => {
                      const isSelected = s.id === selectedChatStudentId;
                      const initials = (s.full_name || s.email)
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2);

                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedChatStudentId(s.id)}
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

                {/* Chat window */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>
                  {selectedChatStudentObj && (
                    <div
                      style={{
                        padding: 'var(--space-3) var(--space-4)',
                        borderBottom: '1px solid var(--color-border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="sidebar-user-avatar" style={{ width: 36, height: 36, fontSize: 'var(--font-size-xs)' }}>
                          {(selectedChatStudentObj.full_name || selectedChatStudentObj.email)
                            .split(' ')
                            .map(n => n[0])
                            .join('')
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-primary text-sm" style={{ margin: 0 }}>
                            {selectedChatStudentObj.full_name || 'N/A'}
                          </h3>
                          <p className="text-xs text-muted" style={{ margin: 0 }}>
                            {selectedChatStudentObj.department ? `${selectedChatStudentObj.department} | ` : ''}Class of {selectedChatStudentObj.graduation_year || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <Link href={`/mentor/students/${selectedChatStudentObj.id}`} className="btn btn-ghost btn-sm">
                        View Profile
                      </Link>
                    </div>
                  )}

                  {/* Messages list */}
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
                    {chatMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center text-muted text-xs">
                        <span>No message history with this student.</span>
                        <span>Send a message to start the conversation!</span>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isFromStudent = msg.type === 'student' || msg.message.startsWith('Reply:');
                        
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

                  {/* Chat message input */}
                  <form
                    onSubmit={handleSendChatMessage}
                    style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--color-border-subtle)' }}
                    className="flex gap-2"
                  >
                    <input
                      type="text"
                      className="input"
                      placeholder={`Send a reply to ${selectedChatStudentObj?.full_name || 'student'}...`}
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      disabled={sendingChat || !selectedChatStudentId}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!newChatMessage.trim() || sendingChat || !selectedChatStudentId}
                    >
                      {sendingChat ? 'Sending...' : 'Send'}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Course Recommendations */}
        {activeTab === 'recommendations' && (
          <div className="grid-2 animate-fade-in" style={{ gridTemplateColumns: '380px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Form */}
            <div className="card">
              <h2 className="card-title mb-4">Suggest Course / Resource</h2>
              <form onSubmit={handleSubmitSuggestion} className="flex flex-col gap-4">
                {suggestionError && <div className="alert alert-error text-xs">{suggestionError}</div>}

                <div className="form-group">
                  <label className="form-label" htmlFor="student-select-suggest">
                    Select Mentee Student
                  </label>
                  <select
                    id="student-select-suggest"
                    className="input"
                    value={suggestStudentId}
                    onChange={(e) => setSuggestStudentId(e.target.value)}
                    style={{ cursor: 'pointer' }}
                  >
                    <option value="">-- Choose Mentee --</option>
                    {assignedStudents.map(({ profile: s }) => (
                      <option key={s.id} value={s.id}>
                        {s.full_name || s.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="suggest-title">
                    Course / Resource Title
                  </label>
                  <input
                    id="suggest-title"
                    type="text"
                    className="input"
                    placeholder="e.g. Master the Coding Interview"
                    value={suggestTitle}
                    onChange={(e) => setSuggestTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="suggest-platform">
                    Platform
                  </label>
                  <select
                    id="suggest-platform"
                    className="input"
                    value={suggestPlatform}
                    onChange={(e) => setSuggestPlatform(e.target.value)}
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

                <div className="form-group">
                  <label className="form-label" htmlFor="suggest-url">
                    Resource Link (URL)
                  </label>
                  <input
                    id="suggest-url"
                    type="url"
                    className="input"
                    placeholder="https://..."
                    value={suggestUrl}
                    onChange={(e) => setSuggestUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="suggest-category">
                    Focus Category
                  </label>
                  <select
                    id="suggest-category"
                    className="input"
                    value={suggestCategory}
                    onChange={(e) => setSuggestCategory(e.target.value as TaskCategory)}
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
                  <label className="form-label" htmlFor="suggest-comment">
                    Notes / Why suggest this?
                  </label>
                  <textarea
                    id="suggest-comment"
                    className="input"
                    rows={4}
                    placeholder="Optional notes or instructions for the student..."
                    value={suggestComment}
                    onChange={(e) => setSuggestComment(e.target.value)}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submittingSuggestion}
                  style={{ justifyContent: 'center', marginTop: 'var(--space-2)' }}
                >
                  {submittingSuggestion ? 'Submitting...' : 'Suggest Course'}
                </button>
              </form>
            </div>

            {/* List */}
            <div className="card">
              <h2 className="card-title mb-4">Course Suggestions History</h2>

              {courseSuggestions.length === 0 ? (
                <div className="empty-state" style={{ padding: 'var(--space-12) 0' }}>
                  <div className="empty-state-title">No course suggestions sent yet</div>
                  <div className="empty-state-description">
                    Suggest resources to your students using the form on the left.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {courseSuggestions.map((s) => {
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
                            <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{s.category || 'General'}</span>
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
                          onClick={() => handleDeleteSuggestion(s.id)}
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
        )}

      </div>
    </div>
  );
}
