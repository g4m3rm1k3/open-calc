# FlowBoard Masterclass — Course Curriculum

Version: 2.0  
Last Updated: 2026-05-13  
Project: FlowBoard (Trello-style task board — frontend-first, then backend)  
Stack: React + TypeScript + Vite (frontend) · Python + FastAPI + SQLAlchemy (backend, Phase 3+)  
Spec: /cadcam/LESSON-REQUIREMENTS-UNIVERSAL.md  
Registry: /flowboard-masterclass/CONCEPT-REGISTRY.md  
Status Key: PLANNED → IN PROGRESS → LOCKED

---

## How This Curriculum Works

This document is the **plan**. The spec (`LESSON-REQUIREMENTS-UNIVERSAL.md`) is the **execution standard**. The registry (`CONCEPT-REGISTRY.md`) is the **audit trail**.

**Workflow for every lab:**
1. Confirm the concept budget for the lab against the registry (nothing already taught gets a concept block)
2. Ask an agent to write the lesson with: spec + curriculum row + registry snapshot
3. Agent produces the lesson following the spec
4. Update the registry with every concept block taught

**The concept budget** — listed per lab — is a hard ceiling. A lab that teaches 6 concepts is not deeper; it's overloaded. Depth comes from quality of explanation, not quantity of topics.

---

## What FlowBoard Teaches

FlowBoard is a Trello-style task board. You build it from scratch. The app is the vehicle — the destination is understanding how real software is structured, reasoned about, and extended.

By the end of the series you will be able to:
- Build and extend any React + TypeScript frontend
- Design and build a REST API in Python + FastAPI
- Connect frontend and backend with typed contracts
- Apply software engineering patterns at natural moments (not artificially)
- Debug, refactor, and add features to a real codebase under pressure

---

## Concept Budget Key

Each lab lists a **concept budget** — the specific new concepts it introduces. A concept only appears in one lab's budget. After that it is "known" and the registry prevents it from being taught again.

**Budget notation:**
- `[React]` — React API or pattern
- `[TS]` — TypeScript language feature
- `[CSS]` — Layout or visual concept
- `[SE]` — Software engineering pattern or principle
- `[HTTP]` — Network / API concept
- `[DB]` — Database concept
- `[Pattern]` — Design pattern

---

## Phase 0 — Foundation (Labs 00–04)

Goal: Working app in browser. One real component on screen. Mental model of the whole system.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 00 | FlowBoard app runs in browser, HMR works | Node.js [SE], npm [SE], Vite [SE], localhost/ports [SE], SPA [SE], JSX [React], file structure + execution path [SE] | LOCKED |
| 01 | A single `<Card />` component on screen with title and description | React component [React], props [React], TypeScript interface [TS], `.tsx` vs `.ts` [TS], export/import [TS], component tree [React] | PLANNED |
| 02 | Multiple cards rendered from an array of data | `Array.map()` [TS], `key` prop [React], why keys matter [SE], passing objects as props [React] | PLANNED |
| 03 | Cards have visual style — border, padding, shadow, readable layout | CSS box model [CSS], padding vs margin [CSS], border [CSS], CSS class in React [React], `className` vs `class` [React] | PLANNED |
| 04 | Cards stack in a column with spacing between them | Flexbox [CSS], `flex-direction` [CSS], `gap` [CSS], `align-items` [CSS], width constraints [CSS] | PLANNED |

---

## Phase 1 — Board Structure (Labs 05–09)

Goal: Full board layout — lists side by side, each list containing cards. Static data only.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 05 | A `<List />` component wrapping multiple cards, with a header showing list title and card count | Component composition [React], children prop [React], conditional rendering [React] | PLANNED |
| 06 | Multiple lists side by side — horizontal scroll when overflow | Flex row layout [CSS], `overflow-x` [CSS], min/max width [CSS], `flex-shrink` [CSS] | PLANNED |
| 07 | Board fills the viewport with a fixed header and scrollable body | CSS layout with fixed regions [CSS], `vh`/`vw` units [CSS], `position: sticky` [CSS], layout component pattern [SE] | PLANNED |
| 08 | Typing in an input and pressing Enter adds a card to the list | `useState` [React], controlled input [React], event handlers [React], local state vs props [SE] | PLANNED |
| 09 | Clicking a card deletes it; clicking a button edits the title inline | Immutable state updates [React], lifting state up [React], callback props [React], pure update functions [SE] | PLANNED |

---

## Phase 2 — Data Modelling (Labs 10–14)

Goal: Typed data model for the whole app. Data flows from one source of truth. Local state replaced by structured app data.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 10 | Board renders from a single typed data object (`board.lists[].cards[]`) | Nested TypeScript interfaces [TS], type vs interface [TS], data modelling [SE], single source of truth [SE] | PLANNED |
| 11 | Multiple boards, switchable by click | Array of boards in state, derived rendering [React], index-based selection [SE] | PLANNED |
| 12 | Cards can be moved between lists | Immutable nested update [SE], spread operator on nested objects [TS], ID-based lookup [SE] | PLANNED |
| 13 | Board state survives page refresh (localStorage) | `localStorage` [SE], serialization round-trip [SE], `useEffect` for sync [React] | PLANNED |
| 14 | Data model extracted to a custom hook | Custom hook [React], separation of state logic from UI [SE], hook naming convention [React] | PLANNED |

---

## Phase 3 — Backend Foundations (Labs 15–19)

Goal: Python FastAPI backend. Browser fetches real data from a running server.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 15 | FastAPI server runs; browser fetches a greeting from `/api/ping` | Python virtual environment [SE], FastAPI [SE], HTTP request/response cycle [HTTP], `fetch` API [TS], `async/await` [TS] | PLANNED |
| 16 | Browser shows live board data fetched from `/api/boards` | `useEffect` for data fetching [React], loading state [React], REST [HTTP], JSON response contract [HTTP] | PLANNED |
| 17 | Create card form POSTs to API and card appears without refresh | HTTP POST [HTTP], request body [HTTP], CORS [HTTP], optimistic UI update [SE] | PLANNED |
| 18 | Edit and delete cards call PATCH and DELETE endpoints | HTTP PATCH vs PUT [HTTP], HTTP DELETE [HTTP], fetch with method + headers [TS], error handling for API calls [SE] | PLANNED |
| 19 | Board data persists in SQLite database across server restarts | SQLAlchemy model [DB], migration basics [DB], ORM concept [DB], `Session` pattern [DB] | PLANNED |

---

## Phase 4 — Auth and Ownership (Labs 20–24)

Goal: User accounts. Each user sees only their own boards. Protected routes.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 20 | Signup and login forms work, server responds with JWT | Authentication vs authorisation [SE], password hashing [SE], JWT structure [HTTP], bcrypt [SE] | PLANNED |
| 21 | JWT stored in browser; API calls include it automatically | `localStorage` for tokens [SE], `Authorization` header [HTTP], token expiry [SE] | PLANNED |
| 22 | Pages are protected — unauthenticated users redirected to login | React Router [React], route guard pattern [SE], redirect [React], `useNavigate` [React] | PLANNED |
| 23 | Each user sees only their boards | Auth context [React], `useContext` [React], ownership filter in API [DB] | PLANNED |
| 24 | Logout clears session; expired token redirects to login | Token validation on request [SE], client-side session cleanup [SE], 401 handling [HTTP] | PLANNED |

---

## Phase 5 — Interaction and UX (Labs 25–29)

Goal: Cards are draggable. Card detail modal. Labels and priorities.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 25 | Cards draggable within a list (raw pointer events — no library) | Pointer events [SE], `onMouseDown`/`onMouseMove`/`onMouseUp` [React], drag state machine [SE] | PLANNED |
| 26 | Drag-and-drop with dnd-kit — smooth reorder within and between lists | Library integration [SE], build vs buy [SE], dnd-kit sortable context [React] | PLANNED |
| 27 | Click a card to open a detail modal with title, description, and close button | React Portal [React], modal state pattern [SE], focus trap concept [SE] | PLANNED |
| 28 | Cards have colour labels; filter bar shows only matching label | Enum type in TypeScript [TS], derived filtered list [SE], URL search params as filter state [SE] | PLANNED |
| 29 | Cards have priority levels; board sorted by priority | Comparator function [SE], `Array.sort()` with typed objects [TS], sort stability [SE] | PLANNED |

---

## Phase 6 — State Architecture (Labs 30–34)

Goal: App state managed in a proper store. No prop drilling. Typed actions and selectors.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 30 | Board data lives in a Zustand store — no props passed through 3 levels | Zustand store [SE], global state [SE], dependency inversion [SE], prop drilling problem [SE] | PLANNED |
| 31 | Loading, error, and success states explicit in store | Async state shape [SE], discriminated union [TS], loading skeleton [React] | PLANNED |
| 32 | Selectors compute derived data — no duplication | Selector pattern [SE], derived state [SE], memoization concept [SE] | PLANNED |
| 33 | Board store replaced with `useReducer` to understand the pattern | `useReducer` [React], action/reducer pattern [SE], when store vs reducer [SE] | PLANNED |
| 34 | Store actions tested in isolation — no React required | Vitest setup [SE], unit testing pure functions [SE], arrange-act-assert [SE] | PLANNED |

---

## Phase 7 — Performance (Labs 35–39)

Goal: App stays fast with large data sets. Re-renders are intentional.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 35 | React DevTools Profiler shows which components re-render on card add | React DevTools Profiler [SE], render cost [SE], why components re-render [React] | PLANNED |
| 36 | Card list no longer re-renders on unrelated state change | `React.memo` [React], referential equality [SE], when memo helps and when it doesn't [SE] | PLANNED |
| 37 | Expensive filter recomputation memoized | `useMemo` [React], `useCallback` [React], dependency arrays [React] | PLANNED |
| 38 | Large board (500 cards) scrolls smoothly using virtualization | List virtualization [SE], windowing [SE], react-virtual setup [React] | PLANNED |
| 39 | API is paginated — board loads first 20 cards, more on scroll | Cursor pagination [HTTP], infinite scroll pattern [React], `IntersectionObserver` [SE] | PLANNED |

---

## Phase 8 — Testing (Labs 40–44)

Goal: Automated test suite. Tests written before code in at least one feature.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 40 | Backend has a pytest suite covering happy and error paths | pytest [SE], fixtures [SE], equivalence partitioning [SE], parametrize [SE] | PLANNED |
| 41 | Frontend store logic tested with Vitest | Vitest [SE], test isolation [SE], mocking modules [SE] | PLANNED |
| 42 | Card component tested with React Testing Library | RTL [SE], `getByRole` [SE], `userEvent` [SE], test behaviour not implementation [SE] | PLANNED |
| 43 | Full user journey tested with Playwright | Playwright [SE], end-to-end test [SE], testing pyramid [SE] | PLANNED |
| 44 | New feature written test-first (red-green-refactor) | TDD cycle [SE], test as design tool [SE], when TDD helps and when it doesn't [SE] | PLANNED |

---

## Phase 9 — Production Engineering (Labs 45–49)

Goal: App runs in Docker. CI pipeline. Deployed to a real URL.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 45 | App runs identically in Docker container locally | Docker [SE], container vs VM [SE], Dockerfile [SE], docker-compose [SE], environment parity [SE] | PLANNED |
| 46 | GitHub Actions runs tests on every push | CI/CD concept [SE], GitHub Actions workflow [SE], automated quality gate [SE] | PLANNED |
| 47 | Lint, type-check, and tests are required to pass before merge | Linting role [SE], `tsc --noEmit` [SE], blocking vs non-blocking checks [SE] | PLANNED |
| 48 | App deployed to a real URL with HTTPS | Static hosting [SE], environment variables for secrets [SE], `npm run build` output [SE] | PLANNED |
| 49 | Database backed up automatically; restore tested | Backup strategy [SE], restore verification [SE], operational reliability [SE] | PLANNED |

---

## Phase 10 — Architecture and Professional SE (Labs 50–54)

Goal: The app is a case study. You can reason about it architecturally, explain every decision, and extend it under pressure.

| Lab | What You See When Done | Concept Budget (new concepts only) | Status |
|---|---|---|---|
| 50 | Dependency graph drawn; all circular dependencies found | Module coupling [SE], circular dependency [SE], architecture erosion [SE] | PLANNED |
| 51 | Service layer extracted between routes and ORM | Clean architecture layers [SE], service pattern [SE], OCP [SE] | PLANNED |
| 52 | ADR written for one architectural decision | Architecture Decision Record [SE], decision documentation [SE] | PLANNED |
| 53 | Injected failure into the running app; diagnosed from logs | Fault injection [SE], observability [SE], structured logging [SE] | PLANNED |
| 54 | New feature added under a hard requirement change mid-build | Technical debt tradeoffs [SE], refactor under green tests [SE], incremental delivery [SE] | PLANNED |
| 63 | Capstone review and transfer skills | synthesis and roadmap | Learning how to learn frameworks | architecture recap | frontend patterns recap | capstone acceptance checklist | PLANNED |

---

## Feature Backlog (Unscheduled)

- Status page for uptime and dependencies
- Template marketplace for board templates
- Rich text editor for card descriptions
- File attachments with virus scanning
- Rate limiting and abuse prevention
- CSP and security headers hardening
- Dependency audit in CI
- SSO integration (OIDC)
- Advanced analytics dashboard
- Data retention and archive policies

---

## Concept Registry

Populated as labs are completed. A concept listed there is never re-taught as new.

| Concept | Lab First Taught | Notes |
|---|---|---|
| (fill as labs complete) | | |

---

## Amendment Log

Record every curriculum change before changing a planned lab.

| Date | Lab | Change | Reason |
|---|---|---|---|
| 2026-05-12 | All | Initial FlowBoard curriculum created (00-63) | Establish full up-front roadmap to reduce session overhead and prevent context loss |
| 2026-05-12 | 00-04 | Status update and abstraction-first transition checkpoint | Preserve completed progress and avoid full restart while switching learning strategy |
