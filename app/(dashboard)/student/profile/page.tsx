import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/ProfileForm';
import { Profile } from '@/lib/types';

export const metadata = { title: 'Profile - Placement Compass' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');


  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-header-title">Profile</h1>
        </div>
      </div>
      <div className="page-body">
        <div className="mb-6">
          <div className="page-section-title">Your Profile</div>
          <p className="page-section-subtitle">Keep your information up to date for accurate placement readiness tracking.</p>
        </div>
        <ProfileForm profile={profile as Profile} />
      </div>
    </div>
  );
}
