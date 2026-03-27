import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import InboxPage from '@/components/inbox/InboxPage';

export const dynamic = 'force-dynamic';

export default async function Inbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: shares } = await supabase
    .from('shares')
    .select('*, news_card:news_cards(*), sender:profiles!sender_id(*)')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false });

  return <InboxPage shares={(shares as never) ?? []} />;
}
