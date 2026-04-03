import { unstable_cache } from 'next/cache';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { getCategoryStyle, getCategoryLabel } from '@/lib/categories';
import type { NewsCard } from '@/types/database';

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

  return (
    <div className="mx-4 mb-4 bg-gradient-to-br from-forest-50 to-emerald-50/50 dark:from-forest-900/20 dark:to-emerald-900/10 rounded-2xl border border-forest-100/60 dark:border-forest-800/30 overflow-hidden">
      <div className="px-4 pt-3 pb-2 border-b border-forest-100/60 dark:border-forest-800/30">
        <p className="text-[11px] font-black uppercase tracking-widest text-forest-600 dark:text-forest-400">
          🏆 Top der Woche
        </p>
      </div>
      <ol className="divide-y divide-forest-100/40 dark:divide-forest-800/20">
        {cards.map((card, i) => (
          <li key={card.id}>
            <Link
              href={`/card/${card.id}`}
              className="flex items-start gap-3 px-4 py-3 hover:bg-forest-50/80 dark:hover:bg-forest-900/20 transition-colors"
            >
              <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black mt-0.5 ${
                i === 0 ? 'bg-amber-400 text-white' :
                i === 1 ? 'bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-200' :
                'bg-amber-700/60 text-white'
              }`}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                  {card.headline}
                </p>
                <span className={`inline-block mt-1 text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${getCategoryStyle(card.category_main)}`}>
                  {getCategoryLabel(card.category_main)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
