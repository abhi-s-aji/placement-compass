import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProjectsClient from '@/components/ProjectsClient';

export const metadata = { title: 'Projects - Placement Compass' };
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');


  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Projects</h1>
        </div>
      </div>
      <div className="page-body">
        <div className="mb-6">
          <div className="page-section-title">Your Projects</div>
          <p className="page-section-subtitle">Showcase your work. Projects are a critical part of your placement readiness score.</p>
        </div>
        <ProjectsClient userId={user.id} initialProjects={projects ?? []} />
      </div>
    </div>
  );
}
