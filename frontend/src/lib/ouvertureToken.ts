import { createHmac, timingSafeEqual } from "node:crypto";

const DAY_MS = 24 * 60 * 60 * 1000;
const VALIDITY_DAYS = 7;
const PURPOSE = "ouverture-2027";

export type OuvertureClaims = { email: string; source: string };

/**
 * The expiry is pinned to the end of the UTC day plus the validity period, so the same address
 * gets the same token all day long. Resend's idempotency key only dedupes identical payloads.
 */
export function signOuvertureToken(claims: OuvertureClaims, secret: string, now: number = Date.now()): string {
  const startOfDay = Math.floor(now / DAY_MS) * DAY_MS;
  const expiresAt = startOfDay + (VALIDITY_DAYS + 1) * DAY_MS;
  const encoded = Buffer.from(JSON.stringify({ e: claims.email, s: claims.source }), "utf8").toString("base64url");
  const payload = `${encoded}.${expiresAt}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** The claims the token was issued with, or null if it is malformed, forged or expired. */
export function verifyOuvertureToken(token: string, secret: string, now: number = Date.now()): OuvertureClaims | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }
  const [encoded, rawExpiresAt, signature] = parts;
  const payload = `${encoded}.${rawExpiresAt}`;
  const expected = Buffer.from(sign(payload, secret), "base64url");
  const received = Buffer.from(signature, "base64url");
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }
  const expiresAt = Number(rawExpiresAt);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= now) {
    return null;
  }
  try {
    const decoded: unknown = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (typeof decoded !== "object" || decoded === null) {
      return null;
    }
    const { e, s } = decoded as { e?: unknown; s?: unknown };
    if (typeof e !== "string" || e.length === 0 || typeof s !== "string") {
      return null;
    }
    return { email: e, source: s };
  } catch {
    return null;
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`${PURPOSE}.${payload}`).digest("base64url");
}
