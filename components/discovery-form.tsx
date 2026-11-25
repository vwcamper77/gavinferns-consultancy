"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const fields = [
  { name: "turnover", label: "Annual turnover", options: ["Pre-revenue or funded startup", "Under £250,000", "£250,000–£999,999", "£1m–£4.99m", "£5m–£19.99m", "£20m or more", "Not applicable or prefer to discuss"] },
  { name: "budget", label: "Investment budget", options: ["Below £2,997", "£2,997–£4,996", "£4,997–£9,996", "£9,997–£14,999", "£15,000 or more", "To be agreed"] },
  { name: "timescale", label: "When do you want to start?", options: ["Within a month", "In one to three months", "In three to six months", "Exploring options"] },
];

export function DiscoveryForm({ calendly, whatsapp, email }: { calendly: string; whatsapp: string; email?: string }) {
  const [summary, setSummary] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const [belowMinimum, setBelowMinimum] = useState(false);

  function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rows = [
      ["Annual turnover", "turnover"],
      ["Challenge", "challenge"],
      ["Goal", "goal"],
      ["Investment budget", "budget"],
      ["Timescale", "timescale"],
    ];
    const challenge = String(data.get("challenge")).trim();
    const goal = String(data.get("goal")).trim();
    if (!challenge || !goal) {
      setCopyStatus("Enter a challenge and a goal to prepare your brief.");
      return;
    }
    setSummary(rows.map(([label, name]) => `${label}: ${String(data.get(name)).trim()}`).join("\n"));
    setBelowMinimum(data.get("budget") === fields[1].options[0]);
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
    <noscript><p>Preparing a brief requires JavaScript. You can still book a call or use the contact links on this page.</p></noscript>
    <form method="dialog" onSubmit={prepare} onChange={() => {
      setSummary("");
      setCopyStatus("");
      setBelowMinimum(false);
    }}>
      <div className="form-grid">
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
      {belowMinimum && <p>Programmes start at £2,997. The insights page has practical questions you can use while you consider your options. <Link href="/insights">Browse insights</Link></p>}
      <p>Copy the brief and share it in Calendly if the booking form has a notes field, or paste it into WhatsApp{email ? " or an email" : ""}.</p>
      <div className="actions">
        <button type="button" className="button button-light" onClick={copyBrief}>Copy brief</button>
        <a className="button" href={calendly}>Continue to Calendly <span className="arrow" aria-hidden="true" /></a>
        <a className="text-link" href={whatsapp}>Open WhatsApp <span className="arrow" aria-hidden="true" /></a>
        {email && <a className="text-link" href={`mailto:${email}`}>Open email <span className="arrow" aria-hidden="true" /></a>}
      </div>
    </div>}
  </div>;
}
