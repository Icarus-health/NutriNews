'use client';

import { useState, useEffect } from 'react';
import { Download, Share, MoreVertical, Plus, X, Smartphone } from 'lucide-react';

const INSTALL_KEY = 'nn-install-prompt-dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Already running as PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || ('standalone' in window.navigator && (window.navigator as Record<string, unknown>).standalone === true);
    setIsStandalone(standalone);
    if (standalone) return;

    // Already dismissed
    const dismissed = localStorage.getItem(INSTALL_KEY);
    if (dismissed) return;

    // Detect platform
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform('ios');
    } else if (/Android/.test(ua)) {
      setPlatform('android');
    } else {
      setPlatform('desktop');
    }

    // Listen for native install prompt (Chrome/Edge/Samsung)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show after short delay
    const timer = setTimeout(() => setVisible(true), 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(timer);
    };
  }, []);

  function dismiss() {
    localStorage.setItem(INSTALL_KEY, 'true');
    setVisible(false);
  }

  async function handleNativeInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      dismiss();
    }
    setDeferredPrompt(null);
  }

  if (!visible || isStandalone) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
      <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-forest-700 to-forest-800 px-6 pt-8 pb-6 text-center">
          <button
            onClick={dismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
          >
            <X size={16} className="text-white" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center mx-auto mb-4">
            <Smartphone size={32} className="text-white" />
          </div>
          <h2 className="text-white font-bold text-xl mb-1">NutriNews installieren</h2>
          <p className="text-forest-100 text-[13px]">
            Schnellzugriff auf evidenzbasierte Fachnews direkt vom Homescreen
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          {/* Native install button (Android Chrome) */}
          {deferredPrompt && (
            <div className="mb-4">
              <button
                onClick={handleNativeInstall}
                className="w-full bg-forest-700 text-white rounded-2xl py-3.5 text-[14px] font-bold flex items-center justify-center gap-2 hover:bg-forest-800 transition-colors active:scale-[0.98]"
              >
                <Download size={18} />
                Jetzt installieren
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Kein App Store nötig — läuft direkt im Browser
              </p>
            </div>
          )}

          {/* iOS Instructions */}
          {platform === 'ios' && !deferredPrompt && (
            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
                So installierst du NutriNews auf deinem iPhone:
              </p>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-forest-700 dark:text-forest-400">1</span>
                </div>
                <div>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">
                    Tippe auf das <strong>Teilen</strong>-Symbol
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-2.5 py-1">
                    <Share size={14} className="text-blue-500" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">in der Safari-Leiste unten</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-forest-700 dark:text-forest-400">2</span>
                </div>
                <div>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">
                    Scrolle und wähle <strong>&ldquo;Zum Home-Bildschirm&rdquo;</strong>
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-2.5 py-1">
                    <Plus size={14} className="text-slate-500" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Zum Home-Bildschirm</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-forest-700 dark:text-forest-400">3</span>
                </div>
                <p className="text-[13px] text-slate-700 dark:text-slate-300">
                  Bestätige mit <strong>&ldquo;Hinzufügen&rdquo;</strong> — fertig!
                </p>
              </div>
            </div>
          )}

          {/* Android Instructions (fallback without native prompt) */}
          {platform === 'android' && !deferredPrompt && (
            <div className="space-y-3">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 mb-3">
                So installierst du NutriNews auf deinem Android:
              </p>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-forest-700 dark:text-forest-400">1</span>
                </div>
                <div>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">
                    Tippe auf das <strong>Menü</strong> (3 Punkte oben rechts)
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-2.5 py-1">
                    <MoreVertical size={14} className="text-slate-500" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">im Chrome-Browser</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-forest-700 dark:text-forest-400">2</span>
                </div>
                <div>
                  <p className="text-[13px] text-slate-700 dark:text-slate-300">
                    Wähle <strong>&ldquo;App installieren&rdquo;</strong> oder <strong>&ldquo;Zum Startbildschirm hinzufügen&rdquo;</strong>
                  </p>
                  <div className="inline-flex items-center gap-1 mt-1 bg-slate-100 dark:bg-slate-700 rounded-lg px-2.5 py-1">
                    <Download size={14} className="text-slate-500" />
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">App installieren</span>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[12px] font-bold text-forest-700 dark:text-forest-400">3</span>
                </div>
                <p className="text-[13px] text-slate-700 dark:text-slate-300">
                  Bestätige mit <strong>&ldquo;Installieren&rdquo;</strong> — fertig!
                </p>
              </div>
            </div>
          )}

          {/* Desktop hint */}
          {platform === 'desktop' && !deferredPrompt && (
            <div className="space-y-3">
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                NutriNews ist für mobile Geräte optimiert. Öffne diese Seite auf deinem
                <strong> Smartphone</strong> und installiere die App auf dem Homescreen für den besten Zugriff.
              </p>
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-3">
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  <strong>Tipp:</strong> In Chrome oder Edge kannst du auch auf dem Desktop die App installieren
                  — klicke auf das Install-Symbol in der Adressleiste.
                </p>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <div className="grid grid-cols-3 gap-2 text-center">
              {[
                { label: 'Offline-fähig', desc: 'Artikel auch ohne Netz' },
                { label: 'Schnell', desc: 'Sofort vom Homescreen' },
                { label: 'Kein Store', desc: 'Kein Download nötig' },
              ].map(b => (
                <div key={b.label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-2 py-2.5">
                  <p className="text-[11px] font-bold text-forest-700 dark:text-forest-400">{b.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={dismiss}
            className="w-full text-[13px] text-slate-400 py-2 hover:text-slate-500 transition-colors"
          >
            Später
          </button>
        </div>
      </div>
    </div>
  );
}
