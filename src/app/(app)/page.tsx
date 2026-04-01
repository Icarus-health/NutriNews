import { createClient } from '@/lib/supabase/server';
import NewsFeed from '@/components/news/NewsFeed';
import HomeHeader from '@/components/layout/HomeHeader';
import DailyBriefing from '@/components/briefing/DailyBriefing';
import { rankCards, interleaveBySourceType } from '@/lib/feed-ranking';
import type { NewsCard, DailyBriefing as DailyBriefingType, Profile } from '@/types/database';

// ISR: revalidate every 60s
export const revalidate = 60;

interface PageProps {
  searchParams: Promise<{ categories?: string; q?: string; evidence?: string; days?: string; minRelevance?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  // Parse filters
  const activeCategories = params.categories ? params.categories.split(',').filter(Boolean) : [];
  const evidenceFilter = params.evidence ? params.evidence.split(',').filter(Boolean) : [];
  const daysFilter = params.days ? parseInt(params.days, 10) : null;
  const minRelevance = params.minRelevance ? parseInt(params.minRelevance, 10) : null;

  // Build query — ALL source types in one feed
  let query = supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(15);

  if (activeCategories.length === 1) {
    query = query.eq('category_main', activeCategories[0]);
  } else if (activeCategories.length > 1) {
    query = query.in('category_main', activeCategories);
  }

  if (evidenceFilter.length === 1) {
    query = query.eq('evidence_level', evidenceFilter[0]);
  } else if (evidenceFilter.length > 1) {
    query = query.in('evidence_level', evidenceFilter);
  }

  if (daysFilter && daysFilter > 0) {
    const cutoff = new Date(Date.now() - daysFilter * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('published_at', cutoff);
  }

  if (minRelevance && minRelevance >= 1 && minRelevance <= 5) {
    query = query.gte('practice_relevance_score', minRelevance);
  }

  if (params.q) {
    query = query.or(`headline.ilike.%${params.q}%,snack_what.ilike.%${params.q}%,therapist_check.ilike.%${params.q}%`);
  }

  // Parallel: fetch cards + user
  const [{ data: newsCards }, { data: { user } }] = await Promise.all([
    query,
    supabase.auth.getUser(),
  ]);

  let allCards: NewsCard[] = newsCards ?? [];
  const hasFilters = activeCategories.length > 0 || !!params.q || evidenceFilter.length > 0 || !!daysFilter || !!minRelevance;

  // ── Batched enrichment ──
  if (allCards.length > 0) {
    const cardIds = allCards.map(c => c.id);

    const likeCountPromise = supabase
      .from('likes')
      .select('news_card_id')
      .in('news_card_id', cardIds);

    const userLikesPromise = user
      ? supabase.from('likes').select('news_card_id').eq('user_id', user.id).in('news_card_id', cardIds)
      : null;

    const userBookmarksPromise = user
      ? supabase.from('bookmarks').select('news_card_id').eq('user_id', user.id).in('news_card_id', cardIds)
      : null;

    const profilePromise = user
      ? supabase.from('profiles').select('*').eq('id', user.id).single()
      : null;

    const [{ data: likeCounts }, userLikesResult, userBookmarksResult, profileResult] = await Promise.all([
      likeCountPromise,
      userLikesPromise,
      userBookmarksPromise,
      profilePromise,
    ]);

    const likeCountMap: Record<string, number> = {};
    likeCounts?.forEach(l => {
      likeCountMap[l.news_card_id] = (likeCountMap[l.news_card_id] ?? 0) + 1;
    });

    const userLikeSet = new Set(userLikesResult?.data?.map(l => l.news_card_id));
    const userBookmarkSet = new Set(userBookmarksResult?.data?.map(b => b.news_card_id));
    const profile = profileResult?.data as Profile | null;

    allCards = allCards.map(card => ({
      ...card,
      like_count: likeCountMap[card.id] ?? 0,
      ...(user ? {
        user_has_liked: userLikeSet.has(card.id),
        user_has_bookmarked: userBookmarkSet.has(card.id),
      } : {}),
    }));

    // Personalized ranking (within same day)
    if (profile && (profile.setting || profile.preferred_categories.length > 0)) {
      allCards = rankCards(allCards, {
        setting: profile.setting,
        preferredCategories: profile.preferred_categories,
        readCardIds: new Set<string>(),
      });
    }

    // Interleave source types for diversity
    allCards = interleaveBySourceType(allCards);
  }

  // Load daily briefing (only when no filters)
  let briefingData: { briefing: DailyBriefingType | null; isYesterday: boolean } = { briefing: null, isYesterday: false };
  if (!hasFilters) {
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
        evidenceFilter={evidenceFilter}
        daysFilter={params.days}
        minRelevance={params.minRelevance}
      />
      {briefingData.briefing && (
        <DailyBriefing
          items={briefingData.briefing.items}
          date={briefingData.briefing.date}
          isYesterday={briefingData.isYesterday}
        />
      )}
      <NewsFeed
        initialCards={allCards}
        userId={user?.id ?? null}
        filters={{
          categories: activeCategories.length > 0 ? activeCategories : undefined,
          q: params.q || undefined,
          evidence: evidenceFilter.length > 0 ? evidenceFilter : undefined,
          days: daysFilter ?? undefined,
          minRelevance: minRelevance ?? undefined,
        }}
      />
    </div>
  );
}
