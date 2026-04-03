import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';
import { RSS_SOURCES } from '@/lib/agent/sources';
import { fetchAllFeeds } from '@/lib/agent/rss';
import { curateArticle } from '@/lib/agent/curate';
import { resolveCategory } from '@/lib/categories';
import { rateLimit } from '@/lib/rate-limit';

// GET /api/news/cron — called by Vercel Cron every 30 minutes
export async function GET(request: Request) {
  // Rate limit: max 4 runs per 30 minutes (slightly above cron frequency)
  const { success: allowed } = rateLimit('cron', 4, 30 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }
  // Verify the request comes from Vercel Cron or a trusted caller
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
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

    // Filter already known URLs (batch to avoid URL length limits)
    const urls = allItems.map(item => item.link).filter(Boolean);
    const existingUrls = new Set<string>();
    const BATCH_SIZE = 50;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const { data: existingCards } = await supabase
        .from('news_cards')
        .select('source_url')
        .in('source_url', batch);
      existingCards?.forEach(c => existingUrls.add(c.source_url));
    }
    const newItems = allItems.filter(item => item.link && !existingUrls.has(item.link));

    if (newItems.length === 0) {
      return NextResponse.json({ message: 'Alle Artikel bereits bekannt.', created: 0 });
    }

    // Diverse selection with minimum quotas per source type
    // Select 25 candidates so we still reach 20 even if some fail curation
    const byType: Record<string, typeof newItems> = {};
    for (const item of newItems) {
      const t = item.source.sourceType;
      if (!byType[t]) byType[t] = [];
      byType[t].push(item);
    }

    const TARGET = 20;
    const CANDIDATE_POOL = 25; // over-select to compensate for failures
    const toCurate: typeof newItems = [];
    const minQuotas: Record<string, number> = {
      laienpresse: 3, berufspolitik: 2, international: 3,
      supplement: 2, fachpresse: 4, forschung: 6,
    };

    // Fill minimum quotas first
    for (const [type, min] of Object.entries(minQuotas)) {
      const items = byType[type] ?? [];
      for (let i = 0; i < Math.min(min, items.length); i++) {
        toCurate.push(items[i]);
      }
    }

    // Fill remaining with round-robin up to CANDIDATE_POOL
    const usedPerType: Record<string, number> = {};
    for (const item of toCurate) {
      usedPerType[item.source.sourceType] = (usedPerType[item.source.sourceType] ?? 0) + 1;
    }
    const types = Object.keys(byType);
    let round = 0;
    while (toCurate.length < CANDIDATE_POOL) {
      let added = false;
      for (const type of types) {
        const start = usedPerType[type] ?? 0;
        if (byType[type][start + round]) {
          toCurate.push(byType[type][start + round]);
          added = true;
          if (toCurate.length >= CANDIDATE_POOL) break;
        }
      }
      if (!added) break;
      round++;
    }

    let created = 0;

    // Process in parallel batches of 5 to stay within Vercel Hobby 60s timeout
    // Stop early once we hit 20 successfully created articles
    const CURATE_BATCH_SIZE = 5;
    for (let i = 0; i < toCurate.length && created < TARGET; i += CURATE_BATCH_SIZE) {
      const batch = toCurate.slice(i, i + CURATE_BATCH_SIZE);
      const results = await Promise.all(batch.map(item => curateArticle(item)));

      await Promise.all(results.map((result, j) => {
        if (!result || created >= TARGET) return Promise.resolve();
        const item = batch[j];
        const resolvedCategory = resolveCategory(result.category_main);
        return supabase.from('news_cards').insert({
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
        }).then(({ error }) => { if (!error) created++; });
      }));
    }

    // Invalidate feed cache so next request gets fresh cards
    revalidateTag('news-cards');

    return NextResponse.json({ message: `${created} neue Artikel veröffentlicht.`, created });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Fehler beim Cron-Job' }, { status: 500 });
  }
}
