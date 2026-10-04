/**
 * Fin de la saison suivie. Doit rester aligné sur SAISON_FIN côté serveur
 * (render.yaml) : le backend refuse les abonnements au-delà de cette date.
 */
export const SEASON_END = "2026-10-04";

/** Premier jour réservable : aujourd'hui, heure de Paris. */
export function today(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

/**
 * Vrai après la fin de saison : l'accueil et les pages refuges cessent alors de vendre
 * une alerte que le serveur refuserait, et envoient vers la liste d'ouverture 2027.
 * Les pages qui l'utilisent se régénèrent (revalidate) pour basculer sans déploiement.
 */
export function seasonOver(): boolean {
  return today() > SEASON_END;
}
