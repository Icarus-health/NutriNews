'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    if (step === 'otp') {
      inputRefs.current[0]?.focus();
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
      setOtp(Array(6).fill(''));
      setCooldown(60);
    }
  }

  const handleVerifyOtp = useCallback(async (code: string) => {
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
      setOtp(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } else {
      window.location.href = '/';
    }
  }, [email]);

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste into a single field
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      const code = newOtp.join('');
      if (code.length === 6) handleVerifyOtp(code);
      return;
    }

    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const code = newOtp.join('');
    if (code.length === 6) handleVerifyOtp(code);
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const digits = pasted.split('');
    const newOtp = Array(6).fill('');
    digits.forEach((d, i) => { newOtp[i] = d; });
    setOtp(newOtp);
    const nextIndex = Math.min(digits.length, 5);
    inputRefs.current[nextIndex]?.focus();
    if (digits.length === 6) handleVerifyOtp(newOtp.join(''));
  }

  if (step === 'otp') {
    return (
      <div className="text-center p-8 bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔑</span>
        </div>
        <p className="text-[16px] text-slate-900 font-semibold">Code eingeben</p>
        <p className="text-[13px] text-slate-400 mt-1 mb-6">
          Wir haben einen 6-stelligen Code an<br />
          <span className="font-medium text-slate-600">{email}</span> gesendet.
        </p>

        <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={6}
              value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              onKeyDown={e => handleOtpKeyDown(i, e)}
              disabled={loading}
              className="w-11 h-13 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all disabled:opacity-50"
            />
          ))}
        </div>

        {error && (
          <p className="text-[12px] text-red-500 mb-3">{error}</p>
        )}

        {loading && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[13px] text-slate-500">Wird geprüft...</p>
          </div>
        )}

        <button
          onClick={() => handleSendOtp()}
          disabled={cooldown > 0 || loading}
          className="text-[13px] text-forest-700 font-medium hover:text-forest-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {cooldown > 0 ? `Erneut senden (${cooldown}s)` : 'Code erneut senden'}
        </button>

        <div className="mt-4">
          <button
            onClick={() => { setStep('email'); setError(null); setOtp(Array(6).fill('')); }}
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
