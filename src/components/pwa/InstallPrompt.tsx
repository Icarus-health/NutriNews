'use client';

import { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Check if previously dismissed
    const dismissedAt = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Android/Chrome: intercept beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: detect Safari
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isSafari = /safari/i.test(navigator.userAgent) && !/chrome|crios|fxios/i.test(navigator.userAgent);
    if (isIOS && isSafari) {
      setShowIOSPrompt(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  function dismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', String(Date.now()));
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
    dismiss();
  }

  if (dismissed || (!deferredPrompt && !showIOSPrompt)) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 z-30 bg-white rounded-2xl shadow-lg border border-slate-200 p-4 animate-slide-up max-w-lg mx-auto">
      <button onClick={dismiss} className="absolute top-3 right-3 text-slate-400 hover:text-slate-600">
        <X size={18} />
      </button>

      {deferredPrompt ? (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
            <Download size={20} className="text-forest-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-slate-900">Nutri News installieren</p>
            <p className="text-xs text-slate-500 mt-0.5">Fuer schnellen Zugriff direkt auf deinem Startbildschirm.</p>
            <button
              onClick={handleInstall}
              className="mt-2 bg-forest-700 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-forest-800 transition-colors"
            >
              Jetzt installieren
            </button>
          </div>
        </div>
      ) : showIOSPrompt ? (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-forest-100 flex items-center justify-center flex-shrink-0">
            <Share size={20} className="text-forest-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm text-slate-900">Nutri News installieren</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Tippe auf <Share size={12} className="inline text-blue-500" /> <strong>Teilen</strong> und dann auf <strong>&quot;Zum Home-Bildschirm&quot;</strong>.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
