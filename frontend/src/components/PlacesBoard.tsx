"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { refugeByDbSlug } from "../content/refuges";
import { formatPlaceDay, type Lodging, type PlaceStatus, type PlacesPayload } from "../lib/places";

const types: { value: Lodging; label: string }[] = [
  { value: "BIVOUAC", label: "Bivouac" },
  { value: "BAT_FLANC", label: "Bât-flanc" },
  { value: "TENTE", label: "Tente" },
];

function cellLabel(statut: PlaceStatus): string {
  if (statut === "DISPONIBLE") {
    return "Libre";
  }
  if (statut === "COMPLET") {
    return "Complet";
  }
  return "Pas encore lu";
}

function cellClass(statut: PlaceStatus): string {
  if (statut === "DISPONIBLE") {
    return "font-bold text-pine";
  }
  return "text-stone";
}

export function PlacesBoard({ board }: { board: PlacesPayload }) {
  const [slug, setSlug] = useState(board.refuges[0]?.slug ?? "");
  const refuge = useMemo(
    () => board.refuges.find((item) => item.slug === slug) ?? board.refuges[0],
    [board.refuges, slug],
  );

  if (!refuge) {
    return <p className="mt-6 text-lg">La saison affichée est terminée.</p>;
  }

  return (
    <div className="mt-8">
      <label className="flex max-w-md flex-col gap-2 text-base">
        Refuge
        <select
          value={refuge.slug}
          onChange={(event) => setSlug(event.target.value)}
          className="min-h-12 rounded-md border border-line bg-paper px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          {board.refuges.map((item) => (
            <option key={item.id} value={item.slug}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      {board.refuges.map((item) => {
        const dates = [...new Set(item.cellules.map((cell) => cell.date))];
        const selected = item.slug === refuge.slug;
        const page = refugeByDbSlug(item.slug);
        return (
          <div key={item.slug} hidden={!selected} className="mt-6">
            <h2 className="font-[family-name:var(--font-sign)] text-3xl font-bold text-ink">
              {page ? (
                <Link
                  href={`/refuges/${page.publicSlug}`}
                  className="underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
                >
                  {item.nom}
                </Link>
              ) : (
                item.nom
              )}
            </h2>
            <p className="mt-4 text-base text-stone sm:hidden">
              Faites glisser le tableau pour voir le bât-flanc et la tente.
            </p>
            <div
              className="scroll-x mt-2 overflow-x-auto"
              tabIndex={0}
              role="region"
              aria-label="Tableau des disponibilités, défilement horizontal"
            >
              <table className="w-full min-w-[28rem] border-collapse text-left text-base">
                <caption className="sr-only">
                  Disponibilités de {item.nom}, du {board.du} au {board.au}
                </caption>
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="sticky left-0 bg-mist py-3 pr-4 font-bold">
                      Date
                    </th>
                    {types.map((type) => (
                      <th key={type.value} scope="col" className="px-3 py-3 font-bold">
                        {type.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dates.map((date) => (
                    <tr key={date} className="border-b border-line">
                      <th scope="row" className="sticky left-0 bg-mist py-3 pr-4 font-normal">
                        {formatPlaceDay(date)}
                      </th>
                      {types.map((type) => {
                        const cell = item.cellules.find(
                          (entry) => entry.date === date && entry.type === type.value,
                        );
                        const statut = cell?.statut ?? null;
                        return (
                          <td key={type.value} className={`px-3 py-3 ${cellClass(statut)}`}>
                            {cellLabel(statut)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <p className="mt-6">
        <Link
          href={`/?refuge=${refuge.slug}#alerter`}
          className="inline-flex min-h-11 items-center text-lg font-bold text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          M&apos;alerter pour ce refuge
        </Link>
      </p>
    </div>
  );
}
