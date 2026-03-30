'use client';

import { useState, useTransition } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { clsx } from 'clsx';
import { createChannelPost } from '@/lib/actions/community';
import { EVIDENCE_CONFIG } from '@/lib/evidence';
import type { Channel, ChannelPost, EvidenceLevel } from '@/types/database';

interface Props {
  channel: Channel;
  posts: ChannelPost[];
  userId: string | null;
  onBack: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'gerade eben';
  if (mins < 60) return `vor ${mins} Min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `vor ${hours} Std`;
  const days = Math.floor(hours / 24);
  return `vor ${days} Tagen`;
}

export default function ChannelDetail({ channel, posts, userId, onBack }: Props) {
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [localPosts, setLocalPosts] = useState(posts);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim() || !userId) return;

    const tempPost: ChannelPost = {
      id: `temp-${Date.now()}`,
      channel_id: channel.id,
      user_id: userId,
      body: body.trim(),
      news_card_id: null,
      parent_post_id: null,
      created_at: new Date().toISOString(),
      profile: { id: userId, full_name: 'Du', avatar_url: null, role: 'therapist' },
    };

    setLocalPosts(prev => [tempPost, ...prev]);
    const submittedBody = body.trim();
    setBody('');

    startTransition(async () => {
      await createChannelPost(channel.id, submittedBody);
    });
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          <ArrowLeft size={16} className="text-slate-600 dark:text-slate-400" />
        </button>
        <span className="text-xl">{channel.emoji}</span>
        <div>
          <h2 className="font-bold text-[15px] text-slate-800 dark:text-slate-200">{channel.name}</h2>
          <p className="text-[11px] text-slate-400">{channel.member_count} Mitglieder</p>
        </div>
      </div>

      {/* Post input */}
      {userId && channel.is_member && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Beitrag schreiben..."
              className="flex-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40 focus:border-forest-200"
            />
            <button
              type="submit"
              disabled={isPending || !body.trim()}
              className="w-10 h-10 rounded-xl bg-forest-700 text-white flex items-center justify-center hover:bg-forest-800 disabled:opacity-50 transition-colors"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      )}

      {!userId && (
        <p className="text-[12px] text-slate-400 text-center mb-4 bg-slate-50 dark:bg-slate-800 rounded-xl py-3">
          Melde dich an, um mitzudiskutieren
        </p>
      )}

      {userId && !channel.is_member && (
        <p className="text-[12px] text-slate-400 text-center mb-4 bg-slate-50 dark:bg-slate-800 rounded-xl py-3">
          Tritt dem Kanal bei, um Beiträge zu schreiben
        </p>
      )}

      {/* Posts */}
      <div className="space-y-3">
        {localPosts.length === 0 && (
          <p className="text-center text-[13px] text-slate-400 py-8">
            Noch keine Beiträge. Sei der Erste!
          </p>
        )}
        {localPosts.map(post => {
          const evidence = post.news_card?.evidence_level
            ? EVIDENCE_CONFIG[post.news_card.evidence_level as EvidenceLevel]
            : null;

          return (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              {/* Author */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0">
                  {post.profile?.avatar_url ? (
                    <img src={post.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[11px] font-bold text-forest-700 dark:text-forest-400">
                      {(post.profile?.full_name || '?')[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">
                    {post.profile?.full_name ?? 'Anonym'}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-2">
                    {timeAgo(post.created_at)}
                  </span>
                </div>
              </div>

              {/* Body */}
              <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{post.body}</p>

              {/* Shared news card reference */}
              {post.news_card && (
                <div className="mt-2 bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2 border border-slate-100 dark:border-slate-600">
                  <p className="text-[11px] text-slate-400 mb-0.5">Geteilter Artikel:</p>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{post.news_card.headline}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-slate-400">{post.news_card.source_name}</span>
                    {evidence && (
                      <span className={clsx('text-[10px] px-1.5 py-0.5 rounded-full', evidence.color)}>
                        {evidence.icon} {evidence.label}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Reply count */}
              {(post.reply_count ?? 0) > 0 && (
                <p className="text-[11px] text-forest-600 font-medium mt-2">
                  {post.reply_count} Antworten
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
