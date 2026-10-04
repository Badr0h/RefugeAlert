"use client";

import { useEffect, useState } from "react";
import { loadPaddle, onPaddleEvent } from "../lib/paddle";

/**
 * Reprend un paiement ouvert dans une autre page : Paddle renvoie ici avec ?_ptxn=…
 * et ouvre son overlay. Le temps que paddle.js arrive, on dit ce qui se passe plutôt
 * que de laisser la page d'accueil se recharger l'air de rien.
 */
export function CheckoutOpen() {
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    const transactionId = new URLSearchParams(window.location.search).get("_ptxn");
    if (!transactionId) {
      return;
    }
    setOpening(true);

    const stop = onPaddleEvent((event) => {
      if (event.name === "checkout.loaded" || event.name === "checkout.closed") {
        setOpening(false);
      }
    });

    let cancelled = false;
    void loadPaddle().then((paddle) => {
      if (cancelled) {
        return;
      }
      if (!paddle) {
        setOpening(false);
        return;
      }
      // Paddle ouvre lui-même la transaction présente dans l'URL après Initialize.
      // Si l'overlay ne vient pas, on arrête d'afficher l'attente au bout de 15 s.
      window.setTimeout(() => {
        if (!cancelled) {
          setOpening(false);
        }
      }, 15000);
    });

    return () => {
      cancelled = true;
      stop();
    };
  }, []);

  if (!opening) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-mist/95 px-5"
      role="status"
      aria-live="polite"
    >
      <p className="font-[family-name:var(--font-sign)] text-3xl font-bold text-pine">
        Ouverture du paiement sécurisé…
      </p>
    </div>
  );
}
