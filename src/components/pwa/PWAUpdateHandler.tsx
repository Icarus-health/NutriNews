'use client';

import { useEffect, useState, useRef } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PWAUpdateHandler() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const initialBuildId = useRef<string | null>(null);

  useEffect(() => {
    let swInterval: ReturnType<typeof setInterval> | null = null;
    let controllerChangeHandler: (() => void) | null = null;

    // ── 1. Service Worker update detection (PWA) ──
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        swInterval = setInterval(() => {
          registration.update().catch(() => {});
        }, 5 * 60 * 1000);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        if (registration.waiting && navigator.serviceWorker.controller) {
          setUpdateAvailable(true);
        }
      });

      let refreshing = false;
      controllerChangeHandler = () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
      };
      navigator.serviceWorker.addEventListener('controllerchange', controllerChangeHandler);
    }

    // ── 2. Build-ID polling (works without PWA) ──
    async function checkBuildVersion() {
      try {
        const res = await fetch('/api/version', { cache: 'no-store' });
        if (!res.ok) return;
        const { buildId } = await res.json();
        if (!initialBuildId.current) {
          initialBuildId.current = buildId;
          return;
        }
        if (buildId !== initialBuildId.current) {
          setUpdateAvailable(true);
        }
      } catch {
        // Network error — skip
      }
    }

    // Check on first load, then every 5 minutes
    checkBuildVersion();
    const pollInterval = setInterval(checkBuildVersion, 5 * 60 * 1000);

    return () => {
      clearInterval(pollInterval);
      if (swInterval) clearInterval(swInterval);
      if (controllerChangeHandler && 'serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', controllerChangeHandler);
      }
    };
  }, []);

  function handleUpdate() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      });
    }
    setTimeout(() => window.location.reload(), 500);
  }

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto animate-fade-in safe-top">
      <div className="bg-forest-700 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <RefreshCw size={18} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold">Neue Version verfügbar</p>
          <p className="text-[11px] text-forest-200">Tippe zum Aktualisieren.</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-white text-forest-700 rounded-lg text-[12px] font-bold hover:bg-forest-50 transition-colors flex-shrink-0"
        >
          Jetzt aktualisieren
        </button>
      </div>
    </div>
  );
}
