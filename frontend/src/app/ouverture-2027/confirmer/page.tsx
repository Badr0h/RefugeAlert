import type { Metadata } from "next";
import Link from "next/link";
import { SiteFrame } from "../../../components/SiteFrame";
import { emailFromToken, OuvertureUnavailableError } from "../../../lib/ouverture";
import { confirmerInscription } from "./actions";

export const metadata: Metadata = {
  title: "Confirmer l'inscription — AlerteGR20",
  robots: { index: false, follow: false },
};

const linkClass =
  "text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

type SearchParams = Promise<{ token?: string; statut?: string }>;

function readEmail(token: string | undefined): string | null {
  if (!token) {
    return null;
  }
  try {
    return emailFromToken(token);
  } catch (error) {
    if (error instanceof OuvertureUnavailableError) {
      return null;
    }
    throw error;
  }
}

export default async function ConfirmerPage({ searchParams }: { searchParams: SearchParams }) {
  const { token, statut } = await searchParams;
  const email = statut === "confirme" ? null : readEmail(token);

  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          Ouverture des réservations 2027
        </h1>
        <div className="mt-6 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          {statut === "confirme" ? (
            <>
              <p className="text-pine">C&apos;est confirmé. Vous êtes sur la liste.</p>
              <p>
                Le jour où le Parc annonce la date d&apos;ouverture 2027, on vous écrit. C&apos;est le seul
                email prévu d&apos;ici là, et il contient un lien de désinscription.
              </p>
              <p>
                <Link href="/places" className={linkClass}>
                  Voir les refuges et les disponibilités
                </Link>
              </p>
            </>
          ) : email ? (
            <>
              {statut === "erreur" ? (
                <p className="text-blaze" role="status">
                  L&apos;inscription n&apos;a pas pu être enregistrée. Réessayez dans un instant.
                </p>
              ) : null}
              <p>
                Confirmez que <strong>{email}</strong> doit recevoir l&apos;email du jour de l&apos;ouverture
                des réservations.
              </p>
              <form action={confirmerInscription}>
                <input type="hidden" name="token" value={token} />
                <button
                  type="submit"
                  className="min-h-12 rounded-md bg-blaze px-4 text-lg font-bold text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  Confirmer mon inscription
                </button>
              </form>
            </>
          ) : (
            <>
              <p>Ce lien n&apos;est plus valable. Il expire au bout de 7 jours.</p>
              <p>
                <Link href="/ouverture-2027#prevenir" className={linkClass}>
                  Recommencer l&apos;inscription
                </Link>
              </p>
            </>
          )}
        </div>
      </main>
    </SiteFrame>
  );
}
