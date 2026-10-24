"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="min-h-12 rounded-md bg-blaze px-4 text-lg font-bold text-paper disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine"
    >
      {pending ? "Confirmation…" : "Confirmer mon inscription"}
    </button>
  );
}
