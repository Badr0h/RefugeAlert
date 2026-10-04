import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HomeView } from "../components/HomeView";
import { JsonLd } from "../components/JsonLd";
import { OuvertureForm } from "../components/OuvertureForm";
import { SiteFrame } from "../components/SiteFrame";
import {
  faqs,
  homeDescription,
  homeTitle,
  offSeasonFaqs,
  offSeasonHomeDescription,
  offSeasonHomeTitle,
} from "../content/faq";
import { alertProduct, socialImage } from "../content/productSchema";
import { refugePages } from "../content/refuges";
import { faqPage, founder, organization, website } from "../content/schema";
import { seasonOver } from "../content/season";

// Régénérée chaque heure : l'accueil bascule seul en intersaison après SEASON_END.
export const revalidate = 3600;

const steps = [
  "Choisissez le refuge, le type de place et les dates.",
  "On regarde le site du parc.",
  "On écrit à cet email.",
];

export function generateMetadata(): Metadata {
  const off = seasonOver();
  const title = off ? offSeasonHomeTitle : homeTitle;
  const description = off ? offSeasonHomeDescription : homeDescription;
  return {
    title,
    description,
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      url: "/",
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
}

function structuredData(off: boolean) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organization,
      founder,
      website,
      // Pas d'offre à prix affiché tant qu'on ne peut rien acheter.
      ...(off
        ? []
        : [
            alertProduct(
              "Alerte disponibilité GR20",
              "Refuge GR20 complet : alerte quand une place se libère. Le récapitulatif du matin est gratuit en option. L'alerte immédiate coûte 9,90 € jusqu'au 4 octobre 2026.",
              "/",
            ),
          ]),
      faqPage(off ? offSeasonFaqs : faqs),
    ],
  };
}

function linkedAnswer(answer: string) {
  const marker = "pnr-resa.corsica";
  const index = answer.indexOf(marker);
  if (index === -1) {
    return answer;
  }
  return (
    <>
      {answer.slice(0, index)}
      <a
        href="https://pnr-resa.corsica"
        className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        {marker}
      </a>
      {answer.slice(index + marker.length)}
    </>
  );
}

export default function HomePage() {
  const off = seasonOver();
  const questions = off ? offSeasonFaqs : faqs;
  return (
    <SiteFrame>
      <JsonLd data={structuredData(off)} />
      <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:px-10 sm:py-12">
        <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-x-16">
          <div className="max-w-[38rem]">
            <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-6xl">
              Une place se libère, on vous écrit.
            </h1>
            <p className="mt-4 max-w-[48ch] text-base leading-relaxed sm:mt-5 sm:text-lg">
              Refuge GR20 complet : AlerteGR20 vous écrit dès qu&apos;une place de bivouac, de
              bât-flanc ou de tente se libère. C&apos;est une alerte disponibilité GR20. Les places
              sont lues sur{" "}
              <a
                href="https://pnr-resa.corsica"
                className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              >
                pnr-resa.corsica
              </a>
              . Le site ne réserve pas à votre place : vous recevez l&apos;email, puis la
              réservation refuge GR20 se fait sur le site du parc.
            </p>
          </div>

          {off ? (
            <section
              id="alerter"
              aria-labelledby="ouverture-titre"
              className="scroll-mt-8 rounded-md border border-line bg-paper p-5 sm:p-6 lg:sticky lg:top-8 lg:row-span-2"
            >
              <h2
                id="ouverture-titre"
                className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink"
              >
                Saison 2026 terminée
              </h2>
              <p className="mt-2 text-lg leading-relaxed">
                Les réservations 2027 ne sont pas encore ouvertes. En 2026, le Parc a ouvert le 20
                janvier. Laissez votre email : on vous écrit le jour de l&apos;annonce.
              </p>
              <div className="mt-4">
                <OuvertureForm />
              </div>
              <p className="mt-4 text-base">
                <Link
                  href="/ouverture-2027"
                  className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  Tout sur l&apos;ouverture des réservations 2027
                </Link>
              </p>
            </section>
          ) : (
            /* Ce que couvre chaque formule se lit juste avant les boutons qui les déclenchent. */
          <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:row-span-2">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-5">
              <section>
                <h2 className="font-[family-name:var(--font-sign)] text-2xl font-bold text-pine sm:text-3xl">
                  Le matin
                </h2>
                <p className="mt-1 text-base leading-relaxed sm:mt-2 sm:text-lg">
                  Gratuit. S&apos;il y a eu une ouverture, vous recevez un email à 7&nbsp;h, heure
                  de Paris.
                </p>
              </section>
              <section>
                <h2 className="font-[family-name:var(--font-sign)] text-2xl font-bold text-pine sm:text-3xl">
                  Dès l&apos;ouverture
                </h2>
                <p className="mt-1 text-base leading-relaxed sm:mt-2 sm:text-lg">
                  Un paiement unique de 9,90&nbsp;€ débloque l&apos;alerte immédiate pour tous les
                  refuges et toutes les dates suivis avec cet email, jusqu&apos;au 4 octobre 2026.
                </p>
              </section>
            </div>
            <Suspense fallback={<p className="text-lg">Chargement…</p>}>
              <HomeView />
            </Suspense>
          </div>
          )}

          <div className="flex max-w-[40rem] flex-col gap-12">
            <ol className="flex flex-col gap-4">
              {steps.map((step, index) => (
                <li key={step} className="flex gap-4 text-lg leading-relaxed">
                  <span className="font-[family-name:var(--font-sign)] text-2xl font-bold text-pine">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>

            <section className="border-t border-line pt-8">
              <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
                Qui écrit
              </h2>
              <p className="mt-3 max-w-[48ch] text-lg leading-relaxed">
                AlerteGR20 est fait par Badreddine Oussaih, développeur.{" "}
                <Link
                  href="/a-propos"
                  className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  À propos
                </Link>
                . Contact :{" "}
                <a
                  href="mailto:oussaihbadreddine@gmail.com"
                  className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  oussaihbadreddine@gmail.com
                </a>
                . Les places viennent de pnr-resa.corsica. Il n&apos;y a pas de compte : l&apos;adresse
                sert uniquement à vous écrire.{" "}
                <Link
                  href="/mentions"
                  className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  Mentions
                </Link>
                .
              </p>
            </section>

            <section className="border-t border-line pt-8">
              <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
                Questions
              </h2>
              <div className="mt-6 flex flex-col gap-8">
                {questions.map((item) => (
                  <section key={item.question}>
                    <h3 className="text-xl font-bold leading-snug">{item.question}</h3>
                    {"points" in item ? (
                      <ul className="mt-2 flex max-w-[52ch] list-disc flex-col gap-3 pl-5 text-lg leading-relaxed">
                        {item.points.map((point) => (
                          <li key={point}>{linkedAnswer(point)}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 max-w-[52ch] text-lg leading-relaxed">
                        {linkedAnswer(item.answer)}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </section>

            <section className="border-t border-line pt-8">
              <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
                Les 12 refuges
              </h2>
              <ul className="mt-2 flex max-w-[40rem] flex-col text-lg">
                {refugePages.map((refuge) => (
                  <li key={refuge.publicSlug}>
                    <Link
                      href={`/refuges/${refuge.publicSlug}`}
                      className="flex min-h-11 items-center text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                    >
                      {refuge.searchName}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-lg">
                <Link
                  href="/places"
                  className="inline-flex min-h-11 items-center font-bold text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  Voir les disponibilités des refuges du GR20
                </Link>
              </p>
            </section>
          </div>
        </div>
      </main>
    </SiteFrame>
  );
}
