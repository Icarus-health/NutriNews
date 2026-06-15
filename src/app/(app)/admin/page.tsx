import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';
import { getAdminStats } from '@/lib/actions/admin';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') redirect('/');

  const [draftsResult, stats] = await Promise.all([
    supabase
      .from('news_cards')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false }),
    getAdminStats(),
  ]);

  return <AdminDashboard drafts={draftsResult.data ?? []} stats={stats} />;
}
