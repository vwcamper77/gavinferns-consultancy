BEGIN;
CREATE TABLE IF NOT EXISTS sales_users (
  id uuid PRIMARY KEY, email text NOT NULL UNIQUE, password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('sales', 'advertising')), active boolean NOT NULL DEFAULT true
);
CREATE TABLE IF NOT EXISTS sales_sessions (
  token_hash text PRIMARY KEY, user_id uuid NOT NULL REFERENCES sales_users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE TABLE IF NOT EXISTS acquisition_limits (
  key text PRIMARY KEY, bucket bigint NOT NULL, hits integer NOT NULL
);
ALTER TABLE acquisition_limits ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT now();
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY, submission_id uuid NOT NULL UNIQUE, created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL, email text NOT NULL, business text NOT NULL, industry text NOT NULL,
  employees text NOT NULL, turnover text NOT NULL, budget text NOT NULL, timescale text NOT NULL,
  challenge text NOT NULL, goal text NOT NULL,
  stage text NOT NULL DEFAULT 'new' CHECK (stage IN ('new','qualified','appointment','proposal','won','lost','nurture')),
  qualified_at timestamptz, booking_token uuid UNIQUE, campaign text,
  first_touch jsonb, last_touch jsonb, privacy_version text NOT NULL,
  marketing_consent boolean NOT NULL, marketing_withdrawn_at timestamptz, marketing_withdrawal_token uuid NOT NULL UNIQUE
);
ALTER TABLE leads ADD COLUMN IF NOT EXISTS marketing_withdrawn_at timestamptz;
CREATE INDEX IF NOT EXISTS leads_campaign_idx ON leads(campaign, created_at);
CREATE TABLE IF NOT EXISTS acquisition_events (
  id uuid PRIMARY KEY, occurred_at timestamptz NOT NULL DEFAULT now(), kind text NOT NULL,
  campaign text, lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  actor uuid REFERENCES sales_users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS acquisition_events_report_idx ON acquisition_events(occurred_at, campaign, kind);
CREATE UNIQUE INDEX IF NOT EXISTS distinct_lead_milestone ON acquisition_events(lead_id, kind)
  WHERE kind IN ('qualified','discovery_booked','appointment_attended','proposal_issued','contract_signed');
CREATE TABLE IF NOT EXISTS sales_ledger (
  id uuid PRIMARY KEY, occurred_on date NOT NULL, kind text NOT NULL
    CHECK (kind IN ('ad_spend','contract_revenue','payment_received','delivery_cost')),
  amount_pence bigint NOT NULL CHECK (amount_pence > 0), campaign text,
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL, actor uuid REFERENCES sales_users(id) ON DELETE SET NULL
);
ALTER TABLE sales_ledger ADD COLUMN IF NOT EXISTS voided_at timestamptz;
ALTER TABLE sales_ledger ADD COLUMN IF NOT EXISTS voided_by uuid REFERENCES sales_users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS sales_ledger_report_idx ON sales_ledger(occurred_on, campaign, kind);
CREATE TABLE IF NOT EXISTS sales_mail (
  id uuid PRIMARY KEY, lead_id uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  template text NOT NULL CHECK (template IN ('acknowledgement','qualified','nurture')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sending','sent','failed','cancelled')),
  available_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (lead_id, template)
);
COMMIT;
