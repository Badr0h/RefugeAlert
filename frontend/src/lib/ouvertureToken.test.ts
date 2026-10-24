import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { signOuvertureToken, verifyOuvertureToken } from "./ouvertureToken.ts";

const SECRET = "test-secret";
const NOW = Date.UTC(2026, 9, 24, 13, 0, 0);
const DAY_MS = 24 * 60 * 60 * 1000;
const claims = { email: "randonneur@exemple.fr", source: "facebook" };

describe("ouverture token", () => {
  it("returns the claims it was signed with", () => {
    const token = signOuvertureToken(claims, SECRET, NOW);
    assert.deepEqual(verifyOuvertureToken(token, SECRET, NOW), claims);
  });

  it("is identical for the same claims during the same UTC day", () => {
    const morning = signOuvertureToken(claims, SECRET, Date.UTC(2026, 9, 24, 0, 5));
    const evening = signOuvertureToken(claims, SECRET, Date.UTC(2026, 9, 24, 23, 55));
    assert.equal(morning, evening);
  });

  it("stays valid for seven days", () => {
    const token = signOuvertureToken(claims, SECRET, NOW);
    assert.deepEqual(verifyOuvertureToken(token, SECRET, NOW + 7 * DAY_MS), claims);
  });

  it("expires after the eighth day", () => {
    const token = signOuvertureToken(claims, SECRET, NOW);
    assert.equal(verifyOuvertureToken(token, SECRET, NOW + 9 * DAY_MS), null);
  });

  it("rejects a token signed with another secret", () => {
    const token = signOuvertureToken(claims, "other-secret", NOW);
    assert.equal(verifyOuvertureToken(token, SECRET, NOW), null);
  });

  it("rejects a token whose claims were swapped", () => {
    const [, expiresAt, signature] = signOuvertureToken(claims, SECRET, NOW).split(".");
    const forgedClaims = Buffer.from(JSON.stringify({ e: "victime@b.fr", s: "direct" })).toString("base64url");
    assert.equal(verifyOuvertureToken(`${forgedClaims}.${expiresAt}.${signature}`, SECRET, NOW), null);
  });

  it("rejects malformed input", () => {
    assert.equal(verifyOuvertureToken("", SECRET, NOW), null);
    assert.equal(verifyOuvertureToken("a.b", SECRET, NOW), null);
    assert.equal(verifyOuvertureToken("a.b.c.d", SECRET, NOW), null);
  });
});
