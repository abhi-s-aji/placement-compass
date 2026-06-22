'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AIReport } from '@/lib/types';
import { formatDate } from '@/lib/score';

export default function AIAnalysisPage() {
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<AIReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function loadReports() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        setReports(data as AIReport[]);
        setSelectedReport(data[0] as AIReport);
      }
    } catch (err: any) {
      console.error('Error fetching AI reports:', err);
      setError('Failed to load reports history.');
    } finally {
      setInitialLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function generateAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai-analysis', {
        method: 'POST',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate readiness report');
      }

      // Prepend the new report and select it
      setReports((prev) => [data, ...prev]);
      setSelectedReport(data);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setError(err.message || 'An error occurred during report generation. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
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
          <h1 className="page-header-title">Placement Readiness Analytics</h1>
        </div>
        <div>
          <button
            onClick={generateAnalysis}
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner spinner-sm" style={{ marginRight: 8, border: '2px solid white', borderTopColor: 'transparent' }} />
                Analyzing Profile...
              </>
            ) : (
              'Analyze My Readiness'
            )}
          </button>
        </div>
      </div>

      <div className="page-body">
        {error && (
          <div className="alert alert-error mb-6">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-16) 0' }}>
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21m0 0l-.813-5.096m.813 5.096a9 9 0 110-18 9 9 0 010 18z" />
            </svg>
            <div className="empty-state-title">No Readiness Reports generated yet</div>
            <div className="empty-state-description" style={{ maxWidth: 440 }}>
              Click &ldquo;Analyze My Readiness&rdquo; to generate a comprehensive placement preparation report containing your top strengths, improvements, and a custom 30-day action plan.
            </div>
          </div>
        ) : (
          <div className="grid-2" style={{ gridTemplateColumns: '260px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Sidebar with previous reports */}
            <div className="card" style={{ padding: 'var(--space-4)' }}>
              <h3 className="text-xs font-semibold text-secondary uppercase tracking-wider mb-3">Analysis History</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {reports.map((report) => {
                  const isSelected = selectedReport?.id === report.id;
                  return (
                    <button
                      key={report.id}
                      onClick={() => setSelectedReport(report)}
                      className={`btn btn-sm ${isSelected ? 'btn-secondary' : 'btn-ghost'}`}
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        backgroundColor: isSelected ? 'var(--color-bg-tertiary)' : 'transparent',
                        borderColor: isSelected ? 'var(--color-border)' : 'transparent',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {formatDate(report.created_at)}
                        </span>
                        <span className="text-xs text-muted">
                          Score: {report.readiness_percentage}%
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Report View */}
            {selectedReport && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
                {/* Header Stats */}
                <div className="card flex items-center justify-between gap-6 flex-wrap">
                  <div>
                    <h2 className="text-lg font-bold text-primary">Report of {formatDate(selectedReport.created_at)}</h2>
                    <p className="text-xs text-muted mt-1">Generated by Placement Compass</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div className="text-xs text-muted">Placement Probability</div>
                      <div
                        className="text-2xl font-bold"
                        style={{
                          color:
                            (selectedReport.readiness_percentage ?? 0) >= 80
                              ? 'var(--color-success)'
                              : (selectedReport.readiness_percentage ?? 0) >= 50
                              ? 'var(--color-warning)'
                              : 'var(--color-error)',
                        }}
                      >
                        {selectedReport.readiness_percentage}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid: Strengths and Weaknesses */}
                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                  {/* Strengths */}
                  <div className="card">
                    <h3 className="text-sm font-semibold text-success mb-3 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Key Strengths
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {selectedReport.strengths.map((str, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-secondary"
                          style={{
                            padding: 'var(--space-2)',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            lineHeight: 1.5,
                          }}
                        >
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weaknesses */}
                  <div className="card">
                    <h3 className="text-sm font-semibold text-error mb-3 flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Areas to Improve
                    </h3>
                    <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                      {selectedReport.weaknesses.map((weak, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-secondary"
                          style={{
                            padding: 'var(--space-2)',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            borderRadius: 'var(--radius-md)',
                            lineHeight: 1.5,
                          }}
                        >
                          {weak}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-brand mb-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                    Actionable Recommendations
                  </h3>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                    {selectedReport.recommendations.map((rec, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-secondary"
                        style={{
                          padding: 'var(--space-2) var(--space-3)',
                          borderLeft: '3px solid var(--color-brand)',
                          backgroundColor: 'var(--color-brand-subtle)',
                          borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                          lineHeight: 1.5,
                        }}
                      >
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 30-Day Plan */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    30-Day Preparation Roadmap
                  </h3>
                  <div
                    className="text-sm text-secondary"
                    style={{
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.7,
                      backgroundColor: 'var(--color-bg-tertiary)',
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                    }}
                  >
                    {selectedReport.thirty_day_plan}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
