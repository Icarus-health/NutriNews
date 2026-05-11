'use client';

import { useState, useTransition, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Save, LogOut, Bell, Stethoscope, Moon, Sun, Monitor, Type, FileText, Shield, Scale, Bot, Pencil, Camera, Flame, Award, MessageSquare, UserPlus, Link2, Check, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
import { updateProfile, submitAppFeedback } from '@/lib/actions/news';
import { deleteAccount } from '@/lib/actions/user';
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
  const [inviteCopied, setInviteCopied] = useState(false);
  const [feedbackType, setFeedbackType] = useState('verbesserung');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [isFeedbackPending, startFeedbackTransition] = useTransition();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState('');

  function handleDeleteAccount() {
    startDeleteTransition(async () => {
      const result = await deleteAccount();
      if (result?.error) setDeleteError(result.error);
    });
  }

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
      // Single targeted update — avoids overwriting other profile fields with stale state
      await supabase.from('profiles').update({ avatar_url: publicUrl, updated_at: new Date().toISOString() }).eq('id', profile!.id);
    }
    setUploading(false);
  }

  function toggleCategory(catId: string) {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  }

  function handleFeedbackSubmit() {
    setFeedbackError('');
    startFeedbackTransition(async () => {
      const result = await submitAppFeedback(feedbackType, feedbackMessage);
      if (result.error) {
        setFeedbackError(result.error);
      } else {
        setFeedbackSent(true);
        setFeedbackMessage('');
      }
    });
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
    <div>
      <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
        <div className="px-5 py-3">
          <h1 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">Profil</h1>
        </div>
      </header>
      <div className="px-4 pt-4 pb-8">
      {/* Avatar & info */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <Image src={avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" width={64} height={64} unoptimized />
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
            {stats.comments < 10 && stats.likes < 20 && ux.streak.days < 5 && ux.weeklyStats.count < 10 && (
              <p className="text-[11px] text-slate-400">Lese regelmäßig, um Badges zu verdienen</p>
            )}
          </div>
        </div>
      </div>

      {/* Invite colleagues */}
      <div className="bg-gradient-to-br from-forest-50 to-emerald-50/50 dark:from-forest-900/20 dark:to-emerald-900/10 rounded-xl border border-forest-100/60 dark:border-forest-800/30 p-4 mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <UserPlus size={18} className="text-forest-600 dark:text-forest-400" />
          <p className="text-sm font-bold text-forest-800 dark:text-forest-200">Kolleg*innen einladen</p>
        </div>
        <p className="text-[12px] text-forest-600/80 dark:text-forest-400/80 mb-3">
          Teile NutriNews mit deinem Team — gemeinsam evidenzbasiert auf dem neuesten Stand.
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              const url = typeof window !== 'undefined' ? window.location.origin : '';
              const shareText = 'Schau dir NutriNews an — evidenzbasierte Ernährungsnews, kompakt aufbereitet für die Praxis.';
              if (navigator.share) {
                try {
                  await navigator.share({ title: 'NutriNews', text: shareText, url });
                  return;
                } catch { /* user cancelled or not supported */ }
              }
              try {
                await navigator.clipboard.writeText(url);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 2500);
              } catch { /* ignore */ }
            }}
            className="flex-1 flex items-center justify-center gap-2 bg-forest-700 hover:bg-forest-800 text-white rounded-xl py-2.5 text-[13px] font-semibold transition-colors"
          >
            <UserPlus size={15} />
            Einladung teilen
          </button>
          <button
            onClick={async () => {
              const url = typeof window !== 'undefined' ? window.location.origin : '';
              try {
                await navigator.clipboard.writeText(url);
                setInviteCopied(true);
                setTimeout(() => setInviteCopied(false), 2500);
              } catch { /* ignore */ }
            }}
            className={clsx(
              'flex items-center justify-center gap-1.5 px-4 rounded-xl text-[12px] font-semibold transition-all border',
              inviteCopied
                ? 'bg-forest-50 dark:bg-forest-900/30 border-forest-300 dark:border-forest-700 text-forest-700 dark:text-forest-400'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-forest-300'
            )}
          >
            {inviteCopied ? <><Check size={14} /> Kopiert!</> : <><Link2 size={14} /> Link</>}
          </button>
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

        {/* Auto-dark schedule */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div>
            <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Automatisch dunkel</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {ux.darkSchedule.fromHour}:00 – {ux.darkSchedule.toHour}:00 Uhr
            </p>
          </div>
          <button
            onClick={() => ux.setDarkSchedule({ ...ux.darkSchedule, enabled: !ux.darkSchedule.enabled })}
            className={clsx(
              'relative w-11 h-6 rounded-full transition-colors flex-shrink-0',
              ux.darkSchedule.enabled ? 'bg-forest-700' : 'bg-slate-200 dark:bg-slate-600'
            )}
          >
            <span className={clsx(
              'absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200',
              ux.darkSchedule.enabled && 'translate-x-5'
            )} />
          </button>
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

      {/* Feedback */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={18} className="text-forest-600" />
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Feedback senden</p>
        </div>
        {feedbackSent ? (
          <div className="flex flex-col items-center py-3 gap-1">
            <span className="text-2xl">🙏</span>
            <p className="text-[13px] font-semibold text-forest-700 dark:text-forest-400">Vielen Dank für dein Feedback!</p>
            <button
              onClick={() => setFeedbackSent(false)}
              className="text-[11px] text-slate-400 hover:text-slate-600 mt-1"
            >
              Weiteres Feedback senden
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[
                { id: 'bug', label: '🐛 Bug' },
                { id: 'verbesserung', label: '💡 Verbesserung' },
                { id: 'lob', label: '👍 Lob' },
                { id: 'sonstiges', label: '💬 Sonstiges' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setFeedbackType(opt.id)}
                  className={clsx(
                    'text-[12px] font-medium px-3 py-1.5 rounded-full transition-colors',
                    feedbackType === opt.id
                      ? 'bg-forest-700 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <textarea
              value={feedbackMessage}
              onChange={e => setFeedbackMessage(e.target.value)}
              placeholder="Was möchtest du uns mitteilen?"
              rows={3}
              className="w-full text-[13px] bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 resize-none"
            />
            {feedbackError && <p className="text-[12px] text-red-500">{feedbackError}</p>}
            <button
              onClick={handleFeedbackSubmit}
              disabled={isFeedbackPending || feedbackMessage.trim().length < 10}
              className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white rounded-xl py-2.5 text-[13px] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isFeedbackPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Feedback senden
            </button>
          </div>
        )}
      </div>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="w-full border border-red-200 dark:border-red-800 text-red-500 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 mb-2"
      >
        <LogOut size={16} />
        Abmelden
      </button>

      {/* Account deletion — DSGVO Art. 17 */}
      {!showDeleteConfirm ? (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full text-slate-400 dark:text-slate-500 text-[12px] py-2 mb-4 hover:text-red-400 transition-colors"
        >
          Konto und alle Daten löschen
        </button>
      ) : (
        <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 space-y-3">
          <div className="flex items-start gap-2">
            <Trash2 size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-[13px] text-red-700 dark:text-red-300 font-medium">
              Konto unwiderruflich löschen?
            </p>
          </div>
          <p className="text-[12px] text-red-600 dark:text-red-400">
            Alle deine Daten (Lesezeichen, Likes, Kommentare, Profil) werden sofort und dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
          {deleteError && <p className="text-[12px] text-red-500">{deleteError}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => { setShowDeleteConfirm(false); setDeleteError(''); }}
              className="flex-1 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 rounded-lg py-2 text-[13px] font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Abbrechen
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg py-2 text-[13px] font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              {isDeleting && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Ja, Konto löschen
            </button>
          </div>
        </div>
      )}

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
    </div>
  );
}
