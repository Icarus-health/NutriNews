ALTER TABLE source_health ADD COLUMN IF NOT EXISTS disabled boolean NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_source_health_disabled ON source_health (disabled) WHERE disabled = true;
