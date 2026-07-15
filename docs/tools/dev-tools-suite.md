# Developer micro-tools suite

Four free, **100% client-side** utilities. No new npm dependencies; no database for the free tier.

| Tool | Route | Sources |
|------|-------|---------|
| JSON Engine | `/tools/json-engine/` | `src/lib/json-engine.ts`, `JsonEngineClient.tsx` |
| SVG Studio | `/tools/svg-studio/` | `src/lib/svg-studio.ts`, `SvgStudioClient.tsx` |
| Env Formatter | `/tools/env-formatter/` | `src/lib/env-formatter.ts`, `EnvFormatterClient.tsx` |
| Prompt Packager | `/tools/prompt-packager/` | `src/lib/prompt-packager.ts`, `PromptPackagerClient.tsx` |

Shared clipboard helper: `src/hooks/useCopyToClipboard.ts`.  
Unit tests: `src/lib/__tests__/dev-tools-suite.test.ts`.

Paid cloud layers can wrap these later; free paths never call authenticated APIs with user payload.
