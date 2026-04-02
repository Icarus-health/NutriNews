'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Send, Reply, ChevronDown, ChevronUp } from 'lucide-react';
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
  return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
}

export default function ChannelDetail({ channel, posts, userId, onBack }: Props) {
  const router = useRouter();
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<ChannelPost | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const [replies, setReplies] = useState<Record<string, ChannelPost[]>>({});
  const [isPending, startTransition] = useTransition();
  const [localPosts, setLocalPosts] = useState(posts);

  // Sync with server data when props change (e.g. after router.refresh())
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

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
      router.refresh();
    });
  }

  function handleReplySubmit(e: React.FormEvent, parentPost: ChannelPost) {
    e.preventDefault();
    if (!replyBody.trim() || !userId) return;

    const tempReply: ChannelPost = {
      id: `temp-reply-${Date.now()}`,
      channel_id: channel.id,
      user_id: userId,
      body: replyBody.trim(),
      news_card_id: null,
      parent_post_id: parentPost.id,
      created_at: new Date().toISOString(),
      profile: { id: userId, full_name: 'Du', avatar_url: null, role: 'therapist' },
    };

    setReplies(prev => ({
      ...prev,
      [parentPost.id]: [...(prev[parentPost.id] ?? []), tempReply],
    }));
    setLocalPosts(prev => prev.map(p =>
      p.id === parentPost.id ? { ...p, reply_count: (p.reply_count ?? 0) + 1 } : p
    ));
    setExpandedReplies(prev => new Set(prev).add(parentPost.id));

    const submittedBody = replyBody.trim();
    setReplyBody('');
    setReplyTo(null);

    startTransition(async () => {
      await createChannelPost(channel.id, submittedBody, undefined, parentPost.id);
      router.refresh();
    });
  }

  function toggleReplies(postId: string) {
    setExpandedReplies(prev => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId); else next.add(postId);
      return next;
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
      {userId && (
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
          const postReplies = replies[post.id] ?? [];
          const replyCount = (post.reply_count ?? 0);
          const isExpanded = expandedReplies.has(post.id);
          const isReplying = replyTo?.id === post.id;

          return (
            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
              {/* Author */}
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center flex-shrink-0">
                  {post.profile?.avatar_url ? (
                    <Image src={post.profile.avatar_url} alt="" className="w-full h-full rounded-full object-cover" width={28} height={28} unoptimized />
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

              {/* Actions: Reply + Show Replies */}
              <div className="flex items-center gap-3 mt-2">
                {userId && (
                  <button
                    onClick={() => { setReplyTo(isReplying ? null : post); if (!isReplying) setReplyBody(''); }}
                    className={clsx(
                      'flex items-center gap-1 text-[11px] font-semibold transition-colors',
                      isReplying ? 'text-forest-600' : 'text-slate-400 hover:text-forest-600'
                    )}
                  >
                    <Reply size={13} />
                    Antworten
                  </button>
                )}
                {(replyCount > 0 || postReplies.length > 0) && (
                  <button
                    onClick={() => toggleReplies(post.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-forest-600"
                  >
                    {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {Math.max(replyCount, postReplies.length)} Antworten
                  </button>
                )}
              </div>

              {/* Reply form (inline) */}
              {isReplying && (
                <form onSubmit={(e) => handleReplySubmit(e, post)} className="flex gap-2 mt-3 animate-fade-in">
                  <input
                    type="text"
                    value={replyBody}
                    onChange={e => setReplyBody(e.target.value)}
                    placeholder={`Antwort an ${post.profile?.full_name ?? 'Anonym'}...`}
                    autoFocus
                    className="flex-1 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1.5 text-[12px] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !replyBody.trim()}
                    className="w-8 h-8 rounded-lg bg-forest-700 text-white flex items-center justify-center disabled:opacity-50"
                  >
                    <Send size={13} />
                  </button>
                </form>
              )}

              {/* Replies (1 level deep) */}
              {isExpanded && postReplies.length > 0 && (
                <div className="mt-3 pl-4 border-l-2 border-forest-100 dark:border-forest-900/40 space-y-2 animate-fade-in">
                  {postReplies.map(reply => (
                    <div key={reply.id} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                          {reply.profile?.full_name ?? 'Anonym'}
                        </span>
                        <span className="text-[10px] text-slate-300">{timeAgo(reply.created_at)}</span>
                      </div>
                      <p className="text-[12px] text-slate-700 dark:text-slate-300">{reply.body}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
