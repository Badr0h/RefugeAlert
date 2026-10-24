import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { OuvertureForm } from "../../components/OuvertureForm";
import { SiteFrame } from "../../components/SiteFrame";
import { socialImage } from "../../content/productSchema";
import { breadcrumb, faqPage } from "../../content/schema";

const title = "Ouverture des réservations refuges GR20 2027 — AlerteGR20";
const description =
  "Réservations des refuges du GR20 2027 : en 2026, pnr-resa.corsica a ouvert le 20 janvier. Laissez votre email, on vous écrit le jour où le Parc annonce la date 2027.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/ouverture-2027" },
  openGraph: {
    title,
    description,
    url: "/ouverture-2027",
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

const firstToGo = [
  { name: "Ortu di u Piobbu", slug: "ortu-di-u-piobbu" },
  { name: "Carrozzu", slug: "carrozzu" },
  { name: "Usciolu", slug: "usciolu" },
];

const questions = [
  {
    question: "Quand ouvrent les réservations des refuges du GR20 en 2027\u00a0?",
    answer:
      "Le Parc naturel régional de Corse n'a pas encore publié la date 2027. En 2026, la plateforme pnr-resa.corsica a ouvert le 20 janvier. AlerteGR20 écrit aux inscrits le jour où le Parc annonce la date.",
  },
  {
    question: "Où se réservent les refuges du GR20\u00a0?",
    answer:
      "Uniquement sur pnr-resa.corsica, le site du Parc. AlerteGR20 ne réserve pas à votre place.",
  },
  {
    question: "Quels refuges du GR20 sont complets en premier\u00a0?",
    answer:
      "En 2026, Ortu di u Piobbu, Carrozzu et Usciolu sont partis en premier. Les semaines les plus demandées sont début juin et début septembre.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [breadcrumb([{ name: "Ouverture 2027", path: "/ouverture-2027" }]), faqPage(questions)],
};

const linkClass =
  "text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

export default function OuverturePage() {
  return (
    <SiteFrame>
      <JsonLd data={structuredData} />
      <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          Réservations des refuges du GR20 2027
        </h1>
        <div className="mt-5 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          <p>
            En 2026, la plateforme de réservation du Parc a ouvert le <strong>20 janvier</strong>. Les
            dates 2027 seront celles que le Parc publiera. Le jour de l&apos;annonce, on écrit aux
            inscrits.
          </p>
          <p>
            Les refuges qui partent en premier :{" "}
            {firstToGo.map((refuge, index) => (
              <span key={refuge.slug}>
                <Link href={`/refuges/${refuge.slug}`} className={linkClass}>
                  {refuge.name}
                </Link>
                {index < firstToGo.length - 2 ? ", " : index === firstToGo.length - 2 ? " et " : ""}
              </span>
            ))}
            . Les semaines les plus demandées : début juin et début septembre.
          </p>
        </div>

        <section aria-labelledby="prevenir-titre" className="mt-8 rounded-md border border-line bg-paper p-5 sm:p-6">
          <h2 id="prevenir-titre" className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
            Être prévenu le jour de l&apos;ouverture
          </h2>
          <div className="mt-4">
            <OuvertureForm />
          </div>
        </section>

        <div className="mt-8 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          <p>
            AlerteGR20 ne réserve pas. La réservation reste sur{" "}
            <a href="https://pnr-resa.corsica" className={linkClass}>
              pnr-resa.corsica
            </a>
            . Les alertes de place pour la saison 2027 seront annoncées aux inscrits.
          </p>
        </div>

        <section aria-labelledby="questions-titre" className="mt-10">
          <h2 id="questions-titre" className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
            Questions
          </h2>
          <dl className="mt-4 flex max-w-[48ch] flex-col gap-5 text-lg leading-relaxed">
            {questions.map((item) => (
              <div key={item.question}>
                <dt className="font-bold">{item.question}</dt>
                <dd className="mt-1">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      </main>
    </SiteFrame>
  );
}
