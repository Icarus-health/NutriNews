import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SavedPage from '@/components/saved/SavedPage';

export const dynamic = 'force-dynamic';

export default async function Saved() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: bookmarkedCards }, { data: collections }] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('news_card_id, created_at, news_cards:news_card_id(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cards = (bookmarkedCards ?? [])
    .map((b: any) => b.news_cards)
    .filter(Boolean) as import('@/types/database').NewsCard[];

  return <SavedPage cards={cards} collections={collections ?? []} userId={user.id} />;
}
