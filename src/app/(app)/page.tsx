import { createClient } from '@/lib/supabase/server';
import NewsFeed from '@/components/news/NewsFeed';
import HomeHeader from '@/components/layout/HomeHeader';
import type { NewsCard } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ category?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Build query
  let query = supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30);

  // Category filter
  if (params.category) {
    query = query.eq('category_main', params.category);
  }

  // Search filter
  if (params.q) {
    query = query.or(`headline.ilike.%${params.q}%,snack_what.ilike.%${params.q}%,therapist_check.ilike.%${params.q}%`);
  }

  const { data: newsCards } = await query;
  const { data: { user } } = await supabase.auth.getUser();

  // Load user interactions and like counts
  let enrichedCards: NewsCard[] = newsCards ?? [];

  if (enrichedCards.length > 0) {
    const cardIds = enrichedCards.map(c => c.id);

    // Get like counts for all cards
    const { data: likeCounts } = await supabase
      .from('likes')
      .select('news_card_id')
      .in('news_card_id', cardIds);

    const likeCountMap: Record<string, number> = {};
    likeCounts?.forEach(l => {
      likeCountMap[l.news_card_id] = (likeCountMap[l.news_card_id] ?? 0) + 1;
    });

    if (user) {
      // Get user's likes
      const { data: userLikes } = await supabase
        .from('likes')
        .select('news_card_id')
        .eq('user_id', user.id)
        .in('news_card_id', cardIds);

      const userLikeSet = new Set(userLikes?.map(l => l.news_card_id));

      // Get user's bookmarks
      const { data: userBookmarks } = await supabase
        .from('bookmarks')
        .select('news_card_id')
        .eq('user_id', user.id)
        .in('news_card_id', cardIds);

      const userBookmarkSet = new Set(userBookmarks?.map(b => b.news_card_id));

      enrichedCards = enrichedCards.map(card => ({
        ...card,
        like_count: likeCountMap[card.id] ?? 0,
        user_has_liked: userLikeSet.has(card.id),
        user_has_bookmarked: userBookmarkSet.has(card.id),
      }));
    } else {
      enrichedCards = enrichedCards.map(card => ({
        ...card,
        like_count: likeCountMap[card.id] ?? 0,
      }));
    }
  }

  return (
    <div>
      <HomeHeader
        user={user}
        activeCategory={params.category ?? null}
        searchQuery={params.q ?? ''}
      />
      <NewsFeed initialCards={enrichedCards} userId={user?.id ?? null} />
    </div>
  );
}
