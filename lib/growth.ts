export function calculateGrowth(turnover: number, customers: number, frequency: number, orderValue: number) {
  if (![turnover, customers, frequency, orderValue].every((value) => Number.isFinite(value) && value >= 0) || turnover === 0) {
    return null;
  }

  const combinedFactor = (1 + customers / 100) * (1 + frequency / 100) * (1 + orderValue / 100);
  const projected = turnover * combinedFactor;
  const additional = projected - turnover;
  const percentage = (combinedFactor - 1) * 100;
  return [projected, additional, percentage].every(Number.isFinite) ? { projected, additional, percentage } : null;
}
