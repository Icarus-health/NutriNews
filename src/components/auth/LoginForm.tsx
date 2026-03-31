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

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
    if (error) setError('Google-Anmeldung fehlgeschlagen. Bitte versuche es erneut.');
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
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 p-6 space-y-4">
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 rounded-xl py-3 text-[14px] font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-all duration-150"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Mit Google anmelden / registrieren
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100"/>
        <span className="text-[12px] text-slate-300 font-medium">oder per E-Mail</span>
        <div className="flex-1 h-px bg-slate-100"/>
      </div>

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
