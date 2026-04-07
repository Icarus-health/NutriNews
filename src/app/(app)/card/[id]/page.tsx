import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import NewsCardComponent from '@/components/news/NewsCard';
import { getCategoryLabel, getCategoryStyle } from '@/lib/categories';
import type { NewsCard } from '@/types/database';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Deduplicated per-request: generateMetadata and the page share one DB call
const getPublishedCard = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('news_cards')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();
  return data;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const card = await getPublishedCard(id);

  if (!card) return { title: 'Nicht gefunden — NutriNews' };

  const description = card.therapist_check?.slice(0, 160) ?? '';
  const category = getCategoryLabel(card.category_main);

  return {
    title: `${card.headline} — NutriNews`,
    description,
    openGraph: {
      title: card.headline,
      description,
      siteName: 'NutriNews',
      type: 'article',
      locale: 'de_DE',
    },
    twitter: {
      card: 'summary',
      title: card.headline,
      description,
    },
    other: {
      'article:section': category,
      ...(card.source_name ? { 'article:source': card.source_name } : {}),
    },
  };
}

export default async function CardPage({ params }: PageProps) {
  const { id } = await params;

  const card = await getPublishedCard(id);

  if (!card) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Enrich with like/bookmark data
  const enrichedCard: NewsCard = { ...card, like_count: 0 };

  const { data: likeCounts } = await supabase
    .from('likes')
    .select('news_card_id')
    .eq('news_card_id', id);

  enrichedCard.like_count = likeCounts?.length ?? 0;

  // Fetch similar articles and user data in parallel
  const similarPromise = supabase
    .from('news_cards')
    .select('id, headline, category_main, practice_relevance_score')
    .eq('status', 'published')
    .eq('category_main', card.category_main)
    .neq('id', id)
    .order('published_at', { ascending: false })
    .limit(3);

  if (user) {
    const [{ data: userLike }, { data: userBookmark }] = await Promise.all([
      supabase.from('likes').select('user_id').eq('user_id', user.id).eq('news_card_id', id).single(),
      supabase.from('bookmarks').select('user_id').eq('user_id', user.id).eq('news_card_id', id).single(),
    ]);
    enrichedCard.user_has_liked = !!userLike;
    enrichedCard.user_has_bookmarked = !!userBookmark;
  }

  const { data: similarCards } = await similarPromise;

  return (
    <div className="pt-2">
      <div className="px-4 mb-3">
        <a
          href="/"
          className="text-[13px] text-forest-600 dark:text-forest-400 font-medium hover:text-forest-700 transition-colors"
        >
          &larr; Zurück zum Feed
        </a>
      </div>
      <div className="px-4">
        <NewsCardComponent
          card={enrichedCard}
          userId={user?.id ?? null}
          defaultFlipped={true}
        />
      </div>
      {similarCards && similarCards.length > 0 && (
        <div className="mx-4 mt-2 mb-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/40 overflow-hidden">
          <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-slate-700/40">
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
              Ähnliche Artikel
            </p>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-slate-700/30">
            {similarCards.map(similar => (
              <li key={similar.id}>
                <Link
                  href={`/card/${similar.id}`}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-100/60 dark:hover:bg-slate-700/30 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
                      {similar.headline}
                    </p>
                    <span className={`inline-block mt-1 text-[9px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full ${getCategoryStyle(similar.category_main)}`}>
                      {getCategoryLabel(similar.category_main)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
