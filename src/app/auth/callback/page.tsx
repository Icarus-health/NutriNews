'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('next') ?? '/';

    async function handleCallback() {
      const supabase = createClient();

      let authenticated = false;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) authenticated = true;
      }

      if (!authenticated && tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'email' | 'recovery' | 'invite' | 'email_change',
        });
        if (!error) authenticated = true;
      }

      if (authenticated) {
        // Check if new user needs onboarding (no setting configured yet)
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
        window.location.href = next;
        return;
      }

      setFailed(true);
      setTimeout(() => {
        window.location.href = '/login?error=link-expired';
      }, 3000);
    }

    handleCallback();
  }, []);

  if (failed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50">
        <div className="text-center max-w-xs px-4">
          <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-[15px] text-slate-900 font-semibold mb-1">Link abgelaufen</p>
          <p className="text-[13px] text-slate-400">
            Der Link ist nicht mehr gültig. Du wirst zur Anmeldeseite weitergeleitet…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[14px] text-slate-500 font-medium">Anmelden…</p>
      </div>
    </div>
  );
}
