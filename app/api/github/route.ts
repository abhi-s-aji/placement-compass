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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    const { username } = await request.json();
    if (!username) {
      return NextResponse.json({ error: 'GitHub username is required' }, { status: 400 });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'PlacementCompass/1.0',
    };

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) {
      if (userRes.status === 404) {
        return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'GitHub API error' }, { status: 500 });
    }
    const githubUser: GitHubUser = await userRes.json();

    // Fetch repos
    const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`, { headers });
    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];

    // Fetch recent events (for activity count)
    const eventsRes = await fetch(`https://api.github.com/users/${username}/events/public?per_page=100`, { headers });
    const events = eventsRes.ok ? await eventsRes.json() : [];
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentEventCount = events.filter((e: { created_at: string }) =>
      new Date(e.created_at) > thirtyDaysAgo
    ).length;

    // Calculate language distribution
    const langMap: Record<string, number> = {};
    repos.forEach((r: GitHubRepo) => {
      if (r.language) langMap[r.language] = (langMap[r.language] || 0) + 1;
    });

    const topRepos = repos
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

    const githubScore = calculateGitHubScore(githubUser, repos, recentEventCount);

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

      // Update github_score in progress
      await supabase.from('progress').update({ github_score: githubScore }).eq('user_id', user.id);
    }

    return NextResponse.json({
      user: githubUser,
      repos: topRepos,
      languages: langMap,
      recentActivityCount: recentEventCount,
      score: githubScore,
    });
  } catch (err) {
    console.error('GitHub API error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
