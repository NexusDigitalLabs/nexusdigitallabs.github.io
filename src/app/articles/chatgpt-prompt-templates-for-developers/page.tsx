import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ChatGPT Prompt Templates for Developers — Copy and Use Today — NexusDigitalLabs',
  description: 'Practical, copy-ready ChatGPT prompt templates for software developers — code review, debugging, documentation, architecture decisions, and more.',
  keywords: ['chatgpt prompts for developers', 'developer prompt templates', 'chatgpt code review prompt', 'LLM prompts for software engineering', 'AI prompts for debugging', 'chatgpt system prompts'],
  alternates: { canonical: 'https://nexusdigitallabs.dev/articles/chatgpt-prompt-templates-for-developers/' },
  openGraph: {
    title: 'ChatGPT Prompt Templates for Developers — Copy and Use Today',
    description: 'Copy-ready prompt templates for code review, debugging, documentation, architecture, and API integration.',
    type: 'article',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-medium text-slate-100 tracking-tight mt-10 mb-3">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="text-slate-400 font-light leading-relaxed mb-4 text-sm sm:text-base">{children}</p>;
}
function Prompt({ children }: { children: string }) {
  return (
    <div className="my-4 rounded-xl bg-slate-900 border border-slate-700/60 overflow-hidden">
      <div className="px-3 py-1.5 bg-slate-800/60 border-b border-slate-700/40 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-slate-600" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">prompt</span>
      </div>
      <pre className="p-4 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">{children}</pre>
    </div>
  );
}

const FAQ = [
  { q: 'Why do some prompts produce better results than others?', a: 'Prompts that specify the desired output format, the model\'s role, and relevant constraints consistently produce better results. Vague prompts produce vague outputs. The more context you provide — language, framework, constraints, expected format — the more targeted the response.' },
  { q: 'Should I use a system prompt or user prompt for these templates?', a: 'For persistent behaviour across a session (e.g. always respond in TypeScript, always follow clean code principles), use a system prompt. For individual task-specific requests, use the user prompt. Many developers maintain a standing system prompt that sets the role and then use task-specific user prompts.' },
  { q: 'How do I reduce token usage with these prompts?', a: 'Remove unnecessary preamble. Instead of "Could you please help me to review the following code and provide suggestions?" write "Review this code. Identify bugs and suggest improvements." Same intent, roughly 60% fewer tokens.' },
  { q: 'Can I use these prompts with Claude or Gemini?', a: 'Yes. The templates here are model-agnostic. Claude tends to follow structured formatting instructions particularly well. Gemini performs well on code generation tasks. The core prompt structure applies across all major LLMs.' },
];

export default function ChatGPTPromptsPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        '@context': 'https://schema.org', '@type': 'Article',
        headline: 'ChatGPT Prompt Templates for Developers',
        author: { '@type': 'Organization', name: 'NexusDigitalLabs' },
        publisher: { '@type': 'Organization', name: 'NexusDigitalLabs', url: 'https://nexusdigitallabs.dev' },
        url: 'https://nexusdigitallabs.dev/articles/chatgpt-prompt-templates-for-developers/',
      })}} />

      <div className="max-w-2xl mx-auto px-6 sm:px-10 py-12 sm:py-16">
        <Link href="/articles/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors no-underline mb-10">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          All articles
        </Link>
        <article>
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <span className="text-[0.6rem] font-bold tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/25 px-2.5 py-1">Prompt Engineering</span>
              <span className="text-xs text-slate-500">Jul 2026</span>
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">8 min read</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight leading-snug mb-5">ChatGPT Prompt Templates for Developers — Copy and Use Today</h1>
            <p className="text-slate-400 font-light text-base sm:text-lg leading-relaxed">Practical, copy-ready prompt templates for the tasks developers use AI for most — code review, debugging, documentation, architecture, and refactoring.</p>
          </header>

          <div className="prose prose-invert max-w-none">
            <P>The quality of an AI response is almost entirely determined by the quality of the prompt. A well-structured prompt specifies the role, the task, the constraints, and the desired output format. A vague prompt produces a vague response.</P>
            <P>The templates below follow a consistent pattern: they define a role, a concrete task, and clear output requirements. Use them as-is or adapt them to your stack.</P>

            <H2>Code Review</H2>
            <Prompt>{`You are a senior software engineer specialising in [LANGUAGE/FRAMEWORK].
Review the following code for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance issues
4. Readability and maintainability

For each issue found, explain: what the problem is, why it matters, and provide a corrected code snippet.

[PASTE CODE]`}</Prompt>

            <H2>Debugging</H2>
            <Prompt>{`You are a debugging expert for [LANGUAGE/FRAMEWORK].
I am encountering the following error:

Error message: [PASTE ERROR]
Context: [BRIEFLY DESCRIBE WHAT THE CODE DOES]
Code:
[PASTE RELEVANT CODE]

List the most likely causes in order of probability. For the top cause, provide a step-by-step fix.`}</Prompt>

            <H2>Writing Documentation</H2>
            <Prompt>{`Write clear, concise developer documentation for the following function/module.
Include: purpose, parameters (with types), return value, usage example, and any important edge cases.
Format as JSDoc / docstring for [LANGUAGE].

[PASTE FUNCTION OR MODULE]`}</Prompt>

            <H2>Architecture Decision</H2>
            <Prompt>{`You are a software architect with expertise in scalable systems.
I need to choose between the following approaches for [DESCRIBE PROBLEM]:

Option A: [DESCRIBE OPTION A]
Option B: [DESCRIBE OPTION B]

My constraints: [TEAM SIZE, SCALE, BUDGET, EXISTING STACK]

Compare the options on: maintainability, scalability, implementation complexity, and operational risk. Recommend one and justify your choice.`}</Prompt>

            <H2>Refactoring</H2>
            <Prompt>{`Refactor the following [LANGUAGE] code to improve readability and reduce complexity.
Requirements:
- Preserve all existing behaviour (do not change what the code does)
- Follow [CODING STANDARD, e.g. "clean code principles" / "functional programming patterns"]
- Add a brief comment for any non-obvious logic

[PASTE CODE]`}</Prompt>

            <H2>Writing Unit Tests</H2>
            <Prompt>{`Write comprehensive unit tests for the following [LANGUAGE] function using [TEST FRAMEWORK].
Cover: happy path, edge cases, boundary conditions, and error cases.
Mock any external dependencies.

[PASTE FUNCTION]`}</Prompt>

            <H2>Explaining Complex Code</H2>
            <Prompt>{`Explain the following code to a developer who is unfamiliar with [CONCEPT/LIBRARY].
Use plain language. Avoid jargon where possible.
Include: what it does step by step, why each part exists, and any potential pitfalls.

[PASTE CODE]`}</Prompt>

            <H2>Frequently Asked Questions</H2>
            <div className="space-y-5 mt-2">
              {FAQ.map((item) => (
                <div key={item.q} className="border-l-2 border-slate-700 pl-4">
                  <p className="text-sm font-semibold text-slate-200 mb-1">{item.q}</p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 p-6 rounded-2xl bg-slate-900/50 border border-slate-800/60">
            <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-3">Free tool</p>
            <h3 className="text-base font-semibold text-white mb-2">Prompt Architect — Token Counter & Optimizer</h3>
            <p className="text-sm text-slate-400 font-light leading-relaxed mb-4">Before sending a prompt to the API, measure its token count, strip unnecessary whitespace, and estimate the exact cost across GPT-4o, Claude, and Gemini.</p>
            <Link href="/tools/prompt-architect/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 no-underline">
              Open Prompt Architect
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </article>
      </div>
    </>
  );
}
