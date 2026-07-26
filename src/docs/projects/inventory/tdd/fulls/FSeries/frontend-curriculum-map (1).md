# Frontend Curriculum Map — React + TypeScript

Same Master Lesson Schema as the backend (explain-before-naming, Terminology Ledger, TDD-structural where behavior is testable). Lessons numbered `F1, F2, ...` — a separate namespace from the backend's `1-24`, since this is a parallel track, not a continuation. Builds against the consolidated backend's API contract (`PROJECT_STATE.md`).

Design handled by **shadcn/ui + Tailwind** throughout, deliberately — the point isn't teaching you to design, it's teaching you to build competently on a system that already has good defaults, per our earlier conversation.

---

## Phase F1 — The Gaps JavaScript/TypeScript Actually Left You With

Not React yet. This is Interlude-style: the real gaps from your earlier JS attempts, filled once, properly — mirroring how the backend's Interludes A-D worked.

- **F1: TypeScript's Type System, For Real** — interfaces, generics, structural vs. nominal typing (bridging directly from Lesson 1's Python/Pydantic type discussion and Lesson 2's TS-vs-C#/Java note)
- **Interlude E: The Event Loop and Async JavaScript** — promises, `async`/`await`, why JS is single-threaded but non-blocking; the actual mechanical gap "boring PEMDAS" courses never covered
- **F2: Talking to a Real API** — `fetch`, handling the promise, error states, using this project's own backend as the target from day one (no toy APIs)

## Phase F2 — Component Architecture Basics

- **F3: First Component** — Vite project setup, JSX, rendering real data from `GET /members` — *also gives `useState` and `useEffect` their real first appearance (moved up from F5/F12; rendering fetched data isn't possible without both)*
- **F4: Props and Composition** — passing data down, splitting one big component into meaningful pieces
- **F5: Controlled Inputs** — extending `useState` (already taught) to forms, building the login form against `POST /login`
- **Interlude F: Closures and Stale State** — a real, common React bug class (closures capturing outdated state), directly continuous with Interlude A's reference/aliasing material — same underlying mechanism, new context

## Phase F3 — A Real App Structure

- **F6: Routing** — `react-router`, multiple real pages (feed, profile, post detail)
- **F7: Auth Token Handling** — storing the JWT from `POST /login`, attaching it to authenticated requests, the frontend half of backend Lesson 14
- **F8: Global State Without Prop-Drilling** — React Context, an `AuthContext` wrapping the whole app

## Phase F4 — Design System Fluency (your flagged weak spot)

- **F9: shadcn/ui and Tailwind Fundamentals** — the actual mechanics: utility classes, the design token system, why this beats hand-rolled CSS for someone without design instincts
- **F10: Building the Feed UI** — cards, avatars, spacing rules, applied to `GET /feed`
- **F11: Forms Done Well** — the create-post and login forms, validation states, using shadcn's form primitives

## Phase F5 — Data Fetching at Scale

- **F12: `useEffect`'s Dependency Array, Fully Explained** — non-empty arrays, stale closures, cleanup functions (hook itself already taught in F3; this deepens it)
- **Interlude G: Loading/Error State as a Design Problem, Not Just a Code Problem** — every fetch has 3 states; most beginner UIs only handle 1
- **F13: Client-Side Caching (TanStack Query)** — direct mirror of backend Lesson 23's server-side cache/TTL concept, now on the client

## Phase F6 — Testing the Frontend

- **F14: Vitest + React Testing Library** — TDD-structural, mirroring backend Lesson 1's rule, now for components
- **F15: Mocking the API (MSW)** — direct parallel to backend Lesson 18's `MagicMock` — same unit-vs-integration distinction, applied to frontend

## Phase F7 — Polish and Deployment

- **F16: Optimistic UI Updates** — likes/follows updating instantly client-side before the server confirms; ties back to backend's idempotency/atomicity material, now as a UX decision
- **F17: Error Boundaries**
- **F18: Build and Deploy** — Vite production build, static hosting, mirroring backend Lesson 24's deployment discipline

---

**Total: 18 lessons + 3 interludes.** Roughly matches the backend's scope. Same rule as before: interludes land right where the lesson after them needs the concept, not bundled all at once.
