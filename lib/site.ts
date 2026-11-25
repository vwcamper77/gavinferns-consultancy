export const site = {
  name: "Gavin Ferns Business Consulting and Coaching",
  shortName: "Gavin Ferns Consulting",
  tagline: "Clarity. Strategy. Growth.",
  url: "https://gavinferns.com",
  telephone: "07545 810870",
  telephoneHref: "tel:+447545810870",
  calendly: "https://calendly.com/gavinferns",
  whatsapp: "https://wa.me/447545810870",
  youtube: "https://youtube.com/@coachgavinferns",
  instagram: "https://instagram.com/coachgavinferns",
};

export function approvedUrl(value: string | undefined, hosts: string[]) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && !url.username && !url.password && !url.port && hosts.includes(url.hostname) && url.pathname !== "/") {
      return url.href;
    }
  } catch {
    return undefined;
  }
}

export const bookingUrl = approvedUrl(process.env.SITE_BOOKING_URL, ["calendly.com", "calendar.google.com", "calendar.app.google"]) ?? site.calendly;
export const bookingProvider = new URL(bookingUrl).hostname === "calendly.com" ? "Calendly" : "Google Calendar";
export const linkedIn = approvedUrl(process.env.SITE_LINKEDIN_URL, ["linkedin.com", "www.linkedin.com"]);
export const businessProfile = approvedUrl(process.env.SITE_GOOGLE_BUSINESS_PROFILE_URL, ["g.page", "maps.app.goo.gl", "share.google", "google.com", "www.google.com"]);

const configuredMeasurementId = process.env.SITE_GA_MEASUREMENT_ID;
export const measurementId = configuredMeasurementId && /^G-[A-Z0-9]+$/.test(configuredMeasurementId)
  ? configuredMeasurementId
  : undefined;

export const instagram = process.env.SITE_INSTAGRAM_VERIFIED === "true" ? site.instagram : undefined;
export const youtube = process.env.SITE_YOUTUBE_VERIFIED === "true" ? site.youtube : undefined;

export const discoveryLabel = "Book a Strategic Discovery Call";

export const vatNotes = {
  inclusive: "Prices include VAT.",
  exclusive: "Prices exclude VAT.",
  "no-vat": "No VAT is charged.",
};

export function getVatNote(value: string | undefined) {
  return Object.entries(vatNotes).find(([key]) => key === value)?.[1];
}

export const vatNote = getVatNote(process.env.SITE_VAT_TREATMENT);
export const canIndex = process.env.SITE_PUBLIC_INDEXING === "true" && Boolean(vatNote) && process.env.VERCEL_ENV !== "preview";
export const professionalEmail = process.env.SITE_EMAIL_VERIFIED === "true" ? "gavin@gavinferns.com" : undefined;

export const multipliers = [
  { name: "Customers", description: "Reach more of the right customers.", tactics: ["Market research, competitor analysis and segmentation", "Lead generation, funnels and advertising", "Partnerships, referrals, SEO and content marketing"] },
  { name: "Purchase frequency", description: "Give existing customers more reasons to return.", tactics: ["Retention, loyalty programmes and subscriptions", "Email automation, reactivation and retargeting", "A better customer experience"] },
  { name: "Average order value", description: "Increase the value of each transaction.", tactics: ["Pricing, premium offers and bundling", "Upselling and cross-selling", "A better customer journey and sales process"] },
];

export const acceleratorPhases = [
  "Discovery and Growth Audit",
  "Strategic Implementation and Execution",
  "Review, Optimisation and Scaling",
];

export const offers = [
  {
    id: "strategy", name: "Business Strategy Accelerator", price: "£2,997", minimum: 2997, duration: "Four weeks",
    audience: "Entrepreneurs, funded startups and established businesses that need strategic direction.",
    scope: "Review the business, assess options and agree where to focus.",
    deliverables: "Business diagnostic, market and competitor assessment, commercial opportunity assessment, business model review, prioritised growth opportunities, financial and operational considerations, a 90-day strategic roadmap, and private coaching and strategy sessions.",
    outcome: "A clear direction and a practical sequence for the next quarter.",
  },
  {
    id: "digital", name: "Digital Growth Accelerator", price: "£4,997", minimum: 4997, duration: "Six weeks",
    audience: "Businesses looking to improve marketing performance, customer acquisition and technology adoption.",
    scope: "Review the customer journey, measurement, technology and automation opportunities.",
    deliverables: "Marketing and technology audit, customer segmentation, brand positioning review, lead generation strategy, customer journey assessment, marketing automation opportunities, AI and digital technology recommendations, an implementation roadmap, and a performance measurement framework.",
    outcome: "A clearer view of where to invest in digital growth.",
  },
  {
    id: "transformation", name: "90-Day Business Growth Accelerator", price: "£9,997", minimum: 9997, duration: "90 days",
    audience: "Established business owners and leadership teams ready to improve acquisition, retention and revenue per transaction.",
    scope: "Apply the Three Multipliers of Growth to establish a baseline, prioritise changes and support implementation across marketing, sales and operations.",
    deliverables: "Client Discovery Report, Growth Audit Report, baseline customer, frequency and average order value metrics, acquisition and retention strategies, revenue per transaction optimisation, marketing and sales improvements, operational efficiency assessment, implementation support, regular performance reviews and a 6–12 month growth roadmap.",
    outcome: "A prioritised growth plan, a way to monitor delivery, and evidence to guide decisions about what to scale.",
  },
  {
    id: "fractional", name: "Fractional Strategy & Transformation Partner", price: "£3,500–£7,500", minimum: 3500, duration: "Monthly · Three-month minimum",
    audience: "Businesses that need ongoing senior support to make and implement strategic decisions.",
    scope: "Agree a monthly capacity for strategic support, leadership coaching, technology advice, performance reviews and implementation oversight.",
    deliverables: "An agreed remit, a shared priorities register, decision records and regular reviews.",
    outcome: "Continuity and accountability across strategic initiatives.",
  },
  {
    id: "infrastructure", name: "Infrastructure & Programme Transformation", price: "From £15,000", minimum: 15000, duration: "Scope agreed in discovery",
    audience: "Rail, construction, infrastructure and engineering organisations managing complex portfolios or programmes.",
    scope: "Bespoke work in programme assurance, project recovery, digital transformation, governance, risk management and process optimisation.",
    deliverables: "A diagnostic report, prioritised interventions and an implementation roadmap.",
    outcome: "Clearer oversight of delivery risks, dependencies and decisions.",
  },
];

export const projects = [
  { name: "Hitachi Rail", amount: "£200m", label: "Portfolio managed", description: "Gavin managed a £200m portfolio for Hitachi Rail. This experience informs his approach to portfolio priorities, governance and stakeholder coordination." },
  { name: "Network Rail", amount: "£102m", label: "Borough Viaduct project led", description: "Gavin led the £102m Borough Viaduct project for Network Rail. The project is an example of his experience leading complex infrastructure delivery." },
];

export const services = [
  { slug: "business-coaching", title: "Business Coaching and Mentoring", summary: "Clarify priorities, improve decisions and lead with greater confidence.", points: [
    { title: "Decide where to focus", description: "Work through competing demands and turn priorities into decisions you can communicate." },
    { title: "Build a leadership rhythm", description: "Develop habits for delegation, follow-through and constructive conversations." },
    { title: "Put the plan to work", description: "Track what you tried, what changed and what needs your attention next." },
  ], offer: "strategy" },
  { slug: "business-consulting", title: "Business Growth Consulting", summary: "Grow sustainably by improving customer acquisition, repeat purchases, transaction value and profitability.", points: [
    { title: "Set strategic priorities", description: "Assess opportunities and constraints before committing resources." },
    { title: "Agree the delivery plan", description: "Set milestones, ownership and measures that your team can use." },
    { title: "Review progress", description: "Use regular reviews to resolve obstacles and update decisions as evidence changes." },
  ], offer: "transformation" },
  { slug: "ai-digital-transformation", title: "AI and Business Automation", summary: "Choose and implement technology that solves real operational problems.", points: [
    { title: "Map the work", description: "Identify repetitive, time-consuming or error-prone work and the information it depends on." },
    { title: "Prioritise use cases", description: "Assess likely value, data sensitivity, feasibility and the oversight teams will need." },
    { title: "Plan adoption", description: "Set a pilot scope, measures and ownership before committing to broader rollout." },
  ], offer: "transformation" },
  { slug: "marketing-technology-strategy", title: "Marketing Technology and Digital Growth", summary: "Connect the tools, processes and measurement behind your customer journey.", points: [
    { title: "Trace the customer journey", description: "Map the steps from discovery to enquiry and identify gaps in handoffs and measurement." },
    { title: "Review the stack", description: "Assess where your CRM, analytics and automation tools support your goals and where they create friction." },
    { title: "Test improvements", description: "Create a sequence of experiments with owners, measures and review dates." },
  ], offer: "digital" },
  { slug: "rail-infrastructure", title: "Rail and Infrastructure Consulting", summary: "Improve oversight and delivery across complex programmes and portfolios.", points: [
    { title: "Review delivery controls", description: "Assess risk, budget visibility, dependencies and escalation paths." },
    { title: "Align stakeholders", description: "Clarify decision rights and interfaces between sponsors, delivery teams and suppliers." },
    { title: "Build an improvement roadmap", description: "Prioritise interventions and agree how to measure their effect on delivery." },
  ], offer: "infrastructure" },
];

export const pages = {
  "three-multipliers-of-growth": { title: "Three Multipliers of Growth", summary: "Improve customer numbers, purchase frequency and average order value while protecting margins." },
  "business-growth-calculator": { title: "Business Growth Calculator", summary: "Explore how changes in customer numbers, purchase frequency and average order value combine to affect turnover." },
  about: { title: "About Gavin", summary: "Business coach, strategic consultant and programme transformation leader." },
  "premium-programmes": { title: "Premium Consulting Programmes", summary: "Structured engagements for leaders making important decisions and delivering change." },
  "case-studies": { title: "Portfolio and Case Studies", summary: "Selected examples from Gavin’s professional programme and portfolio experience." },
  insights: { title: "Insights and Resources", summary: "Practical questions for leaders working through growth and transformation." },
  contact: { title: "Contact and Discovery Calls", summary: "Book a strategic discovery call to discuss what you want to achieve and whether there’s a fit." },
  "privacy-policy": { title: "Privacy Policy", summary: "How Gavin Ferns Business Consulting and Coaching handles information when you visit the site or get in touch." },
};

export const routes = [...Object.keys(pages), ...services.map(({ slug }) => slug)];
