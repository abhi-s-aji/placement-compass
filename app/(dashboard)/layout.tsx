import { createClient, getSessionUser } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { Profile } from '@/lib/types';
import { cookies } from 'next/headers';

// Helper to check if an error is due to a network connection timeout or fetch failure
function isNetworkError(error: any): boolean {
  if (!error) return false;
  const errMsg = (error.message || '').toLowerCase();
  const errCode = (error.code || '').toLowerCase();
  return (
    errMsg.includes('timeout') ||
    errMsg.includes('fetch failed') ||
    errMsg.includes('connecttimeouterror') ||
    errMsg.includes('network') ||
    errMsg.includes('aborted') ||
    errCode.includes('timeout') ||
    errCode.includes('und_err_connect_timeout')
  );
}

// Safely provision a fallback profile in offline mode
function fallbackSessionExists(cookieStore: any): Profile {
  return {
    id: 'offline-user',
    email: '',
    full_name: 'User (Offline)',
    role: 'student',
    college: 'Offline Mode',
    department: 'Offline Mode',
    graduation_year: null,
    skills: [],
    resume_url: null,
    github_username: null,
    linkedin_url: null,
    avatar_url: null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const hasSessionCookie = cookieStore.getAll().some(c => c.name.includes('-auth-token'));

  let user = null;
  let authError = null;
  let isOffline = false;

  try {
    const { user: cachedUser, error: cachedError } = await getSessionUser();
    user = cachedUser;
    authError = cachedError;
  } catch (err: any) {
    console.warn('[DashboardLayout] Auth check failed:', err.message || err);
    authError = err;
  }

  if (isNetworkError(authError)) {
    isOffline = true;
  }

  // Redirect to login only when there is definitely no auth cookie, OR the session is truly invalid (non-network error)
  const isAuthInvalid = authError && !isNetworkError(authError);
  if (!hasSessionCookie || (!user && isAuthInvalid)) {
    redirect('/login');
  }

  let profile = null;
  let profileError = null;

  if (!isOffline && user) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
      profileError = error;
    } catch (err: any) {
      console.warn('[DashboardLayout] Profile fetch failed:', err.message || err);
      profileError = err;
    }
  }

  if (isNetworkError(profileError)) {
    isOffline = true;
  }

  let currentProfile = profile;

  if (isOffline || !currentProfile) {
    currentProfile = fallbackSessionExists(cookieStore);
    isOffline = true;
  }

  // If the query failed with a real database/schema cache issue (like PGRST205 / missing table), show migrations setup page
  if (profileError && profileError.code !== 'PGRST116' && !isNetworkError(profileError)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-zinc-950 text-zinc-100" style={{ fontFamily: 'var(--font-family)' }}>
        <div style={{ maxWidth: '480px', padding: '2rem', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ color: 'var(--color-error)', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Error</div>
          <h1 className="text-lg font-bold text-primary mb-2">Database Setup Required</h1>
          <p className="text-sm text-secondary mb-4" style={{ lineHeight: 1.6 }}>
            Your account is created but the database profile setup is incomplete. Please run migrations.
          </p>
          <div style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', marginBottom: '1.5rem', overflowX: 'auto' }}>
            <strong>Error Code:</strong> {profileError.code}<br/>
            <strong>Details:</strong> {profileError.message}
          </div>
          <p className="text-xs text-muted">
            Please run the SQL migration script (found in <code>supabase/migrations/001_initial_schema.sql</code>) in your Supabase SQL Editor to complete the setup.
          </p>
        </div>
      </div>
    );
  }

  // Standard default profile provisioning if Supabase is working but profile is null
  if (!currentProfile && user && !isOffline) {
    console.log('Profile does not exist. Provisioning default profile for user:', user.id);
    
    try {
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email!,
          full_name: user.user_metadata?.full_name || '',
          role: 'student',
        })
        .select()
        .single();

      if (createError) {
        if (isNetworkError(createError)) {
          isOffline = true;
          currentProfile = fallbackSessionExists(cookieStore);
        } else {
          console.error('Failed to create default profile:', createError);
          return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-zinc-950 text-zinc-100" style={{ fontFamily: 'var(--font-family)' }}>
              <div style={{ maxWidth: '480px', padding: '2rem', backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <h1 className="text-lg font-bold text-primary mb-2">Profile Creation Failed</h1>
                <p className="text-sm text-secondary mb-4">
                  Your account is created but the database profile setup is incomplete. Please run migrations.
                </p>
                <div style={{ backgroundColor: 'var(--color-bg-tertiary)', border: '1px solid var(--color-border-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'left', fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', overflowX: 'auto' }}>
                  {createError.message}
                </div>
              </div>
            </div>
          );
        }
      } else {
        // Provision a corresponding progress record
        await supabase.from('progress').upsert({ user_id: user.id }, { onConflict: 'user_id' });
        currentProfile = newProfile;
      }
    } catch (err: any) {
      if (isNetworkError(err)) {
        isOffline = true;
        currentProfile = fallbackSessionExists(cookieStore);
      } else {
        throw err;
      }
    }
  }

  // Fallback to minimal profile if still null
  if (!currentProfile) {
    currentProfile = {
      id: user?.id || 'guest',
      email: user?.email || '',
      full_name: user?.user_metadata?.full_name || 'Guest User',
      role: 'student',
      college: null,
      department: null,
      graduation_year: null,
      skills: [],
      resume_url: null,
      github_username: null,
      linkedin_url: null,
      avatar_url: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return (
    <DashboardShell profile={currentProfile as Profile} isOffline={isOffline}>
      {children}
    </DashboardShell>
  );
}



