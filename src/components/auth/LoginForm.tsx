'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, EyeOff } from 'lucide-react';

type Step = 'login' | 'otp-verify' | 'set-password';

export default function LoginForm() {
  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
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
    if (step === 'otp-verify') otpRef.current?.focus();
  }, [step]);

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError('E-Mail oder Passwort falsch. Noch kein Passwort? Nutze „Code per E-Mail" unten.');
    } else {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('setting')
          .eq('id', user.id)
          .single();
        if (!profile?.setting) {
          window.location.href = '/onboarding';
          return;
        }
      }
      window.location.href = '/';
    }
  }

  async function handleSendOtp() {
    if (!email) {
      setError('Bitte zuerst E-Mail-Adresse eingeben.');
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (error) {
      setError('Fehler beim Senden. Bitte E-Mail-Adresse prüfen.');
    } else {
      setStep('otp-verify');
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
    const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    setLoading(false);
    if (error) {
      setError('Code ungültig oder abgelaufen.');
      setOtp('');
    } else {
      setStep('set-password');
    }
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Mindestens 8 Zeichen erforderlich.');
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setLoading(false);
    if (error) {
      setError('Passwort konnte nicht gesetzt werden.');
    } else {
      // Check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('setting')
          .eq('id', user.id)
          .single();
        if (!profile?.setting) {
          window.location.href = '/onboarding';
          return;
        }
      }
      window.location.href = '/';
    }
  }

  // ── Passwort setzen nach erstem OTP-Login ──────
  if (step === 'set-password') {
    return (
      <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 p-6 animate-scale-in">
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">🔒</span>
          </div>
          <p className="font-semibold text-slate-900 text-[15px]">Passwort festlegen</p>
          <p className="text-[12px] text-slate-400 mt-1">
            Damit du dich nächstes Mal direkt anmelden kannst.
          </p>
        </div>
        <form onSubmit={handleSetPassword} className="space-y-3">
          <div className="relative">
            <input
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Neues Passwort (min. 8 Zeichen)"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoFocus
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all pr-11"
            />
            <button type="button" onClick={() => setShowNewPassword(p => !p)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-forest-700 text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-forest-800 disabled:opacity-60 transition-all shadow-sm shadow-forest-700/20">
            {loading ? 'Wird gespeichert…' : 'Passwort speichern & weiter'}
          </button>
        </form>
        {error && <p className="text-[12px] text-red-500 text-center mt-3">{error}</p>}
        <button onClick={() => { window.location.href = '/'; }}
          className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 mt-3 transition-colors">
          Überspringen — später in den Einstellungen
        </button>
      </div>
    );
  }

  // ── OTP-Code eingeben ──────────────────────────
  if (step === 'otp-verify') {
    return (
      <div className="text-center p-8 bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 animate-scale-in">
        <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📬</span>
        </div>
        <p className="text-[16px] text-slate-900 font-semibold">Code eingeben</p>
        <p className="text-[13px] text-slate-400 mt-1 mb-6">
          Gesendet an <span className="font-medium text-slate-600">{email}</span>
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center text-lg font-bold tracking-widest placeholder:text-slate-300 placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all"
          />
          <button type="submit" disabled={loading || !otp.trim()}
            className="w-full bg-forest-700 text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-forest-800 disabled:opacity-60 transition-all shadow-sm shadow-forest-700/20">
            {loading ? 'Wird geprüft…' : 'Bestätigen'}
          </button>
        </form>
        {error && <p className="text-[12px] text-red-500 mt-3">{error}</p>}
        <div className="mt-4 space-y-2">
          <button onClick={handleSendOtp} disabled={cooldown > 0 || loading}
            className="text-[13px] text-forest-700 font-medium hover:text-forest-800 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors block mx-auto">
            {cooldown > 0 ? `Erneut senden (${cooldown}s)` : 'Code erneut senden'}
          </button>
          <button onClick={() => { setStep('login'); setError(null); }}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors block mx-auto">
            Zurück zur Anmeldung
          </button>
        </div>
        <p className="text-[11px] text-slate-300 mt-4">
          E-Mail von <span className="font-medium">noreply@mail.supabase.io</span> — ggf. Spam prüfen.
        </p>
      </div>
    );
  }

  // ── Hauptanmeldung: E-Mail + Passwort ─────────
  return (
    <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.06),0_8px_24px_rgba(0,0,0,0.04)] border border-slate-100/60 p-6 space-y-4">
      <form onSubmit={handlePasswordLogin} className="space-y-3">
        <input
          type="email"
          placeholder="deine@email.de"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all"
        />
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Passwort"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-[14px] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:bg-white focus:border-forest-200 transition-all pr-11"
          />
          <button type="button" onClick={() => setShowPassword(p => !p)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <button type="submit" disabled={loading}
          className="w-full bg-forest-700 text-white rounded-xl py-3 text-[14px] font-semibold hover:bg-forest-800 active:bg-forest-900 transition-all duration-150 disabled:opacity-60 shadow-sm shadow-forest-700/20">
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>

      {error && <p className="text-[12px] text-red-500 text-center">{error}</p>}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-slate-100" />
        <span className="text-[11px] text-slate-400">oder</span>
        <div className="flex-1 h-px bg-slate-100" />
      </div>

      <button onClick={handleSendOtp} disabled={loading}
        className="w-full border border-slate-200 rounded-xl py-2.5 text-[13px] text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all font-medium">
        Code per E-Mail anfordern
      </button>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        Kein Passwort? Code anfordern — Passwort wird beim ersten Login festgelegt.
      </p>
    </div>
  );
}
