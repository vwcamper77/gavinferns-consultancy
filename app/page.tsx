import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DiscoveryButton, GrowthMethod, ProjectCards, SectionTitle, ServiceCards, VatDisclosure } from "@/components/site";
import { businessProfile, instagram, linkedIn, offers, professionalEmail, site, vatNote, youtube } from "@/lib/site";

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
  const publicProfiles = [instagram, youtube, linkedIn, businessProfile].filter(Boolean);
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
      <div className="container hero-content hero-layout">
        <div>
        <p className="eyebrow">{site.tagline}</p>
        <h1>Build a more profitable business. <span>Not just a bigger one.</span></h1>
        <p className="hero-summary">I help ambitious business owners identify growth opportunities, improve profitability, embrace technology and develop clear strategies for sustainable business growth.</p>
        <div className="hero-actions"><DiscoveryButton /><Link className="button button-outline" href="/business-growth-calculator">Calculate Your Growth Potential</Link></div>
        <p className="hero-price">Consulting engagements from £2,997. {vatNote ?? "VAT treatment pending confirmation."}</p>
        </div>
        <aside className="hero-scenario" aria-label="Illustrative growth scenario">
          <p className="eyebrow">Three Multipliers of Growth</p>
          <p className="scenario-heading">What happens when all three improve by 10%?</p>
          <dl>
            <div><dt>Customers</dt><dd>+10%</dd></div>
            <div><dt>Purchase frequency</dt><dd>+10%</dd></div>
            <div><dt>Average order value</dt><dd>+10%</dd></div>
          </dl>
          <p className="scenario-highlight">+33.1% <span>illustrative revenue growth</span></p>
          <Link href="/three-multipliers-of-growth">See how the multipliers work <span className="arrow" aria-hidden="true" /></Link>
        </aside>
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
      <SectionTitle eyebrow="Services" title="Where do you need support?">For established SMEs, typically turning over £250,000–£1 million, funded founders and owners who want to improve profitability, marketing or operations and rely less on their own day-to-day involvement.</SectionTitle>
      <ServiceCards />
    </section>
    <GrowthMethod linkToMethod />
    <section className="section container">
      <div className="signature-feature">
        <div><p className="eyebrow">Signature offer</p><h2>{signature.name}</h2><p>{signature.scope}</p></div>
        <div><p className="price">{signature.price}</p><p>{signature.duration}</p><Link href="/premium-programmes#transformation" className="button">View the programme <span className="arrow" aria-hidden="true" /></Link></div>
      </div>
      <VatDisclosure />
    </section>
    <section className="section section-tint">
      <div className="container">
        <SectionTitle eyebrow="Professional experience" title="Commercial advice grounded in delivery">Over 20 years of senior leadership and programme delivery experience, alongside business coaching, commercial strategy, digital marketing and AI innovation.</SectionTitle>
        <ProjectCards />
        <Link className="text-link section-link" href="/case-studies">Read the case studies <span className="arrow" aria-hidden="true" /></Link>
      </div>
    </section>
    <Callout />
  </>;
}
