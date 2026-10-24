import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CONFIRMATION_SUBJECT,
  confirmSubscription,
  DailyCapReachedError,
  handleOuvertureRequest,
  InvalidRecipientError,
  type MailClient,
  normalizeEmail,
  normalizeSource,
  type OuvertureDeps,
  OuvertureUnavailableError,
  sendConfirmation,
} from "./ouverture.ts";

const NOW = Date.UTC(2026, 9, 24, 13, 0, 0);
const claims = { email: "randonneur@exemple.fr", source: "facebook" };

type Call = { method: string; args: unknown[] };
type Result = { data?: unknown; error?: { name: string; message: string } | null };

function fakeMail(responses: Record<string, Result[]>, calls: Call[]): MailClient {
  const respond = (method: string) => async (...args: unknown[]) => {
    calls.push({ method, args });
    const queue = responses[method] ?? [];
    const next = queue.length > 1 ? queue.shift() : queue[0];
    return { data: next?.data ?? {}, error: next?.error ?? null };
  };
  return {
    emails: { send: respond("emails.send"), list: respond("emails.list") },
    contacts: {
      get: respond("contacts.get"),
      create: respond("contacts.create"),
      update: respond("contacts.update"),
      segments: { add: respond("contacts.segments.add") },
    },
  } as unknown as MailClient;
}

function deps(mail: MailClient, overrides: Partial<OuvertureDeps> = {}): OuvertureDeps {
  return {
    mail,
    segmentId: "segment",
    tokenSecret: "secret",
    from: "AlerteGR20 <alertes@alertegr20.com>",
    replyTo: "contact@exemple.fr",
    dailyCap: 2,
    now: () => NOW,
    ...overrides,
  };
}

const notFound = { error: { name: "not_found", message: "Contact not found" } };

describe("normalizeEmail", () => {
  it("trims and lowercases a valid address", () => {
    assert.equal(normalizeEmail("  Randonneur@Exemple.FR "), "randonneur@exemple.fr");
  });

  it("rejects one-letter top-level domains and non-strings", () => {
    assert.equal(normalizeEmail("a@b.c"), null);
    assert.equal(normalizeEmail(42), null);
  });
});

describe("normalizeSource", () => {
  it("keeps a short slug and replaces anything else with direct", () => {
    assert.equal(normalizeSource(" Facebook "), "facebook");
    assert.equal(normalizeSource("<script>"), "direct");
    assert.equal(normalizeSource(undefined), "direct");
  });
});

describe("handleOuvertureRequest", () => {
  it("answers ok to a filled honeypot without sending", async () => {
    let sent = false;
    const response = await handleOuvertureRequest({ email: "a@b.fr", website: "spam" }, async () => {
      sent = true;
    });
    assert.deepEqual([response.status, sent], [200, false]);
  });

  it("maps each failure to its status", async () => {
    const fail = (error: Error) => () => Promise.reject(error);
    const body = { email: "a@b.fr" };
    assert.equal((await handleOuvertureRequest({ email: "nope" }, async () => {})).status, 400);
    assert.equal((await handleOuvertureRequest(body, fail(new InvalidRecipientError("to")))).status, 400);
    assert.equal((await handleOuvertureRequest(body, fail(new DailyCapReachedError("cap")))).status, 429);
    assert.equal((await handleOuvertureRequest(body, fail(new OuvertureUnavailableError("env")))).status, 503);
    assert.equal((await handleOuvertureRequest(body, fail(new Error("resend")))).status, 502);
  });
});

describe("sendConfirmation", () => {
  it("sends with a reply-to and an idempotency key per 6-hour window", async () => {
    const calls: Call[] = [];
    await sendConfirmation(claims, deps(fakeMail({ "emails.list": [{ data: { data: [] } }] }, calls)));
    const send = calls.find((call) => call.method === "emails.send");
    const [payload, options] = send?.args as [{ replyTo: string }, { idempotencyKey: string }];
    assert.equal(payload.replyTo, "contact@exemple.fr");
    assert.match(options.idempotencyKey, new RegExp(`/${Math.floor(NOW / (6 * 3600 * 1000))}$`));
  });

  it("stops at the daily cap", async () => {
    const today = { subject: CONFIRMATION_SUBJECT, created_at: "2026-10-24 09:00:00.000+00" };
    const calls: Call[] = [];
    const mail = fakeMail({ "emails.list": [{ data: { data: [today, today] } }] }, calls);
    await assert.rejects(sendConfirmation(claims, deps(mail)), DailyCapReachedError);
    assert.equal(calls.some((call) => call.method === "emails.send"), false);
  });

  it("turns a rejected recipient into InvalidRecipientError", async () => {
    const mail = fakeMail(
      {
        "emails.list": [{ data: { data: [] } }],
        "emails.send": [{ error: { name: "validation_error", message: "Invalid `to` field." } }],
      },
      [],
    );
    await assert.rejects(sendConfirmation(claims, deps(mail)), InvalidRecipientError);
  });
});

describe("confirmSubscription", () => {
  it("creates a new contact in the segment with its source", async () => {
    const calls: Call[] = [];
    await confirmSubscription(claims, deps(fakeMail({ "contacts.get": [notFound] }, calls)));
    const create = calls.find((call) => call.method === "contacts.create");
    assert.deepEqual(create?.args[0], {
      email: claims.email,
      unsubscribed: false,
      segments: [{ id: "segment" }],
      properties: { source: "facebook" },
    });
  });

  it("resubscribes an existing contact and adds it to the segment", async () => {
    const calls: Call[] = [];
    await confirmSubscription(claims, deps(fakeMail({}, calls)));
    assert.deepEqual(
      calls.map((call) => call.method),
      ["contacts.get", "contacts.update", "contacts.segments.add"],
    );
  });

  it("treats a concurrent creation as success", async () => {
    const calls: Call[] = [];
    const mail = fakeMail(
      {
        "contacts.get": [notFound, { data: { id: "c1" } }],
        "contacts.create": [{ error: { name: "validation_error", message: "Contact already exists" } }],
      },
      calls,
    );
    await confirmSubscription(claims, deps(mail));
    assert.deepEqual(
      calls.map((call) => call.method),
      ["contacts.get", "contacts.create", "contacts.get", "contacts.update", "contacts.segments.add"],
    );
  });
});
