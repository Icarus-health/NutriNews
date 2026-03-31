'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const next = searchParams.get('next') ?? '/';

    async function handleCallback() {
      const supabase = createClient();

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          window.location.href = next;
          return;
        }
      }

      if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as 'email' | 'recovery' | 'invite' | 'email_change',
        });
        if (!error) {
          window.location.href = next;
          return;
        }
      }

      window.location.href = '/login?error=auth';
    }

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-forest-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-[14px] text-slate-500 font-medium">Anmelden…</p>
      </div>
    </div>
  );
}
