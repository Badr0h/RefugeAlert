import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { HomeView } from "../../../components/HomeView";
import { JsonLd } from "../../../components/JsonLd";
import { OuvertureForm } from "../../../components/OuvertureForm";
import { RefugeStock } from "../../../components/RefugeStock";
import { SiteFrame } from "../../../components/SiteFrame";
import { alertProduct, socialImage } from "../../../content/productSchema";
import {
  offSeasonDescription,
  refugeByPublicSlug,
  refugePages,
} from "../../../content/refuges";
import { breadcrumb } from "../../../content/schema";
import { seasonOver } from "../../../content/season";
import { fetchPlaces } from "../../../lib/places";

type RefugePageProps = {
  params: Promise<{ slug: string }>;
};

const linkClass =
  "flex min-h-11 items-center text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

// Next exige une valeur littérale ici. Doit rester aligné sur PLACES_REVALIDATE.
export const revalidate = 60;

export function generateStaticParams() {
  return refugePages.map((refuge) => ({ slug: refuge.publicSlug }));
}

export async function generateMetadata({ params }: RefugePageProps): Promise<Metadata> {
  const { slug } = await params;
  const refuge = refugeByPublicSlug(slug);
  if (!refuge) {
    return {};
  }
  const path = `/refuges/${refuge.publicSlug}`;
  const description = seasonOver() ? offSeasonDescription(refuge) : refuge.description;
  return {
    title: refuge.title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: refuge.title,
      description,
      url: path,
      locale: "fr_FR",
      type: "website",
      siteName: "AlerteGR20",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: refuge.title,
      description,
      images: [socialImage.url],
    },
  };
}

export default async function RefugePage({ params }: RefugePageProps) {
  const { slug } = await params;
  const refuge = refugeByPublicSlug(slug);
  if (!refuge) {
    notFound();
  }

  const index = refugePages.findIndex((item) => item.publicSlug === refuge.publicSlug);
  const previous = index > 0 ? refugePages[index - 1] : undefined;
  const next = index >= 0 && index < refugePages.length - 1 ? refugePages[index + 1] : undefined;
  const board = await fetchPlaces();
  const stock = board?.refuges.find((item) => item.slug === refuge.dbSlug);
  const path = `/refuges/${refuge.publicSlug}`;
  const off = seasonOver();

  return (
    <SiteFrame ridgeMarkIndex={index}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            breadcrumb([{ name: refuge.searchName, path }]),
            // Pas d'offre à prix affiché entre deux saisons.
            ...(off
              ? []
              : [
                  alertProduct(
                    `Alerte disponibilité ${refuge.searchName}`,
                    refuge.description,
                    path,
                  ),
                ]),
          ],
        }}
      />
      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          {refuge.searchName}
        </h1>
        <p className="mt-3 max-w-[48ch] text-lg leading-relaxed text-stone">
          Nom sur le stock du parc : {refuge.officialName}.{" "}
          {off
            ? "Saison 2026 terminée. Les réservations 2027 ne sont pas encore ouvertes."
            : "Saison suivie jusqu'au 4 octobre 2026."}
        </p>

        <section className="mt-8">
          <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-pine">
            Sur le GR20
          </h2>
          <div className="mt-3 flex max-w-[52ch] flex-col gap-4 text-lg leading-relaxed">
            {refuge.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-10 border-t border-line pt-8">
          <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
            Disponibilités
          </h2>
          <RefugeStock
            refuge={stock}
            du={board?.du}
            au={board?.au}
            derniereLecture={board?.derniereLecture ?? null}
            captionName={refuge.searchName}
          />
        </section>

        <section className="mt-10 max-w-md border-t border-line pt-8">
          <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
            {off ? "Être prévenu pour 2027" : <>M&apos;alerter pour {refuge.searchName}</>}
          </h2>
          <div className="mt-4">
            {off ? (
              <>
                <p className="mb-4 text-lg leading-relaxed">
                  On vous écrit le jour où le Parc ouvre les réservations 2027.{" "}
                  <Link
                    href="/ouverture-2027"
                    className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                  >
                    Ce qu&apos;on sait de l&apos;ouverture
                  </Link>
                  .
                </p>
                <OuvertureForm />
              </>
            ) : (
              <Suspense fallback={<p className="text-lg">Chargement…</p>}>
                <HomeView refugeSlug={refuge.dbSlug} />
              </Suspense>
            )}
          </div>
        </section>

        <nav className="mt-10 flex flex-col border-t border-line pt-6 text-lg" aria-label="Autres pages">
          <Link href="/" className={linkClass}>
            Retour à l&apos;accueil
          </Link>
          {previous ? (
            <Link href={`/refuges/${previous.publicSlug}`} className={linkClass}>
              Étape précédente : {previous.searchName}
            </Link>
          ) : null}
          {next ? (
            <Link href={`/refuges/${next.publicSlug}`} className={linkClass}>
              Étape suivante : {next.searchName}
            </Link>
          ) : null}
        </nav>
      </main>
    </SiteFrame>
  );
}
