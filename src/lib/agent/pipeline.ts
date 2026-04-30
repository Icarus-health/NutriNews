import type { SupabaseClient } from '@supabase/supabase-js';
import type { RSSItem } from './rss';
import { curateArticle } from './curate';
import { resolveCategory } from '@/lib/categories';

const TARGET = 10;
const CANDIDATE_POOL = 12;
const CURATE_BATCH_SIZE = 5;

const MIN_QUOTAS: Record<string, number> = {
  berufspolitik: 3,
  laienpresse: 2,
  fachpresse: 2,
  international: 1,
  supplement: 1,
  forschung: 2,
};

/** Selects a diverse candidate pool from new items using minimum quotas + round-robin. */
export function selectDiverseCandidates(newItems: RSSItem[]): RSSItem[] {
  const byType: Record<string, RSSItem[]> = {};
  for (const item of newItems) {
    const t = item.source.sourceType;
    if (!byType[t]) byType[t] = [];
    byType[t].push(item);
  }

  const toCurate: RSSItem[] = [];

  for (const [type, min] of Object.entries(MIN_QUOTAS)) {
    const items = byType[type] ?? [];
    for (let i = 0; i < Math.min(min, items.length); i++) {
      toCurate.push(items[i]);
    }
  }

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

  return toCurate;
}

export interface PipelineResult {
  created: number;
  curationFailed: number;
  errors: string[];
}

/**
 * Curates articles and inserts them into Supabase.
 * Processes in parallel batches of 5, stops once TARGET cards are created.
 * The curatedBy param is optional — cron jobs don't have a user context.
 */
export async function runCurationPipeline(
  candidates: RSSItem[],
  supabase: SupabaseClient,
  curatedBy?: string,
): Promise<PipelineResult> {
  let created = 0;
  let curationFailed = 0;
  const errors: string[] = [];

  for (let i = 0; i < candidates.length && created < TARGET; i += CURATE_BATCH_SIZE) {
    const batch = candidates.slice(i, i + CURATE_BATCH_SIZE);
    const outcomes = await Promise.all(batch.map(item => curateArticle(item)));

    for (let j = 0; j < outcomes.length; j++) {
      if (created >= TARGET) break;

      const { result, error: curationError } = outcomes[j];
      if (!result) {
        curationFailed++;
        errors.push(curationError || batch[j].title?.slice(0, 60) || 'unknown');
        continue;
      }

      const item = batch[j];
      const resolvedCategory = resolveCategory(result.category_main);

      const { error: dbError } = await supabase.from('news_cards').insert({
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
        curated_by: curatedBy ?? null,
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

      if (dbError) {
        errors.push(`DB: ${item.title?.slice(0, 40)}: ${dbError.message}`);
      } else {
        created++;
      }
    }
  }

  return { created, curationFailed, errors };
}
