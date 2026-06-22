import { Profile, Progress, Project, Task, Feedback, ChecklistItem } from './types';
import { CATEGORY_LABELS, CATEGORY_WEIGHTS } from './score';

export interface ReadinessAnalysisInput {
  profile: Profile;
  progress: Progress | null;
  projects: Project[] | null;
  checklistItems: ChecklistItem[] | null;
}

export interface ReadinessAnalysisOutput {
  readiness_percentage: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  thirty_day_plan: string;
  status: 'Ready' | 'Needs Improvement';
}

export function analyzePlacementReadiness(input: ReadinessAnalysisInput): ReadinessAnalysisOutput {
  const { profile, progress, projects, checklistItems } = input;

  // Retrieve scores or default to 0
  const scores: Record<string, number> = {
    resume: progress?.resume_score ?? 0,
    github: progress?.github_score ?? 0,
    linkedin: progress?.linkedin_score ?? 0,
    projects: progress?.project_score ?? 0,
    coding: progress?.coding_score ?? 0,
    aptitude: progress?.aptitude_score ?? 0,
    interview: progress?.interview_score ?? 0,
  };

  // 1. Calculate overall score based on category weights
  let weightedSum = 0;
  let totalWeight = 0;

  for (const [cat, weight] of Object.entries(CATEGORY_WEIGHTS)) {
    weightedSum += (scores[cat] ?? 0) * (weight / 100);
    totalWeight += weight;
  }

  const overallScore = Math.round(weightedSum);
  const status = overallScore >= 75 ? 'Ready' : 'Needs Improvement';

  // 2. Generate Strengths (Categories >= 75)
  const strengths: string[] = [];

  if (scores.resume >= 75) {
    strengths.push('Your resume is placement-ready, featuring professional formatting, educational history, and clear sections.');
  }
  if (scores.github >= 75) {
    strengths.push('Strong GitHub presence with active repository documentation and regular commit activity.');
  }
  if (scores.linkedin >= 75) {
    strengths.push('Well-optimized LinkedIn profile with completed bio, skills list, and professional network connections.');
  }
  if (scores.projects >= 75) {
    strengths.push('Good project portfolio showing competence in building multi-tier applications with database integrations.');
  }
  if (scores.coding >= 75) {
    strengths.push('Strong coding preparation, indicating solid mastery of Data Structures, Algorithms, and coding platform benchmarks.');
  }
  if (scores.aptitude >= 75) {
    strengths.push('Solid quantitative, logical, and verbal aptitude preparation ready for initial assessment rounds.');
  }
  if (scores.interview >= 75) {
    strengths.push('Confident interview readiness, showing thorough mock interview practice and behavioral question prep.');
  }

  // Handle fallback if not enough strengths
  if (strengths.length === 0) {
    strengths.push('Consistent tracking of placement readiness and preparation metrics.');
  }
  if (profile.skills && profile.skills.length > 0 && strengths.length < 3) {
    strengths.push(`Enrolled technical skill set matching target roles: ${profile.skills.slice(0, 5).join(', ')}.`);
  }
  if (strengths.length < 3) {
    strengths.push('Structured checklist progression across multiple core dimensions.');
  }

  // Limit to top 3 strengths
  const finalStrengths = strengths.slice(0, 3);

  // 3. Generate Weak Areas (Categories < 50, or lowest categories)
  const weaknesses: string[] = [];

  if (scores.resume < 50) {
    weaknesses.push('Resume lacks ATS optimization or quantified accomplishments.');
  }
  if (scores.github < 50) {
    weaknesses.push('Low GitHub activity, missing consistent commits or pinned portfolio repositories.');
  }
  if (scores.linkedin < 50) {
    weaknesses.push('LinkedIn profile is incomplete, lacking headline descriptions or connection volume.');
  }
  if (scores.projects < 50) {
    weaknesses.push('Incomplete project portfolio with insufficient deployed, real-world applications.');
  }
  if (scores.coding < 50) {
    weaknesses.push('DSA and coding skills need work, missing platform practice benchmarks.');
  }
  if (scores.aptitude < 50) {
    weaknesses.push('Low aptitude progress, showing a need for quantitative and logical reasoning mock test training.');
  }
  if (scores.interview < 50) {
    weaknesses.push('Mock interview prep is missing, requiring resume walk-throughs and behavioral question practice.');
  }

  // Fallback: if no category is under 50, grab the lowest categories under 75
  if (weaknesses.length === 0) {
    const sortedCats = Object.entries(scores)
      .filter(([_, score]) => score < 75)
      .sort((a, b) => a[1] - b[1]);

    sortedCats.forEach(([cat]) => {
      if (cat === 'resume') weaknesses.push('Resume could be improved with more impact-focused metrics.');
      if (cat === 'github') weaknesses.push('GitHub commit frequency can be improved to demonstrate consistency.');
      if (cat === 'linkedin') weaknesses.push('LinkedIn profile can be enhanced with technical project descriptions.');
      if (cat === 'projects') weaknesses.push('Project portfolio lacks full-stack architectures or live deployment links.');
      if (cat === 'coding') weaknesses.push('Coding speed and problem-solving benchmarks can be sharpened.');
      if (cat === 'aptitude') weaknesses.push('Aptitude mock tests can be taken to improve time management.');
      if (cat === 'interview') weaknesses.push('Interview delivery and communication skills can be refined.');
    });
  }

  if (weaknesses.length === 0) {
    weaknesses.push('No critical preparation weak areas identified. Continue practicing to maintain sharpness.');
  }

  // Limit to top 3 weaknesses
  const finalWeaknesses = weaknesses.slice(0, 3);

  // 4. Generate Recommendations & 30-Day Plan
  const recommendations: string[] = [];
  const improvementPlan: { area: string; actions: string[] }[] = [];

  // Rules for recommendations
  if (scores.resume < 75) {
    const recs = [
      'Align resume layout with standard one-page ATS guidelines (no columns/complex tables).',
      'Rewrite descriptions to quantify impacts (use numbers, e.g., "improved latency by 20%").'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'Resume Design', actions: recs });
  }
  if (scores.github < 75) {
    const recs = [
      'Maintain an active commit graph (aim for at least 3 green contribution days a week).',
      'Write highly documented README files with setup details for your pinned repositories.'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'GitHub Presence', actions: recs });
  }
  if (scores.linkedin < 75) {
    const recs = [
      'Expand LinkedIn professional network to reach at least 100+ industry or peer connections.',
      'Fill out your Headline and Summary with target job descriptions and skills.'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'LinkedIn Optimization', actions: recs });
  }
  if (scores.projects < 75) {
    const recs = [
      'Build and deploy a full-stack project integrating database persistence and API calls.',
      'Add live demo deployment links (Vercel, Render, or Netlify) to your project descriptions.'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'Projects Development', actions: recs });
  }
  if (scores.coding < 75) {
    const recs = [
      'Practice solving DSA questions on platforms (target 100+ easy/medium Leetcode problems).',
      'Attempt weekly timed coding challenges to simulate placement coding round conditions.'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'Coding Prep', actions: recs });
  }
  if (scores.aptitude < 75) {
    const recs = [
      'Solve daily aptitude exercises covering quantitative, logical, and verbal reasoning.',
      'Attempt at least 3 full mock aptitude tests under strict time constraints.'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'Aptitude Tests', actions: recs });
  }
  if (scores.interview < 75) {
    const recs = [
      'Practice your self-introduction and standard HR/behavioral questions using the STAR method.',
      'Schedule at least 2 mock technical interviews with a peer or mentor.'
    ];
    recommendations.push(...recs);
    improvementPlan.push({ area: 'Interview Readiness', actions: recs });
  }

  // Fallbacks if all categories are high-performing
  if (recommendations.length === 0) {
    recommendations.push('Keep taking coding mock contests to stay sharp.', 'Perform peer-to-peer mock interviews.');
    improvementPlan.push({
      area: 'Maintenance & Polish',
      actions: ['Keep taking coding mock contests to stay sharp.', 'Perform peer-to-peer mock interviews.']
    });
  }

  const finalRecommendations = recommendations.slice(0, 4);

  // Compile 30-day plan text
  const planLines: string[] = [];
  planLines.push('Here is your personalized 30-day roadmap for placement preparation:\n');

  if (improvementPlan.length > 0) {
    const weekCount = Math.min(improvementPlan.length, 4);
    for (let w = 0; w < weekCount; w++) {
      const plan = improvementPlan[w];
      planLines.push(`Week ${w + 1}: Focus on ${plan.area}`);
      plan.actions.forEach((act) => {
        planLines.push(`  - ${act}`);
      });
      planLines.push('');
    }
    // If there are more focus areas
    if (improvementPlan.length > 4) {
      planLines.push('Extended Roadmap Action Items:');
      for (let w = 4; w < improvementPlan.length; w++) {
        const plan = improvementPlan[w];
        plan.actions.forEach((act) => {
          planLines.push(`  - [${plan.area}] ${act}`);
        });
      }
      planLines.push('');
    }
  } else {
    planLines.push('Days 1-15: Practice hard coding rounds and peer-to-peer mock interviews.');
    planLines.push('Days 16-30: Take mock aptitude exams and keep expanding your industry connections.');
  }

  return {
    readiness_percentage: overallScore,
    strengths: finalStrengths,
    weaknesses: finalWeaknesses,
    recommendations: finalRecommendations,
    thirty_day_plan: planLines.join('\n'),
    status,
  };
}
