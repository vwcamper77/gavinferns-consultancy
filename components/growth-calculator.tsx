"use client";

import { useState } from "react";
import Link from "next/link";
import { calculateGrowth } from "@/lib/growth";

const fields = [
  { name: "turnover", label: "Current annual turnover", unit: "£", min: 0.01 },
  { name: "customers", label: "Increase in customer numbers", unit: "%", min: 0 },
  { name: "frequency", label: "Increase in purchase frequency", unit: "%", min: 0 },
  { name: "orderValue", label: "Increase in average order value", unit: "%", min: 0 },
] as const;

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const percent = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

export function GrowthCalculator() {
  const [inputs, setInputs] = useState({ turnover: "250000", customers: "10", frequency: "10", orderValue: "10" });
  const current = Number(inputs.turnover);
  const result = Object.values(inputs).every((value) => value !== "")
    ? calculateGrowth(current, Number(inputs.customers), Number(inputs.frequency), Number(inputs.orderValue))
    : null;

  return <section className="section container calculator-grid" aria-label="Growth calculator">
    <fieldset className="calculator-panel">
      <legend>Your growth scenario</legend>
      <p>Change the example figures to model your business. Your entries stay in this browser.</p>
      <div className="calculator-inputs">
        {fields.map((field) => <label key={field.name} htmlFor={`growth-${field.name}`}>
          {field.label} ({field.unit})
          <input id={`growth-${field.name}`} type="number" inputMode="decimal" min={field.min} step="any"
            value={inputs[field.name]} onChange={(event) => setInputs({ ...inputs, [field.name]: event.target.value })} />
        </label>)}
      </div>
    </fieldset>
    <div className="calculator-panel calculator-results">
      <h2>Projected annual turnover</h2>
      <div role="status" aria-atomic="true">
        {result ? <>
          <p className="price">{currency.format(result.projected)}</p>
          <dl className="scenario-totals">
            <div><dt>Additional annual revenue</dt><dd>{currency.format(result.additional)}</dd></div>
            <div><dt>Combined growth</dt><dd>{percent.format(result.percentage)}%</dd></div>
          </dl>
          <figure className="revenue-comparison">
            <figcaption>Annual turnover comparison</figcaption>
            <div className="bar-label"><span>Current</span><strong>{currency.format(current)}</strong></div>
            <div className="bar-track" aria-hidden="true"><span style={{ width: `${current / result.projected * 100}%` }} /></div>
            <div className="bar-label"><span>Projected</span><strong>{currency.format(result.projected)}</strong></div>
            <div className="bar-track projected" aria-hidden="true"><span /></div>
          </figure>
        </> : <p>Enter a positive turnover and three non-negative percentage increases to see a projection.</p>}
      </div>
      <p className="fine-print">Illustrative revenue scenario only. It is neither a guarantee nor a profit forecast. Costs, margins and implementation can change the outcome.</p>
      <Link className="button" href="/contact">Discuss your growth opportunities <span aria-hidden="true" className="arrow" /></Link>
    </div>
  </section>;
}
