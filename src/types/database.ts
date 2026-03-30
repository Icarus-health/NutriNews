export type EvidenceLevel =
  | 'Meta-Analyse'
  | 'Systematische Review'
  | 'RCT'
  | 'Kohortenstudie'
  | 'Fallstudie'
  | 'Expertenmeinung'
  | 'Laienpresse/Trend';

export type SourceType =
  | 'fachpresse'
  | 'laienpresse'
  | 'forschung'
  | 'berufspolitik'
  | 'supplement';

export type NewsStatus = 'draft' | 'published';

export type TherapistSetting =
  | 'akutklinik'
  | 'rehabilitation'
  | 'ambulant'
  | 'psychiatrie'
  | 'langzeitpflege'
  | 'praevention'
  | 'forschung_lehre';

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: 'therapist' | 'admin';
  specialties: string[];
  preferred_categories: string[];
  notify_new_news: boolean;
  setting: TherapistSetting | null;
  created_at: string;
  updated_at: string;
}

export interface BriefingItem {
  headline: string;
  summary: string;
  source_name: string;
  source_url: string;
  evidence_level: EvidenceLevel;
  category_main: string;
  practice_relevance_score: number;
  news_card_id: string | null;
}

export interface DailyBriefing {
  id: string;
  date: string;
  items: BriefingItem[];
  generated_at: string;
  created_at: string;
}

export interface NewsCard {
  id: string;
  headline: string;
  snack_what: string;
  snack_result: string;
  snack_consequence: string;
  therapist_check: string;
  read_time_sec: number;
  source_url: string;
  source_name: string | null;
  category_main: string;
  subcategories: string[];
  evidence_level: EvidenceLevel;
  status: NewsStatus;
  curated_by: string | null;
  curated_by_agent: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  // Sprint 1: Erweiterte Evidenz- und Praxisfelder
  practice_relevance_score: number | null;
  action_recommendation: string | null;
  patient_question_anticipation: string | null;
  evidence_summary: string | null;
  source_type: SourceType;
  lay_press_fact_check: string | null;
  // Computed / joined
  like_count?: number;
  user_has_liked?: boolean;
  user_has_bookmarked?: boolean;
}

export interface Comment {
  id: string;
  news_card_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Profile;
}

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  created_at: string;
}

export interface Share {
  id: string;
  sender_id: string;
  receiver_id: string | null;
  receiver_email: string | null;
  news_card_id: string;
  message: string | null;
  read: boolean;
  created_at: string;
  news_card?: NewsCard;
  sender?: Profile;
}

// ═══════════════════════════════════════════════════════════════
// Sprint 3: Community — Channels, Posts, Schnellfragen, Verifikation
// ═══════════════════════════════════════════════════════════════

export interface Channel {
  id: string;
  slug: string;
  name: string;
  description: string;
  emoji: string;
  member_count?: number;
  post_count?: number;
  is_member?: boolean;
  created_at: string;
}

export interface ChannelPost {
  id: string;
  channel_id: string;
  user_id: string;
  body: string;
  news_card_id: string | null;
  parent_post_id: string | null;
  reply_count?: number;
  created_at: string;
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>;
  news_card?: Pick<NewsCard, 'id' | 'headline' | 'source_name' | 'evidence_level'>;
}

export interface ChannelMember {
  channel_id: string;
  user_id: string;
  joined_at: string;
}

export interface QuickQuestion {
  id: string;
  user_id: string;
  category: string;
  body: string;
  answer_count?: number;
  same_question_count?: number;
  user_has_same_question?: boolean;
  created_at: string;
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export interface QuickAnswer {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  created_at: string;
  profile?: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
}

export type CardVerificationType = 'praxisrelevant' | 'fachlich_korrekt' | 'korrektur_noetig' | 'quelle_zweifelhaft';

export interface CardVerification {
  id: string;
  news_card_id: string;
  user_id: string;
  verification_type: CardVerificationType;
  reason: string | null;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      news_cards: { Row: NewsCard; Insert: Partial<NewsCard>; Update: Partial<NewsCard> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
      collections: { Row: Collection; Insert: Partial<Collection>; Update: Partial<Collection> };
      shares: { Row: Share; Insert: Partial<Share>; Update: Partial<Share> };
      daily_briefings: { Row: DailyBriefing; Insert: Partial<DailyBriefing>; Update: Partial<DailyBriefing> };
      channels: { Row: Channel; Insert: Partial<Channel>; Update: Partial<Channel> };
      channel_posts: { Row: ChannelPost; Insert: Partial<ChannelPost>; Update: Partial<ChannelPost> };
      channel_members: { Row: ChannelMember; Insert: Partial<ChannelMember>; Update: Partial<ChannelMember> };
      quick_questions: { Row: QuickQuestion; Insert: Partial<QuickQuestion>; Update: Partial<QuickQuestion> };
      quick_answers: { Row: QuickAnswer; Insert: Partial<QuickAnswer>; Update: Partial<QuickAnswer> };
      card_verifications: { Row: CardVerification; Insert: Partial<CardVerification>; Update: Partial<CardVerification> };
    };
  };
};
