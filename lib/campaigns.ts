type CampaignContent = {
  active: boolean; title: string; headline: string; message: string; cta: string; meta: string;
  asset: { src: string; alt: string } | null;
};
export type Campaign = "profitability" | "three-multipliers" | "owner-dependency" | "ai-automation";

export const campaigns: Record<Campaign, CampaignContent> = {
  profitability: {
    active: true,
    title: "Business Profitability Consulting",
    headline: "Build a more profitable business. Not just a bigger one.",
    message: "Find where profit is being lost and where changes to pricing, costs and customer mix could make the greatest difference.",
    cta: "Start your profitability application",
    meta: "Private profitability consulting for business owners. Review margins, costs and commercial priorities before investing in change.",
    asset: null,
  },
  "three-multipliers": {
    active: false,
    title: "The Three Multipliers of Growth",
    headline: "Understand what drives profitable growth",
    message: "Explore how customer acquisition, repeat purchases and order value work together, then assess the effect on margins.",
    cta: "Discuss your growth priorities",
    meta: "Explore the Three Multipliers of Growth methodology and assess each opportunity against profitability.",
    asset: null,
  },
  "owner-dependency": {
    active: false,
    title: "Business Owner Dependency",
    headline: "Help your business run with less reliance on you",
    message: "Identify the decisions and processes that depend on you and agree what your team can take ownership of.",
    cta: "Discuss your business operations",
    meta: "Private consulting for owners working to build a team that can run more of the business independently.",
    asset: null,
  },
  "ai-automation": {
    active: false,
    title: "AI and Business Automation",
    headline: "Choose automation that improves how your business works",
    message: "Find where AI or automation could reduce repetitive work and assess the value, feasibility and risk before investing.",
    cta: "Discuss your automation priorities",
    meta: "Business consulting for practical AI and automation decisions, pilots and adoption.",
    asset: null,
  },
};
export function activeCampaign(value: unknown): Campaign | undefined {
  return typeof value === "string" && Object.hasOwn(campaigns, value) && campaigns[value as Campaign].active
    ? value as Campaign
    : undefined;
}
