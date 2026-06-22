'use client';

import { useState, useTransition } from 'react';
import { SKILL_LIST, RESOURCES_DATA, Resource } from '@/lib/resources-data';
import {
  addTargetSkillAction,
  removeTargetSkillAction,
  toggleCompletedResourceAction,
} from '@/app/actions/student';
import ProgressBar from './ProgressBar';

interface SkillsTrackerClientProps {
  userId: string;
  initialTargetSkills: string[];
  initialCompletedResourceIds: string[];
}

export default function SkillsTrackerClient({
  userId,
  initialTargetSkills,
  initialCompletedResourceIds,
}: SkillsTrackerClientProps) {
  const [targetSkills, setTargetSkills] = useState<string[]>(initialTargetSkills);
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedResourceIds);
  const [isPending, startTransition] = useTransition();

  // Helper to toggle target skills
  function handleToggleSkill(skill: string) {
    const isTarget = targetSkills.includes(skill);

    // Optimistic Update
    setTargetSkills(prev =>
      isTarget ? prev.filter(s => s !== skill) : [...prev, skill]
    );

    startTransition(async () => {
      let res;
      if (isTarget) {
        res = await removeTargetSkillAction(skill);
      } else {
        res = await addTargetSkillAction(skill);
      }

      if (!res.success) {
        // Rollback
        setTargetSkills(prev =>
          isTarget ? [...prev, skill] : prev.filter(s => s !== skill)
        );
      }
    });
  }

  // Handle completion toggle
  function handleToggleResource(resourceId: string) {
    setCompletedIds(prev =>
      prev.includes(resourceId) ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
    );

    startTransition(async () => {
      const res = await toggleCompletedResourceAction(resourceId);
      if (!res.success) {
        // Rollback
        setCompletedIds(prev =>
          prev.includes(resourceId) ? prev.filter(id => id !== resourceId) : [...prev, resourceId]
        );
      }
    });
  }

  // Get resources for a specific skill
  function getResourcesForSkill(skill: string): Resource[] {
    return RESOURCES_DATA.filter(res =>
      res.skills.some(s => s.toLowerCase() === skill.toLowerCase())
    );
  }

  // Get statistics for a specific skill
  function getSkillStats(skill: string) {
    const resources = getResourcesForSkill(skill);
    const total = resources.length;
    const completed = resources.filter(res => completedIds.includes(res.id)).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage, resources };
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Skill Tracker</h1>
        </div>
      </div>

      <div className="page-body" style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Left Side: Select Target Skills */}
        <div className="card" style={{ flex: '1', minWidth: '280px' }}>
          <div className="card-header" style={{ padding: 0, marginBottom: 'var(--space-4)' }}>
            <div>
              <div className="card-title">Target Skills</div>
              <div className="card-subtitle">Select the skills you want to improve</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {SKILL_LIST.map(skill => {
              const isSelected = targetSkills.includes(skill);
              return (
                <button
                  key={skill}
                  onClick={() => handleToggleSkill(skill)}
                  className={`btn ${isSelected ? 'btn-primary' : 'btn-secondary'} btn-full`}
                  style={{ justifyContent: 'space-between', textAlign: 'left' }}
                  type="button"
                  disabled={isPending}
                >
                  <span>{skill}</span>
                  <span>{isSelected ? '✓ Target' : '+ Add'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Skill Progress Dashboard */}
        <div style={{ flex: '2', minWidth: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="card">
            <h3 className="card-title" style={{ fontSize: 'var(--font-size-md)' }}>Skill Readiness Dashboard</h3>
            <p className="card-subtitle" style={{ fontSize: 'var(--font-size-sm)', marginTop: '2px' }}>
              Track preparation levels based on resources completed. Complete recommended modules to level up.
            </p>
          </div>

          {targetSkills.length === 0 ? (
            <div className="card text-center p-8" style={{ color: 'var(--color-text-muted)' }}>
              No target skills selected. Choose skills from the left side panel to track your progress.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {targetSkills.map(skill => {
                const { total, completed, percentage, resources } = getSkillStats(skill);

                let progressClass = 'low';
                if (percentage >= 70) progressClass = 'high';
                else if (percentage >= 35) progressClass = 'medium';

                return (
                  <div key={skill} className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
                      <div>
                        <h3 className="text-md font-semibold text-primary">{skill} Readiness</h3>
                        <p className="text-xs text-secondary mt-1">
                          {completed} of {total} recommended resources completed
                        </p>
                      </div>
                      <div className={`status-${progressClass} text-sm font-bold`}>
                        {percentage}% Ready
                      </div>
                    </div>

                    <div style={{ marginBottom: 'var(--space-5)' }}>
                      <ProgressBar
                        value={completed}
                        max={total}
                        label="Skill progress"
                      />
                    </div>

                    {resources.length === 0 ? (
                      <div className="text-xs text-muted">No specific resources found for {skill}.</div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
                          Recommended Modules:
                        </div>
                        {resources.map(res => {
                          const isCompleted = completedIds.includes(res.id);
                          return (
                            <div
                              key={res.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: 'var(--space-2) var(--space-3)',
                                backgroundColor: 'var(--color-bg-tertiary)',
                                border: '1px solid var(--color-border)',
                                borderRadius: 'var(--radius-md)',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', minWidth: 0, flex: 1 }}>
                                <input
                                  type="checkbox"
                                  checked={isCompleted}
                                  onChange={() => handleToggleResource(res.id)}
                                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--color-brand)' }}
                                  disabled={isPending}
                                />
                                <span className={`text-xs ${isCompleted ? 'text-muted' : 'text-primary'} font-medium`} style={{ textDecoration: isCompleted ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {res.name} ({res.difficulty})
                                </span>
                              </div>
                              <a
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-brand hover:underline flex-shrink-0"
                              >
                                Study ↗
                              </a>
                            </div>
                          );
                        })}
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
