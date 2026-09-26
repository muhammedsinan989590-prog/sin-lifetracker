import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ServiceWorkerRegister } from "@/components/lifeos/sw-register";
import { InstallPrompt } from "@/components/lifeos/install-prompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lifeos.daily"),
  title: "Life OS Daily — Habit Tracker",
  description:
    "A premium glassmorphism daily habit checklist. 14 fixed habits, one tap to check, automatic progress tracking.",
  keywords: [
    "Life OS",
    "Habit Tracker",
    "Daily Checklist",
    "Productivity",
    "PWA",
  ],
  authors: [{ name: "Life OS" }],
  manifest: "/manifest.json",
  applicationName: "Life OS Daily",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Life OS Daily",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/icons/favicon-32.png"],
  },
  openGraph: {
    title: "Life OS Daily — Habit Tracker",
    description:
      "A premium glassmorphism daily habit checklist. 14 fixed habits, one tap to check.",
    type: "website",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#344C4B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
        <ServiceWorkerRegister />
        <InstallPrompt />
      </body>
    </html>
  );
}
