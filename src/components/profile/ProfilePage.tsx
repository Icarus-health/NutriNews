'use client';

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, LogOut, Bell, Stethoscope, Moon, Sun, Monitor, Type, FileText, Shield, Scale, Bot, Pencil, Camera, Flame, Award } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
import { updateProfile } from '@/lib/actions/news';
import { useUX } from '@/components/providers/UXProvider';
import type { Profile, TherapistSetting } from '@/types/database';

const SETTINGS: { id: TherapistSetting; label: string; description: string }[] = [
  { id: 'akutklinik', label: 'Akutklinik', description: 'Stationäre Versorgung, Intensiv' },
  { id: 'rehabilitation', label: 'Rehabilitation', description: 'Reha-Einrichtungen' },
  { id: 'ambulant', label: 'Ambulante Praxis', description: 'Freiberufliche Ernährungstherapie' },
  { id: 'psychiatrie', label: 'Psychiatrische Einrichtung', description: 'Psychiatrie, Psychosomatik' },
  { id: 'langzeitpflege', label: 'Langzeitpflege', description: 'Pflegeheime, Geriatrie' },
  { id: 'praevention', label: 'Prävention', description: 'Gesundheitsförderung, Kursleitung' },
  { id: 'forschung_lehre', label: 'Forschung & Lehre', description: 'Hochschule, Wissenschaft' },
];

interface Props {
  profile: Profile | null;
  stats: { likes: number; bookmarks: number; comments: number };
}

export default function ProfilePage({ profile, stats }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const ux = useUX();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [alias, setAlias] = useState(profile?.alias ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile?.preferred_categories ?? []);
  const [setting, setSetting] = useState<TherapistSetting | null>(profile?.setting ?? null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `${profile?.id ?? 'user'}.${ext}`;
    const { error, data } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true, contentType: file.type });
    if (!error && data) {
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setAvatarUrl(publicUrl);
      await updateProfile({ full_name: fullName || undefined, alias: alias || undefined });
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile!.id);
    }
    setUploading(false);
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
        alias: alias || undefined,
        preferred_categories: selectedCategories,
        setting: setting ?? undefined,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  const displayName = profile?.alias || profile?.full_name || profile?.email?.split('@')[0] || '?';

  return (
    <div className="px-4 pt-6 pb-8">
      {/* Avatar & info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover"/>
            ) : (
              <span className="text-2xl font-bold text-forest-700 dark:text-forest-400">
                {displayName[0].toUpperCase()}
              </span>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center shadow-md hover:bg-forest-800 transition-colors disabled:opacity-60"
          >
            {uploading ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={12} />}
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <div className="space-y-1.5">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Vollständiger Name"
                className="font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 w-full text-[14px] focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
              <input
                type="text"
                value={alias}
                onChange={e => setAlias(e.target.value)}
                placeholder="Alias (sichtbar für andere)"
                className="text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 w-full text-[13px] focus:outline-none focus:ring-2 focus:ring-forest-500"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-slate-900 dark:text-slate-100">{displayName}</p>
              <button
                onClick={() => setEditing(true)}
                className="text-slate-400 hover:text-forest-600 transition-colors"
                title="Name bearbeiten"
              >
                <Pencil size={13} />
              </button>
            </div>
          )}
          {profile?.alias && profile?.full_name && !editing && (
            <p className="text-[11px] text-slate-400 truncate">{profile.full_name}</p>
          )}
          <p className="text-sm text-slate-400 truncate">{profile?.email}</p>
          <span className="text-xs bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 px-2 py-0.5 rounded-full">{profile?.role}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Likes', value: stats.likes },
          { label: 'Gespeichert', value: stats.bookmarks },
          { label: 'Kommentare', value: stats.comments },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-center">
            <p className="text-lg font-bold text-forest-700 dark:text-forest-400">{s.value}</p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Streak & Badges */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-2">
            <div className={clsx(
              'w-10 h-10 rounded-full flex items-center justify-center',
              ux.streak.days >= 1 ? 'bg-orange-100 dark:bg-orange-900/30' : 'bg-slate-100 dark:bg-slate-700'
            )}>
              <Flame size={20} className={ux.streak.days >= 1 ? 'text-orange-500' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none">{ux.streak.days}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Tage in Folge</p>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-100 dark:bg-slate-700" />

          {/* Badges */}
          <div className="flex gap-2">
            {stats.comments >= 10 && (
              <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-full" title="Aktive Diskutantin">
                <Award size={12} className="text-indigo-500" />
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">Diskutant</span>
              </div>
            )}
            {stats.likes >= 20 && (
              <div className="flex items-center gap-1 bg-rose-50 dark:bg-rose-900/20 px-2 py-1 rounded-full" title="Engagierte Leserin">
                <Award size={12} className="text-rose-500" />
                <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Engagiert</span>
              </div>
            )}
            {ux.streak.days >= 5 && (
              <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-full" title="5-Tage-Streak">
                <Flame size={12} className="text-orange-500" />
                <span className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Streak</span>
              </div>
            )}
            {ux.weeklyStats.count >= 10 && (
              <div className="flex items-center gap-1 bg-forest-50 dark:bg-forest-900/20 px-2 py-1 rounded-full" title="Vielleserin">
                <Award size={12} className="text-forest-600" />
                <span className="text-[10px] font-semibold text-forest-700 dark:text-forest-400">Vielleser</span>
              </div>
            )}
            {stats.comments === 0 && stats.likes < 20 && ux.streak.days < 5 && ux.weeklyStats.count < 10 && (
              <p className="text-[11px] text-slate-400">Lese regelmäßig, um Badges zu verdienen</p>
            )}
          </div>
        </div>
      </div>

      {/* Setting */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Stethoscope size={18} className="text-forest-600" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Mein Arbeitsumfeld</p>
        </div>
        <p className="text-xs text-slate-400 mb-3">Personalisiert dein tägliches Briefing und die Nachrichtenpriorisierung.</p>
        <div className="grid grid-cols-2 gap-2">
          {SETTINGS.map(s => (
            <button
              key={s.id}
              onClick={() => { setSetting(setting === s.id ? null : s.id); setEditing(true); }}
              className={clsx(
                'px-3 py-2 rounded-xl text-left transition-all border',
                setting === s.id
                  ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-300 dark:border-forest-700 ring-1 ring-forest-300 dark:ring-forest-700'
                  : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600 hover:border-slate-200 dark:hover:border-slate-500'
              )}
            >
              <p className={clsx(
                'text-xs font-semibold',
                setting === s.id ? 'text-forest-700 dark:text-forest-400' : 'text-slate-600 dark:text-slate-300'
              )}>
                {s.label}
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">{s.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications — coming soon */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell size={18} className="text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Benachrichtigungen</span>
          </div>
          <span className="text-[11px] font-semibold text-forest-600 bg-forest-50 dark:bg-forest-900/30 px-2 py-0.5 rounded-full">
            Kommt bald
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1.5">
          Push-Benachrichtigungen und E-Mail-Digest werden in einem zukünftigen Update verfügbar sein.
        </p>
      </div>

      {/* Preferred categories */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Bevorzugte Kategorien</p>
        <p className="text-xs text-slate-400 mb-3">Wähle Themen, die dich besonders interessieren.</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { toggleCategory(cat.id); setEditing(true); }}
              className={clsx(
                'px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                selectedCategories.includes(cat.id)
                  ? 'bg-forest-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
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
          {isPending ? 'Wird gespeichert...' : 'Änderungen speichern'}
        </button>
      )}

      {saved && (
        <p className="text-center text-sm text-forest-600 font-medium mb-4 animate-fade-in">Gespeichert!</p>
      )}

      {/* Dark Mode */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          {ux.isDark ? <Moon size={18} className="text-forest-600" /> : <Sun size={18} className="text-forest-600" />}
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Darstellung</p>
        </div>
        <div className="flex gap-2">
          {([
            { value: 'light' as const, label: 'Hell', icon: Sun },
            { value: 'dark' as const, label: 'Dunkel', icon: Moon },
            { value: 'system' as const, label: 'System', icon: Monitor },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => ux.setTheme(opt.value)}
              className={clsx(
                'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-colors',
                ux.theme === opt.value
                  ? 'bg-forest-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              )}
            >
              <opt.icon size={14} />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text size */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Type size={18} className="text-forest-600" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Textgröße</p>
        </div>
        <div className="flex gap-2">
          {([
            { value: 'small' as const, label: 'Klein', sample: 'Aa' },
            { value: 'medium' as const, label: 'Normal', sample: 'Aa' },
            { value: 'large' as const, label: 'Groß', sample: 'Aa' },
          ]).map(opt => (
            <button
              key={opt.value}
              onClick={() => ux.setTextSize(opt.value)}
              className={clsx(
                'flex-1 flex flex-col items-center py-2 rounded-lg transition-colors',
                ux.textSize === opt.value
                  ? 'bg-forest-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              )}
            >
              <span className={clsx(
                'font-bold',
                opt.value === 'small' && 'text-[12px]',
                opt.value === 'medium' && 'text-[15px]',
                opt.value === 'large' && 'text-[18px]',
              )}>{opt.sample}</span>
              <span className="text-[10px] mt-0.5">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Reading stats */}
      {ux.weeklyStats.count > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Deine Woche</p>
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Du hast diese Woche <span className="font-bold text-forest-700 dark:text-forest-400">{ux.weeklyStats.count} Artikel</span> gelesen.
            {ux.weeklyStats.topCategories.length > 0 && (
              <> Top-Themen: {ux.weeklyStats.topCategories.join(', ')}</>
            )}
          </p>
        </div>
      )}

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full border border-red-200 dark:border-red-800 text-red-500 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 mb-4"
      >
        <LogOut size={16} />
        Abmelden
      </button>

      {/* Legal links */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700 mb-4">
        {[
          { href: '/impressum', icon: FileText, label: 'Impressum' },
          { href: '/datenschutz', icon: Shield, label: 'Datenschutzerklärung' },
          { href: '/nutzungsbedingungen', icon: Scale, label: 'Nutzungsbedingungen' },
          { href: '/ki-transparenz', icon: Bot, label: 'KI-Transparenzhinweis' },
        ].map(item => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 text-[13px] text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
          >
            <item.icon size={16} className="text-slate-400" />
            {item.label}
          </Link>
        ))}
      </div>

      <p className="text-center text-[11px] text-slate-300 dark:text-slate-600 mb-4">
        NutriNews v1.0 &middot; Icarus Health GmbH
      </p>
    </div>
  );
}
