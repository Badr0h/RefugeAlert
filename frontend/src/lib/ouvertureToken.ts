import { createHmac, timingSafeEqual } from "node:crypto";

const DAY_MS = 24 * 60 * 60 * 1000;
const VALIDITY_DAYS = 7;

/**
 * The expiry is pinned to the end of the UTC day plus the validity period, so the same address
 * gets the same token all day long. Resend's idempotency key only dedupes identical payloads.
 */
export function signOuvertureToken(email: string, secret: string, now: number = Date.now()): string {
  const startOfDay = Math.floor(now / DAY_MS) * DAY_MS;
  const expiresAt = startOfDay + (VALIDITY_DAYS + 1) * DAY_MS;
  const payload = `${Buffer.from(email, "utf8").toString("base64url")}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** The email the token was issued for, or null if it is malformed, forged or expired. */
export function verifyOuvertureToken(token: string, secret: string, now: number = Date.now()): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [encodedEmail, rawExpiresAt, signature] = parts;
  const payload = `${encodedEmail}.${rawExpiresAt}`;
  const expected = Buffer.from(sign(payload, secret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }
  const expiresAt = Number(rawExpiresAt);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) {
    return null;
  }
  const email = Buffer.from(encodedEmail, "base64url").toString("utf8");
  return email.length > 0 ? email : null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
