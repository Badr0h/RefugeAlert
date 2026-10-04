const SITE = "https://alertegr20.com";

export const socialImage = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "AlerteGR20 — refuge GR20 complet, alerte disponibilité",
};

const productImage = `${SITE}/opengraph-image`;

export function alertProduct(name: string, description: string, path: string) {
  const url = `${SITE}${path}`;
  return {
    "@type": "Product",
    name,
    description,
    url,
    image: productImage,
    brand: { "@type": "Brand", name: "AlerteGR20" },
    offers: [
      {
        "@type": "Offer",
        name: "Récapitulatif du matin",
        price: "0",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url,
        description:
          "Gratuit en option. Un email à 7 h, heure de Paris, s'il y a eu une ouverture, jusqu'au 4 octobre 2026.",
      },
      {
        "@type": "Offer",
        name: "Alerte immédiate",
        price: "9.90",
        priceCurrency: "EUR",
        availability: "https://schema.org/InStock",
        url,
        description:
          "9,90 € pour la saison, en un seul paiement. L'alerte part dès l'ouverture, jusqu'au 4 octobre 2026. Le récapitulatif du matin reste gratuit en option.",
      },
    ],
  };
}
