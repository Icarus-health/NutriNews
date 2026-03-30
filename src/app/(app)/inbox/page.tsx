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
    .select('*, news_cards:news_card_id(id, headline, category_main, therapist_check, source_url, evidence_level), sender:sender_id(full_name, avatar_url, email)')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false });

  return <InboxPage shares={shares ?? []} userId={user.id} />;
}
