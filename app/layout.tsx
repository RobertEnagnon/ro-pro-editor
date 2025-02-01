import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RoMagic Pro - Éditeur de Photos par ronasdev",
  description: "Transformez vos photos en œuvres d'art avec RoMagic Pro, l'éditeur de photos interactif développé par ronasdev. Suivez des tutoriels exclusifs sur YouTube pour maîtriser la retouche photo comme un pro.",
  keywords: ["RoMagic Pro", "Éditeur de photos", "Retouche photo", "ronasdev", "YouTube", "Next.js"],
  authors: [{ name: "ronasdev", url: "https://www.youtube.com/@ronasdev" }],
  openGraph: {
    title: "RoMagic Pro - Éditeur de Photos par ronasdev",
    description: "Découvrez RoMagic Pro, un éditeur de photos puissant et intuitif conçu avec Next.js. Apprenez à utiliser toutes ses fonctionnalités grâce aux tutoriels sur la chaîne YouTube de ronasdev.",
    url: "https://ronasdev.com", 
    images: [
      {
        url: "/logo-romagic.jpg",
        width: 800,
        height: 600,
        alt: "RoMagic Pro Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RoMagic Pro - Éditeur de Photos par ronasdev",
    description: "Transformez vos photos avec RoMagic Pro et apprenez à le maîtriser sur la chaîne YouTube de ronasdev.",
    site: "@ronasdev",
    creator: "@ronasdev",
    images: ["/logo-romagic.jpg"],
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
