import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { fetchWithTimeout } from './timeout-fetch';

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

export async function updateSession(request: NextRequest, event?: any) {
  let supabaseResponse = NextResponse.next({ request });

  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.some(route =>
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith('/api/')
  );

  const cookiesList = request.cookies.getAll();
  const hasSessionCookie = cookiesList.some(cookie =>
    cookie.name.includes("auth-token") || cookie.name.includes("sb-")
  );

  if (!hasSessionCookie) {
    // Definitely unauthenticated
    if (!isPublicRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // If cookies exist, allow dashboard requests to continue immediately without blocking rendering
  const pathSegments = request.nextUrl.pathname.split('/').filter(Boolean);
  const pathRole = pathSegments[0];
  const isDashboardRoute = ['student', 'mentor', 'admin', 'company'].includes(pathRole);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout,
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  if (isDashboardRoute) {
    // Continue request immediately (do not block dashboard loading)
    if (event && typeof event.waitUntil === 'function') {
      event.waitUntil(
        supabase.auth.getUser().catch(err => {
          console.warn('[Proxy background getUser] failed:', err.message || err);
        })
      );
    } else {
      supabase.auth.getUser().catch(err => {
        console.warn('[Proxy background getUser] failed:', err.message || err);
      });
    }
    return supabaseResponse;
  }

  // If on public/root routes and cookies exist, try to determine role and redirect
  let user = null;
  let isAuthInvalid = false;

  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      if (!isNetworkError(userError)) {
        isAuthInvalid = true;
      }
    } else {
      user = userData?.user || null;
    }
  } catch (err: any) {
    console.warn('[Proxy] Supabase auth check failed/timed out:', err.message || err);
    if (!isNetworkError(err)) {
      isAuthInvalid = true;
    }
  }

  if (isAuthInvalid) {
    // Truly invalid session (non-network failure) - redirect to /login and clear invalid cookies
    const redirectResponse = isPublicRoute ? supabaseResponse : NextResponse.redirect(new URL('/login', request.url));
    cookiesList.forEach(c => {
      if (c.name.includes('-auth-token')) {
        redirectResponse.cookies.delete(c.name);
      }
    });
    return redirectResponse;
  }

  if (user) {
    const role = user.user_metadata?.role || 'student';
    const url = request.nextUrl.clone();
    url.pathname = `/${role}`;
    return NextResponse.redirect(url);
  }

  // If it was a network failure/timeout, redirect to /student dashboard as fallback
  const url = request.nextUrl.clone();
  url.pathname = '/student';
  return NextResponse.redirect(url);
}




