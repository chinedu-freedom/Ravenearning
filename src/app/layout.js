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
  const siteUrl = "https://ravenearning.vercel.app";
  let siteName = "Ravenearning";
  let siteTitle = "Ravenearning - Smart Mining & Earnings Platform";

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (apiBase && apiBase.startsWith("http")) {
      const res = await fetch(`${apiBase}/settings`, { 
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.settings?.site_name) siteName = data.settings.site_name;
        if (data?.settings?.site_title) siteTitle = data.settings.site_title;
      }
    }
  } catch (error) {
    // Fallback to defaults
  }

  return {
    metadataBase: new URL(siteUrl),
    title: siteName,
    description: siteTitle,
    manifest: "/manifest.json",
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/logo.jpeg", type: "image/jpeg" },
        { url: "/icon.png", type: "image/png" },
      ],
      shortcut: ["/logo.jpeg"],
      apple: [
        { url: "/logo.jpeg" },
        { url: "/apple-icon.png", type: "image/png" },
      ],
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: siteUrl,
      title: siteName,
      description: siteTitle,
      siteName: siteName,
      images: [
        {
          url: `${siteUrl}/logo.png`,
          width: 800,
          height: 800,
          alt: `${siteName} Logo`,
          type: "image/png",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description: siteTitle,
      images: [`${siteUrl}/logo.png`],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: siteName,
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
      <head>
        <meta property="og:image" content="https://ravenearning.vercel.app/logo.png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content="image/png" />
        <link rel="image_src" href="https://ravenearning.vercel.app/logo.png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
