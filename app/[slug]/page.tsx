import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Callout, Framework, OfferCard, ProjectCards, SectionTitle, VatDisclosure } from "@/components/site";
import { DiscoveryForm } from "@/components/discovery-form";
import { discoveryLabel, offers, pages, professionalEmail, routes, services, site, youtube } from "@/lib/site";

type PageProps = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return routes.map((slug) => ({ slug }));
}

function getPage(slug: string) {
  return Object.hasOwn(pages, slug) ? pages[slug as keyof typeof pages] : services.find((service) => service.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  const title = `${page.title} | ${site.name}`;
  return {
    title: page.title,
    description: page.summary,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      type: "website", title, description: page.summary, url: `/${slug}`,
      locale: "en_GB", siteName: site.name, images: ["/social-card.jpg"],
    },
    twitter: { card: "summary_large_image", title, description: page.summary, images: ["/social-card.jpg"] },
  };
}

function About() {
  return <>
    <section className="section container reading">
      <h2>Experience behind the advice</h2>
      <p>Gavin works with business owners and leaders as a business coach, strategic consultant and programme and transformation leader. His approach combines practical coaching and mentoring with more than 20 years delivering complex projects and programmes.</p>
      <p>His background spans rail, construction and infrastructure, including stakeholder management, risk, budgets, leadership and process optimisation. He applies that delivery experience to business strategy, marketing technology, AI, automation and digital growth.</p>
      <Link className="text-link" href="/case-studies">Explore Gavin’s programme experience <span className="arrow" aria-hidden="true" /></Link>
    </section>
    <section className="section section-tint">
      <div className="container"><SectionTitle title="The Ferns Growth Framework" /><Framework /></div>
    </section>
  </>;
}

function Insights() {
  return <section className="section container reading">
    <h2>Three questions to ask before investing in change</h2>
    <ol className="insights-list">
      <li><h3>What decision are we trying to make?</h3><p>Write down the decision, who owns it and when it needs to be made. List what you know and the evidence you still need.</p></li>
      <li><h3>Where does the work get stuck?</h3><p>Follow a real enquiry, task or decision from beginning to end. Note where it waits, who picks it up and where information gets lost.</p></li>
      <li><h3>What would make a pilot worth scaling?</h3><p>Choose an indicator, record the starting point and agree a review date. Decide what evidence would justify another round of investment.</p></li>
    </ol>
    {youtube && <p><a className="text-link" href={youtube}>Watch Gavin on YouTube <span className="arrow" aria-hidden="true" /></a></p>}
    <Link className="text-link" href="/#services">Explore the services <span className="arrow" aria-hidden="true" /></Link>
  </section>;
}

function Contact() {
  return <section className="section container contact-grid">
    <div className="contact-form">
      <h2>Prepare for your call</h2>
      <p>Use these questions to outline where you are and what you’d like to change.</p>
      <DiscoveryForm calendly={site.calendly} whatsapp={site.whatsapp} email={professionalEmail} />
    </div>
    <aside className="contact-aside">
      <h2>Get in touch</h2>
      <a className="button" href={site.calendly}>{discoveryLabel} <span className="arrow" aria-hidden="true" /></a>
      <a className="text-link" href={site.telephoneHref}>{site.telephone}</a>
      <a className="text-link" href={site.whatsapp}>Message on WhatsApp <span className="arrow" aria-hidden="true" /></a>
      {professionalEmail && <a className="text-link" href={`mailto:${professionalEmail}`}>{professionalEmail}</a>}
      <p>Calendly and WhatsApp handle information you choose to share with them. See the <Link href="/privacy-policy">Privacy Policy</Link> for details.</p>
    </aside>
  </section>;
}

function Privacy() {
  return <section className="section container reading">
    <h2>Who handles your information</h2>
    <p>Gavin Ferns Coaching & Consulting handles information you provide when you enquire about coaching or consulting. You can contact Gavin on <a href={site.telephoneHref}>{site.telephone}</a>{professionalEmail && <> or at <a href={`mailto:${professionalEmail}`}>{professionalEmail}</a></>}.</p>
    <h2>Site operation and booking</h2>
    <p>Our hosting provider may process information such as IP addresses, request paths and timestamps to operate and protect the site. The discovery brief is prepared in your browser. The site only copies it to your clipboard when you choose to. This site does not load advertising or analytics trackers.</p>
    <p>If you follow a link to Calendly, WhatsApp or a social profile linked on the site, that service handles information under its own privacy policy. You choose what information you share with us through those channels or by phone{professionalEmail ? " or email" : ""}.</p>
    <h2>How we use and retain enquiries</h2>
    <p>We use contact and business details you share to reply, arrange a call and assess potential work. The basis for this is our legitimate interest in responding to business enquiries or taking steps you request before a contract. We keep information for as long as needed to handle the enquiry, manage agreed work or meet legal requirements.</p>
    <h2>Your rights</h2>
    <p>Depending on the circumstances, you can request access, correction, erasure, restriction or a copy of your data, or object to certain processing. Contact us using the details above. You can also complain to the UK <a href="https://ico.org.uk/make-a-complaint/">Information Commissioner’s Office</a>.</p>
  </section>;
}

export default async function DetailPage({ params }: PageProps) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  const service = services.find((item) => item.slug === slug);
  const offer = offers.find((item) => item.id === service?.offer);

  return <>
    <section className="page-hero">
      <div className="container">
        <Link className="breadcrumb" href="/">Home</Link>
        <h1>{page.title}</h1><p>{page.summary}</p>
      </div>
    </section>
    {service && offer && <section className="section container">
      <div className="service-grid">
        {service.points.map((point) => <article className="service-card" key={point.title}><h2>{point.title}</h2><p>{point.description}</p></article>)}
      </div>
      <Link className="text-link section-link" href={`/premium-programmes#${offer.id}`}>Explore the {offer.name} <span className="arrow" aria-hidden="true" /></Link>
    </section>}
    {slug === "about" && <About />}
    {slug === "premium-programmes" && <section className="section container">
      <VatDisclosure />
      <div className="two-grid offers-grid">
        {offers.map((item) => <OfferCard key={item.id} offer={item} />)}
      </div>
    </section>}
    {slug === "case-studies" && <section className="section container">
      <SectionTitle title="Rail portfolio and project delivery">These examples are from Gavin’s professional delivery experience. The figures reflect the value of the portfolio and project.</SectionTitle>
      <ProjectCards />
      <Link className="text-link section-link" href="/rail-infrastructure">Explore Rail & Infrastructure <span className="arrow" aria-hidden="true" /></Link>
    </section>}
    {slug === "insights" && <Insights />}
    {slug === "contact" && <Contact />}
    {slug === "privacy-policy" && <Privacy />}
    {slug !== "contact" && slug !== "privacy-policy" && <Callout />}
  </>;
}
