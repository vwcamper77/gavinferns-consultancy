import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConsultancyRoiCalculator } from "@/components/consultancy-roi-calculator";
import { GrowthCalculator } from "@/components/growth-calculator";
import { DiscoveryButton, SectionTitle } from "@/components/site";
import { activeCampaign, campaigns } from "@/lib/campaigns";
import { consultancyPricing, vatNote } from "@/lib/site";

type Props = { params: Promise<{ campaign: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const key = activeCampaign((await params).campaign);
  if (!key) notFound();
  const campaign = campaigns[key];
  const description = `${campaign.meta} ${consultancyPricing}`;
  return { title: campaign.title, description, alternates: { canonical: `/campaign/${key}` },
    openGraph: { title: campaign.title, description, url: `/campaign/${key}`, images: [campaign.asset?.src ?? "/social-card.jpg"] } };
}

export default async function CampaignPage({ params }: Props) {
  const key = activeCampaign((await params).campaign);
  if (!key) notFound();
  const campaign = campaigns[key];
  return <>
    <section className="page-hero">
      <div className={`container${campaign.asset ? " hero-layout" : ""}`}>
        <div>
          <Link className="breadcrumb" href="/">Home</Link>
          <h1>{campaign.headline}</h1>
          <p>{campaign.message}</p>
          <p className="programme-starting-price">{consultancyPricing} {vatNote}</p>
          <div className="actions">
            <DiscoveryButton label={campaign.cta} campaign={key} />
            <a className="button button-outline" href="#estimate">Model your figures</a>
          </div>
        </div>
        {campaign.asset && <Image src={campaign.asset.src} alt={campaign.asset.alt} width={720} height={480} />}
      </div>
    </section>
    <section id="estimate" className="section section-tint">
      <div className="container">
        <SectionTitle title={key === "three-multipliers" ? "Business growth calculator" : "Consultancy ROI calculator"}>
          Enter your own figures to see how changes could affect your business.
        </SectionTitle>
        {key === "three-multipliers" ? <GrowthCalculator discovery={<DiscoveryButton label={campaign.cta} campaign={key} />} /> : <ConsultancyRoiCalculator />}
      </div>
    </section>
    <section className="section container">
      <SectionTitle title="Start with a discovery conversation">Tell us what you’d like to improve. We’ll review your priorities and discuss the scope and investment if there’s a fit.</SectionTitle>
      <DiscoveryButton label={campaign.cta} campaign={key} />
      <p className="subcopy"><Link className="text-link" href="/premium-programmes">See the consulting routes</Link></p>
    </section>
  </>;
}
