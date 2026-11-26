export const consultancyStartingInvestment = 3000;
export const consultancyStartingPrice = new Intl.NumberFormat("en-GB", {
  style: "currency", currency: "GBP", maximumFractionDigits: 0,
}).format(consultancyStartingInvestment);
export const consultancyPricing = `Private consulting engagements from ${consultancyStartingPrice}.`;

export const belowConsultingBudget = `Below ${consultancyStartingPrice}`;
export const firstConsultingBudgetBand = `${consultancyStartingPrice}–£5,000`;
export const consultingBudgetToAgree = "To be agreed";
