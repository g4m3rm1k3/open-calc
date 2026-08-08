# Frontend Lesson 1 — Project Setup and the Signup Form, Test-First

**Track:** Developer Social Network — Slice 1 (Frontend)
**Depth:** Heavy — first frontend code in the redesigned project, so every syntax pattern gets explained the moment it appears, nothing used silently
**Goal:** A working signup form that calls Backend Lesson 1's `/users` endpoint, built test-first with Vitest and React Testing Library, with JSX, TypeScript, and React's core patterns explained from zero rather than assumed.

---

## 0. Why this lesson explains syntax the earlier attempt didn't

The earlier version of this project used JSX, arrow functions, destructuring, and hooks without ever stopping to explain them — code that might work, copied and pattern-matched rather than understood. This lesson explains every one of those the first time it appears. If something here feels over-explained, that's intentional and temporary — by a few lessons in, this vocabulary will be as automatic as `for` loops are in Python.

---

## 1. Project setup

```
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

`--template react-ts` scaffolds a React project pre-configured for TypeScript — `.tsx` files instead of plain `.js`, meaning JSX (Section 3) combined with TypeScript's type system (Section 2) in the same file.

**Vitest config** — add to `vite.config.ts`:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
```

`environment: 'jsdom'` makes Vitest simulate a browser DOM in a Node.js process, since tests need something to render components *into*, even without a real browser open. `globals: true` lets you use `test()`, `expect()`, etc. without importing them in every file — a convenience, not a requirement.

---

## 2. TypeScript essentials — the type system, explained

```typescript
let username: string = "alice";
let age: number = 28;
let isActive: boolean = true;
```

Same idea as Python's type hints (Backend Lesson 1, Section 2), but TypeScript's version is actually **enforced at compile time** — code that violates a type annotation won't even compile, which is a real, stronger guarantee than Python's hints-are-just-documentation default.

**Interfaces** — defining the shape of an object:

```typescript
interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

const exampleUser: User = {
  id: 1,
  username: "alice",
  email: "alice@example.com",
  createdAt: "2026-01-01T00:00:00Z"
};
```

This is TypeScript's version of Backend Lesson 1's `UserResponse` Pydantic schema — a named, checkable shape for a piece of data. Any object claimed to be a `User` must have exactly these fields, with these types, or TypeScript's compiler will flag it before the code ever runs.

**Function types:**

```typescript
function addNumbers(a: number, b: number): number {
  return a + b;
}
```

Same reading order as Python: parameter types, then the return type after the arrow-like `:` (not to be confused with JavaScript's *actual* arrow functions, covered next).

---

## 3. JSX — explained from zero

JSX lets you write what looks like HTML directly inside JavaScript/TypeScript code:

```typescript
function Greeting() {
  return <h1>Hello, world!</h1>;
}
```

**This is not a string, and it's not real HTML.** JSX is syntax that gets *compiled* into regular function calls — `<h1>Hello, world!</h1>` becomes something like `React.createElement('h1', null, 'Hello, world!')` behind the scenes. You're writing what looks like markup, but you're actually building a description of UI structure that React turns into real DOM elements.

**Embedding real JavaScript/TypeScript values inside JSX** — curly braces `{}`:

```typescript
function Greeting() {
  const name = "Alice";
  return <h1>Hello, {name}!</h1>;   // renders: Hello, Alice!
}
```

Anything inside `{}` in JSX is evaluated as a real expression — a variable, a function call, arithmetic, anything — the exact same "embed real code inside" idea as Python's f-strings (`f"Hello, {name}!"`), just with `{}` instead of an `f`-prefixed string.

**A component is just a function that returns JSX:**

```typescript
function WelcomeMessage() {
  return (
    <div>
      <h1>Welcome!</h1>
      <p>Glad you're here.</p>
    </div>
  );
}
```

JSX requires exactly **one** top-level returned element (here, the outer `<div>` wraps both `<h1>` and `<p>`) — this is a real, easy-to-hit rule worth knowing before it produces a confusing compile error.

---

## 4. Arrow functions, destructuring, template literals — explained

**Arrow functions** — an alternative syntax for writing functions, used constantly in React code:

```typescript
// Traditional function
function double(x: number): number {
  return x * 2;
}

// Arrow function - same thing, different syntax
const double = (x: number): number => {
  return x * 2;
};

// Arrow function, shortened further - one expression, implicit return
const double = (x: number): number => x * 2;
```

All three do the same thing. The arrow (`=>`) syntax is used heavily in React because it's compact and (for reasons beyond this lesson's scope — related to how `this` binds) tends to behave more predictably inside components and callbacks.

**Destructuring** — pulling values out of an object or array directly into named variables, in one step:

```typescript
const user = { username: "alice", email: "alice@example.com" };

// Without destructuring
const username = user.username;
const email = user.email;

// With destructuring - same result, one line
const { username, email } = user;
```

This is genuinely the same *idea* as Python's tuple unpacking (`smallest, largest = get_min_and_max(...)`, from the earlier Python-idioms primer), just applied to named object properties instead of positional tuple values.

**Template literals** — JavaScript/TypeScript's version of an f-string, using backticks:

```typescript
const name = "Alice";
const greeting = `Hello, ${name}!`;   // "Hello, Alice!"
```

Backtick-quoted strings, with `${expression}` for embedding values — direct equivalent of Python's `f"Hello, {name}!"`.

---

## 5. React state — `useState`, explained

A component needs to "remember" things that change over time (like what a user has typed into a form field) and re-render when they change. `useState` is React's tool for this:

```typescript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}
```

`useState(0)` sets up a piece of state starting at `0`, and returns an array with exactly two things: the **current value** (`count`) and a **function to update it** (`setCount`). The `const [count, setCount] = ...` line is array destructuring (Section 4) — pulling those two array elements into two named variables in one step.

**Why you can't just do `count = count + 1` directly:** React needs to *know* when state changes, so it knows to re-render the component with the new value. Calling `setCount(...)` is what triggers that — directly reassigning a plain variable wouldn't tell React anything happened, and the UI simply wouldn't update.

`onClick={() => setCount(count + 1)}` — an arrow function (Section 4) with no parameters, defined right inline, that runs `setCount(count + 1)` whenever the button is clicked. Defining it inline like this, instead of as a separate named function, is extremely common in small React event handlers.

---

## 6. Controlled form inputs

A "controlled" input is one whose displayed value is driven entirely by React state, rather than the browser's own internal input state:

```typescript
function UsernameField() {
  const [username, setUsername] = useState('');

  return (
    <input
      type="text"
      value={username}
      onChange={(event) => setUsername(event.target.value)}
    />
  );
}
```

- **`value={username}`** — the input always displays exactly whatever `username` currently holds in state.
- **`onChange={(event) => setUsername(event.target.value)}`** — every keystroke fires this, reading the input's *new* value (`event.target.value`) and updating state to match.

This creates a deliberate, tight loop: keystroke → state update → re-render → input displays the updated state. It feels like overkill for a single text field, but it's what makes React able to validate, transform, or react to input changes in real time, and to reset or pre-fill forms programmatically — things much harder to do cleanly with the browser just managing input state on its own.

---

## 7. Test-first — writing the failing test before the component exists

```typescript
// src/components/SignupForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SignupForm } from './SignupForm';

describe('SignupForm', () => {
  it('renders username, email, and password fields', () => {
    render(<SignupForm onSubmitSuccess={() => {}} />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls the API with entered values when submitted', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 1, username: 'alice', email: 'alice@example.com' })
    });
    global.fetch = mockFetch;

    const onSubmitSuccess = vi.fn();
    const user = userEvent.setup();
    render(<SignupForm onSubmitSuccess={onSubmitSuccess} />);

    await user.type(screen.getByLabelText(/username/i), 'alice');
    await user.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await user.type(screen.getByLabelText(/password/i), 'supersecret123');
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/users',
      expect.objectContaining({ method: 'POST' })
    );
    expect(onSubmitSuccess).toHaveBeenCalled();
  });
});
```

**Run this now** (`npx vitest run`) — it fails, because `SignupForm` doesn't exist yet. This is the frontend's "Red" step, same principle as Backend Lesson 1, Section 7.

Reading the new pieces:
- **`render(<SignupForm ... />)`** — React Testing Library's way of mounting a component into the simulated DOM (Section 1's `jsdom`) so it can be inspected.
- **`screen.getByLabelText(/username/i)`** — finds an input by its associated `<label>` text, using a regular expression (`/username/i`, the `i` meaning case-insensitive) rather than an exact string match — a deliberately loose match, since exact label wording shouldn't be what breaks a test (Testing interlude, Section 3's "usually skip" guidance, applied here).
- **`vi.fn().mockResolvedValue(...)`** — creates a fake version of `fetch` that doesn't make a real network call, and immediately resolves with a fake response — this is a **mock**, letting the test check "did the component try to call the API correctly" without needing a real backend running during the test.
- **`user.type(...)` / `user.click(...)`** — `@testing-library/user-event` simulates real user interactions (typing character by character, clicking) rather than directly manipulating state, which more closely mirrors how an actual person uses the form.

---

## 8. Green — the minimum component to make the tests pass

```typescript
// src/components/SignupForm.tsx
import { useState } from 'react';

interface SignupFormProps {
  onSubmitSuccess: () => void;
}

export function SignupForm({ onSubmitSuccess }: SignupFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const response = await fetch('http://localhost:8000/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });

    if (response.ok) {
      onSubmitSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="username">Username</label>
      <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />

      <label htmlFor="email">Email</label>
      <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

      <label htmlFor="password">Password</label>
      <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <button type="submit">Sign Up</button>
    </form>
  );
}
```

Reading the new pieces:
- **`interface SignupFormProps`** — this component takes one **prop** (a value passed in from whatever renders it), `onSubmitSuccess`, typed as a function that takes no arguments and returns nothing (`() => void`). This is TypeScript enforcing what a component expects to receive — the direct analog of a Python function's parameter type hints.
- **`{ onSubmitSuccess }: SignupFormProps`** — destructuring (Section 4) the props object directly in the function's parameter list, immediately pulling out `onSubmitSuccess` as a named variable.
- **`event.preventDefault()`** — stops the browser's default behavior for a form submission (which would normally reload the whole page) — necessary here since React is handling the submission itself via `fetch`.
- **`htmlFor="username"` paired with `id="username"`** — this is what makes `screen.getByLabelText(/username/i)` in the test able to find the right input; `htmlFor` is JSX's name for HTML's `for` attribute (renamed because `for` is a reserved word in JavaScript).

**Run the tests again** — they should pass now. Green.

---

## 9. Refactor

One real improvement worth making now, with tests as a safety net: the three `useState` calls and three near-identical `<label>`/`<input>` pairs are repetitive. A natural refactor is extracting a small reusable `FormField` component — left as Challenge 3 below rather than done here, since working through that extraction yourself, with the existing tests confirming you haven't broken anything, is more valuable than reading it pre-done.

---

## 10. Challenges before Slice 2

1. Write a new failing test first: verify that submitting the form with an empty username shows a validation message and does *not* call `fetch`. Then implement the minimum change to make it pass.
2. The current `handleSubmit` doesn't handle the case where the backend returns an error (e.g., Backend Lesson 1's duplicate-username `400` response). Write a test for this scenario first, then implement error display.
3. Extract the repeated label/input pattern into a small `FormField` component (props: `id`, `label`, `type`, `value`, `onChange`), refactor `SignupForm` to use it three times, and confirm all existing tests still pass without modification — the whole point of the tests being there.
4. In your own words, explain why `mockFetch` is used in the test instead of letting the test hit the real backend from Backend Lesson 1 — tie your answer back to the Testing interlude's unit-vs-integration distinction (Section 2 there). Is this test a unit test or something closer to an integration test, and why?

---

## What's next

Slice 2 adds authentication — a login endpoint and JWTs on the backend, then a login form and protected-route pattern on the frontend, continuing the same test-first, alternating rhythm. Say the word when you're ready.
