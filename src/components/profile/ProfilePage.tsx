'use client';

import type { Profile } from '@/types/database';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ProfilePage({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <div className="px-4 pt-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-2xl">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
          ) : '👤'}
        </div>
        <div>
          <p className="font-bold text-slate-900">{profile?.full_name ?? 'Kein Name'}</p>
          <p className="text-sm text-slate-400">{profile?.email}</p>
          <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">{profile?.role}</span>
        </div>
      </div>
      {/* TODO: Felder bearbeiten, Kategorien-Präferenzen, Benachrichtigungen */}
      <button
        onClick={handleSignOut}
        className="w-full mt-8 border border-red-200 text-red-500 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors"
      >
        Abmelden
      </button>
    </div>
  );
}
