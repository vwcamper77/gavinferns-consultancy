import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { uuid } from "@/lib/acquisition";
import { acquisitionEnabled } from "@/lib/sales-config";
import { transaction } from "@/lib/sales-db";

export const metadata: Metadata = { title: "Email Preferences", robots: { index: false, follow: false }, referrer: "no-referrer" };
async function unsubscribe(formData: FormData) {
  "use server";
  const ref = formData.get("ref");
  if (!acquisitionEnabled || typeof ref !== "string" || !uuid.test(ref)) notFound();
  await transaction(async (client) => {
    const { rows: [lead] } = await client.query("UPDATE leads SET marketing_consent=false,marketing_withdrawn_at=COALESCE(marketing_withdrawn_at,now()) WHERE marketing_withdrawal_token=$1 RETURNING id", [ref]);
    if (lead) await client.query("UPDATE sales_mail SET status='cancelled',updated_at=now() WHERE lead_id=$1 AND template='nurture' AND status='pending'", [lead.id]);
  });
  redirect("/marketing-preferences?updated=yes");
}

export default async function Preferences({ searchParams }: { searchParams: Promise<{ ref?: string; updated?: string }> }) {
  if (!acquisitionEnabled) notFound();
  const { ref, updated } = await searchParams;
  if (updated === "yes") return <section className="section container reading"><h1>Email preferences updated</h1><p>Marketing emails have been turned off.</p></section>;
  if (!ref || !uuid.test(ref)) notFound();
  return <section className="section container reading"><h1>Email preferences</h1>
    <p>Turn off marketing emails from Gavin Ferns Consulting.</p>
    <form action={unsubscribe} className="actions">
      <input type="hidden" name="ref" value={ref} />
      <button className="button" type="submit">Unsubscribe from marketing emails</button>
    </form>
  </section>;
}
