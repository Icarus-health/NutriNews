export interface RSSSource {
  name: string;
  url: string;
  defaultCategory: string;
  language: 'de' | 'en';
}

export const RSS_SOURCES: RSSSource[] = [
  // PubMed - Nutrition research
  {
    name: 'PubMed Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1j0OY2dS3KRkmSbVCJSxHiAyIZgaNG1pUbaTycln2oLjFr_8JD/?limit=10&utm_campaign=pubmed-2&fc=20250101000000',
    defaultCategory: 'Forschung',
    language: 'en',
  },
  // DGE - Deutsche Gesellschaft fuer Ernaehrung
  {
    name: 'DGE Presse',
    url: 'https://www.dge.de/rss-feed/',
    defaultCategory: 'Ernaehrungsmedizin',
    language: 'de',
  },
  // BZfE - Bundeszentrum fuer Ernaehrung
  {
    name: 'BZfE',
    url: 'https://www.bzfe.de/service/news/rss-feed/',
    defaultCategory: 'Ernaehrungsmedizin',
    language: 'de',
  },
  // Google News - Ernaehrungstherapie
  {
    name: 'Google News Ernaehrung',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungstherapie+OR+Ern%C3%A4hrungsmedizin+OR+Di%C3%A4tetik&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Trends',
    language: 'de',
  },
  // Google News - Ernaehrungspolitik
  {
    name: 'Google News Politik',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungspolitik+OR+Lebensmittelpolitik+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Politik',
    language: 'de',
  },
];
