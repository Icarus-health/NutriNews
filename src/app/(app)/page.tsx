import { createClient } from '@/lib/supabase/server';
import NewsFeed from '@/components/news/NewsFeed';
import HomeHeader from '@/components/layout/HomeHeader';
import LayPressFeed from '@/components/news/LayPressFeed';
import BerufspolitikMonitor from '@/components/news/BerufspolitikMonitor';
import InternationalFeed from '@/components/news/InternationalFeed';
import DailyBriefing from '@/components/briefing/DailyBriefing';
import type { NewsCard, DailyBriefing as DailyBriefingType } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ categories?: string; q?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Parse multi-category filter
  const activeCategories = params.categories ? params.categories.split(',').filter(Boolean) : [];

  // Build query for main feed
  let query = supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30);

  // Category filter (multi-select)
  if (activeCategories.length === 1) {
    query = query.eq('category_main', activeCategories[0]);
  } else if (activeCategories.length > 1) {
    query = query.in('category_main', activeCategories);
  }

  // Search filter
  if (params.q) {
    query = query.or(`headline.ilike.%${params.q}%,snack_what.ilike.%${params.q}%,therapist_check.ilike.%${params.q}%`);
  }

  const { data: newsCards } = await query;
  const { data: { user } } = await supabase.auth.getUser();

  // Separate cards by source type
  const allCards: NewsCard[] = newsCards ?? [];
  const layPressCards = allCards.filter(c => c.source_type === 'laienpresse');
  const berufspolitikCards = allCards.filter(c => c.source_type === 'berufspolitik');
  const internationalCards = allCards.filter(c => c.source_type === 'international');
  const regularCards = allCards.filter(c =>
    c.source_type !== 'laienpresse' &&
    c.source_type !== 'berufspolitik' &&
    c.source_type !== 'international'
  );

  // Load user interactions and like counts
  async function enrichCards(cards: NewsCard[]): Promise<NewsCard[]> {
    if (cards.length === 0) return cards;

    const cardIds = cards.map(c => c.id);

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

      return cards.map(card => ({
        ...card,
        like_count: likeCountMap[card.id] ?? 0,
        user_has_liked: userLikeSet.has(card.id),
        user_has_bookmarked: userBookmarkSet.has(card.id),
      }));
    }

    return cards.map(card => ({
      ...card,
      like_count: likeCountMap[card.id] ?? 0,
    }));
  }

  // Don't show special sections when filtering by category or searching
  const hasFilters = activeCategories.length > 0 || !!params.q;
  const showSpecialSections = !hasFilters;
  const showBriefing = showSpecialSections;

  // When filters active: show ALL matching cards in the main feed (ignore source_type split)
  // When no filters: use the source_type split for special sections
  const enrichedRegular = await enrichCards(hasFilters ? allCards : regularCards);
  const enrichedLayPress = showSpecialSections ? await enrichCards(layPressCards) : [];
  const enrichedBerufspolitik = showSpecialSections ? await enrichCards(berufspolitikCards) : [];
  const enrichedInternational = showSpecialSections ? await enrichCards(internationalCards) : [];

  const showLayPress = showSpecialSections && enrichedLayPress.length > 0;

  // Load daily briefing
  let briefingData: { briefing: DailyBriefingType | null; isYesterday: boolean } = { briefing: null, isYesterday: false };
  if (showBriefing) {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayBriefing } = await supabase
      .from('daily_briefings')
      .select('*')
      .eq('date', today)
      .single();

    if (todayBriefing) {
      briefingData = { briefing: todayBriefing, isYesterday: false };
    } else {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const { data: yesterdayBriefing } = await supabase
        .from('daily_briefings')
        .select('*')
        .eq('date', yesterday)
        .single();

      if (yesterdayBriefing) {
        briefingData = { briefing: yesterdayBriefing, isYesterday: true };
      }
    }
  }

  return (
    <div>
      <HomeHeader
        user={user}
        activeCategories={activeCategories}
        searchQuery={params.q ?? ''}
      />
      {briefingData.briefing && (
        <DailyBriefing
          items={briefingData.briefing.items}
          date={briefingData.briefing.date}
          isYesterday={briefingData.isYesterday}
        />
      )}
      {showSpecialSections && enrichedBerufspolitik.length > 0 && (
        <BerufspolitikMonitor cards={enrichedBerufspolitik} />
      )}
      {showLayPress && (
        <LayPressFeed cards={enrichedLayPress.slice(0, 3)} userId={user?.id ?? null} />
      )}
      {showSpecialSections && enrichedInternational.length > 0 && (
        <InternationalFeed cards={enrichedInternational} />
      )}
      <NewsFeed initialCards={enrichedRegular} userId={user?.id ?? null} />
    </div>
  );
}
