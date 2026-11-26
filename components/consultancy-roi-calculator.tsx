"use client";

import { useRef, useState } from "react";
import { trackPublic } from "@/lib/acquisition-browser";
import { consultancyPricing, consultancyStartingInvestment } from "@/lib/consulting-pricing";
import { calculateConsultancyRoi } from "@/lib/consultancy-roi";

const fields = [
  { name: "turnover", label: "Annual turnover (£)", min: 0.01, max: 1e12 },
  { name: "currentMargin", label: "Current gross profit margin (%)", min: -100, max: 100 },
  { name: "marginImprovement", label: "Potential margin improvement (percentage points)", min: 0, max: 200 },
  { name: "operatingCosts", label: "Current annual operating costs (£)", min: 0, max: 1e12 },
  { name: "implementationExpenditure", label: "Estimated one-off implementation expenditure (£)", min: 0, max: 1e12 },
  { name: "investment", label: "Consulting investment (£)", min: 0.01, max: 1e12 },
] as const;

const currency = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const number = new Intl.NumberFormat("en-GB", { maximumFractionDigits: 2 });

export function ConsultancyRoiCalculator() {
  const interactionRecorded = useRef(false);
  const [inputs, setInputs] = useState({
    turnover: "500000", currentMargin: "10", marginImprovement: "2", investment: String(consultancyStartingInvestment), operatingCosts: "0", implementationExpenditure: "0",
  });
  const result = Object.values(inputs).every((value) => value !== "")
    ? calculateConsultancyRoi(Number(inputs.turnover), Number(inputs.currentMargin), Number(inputs.marginImprovement), Number(inputs.investment), Number(inputs.operatingCosts), Number(inputs.implementationExpenditure))
    : null;

  return <div className="calculator-grid">
    <fieldset className="calculator-panel">
      <legend>Your business figures</legend>
      <p>Replace the example figures with a scenario for your business. Your entries stay in your browser.</p>
      <p className="fine-print">Gross profit margin is revenue less direct costs, as a percentage of revenue. Operating costs exclude those direct costs and the one-off investment below. Enter annual overheads to see operating profit before tax, interest and investment.</p>
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
              <div><dt>First-year net ROI</dt><dd>{number.format(result.roi)}%</dd></div>
              <div><dt>Total consulting and implementation investment</dt><dd>{currency.format(result.totalInvestment)}</dd></div>
              <div><dt>First-year net return</dt><dd>{currency.format(result.netReturn)}</dd></div>
              <div><dt>Payback period</dt><dd>{result.paybackMonths === null ? "No payback at this margin" : `${result.paybackMonths < 0.01 ? "<0.01" : number.format(result.paybackMonths)} months`}</dd></div>
              <div><dt>Current annual operating profit</dt><dd>{currency.format(result.currentProfit)}</dd></div>
              <div><dt>Annual operating profit at {number.format(result.improvedMargin)}% margin</dt><dd>{currency.format(result.improvedProfit)}</dd></div>
            </div>
          </dl>
        </> : <p>Enter a positive turnover and investment, non-negative costs, a gross margin from −100% to 100% and a resulting margin no higher than 100%. Monetary inputs must be £1 trillion or less.</p>}
      </div>
      <p className="fine-print">Illustrative scenario, not a forecast or guaranteed outcome. Turnover and annual operating costs stay constant; margin improvement is assumed immediately and additional profit is spread evenly across the year. First-year net ROI = (additional annual profit − consulting and one-off implementation expenditure) ÷ total investment. Payback uses that same total investment. Changes in recurring operating costs are not modelled and need separate assessment. Tax, financing, ramp-up time and cash-flow timing are excluded. A positive uplift can still leave the business loss-making.</p>
    </div>
  </div>;
}
