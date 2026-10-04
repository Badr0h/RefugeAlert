import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { RAW_ERROR_PATTERNS, record, watch } from "./helpers";

const UNSUBSCRIBED = "Vous ne recevrez plus d'alertes pour ce refuge";
const INVALID = "Ce lien n'est plus valide";

/**
 * Le lien de désinscription n'arrive que dans un email d'alerte ou le récapitulatif de 7 h :
 * l'inscription n'envoie pas de confirmation et l'API ne renvoie pas le token.
 * Pour le parcours complet, copier le token d'un vrai email :
 *   E2E_UNSUB_TOKEN=<uuid> npx playwright test 05
 */
const realToken = process.env.E2E_UNSUB_TOKEN;

test.describe("5. Désinscription", () => {
  test("vrai lien reçu par email : 1er clic confirme, 2e clic « lien non valide »", async ({ page }, testInfo) => {
    test.skip(!realToken, "Aucun email n'est envoyé à l'inscription : pas de token disponible (fournir E2E_UNSUB_TOKEN).");
    const diag = watch(page);
    await page.goto(`/desabonner?token=${realToken}`);
    await expect(page.locator("main [role=status]")).toHaveText(UNSUBSCRIBED);
    await page.screenshot({ path: testInfo.outputPath("desabonner-1.png") });
    await page.goto(`/desabonner?token=${realToken}`);
    await expect(page.locator("main [role=status]")).toHaveText(INVALID);
    await record(testInfo, "/desabonner (vrai token)", diag);
  });

  for (const [label, query] of [
    ["token inconnu (UUID valide)", `?token=${randomUUID()}`],
    ["token malformé", "?token=pas-un-uuid"],
    ["token vide", "?token="],
    ["sans paramètre", ""],
    ["injection HTML dans le token", "?token=%3Cscript%3Ealert(1)%3C%2Fscript%3E"],
  ] as const) {
    test(`lien ${label} → « ${INVALID} », sans erreur technique`, async ({ page }, testInfo) => {
      const diag = watch(page);
      const res = await page.goto(`/desabonner${query}`);
      expect(res?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveText("Désinscription");
      await expect(page.locator("main [role=status]")).toHaveText(INVALID);
      const text = await page.locator("body").innerText();
      for (const pattern of RAW_ERROR_PATTERNS) expect.soft(text).not.toMatch(pattern);
      // La page ne doit pas être indexée.
      expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("noindex");
      await record(testInfo, `/desabonner (${label})`, diag);
      expect.soft(diag.pageErrors).toEqual([]);
    });
  }
});
