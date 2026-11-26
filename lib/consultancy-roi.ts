export function calculateConsultancyRoi(turnover: number, currentMargin: number, marginImprovement: number, investment: number) {
  const improvedMargin = currentMargin + marginImprovement;
  if (
    ![turnover, currentMargin, marginImprovement, investment].every(Number.isFinite) ||
    turnover <= 0 || investment <= 0 || marginImprovement < 0 || improvedMargin > 100
  ) {
    return null;
  }

  const currentProfit = turnover * (currentMargin / 100);
  const improvedProfit = turnover * (improvedMargin / 100);
  const additionalProfit = turnover * (marginImprovement / 100);
  const roi = ((additionalProfit - investment) / investment) * 100;
  const paybackMonths = additionalProfit > 0 ? (investment / additionalProfit) * 12 : null;

  return [currentProfit, improvedProfit, additionalProfit, roi, paybackMonths ?? 0].every(Number.isFinite)
    ? { improvedMargin, currentProfit, improvedProfit, additionalProfit, roi, paybackMonths }
    : null;
}
