import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
const description =
  "Tienda oficial de KOP STUDIO. Ropa urbana y streetwear de alta calidad hecha en Colombia. Colección Ascensión 2026.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KOP STUDIO - Streetwear Urbano",
    template: "%s",
  },
  description,
  keywords: ["KOP STUDIO", "streetwear", "ropa urbana", "fashion", "colombia", "Pasto", "Nariño"],
  applicationName: "KOP STUDIO",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "KOP STUDIO",
    title: "KOP STUDIO - Streetwear Urbano",
    description,
    url: "/",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "KOP STUDIO - Colección Ascensión 2026" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "KOP STUDIO - Streetwear Urbano",
    description,
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:text-sm focus:font-bold"
        >
          Saltar al contenido
        </a>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              border: "1px solid #262626",
              color: "#f5f5f5",
            },
          }}
        />
      </body>
    </html>
  );
}