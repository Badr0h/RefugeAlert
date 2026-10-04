"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { SEASON_END, today } from "../content/season";
import { loadPaddle, onPaddleEvent } from "../lib/paddle";

type Refuge = {
  id: number;
  nom: string;
  slug: string;
  zone: string;
};

type Lodging = "BIVOUAC" | "BAT_FLANC" | "TENTE";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const lodgingOptions: { value: Lodging; label: string }[] = [
  { value: "BIVOUAC", label: "Bivouac" },
  { value: "BAT_FLANC", label: "Bât-flanc" },
  { value: "TENTE", label: "Tente" },
];

const fieldClass =
  "min-h-12 rounded-md border border-line bg-paper px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

export function HomeView({ refugeSlug }: { refugeSlug?: string }) {
  const searchParams = useSearchParams();
  const requestedSlug = refugeSlug ?? searchParams.get("refuge");
  const [refuges, setRefuges] = useState<Refuge[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [refugeId, setRefugeId] = useState("");
  const [typeHebergement, setTypeHebergement] = useState<Lodging>("BIVOUAC");
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  // Filet de sécurité : si Paddle n'ouvre jamais son overlay (réseau coupé, domaine
  // refusé, script bloqué), le bouton doit redevenir cliquable au lieu de rester mort.
  const rearmTimer = useRef<number | null>(null);

  function rearmCheckout() {
    if (rearmTimer.current !== null) {
      window.clearTimeout(rearmTimer.current);
      rearmTimer.current = null;
    }
    setCheckoutPending(false);
  }

  useEffect(
    () => () => {
      if (rearmTimer.current !== null) {
        window.clearTimeout(rearmTimer.current);
      }
    },
    [],
  );

  // La saison borne le sélecteur natif : on ne peut plus choisir une date que le
  // parc ne publiera jamais, et donc plus payer pour une alerte qui ne partira pas.
  const firstDay = useMemo(() => today(), []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!API_URL) {
        setLoadError("La liste des refuges n'a pas pu être chargée.");
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/refuges`);
        if (!response.ok) {
          throw new Error("La liste des refuges n'a pas pu être chargée.");
        }
        const data = (await response.json()) as Refuge[];
        if (!cancelled) {
          setRefuges(data);
          const requested = data.find((refuge) => refuge.slug === requestedSlug);
          const initial = requested ?? data[0];
          if (initial) {
            setRefugeId(String(initial.id));
          }
        }
      } catch {
        if (!cancelled) {
          setLoadError("La liste des refuges n'a pas pu être chargée.");
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [requestedSlug]);

  // Dès que l'overlay Paddle est affiché ou refermé, le bouton reprend son libellé.
  useEffect(
    () =>
      onPaddleEvent((event) => {
        if (event.name === "checkout.loaded" || event.name === "checkout.closed") {
          rearmCheckout();
        }
      }),
    [],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    if (!API_URL) {
      setResult({ ok: false, message: "Le serveur ne répond pas. Réessayez dans un instant." });
      setPending(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/abonnements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          refugeId: Number(refugeId),
          typeHebergement,
          dateDebut,
          dateFin,
        }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setResult({
          ok: false,
          message: payload?.message ?? "L'alerte n'a pas pu être enregistrée.",
        });
        return;
      }
      setResult({
        ok: true,
        message: "Alerte enregistrée. On vous écrit à cette adresse si une place se libère.",
      });
    } catch {
      setResult({
        ok: false,
        message: "Le serveur ne répond pas. Réessayez dans un instant.",
      });
    } finally {
      setPending(false);
    }
  }

  async function onCheckout() {
    setResult(null);
    if (!email.trim()) {
      setResult({
        ok: false,
        message: "Indiquez votre email pour passer en alerte immédiate.",
      });
      return;
    }
    if (!API_URL) {
      setResult({ ok: false, message: "Le serveur ne répond pas. Réessayez dans un instant." });
      return;
    }
    setCheckoutPending(true);
    // On lance le chargement de paddle.js en parallèle de l'appel serveur : quand la
    // transaction revient, la librairie est déjà là et l'overlay s'ouvre tout de suite.
    const paddleReady = loadPaddle();
    try {
      const response = await fetch(`${API_URL}/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
        checkoutUrl?: string;
        transactionId?: string;
      } | null;
      if (!response.ok || !payload?.checkoutUrl) {
        setResult({
          ok: false,
          message: payload?.message ?? "Le paiement n'a pas pu être ouvert. Réessayez.",
        });
        rearmCheckout();
        return;
      }
      const paddle = await paddleReady;
      if (paddle && payload.transactionId) {
        // Paddle ne reprend pas l'email du client rattaché à la transaction : on le lui passe
        // pour que le randonneur n'ait pas à le retaper.
        paddle.Checkout.open({
          transactionId: payload.transactionId,
          customer: { email: email.trim().toLowerCase() },
        });
        rearmTimer.current = window.setTimeout(rearmCheckout, 12000);
        return;
      }
      // Sans paddle.js, on retombe sur la page de paiement hébergée par Paddle.
      window.location.assign(payload.checkoutUrl);
    } catch {
      setResult({
        ok: false,
        message: "Le serveur ne répond pas. Réessayez dans un instant.",
      });
      rearmCheckout();
    }
  }

  return (
    <form id="alerter" onSubmit={onSubmit} className="flex scroll-mt-8 flex-col gap-5">
      <label className="flex flex-col gap-2 text-base">
        Refuge
        <select
          name="refuge"
          required
          value={refugeId}
          disabled={refuges.length === 0}
          onChange={(event) => setRefugeId(event.target.value)}
          className={fieldClass}
        >
          {refuges.length === 0 ? <option value="">Chargement…</option> : null}
          {refuges.map((refuge) => (
            <option key={refuge.id} value={refuge.id}>
              {refuge.nom}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-2 text-base">
        Type de place
        <select
          name="type"
          value={typeHebergement}
          onChange={(event) => setTypeHebergement(event.target.value as Lodging)}
          className={fieldClass}
        >
          {lodgingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-2 text-base">
          Du
          <input
            type="date"
            name="dateDebut"
            required
            value={dateDebut}
            min={firstDay}
            max={SEASON_END}
            onChange={(event) => setDateDebut(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="flex flex-col gap-2 text-base">
          Au
          <input
            type="date"
            name="dateFin"
            required
            value={dateFin}
            min={dateDebut || firstDay}
            max={SEASON_END}
            onChange={(event) => setDateFin(event.target.value)}
            className={fieldClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-base">
        Email
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="vous@exemple.fr"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={`${fieldClass} placeholder:text-stone`}
        />
      </label>

      {loadError ? (
        <p className="text-base text-blaze" role="alert">
          {loadError}
        </p>
      ) : null}
      {result ? (
        <p className={result.ok ? "text-base text-pine" : "text-base text-blaze"} role="status">
          {result.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || checkoutPending || refuges.length === 0}
        className="mt-2 min-h-12 rounded-md bg-blaze px-4 text-lg font-bold text-paper disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        {pending ? "Enregistrement…" : "M'alerter"}
      </button>
      <button
        type="button"
        disabled={checkoutPending || pending}
        onClick={() => void onCheckout()}
        className="min-h-12 rounded-md border border-pine bg-paper px-4 text-lg font-bold text-pine disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        {checkoutPending
          ? "Ouverture du paiement…"
          : "Passer en alerte immédiate — 9,90€/saison"}
      </button>
      <p className="text-base leading-relaxed text-stone">
        Pas de compte. L&apos;adresse sert uniquement à vous écrire. La réservation reste sur{" "}
        <a
          href="https://pnr-resa.corsica"
          className="text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          le site du parc
        </a>
        .{" "}
        <Link
          href="/mentions"
          className="text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          Mentions
        </Link>
        .
      </p>
    </form>
  );
}
