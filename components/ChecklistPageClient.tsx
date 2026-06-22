'use client';

import { useState, useTransition } from 'react';
import { CHECKLIST_DEFINITIONS, CATEGORY_LABELS, CATEGORY_WEIGHTS } from '@/lib/score';
import { ChecklistItem, TaskCategory } from '@/lib/types';
import { toggleChecklistItemAction } from '@/app/actions/progress';

interface ChecklistPageClientProps {
  userId: string;
  initialChecklist: ChecklistItem[];
  initialProgress: Record<string, number>;
  initialOverallScore: number;
}

const CATEGORIES = Object.keys(CHECKLIST_DEFINITIONS).filter(c => c !== 'general') as TaskCategory[];

export default function ChecklistPageClient({
  userId,
  initialChecklist,
  initialProgress,
  initialOverallScore,
}: ChecklistPageClientProps) {
  const [completed, setCompleted] = useState<Record<string, Set<string>>>(() => {
    const map: Record<string, Set<string>> = {};
    CATEGORIES.forEach(cat => { map[cat] = new Set(); });
    initialChecklist
      .filter(item => item.is_completed)
      .forEach(item => {
        if (!map[item.category]) map[item.category] = new Set();
        map[item.category].add(item.item_key);
      });
    return map;
  });

  const [scores, setScores] = useState(initialProgress);
  const [overallScore, setOverallScore] = useState(initialOverallScore);
  const [openCategory, setOpenCategory] = useState<TaskCategory | null>(CATEGORIES[0]);
  const [isPending, startTransition] = useTransition();
  const [saving, setSaving] = useState<string | null>(null);

  async function toggleItem(category: TaskCategory, itemKey: string, isCompleted: boolean) {
    setSaving(`${category}:${itemKey}`);

    startTransition(async () => {
      const res = await toggleChecklistItemAction(category as any, itemKey, isCompleted);
      if (res.success) {
        setCompleted(prev => {
          const next = { ...prev };
          next[category] = new Set(prev[category]);
          if (isCompleted) {
            next[category].add(itemKey);
          } else {
            next[category].delete(itemKey);
          }
          return next;
        });
        setScores(prev => ({
          ...prev,
          [category]: res.newCategoryScore ?? 0,
        }));
        setOverallScore(res.newOverallScore ?? 0);
      }
      setSaving(null);
    });
  }

  return (
    <div>
      {/* Overall score bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="card-title">Overall Placement Readiness</div>
            <div className="card-subtitle">Completing checklist items updates your score automatically</div>
          </div>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 700, color: overallScore >= 70 ? 'var(--color-success)' : overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)' }}>
            {overallScore}<span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>/100</span>
          </div>
        </div>
        <div className="progress-bar-track" style={{ height: 8 }}>
          <div
            className="progress-bar-fill"
            style={{
              width: `${overallScore}%`,
              backgroundColor: overallScore >= 70 ? 'var(--color-success)' : overallScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
            }}
          />
        </div>
      </div>

      {/* Category accordions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {CATEGORIES.map(cat => {
          const items = CHECKLIST_DEFINITIONS[cat];
          const completedSet = completed[cat] ?? new Set();
          const catScore = scores[cat] ?? 0;
          const pct = Math.round((completedSet.size / items.length) * 100);
          const isOpen = openCategory === cat;

          return (
            <div
              key={cat}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div
                className="collapsible-header"
                onClick={() => setOpenCategory(isOpen ? null : cat)}
              >
                <div className="flex items-center gap-4" style={{ flex: 1 }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-md font-semibold text-primary">{CATEGORY_LABELS[cat]}</span>
                      <span className="badge badge-muted">{CATEGORY_WEIGHTS[cat]}% weight</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="progress-bar-track" style={{ flex: 1 }}>
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: catScore >= 70 ? 'var(--color-success)' : catScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold" style={{
                        color: catScore >= 70 ? 'var(--color-success)' : catScore >= 40 ? 'var(--color-warning)' : 'var(--color-error)',
                        minWidth: 40,
                        textAlign: 'right'
                      }}>
                        {completedSet.size}/{items.length}
                      </span>
                    </div>
                  </div>
                </div>
                <svg
                  className={`collapsible-arrow ${isOpen ? 'open' : ''}`}
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              {isOpen && (
                <div style={{ padding: 'var(--space-4)', paddingTop: 0 }}>
                  <div className="checklist">
                    {items.map(item => {
                      const isCompleted = completedSet.has(item.key);
                      const isSaving = saving === `${cat}:${item.key}`;

                      return (
                        <div
                          key={item.key}
                          className={`checklist-item ${isCompleted ? 'completed' : ''}`}
                          onClick={() => !isSaving && toggleItem(cat, item.key, !isCompleted)}
                        >
                          <div className="checklist-checkbox">
                            {isSaving ? (
                              <span className="spinner spinner-sm" style={{ border: '2px solid var(--color-border)', borderTopColor: 'var(--color-brand)' }} />
                            ) : (
                              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="checklist-content">
                            <div className="checklist-label">{item.label}</div>
                            <div className="checklist-description">{item.description}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
