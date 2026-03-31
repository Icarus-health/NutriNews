'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleLike(newsCardId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { data: existing } = await supabase
    .from('likes')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('news_card_id', newsCardId)
    .single();

  if (existing) {
    await supabase.from('likes').delete()
      .eq('user_id', user.id)
      .eq('news_card_id', newsCardId);
  } else {
    await supabase.from('likes').insert({
      user_id: user.id,
      news_card_id: newsCardId,
    });
  }

  revalidatePath('/');
  return { liked: !existing };
}

export async function toggleBookmark(newsCardId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { data: existing } = await supabase
    .from('bookmarks')
    .select('user_id')
    .eq('user_id', user.id)
    .eq('news_card_id', newsCardId)
    .single();

  if (existing) {
    await supabase.from('bookmarks').delete()
      .eq('user_id', user.id)
      .eq('news_card_id', newsCardId);
  } else {
    await supabase.from('bookmarks').insert({
      user_id: user.id,
      news_card_id: newsCardId,
    });
  }

  revalidatePath('/');
  return { bookmarked: !existing };
}

export async function shareToUser(newsCardId: string, receiverEmail: string, message?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  // Find receiver by email
  const { data: receiver } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', receiverEmail)
    .single();

  const { error } = await supabase.from('shares').insert({
    sender_id: user.id,
    receiver_id: receiver?.id ?? null,
    receiver_email: receiverEmail,
    news_card_id: newsCardId,
    message: message || null,
  });

  if (error) return { error: 'Teilen fehlgeschlagen' };

  revalidatePath('/inbox');
  return { success: true };
}

export async function addComment(newsCardId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmed = body.trim();
  if (!trimmed) return { error: 'Kommentar darf nicht leer sein' };

  const { error } = await supabase.from('comments').insert({
    news_card_id: newsCardId,
    user_id: user.id,
    body: trimmed,
  });

  if (error) return { error: 'Kommentar konnte nicht gespeichert werden' };

  revalidatePath('/');
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  await supabase.from('comments').delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  revalidatePath('/');
  return { success: true };
}

export async function getComments(newsCardId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('comments')
    .select('id, body, created_at, user_id, profiles:user_id(full_name, avatar_url)')
    .eq('news_card_id', newsCardId)
    .order('created_at', { ascending: true })
    .limit(50);

  return data ?? [];
}

export async function markShareRead(shareId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  await supabase.from('shares').update({ read: true })
    .eq('id', shareId)
    .eq('receiver_id', user.id);

  revalidatePath('/inbox');
  return { success: true };
}

export async function createNewsCard(data: {
  headline: string;
  snack_what: string;
  snack_result: string;
  snack_consequence: string;
  therapist_check: string;
  source_url: string;
  source_name?: string;
  category_main: string;
  subcategories?: string[];
  evidence_level: string;
  read_time_sec?: number;
  status?: 'draft' | 'published';
  curated_by_agent?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { error, data: card } = await supabase.from('news_cards').insert({
    ...data,
    curated_by: user.id,
    published_at: data.status === 'published' ? new Date().toISOString() : null,
  }).select('id').single();

  if (error) return { error: 'Karte konnte nicht erstellt werden' };

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true, id: card.id };
}

export async function publishNewsCard(newsCardId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Keine Berechtigung' };

  await supabase.from('news_cards').update({
    status: 'published',
    published_at: new Date().toISOString(),
  }).eq('id', newsCardId);

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteNewsCard(newsCardId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Keine Berechtigung' };

  await supabase.from('news_cards').delete().eq('id', newsCardId);

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateProfile(data: { full_name?: string; alias?: string; specialties?: string[]; preferred_categories?: string[]; notify_new_news?: boolean; setting?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { error } = await supabase.from('profiles').update({
    ...data,
    updated_at: new Date().toISOString(),
  }).eq('id', user.id);

  if (error) return { error: 'Profil konnte nicht aktualisiert werden' };

  revalidatePath('/profile');
  return { success: true };
}

export async function searchProfiles(query: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .neq('id', user.id)
    .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(5);

  return data ?? [];
}

export async function triggerCron() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return { error: 'Keine Berechtigung' };

  const vercelUrl = process.env.VERCEL_URL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const baseUrl = appUrl ?? (vercelUrl ? `https://${vercelUrl}` : 'http://localhost:3000');

  const res = await fetch(`${baseUrl}/api/news/cron`, {
    headers: { authorization: `Bearer ${process.env.CRON_SECRET ?? ''}` },
  });
  const data = await res.json();
  revalidatePath('/');
  revalidatePath('/admin');
  return data;
}
