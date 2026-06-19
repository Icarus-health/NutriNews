'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { clsx } from 'clsx';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

type PermState = 'unsupported' | 'denied' | 'granted' | 'default' | 'loading';

export default function PushNotificationToggle() {
  const [permState, setPermState] = useState<PermState>('loading');
  const [subscribed, setSubscribed] = useState(false);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermState('unsupported');
      return;
    }
    setPermState(Notification.permission as PermState);

    // Check if already subscribed
    navigator.serviceWorker.ready.then(reg =>
      reg.pushManager.getSubscription()
    ).then(sub => {
      setSubscribed(!!sub);
    }).catch(() => { /* ignore */ });
  }, []);

  async function handleToggle() {
    if (pending) return;
    setPending(true);

    try {
      const reg = await navigator.serviceWorker.ready;

      if (subscribed) {
        // Unsubscribe
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push/subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setSubscribed(false);
        return;
      }

      // Request permission
      const permission = await Notification.requestPermission();
      setPermState(permission as PermState);
      if (permission !== 'granted') return;

      // Get VAPID public key
      const res = await fetch('/api/push/vapid-public');
      if (!res.ok) return;
      const { publicKey } = await res.json() as { publicKey: string };

      // Subscribe
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
      });

      // Save to server
      const subJson = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subJson),
      });

      setSubscribed(true);
    } catch {
      // Permission denied or push not available — update state
      if ('Notification' in window) setPermState(Notification.permission as PermState);
    } finally {
      setPending(false);
    }
  }

  if (permState === 'loading' || permState === 'unsupported') return null;

  const denied = permState === 'denied';

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 min-w-0">
        {subscribed
          ? <BellRing size={18} className="text-forest-600 dark:text-forest-400 shrink-0" />
          : denied
            ? <BellOff size={18} className="text-slate-400 shrink-0" />
            : <Bell size={18} className="text-slate-500 dark:text-slate-400 shrink-0" />
        }
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Push-Benachrichtigungen</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {denied
              ? 'In deinem Browser blockiert — bitte in den Browser-Einstellungen erlauben'
              : subscribed
                ? 'Täglich wenn dein Briefing bereit ist'
                : 'Jetzt täglich informiert bleiben'}
          </p>
        </div>
      </div>

      {!denied && (
        <button
          onClick={handleToggle}
          disabled={pending}
          aria-label={subscribed ? 'Benachrichtigungen deaktivieren' : 'Benachrichtigungen aktivieren'}
          className={clsx(
            'relative w-10 h-6 rounded-full transition-colors duration-200 shrink-0 ml-3',
            subscribed
              ? 'bg-forest-600 dark:bg-forest-500'
              : 'bg-slate-200 dark:bg-slate-600',
            pending && 'opacity-50 cursor-wait'
          )}
        >
          <span
            className={clsx(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
              subscribed && 'translate-x-4'
            )}
          />
        </button>
      )}
    </div>
  );
}
