import { createClient } from './server';
import fs from 'fs';
import path from 'path';

// Local JSON DB file location
const DB_FILE = path.resolve(process.cwd(), 'scratch/local_db.json');

// Interface types
export interface Certificate {
  id: string;
  user_id: string;
  name: string;
  issuing_organization: string;
  issue_date: string;
  credential_url: string;
  file_url?: string;
  created_at: string;
}

export interface TargetSkill {
  id: string;
  user_id: string;
  skill: string;
  created_at: string;
}

export interface CompletedResource {
  id: string;
  user_id: string;
  resource_id: string;
  completed_at: string;
}

// Local helper functions
export function readLocalDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
      fs.writeFileSync(DB_FILE, JSON.stringify({
        certificates: [],
        target_skills: [],
        completed_resources: [],
        extra_profile_details: [],
        aptitude_progress: [],
        interview_progress: [],
        coding_progress: [],
        progress: []
      }), 'utf8');
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (!parsed.extra_profile_details) parsed.extra_profile_details = [];
    if (!parsed.certificates) parsed.certificates = [];
    if (!parsed.target_skills) parsed.target_skills = [];
    if (!parsed.completed_resources) parsed.completed_resources = [];
    if (!parsed.aptitude_progress) parsed.aptitude_progress = [];
    if (!parsed.interview_progress) parsed.interview_progress = [];
    if (!parsed.coding_progress) parsed.coding_progress = [];
    if (!parsed.progress) parsed.progress = [];
    return parsed;
  } catch (e) {
    return {
      certificates: [],
      target_skills: [],
      completed_resources: [],
      extra_profile_details: [],
      aptitude_progress: [],
      interview_progress: [],
      coding_progress: [],
      progress: []
    };
  }
}

export function writeLocalDb(data: any) {
  try {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing local DB:', e);
  }
}


// ----------------------------------------------------
// CERTIFICATES
// ----------------------------------------------------

export async function getCertificates(userId: string): Promise<Certificate[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('certificates').select('*').eq('user_id', userId);
    if (!error && data) {
      return data as Certificate[];
    }
  } catch (e) {
    // Fail over to local DB
  }
  const db = readLocalDb();
  return db.certificates.filter((c: any) => c.user_id === userId);
}

export async function addCertificate(
  userId: string,
  name: string,
  issuingOrganization: string,
  issueDate: string,
  credentialUrl: string,
  fileUrl?: string
): Promise<Certificate> {
  const newCert = {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    user_id: userId,
    name,
    issuing_organization: issuingOrganization,
    issue_date: issueDate,
    credential_url: credentialUrl,
    file_url: fileUrl || '',
    created_at: new Date().toISOString()
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('certificates').insert(newCert).select().single();
    if (!error && data) {
      return data as Certificate;
    }
  } catch (e) {
    // Fail over to local DB
  }

  const db = readLocalDb();
  db.certificates.push(newCert);
  writeLocalDb(db);
  return newCert;
}

export async function deleteCertificate(userId: string, id: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('certificates').delete().eq('id', id).eq('user_id', userId);
    if (!error) {
      return true;
    }
  } catch (e) {
    // Fail over
  }

  const db = readLocalDb();
  db.certificates = db.certificates.filter((c: any) => !(c.id === id && c.user_id === userId));
  writeLocalDb(db);
  return true;
}

export async function updateCertificate(
  userId: string,
  id: string,
  updates: Partial<Omit<Certificate, 'id' | 'user_id' | 'created_at'>>
): Promise<Certificate | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('certificates')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();
    if (!error && data) {
      return data as Certificate;
    }
  } catch (e) {
    // Fail over
  }

  const db = readLocalDb();
  const index = db.certificates.findIndex((c: any) => c.id === id && c.user_id === userId);
  if (index >= 0) {
    db.certificates[index] = {
      ...db.certificates[index],
      ...updates
    };
    writeLocalDb(db);
    return db.certificates[index] as Certificate;
  }
  return null;
}


// ----------------------------------------------------
// TARGET SKILLS
// ----------------------------------------------------

export async function getTargetSkills(userId: string): Promise<TargetSkill[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('target_skills').select('*').eq('user_id', userId);
    if (!error && data) {
      return data as TargetSkill[];
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  return db.target_skills.filter((s: any) => s.user_id === userId);
}

export async function addTargetSkill(userId: string, skill: string): Promise<TargetSkill> {
  const newSkill = {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
    user_id: userId,
    skill,
    created_at: new Date().toISOString()
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('target_skills').insert(newSkill).select().single();
    if (!error && data) {
      return data as TargetSkill;
    }
  } catch (e) {
    // Fail over
  }

  const db = readLocalDb();
  if (!db.target_skills.some((s: any) => s.user_id === userId && s.skill.toLowerCase() === skill.toLowerCase())) {
    db.target_skills.push(newSkill);
    writeLocalDb(db);
  }
  return newSkill;
}

export async function removeTargetSkill(userId: string, skill: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.from('target_skills').delete().eq('user_id', userId).eq('skill', skill);
    if (!error) {
      return true;
    }
  } catch (e) {
    // Fail over
  }

  const db = readLocalDb();
  db.target_skills = db.target_skills.filter((s: any) => !(s.user_id === userId && s.skill.toLowerCase() === skill.toLowerCase()));
  writeLocalDb(db);
  return true;
}

// ----------------------------------------------------
// COMPLETED RESOURCES
// ----------------------------------------------------

export async function getCompletedResources(userId: string): Promise<CompletedResource[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('completed_resources').select('*').eq('user_id', userId);
    if (!error && data) {
      return data as CompletedResource[];
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  return db.completed_resources.filter((r: any) => r.user_id === userId);
}

export async function toggleCompletedResource(userId: string, resourceId: string): Promise<boolean> {
  try {
    const supabase = await createClient();
    const { data: existing } = await supabase.from('completed_resources').select('*').eq('user_id', userId).eq('resource_id', resourceId).maybeSingle();
    if (existing) {
      await supabase.from('completed_resources').delete().eq('user_id', userId).eq('resource_id', resourceId);
    } else {
      await supabase.from('completed_resources').insert({ user_id: userId, resource_id: resourceId });
    }
    return true;
  } catch (e) {
    // Fail over
  }

  const db = readLocalDb();
  const index = db.completed_resources.findIndex((r: any) => r.user_id === userId && r.resource_id === resourceId);
  if (index >= 0) {
    db.completed_resources.splice(index, 1);
  } else {
    db.completed_resources.push({
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      user_id: userId,
      resource_id: resourceId,
      completed_at: new Date().toISOString()
    });
  }
  writeLocalDb(db);
  return true;
}

// ----------------------------------------------------
// EXTRA PROFILE DETAILS
// ----------------------------------------------------

export interface ExtraProfileDetails {
  user_id: string;
  phone: string;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    graduationYear: string;
  }>;
  experience: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
  achievements: string[];
}

export async function getExtraProfileDetails(userId: string): Promise<ExtraProfileDetails> {
  const db = readLocalDb();
  let details = db.extra_profile_details.find((d: any) => d.user_id === userId);
  if (!details) {
    details = {
      user_id: userId,
      phone: '',
      education: [],
      experience: [],
      achievements: []
    };
  }
  return details as ExtraProfileDetails;
}

export async function saveExtraProfileDetails(userId: string, details: Partial<ExtraProfileDetails>): Promise<ExtraProfileDetails> {
  const db = readLocalDb();
  let index = db.extra_profile_details.findIndex((d: any) => d.user_id === userId);
  
  const current = index >= 0 ? db.extra_profile_details[index] : {
    user_id: userId,
    phone: '',
    education: [],
    experience: [],
    achievements: []
  };

  const updated = {
    ...current,
    ...details,
    user_id: userId
  };

  if (index >= 0) {
    db.extra_profile_details[index] = updated;
  } else {
    db.extra_profile_details.push(updated);
  }

  writeLocalDb(db);
  return updated as ExtraProfileDetails;
}

// ----------------------------------------------------
// PROGRESS
// ----------------------------------------------------

export async function getProgress(userId: string): Promise<any> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('progress').select('*').eq('user_id', userId).single();
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  let row = db.progress.find((p: any) => p.user_id === userId);
  if (!row) {
    row = {
      user_id: userId,
      resume_score: 0,
      github_score: 0,
      linkedin_score: 0,
      project_score: 0,
      coding_score: 0,
      aptitude_score: 0,
      interview_score: 0,
      overall_score: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
  return row;
}

export async function saveProgress(userId: string, data: any): Promise<any> {
  try {
    const supabase = await createClient();
    const { data: dbData, error } = await supabase.from('progress').upsert({
      user_id: userId,
      ...data,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' }).select().single();
    if (!error && dbData) {
      return dbData;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  let index = db.progress.findIndex((p: any) => p.user_id === userId);
  const current = index >= 0 ? db.progress[index] : {
    user_id: userId,
    resume_score: 0,
    github_score: 0,
    linkedin_score: 0,
    project_score: 0,
    coding_score: 0,
    aptitude_score: 0,
    interview_score: 0,
    overall_score: 0,
    created_at: new Date().toISOString()
  };
  const updated = {
    ...current,
    ...data,
    updated_at: new Date().toISOString()
  };
  if (index >= 0) {
    db.progress[index] = updated;
  } else {
    db.progress.push(updated);
  }
  writeLocalDb(db);
  return updated;
}

// ----------------------------------------------------
// APTITUDE PROGRESS
// ----------------------------------------------------

export async function getAptitudeProgress(userId: string): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('aptitude_progress').select('*').eq('user_id', userId);
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  return db.aptitude_progress.filter((p: any) => p.user_id === userId);
}

export async function saveAptitudeProgress(userId: string, level: number, score: number): Promise<any> {
  const payload = {
    user_id: userId,
    level,
    score,
    completed_at: new Date().toISOString()
  };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('aptitude_progress').upsert(payload, { onConflict: 'user_id,level' }).select().single();
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  let index = db.aptitude_progress.findIndex((p: any) => p.user_id === userId && p.level === level);
  if (index >= 0) {
    db.aptitude_progress[index] = { ...db.aptitude_progress[index], ...payload };
  } else {
    db.aptitude_progress.push({
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      ...payload
    });
  }
  writeLocalDb(db);
  return payload;
}

// ----------------------------------------------------
// INTERVIEW PROGRESS
// ----------------------------------------------------

export async function getInterviewProgress(userId: string): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('interview_progress').select('*').eq('user_id', userId);
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  return db.interview_progress.filter((p: any) => p.user_id === userId);
}

export async function saveInterviewProgress(
  userId: string,
  mode: string,
  target: string,
  questionId: string,
  questionType: string,
  userResponse: string,
  completed: boolean
): Promise<any> {
  const payload = {
    user_id: userId,
    mode,
    target,
    question_id: questionId,
    question_type: questionType,
    user_response: userResponse,
    completed,
    completed_at: new Date().toISOString()
  };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('interview_progress').upsert(payload, { onConflict: 'user_id,mode,target,question_id' }).select().single();
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  let index = db.interview_progress.findIndex(
    (p: any) => p.user_id === userId && p.mode === mode && p.target === target && p.question_id === questionId
  );
  if (index >= 0) {
    db.interview_progress[index] = { ...db.interview_progress[index], ...payload };
  } else {
    db.interview_progress.push({
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      ...payload
    });
  }
  writeLocalDb(db);
  return payload;
}

// ----------------------------------------------------
// CODING PROGRESS (COMPILER PROBLEMS)
// ----------------------------------------------------

export async function getCodingProgress(userId: string): Promise<any[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('coding_progress').select('*').eq('user_id', userId);
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  return db.coding_progress.filter((p: any) => p.user_id === userId);
}

export async function saveCodingProgress(
  userId: string,
  problemId: string,
  status: string,
  language: string,
  code: string
): Promise<any> {
  const payload = {
    user_id: userId,
    problem_id: problemId,
    status,
    language,
    code,
    completed_at: new Date().toISOString()
  };
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('coding_progress').upsert(payload, { onConflict: 'user_id,problem_id' }).select().single();
    if (!error && data) {
      return data;
    }
  } catch (e) {
    // Fail over
  }
  const db = readLocalDb();
  let index = db.coding_progress.findIndex((p: any) => p.user_id === userId && p.problem_id === problemId);
  if (index >= 0) {
    db.coding_progress[index] = { ...db.coding_progress[index], ...payload };
  } else {
    db.coding_progress.push({
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      ...payload
    });
  }
  writeLocalDb(db);
  return payload;
}

// ----------------------------------------------------
// STUDENT PROFILE (UNIFIED SOURCE OF TRUTH)
// ----------------------------------------------------

export interface StudentProfile {
  id: string;
  projects: any[];
  github_profile: {
    username: string;
    profile_url: string;
    repo_count: number;
    last_updated: string | null;
  };
  linkedin_profile: {
    profile_url: string;
    completed_tasks: string[];
  };
  aptitude_progress: {
    completed_levels: number[];
    level_scores: Record<number, number>;
  };
  interview_progress: {
    completed_questions: string[];
    answers: Record<string, string>;
  };
  coding_progress: {
    solved_problems: string[];
    submissions: Record<string, { code: string; language: string; status: string }>;
  };
  readiness_scores: {
    resume_score: number;
    github_score: number;
    linkedin_score: number;
    project_score: number;
    coding_score: number;
    aptitude_score: number;
    interview_score: number;
    overall_score: number;
  };
  created_at?: string;
  updated_at?: string;
}

export async function getStudentProfile(userId: string): Promise<StudentProfile> {
  const defaultProfile: StudentProfile = {
    id: userId,
    projects: [],
    github_profile: { username: '', profile_url: '', repo_count: 0, last_updated: null },
    linkedin_profile: { profile_url: '', completed_tasks: [] },
    aptitude_progress: { completed_levels: [], level_scores: {} },
    interview_progress: { completed_questions: [], answers: {} },
    coding_progress: { solved_problems: [], submissions: {} },
    readiness_scores: {
      resume_score: 0,
      github_score: 0,
      linkedin_score: 0,
      project_score: 0,
      coding_score: 0,
      aptitude_score: 0,
      interview_score: 0,
      overall_score: 0
    }
  };

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('student_profile').select('*').eq('id', userId).single();
    if (!error && data) {
      return {
        ...defaultProfile,
        ...data
      };
    }
  } catch (e) {
    // Fail over to offline cache
  }

  const db = readLocalDb();
  let row = db.student_profile?.find((p: any) => p.id === userId);
  if (!row) {
    row = { ...defaultProfile };
  }
  return row as StudentProfile;
}

export async function saveStudentProfile(userId: string, data: Partial<StudentProfile>): Promise<StudentProfile> {
  const current = await getStudentProfile(userId);
  const updated = {
    ...current,
    ...data,
    id: userId,
    updated_at: new Date().toISOString()
  };

  try {
    const supabase = await createClient();
    const { data: dbData, error } = await supabase.from('student_profile').upsert(updated, { onConflict: 'id' }).select().single();
    if (!error && dbData) {
      return {
        ...updated,
        ...dbData
      };
    }
  } catch (e) {
    // Fail over to offline cache
  }

  const db = readLocalDb();
  if (!db.student_profile) {
    db.student_profile = [];
  }
  const index = db.student_profile.findIndex((p: any) => p.id === userId);
  if (index >= 0) {
    db.student_profile[index] = updated;
  } else {
    db.student_profile.push(updated);
  }
  writeLocalDb(db);
  return updated;
}


