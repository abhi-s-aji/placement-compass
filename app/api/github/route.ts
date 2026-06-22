import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';

interface GitHubUser {
  login: string;
  name: string;
  bio: string | null;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
  fork: boolean;
}

function calculateGitHubScore(
  user: GitHubUser,
  repos: GitHubRepo[],
  recentEventCount: number
): number {
  let score = 0;

  // Profile completeness (20 pts)
  if (user.bio) score += 10;
  if (user.name) score += 5;
  if (user.avatar_url && !user.avatar_url.includes('gravatar')) score += 5;

  // Repository count (20 pts)
  const ownRepos = repos.filter(r => !r.fork);
  if (ownRepos.length >= 10) score += 20;
  else if (ownRepos.length >= 5) score += 15;
  else if (ownRepos.length >= 3) score += 10;
  else if (ownRepos.length >= 1) score += 5;

  // Has README (15 pts) - approximated by description presence
  const withDescription = repos.filter(r => r.description && r.description.length > 10);
  if (withDescription.length >= 5) score += 15;
  else if (withDescription.length >= 3) score += 10;
  else if (withDescription.length >= 1) score += 5;

  // Recent activity (25 pts)
  if (recentEventCount >= 30) score += 25;
  else if (recentEventCount >= 15) score += 20;
  else if (recentEventCount >= 5) score += 12;
  else if (recentEventCount >= 1) score += 6;

  // Followers (10 pts)
  if (user.followers >= 50) score += 10;
  else if (user.followers >= 20) score += 7;
  else if (user.followers >= 5) score += 4;

  // Language diversity (10 pts)
  const languages = new Set(repos.map(r => r.language).filter(Boolean));
  if (languages.size >= 4) score += 10;
  else if (languages.size >= 2) score += 6;
  else if (languages.size >= 1) score += 3;

  return Math.min(score, 100);
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await getSessionUser();

    if (!user) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const supabase = await createClient();

    let username = '';
    try {
      const body = await request.json();
      username = body.username;
    } catch (err) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Invalid request body'
      }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'GitHub username is required'
      }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PlacementCompass/1.0',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    let githubUser: GitHubUser | null = null;
    let repos: GitHubRepo[] = [];
    let recentEventCount = 0;
    let langMap: Record<string, number> = {};
    let topRepos: any[] = [];
    let githubScore = 0;

    let githubFetchFailed = false;
    let githubErrorMsg = '';

    try {
      const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
      if (!userRes.ok) {
        githubFetchFailed = true;
        if (userRes.status === 404) {
          githubErrorMsg = 'GitHub user not found';
        } else if (userRes.status === 403) {
          githubErrorMsg = 'GitHub API rate limit exceeded. Please try again later.';
        } else {
          githubErrorMsg = 'GitHub API failed';
        }
      } else {
        githubUser = await userRes.json();

        // Fetch repos
        const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
        repos = reposRes.ok ? await reposRes.json() : [];

        // Fetch recent events (for activity count)
        const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers });
        const events = eventsRes.ok ? await eventsRes.json() : [];
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        recentEventCount = events.filter((e: { created_at: string }) =>
          new Date(e.created_at) > thirtyDaysAgo
        ).length;

        // Calculate language distribution
        repos.forEach((r: GitHubRepo) => {
          if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
        });

        topRepos = repos
          .filter((r: GitHubRepo) => !r.fork)
          .slice(0, 6)
          .map((r: GitHubRepo) => ({
            name: r.name,
            description: r.description,
            language: r.language,
            stars: r.stargazers_count,
            forks: r.forks_count,
            updated_at: r.updated_at,
            html_url: r.html_url,
          }));

        if (githubUser) {
          githubScore = calculateGitHubScore(githubUser, repos, recentEventCount);
        }
      }
    } catch (fetchErr) {
      console.warn('Failed to fetch from GitHub API:', fetchErr);
      githubFetchFailed = true;
      githubErrorMsg = 'Network failure connecting to GitHub';
    }

    if (githubFetchFailed || !githubUser) {
      // Add fallback cached profile if GitHub fails
      const { data: cachedData } = await supabase
        .from('github_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: {
            cached: true,
            username: cachedData.username,
            user: {
              login: cachedData.username,
              name: cachedData.username,
              bio: cachedData.bio,
              public_repos: cachedData.repo_count,
              followers: cachedData.followers,
              following: cachedData.following,
            },
            repos: cachedData.public_repos || [],
            languages: cachedData.top_languages || {},
            recentActivityCount: cachedData.recent_activity_count || 0,
            score: cachedData.github_score || 0,
          },
          error: null
        });
      }

      // No cache, return error JSON
      return NextResponse.json({
        success: false,
        data: null,
        error: githubErrorMsg || 'GitHub API failed'
      }, { status: 500 });
    }

    // Save to DB
    const { error: dbError } = await supabase.from('github_data').upsert({
      user_id: user.id,
      username,
      repo_count: githubUser.public_repos,
      public_repos: topRepos,
      top_languages: langMap,
      recent_activity_count: recentEventCount,
      followers: githubUser.followers,
      following: githubUser.following,
      bio: githubUser.bio,
      profile_complete: !!(githubUser.bio && githubUser.name),
      github_score: githubScore,
      last_fetched: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    if (!dbError) {
      // Update github_username on profile
      await supabase.from('profiles').update({ github_username: username }).eq('id', user.id);

      // Update github_score via score engine
      try {
        const { updateReadinessScoreAction } = await import('@/app/actions/progress');
        await updateReadinessScoreAction('github', githubScore);
      } catch (e) {
        console.error('Failed to update github readiness score:', e);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        user: githubUser,
        repos: topRepos,
        languages: langMap,
        recentActivityCount: recentEventCount,
        score: githubScore,
      },
      error: null
    });
  } catch (err: any) {
    console.error('GitHub API error:', err);
    return NextResponse.json({
      success: false,
      data: null,
      error: err.message || 'GitHub API failed'
    }, { status: 500 });
  }
}
