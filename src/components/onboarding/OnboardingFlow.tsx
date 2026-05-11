'use client';

import { useState, useEffect, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { updateProfile } from '@/lib/actions/news';
import { CATEGORIES } from '@/lib/categories';
import { clsx } from 'clsx';
import type { TherapistSetting } from '@/types/database';

const STORAGE_KEY = 'nn-onboarding-done';

const SETTINGS: { id: TherapistSetting; label: string; emoji: string }[] = [
  { id: 'akutklinik',      label: 'Akutklinik / Intensiv',      emoji: '🏥' },
  { id: 'rehabilitation',  label: 'Rehabilitation',              emoji: '🔄' },
  { id: 'ambulant',        label: 'Ambulante Praxis',            emoji: '🏠' },
  { id: 'psychiatrie',     label: 'Psychiatrie / Psychosomatik', emoji: '🧠' },
  { id: 'langzeitpflege',  label: 'Langzeitpflege / Geriatrie',  emoji: '👴' },
  { id: 'praevention',     label: 'Prävention & Kursleitung',    emoji: '🌱' },
  { id: 'forschung_lehre', label: 'Forschung & Lehre',           emoji: '🔬' },
];

// A curated short list for onboarding (full list available in profile settings)
const ONBOARDING_CATEGORIES = CATEGORIES.filter(c => ![
  'Fortbildung & Lehre',
  'Laienpresse & Patientenfragen',
  'Internationale Perspektive',
  'Adipositas & Gewichtsmanagement', // overlaps with GLP-1
].includes(c.id));

interface Props {
  userId: string;
}

export default function OnboardingFlow({ userId }: Props) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [show, setShow] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<TherapistSetting | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === 'true') return;
    } catch { /* ignore */ }

    const supabase = createClient();
    supabase
      .from('profiles')
      .select('setting, preferred_categories')
      .eq('id', userId)
      .single()
      .then(({ data }) => {
        if (data && !data.setting && (!data.preferred_categories || data.preferred_categories.length === 0)) {
          setShow(true);
        } else {
          try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
        }
      });
  }, [userId]);

  function dismiss() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch { /* ignore */ }
    setShow(false);
  }

  function toggleCategory(id: string) {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  }

  function finish() {
    startTransition(async () => {
      await updateProfile({
        setting: selectedSetting ?? undefined,
        preferred_categories: selectedCategories,
      });
      dismiss();
    });
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={step === 1 ? dismiss : undefined}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl px-5 pt-5 pb-8 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-5">
          {([1, 2, 3] as const).map(s => (
            <div key={s} className={clsx(
              'h-1.5 rounded-full transition-all duration-300',
              step >= s ? 'bg-forest-600 w-6' : 'bg-slate-200 dark:bg-slate-700 w-3'
            )} />
          ))}
        </div>

        {/* ─── Step 1: Welcome ─── */}
        {step === 1 && (
          <div className="text-center space-y-4">
            <div className="text-5xl mb-2">🥗</div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Willkommen bei NutriNews
            </h2>
            <p className="text-[14px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              Täglich kuratierte Fachinhalte für Ernährungstherapeuten – evidenzbasiert, praxisnah, auf den Punkt.
            </p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500">
              Kurze Einrichtung damit dein Feed zu dir passt.
            </p>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-forest-700 hover:bg-forest-800 text-white rounded-2xl py-3 text-[15px] font-semibold transition-colors mt-2"
            >
              Los geht's →
            </button>
            <button
              onClick={dismiss}
              className="w-full text-slate-400 text-[13px] py-1 hover:text-slate-500 transition-colors"
            >
              Überspringen
            </button>
          </div>
        )}

        {/* ─── Step 2: Setting ─── */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Wo arbeitest du?
              </h2>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">
                Wir passen die Praxisrelevanz der Artikel daran an.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {SETTINGS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSetting(s.id)}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-3 rounded-xl border text-left text-[13px] font-medium transition-all',
                    selectedSetting === s.id
                      ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/20 text-forest-700 dark:text-forest-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-forest-300 dark:hover:border-forest-700'
                  )}
                >
                  <span className="text-lg shrink-0">{s.emoji}</span>
                  <span className="leading-tight">{s.label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(3)}
              disabled={!selectedSetting}
              className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-40 text-white rounded-2xl py-3 text-[15px] font-semibold transition-colors"
            >
              Weiter →
            </button>
          </div>
        )}

        {/* ─── Step 3: Categories ─── */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Welche Themen interessieren dich?
              </h2>
              <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-0.5">
                Wähle bis zu 5 Themen aus – du kannst das jederzeit im Profil ändern.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {ONBOARDING_CATEGORIES.map(cat => {
                const selected = selectedCategories.includes(cat.id);
                const atLimit = selectedCategories.length >= 5 && !selected;
                return (
                  <button
                    key={cat.id}
                    onClick={() => !atLimit && toggleCategory(cat.id)}
                    className={clsx(
                      'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                      selected
                        ? 'border-forest-500 bg-forest-50 dark:bg-forest-900/30 text-forest-700 dark:text-forest-300'
                        : atLimit
                          ? 'border-slate-100 dark:border-slate-700 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-forest-300'
                    )}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              {selectedCategories.length}/5 ausgewählt
              {selectedCategories.length === 0 && ' — du kannst auch alle Themen erhalten'}
            </p>

            <button
              onClick={finish}
              disabled={isPending}
              className="w-full bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white rounded-2xl py-3 text-[15px] font-semibold transition-colors flex items-center justify-center gap-2"
            >
              {isPending && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Feed personalisieren ✓
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
