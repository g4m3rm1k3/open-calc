# Concept Map — What I Should Know About This App

Not a syllabus, not `MasterCurriculum/` (that's generic CS/SE knowledge via
fictional projects). This is the running inventory of *this specific
app's* real patterns, conventions, and subsystems — grown as we actually
touch them, not pre-planned in one pass. See `reference-notes.md`'s
"Lesson-Writing Workflow" entry for the rule this list serves: a pattern
not on this list gets taught (now or deferred) before Claude uses it
unsupervised; a pattern already on this list just gets built.

**The real foundation is the `flutter-playground-lab/` series plus its five
companion fundamentals installments** (`useeffect-and-useref-fundamentals/`,
`context-from-scratch/`, `routing-fundamentals/`, `async-and-promises/`,
`testing-fundamentals/`) — built together, deliberately, to close the gap
between "knows nothing" and "can work anywhere in this app." Everything
earlier in this folder (`git-fundamentals`, `lesson-engine-autofind`,
`matrix-reducer-copy-button`, `favoriting-a-lesson`) is real and still
correct, but incidental — built one real bug/feature at a time, not as a
planned curriculum. Treat this six-set foundation as the actual concept
map's backbone; everything below is still tracked the same way, just no
longer assumed to be the primary path.

**Status legend:**
- ✅ **Taught** — full lesson exists, linked below
- 🟡 **Touched, not taught** — used/explained inline while building
  something else, no dedicated lesson yet
- ⬜ **Pending** — used in a real build, deferred at the time because there
  wasn't time to stop; needs a lesson written from the real code that
  already exists
- ❔ **Known to exist, unexplored** — named because it's visibly part of
  the app (seen in `package.json`, a folder name, an open file) but not
  yet read or touched

---

## Build Tooling & Content Loading

- ✅ **Static analysis vs. dynamic resolution / `import.meta.glob`** —
  `lesson-engine-autofind/02-building-autofind-with-import-meta-glob.md`
- ✅ **Frontmatter-as-metadata + hand-rolled parsing** (`parseFrontmatter`) —
  `lesson-engine-autofind/01-how-content-loading-works-today.md`
- 🟡 **The registry+loader family** — `courseLoader.js`, `labLoader.js`,
  `gameLoader.js`, `contentLoader.ts` (ours), `seriesLoader.js` all solve
  "discover content from the filesystem" with the same shape. Touched
  across both lesson-engine lessons as prior art; never named/taught as
  its own pattern across the whole app.
- ❔ **`scripts/build-lesson-ids.mjs`, `scripts/generate-graph.mjs`,
  `scripts/build-search-index.js`** — run before every `dev`/`build` per
  `package.json`; not yet opened.

## State & UI Patterns

- ✅ **`useState` fundamentals** —
  `matrix-reducer-copy-button/01-copy-the-matrix-to-clipboard.md`
- ✅ **Clipboard API + transient-confirmation state**
  (`copied` / `.then()` / `setTimeout`) — same lesson
- ✅ **Discriminated unions as compile-time state machines** (`View` type) —
  `lesson-engine-autofind/01-how-content-loading-works-today.md`
- ✅ **Guard clauses / validation at a state transition** —
  `matrix-reducer-copy-button/02-fixing-the-silent-invalid-input-bug.md`
- ✅ **`useRef` + `useEffect` for imperative drag handling** — used in
  `MatrixReducer.jsx`'s draggable panel (`dragging`, `dragOrigin` refs, the
  `mousemove`/`mouseup` window listeners in `useEffect`, cleanup-on-unmount)
  and the identical pattern in `FloatingWindow.jsx` —
  `useeffect-and-useref-fundamentals/01-useref-and-useeffect.md`
- ✅ **Building a Context from scratch** (`createContext`, `.Provider`, a
  custom consuming hook with a guard clause for "no Provider present") —
  `context-from-scratch/01-building-a-context-provider.md`, real code at
  `src/context/RecentLabsContext.tsx`
- ✅ **Client-side routing** (`HashRouter` vs `BrowserRouter` and why this
  app uses the former, dynamic `:param` segments, `useParams`,
  `useNavigate` vs `<Link>`) — real code traced in `App.jsx`'s route table
  and `LessonPage.jsx` — `routing-fundamentals/01-react-router-and-this-apps-url-structure.md`
- ✅ **Promises and `async`/`await`** (the event loop, non-blocking I/O,
  `try`/`catch` around a rejected `await`) — traced through the real
  `pushToFirestore`/`syncOnSignIn` functions in `AuthContext.jsx` —
  `async-and-promises/01-promises-async-await-and-real-sync-code.md`
- ✅ **Automated testing with vitest** (`describe`/`it`/`expect`, `.toBe`
  vs `.toEqual`, watching a real assertion fail before trusting it) — real
  test added for previously-untested `parseXYText` in
  `src/labs/decomp-lab/mathHelpers.js` —
  `testing-fundamentals/01-writing-your-first-real-tests.md`
- ✅ **Derived state vs. stored state** (compute a value fresh from
  existing state every render instead of giving it its own `useState`
  and manually keeping the two in sync) —
  `flutter-playground-lab/04-matching-the-apps-theme.md`
- ✅ **Controlled form inputs** (`<select value={...} onChange={...}>`,
  and why an uncontrolled input plus external state mutation causes
  drift) — `flutter-playground-lab/05-typed-starter-examples.md`
- ✅ **Chained ternaries as if/else-if/else, and mutually-exclusive UI
  states** (`hasError ? ... : isLoading ? ... : null`) —
  `flutter-playground-lab/06-shipping-it.md`

## Math / Domain Modeling

- ⬜ **Exact rational arithmetic without floats** — `MatrixReducer.jsx`'s
  `frac`/`gcd`/`fadd`/`fmul` system, and *why* a matrix tool avoids
  floating-point at all (no rounding drift through many row operations).
  Explained functionally in passing while reading the file; never given
  its own concept lab.

## Home Page & Cross-Registry Curation

- ✅ **Topic-grouped "table" sections on the home page** — new pattern:
  `src/data/topicGroups.js` (curated `{kind, key, differentiator}` entries,
  resolved live from `courseLoader.js`/`labs/registry.js`/`games/registry.js`
  so cosmetic data never duplicates or goes stale), `TopicTable.jsx`
  (renders Course/Labs/Games sub-groups with a tinted background, reuses
  `AppCard` unmodified via an `onClickCapture` wrapper that intercepts its
  internal `<Link>` navigation), `ItemInfoModal.jsx` (the click-a-card
  "what is this" modal with a Launch button, following `WhatsNewModal.jsx`'s
  existing simple modal shell). Full plan/history:
  `C:\Users\g4m3r\.claude\plans\melodic-mapping-aurora.md`.
- ⬜ **`AppShell.jsx`'s hardcoded tool-opening system** — no reusable
  "open tool by key" function exists (unlike labs/games, which have
  `getLabEntry`/`getGameEntry`); adding a tool today means editing
  `AppShell.jsx` in ~4 places (state, lazy import, event-handler branch,
  JSX render ×2 for mobile/desktop). Found while designing the topic-table
  work; deliberately not fixed — real debt, real future lesson.

## Shared State & Cross-Cutting Contracts

- ✅ **Pins/Favourites system, and inconsistent shared-object contracts** —
  `favoriting-a-lesson/01-add-a-favorite-button-to-a-lesson.md`. Real bug
  found and fixed: `VizFrame.jsx` pins rendered blank in the Favourites
  grid because two different consumers (`HomePage`/`StartMenu` vs.
  `UtilityPanel`/`PinsNotesPopup`) read different field names off the same
  pin objects, and `PinsContext.jsx` enforces neither shape.
- ✅ **Consuming an existing Context via a custom hook** (`useGlobalTheme()`
  from `ThemeContext.jsx` — the observer-pattern shape of Context, read
  without building one from scratch) —
  `flutter-playground-lab/04-matching-the-apps-theme.md`

## Third-Party Embeds & Browser Security

- ✅ **`<iframe>` isolation, same-origin policy, and the `sandbox`/`allow`
  attributes** (least-privilege embedding of a third-party app — DartPad —
  including deliberately breaking the sandbox to observe the enforced
  failure) — `flutter-playground-lab/02-the-iframe-and-the-trust-boundary.md`

## App Structure & Registries

- ⬜ **Tool/lab `meta.js` + central registry pattern** — every tool
  (`src/tools/matrix-reducer/meta.js`) exports display metadata consumed
  by `src/labs/registry.js` / `src/games/registry.js`. Seen directly while
  reading `matrix-reducer/`; not yet taught.
- ❔ **Three coexisting styling systems** — `MatrixReducer.jsx` uses raw
  inline style objects (`S.btn(variant)`); `LessonEngine.tsx` uses a CSS
  Module (`LessonEngine.module.css`); other components use Tailwind
  utility classes directly in JSX. Noticed, not investigated — worth its
  own lesson just to establish which convention governs which part of the
  app, and why three exist.

## Platform / Infra

- ❔ **Electron desktop packaging** — `desktop:build*` scripts,
  `desktop/app/main.mjs`, `productName: "UpSkillOS"` in `package.json`.
  Named because it's visibly there; not opened.
- ❔ **The optional backend** — `backend/server.mjs`,
  `docs/optional-backend.md` (open in the editor when this lesson series
  started). Not yet read.
- ❔ **Testing setup** — `vitest`, `happy-dom`, `@testing-library/react`
  in `devDependencies`; no test files exist yet for anything this series
  has touched (`src/engine/lesson/`, `src/labs/lesson-engine/`,
  `src/tools/matrix-reducer/`).

---

## Pending — Introduced Mid-Build, Deferred at the Time

*(Empty right now. When a build gets interrupted by a new pattern and
there's no time to teach it on the spot, it gets logged here: topic, the
real file/commit it came from, and the date — then moved up into its real
category once a lesson exists.)*
