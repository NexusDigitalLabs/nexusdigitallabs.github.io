/** Private portfolio / hire profile data. Do not import from catalogs/sitemap. */

export const CONTACT = {
  name: 'Dilan Fernando',
  title: 'Mobile & Full-Stack Engineer (Android · iOS · Cross-Platform)',
  email: 'dilanfdo1@gmail.com',
  linkedInUrl: 'https://www.linkedin.com/in/dilan-fernando-92413463/',
} as const;

/** Hero framing for recruiters and freelance clients. */
export const PROFILE = {
  eyebrow: 'Portfolio',
  availability: 'Open to freelance & contract',
  valueLine:
    'I help startups and product teams ship Android, iOS, and cross-platform apps — from MVP to store release — with clear architecture and fast iteration.',
  hireNote:
    'Available for freelance and contract engagements: new builds, rewrites, tech leadership, and production support.',
} as const;

export const SUMMARY = [
  'Mobile & Full-Stack Engineer with 13+ years building and leading Android, iOS, and cross-platform products from MVP to global production. Experienced across native (Kotlin/Java), React Native, and modern web/mobile stacks (Nuxt, Vue, Capacitor), with a track record of owning architecture, performance, and release quality.',
  'Hands-on across the stack — client apps through backend APIs and cloud — and comfortable accelerating delivery with AI-assisted workflows while keeping production standards high. Focused on shipping scalable products, shortening feedback loops, and delivering measurable impact in fast-moving teams.',
] as const;

export type StoreLinks = {
  playStore?: string;
  appStore?: string;
};

export type FeaturedProject = {
  name: string;
  company: string;
  blurb: string;
  outcomes: string[];
  tech: string[];
  stores: StoreLinks;
};

/** Proof for hire profile — live products with store links. */
export const FEATURED_WORK: FeaturedProject[] = [
  {
    name: 'LetsBridge: Connect',
    company: 'LetsBridge',
    blurb:
      'B2B networking app for warm introductions — shipped on iOS, Android, and web.',
    outcomes: [
      'MVP to production launch on both mobile stores',
      'Migrated React Native (Expo) → Nuxt 4 + Vue 3 + Capacitor',
    ],
    tech: ['Nuxt', 'Vue', 'Capacitor', 'TypeScript', 'Laravel'],
    stores: {
      playStore: 'https://play.google.com/store/apps/details?id=com.letsbridge.app&hl=en',
      appStore: 'https://apps.apple.com/lk/app/letsbridge-connect/id6758935242',
    },
  },
  {
    name: 'Gifted',
    company: 'Gifted Company AB',
    blurb:
      'Digital gift-card app (Sweden) — buy, send, store, and redeem; 10K+ Play Store downloads.',
    outcomes: [
      'Led hybrid → native rewrite in ~10 months',
      '60+ releases with product and design partners',
    ],
    tech: ['Kotlin', 'MVVM', 'Firebase', 'Branch.io'],
    stores: {
      playStore: 'https://play.google.com/store/apps/details?id=com.gifted.userapp&hl=en',
      appStore: 'https://apps.apple.com/lk/app/gifted/id1560792829',
    },
  },
];

export const SERVICES = [
  {
    title: 'Android & iOS apps',
    desc: 'Native Kotlin/Java Android and store-ready iOS — new builds, rewrites, and production maintenance.',
  },
  {
    title: 'Cross-platform mobile',
    desc: 'React Native / Expo and Capacitor apps that share code with web without sacrificing release quality.',
  },
  {
    title: 'MVP → production',
    desc: 'Architecture, testing, and Play / App Store shipping — plus tech-lead ownership of delivery cadence.',
  },
  {
    title: 'Full-stack product support',
    desc: 'APIs and modern web (Next.js, React, Tailwind, Vercel) so mobile and web features land end-to-end.',
  },
] as const;

export type Recommendation = {
  name: string;
  title: string;
  relationship: string;
  date: string;
  quote: string;
};

/** LinkedIn recommendations received (newest first). Full text kept for reference. */
export const RECOMMENDATIONS: Recommendation[] = [
  {
    name: 'Nadeesha Kodithuwakku',
    title: 'Senior Software Engineer (Android) at The Gifted Company',
    relationship: 'Worked on the same team',
    date: 'Jul 2022',
    quote:
      "I had the pleasure of working with Dilan for 4.5 years on Card of Joy Consumer App (Mazarin Pvt Ltd) & Gifted App (The Gifted Company AB) projects. I would say, his dedication for the work is the main reason he's in this best state today. He consistently gave 100% effort to the team and played a significant role. I learned a lot from Dilan, who's always willing to lend a hand to anyone who needs it and always encouraged me to improve my knowledge on this IT field. He's very creative, enthusiastic, reliable and organized on his work and is always open to discuss ideas and suggestions. His ability to overcome the challenges along with the team/alone with a joyful mood made him more special. He was an inspiration to me as he always went the extra mile and found great ways to quickly solve the problems. Any company would be lucky to have Dilan as a team member or a leader.",
  },
  {
    name: 'Umesh Liyanage',
    title: 'Software Architect | Technical Consultant | Senior Software Developer',
    relationship: 'Worked on the same team',
    date: 'May 2022',
    quote:
      'Had the pleasure of working with Dilan on two occasions - firstly as an offshore app development project and later as an internal product company ("The Gifted Company AB"). As the Tech Lead of the mobile application of these ventures, Dilan was a very committed resource who took full ownership of the app. He led the app development team - initially a hybrid app and later as a fully-fledged native app - and liaisoned with multiple interfaces to deliver many product milestones successfully. He is an easy to work with, a team-friendly individual who is passionate about improving further. I wish him the very best for all his future engagements!',
  },
  {
    name: 'Buddhi Rathnayake',
    title: 'Head of HR',
    relationship: 'Worked on the same team',
    date: 'May 2022',
    quote:
      'I have been privileged to work with Dilan at Mazarin. He joined the company as a Mobile Engineer and have been working with Mazarin from 2015 to 2021. From the time he joined his confidence and enthusiasm were unmatched in delivering his work. He is an excellent team player who is very reliable, organized, worked efficiently, and has good communication and leadership skills. Not only he has an excellent skillset, but his willingness to listen and learn is unparalleled. He continuously strives to stay at the forefront by actively monitoring trends and acquiring new skills. I can highly recommend Dilan and I believe that he would be an asset to any company without a doubt.',
  },
  {
    name: 'Chathuraka Waas',
    title: 'VP of Product - Data at Cut+Dry',
    relationship: 'Worked on the same team',
    date: 'Oct 2021',
    quote:
      "Dedication is the word that comes to mind when I think about Dilan. I had the privilege of working with him in the initial years of Gifted app and his efforts were key to the success we had as a startup. Dilan's ability to grasp the business needs and deliver on solutions at lightening speed is a trait that's hard to come by among developers, but made all the difference. And, of course he had a great sense of humour that turned any tense meeting into a joyful one. Any team would be lucky to have Dilan.",
  },
  {
    name: 'Dilusha Navaratne',
    title: 'Senior Lead - Software Quality Engineering | ISTQB® CTAL TA | ISTQB® CT-AI | ISTQB® CTFL',
    relationship: 'Worked on the same team',
    date: 'Oct 2019',
    quote:
      'He was a member of my mobile team. With lots of capabilities. Enthusiastic in work. Capable in handling any given situation. Reliable and accountable on what he does. One of the best resources I had in my team. I truly do not hesitate to recommend him for any sort of role in his career path.',
  },
  {
    name: 'Shareek Ahamed',
    title: 'Senior Consultant - Cache Object Scripts, InterSystems Ensemble & IRIS, TrakCare Development',
    relationship: 'Managed Dilan directly',
    date: 'Feb 2015',
    quote:
      'Dilan is an excellent engineer, who is well organized, proactive and good at what he does. He is a hardworking developer always ready to put all his energy and stamina to get the job done. He is an expert in Native and Cross Platform Android Development. Although his focus is only on Android, he is very much passionate about Arduino, Raspberry Pi and other Embedded Bluetooth technologies like iBeacon etc. In summary he would be a very valuable member to have in any team.',
  },
];

/** Short quotes for the hire-profile page (names hidden in UI). */
export const FEATURED_RECOMMENDATIONS: Recommendation[] = [
  {
    name: 'Chathuraka Waas',
    title: 'VP of Product - Data at Cut+Dry',
    relationship: 'Worked on the same team',
    date: 'Oct 2021',
    quote:
      "Dedication is the word that comes to mind when I think about Dilan. His ability to grasp business needs and deliver solutions at lightning speed made all the difference in Gifted's early years. Any team would be lucky to have him.",
  },
  {
    name: 'Umesh Liyanage',
    title: 'Software Architect | Technical Consultant',
    relationship: 'Worked on the same team',
    date: 'May 2022',
    quote:
      'As Tech Lead of the mobile app at Gifted, Dilan took full ownership — leading hybrid then native delivery and shipping product milestones successfully. Easy to work with and passionate about improving further.',
  },
  {
    name: 'Dilusha Navaratne',
    title: 'Senior Lead - Software Quality Engineering',
    relationship: 'Worked on the same team',
    date: 'Oct 2019',
    quote:
      'One of the best resources I had on my mobile team — enthusiastic, reliable, and accountable. I truly do not hesitate to recommend him for any sort of role in his career path.',
  },
];

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
    projectUrl: 'https://play.google.com/store/apps/details?id=com.gifted.userapp&hl=en',
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
  'Nuxt', 'Vue', 'Capacitor', 'Android', 'iOS', 'Next.js', 'React', 'Tailwind CSS',
  'Vercel', 'Laravel', 'AWS', 'MVVM',
] as const;
