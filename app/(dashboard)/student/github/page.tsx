'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import ScoreRing from '@/components/ScoreRing';
import { GitHubData, GitHubRepo } from '@/lib/types';
import { formatDate } from '@/lib/score';
import { safeApiCall } from '@/lib/api-helper';

export default function GitHubPage() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [fetchingData, setFetchingData] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function loadGitHubData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('github_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (data) {
          setGithubData(data as GitHubData);
          setUsername(data.username);
        }
      } catch (err) {
        console.error('Failed to load GitHub data:', err);
      } finally {
        setFetchingData(false);
      }
    }

    loadGitHubData();
  }, []);

  const handleSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await safeApiCall('/api/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      });

      if (!response.success) {
        throw new Error(response.error || 'Failed to sync GitHub profile');
      }

      // Re-fetch to get database record format
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: dbData } = await supabase
          .from('github_data')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (dbData) {
          setGithubData(dbData as GitHubData);
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
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
          <h1 className="page-header-title">GitHub Portfolio Tracking</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Sync Form */}
        <div className="card mb-6">
          <form onSubmit={handleSync} className="flex items-end gap-4 flex-wrap">
            <div className="form-group" style={{ flex: 1, minWidth: 260 }}>
              <label className="form-label" htmlFor="github-username">
                GitHub Username
              </label>
              <input
                id="github-username"
                type="text"
                className="input"
                placeholder="e.g., torvalds"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !username.trim()}
              style={{ height: '38px' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" style={{ marginRight: 8, border: '2px solid white', borderTopColor: 'transparent' }} />
                  Syncing...
                </>
              ) : (
                'Sync Profile'
              )}
            </button>
          </form>
          {error && (
            <div className="mt-2 flex items-center gap-2">
              <p className="form-error" style={{ margin: 0 }}>{error}</p>
              <button
                type="button"
                className="btn btn-secondary btn-xs"
                onClick={() => handleSync()}
                style={{ padding: '2px 8px', fontSize: '10px', height: '24px' }}
              >
                Retry
              </button>
            </div>
          )}
          {githubData && (
            <p className="text-xs text-muted mt-2">
              Last synchronized on: {formatDate(githubData.last_fetched)}
            </p>
          )}
        </div>

        {!githubData ? (
          <div className="card empty-state" style={{ padding: 'var(--space-12) 0' }}>
            <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8.25 12h7.5m-7.5 3h7.5M8.25 9h7.5M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="empty-state-title">Link your GitHub Account</div>
            <div className="empty-state-description" style={{ maxWidth: 420 }}>
              Enter your GitHub username above to sync your public repositories, languages, and calculate your GitHub portfolio readiness score.
            </div>
          </div>
        ) : (
          <div className="grid-2" style={{ gridTemplateColumns: '320px 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
            {/* Left Column: Profile Summary & Score */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              <div className="card flex items-center justify-center flex-col text-center">
                <ScoreRing score={githubData.github_score} size={150} label="GitHub Readiness Score" />
                
                <div className="card-divider" style={{ width: '100%' }} />

                <div className="flex items-center gap-3 text-left w-100" style={{ width: '100%' }}>
                  <div className="sidebar-user-avatar" style={{ width: 44, height: 44, fontSize: 'var(--font-size-md)' }}>
                    {githubData.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-primary">{githubData.username}</h3>
                    <p className="text-xs text-muted">GitHub Developer</p>
                  </div>
                </div>

                {githubData.bio && (
                  <p className="text-xs text-secondary mt-3 text-left w-100" style={{ width: '100%', fontStyle: 'italic', lineHeight: 1.5 }}>
                    &ldquo;{githubData.bio}&rdquo;
                  </p>
                )}

                <div className="flex justify-between w-100 mt-4" style={{ width: '100%' }}>
                  <div>
                    <div className="text-sm font-bold text-primary">{githubData.followers}</div>
                    <div className="text-xs text-muted">Followers</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">{githubData.following}</div>
                    <div className="text-xs text-muted">Following</div>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">{githubData.repo_count}</div>
                    <div className="text-xs text-muted">Repositories</div>
                  </div>
                </div>
              </div>

              {/* Language Breakdown */}
              <div className="card">
                <h3 className="card-title mb-4">Top Languages</h3>
                {Object.keys(githubData.top_languages).length === 0 ? (
                  <p className="text-xs text-muted">No language data found.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {Object.entries(githubData.top_languages)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([lang, count]) => (
                        <div key={lang}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-secondary">{lang}</span>
                            <span className="text-muted">{count} repos</span>
                          </div>
                          <div className="progress-bar-track" style={{ height: 4 }}>
                            <div className="progress-bar-fill brand" style={{ width: `${Math.min((count / githubData.repo_count) * 100, 100)}%` }} />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Repo List & Detailed Metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
              {/* Detailed Metrics */}
              <div className="card">
                <h3 className="card-title mb-4">Portfolio Analysis</h3>
                <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                    }}
                  >
                    <div className="text-xs text-muted mb-1">Profile Completeness</div>
                    <div className="text-md font-bold text-primary">
                      {githubData.profile_complete ? 'Complete' : 'Incomplete'}
                    </div>
                  </div>
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border-subtle)',
                      backgroundColor: 'var(--color-bg-tertiary)',
                    }}
                  >
                    <div className="text-xs text-muted mb-1">Recent Commits (30 Days)</div>
                    <div className="text-md font-bold text-primary">
                      {githubData.recent_activity_count}
                    </div>
                  </div>
                </div>
              </div>

              {/* Repositories */}
              <div className="card">
                <h3 className="card-title mb-4">Top Repositories</h3>
                <div className="flex flex-col gap-4">
                  {(githubData.public_repos as any[]).map((repo: GitHubRepo) => (
                    <div
                      key={repo.name}
                      style={{
                        padding: 'var(--space-4)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border-subtle)',
                        backgroundColor: 'var(--color-bg-tertiary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--space-2)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-brand hover:underline"
                        >
                          {repo.name}
                        </a>
                        {repo.language && (
                          <span className="badge badge-brand">{repo.language}</span>
                        )}
                      </div>
                      
                      {repo.description && (
                        <p className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
                          {repo.description}
                        </p>
                      )}

                      <div className="flex gap-4 items-center mt-1">
                        <span className="text-xs text-muted flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" style={{ display: 'inline' }}>
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {repo.stars}
                        </span>
                        <span className="text-xs text-muted flex items-center gap-1">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          {repo.forks}
                        </span>
                        <span className="text-xs text-muted" style={{ marginLeft: 'auto' }}>
                          Updated {formatDate(repo.updated_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
