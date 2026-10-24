# Site AlerteGR20

Interface Next.js du produit décrit dans le [README à la racine](../README.md).

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # tests unitaires (node --test)
npm run build
```

## Deux sources de données

- **L'API Spring Boot**, à l'adresse `NEXT_PUBLIC_API_URL` : refuges, alertes, tableau des places, paiement, désinscription des alertes. Elle est arrêtée depuis octobre 2026, ces fonctions sont donc hors service.
- **Resend, directement depuis le site** : la liste « prévenez-moi le jour de l'ouverture ». Elle ne dépend pas de l'API.

## La liste d'ouverture

| Fichier | Rôle |
| --- | --- |
| `src/components/OuvertureForm.tsx` | Formulaire, présent sur l'accueil, `/ouverture-2027` et chaque page refuge. Champ piège invisible contre les robots |
| `src/app/api/ouverture/route.ts` | `POST /api/ouverture` : valide l'adresse et envoie l'email de confirmation |
| `src/app/ouverture-2027/confirmer/` | Page du lien reçu par email. L'adresse n'entre dans la liste qu'au clic sur « Confirmer » |
| `src/lib/ouverture.ts` | Appels Resend : email de confirmation (un par adresse et par jour), ajout à la liste |
| `src/lib/ouvertureToken.ts` | Jeton signé (HMAC) contenu dans le lien, valable 7 jours. Testé dans `ouvertureToken.test.ts` |

Le déroulé complet et la procédure du jour d'ouverture sont dans [docs/liste-ouverture.md](../docs/liste-ouverture.md).

## Variables d'environnement

| Variable | Où | Rôle |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Vercel, local | Adresse de l'API Spring Boot |
| `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN` | Vercel | Paiement Paddle côté navigateur |
| `RESEND_API_KEY` | Vercel (protégée) | Clé Resend avec accès complet, nécessaire pour les contacts |
| `RESEND_OUVERTURE_SEGMENT_ID` | Vercel | Identifiant de la liste « AlerteGR20 — Ouverture 2027 » |
| `OUVERTURE_TOKEN_SECRET` | Vercel (protégée) | Secret de signature des liens de confirmation |
| `MAIL_FROM` | Vercel | `AlerteGR20 <alertes@alertegr20.com>` |

Sans les variables Resend, le formulaire répond « L'email de confirmation n'a pas pu partir » (code 503).

Changer `OUVERTURE_TOKEN_SECRET` rend invalides les liens de confirmation déjà envoyés et pas encore cliqués.
