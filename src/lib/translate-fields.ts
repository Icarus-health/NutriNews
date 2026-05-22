// Shared (non-server) definitions for card translation, importable from both
// the server action and client components ('use server' files may only export
// async functions, so types/constants live here).

export const TRANSLATABLE_FIELDS = [
  'kernbotschaft',
  'headline',
  'snack_what',
  'snack_result',
  'snack_consequence',
  'therapist_check',
  'action_recommendation',
  'patient_question_anticipation',
  'evidence_summary',
  'lay_press_fact_check',
  'policy_action_needed',
  'international_relevance_de',
] as const;

export type TranslatableField = (typeof TRANSLATABLE_FIELDS)[number];

export type CardTranslation = Partial<Record<TranslatableField, string>>;
