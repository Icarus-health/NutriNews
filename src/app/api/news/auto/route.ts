import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { RSS_SOURCES } from '@/lib/agent/sources';
import { fetchAllFeeds } from '@/lib/agent/rss';
import { curateArticle } from '@/lib/agent/curate';
import { resolveCategory } from '@/lib/categories';
import { rateLimit } from '@/lib/rate-limit';

// Vercel Hobby max: 60s
export const maxDuration = 60;

// POST /api/news/auto - startet den News-Kurator-Agenten
export async function POST(request: Request) {
  // Rate limit: max 3 runs per 10 minutes
  const { success: allowed } = rateLimit('auto-agent', 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warte einige Minuten.' }, { status: 429 });
  }

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

    // 2. Filter out URLs already in database (batch to avoid URL length limits)
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
      return NextResponse.json({ message: 'Alle Artikel sind bereits in der Datenbank.', created: 0 });
    }

    // 3. Select diverse mix with MINIMUM QUOTAS per source type
    const byType: Record<string, typeof newItems> = {};
    for (const item of newItems) {
      const t = item.source.sourceType;
      if (!byType[t]) byType[t] = [];
      byType[t].push(item);
    }

    const toCurate: typeof newItems = [];
    // Vercel Hobby: 60s timeout → ~10 Claude-Aufrufe realistisch
    const TARGET = 10;
    const CANDIDATE_POOL = 12;

    // Diversitäts-Quotas: Berufspolitik und Laienpresse stärker gewichten
    const minQuotas: Record<string, number> = {
      berufspolitik: 3,
      laienpresse: 2,
      fachpresse: 2,
      international: 1,
      supplement: 1,
      forschung: 2,
    };

    // First pass: fill minimum quotas
    for (const [type, min] of Object.entries(minQuotas)) {
      const items = byType[type] ?? [];
      const take = Math.min(min, items.length);
      for (let i = 0; i < take; i++) {
        toCurate.push(items[i]);
      }
    }

    // Second pass: fill remaining slots with round-robin from all types
    const usedPerType: Record<string, number> = {};
    for (const item of toCurate) {
      usedPerType[item.source.sourceType] = (usedPerType[item.source.sourceType] ?? 0) + 1;
    }

    const types = Object.keys(byType);
    let round = 0;
    while (toCurate.length < CANDIDATE_POOL) {
      let added = false;
      for (const type of types) {
        const startIdx = usedPerType[type] ?? 0;
        if (byType[type][startIdx + round]) {
          toCurate.push(byType[type][startIdx + round]);
          added = true;
          if (toCurate.length >= CANDIDATE_POOL) break;
        }
      }
      if (!added) break;
      round++;
    }

    let created = 0;
    const errors: string[] = [];

    // Process in parallel batches of 5, stop once we reach 20 created
    const CURATE_BATCH_SIZE = 5;
    for (let i = 0; i < toCurate.length && created < TARGET; i += CURATE_BATCH_SIZE) {
      const batch = toCurate.slice(i, i + CURATE_BATCH_SIZE);
      const results = await Promise.all(batch.map(item => curateArticle(item)));

      // Save each result immediately
      for (let j = 0; j < results.length; j++) {
        if (created >= TARGET) break;
        const result = results[j];
        if (!result) {
          errors.push(`Uebersprungen: ${batch[j].title}`);
          continue;
        }

        const item = batch[j];
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
          status: 'draft',
          curated_by: user.id,
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
        });

        if (error) {
          errors.push(`DB-Fehler: ${item.title}`);
        } else {
          created++;
        }
      }
    }

    // Revalidate admin page so drafts appear immediately
    revalidatePath('/admin');
    revalidatePath('/');

    return NextResponse.json({
      message: `${created} neue Entwuerfe erstellt.${errors.length > 0 ? ` ${errors.length} uebersprungen.` : ''}`,
      created,
      total_checked: toCurate.length,
      skipped: errors.length,
      source_types_checked: types,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Auto-agent error:', error);
    return NextResponse.json({ error: 'Agent-Fehler aufgetreten' }, { status: 500 });
  }
}
