import type { Metadata, Viewport } from "next";
import { Barlow, Bungee } from "next/font/google";
import Link from "next/link";
import { site } from "@/lib/site";
import "./globals.css";

const bungee = Bungee({
  variable: "--font-bungee",
  subsets: ["latin"],
  weight: "400",
});

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.title,
    template: "%s | Burgerman.dk",
  },
  description: site.description,
  applicationName: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: "Burgerman.dk",
    title: site.title,
    description: site.description,
    url: "/",
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#d62828",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className={`${bungee.variable} ${barlow.variable} antialiased min-h-dvh flex flex-col`}>
        <header className="bg-ketchup border-b-2 border-ristet">
          <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" aria-label="Burgerman.dk forside" className="flex items-center gap-2 rounded-full border-2 border-ristet bg-ketchup px-3 py-1">
              <span aria-hidden className="block size-5 rounded-full border-2 border-ristet bg-sennep" />
              <span className="font-display text-lg tracking-wide text-bolle">BURGERMAN</span>
            </Link>
          </nav>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t-2 border-streg px-4 py-6 text-center text-sm">
          Burgerman.dk · Ærlige burgeranmeldelser fra hele Danmark
        </footer>
      </body>
    </html>
  );
}
