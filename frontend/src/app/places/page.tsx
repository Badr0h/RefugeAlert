import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "../../components/JsonLd";
import { PlacesBoard } from "../../components/PlacesBoard";
import { SiteFrame } from "../../components/SiteFrame";
import { socialImage } from "../../content/productSchema";
import { refugeByDbSlug } from "../../content/refuges";
import { breadcrumb } from "../../content/schema";
import { seasonOver } from "../../content/season";
import { fetchPlaces, formatPlaceDay, formatReading } from "../../lib/places";

const title = "Disponibilités des refuges du GR20 — AlerteGR20";
const seasonDescription =
  "Disponibilités des refuges du GR20 lues sur pnr-resa.corsica : bivouac, bât-flanc et tente, jusqu'au 4 octobre 2026. Ortu, Carrozzu, Usciolu et les neuf autres.";
const offSeasonDescription =
  "Disponibilités des 12 refuges du GR20 lues sur pnr-resa.corsica : bivouac, bât-flanc et tente. Le tableau affichera 2027 dès l'ouverture des réservations.";

// Next exige une valeur littérale ici. Doit rester aligné sur PLACES_REVALIDATE.
export const revalidate = 60;

export function generateMetadata(): Metadata {
  const description = seasonOver() ? offSeasonDescription : seasonDescription;
  return {
    title,
    description,
    alternates: { canonical: "/places" },
    openGraph: {
      title,
      description,
      url: "/places",
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

export default async function PlacesPage() {
  const board = await fetchPlaces();

  return (
    <SiteFrame>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...breadcrumb([{ name: "Disponibilités", path: "/places" }]),
        }}
      />
      <main className="mx-auto w-full max-w-3xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          Disponibilités des refuges du GR20
        </h1>
        {board ? (
          <>
            <p className="mt-4 max-w-[48ch] text-lg leading-relaxed">
              Places lues sur{" "}
              <a
                href="https://pnr-resa.corsica"
                className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              >
                pnr-resa.corsica
              </a>
              , du {formatPlaceDay(board.du)} au {formatPlaceDay(board.au)}. Dernière lecture :{" "}
              {formatReading(board.derniereLecture)}.
            </p>
            <ul className="mt-4 flex max-w-[40rem] flex-col text-lg">
              {board.refuges.map((refuge) => {
                const page = refugeByDbSlug(refuge.slug);
                return (
                  <li key={refuge.slug}>
                    {page ? (
                      <Link
                        href={`/refuges/${page.publicSlug}`}
                        className="flex min-h-11 items-center text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                      >
                        {refuge.nom}
                      </Link>
                    ) : (
                      refuge.nom
                    )}
                  </li>
                );
              })}
            </ul>
            {board.refuges.length === 0 ? (
              <p className="mt-6 text-lg">
                La saison affichée est terminée.{" "}
                <Link
                  href="/ouverture-2027"
                  className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  Être prévenu de l&apos;ouverture 2027
                </Link>
                .
              </p>
            ) : (
              <PlacesBoard board={board} />
            )}
          </>
        ) : (
          <p className="mt-6 text-lg text-blaze" role="alert">
            Les places n&apos;ont pas pu être chargées.
          </p>
        )}
        <p className="mt-10 text-lg">
          <Link
            href="/#alerter"
            className="inline-flex min-h-11 items-center font-bold text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
          >
            Créer une alerte
          </Link>
        </p>
      </main>
    </SiteFrame>
  );
}
