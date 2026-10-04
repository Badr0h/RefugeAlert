import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { SiteFrame } from "../../components/SiteFrame";
import { socialImage } from "../../content/productSchema";
import { breadcrumb, founder, ORGANIZATION_ID } from "../../content/schema";

const title = "À propos d'AlerteGR20 — qui fait le site et comment";
const description =
  "AlerteGR20 est fait par Badreddine Oussaih, développeur. Le site lit pnr-resa.corsica toutes les 15 minutes et écrit quand une place de refuge GR20 se libère.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/a-propos" },
  openGraph: {
    title,
    description,
    url: "/a-propos",
    locale: "fr_FR",
    type: "website",
    siteName: "AlerteGR20",
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [socialImage.url],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    breadcrumb([{ name: "À propos", path: "/a-propos" }]),
    {
      "@type": "AboutPage",
      url: "https://alertegr20.com/a-propos",
      name: title,
      inLanguage: "fr-FR",
      about: { "@id": ORGANIZATION_ID },
      mainEntity: founder,
    },
  ],
};

const linkClass =
  "text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

const headingClass = "font-[family-name:var(--font-sign)] text-3xl font-bold text-ink";

export default function AProposPage() {
  return (
    <SiteFrame>
      <JsonLd data={structuredData} />
      <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          À propos d&apos;AlerteGR20
        </h1>

        <div className="mt-5 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          <p>
            Je m&apos;appelle <strong>Badreddine Oussaih</strong>, je suis développeur. J&apos;ai
            créé AlerteGR20 en septembre 2026 et je le fais tourner seul.
          </p>
        </div>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Pourquoi ce site</h2>
          <div className="mt-3 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
            <p>
              Les refuges du GR20 se réservent sur{" "}
              <a href="https://pnr-resa.corsica" className={linkClass}>
                pnr-resa.corsica
              </a>
              , le site du Parc naturel régional de Corse. Certains affichent complet très vite :
              en 2026, Ortu di u Piobbu, Carrozzu et Usciolu sont partis en premier, surtout début
              juin et début septembre.
            </p>
            <p>
              Des places se libèrent ensuite, quand quelqu&apos;un annule. Mais rien ne prévient :
              il faut revenir voir le site du Parc, encore et encore. AlerteGR20 fait cette veille à
              votre place.
            </p>
          </div>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Comment ça marche</h2>
          <ul className="mt-3 flex max-w-[48ch] list-disc flex-col gap-3 pl-5 text-lg leading-relaxed">
            <li>
              Toutes les 15 minutes, jour et nuit, le site lit les places publiques des 12 refuges
              du GR20 sur pnr-resa.corsica : bivouac, bât-flanc et tente.
            </li>
            <li>
              Quand une nuit passe de complet à libre, un email part. Gratuit à 7&nbsp;h, heure de
              Paris, ou tout de suite avec l&apos;alerte immédiate à 9,90&nbsp;€ pour la saison.
            </li>
            <li>
              Le tableau de toutes les places est public, sur la page{" "}
              <Link href="/places" className={linkClass}>
                Disponibilités
              </Link>
              .
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Ce que le site ne fait pas</h2>
          <ul className="mt-3 flex max-w-[48ch] list-disc flex-col gap-3 pl-5 text-lg leading-relaxed">
            <li>
              Il ne réserve pas. Vous réservez toujours vous-même, sur pnr-resa.corsica.
            </li>
            <li>
              Il n&apos;est pas le site du Parc et n&apos;a aucun lien officiel avec lui. Il lit
              seulement ce que le Parc affiche à tout le monde.
            </li>
            <li>Il ne garantit pas une place : il prévient quand une place se libère.</li>
          </ul>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Vos données</h2>
          <div className="mt-3 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
            <p>
              Il n&apos;y a pas de compte. Votre email sert uniquement à vous écrire, et chaque
              email contient un lien pour vous désinscrire. Le paiement passe par Paddle :
              AlerteGR20 ne voit jamais votre carte.
            </p>
          </div>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Me contacter</h2>
          <div className="mt-3 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
            <p>
              Une question, une erreur sur une page, un refuge mal lu : écrivez-moi à{" "}
              <a href="mailto:oussaihbadreddine@gmail.com" className={linkClass}>
                oussaihbadreddine@gmail.com
              </a>
              . Je réponds moi-même.
            </p>
            <p>
              Pour la saison 2027 :{" "}
              <Link href="/ouverture-2027" className={linkClass}>
                être prévenu le jour de l&apos;ouverture des réservations
              </Link>
              .
            </p>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
