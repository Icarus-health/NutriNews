'use client';

import { useState, useEffect } from 'react';

// Singleton timer shared across all component instances
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function notifyAll() {
  listeners.forEach(fn => fn());
}

/**
 * Returns a counter that increments every 60 seconds.
 * All instances share a single setInterval — no matter how many components
 * call this hook, there is only ever one timer running.
 */
export function useMinuteTick(): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick(t => t + 1);
    listeners.add(update);
    if (listeners.size === 1) {
      timer = setInterval(notifyAll, 60_000);
    }
    return () => {
      listeners.delete(update);
      if (listeners.size === 0 && timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };
  }, []);

  return tick;
}
