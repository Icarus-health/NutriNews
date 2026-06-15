import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@/lib/supabase/server';

// POST /api/admin/generate-vapid
// Admin-only: generates a fresh VAPID key pair for copy-paste into Vercel env vars.
// Keys are NOT saved — admin must set them as environment variables manually.
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const keys = webpush.generateVAPIDKeys();
  return NextResponse.json({
    publicKey: keys.publicKey,
    privateKey: keys.privateKey,
  });
}
