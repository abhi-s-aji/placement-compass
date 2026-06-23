import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProfileForm from '@/components/ProfileForm';
import CertificateManager from '@/components/CertificateManager';
import { Profile } from '@/lib/types';

export const metadata = { title: 'Profile - Placement Compass' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const { user } = await getSessionUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile) redirect('/login');

  // Fetch mentor profile if assigned
  let mentorProfile = null;
  if (profile.mentor_id) {
    const { data: mentorData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profile.mentor_id)
      .maybeSingle();
    mentorProfile = mentorData;
  }

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {/* Mentor Section */}
          <div className="card">
            <h3 className="card-title mb-2">Mentor</h3>
            {mentorProfile ? (
              <div className="flex flex-col gap-3 mt-2">
                <p className="text-sm text-secondary">Your assigned mentor for placement guidance:</p>
                <div className="flex items-start gap-3">
                  <div className="sidebar-user-avatar" style={{ width: 36, height: 36, fontSize: '10px', flexShrink: 0 }}>
                    {(mentorProfile.full_name || mentorProfile.email)
                      .split(' ')
                      .map((n: string) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-primary">{mentorProfile.full_name || 'N/A'}</div>
                    <div className="text-xs text-muted mb-1">{mentorProfile.email}</div>
                    <div className="text-xs text-secondary">
                      <strong>Expertise:</strong> {mentorProfile.department || 'General'}
                      {mentorProfile.skills && mentorProfile.skills.length > 0 ? ` (${mentorProfile.skills.slice(0, 3).join(', ')})` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Link href="/student/mentor-request?tab=messages" className="btn btn-secondary btn-xs" style={{ textDecoration: 'none' }}>
                    Message Mentor
                  </Link>
                  <Link href="/student/mentor-request?tab=recommendations" className="btn btn-primary btn-xs" style={{ textDecoration: 'none' }}>
                    View Recommendations
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-xs text-muted mb-3">You do not have a mentor assigned yet.</p>
                <Link href="/student/mentor-request" className="btn btn-primary btn-sm inline-flex" style={{ textDecoration: 'none' }}>
                  Request Mentor
                </Link>
              </div>
            )}
          </div>

          <ProfileForm profile={profile as Profile} />
          <CertificateManager />
        </div>
      </div>
    </div>
  );
}
