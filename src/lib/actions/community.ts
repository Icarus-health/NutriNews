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

  const { error } = await supabase.from('channel_members').delete()
    .eq('channel_id', channelId)
    .eq('user_id', user.id);
  if (error) return { error: 'Verlassen fehlgeschlagen' };

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

  // Antwort auf einen Beitrag → Autorin des Originals benachrichtigen
  // (best effort, ein Fehler hier darf das Posten nicht scheitern lassen)
  if (parentPostId) {
    const { data: parent } = await supabase
      .from('channel_posts')
      .select('user_id')
      .eq('id', parentPostId)
      .single();
    if (parent?.user_id && parent.user_id !== user.id) {
      await supabase.from('notifications').insert({
        user_id: parent.user_id,
        actor_id: user.id,
        type: 'channel_reply',
        channel_id: channelId,
        post_id: parentPostId,
        preview: trimmed.slice(0, 140),
      });
    }
  }

  revalidatePath('/community');
  return { success: true };
}

export async function updateChannelPost(postId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmed = body.trim();
  if (!trimmed) return { error: 'Beitrag darf nicht leer sein' };
  if (trimmed.length > 2000) return { error: 'Beitrag zu lang (max. 2000 Zeichen)' };

  const { error } = await supabase.from('channel_posts')
    .update({ body: trimmed, edited_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('user_id', user.id);

  if (error) return { error: 'Beitrag konnte nicht bearbeitet werden' };

  revalidatePath('/community');
  return { success: true };
}

/**
 * Meldet einen Community-Beitrag. Landet als Eintrag in app_feedback
 * (Typ "report") — dort haben Admins bereits einen Lese-Tab im Dashboard.
 */
export async function reportChannelPost(postId: string, reason: string, postBody: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const trimmedReason = reason.trim();
  if (!trimmedReason) return { error: 'Bitte Grund angeben' };

  const { error } = await supabase.from('app_feedback').insert({
    user_id: user.id,
    type: 'report',
    message: `Meldung Community-Beitrag ${postId}\nGrund: ${trimmedReason.slice(0, 500)}\nZitat: ${postBody.slice(0, 300)}`,
  });

  if (error) return { error: 'Meldung konnte nicht gesendet werden' };
  return { success: true };
}

export async function deleteChannelPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { error } = await supabase.from('channel_posts').delete()
    .eq('id', postId)
    .eq('user_id', user.id);
  if (error) return { error: 'Beitrag konnte nicht gelöscht werden' };

  revalidatePath('/community');
  return { success: true };
}

export async function getChannelPostReplies(parentPostId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('channel_posts')
    .select('*, profile:user_id(id, full_name, avatar_url, role)')
    .eq('parent_post_id', parentPostId)
    .order('created_at', { ascending: true })
    .limit(50);
  return data ?? [];
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

  // Fragestellerin benachrichtigen (best effort)
  const { data: question } = await supabase
    .from('quick_questions')
    .select('user_id')
    .eq('id', questionId)
    .single();
  if (question?.user_id && question.user_id !== user.id) {
    await supabase.from('notifications').insert({
      user_id: question.user_id,
      actor_id: user.id,
      type: 'quick_answer',
      question_id: questionId,
      preview: trimmed.slice(0, 140),
    });
  }

  revalidatePath('/community');
  return { success: true };
}

// ═══════════════════════════════════════════════════════════════
// Benachrichtigungen
// ═══════════════════════════════════════════════════════════════

export async function markNotificationRead(notificationId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { error } = await supabase.from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id);
  if (error) return { error: 'Konnte nicht als gelesen markiert werden' };

  revalidatePath('/inbox');
  return { success: true };
}

export async function markAllNotificationsRead() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Nicht angemeldet' };

  const { error } = await supabase.from('notifications')
    .update({ read: true })
    .eq('user_id', user.id)
    .eq('read', false);
  if (error) return { error: 'Konnte nicht als gelesen markiert werden' };

  revalidatePath('/inbox');
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
    const { error } = await supabase.from('card_verifications').delete().eq('id', existing.id);
    if (error) return { error: 'Verifikation konnte nicht entfernt werden' };
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

  // Zählen in SQL (head:true ⇒ keine Zeilen über die Leitung) statt alle
  // Verifikations-Zeilen zu laden und in JS zu zählen.
  const TYPES: CardVerificationType[] = ['praxisrelevant', 'fachlich_korrekt', 'korrektur_noetig', 'quelle_zweifelhaft'];
  const results = await Promise.all(TYPES.map(type =>
    supabase
      .from('card_verifications')
      .select('*', { count: 'exact', head: true })
      .eq('news_card_id', newsCardId)
      .eq('verification_type', type)
  ));

  return {
    praxisrelevant: results[0].count ?? 0,
    fachlich_korrekt: results[1].count ?? 0,
    korrektur_noetig: results[2].count ?? 0,
    quelle_zweifelhaft: results[3].count ?? 0,
  };
}
