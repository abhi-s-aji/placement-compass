export type UserRole = 'student' | 'mentor' | 'admin';

export type TaskCategory = 'resume' | 'github' | 'linkedin' | 'projects' | 'coding' | 'aptitude' | 'interview' | 'general';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  college: string | null;
  department: string | null;
  graduation_year: number | null;
  skills: string[];
  resume_url: string | null;
  github_username: string | null;
  linkedin_url: string | null;
  avatar_url: string | null;
  is_active: boolean;
  mentor_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Progress {
  id: string;
  user_id: string;
  resume_score: number;
  github_score: number;
  linkedin_score: number;
  project_score: number;
  coding_score: number;
  aptitude_score: number;
  interview_score: number;
  overall_score: number;
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  user_id: string;
  category: TaskCategory;
  item_key: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GitHubData {
  id: string;
  user_id: string;
  username: string;
  repo_count: number;
  public_repos: GitHubRepo[];
  top_languages: Record<string, number>;
  recent_activity_count: number;
  followers: number;
  following: number;
  bio: string | null;
  profile_complete: boolean;
  github_score: number;
  last_fetched: string;
}

export interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  updated_at: string;
  html_url: string;
}

export interface Task {
  id: string;
  mentor_id: string;
  student_id: string;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  mentor?: Profile;
  student?: Profile;
}

export interface Feedback {
  id: string;
  mentor_id: string;
  student_id: string;
  message: string;
  category: TaskCategory | null;
  type?: 'feedback' | 'suggestion' | 'student';
  suggestion_details?: {
    title?: string;
    platform?: string;
    url?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
  mentor?: Profile;
  student?: Profile;
}

export interface AIReport {
  id: string;
  user_id: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  thirty_day_plan: string | null;
  readiness_percentage: number | null;
  created_at: string;
}

export interface CategoryScore {
  category: TaskCategory;
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  percentage: number;
}

export interface ChecklistDefinition {
  key: string;
  label: string;
  description: string;
}

export type MentorRequestStatus = 'pending' | 'approved' | 'rejected';

export interface MentorRequest {
  id: string;
  student_id: string;
  requested_mentor_id: string;
  mentor_id?: string | null;
  message: string | null;
  status: MentorRequestStatus;
  created_at: string;
  updated_at: string;
  student?: Profile;
  mentor?: Profile;
}

export interface MockInterviewSession {
  id: string;
  user_id: string;
  company: string;
  category: string;
  completed_questions: number;
  total_questions: number;
  score: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
  evaluation_score?: number;
  evaluation_level?: string;
  strengths?: string[];
  weaknesses?: string[];
  improvement_tips?: string[];
  interviewer_feedback?: string;
  question_text?: string;
  answer_text?: string;
}

export type InterviewCategory = 'DSA' | 'System Design' | 'DBMS' | 'OS' | 'Computer Networks' | 'OOP' | 'HR' | 'Projects';

export interface InterviewQuestion {
  id: string;
  question: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: InterviewCategory;
  company?: string;
  hint?: string;
  sampleAnswer?: string;
  expected_concepts?: string[];
  key_points?: string[];
  common_mistakes?: string[];
  explanation?: string;
}

export interface InterviewRound {
  name: string;
  category: InterviewCategory;
  description: string;
  questions: InterviewQuestion[];
}

export interface CompanyInterview {
  company: string;
  logo?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  process: string;
  rounds: InterviewRound[];
  tips: string[];
}
