// ═══════════════════════════════════════════════════════════════
// Neues Kategoriensystem: Beratungsanlass-basiert statt anatomisch
// Ebene 1: Berufskontext (Gruppierung für UI)
// Ebene 2: 20 Themenfelder (category_main in DB)
// ═══════════════════════════════════════════════════════════════

export const CATEGORY_CONTEXTS = [
  {
    id: 'klinisch',
    label: 'Klinische Ernährungstherapie',
    topics: [
      'Künstliche Ernährung',
      'Onkologische Ernährung',
      'Geriatrie & Sarkopenie',
      'Nieren & Leber',
    ],
  },
  {
    id: 'ambulant',
    label: 'Ambulante Ernährungstherapie',
    topics: [
      'GLP-1 & Adipositastherapie',
      'Diabetologie & Ernährung',
      'Gastroenterologie',
      'Supplements & NEM',
      'Kardiovaskulär',
      'Psychiatrie & Ernährung',
      'Pädiatrische Ernährung',
    ],
  },
  {
    id: 'praevention',
    label: 'Prävention & Gesundheitsförderung',
    topics: [
      'Nachhaltigkeit & Ernährung',
      'Sport & klinische Ernährung',
      'Mikronährstoffe klinisch',
      'Adipositas & Gewichtsmanagement',
    ],
  },
  {
    id: 'forschung',
    label: 'Ernährungsmedizin & Forschung',
    topics: [
      'Berufspolitik & Recht',
      'Fortbildung & Lehre',
      'Laienpresse & Patientenfragen',
      'Internationale Perspektive',
      'Medikament-Nährstoff-Interaktionen',
    ],
  },
] as const;

export const CATEGORIES = [
  // Klinische Ernährungstherapie
  { id: 'Künstliche Ernährung',              label: 'Künstliche Ernährung',              color: 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300' },
  { id: 'Onkologische Ernährung',            label: 'Onkologische Ernährung',            color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'Geriatrie & Sarkopenie',            label: 'Geriatrie & Sarkopenie',            color: 'bg-stone-100 text-stone-800 dark:bg-stone-800/50 dark:text-stone-300' },
  { id: 'Nieren & Leber',                    label: 'Nieren & Leber',                    color: 'bg-slate-100 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300' },
  // Ambulante Ernährungstherapie
  { id: 'GLP-1 & Adipositastherapie',        label: 'Adipositas',                        color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  { id: 'Diabetologie & Ernährung',          label: 'Diabetologie',                      color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  { id: 'Gastroenterologie',                 label: 'Gastroenterologie',                 color: 'bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-300' },
  { id: 'Supplements & NEM',                 label: 'Supplements & NEM',                 color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'Kardiovaskulär',                    label: 'Kardiovaskulär',                    color: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  { id: 'Psychiatrie & Ernährung',           label: 'Psychiatrie & Ernährung',           color: 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300' },
  { id: 'Pädiatrische Ernährung',            label: 'Pädiatrische Ernährung',            color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300' },
  // Prävention & Gesundheitsförderung
  { id: 'Nachhaltigkeit & Ernährung',        label: 'Nachhaltigkeit',                    color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  { id: 'Sport & klinische Ernährung',       label: 'Sport & Ernährung',                 color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { id: 'Mikronährstoffe klinisch',          label: 'Mikronährstoffe',                   color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'Adipositas & Gewichtsmanagement',   label: 'Gewichtsmanagement',                color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  // Ernährungsmedizin & Forschung
  { id: 'Berufspolitik & Recht',             label: 'Berufspolitik',                     color: 'bg-orange-200 text-orange-900 dark:bg-orange-900/40 dark:text-orange-300' },
  { id: 'Fortbildung & Lehre',               label: 'Fortbildung & Lehre',               color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { id: 'Laienpresse & Patientenfragen',     label: 'Laienpresse',                       color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { id: 'Internationale Perspektive',        label: 'International',                     color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  { id: 'Medikament-Nährstoff-Interaktionen', label: 'Medikament-Interaktion',           color: 'bg-red-50 text-red-900 dark:bg-red-900/40 dark:text-red-300' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export function getCategoryStyle(id: string): string {
  // Erst im neuen System suchen
  const cat = CATEGORIES.find(c => c.id === id);
  if (cat) return cat.color;
  // Fallback: alte Kategorie via Mapping auflösen
  const mapped = LEGACY_CATEGORY_MAP[id];
  if (mapped) {
    const mappedCat = CATEGORIES.find(c => c.id === mapped);
    if (mappedCat) return mappedCat.color;
  }
  return 'bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300';
}

export function getCategoryLabel(id: string): string {
  const cat = CATEGORIES.find(c => c.id === id);
  if (cat) return cat.label;
  const mapped = LEGACY_CATEGORY_MAP[id];
  if (mapped) {
    const mappedCat = CATEGORIES.find(c => c.id === mapped);
    if (mappedCat) return mappedCat.label;
  }
  return id;
}

// ═══════════════════════════════════════════════════════════════
// Mapping alte Kategorien → neue Kategorien
// Wird für Migration bestehender Karten und Nutzerprofile genutzt
// ═══════════════════════════════════════════════════════════════

export const LEGACY_CATEGORY_MAP: Record<string, CategoryId> = {
  'Wissenschaft':            'Fortbildung & Lehre',
  'Ernährungsmedizin':       'Mikronährstoffe klinisch',
  'Klinik':                  'Künstliche Ernährung',
  'Forschung':               'Fortbildung & Lehre',
  'Politik':                 'Berufspolitik & Recht',
  'Medikation':              'Medikament-Nährstoff-Interaktionen',
  'Praxis':                  'GLP-1 & Adipositastherapie',
  'Pädiatrie':               'Pädiatrische Ernährung',
  'Onkologie':               'Onkologische Ernährung',
  'Diabetologie':            'Diabetologie & Ernährung',
  'Gastroenterologie':       'Gastroenterologie',
  'Sportmedizin':            'Sport & klinische Ernährung',
  'Psychiatrie':             'Psychiatrie & Ernährung',
  'Hepatologie':             'Nieren & Leber',
  'Nephrologie':             'Nieren & Leber',
  'Fettstoffwechsel':        'Kardiovaskulär',
  'Ernährungspsychologie':   'Psychiatrie & Ernährung',
  'Geriatrie':               'Geriatrie & Sarkopenie',
  'Trends':                  'Laienpresse & Patientenfragen',
  // Umlauts-Varianten aus dem Kuratierungs-Prompt (ASCII)
  'Ernaehrungsmedizin':      'Mikronährstoffe klinisch',
  'Ernaehrungspsychologie':  'Psychiatrie & Ernährung',
  'Paediatrie':              'Pädiatrische Ernährung',
};

/** Löst eine alte Kategorie auf die neue auf, oder gibt den Wert unverändert zurück */
export function resolveCategory(category: string): CategoryId {
  if (CATEGORIES.some(c => c.id === category)) return category as CategoryId;
  return LEGACY_CATEGORY_MAP[category] ?? 'Fortbildung & Lehre';
}

// ═══════════════════════════════════════════════════════════════
// Farblicher Karten-Akzent pro Kategorie (linker Rand)
// Gibt visuell sofort Orientierung im Feed
// ═══════════════════════════════════════════════════════════════

const CATEGORY_CARD_ACCENTS: Record<string, string> = {
  'Künstliche Ernährung':              'border-l-teal-400 dark:border-l-teal-500',
  'Onkologische Ernährung':            'border-l-purple-400 dark:border-l-purple-500',
  'Geriatrie & Sarkopenie':            'border-l-stone-400 dark:border-l-stone-500',
  'Nieren & Leber':                    'border-l-slate-400 dark:border-l-slate-500',
  'GLP-1 & Adipositastherapie':        'border-l-red-400 dark:border-l-red-500',
  'Diabetologie & Ernährung':          'border-l-amber-400 dark:border-l-amber-500',
  'Gastroenterologie':                 'border-l-lime-400 dark:border-l-lime-500',
  'Supplements & NEM':                 'border-l-emerald-400 dark:border-l-emerald-500',
  'Kardiovaskulär':                    'border-l-rose-400 dark:border-l-rose-500',
  'Psychiatrie & Ernährung':           'border-l-violet-400 dark:border-l-violet-500',
  'Pädiatrische Ernährung':            'border-l-pink-400 dark:border-l-pink-500',
  'Nachhaltigkeit & Ernährung':        'border-l-green-400 dark:border-l-green-500',
  'Sport & klinische Ernährung':       'border-l-cyan-400 dark:border-l-cyan-500',
  'Mikronährstoffe klinisch':          'border-l-blue-400 dark:border-l-blue-500',
  'Adipositas & Gewichtsmanagement':   'border-l-orange-400 dark:border-l-orange-500',
  'Berufspolitik & Recht':             'border-l-orange-500 dark:border-l-orange-400',
  'Fortbildung & Lehre':               'border-l-indigo-400 dark:border-l-indigo-500',
  'Laienpresse & Patientenfragen':     'border-l-yellow-400 dark:border-l-yellow-500',
  'Internationale Perspektive':        'border-l-sky-400 dark:border-l-sky-500',
  'Medikament-Nährstoff-Interaktionen': 'border-l-red-300 dark:border-l-red-400',
};

/** Gibt die Tailwind-Klasse für den farbigen linken Kartenrand zurück */
export function getCategoryCardAccent(id: string): string {
  const direct = CATEGORY_CARD_ACCENTS[id];
  if (direct) return direct;
  const mapped = LEGACY_CATEGORY_MAP[id];
  if (mapped) return CATEGORY_CARD_ACCENTS[mapped] ?? '';
  return 'border-l-slate-300 dark:border-l-slate-600';
}
