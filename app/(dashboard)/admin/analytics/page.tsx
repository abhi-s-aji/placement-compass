export const dynamic = 'force-dynamic';

import { createClient, getAuthorizedUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { CATEGORY_LABELS } from '@/lib/score';
import { Progress, Profile } from '@/lib/types';
import Unauthorized from '@/components/Unauthorized';

export const metadata = { title: 'Platform Analytics - Placement Compass' };

export default async function AdminAnalytics() {
  const auth = await getAuthorizedUser();
  if (!auth) redirect('/login');
  if (auth.role !== 'admin') {
    return <Unauthorized />;
  }

  const supabase = await createClient();

  // Fetch all students progress
  const [
    { data: progressList },
    { data: profiles },
  ] = await Promise.all([
    supabase.from('progress').select('*'),
    supabase.from('profiles').select('id, graduation_year, department').eq('role', 'student'),
  ]);

  const scores = (progressList || []) as Progress[];
  const students = (profiles || []) as Profile[];

  // 1. Calculate Average Score per Category
  const categories = Object.keys(CATEGORY_LABELS);
  const categoryStats = categories.map((cat) => {
    const total = scores.reduce((sum, s) => sum + ((s as any)[`${cat}_score`] ?? 0), 0);
    const avg = scores.length > 0 ? Math.round(total / scores.length) : 0;
    return {
      key: cat,
      label: CATEGORY_LABELS[cat],
      avg,
    };
  }).sort((a, b) => b.avg - a.avg); // Sort highest performing category to lowest

  // 2. Average Score by Department
  const deptMap: Record<string, { total: number; count: number }> = {};
  scores.forEach((s) => {
    const student = students.find((std) => std.id === s.user_id);
    const dept = student?.department || 'Unspecified';
    if (!deptMap[dept]) {
      deptMap[dept] = { total: 0, count: 0 };
    }
    deptMap[dept].total += s.overall_score;
    deptMap[dept].count += 1;
  });

  const departmentStats = Object.entries(deptMap).map(([dept, data]) => ({
    name: dept,
    avg: Math.round(data.total / data.count),
    count: data.count,
  })).sort((a, b) => b.avg - a.avg);

  // 3. Average Score by Graduation Year
  const yearMap: Record<number, { total: number; count: number }> = {};
  scores.forEach((s) => {
    const student = students.find((std) => std.id === s.user_id);
    const year = student?.graduation_year;
    if (year) {
      if (!yearMap[year]) {
        yearMap[year] = { total: 0, count: 0 };
      }
      yearMap[year].total += s.overall_score;
      yearMap[year].count += 1;
    }
  });

  const yearStats = Object.entries(yearMap).map(([year, data]) => ({
    year: parseInt(year),
    avg: Math.round(data.total / data.count),
    count: data.count,
  })).sort((a, b) => a.year - b.year); // Sort chronologically

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Platform Analytics</h1>
        </div>
      </div>

      <div className="page-body">
        {/* Row 1: Category Average Performance */}
        <div className="card mb-6">
          <h2 className="card-title mb-1">Preparation Score by Category</h2>
          <p className="card-subtitle mb-6">Comparative cohort average across the 7 placement-readiness sections</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {categoryStats.map((cat) => {
              const color =
                cat.avg >= 70
                  ? 'var(--color-success)'
                  : cat.avg >= 50
                  ? 'var(--color-info)'
                  : 'var(--color-warning)';

              return (
                <div key={cat.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-secondary">{cat.label}</span>
                    <span className="text-muted">{cat.avg}% Average</span>
                  </div>
                  <div className="progress-bar-track" style={{ height: 12 }}>
                    <div
                      className="progress-bar-fill brand"
                      style={{
                        width: `${cat.avg}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Department and Cohort breakdowns */}
        <div className="grid-2" style={{ gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)', alignItems: 'start' }}>
          {/* Department Breakdown */}
          <div className="card">
            <h3 className="card-title mb-1">Performance by Department</h3>
            <p className="card-subtitle mb-4">Readiness scores categorized by academic department</p>

            {departmentStats.length === 0 ? (
              <p className="text-xs text-muted">No student profiles updated with department data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {departmentStats.map((dept) => (
                  <div key={dept.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-secondary">{dept.name} ({dept.count} students)</span>
                      <span className="text-muted">{dept.avg}%</span>
                    </div>
                    <div className="progress-bar-track" style={{ height: 6 }}>
                      <div
                        className="progress-bar-fill brand"
                        style={{
                          width: `${dept.avg}%`,
                          backgroundColor: dept.avg >= 75 ? 'var(--color-success)' : dept.avg >= 55 ? 'var(--color-info)' : 'var(--color-warning)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Graduation Cohorts */}
          <div className="card">
            <h3 className="card-title mb-1">Performance by Graduation Year</h3>
            <p className="card-subtitle mb-4">Readiness scores sorted by graduation year</p>

            {yearStats.length === 0 ? (
              <p className="text-xs text-muted">No student profiles updated with graduation year data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                {yearStats.map((cohort) => (
                  <div key={cohort.year}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-secondary">Class of {cohort.year} ({cohort.count} students)</span>
                      <span className="text-muted">{cohort.avg}%</span>
                    </div>
                    <div className="progress-bar-track" style={{ height: 6 }}>
                      <div
                        className="progress-bar-fill brand"
                        style={{
                          width: `${cohort.avg}%`,
                          backgroundColor: cohort.avg >= 75 ? 'var(--color-success)' : cohort.avg >= 55 ? 'var(--color-info)' : 'var(--color-warning)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
