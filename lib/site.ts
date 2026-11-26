export const site = {
  name: "Gavin Ferns Coaching & Consulting",
  url: "https://gavinferns.com",
  telephone: "07545 810870",
  telephoneHref: "tel:+447545810870",
  calendly: "https://calendly.com/gavinferns",
  whatsapp: "https://wa.me/447545810870",
  youtube: "https://youtube.com/@coachgavinferns",
  instagram: "https://instagram.com/coachgavinferns",
};

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

export const framework = [
  { name: "Focus", description: "Identify the priorities and challenges that deserve your attention." },
  { name: "Evaluate", description: "Assess current performance, constraints and opportunities." },
  { name: "Roadmap", description: "Develop a strategy with clear decisions, milestones and ownership." },
  { name: "Navigate", description: "Implement the plan and work through obstacles as they arise." },
  { name: "Scale", description: "Optimise what works and build habits that sustain growth." },
];

export const offers = [
  {
    id: "strategy", name: "Business Strategy Accelerator", price: "£2,997", minimum: 2997, duration: "Four weeks",
    audience: "Established SMEs and founders facing a strategic decision or competing priorities.",
    scope: "Review the business, assess options and agree where to focus.",
    deliverables: "A priority map, decision criteria and a 90-day action plan.",
    outcome: "A clear direction and a practical sequence for the next quarter.",
  },
  {
    id: "digital", name: "Digital Growth Accelerator", price: "£4,997", minimum: 4997, duration: "Six weeks",
    audience: "Teams with an established offer and fragmented marketing or sales processes.",
    scope: "Review the customer journey, measurement, technology and automation opportunities.",
    deliverables: "A funnel and technology audit, measurement plan and prioritised experiment backlog.",
    outcome: "A clearer view of where to invest in digital growth.",
  },
  {
    id: "transformation", name: "Business Transformation Programme", price: "£9,997", minimum: 9997, duration: "90 days",
    audience: "Leadership teams ready to coordinate change across people, processes and technology.",
    scope: "Define the target state, prioritise workstreams and coach leaders through implementation.",
    deliverables: "A transformation roadmap, ownership map, governance cadence and progress measures.",
    outcome: "A coordinated change programme with a way to track progress and address obstacles.",
  },
  {
    id: "fractional", name: "Fractional Strategy & Transformation Partner", price: "£3,500–£7,500", minimum: 3500, duration: "Monthly · Three-month minimum",
    audience: "Businesses that need ongoing senior support to make and implement strategic decisions.",
    scope: "Agree a monthly capacity and support strategic decisions, delivery reviews and leadership alignment.",
    deliverables: "An agreed remit, a shared priorities register, decision records and regular reviews.",
    outcome: "Continuity and accountability across strategic initiatives.",
  },
  {
    id: "infrastructure", name: "Infrastructure & Programme Transformation", price: "From £15,000", minimum: 15000, duration: "Scope agreed in discovery",
    audience: "Rail, construction and infrastructure organisations managing complex portfolios or programmes.",
    scope: "Review delivery controls, stakeholder interfaces, risk and governance across the agreed scope.",
    deliverables: "A diagnostic report, prioritised interventions and an implementation roadmap.",
    outcome: "Clearer oversight of delivery risks, dependencies and decisions.",
  },
];

export const projects = [
  { name: "Hitachi Rail", amount: "£200m", label: "Portfolio managed", description: "Gavin managed a £200m portfolio for Hitachi Rail. This experience informs his approach to portfolio priorities, governance and stakeholder coordination." },
  { name: "Network Rail", amount: "£102m", label: "Borough Viaduct project led", description: "Gavin led the £102m Borough Viaduct project for Network Rail. The project is an example of his experience leading complex infrastructure delivery." },
];

export const services = [
  { slug: "business-coaching", title: "Business Coaching", summary: "Clarify priorities, improve decisions and lead with greater confidence.", points: [
    { title: "Decide where to focus", description: "Work through competing demands and turn priorities into decisions you can communicate." },
    { title: "Build a leadership rhythm", description: "Develop habits for delegation, follow-through and constructive conversations." },
    { title: "Put the plan to work", description: "Track what you tried, what changed and what needs your attention next." },
  ], offer: "strategy" },
  { slug: "business-consulting", title: "Business Consulting", summary: "Turn complex challenges into clear strategies and delivery plans.", points: [
    { title: "Set strategic priorities", description: "Assess opportunities and constraints before committing resources." },
    { title: "Agree the delivery plan", description: "Set milestones, ownership and measures that your team can use." },
    { title: "Review progress", description: "Use regular reviews to resolve obstacles and update decisions as evidence changes." },
  ], offer: "transformation" },
  { slug: "ai-digital-transformation", title: "AI & Digital Transformation", summary: "Choose and implement technology that solves real operational problems.", points: [
    { title: "Map the work", description: "Identify repetitive, time-consuming or error-prone work and the information it depends on." },
    { title: "Prioritise use cases", description: "Assess likely value, data sensitivity, feasibility and the oversight teams will need." },
    { title: "Plan adoption", description: "Set a pilot scope, measures and ownership before committing to broader rollout." },
  ], offer: "transformation" },
  { slug: "marketing-technology-strategy", title: "Marketing Technology Strategy", summary: "Connect the tools, processes and measurement behind your customer journey.", points: [
    { title: "Trace the customer journey", description: "Map the steps from discovery to enquiry and identify gaps in handoffs and measurement." },
    { title: "Review the stack", description: "Assess where your CRM, analytics and automation tools support your goals and where they create friction." },
    { title: "Test improvements", description: "Create a sequence of experiments with owners, measures and review dates." },
  ], offer: "digital" },
  { slug: "rail-infrastructure", title: "Rail & Infrastructure", summary: "Improve oversight and delivery across complex programmes and portfolios.", points: [
    { title: "Review delivery controls", description: "Assess risk, budget visibility, dependencies and escalation paths." },
    { title: "Align stakeholders", description: "Clarify decision rights and interfaces between sponsors, delivery teams and suppliers." },
    { title: "Build an improvement roadmap", description: "Prioritise interventions and agree how to measure their effect on delivery." },
  ], offer: "infrastructure" },
];

export const pages = {
  about: { title: "About Gavin", summary: "Business coach, strategic consultant and programme transformation leader." },
  "premium-programmes": { title: "Premium Programmes", summary: "Structured engagements for leaders making important decisions and delivering change." },
  "case-studies": { title: "Case Studies", summary: "Client work in business growth, digital learning, AI and location development, alongside Gavin’s rail programme experience." },
  insights: { title: "Insights & Video Resources", summary: "Practical questions for leaders working through growth and transformation." },
  contact: { title: "Contact", summary: "Book a strategic discovery call to discuss what you want to achieve and whether there’s a fit." },
  "privacy-policy": { title: "Privacy Policy", summary: "How Gavin Ferns Coaching & Consulting handles information when you visit the site or get in touch." },
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
