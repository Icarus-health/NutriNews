import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import NewsFeed from '@/components/news/NewsFeed';
import { getCategoryLabel } from '@/lib/categories';
import type { NewsCard } from '@/types/database';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: card } = await supabase
    .from('news_cards')
    .select('headline, therapist_check, category_main, source_name')
    .eq('id', id)
    .single();

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
  const supabase = await createClient();

  const { data: card } = await supabase
    .from('news_cards')
    .select('*')
    .eq('id', id)
    .eq('status', 'published')
    .single();

  if (!card) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  // Enrich with like/bookmark data
  const enrichedCard: NewsCard = { ...card, like_count: 0 };

  const { data: likeCounts } = await supabase
    .from('likes')
    .select('news_card_id')
    .eq('news_card_id', id);

  enrichedCard.like_count = likeCounts?.length ?? 0;

  if (user) {
    const [{ data: userLike }, { data: userBookmark }] = await Promise.all([
      supabase.from('likes').select('user_id').eq('user_id', user.id).eq('news_card_id', id).single(),
      supabase.from('bookmarks').select('user_id').eq('user_id', user.id).eq('news_card_id', id).single(),
    ]);
    enrichedCard.user_has_liked = !!userLike;
    enrichedCard.user_has_bookmarked = !!userBookmark;
  }

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
      <NewsFeed initialCards={[enrichedCard]} userId={user?.id ?? null} />
    </div>
  );
}
