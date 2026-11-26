import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { acquisitionEnabled, adsId, attributionEnabled, gtmId, metaPixelId } from "@/lib/sales-config";
import { acceleratorPhases, commercialConsiderations, businessProfile, consultancyPricing, discoveryLabel, instagram, linkedIn, measurementId, multipliers, offers, professionalEmail, projects, services, site, vatNote, youtube } from "@/lib/site";

export function Brand() {
  return <Link href="/" className="brand">
    <Image src="/gfc-logo.svg" width={78} height={27} alt="" unoptimized />
    <span>{site.shortName}</span>
  </Link>;
}

const navigation = [
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/business-growth-calculator", label: "Calculator" },
  { href: "/premium-programmes", label: "Programmes" },
  { href: "/case-studies", label: "Portfolio" },
  { href: "/insights", label: "Insights" },
];

export function discoveryHref(campaign?: string) {
  if (!acquisitionEnabled) return "/contact";
  return campaign ? `/apply?campaign=${encodeURIComponent(campaign)}` : "/apply";
}

function DiscoveryLink({ className, label = discoveryLabel, campaign }: { className: string; label?: string; campaign?: string }) {
  const href = discoveryHref(campaign);
  // A fresh document keeps third-party measurement scripts out of the application form.
  return acquisitionEnabled
    ? <a className={className} href={href}>{label}</a>
    : <Link className={className} href={href}>{label}</Link>;
}

export function Header() {
  return <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav className="desktop-nav" aria-label="Main">
        {navigation.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <DiscoveryLink className="button button-small header-cta" />
      <MobileNav links={[...navigation, { href: discoveryHref(), label: discoveryLabel }]} />
    </div>
  </header>;
}

export function DiscoveryButton({ label, campaign }: { label?: string; campaign?: string } = {}) {
  return <DiscoveryLink className="button" label={label} campaign={campaign} />;
}

export function Footer() {
  return <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div><Brand /><p>{site.tagline}</p></div>
        <div><h2>Explore</h2><Link href="/about">About Gavin</Link><Link href="/premium-programmes">Premium Consulting Programmes</Link><Link href="/case-studies">Portfolio and Case Studies</Link><Link href="/insights">Insights and Resources</Link><Link href="/brand-pack">Brand Pack</Link></div>
        <div><h2>Connect</h2><Link href="/contact">Contact</Link><a href={site.telephoneHref}>{site.telephone}</a>
          {professionalEmail && <a href={`mailto:${professionalEmail}`}>{professionalEmail}</a>}
          <a href={site.whatsapp}>WhatsApp</a>
          {instagram && <a href={instagram}>Instagram</a>}
          {youtube && <a href={youtube}>YouTube</a>}
          {linkedIn && <a href={linkedIn}>LinkedIn</a>}
          {businessProfile && <a href={businessProfile}>Google Business Profile</a>}
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getUTCFullYear()} {site.name}</span><div className="footer-privacy"><Link href="/privacy-policy">Privacy Policy</Link>{(measurementId || gtmId || metaPixelId || adsId || attributionEnabled) && <Link href="#analytics-settings">Tracking settings</Link>}</div></div>
    </div>
  </footer>;
}

export function SectionTitle({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return <div className="section-heading">
    {eyebrow && <p className="eyebrow">{eyebrow}</p>}
    <h2>{title}</h2>
    {children && <p className="subcopy">{children}</p>}
  </div>;
}

export function ServiceCards() {
  return <div className="service-grid">
    {services.map((service) => <Link key={service.slug} href={`/${service.slug}`} className="service-card">
      <h3>{service.title}</h3><p>{service.summary}</p>
      <span className="text-link" aria-hidden="true">Explore service <span className="arrow" aria-hidden="true" /></span>
    </Link>)}
  </div>;
}

export function ProjectCards() {
  return <div className="two-grid">
    {projects.map((project) => <article key={project.name} className="project-card">
      <p className="eyebrow">{project.name}</p>
      <p className="stat">{project.amount}</p>
      <h3>{project.label}</h3>
      <p>{project.description}</p>
    </article>)}
  </div>;
}

export function GrowthMethod({ heading = "Three Multipliers of Growth", linkToMethod = false }: { heading?: string; linkToMethod?: boolean }) {
  return <section className="section section-tint">
    <div className="container">
      <SectionTitle title={heading}>Customer acquisition is one lever. Repeat purchases and order value can also increase revenue from the customers you already serve.</SectionTitle>
      <p className="growth-formula">Revenue = Customers × Purchase Frequency × Average Order Value</p>
      <div className="service-grid">
        {multipliers.map((multiplier) => <article key={multiplier.name} className="service-card">
          <h3>{multiplier.name}</h3><p>{multiplier.description}</p>
          <ul className="tactics">{multiplier.tactics.map((tactic) => <li key={tactic}>{tactic}</li>)}</ul>
        </article>)}
      </div>
      <p className="subcopy">Revenue growth and profitability are different measures. Test the Three Multipliers against the economics and capacity of your business.</p>
      <div className="service-grid commercial-grid">{commercialConsiderations.map(({ title, description }) => <article className="service-card" key={title}><h3>{title}</h3><p>{description}</p></article>)}</div>
      <div className="actions">
        <Link className="button" href="/business-growth-calculator">Calculate Your Growth Potential</Link>
        {linkToMethod && <Link className="text-link" href="/three-multipliers-of-growth">Explore the methodology <span className="arrow" aria-hidden="true" /></Link>}
      </div>
    </div>
  </section>;
}

export function OfferCard({ offer }: { offer: (typeof offers)[number] }) {
  return <article id={offer.id} className={`offer-card ${offer.id === "transformation" ? "signature" : ""}`}>
    <h3>{offer.name}</h3>
    <p className="price">{offer.price}</p><p className="duration">{offer.duration}</p>
    <dl>
      <dt>Who it’s for</dt><dd>{offer.audience}</dd>
      <dt>Scope</dt><dd>{offer.scope}</dd>
      <dt>Deliverables</dt><dd>{offer.deliverables}</dd>
      {offer.id === "transformation" && <><dt>Three programme phases</dt><dd><ol className="tactics">{acceleratorPhases.map((phase) => <li key={phase}>{phase}</li>)}</ol></dd></>}
      <dt>Intended outcome</dt><dd>{offer.outcome}</dd>
    </dl>
    <DiscoveryButton />
  </article>;
}

export function Callout() {
  return <section className="callout">
    <div className="container callout-inner">
      <div><h2>What do you want to change?</h2><p>Bring one challenge. We’ll discuss what a good next step could look like.</p><p>{consultancyPricing}</p></div>
      <DiscoveryButton />
    </div>
  </section>;
}

export function VatDisclosure() {
  return <p className="fine-print">{vatNote ?? "Preview pricing. VAT treatment is pending confirmation."} Outcomes depend on your circumstances and implementation. Financial results are never guaranteed.</p>;
}
