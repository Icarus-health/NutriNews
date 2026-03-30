'use client';

import { useState } from 'react';
import ChannelList from './ChannelList';
import ChannelDetail from './ChannelDetail';
import QuickQuestions from './QuickQuestions';
import type { Channel, ChannelPost, QuickQuestion } from '@/types/database';

interface Props {
  channels: Channel[];
  questions: QuickQuestion[];
  userId: string | null;
  channelPosts: Record<string, ChannelPost[]>;
}

export default function CommunityPage({ channels, questions, userId, channelPosts }: Props) {
  const [activeTab, setActiveTab] = useState<'channels' | 'fragen'>('channels');
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);

  const selectedChannel = channels.find(c => c.id === selectedChannelId);

  if (selectedChannel) {
    return (
      <div className="px-4 pt-4 pb-24">
        <ChannelDetail
          channel={selectedChannel}
          posts={channelPosts[selectedChannel.id] ?? []}
          userId={userId}
          onBack={() => setSelectedChannelId(null)}
        />
      </div>
    );
  }

  return (
    <div className="px-4 pt-4 pb-24">
      {/* Tab header */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('channels')}
          className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
            activeTab === 'channels'
              ? 'bg-forest-700 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Fachgruppen
        </button>
        <button
          onClick={() => setActiveTab('fragen')}
          className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
            activeTab === 'fragen'
              ? 'bg-forest-700 text-white'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
          }`}
        >
          Schnellfragen
        </button>
      </div>

      {activeTab === 'channels' && (
        <ChannelList
          channels={channels}
          userId={userId}
          onSelectChannel={setSelectedChannelId}
        />
      )}

      {activeTab === 'fragen' && (
        <QuickQuestions
          questions={questions}
          userId={userId}
        />
      )}
    </div>
  );
}
