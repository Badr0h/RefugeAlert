import type { Metadata } from "next";
import { SiteFrame } from "../../components/SiteFrame";

export const metadata: Metadata = {
  title: "Désinscription — AlerteGR20",
  robots: { index: false, follow: false },
};

const INVALID = "Ce lien n'est plus valide";

type DesabonnerPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export const dynamic = "force-dynamic";

export default async function DesabonnerPage({ searchParams }: DesabonnerPageProps) {
  const { token } = await searchParams;
  const message = await unsubscribeMessage(token);

  return (
    <SiteFrame>
      <main className="mx-auto w-full max-w-2xl px-5 py-10 sm:px-10 sm:py-16">
        <h1 className="font-[family-name:var(--font-sign)] text-4xl leading-[0.95] font-bold text-ink">
          Désinscription
        </h1>
        <p className="mt-4 max-w-[38ch] text-lg leading-relaxed text-ink" role="status">
          {message}
        </p>
      </main>
    </SiteFrame>
  );
}

async function unsubscribeMessage(token: string | undefined): Promise<string> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || !token) {
    return INVALID;
  }
  try {
    const response = await fetch(
      `${apiUrl}/api/abonnements/desabonner?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const html = await response.text();
    const match = html.match(/id="message">([^<]*)</);
    return match?.[1] ?? INVALID;
  } catch {
    return INVALID;
  }
}
