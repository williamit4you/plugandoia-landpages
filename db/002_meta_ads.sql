CREATE TABLE IF NOT EXISTS meta_ad_accounts (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, currency TEXT, account_status TEXT, timezone_name TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS meta_campaigns (
  id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES meta_ad_accounts(id), name TEXT NOT NULL,
  objective TEXT, status TEXT, effective_status TEXT, created_time TIMESTAMPTZ, updated_time TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS meta_adsets (
  id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES meta_ad_accounts(id), campaign_id TEXT REFERENCES meta_campaigns(id),
  name TEXT NOT NULL, status TEXT, effective_status TEXT, daily_budget NUMERIC(14,2), lifetime_budget NUMERIC(14,2),
  start_time TIMESTAMPTZ, end_time TIMESTAMPTZ, synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS meta_ads (
  id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES meta_ad_accounts(id), campaign_id TEXT REFERENCES meta_campaigns(id),
  adset_id TEXT REFERENCES meta_adsets(id), name TEXT NOT NULL, status TEXT, effective_status TEXT, creative_id TEXT,
  created_time TIMESTAMPTZ, updated_time TIMESTAMPTZ, synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS meta_insights_daily (
  account_id TEXT NOT NULL REFERENCES meta_ad_accounts(id), object_id TEXT NOT NULL, level TEXT NOT NULL,
  insight_date DATE NOT NULL, currency TEXT, spend NUMERIC(14,2), impressions BIGINT, reach BIGINT, frequency NUMERIC(14,4),
  clicks BIGINT, inline_link_clicks BIGINT, cpc NUMERIC(14,4), cpm NUMERIC(14,4), ctr NUMERIC(14,4),
  actions JSONB NOT NULL DEFAULT '[]'::jsonb, action_values JSONB NOT NULL DEFAULT '[]'::jsonb, raw_payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY (account_id, object_id, level, insight_date)
);
CREATE TABLE IF NOT EXISTS meta_sync_executions (
  id UUID PRIMARY KEY, started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), finished_at TIMESTAMPTZ,
  account_id TEXT, date_start DATE, date_end DATE, status TEXT NOT NULL, imported_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0, error_code TEXT, error_message TEXT
);
CREATE INDEX IF NOT EXISTS meta_insights_daily_date_idx ON meta_insights_daily (account_id, insight_date DESC);
