'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import LoginForm from '@/components/auth/LoginForm';

function ErrorBanner() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  if (!error) return null;

  const message = error === 'link-expired'
    ? 'Der Link ist abgelaufen oder wurde bereits verwendet. Bitte gib deine E-Mail erneut ein.'
    : 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.';

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-[13px] text-center mb-4">
      {message}
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-forest-50 via-white to-slate-50 px-5">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image
            src="/logo-splash.webp"
            alt="NutriNews"
            className="w-28 h-28 mx-auto mb-4 rounded-3xl object-cover"
            width={112}
            height={112}
            priority
          />
          <p className="text-slate-400 text-[14px] font-medium">Für Ernährungstherapeut:innen</p>
        </div>
        <Suspense>
          <ErrorBanner />
        </Suspense>
        <LoginForm />
        <p className="text-center text-[11px] text-slate-300 mt-8">
          Evidenzbasierte Ernährungsnews &middot; Keine Werbung
        </p>
      </div>
    </div>
  );
}
