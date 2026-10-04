import { defineConfig, devices } from "@playwright/test";

/**
 * Tests E2E contre la PRODUCTION (https://alertegr20.com).
 * Pas de serveur local : rien n'est démarré ici.
 *
 * E2E_BASE_URL   pour viser un autre front (préprod, Vercel preview).
 * E2E_EMAIL      adresse qui reçoit les alertes de test.
 * E2E_UNSUB_TOKEN  token d'un vrai lien de désinscription (scénario 5 complet).
 */
export default defineConfig({
  testDir: "./tests",
  // Les scénarios écrivent en base de prod : on les enchaîne, sans parallélisme.
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }], ["json", { outputFile: "test-results/results.json" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://alertegr20.com",
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    screenshot: "on",
    trace: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"], locale: "fr-FR" } }],
});
