import { expect, test, type Page } from "@playwright/test";
import { API_URL, RAW_ERROR_PATTERNS, TEST_EMAIL, parisDay, record, recordCreated, watch } from "./helpers";

async function openForm(page: Page) {
  await page.goto("/");
  await expect(page.locator('select[name="refuge"]')).toBeEnabled({ timeout: 15_000 });
}

/** Compte les POST /api/abonnements : une validation navigateur doit empêcher l'envoi. */
function countPosts(page: Page) {
  const counter = { n: 0 };
  page.on("request", (r) => {
    if (r.url().endsWith("/api/abonnements") && r.method() === "POST") counter.n++;
  });
  return counter;
}

async function validationMessage(page: Page, name: string) {
  return page.locator(`[name="${name}"]`).evaluate((el: HTMLInputElement) => el.validationMessage);
}

async function noRawError(page: Page) {
  const text = await page.locator("body").innerText();
  for (const pattern of RAW_ERROR_PATTERNS) expect.soft(text).not.toMatch(pattern);
}

/** iOS Safari n'applique pas min/max à la soumission : on retire les bornes pour le simuler.
 * React les repose à chaque rendu, donc à appeler juste avant l'envoi. */
async function stripDateBounds(page: Page) {
  await page.locator('input[type="date"]').evaluateAll((els) =>
    els.forEach((el) => {
      el.removeAttribute("min");
      el.removeAttribute("max");
    }),
  );
}

const status = (page: Page) => page.locator("form#alerter [role=status]");
const submit = (page: Page) => page.getByRole("button", { name: "M'alerter" }).click();

test.describe("4. Erreurs et validations", () => {
  test("champs vides : le navigateur bloque et signale le premier champ", async ({ page }, testInfo) => {
    const diag = watch(page);
    const posts = countPosts(page);
    await openForm(page);
    await submit(page);
    await page.waitForTimeout(1_000);
    expect(posts.n, "aucun envoi au serveur").toBe(0);
    const msg = await validationMessage(page, "dateDebut");
    testInfo.annotations.push({ type: "message navigateur (date vide)", description: msg });
    expect(msg).not.toBe("");
    await noRawError(page);
    await record(testInfo, "/ (champs vides)", diag);
  });

  test("email mal formé (« randonneur@ ») : bloqué côté navigateur", async ({ page }, testInfo) => {
    const posts = countPosts(page);
    await openForm(page);
    await page.locator('input[name="dateDebut"]').fill(parisDay(1));
    await page.locator('input[name="dateFin"]').fill(parisDay(2));
    await page.locator('input[name="email"]').fill("randonneur@");
    await submit(page);
    await page.waitForTimeout(1_000);
    expect(posts.n).toBe(0);
    const msg = await validationMessage(page, "email");
    testInfo.annotations.push({ type: "message navigateur (email)", description: msg });
    expect(msg).not.toBe("");
    await noRawError(page);
  });

  test("email accepté par le navigateur mais invalide (« jean..dupont@gmail.com ») : message serveur clair", async ({ page }, testInfo) => {
    await openForm(page);
    await page.locator('input[name="dateDebut"]').fill(parisDay(1));
    await page.locator('input[name="dateFin"]').fill(parisDay(2));
    await page.locator('input[name="email"]').fill("jean..dupont@gmail.com");
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/abonnements")),
      submit(page),
    ]);
    const body = await res.json().catch(() => null);
    testInfo.annotations.push({ type: "réponse serveur", description: `${res.status()} ${JSON.stringify(body)}` });
    if (res.status() === 201) recordCreated({ scenario: 4, note: "email invalide accepté", ...body });
    expect(res.status(), "le serveur doit refuser cet email").toBe(400);
    await expect(status(page)).toHaveText("L'email n'est pas valide.");
    await noRawError(page);
  });

  test("date de fin avant la date de début : bloquée dans le formulaire", async ({ page }, testInfo) => {
    const posts = countPosts(page);
    await openForm(page);
    await page.locator('input[name="dateDebut"]').fill(parisDay(4));
    await page.locator('input[name="dateFin"]').fill(parisDay(2));
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await submit(page);
    await page.waitForTimeout(1_000);
    expect(posts.n).toBe(0);
    const msg = await validationMessage(page, "dateFin");
    testInfo.annotations.push({ type: "message navigateur (fin < début)", description: msg });
    expect(msg).not.toBe("");
  });

  test("date de fin avant début sur un navigateur qui ignore min/max (iOS Safari) : message serveur", async ({ page }, testInfo) => {
    await openForm(page);
    await page.locator('input[name="dateDebut"]').fill(parisDay(4));
    await page.locator('input[name="dateFin"]').fill(parisDay(2));
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await stripDateBounds(page);
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/abonnements")), submit(page)]);
    testInfo.annotations.push({ type: "réponse serveur", description: `${res.status()} ${await res.text()}` });
    expect(res.status()).toBe(400);
    await expect(status(page)).toHaveText("La date de fin est avant la date de début.");
    await noRawError(page);
  });

  test("dates hors saison (après le 4 octobre) : message serveur", async ({ page }) => {
    await openForm(page);
    await page.locator('input[name="dateDebut"]').fill("2026-10-10");
    await page.locator('input[name="dateFin"]').fill("2026-10-12");
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await stripDateBounds(page);
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/abonnements")), submit(page)]);
    expect(res.status()).toBe(400);
    await expect(status(page)).toContainText("La saison suivie s'arrête le 4 octobre 2026");
    await noRawError(page);
  });

  test("dates passées : message serveur", async ({ page }) => {
    await openForm(page);
    await page.locator('input[name="dateDebut"]').fill("2026-07-01");
    await page.locator('input[name="dateFin"]').fill("2026-07-03");
    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    await stripDateBounds(page);
    const [res] = await Promise.all([page.waitForResponse((r) => r.url().endsWith("/api/abonnements")), submit(page)]);
    expect(res.status()).toBe(400);
    await expect(status(page)).toHaveText("Ces dates sont déjà passées.");
  });

  test("paiement sans email : message clair, aucune transaction créée", async ({ page }) => {
    let checkoutCalls = 0;
    page.on("request", (r) => { if (r.url().endsWith("/api/checkout")) checkoutCalls++; });
    await openForm(page);
    await page.getByRole("button", { name: /Passer en alerte immédiate/ }).click();
    await expect(status(page)).toHaveText("Indiquez votre email pour passer en alerte immédiate.");
    expect(checkoutCalls).toBe(0);
  });

  test("paiement avec email mal formé : pas d'erreur brute", async ({ page }, testInfo) => {
    await openForm(page);
    await page.locator('input[name="email"]').fill("randonneur@");
    const [res] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/checkout"), { timeout: 20_000 }),
      page.getByRole("button", { name: /Passer en alerte immédiate/ }).click(),
    ]);
    const body = await res.text();
    testInfo.annotations.push({ type: "réponse /api/checkout", description: `${res.status()} ${body}` });
    if (res.ok()) recordCreated({ scenario: 4, note: "checkout créé avec email invalide", body });
    expect(res.status(), "le serveur doit refuser l'email avant d'appeler Paddle").toBe(400);
    await expect(status(page)).toBeVisible();
    testInfo.annotations.push({ type: "message affiché", description: await status(page).innerText() });
    await noRawError(page);
  });

  test("API directe : corps invalides → 400 JSON lisible, jamais 500", async ({ request }, testInfo) => {
    const cases: Record<string, unknown> = {
      vide: {},
      "type inconnu": { email: TEST_EMAIL, refugeId: 1, typeHebergement: "HAMAC", dateDebut: parisDay(1), dateFin: parisDay(2) },
      "date illisible": { email: TEST_EMAIL, refugeId: 1, typeHebergement: "TENTE", dateDebut: "demain", dateFin: parisDay(2) },
      "refuge inexistant": { email: TEST_EMAIL, refugeId: 9999, typeHebergement: "TENTE", dateDebut: parisDay(1), dateFin: parisDay(2) },
      "fin avant début": { email: TEST_EMAIL, refugeId: 1, typeHebergement: "TENTE", dateDebut: parisDay(4), dateFin: parisDay(2) },
    };
    const results: Record<string, string> = {};
    for (const [name, data] of Object.entries(cases)) {
      const res = await request.post(`${API_URL}/api/abonnements`, { data });
      results[name] = `${res.status()} ${await res.text()}`;
      expect.soft(res.status(), name).toBeGreaterThanOrEqual(400);
      expect.soft(res.status(), name).toBeLessThan(500);
    }
    await testInfo.attach("api-cas-invalides", { body: JSON.stringify(results, null, 2), contentType: "application/json" });
  });
});
