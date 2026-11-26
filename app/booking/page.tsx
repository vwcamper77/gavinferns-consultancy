import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { uuid } from "@/lib/acquisition";
import { acquisitionEnabled } from "@/lib/sales-config";
import { database, transaction } from "@/lib/sales-db";
import { recordEvent } from "@/lib/sales-leads";
import { approvedUrl, bookingProvider } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book Your Discovery Call", robots: { index: false, follow: false }, referrer: "no-referrer" };

const booking = approvedUrl(process.env.SITE_BOOKING_URL, ["calendly.com", "calendar.google.com", "calendar.app.google"]);

async function openCalendar(formData: FormData) {
  "use server";
  const ref = formData.get("ref");
  if (!acquisitionEnabled || !booking || typeof ref !== "string" || !uuid.test(ref)) notFound();
  const found = await transaction(async (client) => {
    const { rows: [lead] } = await client.query(
      "SELECT id,campaign FROM leads WHERE booking_token=$1 AND stage='qualified' AND qualified_at>now()-interval '30 days' FOR UPDATE", [ref],
    );
    if (!lead) return false;
    const logged = await client.query("SELECT 1 FROM acquisition_events WHERE lead_id=$1 AND kind='booking_link_opened'", [lead.id]);
    if (!logged.rowCount) await recordEvent(client, "booking_link_opened", lead.campaign, lead.id);
    return true;
  });
  if (!found) notFound();
  const target = new URL(booking);
  if (bookingProvider === "Calendly" && process.env.CALENDLY_WEBHOOK_SECRET) target.searchParams.set("utm_content", ref);
  redirect(target.href);
}

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const ref = (await searchParams).ref;
  if (!acquisitionEnabled || !booking || !ref || !uuid.test(ref)) notFound();
  const found = await database().query("SELECT 1 FROM leads WHERE booking_token=$1 AND stage='qualified' AND qualified_at>now()-interval '30 days'", [ref]);
  if (!found.rowCount) notFound();
  return <section className="section container reading">
    <h1>Book your discovery call</h1>
    <p>Choose a time with {bookingProvider}. The booking provider handles the information you enter on its calendar.</p>
    <form className="actions" action={openCalendar}>
      <input type="hidden" name="ref" value={ref} />
      <button className="button" type="submit">Continue to {bookingProvider}</button>
    </form>
  </section>;
}
