'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { CardVerificationType } from '@/types/database';

// ═══════════════════════════════════════════════════════════════
// Channel Actions
// ═══════════════════════════════════════════════════════════════

export async function createChannel(name: string, description: string, emoji: string, isPrivate: boolean = false) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmedName = name.trim();
  if (!trimmedName) return { error: 'Name darf nicht leer sein' };
  if (trimmedName.length < 3) return { error: 'Name muss mindestens 3 Zeichen lang sein' };

  // Generate slug from name
  const slug = trimmedName
    .toLowerCase()
    .replace(/[äÄ]/g, 'ae').replace(/[öÖ]/g, 'oe').replace(/[üÜ]/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  const { error, data: channel } = await supabase.from('channels').insert({
    slug,
    name: trimmedName,
    description: description.trim() || '',
    emoji: emoji || '💬',
    is_private: isPrivate,
  }).select('id').single();

  if (error?.code === '23505') return { error: 'Eine Gruppe mit diesem Namen existiert bereits' };
  if (error) return { error: 'Fachgruppe konnte nicht erstellt werden' };

  // Auto-join the creator
  await supabase.from('channel_members').insert({
    channel_id: channel.id,
    user_id: user.id,
  });

  revalidatePath('/community');
  return { success: true, channelId: channel.id };
}

export async function joinChannel(channelId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { error } = await supabase.from('channel_members').insert({
    channel_id: channelId,
    user_id: user.id,
  });

  if (error?.code === '23505') return { error: 'Bereits Mitglied' };
  if (error) return { error: 'Beitritt fehlgeschlagen' };

  revalidatePath('/community');
  return { success: true };
}

export async function leaveChannel(channelId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  await supabase.from('channel_members').delete()
    .eq('channel_id', channelId)
    .eq('user_id', user.id);

  revalidatePath('/community');
  return { success: true };
}

export async function createChannelPost(channelId: string, body: string, newsCardId?: string, parentPostId?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmed = body.trim();
  if (!trimmed) return { error: 'Beitrag darf nicht leer sein' };

  const { error } = await supabase.from('channel_posts').insert({
    channel_id: channelId,
    user_id: user.id,
    body: trimmed,
    news_card_id: newsCardId || null,
    parent_post_id: parentPostId || null,
  });

  if (error) return { error: 'Beitrag konnte nicht erstellt werden' };

  revalidatePath('/community');
  return { success: true };
}

export async function deleteChannelPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  await supabase.from('channel_posts').delete()
    .eq('id', postId)
    .eq('user_id', user.id);

  revalidatePath('/community');
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// Schnellfragen Actions
// ═══════════════════════════════════════════════════════════════

export async function createQuickQuestion(category: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmed = body.trim();
  if (!trimmed) return { error: 'Frage darf nicht leer sein' };

  const { error } = await supabase.from('quick_questions').insert({
    user_id: user.id,
    category,
    body: trimmed,
  });

  if (error) return { error: 'Frage konnte nicht erstellt werden' };

  revalidatePath('/community');
  return { success: true };
}

export async function answerQuickQuestion(questionId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmed = body.trim();
  if (!trimmed) return { error: 'Antwort darf nicht leer sein' };

  const { error } = await supabase.from('quick_answers').insert({
    question_id: questionId,
    user_id: user.id,
    body: trimmed,
  });

  if (error) return { error: 'Antwort konnte nicht gespeichert werden' };

  revalidatePath('/community');
  return { success: true };
}

export async function markSameQuestion(questionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  // Use a simple insert to same_question_votes table
  const { error } = await supabase.from('same_question_votes').insert({
    question_id: questionId,
    user_id: user.id,
  });

  if (error?.code === '23505') return { error: 'Bereits markiert' };
  if (error) return { error: 'Fehler beim Markieren' };

  revalidatePath('/community');
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// Card Verification Actions
// ═══════════════════════════════════════════════════════════════

export async function verifyCard(newsCardId: string, verificationType: CardVerificationType, reason?: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  // Pflichtbegründung bei Flags
  if ((verificationType === 'korrektur_noetig' || verificationType === 'quelle_zweifelhaft') && !reason?.trim()) {
    return { error: 'Bitte Begründung angeben' };
  }

  // Check if user already verified this card with this type
  const { data: existing } = await supabase
    .from('card_verifications')
    .select('id')
    .eq('news_card_id', newsCardId)
    .eq('user_id', user.id)
    .eq('verification_type', verificationType)
    .single();

  if (existing) {
    // Remove verification (toggle)
    await supabase.from('card_verifications').delete().eq('id', existing.id);
    return { success: true, removed: true };
  }

  const { error } = await supabase.from('card_verifications').insert({
    news_card_id: newsCardId,
    user_id: user.id,
    verification_type: verificationType,
    reason: reason?.trim() || null,
  });

  if (error) return { error: 'Verifikation fehlgeschlagen' };

  return { success: true, removed: false };
}

export async function getCardVerifications(newsCardId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('card_verifications')
    .select('verification_type')
    .eq('news_card_id', newsCardId);

  if (!data) return { praxisrelevant: 0, fachlich_korrekt: 0, korrektur_noetig: 0, quelle_zweifelhaft: 0 };

  const counts = { praxisrelevant: 0, fachlich_korrekt: 0, korrektur_noetig: 0, quelle_zweifelhaft: 0 };
  data.forEach(v => {
    const t = v.verification_type as CardVerificationType;
    if (t in counts) counts[t]++;
  });

  return counts;
}
