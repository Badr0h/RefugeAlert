"use client";

import { FormEvent, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const fieldClass =
  "min-h-12 rounded-md border border-line bg-paper px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine";

export function OuvertureForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

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
      const response = await fetch(`${API_URL}/api/ouverture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        setResult({ ok: false, message: payload?.message ?? "L'inscription n'a pas pu être enregistrée." });
        return;
      }
      setResult({
        ok: true,
        message:
          "C'est noté. Un email de confirmation part tout de suite. Regardez dans les indésirables s'il n'arrive pas.",
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
        Gratuit. Un email de confirmation, puis un seul email le jour de l&apos;annonce du Parc. Le
        lien de désinscription est dans chaque email.
      </p>
    </form>
  );
}
