-- Internationalisierung: UI-Sprache pro Nutzer + gecachte Karten-Übersetzungen.

-- 1) Sprachpräferenz im Profil (Default Deutsch)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS language text NOT NULL DEFAULT 'de';

-- 2) On-the-fly erzeugte, gecachte Übersetzungen der Kartentexte.
--    Eine Zeile pro (Karte, Sprache). Geschrieben wird ausschließlich
--    serverseitig über den Service-Role-Key.
CREATE TABLE IF NOT EXISTS news_card_translations (
  news_card_id uuid NOT NULL REFERENCES news_cards(id) ON DELETE CASCADE,
  lang text NOT NULL,
  kernbotschaft text,
  headline text,
  snack_what text,
  snack_result text,
  snack_consequence text,
  therapist_check text,
  action_recommendation text,
  patient_question_anticipation text,
  evidence_summary text,
  lay_press_fact_check text,
  policy_action_needed text,
  international_relevance_de text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (news_card_id, lang)
);

ALTER TABLE news_card_translations ENABLE ROW LEVEL SECURITY;

-- Lesbar für alle, sofern die zugehörige Karte veröffentlicht ist.
CREATE POLICY "Alle lesen Uebersetzungen published" ON news_card_translations
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM news_cards c WHERE c.id = news_card_id AND c.status = 'published')
  );

-- Admins dürfen alles (Wartung). Reguläre Schreibzugriffe laufen über Service-Role.
CREATE POLICY "Admin alles translations" ON news_card_translations
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );
