import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Barlow_Condensed } from "next/font/google";
import { CheckoutOpen } from "../components/CheckoutOpen";
import { homeDescription, homeTitle } from "../content/faq";
import { socialImage } from "../content/productSchema";
import "./globals.css";

const body = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sign = Barlow_Condensed({
  variable: "--font-sign",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://alertegr20.com"),
  title: homeTitle,
  description: homeDescription,
  verification: {
    google: "q0JDua6u7B5GJUXVJejaLhOy8p0vy0q6K3uBqJE5ndg",
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "AlerteGR20",
    url: "https://alertegr20.com",
    title: homeTitle,
    description: homeDescription,
    images: [socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
    images: [socialImage.url],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${body.variable} ${sign.variable} antialiased`}>
        <CheckoutOpen />
        {children}
      </body>
    </html>
  );
}
