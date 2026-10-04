/**
 * Le balisage du GR : barre rouge sur barre blanche, peinte sur le granite.
 * C'est le repère que les marcheurs suivent sur le terrain — il sert ici de marque.
 */
export function Blaze({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
      role="presentation"
    >
      <rect x="2" y="3" width="20" height="8" rx="1" fill="var(--blaze)" />
      <rect x="2" y="13" width="20" height="8" rx="1" fill="var(--paper)" stroke="var(--line)" />
    </svg>
  );
}
