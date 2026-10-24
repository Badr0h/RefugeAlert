# Liste d'ouverture des réservations 2027

La liste « prévenez-moi le jour de l'ouverture » sert à une seule chose : écrire aux inscrits le jour où le Parc annonce la date d'ouverture des réservations 2027. Elle tourne sur Vercel et Resend, sans l'API Spring Boot. En ligne depuis le 24 octobre 2026.

## Le parcours d'un inscrit

1. Il saisit son email dans le formulaire (accueil, `/ouverture-2027` ou une page refuge).
2. Le site envoie un email « Confirmez votre inscription » depuis `alertes@alertegr20.com`. Rien n'est enregistré à ce stade.
3. Il ouvre le lien, valable 7 jours, et clique sur « Confirmer mon inscription ».
4. Son adresse entre dans la liste Resend « AlerteGR20 — Ouverture 2027 ».
5. Le jour de l'annonce, il reçoit un seul email, avec un lien de désinscription.

## Les protections

- **Double confirmation.** Une adresse saisie par quelqu'un d'autre n'entre jamais dans la liste.
- **Bouton sur la page de confirmation**, pas de confirmation à l'ouverture du lien. Certaines messageries ouvrent les liens toutes seules pour les analyser.
- **Un seul email de confirmation par adresse et par jour** (clé d'idempotence Resend). Le formulaire ne peut pas servir à inonder une boîte.
- **Champ piège invisible** : les robots qui le remplissent reçoivent « ok » et rien n'est envoyé.
- **Lien signé** (HMAC avec `OUVERTURE_TOKEN_SECRET`) : on ne peut pas fabriquer un lien pour une autre adresse.

## Compter les inscrits

Dans Resend, menu Audience, liste « AlerteGR20 — Ouverture 2027 » : le nombre de contacts est le chiffre à comparer au seuil du 31 décembre 2026 (100 adresses confirmées).

Au 24 octobre 2026 : 2 contacts, les 2 inscrits d'octobre repris de l'ancienne liste de l'API.

## Le jour de l'annonce du Parc

1. Vérifier la date sur le site du Parc et sur pnr-resa.corsica.
2. Dans Resend, créer un broadcast vers la liste « AlerteGR20 — Ouverture 2027 », expéditeur `AlerteGR20 <alertes@alertegr20.com>`.
3. Contenu : la date et l'heure d'ouverture, le lien https://pnr-resa.corsica, une phrase « AlerteGR20 ne réserve pas à votre place ».
4. Mettre le lien de désinscription : `{{{RESEND_UNSUBSCRIBE_URL}}}`. Sans lui, Resend refuse ou l'envoi devient illégal.
5. S'envoyer un test d'abord, puis envoyer.
6. Vérifier les limites d'envoi de l'offre Resend avant, si la liste dépasse quelques centaines d'adresses.

## Si le formulaire ne marche plus

- **Message « L'email de confirmation n'a pas pu partir » :** regarder les logs de la fonction `/api/ouverture` dans Vercel.
  - Code 503 : une variable manque (`RESEND_API_KEY`, `RESEND_OUVERTURE_SEGMENT_ID` ou `OUVERTURE_TOKEN_SECRET`).
  - Code 502 : Resend a refusé. Le nom de l'erreur est dans le log (clé révoquée, quota dépassé, etc.).
- **« Ce lien n'est plus valable » sur la page de confirmation :** le lien a plus de 7 jours, ou `OUVERTURE_TOKEN_SECRET` a changé. L'inscrit recommence depuis le formulaire.
- **Changer la clé Resend :** créer une nouvelle clé avec accès complet dans Resend, la mettre dans `RESEND_API_KEY` sur Vercel (production), redéployer, puis supprimer l'ancienne clé `alertegr20-vercel-ouverture`.

## Les anciens inscrits de l'API

Avant le 24 octobre 2026, la liste était gérée par l'API Spring Boot (table `inscriptions_ouverture`). Les 2 inscrits d'octobre ont été ajoutés à la liste Resend. Leur ancien lien de désinscription (`/desabonner?token=…`) passe par l'API arrêtée et ne marche pas : le lien Resend de l'email d'ouverture le remplace.
