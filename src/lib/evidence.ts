import type { EvidenceLevel } from '@/types/database';

export const EVIDENCE_CONFIG: Record<EvidenceLevel, { label: string; color: string; icon: string; key: string }> = {
  'Meta-Analyse':        { label: 'Meta-Analyse',        color: 'bg-forest-600 text-white', icon: '🏆', key: 'meta' },
  'Systematische Review':{ label: 'Syst. Review',        color: 'bg-forest-500 text-white', icon: '📋', key: 'review' },
  'RCT':                 { label: 'RCT',                 color: 'bg-blue-600 text-white',   icon: '🔬', key: 'rct' },
  'Kohortenstudie':      { label: 'Kohortenstudie',      color: 'bg-blue-400 text-white',   icon: '📊', key: 'kohorte' },
  'Fallstudie':          { label: 'Fallstudie',          color: 'bg-yellow-500 text-white', icon: '📄', key: 'fall' },
  'Expertenmeinung':     { label: 'Expertenmeinung',     color: 'bg-slate-400 text-white',  icon: '💬', key: 'expert' },
  'Laienpresse/Trend':   { label: 'Trend/Laienpresse',  color: 'bg-orange-400 text-white', icon: '📰', key: 'trend' },
};

/** Map URL-safe short key → full evidence level name */
export function evidenceKeyToLevel(key: string): EvidenceLevel | null {
  const entry = Object.entries(EVIDENCE_CONFIG).find(([, v]) => v.key === key);
  return entry ? entry[0] as EvidenceLevel : null;
}

/** Map full evidence level name → URL-safe short key */
export function evidenceLevelToKey(level: string): string {
  return (EVIDENCE_CONFIG[level as EvidenceLevel]?.key) ?? level;
}
