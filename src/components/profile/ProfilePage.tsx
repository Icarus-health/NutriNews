'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { Profile } from '@/types/database';
import { LogOut, Mail, Shield } from 'lucide-react';

export default function ProfilePage({ profile }: { profile: Profile | null }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const initials = profile?.full_name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '?';

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-md"
          style={{ background: 'linear-gradient(135deg, #B8960C 0%, #236829 100%)' }}
        >
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
          ) : (
            <span className="text-white text-2xl font-bold">{initials}</span>
          )}
        </div>
        <h1 className="text-xl font-bold text-slate-900">{profile?.full_name ?? 'Kein Name'}</h1>
        <div className="flex items-center gap-1.5 mt-1 text-slate-500">
          <Mail size={13} strokeWidth={1.8}/>
          <span className="text-sm">{profile?.email}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-2">
          <Shield size={13} className="text-forest-600" strokeWidth={1.8}/>
          <span className="text-xs font-semibold text-forest-700 capitalize">
            {profile?.role === 'admin' ? 'Administrator' : 'Ernährungstherapeut:in'}
          </span>
        </div>
      </div>

      {/* Settings sections */}
      <div className="space-y-3 mb-8">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
          <div className="px-4 py-3.5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5">Benachrichtigungen</p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm text-slate-700">Neue News</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                profile?.notify_new_news ? 'bg-forest-100 text-forest-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {profile?.notify_new_news ? 'An' : 'Aus'}
              </span>
            </div>
          </div>
          {profile?.preferred_categories && profile.preferred_categories.length > 0 && (
            <div className="px-4 py-3.5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Meine Kategorien</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.preferred_categories.map(cat => (
                  <span key={cat} className="text-xs bg-forest-50 text-forest-700 px-2.5 py-1 rounded-full font-medium">
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-500 rounded-2xl py-3 text-sm font-semibold hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        <LogOut size={16} strokeWidth={1.8}/>
        Abmelden
      </button>
    </div>
  );
}
