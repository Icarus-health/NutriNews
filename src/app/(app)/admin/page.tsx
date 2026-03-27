import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export default async function Admin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if ((profile as { role: string } | null)?.role !== 'admin') redirect('/');

  const { data: drafts } = await supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'draft')
    .order('created_at', { ascending: false });

  return <AdminDashboard drafts={drafts ?? []} />;
}
