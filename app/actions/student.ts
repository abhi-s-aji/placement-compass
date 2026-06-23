'use server';

import { getSessionUser, createClient } from '@/lib/supabase/server';
import * as db from '@/lib/supabase/hybrid-db';

async function getRequiredUser() {
  const { user, error } = await getSessionUser();
  if (error || !user) {
    throw new Error('Unauthorized');
  }
  return user;
}

// ----------------------------------------------------
// CERTIFICATES
// ----------------------------------------------------

export async function getCertificatesAction() {
  try {
    const user = await getRequiredUser();
    return { success: true, data: await db.getCertificates(user.id) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addCertificateAction(
  name: string,
  issuingOrganization: string,
  issueDate: string,
  credentialUrl: string,
  fileUrl?: string
) {
  try {
    const user = await getRequiredUser();
    const cert = await db.addCertificate(
      user.id,
      name,
      issuingOrganization,
      issueDate,
      credentialUrl,
      fileUrl
    );
    return { success: true, data: cert };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateCertificateAction(
  id: string,
  updates: {
    name: string;
    issuing_organization: string;
    issue_date: string;
    credential_url: string;
    file_url?: string;
  }
) {
  try {
    const user = await getRequiredUser();
    const cert = await db.updateCertificate(user.id, id, {
      name: updates.name,
      issuing_organization: updates.issuing_organization,
      issue_date: updates.issue_date,
      credential_url: updates.credential_url,
      file_url: updates.file_url,
    });
    return { success: true, data: cert };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteCertificateAction(id: string) {
  try {
    const user = await getRequiredUser();
    const result = await db.deleteCertificate(user.id, id);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// TARGET SKILLS
// ----------------------------------------------------

export async function getTargetSkillsAction() {
  try {
    const user = await getRequiredUser();
    return { success: true, data: await db.getTargetSkills(user.id) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addTargetSkillAction(skill: string) {
  try {
    const user = await getRequiredUser();
    const result = await db.addTargetSkill(user.id, skill);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function removeTargetSkillAction(skill: string) {
  try {
    const user = await getRequiredUser();
    const result = await db.removeTargetSkill(user.id, skill);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// COMPLETED RESOURCES
// ----------------------------------------------------

export async function getCompletedResourcesAction() {
  try {
    const user = await getRequiredUser();
    return { success: true, data: await db.getCompletedResources(user.id) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function toggleCompletedResourceAction(resourceId: string) {
  try {
    const user = await getRequiredUser();
    const result = await db.toggleCompletedResource(user.id, resourceId);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// EXTRA PROFILE DETAILS (Resume data fallback)
// ----------------------------------------------------

export async function getExtraProfileDetailsAction() {
  try {
    const user = await getRequiredUser();
    return { success: true, data: await db.getExtraProfileDetails(user.id) };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function saveExtraProfileDetailsAction(details: Partial<db.ExtraProfileDetails>) {
  try {
    const user = await getRequiredUser();
    const result = await db.saveExtraProfileDetails(user.id, details);
    return { success: true, data: result };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// BULK RESUME DATA UPDATE ACTION
// ----------------------------------------------------

export async function saveFullResumeDetailsAction(payload: {
  profile: {
    full_name: string;
    college: string;
    department: string;
    graduation_year: number | null;
    skills: string[];
    github_username: string;
    linkedin_url: string;
  };
  extra: {
    phone: string;
    education: any[];
    experience: any[];
    achievements: string[];
  };
  projects: any[];
  certificates: any[];
}) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    // 1. Update Profile Table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: payload.profile.full_name || null,
        college: payload.profile.college || null,
        department: payload.profile.department || null,
        graduation_year: payload.profile.graduation_year || null,
        skills: payload.profile.skills,
        github_username: payload.profile.github_username || null,
        linkedin_url: payload.profile.linkedin_url || null,
      })
      .eq('id', user.id);

    if (profileError) {
      console.warn('Profiles update error:', profileError.message);
    }

    // 2. Update Extra Profile Details (Local Offline Failover)
    await db.saveExtraProfileDetails(user.id, payload.extra);

    // 3. Projects are managed in their own dedicated UI (ProjectsClient)
    // Removed silent overwrite bug: no longer clearing and syncing projects here.

    // 4. Clear and Sync Certificates
    try {
      await supabase.from('certificates').delete().eq('user_id', user.id);
      
      const localDb = db.readLocalDb();
      localDb.certificates = localDb.certificates.filter((c: any) => c.user_id !== user.id);
      db.writeLocalDb(localDb);

      for (const cert of payload.certificates) {
        await db.addCertificate(
          user.id,
          cert.name,
          cert.issuing_organization,
          cert.issue_date || '',
          cert.credential_url || '',
          cert.file_url || ''
        );
      }
    } catch (err) {
      console.warn('Certificates sync error:', err);
    }

    // 5. Update Readiness Score
    let resumeScore = 0;
    if (payload.profile.full_name) resumeScore += 10;
    if (payload.profile.college) resumeScore += 10;
    if (payload.profile.skills && payload.profile.skills.length > 0) resumeScore += 20;
    if (payload.extra.experience && payload.extra.experience.length > 0) resumeScore += 30;
    if (payload.extra.education && payload.extra.education.length > 0) resumeScore += 10;
    if (payload.projects && payload.projects.length > 0) resumeScore += 20;
    resumeScore = Math.min(100, resumeScore);

    try {
      const { updateReadinessScoreAction } = await import('@/app/actions/progress');
      await updateReadinessScoreAction('resume', resumeScore);
    } catch (e) {
      console.error('Failed to update resume readiness score:', e);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function addProjectAction(form: {
  title: string;
  description: string | null;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
}) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({
        ...form,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Fetch projects count to update score
    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    const score = Math.min((count || 0) * 33, 100);
    const { updateReadinessScoreAction } = await import('@/app/actions/progress');
    await updateReadinessScoreAction('projects', score);

    return { success: true, data: newProject };
  } catch (err: any) {
    console.error('[addProjectAction] Error:', err);
    return { success: false, error: err.message || 'Failed to add project' };
  }
}

export async function updateProjectAction(id: string, form: {
  title: string;
  description: string | null;
  technologies: string[];
  github_url: string | null;
  live_url: string | null;
}) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    const score = Math.min((count || 0) * 33, 100);
    const { updateReadinessScoreAction } = await import('@/app/actions/progress');
    await updateReadinessScoreAction('projects', score);

    return { success: true, data: updatedProject };
  } catch (err: any) {
    console.error('[updateProjectAction] Error:', err);
    return { success: false, error: err.message || 'Failed to update project' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    const { count, error: countError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (countError) throw countError;

    const score = Math.min((count || 0) * 33, 100);
    const { updateReadinessScoreAction } = await import('@/app/actions/progress');
    await updateReadinessScoreAction('projects', score);

    return { success: true };
  } catch (err: any) {
    console.error('[deleteProjectAction] Error:', err);
    return { success: false, error: err.message || 'Failed to delete project' };
  }
}

export async function updateProfileAction(formData: {
  full_name: string;
  college: string;
  department: string;
  graduation_year: number | null;
  skills: string[];
  resume_url: string | null;
  github_username: string | null;
  linkedin_url: string | null;
}) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: formData.full_name || null,
        college: formData.college || null,
        department: formData.department || null,
        graduation_year: formData.graduation_year || null,
        skills: formData.skills,
        resume_url: formData.resume_url || null,
        github_username: formData.github_username || null,
        linkedin_url: formData.linkedin_url || null,
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // Recalculate resume score
    const { data: extra } = await supabase
      .from('extra_profile_details')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    let resumeScore = 0;
    if (formData.full_name) resumeScore += 10;
    if (formData.college) resumeScore += 10;
    if (formData.skills && formData.skills.length > 0) resumeScore += 20;
    if (extra?.experience && (extra.experience as any[]).length > 0) resumeScore += 30;
    if (extra?.education && (extra.education as any[]).length > 0) resumeScore += 10;
    if ((projectsCount || 0) > 0) resumeScore += 20;
    resumeScore = Math.min(100, resumeScore);

    const { updateReadinessScoreAction } = await import('@/app/actions/progress');
    await updateReadinessScoreAction('resume', resumeScore);

    return { success: true };
  } catch (err: any) {
    console.error('[updateProfileAction] Error:', err);
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

// ----------------------------------------------------
// MENTOR COMMUNICATION — Student side
// ----------------------------------------------------

/**
 * Student sends a message to their assigned mentor.
 * Uses the existing feedback table with type='student' to avoid creating a new table.
 */
export async function sendStudentMessageAction(message: string) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    // Get assigned mentor from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('mentor_id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('Could not fetch your profile.');
    const mentorId = (profile as any).mentor_id as string | null;
    if (!mentorId) throw new Error('You do not have an assigned mentor yet.');

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        mentor_id: mentorId,
        student_id: user.id,
        message: `Reply: ${message}`,
        type: 'student',
        category: null,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ----------------------------------------------------
// COURSE SUGGESTIONS — Mentor side action (called from CourseSuggestionsClient)
// ----------------------------------------------------

/**
 * Mentor suggests a course to a student.
 * Stored in feedback table with type='suggestion' and suggestion_details JSONB.
 */
export async function suggestCourseAction(
  studentId: string,
  title: string,
  platform: string,
  url: string,
  category: string,
  comment: string
) {
  try {
    const user = await getRequiredUser();
    const supabase = await createClient();

    const messageText = comment.trim()
      ? comment.trim()
      : `Course Suggestion: ${title} on ${platform}`;

    const { data, error } = await supabase
      .from('feedback')
      .insert({
        mentor_id: user.id,
        student_id: studentId,
        message: messageText,
        category: category || null,
        type: 'suggestion',
        suggestion_details: { title, platform, url },
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
