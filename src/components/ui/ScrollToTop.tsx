'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Nach oben scrollen"
      className="fixed bottom-24 right-4 z-50 w-11 h-11 rounded-full bg-forest-700 dark:bg-forest-600 text-white shadow-lg shadow-forest-900/30 flex items-center justify-center animate-scale-in hover:bg-forest-800 active:scale-95 transition-all"
    >
      <ArrowUp size={20} strokeWidth={2.5} />
    </button>
  );
}
