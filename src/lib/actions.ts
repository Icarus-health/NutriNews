'use server';

import { createClient } from '@/lib/supabase/server';

export async function toggleLike(newsCardId: string, liked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (liked) {
    await supabase.from('likes').upsert({ user_id: user.id, news_card_id: newsCardId }, { onConflict: 'user_id,news_card_id' });
  } else {
    await supabase.from('likes').delete().eq('user_id', user.id).eq('news_card_id', newsCardId);
  }
}

export async function toggleBookmark(newsCardId: string, bookmarked: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (bookmarked) {
    await supabase.from('bookmarks').upsert({ user_id: user.id, news_card_id: newsCardId }, { onConflict: 'user_id,news_card_id' });
  } else {
    await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('news_card_id', newsCardId);
  }
}
