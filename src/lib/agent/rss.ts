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

export interface SourceHealth {
  name: string;
  sourceType: string;
  items: number;
  error?: string;
}

const PARSER_OPTIONS = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
} as const;

export async function fetchRSSFeed(source: RSSSource): Promise<{ items: RSSItem[]; health: SourceHealth }> {
  const health: SourceHealth = { name: source.name, sourceType: source.sourceType, items: 0 };
  try {
    const res = await fetch(source.url, {
      headers: { 'User-Agent': 'NutriNews/1.0 (Ernaehrungsnews-Aggregator)' },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      health.error = `HTTP ${res.status}`;
      return { items: [], health };
    }

    const xml = await res.text();
    // Create a fresh parser per request to avoid shared state in concurrent calls
    const parser = new XMLParser(PARSER_OPTIONS);
    const parsed = parser.parse(xml);

    // Handle both RSS 2.0 and Atom feeds
    const items = parsed?.rss?.channel?.item
      ?? parsed?.feed?.entry
      ?? [];

    const itemArray = Array.isArray(items) ? items : [items];

    const result = itemArray
      .filter((item: Record<string, unknown>) => item && (item.title || item.link))
      .slice(0, 10)
      .map((item: Record<string, unknown>) => ({
        title: String(item.title ?? '').trim(),
        link: extractLink(item),
        description: extractDescription(item),
        pubDate: String(item.pubDate ?? item.published ?? item.updated ?? ''),
        source,
      }));

    health.items = result.length;
    return { items: result, health };
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === 'TimeoutError';
    health.error = isTimeout ? 'timeout' : (err instanceof Error ? err.message.slice(0, 80) : 'unknown');
    return { items: [], health };
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

export interface FeedResult {
  items: RSSItem[];
  sourceHealth: SourceHealth[];
}

export async function fetchAllFeeds(sources: RSSSource[]): Promise<FeedResult> {
  const [rssResults, scrapedItems] = await Promise.all([
    Promise.allSettled(sources.map(fetchRSSFeed)),
    fetchScrapedSources(),
  ]);

  const allItems: RSSItem[] = [];
  const sourceHealth: SourceHealth[] = [];

  for (const result of rssResults) {
    if (result.status === 'fulfilled') {
      allItems.push(...result.value.items);
      sourceHealth.push(result.value.health);
    }
  }

  allItems.push(...scrapedItems);

  return { items: allItems, sourceHealth };
}
