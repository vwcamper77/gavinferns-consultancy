import type { Metadata } from "next";
import { AnalyticsConsent } from "@/components/analytics-consent";
import { Footer, Header } from "@/components/site";
import { canIndex, measurementId, site } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: site.name, template: `%s | ${site.name}` },
  description: "Business coaching, strategic consulting and digital transformation with Gavin Ferns.",
  robots: { index: canIndex, follow: canIndex },
  verification: canIndex ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  openGraph: { type: "website", locale: "en_GB", siteName: site.name, images: ["/social-card.jpg"] },
  twitter: { card: "summary_large_image", images: ["/social-card.jpg"] },
  icons: { icon: "/cgf-logo.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB"><body>
    <a href="#content" className="skip-link">Skip to content</a>
    <Header />
    <main id="content">{children}</main>
    {measurementId && <AnalyticsConsent measurementId={measurementId} />}
    <Footer />
  </body></html>;
}
