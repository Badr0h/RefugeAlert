import { NextResponse } from "next/server";
import { normalizeEmail, OuvertureUnavailableError, sendConfirmation } from "../../../lib/ouverture";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; website?: unknown } | null;
  // Honeypot: the field is hidden from people, bots fill it. Answer as if it worked.
  if (typeof body?.website === "string" && body.website.length > 0) {
    return NextResponse.json({ message: "ok" });
  }
  const email = normalizeEmail(body?.email);
  if (!email) {
    return NextResponse.json({ message: "Cette adresse email n'est pas valide." }, { status: 400 });
  }
  try {
    await sendConfirmation(email);
    return NextResponse.json({ message: "ok" });
  } catch (error) {
    console.error("Inscription ouverture impossible", error);
    const status = error instanceof OuvertureUnavailableError ? 503 : 502;
    return NextResponse.json(
      { message: "L'email de confirmation n'a pas pu partir. Réessayez dans un instant." },
      { status },
    );
  }
}
