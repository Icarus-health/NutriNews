import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getCategoryLabel } from '@/lib/categories';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Deduplicated per-request: generateMetadata and the page share one DB call
const getProfile = cache(async (id: string) => {
  const supabase = await createClient();
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, alias, avatar_url, role, setting, preferred_categories, created_at')
    .eq('id', id)
    .single();
  return data;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profile = await getProfile(id);
  const name = profile?.alias || profile?.full_name || 'Nutzer';
  return {
    title: `${name} — NutriNews`,
    description: `Profil von ${name} auf NutriNews`,
  };
}

const SETTING_LABELS: Record<string, string> = {
  akutklinik: 'Akutklinik',
  rehabilitation: 'Rehabilitation',
  ambulant: 'Ambulante Praxis',
  psychiatrie: 'Psychiatrie',
  langzeitpflege: 'Langzeitpflege',
  praevention: 'Prävention',
  forschung_lehre: 'Forschung & Lehre',
};

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Profile (deduped with generateMetadata via cache) and activity counts in parallel
  const [profile, [{ count: verifications }, { count: comments }]] = await Promise.all([
    getProfile(id),
    Promise.all([
      supabase.from('card_verifications').select('*', { count: 'exact', head: true }).eq('user_id', id),
      supabase.from('comments').select('*', { count: 'exact', head: true }).eq('user_id', id),
    ]),
  ]);

  if (!profile) notFound();

  const displayName = profile.alias || profile.full_name || 'Anonym';
  const memberSince = new Date(profile.created_at).toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
      <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
        <div className="flex items-center gap-3 px-4 py-3">
          <Link
            href="/community"
            className="text-[13px] text-forest-600 dark:text-forest-400 font-medium hover:text-forest-700 transition-colors"
          >
            &larr; Community
          </Link>
          <h1 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 tracking-tight ml-2">{displayName}</h1>
        </div>
      </header>
      <div className="px-4 pt-6 pb-24">
      {/* Avatar & Name */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.avatar_url ? (
            <Image src={profile.avatar_url} alt={displayName} className="w-full h-full rounded-full object-cover" width={64} height={64} unoptimized />
          ) : (
            <span className="text-2xl font-bold text-forest-700 dark:text-forest-400">
              {displayName[0].toUpperCase()}
            </span>
          )}
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{displayName}</h1>
          {profile.setting && (
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              {SETTING_LABELS[profile.setting] ?? profile.setting}
            </p>
          )}
          <p className="text-[12px] text-slate-400 mt-0.5">
            Mitglied seit {memberSince}
          </p>
        </div>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-center">
          <p className="text-lg font-bold text-forest-700 dark:text-forest-400">{verifications ?? 0}</p>
          <p className="text-xs text-slate-400">Verifikationen</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-3 text-center">
          <p className="text-lg font-bold text-forest-700 dark:text-forest-400">{comments ?? 0}</p>
          <p className="text-xs text-slate-400">Kommentare</p>
        </div>
      </div>

      {/* Preferred Categories */}
      {profile.preferred_categories && profile.preferred_categories.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 p-4 mb-4">
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">Interessengebiete</p>
          <div className="flex flex-wrap gap-2">
            {profile.preferred_categories.map((cat: string) => (
              <span
                key={cat}
                className="text-[12px] font-medium bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-400 px-2.5 py-1 rounded-full"
              >
                {getCategoryLabel(cat)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Role badge */}
      <div className="text-center">
        <span className="text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full">
          {profile.role === 'admin' ? 'Admin' : 'Fachkraft'}
        </span>
      </div>
      </div>
    </div>
  );
}
