import { createClient } from '@/lib/supabase/server';
import ProfilePage from '@/components/profile/ProfilePage';
import LoginPrompt from '@/components/auth/LoginPrompt';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <LoginPrompt
        title="Profil"
        description="Melde dich an, um dein Profil zu bearbeiten, Kommentare zu schreiben und News mit Kollegen zu teilen."
        icon="👤"
      />
    );
  }

  const [{ data: profile }, { count: likes }, { count: bookmarks }, { count: comments }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('likes').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('bookmarks').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ]);

  return (
    <ProfilePage
      profile={profile}
      stats={{ likes: likes ?? 0, bookmarks: bookmarks ?? 0, comments: comments ?? 0 }}
    />
  );
}
