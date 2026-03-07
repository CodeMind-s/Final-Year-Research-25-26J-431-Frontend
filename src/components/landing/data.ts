export const navLinks = [
  { label: "Why Brinex", href: "#why-brinex" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export const painPoints = [
  {
    problem: "Unpredictable Harvests",
    solution:
      "AI-driven crystallization forecasting tells you the exact harvest day based on weather, salinity, and historical patterns.",
    icon: "cloud-sun" as const,
  },
  {
    problem: "Manual Quality Grading",
    solution:
      "Computer vision instantly classifies salt purity, detects contaminants, and generates lab-grade reports in seconds.",
    icon: "scan-eye" as const,
  },
  {
    problem: "No Seasonal Planning Tools",
    solution:
      "Interactive dashboards map your entire season — from flooding to harvest — so every decision is data-backed.",
    icon: "calendar-range" as const,
  },
  {
    problem: "Wasted Byproducts",
    solution:
      "Turn bittern and waste streams into revenue with valorization analytics that identify the most profitable secondary products.",
    icon: "recycle" as const,
  },
];

export const modules = [
  {
    name: "Crystal",
    logo: "/assets/images/crystal-logo.svg",
    tagline: "Know the Exact Harvest Day",
    description:
      "LSTM-powered crystallization prediction that analyzes weather, brine density, and pond conditions to forecast the optimal harvest window.",
    features: [
      "Daily crystallization predictions",
      "Weather-integrated forecasts",
      "Historical pattern analysis",
      "Real-time alert system",
    ],
  },
  {
    name: "Compass",
    logo: "/assets/images/compass-logo.svg",
    tagline: "Plan the Perfect Season",
    description:
      "End-to-end seasonal planning dashboards for salt production — from initial flooding schedules to harvest logistics and market timing.",
    features: [
      "Season timeline planning",
      "Resource allocation",
      "Production tracking",
      "Market timing insights",
    ],
  },
  {
    name: "Vision",
    logo: "/assets/images/vision-logo.svg",
    tagline: "The End of Manual Checking",
    description:
      "YOLOv8-powered real-time salt detection and classification. Automated purity grading that meets laboratory and export standards.",
    features: [
      "Real-time salt detection",
      "Purity classification",
      "Batch quality reports",
      "Live camera integration",
    ],
  },
  {
    name: "Valor",
    logo: "/assets/images/valor-logo.svg",
    tagline: "From Bittern to Bank",
    description:
      "Waste valorization analytics that transform salt production byproducts into profitable secondary products — circular economy for salt.",
    features: [
      "Byproduct identification",
      "Revenue opportunity analysis",
      "Waste stream tracking",
      "Sustainability metrics",
    ],
  },
];

export const pricingPlans = [
  {
    name: "Free",
    price: "Rs 0",
    period: "forever",
    description:
      "For individual landowners getting started with smart salt production.",
    features: [
      "Basic crystallization alerts",
      "7-day weather integration",
      "Single saltern monitoring",
      "Community support",
      "Basic production logs",
    ],
    cta: "Get Started Free",
    highlighted: false,
    targetRoles: ["Landowner"],
  },
  {
    name: "Pro",
    price: "Rs 2999",
    period: "per month",
    description:
      "Full Crystal + Compass access for commercial salt producers scaling operations.",
    features: [
      "Advanced crystallization prediction",
      "30-day forecasting window",
      "Unlimited salterns",
      "Season planning dashboards",
      "Production analytics",
      "Priority email support",
      "Export data & reports",
    ],
    cta: "Start Pro Trial",
    highlighted: true,
    targetRoles: ["Landowner", "Distributor"],
  },
  {
    name: "Lab",
    price: "Rs 4999",
    period: "per month",
    description:
      "Everything in Pro plus Vision AI for laboratories and quality-focused operations.",
    features: [
      "Vision AI salt detection",
      "Purity classification reports",
      "Live camera integration",
      "Batch quality management",
      "Dedicated support",
      "API access",
    ],
    cta: "Start Lab Plan",
    highlighted: false,
    targetRoles: ["Laboratory"],
  },
];

export const faqItems = [
  {
    question: "What is Brinex?",
    answer:
      "Brinex is an AI-powered salt production management platform built for Sri Lanka's salt industry. It combines crystallization prediction, seasonal planning, computer vision quality inspection, and waste valorization into one unified system.",
  },
  {
    question: "How does the crystallization prediction work?",
    answer:
      "Our Crystal module uses LSTM neural networks trained on historical weather data, brine density measurements, and pond conditions. It analyzes daily inputs to predict exactly when salt will crystallize, giving you a precise harvest window.",
  },
  {
    question: "What equipment do I need to get started?",
    answer:
      "For the Free and Pro plans, you only need a smartphone or computer with internet access. For the Lab plan's Vision AI features, you'll need a standard IP camera or webcam pointed at your salt ponds.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Brinex uses industry-standard encryption, JWT-based authentication, and role-based access control. Your production data is stored securely on MongoDB Atlas with automatic backups and is never shared with third parties.",
  },
  {
    question: "Can I switch plans later?",
    answer:
      "Absolutely. You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, your current plan remains active until the end of the billing period.",
  },
  {
    question: "Does Brinex support multiple languages?",
    answer:
      "Yes. Brinex supports English, Sinhala, and Tamil — the three primary languages used across Sri Lanka's salt-producing regions.",
  },
  {
    question: "How accurate is the Vision AI salt detection?",
    answer:
      "Our YOLOv8 model achieves over 95% accuracy in salt crystal detection and purity classification, trained on thousands of real salt samples from Sri Lankan salterns.",
  },
  {
    question: "How do I get started?",
    answer:
      "Create a free account, complete the onboarding for your role (landowner, laboratory, or distributor), and start logging your first saltern. You can begin receiving crystallization predictions within 24 hours of your first data entry.",
  },
];

export const footerLinks = {
  Product: [
    { label: "Crystal", href: "/crystal" },
    { label: "Compass", href: "/compass" },
    { label: "Vision", href: "/vision" },
    { label: "Valor", href: "/valor" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};
