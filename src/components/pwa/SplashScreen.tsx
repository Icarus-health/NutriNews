'use client';

import { useState, useEffect } from 'react';

// Die Kolibri-SVG direkt inline – kein Netzwerk-Request beim Start nötig
function HummingbirdIcon({ size = 96 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <circle cx="256" cy="256" r="256" fill="rgba(255,255,255,0.12)" />
      <path
        d="M370,130 A160,160 0 1,0 380,160"
        fill="none" stroke="white" strokeWidth="5" strokeLinecap="round" opacity="0.9"
      />
      <circle cx="382" cy="148" r="4" fill="white" opacity="0.85" />
      <circle cx="390" cy="138" r="3.2" fill="white" opacity="0.7" />
      <circle cx="396" cy="129" r="2.5" fill="white" opacity="0.55" />
      <circle cx="400" cy="121" r="1.8" fill="white" opacity="0.4" />
      <g
        fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"
        transform="translate(248, 260)"
      >
        <path d="M50,-60 L62,-72 L70,-58 L55,-50 Z" />
        <circle cx="58" cy="-60" r="3" fill="white" stroke="none" />
        <line x1="70" y1="-65" x2="115" y2="-82" />
        <line x1="70" y1="-58" x2="115" y2="-82" />
        <circle cx="120" cy="-84" r="2.8" fill="white" stroke="none" />
        <circle cx="126" cy="-87" r="2.2" fill="white" stroke="none" />
        <circle cx="131" cy="-89" r="1.6" fill="white" stroke="none" />
        <line x1="50" y1="-60" x2="30" y2="-40" />
        <line x1="55" y1="-50" x2="35" y2="-30" />
        <path d="M30,-40 L35,-30 L20,10 L5,30 L-5,20 L10,-10 Z" />
        <line x1="10" y1="-10" x2="35" y2="-30" />
        <line x1="20" y1="10" x2="10" y2="-10" />
        <line x1="-5" y1="20" x2="10" y2="-10" />
        <line x1="30" y1="-40" x2="20" y2="10" />
        <path d="M35,-30 L65,-35 L50,-15 Z" />
        <path d="M50,-15 L65,-35 L80,-20 Z" />
        <line x1="65" y1="-35" x2="55" y2="-25" />
        <path d="M10,-10 L-30,-45 L-10,-20 Z" />
        <path d="M-30,-45 L-55,-70 L-35,-50 Z" />
        <path d="M-35,-50 L-55,-70 L-50,-42 L-30,-45 Z" />
        <line x1="-30" y1="-45" x2="-40" y2="-55" />
        <path d="M-62,-78 L-55,-85 L-52,-74 Z" />
        <path d="M-70,-68 L-64,-75 L-60,-65 Z" />
        <path d="M-72,-82 L-66,-88 L-65,-79 Z" />
        <path d="M-58,-92 L-52,-96 L-53,-88 Z" />
        <path d="M-78,-75 L-74,-82 L-71,-73 Z" />
        <path d="M5,30 L-25,70 L-15,65 L-5,25" />
        <path d="M5,30 L-10,80 L0,72 L5,28" />
        <path d="M5,30 L8,82 L14,72 L10,28" />
        <path d="M5,30 L25,70 L18,65 L10,28" />
        <line x1="-15" y1="40" x2="-22" y2="68" />
        <line x1="0" y1="42" x2="-5" y2="76" />
        <line x1="10" y1="42" x2="12" y2="78" />
        <line x1="16" y1="40" x2="22" y2="66" />
      </g>
    </svg>
  );
}

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
        <HummingbirdIcon size={108} />
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
