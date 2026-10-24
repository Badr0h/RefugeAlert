# Plan de relance AlerteGR20 — saison 2027, version minimale

Écrit le 24 octobre 2026, après la relecture critique de Claude et la vérification des chiffres réels. Ce plan remplace la première version (150 à 190 heures), trop grosse pour une seule personne avant le PFE.

**Objectif :** mesurer la demande avec un budget fixe d'environ 40 heures et moins de 100 € de frais, puis décider aux dates prévues. Ce n'est pas un projet de revenu.

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
| 31 décembre 2026 | 100 adresses confirmées sur la liste d'ouverture | Gel : page statique, plus aucun développement |
| 28 février 2027 | 100 alertes refuge actives | Maintenance seulement, arrêt avant l'été |

Les seuils sont arbitraires, mais fixés d'avance. On ne les change pas en cours de route.

## Le travail, dans l'ordre

### Bloc 1 — La liste d'ouverture, sans l'API (environ 4 h) — fait, à déployer

Le formulaire appelait l'API Spring Boot, arrêtée : chaque visiteur voyait « Le serveur ne répond pas ».

- [x] Route `POST /api/ouverture` sur Vercel. Elle envoie un email de confirmation via Resend, au plus un par adresse et par jour.
- [x] Page `/ouverture-2027/confirmer` : l'adresse n'entre dans la liste Resend qu'après un clic sur « Confirmer » (double confirmation, rien n'est stocké avant).
- [x] Champ piège invisible contre les robots. Jeton signé, valable 7 jours, avec tests.
- [ ] Créer la liste « Ouverture 2027 » dans Resend, une clé API, et les variables Vercel : `RESEND_API_KEY`, `RESEND_OUVERTURE_SEGMENT_ID`, `OUVERTURE_TOKEN_SECRET`, `MAIL_FROM`.
- [ ] Ajouter à la liste les 2 inscrits d'octobre (ils ont déjà demandé l'email d'ouverture).
- [ ] Le jour J : un broadcast Resend vers la liste, avec `{{{RESEND_UNSUBSCRIBE_URL}}}`.

### Bloc 2 — Diffusion (environ 5 h, plus du temps hors code)

- [ ] Email au Parc : présentation du service, fréquence de relevé, contact.
- [ ] Version anglaise du formulaire d'ouverture.
- [ ] Décembre : contacts mongr20 / le-gr20, groupes Facebook, réponses sur les forums, comme dans le plan marketing.

### Bloc 3 — Fiabiliser la chaîne d'envoi (environ 15 h)

À faire seulement si le seuil du 31 décembre est atteint.

- [ ] `NotificationService.notifyOpening` : un échec d'envoi pour une personne ne doit plus arrêter l'envoi aux suivantes. Isolation par destinataire et nouvel essai au relevé suivant.
- [ ] Échec de l'email de confirmation d'une alerte : ne plus le cacher dans les logs.
- [ ] Double confirmation pour les alertes refuge, comme pour la liste d'ouverture.
- [ ] Surveillance : une alerte (à toi) si le tableau du Parc est absent pendant 30 minutes, ou si la clé Resend est vide.
- [ ] Une table d'événements d'ouverture et de fermeture des places. Elle sert à mesurer combien de temps une place libérée reste disponible.
- [ ] Tests des cas d'échec.

### Bloc 4 — Alerte gratuite immédiate, relevé plus rapide (environ 10 h)

- [ ] Supprimer le récapitulatif de 7 h : l'alerte part tout de suite pour tout le monde.
- [ ] Relever toutes les 3 à 5 minutes les créneaux que quelqu'un surveille. Garder le relevé complet toutes les 15 minutes. Pause entre deux requêtes.
- [ ] Ne plus balayer toute la saison quand personne ne surveille (aujourd'hui, `rangesToWatch` va jusqu'à `SAISON_FIN` à chaque passage).
- [ ] `User-Agent` avec une adresse de contact.
- [ ] Mesurer le délai entre l'ouverture et l'envoi, et la durée de vie des places libérées. Si une place reste prenable 30 minutes, aller plus vite ne sert à rien.

### Bloc 5 — Saison 2027 et hébergement (environ 6 h)

- [ ] Les dates de 2026 sont écrites en dur à 22 endroits dans 7 fichiers du site, plus `render.yaml` et `.env.example`. Les regrouper dans `src/content/season.ts`, puis passer à 2027 quand le Parc publie le calendrier.
- [ ] La FAQ promet une place « détectée tout de suite » : la corriger.
- [ ] Page de confidentialité.
- [ ] Retirer l'offre à 9,90 € du site.
- [ ] API et Postgres sur un petit serveur (4 à 5 € par mois) avec `docker-compose.yml`, et une sauvegarde automatique de la base dès le départ. Pas Neon gratuit : un relevé toutes les quelques minutes épuise son quota.

### Petits ajouts sans risque (1 h chacun)

- [ ] Lien de pourboire hors Paddle (Ko-fi, Buy Me a Coffee ou PayPal) sur la page de confirmation et en bas des emails. Pas de relance. Paddle exclut les dons, et le compte doit rester propre.
- [ ] Bloc d'affiliation statique (assurance, ferry) avec la mention « lien affilié », sans suivi.

## Ce qu'on ne fait pas

Pas avant les chiffres du 31 décembre et du 28 février, et peut-être jamais :

- Telegram, SMS, premium.
- Alerte d'itinéraire et plan B.
- Étapes privées, page des annulations.
- Sponsor, AdSense, pub au clic.
- Autres treks.

## Budget

| Poste | Coût |
| --- | --- |
| Développement | environ 40 h, à 6 à 8 h par semaine entre le 7 novembre et le 15 janvier |
| Serveur API et base | 4 à 5 € par mois, de janvier à août |
| Resend | offre gratuite tant que la liste reste petite (limites des broadcasts à vérifier) |
| Site Vercel | 0 € |

Total : moins de 100 € sur la saison.

## Calendrier

- **Jusqu'au 6 novembre :** préparation Snowflake. Seul le bloc 1 est mis en ligne (le code est prêt).
- **Novembre – décembre :** bloc 2 (diffusion). Le reste attend le 31 décembre.
- **31 décembre :** décision. Si le seuil est atteint, blocs 3, 4 et 5 en janvier.
- **Mi-janvier :** ouverture des réservations, broadcast à la liste.
- **20 janvier – fin février :** période de support la plus chargée. Elle tombe pendant l'arrivée en PFE : prévoir du temps.
- **28 février :** deuxième décision.
