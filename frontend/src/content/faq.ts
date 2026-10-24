export const faqs = [
  {
    question: "Quels refuges du GR20 sont surveillés ?",
    answer:
      "Les 12 refuges du GR20 lus sur pnr-resa.corsica : Site d'Ortu di u piobbu, Refuge de Carozzu, Refuge d'Ascu stagnu, Refuge de Tighjettu, Refuge de Ciottulu di i mori, Refuge de Manganu, Refuge de Petra piana, Refuge de l'Onda, Refuge de Prati, Refuge d'Usciolu, Site d'Asinau et Refuge de Paliri. Chaque refuge est suivi en bivouac, en bât-flanc et en tente. Le tableau des disponibilités est sur la page Disponibilités.",
  },
  {
    question: "L'alerte est-elle gratuite ou à 9,90 € ?",
    answer:
      "Le matin, c'est gratuit. S'il y a eu une ouverture, un email part à 7 h, heure de Paris. L'alerte immédiate coûte 9,90 € pour la saison, en un seul paiement. Elle couvre tous les refuges et toutes les dates suivis avec cet email, jusqu'au 4 octobre 2026.",
  },
  {
    question: "Est-ce qu'AlerteGR20 réserve la place ?",
    answer:
      "AlerteGR20 ne réserve pas la place. Quand une place se libère, l'email indique le refuge, le type et la date. La réservation se fait sur pnr-resa.corsica.",
  },
  {
    question: "À quelle heure arrive l'email ?",
    answer:
      "L'alerte gratuite part à 7 h, heure de Paris, s'il y a eu au moins une ouverture depuis la veille. L'alerte immédiate part dès que la lecture voit un passage de complet à libre.",
  },
  {
    question: "Jusqu'à quand l'alerte est valable ?",
    answer:
      "La saison surveillée va jusqu'au 4 octobre 2026 inclus. Le paiement de 9,90 € couvre cette saison.",
  },
  {
    question: "En quoi c'est différent d'un autre outil similaire ?",
    answer:
      "Le récapitulatif quotidien est gratuit, sans carte bancaire, sans engagement et sans limite de durée autre que la fin de saison. Le passage en alerte immédiate à 9,90 € est optionnel, seulement pour être prévenu dès l'ouverture plutôt qu'à 7 h. Il n'y a aucun plafond : la même adresse email peut suivre tous les refuges et toutes les dates, sans limite de combinaisons. Le paiement de 9,90 € applique l'alerte immédiate à toutes ces combinaisons. Le site du parc est relu toutes les 15 minutes, jour et nuit, jusqu'à la fin de saison. Une place qui se libère à 2 h du matin est détectée tout de suite. Seul l'email gratuit attend le récapitulatif de 7 h. L'alerte payante part immédiatement, nuit comprise.",
    points: [
      "Le récapitulatif quotidien est gratuit, sans carte bancaire, sans engagement et sans limite de durée autre que la fin de saison. Le passage en alerte immédiate à 9,90 € est optionnel, seulement pour être prévenu dès l'ouverture plutôt qu'à 7 h.",
      "Il n'y a aucun plafond : la même adresse email peut suivre tous les refuges et toutes les dates, sans limite de combinaisons. Le paiement de 9,90 € applique l'alerte immédiate à toutes ces combinaisons.",
      "Le site du parc est relu toutes les 15 minutes, jour et nuit, jusqu'à la fin de saison. Une place qui se libère à 2 h du matin est détectée tout de suite. Seul l'email gratuit attend le récapitulatif de 7 h. L'alerte payante part immédiatement, nuit comprise.",
    ],
  },
] as const;

export const homeTitle = "Refuge GR20 complet : alerte disponibilité — AlerteGR20";

export const homeDescription =
  "Refuge GR20 complet ? Alerte disponibilité GR20 dès qu'une place se libère. Réservation refuge GR20 au parc. Gratuit à 7 h, ou 9,90 € jusqu'au 4 octobre 2026.";

/** Entre la fin de saison et l'annonce du Parc : on ne vend rien, on prend les emails. */
export const offSeasonFaqs = [
  {
    question: "Quand ouvrent les réservations des refuges du GR20 en 2027 ?",
    answer:
      "Le Parc naturel régional de Corse n'a pas encore publié la date 2027. En 2026, la plateforme pnr-resa.corsica a ouvert le 20 janvier. AlerteGR20 écrit aux inscrits le jour où le Parc annonce la date.",
  },
  {
    question: "Quels refuges du GR20 sont complets en premier ?",
    answer:
      "En 2026, Ortu di u Piobbu, Carrozzu et Usciolu sont partis en premier. Les semaines les plus demandées sont début juin et début septembre.",
  },
  {
    question: "Est-ce qu'AlerteGR20 réserve la place ?",
    answer:
      "AlerteGR20 ne réserve pas la place. Quand une place se libère, l'email indique le refuge, le type et la date. La réservation se fait sur pnr-resa.corsica.",
  },
  {
    question: "Quels refuges du GR20 sont surveillés ?",
    answer: faqs[0].answer,
  },
  {
    question: "Combien coûte l'alerte ?",
    answer:
      "L'inscription pour l'ouverture 2027 est gratuite, et il n'y a rien à payer aujourd'hui. Les alertes de place pour la saison 2027 seront annoncées aux inscrits.",
  },
] as const;

export const offSeasonHomeTitle = "Refuges GR20 2027 : réservation et alerte de place — AlerteGR20";

export const offSeasonHomeDescription =
  "Réservations des refuges du GR20 2027 : soyez prévenu par email, gratuitement, le jour où le Parc ouvre les réservations sur pnr-resa.corsica.";
