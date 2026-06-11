# PyX — Lesson Plan v2 (Agile, Beginner-First)

**Status:** Plan only. No lessons written yet.
**Purpose:** This document survives context loss. Start every new conversation by reading it.

---

## Context Reset Protocol

When context runs out mid-lesson, the next conversation must:
1. Read this file first
2. Read the BRD: `pyx-brd-and-lesson-plan.md`
3. Read whichever lesson was being written (the latest LAB_XX file in this folder)
4. Continue from the exact "Definition of done" checkpoint that was not yet reached

Do NOT re-derive architecture. Do NOT re-read other tutorial labs. The BRD + this plan + the in-progress lesson is enough.

---

## What Changed From BRD v1

### Assumptions corrected

The BRD was written assuming prior lexer/parser experience. That experience does not exist. Every concept — finite state machines, recursive descent, visitor pattern, AST, tokens, closures — must be taught as if it is brand new at first appearance. No "you have done this before" language.

### TypeScript for the runtime

Phases 4 and 5 (the JavaScript runtime: virtual DOM, reconciler, hooks) are written in **TypeScript**, not plain JavaScript. Reason: the user's primary goal is to master TypeScript as a path to C# and Java. The runtime is the longest phase and the best place to build that fluency. The compiler (Phases 1-3) remains Python.

This means `h.ts`, `render.ts`, `reconciler.ts`, `hooks.ts`, `index.ts` — all TypeScript. Vite handles TypeScript natively; no build change required.

### FastAPI scope

FastAPI serves the compiled JS as static files. This is 5 lines of Python and is not a lesson. Lesson 27 is "wire the backend" — the student copies the FastAPI static-file snippet and it works. No FastAPI deep-dive.

### Agile cadence

Write one lesson at a time. Each lesson is complete (written, coherent, definition-of-done achievable) before starting the next. Do not pre-write all 30.

---

## Lesson Format Contract

Every lesson is a markdown file: `LAB_XX_Short_Name.md`

Required structure (in order):
1. **Header line:** `# PyX — LAB XX — Lesson Title`
2. **Prerequisites:** one sentence. What must already work.
3. **What this lab adds:** 3-5 bullet points. Visible outcomes.
4. **What You Will Build:** ASCII sketch or description of the end state.
5. **Quick Check:** 2-3 questions the student tries to answer before reading. Answered at the end.
6. **Concept blocks** (before each Step that needs them):
   - `### Concept: What Is X?` with **What it is**, **Why it matters**, **Watch for**
7. **Numbered Steps:** `## Step N — Do The Thing`
8. **SAVE AND TRY** after each step: what to run, expected output, what to look for, how to verify
9. **Challenges:** thinking or coding, with `<details><summary>Show Answer</summary>` spoiler
10. **Final Check:** table — feature vs how to verify
11. **Your Complete Files:** full file contents at end-of-lesson state
12. **Quick Check Answers**
13. **End line:** `*End of LAB XX.*` followed by one sentence teaser for next lab

**Teaching rule:** Every term in bold at first use. Every concept has a "What it is" line before the student uses it. No concept appears in Step code before its Concept block.

---

## Phase and Lesson Status

### Phase 1 — The Pre-Processor (Python)

| Lab | Title | Status |
|-----|-------|--------|
| 01 | What a Compiler Is | DONE |
| 02 | Lexing Element Syntax | DONE |
| 03 | Parsing Element Trees | DONE |
| 04 | Generating h() Calls | DONE |
| 05 | The Complete Pre-Processor | DONE |

### Phase 2 — The AST and Transformer (Python)

| Lab | Title | Status |
|-----|-------|--------|
| 06 | Python's AST Module | DONE |
| 07 | The PyX IR | DONE |
| 08 | Transforming Functions and Variables | DONE |
| 09 | Transforming Control Flow | DONE |
| 10 | Imports and the Complete Transformer | DONE |
| 11 | Error Handling in the Transformer | DONE |

### Phase 3 — The Code Generator (Python)

| Lab | Title | Status |
|-----|-------|--------|
| 12 | Generating JSX from the IR | DONE |
| 13 | The Full Pipeline End-to-End | DONE |
| 14 | Running the Output with Vite | DONE |
| 15 | Source Maps | DONE |

### Phase 4 — The Runtime: Virtual DOM (TypeScript)

| Lab | Title | Status |
|-----|-------|--------|
| 16 | The h() Factory | DONE |
| 17 | Rendering to the Real DOM | DONE |
| 18 | Rendering Components | DONE |
| 19 | The Component Tree | DONE |

### Phase 5 — Reconciliation and Hooks (TypeScript)

| Lab | Title | Status |
|-----|-------|--------|
| 20 | The Reconciler: Diffing Two Trees | DONE |
| 21 | Applying the Diff to the DOM | DONE |
| 22 | useState | DONE |
| 23 | useEffect | DONE |
| 24 | Keys and List Rendering | DONE |
| 25 | Phase 5 Review: Counter End-to-End | DONE |

### Phase 6 — Full Stack and Polish

| Lab | Title | Status |
|-----|-------|--------|
| 26 | A PyX To-Do App | DONE |
| 27 | Full Stack: PyX Frontend + FastAPI Backend | DONE |
| 28 | The Vite Plugin | DONE |
| 29 | Error Messages as a Product | DONE |
| 30 | What You Built and What Comes Next | DONE |

---

## First-Appearance Obligation List

These concepts have never been taught before. The first lab that uses each one must include a full Concept block for it.

| Concept | First used in | Taught? |
|---------|--------------|---------|
| What a compiler is | Lab 01 | YES |
| Pipeline pattern | Lab 01 | YES |
| pyproject.toml / pip install -e | Lab 01 | YES |
| argparse / sys.argv | Lab 01 | YES |
| context manager (with/open) | Lab 01 | YES |
| Tokens and lexing | Lab 02 | YES |
| Finite state machine | Lab 02 | YES |
| Python Enum | Lab 02 | YES |
| Recursive descent parsing | Lab 03 | YES |
| Parse tree vs AST | Lab 03 | YES |
| Tree construction | Lab 03 | YES |
| Visitor pattern | Lab 04 | YES |
| Code generation as tree serialisation | Lab 04 | YES |
| Python ast module | Lab 06 | YES |
| Abstract syntax tree (abstract = no whitespace) | Lab 06 | YES |
| Python dataclasses | Lab 07 | YES |
| Intermediate representation | Lab 07 | YES |
| AST transformation / NodeTransformer | Lab 08 | YES |
| Impedance mismatch between languages | Lab 09 | YES |
| Source location tracking (lineno, col_offset) | Lab 11 | YES |
| Error accumulation | Lab 11 | YES |
| Pretty printing / indentation | Lab 12 | YES |
| Source maps and Base64 VLQ | Lab 15 | YES |
| TypeScript basics (types, interfaces, tsc) | Lab 16 | YES |
| Virtual DOM | Lab 16 | YES |
| DOM manipulation (createElement, appendChild) | Lab 17 | YES |
| Higher-order functions | Lab 18 | YES |
| O(n) tree diffing heuristics | Lab 20 | YES |
| Closures | Lab 22 | YES |
| Hook slot array | Lab 22 | YES |
| Side effects in pure rendering | Lab 23 | YES |
| Dependency arrays and memoisation | Lab 23 | YES |
| Keyed reconciliation | Lab 24 | YES |

---

## TypeScript Ramp Plan (Phases 4-5)

Lab 16 is the first TypeScript lesson. Introduce the minimum needed to build `h.ts`:
- What TypeScript is (typed JavaScript, compiles to JS)
- Type annotations on function parameters and return values
- Interfaces for object shapes (the VNode interface)
- `tsc` and how Vite handles compilation automatically

Do not front-load TypeScript theory. Teach each feature exactly when it is needed:
- Lab 16: basic types, interfaces, function signatures
- Lab 17: `Document` and `HTMLElement` types from the DOM lib
- Lab 18: function types (`type ComponentFn = (props: Props) => VNode`)
- Lab 20: generics if needed for the diff structure
- Lab 22: closures in TypeScript (same as JS, just typed)

---

## Key Design Decisions (do not re-debate these)

- **Option D chosen** (pre-processor + ast.parse). Documented in BRD section 1.3.
- **JSX output** (pyxc emits JSX, Vite compiles to JS). Documented in BRD section 1.4.
- **FastAPI = static file server only**. 5 lines. Not a lesson topic.
- **Runtime in TypeScript** (new decision, not in BRD). Reason: TypeScript mastery goal.
- **Lesson order is correct**. Do not reorder. The BRD phasing is sound.
- **One lesson at a time**. Do not write ahead.
