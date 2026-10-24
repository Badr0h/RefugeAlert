import type { Metadata } from "next";
import Link from "next/link";
import { SiteFrame } from "../../components/SiteFrame";
import { socialImage } from "../../content/productSchema";

const title = "Confidentialité — AlerteGR20";
const description =
  "Ce qu'AlerteGR20 fait de votre email : un seul email le jour de l'ouverture des réservations GR20 2027, désinscription en un clic, aucune publicité.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/confidentialite" },
  openGraph: {
    title,
    description,
    url: "/confidentialite",
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

const linkClass =
  "text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

const headingClass = "font-[family-name:var(--font-sign)] text-3xl font-bold text-ink";

const contact = (
  <a href="mailto:oussaihbadreddine@gmail.com" className={linkClass}>
    oussaihbadreddine@gmail.com
  </a>
);

export default function ConfidentialitePage() {
  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          Confidentialité
        </h1>
        <div className="mt-5 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          <p>
            AlerteGR20 est édité par Badreddine Oussaih, responsable des données décrites ici. Contact :{" "}
            {contact}.
          </p>
          <p className="text-base text-stone">Mis à jour le 24 octobre 2026.</p>
        </div>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Liste de l&apos;ouverture 2027</h2>
          <ul className="mt-3 flex max-w-[48ch] list-disc flex-col gap-3 pl-5 text-lg leading-relaxed">
            <li>
              <strong>Ce qui est gardé :</strong> votre email, la date d&apos;inscription et le site
              d&apos;où vous venez (par exemple un forum), pour savoir quels liens sont utiles.
            </li>
            <li>
              <strong>Pourquoi :</strong> vous envoyer un seul email, le jour où le Parc annonce
              l&apos;ouverture des réservations 2027.
            </li>
            <li>
              <strong>Sur quelle base :</strong> votre accord, donné en deux temps. L&apos;adresse
              n&apos;entre dans la liste qu&apos;après le clic sur « Confirmer » dans l&apos;email reçu.
            </li>
            <li>
              <strong>Combien de temps :</strong> jusqu&apos;à votre désinscription, et au plus tard
              jusqu&apos;au 31 décembre 2027. Si le projet s&apos;arrête avant, la liste est supprimée.
            </li>
            <li>
              <strong>Qui la traite :</strong> Resend, le service d&apos;envoi d&apos;emails, qui stocke
              la liste et garde un journal technique des envois. Resend est une société américaine.
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Alertes de la saison 2026</h2>
          <div className="mt-3 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
            <p>
              Pendant la saison 2026, une alerte enregistrait l&apos;email, le refuge, le type de
              place et les dates suivies. Ces alertes ne sont plus envoyées. Le paiement passait par
              Paddle : AlerteGR20 n&apos;a jamais vu de numéro de carte.
            </p>
          </div>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Ce que le site ne fait pas</h2>
          <ul className="mt-3 flex max-w-[48ch] list-disc flex-col gap-3 pl-5 text-lg leading-relaxed">
            <li>Pas de compte, pas de mot de passe.</li>
            <li>Pas de publicité, pas de cookie de mesure d&apos;audience.</li>
            <li>Votre email n&apos;est ni vendu ni prêté.</li>
            <li>
              Le site est hébergé par Vercel, qui garde des journaux techniques (adresse IP, page
              demandée) pour faire fonctionner le service.
            </li>
          </ul>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className={headingClass}>Vos droits</h2>
          <div className="mt-3 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
            <p>
              Chaque email contient un lien de désinscription. Pour consulter, corriger ou supprimer
              vos données, écrivez à {contact}. Je réponds moi-même, sous un mois au plus.
            </p>
            <p>
              Vous pouvez aussi adresser une réclamation à la CNIL, sur{" "}
              <a href="https://www.cnil.fr" className={linkClass}>
                cnil.fr
              </a>
              .
            </p>
            <p>
              <Link href="/mentions" className={linkClass}>
                Mentions
              </Link>
            </p>
          </div>
        </section>
      </main>
    </SiteFrame>
  );
}
