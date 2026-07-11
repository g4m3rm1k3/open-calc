# UX Audit Plan

Living plan, not a one-shot report — check items off and log findings here
as they happen, the same way `concept-map.md` tracks code concepts. Started
2026-07-11 after noticing the app feels overwhelming, scattered, and
redundant, with no guided path for a new user.

---

## Why this isn't just a feeling

Real counts, pulled directly from the app's own registries
(`src/labs/registry.js`, `src/games/registry.js`, `src/tools/*`,
`src/courses/*`), not an estimate:

- **32 labs**, **16 games**, **15 standalone tools**, **29 courses** — ~92
  top-level surfaces before a single lesson inside any of them.

**Confirmed redundancy clusters** (same subject, multiple unconnected
surfaces, no differentiation visible to a new user):

- **Linear algebra / matrices** — the `linear-algebra` course, the
  `linear-algebra` tool, `matrix-reducer` (tool), `matrix-lab`,
  `matrix-3d-lab`, `openmat` (labs), plus games `matrix-game`,
  `asteroids-la`, `vector-command`. **8+ surfaces.**
- **Physics** — the `physics` course, `sim-lab` (lab), plus games
  `reality-runner`, `basketball`, `pool`, `golf`, `football`. **6+
  surfaces.**
- **DSA** — `dsa-arrays-lab`, `dsa-linked-lists-lab`, `dsa-patterns`
  (labs/lessons), the `dsa-python` series inside the Lesson Engine, plus
  the `data-structures-and-algorithms` course. **5 surfaces.**
- **Probability/Stats** — `odds-lab`, `card-quest`, `card-academy` (labs),
  plus `applied-statistics` and `discrete-math` courses.

**Existing but possibly underused asset:** `TourAutoStart.jsx` /
`TourSpotlight.jsx` / `WhatsNewModal.jsx` — a tour/onboarding system already
exists. Check whether it's actually effective before building new
onboarding from scratch.

---

## Phase 1 — Complete the inventory

- [x] Full list of all 92 surfaces, grouped by subject, each tagged with
      its overlap cluster — done 2026-07-11, see `ux-audit-inventory.md`.
      Real totals: 29 courses, 32 labs, 16 games, 15 tools (12 visible, 3
      hidden/contextual). Confirmed clusters: linear algebra (8-9
      surfaces), physics (6-7), DSA (5), probability/stats (5), plus a
      smaller digital-logic overlap (`digital-fundamentals` + `logic`
      courses) noticed along the way.
- [ ] For each redundancy cluster: what's actually different between the
      surfaces (format? depth? audience?), stated explicitly — not assumed

## Phase 2 — Heuristic evaluation (no users needed)

- [x] Linear algebra cluster done 2026-07-11 — see
      `ux-audit-heuristics-linear-algebra.md`. Every applicable heuristic
      fails for the same root cause: no visible structure connecting the
      8-9 surfaces. Sharpest single finding: the game `matrix-game` is
      literally labeled "Linear Algebra" — identical to the course's name.
- [ ] Physics cluster
- [ ] DSA cluster
- [ ] Probability/Stats cluster
- [ ] Home page + Start Menu general pass (not cluster-specific)

## Phase 3 — Real first-time-user test

- [ ] 5 people, zero context, one task each ("find and start learning
      Python," "find something about linear algebra"), watch without
      helping
- [ ] Log every hesitation, wrong click, or "I don't know what to do here"
      moment verbatim

## Phase 4 — Consolidate the redundancy clusters

- [x] Linear algebra cluster decided 2026-07-11 — see the "Phase 4
      Decision" section in `ux-audit-heuristics-linear-algebra.md`. Turned
      out to be mostly *not* true duplication once the real code was read:
      each surface is a different modality (auto-solve-with-steps,
      manual practice, code-it-yourself, visual/3D, structured course,
      arcade). One real overlap found — `matrix-reducer`'s Solver mode
      duplicates the Linear Algebra Calculator's RREF operation — cross-
      link rather than delete until Phase 6 usage data exists. Rename
      `matrix-game` (currently labeled identically to the course) — cheap,
      no-risk fix, do any time.
- [x] `matrix-game` renamed to "Linear Algebra Arcade" — done, live in
      `src/games/registry.js`.
- [x] **Built, 2026-07-11**: the "Explore by Topic" section on the home
      page — a real, verified, working Linear Algebra topic-table (course +
      3 labs + 3 games, tools deliberately excluded). Click a card → info
      modal with the honest differentiator + a Launch button; only Launch
      opens the real thing. Verified end-to-end with a headless-browser
      pass (screenshots + console-error check) — course/lab cards render
      correctly, the modal flow works, Launch correctly opens the real
      Matrix Lab window, the discipline pills correctly scroll to/select a
      topic, and an uncurated pill (Physics) shows a clean "not curated
      yet" placeholder rather than crashing. See
      `C:\Users\g4m3r\.claude\plans\melodic-mapping-aurora.md` for the full
      plan (v3 — two earlier versions were rejected and revised in
      conversation before this one was approved).
- [ ] Physics cluster: same treatment
- [ ] DSA cluster: same treatment
- [ ] Probability/Stats cluster: same treatment

## Phase 5 — One guided path per audience

- [ ] Define 2-3 real personas (self-taught beginner, CS student, STEM
      hobbyist)
- [ ] One canonical, sequenced starting path per persona — not the full
      92-item grid as the first thing anyone sees

## Phase 6 — Lightweight usage signal

No accounts required, so track *usage* (anonymous, aggregate route/page
counts), not *users* (identity) — these are different questions, and only
the first one is needed here.

- [ ] **Corrected 2026-07-11:** most labs open via `openWindow()` in
      `DesktopProvider.jsx` — a pure React state change, no URL navigation
      — so plain pageview/route analytics would miss almost all lab usage.
      Confirmed 3 centralized open-paths instead: `navigate()` (courses,
      `web-learn`/`learn` lessons), `openWindow()` (most labs/tools,
      `DesktopProvider.jsx`), and the `oc-open-game` custom event listener
      (`AppShell.jsx`, some games). Instrument all three directly (one
      tracked event call in each), not a URL-watching script.
- [ ] Self-host an open-source, cookieless analytics backend (Umami is the
      natural fit — MIT licensed, matches the project's own "free/open"
      branding) to receive those 3 events; anonymous, no accounts, no
      cookies, no personal data
- [ ] Explicitly accept the coverage gap: this only sees the hosted
      deployment. The Electron desktop build and any self-hosted clone
      report nothing — expected for an open-source project, not a bug to
      fix
- [ ] Supplement with signal that doesn't depend on hosting: Phase 3's
      real user tests, GitHub activity (stars/issues/PRs) per subsystem,
      and anonymized top search-query terms from the existing
      `SearchPage`/search route (tells you what people look *for*, not
      just what they click)
- [ ] Add a one-line disclosure (README or footer) — what's tracked
      (anonymous page counts only) and that ad-blockers/DNT naturally
      opt users out — cheap trust-building for an open-source project

---

## Findings Log

*(Empty — add dated entries here as each phase turns up something
concrete.)*
