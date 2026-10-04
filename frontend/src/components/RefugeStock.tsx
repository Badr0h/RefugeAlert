import {
  formatPlaceDay,
  formatReading,
  type Lodging,
  type PlaceStatus,
  type RefugePlaces,
} from "../lib/places";

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

export function RefugeStock({
  refuge,
  du,
  au,
  derniereLecture,
  captionName,
}: {
  refuge: RefugePlaces | undefined;
  du: string | undefined;
  au: string | undefined;
  derniereLecture: string | null;
  captionName: string;
}) {
  if (!refuge || !du || !au) {
    return <p className="mt-4 text-lg">Les places de ce refuge n&apos;ont pas pu être chargées.</p>;
  }

  const dates = [...new Set(refuge.cellules.map((cell) => cell.date))];

  return (
    <div className="mt-4">
      <p className="max-w-[48ch] text-lg leading-relaxed">
        Du {formatPlaceDay(du)} au {formatPlaceDay(au)}. Dernière lecture :{" "}
        {formatReading(derniereLecture)}.
      </p>
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
            Disponibilités de {captionName}, du {du} au {au}
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
                  const cell = refuge.cellules.find(
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
}
