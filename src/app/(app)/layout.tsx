'use client';

import BottomNav from '@/components/layout/BottomNav';
import { ToastProvider } from '@/components/ui/Toast';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
        <main className="flex-1 pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
