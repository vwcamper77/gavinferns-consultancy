import { consultancyPricing, consultancyStartingPrice } from "./consulting-pricing.ts";
export { consultancyPricing, consultancyStartingInvestment, consultancyStartingPrice } from "./consulting-pricing.ts";

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

export const discoveryLabel = "Start your discovery brief";
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
    id: "strategy", name: "Business Growth & Profitability Review", price: `From ${consultancyStartingPrice}`, duration: "Four weeks",
    audience: "Business owners who want to understand what is driving profit and where to focus next.",
    scope: "Review pricing, margins, operating costs and the mix of customers, products or services to identify where the business earns and loses profit.",
    deliverables: "A commercial diagnostic, private strategy sessions and a prioritised 90-day roadmap with measures for tracking progress.",
    outcome: "A clear view of the opportunities to improve profitability and a practical sequence for acting on them.",
  },
  {
    id: "transformation", name: "90-Day Profitability & Growth Programme", price: "Investment tailored to your business", duration: "90 days",
    audience: "Established owners and leadership teams ready to implement changes and measure their commercial impact.",
    scope: "Apply the Three Multipliers of Growth alongside pricing, margin and cost analysis. Prioritise and implement changes across marketing, sales and operations.",
    deliverables: "Discovery and growth audit reports, baseline profit and growth measures, implementation support, regular performance reviews and a 6–12 month roadmap.",
    outcome: "A set of tested changes and evidence about what to refine, continue or scale.",
  },
  {
    id: "fractional", name: "Fractional Business & Transformation Partner", price: "Bespoke monthly investment", duration: "Monthly · Three-month minimum",
    audience: "Owners and leadership teams who need ongoing senior support with commercial priorities and complex change.",
    scope: "Agree a remit and monthly capacity for commercial strategy, leadership coaching, transformation and implementation oversight.",
    deliverables: "An agreed remit, a shared priorities register, decision records and regular reviews of profitability and delivery.",
    outcome: "Continuity and accountability as your team makes and implements commercial decisions.",
  },
];

export const specialistPricing = "Bespoke quotations based on the agreed brief.";

export const specialistEngagements = [
  { id: "digital", slug: "marketing-technology-strategy", name: "Digital Growth, Transformation & Marketing Technology", summary: "Review acquisition, retention, CRM, automation and measurement. Prioritise changes by their contribution to profit." },
  { id: "ai", slug: "ai-digital-transformation", name: "AI & Business Automation", summary: "Assess where AI and automation can improve workflows, reduce operating costs or give teams more capacity." },
  { id: "infrastructure", slug: "rail-infrastructure", name: "Infrastructure & Programme Transformation", summary: "Commission bespoke support for programme assurance, recovery, governance and digital transformation across complex portfolios." },
];

export const programmeFaqs = [
  { question: "How much does consulting cost?", answer: `${consultancyPricing} The four-week Business Growth & Profitability Review starts at that price. Investment for the 90-Day Profitability & Growth Programme is tailored to your business. The Fractional Business & Transformation Partner route has a bespoke monthly investment.` },
  { question: "Can I commission specialist consultancy separately?", answer: `Yes. AI, digital transformation, marketing technology and infrastructure consultancy can be commissioned separately or included in a programme. ${specialistPricing}` },
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
  ], offer: "ai" },
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
  "premium-programmes": { title: "Premium Consulting Programmes", summary: "Private consulting for business owners and leadership teams who want to improve margins, make better investment decisions and grow profitably." },
  "case-studies": { title: "Portfolio and Case Studies", summary: "Client work in business growth, digital learning, AI and location development, alongside Gavin’s rail programme experience." },
  insights: { title: "Insights and Resources", summary: "Practical questions for leaders working through growth and transformation." },
  contact: { title: "Contact and Discovery Calls", summary: "Tell us about your business and what you want to achieve before booking a strategic discovery call." },
  "brand-pack": { title: "Brand Pack", summary: "Download Gavin Ferns Consulting logos, Instagram graphics and Open Graph cards in light and dark." },
  "privacy-policy": { title: "Privacy Policy", summary: "How Gavin Ferns Business Consulting and Coaching handles information when you visit the site or get in touch." },
};

export const routes = [...Object.keys(pages), ...services.map(({ slug }) => slug)];

export const caseStudies = [
  {
    "num": "01",
    "slug": "best-behaviour-dog-training",
    "category": "DIGITAL TRANSFORMATION & BUSINESS DEVELOPMENT",
    "client": "Best Behaviour School for Dogs",
    "title": "Taking dog-training expertise online",
    "intro": "Building an online learning platform around an established specialist service.",
    "context": "An established dog-training business wanted to make its expertise available beyond in-person sessions. The challenge was to turn specialist knowledge into a structured digital learning offer, supported by a clear understanding of the people most likely to use it.",
    "work": [
      [
        "Define the audience",
        "Used design thinking to develop four customer personas and explore their needs, motivations and barriers to buying online training."
      ],
      [
        "Build the learning platform",
        "Built the learning management system to provide a digital home for the business's training content and online learning offer."
      ],
      [
        "Connect product and marketing",
        "Developed the commercial and marketing approach around the platform, including customer journeys, email nurture and course-launch planning."
      ]
    ],
    "deliverables": [
      [
        "Online learning platform",
        "A learning management system built for the dog-training business."
      ],
      [
        "Customer insight",
        "Four personas to guide the offer, messaging and marketing activity."
      ],
      [
        "Launch direction",
        "A structured approach to acquiring and nurturing prospective learners."
      ]
    ],
    "result": "The engagement translated a specialist service into a digital learning platform, with audience research and a marketing framework to support its development.",
    "takeaway": "Relevant to expert-led businesses looking to package their knowledge into an online learning offer.",
    "stage": "Platform development and commercial planning",
    "name": "Best Behaviour School for Dogs"
  },
  {
    "num": "02",
    "slug": "sensitive-project-ai",
    "category": "AI APPLICATIONS & DIGITAL TRANSFORMATION",
    "client": "Engineering consultancy | Sensitive project work",
    "title": "Practical AI for sensitive project data",
    "intro": "Scoping and developing a local AI tool for querying contracts and supporting policies.",
    "context": "Project teams needed to navigate a lengthy contract and numerous supporting documents to understand obligations, policy requirements and terms flowing down to subconsultants. The solution needed to support useful document queries while addressing the sensitivity of the material.",
    "work": [
      [
        "Scope a practical use case",
        "Defined the questions delivery teams needed to answer, focusing on obligations, policy alignment, compliance and subconsultant terms."
      ],
      [
        "Develop a local approach",
        "Helped design and develop an Ollama-based tool with a browser interface, document ingestion and retrieval of relevant source material."
      ],
      [
        "Connect technology and judgement",
        "Applied commercial and project experience to the query workflow, with reference-backed answers intended to support human review."
      ]
    ],
    "deliverables": [
      [
        "Defined requirements",
        "A focused contract-and-policy query use case grounded in delivery needs."
      ],
      [
        "Technical prototype",
        "Initial local AI capability and document-query workflow."
      ],
      [
        "Development direction",
        "A foundation for adding further contracts and policies and progressing towards production."
      ]
    ],
    "result": "The work established an initial technical prototype and a defined route towards an in-house AI capability. It demonstrated how a specific commercial problem could be translated into a practical development brief.",
    "takeaway": "Relevant to organisations exploring internal AI tools for commercially sensitive documents.",
    "stage": "Initial prototype; production rollout is a subsequent stage",
    "name": "AI for sensitive projects"
  },
  {
    "num": "03",
    "slug": "coffee-shop-location-development",
    "category": "START-UP STRATEGY & FINANCIAL FEASIBILITY",
    "client": "Marina | Coffee shop development",
    "title": "Testing the location. Understanding the numbers.",
    "intro": "Bringing location research and financial modelling together for a proposed coffee business.",
    "context": "A prospective coffee shop owner needed to compare possible trading locations and understand the financial implications before committing to premises or equipment. A busy location alone would not establish a viable business: sales assumptions had to be considered alongside staffing, rent and operating costs.",
    "work": [
      [
        "Compare location options",
        "Explored station retail, university and park-kiosk opportunities. Location work included Luton and Bellingham stations and routes to potential landlords."
      ],
      [
        "Develop the financial model",
        "Worked on a coffee-shop model covering product pricing, customer buying assumptions, revenue, cost of goods, staff and overheads."
      ],
      [
        "Connect the operating decisions",
        "Considered premises and equipment options alongside setup costs, capital requirements and monthly and annual financial forecasts."
      ]
    ],
    "deliverables": [
      [
        "Location research",
        "A comparison framework for different types of trading opportunity."
      ],
      [
        "Coffee shop financial model",
        "Linked assumptions, pricing, revenue and cost schedules, financial statements and a dashboard."
      ],
      [
        "Decision support",
        "A way to explore how the proposed operating model affects financial viability."
      ]
    ],
    "result": "The engagement produced location-development work and a financial model to support an informed investment decision. The model made the relationship between sales assumptions and operating costs visible before a commitment to premises.",
    "takeaway": "Relevant to founders evaluating a first location, kiosk, concession or other premises-led business.",
    "stage": "Location development and feasibility; forecasts are planning scenarios",
    "name": "Coffee shop location development"
  },
  {
    "num": "04",
    "slug": "mindfulness-business-expansion",
    "category": "BUSINESS GROWTH & EXPANSION PLANNING",
    "client": "Darren | Mindfulness business",
    "title": "Planning a sustainable next stage of growth",
    "intro": "Structuring an expansion opportunity around financial feasibility, premises and funding.",
    "context": "An established mindfulness business was considering expansion into a professional city location. The question was how to connect the ambition for a larger business with the capacity, room utilisation, funding and transition plan needed to make it practical.",
    "work": [
      [
        "Define the growth question",
        "Worked with the owner on an expansion and funding brief, including an ambition to explore a route towards £500,000 annual turnover."
      ],
      [
        "Structure the feasibility work",
        "Set out the financial review, lease-versus-purchase assessment and room-utilisation modelling needed to test the expansion case."
      ],
      [
        "Create a phased pathway",
        "Prepared a proposal sequencing financial feasibility, investor or loan preparation, and an expansion roadmap, with a standalone first phase."
      ]
    ],
    "deliverables": [
      [
        "Expansion proposal",
        "A structured brief connecting commercial ambition with premises and capacity."
      ],
      [
        "Feasibility scope",
        "Defined analysis for funding options, utilisation and the financial implications of expansion."
      ],
      [
        "Phased roadmap",
        "A clear sequence for testing feasibility before progressing to funding and implementation."
      ]
    ],
    "result": "The engagement turned a broad expansion ambition into a structured proposal and decision pathway. It clarified the analysis and milestones needed before committing to a larger premises and funding strategy.",
    "takeaway": "Relevant to established service businesses considering more space, additional capacity or a new location.",
    "stage": "Expansion advisory and proposal; £500,000 is a target, not an achieved result",
    "name": "Mindfulness business expansion"
  }
];

export const caseStudyPaths = caseStudies.map(({ slug }) => `case-studies/${slug}`);
