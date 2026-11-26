import Link from "next/link";
import { caseStudies } from "@/lib/site";

export function CaseStudyCards() {
  return <div className="two-grid case-study-cards">
    {caseStudies.map((study) => <article className="case-study-card" key={study.slug}>
      <p className="eyebrow">{study.category}</p>
      <h2><Link href={`/case-studies/${study.slug}`}>{study.name}</Link></h2>
      <p>{study.intro}</p>
      <div className="actions">
        <Link className="button" href={`/case-studies/${study.slug}`} aria-label={`Read case study: ${study.name}`}>Read case study <span className="arrow" aria-hidden="true" /></Link>
        <a className="text-link" href={`/downloads/${study.slug}.pdf`} download aria-label={`Download PDF: ${study.name}`}>Download PDF</a>
      </div>
    </article>)}
  </div>;
}
