import { createHash } from "node:crypto";
import { Resend } from "resend";
import { type OuvertureClaims, signOuvertureToken, verifyOuvertureToken } from "./ouvertureToken.ts";

export const CONFIRMATION_SUBJECT = "Confirmez votre inscription — ouverture des réservations GR20 2027";

const SITE = "https://alertegr20.com";
const CONTACT_EMAIL = "oussaihbadreddine@gmail.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@.]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
const SOURCE_PATTERN = /^[a-z0-9][a-z0-9._-]{0,39}$/;
const RESEND_WINDOW_HOURS = 6;
const DEFAULT_DAILY_CAP = 60;

export class OuvertureUnavailableError extends Error {}
export class InvalidRecipientError extends Error {}
export class DailyCapReachedError extends Error {}

export type MailClient = Pick<Resend, "emails" | "contacts">;

export type OuvertureDeps = {
  mail: MailClient;
  segmentId: string;
  tokenSecret: string;
  from: string;
  replyTo: string;
  dailyCap: number;
  now: () => number;
};

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const email = raw.trim().toLowerCase();
  if (email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    return null;
  }
  return email;
}

/** Where the signup came from (`?src=`, then the referrer host). Anything unexpected becomes "direct". */
export function normalizeSource(raw: unknown): string {
  if (typeof raw !== "string") {
    return "direct";
  }
  const source = raw.trim().toLowerCase();
  return SOURCE_PATTERN.test(source) ? source : "direct";
}

function tokenSecretFromEnv(): string {
  const secret = process.env.OUVERTURE_TOKEN_SECRET;
  if (!secret) {
    throw new OuvertureUnavailableError("OUVERTURE_TOKEN_SECRET manque.");
  }
  return secret;
}

function depsFromEnv(): OuvertureDeps {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_OUVERTURE_SEGMENT_ID;
  if (!apiKey || !segmentId) {
    throw new OuvertureUnavailableError("RESEND_API_KEY ou RESEND_OUVERTURE_SEGMENT_ID manque.");
  }
  const dailyCap = Number(process.env.OUVERTURE_DAILY_CAP ?? DEFAULT_DAILY_CAP);
  return {
    mail: new Resend(apiKey),
    segmentId,
    tokenSecret: tokenSecretFromEnv(),
    from: process.env.MAIL_FROM ?? "AlerteGR20 <alertes@alertegr20.com>",
    replyTo: process.env.MAIL_REPLY_TO ?? CONTACT_EMAIL,
    dailyCap: Number.isFinite(dailyCap) && dailyCap > 0 ? dailyCap : DEFAULT_DAILY_CAP,
    now: Date.now,
  };
}

/** Only needs the signing secret: a missing Resend variable must not look like an expired link. */
export function claimsFromToken(token: string, secret: string = tokenSecretFromEnv()): OuvertureClaims | null {
  return verifyOuvertureToken(token, secret);
}

/**
 * Nothing is stored before the address is confirmed. The idempotency key allows one confirmation
 * email per address every 6 hours, and the daily cap keeps the Resend quota for real signups.
 */
export async function sendConfirmation(claims: OuvertureClaims, deps: OuvertureDeps = depsFromEnv()): Promise<void> {
  const now = deps.now();
  if ((await countConfirmationsToday(deps, now)) >= deps.dailyCap) {
    throw new DailyCapReachedError(`Plafond de ${deps.dailyCap} confirmations atteint aujourd'hui.`);
  }
  const token = signOuvertureToken(claims, deps.tokenSecret, now);
  const window = Math.floor(now / (RESEND_WINDOW_HOURS * 60 * 60 * 1000));
  const emailHash = createHash("sha256").update(claims.email).digest("hex").slice(0, 32);
  const { error } = await deps.mail.emails.send(
    {
      from: deps.from,
      to: claims.email,
      replyTo: deps.replyTo,
      subject: CONFIRMATION_SUBJECT,
      text: confirmationText(`${SITE}/ouverture-2027/confirmer?token=${encodeURIComponent(token)}`),
    },
    { idempotencyKey: `ouverture-confirmation/${emailHash}/${window}` },
  );
  if (!error || error.name === "invalid_idempotent_request" || error.name === "concurrent_idempotent_requests") {
    return;
  }
  if (error.name === "validation_error" && /\bto\b/i.test(error.message)) {
    throw new InvalidRecipientError(error.message);
  }
  throw new Error(`Resend a refusé l'email de confirmation : ${error.name}`);
}

/** Fails open: a listing hiccup must not block signups, the Resend quota is the hard limit. */
async function countConfirmationsToday(deps: OuvertureDeps, now: number): Promise<number> {
  const { data, error } = await deps.mail.emails.list({ limit: 100 });
  if (error || !data) {
    console.warn("Comptage des confirmations impossible", error?.name);
    return 0;
  }
  const today = new Date(now).toISOString().slice(0, 10);
  return data.data.filter((email) => email.subject === CONFIRMATION_SUBJECT && email.created_at.startsWith(today))
    .length;
}

/** Adds the address to the opening list. Confirming twice, even concurrently, is harmless. */
export async function confirmSubscription(claims: OuvertureClaims, deps: OuvertureDeps = depsFromEnv()): Promise<void> {
  const { mail, segmentId } = deps;
  const { email, source } = claims;
  const existing = await mail.contacts.get({ email });
  if (existing.error && existing.error.name !== "not_found") {
    throw new Error(`Contact illisible : ${existing.error.name}`);
  }
  if (existing.error) {
    const created = await mail.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: segmentId }],
      properties: { source },
    });
    if (!created.error) {
      return;
    }
    const raced = await mail.contacts.get({ email });
    if (raced.error) {
      throw new Error(`Contact non créé : ${created.error.name}`);
    }
  }
  const updated = await mail.contacts.update({ email, unsubscribed: false });
  if (updated.error) {
    throw new Error(`Contact non mis à jour : ${updated.error.name}`);
  }
  const added = await mail.contacts.segments.add({ email, segmentId });
  if (added.error) {
    throw new Error(`Contact non ajouté à la liste : ${added.error.name}`);
  }
}

export type OuvertureResponse = { status: number; message: string };

const MESSAGES = {
  ok: "ok",
  invalidEmail: "Cette adresse email n'est pas valide.",
  capReached:
    "Beaucoup d'inscriptions aujourd'hui : réessayez demain. La liste reste ouverte jusqu'à l'annonce du Parc.",
  failed: "L'email de confirmation n'a pas pu partir. Réessayez dans un instant.",
} as const;

export async function handleOuvertureRequest(
  body: unknown,
  send: (claims: OuvertureClaims) => Promise<void> = sendConfirmation,
): Promise<OuvertureResponse> {
  const fields = (typeof body === "object" && body !== null ? body : {}) as {
    email?: unknown;
    website?: unknown;
    source?: unknown;
  };
  // Honeypot: the field is hidden from people, bots fill it. Answer as if it worked.
  if (typeof fields.website === "string" && fields.website.length > 0) {
    console.warn("Inscription ouverture ignorée : champ piège rempli");
    return { status: 200, message: MESSAGES.ok };
  }
  const email = normalizeEmail(fields.email);
  if (!email) {
    return { status: 400, message: MESSAGES.invalidEmail };
  }
  try {
    await send({ email, source: normalizeSource(fields.source) });
    return { status: 200, message: MESSAGES.ok };
  } catch (error) {
    if (error instanceof InvalidRecipientError) {
      return { status: 400, message: MESSAGES.invalidEmail };
    }
    if (error instanceof DailyCapReachedError) {
      console.warn(error.message);
      return { status: 429, message: MESSAGES.capReached };
    }
    console.error("Inscription ouverture impossible", error);
    return { status: error instanceof OuvertureUnavailableError ? 503 : 502, message: MESSAGES.failed };
  }
}

function confirmationText(confirmUrl: string): string {
  return `Bonjour,

Pour recevoir l'email AlerteGR20 le jour où le Parc naturel régional de Corse annonce l'ouverture des réservations 2027, confirmez votre adresse :

${confirmUrl}

Le lien est valable 7 jours. Si vous n'avez rien demandé, ignorez ce message : vous ne recevrez rien d'autre.

En 2026, la plateforme a ouvert le 20 janvier. Le Parc n'a pas encore publié la date 2027.

AlerteGR20 ne réserve pas à votre place. La réservation se fait sur https://pnr-resa.corsica

Vos données : ${SITE}/confidentialite
`;
}
