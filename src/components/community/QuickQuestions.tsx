'use client';

import { useState, useTransition } from 'react';
import { HelpCircle, MessageCircle, Users, ChevronDown, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { createQuickQuestion, answerQuickQuestion, markSameQuestion } from '@/lib/actions/community';
import { CATEGORIES } from '@/lib/categories';
import type { QuickQuestion, QuickAnswer } from '@/types/database';

interface Props {
  questions: QuickQuestion[];
  userId: string | null;
  initialAnswers?: Record<string, QuickAnswer[]>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  return `vor ${days}d`;
}

export default function QuickQuestions({ questions, userId, initialAnswers }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [newCategory, setNewCategory] = useState<string>(CATEGORIES[0]?.id ?? '');
  const [newBody, setNewBody] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [answerBody, setAnswerBody] = useState('');
  const [answers, setAnswers] = useState<Record<string, QuickAnswer[]>>(initialAnswers ?? {});
  const [isPending, startTransition] = useTransition();
  const [localQuestions, setLocalQuestions] = useState(questions);

  function handleSubmitQuestion(e: React.FormEvent) {
    e.preventDefault();
    if (!newBody.trim() || !userId) return;

    const temp: QuickQuestion = {
      id: `temp-${Date.now()}`,
      user_id: userId,
      category: newCategory,
      body: newBody.trim(),
      answer_count: 0,
      same_question_count: 0,
      created_at: new Date().toISOString(),
    };

    setLocalQuestions(prev => [temp, ...prev]);
    const submittedBody = newBody.trim();
    const submittedCategory = newCategory;
    setNewBody('');
    setShowForm(false);

    startTransition(async () => {
      await createQuickQuestion(submittedCategory, submittedBody);
    });
  }

  function handleSameQuestion(questionId: string) {
    if (!userId) return;
    setLocalQuestions(prev => prev.map(q =>
      q.id === questionId
        ? { ...q, same_question_count: (q.same_question_count ?? 0) + 1, user_has_same_question: true }
        : q
    ));
    startTransition(async () => {
      await markSameQuestion(questionId);
    });
  }

  function handleSubmitAnswer(e: React.FormEvent, questionId: string) {
    e.preventDefault();
    if (!answerBody.trim() || !userId) return;

    const tempAnswer: QuickAnswer = {
      id: `temp-${Date.now()}`,
      question_id: questionId,
      user_id: userId,
      body: answerBody.trim(),
      created_at: new Date().toISOString(),
      profile: { id: userId, full_name: 'Du', avatar_url: null },
    };

    setAnswers(prev => ({
      ...prev,
      [questionId]: [...(prev[questionId] ?? []), tempAnswer],
    }));
    setLocalQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, answer_count: (q.answer_count ?? 0) + 1 } : q
    ));

    const submittedBody = answerBody.trim();
    setAnswerBody('');

    startTransition(async () => {
      await answerQuickQuestion(questionId, submittedBody);
    });
  }

  return (
    <div>
      {/* Header + New Question */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-forest-600" />
          <h2 className="font-bold text-[15px] text-slate-800 dark:text-slate-200">Schnellfragen</h2>
        </div>
        {userId && (
          <button
            onClick={() => setShowForm(f => !f)}
            className="text-[12px] font-semibold text-forest-700 dark:text-forest-400 bg-forest-50 dark:bg-forest-900/30 px-3 py-1.5 rounded-full hover:bg-forest-100 dark:hover:bg-forest-900/50 transition-colors"
          >
            + Frage stellen
          </button>
        )}
      </div>

      {/* New question form */}
      {showForm && (
        <form onSubmit={handleSubmitQuestion} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 mb-4 animate-fade-in">
          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 mb-2 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
          >
            {CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <textarea
            value={newBody}
            onChange={e => setNewBody(e.target.value)}
            placeholder="Deine Fachfrage (ohne Patientenbezug)..."
            rows={3}
            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 mb-2 focus:outline-none focus:ring-2 focus:ring-forest-500/40 resize-none"
          />
          <button
            type="submit"
            disabled={isPending || !newBody.trim()}
            className="w-full bg-forest-700 text-white rounded-lg py-2 text-[13px] font-semibold hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            Frage veröffentlichen
          </button>
        </form>
      )}

      {/* Questions list */}
      <div className="space-y-3">
        {localQuestions.length === 0 && (
          <p className="text-center text-[13px] text-slate-400 py-8">
            Noch keine Fragen. Stelle die erste!
          </p>
        )}
        {localQuestions.map(q => (
          <div key={q.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 bg-slate-50 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                {q.category}
              </span>
              <span className="text-[10px] text-slate-300">{timeAgo(q.created_at)}</span>
            </div>

            {/* Question body */}
            <p className="text-[13px] text-slate-800 dark:text-slate-200 leading-relaxed mb-3">
              &ldquo;{q.body}&rdquo;
            </p>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                className="flex items-center gap-1 text-[11px] text-forest-600 font-semibold"
              >
                <MessageCircle size={13} />
                {q.answer_count ?? 0} Antworten
                <ChevronDown size={12} className={clsx('transition-transform', expandedId === q.id && 'rotate-180')} />
              </button>
              {userId && !q.user_has_same_question && (
                <button
                  onClick={() => handleSameQuestion(q.id)}
                  disabled={isPending}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <Users size={13} />
                  {(q.same_question_count ?? 0) > 0 && `${q.same_question_count} `}
                  Gleiche Frage
                </button>
              )}
              {q.user_has_same_question && (
                <span className="flex items-center gap-1 text-[11px] text-forest-600">
                  <Users size={13} /> {q.same_question_count} haben dieselbe Frage
                </span>
              )}
            </div>

            {/* Expanded: answers + answer form */}
            {expandedId === q.id && (
              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 animate-fade-in">
                {(answers[q.id] ?? []).map(a => (
                  <div key={a.id} className="mb-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        {a.profile?.full_name ?? 'Anonym'}
                      </span>
                      <span className="text-[10px] text-slate-300">{timeAgo(a.created_at)}</span>
                    </div>
                    <p className="text-[12px] text-slate-700 dark:text-slate-300">{a.body}</p>
                  </div>
                ))}

                {userId && (
                  <form onSubmit={(e) => handleSubmitAnswer(e, q.id)} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={answerBody}
                      onChange={e => setAnswerBody(e.target.value)}
                      placeholder="Antwort schreiben..."
                      className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-[12px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
                    />
                    <button
                      type="submit"
                      disabled={isPending || !answerBody.trim()}
                      className="w-8 h-8 rounded-lg bg-forest-700 text-white flex items-center justify-center disabled:opacity-50"
                    >
                      <Send size={13} />
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
