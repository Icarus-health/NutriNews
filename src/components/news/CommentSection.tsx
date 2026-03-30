'use client';

import { useState, useTransition, useEffect } from 'react';
import { Send, Trash2 } from 'lucide-react';
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
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    getComments(newsCardId).then((data) => {
      if (!cancelled) {
        setComments(data as unknown as CommentData[]);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [newsCardId]);

  function handleSubmit() {
    if (!userId) { onRequireAuth?.(); return; }
    if (!body.trim()) return;

    const optimisticComment: CommentData = {
      id: `temp-${Date.now()}`,
      body: body.trim(),
      created_at: new Date().toISOString(),
      user_id: userId,
      profiles: { full_name: 'Du', avatar_url: null },
    };
    setComments(prev => [...prev, optimisticComment]);
    const savedBody = body;
    setBody('');

    startTransition(async () => {
      const result = await addComment(newsCardId, savedBody);
      if (result.error) {
        setComments(prev => prev.filter(c => c.id !== optimisticComment.id));
      } else {
        // Reload to get real ID
        const fresh = await getComments(newsCardId);
        setComments(fresh as unknown as CommentData[]);
      }
    });
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

  return (
    <div className="border-t border-slate-100 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500 mb-2">
        Kommentare {!loading && `(${comments.length})`}
      </p>

      {loading ? (
        <div className="flex gap-2 items-center py-2">
          <div className="w-6 h-6 rounded-full bg-slate-100 animate-pulse" />
          <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-400 py-1">Noch keine Kommentare.</p>
      ) : (
        <div className="space-y-2 mb-3 max-h-60 overflow-y-auto">
          {comments.map(c => (
            <div key={c.id} className="flex gap-2 group">
              <div className="w-6 h-6 rounded-full bg-forest-100 flex items-center justify-center text-xs font-bold text-forest-700 flex-shrink-0 mt-0.5">
                {(c.profiles?.full_name || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-semibold text-slate-700">{c.profiles?.full_name || 'Anonym'}</span>
                  <span className="text-xs text-slate-400">{formatTime(c.created_at)}</span>
                  {c.user_id === userId && (
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-opacity ml-auto"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600">{c.body}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {userId && (
        <div className="flex gap-2 items-end">
          <input
            type="text"
            placeholder="Kommentar schreiben..."
            value={body}
            onChange={e => setBody(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-forest-500"
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
