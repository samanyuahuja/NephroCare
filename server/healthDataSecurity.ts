import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";

const VERSION = "v1";

export function assertHealthDataSecurityConfigured(): void {
  requireSecret("HEALTH_DATA_ENCRYPTION_KEY");
  requireSecret("ASSESSMENT_ACCESS_PEPPER");
}

function requireSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return `development-only-${name}`;
  throw new Error(`${name} is required in production`);
}

function encryptionKey(): Buffer {
  return createHmac("sha256", requireSecret("HEALTH_DATA_ENCRYPTION_KEY"))
    .update("nephrocare-health-data-v1")
    .digest();
}

export function createAssessmentCapability() {
  const accessToken = randomBytes(32).toString("base64url");
  return {
    publicId: randomUUID(),
    accessToken,
    accessTokenHash: hashAccessToken(accessToken),
  };
}

export function hashAccessToken(token: string): string {
  return createHmac("sha256", requireSecret("ASSESSMENT_ACCESS_PEPPER"))
    .update(token)
    .digest("hex");
}

export function tokenMatches(token: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashAccessToken(token), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function encryptHealthPayload(payload: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(payload), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), tag.toString("base64url"), ciphertext.toString("base64url")].join(".");
}

export function decryptHealthPayload<T>(envelope: string): T {
  const [version, encodedIv, encodedTag, encodedCiphertext] = envelope.split(".");
  if (version !== VERSION || !encodedIv || !encodedTag || !encodedCiphertext) {
    throw new Error("Unsupported encrypted health payload");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    encryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(encodedCiphertext, "base64url")),
    decipher.final(),
  ]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}

export function retentionDeadline(now = new Date()): Date {
  const configured = Number.parseInt(process.env.HEALTH_DATA_RETENTION_DAYS || "30", 10);
  const days = Number.isFinite(configured) ? Math.min(Math.max(configured, 1), 90) : 30;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
