import { XMLParser } from 'fast-xml-parser';
import type { RSSSource } from './sources';
import { fetchScrapedSources } from './scrape';

export interface RSSItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source: RSSSource;
}

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
});

export async function fetchRSSFeed(source: RSSSource): Promise<RSSItem[]> {
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'NutriNews/1.0 (Ernaehrungsnews-Aggregator)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const parsed = parser.parse(xml);

    // Handle both RSS 2.0 and Atom feeds
    const items = parsed?.rss?.channel?.item
      ?? parsed?.feed?.entry
      ?? [];

    const itemArray = Array.isArray(items) ? items : [items];

    return itemArray
      .filter((item: Record<string, unknown>) => item && (item.title || item.link))
      .slice(0, 10)
      .map((item: Record<string, unknown>) => ({
        title: String(item.title ?? '').trim(),
        link: extractLink(item),
        description: extractDescription(item),
        pubDate: String(item.pubDate ?? item.published ?? item.updated ?? ''),
        source,
      }));
  } catch {
    console.error(`RSS fetch failed for ${source.name}`);
    return [];
  }
}

function extractLink(item: Record<string, unknown>): string {
  if (typeof item.link === 'string') return item.link;
  if (item.link && typeof item.link === 'object') {
    const linkObj = item.link as Record<string, string>;
    return linkObj['@_href'] ?? linkObj.href ?? '';
  }
  if (typeof item.guid === 'string') return item.guid;
  return '';
}

function extractDescription(item: Record<string, unknown>): string {
  const desc = item.description ?? item.summary ?? item.content ?? '';
  // Strip HTML tags for clean text
  return String(desc).replace(/<[^>]*>/g, '').trim().slice(0, 2000);
}

export async function fetchAllFeeds(sources: RSSSource[]): Promise<RSSItem[]> {
  const [rssResults, scrapedItems] = await Promise.all([
    Promise.allSettled(sources.map(fetchRSSFeed)),
    fetchScrapedSources(),
  ]);

  const allItems: RSSItem[] = [];
  for (const result of rssResults) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value);
    }
  }

  allItems.push(...scrapedItems);

  return allItems;
}
