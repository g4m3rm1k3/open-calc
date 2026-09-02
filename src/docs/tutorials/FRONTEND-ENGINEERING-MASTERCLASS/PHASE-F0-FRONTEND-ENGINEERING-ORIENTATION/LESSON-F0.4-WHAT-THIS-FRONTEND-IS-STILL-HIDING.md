# Lesson F0.4: What This Frontend Is Still Hiding

*File paths under src/... refer to the real manufacturing-platform repository's frontend. Paths under verification/... refer to that same repository's verification folder.*

**What you will build:** Not a new tool - a real, cited inventory of four specific places in this exact frontend where the habits built this phase (verify instead of trusting a name, search real import paths mechanically, trace a real function's own parameter semantics against a real call site, read a store's own declared state directly rather than its header comment) already surface a real, located question neither this lesson nor this phase answers. The transferable problem: locating a real problem precisely, with real evidence, is a genuinely different and prerequisite skill from explaining why it matters or fixing it - conflating the two turns a phase meant to build one habit into an attempt to teach everything at once.

**What you need to know first:** Finding real callers of a name mechanically, by import path rather than an assumed binding name; tracing a real function's own declared parameter semantics against what a real call site actually passes it; reading a store's own declared state shape directly from its real source instead of trusting what its own header comment claims.

## Terms used in this lesson

- **Scope** — A deliberate boundary on what one piece of work will and won't attempt to settle. It exists because naming a real problem precisely and explaining or fixing it are genuinely different amounts of work - a habit-building phase can locate four real, serious things without owing a full treatment of any of them yet, as long as that boundary is stated honestly rather than implied away.

## Objects and methods used

None — this lesson introduces no new external class, interface, or method, only Terms.
## Concept Unit: Four Real, Located Questions This Phase Doesn't Answer

### The Problem

The habits built this phase - verify instead of trusting a name, search real import paths mechanically, compare a real function's own declared parameters against what a real call site actually passes, read a store's real state shape directly - work on more than the four examples already used to teach them. Turned on the rest of this frontend, they immediately locate four real, specific, cited places worth a full lesson each, later - not yet.

Before reading on:

- For each of the four items below, what real, mechanical check - in the same style as this phase's own three tools - would you run first, before trying to explain why it matters or how to fix it?

### Project Change

- **Reference Source:** Four real, separately verified citations, each read directly this session: `src/pages/PartDetailPage.tsx:58-60,283,291-332,346`; `src/hooks/useWebSockets.ts:73-75` and `src/store/useGlobalStore.ts:279,477,481`; `src/components/parts/HistoryTab.tsx:52` and `src/pages/PartDetailPage.tsx:464`; and `src/components/layout/TopBar.tsx:83-87`, `src/types/index.ts:2307`, `src/context/AuthContext.tsx:158`, and `src/store/appStore.ts:338-342`.
- **Files affected:** None
- **Change type:** none
- **Location:** N/A
- **Dependencies:** None beyond the real repository already checked out on disk.

Each citation below names a real, structural fact - where something lives, what shape it has, which real files are involved - without yet explaining the full mechanism behind it or proposing a fix. That fuller treatment is real, future work, not something this closing lesson can honestly compress into a few sentences each.

### CS Lens

This is scoping a search before attempting to solve what it finds - the same real discipline behind triage in an emergency room (identify and rank every real problem before treating any one of them in depth), a code review that lists every real concern found before deciding which ones block the change, and a building inspection that catalogs every real defect found before any one of them gets scheduled for repair. In every case, naming something real and located is genuine, useful progress on its own - it doesn't have to be the same step as resolving it.

### SE Lens

The real alternative not chosen here: using this closing lesson to explain all four items in full - what each one actually does at runtime, why it's a problem, and how to fix it. The real, honest cost of that choice: it would take four topics this phase's own habits aren't yet equipped to fully evaluate (React's own render/state model, a WebSocket event's full real lifecycle, and a multi-store identity architecture all need their own real grounding first) and compress each into a few confident-sounding sentences - exactly the "prose standing in for proof" failure this whole phase exists to teach a reader to distrust. Stating the real scope boundary honestly costs this lesson a satisfying ending; it's the more honest choice anyway.

### Verification

Not applicable under the Verification Rule's own exemption: no execution is required for this unit's actual claims. All four citations are read directly from real, already-existing source this session - two real import lines compared against a real function's own real parameter list and its real comparison (`p.id === pairingId`); a real component's own real comment beside its real, hardcoded data, plus the real line that renders it; two real, separately declared `User` interfaces plus a third, real, inline shape; two real hooks read in the same real component. Every one establishes a real, structural fact - what exists, where, and in what shape - not runtime behavior, which is exactly why a fuller treatment of any one of them, later, still needs its own real execution evidence, not just this citation.

### Connection to the previous unit

There is no previous unit - this is the first and only unit in this lesson.

## Connect the pieces

Four real, cited locations, found by turning this phase's own habits outward instead of introducing new ones. (1) A real, recurring "extract then abandon" pattern - `PartDetailPage.tsx:58-60` imports `PartHeader`, `PartInfoCards`, and `QualityIssuesAlert` and never renders any of the three; the identical real markup is hand-duplicated inline instead, at `:283` (header/nav), `:291-332` (quality issue alerts), and `:346` onward (info cards) - one of five real, separately confirmed instances of this same pattern across this app. (2) `useWebSockets.ts:73-75` calls `updateLocalPairing(camFileId, programType)`; the real function it calls, declared at `useGlobalStore.ts:279` and `:477`, is typed `(pairingId: string, programType: string)` and internally compares `p.id === pairingId` (`:481`) - a real pairing's own real primary key, not a `camFileId`, a different real key entirely. (3) `HistoryTab.tsx:52` carries its own real `// TODO: Fetch history from backend API` comment directly above a real, hardcoded array of history entries - and that exact component is really rendered, in production, at `PartDetailPage.tsx:464`. (4) `TopBar.tsx:83-87` reads `currentUser` from `useAppStore()` and `logout`/`isAuthenticated` from `useAuth()` in the same real render; separately, `types/index.ts:2307` and `AuthContext.tsx:158` each declare their own real, differently-shaped `User` interface, and `appStore.ts:338-342` declares a third, real, inline `currentUser` shape matching neither. Each is real, each is cited, and none of them is explained here - naming them precisely, with real evidence, is as far as this phase's own scope goes.

**Next lesson:** Applying everything this phase built - reading a frontend as evidence, not assumption - to TypeScript itself, starting with the real interfaces and type aliases this app's own code already depends on.