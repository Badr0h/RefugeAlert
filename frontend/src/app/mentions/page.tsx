import type { Metadata } from "next";
import Link from "next/link";
import { SiteFrame } from "../../components/SiteFrame";
import { socialImage } from "../../content/productSchema";

const title = "Mentions — AlerteGR20";
const description =
  "Mentions d'AlerteGR20 : éditeur du site, source des disponibilités des refuges du GR20, et réservation qui reste toujours sur pnr-resa.corsica, le site du Parc.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/mentions" },
  openGraph: {
    title,
    description,
    url: "/mentions",
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

export default function MentionsPage() {
  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-10 sm:py-14">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink">
          Mentions
        </h1>
        <div className="mt-6 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          <p>
            AlerteGR20 est édité par Badreddine Oussaih. Contact :{" "}
            <a
              href="mailto:oussaihbadreddine@gmail.com"
              className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              oussaihbadreddine@gmail.com
            </a>
            .
          </p>
          <p>
            Le site est hébergé par Vercel. Les emails partent par Resend, qui stocke aussi la liste
            de l&apos;ouverture 2027. L&apos;API des alertes, hébergée par Render pendant la saison
            2026, est arrêtée.
          </p>
          <p>
            Ce qui est fait de votre email :{" "}
            <Link
              href="/confidentialite"
              className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
            >
              confidentialité
            </Link>
            .
          </p>
          <p>
            Les places affichées viennent du site du parc, pnr-resa.corsica. AlerteGR20 ne réserve
            pas à votre place.
          </p>
        </div>
      </main>
    </SiteFrame>
  );
}
