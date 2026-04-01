import type { NewsCard, TherapistSetting } from '@/types/database';
import { CATEGORY_CONTEXTS } from '@/lib/categories';

// ═══════════════════════════════════════════════════════════════
// Feed-Personalisierung: Ranking basierend auf Nutzerprofil
// Setting-relevante Kategorien → preferred_categories → Praxisrelevanz → Lesehistorie
// ═══════════════════════════════════════════════════════════════

/** Maps a therapist setting to the most relevant category context IDs */
const SETTING_CONTEXT_MAP: Record<TherapistSetting, string[]> = {
  akutklinik: ['klinisch'],
  rehabilitation: ['klinisch', 'praevention'],
  ambulant: ['ambulant'],
  psychiatrie: ['ambulant'],
  langzeitpflege: ['klinisch'],
  praevention: ['praevention'],
  forschung_lehre: ['forschung'],
};

/** Resolves a context ID to its topic (category) names */
function getContextCategories(contextIds: string[]): Set<string> {
  const cats = new Set<string>();
  for (const ctx of CATEGORY_CONTEXTS) {
    if (contextIds.includes(ctx.id)) {
      for (const topic of ctx.topics) {
        cats.add(topic);
      }
    }
  }
  return cats;
}

export interface RankingInput {
  setting: TherapistSetting | null;
  preferredCategories: string[];
  readCardIds: Set<string>;
}

/**
 * Ranks news cards for a specific user profile.
 * Primary sort: published_at descending (newest first, always).
 * Within same-day articles, boost by preference score:
 *   +3  if card category matches user's setting context
 *   +2  if card category is in user's preferred_categories
 *   -2  if card was already read
 *
 * This ensures newest articles always appear at the top,
 * with personalization only reordering within the same day.
 */
export function rankCards(cards: NewsCard[], input: RankingInput): NewsCard[] {
  const settingCategories = input.setting
    ? getContextCategories(SETTING_CONTEXT_MAP[input.setting] ?? [])
    : new Set<string>();

  const preferredSet = new Set(input.preferredCategories);

  const scored = cards.map(card => {
    let score = 0;

    // Setting boost
    if (settingCategories.has(card.category_main)) {
      score += 3;
    }

    // Preferred categories boost
    if (preferredSet.has(card.category_main)) {
      score += 2;
    }

    // Practice relevance as additive bonus
    score += card.practice_relevance_score ?? 0;

    // Deprioritize already-read cards
    if (input.readCardIds.has(card.id)) {
      score -= 2;
    }

    // Day bucket for grouping (articles from same day compete on score)
    const dayBucket = (card.published_at ?? card.created_at).slice(0, 10);

    return { card, score, dayBucket };
  });

  // Sort: by day (newest day first), then by score within same day, then by time within same score
  scored.sort((a, b) => {
    // Different days → newest day first
    if (a.dayBucket !== b.dayBucket) return b.dayBucket.localeCompare(a.dayBucket);
    // Same day → highest score first
    if (b.score !== a.score) return b.score - a.score;
    // Same score → newest first
    const dateA = a.card.published_at ?? a.card.created_at;
    const dateB = b.card.published_at ?? b.card.created_at;
    return dateB.localeCompare(dateA);
  });

  return scored.map(s => s.card);
}
