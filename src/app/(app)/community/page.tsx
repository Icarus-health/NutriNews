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

  // Phase 1: channels + quick questions are independent — fetch in parallel
  const [{ data: channels }, { data: questions }] = await Promise.all([
    supabase.from('channels').select('*').order('name'),
    supabase
      .from('quick_questions')
      .select('*, profile:user_id(id, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(30),
  ]);

  let channelList: Channel[] = channels ?? [];
  let questionList: QuickQuestion[] = (questions ?? []) as QuickQuestion[];

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
  }

  const hasRealChannels = channelList.some(c => !c.id.startsWith('default-'));
  const channelsToLoad = channelList.filter(c => !c.id.startsWith('default-')).slice(0, 8);
  const questionIds = questionList.map(q => q.id);
  const firstQuestionIds = questionList.slice(0, 5).map(q => q.id).filter(id => !id.startsWith('default-'));

  // Phase 2: memberships, votes, answers and channel posts are all independent — run in parallel
  const [
    [membershipResult, sameVotesResult, userVotesResult, answersResult],
    postResults,
  ] = await Promise.all([
    Promise.all([
      hasRealChannels && user
        ? supabase.from('channel_members').select('channel_id').eq('user_id', user.id)
        : Promise.resolve({ data: null as { channel_id: string }[] | null }),
      questionIds.length > 0
        ? supabase.from('same_question_votes').select('question_id').in('question_id', questionIds)
        : Promise.resolve({ data: null as { question_id: string }[] | null }),
      questionIds.length > 0 && user
        ? supabase.from('same_question_votes').select('question_id').eq('user_id', user.id).in('question_id', questionIds)
        : Promise.resolve({ data: null as { question_id: string }[] | null }),
      firstQuestionIds.length > 0
        ? supabase.from('quick_answers').select('*, profile:user_id(id, full_name, avatar_url)').in('question_id', firstQuestionIds).order('created_at', { ascending: true }).limit(50)
        : Promise.resolve({ data: null as QuickAnswer[] | null }),
    ]),
    Promise.all(
      channelsToLoad.map(channel =>
        supabase
          .from('channel_posts')
          .select('*, profile:user_id(id, full_name, avatar_url, role)')
          .eq('channel_id', channel.id)
          .is('parent_post_id', null)
          .order('created_at', { ascending: false })
          .limit(20)
          .then(({ data }) => ({ channelId: channel.id, posts: (data ?? []) as ChannelPost[] }))
      )
    ),
  ]);

  // Enrich channel list with membership
  if (membershipResult?.data) {
    const memberSet = new Set(membershipResult.data.map(m => m.channel_id));
    channelList = channelList.map(c => ({ ...c, is_member: memberSet.has(c.id) }));
  }

  // Build channel posts map
  const channelPosts: Record<string, ChannelPost[]> = {};
  for (const result of postResults) {
    channelPosts[result.channelId] = result.posts;
  }

  // Enrich questions with same_question counts
  if (questionIds.length > 0) {
    const voteCountMap: Record<string, number> = {};
    sameVotesResult?.data?.forEach(v => {
      voteCountMap[v.question_id] = (voteCountMap[v.question_id] ?? 0) + 1;
    });
    const userVoteSet = new Set(userVotesResult?.data?.map(v => v.question_id));

    questionList = questionList.map(q => ({
      ...q,
      same_question_count: voteCountMap[q.id] ?? 0,
      ...(user ? { user_has_same_question: userVoteSet.has(q.id) } : {}),
    }));
  }

  // Build answers map
  const answersMap: Record<string, QuickAnswer[]> = {};
  for (const answer of (answersResult?.data ?? []) as QuickAnswer[]) {
    if (!answersMap[answer.question_id]) {
      answersMap[answer.question_id] = [];
    }
    answersMap[answer.question_id].push(answer);
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
