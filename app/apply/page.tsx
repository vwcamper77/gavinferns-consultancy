import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ApplicationForm } from "@/components/application-form";
import { activeCampaign } from "@/lib/campaigns";
import { acquisitionEnabled } from "@/lib/sales-config";
import { consultancyPricing } from "@/lib/site";

export const metadata: Metadata = { title: "Consulting Application", description: consultancyPricing, robots: { index: false, follow: false } };

export default async function Apply({ searchParams }: { searchParams: Promise<{ campaign?: string }> }) {
  if (!acquisitionEnabled) redirect("/contact");
  const campaign = activeCampaign((await searchParams).campaign);
  return <>
    <section className="page-hero"><div className="container">
      <Link className="breadcrumb" href="/">Home</Link>
      <h1>Apply for private consulting</h1>
      <p>{consultancyPricing} Tell us about your business and what you’d like to improve.</p>
    </div></section>
    <section className="section container reading">
      <ApplicationForm campaign={campaign} />
    </section>
  </>;
}
