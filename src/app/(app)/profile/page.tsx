import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfilePage from '@/components/profile/ProfilePage';

export const dynamic = 'force-dynamic';

export default async function Profile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

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
