import type { Metadata } from "next";
import Link from "next/link";
import { SiteFrame } from "../../../components/SiteFrame";
import { claimsFromToken, OuvertureUnavailableError } from "../../../lib/ouverture";
import { confirmerInscription } from "./actions";
import { SubmitButton } from "./SubmitButton";

export const metadata: Metadata = {
  title: "Confirmer l'inscription — AlerteGR20",
  robots: { index: false, follow: false },
};

const linkClass =
  "text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

type SearchParams = Promise<{ token?: string; statut?: string }>;

type TokenState = { kind: "valid"; email: string } | { kind: "invalid" } | { kind: "unavailable" };

function readToken(token: string | undefined): TokenState {
  if (!token) {
    return { kind: "invalid" };
  }
  try {
    const claims = claimsFromToken(token);
    return claims ? { kind: "valid", email: claims.email } : { kind: "invalid" };
  } catch (error) {
    if (error instanceof OuvertureUnavailableError) {
      return { kind: "unavailable" };
    }
    throw error;
  }
}

export default async function ConfirmerPage({ searchParams }: { searchParams: SearchParams }) {
  const { token, statut } = await searchParams;
  const state: TokenState | null =
    statut === "confirme"
      ? null
      : statut === "indisponible"
        ? { kind: "unavailable" }
        : readToken(token);

  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink sm:text-5xl">
          Ouverture des réservations 2027
        </h1>
        <div className="mt-6 flex max-w-[48ch] flex-col gap-4 text-lg leading-relaxed">
          {state === null ? (
            <>
              <p className="text-pine">C&apos;est confirmé. Vous êtes sur la liste.</p>
              <p>
                Le jour où le Parc annonce la date d&apos;ouverture 2027, on vous écrit. C&apos;est le seul
                email prévu d&apos;ici là, et il contient un lien de désinscription.
              </p>
              <p>
                <Link href="/places" className={linkClass}>
                  Voir les refuges du GR20
                </Link>
              </p>
            </>
          ) : state.kind === "valid" ? (
            <>
              {statut === "erreur" ? (
                <p className="text-blaze" role="status">
                  L&apos;inscription n&apos;a pas pu être enregistrée. Réessayez dans un instant.
                </p>
              ) : null}
              <p>
                Confirmez que <strong>{state.email}</strong> doit recevoir l&apos;email du jour de
                l&apos;ouverture des réservations.
              </p>
              <form action={confirmerInscription}>
                <input type="hidden" name="token" value={token} />
                <SubmitButton />
              </form>
            </>
          ) : state.kind === "unavailable" ? (
            <p className="text-blaze" role="status">
              La confirmation est momentanément indisponible. Votre lien reste valable 7 jours :
              réessayez un peu plus tard.
            </p>
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
