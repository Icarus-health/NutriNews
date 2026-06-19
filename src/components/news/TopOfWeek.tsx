import { unstable_cache } from 'next/cache';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import type { NewsCard } from '@/types/database';
import TopOfWeekClient from './TopOfWeekClient';

function publicSupabase() {
  return createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

const fetchTopCards = unstable_cache(
  async () => {
    const supabase = publicSupabase();
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('news_cards')
      .select('id, headline, category_main, practice_relevance_score, like_count, published_at')
      .eq('status', 'published')
      .gte('practice_relevance_score', 3)
      .gte('published_at', cutoff)
      .order('published_at', { ascending: false })
      .limit(50);
    if (!data || data.length === 0) return [];
    // Score = practice_relevance * 1.5 + log(like_count + 1)
    const scored = data.map(c => ({
      ...c,
      _score: (c.practice_relevance_score ?? 0) * 1.5 + Math.log((c.like_count ?? 0) + 1),
    })).sort((a, b) => b._score - a._score).slice(0, 3);
    return scored as (Pick<NewsCard, 'id' | 'headline' | 'category_main' | 'practice_relevance_score' | 'like_count' | 'published_at'> & { _score: number })[];
  },
  ['top-of-week'],
  { tags: ['news-cards'], revalidate: 3600 },
);

export default async function TopOfWeek() {
  const cards = await fetchTopCards();
  if (cards.length === 0) return null;

  const items = cards.map((card, i) => ({
    id: card.id,
    headline: card.headline,
    categoryStyle: getCategoryStyle(card.category_main),
    categoryLabel: getCategoryLabel(card.category_main),
    likeCount: card.like_count ?? 0,
    rank: i,
  }));

  return <TopOfWeekClient items={items} />;
}
