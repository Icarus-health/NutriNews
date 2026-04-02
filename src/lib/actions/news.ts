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

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  await supabase.from('comments').delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

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

export async function loadMoreCards(cursor: string, excludeIds: string[], filters?: {
  categories?: string[];
  q?: string;
  evidence?: string[];
  days?: number;
  minRelevance?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('news_cards')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', cursor)
    .order('published_at', { ascending: false })
    .limit(15 + excludeIds.length); // Fetch extra to account for exclusions

  if (filters?.categories?.length === 1) {
    query = query.eq('category_main', filters.categories[0]);
  } else if (filters?.categories && filters.categories.length > 1) {
    query = query.in('category_main', filters.categories);
  }

  if (filters?.evidence?.length === 1) {
    query = query.eq('evidence_level', filters.evidence[0]);
  } else if (filters?.evidence && filters.evidence.length > 1) {
    query = query.in('evidence_level', filters.evidence);
  }

  if (filters?.days && filters.days > 0) {
    const cutoff = new Date(Date.now() - filters.days * 24 * 60 * 60 * 1000).toISOString();
    query = query.gte('published_at', cutoff);
  }

  if (filters?.minRelevance && filters.minRelevance >= 1) {
    query = query.gte('practice_relevance_score', filters.minRelevance);
  }

  if (filters?.q) {
    query = query.or(`headline.ilike.%${filters.q}%,snack_what.ilike.%${filters.q}%,therapist_check.ilike.%${filters.q}%`);
  }

  const { data: rawCards } = await query;
  if (!rawCards || rawCards.length === 0) return { cards: [], hasMore: false };

  // Exclude already-loaded cards to prevent duplicates
  const excludeSet = new Set(excludeIds);
  const cards = rawCards.filter(c => !excludeSet.has(c.id)).slice(0, 15);
  if (cards.length === 0) return { cards: [], hasMore: false };

  // Enrich with like counts
  const cardIds = cards.map(c => c.id);
  const { data: likeCounts } = await supabase
    .from('likes')
    .select('news_card_id')
    .in('news_card_id', cardIds);

  const likeCountMap: Record<string, number> = {};
  likeCounts?.forEach(l => {
    likeCountMap[l.news_card_id] = (likeCountMap[l.news_card_id] ?? 0) + 1;
  });

  let enriched = cards.map(card => ({
    ...card,
    like_count: likeCountMap[card.id] ?? 0,
  }));

  if (user) {
    const [{ data: userLikes }, { data: userBookmarks }] = await Promise.all([
      supabase.from('likes').select('news_card_id').eq('user_id', user.id).in('news_card_id', cardIds),
      supabase.from('bookmarks').select('news_card_id').eq('user_id', user.id).in('news_card_id', cardIds),
    ]);
    const userLikeSet = new Set(userLikes?.map(l => l.news_card_id));
    const userBookmarkSet = new Set(userBookmarks?.map(b => b.news_card_id));
    enriched = enriched.map(card => ({
      ...card,
      user_has_liked: userLikeSet.has(card.id),
      user_has_bookmarked: userBookmarkSet.has(card.id),
    }));
  }

  return { cards: enriched, hasMore: cards.length === 15 };
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

export async function createCollection(name: string, emoji: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmed = name.trim();
  if (!trimmed) return { error: 'Name darf nicht leer sein' };

  const { error, data } = await supabase.from('collections').insert({
    user_id: user.id,
    name: trimmed,
    emoji: emoji || '📁',
  }).select('id').single();

  if (error) return { error: 'Sammlung konnte nicht erstellt werden' };

  revalidatePath('/saved');
  return { success: true, id: data.id };
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
