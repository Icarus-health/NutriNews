'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

/** Persists the UI/content language to the user's profile. No-op when logged out. */
export async function updateLanguage(language: string): Promise<{ error?: string }> {
  if (language !== 'de' && language !== 'en') return { error: 'invalid language' };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return {};
  const { error } = await supabase.from('profiles').update({ language }).eq('id', user.id);
  return error ? { error: error.message } : {};
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Nicht angemeldet.' };

  // Delete user-generated content from all tables.
  // RLS won't allow self-deletion of some tables, so we use the service role key.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  await Promise.all(
    (['likes', 'bookmarks', 'notes', 'shares', 'card_verifications', 'app_feedback', 'comments'] as const).map(
      table => admin.from(table).delete().eq('user_id', user.id)
    )
  );

  // Delete auth user — cascades to profiles via FK ON DELETE CASCADE
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('deleteAccount: auth.admin.deleteUser failed:', error.message);
    return { error: 'Konto konnte nicht gelöscht werden. Bitte kontaktiere uns direkt.' };
  }

  redirect('/login');
}
