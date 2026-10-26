-- Dados operacionais do Analytics Pro. Nenhuma destas tabelas altera a Meta Ads.
ALTER TABLE landing_events ADD COLUMN IF NOT EXISTS journey_id TEXT;
ALTER TABLE hotmart_sales ADD COLUMN IF NOT EXISTS journey_id TEXT;
ALTER TABLE hotmart_sales ADD COLUMN IF NOT EXISTS campaign_id TEXT;
ALTER TABLE hotmart_sales ADD COLUMN IF NOT EXISTS adset_id TEXT;
ALTER TABLE hotmart_sales ADD COLUMN IF NOT EXISTS ad_id TEXT;
ALTER TABLE hotmart_sales ADD COLUMN IF NOT EXISTS is_order_bump BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE hotmart_sales ADD COLUMN IF NOT EXISTS parent_transaction_id TEXT;

CREATE INDEX IF NOT EXISTS landing_events_journey_idx ON landing_events (journey_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS hotmart_sales_journey_idx ON hotmart_sales (journey_id, received_at DESC);
CREATE INDEX IF NOT EXISTS hotmart_sales_campaign_id_idx ON hotmart_sales (campaign_id, received_at DESC);

ALTER TABLE meta_campaigns ADD COLUMN IF NOT EXISTS daily_budget NUMERIC(14,2);
ALTER TABLE meta_campaigns ADD COLUMN IF NOT EXISTS lifetime_budget NUMERIC(14,2);
ALTER TABLE meta_campaigns ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
ALTER TABLE meta_campaigns ADD COLUMN IF NOT EXISTS stop_time TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS analytics_annotations (
  id UUID PRIMARY KEY,
  occurred_on DATE NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  campaign_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS analytics_annotations_date_idx ON analytics_annotations (occurred_on DESC);

CREATE TABLE IF NOT EXISTS analytics_financial_plans (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  month_start DATE NOT NULL,
  monthly_budget NUMERIC(14,2),
  target_revenue NUMERIC(14,2),
  max_cpa NUMERIC(14,2),
  target_conversion NUMERIC(8,4),
  desired_margin NUMERIC(8,4),
  min_ctr NUMERIC(8,4),
  max_cpc NUMERIC(14,2),
  campaign_id TEXT,
  product_slug TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS analytics_financial_plans_active_idx ON analytics_financial_plans (active, month_start DESC);

ALTER TABLE analytics_financial_plans ADD COLUMN IF NOT EXISTS min_ctr NUMERIC(8,4);
ALTER TABLE analytics_financial_plans ADD COLUMN IF NOT EXISTS max_cpc NUMERIC(14,2);
ALTER TABLE analytics_financial_plans ADD COLUMN IF NOT EXISTS product_slug TEXT;

CREATE TABLE IF NOT EXISTS analytics_experiments (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  campaign_id TEXT,
  audience_description TEXT,
  delivery_configuration TEXT,
  starts_on DATE,
  ends_on DATE,
  limitations TEXT,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_experiment_creatives (
  id UUID PRIMARY KEY,
  experiment_id UUID NOT NULL REFERENCES analytics_experiments(id) ON DELETE CASCADE,
  ad_id TEXT,
  label TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS analytics_experiment_creatives_experiment_idx ON analytics_experiment_creatives (experiment_id);
