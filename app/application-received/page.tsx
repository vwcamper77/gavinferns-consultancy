import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { acquisitionEnabled } from "@/lib/sales-config";

export const metadata: Metadata = { title: "Application Received", robots: { index: false, follow: false } };

export default function Receipt() {
  if (!acquisitionEnabled) notFound();
  return <section className="section container reading">
    <h1>Application received</h1>
    <p>We’ll review your application and get in touch using the email address you provided. If there’s a fit, we’ll send you a booking link.</p>
    <Link className="text-link" href="/insights">Explore insights</Link>
  </section>;
}
