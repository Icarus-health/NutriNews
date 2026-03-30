import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { RSS_SOURCES } from '@/lib/agent/sources';
import { fetchAllFeeds } from '@/lib/agent/rss';
import { curateArticle } from '@/lib/agent/curate';
import { resolveCategory } from '@/lib/categories';

// POST /api/news/auto - startet den News-Kurator-Agenten
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    // 1. Fetch all RSS feeds
    const allItems = await fetchAllFeeds(RSS_SOURCES);

    if (allItems.length === 0) {
      return NextResponse.json({ message: 'Keine neuen Artikel in den RSS-Feeds gefunden.', created: 0 });
    }

    // 2. Filter out URLs already in database
    const urls = allItems.map(item => item.link).filter(Boolean);
    const { data: existingCards } = await supabase
      .from('news_cards')
      .select('source_url')
      .in('source_url', urls);

    const existingUrls = new Set(existingCards?.map(c => c.source_url) ?? []);
    const newItems = allItems.filter(item => item.link && !existingUrls.has(item.link));

    if (newItems.length === 0) {
      return NextResponse.json({ message: 'Alle Artikel sind bereits in der Datenbank.', created: 0 });
    }

    // 3. Curate top 5 new items via AI
    const toCurate = newItems.slice(0, 5);
    let created = 0;
    const errors: string[] = [];

    for (const item of toCurate) {
      const result = await curateArticle(item);
      if (!result) {
        errors.push(`Uebersprungen: ${item.title}`);
        continue;
      }

      // Resolve category to new system
      const resolvedCategory = resolveCategory(result.category_main);

      // 4. Save as draft with extended fields
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
        status: 'draft',
        curated_by: user.id,
        curated_by_agent: true,
        // Sprint 1: Erweiterte Felder
        practice_relevance_score: result.practice_relevance_score,
        action_recommendation: result.action_recommendation,
        patient_question_anticipation: result.patient_question_anticipation,
        evidence_summary: result.evidence_summary,
        source_type: item.source.sourceType,
        lay_press_fact_check: result.lay_press_fact_check,
      });

      if (error) {
        errors.push(`DB-Fehler: ${item.title}`);
      } else {
        created++;
      }
    }

    return NextResponse.json({
      message: `${created} neue Entwuerfe erstellt.${errors.length > 0 ? ` ${errors.length} uebersprungen.` : ''}`,
      created,
      skipped: errors.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Auto-agent error:', error);
    return NextResponse.json({ error: 'Agent-Fehler aufgetreten' }, { status: 500 });
  }
}
