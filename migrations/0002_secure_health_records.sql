-- Existing rows have no owner capability and cannot be migrated safely. Purge
-- them before enabling capability-bound access and encrypted payload storage.
DELETE FROM diet_plans;
DELETE FROM ckd_assessments;

ALTER TABLE ckd_assessments
  ADD COLUMN IF NOT EXISTS public_id uuid,
  ADD COLUMN IF NOT EXISTS access_token_hash text,
  ADD COLUMN IF NOT EXISTS encrypted_payload text,
  ADD COLUMN IF NOT EXISTS consent_version text,
  ADD COLUMN IF NOT EXISTS expires_at timestamp;

ALTER TABLE ckd_assessments
  ALTER COLUMN public_id SET NOT NULL,
  ALTER COLUMN access_token_hash SET NOT NULL,
  ALTER COLUMN encrypted_payload SET NOT NULL,
  ALTER COLUMN consent_version SET NOT NULL,
  ALTER COLUMN expires_at SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ckd_assessments_public_id_idx
  ON ckd_assessments (public_id);
CREATE INDEX IF NOT EXISTS ckd_assessments_expires_at_idx
  ON ckd_assessments (expires_at);

-- These dormant tables stored password-like values and chat content in plain
-- text and had no reachable product workflow. Remove the risk entirely.
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS chat_messages;
