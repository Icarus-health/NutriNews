import type { Locale } from './config';

// Flat key dictionaries. Use t('key', { n }) for {n} interpolation.
// German is the source of truth; English mirrors it. Missing keys fall back to de.
const de: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.community': 'Community',
  'nav.inbox': 'Posteingang',
  'nav.saved': 'Gespeichert',
  'nav.profile': 'Profil',
  'nav.admin': 'Admin',

  // Common
  'common.back': 'Zurück',
  'common.source': 'Quelle',
  'common.more': 'mehr',
  'common.new': 'Neu',

  // Time
  'time.now': 'gerade eben',
  'time.min': 'vor {n} Min',
  'time.hour': 'vor {n} Std',
  'time.day': 'vor {n} Tag',
  'time.days': 'vor {n} Tagen',

  // Source types
  'sourceType.forschung': 'Forschung',
  'sourceType.fachpresse': 'Fachpresse',
  'sourceType.laienpresse': 'Laienpresse',
  'sourceType.berufspolitik': 'Berufspolitik',
  'sourceType.supplement': 'Supplements',
  'sourceType.international': 'International',

  // Card
  'card.readDetails': 'Details lesen',
  'card.what': 'Was?',
  'card.result': 'Ergebnis',
  'card.consequence': 'Konsequenz',
  'card.moreDetails': 'Mehr Details',
  'card.evidenceContext': 'Evidenz-Einordnung',
  'card.actionRecommendation': 'Handlungsempfehlung',
  'card.patientQuestion': 'Erwartbare Patientenfrage',
  'card.policyAction': 'Was ist zu tun?',
  'card.relevanceDE': 'Relevanz für Deutschland',
  'card.factCheckAvailable': '📰 Faktencheck verfügbar',
  'card.mediaReport': 'Medienbericht',
  'card.expertContext': 'Fachliche Einordnung',
  'card.factCheck': 'Faktencheck',
  'card.aiSummary': 'KI-zusammengefasst',
  'card.addNote': 'Notiz hinzufügen',
  'card.editNote': 'Notiz bearbeiten',
  'card.hideNote': 'Notiz ausblenden',
  'card.notePlaceholder': 'Persönliche Notiz zu dieser Karte...',
  'card.hide': 'Nicht mehr anzeigen',
  'card.copied': 'Kopiert',
  'card.translating': 'übersetzt…',

  // Feed
  'feed.offline': 'Offline — du siehst zwischengespeicherte Inhalte',
  'feed.loading': 'Lädt...',
  'feed.offlineNoMore': 'Offline — kein Nachladen möglich',
  'feed.emptyFiltered.title': 'Keine Treffer',
  'feed.emptyFiltered.body': 'Für diese Filterauswahl gibt es keine Meldungen. Filter anpassen oder zurücksetzen.',
  'feed.empty.title': 'Gleich geht\'s los',
  'feed.empty.body': 'Die nächste Kuration läuft automatisch. Normalerweise erscheinen täglich neue Artikel.',

  // Header
  'header.subtitle': 'News für Ernährungsfachkräfte',
  'header.searchPlaceholder': 'News durchsuchen...',
  'header.allCategories': 'Alle Kategorien',
  'header.categoriesN': '{n} Kategorien',
  'header.filter': 'Filter',
  'header.done': 'Fertig',
  'header.resetAll': 'Alle zurücksetzen',
  'header.recent': 'Zuletzt:',
  'header.reset': 'Zurücksetzen',
  'header.searchDelete': 'Löschen',
  'header.days7': '7 Tage',
  'header.days30': '30 Tage',
  'header.days90': '90 Tage',

  // Briefing
  'briefing.today': 'Morgen-Briefing',
  'briefing.yesterday': 'Gestriges Briefing',
  'briefing.items': '{n} Meldungen',

  // Login
  'login.tagline': 'Für Ernährungsfachkräfte',
  'login.footer': 'Aktuelle Fachnews · Keine Werbung',

  // Profile
  'profile.language': 'Sprache',
  'profile.languageHint': 'Sprache der Oberfläche und der Inhalte',
};

const en: Record<string, string> = {
  // Navigation
  'nav.home': 'Home',
  'nav.community': 'Community',
  'nav.inbox': 'Inbox',
  'nav.saved': 'Saved',
  'nav.profile': 'Profile',
  'nav.admin': 'Admin',

  // Common
  'common.back': 'Back',
  'common.source': 'Source',
  'common.more': 'more',
  'common.new': 'New',

  // Time
  'time.now': 'just now',
  'time.min': '{n} min ago',
  'time.hour': '{n} h ago',
  'time.day': '{n} day ago',
  'time.days': '{n} days ago',

  // Source types
  'sourceType.forschung': 'Research',
  'sourceType.fachpresse': 'Trade press',
  'sourceType.laienpresse': 'Lay press',
  'sourceType.berufspolitik': 'Policy',
  'sourceType.supplement': 'Supplements',
  'sourceType.international': 'International',

  // Card
  'card.readDetails': 'Read details',
  'card.what': 'What?',
  'card.result': 'Result',
  'card.consequence': 'Takeaway',
  'card.moreDetails': 'More details',
  'card.evidenceContext': 'Evidence appraisal',
  'card.actionRecommendation': 'Recommended action',
  'card.patientQuestion': 'Expected patient question',
  'card.policyAction': 'What to do?',
  'card.relevanceDE': 'Relevance for Germany',
  'card.factCheckAvailable': '📰 Fact-check available',
  'card.mediaReport': 'Media claim',
  'card.expertContext': 'Expert appraisal',
  'card.factCheck': 'Fact-check',
  'card.aiSummary': 'AI-summarised',
  'card.addNote': 'Add note',
  'card.editNote': 'Edit note',
  'card.hideNote': 'Hide note',
  'card.notePlaceholder': 'Personal note on this card...',
  'card.hide': 'Hide this card',
  'card.copied': 'Copied',
  'card.translating': 'translating…',

  // Feed
  'feed.offline': 'Offline — showing cached content',
  'feed.loading': 'Loading...',
  'feed.offlineNoMore': 'Offline — cannot load more',
  'feed.emptyFiltered.title': 'No matches',
  'feed.emptyFiltered.body': 'No items for this filter selection. Adjust or reset the filters.',
  'feed.empty.title': 'Coming right up',
  'feed.empty.body': 'The next curation runs automatically. New articles usually appear daily.',

  // Header
  'header.subtitle': 'News for nutrition professionals',
  'header.searchPlaceholder': 'Search news...',
  'header.allCategories': 'All categories',
  'header.categoriesN': '{n} categories',
  'header.filter': 'Filters',
  'header.done': 'Done',
  'header.resetAll': 'Reset all',
  'header.recent': 'Recent:',
  'header.reset': 'Reset',
  'header.searchDelete': 'Clear',
  'header.days7': '7 days',
  'header.days30': '30 days',
  'header.days90': '90 days',

  // Briefing
  'briefing.today': 'Morning briefing',
  'briefing.yesterday': 'Yesterday\'s briefing',
  'briefing.items': '{n} items',

  // Login
  'login.tagline': 'For nutrition professionals',
  'login.footer': 'Latest professional news · No ads',

  // Profile
  'profile.language': 'Language',
  'profile.languageHint': 'Language of the interface and content',
};

export const MESSAGES: Record<Locale, Record<string, string>> = { de, en };

export function translate(locale: Locale, key: string, vars?: Record<string, string | number>): string {
  let str = MESSAGES[locale]?.[key] ?? MESSAGES.de[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}
