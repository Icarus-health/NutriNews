'use client';

import { useState } from 'react';
import { Key, Copy, Check, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Keys {
  publicKey: string;
  privateKey: string;
}

export default function VapidSetup() {
  const [keys, setKeys] = useState<Keys | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<'public' | 'private' | null>(null);
  const [error, setError] = useState('');

  async function generate() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/generate-vapid', { method: 'POST' });
      if (!res.ok) throw new Error('Fehler beim Generieren');
      const data = (await res.json()) as Keys;
      setKeys(data);
    } catch {
      setError('Generierung fehlgeschlagen. Nochmal versuchen.');
    } finally {
      setLoading(false);
    }
  }

  async function copy(value: string, which: 'public' | 'private') {
    await navigator.clipboard.writeText(value);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Key size={16} className="text-forest-600 dark:text-forest-400" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">VAPID-Schlüssel für Push-Benachrichtigungen</p>
      </div>

      {!keys ? (
        <>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Einmalig generieren und als Umgebungsvariablen in Vercel setzen:
            <code className="mx-1 px-1 bg-slate-100 dark:bg-slate-700 rounded text-[11px]">VAPID_PUBLIC_KEY</code> und
            <code className="mx-1 px-1 bg-slate-100 dark:bg-slate-700 rounded text-[11px]">VAPID_PRIVATE_KEY</code>.
          </p>
          {error && (
            <div className="flex items-center gap-2 text-[12px] text-red-600 dark:text-red-400">
              <AlertCircle size={13} />
              {error}
            </div>
          )}
          <button
            onClick={generate}
            disabled={loading}
            className="flex items-center gap-2 bg-forest-700 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            <Key size={14} />
            {loading ? 'Generiere…' : 'VAPID-Schlüssel generieren'}
          </button>
        </>
      ) : (
        <div className="space-y-2">
          <p className="text-[12px] text-amber-600 dark:text-amber-400 font-semibold">
            ⚠️ Nur einmal angezeigt — sofort in Vercel kopieren!
          </p>
          {([
            { label: 'VAPID_PUBLIC_KEY', value: keys.publicKey, which: 'public' as const },
            { label: 'VAPID_PRIVATE_KEY', value: keys.privateKey, which: 'private' as const },
          ]).map(({ label, value, which }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-lg px-3 py-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <div className="flex items-center gap-2">
                <code className="text-[11px] text-slate-700 dark:text-slate-200 break-all flex-1 font-mono">{value}</code>
                <button
                  onClick={() => copy(value, which)}
                  className={clsx(
                    'shrink-0 p-1.5 rounded-lg transition-colors',
                    copied === which
                      ? 'bg-forest-100 dark:bg-forest-900/30 text-forest-600'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {copied === which ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={() => setKeys(null)}
            className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Neue Schlüssel generieren
          </button>
        </div>
      )}
    </div>
  );
}
