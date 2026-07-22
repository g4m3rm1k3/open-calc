# Your SWE Curriculum: Gap-Filling, Dependency-Ordered

## How this is built

Not organized by "course topics" — organized by **dependency tree**. Each phase unlocks the next. Within a phase, concepts are taught *across* your languages at once, because seeing the same idea in Python, TypeScript, C#, and C++ back-to-back is what makes it stick — and it's exactly the overlap you said you like.

Rule for every topic below: if you can already explain it and use it correctly under pressure, skip it — don't re-sit it. If you can *use* it but couldn't explain *why* it works that way, that's a real gap even if it feels "basic." That second category is where courses have been failing you.

Pace note: at 20+ hrs/week this is realistically a 9-12 month plan to reach "dangerous with an AI agent and correct," not a bootcamp-in-6-weeks plan. Systems knowledge doesn't compress well — that's fine, you have the runway.

---

## Phase 0 — Diagnostic (1 week)

Before building anything, find your *actual* gaps instead of guessing. For each item, self-rate: **Know it / Can use it but can't explain it / Don't know it.**

- Big-O of a list append, dict lookup, list search, sort
- Stack vs heap; what a reference actually is in Python vs a pointer in C++
- What "static typing" buys you that Python's dynamic typing doesn't
- Why a hash map is O(1) average — what's actually happening inside
- What a race condition is and why it can't happen in single-threaded Python but can in a multi-threaded server
- Difference between composition and inheritance, and when each causes pain later
- What a transaction is in a database and why you'd want one
- What actually happens between typing a URL and a page rendering

Anything in the middle bucket ("can use it but can't explain it") is your real curriculum. Everything below assumes you'll do this check honestly rather than skip to the interesting parts.

---

## Phase 1 — The Concepts Every Language Was Hiding From You (6-8 weeks)

This is the part your 5 Python courses and JS courses never covered, because it's not language syntax — it's *computer science*, and it transfers to every language after this.

**1. How a computer actually runs your code**
Stack vs heap, call stack, what a variable *is* in memory, value vs reference semantics. Do this once in Python (references), then immediately in C++ (pointers) — seeing memory explicitly is what makes Python's hidden version make sense in hindsight.

**2. Data structures, for real this time**
Not "here's a list, here's a dict" — but: why each one has the runtime cost it has, and how to choose. Arrays, linked lists, hash maps, stacks/queues, trees, graphs. Implement a hash map from scratch once (in Python, it's fine) — that single exercise closes more gaps than a whole course on "using" data structures.

**3. Big-O, applied to your own old code**
Take one of your hacky scripts (the file-line-parsing one is perfect) and analyze its actual complexity. This is more useful than any textbook exercise because you already know *why* you wrote it that way.

**4. Type systems**
Why types exist, what they catch at compile time vs runtime, static vs dynamic vs gradual typing. Path: Python type hints + mypy → TypeScript (structural typing) → C#/Java (nominal typing, generics). This directly answers "how do I use types," which you flagged as a real gap.

**5. Software design fundamentals**
Coupling/cohesion, single responsibility, composition over inheritance, when abstraction helps vs when it's over-engineering. This is what turns "working but ugly" into "working and maintainable" — and it's the thing that lets you evaluate whether AI-generated code is actually well-structured, not just "looks right."

**6. Correctness and testing**
Unit tests, why "it ran once and worked" ≠ correct, basic TDD. This is your main defense against the exact failure mode you described — accepting AI output that's wrong in a way you can't see yet.

**7. Debugging as a method, not a vibe**
Binary search debugging, reading stack traces properly, forming a hypothesis before changing code.

*Checkpoint project:* Rewrite one of your old hacked-together scripts (the XML→Excel one is a good candidate) with proper types, a couple of unit tests, and a design you can explain out loud.

---

## Phase 2 — Language Breadth on a Solid Base (8-10 weeks)

Now the languages you asked for, but ordered by conceptual distance from what you already know.

1. **Python, deepened** — type hints everywhere, decorators, context managers, async/await, packaging. You know Python's surface; this is Python's actual design.
2. **TypeScript** (built on your JS) — same static-typing concepts from Phase 1, now in a language you've already touched. This is the shortest jump.
3. **C#** — true OOP: interfaces, generics, access modifiers, exceptions-as-control-flow done properly, garbage-collected like Python/JS but statically typed and compiled like nothing you've used yet.
4. **Java** — deliberately right after C#. They're similar enough that this phase is fast, but the differences (JVM ecosystem, checked exceptions, build tooling) sharpen your sense of "what's language-specific vs what's a real CS concept."
5. **C++** — the payoff phase. Manual memory management, RAII, pointers/references for real. Then: call C++ from Python (pybind11 or ctypes) — this closes the loop you described ("something that starts with Python... adds C++ in because there's a way you can run it with Python") and teaches you *why* people drop to C++ for performance-critical pieces instead of treating it as a totally separate skill.

*Checkpoint project:* A small computational task (e.g., image processing or a parsing task) written first in pure Python, then with the hot path rewritten in C++ and called from Python — so you feel the performance difference and the FFI mechanics firsthand, not just read about them.

---

## Phase 3 — The System You Actually Want to Build (10-12 weeks)

This is where "beautiful UI, multiuser auth, AI features, scalable" gets built, piece by piece, on top of Phases 1-2.

- **Frontend:** React + TypeScript — component architecture, state management, why hooks work the way they do (ties back to closures from Phase 1/2).
- **Backend/API:** REST (and a GraphQL detour so you can compare), request lifecycle, middleware.
- **Auth:** sessions vs JWTs, OAuth2 flow, password hashing — done properly once, not copy-pasted.
- **Databases:** relational modeling, indexes (ties directly back to your Big-O work), transactions, then a NoSQL comparison so you know when each fits.
- **Scalability:** caching, queues, horizontal scaling, what "stateless service" actually buys you — enough to reason about it, not to run a datacenter.
- **Deployment basics:** containers, CI/CD, one real cloud deploy.

*Checkpoint project:* One real full-stack app — multiuser, authenticated, deployed — that becomes your portfolio piece and your test bed for Phase 4.

---

## Phase 4 — Working *With* AI Instead of Trusting It (ongoing from here on)

Once Phases 1-3 give you the vocabulary, change how you use AI tools:

- Ask the agent to explain its approach *before* accepting a change — if you can't evaluate the explanation, that's a flag to go learn the missing piece, not to accept anyway.
- Periodically review AI-generated code against Phase 1's design checklist (coupling, types, testability) yourself, without asking the AI if it's good.
- Deliberately have it generate something wrong sometimes (bad complexity, bad design) so you practice catching it.

---

## On the Gemini drift problem

Generating lessons fresh each time is why concepts keep vanishing — the model has no persistent source of truth. Fix: treat *this document* as the fixed syllabus. When you want a lesson generated, feed the specific bullet point + its "why this matters" note as the prompt, not "give me the next lesson." That constrains drift because the model is elaborating a fixed unit instead of reinventing the curriculum each time.
