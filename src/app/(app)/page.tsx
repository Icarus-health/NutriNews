import { createClient } from '@/lib/supabase/server';
import NewsFeed from '@/components/news/NewsFeed';
import HomeHeader from '@/components/layout/HomeHeader';
import type { NewsCard } from '@/types/database';

export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: newsCardsData } = await supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(30);

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div>
      <HomeHeader user={user} />
      <NewsFeed initialCards={(newsCardsData ?? []) as NewsCard[]} userId={user?.id ?? null} />
    </div>
  );
}
