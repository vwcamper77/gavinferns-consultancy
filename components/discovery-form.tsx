"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

import { belowConsultingBudget, consultancyPricing, consultingBudgetToAgree, firstConsultingBudgetBand } from "@/lib/consulting-pricing";

const fields = [
  { name: "employees", label: "Number of employees", options: ["0 (owner only)", "1–9", "10–49", "50–249", "250 or more"] },
  { name: "turnover", label: "Annual turnover", options: ["Pre-revenue or funded startup", "Under £250,000", "£250,000–£999,999", "£1m–£4.99m", "£5m–£19.99m", "£20m or more", "Not applicable or prefer to discuss"] },
  { name: "budget", label: "Investment budget", options: [belowConsultingBudget, firstConsultingBudgetBand, "Over £5,000–£10,000", "Over £10,000–£15,000", "Over £15,000", consultingBudgetToAgree] },
  { name: "timescale", label: "When do you want to start?", options: ["Within a month", "In one to three months", "In three to six months", "Exploring options"] },
];

export function DiscoveryForm({ bookingUrl, bookingProvider, whatsapp, email }: { bookingUrl?: string; bookingProvider: string; whatsapp: string; email?: string }) {
  const [summary, setSummary] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [budget, setBudget] = useState("");
  const belowMinimum = budget === belowConsultingBudget;
  const needsReview = budget === consultingBudgetToAgree;
  const calendar = belowMinimum || needsReview ? undefined : bookingUrl;

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rows = [
      ["Business name", "business"],
      ["Industry", "industry"],
      ["Annual turnover", "turnover"],
      ["Number of employees", "employees"],
      ["Challenge", "challenge"],
      ["Goal", "goal"],
      ["Investment budget", "budget"],
      ["Timescale", "timescale"],
    ];
    if (rows.some(([, name]) => !String(data.get(name) ?? "").trim())) {
      setCopyStatus("Complete each question to prepare your brief.");
      return;
    }
    setSummary(rows.map(([label, name]) => `${label}: ${String(data.get(name)).trim()}`).join("\n"));
    setBudget(String(data.get("budget")));
    setCopyStatus("Your brief is ready to review.");
  }

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopyStatus("Brief copied.");
    } catch {
      setCopyStatus("Select and copy the brief from the text box.");
    }
  }

  return <div>
    <noscript><p>Preparing a brief requires JavaScript. Use the contact links on this page to get in touch.</p></noscript>
    <form method="dialog" onSubmit={prepare} onChange={() => {
      setSummary("");
      setCopyStatus("");
      setBudget("");
    }}>
      <div className="form-grid">
        <label>Business name<input name="business" type="text" autoComplete="organization" maxLength={120} required /></label>
        <label>Industry<input name="industry" type="text" maxLength={120} required /></label>
        {fields.map((field) => <label key={field.name}>{field.label}
          <select name={field.name} required defaultValue="">
            <option value="" disabled>Select an option</option>
            {field.options.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>)}
        <label className="form-wide">What challenge are you facing?
          <textarea name="challenge" required maxLength={600} rows={3} />
        </label>
        <label className="form-wide">What would you like to achieve?
          <textarea name="goal" required maxLength={600} rows={3} />
        </label>
      </div>
      <p className="fine-print" id="brief-privacy">Your answers stay on this page until you choose to share them. Leave out confidential or sensitive information. See the <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      <button className="button" type="submit" aria-describedby="brief-privacy">Prepare my brief</button>
    </form>
    <p className="form-status" role="status">{copyStatus}</p>
    {summary && <div className="summary">
      <label>Your discovery brief<textarea value={summary} readOnly rows={7} /></label>
      {belowMinimum && <p>{consultancyPricing} The insights page has practical questions you can use while you consider your options. <Link href="/insights">Browse insights</Link></p>}
      {needsReview && bookingUrl && <p>Share your brief so we can discuss scope and investment before arranging a call.</p>}
      <p>{calendar ? <>Copy the brief and share it in {bookingProvider} if the booking form has a notes field, or paste it into WhatsApp{email ? " or an email" : ""}.</> : <>Copy the brief for your records or paste it into WhatsApp{email ? " or an email" : ""}.</>}</p>
      <div className="actions">
        <button type="button" className="button button-light" onClick={copyBrief}>Copy brief</button>
        {calendar && <a className="button" href={calendar}>Continue to {bookingProvider} <span className="arrow" aria-hidden="true" /></a>}
        <a className="text-link" href={whatsapp}>Open WhatsApp <span className="arrow" aria-hidden="true" /></a>
        {email && <a className="text-link" href={`mailto:${email}`}>Open email <span className="arrow" aria-hidden="true" /></a>}
      </div>
    </div>}
  </div>;
}
