import type { RSSItem } from './rss';
import type { RSSSource } from './sources';

// ═══════════════════════════════════════════════════════════════
// Scraped Sources: DGEM, AWMF, ESPEN
// Uses fetch() + regex parsing (no cheerio dependency)
// ═══════════════════════════════════════════════════════════════

const DGEM_SOURCE: RSSSource = {
  name: 'DGEM',
  sourceType: 'fachpresse',
  language: 'de',
  defaultCategory: 'Künstliche Ernährung',
  url: 'https://www.dgem.de',
};

const AWMF_SOURCE: RSSSource = {
  name: 'AWMF Leitlinien',
  sourceType: 'fachpresse',
  language: 'de',
  defaultCategory: 'Fortbildung & Lehre',
  url: 'https://register.awmf.org',
};

const ESPEN_SOURCE: RSSSource = {
  name: 'ESPEN',
  sourceType: 'international',
  language: 'en',
  defaultCategory: 'Künstliche Ernährung',
  url: 'https://www.espen.org',
};

async function scrapeDGEM(): Promise<RSSItem[]> {
  try {
    const res = await fetch('https://www.dgem.de/aktuelles', {
      headers: { 'User-Agent': 'NutriNews/1.0 (Ernaehrungsnews-Aggregator)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const items: RSSItem[] = [];

    // Match article/news entries — look for links with titles in headings or list items
    // Pattern: <a href="/...">Title text</a> or similar structures
    const articlePattern = /<a\s+[^>]*href=["']([^"']*\/(aktuelles|news|meldung|pressemitteilung)[^"']*)["'][^>]*>\s*([^<]{10,200})\s*<\/a>/gi;
    const matches = [...html.matchAll(articlePattern)];

    // Also try h2/h3 headings with links
    const headingPattern = /<h[23][^>]*>\s*<a\s+[^>]*href=["']([^"']*)["'][^>]*>\s*([^<]{10,200})\s*<\/a>\s*<\/h[23]>/gi;
    const headingMatches = [...html.matchAll(headingPattern)];

    const seen = new Set<string>();

    for (const match of [...headingMatches, ...matches]) {
      const href = match[1];
      const title = (match[2] ?? match[3] ?? '').replace(/\s+/g, ' ').trim();

      if (!title || title.length < 10) continue;

      const url = href.startsWith('http') ? href : `https://www.dgem.de${href.startsWith('/') ? '' : '/'}${href}`;

      if (seen.has(url)) continue;
      seen.add(url);

      items.push({
        title,
        link: url,
        description: '',
        pubDate: '',
        source: DGEM_SOURCE,
      });

      if (items.length >= 10) break;
    }

    return items;
  } catch (err) {
    console.error('DGEM scrape failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

async function scrapeAWMF(): Promise<RSSItem[]> {
  try {
    // AWMF provides a structured register — query for recently updated Leitlinien
    const res = await fetch('https://register.awmf.org/de/leitlinien/aktuelle-leitlinien', {
      headers: { 'User-Agent': 'NutriNews/1.0 (Ernaehrungsnews-Aggregator)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const items: RSSItem[] = [];
    const seen = new Set<string>();

    // Look for Leitlinien entries: links to /de/leitlinien/detail/...
    const linkPattern = /<a\s+[^>]*href=["']([^"']*\/leitlinien\/detail[^"']*)["'][^>]*>\s*([^<]{10,300})\s*<\/a>/gi;
    const matches = [...html.matchAll(linkPattern)];

    // Also try table rows with Leitlinien titles
    const rowPattern = /<td[^>]*>\s*<a\s+[^>]*href=["']([^"']*\/detail[^"']*)["'][^>]*>([^<]{10,300})<\/a>/gi;
    const rowMatches = [...html.matchAll(rowPattern)];

    for (const match of [...matches, ...rowMatches]) {
      const href = match[1];
      const title = match[2].replace(/\s+/g, ' ').trim();

      if (!title || title.length < 10) continue;

      const url = href.startsWith('http') ? href : `https://register.awmf.org${href.startsWith('/') ? '' : '/'}${href}`;

      if (seen.has(url)) continue;
      seen.add(url);

      items.push({
        title,
        link: url,
        description: '',
        pubDate: '',
        source: AWMF_SOURCE,
      });

      if (items.length >= 10) break;
    }

    return items;
  } catch (err) {
    console.error('AWMF scrape failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

async function scrapeESPEN(): Promise<RSSItem[]> {
  try {
    const res = await fetch('https://www.espen.org/news', {
      headers: { 'User-Agent': 'NutriNews/1.0 (Ernaehrungsnews-Aggregator)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const html = await res.text();
    const items: RSSItem[] = [];
    const seen = new Set<string>();

    // Look for news/article links with substantial titles
    const headingPattern = /<h[234][^>]*>\s*<a\s+[^>]*href=["']([^"']*)["'][^>]*>\s*([^<]{10,300})\s*<\/a>\s*<\/h[234]>/gi;
    const headingMatches = [...html.matchAll(headingPattern)];

    // Also look for general article links
    const articlePattern = /<a\s+[^>]*href=["']([^"']*\/(news|guidelines|publications|article)[^"']*)["'][^>]*>\s*([^<]{15,300})\s*<\/a>/gi;
    const articleMatches = [...html.matchAll(articlePattern)];

    for (const match of [...headingMatches, ...articleMatches]) {
      const href = match[1];
      const title = (match[2] ?? match[3] ?? '').replace(/\s+/g, ' ').trim();

      if (!title || title.length < 10) continue;

      const url = href.startsWith('http') ? href : `https://www.espen.org${href.startsWith('/') ? '' : '/'}${href}`;

      if (seen.has(url)) continue;
      seen.add(url);

      items.push({
        title,
        link: url,
        description: '',
        pubDate: '',
        source: ESPEN_SOURCE,
      });

      if (items.length >= 10) break;
    }

    return items;
  } catch (err) {
    console.error('ESPEN scrape failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

export async function fetchScrapedSources(): Promise<RSSItem[]> {
  const results = await Promise.allSettled([
    scrapeDGEM(),
    scrapeAWMF(),
    scrapeESPEN(),
  ]);

  const allItems: RSSItem[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  return allItems;
}
