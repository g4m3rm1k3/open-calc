# Build Handoff — Foundations-to-Frontiers Computation Curriculum

This file exists so a fresh session (yours or a new Claude session with zero memory of prior work) can resume this build correctly, without re-deriving context or drifting off the established conventions. Read this file fully before writing or editing any lesson.

## Source of truth — read these, and only what they point to

1. `src/docs/tutorials/computation/Foundations.brd.md` — the full ~312-lesson curriculum outline (BRD). Section headers and per-lesson one-line descriptions live here.
2. `src/docs/reference/LESSON SCHEMA.md` — the mechanical, per-lesson production template. Every lesson file must follow its structure.

Do not read sibling project folders, other tutorial series, or unrelated docs unless one of the two files above explicitly points to them. This curriculum is self-contained.

## Current status

**Lessons 1–108 are complete — Section V (Data Structures) is fully done.** Written to `src/docs/tutorials/computation/NN-title-slug.md` (two-digit zero-padded, matching the site's auto-discovery convention). **Lesson 109 (What Makes an Algorithm?) is next, opening Section VI.**

Section progress against the BRD:

| Section | Lessons | Status |
|---|---|---|
| I — Computational Thinking & Mathematical Language | 1–18 | Done |
| II — Recursion, Data, Little-Schemer Mindset | 19–40 | Done |
| III — Algebra for Programmers | 41–58 | Done |
| IV — Combinatorics and Discrete Mathematics | 59–82 | Done |
| V — Data Structures | 83–108 | Done |
| VI — Algorithms and Algorithmic Problem Solving | 109–138 | In progress (109 next) |
| VII — Mathematical Structures Behind Programming | 139–158 | Not started |
| VIII — Programming Languages and Semantics | 159–183 | Not started |
| IX — Computer Architecture and Representation | 184–207 | Not started |
| X — Operating Systems / Concurrency / Systems | 208–230 | Not started |
| XI — Linear Algebra / Geometry / Continuous Math | 231–252 | Not started |
| XII — Computability / Complexity | 253–272 | Not started |
| XIII — Software Engineering as Applied CS | 273–292 | Not started |
| XIV — Integration and Advanced Problem Solving | 293–312+ | Not started |

**To resume:** open the BRD, find the next lesson number after the last file in the directory, read its one-line BRD description, and write it following the schema and the conventions below. Update this file's status table and "next lesson" pointer when you finish a session.

## Non-negotiable conventions established so far

These were decided deliberately, some after real mistakes. Do not silently relitigate them.

- **Language 1 is Clojure, taught from zero.** Only basic Python-level constructs (variables, loops, functions) are assumed of the reader. Every Clojure construct — `if`, `defn`, `map`, `shuffle`, `rand-int`, vector literals, `assoc`, `declare`, everything — gets its own isolated "New Code" introduction before first real use. Never use a construct before its own lesson (or an earlier one) has taught it.
- **No `let`, anywhere, ever.** This is deliberate. Work around it with helper functions that take an already-computed value as an argument (e.g. Lesson 56's `combine-egcd`, Lesson 87's `dequeue-from-ready`) rather than introducing a binding.
- **No vector/array indexing until Lesson 84.** Before that lesson, "position in a list" is built via recursive accessor functions (e.g. Lesson 81's `value-at`), never `nth`/`get`. From Lesson 84 onward, vectors and `get`/`assoc` are fair game and are this section's array representation.
- **Dependency ordering is strict.** A lesson may only use constructs and results taught in itself or an earlier lesson. Check this before finalizing any lesson — it has been violated and caught before (Lesson 4 draft originally).
- **Repetition Rule / citation style:** when a lesson reuses an earlier concept, name it directly in prose ("Lesson 75's linearity of expectation") rather than a bare parenthetical. Restate briefly, don't just cite silently.
- **File naming:** `NN-title-slug.md`, two-digit zero-padded, lowercase-kebab, in `src/docs/tutorials/computation/`.
- **Heading spelling:** the schema's per-Concept-Unit heading is `### SE Lens` (paired with `### CS Lens`). A typo (`SE Lells`) crept into Lessons 46–80 and was bulk-corrected — if you ever see `SE Lells` again, it's a regression, fix it.
- **Verification:** Babashka (`bb`) may or may not be reachable via a tool-approval prompt in any given session. When it is available (check via PowerShell: `Get-ChildItem -Path $env:TEMP -Filter "bb.exe" -Recurse`), verify every code block's actual output before publishing — this caught a real arithmetic error in Lesson 80 (`27/40` vs. the correct `7/10`). When it isn't reachable and the user doesn't want to spend time approving tool calls, build from careful hand-tracing instead, and say so honestly in chat (not necessarily in the lesson text) rather than claiming unverified output as verified.
- **PowerShell encoding caution:** `Get-Content -Raw` / `Set-Content -Encoding utf8` in Windows PowerShell 5.1 can silently mis-decode UTF-8 files (em-dashes and other non-ASCII characters turn into mojibake like `â€"`), especially across a bulk multi-file edit. This happened once already (34 files corrupted, then fixed via a cp1252-roundtrip reversal). Prefer the `Edit`/`Write` tools for content changes; if you must script a bulk text change in PowerShell, use `[System.IO.File]::ReadAllText`/`WriteAllText` with explicit `System.Text.Encoding]::UTF8` (no BOM), not `Get-Content`/`Set-Content`.
- **Section-ending lessons are checkpoints, not ordinary lessons.** Decided 2026-08-15. Every unwritten section-ending lesson (108, 138, 158, 183, 207, 230, 252, 272, 292 — Sections I–IV's terminal lessons 18/40/58/82 are already frozen and were not retrofitted) has its BRD one-line description amended to include a synthesis task built with minimal scaffolding, plus a deliberately planted mistake — a bug, a mis-classification, a bad tradeoff, matched to what that lesson actually produces — for the learner to catch before it's revealed. This lives in `Foundations.brd.md` itself, not here or in `LESSON SCHEMA.md` (the schema is shared across curricula and projects; this mechanic is specific to this series' explicit goal of building the vocabulary to catch drift in collaborator-written work, not just recall constructs). When writing one of these lessons, follow the schema as normal but treat the BRD's amended description as this lesson's actual spec.
- **Depth is honestly compressed from Lesson ~30 onward** (word counts drop from ~8,800 in Lesson 1 to ~2,000 by Lesson 58), due to legitimate scope narrowing and reuse under the Repetition Rule, plus genuine pace compression. The user reviewed this tradeoff directly and accepted it — keep building at the current depth/pace, don't attempt to re-inflate earlier lessons.

## Known-good code patterns worth reusing

- Vector-as-pair, `[a b]` with `get`, for any two-slot structure without `let` (nodes, queues, deques — Lessons 85, 87, 88).
- Vector-as-triple, `[value left right]` with `get`, for a tree node needing two subtree references (binary search trees — Lesson 92's `make-bst-node`/`bst-value`/`bst-left`/`bst-right`). Insertion rebuilds every node on the path from the root to the change and reuses every untouched subtree as-is, since there's no mutation construct to write with (Lesson 92's `bst-insert`) — expect later tree lessons (93, 97–101) to reuse this same rebuild-the-path shape.
- "Compute once, pass to a helper" to avoid recomputation without `let` (Lessons 56, 87, 89, 91).
- Mutual recursion via `(declare fn-name)` when two functions call each other (Lesson 91's `binary-search`/`search-at-mid`; reused for `sift-up`/`sift-up-at-parent` and `sift-down`/`sift-down-at-child`, Lessons 94–95).
- Array-as-complete-tree, no node references at all: position alone (via `quot`/`+`/`*` arithmetic on the index) determines parent/child, valid only because the shape is always a complete binary tree (Lesson 94's heap, `heap-parent-index`/`heap-left-index`/`heap-right-index`). Growing/shrinking the array uses `assoc` at exactly `(count v)` to append and `pop` to remove the last element (Lesson 94/96) — both real, verified Clojure vector behavior. A function returning two genuinely different results (e.g. a removed value plus the new structure) reuses the vector-as-pair convention above (Lesson 96's `heap-extract-min`).

## Why this curriculum exists

This isn't just a content-generation task. The user is building this to learn to build software themselves — the explicit goal is to reach a point where the user and Claude can collaborate on the user's own real projects effectively. Past attempts at that have broken down as projects got more complex, because the user lacked the foundational vocabulary to direct, verify, or catch drift in what Claude was building. This curriculum is the fix: rigorous, schema-following, dependency-ordered lessons the user actually works through, not just a document to skim.

**Practical consequence:** correctness and adherence to the schema matter more than raw lesson-count throughput — but that's a rigor requirement, not a reason to pause. **Do not stop mid-build to suggest resetting the session or starting a new chat based on context size or elapsed time.** That was this file's original guidance, and it was wrong: a usage-billing "session" is a rolling time window, not this conversation, and stopping to wait for the user just leaves that window open and idle — confirmed directly by the user's own usage report ("a session is supposed to be 5 hours, but you stop at every lesson or two and I am not here watching"). Keep producing lessons back-to-back, continuously, for as long as the user has you working. Update this file's status table when the user actually ends the conversation or explicitly asks for a handoff — not on your own guess about when a session has run "long enough."
