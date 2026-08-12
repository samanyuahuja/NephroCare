# Security Incident Runbook

1. Stop affected writes and revoke exposed credentials. Preserve Vercel,
   database, Cloudflare, and application security logs without copying health
   payloads into tickets.
2. Determine affected data, capabilities, users, time range, and whether the
   encryption key or access pepper was exposed. Treat either as a critical event.
3. Contain at Cloudflare and Vercel, rotate secrets, invalidate deployments, and
   purge records when continued retention creates more risk.
4. Restore from the latest known-good commit and tested database backup. Verify
   capability checks, deletion, expiry, headers, and rate limits before reopening.
5. Escalate to privacy and regulatory counsel immediately to assess DPDP and any
   medical-device reporting or notification deadline. Do not wait for certainty.
6. Record timeline, decisions, affected systems, notices, and preventive work.

Run a tabletop exercise and restore drill every quarter. A restore passes only
when a fresh environment can decrypt authorised records, rejects invalid
capabilities, and contains no records beyond their expiry date.

At the hosting edge, publish per-IP rate limits for `/api/chat-direct` (10 per
15 minutes), `/api/ckd-assessment` (10 per 15 minutes), and `/api/diet-plan`
(10 per 15 minutes). Keep `OPENAI_CHAT_ENABLED` unset by default; enabling it
also requires a provider-side monthly budget and usage alerts.
