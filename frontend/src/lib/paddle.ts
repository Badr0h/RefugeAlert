/**
 * Chargement de paddle.js. L'overlay s'ouvre sur la page courante : le visiteur ne
 * quitte jamais le formulaire, et ne voit pas la page d'accueil se recharger à vide
 * pendant que la librairie arrive.
 *
 * Paddle.Initialize ne doit être appelé qu'une fois par page, d'où la mémoïsation.
 */

export type PaddleEvent = { name?: string };

type PaddleClient = {
  Initialize: (options: {
    token: string;
    eventCallback?: (event: PaddleEvent) => void;
    checkout?: { settings?: Record<string, string> };
  }) => void;
  Checkout: {
    open: (options: { transactionId: string; customer?: { email: string } }) => void;
  };
};

declare global {
  interface Window {
    Paddle?: PaddleClient;
  }
}

const SRC = "https://cdn.paddle.com/paddle/v2/paddle.js";

let pending: Promise<PaddleClient | null> | null = null;
const listeners = new Set<(event: PaddleEvent) => void>();

/** S'abonne aux évènements de checkout (checkout.loaded, checkout.closed, …). */
export function onPaddleEvent(listener: (event: PaddleEvent) => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function script(): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`);
    if (existing) {
      if (window.Paddle) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("paddle")), { once: true });
      return;
    }
    const tag = document.createElement("script");
    tag.src = SRC;
    tag.async = true;
    tag.onload = () => resolve();
    tag.onerror = () => reject(new Error("paddle"));
    document.head.appendChild(tag);
  });
}

/** Renvoie le client Paddle prêt à l'emploi, ou null si la librairie n'a pas pu charger. */
export function loadPaddle(): Promise<PaddleClient | null> {
  if (pending) {
    return pending;
  }
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!token) {
    pending = Promise.resolve(null);
    return pending;
  }
  pending = script()
    .then(() => {
      const paddle = window.Paddle;
      if (!paddle) {
        return null;
      }
      paddle.Initialize({
        token,
        // Les réglages doivent être posés ici : ils ne sont pas lus dans Checkout.open
        // quand on ouvre une transaction existante.
        checkout: { settings: { displayMode: "overlay", theme: "light", locale: "fr" } },
        eventCallback: (event) => {
          listeners.forEach((listener) => listener(event));
        },
      });
      return paddle;
    })
    .catch(() => null);
  return pending;
}
