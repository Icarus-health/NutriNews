'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const KEY = 'nn-scroll-positions';
// Nur listenartige Routen, bei denen ein Wiederfinden der Position zählt.
// Detailseiten (/card/[id], /user/[id]) sollen oben starten.
const RESTORE_PATHS = ['/', '/saved', '/community', '/inbox'];

function readPositions(): Record<string, number> {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

/**
 * Stellt die Scroll-Position pro Route wieder her. Für den
 * "2x-täglich-Kaffeepause"-Nutzer: Feed durchscrollen, auf eine Karte tippen,
 * zurück — und wieder an derselben Stelle landen, statt oben neu anzufangen.
 */
export default function ScrollRestoration() {
  const pathname = usePathname();

  // Aktuelle Position laufend speichern (per rAF gedrosselt)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const positions = readPositions();
        positions[pathname] = window.scrollY;
        try { sessionStorage.setItem(KEY, JSON.stringify(positions)); } catch { /* quota */ }
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  // Beim Routenwechsel die gemerkte Position wiederherstellen.
  // Die Nav-Links der Restore-Routen nutzen scroll={false}, damit Next nicht
  // vorher nach oben springt — wir setzen die Position (oder 0) selbst.
  useEffect(() => {
    if (!RESTORE_PATHS.includes(pathname)) return;
    const target = readPositions()[pathname] ?? 0;

    let cancelled = false;
    let attempts = 0;
    // Der Feed lädt SSR-Karten, ist aber nicht sofort auf voller Höhe —
    // warten, bis die Seite hoch genug ist, dann zur Position springen.
    const tryRestore = () => {
      if (cancelled) return;
      if (target <= 0) { window.scrollTo(0, 0); return; }
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll >= target || attempts > 20) {
        window.scrollTo(0, target);
        return;
      }
      attempts++;
      requestAnimationFrame(tryRestore);
    };
    requestAnimationFrame(tryRestore);
    return () => { cancelled = true; };
  }, [pathname]);

  return null;
}
