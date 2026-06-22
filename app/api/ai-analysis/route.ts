import { NextRequest, NextResponse } from 'next/server';
import { createClient, getSessionUser } from '@/lib/supabase/server';
import { analyzePlacementReadiness } from '@/lib/readiness-engine';

export async function POST(request: NextRequest) {
  let user: any = null;
  try {
    const sessionRes = await getSessionUser();
    user = sessionRes.user;

    if (!user) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Unauthorized'
      }, { status: 401 });
    }

    const supabase = await createClient();

    // Fetch student data safely
    const [
      profileRes,
      progressRes,
      projectsRes,
      checklistItemsRes,
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('progress').select('*').eq('user_id', user.id).single(),
      supabase.from('projects').select('*').eq('user_id', user.id),
      supabase.from('checklist_items').select('*').eq('user_id', user.id),
    ]);

    const profile = profileRes.data;
    const progress = progressRes.data;
    const projects = projectsRes.data;
    const checklistItems = checklistItemsRes.data;

    if (!profile) {
      return NextResponse.json({
        success: false,
        data: null,
        error: 'Profile not found'
      }, { status: 404 });
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
    }

    const reportDate = dbReport ? dbReport.created_at : new Date().toISOString();
    const reportId = dbReport ? dbReport.id : 'fallback-report-id';

    return NextResponse.json({
      success: true,
      data: {
        // Centralized API response contract fields
        score: analysis.readiness_percentage,
        breakdown: {
          resume: progress?.resume_score ?? 0,
          github: progress?.github_score ?? 0,
          linkedin: progress?.linkedin_score ?? 0,
          projects: progress?.project_score ?? 0,
          coding: progress?.coding_score ?? 0,
          aptitude: progress?.aptitude_score ?? 0,
          interview: progress?.interview_score ?? 0,
        },
        insights: analysis.recommendations || [],

        // UI page compatibility fields
        id: reportId,
        user_id: user.id,
        readiness_percentage: analysis.readiness_percentage,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        recommendations: analysis.recommendations,
        thirty_day_plan: analysis.thirty_day_plan,
        created_at: reportDate,
      },
      error: null
    });
  } catch (err: any) {
    console.error('Placement Readiness analysis error:', err);
    return NextResponse.json({
      success: true,
      data: {
        score: 0,
        breakdown: {},
        insights: ["Unable to calculate readiness at this time"],

        // UI fallback fields
        id: 'fallback-id',
        user_id: user ? user.id : 'offline-user',
        readiness_percentage: 0,
        strengths: [],
        weaknesses: [],
        recommendations: ["Unable to calculate readiness at this time"],
        thirty_day_plan: "Unable to calculate readiness at this time",
        created_at: new Date().toISOString(),
      },
      error: null
    });
  }
}
