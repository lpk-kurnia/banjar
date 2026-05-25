import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SessionProvider } from "@/components/providers/session-provider";
import { ServiceWorkerProvider } from "@/components/providers/service-worker-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#1e40af",
};

export const metadata: Metadata = {
  title: "LPK Kurnia - Forum Komunitas Komputer",
  description: "Belajar komputer gratis di LPK Kurnia. Bergabung dengan forum komunitas untuk berdiskusi tentang hardware, software, dan troubleshooting.",
  keywords: ["LPK Kurnia", "Forum Komputer", "Belajar Komputer", "Hardware", "Software", "Troubleshooting"],
  authors: [{ name: "LPK Kurnia" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "LPK Kurnia",
  },
  openGraph: {
    title: "LPK Kurnia - Forum Komunitas Komputer",
    description: "Belajar komputer gratis dan bergabung dengan forum komunitas aktif",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <SessionProvider>
          <ServiceWorkerProvider />
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
