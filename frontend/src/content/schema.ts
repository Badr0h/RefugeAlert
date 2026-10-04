/** Nœuds JSON-LD partagés : chaque page y renvoie par @id au lieu de les répéter. */
const SITE = "https://alertegr20.com";

export const ORGANIZATION_ID = `${SITE}/#organization`;
export const WEBSITE_ID = `${SITE}/#website`;

export const founder = {
  "@type": "Person",
  "@id": `${SITE}/a-propos#badreddine-oussaih`,
  name: "Badreddine Oussaih",
  jobTitle: "Développeur",
  url: `${SITE}/a-propos`,
  email: "oussaihbadreddine@gmail.com",
};

export const organization = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: "AlerteGR20",
  url: SITE,
  logo: `${SITE}/apple-icon`,
  email: "oussaihbadreddine@gmail.com",
  description:
    "AlerteGR20 lit les disponibilités des refuges du GR20 sur pnr-resa.corsica toutes les 15 minutes et prévient par email quand une place se libère. Le site ne réserve pas.",
  areaServed: "Corse",
  foundingDate: "2026-09",
  founder: { "@id": founder["@id"] },
};

export const website = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "AlerteGR20",
  url: SITE,
  inLanguage: "fr-FR",
  publisher: { "@id": ORGANIZATION_ID },
};

/** Fil d'Ariane : Accueil, puis chaque niveau donné. */
export function breadcrumb(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Accueil", path: "/" }, ...items].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE}${item.path === "/" ? "/" : item.path}`,
    })),
  };
}

export function faqPage(items: readonly { question: string; answer: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
