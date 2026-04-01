'use client';

import { useState, useTransition } from 'react';
import { Users, MessageSquare, ChevronRight, LogIn, LogOut, Plus, X, Lock } from 'lucide-react';
import { clsx } from 'clsx';
import { joinChannel, leaveChannel, createChannel } from '@/lib/actions/community';
import type { Channel } from '@/types/database';

const EMOJI_OPTIONS = ['💬', '🏥', '🔬', '🍏', '💊', '🧠', '🏋️', '👶', '🧓', '🎗️', '📊', '⚖️', '🌍', '🥗'];

interface Props {
  channels: Channel[];
  userId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelList({ channels, userId, onSelectChannel }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localChannels, setLocalChannels] = useState(channels);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newEmoji, setNewEmoji] = useState('💬');
  const [newIsPrivate, setNewIsPrivate] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  function handleJoinLeave(e: React.MouseEvent, channel: Channel) {
    e.stopPropagation();
    if (!userId) return;

    const isMember = channel.is_member;
    setLocalChannels(prev => prev.map(c =>
      c.id === channel.id ? { ...c, is_member: !isMember, member_count: (c.member_count ?? 0) + (isMember ? -1 : 1) } : c
    ));

    startTransition(async () => {
      if (isMember) {
        await leaveChannel(channel.id);
      } else {
        await joinChannel(channel.id);
      }
    });
  }

  function handleCreateChannel(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreateError(null);

    startTransition(async () => {
      const result = await createChannel(newName, newDescription, newEmoji, newIsPrivate);
      if (result.error) {
        setCreateError(result.error);
        return;
      }
      // Add optimistic channel
      const tempChannel: Channel = {
        id: result.channelId!,
        slug: newName.toLowerCase().replace(/\s+/g, '-'),
        name: newName.trim(),
        description: newDescription.trim(),
        emoji: newEmoji,
        is_private: newIsPrivate,
        member_count: 1,
        post_count: 0,
        is_member: true,
        created_at: new Date().toISOString(),
      };
      setLocalChannels(prev => [...prev, tempChannel]);
      setNewName('');
      setNewDescription('');
      setNewEmoji('💬');
      setShowCreateForm(false);
    });
  }

  return (
    <div className="space-y-2">
      {/* Create channel button */}
      {userId && !showCreateForm && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-[13px] font-semibold text-slate-400 hover:text-forest-600 hover:border-forest-300 dark:hover:border-forest-700 transition-colors"
        >
          <Plus size={16} />
          Fachgruppe erstellen
        </button>
      )}

      {/* Create channel form */}
      {showCreateForm && (
        <form onSubmit={handleCreateChannel} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[14px] text-slate-800 dark:text-slate-200">Neue Fachgruppe</h3>
            <button type="button" onClick={() => { setShowCreateForm(false); setCreateError(null); }} className="text-slate-400 hover:text-slate-600">
              <X size={18} />
            </button>
          </div>

          {/* Emoji picker */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {EMOJI_OPTIONS.map(e => (
              <button
                key={e}
                type="button"
                onClick={() => setNewEmoji(e)}
                className={clsx(
                  'w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-all',
                  newEmoji === e
                    ? 'bg-forest-100 dark:bg-forest-900/30 ring-2 ring-forest-400'
                    : 'bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600'
                )}
              >
                {e}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Name der Fachgruppe"
            maxLength={60}
            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 mb-2 focus:outline-none focus:ring-2 focus:ring-forest-500/40"
          />
          <textarea
            value={newDescription}
            onChange={e => setNewDescription(e.target.value)}
            placeholder="Kurzbeschreibung (optional)"
            rows={2}
            maxLength={200}
            className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-[13px] text-slate-900 dark:text-slate-100 mb-2 focus:outline-none focus:ring-2 focus:ring-forest-500/40 resize-none"
          />

          {/* Private toggle */}
          <button
            type="button"
            onClick={() => setNewIsPrivate(p => !p)}
            className={clsx(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-2 border',
              newIsPrivate
                ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
            )}
          >
            <Lock size={14} />
            {newIsPrivate ? 'Geschlossene Gruppe — nur Mitglieder sehen Inhalte' : 'Öffentliche Gruppe — alle können lesen'}
          </button>

          {createError && (
            <p className="text-[12px] text-red-500 mb-2">{createError}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !newName.trim()}
            className="w-full bg-forest-700 text-white rounded-lg py-2 text-[13px] font-semibold hover:bg-forest-800 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Wird erstellt...' : 'Fachgruppe erstellen'}
          </button>
        </form>
      )}

      {localChannels.map(channel => {
        const isPrivateAndNotMember = channel.is_private && !channel.is_member;
        return (
        <button
          key={channel.id}
          onClick={() => {
            if (isPrivateAndNotMember) return; // Can't view private channels without joining
            onSelectChannel(channel.id);
          }}
          className={clsx(
            'w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 text-left transition-colors active:scale-[0.99]',
            isPrivateAndNotMember ? 'opacity-70' : 'hover:border-slate-200 dark:hover:border-slate-600'
          )}
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{channel.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="font-semibold text-[14px] text-slate-800 dark:text-slate-200 truncate">
                    {channel.name}
                  </h3>
                  {channel.is_private && (
                    <Lock size={12} className="text-amber-500 flex-shrink-0" />
                  )}
                </div>
                <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">
                {channel.description}
              </p>
              {isPrivateAndNotMember && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                  Geschlossene Gruppe — tritt bei, um Inhalte zu sehen
                </p>
              )}
              <div className="flex items-center gap-3 mt-2">
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Users size={12} /> {channel.member_count ?? 0}
                </span>
                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                  <MessageSquare size={12} /> {channel.post_count ?? 0}
                </span>
                {userId && (
                  <button
                    onClick={(e) => handleJoinLeave(e, channel)}
                    disabled={isPending}
                    className={clsx(
                      'ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors',
                      channel.is_member
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
                        : 'bg-forest-100 dark:bg-forest-900/30 text-forest-700 dark:text-forest-400 hover:bg-forest-200 dark:hover:bg-forest-900/50'
                    )}
                  >
                    {channel.is_member ? (
                      <><LogOut size={11} /> Verlassen</>
                    ) : (
                      <><LogIn size={11} /> Beitreten</>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </button>
        );
      })}
    </div>
  );
}
