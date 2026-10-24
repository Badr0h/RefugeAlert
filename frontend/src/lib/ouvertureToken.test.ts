import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signOuvertureToken, verifyOuvertureToken } from "./ouvertureToken.ts";

const SECRET = "test-secret";
const NOW = Date.UTC(2026, 9, 24, 13, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;

describe("ouverture token", () => {
  it("returns the email it was signed for", () => {
    const token = signOuvertureToken("randonneur@exemple.fr", SECRET, NOW);
    assert.equal(verifyOuvertureToken(token, SECRET, NOW), "randonneur@exemple.fr");
  });

  it("is identical for the same address during the same UTC day", () => {
    const morning = signOuvertureToken("a@b.fr", SECRET, Date.UTC(2026, 9, 24, 0, 5));
    const evening = signOuvertureToken("a@b.fr", SECRET, Date.UTC(2026, 9, 24, 23, 55));
    assert.equal(morning, evening);
  });

  it("stays valid for seven days", () => {
    const token = signOuvertureToken("a@b.fr", SECRET, NOW);
    assert.equal(verifyOuvertureToken(token, SECRET, NOW + 7 * DAY_MS), "a@b.fr");
  });

  it("expires after the eighth day", () => {
    const token = signOuvertureToken("a@b.fr", SECRET, NOW);
    assert.equal(verifyOuvertureToken(token, SECRET, NOW + 9 * DAY_MS), null);
  });

  it("rejects a token signed with another secret", () => {
    const token = signOuvertureToken("a@b.fr", "other-secret", NOW);
    assert.equal(verifyOuvertureToken(token, SECRET, NOW), null);
  });

  it("rejects a token whose email was swapped", () => {
    const [, expiresAt, signature] = signOuvertureToken("a@b.fr", SECRET, NOW).split(".");
    const forged = `${Buffer.from("victime@b.fr").toString("base64url")}.${expiresAt}.${signature}`;
    assert.equal(verifyOuvertureToken(forged, SECRET, NOW), null);
  });

  it("rejects malformed input", () => {
    assert.equal(verifyOuvertureToken("", SECRET, NOW), null);
    assert.equal(verifyOuvertureToken("a.b", SECRET, NOW), null);
    assert.equal(verifyOuvertureToken("a.b.c.d", SECRET, NOW), null);
  });
});
