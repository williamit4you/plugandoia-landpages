CREATE TABLE IF NOT EXISTS landing_events (
  id UUID PRIMARY KEY,
  page_key TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_title TEXT,
  event_type TEXT NOT NULL,
  session_id TEXT NOT NULL,
  visitor_id TEXT,
  referrer TEXT,
  landing_url TEXT,
  user_agent TEXT,
  ip_hash TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  fbclid TEXT,
  gclid TEXT,
  checkout_url TEXT,
  currency TEXT,
  value NUMERIC(14, 2),
  order_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS landing_events_page_time_idx ON landing_events (page_key, occurred_at DESC);
CREATE INDEX IF NOT EXISTS landing_events_type_time_idx ON landing_events (event_type, occurred_at DESC);
CREATE INDEX IF NOT EXISTS landing_events_session_idx ON landing_events (session_id);
CREATE INDEX IF NOT EXISTS landing_events_campaign_idx ON landing_events (utm_campaign);
CREATE UNIQUE INDEX IF NOT EXISTS landing_events_purchase_order_idx
  ON landing_events (order_id, event_type)
  WHERE order_id IS NOT NULL AND event_type = 'PURCHASE';

CREATE TABLE IF NOT EXISTS hotmart_sales (
  id UUID PRIMARY KEY,
  provider_event_id TEXT NOT NULL UNIQUE,
  event_name TEXT NOT NULL,
  status TEXT,
  transaction_id TEXT,
  product_id TEXT,
  product_name TEXT,
  offer_code TEXT,
  buyer_name TEXT,
  buyer_email TEXT,
  buyer_phone TEXT,
  buyer_document TEXT,
  amount NUMERIC(14, 2),
  currency TEXT,
  payment_type TEXT,
  installments INTEGER,
  producer_commission NUMERIC(14, 2),
  purchase_date TIMESTAMPTZ,
  approved_date TIMESTAMPTZ,
  page_key TEXT,
  session_id TEXT,
  visitor_id TEXT,
  source_code TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  raw_payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS hotmart_sales_status_time_idx ON hotmart_sales (status, received_at DESC);
CREATE INDEX IF NOT EXISTS hotmart_sales_page_time_idx ON hotmart_sales (page_key, received_at DESC);
CREATE INDEX IF NOT EXISTS hotmart_sales_transaction_idx ON hotmart_sales (transaction_id);
