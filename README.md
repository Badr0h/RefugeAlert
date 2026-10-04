# AlerteGR20

AlerteGR20 surveille les places des refuges du GR20. Quand une place passe de complet à libre sur le site du Parc naturel régional de Corse, un email part. Il n'y a pas de compte : l'adresse email est l'identifiant. Le site ne réserve pas à la place du randonneur.

Le site est sur https://alertegr20.com. Les places officielles sont sur https://pnr-resa.corsica.

## Code

- `frontend/` — le site, en Next.js
- `backend/` — l'API, en Spring Boot, qui lit les places et envoie les emails

L'API n'est plus hébergée. Le site reste en ligne sur Vercel.
