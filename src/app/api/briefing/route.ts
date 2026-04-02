import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateDailyBriefing } from '@/lib/agent/briefing';

/** Get today's date in Europe/Berlin timezone as YYYY-MM-DD */
function getTodayBerlin(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Berlin' });
}

// POST /api/briefing - Generiert das tägliche Briefing
// Kann manuell von Admins oder per Cron-Job aufgerufen werden
export async function POST(request: Request) {
  const supabase = await createClient();

  // Auth check: entweder Admin-User oder Cron-Secret
  const cronSecret = request.headers.get('x-cron-secret');
  const isValidCron = cronSecret && cronSecret === process.env.CRON_SECRET;

  if (!isValidCron) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const today = getTodayBerlin();

    // Check if briefing already exists for today
    const { data: existing } = await supabase
      .from('daily_briefings')
      .select('id')
      .eq('date', today)
      .single();

    if (existing) {
      return NextResponse.json({ message: 'Briefing fuer heute existiert bereits.', id: existing.id });
    }

    // Get published articles from last 48h (broader window for reliability)
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const { data: articles } = await supabase
      .from('news_cards')
      .select('id, headline, snack_what, therapist_check, evidence_level, category_main, practice_relevance_score, source_name, source_url, source_type')
      .eq('status', 'published')
      .gte('published_at', since)
      .order('published_at', { ascending: false })
      .limit(30);

    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'Keine Artikel in den letzten 48h gefunden.', created: false });
    }

    // Generate briefing
    const items = await generateDailyBriefing(articles);

    if (items.length === 0) {
      return NextResponse.json({ message: 'Briefing-Generierung fehlgeschlagen.', created: false });
    }

    // Save to database (use upsert to avoid race condition with duplicate dates)
    const { data: briefing, error } = await supabase
      .from('daily_briefings')
      .upsert({
        date: today,
        items,
        generated_at: new Date().toISOString(),
      }, { onConflict: 'date' })
      .select('id')
      .single();

    if (error) {
      console.error('Briefing save error:', error);
      return NextResponse.json({ error: 'Briefing konnte nicht gespeichert werden.' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Briefing mit ${items.length} Meldungen erstellt.`,
      id: briefing.id,
      itemCount: items.length,
    });
  } catch (error) {
    console.error('Briefing generation error:', error);
    return NextResponse.json({ error: 'Briefing-Generierung fehlgeschlagen' }, { status: 500 });
  }
}

// GET /api/briefing - Holt das aktuelle Briefing
export async function GET() {
  const supabase = await createClient();

  // Auth check: user must be logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const today = getTodayBerlin();

  const { data: briefing } = await supabase
    .from('daily_briefings')
    .select('*')
    .eq('date', today)
    .single();

  if (!briefing) {
    // Fallback: gestrige Briefing
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const { data: yesterdayBriefing } = await supabase
      .from('daily_briefings')
      .select('*')
      .eq('date', yesterday)
      .single();

    if (yesterdayBriefing) {
      return NextResponse.json({ briefing: yesterdayBriefing, isYesterday: true });
    }

    return NextResponse.json({ briefing: null });
  }

  return NextResponse.json({ briefing, isYesterday: false });
}
