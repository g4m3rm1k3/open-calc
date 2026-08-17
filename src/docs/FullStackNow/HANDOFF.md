# Full-Stack Playground Curriculum — HANDOFF

Read this file, `references/lesson-schema.md`, and `full.brd.md` before starting a session. Nothing else. Do not open previous lesson folders for reference or context — each session works from these three documents, not from accumulated lesson content.

## Why this curriculum exists

**Why this curriculum exists, in the user's own words, 2026-08-17:** *"I need these lessons to teach me so we can build my projects, I have a ton of projects I have tried to get you to build and they all turn into a mess, this is whats going to teach me what to look for and how to communicate with you so we can build enterprise applications together, I have ideas, I just don't have the complete knowledge. The lessons have to be great, from 0 to mastery. So whatever it takes to teach deeper is better."*

This is not a content-generation task — it's the user building the vocabulary to direct, verify, and catch drift in Claude's own work on their real, future projects, after past unstructured attempts broke down as those projects grew complex. When a lesson feels like it could be trimmed for pace, that instruction is the tiebreaker: depth wins.

## How to work a session

- Read only: this HANDOFF, `references/lesson-schema.md`, `full.brd.md`. Do not read old lesson folders.
- Build one lesson per session, in order, per `full.brd.md`'s numbering.
- Follow `references/lesson-schema.md` exactly for folder layout and README structure — don't reconstruct the format from memory or from old lessons.
- When the lesson is done: verify it (install/build/lint/run as applicable), add one entry to the Session Log below, and stop. Don't start the next lesson in the same session.
- Keep log entries minimal — what was built and its status, not a recap of the lesson content (that lives in the lesson's own README).

## Session log

- **Lesson 0 — Startup** (2026-08-17): Scaffolded `fullstack-playground/` per BRD §1 — Vite + React 19 + TypeScript, ESLint flat config (`eslint.config.js`, swapped in for the create-vite default of oxlint to match the BRD), `src/shared/{db,http,testing,ui}/` (empty, infra-only per the shared-code rule), `src/app/Playground.tsx` (dynamically mounts whichever lesson is selected via `import.meta.glob`), `src/lessons/` (empty, ready for 001), and `scripts/run-lesson.ts` / `scripts/reset-lesson.ts`. Verified: `npm install`, `npm run build`, `npm run lint`, dev server boot, and both scripts' no-lessons-yet error paths all pass clean. Isolated the project from the parent `open-calc` repo's root Tailwind/PostCSS config with a local empty `postcss.config.js` (was leaking in via upward config resolution). Status: done. Next: Lesson 001 — Make a Number Change.
