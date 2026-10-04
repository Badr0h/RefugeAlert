import Link from "next/link";
import type { ReactNode } from "react";
import { Blaze } from "./Blaze";
import { Ridge } from "./Ridge";

const linkClass =
  "text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

export function SiteFrame({
  children,
  ridgeMarkIndex,
}: {
  children: ReactNode;
  /** Peint le balisage sur le sommet de ce refuge dans la crête de l'en-tête. */
  ridgeMarkIndex?: number;
}) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-pine focus:px-4 focus:py-3 focus:text-paper"
      >
        Aller au contenu
      </a>
      <div className="flex min-h-screen">
        <div className="w-3 shrink-0 bg-blaze sm:w-4" aria-hidden="true" />
        <div className="w-2 shrink-0 bg-paper sm:w-3" aria-hidden="true" />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="relative isolate">
            {/* La crête occupe le fond de l'en-tête : le nom se pose dessus sans rien pousser vers le bas. */}
            <Ridge
              markIndex={ridgeMarkIndex}
              className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-20 w-full sm:h-24"
            />
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 px-5 pt-8 pb-5 sm:px-10">
              <Link
                href="/"
                className="flex items-center gap-2 font-[family-name:var(--font-sign)] text-3xl font-semibold tracking-wide text-pine focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
              >
                <Blaze className="h-6 w-6 shrink-0 -rotate-6" />
                AlerteGR20
              </Link>
              <nav className="flex flex-wrap gap-x-5 gap-y-1 text-base" aria-label="Pages">
                <Link href="/ouverture-2027" className={`${linkClass} py-2`}>
                  Ouverture 2027
                </Link>
                <Link href="/places" className={`${linkClass} py-2`}>
                  Disponibilités
                </Link>
                <Link href="/#alerter" className={`${linkClass} py-2`}>
                  M&apos;alerter
                </Link>
                <Link href="/mentions" className={`${linkClass} py-2`}>
                  Mentions
                </Link>
              </nav>
            </div>
          </header>
          <div id="contenu" className="flex-1">
            {children}
          </div>
          <footer className="px-5 py-8 text-base text-stone sm:px-10">
            <nav className="flex flex-wrap gap-x-5" aria-label="Pied de page">
              <Link href="/ouverture-2027" className={`${linkClass} inline-block py-2`}>
                Réservations GR20 2027
              </Link>
              <Link href="/places" className={`${linkClass} inline-block py-2`}>
                Disponibilités des refuges
              </Link>
              <Link href="/a-propos" className={`${linkClass} inline-block py-2`}>
                À propos
              </Link>
              <Link href="/mentions" className={`${linkClass} inline-block py-2`}>
                Mentions
              </Link>
            </nav>
          </footer>
        </div>
      </div>
    </div>
  );
}
