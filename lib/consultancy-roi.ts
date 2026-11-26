// Gross margin is after direct costs; operating costs are deducted once below.
// Four-argument callers retain their original result when the extra costs are zero.
export function calculateConsultancyRoi(turnover: number, currentMargin: number, marginImprovement: number, investment: number, operatingCosts = 0, implementationExpenditure = 0) {
  const improvedMargin = currentMargin + marginImprovement;
  if (
    ![turnover, currentMargin, marginImprovement, investment, operatingCosts, implementationExpenditure].every(Number.isFinite) ||
    turnover <= 0 || turnover > 1e12 || investment <= 0 || investment > 1e12 ||
    currentMargin < -100 || currentMargin > 100 || marginImprovement < 0 || improvedMargin > 100 ||
    operatingCosts < 0 || operatingCosts > 1e12 || implementationExpenditure < 0 || implementationExpenditure > 1e12
  ) return null;

  const currentGrossProfit = turnover * (currentMargin / 100);
  const improvedGrossProfit = turnover * (improvedMargin / 100);
  const currentProfit = currentGrossProfit - operatingCosts;
  const improvedProfit = improvedGrossProfit - operatingCosts;
  const additionalProfit = turnover * (marginImprovement / 100);
  const totalInvestment = investment + implementationExpenditure;
  const netReturn = additionalProfit - totalInvestment;
  const roi = (netReturn / totalInvestment) * 100;
  const paybackMonths = additionalProfit > 0 ? (totalInvestment / additionalProfit) * 12 : null;

  return [currentProfit, improvedProfit, additionalProfit, roi, paybackMonths ?? 0].every(Number.isFinite)
    ? { improvedMargin, currentGrossProfit, improvedGrossProfit, currentProfit, improvedProfit, additionalProfit, totalInvestment, netReturn, roi, paybackMonths }
    : null;
}
