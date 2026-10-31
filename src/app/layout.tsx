import type { Metadata } from "next";
import { ADLaM_Display, Fascinate, Fauna_One, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const faunaOne = Fauna_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fauna-one",
});

const adlamDisplay = ADLaM_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-adlam-display",
});

const fascinate = Fascinate({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fascinate",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CV Aligner AI",
  description: "Optimiza tu CV y da seguimiento a tus postulaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${faunaOne.variable} ${adlamDisplay.variable} ${fascinate.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
