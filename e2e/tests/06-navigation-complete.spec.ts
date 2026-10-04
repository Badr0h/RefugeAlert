import { expect, test } from "@playwright/test";
import { RAW_ERROR_PATTERNS, REFUGE_SLUGS, record, watch } from "./helpers";

const PAGES = ["/", "/places", "/mentions", ...REFUGE_SLUGS.map((s) => `/refuges/${s}`)];

// Liens internes rencontrés sur toutes les pages, vérifiés une seule fois à la fin.
const internalLinks = new Map<string, Set<string>>();

test.describe("6-7. Navigation complète et santé technique", () => {
  for (const path of PAGES) {
    test(`page ${path}`, async ({ page }, testInfo) => {
      const diag = watch(page);
      const res = await page.goto(path, { waitUntil: "networkidle" });
      expect(res?.status(), `statut ${path}`).toBe(200);
      await expect(page.locator("h1").first()).toBeVisible();

      // Aucun état de chargement ne doit rester affiché.
      await page.waitForTimeout(2_000);
      await expect(page.getByText("Chargement…")).toHaveCount(0);

      const text = await page.locator("body").innerText();
      for (const pattern of RAW_ERROR_PATTERNS) expect.soft(text, `texte brut d'erreur sur ${path}`).not.toMatch(pattern);
      // Le tableau des places ne doit pas afficher son message d'échec de lecture.
      const alerts = await page.locator("[role=alert]").allInnerTexts();
      expect.soft(alerts.filter((a) => a.trim()), `alertes visibles sur ${path}`).toEqual([]);

      const hrefs = await page.locator("a[href]").evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));
      for (const href of hrefs) {
        const url = new URL(href);
        if (url.hostname !== "alertegr20.com") continue;
        const key = url.pathname + url.search;
        if (!internalLinks.has(key)) internalLinks.set(key, new Set());
        internalLinks.get(key)!.add(path);
      }

      // SEO de base par page : title et description uniques et présents.
      expect.soft(await page.title(), "title").not.toBe("");
      expect.soft(await page.locator('meta[name="description"]').getAttribute("content"), "meta description").toBeTruthy();

      await page.screenshot({ path: testInfo.outputPath("page.png"), fullPage: true });
      await record(testInfo, path, diag);
      expect.soft(diag.pageErrors, `exceptions JS sur ${path}`).toEqual([]);
      expect.soft(diag.consoleErrors, `erreurs console sur ${path}`).toEqual([]);
      expect.soft(diag.failedResponses, `réponses 4xx/5xx sur ${path}`).toEqual([]);
    });
  }

  test("aucun lien interne cassé (404) + sitemap", async ({ request }, testInfo) => {
    const sitemap = await request.get("/sitemap.xml");
    expect(sitemap.status()).toBe(200);
    for (const loc of (await sitemap.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const url = new URL(loc[1]);
      if (!internalLinks.has(url.pathname)) internalLinks.set(url.pathname, new Set(["sitemap.xml"]));
    }
    const robots = await request.get("/robots.txt");
    expect(robots.status()).toBe(200);

    const broken: string[] = [];
    const checked: Record<string, number> = {};
    for (const [link, from] of internalLinks) {
      const res = await request.get(link, { maxRedirects: 5 });
      checked[link] = res.status();
      if (res.status() >= 400) broken.push(`${link} (${res.status()}) ← ${[...from].join(", ")}`);
    }
    await testInfo.attach("liens-internes", { body: JSON.stringify(checked, null, 2), contentType: "application/json" });
    expect(Object.keys(checked).length, "au moins les 15 pages du site").toBeGreaterThanOrEqual(15);
    expect(broken, "liens internes cassés").toEqual([]);
  });

  test("une page refuge inconnue renvoie une vraie 404 lisible", async ({ page }) => {
    const res = await page.goto("/refuges/n-existe-pas");
    expect(res?.status()).toBe(404);
    const text = await page.locator("body").innerText();
    for (const pattern of RAW_ERROR_PATTERNS) expect.soft(text).not.toMatch(pattern);
  });
});
