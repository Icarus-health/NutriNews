import type { SourceType } from '@/types/database';

export interface RSSSource {
  name: string;
  url: string;
  defaultCategory: string;
  language: 'de' | 'en' | 'fr' | 'nl' | 'es';
  sourceType: SourceType;
}

export const RSS_SOURCES: RSSSource[] = [

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Top-Journals Klinische Ernährung
  // ═══════════════════════════════════════════════

  {
    name: 'American Journal of Clinical Nutrition',
    url: 'https://academic.oup.com/ajcn/rss/advanceaccess',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrients (MDPI)',
    url: 'https://www.mdpi.com/rss/journal/nutrients',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'EJCN (European Journal of Clinical Nutrition)',
    url: 'https://www.nature.com/ejcn.rss',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'British Journal of Nutrition',
    url: 'https://www.cambridge.org/core/rss/product/id/BJN',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'ESPEN Clinical Nutrition',
    url: 'https://rss.sciencedirect.com/publication/science/02615614',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Clinical Nutrition ESPEN',
    url: 'https://rss.sciencedirect.com/publication/science/24054577',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'JPEN (Parenteral & Enteral Nutrition)',
    url: 'https://onlinelibrary.wiley.com/feed/19412444/most-recent',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition in Clinical Practice',
    url: 'https://onlinelibrary.wiley.com/feed/19412452/most-recent',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Annals of Nutrition and Metabolism',
    url: 'https://www.karger.com/Journal/Feed/224',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'European Journal of Nutrition',
    url: 'https://link.springer.com/search.rss?search-within=Journal&facet-journal-id=394&query=',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Cochrane Nutrition',
    url: 'https://www.cochranelibrary.com/rss/content/reviews/topic/41',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition Research (Elsevier)',
    url: 'https://rss.sciencedirect.com/publication/science/02715317',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Appetite (Elsevier)',
    url: 'https://rss.sciencedirect.com/publication/science/01956663',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Food & Function (RSC)',
    url: 'https://feeds.rsc.org/rss/fo',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Spezialisiert nach Fachgebiet
  // ═══════════════════════════════════════════════

  // Sarkopenie & Kachexie
  {
    name: 'JCSM (Cachexia, Sarcopenia & Muscle)',
    url: 'https://onlinelibrary.wiley.com/feed/21904499/most-recent',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Obesity Reviews',
    url: 'https://onlinelibrary.wiley.com/feed/1467789x/most-recent',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'International Journal of Obesity',
    url: 'https://www.nature.com/ijo.rss',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Current Obesity Reports',
    url: 'https://link.springer.com/search.rss?search-within=Journal&facet-journal-id=13679&query=',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },

  // Diabetes
  {
    name: 'Diabetes Care (ADA)',
    url: 'https://diabetesjournals.org/care/rss/advanceaccess',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Diabetologia (EASD)',
    url: 'https://link.springer.com/search.rss?search-within=Journal&facet-journal-id=125&query=nutrition+OR+diet',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // Gastroenterologie & Mikrobiom
  {
    name: 'Gut (BMJ Gastroenterology)',
    url: 'https://gut.bmj.com/rss/current.xml',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },

  // Onkologie
  {
    name: 'Supportive Care in Cancer',
    url: 'https://link.springer.com/search.rss?search-within=Journal&facet-journal-id=520&query=nutrition+OR+diet',
    defaultCategory: 'Onkologische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // Nephrologie
  {
    name: 'Journal of Renal Nutrition',
    url: 'https://rss.sciencedirect.com/publication/science/10512276',
    defaultCategory: 'Nieren & Leber',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — PubMed gezielte Suchen
  // ═══════════════════════════════════════════════

  {
    name: 'PubMed Nutrition (allgemein)',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/1j0OY2dS3KRkmSbVCJSxHiAyIZgaNG1pUbaTycln2oLjFr_8JD/?limit=10&utm_campaign=pubmed-2&fc=20250101000000',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Diabetes & Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=diabetes+AND+nutrition+AND+therapy&limit=10&fc=20250101000000',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Onko-Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=oncology+AND+nutrition+AND+(cachexia+OR+supportive)&limit=10&fc=20250101000000',
    defaultCategory: 'Onkologische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Sarkopenie',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=sarcopenia+AND+(nutrition+OR+protein)&limit=10&fc=20250101000000',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed GLP-1 & Adipositas',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(semaglutide+OR+tirzepatide+OR+GLP-1)+AND+(nutrition+OR+diet)&limit=10&fc=20250101000000',
    defaultCategory: 'GLP-1 & Adipositastherapie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Enterale & Parenterale Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(enteral+OR+parenteral)+AND+nutrition+AND+clinical&limit=10&fc=20250101000000',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Mangelernährung & Screening',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=malnutrition+AND+(screening+OR+hospital+OR+therapy)&limit=10&fc=20250101000000',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Darm-Mikrobiom & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=gut+microbiome+AND+(diet+OR+nutrition+OR+intervention)&limit=10&fc=20250101000000',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Niereninsuffizienz & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(renal+nutrition+OR+kidney+disease)+AND+diet&limit=10&fc=20250101000000',
    defaultCategory: 'Nieren & Leber',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Pädiatrische Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(pediatric+OR+paediatric)+AND+(nutrition+OR+malnutrition)&limit=10&fc=20250101000000',
    defaultCategory: 'Pädiatrische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Bariatrische Chirurgie & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=bariatric+surgery+AND+(nutrition+OR+supplement+OR+deficiency)&limit=10&fc=20250101000000',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Essstörungen & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=eating+disorders+AND+(nutrition+OR+refeeding+OR+therapy)&limit=10&fc=20250101000000',
    defaultCategory: 'Psychiatrie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Intensivmedizin & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=critical+care+AND+(enteral+OR+parenteral+OR+nutrition)&limit=10&fc=20250101000000',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed CED & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(Crohn+OR+colitis+OR+IBD)+AND+nutrition&limit=10&fc=20250101000000',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Omega-3 klinisch',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=omega-3+AND+(clinical+OR+intervention+OR+randomized)&limit=10&fc=20250101000000',
    defaultCategory: 'Supplements & NEM',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Vitamin D klinisch',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=vitamin+D+AND+(deficiency+OR+supplementation+OR+clinical+outcome)&limit=10&fc=20250101000000',
    defaultCategory: 'Supplements & NEM',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Mediterrane Diät',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=mediterranean+diet+AND+(clinical+OR+cardiovascular+OR+diabetes+OR+cancer)&limit=10&fc=20250101000000',
    defaultCategory: 'Kardiovaskulär',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Protein & Muskel',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=protein+intake+AND+(muscle+OR+aging+OR+elderly+OR+frailty)&limit=10&fc=20250101000000',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed NAFLD & Leber',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(NAFLD+OR+NASH+OR+liver+cirrhosis)+AND+(diet+OR+nutrition)&limit=10&fc=20250101000000',
    defaultCategory: 'Nieren & Leber',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Medikamenten-Nährstoff-Interaktionen',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=drug+nutrient+interaction+clinical&limit=10&fc=20250101000000',
    defaultCategory: 'Medikament-Nährstoff-Interaktionen',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Zöliakie & Glutenunverträglichkeit',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=celiac+disease+AND+(diet+OR+gluten+OR+nutrition)&limit=10&fc=20250101000000',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Herzinsuffizienz & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=heart+failure+AND+(nutrition+OR+diet+OR+cachexia)&limit=10&fc=20250101000000',
    defaultCategory: 'Kardiovaskulär',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Psychiatrie & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(depression+OR+anxiety+OR+schizophrenia)+AND+(nutrition+OR+diet)&limit=10&fc=20250101000000',
    defaultCategory: 'Psychiatrie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Sport & klinische Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(sport+OR+exercise)+AND+(nutrition+OR+protein+OR+supplement)+AND+clinical&limit=10&fc=20250101000000',
    defaultCategory: 'Sport & klinische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Nachhaltigkeit & Ernährung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(planetary+health+OR+sustainable+diet+OR+plant-based)+AND+nutrition&limit=10&fc=20250101000000',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Kurzdarmsyndrom & Intestinalversagen',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(short+bowel+syndrome+OR+intestinal+failure)+AND+nutrition&limit=10&fc=20250101000000',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Global Nutrition Policy',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(nutrition+policy)+AND+(global+OR+international+OR+WHO)&limit=10&fc=20250101000000',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'Lancet Global Health',
    url: 'https://www.thelancet.com/rssfeed/lancetgh_current.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'BMJ Nutrition Prevention & Health',
    url: 'https://nutrition.bmj.com/rss/current.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },

  // ═══════════════════════════════════════════════
  // FACHPRESSE — Deutsche Fachgesellschaften & Behörden
  // ═══════════════════════════════════════════════

  {
    name: 'DGE Presse',
    url: 'https://www.dge.de/rss-feed/',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'BZfE',
    url: 'https://www.bzfe.de/service/news/rss-feed/',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Deutsches Ärzteblatt',
    url: 'https://www.aerzteblatt.de/xml/atf.asp',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'BMEL (Bundesministerium Ernährung)',
    url: 'https://www.bmel.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_Meldungen.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'NDR Ratgeber Ernährung',
    url: 'https://www.ndr.de/ratgeber/gesundheit/ernaehrung/index.rss',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News DGEM/Ernährungsmedizin',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungsmedizin+OR+DGEM+OR+Ern%C3%A4hrungstherapie+Leitlinie&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News VDD/VDOE Berufspolitik',
    url: 'https://news.google.com/rss/search?q=VDD+Ern%C3%A4hrung+OR+VDOE+Di%C3%A4tassistent+OR+Ern%C3%A4hrungsberatung+Beruf&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News DDG Diabetes',
    url: 'https://news.google.com/rss/search?q=DDG+Diabetes+Leitlinie+OR+Diabetologie+Ern%C3%A4hrung+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News DAG Adipositas',
    url: 'https://news.google.com/rss/search?q=DAG+Adipositas+Leitlinie+OR+Adipositastherapie+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'GLP-1 & Adipositastherapie',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News Onkologie & Ernährung DE',
    url: 'https://news.google.com/rss/search?q=Onkologie+Ern%C3%A4hrung+OR+Kachexie+Therapie+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Onkologische Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },

  // ═══════════════════════════════════════════════
  // BERUFSPOLITIK — Institutionen & Regulierung
  // ═══════════════════════════════════════════════

  {
    name: 'G-BA Beschlüsse',
    url: 'https://www.g-ba.de/feeds/beschluesse/',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'IQWiG Berichte',
    url: 'https://www.iqwig.de/rss/projekte.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'AWMF Leitlinien',
    url: 'https://register.awmf.org/de/feed/leitlinien',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News Ernährungspolitik',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungspolitik+OR+Lebensmittelpolitik+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News GKV Ernährungstherapie',
    url: 'https://news.google.com/rss/search?q=GKV+Ern%C3%A4hrungstherapie+OR+Krankenkasse+Di%C3%A4t+Erstattung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },

  // ═══════════════════════════════════════════════
  // SUPPLEMENT — NEM & Lebensmittelsicherheit
  // ═══════════════════════════════════════════════

  {
    name: 'BfR Stellungnahmen',
    url: 'https://www.bfr.bund.de/de/rss_feed-79.html',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },
  {
    name: 'EFSA News',
    url: 'https://www.efsa.europa.eu/en/rss',
    defaultCategory: 'Supplements & NEM',
    language: 'en',
    sourceType: 'supplement',
  },
  {
    name: 'BVL Lebensmittelsicherheit',
    url: 'https://www.bvl.bund.de/SiteGlobals/Functions/RSSFeed/BVL/RSSFeed_Lebensmittel.xml',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },
  {
    name: 'Google News Nahrungsergänzung klinisch',
    url: 'https://news.google.com/rss/search?q=Nahrungserg%C3%A4nzungsmittel+Studie+OR+Supplement+klinisch+Ern%C3%A4hrung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL — Globale Perspektive
  // ═══════════════════════════════════════════════

  {
    name: 'WHO Nutrition',
    url: 'https://www.who.int/rss-feeds/news-english.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'FAO Food & Nutrition',
    url: 'https://www.fao.org/feeds/news/rss.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'ESPEN (European Society Clinical Nutrition)',
    url: 'https://news.google.com/rss/search?q=ESPEN+nutrition+guideline+OR+clinical+nutrition+Europe&hl=en&gl=US&ceid=US:en',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },

  // ═══════════════════════════════════════════════
  // GV / PRÄVENTION — Gemeinschaftsverpflegung & Gesundheitsförderung
  // ═══════════════════════════════════════════════

  {
    name: 'DGE Qualitätsstandards GV',
    url: 'https://news.google.com/rss/search?q=DGE+Qualit%C3%A4tsstandard+Gemeinschaftsverpflegung+OR+Schulverpflegung+OR+Seniorenverpflegung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Planetary Health Diet & Nachhaltigkeit',
    url: 'https://news.google.com/rss/search?q=Planetary+Health+Diet+OR+EAT+Lancet+OR+nachhaltige+Ern%C3%A4hrung+Gesundheit&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Bio-Lebensmittel & Qualität',
    url: 'https://news.google.com/rss/search?q=Bio-Lebensmittel+Qualit%C3%A4t+OR+%C3%B6kologische+Ern%C3%A4hrung+Studie&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Gemeinschaftsverpflegung & Kantine',
    url: 'https://news.google.com/rss/search?q=Gemeinschaftsverpflegung+Kantine+Ern%C3%A4hrung+OR+Betriebsgastronomie+Gesundheit&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Prävention & Gesundheitsförderung',
    url: 'https://news.google.com/rss/search?q=Pr%C3%A4vention+Ern%C3%A4hrung+Gesundheitsf%C3%B6rderung+OR+Ern%C3%A4hrungskompetenz+OR+Pr%C3%A4ventionsgesetz&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'PubMed Planetary Health & Nutrition',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(planetary+health+diet+OR+sustainable+food+system)+AND+(health+outcome+OR+nutrition)&limit=10&fc=20250101000000',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'PubMed Schulverpflegung',
    url: 'https://pubmed.ncbi.nlm.nih.gov/rss/search/?term=(school+meal+OR+school+lunch)+AND+(nutrition+OR+health+outcome)&limit=10&fc=20250101000000',
    defaultCategory: 'Pädiatrische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // LAIENPRESSE — Was Patienten gerade lesen
  // ═══════════════════════════════════════════════

  {
    name: 'Google News Ernährungstherapie allgemein',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungstherapie+OR+Ern%C3%A4hrungsmedizin+OR+Di%C3%A4tetik&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Laienpresse Spiegel/Stern/Focus',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrung+Gesundheit+(site:spiegel.de+OR+site:stern.de+OR+site:focus.de)&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Laienpresse BILD',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrung+Gesundheit+site:bild.de&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Laienpresse Apotheken Umschau',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrung+site:apotheken-umschau.de&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Laienpresse Diabetes Patienten',
    url: 'https://news.google.com/rss/search?q=Diabetes+Ern%C3%A4hrung+Di%C3%A4t+Patienten&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Laienpresse Abnehmen GLP-1',
    url: 'https://news.google.com/rss/search?q=(Ozempic+OR+Wegovy+OR+Abnehmen+Spritze)+Ern%C3%A4hrung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Laienpresse Krebs & Ernährung Patienten',
    url: 'https://news.google.com/rss/search?q=Krebs+Ern%C3%A4hrung+Di%C3%A4t+Patienten&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Clinical Nutrition Journals (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Clinical Nutrition Open Science',
    url: 'https://rss.sciencedirect.com/publication/science/26672685',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of the Academy of Nutrition and Dietetics',
    url: 'https://rss.sciencedirect.com/publication/science/22122672',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of Nutrition',
    url: 'https://rss.sciencedirect.com/publication/science/00223166',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Advances in Nutrition',
    url: 'https://rss.sciencedirect.com/publication/science/21618313',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition Reviews (OUP)',
    url: 'https://academic.oup.com/nutritionreviews/rss/current',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Current Opinion in Clinical Nutrition and Metabolic Care',
    url: 'https://journals.lww.com/co-clinicalnutrition/_layouts/oaks.journals/feed.aspx?FeedType=CurrentIssue',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition & Metabolism (BMC)',
    url: 'https://nutritionandmetabolism.biomedcentral.com/articles/most-recent/rss.xml',
    defaultCategory: 'Mikronährstoffe klinisch',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition Journal (BMC)',
    url: 'https://nutritionj.biomedcentral.com/articles/most-recent/rss.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Frontiers in Nutrition',
    url: 'https://www.frontiersin.org/journals/nutrition/rss',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Frontiers in Nutrition — Clinical Nutrition',
    url: 'https://www.frontiersin.org/journals/nutrition/sections/clinical-nutrition/rss',
    defaultCategory: 'Künstliche Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'bioRxiv Nutrition',
    url: 'http://connect.biorxiv.org/biorxiv_xml.php?subject=nutrition',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'medRxiv Nutrition',
    url: 'http://connect.medrxiv.org/medrxiv_xml.php?subject=Nutrition',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FACHPRESSE — Deutsche Journals Thieme
  // ═══════════════════════════════════════════════

  {
    name: 'Aktuelle Ernährungsmedizin',
    url: 'https://www.thieme-connect.de/rss/thieme/en/10.1055-s-00000003.xml',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Ernährung & Medizin',
    url: 'https://www.thieme-connect.de/rss/thieme/en/10.1055-s-00000093.xml',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Ernährungs Umschau',
    url: 'https://ernaehrungs-umschau.de/feed/',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Onkologische Ernährung (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Supportive Care in Cancer (full)',
    url: 'https://link.springer.com/search.rss?facet-journal-id=520&channel-name=Supportive+Care+in+Cancer',
    defaultCategory: 'Onkologische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of Cachexia, Sarcopenia and Muscle',
    url: 'https://onlinelibrary.wiley.com/feed/21906009/most-recent',
    defaultCategory: 'Onkologische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition and Cancer',
    url: 'https://www.tandfonline.com/action/showFeed?type=etoc&feed=rss&jc=hnuc20',
    defaultCategory: 'Onkologische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Diabetologie (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Diabetes Care — Current Issue',
    url: 'https://diabetesjournals.org/care/issue.rss',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Diabetes Care — Advance Articles',
    url: 'https://diabetesjournals.org/care/advance-article.rss',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Diabetologie und Stoffwechsel',
    url: 'https://www.thieme-connect.de/rss/thieme/en/10.1055-s-00000134.xml',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'de',
    sourceType: 'forschung',
  },
  {
    name: 'Lancet Diabetes & Endocrinology',
    url: 'https://www.thelancet.com/rssfeed/landia_current.xml',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Diabetes, Obesity and Metabolism',
    url: 'https://dom-pubs.onlinelibrary.wiley.com/action/showFeed?jc=dom&type=etoc&feed=rss',
    defaultCategory: 'Diabetologie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Gastroenterologie (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Gastroenterology (AGA)',
    url: 'https://www.gastrojournal.org/current.rss',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of Crohn\'s and Colitis',
    url: 'https://academic.oup.com/ecco-jcc/rss/current',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Gut Microbes',
    url: 'https://www.tandfonline.com/action/showFeed?type=etoc&feed=rss&jc=kgmi20',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Zeitschrift für Gastroenterologie',
    url: 'https://www.thieme-connect.de/rss/thieme/en/10.1055-s-00000094.xml',
    defaultCategory: 'Gastroenterologie',
    language: 'de',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Nephrologie & Hepatologie
  // ═══════════════════════════════════════════════

  {
    name: 'Nephrology Dialysis Transplantation',
    url: 'https://academic.oup.com/ndt/rss/current',
    defaultCategory: 'Nieren & Leber',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of Hepatology',
    url: 'https://rss.sciencedirect.com/publication/science/01688278',
    defaultCategory: 'Nieren & Leber',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'JHEP Reports',
    url: 'https://rss.sciencedirect.com/publication/science/25895559',
    defaultCategory: 'Nieren & Leber',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Kardiovaskulär
  // ═══════════════════════════════════════════════

  {
    name: 'European Heart Journal',
    url: 'https://academic.oup.com/eurheartj/rss/current',
    defaultCategory: 'Kardiovaskulär',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Circulation (AHA)',
    url: 'https://www.ahajournals.org/action/showFeed?type=etoc&feed=rss&jc=circ',
    defaultCategory: 'Kardiovaskulär',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'European Journal of Preventive Cardiology',
    url: 'https://academic.oup.com/eurjpc/rss/current',
    defaultCategory: 'Kardiovaskulär',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Geriatrie & Sarkopenie (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Age and Ageing',
    url: 'https://academic.oup.com/ageing/rss/current',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of the American Geriatrics Society',
    url: 'https://onlinelibrary.wiley.com/feed/15325415/most-recent',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'European Geriatric Medicine',
    url: 'https://link.springer.com/search.rss?facet-content-type=Article&facet-journal-id=41999',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Zeitschrift für Gerontologie und Geriatrie',
    url: 'https://link.springer.com/search.rss?facet-content-type=Article&facet-journal-id=391',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'de',
    sourceType: 'forschung',
  },
  {
    name: 'Dysphagia',
    url: 'https://link.springer.com/search.rss?facet-content-type=Article&facet-journal-id=455',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Pädiatrische Ernährung (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Archives of Disease in Childhood',
    url: 'https://adc.bmj.com/rss/current.xml',
    defaultCategory: 'Pädiatrische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Maternal & Child Nutrition',
    url: 'https://onlinelibrary.wiley.com/feed/17408709/most-recent',
    defaultCategory: 'Pädiatrische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Lancet Child & Adolescent Health',
    url: 'https://www.thelancet.com/rssfeed/lanchi_current.xml',
    defaultCategory: 'Pädiatrische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Psychiatrie & Ernährung (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Nutritional Neuroscience',
    url: 'https://www.tandfonline.com/feed/rss/ynns20',
    defaultCategory: 'Psychiatrie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'International Journal of Eating Disorders',
    url: 'https://onlinelibrary.wiley.com/feed/1098108x/most-recent',
    defaultCategory: 'Psychiatrie & Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Adipositas & Gewichtsmanagement (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'Obesity (Wiley)',
    url: 'https://onlinelibrary.wiley.com/feed/1930739x/most-recent',
    defaultCategory: 'Adipositas & Gewichtsmanagement',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Obesity Surgery',
    url: 'https://link.springer.com/search.rss?facet-content-type=Article&facet-journal-id=11695',
    defaultCategory: 'GLP-1 & Adipositastherapie',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // FORSCHUNG — Sport & klinische Ernährung
  // ═══════════════════════════════════════════════

  {
    name: 'British Journal of Sports Medicine',
    url: 'https://bjsm.bmj.com/rss/current.xml',
    defaultCategory: 'Sport & klinische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },
  {
    name: 'Journal of the International Society of Sports Nutrition',
    url: 'https://www.tandfonline.com/feed/rss/rjsn20',
    defaultCategory: 'Sport & klinische Ernährung',
    language: 'en',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // BERUFSPOLITIK — Deutsche Institutionen (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'BMLEH — Pressemitteilungen',
    url: 'https://www.bmleh.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_Pressemitteilungen.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'BMLEH — Neue Beiträge',
    url: 'https://www.bmleh.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_NeueBeitraege.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'G-BA — Beschlüsse (letzte Änderungen)',
    url: 'https://www.g-ba.de/beschluesse/letzte-aenderungen/?rss=1',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'G-BA — Nutzenbewertung §35a',
    url: 'https://www.g-ba.de/bewertungsverfahren/nutzenbewertung/letzte-aenderungen/?rss=1',
    defaultCategory: 'GLP-1 & Adipositastherapie',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'G-BA — Pressemitteilungen',
    url: 'https://www.g-ba.de/presse/pressemitteilungen-meldungen/letzte-aenderungen/?rss=1',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'RKI — Publications',
    url: 'https://edoc.rki.de/feed/atom_1.0/site',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'BfR — Pressemitteilungen',
    url: 'https://www.bfr.bund.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_Pressemitteilungen.xml',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },
  {
    name: 'BVL — Pressemitteilungen',
    url: 'https://www.bvl.bund.de/SiteGlobals/Functions/RSSFeed/RSSNewsfeed/RSSNewsfeed_Pressemitteilungen.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Deutsches Ärzteblatt — News',
    url: 'https://rss.aerzteblatt.de/rss/news.asp',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Deutsche Apotheker Zeitung',
    url: 'https://feeds.purplemanager.com/63cea2f6-fc14-445a-b7b3-4e7f2eafeff5/newsletter-news-neu',
    defaultCategory: 'Medikament-Nährstoff-Interaktionen',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Pharmazeutische Zeitung',
    url: 'https://www.pharmazeutische-zeitung.de/fileadmin/rss/pz_online_rss.php',
    defaultCategory: 'Medikament-Nährstoff-Interaktionen',
    language: 'de',
    sourceType: 'fachpresse',
  },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL — Europäische & internationale Quellen (Ergänzung)
  // ═══════════════════════════════════════════════

  {
    name: 'EFSA — Publications',
    url: 'https://www.efsa.europa.eu/en/publications/rss',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'EFSA — Press',
    url: 'https://www.efsa.europa.eu/en/press/rss',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'Lancet — Current Issue',
    url: 'https://www.thelancet.com/rssfeed/lancet_current.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'Lancet Gastroenterology & Hepatology',
    url: 'https://www.thelancet.com/rssfeed/langas_current.xml',
    defaultCategory: 'Gastroenterologie',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'The BMJ — Research',
    url: 'https://www.bmj.com/rss/research.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'Cochrane — New Reviews',
    url: 'https://www.cochranelibrary.com/rss/reviews/new-reviews.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'Cochrane — Updated Reviews',
    url: 'https://www.cochranelibrary.com/rss/reviews/updated-reviews.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'en',
    sourceType: 'international',
  },
  {
    name: 'EUR-Lex — All Legislation',
    url: 'https://eur-lex.europa.eu/EN/display-feed.rss?rssId=162',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'en',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Buzer.de — Gesetzesänderungen',
    url: 'https://www.buzer.de/gesetze_feed.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News — Digitalisierung Ernährungstherapie',
    url: 'https://news.google.com/rss/search?q=Digitalisierung+Ern%C3%A4hrungstherapie+OR+DiGA+Ern%C3%A4hrung+OR+Telemedizin+Ern%C3%A4hrungsberatung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News — Ernährungsberater Beruf',
    url: 'https://news.google.com/rss/search?q=Ern%C3%A4hrungsberater+OR+Ern%C3%A4hrungstherapeut+OR+Di%C3%A4tassistent+Beruf+OR+Ausbildung+OR+Vergütung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News — GLP-1 Adipositas Zulassung',
    url: 'https://news.google.com/rss/search?q=Wegovy+OR+Mounjaro+OR+GLP-1+Adipositas+Deutschland+Zulassung+OR+Erstattung+OR+Krankenkasse&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'GLP-1 & Adipositastherapie',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News — DiGA Gesundheits-Apps',
    url: 'https://news.google.com/rss/search?q=DiGA+digitale+Gesundheitsanwendung+OR+Gesundheits-App+Erstattung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News — Präventionsgesetz Ernährung',
    url: 'https://news.google.com/rss/search?q=Pr%C3%A4ventionsgesetz+OR+Pr%C3%A4ventivmedizin+Ern%C3%A4hrung+Deutschland&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'VDD — Verband der Diätassistenten',
    url: 'https://www.vdd.de/feed/',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'VDOE — Berufsverband Oecotrophologie',
    url: 'https://www.vdoe.de/feed/',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Ärzteblatt — Ernährungsmedizin',
    url: 'https://www.aerzteblatt.de/newsfeed/xml/topic/Ernaehrungsmedizin',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Ärzteblatt — Gesundheitspolitik',
    url: 'https://www.aerzteblatt.de/newsfeed/xml/topic/Gesundheitspolitik',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'BMG — Pressemitteilungen',
    url: 'https://www.bundesgesundheitsministerium.de/presse/rss-presse',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Gematik — eHealth News',
    url: 'https://www.gematik.de/newsroom/news/feed',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },

  // ═══════════════════════════════════════════════
  // LAIENPRESSE — Deutsche Medien Gesundheitsseiten
  // ═══════════════════════════════════════════════

  {
    name: 'Spiegel — Gesundheit',
    url: 'https://www.spiegel.de/gesundheit/index.rss',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Focus — Gesundheit',
    url: 'https://rss.focus.de/gesundheit/rss',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'FAZ — Medizin & Ernährung',
    url: 'https://www.faz.net/rss/aktuell/wissen/medizin-ernaehrung/',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'ZEIT — Wissen',
    url: 'https://newsfeed.zeit.de/wissen/index',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Süddeutsche Zeitung — Gesundheit',
    url: 'https://rss.sueddeutsche.de/rss/Gesundheit',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Stern — Gesundheit',
    url: 'https://www.stern.de/feed/standard/gesundheit/',
    defaultCategory: 'Laienpresse & Patientenfragen',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Quarks (WDR)',
    url: 'https://www.quarks.de/feed/',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Spektrum der Wissenschaft',
    url: 'https://www.spektrum.de/alias/rss/spektrum-de-rss-feed/996406',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'laienpresse',
  },

  // ═══════════════════════════════════════════════
  // LAIENPRESSE / SUPPLEMENT — Verbraucherschutz
  // ═══════════════════════════════════════════════

  {
    name: 'Stiftung Warentest — Ernährung',
    url: 'https://www.test.de/rss/thema/ernaehrung/',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'laienpresse',
  },
  {
    name: 'Verbraucherzentrale NRW — Lebensmittel',
    url: 'https://www.verbraucherzentrale.nrw/wissen/lebensmittel/feed',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },
  {
    name: 'Verbraucherzentrale NRW — Gesundheit',
    url: 'https://www.verbraucherzentrale.nrw/wissen/gesundheit-pflege/feed',
    defaultCategory: 'Supplements & NEM',
    language: 'de',
    sourceType: 'supplement',
  },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL — Nachhaltigkeit
  // ═══════════════════════════════════════════════

  {
    name: 'WWF Deutschland — Presse',
    url: 'https://www.wwf.de/rss/feed-33779/feed.xml',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'international',
  },
  {
    name: 'WWF Deutschland — Klima',
    url: 'https://www.wwf.de/rss/feed-33698/feed.xml',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'international',
  },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL — Französische Quellen
  // ═══════════════════════════════════════════════

  {
    name: 'ANSES — Alimentation',
    url: 'https://www.anses.fr/fr/theme-alimentation.rss',
    defaultCategory: 'Internationale Perspektive',
    language: 'fr',
    sourceType: 'international',
  },
  {
    name: 'Cahiers de Nutrition et de Diététique',
    url: 'https://rss.sciencedirect.com/publication/science/00079960',
    defaultCategory: 'Internationale Perspektive',
    language: 'fr',
    sourceType: 'forschung',
  },
  {
    name: 'Nutrition Clinique et Métabolisme',
    url: 'https://rss.sciencedirect.com/publication/science/09850562',
    defaultCategory: 'Internationale Perspektive',
    language: 'fr',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL — Niederländische Quellen
  // ═══════════════════════════════════════════════

  {
    name: 'Voedingscentrum',
    url: 'http://feeds.feedburner.com/voedingscentrum/',
    defaultCategory: 'Internationale Perspektive',
    language: 'nl',
    sourceType: 'international',
  },
  {
    name: 'RIVM News',
    url: 'https://www.rivm.nl/nieuws/rss.xml',
    defaultCategory: 'Internationale Perspektive',
    language: 'nl',
    sourceType: 'international',
  },

  // ═══════════════════════════════════════════════
  // INTERNATIONAL — Spanische Quellen
  // ═══════════════════════════════════════════════

  {
    name: 'Nutrición Hospitalaria',
    url: 'https://scielo.isciii.es/rss.php?pid=0212-1611&lang=es',
    defaultCategory: 'Internationale Perspektive',
    language: 'es',
    sourceType: 'forschung',
  },
  {
    name: 'Endocrinología, Diabetes y Nutrición',
    url: 'https://rss.sciencedirect.com/publication/science/25300164',
    defaultCategory: 'Internationale Perspektive',
    language: 'es',
    sourceType: 'forschung',
  },

  // ═══════════════════════════════════════════════
  // LEBENSMITTELINDUSTRIE — Produkte & Reformulierung
  // ═══════════════════════════════════════════════

  {
    name: 'Lebensmittelzeitung',
    url: 'https://www.lebensmittelzeitung.net/rss/news.xml',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News — Lebensmittelindustrie Reformulierung',
    url: 'https://news.google.com/rss/search?q=Lebensmittelindustrie+Reformulierung+OR+Zuckerreduktion+OR+Nutri-Score+OR+Produktneuheit+Ern%C3%A4hrung&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'BVE — Bundesvereinigung Ernährungsindustrie',
    url: 'https://www.bve-online.de/presse/pressemitteilungen/feed',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'FoodNavigator',
    url: 'https://www.foodnavigator.com/rss/news',
    defaultCategory: 'Nachhaltigkeit & Ernährung',
    language: 'en',
    sourceType: 'fachpresse',
  },
  {
    name: 'NutritionInsight',
    url: 'https://www.nutritioninsight.com/rss/news.xml',
    defaultCategory: 'Supplements & NEM',
    language: 'en',
    sourceType: 'fachpresse',
  },

  // ═══════════════════════════════════════════════
  // KLINIK & KRANKENHAUS — Verpflegung & Management
  // ═══════════════════════════════════════════════

  {
    name: 'Google News — Krankenhausernährung Verpflegung',
    url: 'https://news.google.com/rss/search?q=Krankenhausern%C3%A4hrung+OR+Klinische+Ern%C3%A4hrung+OR+Verpflegungsmanagement+OR+Mangelern%C3%A4hrung+Klinik&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Künstliche Ernährung',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'kma Online — Klinikmanagement',
    url: 'https://www.kma-online.de/rss/aktuell.xml',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'Google News — Gemeinschaftsverpflegung Seniorenheim',
    url: 'https://news.google.com/rss/search?q=Gemeinschaftsverpflegung+OR+Seniorenheim+Ern%C3%A4hrung+OR+Schulverpflegung+OR+Mensa+Qualit%C3%A4t&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Geriatrie & Sarkopenie',
    language: 'de',
    sourceType: 'fachpresse',
  },

  // ═══════════════════════════════════════════════
  // DIGITAL HEALTH — Apps, Wearables, Startups
  // ═══════════════════════════════════════════════

  {
    name: 'Google News — Digital Health Ernährung',
    url: 'https://news.google.com/rss/search?q=Digital+Health+Ern%C3%A4hrung+OR+Ern%C3%A4hrungs-App+OR+Food+Tracking+OR+CGM+Glukosemonitor&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'de',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Healthcare IT News',
    url: 'https://www.healthcareitnews.com/feed',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'en',
    sourceType: 'berufspolitik',
  },
  {
    name: 'Google News — Ernährung Startup Foodtech',
    url: 'https://news.google.com/rss/search?q=FoodTech+Startup+Ern%C3%A4hrung+OR+Personalisierte+Ern%C3%A4hrung+KI+OR+Nutrigenomik&hl=de&gl=DE&ceid=DE:de',
    defaultCategory: 'Fortbildung & Lehre',
    language: 'de',
    sourceType: 'fachpresse',
  },
  {
    name: 'MobiHealthNews',
    url: 'https://www.mobihealthnews.com/feed',
    defaultCategory: 'Berufspolitik & Recht',
    language: 'en',
    sourceType: 'berufspolitik',
  },
];
