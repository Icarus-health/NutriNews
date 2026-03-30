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
