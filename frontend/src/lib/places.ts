export type Lodging = "BIVOUAC" | "BAT_FLANC" | "TENTE";
export type PlaceStatus = "COMPLET" | "DISPONIBLE" | null;

export type PlaceCell = {
  date: string;
  type: Lodging;
  statut: PlaceStatus;
};

export type RefugePlaces = {
  id: number;
  nom: string;
  slug: string;
  cellules: PlaceCell[];
};

export type PlacesPayload = {
  du: string;
  au: string;
  derniereLecture: string | null;
  refuges: RefugePlaces[];
};

const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  weekday: "short",
  day: "numeric",
  month: "long",
  timeZone: "Europe/Paris",
});

const readingFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
});

export function formatPlaceDay(isoDate: string): string {
  return dayFormat.format(new Date(`${isoDate}T12:00:00`));
}

export function formatReading(iso: string | null): string {
  if (!iso) {
    return "pas encore de lecture";
  }
  return readingFormat.format(new Date(iso));
}

/**
 * Combien de temps Next garde la dernière réponse du parc. Le scraper tourne toutes les
 * 15 min, donc une minute de fraîcheur est largement suffisante — et surtout, tant que ce
 * cache est chaud, une page qui arrive d'un lien partagé ne dépend plus du réveil de l'API.
 *
 * Une minute plutôt que cinq : si un déploiement tombe pendant que l'API dort, la page
 * part avec un tableau vide, et on veut qu'elle se répare vite toute seule.
 */
export const PLACES_REVALIDATE = 60;

/** Au-delà, on préfère une page sans tableau à une page qui ne s'affiche jamais. */
const TIMEOUT_MS = 8000;

export async function fetchPlaces(): Promise<PlacesPayload | null> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }
  try {
    const response = await fetch(`${apiUrl}/api/places`, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: PLACES_REVALIDATE },
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as PlacesPayload;
  } catch {
    return null;
  }
}
