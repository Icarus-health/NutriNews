'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setError('Fehler beim Senden. Bitte prüfe deine E-Mail-Adresse.');
    } else {
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className="text-center p-8 bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📬</span>
        </div>
        <p className="text-[16px] text-slate-900 font-semibold">Magic Link gesendet!</p>
        <p className="text-[13px] text-slate-400 mt-2 leading-relaxed">
          Schau in dein E-Mail-Postfach und klicke auf den Link.
        </p>
        <p className="text-[11px] text-slate-300 mt-3 leading-relaxed">
          Die E-Mail kommt von <span className="font-medium">noreply@mail.supabase.io</span> — bitte auch den Spam-Ordner prüfen.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 p-6 space-y-4">
      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-700 text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-forest-800 active:bg-forest-900 transition-all duration-150 disabled:opacity-60 shadow-sm shadow-forest-700/20"
        >
          {loading ? 'Sende...' : 'Magic Link senden'}
        </button>
      </form>

      {error && (
        <p className="text-[12px] text-red-500 text-center">{error}</p>
      )}

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Noch kein Konto? Einfach E-Mail eingeben — wird automatisch erstellt.
      </p>
    </div>
  );
}
