import { expect, test } from "@playwright/test";
import { RAW_ERROR_PATTERNS, record, watch } from "./helpers";

// iPhone SE / 13 mini : 375 px, tactile. Arrivée depuis un lien Facebook (fbclid + referer).
test.use({
  viewport: { width: 375, height: 667 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBAV/470.0]",
  extraHTTPHeaders: { Referer: "https://l.facebook.com/" },
});

test.describe("1. Arrivée depuis un lien partagé (mobile 375px)", () => {
  test("page refuge Carrozzu depuis Facebook", async ({ page }, testInfo) => {
    const diag = watch(page);
    const response = await page.goto("/refuges/carrozzu?fbclid=IwAR0e2eTestFacebookClickId");
    expect(response?.status(), "statut HTTP de la page").toBe(200);

    await expect(page.locator("h1")).toBeVisible();

    // Le formulaire est placé sur « Refuge de Carozzu » (nom du stock).
    const refuge = page.locator('select[name="refuge"]');
    await expect(refuge).toBeEnabled({ timeout: 10_000 });
    await expect(refuge.locator("option:checked")).toHaveText("Refuge de Carozzu");

    // Après quelques secondes, plus aucun « Chargement… » à l'écran.
    await page.waitForTimeout(4_000);
    await expect(page.getByText("Chargement…")).toHaveCount(0);

    // Pas de débordement horizontal : la page ne doit pas pouvoir glisser latéralement.
    const overflow = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const offenders: string[] = [];
      document.querySelectorAll<HTMLElement>("body *").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && (r.right > vw + 1 || r.left < -1)) {
          // On ignore ce qui est dans un conteneur à défilement horizontal voulu (tableaux).
          let p: HTMLElement | null = el.parentElement;
          while (p) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === "auto" || ox === "scroll" || ox === "hidden") return;
            p = p.parentElement;
          }
          offenders.push(`${el.tagName.toLowerCase()}.${el.className.toString().slice(0, 40)} (right=${Math.round(r.right)})`);
        }
      });
      return { vw, scrollWidth: document.documentElement.scrollWidth, offenders: offenders.slice(0, 10) };
    });
    await testInfo.attach("overflow", { body: JSON.stringify(overflow, null, 2), contentType: "application/json" });
    expect(overflow.scrollWidth, `débordement horizontal : ${overflow.offenders.join(", ")}`).toBeLessThanOrEqual(overflow.vw);

    // Utilisable au doigt : cibles d'au moins 44 px de haut (recommandation Apple / WCAG 2.5.5).
    const form = page.locator("form#alerter");
    await form.scrollIntoViewIfNeeded();
    for (const target of [
      refuge,
      page.locator('select[name="type"]'),
      page.locator('input[name="dateDebut"]'),
      page.locator('input[name="dateFin"]'),
      page.locator('input[name="email"]'),
      page.getByRole("button", { name: "M'alerter" }),
      page.getByRole("button", { name: /Passer en alerte immédiate/ }),
    ]) {
      await expect(target).toBeVisible();
      const box = await target.boundingBox();
      expect(box, "élément sans boîte").not.toBeNull();
      expect.soft(box!.height, `hauteur tactile de ${await target.getAttribute("name") ?? "bouton"}`).toBeGreaterThanOrEqual(44);
      expect.soft(box!.x + box!.width, "élément coupé à droite").toBeLessThanOrEqual(375);
    }

    // Un tap sur le champ email donne bien le focus et accepte la saisie.
    const email = page.locator('input[name="email"]');
    await email.tap();
    await expect(email).toBeFocused();
    await email.fill("randonneur@exemple.fr");
    await expect(email).toHaveValue("randonneur@exemple.fr");

    // Aperçu Facebook : balises Open Graph présentes et image joignable.
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content");
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect.soft(ogTitle, "og:title").toBeTruthy();
    expect.soft(ogImage, "og:image").toBeTruthy();
    if (ogImage) {
      const img = await page.request.get(ogImage);
      expect.soft(img.status(), `og:image ${ogImage}`).toBe(200);
      expect.soft(img.headers()["content-type"] ?? "").toContain("image/");
    }

    const bodyText = await page.locator("body").innerText();
    for (const pattern of RAW_ERROR_PATTERNS) expect.soft(bodyText).not.toMatch(pattern);

    await page.screenshot({ path: testInfo.outputPath("carrozzu-mobile-full.png"), fullPage: true });
    await record(testInfo, "/refuges/carrozzu (mobile)", diag);
    expect.soft(diag.pageErrors, "exceptions JavaScript").toEqual([]);
  });
});
