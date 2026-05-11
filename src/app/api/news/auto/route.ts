import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { RSS_SOURCES } from '@/lib/agent/sources';
import { fetchAllFeeds } from '@/lib/agent/rss';
import { selectDiverseCandidates, runCurationPipeline } from '@/lib/agent/pipeline';
import { rateLimit } from '@/lib/rate-limit';

// Vercel Hobby max: 60s
export const maxDuration = 60;

// POST /api/news/auto - startet den News-Kurator-Agenten
export async function POST(request: Request) {
  // Rate limit: max 3 runs per 10 minutes
  const { success: allowed } = await rateLimit('auto-agent', 3, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Zu viele Anfragen. Bitte warte einige Minuten.' }, { status: 429 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const { items: allItems } = await fetchAllFeeds(RSS_SOURCES);

    if (allItems.length === 0) {
      return NextResponse.json({ message: 'Keine neuen Artikel in den RSS-Feeds gefunden.', created: 0 });
    }

    // Filter out URLs already in database (batch to avoid URL length limits)
    const urls = allItems.map(item => item.link).filter(Boolean);
    const existingUrls = new Set<string>();
    const BATCH_SIZE = 50;
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      const { data: existingCards } = await supabase
        .from('news_cards')
        .select('source_url')
        .in('source_url', batch);
      existingCards?.forEach(c => existingUrls.add(c.source_url));
    }
    const newItems = allItems.filter(item => item.link && !existingUrls.has(item.link));

    if (newItems.length === 0) {
      return NextResponse.json({ message: 'Alle Artikel sind bereits in der Datenbank.', created: 0 });
    }

    const candidates = selectDiverseCandidates(newItems);
    const { created, published, drafts, curationFailed, errors } = await runCurationPipeline(candidates, supabase, user.id);

    revalidatePath('/admin');
    revalidatePath('/');

    return NextResponse.json({
      message: `${created} Karten erstellt (${published} published, ${drafts} draft für Laienpresse-Review).${errors.length > 0 ? ` ${errors.length} übersprungen.` : ''}`,
      created,
      published,
      drafts,
      total_checked: candidates.length,
      skipped: curationFailed,
      source_types_checked: [...new Set(candidates.map(c => c.source.sourceType))],
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Auto-agent error:', error);
    return NextResponse.json({ error: 'Agent-Fehler aufgetreten' }, { status: 500 });
  }
}
