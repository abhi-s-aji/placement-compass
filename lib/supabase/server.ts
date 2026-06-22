import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { fetchWithTimeout } from './timeout-fetch';
import { cache } from 'react';

// Memoize client creation per request
export const createClient = cache(async () => {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore errors in Server Components
          }
        },
      },
    }
  );
});

// Memoize getUser lookup to avoid duplicate remote API calls within a single request lifecycle
export const getSessionUser = cache(async () => {
  const supabase = await createClient();
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error: error || null };
  } catch (err: any) {
    return { user: null, error: err };
  }
});

export async function createAdminClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Ignore
          }
        },
      },
    }
  );
}


