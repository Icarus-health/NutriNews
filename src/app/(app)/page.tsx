import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient as createPublicClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import NewsFeed from '@/components/news/NewsFeed';
import HomeHeader from '@/components/layout/HomeHeader';
import DailyBriefing from '@/components/briefing/DailyBriefing';
import TopOfWeek from '@/components/news/TopOfWeek';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { rankCards, interleaveBySourceType } from '@/lib/feed-ranking';
import { evidenceKeyToLevel } from '@/lib/evidence';
import type { NewsCard, DailyBriefing as DailyBriefingType, Profile, EvidenceLevel } from '@/types/database';

// Dynamic: page uses auth + searchParams, must be rendered per-request.
// However the news cards query itself is cached via unstable_cache below.
export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ categories?: string; q?: string; evidence?: string; days?: string; minRelevance?: string }>;
}

interface CardFilters {
  categories: string[];
  evidenceFilter: EvidenceLevel[];
  daysFilter: number | null;
  minRelevance: number | null;
  q: string | null;
}

// Public Supabase client — no cookie auth, safe to use inside unstable_cache
function publicSupabase() {
  return createPublicClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// Cards are cached and revalidated when the cron job inserts new articles
const fetchCachedCards = unstable_cache(
  async (filters: CardFilters) => {
    const supabase = publicSupabase();

    let query = supabase
      .from('news_cards')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(15);

    if (filters.categories.length === 1) {
      query = query.eq('category_main', filters.categories[0]);
    } else if (filters.categories.length > 1) {
      query = query.in('category_main', filters.categories);
    }

    if (filters.evidenceFilter.length === 1) {
      query = query.eq('evidence_level', filters.evidenceFilter[0]);
    } else if (filters.evidenceFilter.length > 1) {
      query = query.in('evidence_level', filters.evidenceFilter);
    }

    if (filters.daysFilter && filters.daysFilter > 0) {
      const cutoff = new Date(Date.now() - filters.daysFilter * 24 * 60 * 60 * 1000).toISOString();
      query = query.gte('published_at', cutoff);
    }

    if (filters.minRelevance && filters.minRelevance >= 1 && filters.minRelevance <= 5) {
      query = query.gte('practice_relevance_score', filters.minRelevance);
    }

    if (filters.q) {
      const q = filters.q
        .replace(/[,().\\]/g, '')
        .replace(/%/g, '\\%')
        .replace(/_/g, '\\_')
        .trim()
        .slice(0, 200);
      if (q) {
        query = query.or(`headline.ilike.%${q}%,snack_what.ilike.%${q}%,therapist_check.ilike.%${q}%`);
      }
    }

    const { data } = await query;
    return (data ?? []) as NewsCard[];
  },
  ['feed-cards'],
  { tags: ['news-cards'], revalidate: 1800 },
);

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Parse filters
  const activeCategories = params.categories ? params.categories.split(',').filter(Boolean) : [];
  const evidenceKeys = params.evidence ? params.evidence.split(',').filter(Boolean) : [];
  const evidenceFilter = evidenceKeys.map(k => evidenceKeyToLevel(k)).filter((v): v is EvidenceLevel => v !== null);
  const daysFilter = params.days ? parseInt(params.days, 10) : null;
  const minRelevance = params.minRelevance ? parseInt(params.minRelevance, 10) : null;
  const hasFilters = activeCategories.length > 0 || !!params.q || evidenceFilter.length > 0 || !!daysFilter || !!minRelevance;

  // Cached cards query + per-request auth + daily briefing, all in parallel
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [cachedCards, { data: { user } }, briefingResult] = await Promise.all([
    fetchCachedCards({
      categories: activeCategories,
      evidenceFilter,
      daysFilter,
      minRelevance,
      q: params.q ?? null,
    }),
    supabase.auth.getUser(),
    // Briefing doesn't depend on the cards — fetch it concurrently (only when unfiltered)
    hasFilters
      ? Promise.resolve(null)
      : supabase
          .from('daily_briefings')
          .select('*')
          .in('date', [today, yesterday])
          .order('date', { ascending: false })
          .limit(1)
          .maybeSingle(),
  ]);

  let allCards: NewsCard[] = cachedCards;

  // ── Per-request enrichment (user-specific data + like counts) ──
  if (allCards.length > 0) {
    const cardIds = allCards.map(c => c.id);

    // like_count is now denormalized on news_cards (kept in sync by a DB trigger),
    // so we no longer fetch + count every like row per request. Only the current
    // user's like/bookmark membership (bounded by the user) is fetched here.
    const userLikesPromise = user
      ? supabase.from('likes').select('news_card_id').eq('user_id', user.id).in('news_card_id', cardIds)
      : null;

    const userBookmarksPromise = user
      ? supabase.from('bookmarks').select('news_card_id').eq('user_id', user.id).in('news_card_id', cardIds)
      : null;

    const profilePromise = user
      ? supabase.from('profiles').select('*').eq('id', user.id).single()
      : null;

    const [userLikesResult, userBookmarksResult, profileResult] = await Promise.all([
      userLikesPromise,
      userBookmarksPromise,
      profilePromise,
    ]);

    const userLikeSet = new Set(userLikesResult?.data?.map(l => l.news_card_id));
    const userBookmarkSet = new Set(userBookmarksResult?.data?.map(b => b.news_card_id));
    const profile = profileResult?.data as Profile | null;

    allCards = allCards.map(card => ({
      ...card,
      like_count: card.like_count ?? 0,
      ...(user ? {
        user_has_liked: userLikeSet.has(card.id),
        user_has_bookmarked: userBookmarkSet.has(card.id),
      } : {}),
    }));

    // Lesehistorie: vom UXProvider als Cookie gepflegt (letzte ~30 IDs),
    // damit das Server-Ranking bereits gelesene Karten herabstufen kann.
    const cookieStore = await cookies();
    const readCookie = cookieStore.get('nn-read-ids')?.value ?? '';
    const readCardIds = new Set(
      readCookie.split(',').filter(id => /^[0-9a-f-]{36}$/i.test(id))
    );

    // Personalized ranking (within same day)
    if (readCardIds.size > 0 || (profile && (profile.setting || profile.preferred_categories.length > 0))) {
      allCards = rankCards(allCards, {
        setting: profile?.setting ?? null,
        preferredCategories: profile?.preferred_categories ?? [],
        readCardIds,
      });
    }

    // Interleave source types for diversity
    allCards = interleaveBySourceType(allCards);
  }

  // Daily briefing was fetched in parallel with the cards/auth above (only when unfiltered)
  let briefingData: { briefing: DailyBriefingType | null; isYesterday: boolean } = { briefing: null, isYesterday: false };
  const recentBriefing = briefingResult?.data ?? null;
  if (recentBriefing) {
    briefingData = { briefing: recentBriefing, isYesterday: recentBriefing.date !== today };
  }

  return (
    <div>
      {user && <OnboardingFlow userId={user.id} />}
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
      {!hasFilters && <TopOfWeek />}
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
