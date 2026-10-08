import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

// Variabel ini dipakai tailwind.config (font-sans / font-display / font-mono).
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const description = "Temukan graphic designer, video editor, dan content creative terbaik Indonesia melalui portfolio, bukan CV.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Portora.id — Creative Talent Discovery Platform",
    template: "%s | Portora.id",
  },
  description,
  applicationName: "Portora.id",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Portora.id",
    title: "Portora.id — Creative Talent Discovery Platform",
    description,
  },
  twitter: { card: "summary", title: "Portora.id", description },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${inter.variable} ${fraunces.variable} ${plexMono.variable}`}>
      <body className="font-sans" style={{ backgroundColor: "#FAFAF7", color: "#0A0E1A" }}>{children}</body>
    </html>
  );
}
