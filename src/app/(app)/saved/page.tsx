import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import SavedPage from '@/components/saved/SavedPage';

export const dynamic = 'force-dynamic';

export default async function Saved() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const [{ data: bookmarks }, { data: collections }] = await Promise.all([
    supabase
      .from('bookmarks')
      .select('news_card_id, news_card:news_cards(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('collections')
      .select('*')
      .eq('user_id', user.id),
  ]);

  return <SavedPage bookmarks={(bookmarks as never) ?? []} collections={collections ?? []} />;
}
