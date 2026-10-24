# Plan de relance AlerteGR20 — saison 2027, version minimale

Écrit le 24 octobre 2026, après deux relectures critiques de Claude et la vérification des chiffres réels. Ce plan remplace la première version (150 à 190 heures), trop grosse pour une seule personne avant le PFE.

## Journal

- **24 octobre 2026, matin.** Question de départ : relancer le projet gratuitement avec de la pub, par exemple au clic sur le bouton d'inscription, face au concurrent gratuit Vigie GR20.
  - Pub au clic écartée : elle casse l'inscription au moment clé, va contre les règles d'AdSense et rapporterait quelques dizaines d'euros par saison au trafic attendu.
  - Premier plan (version complète, 150 à 190 h), relu par Claude : jugé 2 à 3 fois trop gros, avec plusieurs erreurs (pourboire via Paddle, email de relance, Telegram, Neon gratuit, grille déjà existante).
  - Chiffres réels relevés dans Resend et Paddle : aucune preuve de demande (voir plus bas).
  - Décision : version minimale, avec des dates de décision fixées d'avance.
  - Fait le jour même : la liste d'ouverture tourne sans l'API, avec double confirmation, testée en production (bloc 1).
- **24 octobre 2026, après-midi.** Deuxième relecture de Claude, sur le code de la liste et sur ce plan.
  - Code : pas de limite d'abus, nouvel essai bloqué jusqu'à minuit, panne de configuration affichée comme un lien expiré, double clic, adresse refusée affichée comme une panne, pas d'information RGPD, textes périmés. Tout est corrigé et en ligne (bloc 1 bis).
  - Plan : seuils incohérents entre eux, branche « succès » trop serrée avant le PFE, relevé à 3-5 minutes prématuré, petits ajouts (pourboire, affiliation) retirés, budget réaliste de 50 h plutôt que 40.
  - Hébergement de l'API : petit VPS européen plutôt qu'Oracle Always Free (risque de reprise des instances peu chargées).
  - Argent : projet pour le CV, pas de revenu attendu.

**Objectif :** mesurer la demande avec un budget fixe d'environ 50 heures et moins de 100 € de frais, puis décider aux dates prévues. Ce n'est pas un projet de revenu.

## Les chiffres réels de 2026

Relevés dans Resend et Paddle le 24 octobre 2026.

- Le site a tourné environ une semaine, du 26 septembre au 4 octobre, à la fin de la saison.
- **0 paiement** dans Paddle. 19 paiements ouverts mais jamais payés, aux heures des tests.
- **8 emails** envoyés au total, tous livrés, depuis `alertes@alertegr20.com` (domaine vérifié).
- **2 inscriptions venant d'inconnus**, toutes les deux à la liste d'ouverture. Aucune alerte refuge créée par un inconnu.
- La seule alerte « Place libre » envoyée l'a été à une adresse de test.

Conclusion : aucune preuve de demande, et aucune preuve d'absence de demande. La saison n'a pas été testée.

## La concurrence

- **Vigie GR20** (vigie-gr20.fr) : gratuit, relevé toutes les 15 minutes, double confirmation, grille, page des annulations, statistiques, planificateur avec « m'alerter sur les nuits bloquantes », version anglaise.
- **refugealert.com** : payant (15 € par voyage), relevé toutes les 15 minutes le jour et toutes les heures la nuit.

Tous lisent la même page publique du Parc. Aucun avantage de données. Toute fonctionnalité se copie en quelques jours. On ne se bat donc pas sur le prix : l'alerte email est gratuite.

## Les dates de décision

| Date | Seuil | Si le seuil n'est pas atteint |
| --- | --- | --- |
| 31 décembre 2026 | 100 adresses confirmées sur la liste d'ouverture | Gel du développement. La liste et le formulaire restent en ligne jusqu'au broadcast du jour J |
| 31 janvier 2027 | Environ 250 adresses sur la liste | Point d'étape : pas de nouvelle fonctionnalité, seulement l'alerte gratuite si elle est déjà prête |
| 28 février 2027 | Environ 40 personnes distinctes avec au moins une alerte refuge confirmée | Maintenance seulement, puis arrêt et procédure de gel avant l'été |

Les seuils sont arbitraires, mais fixés d'avance. On ne les change pas en cours de route.

Pourquoi ces chiffres :

- Le gel du 31 décembre bloque le développement, pas la liste. Garder le formulaire ne coûte rien, et le pic d'intérêt est en janvier. Le broadcast du jour J reste le test de demande le moins cher.
- Le second seuil compte des **personnes**, pas des abonnements : une personne peut créer dix alertes. Avec une conversion de la liste vers une alerte de 10 à 25 % (hypothèse), 100 inscrits donneraient 10 à 25 personnes. D'où le point intermédiaire à 250 fin janvier.
- 100 confirmés demandent 150 à 200 soumissions (la double confirmation en perd 30 à 50 %), soit 1 500 à 4 000 visiteurs bien ciblés. Ce n'est atteignable que si un lien d'un site GR20 ou un post de groupe passe. Vérifier la Search Console : sous 2 000 impressions par mois sur « ouverture réservation GR20 2027 », le SEO seul ne suffira pas.

### Procédure de gel

Si un seuil de gel tombe :

1. Après le broadcast du jour J (pas avant), supprimer la liste Resend « AlerteGR20 — Ouverture 2027 » et ses contacts.
2. Retirer le formulaire du site et remplacer la page `/ouverture-2027` par une page statique « projet arrêté », avec un lien vers le site du Parc.
3. Mettre à jour `/confidentialite` (plus aucune donnée gardée) et le README.
4. Vérifier que la base Postgres de l'API (Render, 2026) est bien supprimée.

### Règle de repli

Si le PFE n'est pas signé fin novembre, la recherche de stage passe avant tout : la diffusion se limite aux emails aux trois sites GR20, et rien d'autre n'est développé avant le 31 décembre.

## Le travail, dans l'ordre

### Bloc 1 — La liste d'ouverture, sans l'API (environ 4 h) — en ligne depuis le 24 octobre 2026

Le formulaire appelait l'API Spring Boot, arrêtée : chaque visiteur voyait « Le serveur ne répond pas ».

- [x] Route `POST /api/ouverture` sur Vercel. Elle envoie un email de confirmation via Resend.
- [x] Page `/ouverture-2027/confirmer` : l'adresse n'entre dans la liste Resend qu'après un clic sur « Confirmer » (double confirmation, rien n'est stocké avant).
- [x] Champ piège invisible contre les robots. Jeton signé, valable 7 jours, avec tests.
- [x] Créer la liste « AlerteGR20 — Ouverture 2027 » dans Resend, une clé API, et les variables Vercel : `RESEND_API_KEY`, `RESEND_OUVERTURE_SEGMENT_ID`, `OUVERTURE_TOKEN_SECRET`, `MAIL_FROM`.
- [x] Ajouter à la liste les 2 inscrits d'octobre (ils ont déjà demandé l'email d'ouverture).
- [x] Test réel en production : email de confirmation livré, confirmation enregistrée, adresse de test retirée ensuite.
- [ ] Le jour J : un broadcast Resend vers la liste. Procédure dans [liste-ouverture.md](liste-ouverture.md).

### Bloc 1 bis — Avant toute diffusion (environ 5 h) — en ligne depuis le 24 octobre 2026

- [x] Plafond global de 60 emails de confirmation par jour, avec un message honnête au-delà (code 429).
- [x] Nouvel essai possible toutes les 6 heures au lieu d'une fois par jour.
- [x] Une variable manquante n'affiche plus « lien expiré » mais « momentanément indisponible ». La vérification du lien n'a besoin que du secret.
- [x] Double clic sur « Confirmer » : compté comme un succès, bouton désactivé pendant l'envoi.
- [x] Adresse refusée par Resend : message « adresse non valide » (400) au lieu de « réessayez » (502).
- [x] Ligne de log quand le champ piège se déclenche, pour repérer les faux positifs.
- [x] Préfixe d'usage dans la signature HMAC, `Reply-To` lu par quelqu'un.
- [x] 11 tests avec Resend simulé (formulaire, envoi, confirmation), en plus des 7 tests du jeton.
- [x] Page `/confidentialite`, liée sous chaque formulaire et en pied de page. Mentions légales corrigées (Vercel et Resend, plus Render).
- [x] Mesure par canal : paramètre `?src=` (sinon `utm_source`, sinon le site d'origine) gardé dans le lien de confirmation et enregistré dans la propriété Resend `source`.
- [x] Textes périmés retirés : 9,90 €, « toutes les 15 minutes », « Créer une alerte » hors saison, message d'erreur rouge sur `/places` et les pages refuges. Sitemap à jour.
- [ ] Décembre : Cloudflare Turnstile, si des inscriptions robots apparaissent ou avant un gros post. Demande un compte Cloudflare.

### Bloc 2 — Diffusion (environ 3 h par semaine, de novembre à janvier)

Chaque lien posté pointe vers `https://alertegr20.com/ouverture-2027?src=<canal>`, avec un `src` différent par message (`gr20-infos`, `mongr20`, `fb-gr20-aventure`, `routard`…). Le nombre d'inscrits confirmés par source se lit dans Resend.

Dans cet ordre :

1. **Sites déjà bien placés sur la requête.** Écrire à gr20-infos.com (leur article sur l'ouverture de la plateforme remonte dans Google), mongr20.com et le-gr20.fr. Demander un lien « recevoir un email le jour J », et leur promettre la date dès qu'elle tombe pour qu'ils mettent leur article à jour avant les autres. Pareil avec les blogueurs qui ont écrit « réservation GR20 2026 ». Cinq emails par semaine.
2. **Groupes Facebook** (« GR20 Aventure Corse », « Relevé le défi.. GR20.. »). Pas de lien à froid : écrire d'abord aux administrateurs, puis poster une vraie information (« Réservations 2027 : ce qu'on sait ») avec le lien en commentaire. Répondre chaque semaine aux fils « quand ça ouvre ? ».
3. **SEO rapide.** Reprendre `/ouverture-2027` autour de « date ouverture réservation GR20 2027 », avec une date de mise à jour visible. Demander l'indexation dans la Search Console.
4. **Forums** (Routard, Camptocamp, Reddit) : une ou deux vraies réponses par semaine.

À côté :

- [ ] Email au Parc : présentation du service, fréquence de relevé, contact.
- [ ] Version anglaise du formulaire d'ouverture.
- [ ] Brouillon du broadcast du jour J, et une version de `/ouverture-2027` prête à publier la date en cinq minutes.

À écarter : Instagram, TikTok, pub payante.

Le plan marketing 12 mois et le guide de saison mois par mois, écrits lors d'une session précédente, n'ont jamais été commités et ne sont plus sur le disque. Ils reposaient sur l'offre payante à 9,90 € : à réécrire seulement si le seuil du 31 décembre est atteint.

### Bloc 2 bis — Préparé en novembre-décembre, quel que soit le seuil (environ 8 h)

La branche « succès » (blocs 3 à 5) pèse environ 30 h. Commencée le 1er janvier, elle finirait vers le 10 février, en plein support et juste avant le PFE. Ce qui est utile dans tous les cas se fait donc avant :

- [ ] **Détection de l'ouverture.** Sur pnr-resa.corsica, le calendrier de `stock.php` porte un attribut `max` (aujourd'hui `max="2026-10-04"`). Un petit script qui le relève chaque jour et m'écrit quand il passe en 2027 tient la promesse « on vous écrit le jour même ». Ne pas se fier aux cases colorées : la page de 2027 en affiche déjà.
- [ ] `NotificationService.notifyOpening` : un échec d'envoi pour une personne ne doit plus arrêter l'envoi aux suivantes.
- [ ] Une table d'événements d'ouverture et de fermeture des places, pour mesurer combien de temps une place libérée reste prenable.
- [ ] Tester l'inscription chez Hetzner et répéter le déploiement de l'API sur une VM facturée à l'heure (quelques centimes). La vérification de carte ou d'identité peut prendre un ou deux jours.
- [ ] Quota Resend du jour J : passer à Resend Pro (20 $) le mois du broadcast si la liste dépasse les limites de l'offre gratuite.

### Bloc 3 — Fiabiliser la chaîne d'envoi (environ 10 h)

À faire seulement si le seuil du 31 décembre est atteint.

- [ ] Échec de l'email de confirmation d'une alerte : ne plus le cacher dans les logs.
- [ ] Double confirmation pour les alertes refuge, comme pour la liste d'ouverture.
- [ ] Surveillance : une alerte (à moi) si le tableau du Parc est absent pendant 30 minutes, ou si la clé Resend est vide.
- [ ] Tests des cas d'échec.

### Bloc 4 — Alerte gratuite immédiate (environ 8 h)

- [ ] Supprimer le récapitulatif de 7 h : l'alerte part tout de suite pour tout le monde.
- [ ] Rester à un relevé toutes les 15 minutes. Mesurer d'abord la durée de vie des places libérées avec la table d'événements. Si une place reste prenable 30 minutes, aller plus vite ne sert à rien ; sinon, en discuter après le 28 février.
- [ ] Ne plus balayer toute la saison quand personne ne surveille (aujourd'hui, `rangesToWatch` va jusqu'à `SAISON_FIN` à chaque passage).
- [ ] `User-Agent` avec une adresse de contact.

### Bloc 5 — Saison 2027 et hébergement (environ 10 h)

- [ ] Les dates de 2026 sont écrites en dur à 22 endroits dans 7 fichiers du site, plus `render.yaml` et `.env.example`. Les regrouper dans `src/content/season.ts`, puis passer à 2027 quand le Parc publie le calendrier.
- [ ] La FAQ de saison promet une place « détectée tout de suite » : la corriger.
- [ ] Retirer l'offre à 9,90 € du code (elle n'est plus affichée hors saison).
- [ ] API et Postgres sur un VPS Hetzner (environ 5 € par mois) avec `docker-compose.yml`, une sauvegarde `pg_dump` chaque nuit vers un stockage externe, et un moniteur d'uptime gratuit. Pas Neon gratuit (quota), pas Oracle Always Free (reprise des instances peu chargées).
- [ ] Mettre à jour `/confidentialite` pour les alertes refuge (base Postgres, hébergeur).

## Ce qu'on ne fait pas

Pas avant les chiffres du 31 décembre et du 28 février, et peut-être jamais :

- Telegram, SMS, premium.
- Relevé toutes les 3 à 5 minutes.
- Pourboire, affiliation : surface légale (mentions, programme à ouvrir, encaissement depuis le Maroc) pour quelques dizaines d'euros.
- Alerte d'itinéraire et plan B.
- Étapes privées, page des annulations.
- Sponsor, AdSense, pub au clic.
- Autres treks.

## L'argent

Mise à jour du 24 octobre 2026 : l'objectif est maintenant de gagner de l'argent. La recherche de marché montre que le GR20 seul ne le permet pas (concurrent gratuit, 0 paiement en 2026). La piste retenue est un pilote payant sur Carros de Foc, dans les Pyrénées catalanes, où aucune alerte n'existe : voir [plan-pilote-carros-de-foc.md](plan-pilote-carros-de-foc.md). Le GR20 reste en pilote automatique.

Avant cette décision : projet pour le CV, avec un petit billet de loterie. Ordres de grandeur estimés par Claude pour 500 à 1 000 personnes : affiliation 30 à 150 € par saison, pourboire 10 à 50 €, partenaire local 100 à 300 € (seulement au-delà de 800 à 1 000 contacts). Gagner vraiment de l'argent demanderait de posséder l'audience (un site de contenu GR20, 12 à 24 mois de SEO) : c'est un autre projet, incompatible avec le PFE.

La valeur CV est réelle : double confirmation, jetons signés, idempotence, tests, seuils d'arrêt fixés d'avance. Les heures vont aux tests, à la fiabilité et à la documentation, pas aux fonctionnalités.

## Budget

| Poste | Coût |
| --- | --- |
| Développement | environ 50 h, dont 9 h déjà faites le 24 octobre |
| Serveur API et base (Hetzner) | environ 5 € par mois, de janvier à août, soit environ 40 € |
| Resend | offre gratuite, Pro (20 $) le mois du broadcast si la liste dépasse ses limites |
| Site Vercel | 0 € |

Total : moins de 100 € sur la saison.

## Calendrier

- **Jusqu'au 6 novembre :** préparation Snowflake. Blocs 1 et 1 bis en ligne.
- **Novembre – décembre :** bloc 2 (diffusion) et bloc 2 bis (préparation utile dans tous les cas). Turnstile en décembre si besoin.
- **Fin novembre :** si le PFE n'est pas signé, règle de repli.
- **31 décembre :** décision. Si le seuil est atteint, blocs 3, 4 et 5 en janvier. Sinon, gel du développement, la liste reste.
- **Mi-janvier :** ouverture des réservations, broadcast à la liste.
- **31 janvier :** point d'étape (environ 250 sur la liste).
- **20 janvier – fin février :** période de support la plus chargée. Elle tombe pendant l'arrivée en PFE : prévoir du temps.
- **28 février :** deuxième décision (environ 40 personnes avec une alerte).
