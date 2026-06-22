import { getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import * as db from '@/lib/supabase/hybrid-db';
import ResourcesClient from '@/components/ResourcesClient';

export const metadata = { title: 'Resource Hub - Placement Compass' };

export default async function ResourcesPage() {
  const { user } = await getSessionUser();
  if (!user) redirect('/login');

  // Fetch completed resources for user
  const completedData = await db.getCompletedResources(user.id);
  const completedResourceIds = completedData.map(r => r.resource_id);

  return (
    <ResourcesClient
      initialCompletedIds={completedResourceIds}
    />
  );
}
