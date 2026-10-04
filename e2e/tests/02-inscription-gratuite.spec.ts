import { expect, test } from "@playwright/test";
import { API_URL, RAW_ERROR_PATTERNS, TEST_EMAIL, parisDay, record, recordCreated, watch } from "./helpers";

test.describe("2. Inscription gratuite depuis l'accueil", () => {
  test("un randonneur crée une alerte gratuite", async ({ page, request }, testInfo) => {
    const diag = watch(page);
    const dateDebut = parisDay(2);
    const dateFin = parisDay(4);

    expect((await page.goto("/"))?.status()).toBe(200);

    const refuge = page.locator('select[name="refuge"]');
    await expect(refuge).toBeEnabled({ timeout: 15_000 });
    await refuge.selectOption({ label: "Refuge de Petra piana" });
    await page.locator('select[name="type"]').selectOption("BIVOUAC");
    await page.locator('input[name="dateDebut"]').fill(dateDebut);
    await page.locator('input[name="dateFin"]').fill(dateFin);
    await page.locator('input[name="email"]').fill(TEST_EMAIL);

    const [apiResponse] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/abonnements") && r.request().method() === "POST"),
      page.getByRole("button", { name: "M'alerter" }).click(),
    ]);
    const body = await apiResponse.json().catch(() => null);
    await testInfo.attach("reponse-api", { body: JSON.stringify({ status: apiResponse.status(), body }, null, 2), contentType: "application/json" });

    expect(apiResponse.status(), `réponse API : ${JSON.stringify(body)}`).toBe(201);
    const status = page.locator("form#alerter [role=status]");
    await expect(status).toHaveText("Alerte enregistrée. On vous écrit à cette adresse si une place se libère.");
    // Le bouton redevient disponible (pas d'état « Enregistrement… » bloqué).
    await expect(page.getByRole("button", { name: "M'alerter" })).toBeEnabled();

    recordCreated({ scenario: 2, ...body });

    // Vérification en base : l'API est idempotente sur (email, refuge, type, dates) et renvoie
    // l'id existant. Si l'enregistrement n'existait pas, on obtiendrait un id différent.
    const check = await request.post(`${API_URL}/api/abonnements`, {
      data: { email: TEST_EMAIL, refugeId: body.refugeId, typeHebergement: "BIVOUAC", dateDebut, dateFin },
    });
    expect(check.status()).toBe(201);
    const again = await check.json();
    expect(again.id, "même abonnement retrouvé en base").toBe(body.id);
    expect(again.refugeNom).toBe("Refuge de Petra piana");
    expect(again.email).toBe(TEST_EMAIL.toLowerCase());

    // Re-soumettre le même formulaire ne crée pas de doublon et reste clair pour l'utilisateur.
    const [second] = await Promise.all([
      page.waitForResponse((r) => r.url().endsWith("/api/abonnements") && r.request().method() === "POST"),
      page.getByRole("button", { name: "M'alerter" }).click(),
    ]);
    expect((await second.json()).id).toBe(body.id);
    await expect(status).toContainText("Alerte enregistrée");

    const bodyText = await page.locator("body").innerText();
    for (const pattern of RAW_ERROR_PATTERNS) expect.soft(bodyText).not.toMatch(pattern);
    await record(testInfo, "/ (inscription)", diag);
    expect.soft(diag.pageErrors).toEqual([]);
  });
});
