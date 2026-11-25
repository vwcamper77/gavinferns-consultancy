import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNav } from "@/components/mobile-nav";
import { discoveryLabel, framework, instagram, offers, professionalEmail, projects, services, site, vatNote, youtube } from "@/lib/site";

export function Brand() {
  return <Link href="/" className="brand">
    <Image src="/cgf-logo.svg" width={78} height={27} alt="" unoptimized />
    <span>Gavin Ferns <small>Coaching & Consulting</small></span>
  </Link>;
}

const navigation = [
  { href: "/about", label: "About" },
  { href: "/#services", label: "Services" },
  { href: "/premium-programmes", label: "Programmes" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/insights", label: "Insights" },
];

export function Header() {
  return <header className="site-header">
    <div className="container header-inner">
      <Brand />
      <nav className="desktop-nav" aria-label="Main">
        {navigation.map(({ href, label }) => <Link key={href} href={href}>{label}</Link>)}
      </nav>
      <Link className="button button-small header-cta" href="/contact">Book a Discovery Call <span className="arrow" aria-hidden="true" /></Link>
      <MobileNav links={[...navigation, { href: "/contact", label: discoveryLabel }]} />
    </div>
  </header>;
}

export function DiscoveryButton() {
  return <Link className="button" href="/contact">{discoveryLabel} <span className="arrow" aria-hidden="true" /></Link>;
}

export function Footer() {
  return <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div><Brand /><p>Clarity. Strategy. Transformation.</p></div>
        <div><h2>Explore</h2><Link href="/about">About Gavin</Link><Link href="/premium-programmes">Premium Programmes</Link><Link href="/case-studies">Case Studies</Link><Link href="/insights">Insights & Video Resources</Link></div>
        <div><h2>Connect</h2><Link href="/contact">Contact</Link><a href={site.telephoneHref}>{site.telephone}</a>
          {professionalEmail && <a href={`mailto:${professionalEmail}`}>{professionalEmail}</a>}
          <a href={site.whatsapp}>WhatsApp</a>
          {instagram && <a href={instagram}>Instagram</a>}
          {youtube && <a href={youtube}>YouTube</a>}
        </div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getUTCFullYear()} {site.name}</span><Link href="/privacy-policy">Privacy Policy</Link></div>
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

export function Framework() {
  return <ol className="framework-grid">
    {framework.map((step) => <li key={step.name}>
      <span className="framework-letter" aria-hidden="true">{step.name[0]}</span>
      <h3>{step.name}</h3><p>{step.description}</p>
    </li>)}
  </ol>;
}

export function OfferCard({ offer }: { offer: (typeof offers)[number] }) {
  return <article id={offer.id} className={`offer-card ${offer.id === "transformation" ? "signature" : ""}`}>
    {offer.id === "transformation" && <p className="eyebrow">Signature offer</p>}
    <h2>{offer.name}</h2>
    <p className="price">{offer.price}</p><p className="duration">{offer.duration}</p>
    <dl>
      <dt>Who it’s for</dt><dd>{offer.audience}</dd>
      <dt>Scope</dt><dd>{offer.scope}</dd>
      <dt>Deliverables</dt><dd>{offer.deliverables}</dd>
      <dt>Intended outcome</dt><dd>{offer.outcome}</dd>
    </dl>
  </article>;
}

export function Callout() {
  return <section className="callout">
    <div className="container callout-inner">
      <div><h2>What do you want to change?</h2><p>Bring one challenge. We’ll discuss what a good next step could look like.</p></div>
      <DiscoveryButton />
    </div>
  </section>;
}

export function VatDisclosure() {
  return <p className="fine-print">{vatNote ?? "Preview pricing. VAT treatment is pending confirmation."} Outcomes depend on your circumstances and implementation. Financial results are never guaranteed.</p>;
}
