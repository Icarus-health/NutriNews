'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp') {
      otpRef.current?.focus();
    }
  }, [step]);

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setError('Fehler beim Senden. Bitte prüfe deine E-Mail-Adresse.');
    } else {
      setStep('otp');
      setOtp('');
      setCooldown(60);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.trim();
    if (!code) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });
    setLoading(false);
    if (error) {
      setError('Code ungültig oder abgelaufen. Bitte erneut versuchen.');
      setOtp('');
      otpRef.current?.focus();
    } else {
      window.location.href = '/';
    }
  }

  if (step === 'otp') {
    return (
      <div className="text-center p-8 bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔑</span>
        </div>
        <p className="text-[16px] text-slate-900 font-semibold">Code eingeben</p>
        <p className="text-[13px] text-slate-400 mt-1 mb-6">
          Wir haben einen Code an<br />
          <span className="font-medium text-slate-600">{email}</span> gesendet.
        </p>

        <form onSubmit={handleVerifyOtp} className="space-y-3">
          <input
            ref={otpRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Code eingeben"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            disabled={loading}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !otp.trim()}
            className="w-full bg-forest-700 text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-forest-800 active:bg-forest-900 transition-all duration-150 disabled:opacity-60 shadow-sm shadow-forest-700/20"
          >
            {loading ? 'Wird geprüft...' : 'Bestätigen'}
          </button>
        </form>

        {error && (
          <p className="text-[12px] text-red-500 mt-3">{error}</p>
        )}

        <div className="mt-4">
          <button
            onClick={() => handleSendOtp()}
            disabled={cooldown > 0 || loading}
            className="text-[13px] text-forest-700 font-medium hover:text-forest-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            {cooldown > 0 ? `Erneut senden (${cooldown}s)` : 'Code erneut senden'}
          </button>
        </div>

        <div className="mt-3">
          <button
            onClick={() => { setStep('email'); setError(null); setOtp(''); }}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
          >
            Andere E-Mail verwenden
          </button>
        </div>

        <p className="text-[11px] text-slate-300 mt-4 leading-relaxed">
          Die E-Mail kommt von <span className="font-medium">noreply@mail.supabase.io</span> — bitte auch den Spam-Ordner prüfen.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 p-6 space-y-4">
      <form onSubmit={handleSendOtp} className="space-y-3">
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
          {loading ? 'Sende...' : 'Anmelden'}
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
