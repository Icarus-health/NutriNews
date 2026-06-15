'use client';

import { useState, useTransition, useEffect } from 'react';
import { Bookmark, FolderOpen, Plus, X, Clock, Loader2, ChevronDown, ChevronRight, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import NewsCardComponent from '@/components/news/NewsCard';
import { createCollection, deleteCollection, getCardsByIds, getCollectionItems } from '@/lib/actions/news';
import { useUX } from '@/components/providers/UXProvider';
import { useToast } from '@/components/ui/Toast';
import type { NewsCard, Collection } from '@/types/database';

const COLLECTION_EMOJIS = ['📁', '🥗', '💊', '🧪', '🫀', '🧬', '📋', '⭐', '🔬', '🏥', '🌿', '🍎'];

interface Props {
  cards: NewsCard[];
  collections: Collection[];
  userId: string | null;
}

function CollectionRow({ col, userId, onDelete, toast }: { col: Collection; userId: string | null; onDelete: (id: string) => void; toast: (msg: string, type?: 'success' | 'error' | 'info') => void }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<NewsCard[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();

  async function handleToggle() {
    setExpanded(p => !p);
    if (items !== null) return;
    setLoading(true);
    const result = await getCollectionItems(col.id);
    setItems(result as NewsCard[]);
    setLoading(false);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      // Auto-reset confirmation after 3 s if user doesn't proceed
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    startDeleteTransition(async () => {
      const result = await deleteCollection(col.id);
      if (result.error) {
        toast(result.error, 'error');
      } else {
        onDelete(col.id);
        toast(`"${col.name}" gelöscht`);
      }
    });
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center gap-3 p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
      >
        <span className="text-xl flex-shrink-0">{col.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{col.name}</p>
          <p className="text-xs text-slate-400">
            {items !== null
              ? `${items.length} Artikel`
              : `Erstellt am ${new Date(col.created_at).toLocaleDateString('de-DE')}`}
          </p>
        </div>
        {loading ? (
          <Loader2 size={16} className="animate-spin text-slate-400 flex-shrink-0" />
        ) : expanded ? (
          <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
        )}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className={clsx(
            'flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors ml-1',
            confirmDelete
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
              : 'text-slate-300 dark:text-slate-600 hover:text-red-400 dark:hover:text-red-500'
          )}
        >
          {isDeleting ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <Trash2 size={12} />
          )}
          {confirmDelete && <span>Löschen?</span>}
        </button>
      </button>

      {expanded && items !== null && (
        <div className="border-t border-slate-100 dark:border-slate-700">
          {items.length === 0 ? (
            <p className="text-xs text-slate-400 px-4 py-4 text-center">
              Noch keine Artikel in dieser Sammlung.<br />
              Tippe auf der Rückseite einer Karte auf „Zur Sammlung hinzufügen".
            </p>
          ) : (
            <div className="px-3 pt-3">
              {items.map(card => (
                <NewsCardComponent key={card.id} card={card} userId={userId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SavedPage({ cards, collections: initialCollections, userId }: Props) {
  const ux = useUX();
  const { toast } = useToast();
  const [tab, setTab] = useState<'bookmarks' | 'collections' | 'readlater'>('bookmarks');
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [readLaterCards, setReadLaterCards] = useState<NewsCard[]>([]);
  const [readLaterLoading, setReadLaterLoading] = useState(false);

  // Fetch read-later cards when tab is activated
  useEffect(() => {
    if (tab !== 'readlater' || readLaterCards.length > 0 || ux.readLaterQueue.length === 0) return;
    setReadLaterLoading(true);
    getCardsByIds(ux.readLaterQueue).then(data => {
      setReadLaterCards(data as NewsCard[]);
      setReadLaterLoading(false);
    });
  }, [tab, ux.readLaterQueue, readLaterCards.length]);

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('📁');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCreate() {
    if (!newName.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createCollection(newName, newEmoji);
      if (result.error) {
        setError(result.error);
      } else {
        const created = {
          id: result.id ?? crypto.randomUUID(),
          user_id: userId ?? '',
          name: newName.trim(),
          emoji: newEmoji,
          created_at: new Date().toISOString(),
        } as Collection;
        setCollections(prev => [created, ...prev]);
        toast(`${newEmoji} "${newName.trim()}" erstellt`);
        setNewName('');
        setNewEmoji('📁');
        setShowNewForm(false);
      }
    });
  }

  return (
    <div>
      <header className="sticky top-0 z-10 glass-strong border-b border-slate-200/60 dark:border-slate-700/60 safe-top">
        <div className="px-5 py-3">
          <h1 className="text-[17px] font-bold text-slate-900 dark:text-slate-100 tracking-tight">Gespeichert</h1>
        </div>
      </header>
      <div className="px-4 pt-3 mb-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setTab('bookmarks')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === 'bookmarks'
                ? 'bg-forest-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            <Bookmark size={14} />
            Lesezeichen ({cards.length})
          </button>
          <button
            onClick={() => setTab('readlater')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === 'readlater'
                ? 'bg-forest-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            <Clock size={14} />
            Später lesen ({ux.readLaterQueue.length})
          </button>
          <button
            onClick={() => setTab('collections')}
            className={clsx(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              tab === 'collections'
                ? 'bg-forest-700 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            <FolderOpen size={14} />
            Sammlungen ({collections.length})
          </button>
        </div>
      </div>

      {tab === 'bookmarks' && (
        <div className="px-3">
          {cards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Bookmark size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Noch keine Lesezeichen.</p>
              <p className="text-xs mt-1 text-center">Tippe auf das Lesezeichen-Symbol bei einer News-Karte.</p>
            </div>
          ) : (
            cards.map(card => (
              <NewsCardComponent
                key={card.id}
                card={{ ...card, user_has_bookmarked: true }}
                userId={userId}
              />
            ))
          )}
        </div>
      )}

      {tab === 'readlater' && (
        <div className="px-3">
          {readLaterLoading ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="animate-spin" />
            </div>
          ) : ux.readLaterQueue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Clock size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Noch nichts in der Leseliste.</p>
              <p className="text-xs mt-1 text-center">Tippe auf das Uhr-Symbol auf der Rückseite einer News-Karte.</p>
            </div>
          ) : (
            readLaterCards
              .filter(c => ux.readLaterQueue.includes(c.id))
              .map(card => (
                <NewsCardComponent
                  key={card.id}
                  card={card}
                  userId={userId}
                />
              ))
          )}
        </div>
      )}

      {tab === 'collections' && (
        <div className="px-4">
          {/* New collection button */}
          {userId && !showNewForm && (
            <button
              onClick={() => setShowNewForm(true)}
              className="w-full flex items-center justify-center gap-2 py-3 mb-3 rounded-xl border-2 border-dashed border-forest-200 dark:border-forest-800 text-forest-600 dark:text-forest-400 text-sm font-semibold hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-colors"
            >
              <Plus size={16} />
              Neue Sammlung erstellen
            </button>
          )}

          {/* New collection form */}
          {showNewForm && (
            <div className="mb-3 bg-white dark:bg-slate-800 rounded-xl border border-forest-200 dark:border-forest-700 p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Neue Sammlung</p>
                <button
                  onClick={() => { setShowNewForm(false); setError(null); }}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {COLLECTION_EMOJIS.map(em => (
                  <button
                    key={em}
                    onClick={() => setNewEmoji(em)}
                    className={clsx(
                      'w-9 h-9 rounded-lg text-lg transition-colors',
                      newEmoji === em
                        ? 'bg-forest-100 dark:bg-forest-900/40 ring-2 ring-forest-500'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600'
                    )}
                  >
                    {em}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="z.B. GLP-1 Studien, Diabetespatienten…"
                maxLength={50}
                autoFocus
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-forest-500/40 mb-3"
              />

              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}

              <button
                onClick={handleCreate}
                disabled={!newName.trim() || isPending}
                className="w-full bg-forest-700 text-white rounded-lg py-2 text-sm font-semibold hover:bg-forest-800 disabled:opacity-40 transition-colors"
              >
                {isPending ? 'Erstelle…' : `${newEmoji} Sammlung erstellen`}
              </button>
            </div>
          )}

          {collections.length === 0 && !showNewForm ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FolderOpen size={40} className="mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Noch keine Sammlungen.</p>
              <p className="text-xs mt-1 text-center">Sammlungen helfen dir, News thematisch zu ordnen — z.B. nach Krankheitsbild oder Patientengruppe.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map(col => (
                <CollectionRow
                  key={col.id}
                  col={col}
                  userId={userId}
                  onDelete={(id) => setCollections(prev => prev.filter(c => c.id !== id))}
                  toast={toast}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
