import { ChecklistDefinition, TaskCategory } from './types';

export const CATEGORY_WEIGHTS: Record<string, number> = {
  resume: 15,
  github: 15,
  linkedin: 10,
  projects: 20,
  coding: 20,
  aptitude: 10,
  interview: 10,
};

export const CATEGORY_LABELS: Record<string, string> = {
  resume: 'Resume',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  projects: 'Projects',
  coding: 'Coding',
  aptitude: 'Aptitude',
  interview: 'Interview',
};

export const CHECKLIST_DEFINITIONS: Record<TaskCategory, ChecklistDefinition[]> = {
  resume: [
    { key: 'created_resume', label: 'Created a resume', description: 'Have a base resume document ready' },
    { key: 'contact_info', label: 'Added contact information', description: 'Phone, email, LinkedIn, GitHub links included' },
    { key: 'education_section', label: 'Added education section', description: 'College, degree, CGPA/percentage' },
    { key: 'skills_section', label: 'Added skills section', description: 'Technical and soft skills listed' },
    { key: 'projects_section', label: 'Added projects', description: 'At least 2 projects with descriptions' },
    { key: 'experience_section', label: 'Added internships/experience', description: 'Internship or work experience included' },
    { key: 'achievements', label: 'Added achievements', description: 'Awards, certifications, hackathon wins' },
    { key: 'one_page', label: 'Resume fits one page', description: 'Resume is concise and one page long' },
    { key: 'quantified_impact', label: 'Quantified achievements', description: 'Used numbers to show impact' },
    { key: 'ats_friendly', label: 'ATS-friendly format', description: 'No tables, graphics or special fonts' },
  ],
  github: [
    { key: 'profile_created', label: 'GitHub profile created', description: 'Active GitHub account exists' },
    { key: 'profile_picture', label: 'Profile picture set', description: 'Professional profile picture added' },
    { key: 'bio_added', label: 'Bio/description added', description: 'Short bio describing your skills' },
    { key: 'pinned_repos', label: 'Pinned best repositories', description: '6 best projects pinned on profile' },
    { key: 'readme_profiles', label: 'README in major repos', description: 'Key projects have README files' },
    { key: 'regular_commits', label: 'Regular commit activity', description: 'Commits in the last 30 days' },
    { key: 'min_5_repos', label: 'Minimum 5 repositories', description: 'At least 5 public repositories' },
    { key: 'contribution_graph', label: 'Active contribution graph', description: 'Consistent green contribution graph' },
    { key: 'open_source', label: 'Contributed to open source', description: 'At least 1 PR to an open source project' },
    { key: 'portfolio_project', label: 'Portfolio/personal site', description: 'Personal website or portfolio deployed' },
  ],
  linkedin: [
    { key: 'profile_created', label: 'LinkedIn profile created', description: 'Active LinkedIn account exists' },
    { key: 'profile_picture', label: 'Professional profile picture', description: 'Clear, professional headshot' },
    { key: 'headline', label: 'Professional headline', description: 'Strong headline beyond just student title' },
    { key: 'about_section', label: 'About section completed', description: 'Comprehensive about section written' },
    { key: 'skills_added', label: 'Skills added (10+)', description: 'At least 10 relevant skills added' },
    { key: 'education_added', label: 'Education section filled', description: 'College and courses listed' },
    { key: 'projects_added', label: 'Projects added', description: 'Major projects listed with descriptions' },
    { key: 'experience_added', label: 'Experience added', description: 'Internships or work experience listed' },
    { key: 'certifications', label: 'Certifications added', description: 'Relevant certifications included' },
    { key: '100_connections', label: '100+ connections', description: 'Building a professional network' },
  ],
  projects: [
    { key: 'min_2_projects', label: 'Minimum 2 projects built', description: 'At least 2 substantial projects completed' },
    { key: 'full_stack_project', label: 'Full stack project', description: 'At least one project with frontend + backend' },
    { key: 'database_project', label: 'Project with database', description: 'Project that uses a real database' },
    { key: 'api_integration', label: 'API integration project', description: 'Project consuming external API' },
    { key: 'deployed_project', label: 'Deployed project', description: 'At least one project is live on the internet' },
    { key: 'github_uploaded', label: 'Projects on GitHub', description: 'All projects pushed to GitHub' },
    { key: 'readme_documentation', label: 'Proper README files', description: 'READMEs with setup and description' },
    { key: 'domain_project', label: 'Domain-specific project', description: 'Project relevant to target job role' },
  ],
  coding: [
    { key: 'platform_account', label: 'Coding platform account', description: 'Account on LeetCode/HackerRank/etc.' },
    { key: 'basics_learned', label: 'Programming basics mastered', description: 'Core language fundamentals solid' },
    { key: 'dsa_basics', label: 'DSA basics completed', description: 'Arrays, strings, sorting learned' },
    { key: '50_problems', label: '50+ problems solved', description: 'Minimum 50 coding problems solved' },
    { key: 'easy_comfortable', label: 'Comfortable with easy problems', description: 'Can solve easy problems within time' },
    { key: 'medium_attempted', label: 'Medium problems attempted', description: 'Attempting medium-level problems' },
    { key: 'dsa_roadmap', label: 'DSA roadmap in progress', description: 'Trees, graphs, DP being learned' },
    { key: '150_problems', label: '150+ problems solved', description: 'Strong coding practice base built' },
    { key: 'contest_participation', label: 'Participated in contests', description: 'At least one coding contest attempted' },
    { key: 'system_design_basics', label: 'System design basics', description: 'Basic system design concepts known' },
  ],
  aptitude: [
    { key: 'quantitative_basics', label: 'Quantitative aptitude basics', description: 'Math fundamentals covered' },
    { key: 'logical_reasoning', label: 'Logical reasoning practice', description: 'Pattern and logical reasoning done' },
    { key: 'verbal_ability', label: 'Verbal ability practice', description: 'English comprehension and vocabulary' },
    { key: 'mock_tests', label: 'Attempted mock aptitude tests', description: 'At least 3 full mock tests taken' },
    { key: 'time_management', label: 'Time management in tests', description: 'Can complete test within time limit' },
    { key: 'aptitude_platform', label: 'Using aptitude platform', description: 'IndiaBix, PrepInsta or similar used' },
  ],
  interview: [
    { key: 'resume_walkthrough', label: 'Can explain resume confidently', description: 'Smooth resume walkthrough practiced' },
    { key: 'introduction', label: 'Strong self-introduction', description: '60-90 second introduction prepared' },
    { key: 'hr_questions', label: 'HR questions prepared', description: 'Common HR questions answered and rehearsed' },
    { key: 'technical_concepts', label: 'Core technical concepts revised', description: 'CS fundamentals (OS, DBMS, Networks) revised' },
    { key: 'behavioral_questions', label: 'Behavioral questions practiced', description: 'STAR method for situational questions' },
    { key: 'mock_interviews', label: 'Mock interviews done', description: 'At least 3 mock technical interviews done' },
    { key: 'company_research', label: 'Company research habit', description: 'Habit of researching company before interview' },
    { key: 'salary_negotiation', label: 'Salary negotiation awareness', description: 'Know how to discuss compensation' },
  ],
  general: [],
};

/**
 * Calculate score for a single category based on completed checklist items
 */
export function calculateCategoryScore(
  category: TaskCategory,
  completedItems: string[]
): number {
  if (category === 'general') return 0;
  const items = CHECKLIST_DEFINITIONS[category];
  if (!items || items.length === 0) return 0;
  const completedCount = items.filter(item => completedItems.includes(item.key)).length;
  return Math.round((completedCount / items.length) * 100);
}

/**
 * Calculate overall placement readiness score (weighted)
 */
export function calculateOverallScore(categoryScores: Record<string, number>): number {
  let total = 0;
  let weightSum = 0;

  for (const [category, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    const score = categoryScores[category] ?? 0;
    total += (score / 100) * weight;
    weightSum += weight;
  }

  return Math.round((total / weightSum) * 100);
}

/**
 * Get readiness status label and color class
 */
export function getReadinessStatus(score: number): { label: string; className: string } {
  if (score >= 80) return { label: 'Placement Ready', className: 'status-ready' };
  if (score >= 60) return { label: 'Good Progress', className: 'status-good' };
  if (score >= 40) return { label: 'In Progress', className: 'status-progress' };
  return { label: 'Needs Work', className: 'status-needs-work' };
}

/**
 * Get priority badge class
 */
export function getPriorityClass(priority: string): string {
  const map: Record<string, string> = {
    urgent: 'badge-error',
    high: 'badge-warning',
    medium: 'badge-info',
    low: 'badge-muted',
  };
  return map[priority] ?? 'badge-muted';
}

/**
 * Get status badge class
 */
export function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    completed: 'badge-success',
    in_progress: 'badge-info',
    pending: 'badge-warning',
    cancelled: 'badge-error',
  };
  return map[status] ?? 'badge-muted';
}

/**
 * Format date string
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Get days until deadline
 */
export function getDaysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Truncate text to max length
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
