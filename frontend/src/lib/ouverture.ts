import { createHash } from "node:crypto";
import { Resend } from "resend";
import { signOuvertureToken, verifyOuvertureToken } from "./ouvertureToken";

const SITE = "https://alertegr20.com";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

type OuvertureConfig = {
  resend: Resend;
  segmentId: string;
  tokenSecret: string;
  from: string;
};

export class OuvertureUnavailableError extends Error {}

function config(): OuvertureConfig {
  const apiKey = process.env.RESEND_API_KEY;
  const segmentId = process.env.RESEND_OUVERTURE_SEGMENT_ID;
  const tokenSecret = process.env.OUVERTURE_TOKEN_SECRET;
  if (!apiKey || !segmentId || !tokenSecret) {
    throw new OuvertureUnavailableError("La liste d'ouverture n'est pas configurée.");
  }
  return {
    resend: new Resend(apiKey),
    segmentId,
    tokenSecret,
    from: process.env.MAIL_FROM ?? "AlerteGR20 <alertes@alertegr20.com>",
  };
}

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

/**
 * Nothing is stored before the address is confirmed. The idempotency key caps it at one
 * confirmation email per address and per day, so the form cannot be used to flood an inbox.
 */
export async function sendConfirmation(email: string): Promise<void> {
  const { resend, tokenSecret, from } = config();
  const now = Date.now();
  const token = signOuvertureToken(email, tokenSecret, now);
  const day = new Date(now).toISOString().slice(0, 10);
  const emailHash = createHash("sha256").update(email).digest("hex").slice(0, 32);
  const { error } = await resend.emails.send(
    {
      from,
      to: email,
      subject: "Confirmez votre inscription — ouverture des réservations GR20 2027",
      text: confirmationText(`${SITE}/ouverture-2027/confirmer?token=${encodeURIComponent(token)}`),
    },
    { idempotencyKey: `ouverture-confirmation/${emailHash}/${day}` },
  );
  if (error && error.name !== "invalid_idempotent_request" && error.name !== "concurrent_idempotent_requests") {
    throw new Error(`Resend a refusé l'email de confirmation : ${error.name}`);
  }
}

export function emailFromToken(token: string): string | null {
  return verifyOuvertureToken(token, config().tokenSecret);
}

/** Adds the address to the opening list. Confirming twice is harmless. */
export async function confirmSubscription(email: string): Promise<void> {
  const { resend, segmentId } = config();
  const existing = await resend.contacts.get({ email });
  if (existing.error?.name === "not_found") {
    const created = await resend.contacts.create({ email, unsubscribed: false, segments: [{ id: segmentId }] });
    if (created.error) {
      throw new Error(`Contact non créé : ${created.error.name}`);
    }
    return;
  }
  if (existing.error) {
    throw new Error(`Contact illisible : ${existing.error.name}`);
  }
  const updated = await resend.contacts.update({ email, unsubscribed: false });
  if (updated.error) {
    throw new Error(`Contact non mis à jour : ${updated.error.name}`);
  }
  const added = await resend.contacts.segments.add({ email, segmentId });
  if (added.error) {
    throw new Error(`Contact non ajouté à la liste : ${added.error.name}`);
  }
}

function confirmationText(confirmUrl: string): string {
  return `Bonjour,

Pour recevoir l'email AlerteGR20 le jour où le Parc naturel régional de Corse annonce l'ouverture des réservations 2027, confirmez votre adresse :

${confirmUrl}

Le lien est valable 7 jours. Si vous n'avez rien demandé, ignorez ce message : vous ne recevrez rien d'autre.

En 2026, la plateforme a ouvert le 20 janvier. Le Parc n'a pas encore publié la date 2027.

AlerteGR20 ne réserve pas à votre place. La réservation se fait sur https://pnr-resa.corsica
`;
}
