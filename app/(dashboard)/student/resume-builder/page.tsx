import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import * as db from '@/lib/supabase/hybrid-db';
import ResumeBuilderClient from '@/components/ResumeBuilderClient';
import { Profile } from '@/lib/types';

export const metadata = { title: 'Resume Builder - Placement Compass' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ResumeBuilderPage() {
  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');

  // Fetch Profile details
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');

  // Fetch Projects details
  const { data: projects } = await supabase.from('projects').select('*').eq('user_id', user.id);

  // Fetch Certificates details
  const certificates = await db.getCertificates(user.id);

  // Fetch Extra details (phone, experience, achievements, etc.)
  const extraDetails = await db.getExtraProfileDetails(user.id);

  return (
    <ResumeBuilderClient
      initialProfile={profile as Profile}
      initialProjects={projects || []}
      initialCertificates={certificates || []}
      initialExtra={extraDetails}
    />
  );
}
