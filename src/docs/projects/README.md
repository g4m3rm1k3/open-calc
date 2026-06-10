# Project-Based Curriculum

## What This Is

A curriculum that teaches software engineering, computer science, and mathematics
through building real, working software. Nothing is implicit. Every concept —
whether it is a design pattern, an algorithm, or a piece of maths — is named,
explained, and taught directly.

## Lesson Standard

Every lesson in this curriculum must meet the [Lesson Contract](../LESSON_CONTRACT.md).
It defines what teaching means here — two lenses on every code block, smallest runnable
units, explicit connections, maths derived not assumed.

## How It Works

Every lesson produces working software. You do not build a parser before you can
see it work. You do not learn CSS variables after you have already written a hundred
hardcoded colours. You do not add tests after the fact. The right approach is taught
from the first lesson and applied consistently throughout.

Each lesson explicitly covers:

- **The software engineering being practised** — naming, design patterns, TDD,
  agile delivery, CSS architecture, API design, separation of concerns
- **The computer science being applied** — data structures, algorithms, state machines,
  recursion, type systems, evaluation strategies
- **The mathematics involved** — wherever the code touches maths, the maths is taught

## Projects

### 1. OpenMAT — Interpreter + Visualiser
**Folder:** `openmat/`

Build a working language interpreter and a visualiser that renders the maths it
computes. You will write code, run it in a console you built, and watch a triangle
transform on screen because of maths you wrote and understand.

---

### 2. The Calculator — Graphing, Tables, and Solvers
**Folder:** `calculator/` — [Full lesson plan](calculator/README.md)

Build a graphing calculator inspired by the TI-84 and others. Not a clone — an MVP
that grows one vertical slice at a time. Each slice is something you can use immediately.

The calculator teaches a different set of problems than the interpreter. The interpreter
taught you how a language pipeline works. The calculator teaches you how a stateful
interactive application works — input handling, persistent state, rendering a
coordinate plane, evaluating a function across a domain, and finding roots numerically.

**MVPs in order:**

1. A display that shows a number — the simplest possible calculator
2. Arithmetic — add, subtract, multiply, divide
3. A history — every calculation is stored and shown
4. Variables — store a value, recall it by name
5. Functions — define `f(x)`, evaluate at a point
6. Graphing — plot `f(x)` across a domain on a canvas
7. Tables — show `x` and `f(x)` side by side for a range of values
8. Multiple graphs — plot `f(x)` and `g(x)` together, find intersections visually
9. Solvers — find the root of `f(x) = 0` numerically

Each MVP is a lesson. Each lesson ends with a calculator you can use.

**Software engineering taught:**
State management, event-driven UI, component boundaries, CSS architecture,
TDD, agile delivery, separation of concerns between input, evaluation, and rendering.

**Computer science taught:**
Expression parsing (builds on OpenMAT), coordinate space mapping, function sampling,
floating point arithmetic, numerical methods, data structures for history and tables.

**Mathematics taught:**
Functions and their graphs, domain and range, roots and intersections, Newton's method
for root finding, derivatives as the basis of Newton's method, trigonometric and
polynomial functions.

---

### 3. CAD/CAM — 3D Modelling, Toolpaths, and G-code
**Folder:** `cam/` — [Full lesson plan](cam/README.md)

Build a browser-based CAD/CAM application: draw constrained 2D sketches, extrude
them into 3D solids, generate toolpaths, and export G-code. Three.js for 3D rendering,
React for the UI, Python backend for geometry computation.

Three.js for 3D rendering, React for the UI, Python backend for geometry computation.
Every concept needed is taught in the lesson that needs it.
