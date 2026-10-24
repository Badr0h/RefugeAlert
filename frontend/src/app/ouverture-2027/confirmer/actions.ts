"use server";

import { redirect } from "next/navigation";
import { claimsFromToken, confirmSubscription, OuvertureUnavailableError } from "../../../lib/ouverture";
import type { OuvertureClaims } from "../../../lib/ouvertureToken";

const PAGE = "/ouverture-2027/confirmer";

export async function confirmerInscription(formData: FormData): Promise<void> {
  const token = formData.get("token");
  if (typeof token !== "string") {
    redirect(`${PAGE}?statut=lien-invalide`);
  }
  let claims: OuvertureClaims | null;
  try {
    claims = claimsFromToken(token);
  } catch (error) {
    if (!(error instanceof OuvertureUnavailableError)) {
      throw error;
    }
    console.error("Confirmation ouverture indisponible", error);
    redirect(`${PAGE}?statut=indisponible`);
  }
  if (!claims) {
    redirect(`${PAGE}?statut=lien-invalide`);
  }
  let confirmed = false;
  try {
    await confirmSubscription(claims);
    confirmed = true;
  } catch (error) {
    console.error("Confirmation ouverture impossible", error);
  }
  redirect(confirmed ? `${PAGE}?statut=confirme` : `${PAGE}?statut=erreur&token=${encodeURIComponent(token)}`);
}
