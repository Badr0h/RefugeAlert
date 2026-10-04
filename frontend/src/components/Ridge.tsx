/**
 * La crête du GR20 : des aiguilles de granite, pas des collines. Deux plans pour la
 * profondeur. Le tracé est dessiné ici, donc aucune question de licence d'image.
 *
 * Le composant ne prend aucune hauteur propre : il se pose en fond de l'en-tête, et le
 * nom du site repose dessus comme sur un horizon.
 */

const FAR =
  "M0,120 L0,74 L48,52 L86,66 L132,38 L178,60 L214,46 L268,72 L316,44 L372,64 L418,40 " +
  "L470,58 L524,34 L578,62 L626,48 L684,70 L736,42 L790,60 L842,36 L898,58 L946,44 " +
  "L1002,66 L1054,40 L1108,58 L1152,46 L1200,62 L1200,120 Z";

const NEAR =
  "M0,120 L0,96 L40,80 L74,92 L118,64 L160,86 L196,70 L240,94 L284,58 L330,84 L368,72 " +
  "L414,96 L456,66 L500,88 L548,54 L596,82 L640,68 L688,92 L730,62 L778,86 L820,74 " +
  "L868,98 L910,60 L956,84 L1000,70 L1046,94 L1090,66 L1136,88 L1174,76 L1200,90 L1200,120 Z";

/** Sommets du plan proche, pour poser un repère au bon endroit sur la chaîne. */
const NEAR_PEAKS = [118, 196, 284, 368, 456, 548, 640, 730, 820, 910, 1000, 1090];
const NEAR_PEAK_Y = [64, 70, 58, 72, 66, 54, 68, 62, 74, 60, 70, 66];

export function Ridge({
  markIndex,
  className = "",
}: {
  /** Position du refuge sur la chaîne, pour peindre le balisage sur son sommet. */
  markIndex?: number;
  className?: string;
}) {
  const mark =
    markIndex !== undefined && markIndex >= 0 && markIndex < NEAR_PEAKS.length
      ? { x: NEAR_PEAKS[markIndex], y: NEAR_PEAK_Y[markIndex] }
      : null;

  return (
    <svg
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <path d={FAR} fill="var(--ridge-far)" />
      <path d={NEAR} fill="var(--ridge-near)" />
      {mark ? (
        <g>
          <rect x={mark.x - 7} y={mark.y - 20} width="14" height="7" rx="1" fill="var(--blaze)" />
          <rect x={mark.x - 7} y={mark.y - 12} width="14" height="7" rx="1" fill="var(--paper)" />
        </g>
      ) : null}
    </svg>
  );
}
