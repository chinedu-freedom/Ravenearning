import { Geist, Geist_Mono, Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata() {
  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase && apiBase.startsWith("http")) {
      const res = await fetch(`${apiBase}/settings`, { 
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        const siteName = data?.settings?.site_name || "Ravenearning";
        const siteTitle = data?.settings?.site_title || "The Ultimate Crypto Asset Mining & Earnings Platform";
        return {
          title: siteName,
          description: siteTitle,
          manifest: "/manifest.json",
          icons: {
            icon: "/logo.jpeg",
            shortcut: "/logo.jpeg",
            apple: "/logo.jpeg",
          },
          appleWebApp: {
            capable: true,
            statusBarStyle: "default",
            title: siteName,
          },
        };
      }
    }
  } catch (error) {
    // Ignore error and fallback to default
  }
  return {
    title: "Ravenearning",
    description: "The Ultimate Crypto Asset Mining & Earnings Platform",
    manifest: "/manifest.json",
    icons: {
      icon: "/logo.jpeg",
      shortcut: "/logo.jpeg",
      apple: "/logo.jpeg",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: "Ravenearning",
    },
  };
}

import { Providers } from "./providers";
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
