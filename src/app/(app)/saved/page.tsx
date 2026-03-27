import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SavedPage from '@/components/saved/SavedPage';

export default async function Saved() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: bookmarks }, { data: collections }] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('news_card_id, news_cards(*)')
      .eq('user_id', user.id),
    supabase
      .from('collections')
      .select('*, collection_items(news_card_id, news_cards(*))')
      .eq('user_id', user.id),
  ]);

  return <SavedPage bookmarks={(bookmarks ?? []) as unknown[]} collections={(collections ?? []) as unknown[]} />;
}
