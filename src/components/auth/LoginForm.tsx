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
    if (error) setError(error.message);
    else setSent(true);
  }

  async function handleGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });
  }

  if (sent) {
    return (
      <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-slate-100">
        <div className="text-5xl mb-4">📬</div>
        <p className="text-slate-800 font-semibold text-lg">Magic Link gesendet!</p>
        <p className="text-sm text-slate-500 mt-2">Schau in dein E-Mail-Postfach und klicke den Link.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-4">
      {/* Google Button with real icon */}
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 border border-slate-200 rounded-xl py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Mit Google anmelden
      </button>

      <div className="flex items-center gap-3 text-xs text-slate-300">
        <div className="flex-1 h-px bg-slate-200"/>
        <span className="text-slate-400 font-medium">oder</span>
        <div className="flex-1 h-px bg-slate-200"/>
      </div>

      <form onSubmit={handleMagicLink} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">E-Mail-Adresse</label>
          <input
            type="email"
            placeholder="deine@email.de"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
          />
        </div>
        {error && (
          <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full text-white rounded-xl py-3 text-sm font-semibold transition-all disabled:opacity-60 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #B8960C 0%, #236829 100%)' }}
        >
          {loading ? 'Sende...' : 'Magic Link senden'}
        </button>
      </form>

      <p className="text-center text-xs text-slate-400">
        Nur für registrierte Therapeut:innen.
      </p>
    </div>
  );
}
