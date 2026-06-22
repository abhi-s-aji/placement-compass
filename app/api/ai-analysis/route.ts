import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { analyzePlacementReadiness } from '@/lib/readiness-engine';

export async function POST(request: NextRequest) {
  try {
    const { user } = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch student data
    const [
      { data: profile },
      { data: progress },
      { data: projects },
      { data: checklistItems },
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('progress').select('*').eq('user_id', user.id).single(),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('checklist_items').select('*').eq('user_id', user.id),
    ]);

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Run the local placement readiness analysis
    const analysis = analyzePlacementReadiness({
      profile: profile as any,
      progress: progress as any,
      projects: projects as any,
      checklistItems: checklistItems as any,
    });

    // Save report to database (reusing the ai_reports table)
    const { data: dbReport, error: dbError } = await supabase
      .from('ai_reports')
      .insert({
        user_id: user.id,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        thirty_day_plan: analysis.thirty_day_plan,
        readiness_percentage: analysis.readiness_percentage,
        raw_json: analysis,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database save error:', dbError);
      return NextResponse.json({ error: 'Failed to save analysis report' }, { status: 500 });
    }

    return NextResponse.json(dbReport);
  } catch (err: any) {
    console.error('Placement Readiness analysis error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
