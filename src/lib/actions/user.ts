'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

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

  const tables = ['likes', 'bookmarks', 'notes', 'shares', 'card_verifications', 'app_feedback'] as const;
  for (const table of tables) {
    await admin.from(table).delete().eq('user_id', user.id);
  }
  await admin.from('comments').delete().eq('user_id', user.id);

  // Delete auth user — cascades to profiles via FK ON DELETE CASCADE
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error('deleteAccount: auth.admin.deleteUser failed:', error.message);
    return { error: 'Konto konnte nicht gelöscht werden. Bitte kontaktiere uns direkt.' };
  }

  redirect('/login');
}
