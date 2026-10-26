ALTER TABLE landing_events ADD COLUMN IF NOT EXISTS campaign_id TEXT;
ALTER TABLE landing_events ADD COLUMN IF NOT EXISTS adset_id TEXT;
ALTER TABLE landing_events ADD COLUMN IF NOT EXISTS ad_id TEXT;
CREATE INDEX IF NOT EXISTS landing_events_campaign_id_idx ON landing_events (campaign_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS landing_events_ad_id_idx ON landing_events (ad_id, occurred_at DESC);
