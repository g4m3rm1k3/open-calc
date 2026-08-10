# Concept: JSX

**What you'll understand by the end:** what JSX actually is underneath its HTML-like appearance, and how embedding real JavaScript expressions inside it works.

**Prerequisites:** none (a general concept; the isolated example uses React, the framework that popularized JSX, as a concrete implementation).

## Setup

A React project with JSX compilation configured (e.g. via `npm create vite@latest my-app -- --template react-ts`, which sets this up automatically) — see `vite-plugin-system.md` for what actually enables this.

## The Problem

Describing a piece of UI — a button containing a dynamic count, nested inside a container — directly as nested function calls (`createElement("button", { onClick }, "Clicked ", count, " times")`) is technically complete but genuinely hard to read once nesting goes more than one or two levels deep; something closer to HTML's own familiar, visually-nested syntax would be far more readable for describing UI structure specifically.

## The Isolated Example

JSX, as written:
```tsx
const count = 3;
const element = <button id="counter">Clicked {count} times</button>;
```

**What it actually compiles to** (real, inspectable output from `@vitejs/plugin-react`'s transform):
```javascript
const count = 3;
const element = _jsx("button", { id: "counter", children: ["Clicked ", count, " times"] });
```

**What this proves:** the angle-bracket syntax is not itself understood by JavaScript at all — it's compiled, before a browser ever sees it, into an ordinary function call (`_jsx(...)`, or historically `React.createElement(...)`) that builds a plain JavaScript object describing the desired element. `<button id="counter">` never becomes a real DOM element directly; it becomes a description React later decides how to turn into one.

## Mechanical Walkthrough

- JSX looks like HTML but is not HTML — it's syntax that a build tool's compiler (here, `@vitejs/plugin-react`, see `vite-plugin-system.md`) transforms into plain JavaScript function calls before anything runs in a browser.
- `{...}` inside JSX embeds a real JavaScript **expression**'s value directly into the output — `{count}` inserts whatever `count` currently evaluates to; this can be any valid expression (a variable, a function call, a ternary — see `ternary-conditional-operator.md` — arithmetic), never a full statement (an `if` block, a `for` loop cannot appear directly inside `{}`).
- Attributes (`id="counter"`) become properties on the resulting description object, exactly like HTML attributes, though some names differ from HTML's own (`class` becomes `className`, `onclick` becomes `onClick`, matching JavaScript's own naming conventions rather than HTML's).
- A JSX expression's result is an ordinary JavaScript value (an object describing the desired UI) that can be stored in a variable, passed as a function argument, or returned from a function — it is not, itself, a rendering action; nothing appears on screen purely from evaluating a JSX expression, only from that description eventually reaching a real rendering call (see `react-dom-createroot-mounting.md`).

## CS Lens

JSX is **syntactic sugar** over ordinary function calls — no new capability is added to the language; a more visually structured, HTML-like way of writing calls that were always expressible as plain JavaScript is added instead. This is the identical relationship `typescript-async-await.md` describes between `async`/`await` and promise chains — a genuinely new *syntax* built entirely on top of an existing, unchanged underlying mechanism.

Also recognized in: any templating language that compiles to function calls or string concatenation under the hood (Vue's own template syntax, similarly compiled ahead of time), and, more distantly, any domain-specific syntax embedded inside a general-purpose language specifically to make one narrow kind of expression more readable (SQL query builders offering a fluent, near-SQL-shaped API over what are, underneath, ordinary method calls).

## SE Lens

JSX's real, practical value is making a UI's nested structure visually match its actual nesting — a deeply nested `createElement` call tree is genuinely hard to trace by eye, while the equivalent JSX reads with the same visual nesting HTML always has. The real cost: JSX requires a compile step (it is not valid JavaScript a browser can run directly), meaning it cannot be used without a build tool configured to transform it first — a real, upfront tooling dependency, in exchange for the readability payoff.

## Connection

Enabled by `vite-plugin-system.md`'s JSX-compiling plugin. Used throughout `react-usestate-hook.md`, `react-component-props.md`, and `jsx-fragments.md` — essentially every React component's return value is a JSX expression.

## Try It Yourself

1. Embed a more complex expression inside `{}` (a function call, or a ternary choosing between two different strings) and confirm it renders exactly as that expression evaluates.
2. Try putting a full `if` statement directly inside `{}` (`{if (count > 0) { "positive" }}`) and read the real syntax error — confirming JSX's `{}` only accepts expressions, never statements — then rewrite the same logic using a ternary instead, which *is* a valid expression.
3. Use your browser's dev tools or a build tool's own "show compiled output" option (or simply read `@vitejs/plugin-react`'s transform output for a small file) to see JSX you've written actually compiled into plain function calls, confirming firsthand that no special runtime magic beyond ordinary function calls is involved.
