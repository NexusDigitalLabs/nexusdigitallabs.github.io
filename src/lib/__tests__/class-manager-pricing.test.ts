import { describe, expect, it } from 'vitest';
import { basePrice, buildQuote, defaultSelection, quoteText, tierName, type QuoteInput } from '../class-manager-pricing';

describe('basePrice', () => {
  it('charges a flat LKR 5,500 up to 100 students', () => {
    expect(basePrice(1)).toBe(5500);
    expect(basePrice(60)).toBe(5500);
    expect(basePrice(100)).toBe(5500);
  });

  it('uses flat tiers above 100 and LKR 20 per extra student over 800', () => {
    expect(basePrice(101)).toBe(9500);
    expect(basePrice(300)).toBe(9500);
    expect(basePrice(301)).toBe(18000);
    expect(basePrice(800)).toBe(18000);
    expect(basePrice(900)).toBe(20000);
  });

  it('names tiers at the same boundaries', () => {
    expect([100, 101, 301, 801].map(tierName)).toEqual(['Starter', 'Growth', 'Institute', 'Enterprise']);
  });
});

describe('buildQuote', () => {
  const tutor: QuoteInput = { clientType: 'tutor', billing: 'monthly', ...defaultSelection('tutor') };

  it('adds fixed costs to every quote', () => {
    const q = buildQuote({ ...tutor, moduleIds: [] });
    // 60 students → 5,500 platform + 2,500 fixed monthly; 5,000 fixed setup
    expect(q.monthlyTotal).toBe(8000);
    expect(q.setupTotal).toBe(5000);
    expect(q.monthlyLines.filter((l) => l.fixed)).toHaveLength(2);
    expect(q.setupLines[0].fixed).toBe(true);
  });

  it('prices the default tutor selection', () => {
    const q = buildQuote(tutor);
    // 5,500 + exams 1,000 + 2,500 fixed
    expect(q.monthlyTotal).toBe(9000);
    expect(q.setupTotal).toBe(5000);
    expect(q.firstYearTotal).toBe(5000 + 9000 * 12);
  });

  it('charges 10 months and waives tutor set-up when paying yearly', () => {
    const q = buildQuote({ ...tutor, billing: 'yearly' });
    expect(q.yearlyTotal).toBe(90000);
    expect(q.yearlySaving).toBe(18000);
    expect(q.setupTotal).toBe(0);
    expect(q.firstYearTotal).toBe(90000);
    expect(quoteText({ ...tutor, billing: 'yearly' }, q, 'x')).toContain('Account set-up and branding: Waived');
  });

  it('keeps institute set-up when paying yearly', () => {
    const q = buildQuote({ clientType: 'institute', billing: 'yearly', ...defaultSelection('institute') });
    expect(q.setupTotal).toBe(30000);
  });

  it('adds one-time set-up for modules that need it', () => {
    const q = buildQuote({ ...tutor, moduleIds: ['app'] });
    expect(q.setupLines.map((l) => l.amount)).toContain(75000);
    expect(q.monthlyLines.map((l) => l.amount)).toContain(5000);
  });

  it('includes free app notifications only with the mobile app', () => {
    const withApp = buildQuote({ ...tutor, moduleIds: ['app'] });
    const notes = withApp.monthlyLines.find((l) => l.included);
    expect(notes).toMatchObject({ name: 'App notifications to students and parents', amount: 0 });
    expect(buildQuote(tutor).monthlyLines.some((l) => l.included)).toBe(false);
    expect(quoteText(tutor, withApp, 'x')).toContain('App notifications to students and parents: Included');
  });

  it('lists third-party fees the client pays, adding option fees only when picked', () => {
    expect(buildQuote(tutor).clientPays).toEqual([expect.stringContaining('Zoom or Google Meet')]);
    const q = buildQuote({ ...tutor, moduleIds: ['domain', 'app'] });
    expect(q.clientPays).toHaveLength(3);
    expect(q.clientPays.join(' ')).toMatch(/domain registration.*Apple developer fee/);
    const text = quoteText(tutor, q, 'x');
    expect(text).toContain('Paid by you directly, not included above:');
    expect(text).toContain('reviewed once a year');
    expect(text).toContain('up to 10 GB of files');
  });

  it('prices SMS per student with a minimum, an allowance and sender set-up', () => {
    const tutorSms = buildQuote({ ...tutor, moduleIds: ['sms'] });
    // 60 students × LKR 20 = 1,200; 900 SMS allowance
    expect(tutorSms.monthlyLines).toContainEqual({ name: 'Automatic SMS to students and parents (900 SMS a month)', amount: 1200 });
    expect(tutorSms.setupLines).toContainEqual({ name: 'SMS sender name registration', amount: 3000 });
    // 30 students would be 600, so the 1,000 minimum applies
    expect(buildQuote({ ...tutor, students: 30, moduleIds: ['sms'] }).monthlyLines.map((l) => l.amount)).toContain(1000);
  });

  it('picks institute defaults', () => {
    const sel = defaultSelection('institute');
    expect(sel.students).toBe(400);
    expect(sel.moduleIds).toEqual(expect.arrayContaining(['halls', 'staff', 'exams']));
    expect(sel.moduleIds).not.toContain('app');
  });

  it('writes a pasteable quote with totals and the demo link', () => {
    const text = quoteText(tutor, buildQuote(tutor), 'https://example.com/demo/');
    expect(text).toContain('Total per month: LKR 9,000');
    expect(text).toContain('See the demo: https://example.com/demo/');
    expect(text).toContain('Questions: hello.nexusdigitallabs@gmail.com');
  });
});
