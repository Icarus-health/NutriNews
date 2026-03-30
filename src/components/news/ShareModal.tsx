'use client';

import { useState, useTransition } from 'react';
import { X, Search, Send } from 'lucide-react';
import { shareToUser, searchProfiles } from '@/lib/actions/news';

interface ProfileResult {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

interface Props {
  newsCardId: string;
  onClose: () => void;
}

export default function ShareModal({ newsCardId, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSearch(value: string) {
    setQuery(value);
    if (value.length < 2) { setResults([]); return; }
    const profiles = await searchProfiles(value);
    setResults(profiles);
  }

  function handleSend() {
    if (!selectedEmail) return;
    startTransition(async () => {
      const result = await shareToUser(newsCardId, selectedEmail, message);
      if (result.success) {
        setSent(true);
        setTimeout(onClose, 1500);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-t-2xl p-4 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900">News teilen</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <p className="text-2xl mb-2">✅</p>
            <p className="text-sm text-slate-600">Erfolgreich geteilt!</p>
          </div>
        ) : (
          <>
            <div className="relative mb-3">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Kollegen suchen (Name oder E-Mail)..."
                value={query}
                onChange={e => handleSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>

            {results.length > 0 && !selectedEmail && (
              <div className="mb-3 border border-slate-100 rounded-lg overflow-hidden">
                {results.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedEmail(p.email ?? ''); setQuery(p.full_name || p.email || ''); setResults([]); }}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"
                  >
                    <div className="w-7 h-7 rounded-full bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-700">
                      {(p.full_name || p.email || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.full_name || 'Unbekannt'}</p>
                      <p className="text-xs text-slate-400">{p.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedEmail && (
              <div className="mb-3">
                <span className="inline-flex items-center gap-1 bg-forest-100 text-forest-800 text-xs font-medium px-2 py-1 rounded-full">
                  {query}
                  <button onClick={() => { setSelectedEmail(''); setQuery(''); }} className="hover:text-forest-600">
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}

            <textarea
              placeholder="Nachricht (optional)..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={2}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-forest-500 resize-none"
            />

            <button
              onClick={handleSend}
              disabled={!selectedEmail || isPending}
              className="w-full bg-forest-700 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-forest-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {isPending ? 'Wird geteilt...' : 'Teilen'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
