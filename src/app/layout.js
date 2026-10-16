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
  const siteUrl = "https://suncerestcapital.com";
  let siteName = "suncerestcapital";
  let siteTitle = "suncerestcapital - Smart Mining & Earnings Platform";

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
        { url: "/icon-32.png?v=sun3", sizes: "32x32", type: "image/png" },
        { url: "/icon-16.png?v=sun3", sizes: "16x16", type: "image/png" },
        { url: "/favicon.ico?v=sun3", sizes: "any" },
        { url: "/icon.png?v=sun3", type: "image/png" },
        { url: "/logo.png?v=sun3", type: "image/png" },
      ],
      shortcut: ["/icon-32.png?v=sun3"],
      apple: [
        { url: "/apple-icon.png?v=sun3" },
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
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32.png?v=sun3" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16.png?v=sun3" />
        <link rel="icon" href="/favicon.ico?v=sun3" sizes="any" />
        <link rel="shortcut icon" href="/icon-32.png?v=sun3" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=sun3" />
        <meta property="og:image" content="https://suncerestcapital.com/logo.png" />
        <meta property="og:image:width" content="800" />
        <meta property="og:image:height" content="800" />
        <meta property="og:image:type" content="image/png" />
        <link rel="image_src" href="https://suncerestcapital.com/logo.png" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster position="top-right" richColors visibleToasts={1} duration={3000} />
      </body>
    </html>
  );
}
