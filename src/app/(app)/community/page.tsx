import { createClient } from '@/lib/supabase/server';
import CommunityPage from '@/components/community/CommunityPage';
import type { Channel, ChannelPost, QuickQuestion, QuickAnswer } from '@/types/database';

export const dynamic = 'force-dynamic';

// Default-Channels die beim ersten Aufruf angelegt werden sollen
const DEFAULT_CHANNELS = [
  { slug: 'klinische-ernaehrung', name: 'Klinische Ernährung & Intensiv', emoji: '🏥', description: 'PEG, TPN, Mangelernährungsscreening, ICU-Ernährung' },
  { slug: 'onkologie', name: 'Onkologische Ernährungstherapie', emoji: '🎗️', description: 'Kachexie, Supportivtherapie, Nebenwirkungsmanagement' },
  { slug: 'diabetologie', name: 'Diabetologie & Stoffwechsel', emoji: '📊', description: 'NVL Diabetes, Low-Carb-Debatte, CGM, Insulintherapie' },
  { slug: 'glp1-adipositas', name: 'Adipositas & GLP-1-Ära', emoji: '💊', description: 'Semaglutid, Tirzepatid, Begleittherapie, Muskelerhalt' },
  { slug: 'paediatrie', name: 'Pädiatrische Ernährung', emoji: '👶', description: 'Beikost, Allergieprävention, Adipositas im Kindesalter' },
  { slug: 'geriatrie', name: 'Geriatrie & Sarkopenie', emoji: '🧓', description: 'Proteinversorgung im Alter, Screening, Reha-Ernährung' },
  { slug: 'ambulante-praxis', name: 'Ambulante Praxis', emoji: '🏠', description: 'Beratungsalltag, Abrechnung, Patientenkommunikation' },
  { slug: 'berufspolitik', name: 'Berufspolitik & VDD/VDOE', emoji: '⚖️', description: 'Heilmittelgesetz, Kassenleistungen, Verbandsarbeit' },
];

export default async function CommunityRoute() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Load channels
  let { data: channels } = await supabase
    .from('channels')
    .select('*')
    .order('name');

  let channelList: Channel[] = channels ?? [];

  // If no channels exist yet, we still show the default list (seeding happens via SQL)
  if (channelList.length === 0) {
    channelList = DEFAULT_CHANNELS.map((c, i) => ({
      id: `default-${i}`,
      slug: c.slug,
      name: c.name,
      emoji: c.emoji,
      description: c.description,
      is_private: false,
      member_count: 0,
      post_count: 0,
      is_member: false,
      created_at: new Date().toISOString(),
    }));
  } else if (user) {
    // Load membership info
    const { data: memberships } = await supabase
      .from('channel_members')
      .select('channel_id')
      .eq('user_id', user.id);

    const memberSet = new Set(memberships?.map(m => m.channel_id));
    channelList = channelList.map(c => ({ ...c, is_member: memberSet.has(c.id) }));
  }

  // Load recent posts for each channel (top 20 per channel)
  const channelPosts: Record<string, ChannelPost[]> = {};
  for (const channel of channelList.slice(0, 8)) {
    if (channel.id.startsWith('default-')) continue;

    const { data: posts } = await supabase
      .from('channel_posts')
      .select('*, profile:user_id(id, full_name, avatar_url, role)')
      .eq('channel_id', channel.id)
      .is('parent_post_id', null)
      .order('created_at', { ascending: false })
      .limit(20);

    channelPosts[channel.id] = (posts ?? []) as ChannelPost[];
  }

  // Load quick questions
  const { data: questions } = await supabase
    .from('quick_questions')
    .select('*, profile:user_id(id, full_name, avatar_url)')
    .order('created_at', { ascending: false })
    .limit(30);

  // Enrich with same_question counts
  let questionList: QuickQuestion[] = (questions ?? []) as QuickQuestion[];
  if (questionList.length > 0) {
    const questionIds = questionList.map(q => q.id);
    const { data: sameVotes } = await supabase
      .from('same_question_votes')
      .select('question_id')
      .in('question_id', questionIds);

    const voteCountMap: Record<string, number> = {};
    sameVotes?.forEach(v => {
      voteCountMap[v.question_id] = (voteCountMap[v.question_id] ?? 0) + 1;
    });

    if (user) {
      const { data: userVotes } = await supabase
        .from('same_question_votes')
        .select('question_id')
        .eq('user_id', user.id)
        .in('question_id', questionIds);

      const userVoteSet = new Set(userVotes?.map(v => v.question_id));

      questionList = questionList.map(q => ({
        ...q,
        same_question_count: voteCountMap[q.id] ?? 0,
        user_has_same_question: userVoteSet.has(q.id),
      }));
    } else {
      questionList = questionList.map(q => ({
        ...q,
        same_question_count: voteCountMap[q.id] ?? 0,
      }));
    }
  }

  // Load answers for the first 5 questions (server-side pre-fetch)
  const answersMap: Record<string, QuickAnswer[]> = {};
  const questionsToLoad = questionList.slice(0, 5);
  if (questionsToLoad.length > 0) {
    const questionIds = questionsToLoad.map(q => q.id).filter(id => !id.startsWith('default-'));
    if (questionIds.length > 0) {
      const { data: allAnswers } = await supabase
        .from('quick_answers')
        .select('*, profile:user_id(id, full_name, avatar_url)')
        .in('question_id', questionIds)
        .order('created_at', { ascending: true })
        .limit(50);

      for (const answer of (allAnswers ?? []) as QuickAnswer[]) {
        if (!answersMap[answer.question_id]) {
          answersMap[answer.question_id] = [];
        }
        answersMap[answer.question_id].push(answer);
      }
    }
  }

  return (
    <CommunityPage
      channels={channelList}
      questions={questionList}
      userId={user?.id ?? null}
      channelPosts={channelPosts}
      initialAnswers={answersMap}
    />
  );
}
