'use client';

import { useState, useTransition } from 'react';
import { RESOURCES_DATA, Resource } from '@/lib/resources-data';
import { toggleCompletedResourceAction } from '@/app/actions/student';
import ProgressBar from './ProgressBar';

interface ResourcesClientProps {
  initialCompletedIds: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'dsa': 'DSA & Competitive Programming',
  'web-dev': 'Web Development',
  'backend': 'Backend',
  'system-design': 'System Design',
  'dev-tools': 'Dev Tools',
};

export default function ResourcesClient({ initialCompletedIds }: ResourcesClientProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedIds);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [isPending, startTransition] = useTransition();

  // Handle completion toggle
  function handleToggleComplete(resourceId: string) {
    // Optimistic Update
    setCompletedIds(prev =>
      prev.includes(resourceId) ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
    );

    startTransition(async () => {
      const res = await toggleCompletedResourceAction(resourceId);
      if (!res.success) {
        // Rollback on failure
        setCompletedIds(prev =>
          prev.includes(resourceId) ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
        );
      }
    });
  }

  // Filter resources
  const filteredResources = RESOURCES_DATA.filter(res => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || res.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || res.difficulty.toLowerCase() === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  // Calculate completion percentage
  const totalCount = RESOURCES_DATA.length;
  const completedCount = completedIds.filter(id => RESOURCES_DATA.some(r => r.id === id)).length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Resource Hub</h1>
        </div>
      </div>

      <div className="page-body flex flex-col gap-6">
        {/* Progress Tracker Card */}
        <div className="card">
          <div className="flex flex-col gap-3">
            <div>
              <div className="card-title" style={{ fontSize: 'var(--font-size-md)' }}>Learning Progress</div>
              <div className="card-subtitle">Keep up the great work! Complete resources to improve your scores.</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '240px' }}>
                <ProgressBar
                  value={completedCount}
                  max={totalCount}
                  label="Completed Resources"
                  showValue={true}
                />
              </div>
              <div style={{
                padding: 'var(--space-3) var(--space-6)',
                backgroundColor: 'var(--color-bg-tertiary)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 'bold', color: 'var(--color-brand)' }}>
                  {completionPercentage}%
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
                  Overall Score
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="card card-sm flex flex-col gap-4">
          <div className="form-group">
            <input
              type="text"
              className="input"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search resources by name, description, or skills..."
            />
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            {/* Category Filter */}
            <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: '200px' }}>
              <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Category</label>
              <select
                className="input select"
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div className="flex flex-col gap-1" style={{ flex: 1, minWidth: '150px' }}>
              <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>Difficulty</label>
              <select
                className="input select"
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
              >
                <option value="all">All Difficulties</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div>
          <div style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            marginBottom: 'var(--space-4)',
            fontWeight: 'var(--font-weight-medium)'
          }}>
            Showing {filteredResources.length} resources
          </div>

          {filteredResources.length === 0 ? (
            <div className="card text-center p-8" style={{ color: 'var(--color-text-muted)' }}>
              No learning resources found matching the filter criteria.
            </div>
          ) : (
            <div className="grid-3" style={{ gap: 'var(--space-4)' }}>
              {filteredResources.map((res: Resource) => {
                const isCompleted = completedIds.includes(res.id);
                const diffLower = res.difficulty.toLowerCase();

                let badgeClass = 'badge-brand';
                if (diffLower === 'beginner') badgeClass = 'badge-success';
                else if (diffLower === 'intermediate') badgeClass = 'badge-warning';
                else if (diffLower === 'advanced') badgeClass = 'badge-error';

                return (
                  <div
                    key={res.id}
                    className="card flex flex-col justify-between"
                    style={{
                      borderColor: isCompleted ? 'var(--color-success-border)' : 'var(--color-border)',
                      backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.02)' : 'var(--color-bg-secondary)',
                      transition: 'all var(--transition-base)',
                    }}
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex justify-between items-center mb-3">
                        <span className={`badge ${badgeClass}`}>{res.difficulty}</span>
                        <span className="badge badge-muted" style={{ fontSize: '10px' }}>
                          {CATEGORY_LABELS[res.category] || res.category}
                        </span>
                      </div>

                      {/* Header */}
                      <h3 className="card-title" style={{ fontSize: 'var(--font-size-md)' }}>{res.name}</h3>
                      <p className="card-subtitle" style={{ fontSize: 'var(--font-size-sm)', lineHeight: '1.4', marginTop: 'var(--space-2)' }}>
                        {res.description}
                      </p>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-1 mt-4">
                        {res.skills.map(skill => (
                          <span key={skill} style={{
                            fontSize: '9px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text-secondary)',
                            border: '1px solid var(--color-border-subtle)'
                          }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ marginTop: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      <div className="flex gap-2">
                        {/* Start Learning / Open link safely */}
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                        >
                          Start Learning
                          <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 12, height: 12 }}>
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                          </svg>
                        </a>

                        {/* Complete Toggle */}
                        <button
                          onClick={() => handleToggleComplete(res.id)}
                          className={`btn btn-sm ${isCompleted ? 'btn-danger' : 'btn-secondary'}`}
                          style={{ minWidth: '40px' }}
                          title={isCompleted ? 'Mark Incomplete' : 'Mark Completed'}
                          type="button"
                          disabled={isPending}
                        >
                          {isCompleted ? (
                            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 14, height: 14 }}>
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
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
