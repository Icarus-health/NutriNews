export const CATEGORIES = [
  { id: 'Wissenschaft',        label: 'Wissenschaft',        color: 'bg-blue-100 text-blue-800' },
  { id: 'Ernährungsmedizin',   label: 'Ernährungsmedizin',   color: 'bg-forest-100 text-forest-800' },
  { id: 'Klinik',              label: 'Klinik',              color: 'bg-teal-100 text-teal-800' },
  { id: 'Forschung',           label: 'Forschung',           color: 'bg-indigo-100 text-indigo-800' },
  { id: 'Politik',             label: 'Politik',             color: 'bg-orange-100 text-orange-800' },
  { id: 'Medikation',          label: 'Medikation',          color: 'bg-red-100 text-red-800' },
  { id: 'Praxis',              label: 'Praxis',              color: 'bg-yellow-100 text-yellow-800' },
  { id: 'Pädiatrie',           label: 'Pädiatrie',           color: 'bg-pink-100 text-pink-800' },
  { id: 'Onkologie',           label: 'Onkologie',           color: 'bg-purple-100 text-purple-800' },
  { id: 'Diabetologie',        label: 'Diabetologie',        color: 'bg-amber-100 text-amber-800' },
  { id: 'Gastroenterologie',   label: 'Gastroenterologie',   color: 'bg-lime-100 text-lime-800' },
  { id: 'Sportmedizin',        label: 'Sportmedizin',        color: 'bg-cyan-100 text-cyan-800' },
  { id: 'Psychiatrie',         label: 'Psychiatrie',         color: 'bg-violet-100 text-violet-800' },
  { id: 'Hepatologie',         label: 'Hepatologie',         color: 'bg-brown-100 text-orange-900' },
  { id: 'Nephrologie',         label: 'Nephrologie',         color: 'bg-slate-100 text-slate-800' },
  { id: 'Fettstoffwechsel',    label: 'Fettstoffwechsel',    color: 'bg-yellow-50 text-yellow-900' },
  { id: 'Ernährungspsychologie', label: 'Ernährungspsychologie', color: 'bg-rose-100 text-rose-800' },
  { id: 'Geriatrie',           label: 'Geriatrie',           color: 'bg-stone-100 text-stone-800' },
  { id: 'Trends',              label: '🦁 Trends',           color: 'bg-orange-200 text-orange-900' },
] as const;

export type CategoryId = typeof CATEGORIES[number]['id'];

export function getCategoryStyle(id: string): string {
  return CATEGORIES.find(c => c.id === id)?.color ?? 'bg-gray-100 text-gray-800';
}
