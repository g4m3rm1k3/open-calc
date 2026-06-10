# Python Tool Database — LAB 00b — The XP Practices: A Field Guide

**Prerequisites:** Lab 00 — you know why software is hard, what XP is, and why the Agile Manifesto exists. Your virtual environment is set up.

**What this lab adds:**
- A clear understanding of each XP practice we use in this series, in your own words
- An understanding of how the practices reinforce each other — why you cannot get the full benefit from just one
- An annotated version of the lesson plan showing which practice each block exercises

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. In Lab 00 you learned that XP pushes practices "to their extreme." What does that mean — what is being taken to its extreme?
> 2. Why might writing a test before writing the code help you think more clearly about what you are building?
> 3. If you could only apply one XP practice to this project, which would you choose? Why?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lesson you will have:

1. Annotated the lesson plan (`LESSONS.md`) with which XP practice each block primarily exercises
2. Added a "which practice applies" entry to `notes.md` for each of the eight practices we use
3. A mental model of how the practices connect — the spoke-and-wheel diagram from Lab 00, now filled in with concrete meaning

---

## The Eight Practices We Use

This series uses eight of XP's twelve practices. The other four (Pair Programming, Sustainable Pace, Metaphor, On-Site Customer) either require a team or are covered under a different name in this series (Metaphor becomes Ubiquitous Language in Lab 00h).

---

## Practice 1 — Test-Driven Development

### Concept: Test-Driven Development (TDD)

**What it is:** A practice in which you write a failing test before writing any production code. The test defines exactly what the code must do. You write the minimum code to make it pass, then clean it up.

**The problem before:**

Without TDD, the sequence is: write code, run the app, check if it works, fix what's broken. The problem with this sequence:

- You test the whole app, not the specific thing you just wrote
- When something breaks, you do not know if it was always broken or if you just broke it
- Tests written after the code tend to test what the code does, not what it should do — the two are different when the code has a bug

**The solution — the three-step cycle:**

```
RED    → Write a test. It fails because the code does not exist yet.
         The failure is the point: you now have a specific, verifiable goal.

GREEN  → Write the minimum code to pass the test.
         Not elegant code. Not complete code. Just enough.

REFACTOR → Improve the code. Better names. Remove duplication. Cleaner structure.
           Run the test after every change. Still green = improvement was safe.
```

**What it hides:** The uncertainty of "is this done?" Without a test, "done" means "I think it works." With a test, "done" means "the test passes." That is the difference between a feeling and a fact.

The invariant it protects: if you did not break the test, you did not break the behavior. This is the guarantee that makes the Refactor step safe.

**Canonical example (General):**
A chef who wants to make a new dish could either: (a) cook it and taste it at the end, or (b) decide what it should taste like first, write it down, and check after each ingredient whether it is getting closer. The second chef adjusts as they go. The first chef may discover the dish is wrong only after an hour of cooking.

**Project application:**
Every service method we write in this project starts with a test. Before `ToolService.create_tool` exists, there is a test that says `assert result.name == "EM-0500"`. The test is the specification. The code is the implementation of that specification.

**You will see this again in:**
- Every professional software team using any Agile methodology
- Open source projects — most require tests with pull requests
- Job interviews: "Do you practice TDD?" is a real question
- The reason code review at good companies requires test coverage

**Watch for:** The hardest part of TDD is writing the test first when you do not yet know exactly what the code will look like. The solution: start with the interface (what does the function take in, what does it return) even if you do not know the implementation yet.

---

### REFLECT AND WRITE

Add to `notes.md`:

> "TDD helps me because..."

Then: "The hardest part of TDD will be..."

Both answers should be specific to building a tool database, not generic.

---

## Practice 2 — Refactoring

### Concept: Refactoring

**What it is:** Changing the internal structure of code without changing its observable behavior. The tests pass before the refactor. The tests still pass after. Behavior is identical. Structure is improved.

**The problem before:**

Without intentional refactoring, code accumulates complexity over time. A variable named `d` that was obvious when you wrote it is mysterious three weeks later. A function that started as five lines grows to forty-five as features are added. No individual change was wrong — the problem is the accumulated drift from clarity.

**The solution:**

The third step of every TDD cycle is Refactor. After the test is green, improve the code. The test is the safety net — it proves you have not changed the behavior.

**The classic refactoring moves (you will use all of these):**

| Move | What it does | When to use it |
|---|---|---|
| **Rename** | Give something a more accurate name | Whenever a name does not immediately reveal its purpose |
| **Extract Function** | Give a block of code its own name | When you need a comment to explain a block, that block should be a function |
| **Inline Variable** | Remove a variable that adds no clarity | When `result = x + 1; return result` is worse than `return x + 1` |
| **Remove Duplication** | Extract shared logic to one place | When you copy-paste code — that copy is a future bug |
| **Move Function** | Put a function where its data lives | When a function uses more data from class B than class A |

**What it hides:** The cost of accumulated disorder. Without refactoring, the cost of each change grows — the more cluttered the code, the harder it is to understand what to change and how. With regular refactoring, the cost of each change stays roughly constant over time.

**The invariant it protects:** If the tests pass before and after a refactor, the behavior is identical. You cannot accidentally change behavior during a refactor if you run the tests after every step.

**Canonical example (General):**
A workshop bench that never gets cleaned accumulates tools in random places. Finding the right tool takes longer every week. A craftsman who puts tools back in their place after each use never has this problem. Refactoring is putting code back in its place after making it work.

**Project application:**
After every Green step, we look at the code and apply at least one refactoring move. The lesson plan marks the Refactor step explicitly. Over the course of the series, these small improvements compound — the codebase stays readable even as it grows.

**You will see this again in:**
- Martin Fowler's book "Refactoring" — the canonical catalog of moves
- Code review feedback: "this function does two things, can we split it?"
- The reason seniors spend time "cleaning up" code that "already works"
- Every large codebase — the ones that survive are the ones where refactoring was practiced continuously

**Watch for:** Refactoring and rewriting are different things. Refactoring makes small, safe changes to existing code. Rewriting replaces code with something different. Refactoring is almost always the right choice. Rewriting is often proposed and rarely as good as hoped.

---

## Practice 3 — Simple Design

### Concept: Simple Design

**What it is:** A rule for deciding what to build: build the simplest thing that makes the current test pass, and no more. Kent Beck's four rules of simple design, in priority order:

```
1. The code passes all tests
2. The code contains no duplication
3. The code expresses its intent clearly
4. The code has the fewest possible classes and methods that satisfy rules 1–3
```

**The problem before:**

Without this rule, developers add abstractions "for flexibility" before flexibility is needed. A simple function becomes a class, becomes a factory, becomes a plugin system — none of which was required by any current test.

**The solution:**

Rule 4 is the enforcement mechanism. If a class, method, or abstraction is not required by rules 1–3, delete it. Code that is not needed is pure cost: it must be read, understood, tested, and maintained. If no test requires it, it should not exist.

**What it hides:** The temptation to be clever. Simple design forces you to resist adding structure before the structure is earned by a failing test.

**Canonical example (General):**
A carpenter building a chair makes exactly the joints needed to hold the chair together. They do not add extra joints "in case someone wants to fold the chair later" without being asked. The chair is simpler, faster to build, and just as strong for its stated purpose.

**Project application:**
Every time you are tempted to add a parameter "just in case," or a subclass "for extensibility," stop and ask: is there a failing test that requires this? If not, do not add it. The test will come — and when it does, you will have better understanding of exactly what is needed.

**You will see this again in:**
- YAGNI (Practice 4) — they are the same idea at different scales
- "Over-engineering" criticism in code review
- The "you won't need it" argument in design discussions
- The reason experienced engineers often write less code than beginners

**Watch for:** Simple design is not the same as sloppy design. A simple design is clear, tested, and clean. A sloppy design is unclear, untested, and cheap. The confusion between them is common.

---

## Practice 4 — YAGNI

### Concept: YAGNI — You Aren't Gonna Need It

**What it is:** A rule: do not build something until a test requires it. Not "it might be useful," not "we'll probably need it," not "it's only a few extra lines." Only build it when a test fails because it is missing.

**The problem before:**

```python
# "I'll add pagination now — we'll definitely need it eventually"
def get_tools(page=1, page_size=20, sort_field="name", sort_direction="asc",
              include_deleted=False, include_archived=False):
    # 60 lines of pagination, sorting, and filtering logic
    # None of which is tested
    # All of which must now be maintained
```

This took two hours to write. No test required it. It has bugs that will be discovered later, at a time when they are harder to fix because the code has grown around them.

**The solution:** Write `def get_tools(): return []`. Then write a test that fails because it returns an empty list. Then make the test pass. The test defines exactly what is needed, no more.

**What it hides:** The cost of unused code. Unused code is not free — it is read by every developer who works in the area, it is compiled, it affects naming choices nearby, and it suggests to readers that those features matter. Deleted code is the best code.

**Canonical example (General):**
A builder who installs a second bathroom "in case the family grows" adds cost, uses materials, and requires maintenance — even if the family never grows. The cost was incurred based on a guess. YAGNI: build the bathroom when someone asks for it.

**Project application:**
This series builds features in exactly the order they are needed. The Mastercam import is not built until the lessons that require it. The search filter is not built until the UI that uses it. Each lesson's "Red" step is the first time any code for that feature is written.

**You will see this again in:**
- Lean software development — YAGNI is a core principle
- "Feature flags" conversations — sometimes you build it but hide it; sometimes you just don't build it yet
- MVP (Minimum Viable Product) thinking — ship the smallest thing that validates the idea
- The reason senior engineers often push back on "while we're here, let's also..."

**Watch for:** YAGNI is not an excuse to avoid thinking ahead. Planning what to build is not the same as building it prematurely. You can have a lesson plan with 70 lessons (planning) while only building what the current lesson requires (YAGNI).

---

## Practice 5 — Small Releases

### Concept: Small Releases

**What it is:** The practice of keeping the software releasable at all times. Every lesson ends with working, runnable software. You never have a half-built state that cannot run.

**The problem before:**

A developer works for two weeks on a feature branch. At the end, they merge. The merge breaks three other things. The debugging takes three more days. The problem: the gap between "working" states was two weeks. Every bug that existed during those two weeks was invisible.

**The solution:**

Keep the gap between working states as short as possible — ideally, hours. In this series, the gap is one lesson. After every lesson, the code runs and the tests pass. You could stop after any lesson and have something complete.

**What it hides:** The integration risk. The longer code changes accumulate before integration, the larger and harder the merge. Small releases keep integration risk near zero.

**Canonical example (General):**
A scientist who publishes results frequently gets feedback frequently. A scientist who works for ten years before publishing discovers too late that a colleague already found the same thing, or that a fundamental assumption was wrong. Small, frequent releases surface problems when they are small.

**Project application:**
Look at the lesson plan. Every lesson's **Builds** section is a working artifact — something you can run, show, and use. No lesson ends with "this will work after the next lesson." If a step cannot be tested until a future step, the steps are in the wrong order.

**You will see this again in:**
- Continuous Delivery (CD) — deploying to production frequently as a discipline
- Feature flags — merge incomplete features behind a flag so the main branch always works
- Sprint demos in Scrum — every two weeks, something working is shown to stakeholders
- The reason GitHub uses pull requests — integrate frequently, in small pieces

**Watch for:** "It'll all come together at the end" is the opposite of small releases. If you find yourself writing code that cannot be tested until five steps later, stop and restructure.

---

## Practice 6 — Continuous Integration

### Concept: Continuous Integration (CI)

**What it is:** The practice of running the full test suite automatically every time code changes. In this series: run `pytest` after every meaningful change. If any test fails, fix it before moving on.

**The problem before:**

Without continuous integration, tests are run occasionally — maybe before a release. Bugs introduced three weeks ago are found three weeks later, when the context is gone and the fix is harder.

**The solution:**

Run all tests after every change. The test suite is the feedback system. A failing test is the system telling you immediately that something broke — not three weeks from now.

**What it hides:** The debugging cost of delayed feedback. A bug found immediately after it is introduced takes minutes to fix. A bug found three weeks later may take days — the developer has to reconstruct what was happening at the time of the change.

**Canonical example (General):**
A spell-checker that runs as you type finds errors immediately. A spell-checker you run once before printing finds all errors at once, some of which are now in hard-to-change places. Continuous integration is the spell-checker for logic errors.

**Project application:**
In this series, CI is manual: run `pytest` after every step. Later (Lab 2b), we configure it to run automatically. The discipline is the same regardless of automation: a failing test is a full stop, not a to-do.

**You will see this again in:**
- GitHub Actions, CircleCI, Jenkins — tools that run tests automatically on every push
- "The build is broken" — the most urgent phrase in a software team
- Pre-commit hooks — running tests before a commit is allowed
- Every professional codebase of any size

**Watch for:** CI is only as good as the test suite. If the tests do not cover real behavior, they pass even when things are broken. CI does not replace good tests — it amplifies them.

---

## Practice 7 — Collective Code Ownership

### Concept: Collective Code Ownership

**What it is:** A convention that any developer can change any part of the codebase at any time. No part of the code "belongs" to one person. No area requires permission to change.

**The problem before:**

Without collective ownership, knowledge silos form. "Ask Sarah about the import module" or "don't touch the parser, only Mike understands it." When Sarah leaves, the import module becomes a black box. When Mike is on vacation, the parser cannot be changed. The codebase becomes a collection of protected territories.

**The solution:**

The code belongs to the project, not to individuals. Good naming, good tests, and clean code make any part readable to anyone. The test suite makes any part changeable by anyone — if the tests pass, the change was safe.

**What it hides:** The dependency on specific people. Without collective ownership, projects fail when the wrong person leaves. With it, the project's health depends on practices, not personalities.

**Canonical example (General):**
A well-run kitchen where every cook knows every station. Service can continue if one cook is sick. New cooks can be trained to any station. The kitchen does not stop because the person who "owns" the grill is absent.

**Project application:**
For a solo project, this practice means: every part of the code is written as if someone else will read it tomorrow. Names reveal intent. Functions are small. Tests cover the behavior. Future-you is "someone else."

**You will see this again in:**
- Code review culture — reviewing code you did not write, changing it if needed
- Pair programming — two people share ownership of every line they write together
- Open source — anyone can contribute to any part of a project
- Onboarding — how quickly a new developer can be productive is a measure of ownership culture

**Watch for:** Collective ownership requires clean code. If the code is too complex to read, collective ownership fails in practice — nobody will touch it. The practices reinforce each other: CI protects against breaking changes, clean code makes any part readable, refactoring keeps it that way.

---

## Practice 8 — Coding Standards

### Concept: Coding Standards

**What it is:** An agreed-upon style for writing code — naming conventions, formatting rules, comment style. Everyone on the project writes code that looks the same. In Python, the standard is PEP 8.

**The problem before:**

```python
# Three different styles for the same kind of thing:
def GetToolByID(id):     # Pascal case
def get_tool_by_id(id):  # Snake case
def getToolById(id):     # Camel case
```

A reader has to hold three different conventions in their head. Every inconsistency costs a small amount of cognitive load. Accumulated across thousands of lines, inconsistency makes code hard to read.

**The solution:**

One standard, enforced consistently. In Python: **PEP 8**. Functions are `snake_case`. Classes are `PascalCase`. Constants are `ALL_CAPS`. Lines are under 88 characters. We enforce this with a formatter called `black` (introduced in Lab 00l) so it is never argued about — the tool decides.

**What it hides:** The cognitive cost of reading varied styles. Consistent code reads like a book written by one author. Inconsistent code reads like a ransom note.

**Canonical example (General):**
A hospital where every nurse documents vitals in the same format. Any doctor can read any patient's chart immediately. A hospital where each nurse invents their own format requires every doctor to decode every chart. The medical content is the same; the consistency determines how fast it can be used.

**Project application:**
From Lab 01 onward, every function, class, and variable name follows PEP 8. This is not optional or aspirational — it is consistent practice. The formatter handles spacing and line length automatically. Naming is your job.

**You will see this again in:**
- `flake8`, `ruff`, `pylint` — Python linting tools that check PEP 8
- `black` — the Python auto-formatter, used in this project
- ESLint, Prettier — the JavaScript equivalents
- Every professional Python project on GitHub

**Watch for:** Coding standards are not about aesthetics — they are about readability and collaboration. The standard that matters is the one the team uses consistently, not the one that is theoretically optimal.

---

## Part 2 — How the Practices Reinforce Each Other

The practices are not independent. They form a system where each one makes the others easier and more powerful.

```
TDD makes Refactoring safe
  (you can clean up code without fear — the tests tell you if you broke something)

Refactoring makes Simple Design achievable
  (you can start simple, then clean up — you are not locked into the first design)

Simple Design makes TDD fast
  (simple code is easy to test — complex code is hard to test, which slows TDD)

Small Releases and CI make TDD practical
  (frequent test runs catch failures immediately — the cycle stays short)

Collective Ownership and Coding Standards make all the others work at scale
  (consistent code that anyone can read and change, protected by tests that anyone can run)
```

---

> ## 🎯 Challenge: Map the Reinforcements
>
> **You know:** The eight XP practices and a brief description of how they reinforce each other.
>
> **Task:** Pick any one practice from the list. Write two sentences: one describing how this practice makes one other practice easier, and one describing what would break if this practice were removed but all others remained.
>
> **Example (do not use this one):** "Coding Standards makes Collective Code Ownership practical because consistent style means any developer can read any file without decoding someone else's personal conventions. Without it, collective ownership fails in practice — developers avoid files they did not write because reading them is too slow."
>
> **Try for at least 5 minutes before revealing the example answers.**
>
> ---
>
> <details>
> <summary>▶ Show Example Answers</summary>
>
> **TDD → Refactoring:**
> "TDD makes Refactoring safe because the tests are a specification of the expected behavior — if the tests still pass after a refactor, the behavior was not changed. Without TDD, refactoring is dangerous: you improve the code but have no automated way to verify you did not break anything, so you either refactor rarely or introduce bugs silently."
>
> **Small Releases → CI:**
> "Small Releases make CI fast because small changes have small test surface areas — a focused change means a focused set of tests fail if something breaks. Without Small Releases, CI runs after large batches of changes, and when something fails it is harder to identify which change caused it."
>
> **Key insight:** The practices form a closed loop. Weaken any one of them and the others compensate — but with more friction. Remove several and the system collapses.
>
> </details>

---

## Part 3 — Annotate the Lesson Plan

### REFLECT AND WRITE

Open `LESSONS.md`. For each block (Block 1 through Block 11), identify the XP practice it primarily exercises and write it in a comment at the top of the block.

Example:
```
## Block 2 — SQL from First Principles
<!-- Primary XP practice: Simple Design (build only what the current test requires) -->
```

You do not need to add this markup to the actual file — add it to your `notes.md` instead. One line per block.

**You should produce:** 11 lines in `notes.md`, one per block, each identifying the primary XP practice.

**Compare:** When done, check your answers against this key:

| Block | Primary Practice |
|---|---|
| 1 — Python from Zero | Simple Design + Coding Standards |
| 2 — SQL | Simple Design (build only the tables tests require) |
| 2b — Testing/TDD | TDD (the practice itself) |
| 2c — Validation | TDD (tests define the validation rules) |
| 3 — PySide6 | Small Releases (working UI after every step) |
| 4 — Polymorphic Types | Refactoring (adding types without changing behavior) |
| 5 — SQLAlchemy | Refactoring (replace raw SQL without changing tests) |
| 6 — Pydantic | TDD (tests define what valid data looks like) |
| 7 — Mastercam | Small Releases + CI |
| 8 — XML | TDD (test each element extraction) |
| 9 — Multi-DB | CI (tests run against each imported database) |
| 10 — Advanced UI | Simple Design (add features one test at a time) |
| 11 — REST API | Collective Ownership (same backend, new caller) |

---

## Final Check

| What to verify | How to verify it |
|---|---|
| You can name all eight practices from memory | Close this lab, write them in `notes.md` from memory |
| You can describe TDD in one sentence | Without looking: write it now |
| You can explain why the practices reinforce each other | Pick any two and explain the link in one sentence |
| `notes.md` has an entry for each practice | Open `notes.md` and confirm |
| Block annotations are in `notes.md` | Open `notes.md` and confirm |

---

## Quick Check Answers

**1. In Lab 00 you learned that XP pushes practices "to their extreme." What is being taken to its extreme?**

Each individual practice is taken from "occasionally good" to "always, without exception." Testing is not done occasionally at the end — it is done before every line of production code. Integration is not done weekly — it is done after every small change. Code review is not done by specialists — it is continuous through pair programming or frequent review. The "extreme" is in the frequency and discipline of application, not in the radicalism of the practices themselves.

**2. Why might writing a test before writing the code help you think more clearly about what you are building?**

Writing the test first forces you to define the interface before you get lost in the implementation. You must answer: what does this function take in? What does it return? What is the exact expected output for this specific input? These questions are much harder to answer clearly once you are inside the implementation details. The test is a specification — and specifications written before implementation tend to be cleaner than ones written after.

**3. If you could only apply one XP practice to this project, which would you choose? Why?**

There is no single right answer — but TDD is the most defensible choice. TDD enables Refactoring (tests make it safe), enables Simple Design (tests define what is needed), and enables Collective Ownership (tests let anyone change code confidently). If you can only have one spoke in the wheel, make it the one that enables the most others.

---

*Lab 00b complete. Next: Lab 00c — Red-Green-Refactor: The Heartbeat.*
