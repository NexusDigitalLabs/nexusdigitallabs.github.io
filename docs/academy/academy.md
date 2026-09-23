# AI Engineer Academy

**A free, self-paced course from Python foundations to production AI systems.**

![Status](https://img.shields.io/badge/Status-Live-brightgreen?style=flat-square)
![Pricing](https://img.shields.io/badge/Pricing-Free%20Forever-blue?style=flat-square)

---

## Overview

The Academy is a gamified tutorial section: lessons grouped into four phases (Foundations, Working with
LLMs, Core AI Engineering, Production & Depth), each worth XP, with a level title (Apprentice → AI
Engineer) computed from total XP earned.

**Unlocking is completion-gated, not payment-gated.** This is deliberate — the root README states the
studio's site-wide policy of "Free forever... no paywalls, no freemium tiers, no subscription gates."
There is no payment provider wired into this repo (no Stripe, no billing). If that policy ever changes for
this section specifically, update the root README's philosophy section explicitly rather than silently
adding a paywall.

Lessons ship progressively. A lesson with no written content yet renders as a locked "Coming soon" card in
the lobby (`status: 'coming-soon'` in the data file) — it is never a broken route, and `generateStaticParams`
only builds pages for lessons with `status: 'ready'`.

---

## Route

```
/academy/                    — lobby: XP/level header, phases, lesson cards
/academy/[lessonSlug]/       — one lesson: content, exercise, check questions, mark-complete
```

---

## Source

```
src/data/academy.ts                          ← Phases, lessons, XP/level model, content (single source of truth)
src/hooks/useAcademyProgress.ts               ← localStorage progress: completed lessons, XP, level, unlock logic
src/app/academy/page.tsx                      ← Lobby route (metadata, Course JSON-LD)
src/app/academy/[lessonSlug]/page.tsx         ← Lesson route (generateStaticParams, metadata, 404 for unready lessons)
src/components/academy/AcademyLobbyClient.tsx ← Lobby UI
src/components/academy/LessonPageClient.tsx   ← Lesson UI
```

---

## Progress model

- **Storage:** `localStorage` key `ndl_academy_completed`, a JSON array of completed lesson ids. No account
  required, no cloud sync (unlike game high scores) — matches "client-side first."
- **XP:** each lesson has a fixed `xp` value (20 normal, 40 "Project" lessons, 60 the final capstone).
  Completing a lesson adds its XP permanently.
- **Levels:** `LEVELS` in `academy.ts` defines named thresholds (Apprentice, Practitioner, Builder,
  Engineer, Specialist, AI Engineer). `levelForXp()` resolves current + next level.
- **Unlocking:** a lesson is unlocked once every earlier `status: 'ready'` lesson is marked complete
  (`isUnlocked()` in the hook). A learner can still read a locked lesson's content — the guard only affects
  whether "Mark complete" is presented as the primary action; there's no server-side enforcement, since
  nothing here is paid or sensitive.

---

## Adding a lesson

1. In `src/data/academy.ts`, change a `comingSoon(...)` entry to `readyLesson(...)` and fill in its
   `content: { blocks, exercise, checkQuestions }`.
2. `blocks` supports `{ type: 'p' }`, `{ type: 'code' }`, and `{ type: 'list' }` — no markdown renderer is
   wired in (keeps the zero-unnecessary-dependencies policy), so keep content structured, not raw markdown.
3. No route file changes needed — `generateStaticParams` picks up any lesson with `status: 'ready'`
   automatically.

---

## Nav integration

`src/components/Header.tsx`: `NAV_LINKS` has a `{ kind: 'page', href: '/academy/', ... }` entry, and
`isActive()` has an explicit `/academy` case (the generic `page` branch only special-cases `/about/` and
`/contact/` by default — new top-level page routes need their own case added there).
