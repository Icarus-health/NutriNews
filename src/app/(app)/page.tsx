import { createClient } from '@/lib/supabase/server';
import NewsFeed from '@/components/news/NewsFeed';
import HomeHeader from '@/components/layout/HomeHeader';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch news with like/bookmark status for the current user
  const { data: newsCards } = await supabase
    .from('news_cards')
    .select(`
      *,
      like_count:likes(count),
      user_has_liked:likes!inner(user_id),
      user_has_bookmarked:bookmarks!inner(user_id)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30);

  // Normalize Supabase aggregate response
  const cards = (newsCards ?? []).map((card: Record<string, unknown>) => ({
    ...card,
    like_count: Array.isArray(card.like_count) ? (card.like_count[0] as { count: number })?.count ?? 0 : 0,
    user_has_liked: Array.isArray(card.user_has_liked)
      ? card.user_has_liked.some((l: { user_id: string }) => l.user_id === user?.id)
      : false,
    user_has_bookmarked: Array.isArray(card.user_has_bookmarked)
      ? card.user_has_bookmarked.some((b: { user_id: string }) => b.user_id === user?.id)
      : false,
  }));

  return (
    <div>
      <HomeHeader user={user} />
      <NewsFeed initialCards={cards as never} userId={user?.id ?? null} />
    </div>
  );
}
