import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import ProfilePage from '@/components/profile/ProfilePage';
import type { Profile } from '@/types/database';

export default async function Profile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return <ProfilePage profile={profileData as Profile | null} />;
}
