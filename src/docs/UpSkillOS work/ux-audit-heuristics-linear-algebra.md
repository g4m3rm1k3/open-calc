# UX Audit — Phase 2: Heuristic Evaluation (Linear Algebra Cluster)

Nielsen's 10 usability heuristics, applied specifically to the 8-9 real
surfaces identified in `ux-audit-inventory.md`: the `linear-algebra`
course, the `linear-algebra` tool, `matrix-reducer`, `matrix-lab`,
`matrix-3d-lab`, `openmat`, and the games `matrix-game`, `asteroids-la`,
`vector-command`. Every finding below cites the actual file/field it comes
from — no hypothetical UX, just what the real registries and components
currently do.

---

### 1. Recognition rather than recall — the sharpest violation

**Finding:** `src/games/registry.js` line 14 sets `label: 'Linear Algebra'`
for the game with `key: 'matrix-game'`. That's the *exact same display
name* as the `linear-algebra` **course**. A user scanning by name has no
way to tell "Linear Algebra" (a full structured course) apart from "Linear
Algebra" (a 7-lesson game) without already knowing which is which —
recall, not recognition, is required to navigate correctly, which is the
one thing this heuristic says a good interface should never demand.

### 2. Consistency and standards

**Finding:** Naming across the cluster is inconsistent in a way that
implies structure that doesn't exist: `linear-algebra` (tool) is labeled
"Linear Algebra Calculator," `matrix-reducer` is "Matrix Reducer,"
`matrix-lab`/`matrix-3d-lab` keep "Matrix" in both key and label, `openmat`
drops both words entirely. Nothing in naming signals which of these five+
"matrix/linear algebra" tools is the canonical one, or whether they're
related at all. A consistent system would either name them as a visible
family ("Linear Algebra: Reducer," "Linear Algebra: 3D," etc.) or make the
relationship explicit some other way.

### 3. User control and freedom

**Finding, directly from this conversation's own discovery:** most of
these labs open via `openWindow()` in `DesktopProvider.jsx` — a pure React
state change, not a URL navigation. That means: no back-button support to
leave a lab, no bookmarkable/shareable link to a specific one, and no
browser history entry marking "I was in Matrix 3D Lab." Every affordance a
browser normally gives a user for control and freedom (back, forward,
bookmark, share the URL, open in a new tab) silently doesn't apply to most
of this cluster, and nothing in the UI tells the user that in advance.

### 4. Match between system and the real world

**Finding:** A learner's real-world mental model of "linear algebra" is
one subject with a natural progression (vectors → matrices → determinants
→ eigenvalues → applications). The system's model is a flat, unordered set
of 8-9 unrelated cards spread across four different top-level categories
(Courses, Labs, Tools, Games) with no visible connective structure between
them — the system's organization doesn't match how a person actually thinks
about the subject.

### 5. Aesthetic and minimalist design

**Finding:** Individually, each card's description (pulled directly from
the registries in Phase 1) is well-written and specific — `matrix-3d-lab`:
"vectors, dot product, determinant, RREF, eigenvalues, Cramer's rule";
`matrix-lab`: "row ops, Gaussian elimination, determinants, inverse,
Gram-Schmidt." The problem is aggregate, not individual: seeing 8-9
similar-looking, similarly-worded cards about the same subject in the same
browsing session (Start Menu "all" tab, or a "Math" filter) is exactly the
kind of informational noise this heuristic warns against — every
additional near-duplicate card competes with the others for attention
without adding a proportional amount of real distinction.

### 6. Flexibility and efficiency of use

**Finding:** No fast path exists for "I already know linear algebra, I
just need to row-reduce this one matrix" (which should land on
`matrix-reducer`, the actual case study of this lesson series) versus "I'm
learning this for the first time" (which should land on the `linear-algebra`
course). Both a total beginner and an expert see the identical flat list
with no differentiation by intent.

### 7. Visibility of system status

**Finding:** None of these surfaces reference each other. Opening
`matrix-lab` gives no indication that `matrix-3d-lab` or the full course
exist, or how they relate. A user has no way to know, from inside any one
of these tools, where it sits relative to the rest of the cluster.

### 8. Help and documentation

**Finding:** No index, landing page, or "if you want X, use Y" guide exists
anywhere for this cluster (confirmed — no dedicated `LabsPage.jsx` or
subject-index component was found; browsing happens entirely through the
flat Start Menu list). The only "documentation" of how these relate to each
other is this audit, written after the fact.

### 9 & 10 — Error prevention / error recovery

Not meaningfully applicable at this navigational level — there's no error
state to speak of, just the soft cost of a user picking the wrong one of
9 near-identical options and not realizing it until they've already
invested time in it. Noted for completeness, not scored as a separate
finding.

---

## Summary

Every one of the applicable heuristics fails for the same underlying
reason: **the cluster has no visible internal structure.** Nine surfaces
about one subject exist as nine unconnected leaves, discoverable only by
already knowing what you're looking for. This isn't nine separate small
UX problems — it's one structural problem (no cluster-level information
architecture) showing up nine times.

## Phase 4 Decision (2026-07-11) — What Actually Happens to This Cluster

Reading the real code (not just registry descriptions) changes the
picture: most of these surfaces are **not** true duplicates — they're
different pedagogical modalities for the same subject, and the cluster's
real problem is invisibility, not redundancy. One genuine overlap did turn
up, though.

**`src/tools/linear-algebra/index.jsx` ("Linear Algebra Calculator") is a
near-superset of `matrix-reducer`'s Solver mode.** It covers RREF/REF, plus
determinant (2×2 formula and cofactor expansion), inverse (adjugate and
Gauss-Jordan), transpose, trace, and eigenvalues/eigenvectors (full
characteristic-polynomial derivation) — every operation auto-solved with a
full step-by-step LaTeX derivation. Its state (`opId`, `gridA`, `steps`)
confirms it's a "pick an operation, get the full worked answer" tool —
there's no manual, choose-your-own-row-op mode. That's the real
differentiator: `matrix-reducer`'s **Manual mode** (pick swap/scale/replace,
apply it yourself, undo/redo, build the answer one step at a time) is a
genuinely distinct capability nothing else in this cluster replicates —
active practice versus instant, fully-worked answers. `matrix-reducer`'s
**Solver mode**, though, is functionally redundant with this tool's RREF
operation — the same capability, implemented twice, independently (two
separate `frac`/`gcd` fraction systems, confirmed in the
matrix-reducer-copy-button lessons and read directly in this file).

**Decision:**
1. **Done 2026-07-11, zero-risk:** renamed `matrix-game`'s label from
   "Linear Algebra" to "Linear Algebra Arcade" in `src/games/registry.js`
   — fixes the sharpest heuristic violation (identical name collision with
   the course), one line, no design risk.
2. **Real overlap, don't delete — corrected by the app's own author:**
   the Linear Algebra Calculator has no manual/choose-your-own-row-op mode
   *and* doesn't isolate a single matrix — it's a general-purpose
   calculator with matrices as one of several operation types. That's
   exactly why `matrix-reducer` exists: when you're working through many
   matrices in a row, a dedicated, isolated, fast tool beats a general
   calculator you have to reconfigure each time. So `matrix-reducer`'s
   Solver mode isn't just "the same RREF, redundantly" — it serves a
   distinct focused/batch workflow the Calculator doesn't. Keep both. Cross-
   link them so a user can tell which fits their situation ("need the
   answer plus determinant/inverse/eigenvalues too? → Linear Algebra
   Calculator" / "working through several matrices, or want to practice
   row ops yourself? → Matrix Reducer") rather than defaulting to "delete
   the apparent duplicate."
3. **No action on the rest** — `matrix-lab` (write the algorithm yourself
   in code), `matrix-3d-lab` (visual/3D geometric intuition), `openmat`
   (general CAS, matrices are one small part), the course (structured
   curriculum), and `asteroids-la`/`vector-command` (differently-themed
   arcade/mission games) are each a genuinely different modality, not
   redundant with each other. The fix for these is discoverability, not
   removal.
4. **The structural fix:** a short, shared "Related Linear Algebra
   Surfaces" cross-reference — one honest sentence per surface, dropped
   into the course landing page, `matrix-reducer`, `matrix-3d-lab`, and the
   Linear Algebra Calculator. This is real, new implementation work (a
   pattern not yet in `concept-map.md`) — a separate decision from this
   diagnosis, not started here.

## Recommendation feeding into Phase 4

Don't treat this as "delete redundant tools" — the finding here is
*missing structure*, not necessarily *too much content*. The fix that
addresses the most heuristics at once: a single landing surface for
"Linear Algebra" that lists all 8-9 real surfaces with one honest sentence
each on what makes it different and who it's for (learn from scratch →
course; quick row-reduction → `matrix-reducer`; visual/geometric intuition
→ `matrix-3d-lab`; code-it-yourself → `matrix-lab`; play → the three
games). Whether that becomes an actual new page/component, or just
consistent cross-links added to each existing surface, is a Phase 4
design decision — this phase's job was diagnosing the problem precisely,
not yet solving it.
