'use client';

import { useState, useTransition } from 'react';
import { Check, Trash2, ChevronDown, ChevronUp, Zap, RefreshCw, CheckCheck, AlertCircle, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import { createNewsCard, publishNewsCard, deleteNewsCard } from '@/lib/actions/news';
import { getCategoryStyle } from '@/lib/categories';
import type { NewsCard, EvidenceLevel } from '@/types/database';

interface Props {
  drafts: NewsCard[];
}

interface AgentResult {
  type: 'success' | 'info' | 'error';
  message: string;
  created?: number;
  skipped?: number;
}

export default function AdminDashboard({ drafts: initialDrafts }: Props) {
  const [tab, setTab] = useState<'drafts' | 'create' | 'auto'>('drafts');
  const [drafts, setDrafts] = useState(initialDrafts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [autoRunning, setAutoRunning] = useState(false);
  const [agentResult, setAgentResult] = useState<AgentResult | null>(null);
  const [createFeedback, setCreateFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [headline, setHeadline] = useState('');
  const [snackWhat, setSnackWhat] = useState('');
  const [snackResult, setSnackResult] = useState('');
  const [snackConsequence, setSnackConsequence] = useState('');
  const [therapistCheck, setTherapistCheck] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceName, setSourceName] = useState('');
  const [categoryMain, setCategoryMain] = useState('GLP-1 & Adipositastherapie');
  const [evidenceLevel, setEvidenceLevel] = useState<string>('Expertenmeinung');

  async function runAutoAgent() {
    setAutoRunning(true);
    setAgentResult(null);
    try {
      const res = await fetch('/api/news/auto', { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        setAgentResult({ type: 'error', message: data.error ?? 'Unbekannter Fehler beim Agenten.' });
        return;
      }

      if (data.created > 0) {
        setAgentResult({
          type: 'success',
          message: `${data.created} neue Entwürfe erstellt${data.skipped > 0 ? `, ${data.skipped} übersprungen` : ''}.`,
          created: data.created,
          skipped: data.skipped,
        });
        // Auto-switch to drafts tab after successful run
        setTimeout(() => setTab('drafts'), 1200);
      } else {
        setAgentResult({
          type: 'info',
          message: data.message ?? 'Alle Artikel sind bereits bekannt oder kein API-Schlüssel konfiguriert.',
        });
      }
    } catch {
      setAgentResult({ type: 'error', message: 'Netzwerkfehler. Bitte erneut versuchen.' });
    } finally {
      setAutoRunning(false);
    }
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

  function handlePublishAll() {
    const ids = drafts.map(d => d.id);
    setDrafts([]);
    startTransition(async () => {
      for (const id of ids) {
        await publishNewsCard(id);
      }
    });
  }

  function resetForm() {
    setHeadline(''); setSnackWhat(''); setSnackResult(''); setSnackConsequence('');
    setTherapistCheck(''); setSourceUrl(''); setSourceName('');
    setCategoryMain('GLP-1 & Adipositastherapie'); setEvidenceLevel('Expertenmeinung');
  }

  function handleCreate(status: 'draft' | 'published') {
    if (!headline.trim() || !snackWhat.trim() || !sourceUrl.trim()) return;
    setCreateFeedback(null);
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
        setCreateFeedback({
          type: 'success',
          message: status === 'published' ? 'Karte veröffentlicht!' : 'Entwurf gespeichert.',
        });
        setTimeout(() => setCreateFeedback(null), 3000);
      } else {
        setCreateFeedback({ type: 'error', message: result.error ?? 'Fehler beim Speichern.' });
      }
    });
  }

  const inputCls = 'w-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-forest-500 placeholder:text-slate-400';

  return (
    <div className="px-4 pt-4 pb-24">
      <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">Admin</h1>

      {/* Tab navigation */}
      <div className="flex gap-2 mb-4">
        {(['drafts', 'create', 'auto'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={clsx(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === t
                ? 'bg-forest-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            )}
          >
            {t === 'drafts'
              ? `Entwürfe${drafts.length > 0 ? ` (${drafts.length})` : ''}`
              : t === 'create'
                ? 'Erstellen'
                : 'Auto-Agent'}
          </button>
        ))}
      </div>

      {/* ─── DRAFTS TAB ─── */}
      {tab === 'drafts' && (
        <div>
          {drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                <CheckCheck size={24} className="text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Keine Entwürfe vorhanden.</p>
              <p className="text-xs mt-1 text-center text-slate-400">
                Nutze den Auto-Agenten oder erstelle manuell eine Karte.
              </p>
              <button
                onClick={() => setTab('auto')}
                className="mt-4 flex items-center gap-1.5 bg-forest-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-800 transition-colors"
              >
                <Zap size={14} />
                Zum Auto-Agenten
              </button>
            </div>
          ) : (
            <>
              {/* Bulk publish */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {drafts.length} {drafts.length === 1 ? 'Entwurf' : 'Entwürfe'} zur Überprüfung
                </p>
                <button
                  onClick={handlePublishAll}
                  disabled={isPending}
                  className="flex items-center gap-1.5 text-xs font-semibold text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/30 border border-forest-200 dark:border-forest-800 px-3 py-1.5 rounded-lg hover:bg-forest-100 dark:hover:bg-forest-900/50 disabled:opacity-40 transition-colors"
                >
                  <CheckCheck size={13} />
                  Alle veröffentlichen
                </button>
              </div>

              <div className="space-y-2">
                {drafts.map((d) => {
                  const evidence = EVIDENCE_CONFIG[d.evidence_level as EvidenceLevel];
                  return (
                    <div key={d.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', getCategoryStyle(d.category_main))}>
                            {d.category_main}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {d.curated_by_agent && (
                              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">KI</span>
                            )}
                            {evidence && (
                              <span className="text-xs text-slate-400">
                                {evidence.icon} {evidence.label}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 leading-snug">{d.headline}</p>

                        {d.practice_relevance_score && (
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={clsx('w-1.5 h-1.5 rounded-full', i <= d.practice_relevance_score! ? 'bg-forest-500' : 'bg-slate-200')} />
                            ))}
                            <span className="text-[10px] text-slate-400 ml-0.5">Praxisrelevanz</span>
                          </div>
                        )}

                        <button
                          onClick={() => setExpandedId(expandedId === d.id ? null : d.id)}
                          className="flex items-center gap-1 text-xs text-forest-600 dark:text-forest-400 font-medium mt-1.5"
                        >
                          {expandedId === d.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {expandedId === d.id ? 'Einklappen' : 'Vorschau'}
                        </button>

                        {expandedId === d.id && (
                          <div className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400 animate-fade-in">
                            {d.snack_what && <p><strong className="text-slate-700 dark:text-slate-300">Was:</strong> {d.snack_what}</p>}
                            {d.snack_result && <p><strong className="text-slate-700 dark:text-slate-300">Ergebnis:</strong> {d.snack_result}</p>}
                            {d.snack_consequence && <p><strong className="text-slate-700 dark:text-slate-300">Konsequenz:</strong> {d.snack_consequence}</p>}
                            {d.therapist_check && (
                              <p className="bg-forest-50 dark:bg-forest-900/20 rounded-lg p-2 mt-1">
                                <strong className="text-forest-700 dark:text-forest-400">Therapist-Check:</strong> {d.therapist_check}
                              </p>
                            )}
                            {d.action_recommendation && (
                              <p className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2">
                                <strong className="text-amber-700 dark:text-amber-400">Handlung:</strong> {d.action_recommendation}
                              </p>
                            )}
                            {d.source_url && (
                              <a
                                href={d.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-forest-600 dark:text-forest-400 hover:underline truncate block"
                              >
                                {d.source_name || d.source_url}
                              </a>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            onClick={() => handlePublish(d.id)}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs font-semibold text-forest-700 dark:text-forest-400 hover:text-forest-800 bg-forest-50 dark:bg-forest-900/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Check size={12} /> Veröffentlichen
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            disabled={isPending}
                            className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <Trash2 size={12} /> Löschen
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* ─── CREATE TAB ─── */}
      {tab === 'create' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 space-y-3">
          <input type="text" placeholder="Headline *" value={headline} onChange={e => setHeadline(e.target.value)} className={inputCls} />
          <textarea placeholder="Was? — Was wurde untersucht / was ist passiert? *" value={snackWhat} onChange={e => setSnackWhat(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          <textarea placeholder="Ergebnis — Was hat die Studie ergeben?" value={snackResult} onChange={e => setSnackResult(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          <textarea placeholder="Konsequenz — Was bedeutet das für die Praxis?" value={snackConsequence} onChange={e => setSnackConsequence(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          <textarea placeholder="Therapist-Check — Einordnung für Ernährungstherapeuten" value={therapistCheck} onChange={e => setTherapistCheck(e.target.value)} rows={2} className={`${inputCls} resize-none`} />
          <input type="url" placeholder="Quell-URL *" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} className={inputCls} />
          <input type="text" placeholder="Quellenname (z. B. DGE, PubMed)" value={sourceName} onChange={e => setSourceName(e.target.value)} className={inputCls} />

          <div className="grid grid-cols-2 gap-3">
            <select value={categoryMain} onChange={e => setCategoryMain(e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
            <select value={evidenceLevel} onChange={e => setEvidenceLevel(e.target.value)} className={inputCls}>
              {Object.entries(EVIDENCE_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>{val.icon} {val.label}</option>
              ))}
            </select>
          </div>

          {createFeedback && (
            <div className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium animate-fade-in',
              createFeedback.type === 'success'
                ? 'bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 border border-forest-200 dark:border-forest-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200'
            )}>
              {createFeedback.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
              {createFeedback.message}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={() => handleCreate('draft')}
              disabled={isPending || !headline.trim() || !snackWhat.trim() || !sourceUrl.trim()}
              className="flex-1 border border-forest-200 dark:border-forest-800 text-forest-700 dark:text-forest-400 py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-50 dark:hover:bg-forest-900/20 disabled:opacity-40 transition-colors"
            >
              Als Entwurf
            </button>
            <button
              onClick={() => handleCreate('published')}
              disabled={isPending || !headline.trim() || !snackWhat.trim() || !sourceUrl.trim()}
              className="flex-1 bg-forest-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 disabled:opacity-40 transition-colors"
            >
              Veröffentlichen
            </button>
          </div>
        </div>
      )}

      {/* ─── AUTO-AGENT TAB ─── */}
      {tab === 'auto' && (
        <div className="space-y-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-forest-700 dark:text-forest-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">KI-News-Agent</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Holt automatisch aktuelle Ernährungsnews aus 82 Quellen, bewertet Evidenz &amp; Praxisrelevanz und erstellt fertige Karten zur Überprüfung.
                </p>
              </div>
            </div>

            <button
              onClick={runAutoAgent}
              disabled={autoRunning}
              className="w-full flex items-center justify-center gap-2 bg-forest-700 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-forest-800 disabled:opacity-60 transition-colors"
            >
              {autoRunning ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Agent läuft… (kann bis zu 60 Sek. dauern)
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Jetzt 5 News automatisch holen
                </>
              )}
            </button>
          </div>

          {/* Agent result feedback */}
          {agentResult && (
            <div className={clsx(
              'flex items-start gap-3 px-4 py-3 rounded-xl border text-sm animate-fade-in',
              agentResult.type === 'success'
                ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-200 dark:border-forest-800 text-forest-700 dark:text-forest-400'
                : agentResult.type === 'info'
                  ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-400'
                  : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400'
            )}>
              {agentResult.type === 'success'
                ? <Check size={16} className="flex-shrink-0 mt-0.5" />
                : agentResult.type === 'info'
                  ? <Info size={16} className="flex-shrink-0 mt-0.5" />
                  : <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className="font-semibold">{agentResult.message}</p>
                {agentResult.type === 'success' && agentResult.created! > 0 && (
                  <p className="text-xs mt-0.5 opacity-80">
                    Weiterleitung zum Entwürfe-Tab…
                  </p>
                )}
                {agentResult.type === 'error' && agentResult.message.includes('API') && (
                  <p className="text-xs mt-1 opacity-80">
                    Hinweis: HUGGINGFACE_API_KEY oder OPENAI_API_KEY in der .env Datei setzen.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Hinweis-Box */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Ablauf</p>
            <ol className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 list-decimal list-inside">
              <li>Agent holt neue Artikel aus den RSS-Feeds</li>
              <li>KI bewertet Evidenz, Praxisrelevanz &amp; erstellt Zusammenfassung</li>
              <li>Karten landen als Entwürfe → du prüfst &amp; veröffentlichst</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
