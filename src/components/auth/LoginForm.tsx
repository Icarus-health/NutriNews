'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    });
    setLoading(false);
    if (!error) setSent(true);
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
      <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
        <span className="text-3xl">📬</span>
        <p className="mt-3 text-slate-700 font-medium">Magic Link gesendet!</p>
        <p className="text-sm text-slate-400 mt-1">Schau in dein E-Mail-Postfach.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-4">
      <button
        onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-2 border border-slate-200 rounded-xl py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
      >
        <span>G</span> Mit Google anmelden
      </button>
      <div className="flex items-center gap-2 text-xs text-slate-300">
        <div className="flex-1 h-px bg-slate-200"/> oder <div className="flex-1 h-px bg-slate-200"/>
      </div>
      <form onSubmit={handleMagicLink} className="space-y-3">
        <input
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-forest-700 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-forest-800 transition-colors disabled:opacity-60"
        >
          {loading ? 'Sende...' : 'Magic Link senden'}
        </button>
      </form>
    </div>
  );
}
