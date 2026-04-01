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
 * Score formula:
 *   +3  if card category matches user's setting context
 *   +2  if card category is in user's preferred_categories
 *   +N  practice_relevance_score (1–5) as direct additive bonus
 *   -2  if card was already read
 *
 * Cards are sorted by score descending, then by published_at descending (recency tiebreak).
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

    // Practice relevance as multiplier-like additive
    score += card.practice_relevance_score ?? 0;

    // Deprioritize already-read cards
    if (input.readCardIds.has(card.id)) {
      score -= 2;
    }

    return { card, score };
  });

  // Sort: highest score first, then newest first for same score
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const dateA = a.card.published_at ?? a.card.created_at;
    const dateB = b.card.published_at ?? b.card.created_at;
    return dateB.localeCompare(dateA);
  });

  return scored.map(s => s.card);
}
