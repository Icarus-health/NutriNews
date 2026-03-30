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

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      news_cards: { Row: NewsCard; Insert: Partial<NewsCard>; Update: Partial<NewsCard> };
      comments: { Row: Comment; Insert: Partial<Comment>; Update: Partial<Comment> };
      collections: { Row: Collection; Insert: Partial<Collection>; Update: Partial<Collection> };
      shares: { Row: Share; Insert: Partial<Share>; Update: Partial<Share> };
      daily_briefings: { Row: DailyBriefing; Insert: Partial<DailyBriefing>; Update: Partial<DailyBriefing> };
    };
  };
};
