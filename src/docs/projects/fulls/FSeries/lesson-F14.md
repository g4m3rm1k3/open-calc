# Lesson F14: Vitest + React Testing Library

**What you will build**
Real, automated tests for `MemberItem`, formalizing what every prior frontend lesson has verified only by hand in a browser. The problem we're solving: backend Lesson 1 made TDD structural from the very first lesson; the frontend track has run entirely on manual verification since F3 — this lesson closes that gap, the same way F1-F13 closed conceptual gaps elsewhere.

**What you need to know first**
F4 (`MemberItem`, props). Backend Lesson 1 (the TDD-structural rule this lesson finally applies frontend-side).

---

## Concept Unit: Rendering and Querying in Tests

### The Problem

Every frontend lesson so far has ended with "run `npm run dev`, look at the browser." That doesn't scale, doesn't run in CI, and doesn't catch a regression introduced three lessons later the way backend Lesson 16's refactor was checked against its 23-test baseline.

### Introduce the concept in isolation

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Create `frontend/src/lab/Greeting.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

function Greeting({ name }: { name: string }) {
    return <p>Hello, {name}!</p>;
}

test("renders a greeting with the given name", () => {
    render(<Greeting name="Ada" />);
    expect(screen.getByText("Hello, Ada!")).toBeDefined();
});
```

Run it:

```bash
npx vitest run
```

Output:

```text
✓ src/lab/Greeting.test.tsx (1)
  ✓ renders a greeting with the given name

Test Files  1 passed (1)
     Tests  1 passed (1)
```

*What this proves:* `render(<Greeting name="Ada" />)` mounts the component into a simulated DOM (via `jsdom`, no real browser needed), and `screen.getByText(...)` searches that simulated DOM for visible text — exactly the way a real user would locate it by looking at the screen, not by reaching into the component's internal state or props directly.

### Explain the mechanism, and a deliberate testing philosophy

React Testing Library's queries (`getByText`, `getByRole`, etc.) are deliberately designed around *what a user can see and interact with* — this is a named philosophy ("test like a user"), not an accident of the API. A test that instead reached into `Greeting`'s internal implementation (checking a prop's value directly, say) would break the moment the implementation changed, even if the actual rendered output — what a real user experiences — stayed identical. Testing what's visible, not how it's built, keeps tests resilient to internal refactors, the frontend echo of backend Lesson 16's refactor being validated by *behavior* (the passing test suite), not by inspecting the new code's internals.

### Discard the throwaway example

Delete `frontend/src/lab/Greeting.test.tsx`. Write a real test for `MemberItem`.

### Project Change

* **Files affected:** Create `src/MemberItem.test.tsx`.
* **Change type:** Add.

### The New Code

```tsx
// src/MemberItem.test.tsx
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";
import MemberItem from "./MemberItem";

test("renders the member's username", () => {
    render(<MemberItem member={{ id: 1, username: "ada" }} />);
    expect(screen.getByText("ada")).toBeDefined();
});
```

### Mechanical walkthrough

1. `render(<MemberItem member={{ id: 1, username: "ada" }} />)`: (already-established `render` from isolation, real usage). Passes a plain object matching `Member`'s shape (F1) directly as a prop — no real API call, no `apiFetch`, involved at all; `MemberItem` itself never fetches anything (F4's original design), which is exactly what makes it trivially testable in isolation.
2. This is a genuine **unit test**, in backend Lesson 18's exact sense — one component, no network, no other component involved: (worth stating directly). `FeedPage`, which *does* fetch, will need a different approach — Lesson F15's subject.

### CS Lens

**Testing rendered output, not internal implementation, is the frontend instance of backend Lesson 18's black-box-testing idea (named there for `TestClient` hitting a URL, not calling a Python function directly).** Both approaches deliberately test through the same boundary a real consumer uses — an HTTP request there, visible rendered text here — rather than reaching past that boundary into internals a refactor might legitimately change without breaking anything real users would notice.

### SE Lens

**Frontend testing arrives at F14, not F1, and that ordering was deliberate — real components had to exist before there was anything meaningful to test.** This mirrors the backend's own Interlude/lesson placement discipline: introduce a concept exactly where it becomes necessary and applicable, not earlier just to front-load it.

### Commands needed

```bash
npx vitest run
```

### Run it. Show the real output.

```text
✓ src/MemberItem.test.tsx (1)
  ✓ renders the member's username

Test Files  1 passed (1)
     Tests  1 passed (1)
```

---

## Closing

**Connect the pieces**
`render` mounts a component into a simulated DOM; `screen.getByText` queries it the way a real user would look at the screen — deliberately avoiding any dependency on internal implementation details. `MemberItem`'s test needs no network mocking at all, since F4's original design kept it a pure, prop-driven component with no fetching of its own — a direct, if accidental, payoff of that earlier design decision.

**What breaks without this**
Every manual "run `npm run dev`, look at the browser" verification since F3 has been real but not repeatable — a regression introduced in a later lesson (say, F9's styling changes accidentally hiding the username) would have no automated signal at all, the same blind spot backend Lesson 18 fixed for the API.

**Exercises**
1. Write a test for `FeedPostItem` (F10), rendering a hardcoded `FeedPost` object and asserting the content and username both appear.
2. Write a test asserting `CreatePostForm`'s (F11) validation error appears after submitting with empty content — using `fireEvent` (from `@testing-library/react`) to simulate the form submission, not just a static render.

**Definition of Done**
* [x] Vitest + React Testing Library configured and running.
* [x] `MemberItem` tested via rendered output, not internal props inspection.
* [x] Can explain, without notes, why "test like a user" produces more refactor-resilient tests than testing internals.
* [x] Commit: `test: add Vitest + RTL, first component test for MemberItem`

---

## Context Snapshot (End of Lesson F14)

**Frontend File Tree:** adds `src/MemberItem.test.tsx`, Vitest config

**Frontend Terminology Ledger (additions):**
| Term | First taught | Plain meaning |
|---|---|---|
| `render`/`screen` (React Testing Library) | F14 | Mounts a component into a simulated DOM and queries it as a user would see it |
| "Test like a user" philosophy | F14 | Query visible output, not internal implementation, for refactor-resilient tests |

**Lesson Completion State:**
- Completed: F1-F14, Interludes E, F, G
- Next: F15 — Mocking the API (MSW)
