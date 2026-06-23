'use client';

import { useState, useEffect } from 'react';
import { CompanyEntry, companies } from '@/lib/mock-interviews';
import { MockInterviewSession } from '@/lib/types';
import { getMockInterviewHistoryAction } from '@/app/actions/mock-interview';
import Link from 'next/link';

export default function MockInterviewsOverviewClient() {
  const [history, setHistory] = useState<MockInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [domainFilter, setDomainFilter] = useState('all');

  // Track expanded history item IDs
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  async function loadHistory() {
    try {
      const res = await getMockInterviewHistoryAction();
      if (res.success && res.data) {
        setHistory(res.data as unknown as MockInterviewSession[]);
      }
    } catch (err) {
      console.error('Failed to load interview history:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter companies
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.domain.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = difficultyFilter === 'all' || c.difficulty === difficultyFilter;
    const matchesDomain = domainFilter === 'all' || c.domain === domainFilter;
    return matchesSearch && matchesDiff && matchesDomain;
  });

  const domains = Array.from(new Set(companies.map((c) => c.domain)));

  // Calculate statistics
  const totalCompleted = history.filter(h => h.completed).length;
  const avgScore = history.length > 0 
    ? Math.round(history.reduce((sum, h) => sum + h.score, 0) / history.length) 
    : 0;

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
          <h1 className="page-header-title">Mock Interview Hub</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Statistics Dashboard */}
        <div className="grid-2 mb-6" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
          <div className="stat-card">
            <span className="stat-label">Rounds Completed</span>
            <span className="stat-value">{totalCompleted}</span>
            <span className="stat-change">Total practice rounds logged</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Average Accuracy Score</span>
            <span className="stat-value" style={{ color: avgScore >= 70 ? 'var(--color-success)' : avgScore >= 50 ? 'var(--color-warning)' : 'var(--color-error)' }}>
              {avgScore}%
            </span>
            <span className="stat-change">Overall evaluation score</span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="card mb-6 flex gap-4 items-center flex-wrap">
          {/* Search bar */}
          <div className="form-group" style={{ flex: 2, minWidth: 240, margin: 0 }}>
            <input
              type="text"
              className="input"
              placeholder="Search by company name or domain..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Difficulty Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 140, margin: 0 }}>
            <select
              className="input"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Domain Filter */}
          <div className="form-group" style={{ flex: 1, minWidth: 140, margin: 0 }}>
            <select
              className="input"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
              style={{ cursor: 'pointer' }}
            >
              <option value="all">All Domains</option>
              {domains.map((dom) => (
                <option key={dom} value={dom}>
                  {dom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company Grid */}
        {filteredCompanies.length === 0 ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <div className="empty-state-title">No companies found</div>
            <div className="empty-state-description">Try adjusting your filters or search query.</div>
          </div>
        ) : (
          <div className="grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
            {filteredCompanies.map((c) => {
              // Check if any rounds completed for this company
              const companyHistory = history.filter(h => h.company === c.name);
              const isAnyCompleted = companyHistory.length > 0;
              const companyAvgScore = isAnyCompleted
                ? Math.round(companyHistory.reduce((sum, h) => sum + h.score, 0) / companyHistory.length)
                : 0;

              const difficultyColor =
                c.difficulty === 'Hard'
                  ? 'var(--color-error)'
                  : c.difficulty === 'Medium'
                  ? 'var(--color-warning)'
                  : 'var(--color-success)';

              return (
                <div key={c.name} className="card flex flex-col justify-between" style={{ height: '100%' }}>
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-md font-bold text-primary">{c.name}</h3>
                      <span className="text-xs font-semibold" style={{ color: difficultyColor }}>
                        {c.difficulty}
                      </span>
                    </div>
                    <div className="text-xs text-muted mb-4">{c.domain}</div>
                    
                    <div className="mb-4">
                      <div className="text-xs text-muted mb-2">Rounds Available:</div>
                      <div className="flex gap-1 flex-wrap">
                        {c.categories.map((cat) => (
                          <span key={cat} className="badge badge-muted" style={{ fontSize: '9px' }}>
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: 'var(--space-3)', marginTop: 'var(--space-4)' }} className="flex items-center justify-between">
                    <div>
                      {isAnyCompleted ? (
                        <div className="text-xs text-secondary">
                          Avg: <strong className="text-primary">{companyAvgScore}%</strong>
                        </div>
                      ) : (
                        <span className="text-xs text-muted italic">Not started</span>
                      )}
                    </div>
                    <Link href={`/student/mock-interview/${encodeURIComponent(c.name)}`} className="btn btn-primary btn-sm">
                      Start Prep
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Mock Interview History Log */}
        <div className="card mt-6">
          <h2 className="card-title mb-4">Interview Practice History</h2>
          {history.length === 0 ? (
            <div className="empty-state" style={{ padding: 'var(--space-6) 0' }}>
              <div className="empty-state-title">No attempts recorded</div>
              <div className="empty-state-description">Your mock interview practice logs will be shown here.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {history.map((item) => {
                const hasEval = !!item.evaluation_level;
                const isExpanded = !!expandedIds[item.id];
                const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <div
                    key={item.id}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                    }}
                  >
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>{item.company}</span>
                          <span className="badge badge-muted" style={{ fontSize: '10px' }}>{item.category}</span>
                        </div>
                        <div className="text-sm text-secondary mt-1">
                          {item.question_text || 'General Round Practice'}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-brand)' }}>{item.score}%</div>
                          <div className="text-xs text-muted" style={{ fontSize: '10px' }}>
                            {hasEval ? item.evaluation_level : 'Evaluation unavailable'}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="btn btn-ghost btn-sm"
                          style={{ minWidth: '80px' }}
                        >
                          {isExpanded ? 'Hide Details' : 'Details'}
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div
                        className="animate-fade-in mt-4 pt-4"
                        style={{
                          borderTop: '1px solid var(--color-border-subtle)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 'var(--space-3)',
                        }}
                      >
                        {hasEval ? (
                          <>
                            {/* Strengths */}
                            {item.strengths && item.strengths.length > 0 && (
                              <div>
                                <div className="text-xs font-bold text-success mb-1">✓ Strengths</div>
                                <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, listStyleType: 'disc' }}>
                                  {item.strengths.map((str: string, i: number) => (
                                    <li key={i} className="text-xs text-secondary">{str}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Weaknesses */}
                            {item.weaknesses && item.weaknesses.length > 0 && (
                              <div>
                                <div className="text-xs font-bold text-warning mb-1">⚠ Areas to Improve</div>
                                <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, listStyleType: 'disc' }}>
                                  {item.weaknesses.map((weak: string, i: number) => (
                                    <li key={i} className="text-xs text-secondary">{weak}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Tips */}
                            {item.improvement_tips && item.improvement_tips.length > 0 && (
                              <div>
                                <div className="text-xs font-bold text-primary mb-1">💡 Tips for Improvement</div>
                                <ul style={{ paddingLeft: 'var(--space-4)', margin: 0, listStyleType: 'disc' }}>
                                  {item.improvement_tips.map((tip: string, i: number) => (
                                    <li key={i} className="text-xs text-secondary">{tip}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Feedback */}
                            {item.interviewer_feedback && (
                              <div>
                                <div className="text-xs font-bold text-primary mb-1">Interviewer Feedback</div>
                                <p className="text-xs text-secondary" style={{ fontStyle: 'italic', margin: 0, lineHeight: 1.4 }}>
                                  &quot;{item.interviewer_feedback}&quot;
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-xs text-muted italic">
                            No detailed evaluation review is available for this session. Complete a practice round using the new evaluation engine to view breakdown statistics.
                          </div>
                        )}
                        
                        <div className="text-xs text-muted" style={{ fontSize: '9px', alignSelf: 'flex-end', marginTop: 'var(--space-2)' }}>
                          Attempted on {formattedDate}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
