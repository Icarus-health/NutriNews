import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { RSS_SOURCES } from '@/lib/agent/sources';
import { fetchAllFeeds } from '@/lib/agent/rss';
import { curateArticle } from '@/lib/agent/curate';
import { resolveCategory } from '@/lib/categories';

// GET /api/news/cron — called by Vercel Cron every 30 minutes
export async function GET(request: Request) {
  // Verify the request comes from Vercel Cron or a trusted caller
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const allItems = await fetchAllFeeds(RSS_SOURCES);
    if (allItems.length === 0) {
      return NextResponse.json({ message: 'Keine neuen Artikel in den RSS-Feeds.', created: 0 });
    }

    // Filter already known URLs
    const urls = allItems.map(item => item.link).filter(Boolean);
    const { data: existingCards } = await supabase
      .from('news_cards')
      .select('source_url')
      .in('source_url', urls);

    const existingUrls = new Set(existingCards?.map(c => c.source_url) ?? []);
    const newItems = allItems.filter(item => item.link && !existingUrls.has(item.link));

    if (newItems.length === 0) {
      return NextResponse.json({ message: 'Alle Artikel bereits bekannt.', created: 0 });
    }

    // Curate up to 8 articles per run
    const toCurate = newItems.slice(0, 8);
    let created = 0;

    for (const item of toCurate) {
      const result = await curateArticle(item);
      if (!result) continue;

      const resolvedCategory = resolveCategory(result.category_main);

      const { error } = await supabase.from('news_cards').insert({
        headline: result.headline,
        snack_what: result.snack_what,
        snack_result: result.snack_result,
        snack_consequence: result.snack_consequence,
        therapist_check: result.therapist_check,
        source_url: item.link,
        source_name: item.source.name,
        category_main: resolvedCategory,
        evidence_level: result.evidence_level,
        read_time_sec: result.read_time_sec,
        status: 'published',
        curated_by_agent: true,
        practice_relevance_score: result.practice_relevance_score,
        action_recommendation: result.action_recommendation,
        patient_question_anticipation: result.patient_question_anticipation,
        evidence_summary: result.evidence_summary,
        source_type: item.source.sourceType,
        lay_press_fact_check: result.lay_press_fact_check,
        policy_impact: result.policy_impact,
        policy_action_needed: result.policy_action_needed,
        international_relevance_de: result.international_relevance_de,
        published_at: new Date().toISOString(),
      });

      if (!error) created++;
    }

    return NextResponse.json({ message: `${created} neue Artikel veröffentlicht.`, created });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Fehler beim Cron-Job' }, { status: 500 });
  }
}
