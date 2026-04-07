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
      .select('id, headline, category_main, practice_relevance_score, published_at')
      .eq('status', 'published')
      .gte('practice_relevance_score', 4)
      .gte('published_at', cutoff)
      .order('practice_relevance_score', { ascending: false })
      .limit(3);
    return (data ?? []) as Pick<NewsCard, 'id' | 'headline' | 'category_main' | 'practice_relevance_score' | 'published_at'>[];
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
    rank: i,
  }));

  return <TopOfWeekClient items={items} />;
}
