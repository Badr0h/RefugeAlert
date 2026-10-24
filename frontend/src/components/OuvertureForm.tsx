"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const fieldClass =
  "min-h-12 rounded-md border border-line bg-paper px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

/** `?src=` (or `utm_source`) from shared links, then the referring site, then "direct". */
function signupSource(): string {
  const params = new URLSearchParams(window.location.search);
  const fromLink = params.get("src") ?? params.get("utm_source");
  if (fromLink) {
    return fromLink;
  }
  try {
    const referrer = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : "";
    return referrer && referrer !== window.location.hostname ? referrer : "direct";
  } catch {
    return "direct";
  }
}

export function OuvertureForm() {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setResult(null);
    try {
      const response = await fetch("/api/ouverture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, website, source: signupSource() }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setResult({ ok: false, message: payload?.message ?? "L'inscription n'a pas pu être enregistrée." });
        return;
      }
      setResult({
        ok: true,
        message:
          "Presque fini : cliquez sur le lien de l'email qu'on vient d'envoyer. Regardez dans les indésirables s'il n'arrive pas.",
      });
    } catch {
      setResult({ ok: false, message: "Le serveur ne répond pas. Réessayez dans un instant." });
    } finally {
      setPending(false);
    }
  }

  return (
    <form id="prevenir" onSubmit={onSubmit} className="flex scroll-mt-8 flex-col gap-5">
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

      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </label>
      </div>

      {result ? (
        <p className={result.ok ? "text-base text-pine" : "text-base text-blaze"} role="status">
          {result.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="min-h-12 rounded-md bg-blaze px-4 text-lg font-bold text-paper disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
      >
        {pending ? "Enregistrement…" : "Prévenez-moi le jour de l'ouverture"}
      </button>
      <p className="text-base leading-relaxed text-stone">
        Gratuit. Vous confirmez votre adresse en un clic, puis vous recevez un seul email le jour de
        l&apos;annonce du Parc. Le lien de désinscription est dans cet email.{" "}
        <Link
          href="/confidentialite"
          className="text-pine underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
        >
          Vos données
        </Link>
        .
      </p>
    </form>
  );
}
