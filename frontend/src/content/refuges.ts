export type RefugePageContent = {
  publicSlug: string;
  dbSlug: string;
  searchName: string;
  officialName: string;
  title: string;
  description: string;
  paragraphs: readonly string[];
  sitemapPriority: number;
};

export const refugePages: readonly RefugePageContent[] = [
  {
    publicSlug: "ortu-di-u-piobbu",
    dbSlug: "ortu-di-u-piobbu",
    searchName: "Ortu di u Piobbu",
    officialName: "Site d'Ortu di u piobbu",
    title: "Ortu di u Piobbu complet — disponibilité | AlerteGR20",
    description:
      "Ortu di u Piobbu complet ? Disponibilité du premier refuge du GR20. Bivouac ou tente, pas de bât-flanc. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou 9,90€.",
    sitemapPriority: 0.9,
    paragraphs: [
      "Ortu di u Piobbu est la première nuit du GR20, six heures et demie après Calenzana. Le sentier quitte la fontaine de San'Antone, passe le dernier point d'eau à Ortiventi, puis le promontoire d'Arghjova. Bocca à u Saltu ouvre la vue sur la mer. Le site est à 1 520 m. Aucun départ de Calenzana n'est autorisé après 11 h, et beaucoup partent le même matin : avec Carrozzu et Usciolu, c'est l'un des trois refuges qui affichent complet en premier.",
      "Sur le stock du parc, le nom est « Site d'Ortu di u piobbu ». Il n'y a pas de bât-flanc : seulement le bivouac et la tente en location. La recharge du téléphone y est payante. La nuit d'après est Carrozzu, sans eau entre la source au-dessus d'Ortu et la terrasse du refuge.",
    ],
  },
  {
    publicSlug: "carrozzu",
    dbSlug: "carozzu",
    searchName: "Carrozzu",
    officialName: "Refuge de Carozzu",
    title: "Carrozzu GR20 complet — disponibilité | AlerteGR20",
    description:
      "Carrozzu complet sur le GR20 ? Le stock écrit Carozzu. Alerte disponibilité en bivouac, bât-flanc ou tente jusqu'au 4 octobre 2026. Gratuit à 7 h, ou 9,90 €.",
    sitemapPriority: 0.9,
    paragraphs: [
      "Carrozzu est la deuxième nuit, entre Ortu di u Piobbu et Ascu Stagnu. Le parc écrit aussi Carozzu : c'est le nom exact du stock sur pnr-resa.corsica. L'étape qui y mène est minérale. Il n'y a plus d'eau après la source au-dessus d'Ortu. Bocca di Pisciaghja passe vers 2 020 m, puis les éboulis et la longue descente aboutissent à la terrasse du refuge.",
      "Le lendemain, la passerelle de Spasimata et le lac de la Muvrella — impropre à la consommation — ouvrent la journée vers Ascu Stagnu. Comme Ortu et Usciolu, Carrozzu part tôt. Une annulation peut libérer un bivouac, un bât-flanc ou une tente : l'alerte surveille ce passage de complet à libre.",
    ],
  },
  {
    publicSlug: "usciolu",
    dbSlug: "usciolu",
    searchName: "Usciolu",
    officialName: "Refuge d'Usciolu",
    title: "Refuge Usciolu complet — disponibilité GR20 | AlerteGR20",
    description:
      "Refuge Usciolu complet ? Disponibilité GR20 : bivouac, bât-flanc, tente. Manque d'eau en juillet-août. Alerte jusqu'au 4 octobre 2026, à 7 h ou dès l'ouverture.",
    sitemapPriority: 0.9,
    paragraphs: [
      "Usciolu est dans le sud, à la fin de l'étape qui part de Prati. Le sentier quitte le plateau, monte vers Punta Cappella, puis suit les crêtes entre la vallée du Taravu et celle du Fium'Orbu. Au col de Laparu, un chemin empierré traverse un peu de forêt avant le retour en terrain minéral. Le parc signale un manque d'eau en juillet et en août.",
      "C'est le troisième site qui sature en premier, avec Ortu di u Piobbu et Carrozzu. Le stock l'écrit « Refuge d'Usciolu ». Le lendemain, l'étape file vers le plateau du Cuscione, puis Asinao. L'alerte suit le bivouac, le bât-flanc et la tente.",
    ],
  },
  {
    publicSlug: "ascu-stagnu",
    dbSlug: "ascu-stagnu",
    searchName: "Ascu Stagnu",
    officialName: "Refuge d'Ascu stagnu",
    title: "Ascu Stagnu GR20 — disponibilité | AlerteGR20",
    description:
      "Disponibilité d'Ascu Stagnu, troisième nuit du GR20 après Carrozzu. Bivouac, bât-flanc, tente. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Ascu Stagnu est la troisième nuit, après Carrozzu et avant Tighjettu. L'étape traverse la passerelle de Spasimata, longe le lac de la Muvrella — l'eau n'y est pas potable — et franchit Bocca di Stagnu vers 2 010 m. La descente passe des pins laricio jusqu'à la station du Haut Asco, où se trouve le refuge. C'est un des rares points du nord où l'on peut se ravitailler. Le lendemain, l'itinéraire officiel évite le cirque de la Solitude, fermé depuis 2015, et rejoint Tighjettu.",
    ],
  },
  {
    publicSlug: "tighjettu",
    dbSlug: "tighjettu",
    searchName: "Tighjettu",
    officialName: "Refuge de Tighjettu",
    title: "Tighjettu GR20 complet — disponibilité | AlerteGR20",
    description:
      "Tighjettu complet ? Disponibilité GR20 après Ascu Stagnu. Bivouac, bât-flanc et tente. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou immédiate à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Tighjettu se rejoint depuis Ascu Stagnu par la déviation officielle du GR20. Le cirque de la Solitude est interdit depuis les éboulements de 2015. La journée est longue : dalles, pointe des Éboulis, Bocca Crucetta au-dessus du lac du Cintu, puis la descente au refuge. Le lendemain est plus court, environ quatre heures jusqu'à Ciottulu di i Mori, sous la face est de la Paglia Orba.",
    ],
  },
  {
    publicSlug: "ciottulu-di-i-mori",
    dbSlug: "ciottulu-di-i-mori",
    searchName: "Ciottulu di i Mori",
    officialName: "Refuge de Ciottulu di i mori",
    title: "Ciottulu di i Mori — disponibilité GR20 | AlerteGR20",
    description:
      "Disponibilité de Ciottulu di i Mori, sous la Paglia Orba. Bivouac, bât-flanc ou tente sur le GR20. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Ciottulu di i Mori est à 1 991 m, sous la face est de la Paglia Orba. Depuis Tighjettu, l'étape est courte : descente vers le Viru, courbe de niveau en forêt, puis Bocca Fuciale. Beaucoup en profitent pour monter à la Paglia Orba ou au Capu Tafunatu, hors balisage. Le soir, les crêtes de Ghjarghiole regardent le golfe de Porto. Le lendemain est une longue étape vers Manganu, par le lac de Ninu.",
    ],
  },
  {
    publicSlug: "manganu",
    dbSlug: "manganu",
    searchName: "Manganu",
    officialName: "Refuge de Manganu",
    title: "Refuge de Manganu GR20 — disponibilité | AlerteGR20",
    description:
      "Disponibilité du refuge de Manganu, GR20, après le lac de Ninu. Bivouac, bât-flanc et tente. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Manganu ferme la longue étape qui part de Ciottulu di i Mori. Après les bergeries d'E Radule et le Castel di Verghju, le sentier longe le lac de Ninu et ses pozzines, puis franchit Bocca d'Acqua Ciarnente, la limite entre la Haute-Corse et la Corse-du-Sud. Le refuge est au pied de Bocca alle Porte, avec une aire de bivouac au bord de la rivière. Le lendemain, la brèche de Capitellu mène à Petra Piana.",
    ],
  },
  {
    publicSlug: "petra-piana",
    dbSlug: "petra-piana",
    searchName: "Petra Piana",
    officialName: "Refuge de Petra piana",
    title: "Petra Piana GR20 — disponibilité | AlerteGR20",
    description:
      "Petra Piana : disponibilité du refuge du GR20 après la brèche de Capitellu. Bivouac, bât-flanc, tente. Alerte jusqu'au 4 octobre 2026, à 7 h ou dès l'ouverture.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Petra Piana est la nuit qui suit la brèche de Capitellu. Depuis Manganu, l'étape passe Bocca alle Porte, la brèche — vue sur les lacs de Melu et de Capitellu — puis Bocca Muzzella. C'est une journée minérale, avec des névés possibles en début de saison. Le lendemain, deux chemins mènent à l'Onda : le GR par la vallée du Manganellu, ou la variante des crêtes, seulement par temps sûr.",
    ],
  },
  {
    publicSlug: "onda",
    dbSlug: "onda",
    searchName: "l'Onda",
    officialName: "Refuge de l'Onda",
    title: "Refuge de l'Onda GR20 — disponibilité | AlerteGR20",
    description:
      "Disponibilité du refuge de l'Onda, dernière nuit du parc avant Vizzavona. Bivouac, bât-flanc, tente. Alerte GR20 jusqu'au 4 octobre 2026, à 7 h ou à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "L'Onda est la dernière nuit en refuge du parc avant Vizzavona, donc avant la fin de la partie nord. Le parc y compte 16 couchages à l'intérieur et une grande aire de bivouac plate, en secteur pastoral. On y arrive de Petra Piana par la vallée et les vasques du Manganellu, ou par les crêtes si le temps est sûr. Le lendemain descend vers les cascades des Anglais. Les nuitées de Vizzavona sont chez des hébergeurs privés : cette alerte ne les couvre pas.",
    ],
  },
  {
    publicSlug: "prati",
    dbSlug: "prati",
    searchName: "Prati",
    officialName: "Refuge de Prati",
    title: "Refuge de Prati GR20 complet — disponibilité | AlerteGR20",
    description:
      "Refuge de Prati complet ? Disponibilité GR20 après Bocca d'Oru. Bivouac, bât-flanc, tente. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Prati est le premier refuge du parc dans la partie sud, après Vizzavona et la station d'E Capannelle. L'étape qui y mène passe le col de Verde et Bocca d'Oru, d'où l'on voit la mer et l'archipel toscan. Le refuge est sur un plateau herbeux, avec le lever de soleil sur la mer Tyrrhénienne. Le lendemain, les crêtes mènent à Usciolu, l'un des trois sites qui partent en premier.",
    ],
  },
  {
    publicSlug: "asinao",
    dbSlug: "asinau",
    searchName: "Asinao",
    officialName: "Site d'Asinau",
    title: "Asinao GR20 complet — disponibilité Asinau | AlerteGR20",
    description:
      "Asinao, écrit Asinau sur le stock : disponibilité GR20, bivouac et tente, pas de bât-flanc. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou dès l'ouverture.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Asinao est le nom de l'étape sur le site du parc. Le stock de réservation l'écrit « Site d'Asinau ». On y descend depuis le plateau du Cuscione, après Bocca Stazzunara : la descente est longue, rocailleuse et abrupte, même si le refuge paraît proche. Un détour d'une demi-heure monte à l'Alcudina, au-dessus du plateau.",
      "Comme à Ortu di u Piobbu, il n'y a pas de bât-flanc : seulement le bivouac et la tente en location. Le lendemain traverse les aiguilles de Bavella, par le GR ou par la variante alpine, jusqu'à Paliri, dernière nuit avant Conca.",
    ],
  },
  {
    publicSlug: "paliri",
    dbSlug: "paliri",
    searchName: "Paliri",
    officialName: "Refuge de Paliri",
    title: "Paliri GR20 complet — disponibilité | AlerteGR20",
    description:
      "Paliri complet ? Dernier refuge du parc sur le GR20, après Bavella. Bivouac, bât-flanc et tente. Alerte jusqu'au 4 octobre 2026, gratuite à 7 h ou à 9,90 €.",
    sitemapPriority: 0.7,
    paragraphs: [
      "Paliri est la dernière nuit en refuge du parc, entre Asinao et Conca. On y arrive après les aiguilles de Bavella : le GR classique suit un balcon jusqu'au col, la variante alpine est plus technique, avec dalles et mains courantes. Le chemin empierré quitte ensuite Foce Finosa pour le refuge. Le matin, au départ d'Asinao, les mouflons sont souvent sur le sentier. Le lendemain est la descente vers Conca, dans le maquis, hors des refuges du parc.",
    ],
  },
];

export function refugeByPublicSlug(slug: string): RefugePageContent | undefined {
  return refugePages.find((refuge) => refuge.publicSlug === slug);
}

export function refugeByDbSlug(slug: string): RefugePageContent | undefined {
  return refugePages.find((refuge) => refuge.dbSlug === slug);
}

/** Description Google entre deux saisons : rien à vendre, seulement la liste 2027. */
export function offSeasonDescription(refuge: RefugePageContent): string {
  return `${refuge.searchName} sur le GR20 : réservations 2027 pas encore ouvertes. Soyez prévenu par email, gratuitement, le jour où le Parc ouvre pnr-resa.corsica.`;
}
