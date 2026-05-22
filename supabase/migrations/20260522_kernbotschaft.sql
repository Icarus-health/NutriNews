-- Kernbotschaft: one punchy, reader-facing takeaway shown as the hero line on
-- the card front. Nullable so existing cards keep working (UI falls back to
-- snack_what). New cards are populated by the curation pipeline.
ALTER TABLE news_cards ADD COLUMN IF NOT EXISTS kernbotschaft text;
