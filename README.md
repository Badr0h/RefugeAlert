# AlerteGR20

AlerteGR20 surveille les places des refuges du GR20. Quand une place passe de complet à libre sur le site du Parc naturel régional de Corse, un email part. Il n'y a pas de compte : l'adresse email est l'identifiant. Le site ne réserve pas à la place du randonneur.

Le site est sur https://alertegr20.com. Les places officielles sont sur https://pnr-resa.corsica.

## État au 24 octobre 2026

- **Le site est en ligne** sur Vercel (projet `refugealert`, déployé à chaque push sur `main`).
- **La liste « prévenez-moi le jour de l'ouverture » fonctionne**, sans l'API. Elle tourne sur Vercel et Resend, avec double confirmation, plafond quotidien et suivi de la source de chaque inscrit. Voir [docs/liste-ouverture.md](docs/liste-ouverture.md). Ce qui est gardé est expliqué sur [/confidentialite](https://alertegr20.com/confidentialite).
- **L'API Spring Boot est arrêtée** depuis la fin de la saison 2026. Les alertes refuge, le tableau des places et le paiement ne marchent pas tant qu'elle n'est pas relancée. Le site l'indique hors saison au lieu d'afficher une erreur.
- **Le projet est en phase de test de la demande.** Décisions le 31 décembre 2026 (100 inscrits confirmés), le 31 janvier et le 28 février 2027. Voir [docs/plan-relance-2027.md](docs/plan-relance-2027.md).
- **Piste de revenu : un pilote payant sur Carros de Foc** (Pyrénées catalanes) pour l'été 2027, où aucune alerte n'existe. Voir [docs/plan-pilote-carros-de-foc.md](docs/plan-pilote-carros-de-foc.md).

## Code

- `frontend/` — le site, en Next.js. Il contient aussi la route `/api/ouverture` de la liste d'ouverture. Voir [frontend/README.md](frontend/README.md).
- `backend/` — l'API, en Spring Boot : elle lit les places sur pnr-resa.corsica, envoie les alertes et gère le paiement Paddle.
- `e2e/` — tests Playwright contre la production.
- `docs/` — le plan de relance et la procédure de la liste d'ouverture.

## Où sont les choses

| Service | Usage |
| --- | --- |
| Vercel, projet `refugealert` | Site et route de la liste d'ouverture. Variables : voir `frontend/README.md` |
| Resend, domaine `alertegr20.com` | Tous les emails, depuis `AlerteGR20 <alertes@alertegr20.com>` |
| Resend, liste « AlerteGR20 — Ouverture 2027 » | Les adresses confirmées pour l'email du jour d'ouverture |
| Render, service `RefugeAlert` (`render.yaml`) | Ancien hébergement de l'API, arrêté |
| Paddle | Ancien prix « Alerte immédiate » à 9,90 €, aucun paiement reçu en 2026 |
| Google Search Console | Vérification par balise dans `frontend/src/app/layout.tsx` |

## Lancer en local

```bash
docker compose up -d          # Postgres sur le port 5433
cd backend && mvn spring-boot:run
cd frontend && npm install && npm run dev
```

Les variables de l'API sont dans `.env.example`, celles du site dans `frontend/.env.example`.
