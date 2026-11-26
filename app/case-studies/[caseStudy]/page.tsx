import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Callout } from "@/components/site";
import { caseStudies, site } from "@/lib/site";

type PageProps = { params: Promise<{ caseStudy: string }> };
export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map(({ slug }) => ({ caseStudy: slug }));
}

function getStudy(slug: string) {
  return caseStudies.find((study) => study.slug === slug);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { caseStudy } = await params;
  const study = getStudy(caseStudy);
  if (!study) notFound();
  const path = `/case-studies/${study.slug}`;
  const title = `${study.name} | ${site.name}`;
  return {
    title: study.name, description: study.intro,
    alternates: { canonical: path },
    openGraph: { type: "article", title, description: study.intro, url: path, locale: "en_GB", siteName: site.name, images: ["/social-card.jpg"] },
    twitter: { card: "summary_large_image", title, description: study.intro, images: ["/social-card.jpg"] },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { caseStudy } = await params;
  const study = getStudy(caseStudy);
  if (!study) notFound();
  return <>
    <section className="page-hero"><div className="container">
      <Link className="breadcrumb" href="/case-studies">All case studies</Link>
      <p className="eyebrow">{study.category}</p>
      <h1>{study.title}</h1><p>{study.intro}</p>
      <div className="actions"><a className="button" href={`/downloads/${study.slug}.pdf`} download>Download case study (PDF)</a></div>
    </div></section>
    <article className="section container reading case-study-body" aria-label={study.name}>
      <div><p className="eyebrow">Gavin Ferns Business Consulting · Client engagement</p><h2>{study.client}</h2><p>{study.stage}</p></div>
      <section aria-labelledby="challenge"><h2 id="challenge">The challenge</h2><p>{study.context}</p></section>
      <section aria-labelledby="work"><h2 id="work">Our work</h2><ol className="case-study-list">
        {study.work.map(([heading, body]) => <li key={heading}><h3>{heading}</h3><p>{body}</p></li>)}
      </ol></section>
      <section aria-labelledby="deliverables"><h2 id="deliverables">Key deliverables</h2><ul className="case-study-list">
        {study.deliverables.map(([heading, body]) => <li key={heading}><h3>{heading}</h3><p>{body}</p></li>)}
      </ul></section>
      <section className="case-study-result" aria-labelledby="value"><h2 id="value">Delivered value</h2><p>{study.result}</p><p>{study.takeaway}</p></section>
      <div className="case-study-download"><a className="button" href={`/downloads/${study.slug}.pdf`} download>Download case study (PDF)</a><Link className="text-link" href="/case-studies">View all case studies</Link></div>
    </article>
    <Callout />
  </>;
}
