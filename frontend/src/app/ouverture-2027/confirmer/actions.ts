"use server";

import { redirect } from "next/navigation";
import { confirmSubscription, emailFromToken } from "../../../lib/ouverture";

export async function confirmerInscription(formData: FormData): Promise<void> {
  const token = formData.get("token");
  const email = typeof token === "string" ? emailFromToken(token) : null;
  if (!email || typeof token !== "string") {
    redirect("/ouverture-2027/confirmer?statut=lien-invalide");
  }
  try {
    await confirmSubscription(email);
  } catch (error) {
    console.error("Confirmation ouverture impossible", error);
    redirect(`/ouverture-2027/confirmer?statut=erreur&token=${encodeURIComponent(token)}`);
  }
  redirect("/ouverture-2027/confirmer?statut=confirme");
}
