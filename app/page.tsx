import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DiscoveryButton, Framework, ProjectCards, SectionTitle, ServiceCards, VatDisclosure } from "@/components/site";
import { instagram, offers, professionalEmail, site, youtube } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", title: site.name, url: "/",
    description: "Business coaching, strategic consulting and digital transformation with Gavin Ferns.",
    images: ["/social-card.jpg"],
  },
};

const signature = offers.find(({ id }) => id === "transformation")!;

export default function Home() {
  const publicProfiles = [instagram, youtube].filter(Boolean);
  const business = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    logo: `${site.url}/cgf-logo.svg`,
    telephone: "+447545810870",
    ...(professionalEmail && { email: professionalEmail }),
    founder: { "@type": "Person", name: "Gavin Ferns" },
    ...(publicProfiles.length && { sameAs: publicProfiles }),
    description: "Business coaching, strategic consulting and programme transformation.",
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />
    <section className="hero">
      <div className="container hero-content">
        <p className="eyebrow">Clarity. Strategy. Transformation.</p>
        <h1>Think Bigger.<br />Lead Better.<br /><span>Grow Smarter.</span></h1>
        <p className="hero-summary">Business coaching, strategic consulting and transformation for leaders ready to make better decisions and deliver meaningful change.</p>
        <div className="hero-actions"><DiscoveryButton /><Link className="button button-outline" href="/premium-programmes">Explore Programmes</Link></div>
      </div>
    </section>
    <section className="proof-band" aria-label="Professional experience">
      <div className="container proof-grid">
        <div><strong>20+ years</strong><span>Delivering complex projects and programmes</span></div>
        <div><strong>£200m</strong><span>Hitachi Rail portfolio managed</span></div>
        <div><strong>£102m</strong><span>Network Rail project led</span></div>
      </div>
    </section>
    <section className="section container" id="services">
      <SectionTitle eyebrow="Services" title="Where do you need support?">For established SMEs, funded startups, ambitious entrepreneurs and infrastructure organisations.</SectionTitle>
      <ServiceCards />
    </section>
    <section className="section section-tint">
      <div className="container">
        <SectionTitle eyebrow="How we work" title="The Ferns Growth Framework">Five steps to set direction, put it to work and review what changes.</SectionTitle>
        <Framework />
      </div>
    </section>
    <section className="section container">
      <div className="signature-feature">
        <div><p className="eyebrow">Signature offer</p><h2>{signature.name}</h2><p>{signature.scope}</p></div>
        <div><p className="price">{signature.price}</p><p>{signature.duration}</p><Link href="/premium-programmes#transformation" className="button">View the programme <span className="arrow" aria-hidden="true" /></Link></div>
      </div>
      <VatDisclosure />
    </section>
    <section className="section section-tint">
      <div className="container">
        <SectionTitle eyebrow="Professional experience" title="Leading complex programmes" />
        <ProjectCards />
        <Link className="text-link section-link" href="/case-studies">Read the case studies <span className="arrow" aria-hidden="true" /></Link>
      </div>
    </section>
    <Callout />
  </>;
}
