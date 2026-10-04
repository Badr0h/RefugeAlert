import fs from "node:fs";
import path from "node:path";
import type { Page, TestInfo } from "@playwright/test";

export const API_URL = process.env.E2E_API_URL ?? "https://refugealert.onrender.com";

/** Adresse de test : un alias « + » de la boîte du propriétaire, facile à retrouver et à supprimer. */
export const TEST_EMAIL = process.env.E2E_EMAIL ?? "oussaihbadreddine+e2e-alertegr20@gmail.com";

export const SEASON_END = "2026-10-04";

export const REFUGE_SLUGS = [
  "ortu-di-u-piobbu",
  "carrozzu",
  "usciolu",
  "ascu-stagnu",
  "tighjettu",
  "ciottulu-di-i-mori",
  "manganu",
  "petra-piana",
  "onda",
  "prati",
  "asinao",
  "paliri",
] as const;

const DIAG_FILE = path.join(__dirname, "..", "test-results", "diagnostics.jsonl");
const CREATED_FILE = path.join(__dirname, "..", "test-results", "created-data.jsonl");

/** Aujourd'hui + n jours, heure de Paris, borné à la fin de saison. */
export function parisDay(offset: number): string {
  const base = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
  const d = new Date(`${base}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + offset);
  const iso = d.toISOString().slice(0, 10);
  return iso > SEASON_END ? SEASON_END : iso;
}

export type Diagnostics = {
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: string[];
  failedResponses: { url: string; status: number; method: string }[];
  failedRequests: { url: string; failure: string }[];
};

/**
 * Écoute tout ce qu'un utilisateur ne voit pas : erreurs console, exceptions JS,
 * réponses 4xx/5xx et requêtes qui n'aboutissent pas.
 */
export function watch(page: Page): Diagnostics {
  const diag: Diagnostics = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
    failedResponses: [],
    failedRequests: [],
  };
  page.on("console", (msg) => {
    if (msg.type() === "error") diag.consoleErrors.push(msg.text());
    if (msg.type() === "warning") diag.consoleWarnings.push(msg.text());
  });
  page.on("pageerror", (err) => diag.pageErrors.push(`${err.name}: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 400) {
      diag.failedResponses.push({ url: res.url(), status: res.status(), method: res.request().method() });
    }
  });
  page.on("requestfailed", (req) => {
    diag.failedRequests.push({ url: req.url(), failure: req.failure()?.errorText ?? "?" });
  });
  return diag;
}

/** Garde la trace des diagnostics d'une page pour le rapport final. */
export async function record(testInfo: TestInfo, pageLabel: string, diag: Diagnostics) {
  fs.mkdirSync(path.dirname(DIAG_FILE), { recursive: true });
  fs.appendFileSync(DIAG_FILE, JSON.stringify({ test: testInfo.title, page: pageLabel, ...diag }) + "\n");
  await testInfo.attach(`diagnostics-${pageLabel}`, {
    body: JSON.stringify(diag, null, 2),
    contentType: "application/json",
  });
}

/** Note une donnée créée en prod, pour le nettoyage. */
export function recordCreated(entry: Record<string, unknown>) {
  fs.mkdirSync(path.dirname(CREATED_FILE), { recursive: true });
  fs.appendFileSync(CREATED_FILE, JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n");
}

/** Textes qui ne doivent jamais apparaître devant un randonneur. */
export const RAW_ERROR_PATTERNS = [
  /Internal Server Error/i,
  /Whitelabel Error Page/i,
  /\b500\b.*error/i,
  /Application error: a (client|server)-side exception/i,
  /Unexpected token/i,
  /stack trace/i,
  /\[object Object\]/,
  /undefined|NaN/,
];
