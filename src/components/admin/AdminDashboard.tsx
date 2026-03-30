'use client';

import { useState, useTransition } from 'react';
import { Check, Trash2, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { createNewsCard, publishNewsCard, deleteNewsCard } from '@/lib/actions/news';
import { getCategoryStyle } from '@/lib/categories';
import type { NewsCard, EvidenceLevel } from '@/types/database';

interface Props {
  drafts: NewsCard[];
}

export default function AdminDashboard({ drafts: initialDrafts }: Props) {
  const [tab, setTab] = useState<'drafts' | 'create' | 'auto'>('drafts');
  const [drafts, setDrafts] = useState(initialDrafts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [headline, setHeadline] = useState('');
  const [snackWhat, setSnackWhat] = useState('');
  const [snackResult, setSnackResult] = useState('');
  const [snackConsequence, setSnackConsequence] = useState('');
  const [therapistCheck, setTherapistCheck] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [categoryMain, setCategoryMain] = useState('Wissenschaft');
  const [evidenceLevel, setEvidenceLevel] = useState<string>('Expertenmeinung');

  async function runAutoAgent() {
    setAutoRunning(true);
    const res = await fetch('/api/news/auto', { method: 'POST' });
    const data = await res.json();
    alert(data.message ?? data.error);
    setAutoRunning(false);
  }

  function handlePublish(cardId: string) {
    setDrafts(prev => prev.filter(d => d.id !== cardId));
    startTransition(async () => {
      await publishNewsCard(cardId);
    });
  }

  function handleDelete(cardId: string) {
    setDrafts(prev => prev.filter(d => d.id !== cardId));
    startTransition(async () => {
      await deleteNewsCard(cardId);
    });
  }

  function resetForm() {
    setHeadline(''); setSnackWhat(''); setSnackResult(''); setSnackConsequence('');
    setTherapistCheck(''); setSourceUrl(''); setSourceName('');
    setCategoryMain('Wissenschaft'); setEvidenceLevel('Expertenmeinung');
  }

  function handleCreate(status: 'draft' | 'published') {
    if (!headline.trim() || !snackWhat.trim() || !sourceUrl.trim()) return;
    startTransition(async () => {
      const result = await createNewsCard({
        headline: headline.trim(),
        snack_what: snackWhat.trim(),
        snack_result: snackResult.trim(),
        snack_consequence: snackConsequence.trim(),
        therapist_check: therapistCheck.trim(),
        source_url: sourceUrl.trim(),
        source_name: sourceName.trim() || undefined,
        category_main: categoryMain,
        evidence_level: evidenceLevel,
        status,
        read_time_sec: Math.ceil((snackWhat.length + snackResult.length + snackConsequence.length + therapistCheck.length) / 20),
      });
      if (result.success) {
        resetForm();
        alert(status === 'published' ? 'Karte veroeffentlicht!' : 'Entwurf gespeichert!');
      }
    });
  }

  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold text-slate-900 mb-4">Admin</h1>
      <div className="flex gap-2 mb-4">
        {(['drafts', 'create', 'auto'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors',
              tab === t ? 'bg-forest-700 text-white' : 'bg-slate-100 text-slate-600'
            )}
          >
            {t === 'drafts' ? `Entwuerfe (${drafts.length})` : t === 'create' ? 'Erstellen' : 'Auto'}
          </button>
        ))}
      </div>

      {/* Drafts tab */}
      {tab === 'drafts' && (
        <div className="space-y-2">
          {drafts.length === 0 && <p className="text-slate-400 text-sm py-4 text-center">Keine Entwuerfe vorhanden.</p>}
          {drafts.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-100 overflow-hidden">
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', getCategoryStyle(d.category_main))}>
                    {d.category_main}
                  </span>
                  <div className="flex items-center gap-1">
                    {d.curated_by_agent && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">KI</span>
                    )}
                    <span className="text-xs text-slate-400">{d.evidence_level}</span>
                  </div>
                </div>
                <p className="font-semibold text-sm text-slate-800">{d.headline}</p>

                <button
                  onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                  className="flex items-center gap-1 text-xs text-forest-600 font-medium mt-1"
                >
                  {expandedId === d.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  {expandedId === d.id ? 'Einklappen' : 'Vorschau'}
                </button>

                {expandedId === d.id && (
                  <div className="mt-2 space-y-1 text-xs text-slate-600 animate-fade-in">
                    <p><strong>Was:</strong> {d.snack_what}</p>
                    <p><strong>Ergebnis:</strong> {d.snack_result}</p>
                    <p><strong>Konsequenz:</strong> {d.snack_consequence}</p>
                    <p className="bg-forest-50 rounded-lg p-2 mt-1"><strong>Therapist-Check:</strong> {d.therapist_check}</p>
                    <p className="text-slate-400">Quelle: {d.source_url}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => handlePublish(d.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs font-medium text-forest-600 hover:text-forest-800 bg-forest-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Check size={12} /> Veroeffentlichen
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg transition-colors"
                  >
                    <Trash2 size={12} /> Loeschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create tab */}
      {tab === 'create' && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 space-y-3">
          <input
            type="text"
            placeholder="Headline *"
            value={headline}
            onChange={e => setHeadline(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <textarea
            placeholder="Was? (Snack) *"
            value={snackWhat}
            onChange={e => setSnackWhat(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
          />
          <textarea
            placeholder="Ergebnis (Snack)"
            value={snackResult}
            onChange={e => setSnackResult(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
          />
          <textarea
            placeholder="Konsequenz (Snack)"
            value={snackConsequence}
            onChange={e => setSnackConsequence(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
          />
          <textarea
            placeholder="Therapist-Check"
            value={therapistCheck}
            onChange={e => setTherapistCheck(e.target.value)}
            rows={2}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
          />
          <input
            type="url"
            placeholder="Quell-URL *"
            value={sourceUrl}
            onChange={e => setSourceUrl(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <input
            type="text"
            placeholder="Quellenname (optional)"
            value={sourceName}
            onChange={e => setSourceName(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              value={categoryMain}
              onChange={e => setCategoryMain(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select
              value={evidenceLevel}
              onChange={e => setEvidenceLevel(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
            >
              {Object.entries(EVIDENCE_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleCreate('draft')}
              disabled={isPending || !headline.trim() || !snackWhat.trim() || !sourceUrl.trim()}
              className="flex-1 border border-forest-200 text-forest-700 py-2 rounded-xl text-sm font-semibold hover:bg-forest-50 disabled:opacity-40 transition-colors"
            >
              Als Entwurf
            </button>
            <button
              onClick={() => handleCreate('published')}
              disabled={isPending || !headline.trim() || !snackWhat.trim() || !sourceUrl.trim()}
              className="flex-1 bg-forest-700 text-white py-2 rounded-xl text-sm font-semibold hover:bg-forest-800 disabled:opacity-40 transition-colors"
            >
              Veroeffentlichen
            </button>
          </div>
        </div>
      )}

      {/* Auto agent tab */}
      {tab === 'auto' && (
        <div className="bg-white rounded-xl p-4 border border-slate-100 text-center">
          <p className="text-sm text-slate-600 mb-4">KI holt automatisch aktuelle Ernaehrungsnews, bewertet die Evidenz und erstellt fertige Karten.</p>
          <button
            onClick={runAutoAgent}
            disabled={autoRunning}
            className="bg-forest-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 disabled:opacity-60 transition-colors"
          >
            {autoRunning ? 'Laeuft...' : 'Jetzt 5 News automatisch holen'}
          </button>
        </div>
      )}
    </div>
  );
}
