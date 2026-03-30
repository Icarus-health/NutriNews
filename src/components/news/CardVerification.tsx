'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';
import { verifyCard } from '@/lib/actions/community';
import type { CardVerificationType } from '@/types/database';

interface Props {
  newsCardId: string;
  userId: string | null;
  counts: {
    praxisrelevant: number;
    fachlich_korrekt: number;
    korrektur_noetig: number;
    quelle_zweifelhaft: number;
  };
  onRequireAuth?: () => void;
}

const ACTIONS: { type: CardVerificationType; icon: typeof CheckCircle2; label: string; activeColor: string; needsReason: boolean }[] = [
  { type: 'praxisrelevant', icon: CheckCircle2, label: 'Praxisrelevant', activeColor: 'text-forest-600', needsReason: false },
  { type: 'fachlich_korrekt', icon: ShieldCheck, label: 'Korrekt', activeColor: 'text-blue-600', needsReason: false },
  { type: 'korrektur_noetig', icon: AlertTriangle, label: 'Korrektur', activeColor: 'text-amber-600', needsReason: true },
  { type: 'quelle_zweifelhaft', icon: ShieldAlert, label: 'Zweifelhaft', activeColor: 'text-red-500', needsReason: true },
];

export default function CardVerification({ newsCardId, userId, counts, onRequireAuth }: Props) {
  const [localCounts, setLocalCounts] = useState(counts);
  const [showReason, setShowReason] = useState<CardVerificationType | null>(null);
  const [reason, setReason] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleVerify(type: CardVerificationType) {
    if (!userId) { onRequireAuth?.(); return; }

    const action = ACTIONS.find(a => a.type === type);
    if (action?.needsReason) {
      setShowReason(type);
      return;
    }

    submitVerification(type);
  }

  function submitVerification(type: CardVerificationType, reasonText?: string) {
    setLocalCounts(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setShowReason(null);
    setReason('');

    startTransition(async () => {
      const result = await verifyCard(newsCardId, type, reasonText);
      if (result.removed) {
        setLocalCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] - 2) }));
      }
    });
  }

  function handleSubmitReason(e: React.FormEvent) {
    e.preventDefault();
    if (!showReason || !reason.trim()) return;
    submitVerification(showReason, reason.trim());
  }

  const totalPositive = localCounts.praxisrelevant;
  const showBadge = totalPositive >= 10;
  const totalFlags = localCounts.korrektur_noetig + localCounts.quelle_zweifelhaft;
  const isRetracted = totalFlags >= 3;

  return (
    <div className="px-5 pb-3" onClick={e => e.stopPropagation()}>
      {/* Retracted warning */}
      {isRetracted && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2 mb-2">
          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">
            ⚠ Diese Karte wurde von der Community zur Überprüfung markiert.
          </p>
        </div>
      )}

      {/* Therapist-recommended badge */}
      {showBadge && (
        <div className="bg-forest-50 dark:bg-forest-900/20 border border-forest-200 dark:border-forest-800 rounded-xl px-3 py-1.5 mb-2">
          <p className="text-[11px] text-forest-700 dark:text-forest-400 font-semibold">
            ✓ Von {totalPositive} Therapeuten als praxisrelevant bewertet
          </p>
        </div>
      )}

      {/* Verification buttons */}
      <div className="flex items-center gap-1.5">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          const count = localCounts[action.type];
          return (
            <button
              key={action.type}
              onClick={() => handleVerify(action.type)}
              disabled={isPending}
              className={clsx(
                'flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors',
                count > 0
                  ? `${action.activeColor} bg-slate-50 dark:bg-slate-700`
                  : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
              )}
            >
              <Icon size={12} />
              {count > 0 && <span>{count}</span>}
              <span className="hidden sm:inline">{action.label}</span>
            </button>
          );
        })}
      </div>

      {/* Reason input for flags */}
      {showReason && (
        <form onSubmit={handleSubmitReason} className="mt-2 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Begründung (Pflicht)..."
              autoFocus
              className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-[12px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400/40"
            />
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-[12px] font-semibold disabled:opacity-50"
            >
              Senden
            </button>
            <button
              type="button"
              onClick={() => { setShowReason(null); setReason(''); }}
              className="px-2 py-1.5 text-[12px] text-slate-400"
            >
              ×
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
