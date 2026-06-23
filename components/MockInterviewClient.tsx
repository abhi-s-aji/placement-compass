'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Profile, MockInterviewSession } from '@/lib/types';
import { getCompanyEntry, getQuestionsForCompanyAndCategory, CompanyEntry, InterviewQuestion } from '@/lib/mock-interviews';
import { saveMockInterviewSessionAction } from '@/app/actions/mock-interview';
import { evaluateAnswer, EvaluationResult } from '@/lib/interview-evaluator';
import Link from 'next/link';

interface MockInterviewClientProps {
  companyName: string;
}

export default function MockInterviewClient({ companyName }: MockInterviewClientProps) {
  const [company, setCompany] = useState<CompanyEntry | null>(null);
  const [sessions, setSessions] = useState<MockInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Selected category round
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});

  // Evaluation states
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [confidence, setConfidence] = useState<'low' | 'medium' | 'high' | null>(null);

  const [saving, setSaving] = useState(false);
  const [completedRound, setCompletedRound] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const [isPending, startTransition] = useTransition();
  const supabase = createClient();

  async function loadData() {
    try {
      const entry = getCompanyEntry(companyName);
      if (entry) {
        setCompany(entry);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: sessionsData } = await supabase
        .from('mock_interview_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('company', companyName);

      setSessions((sessionsData as MockInterviewSession[]) || []);
    } catch (err) {
      console.error('Failed to load mock interview round data:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [companyName]);

  function startRound(category: string) {
    const qList = getQuestionsForCompanyAndCategory(companyName, category);
    setQuestions(qList);
    setActiveCategory(category);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setRevealedHints({});
    setEvaluation(null);
    setConfidence(null);
    setCompletedRound(false);
    setCalculatedScore(0);
  }

  function toggleHint(questionId: string) {
    setRevealedHints(prev => ({ ...prev, [questionId]: !prev[questionId] }));
  }

  function handleEvaluate() {
    const currentQ = questions[currentQuestionIndex];
    const studentAnswer = answers[currentQ.id] || '';
    
    if (!studentAnswer.trim()) {
      window.alert('Please write an answer before requesting an evaluation.');
      return;
    }

    const result = evaluateAnswer(studentAnswer, currentQ);
    setEvaluation(result);
  }

  async function handleSaveResult() {
    if (!evaluation) return;
    setSaving(true);

    try {
      await saveMockInterviewSessionAction({
        company: companyName,
        category: activeCategory!,
        completedQuestions: currentQuestionIndex + 1,
        totalQuestions: questions.length,
        score: evaluation.score,
        completed: currentQuestionIndex === questions.length - 1,
        question_text: questions[currentQuestionIndex].question,
        answer_text: answers[questions[currentQuestionIndex].id] || '',
        evaluation_score: evaluation.score,
        evaluation_level: evaluation.level,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
        improvement_tips: evaluation.improvementTips,
        interviewer_feedback: evaluation.feedback,
      });

      // Advance question or complete round
      if (currentQuestionIndex < questions.length - 1) {
        setEvaluation(null);
        setConfidence(null);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCalculatedScore(evaluation.score);
        setCompletedRound(true);
        await loadData();
      }
    } catch (err) {
      console.error('Failed to save interview session:', err);
      window.alert('Failed to save results.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="card empty-state">
        <div className="empty-state-title">Company Not Found</div>
        <div className="empty-state-description">The requested company could not be located in our interview database.</div>
        <Link href="/student/mock-interview" className="btn btn-primary mt-4">Back to Dashboard</Link>
      </div>
    );
  }

  // Active Q&A Interface
  if (activeCategory && questions.length > 0) {
    const currentQ = questions[currentQuestionIndex];
    
    // Model guidance based on category
    let sampleGuide = 'Think about time & space complexity, edge cases, and optimal data structure choices.';
    if (currentQ.category === 'System Design') {
      sampleGuide = 'Key points to address: High-level architecture, database schema, scaling/caching, APIs, and load balancing.';
    } else if (currentQ.category === 'HR') {
      sampleGuide = 'Use the STAR method (Situation, Task, Action, Result) to structure your response.';
    }

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div className="page-header-left">
            <button onClick={() => setActiveCategory(null)} className="btn btn-ghost btn-sm mb-2" style={{ paddingLeft: 0 }}>
              &larr; Exit Round
            </button>
            <h1 className="page-header-title">{companyName} &bull; {activeCategory} Round</h1>
          </div>
        </div>

        <div className="page-body">
          {completedRound ? (
            <div className="card text-center" style={{ maxWidth: '600px', margin: '0 auto', padding: 'var(--space-8)' }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-brand-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--space-4)',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: 'var(--color-brand)',
                }}
              >
                {calculatedScore}%
              </div>
              <h2 className="text-lg font-bold text-primary mb-2">Round Completed!</h2>
              <p className="text-sm text-secondary mb-6">
                You have successfully completed this mock interview round and your progress has been updated in your profile dashboard.
              </p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => startRound(activeCategory)} className="btn btn-primary">
                  Retake Round
                </button>
                <button onClick={() => setActiveCategory(null)} className="btn btn-secondary">
                  Round Selection
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div className="flex justify-between items-center mb-6 pb-2" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                <span className="text-xs font-semibold text-secondary">
                  QUESTION {currentQuestionIndex + 1} OF {questions.length}
                </span>
                <span className={`badge ${
                  currentQ.difficulty === 'Hard' ? 'badge-danger' : currentQ.difficulty === 'Medium' ? 'badge-warning' : 'badge-success'
                }`}>
                  {currentQ.difficulty}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-md font-semibold text-primary mb-4" style={{ lineHeight: 1.5 }}>
                  {currentQ.question}
                </h3>

                <div className="form-group mb-4">
                  <label className="form-label" htmlFor="code-answer">
                    Your Solution Draft / Answer Notes
                  </label>
                  <textarea
                    id="code-answer"
                    className="input"
                    rows={8}
                    placeholder="Write your draft, notes, pseudocode, or full response here..."
                    value={answers[currentQ.id] || ''}
                    disabled={evaluation !== null}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQ.id]: e.target.value }))}
                    style={{ fontFamily: activeCategory !== 'HR' ? 'monospace' : 'inherit', fontSize: '13px', resize: 'vertical' }}
                  />
                </div>

                {/* Show Hint/Guide button */}
                <div className="mb-6">
                  <button
                    type="button"
                    onClick={() => toggleHint(currentQ.id)}
                    className="btn btn-secondary btn-sm"
                  >
                    {revealedHints[currentQ.id] ? 'Hide Interviewer Guide' : 'Reveal Interviewer Guide'}
                  </button>
                  {revealedHints[currentQ.id] && (
                    <div
                      className="animate-fade-in mt-3"
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        borderLeft: '3px solid var(--color-brand)',
                      }}
                    >
                      <h4 className="text-xs font-bold text-secondary mb-1">Interviewer Evaluation Tips:</h4>
                      <p className="text-xs text-muted" style={{ margin: 0, lineHeight: 1.5 }}>
                        {sampleGuide}
                      </p>
                    </div>
                  )}
                </div>

                {/* Evaluation Card or Evaluation Button */}
                {evaluation ? (
                  <div
                    className="animate-fade-in mb-6"
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <div className="flex justify-between items-center mb-4 pb-2" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
                      <div>
                        <h4 className="text-sm font-bold text-primary">Interviewer Review</h4>
                        <p className="text-xs text-muted" style={{ margin: 0 }}>Evaluation Level: <strong>{evaluation.level}</strong></p>
                      </div>
                      <div
                        className="badge"
                        style={{
                          backgroundColor:
                            evaluation.score >= 75
                              ? 'rgba(34, 197, 94, 0.1)'
                              : evaluation.score >= 50
                              ? 'rgba(245, 158, 11, 0.1)'
                              : 'rgba(239, 68, 68, 0.1)',
                          color:
                            evaluation.score >= 75
                              ? 'var(--color-success)'
                              : evaluation.score >= 50
                              ? 'var(--color-warning)'
                              : 'var(--color-error)',
                          fontWeight: 'bold',
                          fontSize: 'var(--font-size-sm)',
                          padding: '6px 12px',
                        }}
                      >
                        {evaluation.score}%
                      </div>
                    </div>

                    {/* Strengths */}
                    <div className="mb-4">
                      <div className="text-xs font-bold text-success mb-2">✓ Strengths</div>
                      <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, listStyleType: 'disc' }}>
                        {evaluation.strengths.map((str, i) => (
                          <li key={i} className="text-xs text-secondary mb-1">{str}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses */}
                    {evaluation.weaknesses.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-bold text-warning mb-2">⚠ Needs Improvement</div>
                        <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, listStyleType: 'disc' }}>
                          {evaluation.weaknesses.map((weak, i) => (
                            <li key={i} className="text-xs text-secondary mb-1">{weak}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Tips */}
                    {evaluation.improvementTips.length > 0 && (
                      <div className="mb-4">
                        <div className="text-xs font-bold text-primary mb-2">💡 Tips for Improvement</div>
                        <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, listStyleType: 'disc' }}>
                          {evaluation.improvementTips.map((tip, i) => (
                            <li key={i} className="text-xs text-secondary mb-1">{tip}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Feedback */}
                    <div className="mb-4">
                      <div className="text-xs font-bold text-primary mb-1">Interviewer Feedback</div>
                      <p className="text-xs text-secondary" style={{ fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>
                        &quot;{evaluation.feedback}&quot;
                      </p>
                    </div>

                    {/* Optional Confidence Check */}
                    <div
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--color-bg-secondary)',
                        border: '1px solid var(--color-border-subtle)',
                      }}
                      className="mt-4"
                    >
                      <span className="text-xs font-semibold text-primary block mb-2">How confident were you with this answer?</span>
                      <div className="flex gap-2">
                        {(['low', 'medium', 'high'] as const).map(conf => (
                          <button
                            key={conf}
                            type="button"
                            onClick={() => setConfidence(conf)}
                            className={`btn btn-xs ${confidence === conf ? 'btn-primary' : 'btn-secondary'}`}
                            style={{ textTransform: 'capitalize' }}
                          >
                            {conf}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleEvaluate}
                      className="btn btn-primary"
                    >
                      Evaluate Answer
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0 || evaluation !== null}
                  onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                {evaluation ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={handleSaveResult}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving...' : currentQuestionIndex < questions.length - 1 ? 'Save & Next' : 'Save & Submit'}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={true}
                    className="btn btn-ghost"
                    style={{ opacity: 0.5 }}
                  >
                    Next Question
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Company Overview & Round Selection
  const difficultyColor =
    company.difficulty === 'Hard'
      ? 'var(--color-error)'
      : company.difficulty === 'Medium'
      ? 'var(--color-warning)'
      : 'var(--color-success)';

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <Link href="/student/mock-interview" className="btn btn-ghost btn-sm mb-2" style={{ paddingLeft: 0 }}>
            &larr; Back to Companies
          </Link>
          <h1 className="page-header-title">{companyName}</h1>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2" style={{ gridTemplateColumns: '1.2fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Left Column: Rounds Selection */}
          <div className="card">
            <h2 className="card-title mb-4">Select Interview Round</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {company.categories.map((category) => {
                const completedSession = sessions.find(s => s.category === category);
                return (
                  <div
                    key={category}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 'var(--space-3)',
                    }}
                  >
                    <div>
                      <div className="text-sm font-semibold text-primary">{category} Preparation</div>
                      {completedSession ? (
                        <div className="text-xs text-secondary mt-1 flex gap-2">
                          <span>Latest Score: <strong>{completedSession.score}%</strong></span>
                          <span>&bull;</span>
                          <span>Completed: <strong>Yes</strong></span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted mt-1">Not started yet</div>
                      )}
                    </div>
                    <button
                      onClick={() => startRound(category)}
                      className={`btn btn-sm ${completedSession ? 'btn-secondary' : 'btn-primary'}`}
                    >
                      {completedSession ? 'Retake Round' : 'Start Round'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Company Info & Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <div className="card">
              <h3 className="card-title mb-2">Company Overview</h3>
              <div className="text-xs text-muted mb-4">
                Domain: <strong className="text-secondary">{company.domain}</strong> &bull; Difficulty:{' '}
                <strong style={{ color: difficultyColor }}>{company.difficulty}</strong>
              </div>
              <p className="text-sm text-secondary" style={{ lineHeight: 1.5, margin: 0 }}>
                This round includes representative interview questions frequently asked by recruiters at {companyName}. Check out the preparation tips below.
              </p>
            </div>

            <div className="card">
              <h3 className="card-title mb-3">Preparation Tips</h3>
              <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {company.tips.map((tip, i) => (
                  <li key={i} className="text-sm text-secondary" style={{ lineHeight: 1.5 }}>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
