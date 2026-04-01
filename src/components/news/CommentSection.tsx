'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { Send, Trash2, Reply } from 'lucide-react';
import { addComment, deleteComment, getComments } from '@/lib/actions/news';

interface CommentData {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { full_name: string | null; avatar_url: string | null } | null;
}

interface Props {
  newsCardId: string;
  userId: string | null;
  onRequireAuth?: () => void;
}

export default function CommentSection({ newsCardId, userId, onRequireAuth }: Props) {
  const [comments, setComments] = useState<CommentData[]>([]);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<CommentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const mountedRef = useRef(true);
  // Track pending comments that haven't been confirmed by the server yet
  const pendingRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    mountedRef.current = true;
    loadComments();
    return () => { mountedRef.current = false; };
  }, [newsCardId]);

  async function loadComments() {
    try {
      const data = await getComments(newsCardId);
      if (mountedRef.current) {
        setComments(data as unknown as CommentData[]);
        setLoading(false);
      }
    } catch {
      if (mountedRef.current) setLoading(false);
    }
  }

  function handleSubmit() {
    if (!userId) { onRequireAuth?.(); return; }
    if (!body.trim()) return;

    // Prepend @mention if replying
    const finalBody = replyTo
      ? `@${replyTo.profiles?.full_name ?? 'Anonym'} ${body.trim()}`
      : body.trim();

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentData = {
      id: tempId,
      body: finalBody,
      created_at: new Date().toISOString(),
      user_id: userId,
      profiles: { full_name: 'Du', avatar_url: null },
    };

    pendingRef.current.add(tempId);
    setComments(prev => [...prev, optimisticComment]);
    const savedBody = finalBody;
    setBody('');
    setReplyTo(null);

    // Fire-and-forget with retry: save comment, then refresh
    (async () => {
      try {
        const result = await addComment(newsCardId, savedBody);
        pendingRef.current.delete(tempId);
        if (result.error) {
          if (mountedRef.current) {
            setComments(prev => prev.filter(c => c.id !== tempId));
          }
          return;
        }
        // Small delay to ensure DB write is committed, then refresh
        await new Promise(r => setTimeout(r, 300));
        if (mountedRef.current) {
          const fresh = await getComments(newsCardId);
          if (mountedRef.current) {
            setComments(fresh as unknown as CommentData[]);
          }
        }
      } catch {
        // On error, keep the optimistic comment visible rather than losing it
        pendingRef.current.delete(tempId);
      }
    })();
  }

  function handleDelete(commentId: string) {
    setComments(prev => prev.filter(c => c.id !== commentId));
    startTransition(async () => {
      await deleteComment(commentId);
    });
  }

  function formatTime(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'gerade eben';
    if (mins < 60) return `vor ${mins} Min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `vor ${hours} Std`;
    const days = Math.floor(hours / 24);
    return `vor ${days} Tag${days > 1 ? 'en' : ''}`;
  }

  // Render comment body with @mention highlighted
  function renderBody(text: string) {
    const mentionMatch = text.match(/^@(\S+(?:\s\S+)?)\s/);
    if (!mentionMatch) return <span>{text}</span>;
    const mention = mentionMatch[1];
    const rest = text.slice(mentionMatch[0].length);
    return (
      <>
        <span className="text-forest-600 dark:text-forest-400 font-semibold">@{mention}</span>{' '}
        <span>{rest}</span>
      </>
    );
  }

  return (
    <div className="border-t border-slate-100 dark:border-slate-700 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
        Kommentare {!loading && `(${comments.length})`}
      </p>

      {loading ? (
        <div className="flex gap-2 items-center py-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 animate-pulse" />
          <div className="h-3 w-32 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 py-1">Noch keine Kommentare.</p>
      ) : (
        <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 group">
              <div className="w-6 h-6 rounded-full bg-forest-100 dark:bg-forest-900/30 flex items-center justify-center text-xs font-bold text-forest-700 dark:text-forest-400 flex-shrink-0 mt-0.5">
                {(c.profiles?.full_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.profiles?.full_name || 'Anonym'}</span>
                  <span className="text-xs text-slate-400">{formatTime(c.created_at)}</span>
                  {userId && c.user_id !== userId && (
                    <button
                      onClick={() => setReplyTo(c)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-forest-500 transition-opacity"
                      title="Antworten"
                    >
                      <Reply size={12} />
                    </button>
                  )}
                  {c.user_id === userId && !c.id.startsWith('temp-') && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity ml-auto"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{renderBody(c.body)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 mb-1.5 animate-fade-in">
          <span className="text-[11px] text-forest-600 dark:text-forest-400 font-medium">
            Antwort an {replyTo.profiles?.full_name ?? 'Anonym'}
          </span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-[10px] text-slate-400 hover:text-red-400"
          >
            Abbrechen
          </button>
        </div>
      )}

      {userId && (
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder={replyTo ? `Antwort an ${replyTo.profiles?.full_name ?? 'Anonym'}...` : 'Kommentar schreiben...'}
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            className="flex-1 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-forest-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!body.trim() || isPending}
            className="p-1.5 rounded-lg bg-forest-700 text-white disabled:opacity-40 hover:bg-forest-800 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
