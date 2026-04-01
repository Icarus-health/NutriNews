'use client';

import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [phase, setPhase] = useState<'hidden' | 'enter' | 'hold' | 'exit' | 'gone'>('hidden');

  useEffect(() => {
    // Nur einmal pro Session zeigen
    if (sessionStorage.getItem('nn-splash-shown')) return;

    // Kurz warten bis DOM bereit, dann einblenden
    const enterTimer = setTimeout(() => setPhase('enter'), 50);

    // Nach 1.6s: Ausblenden beginnen
    const exitTimer = setTimeout(() => setPhase('exit'), 1800);

    // Nach 2.4s: komplett entfernen
    const goneTimer = setTimeout(() => {
      setPhase('gone');
      sessionStorage.setItem('nn-splash-shown', '1');
    }, 2500);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(goneTimer);
    };
  }, []);

  if (phase === 'hidden' || phase === 'gone') return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{
        background: 'linear-gradient(160deg, #2a6b32 0%, #1a4a20 55%, #0f2e14 100%)',
        animation: phase === 'exit' ? 'splash-out 0.7s ease-in forwards' : undefined,
      }}
    >
      {/* Icon with entrance animation */}
      <div
        style={{
          animation: phase === 'enter' || phase === 'hold'
            ? 'splash-logo-in 0.65s cubic-bezier(0.2, 0, 0, 1) forwards'
            : undefined,
          opacity: 0,
        }}
      >
        <img src="/logo-splash.webp" alt="NutriNews" width={108} height={108} style={{ objectFit: 'contain' }} />
      </div>

      {/* Text with slightly delayed entrance */}
      <div
        style={{
          animation: phase === 'enter' || phase === 'hold'
            ? 'splash-text-in 0.65s cubic-bezier(0.2, 0, 0, 1) 0.2s forwards'
            : undefined,
          opacity: 0,
          marginTop: '20px',
          textAlign: 'center',
        }}
      >
        <p style={{
          color: 'white',
          fontSize: '26px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          lineHeight: 1,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          NutriNews
        </p>
        <p style={{
          color: 'rgba(187, 227, 195, 0.85)',
          fontSize: '13px',
          marginTop: '6px',
          letterSpacing: '0.01em',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}>
          Evidenzbasiert. Praxisnah.
        </p>
      </div>

      {/* Subtle bottom branding */}
      <p style={{
        position: 'absolute',
        bottom: '40px',
        color: 'rgba(255,255,255,0.25)',
        fontSize: '11px',
        letterSpacing: '0.05em',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}>
        ICARUS HEALTH
      </p>
    </div>
  );
}
