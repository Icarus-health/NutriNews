import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import type { NewsCard } from '@/types/database';

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profileData } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  const profile = profileData as { role: string } | null;
  if (profile?.role !== 'admin') redirect('/');

  const { data: draftsData } = await supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  return <AdminDashboard drafts={(draftsData ?? []) as NewsCard[]} />;
}
