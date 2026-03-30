import type { SourceType } from '@/types/database';

export interface RSSSource {
  name: string;
  url: string;
  defaultCategory: string;
  language: 'de' | 'en';
  sourceType: SourceType;
}

export const RSS_SOURCES: RSSSource[] = [
  // ═══════════════════════════════════════════════
  // FORSCHUNG — Peer-reviewed Journals & Datenbanken
  // ═══════════════════════════════════════════════

  // PubMed - Nutrition allgemein (bestehend)
  {
    name: 'PubMed Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1j0OY2dS3KRkmSbVCJSxHiAyIZgaNG1pUbaTycln2oLjFr_8JD/?limit=10&utm_campaign=pubmed-2&fc=20250101000000',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  // PubMed - Diabetes + Nutrition
  {
    name: 'PubMed Diabetes Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=diabetes+AND+nutrition+AND+therapy&limit=10&fc=20250101000000',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  // PubMed - Oncology + Nutrition
  {
    name: 'PubMed Onko-Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=oncology+AND+nutrition+AND+(cachexia+OR+supportive)&limit=10&fc=20250101000000',
    defaultCategory: 'Onkologische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  // PubMed - Sarcopenia
  {
    name: 'PubMed Sarkopenie',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=sarcopenia+AND+(nutrition+OR+protein)&limit=10&fc=20250101000000',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  // PubMed - GLP-1 / Semaglutide / Obesity
  {
    name: 'PubMed GLP-1 Adipositas',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(semaglutide+OR+tirzepatide+OR+GLP-1)+AND+(nutrition+OR+diet)&limit=10&fc=20250101000000',
    defaultCategory: 'GLP-1 & Adipositastherapie',
    language: 'en',
    sourceType: 'forschung',
  },
  // Cochrane - Nutrition Reviews
  {
    name: 'Cochrane Nutrition',
    url: 'https://www.cochranelibrary.com/rss/content/reviews/topic/41',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  // European Journal of Clinical Nutrition (Nature)
  {
    name: 'EJCN',
    url: 'https://www.nature.com/ejcn.rss',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  // Clinical Nutrition (ESPEN Journal, Elsevier)
  {
    name: 'ESPEN Clinical Nutrition',
    url: 'https://rss.sciencedirect.com/publication/science/02615614',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  // Obesity Reviews
  {
    name: 'Obesity Reviews',
    url: 'https://onlinelibrary.wiley.com/feed/1467789x/most-recent',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FACHPRESSE — Deutsche Fachgesellschaften
  // ═══════════════════════════════════════════════

  // DGE - Deutsche Gesellschaft für Ernährung (bestehend)
  {
    name: 'DGE Presse',
    url: 'https://www.dge.de/rss-feed/',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'de',
    sourceType: 'fachpresse',
  },
  // BZfE - Bundeszentrum für Ernährung (bestehend)
  {
    name: 'BZfE',
    url: 'https://www.bzfe.de/service/news/rss-feed/',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },

  // ═══════════════════════════════════════════════
  // BERUFSPOLITIK — Institutionen & Regulierung
  // ═══════════════════════════════════════════════

  // G-BA Beschlüsse
  {
    name: 'G-BA Beschlüsse',
    url: 'https://www.g-ba.de/feeds/beschluesse/',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  // IQWiG
  {
    name: 'IQWiG Berichte',
    url: 'https://www.iqwig.de/rss/projekte.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  // AWMF Leitlinien
  {
    name: 'AWMF Leitlinien',
    url: 'https://register.awmf.org/de/feed/leitlinien',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  // Google News - Ernährungspolitik (bestehend, umkategorisiert)
  {
    name: 'Google News Politik',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungspolitik+OR+Lebensmittelpolitik+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },

  // ═══════════════════════════════════════════════
  // SUPPLEMENT — Nahrungsergänzungsmittel & Sicherheit
  // ═══════════════════════════════════════════════

  // BfR Stellungnahmen
  {
    name: 'BfR Stellungnahmen',
    url: 'https://www.bfr.bund.de/de/rss_feed-79.html',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },
  // EFSA News
  {
    name: 'EFSA News',
    url: 'https://www.efsa.europa.eu/en/rss',
    defaultCategory: 'Supplements & NEM',
    language: 'en',
    sourceType: 'supplement',
  },

  // ═══════════════════════════════════════════════
  // LAIENPRESSE — Was Patienten gerade lesen
  // ═══════════════════════════════════════════════

  // Google News - Ernährungstherapie allgemein (bestehend, umkategorisiert)
  {
    name: 'Google News Ernährung',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungstherapie+OR+Ern%C3%A4hrungsmedizin+OR+Di%C3%A4tetik&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  // Spiegel + Stern + Focus Gesundheit/Ernährung
  {
    name: 'Laienpresse Spiegel/Stern/Focus',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrung+Gesundheit+(site:spiegel.de+OR+site:stern.de+OR+site:focus.de)&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  // BILD Gesundheit
  {
    name: 'Laienpresse BILD',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrung+Gesundheit+site:bild.de&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  // Apotheken Umschau
  {
    name: 'Laienpresse Apotheken Umschau',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrung+site:apotheken-umschau.de&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
];
