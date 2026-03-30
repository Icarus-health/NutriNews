'use client';

import { useState, useTransition } from 'react';
import { Users, MessageSquare, ChevronRight, LogIn, LogOut } from 'lucide-react';
import { clsx } from 'clsx';
import { joinChannel, leaveChannel } from '@/lib/actions/community';
import type { Channel } from '@/types/database';

interface Props {
  channels: Channel[];
  userId: string | null;
  onSelectChannel: (channelId: string) => void;
}

export default function ChannelList({ channels, userId, onSelectChannel }: Props) {
  const [isPending, startTransition] = useTransition();
  const [localChannels, setLocalChannels] = useState(channels);

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

  return (
    <div className="space-y-2">
      {localChannels.map(channel => (
        <button
          key={channel.id}
          onClick={() => onSelectChannel(channel.id)}
          className="w-full bg-white rounded-2xl border border-slate-100 p-4 text-left hover:border-slate-200 transition-colors active:scale-[0.99]"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl">{channel.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[14px] text-slate-800 truncate">
                  {channel.name}
                </h3>
                <ChevronRight size={16} className="text-slate-300 flex-shrink-0" />
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">
                {channel.description}
              </p>
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
                        ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500'
                        : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
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
      ))}
    </div>
  );
}
