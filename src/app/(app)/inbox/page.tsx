import { createClient } from '@/lib/supabase/server';
import InboxPage from '@/components/inbox/InboxPage';
import LoginPrompt from '@/components/auth/LoginPrompt';

export const dynamic = 'force-dynamic';

export default async function Inbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <LoginPrompt
        title="Posteingang"
        description="Melde dich an, um von Kollegen geteilte News zu empfangen."
        icon="📨"
      />
    );
  }

  const { data: shares } = await supabase
    .from('shares')
    .select('*, news_cards:news_card_id(id, headline, category_main, therapist_check, source_url, evidence_level), sender:sender_id(full_name, avatar_url, email)')
    .eq('receiver_id', user.id)
    .order('created_at', { ascending: false });

  return <InboxPage shares={shares ?? []} userId={user.id} />;
}
