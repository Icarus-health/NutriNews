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
  { id: 'Künstliche Ernährung',              label: 'Künstliche Ernährung',              color: 'bg-teal-100 text-teal-800' },
  { id: 'Onkologische Ernährung',            label: 'Onkologische Ernährung',            color: 'bg-purple-100 text-purple-800' },
  { id: 'Geriatrie & Sarkopenie',            label: 'Geriatrie & Sarkopenie',            color: 'bg-stone-100 text-stone-800' },
  { id: 'Nieren & Leber',                    label: 'Nieren & Leber',                    color: 'bg-slate-100 text-slate-800' },
  // Ambulante Ernährungstherapie
  { id: 'GLP-1 & Adipositastherapie',        label: 'GLP-1 & Adipositas',                color: 'bg-red-100 text-red-800' },
  { id: 'Diabetologie & Ernährung',          label: 'Diabetologie',                      color: 'bg-amber-100 text-amber-800' },
  { id: 'Gastroenterologie',                 label: 'Gastroenterologie',                 color: 'bg-lime-100 text-lime-800' },
  { id: 'Supplements & NEM',                 label: 'Supplements & NEM',                 color: 'bg-emerald-100 text-emerald-800' },
  { id: 'Kardiovaskulär',                    label: 'Kardiovaskulär',                    color: 'bg-rose-100 text-rose-800' },
  { id: 'Psychiatrie & Ernährung',           label: 'Psychiatrie & Ernährung',           color: 'bg-violet-100 text-violet-800' },
  { id: 'Pädiatrische Ernährung',            label: 'Pädiatrische Ernährung',            color: 'bg-pink-100 text-pink-800' },
  // Prävention & Gesundheitsförderung
  { id: 'Nachhaltigkeit & Ernährung',        label: 'Nachhaltigkeit',                    color: 'bg-green-100 text-green-800' },
  { id: 'Sport & klinische Ernährung',       label: 'Sport & Ernährung',                 color: 'bg-cyan-100 text-cyan-800' },
  { id: 'Mikronährstoffe klinisch',          label: 'Mikronährstoffe',                   color: 'bg-blue-100 text-blue-800' },
  { id: 'Adipositas & Gewichtsmanagement',   label: 'Adipositas',                        color: 'bg-orange-100 text-orange-800' },
  // Ernährungsmedizin & Forschung
  { id: 'Berufspolitik & Recht',             label: 'Berufspolitik',                     color: 'bg-orange-200 text-orange-900' },
  { id: 'Fortbildung & Lehre',               label: 'Fortbildung & Lehre',               color: 'bg-indigo-100 text-indigo-800' },
  { id: 'Laienpresse & Patientenfragen',     label: 'Laienpresse',                       color: 'bg-yellow-100 text-yellow-800' },
  { id: 'Internationale Perspektive',        label: 'International',                     color: 'bg-sky-100 text-sky-800' },
  { id: 'Medikament-Nährstoff-Interaktionen', label: 'Medikament-Interaktion',           color: 'bg-red-50 text-red-900' },
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
  return 'bg-gray-100 text-gray-800';
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
