# Health Data Governance

- Collect an optional label rather than a legal name and only the fields needed
  for the current screening request.
- Require versioned, affirmative adult consent. Assessments for people under 18
  are rejected; no guardian bypass is supported.
- Encrypt clinical inputs with AES-256-GCM before database storage. Store access
  capabilities only as keyed hashes and never log request bodies or tokens.
- Retain new reports for 30 days, purge expired records, and provide capability-
  authenticated deletion from My Reports.
- Chat questions are processed transiently and are not written to the app database.
- Privacy requests go to `nephrocareai@gmail.com`; support must not ask users to
  send health records by ordinary email.
- Review processors, international transfers, breach duties, notices, and the
  rights workflow with qualified privacy counsel before processing real patients.
