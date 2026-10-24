import type { MetadataRoute } from "next";
import { refugePages } from "../content/refuges";

const SITE = "https://alertegr20.com";

/**
 * Date de la dernière vraie modification du texte de chaque page. Google ignore un
 * lastmod qui change à chaque build : on la met à jour à la main quand le contenu change.
 */
const UPDATED = {
  home: "2026-10-24",
  places: "2026-10-24",
  ouverture: "2026-10-24",
  refuges: "2026-10-24",
  aPropos: "2026-10-24",
  mentions: "2026-10-24",
  confidentialite: "2026-10-24",
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE}/`, lastModified: UPDATED.home, priority: 1 },
    { url: `${SITE}/ouverture-2027`, lastModified: UPDATED.ouverture, priority: 0.9 },
    { url: `${SITE}/places`, lastModified: UPDATED.places, priority: 0.8 },
    ...refugePages.map((refuge) => ({
      url: `${SITE}/refuges/${refuge.publicSlug}`,
      lastModified: UPDATED.refuges,
      priority: refuge.sitemapPriority,
    })),
    { url: `${SITE}/a-propos`, lastModified: UPDATED.aPropos, priority: 0.5 },
    { url: `${SITE}/mentions`, lastModified: UPDATED.mentions, priority: 0.3 },
    { url: `${SITE}/confidentialite`, lastModified: UPDATED.confidentialite, priority: 0.3 },
  ];
}
