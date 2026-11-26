import type { Metadata } from "next";
import Link from "next/link";
import { Callout, DiscoveryButton, GrowthMethod, ProjectCards, SectionTitle, ServiceCards, VatDisclosure } from "@/components/site";
import { businessProfile, consultancyPricing, instagram, linkedIn, offers, positioning, credibility, professionalEmail, site, vatNote, youtube } from "@/lib/site";

const description = `Build a more profitable business. Not just a bigger one. ${consultancyPricing}`;

export const metadata: Metadata = {
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website", title: site.name, url: "/",
    description,
    images: ["/social-card.jpg"],
  },
};

export default function Home() {
  const publicProfiles = [instagram, youtube, linkedIn, businessProfile].filter(Boolean);
  const business = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    logo: `${site.url}/gfc-logo.svg`,
    telephone: "+447545810870",
    ...(professionalEmail && { email: professionalEmail }),
    founder: { "@type": "Person", name: "Gavin Ferns" },
    ...(publicProfiles.length && { sameAs: publicProfiles }),
    description,
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business).replace(/</g, "\\u003c") }} />
    <section className="hero">
      <div className="container hero-content hero-layout">
        <div>
        <p className="eyebrow">{site.tagline}</p>
        <h1>Build a more profitable business. <span>Not just a bigger one.</span></h1>
        <p className="hero-summary">{positioning.summary}</p>
        <p className="hero-background">Executive MBA · Imperial College Business School<br />Innovation specialism · 20+ years of professional experience</p>
        <div className="hero-actions"><DiscoveryButton /><Link className="button button-outline" href="/business-growth-calculator">Calculate Your Business Growth Potential</Link></div>
        <p className="hero-price">{consultancyPricing} {vatNote ?? "VAT treatment pending confirmation."}</p>
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
        {credibility.map(({ title, detail }) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}
      </div>
    </section>
    <section className="section container" id="services">
      <SectionTitle eyebrow="Services" title="Where do you need support?">For established SMEs, typically turning over £250,000–£1 million, funded founders and owners who want to improve profitability, marketing or operations and rely less on their own day-to-day involvement.</SectionTitle>
      <ServiceCards />
    </section>
    <GrowthMethod linkToMethod />
    <section className="section container">
      <SectionTitle title="Three ways to work together" />
      <div className="offers-grid">
        {offers.map((offer) => <article className={`offer-card ${offer.id === "transformation" ? "signature" : ""}`} key={offer.id}>
          <h3>{offer.name}</h3>
          <p className="price">{offer.price}</p>
          <p className="duration">{offer.duration}</p>
          <p className="subcopy">{offer.scope}</p>
          <Link className="text-link section-link" href={`/premium-programmes#${offer.id}`} aria-label={`Explore the ${offer.name}`}>View details</Link>
        </article>)}
      </div>
      <VatDisclosure />
    </section>
    <section className="section section-tint">
      <div className="container">
        <SectionTitle eyebrow="Professional experience" title="Commercial advice grounded in delivery">{positioning.background}</SectionTitle>
        <p className="fine-print">The project and portfolio values below relate to corporate employment experience.</p>
        <ProjectCards />
        <Link className="text-link section-link" href="/about">Meet Gavin and explore his business expertise</Link><br />
        <Link className="text-link section-link" href="/case-studies">Read the case studies <span className="arrow" aria-hidden="true" /></Link>
      </div>
    </section>
    <Callout />
  </>;
}
