import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@supabase/supabase-js';
import { revalidateTag } from 'next/cache';
import { RSS_SOURCES } from '@/lib/agent/sources';
import { fetchAllFeeds } from '@/lib/agent/rss';
import { selectDiverseCandidates, runCurationPipeline } from '@/lib/agent/pipeline';
import { rateLimit } from '@/lib/rate-limit';

// Vercel Hobby max: 60s — genug für RSS-Fetch + ~10 Claude-Haiku-Aufrufe
export const maxDuration = 60;

// GET /api/news/cron — called by GitHub Actions 4x/day
export async function GET(request: Request) {
  // Rate limit: max 4 runs per 30 minutes (slightly above cron frequency)
  const { success: allowed } = await rateLimit('cron', 4, 30 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  try {
    const allItems = await fetchAllFeeds(RSS_SOURCES);
    if (allItems.length === 0) {
      return NextResponse.json({ message: 'Keine neuen Artikel in den RSS-Feeds.', created: 0 });
    }

    // Filter already known URLs (batch to avoid URL length limits)
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
      return NextResponse.json({ message: 'Alle Artikel bereits bekannt.', created: 0 });
    }

    const candidates = selectDiverseCandidates(newItems);
    const { created, curationFailed, errors } = await runCurationPipeline(candidates, supabase);

    revalidateTag('news-cards');

    return NextResponse.json({
      message: `${created} neue Entwürfe erstellt.`,
      created,
      candidates: candidates.length,
      newItems: newItems.length,
      curationFailed,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
    });
  } catch (error) {
    console.error('Cron error:', error);
    return NextResponse.json({ error: 'Fehler beim Cron-Job' }, { status: 500 });
  }
}
