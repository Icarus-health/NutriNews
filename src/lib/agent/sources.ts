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
];
