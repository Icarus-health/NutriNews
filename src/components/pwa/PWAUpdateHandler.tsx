'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PWAUpdateHandler() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Listen for new service worker installations
    navigator.serviceWorker.ready.then(registration => {
      // Check for updates every 5 minutes
      const interval = setInterval(() => {
        registration.update().catch(() => {});
      }, 5 * 60 * 1000);

      // Detect when a new SW is waiting
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available — show update prompt
            setUpdateAvailable(true);
          }
        });
      });

      // If there's already a waiting worker on load
      if (registration.waiting && navigator.serviceWorker.controller) {
        setUpdateAvailable(true);
      }

      return () => clearInterval(interval);
    });

    // When the new SW takes over, reload the page
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }, []);

  function handleUpdate() {
    navigator.serviceWorker.ready.then(registration => {
      if (registration.waiting) {
        // Tell the waiting SW to skip waiting and become active
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
    // Fallback: just reload after a short delay
    setTimeout(() => window.location.reload(), 1000);
  }

  if (!updateAvailable) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-lg mx-auto animate-fade-in">
      <div className="bg-forest-700 text-white rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
        <RefreshCw size={18} className="flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold">Neue Version verfügbar</p>
          <p className="text-[11px] text-forest-200">Tippe zum Aktualisieren — kein Neuinstallieren nötig.</p>
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1.5 bg-white text-forest-700 rounded-lg text-[12px] font-bold hover:bg-forest-50 transition-colors flex-shrink-0"
        >
          Update
        </button>
      </div>
    </div>
  );
}
