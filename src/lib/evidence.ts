import type { EvidenceLevel } from '@/types/database';

export const EVIDENCE_CONFIG: Record<EvidenceLevel, { label: string; color: string; icon: string }> = {
  'Meta-Analyse':        { label: 'Meta-Analyse',        color: 'bg-forest-600 text-white', icon: '🏆' },
  'Systematische Review':{ label: 'Syst. Review',        color: 'bg-forest-500 text-white', icon: '📋' },
  'RCT':                 { label: 'RCT',                 color: 'bg-blue-600 text-white',   icon: '🔬' },
  'Kohortenstudie':      { label: 'Kohortenstudie',      color: 'bg-blue-400 text-white',   icon: '📊' },
  'Fallstudie':          { label: 'Fallstudie',          color: 'bg-yellow-500 text-white', icon: '📄' },
  'Expertenmeinung':     { label: 'Expertenmeinung',     color: 'bg-slate-400 text-white',  icon: '💬' },
  'Laienpresse/Trend':   { label: 'Trend/Laienpresse',  color: 'bg-orange-400 text-white', icon: '📰' },
};
