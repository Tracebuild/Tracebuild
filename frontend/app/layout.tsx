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
  title: "TraceBuild — Zeichnungen prüfen, Normen einhalten",
  description:
    "TraceBuild liest Ihre Zeichnungen, gleicht sie mit geltenden Normen und Vorschriften ab und zeigt jede Abweichung — klar dargestellt und nachvollziehbar belegt.",
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
