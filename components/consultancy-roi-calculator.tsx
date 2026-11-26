"use client";

import { useRef, useState } from "react";
import { trackPublic } from "@/lib/acquisition-browser";
import { consultancyPricing, consultancyStartingInvestment } from "@/lib/consulting-pricing";
import { calculateConsultancyRoi } from "@/lib/consultancy-roi";

const fields = [
  { name: "turnover", label: "Annual turnover (£)", min: 0.01 },
  { name: "currentMargin", label: "Current profit margin (%)", max: 100 },
  { name: "marginImprovement", label: "Potential margin improvement (percentage points)", min: 0 },
  { name: "investment", label: "Consulting investment (£)", min: 0.01 },
] as const;

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

export function ConsultancyRoiCalculator() {
  const interactionRecorded = useRef(false);
  const [inputs, setInputs] = useState({
    turnover: "500000", currentMargin: "10", marginImprovement: "2", investment: String(consultancyStartingInvestment),
  });
  const result = Object.values(inputs).every((value) => value !== "")
    ? calculateConsultancyRoi(Number(inputs.turnover), Number(inputs.currentMargin), Number(inputs.marginImprovement), Number(inputs.investment))
    : null;

  return <div className="calculator-grid">
    <fieldset className="calculator-panel">
      <legend>Your business figures</legend>
      <p>Replace the example figures with a scenario for your business. Your entries stay in your browser.</p>
      <div className="calculator-inputs">
        {fields.map(({ name, label, ...bounds }) => <label key={name} htmlFor={`roi-${name}`}>
          {label}
          <input id={`roi-${name}`} type="number" inputMode="decimal" step="any" {...bounds}
            value={inputs[name]} onChange={(event) => {
              setInputs({ ...inputs, [name]: event.target.value });
              if (!interactionRecorded.current) interactionRecorded.current = trackPublic("calculator_interaction");
            }} />
        </label>)}
      </div>
      <p className="fine-print">A 2 percentage point improvement takes a 10% margin to 12%.</p>
      <p className="fine-print">{consultancyPricing} Use your proposed investment when you have a quotation.</p>
      <noscript><p>Enable JavaScript to update the example.</p></noscript>
    </fieldset>
    <div className="calculator-panel calculator-results">
      <h3>Illustrative results</h3>
      <div role="status" aria-atomic="true">
        {result ? <>
          <dl>
            <div className="roi-highlight">
              <dt>Additional annual profit</dt>
              <dd className="price">{currency.format(result.additionalProfit)}</dd>
            </div>
            <div className="roi-metrics">
              <div><dt>First-year ROI</dt><dd>{number.format(result.roi)}%</dd></div>
              <div><dt>Payback period</dt><dd>{result.paybackMonths === null ? "No payback at this margin" : `${result.paybackMonths < 0.01 ? "<0.01" : number.format(result.paybackMonths)} months`}</dd></div>
              <div><dt>Current annual profit</dt><dd>{currency.format(result.currentProfit)}</dd></div>
              <div><dt>Annual profit at {number.format(result.improvedMargin)}% margin</dt><dd>{currency.format(result.improvedProfit)}</dd></div>
            </div>
          </dl>
        </> : <p>Enter a positive turnover and investment, with a margin improvement of zero or more and a resulting profit margin of 100% or less.</p>}
      </div>
      <p className="fine-print">The scenario assumes steady turnover and spreads the additional profit evenly across the year. First-year ROI deducts the consulting investment from the additional annual profit, then divides that amount by the investment. Payback estimates how long that extra profit would take to cover the investment. Actual results depend on costs, timing and implementation.</p>
    </div>
  </div>;
}
