# Pilote payant Carros de Foc — été 2027

Écrit le 24 octobre 2026. Objectif : gagner un premier revenu avec le code d'AlerteGR20, sur un trek où il n'existe ni alerte ni liste d'attente. Le GR20 reste en pilote automatique (liste du jour J, voir [plan-relance-2027.md](plan-relance-2027.md)).

## Pourquoi Carros de Foc

Recherche du 24 octobre 2026 sur les services d'alerte de refuges :

| Trek | Services existants | Prix |
| --- | --- | --- |
| GR20 | Vigie GR20, refugealert.com | gratuit, 15 € |
| Tour du Mont-Blanc | TMB Alerts, AkiWatch, TMB Trail Guide, Take a Hike | gratuit ou 9 €, 7 à 14 $, 5 $/mois |
| Alpes (SAC, DAV, ÖAV, AVS, 700 refuges) | HutVigil, Hütten-Alarm, Alpine Hut Alert, HutScanner | gratuits |
| Dolomites, refuges CAI | refugealert.com, The Hiking Club, Take a Hike | 15 € |
| Refuges FFCAM | liste d'attente officielle sur la centrale | gratuit |
| Nouvelle-Zélande, Patagonie | au moins 7 services | gratuit à 10 $ |
| **Carros de Foc (refusonline.com)** | **aucun trouvé, pas de liste d'attente** | — |

Le seul modèle prouvé du secteur est Campnab (campings États-Unis et Canada, depuis 2017, 3 200 parcs, 10 à 30 $/mois). Sur les treks européens, les services gratuits ont tué le prix.

## Ce qu'on sait du marché

- 9 refuges gardés, 501 lits, une boucle de 55 km dans le parc national d'Aigüestortes (Pyrénées catalanes).
- Environ 2 500 forfaits vendus par an avant 2020, sans compter ceux qui partent sans forfait (La Vanguardia, 2021). Ordre de grandeur : 5 000 randonneurs par an.
- « En juillet et août, les refuges du parc sont pratiquement à 100 % » et complets dès le 7 juin (La Vanguardia, 15 juillet 2024, source refusonline).
- Clientèle de plus en plus étrangère : britanniques, belges, français, néerlandais, canadiens.
- Annulation : 25 % de l'acompte retenu à plus de 15 jours, 50 % entre 15 et 7 jours, 100 % à moins de 7 jours. Les annulations devraient donc arriver juste avant J-15 et J-7 : c'est là que l'alerte sert.
- Ensuite, si ça marche : Cavalls del Vent (8 refuges, 337 lits, environ 2 000 forfaits par an, centrale séparée) et La Porta del Cel.

## La source de données

La carte de refusonline.com charge l'état des refuges par une seule requête :

```
POST https://refusonline.com/locations/get_locations_estat/{route}/{JJ}/{MM}/{AAAA}/{places}/0/
```

- `{route}` : `carrosdefoc` (11 refuges, dont les 9 de la boucle) ou `refusonline` (17 refuges de la centrale).
- Réponse JSON : un objet par refuge avec `nombre`, `cama` (capacité), `estat`, `url_slug`.
- `estat` : 0 fermé, 1 ouvert, 2 complet, 3 ouvert avec restriction, 4 contacter (légende de la carte : « Cerrado, Abierto, Completo, Abierto con restricción, Contáctanos »).
- Une alerte part quand un refuge passe de 2 à 1 pour une nuit surveillée, avec le nombre de places demandé.
- Le 24 octobre 2026, juillet 2027 est encore « fermé » presque partout : la réservation en ligne de 2027 n'est pas ouverte.

Règles de lecture : seulement les nuits que quelqu'un surveille, toutes les 15 minutes au plus, pause entre deux requêtes, `User-Agent` avec une adresse de contact. Si refusonline demande d'arrêter, on arrête.

## Le produit

- **Une alerte payante : 12 € par trek**, un seul paiement, jusqu'à 10 combinaisons refuge et nuit, active jusqu'à la dernière nuit surveillée. Pas d'offre gratuite au départ : il n'y a pas de concurrent gratuit.
- **Une page publique gratuite** avec le calendrier des refuges complets, pour le référencement (« Carros de Foc completo », « Carros de Foc full »).
- Langues : espagnol et anglais. Catalan plus tard si le pilote marche.
- Paiement par Paddle (le compte existe ; un nouveau domaine passe par leur vérification).
- Même chaîne que la liste d'ouverture : double confirmation, liens signés, emails idempotents, page de confidentialité.

## Le travail, dans l'ordre (environ 20 h)

### Avant de coder, novembre (environ 2 h)

- [ ] Écrire à refusonline (info@refusonline.com) : date d'ouverture de la réservation en ligne pour 2027, et proposition d'une liste d'attente. S'ils sont intéressés, la vendre à eux est une autre piste (B2B).
- [ ] Lire les conditions d'utilisation de refusonline.com sur la lecture automatique.
- [ ] Choisir un nom de domaine (espagnol et anglais), vérifier qu'il est libre.

### Décembre (environ 8 h)

- [ ] Dans le backend Spring Boot, une source de données par massif : `PnrResaSource` (GR20) et `RefusOnlineSource` (Carros de Foc), même interface.
- [ ] Tests de `RefusOnlineSource` sur des réponses JSON enregistrées.
- [ ] Table d'événements ouverture et fermeture des places, commune aux deux massifs (déjà prévue au bloc 2 bis du plan GR20).
- [ ] Déploiement sur le VPS Hetzner prévu pour le GR20.

### Janvier, avant le PFE (environ 8 h)

- [ ] Site espagnol et anglais : page d'accueil, calendrier public, formulaire d'alerte, paiement Paddle, confidentialité, mentions.
- [ ] Email d'alerte en espagnol et en anglais.
- [ ] Test complet en production avec une vraie carte, puis remboursement.

### Diffusion, février à juin (environ 1 h par semaine)

- [ ] Groupes Facebook Carros de Foc et Pyrénées, en espagnol et en anglais.
- [ ] Blogs qui expliquent la réservation (jtreks, Altura Expeditions, hikepyrenees) : demander un lien.
- [ ] Reddit r/Pyrenees, forums de randonnée espagnols.
- [ ] Un `?src=` par canal, comme sur AlerteGR20.

## Les dates de décision

| Date | Seuil | Sinon |
| --- | --- | --- |
| 31 janvier 2027 | Site en ligne et paiement testé | Pas de lancement en 2027, le PFE passe avant |
| 31 mai 2027 | 10 alertes payées | Arrêt de la diffusion, le site reste jusqu'à la fin de saison |
| 30 septembre 2027 | 30 alertes payées (environ 360 €) | Arrêt. Au-dessus : Cavalls del Vent et La Porta del Cel en 2028 |

## Combien ça peut rapporter

Hypothèses, à vérifier par le pilote : sur environ 5 000 randonneurs, 1 000 tombent sur un refuge complet, 3 à 5 % paient 12 €. Soit **environ 400 à 600 € par saison** pour Carros de Foc seul, moins les frais Paddle (5 % plus 0,50 € par paiement). C'est un complément, pas un revenu.

## Les risques

- **Le marché est petit**, et un concurrent peut apparaître en quelques jours, comme sur le GR20.
- **refusonline peut bloquer la lecture** ou ajouter une liste d'attente officielle. D'où le contact en novembre.
- **Temps** : le PFE commence le 15 février 2027. Tout le code doit être fini avant ; après, seulement la diffusion et le support.
- **Paddle** peut refuser ou retarder le nouveau domaine.

## Budget

| Poste | Coût |
| --- | --- |
| Développement | environ 20 h, de novembre à janvier |
| Domaine | environ 10 à 15 € par an |
| Serveur | partagé avec le GR20 (Hetzner, environ 5 € par mois) |
| Paddle | 5 % plus 0,50 € par paiement |
