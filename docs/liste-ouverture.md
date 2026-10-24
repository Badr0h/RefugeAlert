# Liste d'ouverture des réservations 2027

La liste « prévenez-moi le jour de l'ouverture » sert à une seule chose : écrire aux inscrits le jour où le Parc annonce la date d'ouverture des réservations 2027. Elle tourne sur Vercel et Resend, sans l'API Spring Boot. En ligne depuis le 24 octobre 2026.

## Le parcours d'un inscrit

1. Il saisit son email dans le formulaire (accueil, `/ouverture-2027` ou une page refuge).
2. Le site envoie un email « Confirmez votre inscription » depuis `alertes@alertegr20.com`, avec `MAIL_REPLY_TO` en adresse de réponse. Rien n'est enregistré à ce stade.
3. Il ouvre le lien, valable 7 jours, et clique sur « Confirmer mon inscription ».
4. Son adresse entre dans la liste Resend « AlerteGR20 — Ouverture 2027 », avec la propriété `source`.
5. Le jour de l'annonce, il reçoit un seul email, avec un lien de désinscription.

Ce qui est gardé et pourquoi est écrit sur https://alertegr20.com/confidentialite, liée sous chaque formulaire.

## Les protections

- **Double confirmation.** Une adresse saisie par quelqu'un d'autre n'entre jamais dans la liste.
- **Bouton sur la page de confirmation**, pas de confirmation à l'ouverture du lien. Certaines messageries ouvrent les liens toutes seules pour les analyser. Un double clic compte comme une seule confirmation.
- **Un email de confirmation par adresse toutes les 6 heures** (clé d'idempotence Resend). Le formulaire ne peut pas servir à inonder une boîte, mais quelqu'un qui n'a rien reçu peut réessayer le soir.
- **Plafond quotidien** : au-delà de `OUVERTURE_DAILY_CAP` emails de confirmation dans la journée UTC (60 par défaut), le formulaire répond « Beaucoup d'inscriptions aujourd'hui : réessayez demain » (code 429). Le compte se fait sur les derniers emails envoyés dans Resend. Si Resend ne répond pas, le plafond ne bloque pas.
- **Champ piège invisible** : les robots qui le remplissent reçoivent « ok » et rien n'est envoyé. Chaque déclenchement laisse une ligne « Inscription ouverture ignorée : champ piège rempli » dans les logs Vercel : si de vraies personnes s'en plaignent (remplissage automatique du navigateur), c'est là qu'on le voit.
- **Lien signé** (HMAC avec `OUVERTURE_TOKEN_SECRET`) : on ne peut pas fabriquer un lien pour une autre adresse ou une autre source.

Pas encore en place : un captcha (Cloudflare Turnstile), prévu en décembre si des inscriptions robots apparaissent.

## Savoir d'où viennent les inscrits

Chaque contact Resend a une propriété `source`. Elle vient, dans l'ordre :

1. du paramètre `?src=` de l'adresse de la page (`https://alertegr20.com/ouverture-2027?src=fb-gr20-2027`) ;
2. sinon de `utm_source` ;
3. sinon du site d'où vient le visiteur (`google.com`, `facebook.com`…) ;
4. sinon `direct`.

Lettres minuscules, chiffres, `.`, `_` et `-`, 40 caractères au plus. Une valeur invalide devient `direct`. Utiliser un `src` différent par message posté (un groupe Facebook, un forum, un site partenaire), pour savoir quel canal ramène des inscriptions confirmées.

La propriété `source` doit exister dans Resend (Audience, Properties) : elle a été créée le 24 octobre 2026.

## Compter les inscrits

Dans Resend, menu Audience, liste « AlerteGR20 — Ouverture 2027 » : le nombre de contacts est le nombre d'inscrits confirmés. Pour le détail par canal, filtrer les contacts par la propriété `source`.

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
- **« Cette adresse email n'est pas valide » (code 400) :** soit le format est faux, soit Resend a refusé le destinataire. C'est l'adresse, pas le site.
- **« Beaucoup d'inscriptions aujourd'hui » (code 429) :** le plafond quotidien est atteint. Si c'est un vrai pic (un post qui marche), monter `OUVERTURE_DAILY_CAP` sur Vercel et redéployer. Si ce sont des robots, regarder les adresses dans Resend (Emails) et passer à Turnstile.
- **« La confirmation est momentanément indisponible » sur la page de confirmation :** `OUVERTURE_TOKEN_SECRET` manque sur Vercel. Le lien redevient bon dès que la variable est remise.
- **« Ce lien n'est plus valable » sur la page de confirmation :** le lien a plus de 7 jours, ou `OUVERTURE_TOKEN_SECRET` a changé. L'inscrit recommence depuis le formulaire.
- **Changer la clé Resend :** créer une nouvelle clé avec accès complet dans Resend, la mettre dans `RESEND_API_KEY` sur Vercel (production), redéployer, puis supprimer l'ancienne clé.

## Les anciens inscrits de l'API

Avant le 24 octobre 2026, la liste était gérée par l'API Spring Boot (table `inscriptions_ouverture`). Les inscrits de cette table ont été ajoutés à la liste Resend. Leur ancien lien de désinscription (`/desabonner?token=…`) passe par l'API arrêtée et ne marche pas : le lien Resend de l'email d'ouverture le remplace.
