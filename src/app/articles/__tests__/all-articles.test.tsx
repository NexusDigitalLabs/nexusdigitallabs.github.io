import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

// ── Dynamic imports of all 17 article pages ────────────────────────────────────
import FuelEfficiencyPage from '../how-to-track-car-fuel-efficiency/page';
import SaveMoneyFuelPage from '../how-to-save-money-on-fuel/page';
import FreelanceContractPage from '../how-to-write-a-freelance-contract/page';
import InvoiceMistakesPage from '../freelance-invoice-mistakes/page';
import HourlyRatePage from '../how-to-calculate-your-real-hourly-rate/page';
import ChatGPTPromptsPage from '../chatgpt-prompt-templates-for-developers/page';
import OpenAIPricingPage from '../openai-api-pricing-explained/page';
import FreeToolsPage from '../free-tools-for-freelancers/page';
import IrregularIncomePage from '../how-to-budget-irregular-income/page';
import Win2048Page from '../how-to-win-at-2048/page';
import BlackjackPage from '../blackjack-basic-strategy/page';
import PrivacyFirstPage from '../why-we-build-privacy-first-tools/page';
import PromptTokensPage from '../optimizing-ai-prompt-tokens-for-llms/page';
import ReduceOpenAIPage from '../how-to-reduce-openai-api-costs/page';
import FreelanceInvoicePage from '../how-to-write-a-freelance-invoice/page';
import AvalanchePage from '../avalanche-vs-snowball-debt-payoff/page';
import BrowserGamesPage from '../browser-games-no-download-no-login/page';

// ── Shared article expectations ────────────────────────────────────────────────
function expectArticleStructure(heading: RegExp, ctaHrefPattern: RegExp) {
  // H1 heading is present
  expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(heading);

  // Back link to articles index is present
  const backLink = screen.getByRole('link', { name: /all articles/i });
  expect(backLink).toBeInTheDocument();
  // Next.js Link may strip trailing slashes in jsdom — match either form
  expect(backLink.getAttribute('href')).toMatch(/\/articles\/?$/);

  // CTA link to the relevant tool or page exists
  const ctaLinks = screen.getAllByRole('link').filter((el) => {
    const href = el.getAttribute('href') ?? '';
    return ctaHrefPattern.test(href);
  });
  expect(ctaLinks.length).toBeGreaterThanOrEqual(1);
}

// ── Individual article tests ───────────────────────────────────────────────────

describe('Article: how-to-track-car-fuel-efficiency', () => {
  it('renders heading, back link, and CTA', () => {
    render(<FuelEfficiencyPage />);
    expectArticleStructure(/fuel efficiency/i, /\/tools\/fuel-tracker/);
  });
});

describe('Article: how-to-save-money-on-fuel', () => {
  it('renders heading, back link, and CTA', () => {
    render(<SaveMoneyFuelPage />);
    expectArticleStructure(/save money on fuel/i, /\/tools\/fuel-tracker/);
  });
});

describe('Article: how-to-write-a-freelance-contract', () => {
  it('renders heading, back link, and CTA', () => {
    render(<FreelanceContractPage />);
    expectArticleStructure(/freelance contract/i, /\/tools\/invoice-generator/);
  });
});

describe('Article: freelance-invoice-mistakes', () => {
  it('renders heading, back link, and CTA', () => {
    render(<InvoiceMistakesPage />);
    expectArticleStructure(/invoice mistakes/i, /\/tools\/invoice-generator/);
  });
});

describe('Article: how-to-calculate-your-real-hourly-rate', () => {
  it('renders heading, back link, and CTA', () => {
    render(<HourlyRatePage />);
    expectArticleStructure(/hourly rate/i, /\/tools\/invoice-generator/);
  });
});

describe('Article: chatgpt-prompt-templates-for-developers', () => {
  it('renders heading, back link, and CTA', () => {
    render(<ChatGPTPromptsPage />);
    expectArticleStructure(/prompt templates/i, /\/tools\/prompt-architect/);
  });
});

describe('Article: openai-api-pricing-explained', () => {
  it('renders heading, back link, and CTA', () => {
    render(<OpenAIPricingPage />);
    expectArticleStructure(/openai api pricing/i, /\/tools\/prompt-architect/);
  });
});

describe('Article: free-tools-for-freelancers', () => {
  it('renders heading, back link, and CTA', () => {
    render(<FreeToolsPage />);
    expectArticleStructure(/free tools/i, /\/#tools|\/tools\//);
  });
});

describe('Article: how-to-budget-irregular-income', () => {
  it('renders heading, back link, and CTA', () => {
    render(<IrregularIncomePage />);
    expectArticleStructure(/irregular income/i, /\/tools\/debt-optimizer/);
  });
});

describe('Article: how-to-win-at-2048', () => {
  it('renders heading, back link, and CTA', () => {
    render(<Win2048Page />);
    expectArticleStructure(/2048/i, /\/games\/2048/);
  });
});

describe('Article: blackjack-basic-strategy', () => {
  it('renders heading, back link, CTA, and entertainment disclaimer', () => {
    render(<BlackjackPage />);
    expectArticleStructure(/blackjack basic strategy/i, /\/games\/blackjack/);
    // "For entertainment only" text appears in the disclaimer banner (multiple nodes ok)
    expect(screen.getAllByText(/entertainment only/i).length).toBeGreaterThan(0);
  });
});

describe('Article: why-we-build-privacy-first-tools', () => {
  it('renders heading, back link, and CTA', () => {
    render(<PrivacyFirstPage />);
    expectArticleStructure(/privacy.first tools/i, /\/#tools|\/tools\//);
  });
});

describe('Article: optimizing-ai-prompt-tokens-for-llms', () => {
  it('renders heading, back link, and CTA', () => {
    render(<PromptTokensPage />);
    // Actual h1: "Maximizing LLM Context: Why Text Flattening Prevents Broken Code Markdown"
    expectArticleStructure(/maximizing llm context/i, /\/tools\/prompt-architect/);
  });
});

describe('Article: how-to-reduce-openai-api-costs', () => {
  it('renders heading, back link, and CTA', () => {
    render(<ReduceOpenAIPage />);
    expectArticleStructure(/openai api costs/i, /\/tools\/prompt-architect/);
  });
});

describe('Article: how-to-write-a-freelance-invoice', () => {
  it('renders heading, back link, and CTA', () => {
    render(<FreelanceInvoicePage />);
    expectArticleStructure(/freelance invoice/i, /\/tools\/invoice-generator/);
  });
});

describe('Article: avalanche-vs-snowball-debt-payoff', () => {
  it('renders heading, back link, and CTA', () => {
    render(<AvalanchePage />);
    expectArticleStructure(/avalanche vs snowball/i, /\/tools\/debt-optimizer/);
  });
});

describe('Article: browser-games-no-download-no-login', () => {
  it('renders heading, back link, and CTA', () => {
    render(<BrowserGamesPage />);
    expectArticleStructure(/browser games/i, /\/games/);
  });
});
