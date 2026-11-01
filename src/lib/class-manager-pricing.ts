/**
 * Class Manager quote pricing (LKR). Edit prices here; the quote page and
 * its copy-to-WhatsApp text both read from this file.
 */

export type ClientType = 'tutor' | 'institute';
export type Billing = 'monthly' | 'yearly';

export type PricedOption = {
  id: string;
  name: string;
  desc: string;
  /** LKR per month (0 = none). With perStudent, this is the monthly minimum. */
  monthly: number;
  /** LKR per active student per month, for options whose running cost grows with students. */
  perStudent?: number;
  /** LKR one-time (0 = none). */
  setup: number;
  /** Ticked by default for these client types. */
  defaultFor: ClientType[];
  /** Free extra that comes with this option, shown as an "Included" quote line. */
  includes?: string;
  /** Third-party fee the client pays directly when they pick this option. */
  clientPays?: string;
};

export const CLASS_MANAGER = {
  productName: 'Class Manager',
  contactEmail: 'hello.nexusdigitallabs@gmail.com',
  quoteValidDays: 30,
  /** Our costs are in USD, so LKR prices are reviewed on this schedule. */
  priceReview: 'Prices are reviewed once a year, or earlier if the USD to LKR rate moves sharply.',
  /** Keeps file storage, our only usage-based cost in the base plan, bounded. */
  fairUse: 'Fair use: up to 10 GB of files per account, with PDFs and images up to 20 MB each.',
} as const;

export const PRICING = {
  /** Months charged when paying yearly (12 - free months). */
  yearlyMonthsCharged: 10,
  /** Fixed costs added to every quote. */
  fixedMonthly: [
    { name: 'Hosting, security and daily backups', price: 1500 },
    { name: 'Support and updates', price: 1000 },
  ],
  fixedSetup: {
    tutor: { name: 'Account set-up and branding', price: 5000, waivedWhenYearly: true },
    institute: { name: 'Account set-up and branding', price: 30000, waivedWhenYearly: false },
  } satisfies Record<ClientType, { name: string; price: number; waivedWhenYearly: boolean }>,
  /** Third-party accounts every client brings, whatever they pick. */
  clientPays: ['Your own Zoom or Google Meet account, if you run live online classes'],
  defaultStudents: { tutor: 60, institute: 400 } satisfies Record<ClientType, number>,
  /**
   * SMS: gateways charge about LKR 0.55–0.85 per SMS part (2026), and Sinhala or Tamil
   * messages use 2–3 parts. LKR 20 per student covers a pooled allowance of 15 parts each
   * at the top rate with margin; extra parts are billed at smsExtraPart.
   */
  smsPartsPerStudent: 15,
  smsExtraPart: 1.25,
} as const;

export const INCLUDED_FEATURES = [
  'Student registration and profiles',
  'Your own sign-up link to share with students',
  'Online class links, opened only for students who paid',
  'One device per student login, so accounts are not shared',
  'Study materials: PDF notes and papers for paid students',
  'Student portal for classes, fees, results and notes',
  'Today view: lessons and fees to collect',
  'Classes, batches, one-to-one lessons and weekly schedule',
  'Fee plans (monthly, per term, per lesson) and part payments',
  'Fee tracking and bank-slip approval',
  'PDF receipts and monthly statements',
  'Fee reminders in your own words, shared on WhatsApp',
  'Attendance marking',
  'Income by class and payment method, and outstanding fees',
  'Data export any time',
  'Automatic Google Drive backup',
];

export const MODULES: PricedOption[] = [
  { id: 'exams', name: 'Exams, marks and rank lists', desc: 'Paper class marks, ranks and progress per student', monthly: 1000, setup: 0, defaultFor: ['tutor', 'institute'] },
  { id: 'halls', name: 'Halls and timetable', desc: 'Book halls and avoid timetable clashes', monthly: 1000, setup: 0, defaultFor: ['institute'] },
  { id: 'staff', name: 'Staff logins and permissions', desc: 'Separate access for counter staff, admins and teachers', monthly: 1000, setup: 0, defaultFor: ['institute'] },
  { id: 'parents', name: 'Parent portal', desc: 'Parents see attendance, fees and results', monthly: 1500, setup: 0, defaultFor: [] },
  { id: 'sms', name: 'Automatic SMS to students and parents', desc: 'Class reminders, fee due dates, payment receipts and results by SMS, from your own sender name. 15 SMS per student a month, shared across your account; extra SMS LKR 1.25 each.', monthly: 1000, perStudent: 20, setup: 3000, defaultFor: [] },
  { id: 'payments', name: 'Online card payments', desc: 'Students pay by card or online banking', monthly: 0, setup: 15000, defaultFor: [] },
  { id: 'domain', name: 'Your own web address', desc: 'Branded login, e.g. classes.yourname.lk', monthly: 500, setup: 0, defaultFor: [], clientPays: 'Your .lk domain registration, paid yearly to the registrar' },
  { id: 'app', name: 'Your own branded mobile app', desc: 'Android and iPhone app with your name and logo, with free notifications for class times, fees and results', monthly: 5000, setup: 75000, defaultFor: [], includes: 'App notifications to students and parents', clientPays: 'Apple developer fee (USD 99 a year) and Google Play fee (USD 25 one-time)' },
];

/** Platform fee by active students: flat tiers, plus LKR 20 per student over 800. */
export function basePrice(students: number): number {
  const n = Math.max(1, Math.round(students));
  if (n <= 100) return 5500;
  if (n <= 300) return 9500;
  if (n <= 800) return 18000;
  return 18000 + 20 * (n - 800);
}

export function tierName(students: number): string {
  if (students <= 100) return 'Starter';
  if (students <= 300) return 'Growth';
  if (students <= 800) return 'Institute';
  return 'Enterprise';
}

export type QuoteInput = {
  clientType: ClientType;
  students: number;
  moduleIds: string[];
  billing: Billing;
};

export type QuoteLine = { name: string; amount: number; fixed?: boolean; included?: boolean; waived?: boolean };

export type Quote = {
  monthlyLines: QuoteLine[];
  setupLines: QuoteLine[];
  monthlyTotal: number;
  setupTotal: number;
  yearlyTotal: number;
  yearlySaving: number;
  firstYearTotal: number;
  perStudent: number;
  /** Third-party fees paid by the client, not included in the totals. */
  clientPays: string[];
};

/** Monthly price of an option for this many students. */
export function moduleMonthly(option: PricedOption, students: number): number {
  return Math.max(option.monthly, (option.perStudent ?? 0) * Math.max(1, Math.round(students)));
}

/** Pooled SMS parts included each month for this many students. */
export function smsAllowance(students: number): number {
  return PRICING.smsPartsPerStudent * Math.max(1, Math.round(students));
}

export function defaultSelection(clientType: ClientType) {
  return {
    students: PRICING.defaultStudents[clientType],
    moduleIds: MODULES.filter((m) => m.defaultFor.includes(clientType)).map((m) => m.id),
  };
}

export function buildQuote(input: QuoteInput): Quote {
  const students = Math.max(1, Math.round(input.students));
  const modules = MODULES.filter((m) => input.moduleIds.includes(m.id));

  const monthlyLines: QuoteLine[] = [
    { name: `${tierName(students)} platform (${students.toLocaleString('en-LK')} students)`, amount: basePrice(students) },
    ...modules
      .filter((m) => moduleMonthly(m, students) > 0)
      .map((m) => ({
        name: m.id === 'sms' ? `${m.name} (${smsAllowance(students).toLocaleString('en-LK')} SMS a month)` : m.name,
        amount: moduleMonthly(m, students),
      })),
    ...modules.flatMap((m) => (m.includes ? [{ name: m.includes, amount: 0, included: true }] : [])),
  ];
  monthlyLines.push(...PRICING.fixedMonthly.map((f) => ({ name: f.name, amount: f.price, fixed: true })));

  const fixedSetup = PRICING.fixedSetup[input.clientType];
  const setupWaived = fixedSetup.waivedWhenYearly && input.billing === 'yearly';
  const setupLines: QuoteLine[] = [
    setupWaived
      ? { name: fixedSetup.name, amount: 0, fixed: true, waived: true }
      : { name: fixedSetup.name, amount: fixedSetup.price, fixed: true },
    ...modules.filter((m) => m.setup > 0).map((m) => ({ name: m.id === 'sms' ? 'SMS sender name registration' : `${m.name} set-up`, amount: m.setup })),
  ];

  const monthlyTotal = sum(monthlyLines);
  const setupTotal = sum(setupLines);
  const yearlyTotal = monthlyTotal * PRICING.yearlyMonthsCharged;
  const recurringYear = input.billing === 'yearly' ? yearlyTotal : monthlyTotal * 12;

  return {
    monthlyLines,
    setupLines,
    monthlyTotal,
    setupTotal,
    yearlyTotal,
    yearlySaving: monthlyTotal * 12 - yearlyTotal,
    firstYearTotal: setupTotal + recurringYear,
    perStudent: monthlyTotal / students,
    clientPays: [...PRICING.clientPays, ...modules.flatMap((m) => (m.clientPays ? [m.clientPays] : []))],
  };
}

export function formatLkr(amount: number): string {
  return `LKR ${Math.round(amount).toLocaleString('en-LK')}`;
}

export function formatLine(line: QuoteLine): string {
  if (line.included) return 'Included';
  if (line.waived) return 'Waived';
  return formatLkr(line.amount);
}

/** Plain-text quote for pasting into WhatsApp or email. */
export function quoteText(input: QuoteInput, quote: Quote, demoUrl: string): string {
  const who = input.clientType === 'tutor' ? 'Individual tutor' : 'Institute';
  const lines = [
    `${CLASS_MANAGER.productName} quote (${who}, ${Math.round(input.students)} active students)`,
    '',
    'Monthly:',
    ...quote.monthlyLines.map((l) => `- ${l.name}: ${formatLine(l)}`),
    `Total per month: ${formatLkr(quote.monthlyTotal)}`,
  ];
  if (input.billing === 'yearly') lines.push(`Paid yearly: ${formatLkr(quote.yearlyTotal)} (2 months free)`);
  lines.push(
    '',
    'One-time set-up:',
    ...quote.setupLines.map((l) => `- ${l.name}: ${formatLine(l)}`),
    `Total set-up: ${formatLkr(quote.setupTotal)}`,
    '',
    `First year, all in: ${formatLkr(quote.firstYearTotal)}`,
  );
  if (quote.clientPays.length) lines.push('', 'Paid by you directly, not included above:', ...quote.clientPays.map((c) => `- ${c}`));
  lines.push(
    '',
    `See the demo: ${demoUrl}`,
    `Questions: ${CLASS_MANAGER.contactEmail}`,
    `Quote valid for ${CLASS_MANAGER.quoteValidDays} days. ${CLASS_MANAGER.priceReview}`,
    CLASS_MANAGER.fairUse,
  );
  return lines.join('\n');
}

function sum(lines: QuoteLine[]): number {
  return lines.reduce((total, l) => total + l.amount, 0);
}
