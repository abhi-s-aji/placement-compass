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

