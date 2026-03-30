'use client';

import { useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Save, LogOut, Bell, BellOff } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
import { updateProfile } from '@/lib/actions/news';
import type { Profile } from '@/types/database';

interface Props {
  profile: Profile | null;
  stats: { likes: number; bookmarks: number; comments: number };
}

export default function ProfilePage({ profile, stats }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [notify, setNotify] = useState(profile?.notify_new_news ?? true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile?.preferred_categories ?? []);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  function toggleCategory(catId: string) {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  }

  function handleSave() {
    startTransition(async () => {
      await updateProfile({
        full_name: fullName || undefined,
        preferred_categories: selectedCategories,
        notify_new_news: notify,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Avatar & info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-forest-100 flex items-center justify-center text-2xl flex-shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
          ) : (
            <span className="text-2xl font-bold text-forest-700">
              {(profile?.full_name || profile?.email || '?')[0].toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Dein Name"
              className="font-bold text-slate-900 border border-slate-200 rounded-lg px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-forest-500"
            />
          ) : (
            <p className="font-bold text-slate-900">{profile?.full_name ?? 'Kein Name'}</p>
          )}
          <p className="text-sm text-slate-400 truncate">{profile?.email}</p>
          <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">{profile?.role}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Likes', value: stats.likes },
          { label: 'Gespeichert', value: stats.bookmarks },
          { label: 'Kommentare', value: stats.comments },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <p className="text-lg font-bold text-forest-700">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notify ? <Bell size={18} className="text-forest-600" /> : <BellOff size={18} className="text-slate-400" />}
            <span className="text-sm font-medium text-slate-700">Benachrichtigungen</span>
          </div>
          <button
            onClick={() => { setNotify(p => !p); setEditing(true); }}
            className={clsx(
              'w-10 h-6 rounded-full transition-colors relative',
              notify ? 'bg-forest-600' : 'bg-slate-300'
            )}
          >
            <span className={clsx(
              'absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
              notify ? 'left-[18px]' : 'left-0.5'
            )} />
          </button>
        </div>
      </div>

      {/* Preferred categories */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-4">
        <p className="text-sm font-medium text-slate-700 mb-2">Bevorzugte Kategorien</p>
        <p className="text-xs text-slate-400 mb-3">Waehle Themen, die dich besonders interessieren.</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { toggleCategory(cat.id); setEditing(true); }}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                selectedCategories.includes(cat.id)
                  ? 'bg-forest-700 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Save button */}
      {editing && (
        <button
          onClick={handleSave}
          disabled={isPending}
          className="w-full bg-forest-700 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-forest-800 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mb-4 animate-fade-in"
        >
          <Save size={16} />
          {isPending ? 'Wird gespeichert...' : 'Aenderungen speichern'}
        </button>
      )}

      {saved && (
        <p className="text-center text-sm text-forest-600 font-medium mb-4 animate-fade-in">Gespeichert!</p>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full border border-red-200 text-red-500 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
      >
        <LogOut size={16} />
        Abmelden
      </button>
    </div>
  );
}
