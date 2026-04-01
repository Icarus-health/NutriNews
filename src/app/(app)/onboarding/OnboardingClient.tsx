'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Stethoscope, Tags, Users, ArrowRight, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { CATEGORIES } from '@/lib/categories';
import { updateProfile } from '@/lib/actions/news';
import { joinChannel } from '@/lib/actions/community';
import type { TherapistSetting, Channel } from '@/types/database';

const SETTINGS: { id: TherapistSetting; label: string; description: string; emoji: string }[] = [
  { id: 'akutklinik', label: 'Akutklinik', description: 'Stationäre Versorgung, Intensiv', emoji: '🏥' },
  { id: 'rehabilitation', label: 'Rehabilitation', description: 'Reha-Einrichtungen', emoji: '🏋️' },
  { id: 'ambulant', label: 'Ambulante Praxis', description: 'Freiberufliche Ernährungstherapie', emoji: '🏠' },
  { id: 'psychiatrie', label: 'Psychiatrische Einrichtung', description: 'Psychiatrie, Psychosomatik', emoji: '🧠' },
  { id: 'langzeitpflege', label: 'Langzeitpflege', description: 'Pflegeheime, Geriatrie', emoji: '🧓' },
  { id: 'praevention', label: 'Prävention', description: 'Gesundheitsförderung, Kursleitung', emoji: '🍏' },
  { id: 'forschung_lehre', label: 'Forschung & Lehre', description: 'Hochschule, Wissenschaft', emoji: '🔬' },
];

const STEPS = [
  { title: 'Arbeitsumfeld', subtitle: 'Wo arbeitest du?', icon: Stethoscope },
  { title: 'Themen', subtitle: 'Was interessiert dich?', icon: Tags },
  { title: 'Community', subtitle: 'Vernetze dich', icon: Users },
] as const;

interface Props {
  channels: Pick<Channel, 'id' | 'slug' | 'name' | 'emoji' | 'description'>[];
}

export default function OnboardingClient({ channels }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [setting, setSetting] = useState<TherapistSetting | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggleCategory(catId: string) {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  }

  function handleNext() {
    if (step < 2) {
      setStep(step + 1);
    } else {
      handleFinish();
    }
  }

  function handleFinish() {
    startTransition(async () => {
      await updateProfile({
        setting: setting ?? undefined,
        preferred_categories: selectedCategories,
      });

      if (selectedChannel) {
        await joinChannel(selectedChannel);
      }

      router.push('/');
      router.refresh();
    });
  }

  const canProceed =
    step === 0 ? setting !== null :
    step === 1 ? selectedCategories.length >= 1 :
    true;

  return (
    <div className="min-h-screen flex flex-col px-4 pt-8 pb-24">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center gap-2 flex-1">
            <div className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-colors',
              i < step ? 'bg-forest-700 text-white' :
              i === step ? 'bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 ring-2 ring-forest-300 dark:ring-forest-700' :
              'bg-slate-100 dark:bg-slate-700 text-slate-400'
            )}>
              {i < step ? <Check size={14} /> : i + 1}
            </div>
            {i < STEPS.length - 1 && (
              <div className={clsx(
                'flex-1 h-0.5 rounded-full transition-colors',
                i < step ? 'bg-forest-700' : 'bg-slate-200 dark:bg-slate-700'
              )} />
            )}
          </div>
        ))}
      </div>

      {/* Step header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          {STEPS[step].title}
        </h1>
        <p className="text-[14px] text-slate-400 mt-1">{STEPS[step].subtitle}</p>
      </div>

      {/* Step 1: Setting */}
      {step === 0 && (
        <div className="space-y-3 animate-fade-in">
          {SETTINGS.map(s => (
            <button
              key={s.id}
              onClick={() => setSetting(s.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all border',
                setting === s.id
                  ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-300 dark:border-forest-700 ring-1 ring-forest-300 dark:ring-forest-700'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600'
              )}
            >
              <span className="text-xl">{s.emoji}</span>
              <div>
                <p className={clsx(
                  'text-[14px] font-semibold',
                  setting === s.id ? 'text-forest-700 dark:text-forest-400' : 'text-slate-700 dark:text-slate-300'
                )}>
                  {s.label}
                </p>
                <p className="text-[12px] text-slate-400 mt-0.5">{s.description}</p>
              </div>
              {setting === s.id && (
                <Check size={18} className="ml-auto text-forest-600 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Categories */}
      {step === 1 && (
        <div className="animate-fade-in">
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">
            Wähle mindestens 1 Thema, das dich besonders interessiert. Du kannst sie später jederzeit ändern.
          </p>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={clsx(
                  'px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all border',
                  selectedCategories.includes(cat.id)
                    ? 'bg-forest-700 text-white border-forest-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                )}
              >
                {selectedCategories.includes(cat.id) && <Check size={12} className="inline mr-1" />}
                {cat.label}
              </button>
            ))}
          </div>
          {selectedCategories.length > 0 && (
            <p className="text-[12px] text-forest-600 mt-3 font-medium">
              {selectedCategories.length} Themen ausgewählt
            </p>
          )}
        </div>
      )}

      {/* Step 3: Join a channel */}
      {step === 2 && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">
            Tritt einer Fachgruppe bei, um dich mit Kolleg:innen auszutauschen. Optional — du kannst auch später beitreten.
          </p>
          {channels.length > 0 ? channels.map(ch => (
            <button
              key={ch.id}
              onClick={() => setSelectedChannel(selectedChannel === ch.id ? null : ch.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all border',
                selectedChannel === ch.id
                  ? 'bg-forest-50 dark:bg-forest-900/20 border-forest-300 dark:border-forest-700'
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'
              )}
            >
              <span className="text-lg">{ch.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{ch.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{ch.description}</p>
              </div>
              {selectedChannel === ch.id && <Check size={16} className="text-forest-600 flex-shrink-0" />}
            </button>
          )) : (
            <p className="text-[13px] text-slate-400 text-center py-6">
              Fachgruppen werden nach dem Start eingerichtet.
            </p>
          )}
        </div>
      )}

      {/* Navigation buttons */}
      <div className="fixed bottom-0 left-0 right-0 max-w-2xl mx-auto p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 rounded-xl text-[14px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Zurück
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!canProceed || isPending}
            className={clsx(
              'flex-1 py-3 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-colors',
              canProceed
                ? 'bg-forest-700 hover:bg-forest-800'
                : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed',
              isPending && 'opacity-60'
            )}
          >
            {isPending ? 'Wird gespeichert...' : step === 2 ? 'Los geht\'s' : 'Weiter'}
            {!isPending && <ArrowRight size={16} />}
          </button>
        </div>
        {step === 2 && !selectedChannel && (
          <button
            onClick={handleFinish}
            disabled={isPending}
            className="w-full mt-2 text-[13px] text-slate-400 hover:text-slate-600 transition-colors py-1"
          >
            Überspringen
          </button>
        )}
      </div>
    </div>
  );
}
