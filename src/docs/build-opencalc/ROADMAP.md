# Build OpenCalc — SE-First Curriculum

Build a real educational platform from nothing.
Software engineering is the subject. The app is the proof.

Every lesson teaches an SE concept using code that is **not** in the app —
you write it yourself. Then you see how the same principle lives in the app's
real design. By the end, you understand both why the app is built the way it is
and how to apply those decisions in your own projects.

---

## How to use this series

- Work in order. Concepts build on each other.
- Every lesson ends with something you can run and see. If it's not visible, it's not done.
- Every lesson ends with a git commit. If you haven't committed, you haven't finished.
- The code examples in lessons are **not** the app's code. Type them yourself.
  After you understand them, you will read the app's code with new eyes.

---

## Module 1 — Foundations

**SE theme:** The discipline before the code. What software engineering is,
what tools it requires, and what it means to build a system rather than a script.

| # | Lesson | SE Concept | Visible output |
|---|--------|-----------|----------------|
| 001 | [What is software engineering?](module-01-foundations/001-what-is-software-engineering.js) | Systems vs scripts; requirements vs implementation | A written design document |
| 002 | [Your environment](module-01-foundations/002-your-environment.js) | Terminal, Node, npm, VS Code | `node --version` prints a version |
| 003 | [Version control first](module-01-foundations/003-version-control-first.js) | Git: commits, history, recovery | `git log` shows your first commit |
| 004 | [What a browser actually does](module-01-foundations/004-what-a-browser-does.js) | DOM, JavaScript runtime, event loop | A raw HTML page that responds to a click |
| 005 | [JavaScript modules](module-01-foundations/005-javascript-modules.js) | Encapsulation, the module graph, import/export | Two files that communicate without global variables |
| 006 | [Package management](module-01-foundations/006-package-management.js) | Dependency graphs, semantic versioning, lock files | A working `package.json` and installed dependency |
| 007 | [Build tools and the dev server](module-01-foundations/007-build-tools.js) | Bundling, compilation, dev vs production | Vite serving your first TypeScript file at localhost |

---

## Module 2 — Components

**SE theme:** Abstraction and composition. How to decompose a UI into
self-contained units with defined contracts between them.

| # | Lesson | SE Concept | Visible output |
|---|--------|-----------|----------------|
| 008 | [The DOM manipulation problem](module-02-components/008-dom-manipulation-problem.js) | Imperative vs declarative; why frameworks exist | A DOM-manipulated UI that breaks under complexity |
| 009 | [React components](module-02-components/009-react-components.js) | Functions as abstractions; composition | A rendered component in the browser |
| 010 | [JSX — what it actually is](module-02-components/010-jsx.js) | Syntax transforms; the compile step | Component rendered via `React.createElement` — no JSX |
| 011 | [Props — the component contract](module-02-components/011-props.js) | Interfaces; data flowing in one direction | A reusable Card component driven by props |
| 012 | [Component composition](module-02-components/012-composition.js) | Composition over inheritance; the children prop | A layout built entirely from composed components |

---

## Module 3 — State

**SE theme:** Reactive systems. What state is, where it lives,
and the design discipline of keeping it minimal and purposeful.

| # | Lesson | SE Concept | Visible output |
|---|--------|-----------|----------------|
| 013 | [What is state?](module-03-state/013-what-is-state.js) | Mutable vs derived data; the finite state machine model | A counter that updates on click |
| 014 | [useState — the reactive value](module-03-state/014-usestate.js) | Immutable updates; the snapshot model | A form field that reflects its input |
| 015 | [Lifting state — where it lives](module-03-state/015-lifting-state.js) | Single source of truth; data flows down | Two sibling components sharing state through a parent |
| 016 | [useEffect — side effects](module-03-state/016-useeffect.js) | Pure functions vs side effects; synchronisation | A component that saves to localStorage on every change |
| 017 | [Derived state](module-03-state/017-derived-state.js) | DRY; computing instead of storing | A shopping cart that computes totals, never stores them |

---

## Module 4 — Application Architecture

**SE theme:** Large-scale design. How to organise code so it stays
navigable and extensible as the project grows.

| # | Lesson | SE Concept | Visible output |
|---|--------|-----------|----------------|
| 018 | [Single-page applications](module-04-architecture/018-spa.js) | Client-side vs server-side rendering; the URL as state | Navigation that changes content without a page reload |
| 019 | [React Router](module-04-architecture/019-react-router.js) | Routes as component trees; nested layout | Three pages wired to three routes |
| 020 | [Lazy loading and code splitting](module-04-architecture/020-lazy-loading.js) | The module graph; trade-off between bundle size and latency | A page that loads its code on demand, not upfront |
| 021 | [The App Shell pattern](module-04-architecture/021-app-shell.js) | Separation of concerns; persistent vs transient UI | A shell that outlives the content it hosts |
| 022 | [The registry pattern](module-04-architecture/022-registry.js) | Open/closed principle; extensibility without coupling | New labs added without touching the shell |

---

## Module 5 — TypeScript

**SE theme:** Type systems as design tools. How types make contracts
explicit and move errors from runtime to compile time.

| # | Lesson | SE Concept | Visible output |
|---|--------|-----------|----------------|
| 023 | [What type systems do](module-05-typescript/023-type-systems.js) | Static vs dynamic typing; the category of errors each catches | A TypeScript compile error that would have been a runtime crash |
| 024 | [Interfaces as contracts](module-05-typescript/024-interfaces.js) | Design by contract; the public surface of a module | A typed interface enforced at the boundary |
| 025 | [Migrating from JavaScript](module-05-typescript/025-migration.js) | Incremental adoption; the `@ts-nocheck` escape hatch | A JS file converted to TS with zero regressions |

---

## Module 6 — Testing

**SE theme:** Verification and confidence. What tests are, what they protect,
and how to write them so they fail for the right reasons.

| # | Lesson | SE Concept | Visible output |
|---|--------|-----------|----------------|
| 026 | [What tests are for](module-06-testing/026-what-tests-are-for.js) | Regression prevention; the test pyramid | One passing test in Vitest |
| 027 | [Unit tests](module-06-testing/027-unit-tests.js) | Isolation; pure functions as test targets | A suite testing a pure calculation function |
| 028 | [Component tests](module-06-testing/028-component-tests.js) | Testing behaviour, not implementation | A test that clicks a button and asserts the result |

---

## The app connection

Each lesson ends with an **App Connection** section.
It maps the SE concept just taught to its actual home in the open-calc codebase:
- Where the pattern lives
- Why the app uses this design over alternatives
- What would break if the pattern were missing

You read the app's code after you understand the concept, not before.

---

*28 lessons. One discipline. One project. Build it end to end.*
