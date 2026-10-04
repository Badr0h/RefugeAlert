import { expect, test, type Frame, type Page } from "@playwright/test";
import { TEST_EMAIL, record, recordCreated, watch } from "./helpers";

/**
 * PADDLE EST EN MODE LIVE. Ce test ouvre le checkout et s'arrête à l'écran de paiement :
 * il ne saisit AUCUNE carte et ne valide rien. L'appel /api/checkout crée une transaction
 * Paddle « ready » non payée, sans débit.
 */

async function paddleFrame(page: Page): Promise<Frame> {
  await expect
    .poll(() => page.frames().some((f) => /paddle\.com/.test(f.url())), { timeout: 30_000, message: "iframe Paddle" })
    .toBe(true);
  return page.frames().find((f) => /paddle\.com/.test(f.url()))!;
}

async function frameText(frame: Frame): Promise<string> {
  // Le contenu de l'overlay arrive après le squelette : on attend qu'un prix soit rendu.
  await expect
    .poll(async () => (await frame.locator("body").innerText().catch(() => "")).match(/\d+[,.]\d{2}/) !== null, {
      timeout: 30_000,
      message: "prix affiché dans le checkout",
    })
    .toBe(true);
  return frame.locator("body").innerText();
}

test.describe("3. Tentative de paiement (arrêt avant paiement)", () => {
  test("le checkout s'ouvre sur alertegr20.com avec 9,90 €", async ({ page }, testInfo) => {
    const diag = watch(page);
    await page.goto("/");
    await expect(page.locator('select[name="refuge"]')).toBeEnabled({ timeout: 15_000 });

    const button = page.getByRole("button", { name: /Passer en alerte immédiate/ });
    const label = (await button.innerText()).trim();
    testInfo.annotations.push({ type: "libellé du bouton", description: label });
    // Le libellé attendu par le cahier des charges (README) : « … — 9,90€/saison ».
    expect.soft(label, "libellé du bouton payant").toBe("Passer en alerte immédiate — 9,90€/saison");

    await page.locator('input[name="email"]').fill(TEST_EMAIL);
    const [checkoutResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/checkout") && r.request().method() === "POST"),
      button.click(),
    ]);
    const payload = await checkoutResponse.json().catch(() => null);
    await testInfo.attach("reponse-checkout", { body: JSON.stringify({ status: checkoutResponse.status(), payload }, null, 2), contentType: "application/json" });
    expect(checkoutResponse.status(), JSON.stringify(payload)).toBe(200);
    recordCreated({ scenario: 3, paddleTransaction: payload?.transactionId, checkoutUrl: payload?.checkoutUrl });

    // Le lien de paiement renvoyé par Paddle doit pointer vers le domaine du site.
    const checkoutUrl = new URL(payload.checkoutUrl);
    testInfo.annotations.push({ type: "checkoutUrl", description: payload.checkoutUrl });
    expect(checkoutUrl.hostname, "domaine du lien de paiement").toMatch(/(^|\.)alertegr20\.com$/);
    expect(payload.checkoutUrl).not.toContain("zenithconvert");

    // L'overlay s'ouvre sur la page courante : l'adresse reste alertegr20.com.
    const frame = await paddleFrame(page);
    expect(new URL(page.url()).hostname).toBe("alertegr20.com");
    const text = await frameText(frame);
    await testInfo.attach("texte-checkout", { body: text, contentType: "text/plain" });
    await page.screenshot({ path: testInfo.outputPath("checkout-overlay.png"), fullPage: false });

    expect(text, "prix 9,90 € dans le checkout").toMatch(/9[,.]90\s?€|€\s?9[,.]90/);
    // L'email saisi sur le site est repris par Paddle : le randonneur ne le retape pas.
    await expect
      .poll(
        async () => {
          const input = frame.locator('input[type="email"]');
          const value = (await input.count()) ? await input.first().inputValue() : "";
          return value || (await frame.locator("body").innerText());
        },
        { timeout: 15_000, message: "email pré-rempli dans le checkout" },
      )
      .toContain(TEST_EMAIL.toLowerCase());
    // Paddle affiche le nom commercial du compte vendeur dans les mentions du checkout.
    expect.soft(text, "nom du vendeur Paddle visible par le client").not.toMatch(/zenith/i);
    await expect(page.getByRole("button", { name: /Passer en alerte immédiate|Ouverture du paiement/ })).toBeVisible();

    await record(testInfo, "/ (checkout overlay)", diag);
    expect.soft(diag.pageErrors).toEqual([]);

    // Deuxième chemin : le lien de paiement ouvert directement (fallback sans overlay,
    // ou lien envoyé par Paddle). On réutilise la même transaction, sans en créer une autre.
    const direct = await page.context().newPage();
    const diag2 = watch(direct);
    const res = await direct.goto(payload.checkoutUrl);
    expect(res?.status()).toBe(200);
    expect(new URL(direct.url()).hostname).toBe("alertegr20.com");
    const frame2 = await paddleFrame(direct);
    const text2 = await frameText(frame2);
    await testInfo.attach("texte-checkout-lien-direct", { body: text2, contentType: "text/plain" });
    await direct.screenshot({ path: testInfo.outputPath("checkout-lien-direct.png") });
    expect(text2).toMatch(/9[,.]90\s?€|€\s?9[,.]90/);
    await record(testInfo, "/?_ptxn=… (lien de paiement direct)", diag2);
    // ARRÊT ICI : aucune donnée de carte n'est saisie.
  });
});
