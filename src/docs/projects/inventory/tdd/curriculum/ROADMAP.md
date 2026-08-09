# Curriculum Roadmap — Real Rebuild, Same Stack as the Original

**Stack: Python + Flask (backend), React + TypeScript (frontend) — the
real reference app's own stack, not Rust/Svelte.** This is a deliberate
decision, made after the fact: building a second, real, parallel app in
the *same* language removes an entire, separate axis of difficulty (a
brand-new language and framework, on top of everything else) so every
real hour goes toward the actual goal — understanding the real app,
concept by concept, feature by feature — not toward also learning Rust
and Svelte from zero at the same time. At the end, two real, working,
functionally-duplicate apps exist side by side: the original, and this
one, built from scratch with everything genuinely taught along the way.

This is the third real attempt at this rebuild in this repo — `rebuild/`
and `faild lessons/` (attempt 1, TypeScript/Node) and `app/` (attempt 2,
Rust/Svelte, tonight's own now-abandoned plan) are both left untouched,
kept as real history, not deleted. This attempt's real code lives in
`rebuild-3/backend/` and `rebuild-3/frontend/`.

Every arc and entity below comes from `REBUILD_USER_STORIES.md` (Part 1:
real user stories by role; Part 2: real data entities), `SOURCE_MAP.md`
(what the real code says to split, delete, or merge), **and a second,
real audit pass, done directly against the actual reference code in
`backend/app/routes/`, `backend/app/models/`, `backend/app/services/`,
`src/pages/`, and `src/components/`** — because the first pass, built only
from the two summary docs, itself turned out to have real, shallow-parity
gaps (see "What the second audit pass found," below). Governed by
`PROCESS.md`, `LessonContract`, `LessonSchema.md`, `extraction.md`,
`concepts/`. None of this content changes with the stack — what to build
was never language-specific; only how it gets taught and verified is.

**A real, honest limitation, found during the audit and not resolved:**
several real files (`EngineeringAssetsPage.tsx`, `ImageViewer.tsx`,
`appStore.ts`, `OperationsPage.tsx`) cite a "BRD" (Business Requirements
Document) by section number — e.g. "Per BRD Section 4.31." No such
document exists anywhere in this repo (checked directly). Every real
requirement below is grounded in what the actual, real code *does*, never
in a guess at what an unavailable BRD section might have said.

**Reversed: there is now a Lesson 0.** The original reasoning below
(concepts extracted from completed real feature work, not
pre-scheduled) is still generally the right default — but it produced a
real, confirmed gap: Lesson 1.1 built a genuine Flask server before the
reader had ever been told what a server is, what a client/server
exchange actually looks like, how routing decides which code runs, or
why a framework needs a standard interface like WSGI to run under any
real web server at all. `concepts/client-server-architecture.md`,
`concepts/http-request-response.md`, and
`concepts/http-routing-dispatch-table.md` already existed, already
covered exactly this, and
were sitting completely uncited. `Lesson 0` (`curriculum/lesson-0-
servers-clients-and-the-interface-between-them.md`) now surfaces those
three plus one genuinely new file
(`concepts/wsgi-application-interface.md`) before Lesson 1.1, so the
reader has the real foundation before Flask, not surface-level pattern-
matching on `@app.route` with no idea what it's standing on. This
doesn't overturn the broader just-in-time principle below — a
foundational, always-true prerequisite (what a server *is*) is
different from a project-specific feature concept, and gets taught
once, up front, exactly because every later lesson depends on it rather
than one specific feature needing it.

`concepts/` already has 101+ real, existing files directly relevant to
this stack (`python-*`, `flask-*`, `sql-*`/`sqlalchemy-*`, `react-*`,
`typescript-*`, `jsx-*`) from prior, real projects. Per the 100%-match
rule (`extraction.md`), each Arc still checks these as needed: a
genuine, exact match gets named and reused, not re-taught from scratch;
anything only superficially similar, or genuinely new (Flask patterns
specific to this app's own real architecture, for instance), still
gets full, real treatment and its own new file. Expect each Arc to
still be substantial — just not from-zero the way a Rust/Svelte
version would have been.

**No field is ever narrowed to *hide* it or pretend it's simpler than it
really is** — the last attempt's real failure was silently narrowing
`Machine` to 3 fields and `Operation` to 4, presenting each as if it were
the whole model. That's different from *pacing*: a real field is added
only once some real story in this curriculum actually needs it, not
because the reference model happens to have it. `scripts/check-
fidelity.mjs` was built for exactly this shape — it only ever blocks
*invented* code with no real reference counterpart; missing real code is
permanently fine, by design, not a gap to eventually close. This project
should never end up structurally identical to the reference — learning
happens out of real need, and building ahead of a real need to reach
"completeness" teaches nothing, it's just noise. Any real field ported
gets named plainly (Reference Source, same as always) so it's clear
*why* it showed up when it did, never silent about what it is.

---

## What the second audit pass found

Real, confirmed gaps in the first-pass roadmap — caught by reading the
actual reference code directly instead of trusting the two summary docs
alone:

- **`VisualTemplateBuilder.tsx` (715 real lines)** — `REBUILD_USER_STORIES.md`
  reduced this to one line, "create and edit NC-generation templates."
  It's actually a visual, block-based template editor (text/variable/
  loop/conditional blocks, real nested structure, real tag validation)
  with a real compiler (`blockToJinja`) turning the block tree into real
  Jinja2 syntax — closer to a small visual programming tool than a text
  editor. Distinct from `TemplateManagementPage.tsx`, which is the real
  list/CRUD page the builder is opened from.
- **`favorites.py` / `UserFavorite`** — real, per-user favoriting of
  Machine+CAM pairings. Not named as a user story anywhere in the first
  pass, even though `REBUILD_USER_STORIES.md` Part 3 itself already
  flagged its real auth as spoofable — meaning it was known to exist,
  just never given real story treatment.
- **`notifications.py` / `Notification`** — real, per-user notification
  system (type, title, message, read/unread + timestamp, linked to a
  pairing or CAM file). Same gap as favorites — named once in Part 3's
  own security critique, never turned into a real story.
- **`bootstrap.py`** — a real, deliberate architectural pattern: one
  endpoint returns a full domain snapshot (parts, machines, pairings) in
  a single request instead of many separate ones ("Load Once"). Not an
  arc by itself — a real, cross-cutting data-loading decision every arc
  needs to make consciously, named once here so it isn't silently
  reinvented per-entity.
- **`EngineeringAssetsPage.tsx`** — a real, distinct page managing
  Fixtures, finished-Part 3D models, and Stock 3D models as first-class,
  independently-manageable assets — separate from the *per-operation*
  images/models the first pass's Arc 8 already covered.
- **`stl_scaffold_service.py`** — a real, distinct feature: generates an
  actual folder of correctly-named placeholder STL files on disk, so a
  programmer can "Save As" directly from Mastercam into the right place.
- **`OperationsPage.tsx`** ("Operations Board") — a real, distinct,
  cross-machine/cross-part operations-tracking view, different from the
  single-operator, single-machine Operator Dashboard.
- **`StatusPage.tsx`** — a real, comprehensive issue history/tracking
  page (filter by machine/part/location/type/status, resolution
  tracking), distinct from Quality's own real, live queue.
- **`GitLabSettingsPage.tsx`** — a real, distinct settings sub-page
  (url/token/username/email) for the GitLab connection, beyond the
  first pass's generic "Connect GitLab" bullet.
- **`models.py`'s part-level uploads** (final model, fixture model,
  initial-stock model) — the first pass's Arc 8 only named
  *per-operation* stock/processed models; part-level uploads are a real,
  separate set of routes.

---

## Arc 1 — Machines

Real fields (`REBUILD_USER_STORIES.md` Part 2): category, subType,
manufacturer, model, travel specs (x/y/z), spindle specs (taper, max
speed), tool changer (has/capacity), status, currentPartId,
currentOperatorClientId, pallet info, group. Real stories: admin
create/edit/duplicate/delete; category/sub-type tree (mill, lathe, swiss,
wire-EDM, mill-turn, grinder); operator toggles Idle/Running status,
persisted via a real 30s heartbeat.

**Correction:** this arc order is wrong and is being replaced. It's
entity-ordered — Machine placed first because it's a foundational
database entity — not ordered the way a real user actually experiences
the app, which is sign-in first, before any other entity. Real Machine
work (model, routes, frontend) was built once, out of order, and rolled
back for exactly this reason. What's real and still stands: the first
real Flask app, first real running React page, real CORS/proxy, and the
first real database connection (Lessons 1.1-2.1) — all real
infrastructure Auth needs identically to Machines, so none of it was
redone. The next real entity is `User`, not `Machine`. This whole arc
list is under revision to be ordered by real user journey instead of by
entity — do not treat the numbered arcs below as the real build order
until that revision lands.

## Arc 2 — Parts

Real fields: partNumber, description, material, currentRevision, status,
model paths (final/fixture/initial-stock), isFavorite, tags. Real
stories: programmer/engineer browses (grouped by prefix or flat/
searchable), creates (duplicate part numbers rejected).

## Arc 3 — CAM Import

Real entities: CAMFile (partId, machineId, fileName, revs, status,
proveOutState, programType, checkout fields, GitLab project ref);
Sequence (camFileId, sequenceNumber, programNumber, toolNumber,
toolAssemblyId); Operation (sequenceId, operationNumber, type, tool,
**feedrate, spindleSpeed, rotationA/C**, imageUrl, stock/processed model
paths); ToolAssembly/Tool/ToolHolder (assemblyCode, toolCode, type,
diameter, holderName). Real story: import a real Mastercam XML, parse
real sequences/operations, generate the NC files the XML says to expect,
surface warnings (unassigned tooling).

`SOURCE_MAP.md` flags two real, competing XML parsers in the reference,
only one actually wired in — confirm which before treating either as the
real source of truth.

## Arc 4 — Operator Dashboard & Operations Board

Two real, distinct operator-facing screens. **Operator Dashboard**: no
login, select machine, select a released part, view operations grouped
by tool and by rotation (A/C axis), with reference images and 3D models.
**Operations Board** (`OperationsPage.tsx`): a real, separate,
cross-machine/cross-part view — every active operation, by status
(pending/in-progress/completed), for tracking work broadly rather than
one operator's own single machine.

`SOURCE_MAP.md`: the reference's own `OperatorDashboard.tsx` (728 lines)
owns machine select, part select, all three tabs' state, heartbeat, and
SSE subscription in one file — split by tab as independent components
from the start, page as a thin shell, not ported as one file.

## Arc 5 — Auth

Real entity: User (email, name, role, mustChangePassword). Real stories:
log in, get a session, change password.

`REBUILD_USER_STORIES.md` Part 3, directly: the reference's auth is
**inconsistently applied** — most routes have no gate at all, two of them
(`favorites`, `notifications`) trust a spoofable header, and there are
two incompatible `User` type definitions kept in sync by hand. This arc's
real point is one consistent, impossible-to-forget authorization layer
and one real source of truth for identity — designed *away* from the
reference's own confirmed mess, named explicitly as such
(`LessonContract`'s "Component and Behavior Boundaries" — silent
normalization is never allowed, but a *named, deliberate* fix is exactly
what that section expects). Also real, per `appStore.ts`'s own cited BRD
section: role-based data visibility, not just role-gated routes — what a
given role can *see*, not only what it can *call*.

## Arc 6 — Quality Loop & Issue History

Real entities: Issue (type, partId, machineId, message, status,
resolution fields), Inspection (partId, machineId, inspectorName, status,
comment, acknowledgment fields). Real stories: operator queues a part for
inspection; quality records pass/fail (notes required on fail); operator
gets a live, blocking pass/fail popup over a persistent connection.
Separately, a real, comprehensive **Status page** (`StatusPage.tsx`):
every issue, active and resolved, filterable by machine/part/location/
type/status, with full resolution tracking (who, when, notes) — distinct
from Quality's own live, working queue.

`REBUILD_USER_STORIES.md` Part 3: the reference's real-time mechanism is
one in-memory, single-process SSE subscriber list — cannot survive more
than one server process. Build the real, multi-process-safe version from
the start, named as a deliberate fix.

## Arc 7 — Tooling

Real story: search every tool assembly by code or name, see exactly which
parts/CAM files/sequences/operations use it, with real feed/speed/depth/
time data (depends on Arc 3's real Operation fields actually being
present this time).

## Arc 8 — Images, 3D Models & Engineering Assets

Real entity: OperationImage (camFileId + subprogramName-or-rotation,
imageUrl — deliberately survives XML re-import), with real, synchronized
highlighting between an image and the operation data it illustrates
(`ImageViewer.tsx`). Real story: per-operation stock/processed 3D models,
toggleable independently. Separately, real, **part-level** assets,
managed on their own real page (`EngineeringAssetsPage.tsx`): Fixtures,
finished-Part 3D models, and Stock 3D models — plus a real, distinct
feature, **STL scaffold generation**: create a real, correctly-named
folder of placeholder STL files on disk so a programmer can "Save As"
directly from Mastercam into the right place.

## Arc 9 — Full PDM Depth

Real stories: checkout (required reason) / checkin (change message,
commits to a real per-CAM-file GitLab project, bumps revision) / cancel /
admin force-unlock; full version history + download any past version
(database fallback if GitLab is down); MachineCAMPairing with three
independent department approvals (quality/engineering/programming),
revoking one auto-reverts "proven" status. Real, distinct GitLab
connection settings (url/token/username/email — desktop app only).

## Arc 10 — Favorites & Notifications

Real, small, per-user, cross-cutting entities, both genuinely present in
the reference and genuinely absent from the first-pass roadmap. Favorite
(userId, pairingId) — a user's own starred Machine+CAM pairings.
Notification (userId, type, title, message, isRead/readAt, optionally
linked to a pairing or CAM file) — real types confirmed in the reference:
`quality_issue`, `file_changed`, `help_request`, `manual_edit`.

## Arc 11 — Programmer Operations

Real entities: NCFile (camFileId, programNumber, uploadStatus,
fileContent, version, checkout fields), NCFileHistory (real commit
snapshots — content, message, author, timestamp), NCTemplate (type,
Jinja2-equivalent content, compatible categories/controllers). Real
stories: NC programs as "expected" vs "uploaded"; edit G-code live with
real diff-against-history and diff-before-overwrite; part-count
multipliers and per-operation work offsets; drag-reorder subprograms;
generate/export final NC file. Two real, distinct template UIs: a real
list/CRUD management page, and the real, visual, block-based template
builder (text/variable/loop/conditional blocks, compiling to real
Jinja2) opened from it.

`SOURCE_MAP.md`: the reference's `operation_manager.py` (1062 lines) mixes
route handlers with a bespoke merge/templating engine — the real
materialization logic is a service, pulled out from the start, never
inline in a route handler.

## Arc 12 — Admin + Settings

Real stories: list/create/edit/delete users, assign roles, force a
temporary password; configure naming conventions and part-grouping
rules, shop-wide; manage machines (create/edit/duplicate/delete,
category/sub-type tree); force-unlock a CAM file; GitLab connection
settings (real, distinct sub-page, named again here alongside every
other real settings concern).

## Arc 13 — Dashboard (any authenticated user)

Real story: KPI cards, a machine-status grid color-coded by open issue
severity, the 5 most recent active issues.

## Arc 14 — Application Shell

Ribbon + dockable panels — the stated, real, long-term end-state goal
(beyond the reference app's own simpler layout), applied now that every
real screen it needs to host exists.

## Arc 15 — Packaging

A real, installable Tauri build, outside dev tooling.

---

## A real, cross-cutting architectural decision: "Load Once"

The reference's `bootstrap.py` returns one, real, full domain snapshot
(parts, machines, pairings) from a single endpoint, loaded once, rather
than each real screen making its own separate request. Decided here,
once, rather than left for each arc to reinvent differently: adopt or
deliberately reject this pattern for the new build's own real initial
load, named explicitly in whichever arc first needs more than one real
entity loaded together (likely Arc 4).

## Named, deliberate departures from the reference (not silent, not accidental)

Per `SOURCE_MAP.md`, these are decided now, up front, so no arc "discovers"
them mid-lesson and quietly picks an answer:

- **Auth**: one consistent gate, not inconsistently-applied per-route
  decorators, and not a spoofable header for `favorites`/`notifications`
  (Arc 5).
- **Real-time**: multi-process-safe, not one in-memory subscriber list
  (Arc 6).
- **Typed data end-to-end**: no `any[]` boundary the way the reference's
  Zustand store discards its own 2500-line real type system.
- **One canonical role set**, aliases resolved at the boundary if needed
  at all — not duplicated permission blocks hand-copied in two places.
- **Dead/duplicate code is not ported**: `ToolingPage_backup.tsx`,
  `XMLComparisonModal`, `HistoryTab` (mock data), the unused settings/
  machine-tree components, `mockData.ts`, the abandoned `part_service.py`,
  the dead XML parser (once confirmed which), `CAMFileHistory` (never
  written to), the unused `Tag` model — none of these get built at all.
- **One real migrations story** from day one, not ad hoc root-level
  scripts outside the real migrations directory.
