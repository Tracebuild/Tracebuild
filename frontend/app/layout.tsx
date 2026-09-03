import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TraceBuild — Baueingaben gegen jede Norm prüfen",
  description:
    "TraceBuild prüft Eingabepläne automatisch gegen SIA-Normen und kantonales Baurecht — jede Fundstelle nachvollziehbar. Dazu eine zentrale, laufend aktualisierte Normen-Datenbank.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={`${inter.variable} ${archivo.variable}`}>
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
