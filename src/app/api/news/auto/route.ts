import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/news/auto  – startet den News-Kurator-Agenten
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  // TODO: News-Kurator-Logik
  // 1. PubMed RSS + Google News RSS abrufen
  // 2. Neuen Items per OpenAI in NewsCard-Format umwandeln
  // 3. Als 'draft' in DB speichern
  // 4. E-Mail-Benachrichtigungen senden
  return NextResponse.json({ message: 'Agent gestartet – kommt bald!' });
}
