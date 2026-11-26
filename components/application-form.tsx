"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { budgetBands, employeeBands, startBands, turnoverBands } from "@/lib/acquisition";
import { readAttribution, storeApplicationReceipt, trackPublic } from "@/lib/acquisition-browser";
import type { Campaign } from "@/lib/campaigns";

const initial = { name: "", email: "", business: "", industry: "", employees: "", turnover: "", budget: "", timescale: "", challenge: "", goal: "", website: "" };
const steps = ["Your business", "Your priorities", "Your contact details"];

export function ApplicationForm({ campaign }: { campaign?: Campaign }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(initial);
  const [marketing, setMarketing] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState("");
  const started = useRef(false);
  const submissionId = useRef("");
  const heading = useRef<HTMLHeadingElement>(null);

  function start() {
    if (started.current) return;
    started.current = trackPublic("application_start");
  }

  function move(next: number) {
    setStep(next);
    setError("");
    requestAnimationFrame(() => heading.current?.focus());
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    if (step < steps.length - 1) { move(step + 1); return; }
    setState("sending");
    setError("");
    submissionId.current ||= crypto.randomUUID();
    const attribution = readAttribution();
    try {
      const response = await fetch("/api/acquisition/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: submissionId.current, application: { ...values, marketing, privacyAcknowledged },
          campaign, first: attribution?.first, last: attribution?.last }),
      });
      const data = await response.json();
      if (!response.ok) { setError(data.error ?? "We couldn’t send your application. Please try again."); setState("idle"); return; }
      storeApplicationReceipt(data.eventId);
      setValues(initial);
      window.location.replace("/application-received");
    } catch {
      setError("We couldn’t confirm receipt. Please try again.");
      setState("idle");
    }
  }

  function input(name: keyof typeof initial, label: string, type = "text", autoComplete?: string) {
    return <label>{label}
      <input required name={name} type={type} autoComplete={autoComplete} maxLength={type === "email" ? 254 : 120}
        value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })} />
    </label>;
  }
  function select(name: keyof typeof initial, label: string, options: string[]) {
    return <label>{label}
      <select required name={name} value={values[name]} onChange={(event) => setValues({ ...values, [name]: event.target.value })}>
        <option value="" disabled>Select an option</option>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>;
  }

  return <div>
    <noscript><p>JavaScript is required to send an application. <Link href="/contact">Use the contact options instead</Link>.</p></noscript>
    <p className="application-progress">Step {step + 1} of {steps.length}</p>
    <h2 ref={heading} tabIndex={-1}>{steps[step]}</h2>
    <form method="dialog" onSubmit={submit} onChange={start}>
      <div className="form-grid">
        {step === 0 && <>
          {input("business", "Business name", "text", "organization")}{input("industry", "Industry")}
          {select("employees", "Number of employees", employeeBands)}{select("turnover", "Annual turnover", turnoverBands)}
        </>}
        {step === 1 && <>
          {select("budget", "Consulting budget", budgetBands)}{select("timescale", "When would you like to start?", startBands)}
          <label className="form-wide">What challenge are you facing?
            <textarea required name="challenge" maxLength={1000} rows={3} value={values.challenge} onChange={(event) => setValues({ ...values, challenge: event.target.value })} />
          </label>
          <label className="form-wide">What would you like to achieve?
            <textarea required name="goal" maxLength={1000} rows={3} value={values.goal} onChange={(event) => setValues({ ...values, goal: event.target.value })} />
          </label>
          <p className="fine-print form-wide">Use the ranges provided and leave out confidential figures, customer information or sensitive personal details.</p>
        </>}
        {step === 2 && <>
          {input("name", "Your name", "text", "name")}{input("email", "Work email", "email", "email")}
          <div hidden><label>Website<input name="website" autoComplete="off" tabIndex={-1} value={values.website} onChange={(event) => setValues({ ...values, website: event.target.value })} /></label></div>
          <p className="form-wide">Gavin Ferns Consulting stores your answers to assess fit and respond to this application. See the <Link className="text-link" href="/privacy-policy">Privacy Policy</Link> for retention and your rights.</p>
          <label className="checkbox-label form-wide"><input type="checkbox" required checked={privacyAcknowledged} onChange={(event) => setPrivacyAcknowledged(event.target.checked)} />I’ve read the privacy notice.</label>
          <label className="checkbox-label form-wide"><input type="checkbox" checked={marketing} onChange={(event) => setMarketing(event.target.checked)} />Email me occasional consulting insights and updates. I can unsubscribe at any time.</label>
        </>}
      </div>
      {error && <p role="alert" className="form-status">{error}</p>}
      <div className="actions">
        {step > 0 && <button className="button button-light" type="button" disabled={state === "sending"} onClick={() => move(step - 1)}>Back</button>}
        <button className="button" disabled={state === "sending"} type="submit">{step < steps.length - 1 ? "Continue" : state === "sending" ? "Sending application" : "Send application"}</button>
      </div>
    </form>
  </div>;
}
