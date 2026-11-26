"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

async function save(action: string, fields: Record<string, unknown>) {
  try {
    const response = await fetch("/api/sales/" + action, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fields),
    });
    const result = await response.json();
    return response.ok ? "" : result.error ?? "The request could not be saved.";
  } catch { return "The sales service is temporarily unavailable."; }
}

export function SalesLogin() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    const message = await save("login", data);
    if (!message) { window.location.replace("/sales"); return; }
    setError(message);
    setBusy(false);
  }
  return <form method="dialog" onSubmit={submit} className="form-grid">
    <label>Email<input name="email" type="email" required autoComplete="username" /></label>
    <label>Password<input name="password" type="password" required maxLength={256} autoComplete="current-password" /></label>
    {error && <p className="form-wide form-status" role="alert">{error}</p>}
    <div className="form-wide"><button className="button" disabled={busy} type="submit">Sign in</button></div>
  </form>;
}

export function SalesLogout() {
  const [error, setError] = useState("");
  return <div><button className="button button-light" type="button" onClick={async () => {
    const message = await save("logout", {});
    if (message) setError(message);
    else window.location.replace("/sales");
  }}>Sign out</button>{error && <p role="alert">{error}</p>}</div>;
}

export function SalesForm({ action, fixed, label, confirm, children }: {
  action: string; fixed?: Record<string, string>; label: string; confirm?: string; children?: React.ReactNode;
}) {
  const router = useRouter();
  const form = useRef<HTMLFormElement>(null);
  const requestId = useRef("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ error: false, text: "" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || (confirm && !window.confirm(confirm))) return;
    setBusy(true);
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    if (action === "ledger") requestId.current ||= crypto.randomUUID();
    const message = await save(action, { ...fields, ...(requestId.current && { id: requestId.current }), ...fixed });
    setStatus({ error: Boolean(message), text: message || "Saved." });
    setBusy(false);
    if (!message) {
      requestId.current = "";
      if (action === "ledger") form.current?.reset();
      router.refresh();
    }
  }
  return <form className="sales-form" method="dialog" onSubmit={submit} ref={form}>
    {children}
    <button className="button button-small button-light" type="submit" disabled={busy}>{label}</button>
    {status.text && <p className="fine-print" role={status.error ? "alert" : "status"}>{status.text}</p>}
  </form>;
}

export function CopyBooking({ url }: { url: string }) {
  const [status, setStatus] = useState("");
  return <div className="sales-form">
    <label>Private booking link<input value={url} readOnly /></label>
    <button type="button" className="button button-small button-light" onClick={async () => {
      try { await navigator.clipboard.writeText(url); setStatus("Link copied."); }
      catch { setStatus("Select and copy the link above."); }
    }}>Copy booking link</button>
    <p role="status">{status}</p>
  </div>;
}
