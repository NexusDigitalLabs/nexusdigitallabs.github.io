/** Private resume data for the unlisted portfolio route. Do not import from catalogs/sitemap. */

export const CONTACT = {
  name: 'Dilan Fernando',
  title: 'Mobile & Full-Stack Engineer (Android · iOS · Cross-Platform)',
  email: 'dilanfdo1@gmail.com',
  linkedInUrl: 'https://www.linkedin.com/in/dilan-fernando-92413463/',
} as const;

export const SUMMARY = [
  'Senior Mobile Engineer & Tech Lead with 13+ years of experience delivering scalable, high-impact mobile applications across Android and cross-platform platforms. Proven track record of leading products from MVP to global production, driving architecture, performance, and rapid delivery using modern stacks and AI-assisted development.',
  'Strong expertise in Kotlin, Java, and React Native, with hands-on experience supporting backend (Spring Boot) and cloud (AWS) systems to ensure reliable, production-grade solutions. Focused on building scalable products, accelerating development cycles, and delivering measurable business impact in fast-paced, distributed teams.',
] as const;

export type Role = {
  company: string;
  period: string;
  role: string;
  projectUrl?: string;
  projects: {
    name: string;
    description: string;
    contributions: string[];
    tech: string[];
  }[];
};

export const EXPERIENCE: Role[] = [
  {
    company: 'LetsBridge',
    period: 'Jan 2026 – Present',
    role: 'Fullstack Developer (Mobile-Focused) · AI-Assisted Development',
    projects: [
      {
        name: 'LetsBridge',
        description:
          'Cross-platform professional networking product that helps people turn existing contacts into B2B introduction opportunities — import connections, act on intros, manage active introductions, and track earnings via an in-app wallet on web and mobile.',
        contributions: [
          'Delivered mobile capability from early MVP through production launch on iOS and Android, supporting product go-to-market.',
          'Led / contributed to a full client migration from React Native (Expo) to Nuxt 4 + Vue 3 + Capacitor, aligning mobile with the web app and reducing long-term maintenance overhead.',
          'Collaborated on backend API work and production operations as the platform matured onto Laravel (Forge) with the web frontend on Vercel.',
          'Used AI-assisted development (Cursor) to speed iteration while keeping delivery quality high.',
        ],
        tech: [
          'React Native', 'Expo', 'TypeScript', 'Nuxt 4', 'Vue 3', 'Capacitor',
          'Pinia', 'TanStack Query', 'Zod', 'Laravel', 'PostgreSQL', 'Vercel', 'Sentry', 'PostHog',
        ],
      },
    ],
  },
  {
    company: '99x Technology',
    period: 'Apr 2022 – Dec 2025',
    role: 'Tech Lead · Senior Tech Lead',
    projects: [
      {
        name: 'Trace SMS',
        description:
          'Native Android warehouse inventory app for rugged devices (CT60, CK65), with ML Kit barcode scanning for goods receiving, counting, picking, and moving.',
        contributions: [
          'Collaborated with the product owner and led the mobile team designing and implementing new features.',
          'Led a complete rewrite from ReKotlin to MVVM while maintaining support for the existing app.',
          'Managed app releases with agile delivery and high-quality updates.',
        ],
        tech: [
          'Kotlin', 'MVVM', 'Jetpack Compose', 'Hilt', 'Room', 'Retrofit', 'GraphQL',
          'Firebase', 'Google ML Kit', 'Android Studio',
        ],
      },
      {
        name: 'Trace Transport',
        description:
          'Cross-platform React Native app for real-time transport and logistics — vehicle allocation, trip tracking, shipment management, barcode scanning, and role-based access.',
        contributions: [
          'Led end-to-end design and development from architecture through App Store and Google Play releases.',
          'Implemented Expo Router file-based routing and multi-environment configuration (dev / staging / production).',
          'Set up Jest + React Native Testing Library coverage across validation utilities and core flows.',
        ],
        tech: [
          'React Native', 'TypeScript', 'Expo', 'Expo Router', 'Zustand', 'TanStack Query',
          'Zod', 'FCM', 'APNs', 'Sentry', 'Mixpanel', 'i18next',
        ],
      },
    ],
  },
  {
    company: 'Gifted Company AB',
    period: 'Feb 2021 – Apr 2022',
    role: 'Tech Lead · Senior Android Developer',
    projectUrl: 'https://play.google.com/store/apps/details?id=com.gifted.userapp',
    projects: [
      {
        name: 'Gifted App',
        description:
          'Digital gift card consumer app (Sweden) for activating and redeeming gift cards at merchant locations, supporting 10,000+ users.',
        contributions: [
          'Collaborated with product and design to ship features for a growing user base.',
          'Led a rewrite to native platforms within 10 months while maintaining the existing hybrid app.',
          'Managed 60+ app releases using agile methodologies.',
        ],
        tech: [
          'Kotlin', 'MVVM', 'Retrofit', 'Dagger', 'Room', 'Firebase', 'Mixpanel',
          'Zendesk', 'Branch.io', 'Glide',
        ],
      },
    ],
  },
  {
    company: 'Mazarin Pvt Ltd',
    period: 'Dec 2015 – Jan 2021',
    role: 'Senior Mobile Developer',
    projectUrl: 'https://play.google.com/store/apps/details?id=com.cardofjoy.userapp',
    projects: [
      {
        name: 'COJ Consumer App',
        description:
          'Hybrid Android/iOS gift card app for activation and redemption at merchant locations across eight European countries.',
        contributions: [
          'Led the mobile team from idea to production MVP in 3 months.',
          'Expanded the app to eight countries in Europe.',
          'Designed, shipped, and maintained Play Store and App Store releases.',
        ],
        tech: [
          'Angular', 'REST', 'Firebase', 'Mixpanel', 'AppsFlyer', 'Branch.io',
          'Facebook SDK', 'Google Maps', 'SQLite',
        ],
      },
      {
        name: 'PrimeScale App',
        description:
          'Native Android restaurant app connected to a Bluetooth scale for real-time weighing, pricing, and gift-card redemption.',
        contributions: [
          'Replaced manual weighing and payment with an automated digital flow.',
          'Led mobile development with product and stakeholder collaboration.',
          'Shipped and maintained Android and iOS distribution.',
        ],
        tech: ['Java', 'REST', 'SQLite', 'Bluetooth', 'Native Camera API'],
      },
    ],
  },
  {
    company: 'Apex Technologies Pvt Ltd',
    period: 'Apr 2014 – Nov 2015',
    role: 'Mobile Developer',
    projects: [
      {
        name: 'Prompt App (Hayleys Group)',
        description:
          'Native Android app automating tea plantation weighing via Bluetooth digital scales and NFC cards, replacing analog scales and paperwork.',
        contributions: [
          'Transitioned manual processes to automated digital workflows.',
          'Cut process time with Bluetooth scales and NFC record entry for tea pluckers.',
          'Ran user training for smooth adoption.',
        ],
        tech: ['Java', 'REST', 'SQLite', 'Bluetooth', 'NFC', 'Native Camera API'],
      },
    ],
  },
];

export const EDUCATION = [
  {
    school: 'Sri Lanka Institute of Information Technology',
    credential: 'MSc in Information Technology',
    period: 'Jun 2021 – Jun 2024',
  },
  {
    school: 'Sri Lanka Institute of Information Technology',
    credential: 'BSc in Information Technology',
    period: 'Jan 2011 – Jan 2014',
  },
] as const;

export const HIGHLIGHT_SKILLS = [
  'Kotlin', 'Java', 'React Native', 'TypeScript', 'Expo', 'Jetpack Compose',
  'Nuxt', 'Vue', 'Capacitor', 'Android', 'iOS', 'MVVM', 'Laravel', 'AWS',
] as const;
