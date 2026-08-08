import type { Metadata } from "next";
import Script from "next/script";
import { Cormorant_Garamond, Jost, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { getSiteSettings } from "@/lib/firestore";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});
const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-jost",
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = settings.seoTitle || settings.siteName || "BR Hospitality Group";
  const description = settings.seoDescription || "BR Hospitality Group — premium dining, conventions, resorts, farm stays and catering across Hyderabad.";
  const keywords = settings.seoKeywords ? settings.seoKeywords.split(",").map(k => k.trim()).filter(Boolean) : undefined;

  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s — ${settings.siteName || "BR Hospitality Group"}` },
    description,
    keywords,
    alternates: { canonical: "/" },
    icons: settings.logoUrl ? { icon: settings.logoUrl, shortcut: settings.logoUrl, apple: settings.logoUrl } : undefined,
    openGraph: {
      type: "website",
      url: siteUrl,
      siteName: settings.siteName || "BR Hospitality Group",
      title,
      description,
      images: settings.logoUrl ? [{ url: settings.logoUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.logoUrl ? [settings.logoUrl] : undefined,
    },
    verification: settings.searchConsoleVerification ? { google: settings.searchConsoleVerification } : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.siteName || "BR Hospitality Group",
    url: siteUrl,
    logo: settings.logoUrl || undefined,
    description: settings.seoDescription || undefined,
    address: settings.address ? { "@type": "PostalAddress", addressLocality: settings.address } : undefined,
    telephone: settings.phone1 || undefined,
    email: settings.email || undefined,
    sameAs: [settings.instagram, settings.facebook, settings.youtube].filter(Boolean),
  };

  return (
    <html lang="en">
      <body className={`${cormorant.variable} ${jost.variable} ${inter.variable} antialiased`}>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
        <Toaster position="top-right" />
        {settings.gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
