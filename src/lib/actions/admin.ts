'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface AdminStats {
  totalUsers: number;
  cardsToday: number;
  cardsThisWeek: number;
  briefingsThisWeek: number;
  briefingToday: boolean;
  feedbackLast7d: number;
  avgLikesThisWeek: number;
  pushSubscribers: number;
}

export async function getAdminStats(): Promise<AdminStats | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return null;

  const admin = createAdminClient();

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = `${todayStr}T00:00:00.000Z`;

  const [
    usersRes,
    cardsTodayRes,
    cardsWeekRes,
    briefingsWeekRes,
    briefingTodayRes,
    feedbackRes,
    pushSubsRes,
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('news_cards').select('id', { count: 'exact', head: true })
      .eq('status', 'published').gte('published_at', todayStart),
    admin.from('news_cards').select('id, like_count', { count: 'exact' })
      .eq('status', 'published').gte('published_at', weekAgo),
    admin.from('daily_briefings').select('id', { count: 'exact', head: true })
      .gte('date', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]),
    admin.from('daily_briefings').select('id', { count: 'exact', head: true })
      .eq('date', todayStr),
    admin.from('app_feedback').select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo),
    admin.from('push_subscriptions').select('id', { count: 'exact', head: true }),
  ]);

  const weekCards = cardsWeekRes.data ?? [];
  const totalLikes = weekCards.reduce((sum, c) => sum + (c.like_count ?? 0), 0);
  const avgLikes = weekCards.length > 0 ? Math.round((totalLikes / weekCards.length) * 10) / 10 : 0;

  return {
    totalUsers: usersRes.count ?? 0,
    cardsToday: cardsTodayRes.count ?? 0,
    cardsThisWeek: cardsWeekRes.count ?? 0,
    briefingsThisWeek: briefingsWeekRes.count ?? 0,
    briefingToday: (briefingTodayRes.count ?? 0) > 0,
    feedbackLast7d: feedbackRes.count ?? 0,
    avgLikesThisWeek: avgLikes,
    pushSubscribers: pushSubsRes.count ?? 0,
  };
}
