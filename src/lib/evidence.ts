import type { EvidenceLevel } from '@/types/database';

export const EVIDENCE_CONFIG: Record<EvidenceLevel, { label: string; labelEn: string; color: string; icon: string; key: string }> = {
  'Meta-Analyse':        { label: 'Meta-Analyse',        labelEn: 'Meta-analysis', color: 'bg-forest-600 text-white', icon: '🏆', key: 'meta' },
  'Systematische Review':{ label: 'Syst. Review',        labelEn: 'Syst. review',  color: 'bg-forest-500 text-white', icon: '📋', key: 'review' },
  'RCT':                 { label: 'RCT',                 labelEn: 'RCT',           color: 'bg-blue-600 text-white',   icon: '🔬', key: 'rct' },
  'Kohortenstudie':      { label: 'Kohortenstudie',      labelEn: 'Cohort study',  color: 'bg-blue-400 text-white',   icon: '📊', key: 'kohorte' },
  'Fallstudie':          { label: 'Fallstudie',          labelEn: 'Case study',    color: 'bg-yellow-500 text-white', icon: '📄', key: 'fall' },
  'Expertenmeinung':     { label: 'Expertenmeinung',     labelEn: 'Expert opinion',color: 'bg-slate-400 text-white',  icon: '💬', key: 'expert' },
  'Laienpresse/Trend':   { label: 'Trend/Laienpresse',  labelEn: 'Trend/Lay press',color: 'bg-orange-400 text-white', icon: '📰', key: 'trend' },
};

/** Alle bekannten Evidenz-Level — Single Source of Truth für die Output-Validierung der Pipeline. */
export const EVIDENCE_LEVELS = Object.keys(EVIDENCE_CONFIG) as EvidenceLevel[];

/** Returns the evidence label for the given locale ('en' falls back to German label if missing). */
export function getEvidenceLabel(level: EvidenceLevel, locale: string = 'de'): string {
  const cfg = EVIDENCE_CONFIG[level];
  if (!cfg) return level;
  return locale === 'en' ? cfg.labelEn : cfg.label;
}

/** Map URL-safe short key → full evidence level name */
export function evidenceKeyToLevel(key: string): EvidenceLevel | null {
  const entry = Object.entries(EVIDENCE_CONFIG).find(([, v]) => v.key === key);
  return entry ? entry[0] as EvidenceLevel : null;
}

/** Map full evidence level name → URL-safe short key */
export function evidenceLevelToKey(level: string): string {
  return (EVIDENCE_CONFIG[level as EvidenceLevel]?.key) ?? level;
}
