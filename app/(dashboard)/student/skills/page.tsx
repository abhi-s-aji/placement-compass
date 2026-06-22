import { getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import * as db from '@/lib/supabase/hybrid-db';
import SkillsTrackerClient from '@/components/SkillsTrackerClient';

export const metadata = { title: 'Skill Tracker - Placement Compass' };

export default async function SkillsPage() {
  const { user } = await getSessionUser();
  if (!user) redirect('/login');

  // Fetch target skills for user
  const targetSkillsData = await db.getTargetSkills(user.id);
  const targetSkills = targetSkillsData.map(s => s.skill);

  // Fetch completed resources for user
  const completedResourcesData = await db.getCompletedResources(user.id);
  const completedResourceIds = completedResourcesData.map(r => r.resource_id);

  return (
    <SkillsTrackerClient
      userId={user.id}
      initialTargetSkills={targetSkills}
      initialCompletedResourceIds={completedResourceIds}
    />
  );
}
