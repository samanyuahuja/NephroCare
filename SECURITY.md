# Security Policy

Report suspected vulnerabilities privately to `nephrocareai@gmail.com`. Do not
include patient data, access capabilities, secrets, or exploit details in a
public issue. Include the affected URL, impact, and minimal reproduction steps.

NephroCare will acknowledge a report within 72 hours, preserve relevant logs,
contain the issue, assess notification duties, and publish a remediation notice
when doing so will not expose users to additional risk.

## Supported deployment

Only the current production deployment is supported. Production must define
`HEALTH_DATA_ENCRYPTION_KEY` and `ASSESSMENT_ACCESS_PEPPER` as independent,
random secrets. Rotation requires a documented migration because losing the
encryption key makes retained reports unreadable.
