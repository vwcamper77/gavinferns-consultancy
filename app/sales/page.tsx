import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CopyBooking, SalesForm, SalesLogin, SalesLogout } from "@/components/sales-controls";
import { pipeline, pipelineLabels, uuid } from "@/lib/acquisition";
import { campaigns } from "@/lib/campaigns";
import { acquisitionEnabled } from "@/lib/sales-config";
import { database } from "@/lib/sales-db";
import { attributionReport, campaignReport, reportEvents, validDate } from "@/lib/sales-reports";
import { session } from "@/lib/sales-security";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sales Administration", robots: { index: false, follow: false }, referrer: "no-referrer" };

const money = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const percent = new Intl.NumberFormat("en-GB", { style: "percent", maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", month: "2-digit", day: "2-digit", year: "numeric" });
const campaignName = (key: string | null) => key && Object.hasOwn(campaigns, key) ? campaigns[key as keyof typeof campaigns].title : "Unattributed";
const formatMoney = (pence: number | string) => money.format(Number(pence) / 100);
const ledgerLabels = { ad_spend: "Advertising expenditure", contract_revenue: "Contract revenue", payment_received: "Payments received", delivery_cost: "Delivery costs" };

async function Reports({ from, to, restricted }: { from: string; to: string; restricted: boolean }) {
  const [reports, attribution] = await Promise.all([campaignReport(from, to), attributionReport(from, to)]);
  return <section aria-labelledby="report-heading" className="sales-panel">
    <h2 id="report-heading">Campaign performance</h2>
    <form className="sales-filter" action="/sales" method="get">
      <label>From<input name="from" type="date" defaultValue={from} required /></label>
      <label>To<input name="to" type="date" defaultValue={to} required /></label>
      <button className="button button-small" type="submit">Apply dates</button>
    </form>
    <p className="subcopy">Counts and financial entries use their event dates in UK time. Visit and interaction totals include opted-in activity. CAC divides advertising expenditure by contracts signed in the period. Advertising contribution subtracts delivery costs and advertising expenditure from contract revenue.</p>
    {restricted && <p className="fine-print">This view includes campaign activity, ad expenditure and acquisition cost.</p>}
    {reports.length === 0 ? <p className="subcopy">No activity in this date range.</p> :
      <div className="sales-report-grid">{reports.map((report) => <article className="sales-report" key={report.campaign}>
        <h3>{campaignName(report.campaign)}</h3>
        <dl>
          {reportEvents.map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{report.metrics[key] ?? 0}</dd></div>)}
          {Object.entries(ledgerLabels).filter(([key]) => !restricted || key === "ad_spend").map(([key, label]) => <div key={key}><dt>{key === "payment_received" ? "Payment value" : label}</dt><dd>{formatMoney(report.metrics["money_" + key] ?? 0)}</dd></div>)}
          <div><dt>Customer acquisition cost</dt><dd>{report.cac === null ? "Unavailable" : formatMoney(report.cac)}</dd></div>
          {!restricted && <>
            <div><dt>Advertising contribution</dt><dd>{formatMoney(report.contribution)}</dd></div>
            <div><dt>Contribution margin</dt><dd>{report.contributionMargin === null ? "Unavailable" : percent.format(report.contributionMargin)}</dd></div>
          </>}
        </dl>
      </article>)}</div>}
    {attribution.length > 0 && <>
      <h3>Application attribution by channel</h3>
      <div className="sales-table"><table>
        <thead><tr><th scope="col">Campaign</th><th scope="col">Touch</th><th scope="col">Channel</th><th scope="col">Applications</th></tr></thead>
        <tbody>{attribution.map((row) => <tr key={`${row.campaign}-${row.touch_name}-${row.channel}`}>
          <td>{campaignName(row.campaign)}</td><td>{row.touch_name}</td><td>{row.channel}</td><td>{row.total}</td>
        </tr>)}</tbody>
      </table></div>
    </>}

  </section>;
}

async function Ledger({ today }: { today: string }) {
  const { rows } = await database().query("SELECT id,occurred_on::text,kind,amount_pence,campaign FROM sales_ledger WHERE kind='ad_spend' AND voided_at IS NULL ORDER BY occurred_on DESC,id LIMIT 30");
  return <section className="sales-panel">
    <h2>Advertising expenditure</h2>
    <SalesForm action="ledger" fixed={{ kind: "ad_spend" }} label="Record advertising expenditure">
      <div className="form-grid">
        <label>Campaign<select name="campaign" required>
          {Object.entries(campaigns).filter(([, value]) => value.active).map(([key]) => <option key={key} value={key}>{campaignName(key)}</option>)}
          <option value="unattributed">Unattributed</option>
        </select></label>
        <label>Amount (£)<input name="amount" type="number" min=".01" max="999999999.99" step=".01" required /></label>
        <label>Date<input name="date" type="date" defaultValue={today} required /></label>
      </div>
    </SalesForm>
    <Entries rows={rows} />
  </section>;
}

function Entries({ rows }: { rows: { id: string; occurred_on: string; kind: keyof typeof ledgerLabels; amount_pence: string; campaign: string | null }[] }) {
  if (!rows.length) return null;
  return <ul className="sales-entries">{rows.map((entry) => <li key={entry.id}>
    <span>{entry.occurred_on} · {ledgerLabels[entry.kind]} · {formatMoney(entry.amount_pence)} · {campaignName(entry.campaign)}</span>
    <SalesForm action="void-entry" fixed={{ id: entry.id }} confirm="Remove this financial entry from reports?" label="Remove entry" />
  </li>)}</ul>;
}

async function LeadDetail({ id, today }: { id: string; today: string }) {
  const { rows: [lead] } = await database().query("SELECT * FROM leads WHERE id=$1", [id]);
  if (!lead) return <p className="sales-panel">Lead record unavailable.</p>;
  const [ledger, events, mail] = await Promise.all([
    database().query("SELECT id,occurred_on::text,kind,amount_pence,campaign FROM sales_ledger WHERE lead_id=$1 AND voided_at IS NULL ORDER BY occurred_on DESC,id LIMIT 100", [id]),
    database().query("SELECT kind,occurred_at FROM acquisition_events WHERE lead_id=$1 ORDER BY occurred_at", [id]),
    database().query("SELECT template,status FROM sales_mail WHERE lead_id=$1 ORDER BY updated_at", [id]),
  ]);
  return <section className="sales-panel">
    <h2>{lead.business}</h2>
    <p className="subcopy">{lead.name} · <a className="text-link" href={`mailto:${encodeURIComponent(lead.email)}`}>{lead.email}</a></p>
    <dl className="sales-details">
      {Object.entries({ Industry: lead.industry, Employees: lead.employees, Turnover: lead.turnover, Budget: lead.budget,
        Timescale: lead.timescale, Challenge: lead.challenge, Goal: lead.goal, Campaign: campaignName(lead.campaign),
        "Marketing consent": lead.marketing_consent ? "Granted" : lead.marketing_withdrawn_at ? "Withdrawn" : "Off", "Privacy version": lead.privacy_version,
        "First touch": lead.first_touch ? JSON.stringify(lead.first_touch) : "Unavailable",
        "Last touch": lead.last_touch ? JSON.stringify(lead.last_touch) : "Unavailable",
      }).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{String(value)}</dd></div>)}
    </dl>

    <div className="sales-report-grid">
      <div>
        <h3>Pipeline and booking</h3>
        <SalesForm action="stage" fixed={{ lead: id }} label="Update stage">
          <label>Stage<select name="stage" defaultValue={lead.stage}>
            {pipeline.map((stage) => <option key={stage} value={stage}>{pipelineLabels[stage]}</option>)}
          </select></label>
        </SalesForm>
        {lead.stage === "qualified" && lead.booking_token && <CopyBooking url={`${process.env.SITE_ACQUISITION_ORIGIN ?? site.url}/booking?ref=${lead.booking_token}`} />}
        {events.rows.some((event) => event.kind === "discovery_booked") && !events.rows.some((event) => event.kind === "appointment_attended") &&
          <SalesForm action="attended" fixed={{ lead: id }} label="Mark appointment attended" />}
        <ul className="sales-entries">{events.rows.map((event, index) => <li key={index}>{reportEvents.find(([kind]) => kind === event.kind)?.[1] ?? event.kind} · {date.format(event.occurred_at)}</li>)}</ul>
        {mail.rowCount ? <><h3>Email automation</h3><ul className="sales-entries">{mail.rows.map((job) => <li key={job.template}>{job.template} · {job.status}</li>)}</ul></> : null}
      </div>
      <div>
        <h3>Commercial records</h3>
        <SalesForm action="ledger" fixed={{ lead: id }} label="Record amount">
          <div className="form-grid">
            <label>Category<select name="kind">{Object.entries(ledgerLabels).filter(([key]) => key !== "ad_spend").map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label>Amount (£)<input name="amount" type="number" min=".01" max="999999999.99" step=".01" required /></label>
            <label>Date<input name="date" type="date" defaultValue={today} required /></label>
          </div>
        </SalesForm>
        <Entries rows={ledger.rows} />
      </div>
    </div>
    <SalesForm action="delete" fixed={{ lead: id }} confirm="Permanently delete the lead and its contact details? Aggregate reports will be retained." label="Delete lead record" />
  </section>;
}

async function Pipeline({ stage, offset }: { stage?: string; offset: number }) {
  const [{ rows: counts }, { rows }] = await Promise.all([
    database().query("SELECT stage, COUNT(*)::int AS count FROM leads GROUP BY stage"),
    database().query("SELECT id,business,name,stage,campaign,created_at FROM leads WHERE ($1::text IS NULL OR stage=$1) ORDER BY created_at DESC,id LIMIT 51 OFFSET $2", [stage ?? null, offset]),
  ]);
  const stageQuery = stage ? `stage=${stage}&` : "";
  return <section className="sales-panel">
    <h2>Sales pipeline</h2>
    <nav className="sales-stage-links" aria-label="Pipeline stages">
      <Link className="text-link" href="/sales">All stages</Link>
      {pipeline.map((key) => <a className="text-link" key={key} href={`/sales?stage=${key}`} aria-current={stage === key ? "page" : undefined}>{pipelineLabels[key]} ({counts.find((row) => row.stage === key)?.count ?? 0})</a>)}
    </nav>
    {rows.length ? <div className="sales-table"><table>
      <thead><tr><th scope="col">Business</th><th scope="col">Contact</th><th scope="col">Stage</th><th scope="col">Campaign</th><th scope="col">Received</th></tr></thead>
      <tbody>{rows.slice(0, 50).map((row) => <tr key={row.id}>
        <td><a className="text-link" href={`/sales?${stageQuery}lead=${row.id}#record`}>{row.business}</a></td><td>{row.name}</td><td>{pipelineLabels[row.stage as keyof typeof pipelineLabels]}</td><td>{campaignName(row.campaign)}</td><td>{date.format(row.created_at)}</td>
      </tr>)}</tbody>
    </table></div> : <p className="subcopy">No leads in this view.</p>}
    <div className="sales-stage-links">
      {offset > 0 && <a className="text-link" href={`/sales?${stageQuery}offset=${Math.max(0, offset - 50)}`}>Previous page</a>}
      {rows.length > 50 && <a className="text-link" href={`/sales?${stageQuery}offset=${offset + 50}`}>Next page</a>}
      <a className="text-link" href="/api/sales/trello" download>Export pipeline for Trello</a>
    </div>
  </section>;
}

export default async function SalesPage({ searchParams }: { searchParams: Promise<{ from?: string; to?: string; stage?: string; lead?: string; offset?: string }> }) {
  if (!acquisitionEnabled) notFound();
  const user = await session();
  if (!user) return <section className="section container reading"><h1>Sales administration</h1><SalesLogin /></section>;
  const query = await searchParams;
  const today = date.format(new Date());
  const defaultFrom = today.slice(0, 7) + "-01";
  const to = validDate(query.to) ? query.to : today;
  const from = validDate(query.from) && query.from <= to ? query.from : defaultFrom <= to ? defaultFrom : to;
  const stage = pipeline.find((value) => value === query.stage);
  const offset = /^\d{1,6}$/.test(query.offset ?? "") ? Number(query.offset) : 0;
  const lead = query.lead && uuid.test(query.lead) ? query.lead : null;
  return <div className="section container sales-dashboard">
    <div className="sales-heading"><div><h1>{user.role === "sales" ? "Sales administration" : "Campaign reporting"}</h1><p className="subcopy">{user.email}</p></div><SalesLogout /></div>
    {user.role === "sales" && <>
      <Pipeline stage={stage} offset={offset} />
      {lead && <div id="record"><LeadDetail id={lead} today={today} /></div>}
      <Ledger today={today} />
    </>}
    <Reports from={from} to={to} restricted={user.role === "advertising"} />
  </div>;
}
