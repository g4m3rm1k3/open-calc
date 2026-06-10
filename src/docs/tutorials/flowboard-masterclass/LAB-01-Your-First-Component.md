# FlowBoard Masterclass — LAB 01 — Your First Component

**Prerequisites:** LAB-00 — Setup: From Zero to Running App. You have `npm run dev` running, the app opens at `http://localhost:5173`, and you understand the execution path: `index.html → main.tsx → App.tsx → DOM`.

**What this lab adds:**
- A `<Card />` component on screen with a title and a description
- A TypeScript interface that defines the shape of a card's data
- The ability to pass data into a component from its parent

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. `App.tsx` is a function that returns JSX. What do you think makes it a "component" rather than just a regular function?
> 2. If you write `<Card />` in JSX, where does React look for the code that defines what `Card` actually renders?
> 3. What do you think would happen if you pass a number to a component that expects a string? Would anything break?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, your browser will show a white card with a bold title and a description underneath. It will look something like this:

```
┌─────────────────────────────────┐
│  Fix login button               │
│  The login button is broken     │
│  on mobile screens.             │
└─────────────────────────────────┘
```

That card is a reusable React component. You will be able to place it anywhere in the app just by writing `<Card title="..." description="..." />`. The component knows nothing about where it lives — it only knows how to display the data it receives.

This is the foundation of the entire app. Every list, every board, every interactive element in FlowBoard is built from components like this one.

---

## Concept: What a React Component Is

**What it is:** A React component is a TypeScript function that accepts data as input and returns JSX as output — a description of what should appear on screen.

**The problem before:**

In plain HTML, if you want the same card to appear 50 times, you write the same HTML 50 times. If the card's structure changes — say, you add a priority badge — you update 50 places. This is unmaintainable at any real scale.

```html
<!-- Plain HTML — copy-paste 50 times, update 50 times -->
<div class="card">
  <h3>Fix login button</h3>
  <p>Broken on mobile</p>
</div>
<div class="card">
  <h3>Update homepage</h3>
  <p>New design from Figma</p>
</div>
```

**The solution:** A component is a reusable template. You define the structure once. You place it as many times as you need by writing a JSX tag. The data changes per use — the structure does not.

**What it hides:**

A React component hides two things:

1. **The DOM manipulation details** — without React, you would call `document.createElement()`, set properties, append children, track references, and manually update them when data changes. A component hides all of that. You describe *what* you want; React handles *how* to put it in the DOM.

2. **The re-render decision** — without React, you would decide when to re-draw the UI. A component hides that decision: React knows when data changes and re-calls your function automatically.

**The protected invariant:** A component's output is *always* determined entirely by its input. Given the same input, it always returns the same JSX. This makes components predictable: if the screen looks wrong, you only have to look at two things — the data passed in, and the function that transforms it.

**Canonical example:**

Think of a component like a rubber stamp. The stamp's shape (the function) never changes. What it prints (the output) depends only on the ink color and position you use it with (the input data). You use the same stamp to print a hundred cards — each one prints correctly because the stamp's logic is reliable.

```tsx
// A component is a function: data in, JSX out
function Greeting(props) {
  return <p>Hello, {props.name}!</p>;
}

// Used like an HTML tag — but with custom data
<Greeting name="Alice" />   // renders: <p>Hello, Alice!</p>
<Greeting name="Bob" />     // renders: <p>Hello, Bob!</p>
```

**Project application:** Our `Card` component will take a `title` and `description` as input and return a `<div>` with those values rendered inside it. Every card on the board will be this same function, called with different data.

**You will see this again in:** Every React project ever written. Components are not a FlowBoard concept — they are the unit of construction in all of React. `<Button />`, `<Modal />`, `<Header />`, `<List />` — every visible element in a React app is a component.

**Watch for:** A component name must start with a capital letter. `card` is an HTML tag. `Card` is a React component. React distinguishes them by case. `<card />` will render a literal `<card>` DOM element and silently ignore your component.

---

## Concept: Props

**What it is:** Props (short for "properties") are the inputs you pass into a component — the data it needs to do its job.

**The problem before:**

Without props, every component is hardcoded. It shows the same content every time. That is not reusable — it is just a function that prints one specific string.

```tsx
function Card() {
  return (
    <div>
      <h3>Fix login button</h3>       {/* hardcoded — useless for other cards */}
      <p>Broken on mobile</p>
    </div>
  );
}
```

**The solution:** Props let the component's parent pass data in. The component uses that data to fill in its template. Each use of the component can have different data.

```tsx
function Card(props) {
  return (
    <div>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
    </div>
  );
}

// Same component, different data
<Card title="Fix login button" description="Broken on mobile" />
<Card title="Update homepage" description="New design from Figma" />
```

**What it hides:** Props hide the wiring between parent and child. Without them, you would pass data through global variables, shared state, or manual DOM queries. Props create a clean, one-directional channel: data flows from parent to child through a declared interface.

**The protected invariant:** Props flow in one direction only — from parent to child. A child component cannot change its own props. This makes data flow in the app traceable: if a card shows the wrong title, you look at who passed the title prop, not inside the card.

**Canonical example:**

Props are like the arguments you pass to a function — because they literally are. The difference is that JSX has special syntax for them that looks like HTML attributes.

```tsx
// These two are identical in what they do:
greet({ name: "Alice", age: 30 });          // function call with object
<Greet name="Alice" age={30} />             // JSX with props

// Inside the component, props is just the object you received:
function Greet(props) {
  return <p>{props.name} is {props.age}</p>;
}
```

**Project application:** Our `Card` component will receive `title` (a string) and `description` (a string) as props. `App.tsx` will pass the actual values when it places `<Card />` in its JSX. The card has no knowledge of where those strings came from — it just displays them.

**You will see this again in:** Every component in every React app. Props are to components what parameters are to functions. Any time you see `<Component someValue="..." />` in React code, you are looking at props.

**Watch for:** Strings are passed as `title="hello"`. Numbers, booleans, arrays, objects, and functions must be wrapped in curly braces: `count={5}`, `active={true}`, `items={[1,2,3]}`. Forgetting the braces on a number gives you the string `"5"`, not the number `5`.

---

## Concept: TypeScript Interface

**What it is:** An interface is a TypeScript declaration that names and types the shape of an object — what properties it has, and what type each property must be.

**The problem before:**

Without an interface, TypeScript cannot check whether you passed the right data to a component. You can pass anything — a number where a string is expected, a missing required field, a typo in a property name — and the code runs silently wrong.

```tsx
// No interface — TypeScript cannot check this
function Card(props) {
  return <h3>{props.titel}</h3>;   // typo: "titel" — TypeScript doesn't catch it
}

<Card title="Fix login" />         // "titel" is undefined — blank heading, no error
```

**The solution:** An interface declares the exact shape of `props`. TypeScript now knows what properties exist, what types they are, and whether they are required or optional. It will catch typos, missing fields, and wrong types before your code runs.

```tsx
interface CardProps {
  title: string;          // required — must be a string
  description: string;    // required — must be a string
}

function Card(props: CardProps) {
  return <h3>{props.titel}</h3>;   // ← TypeScript immediately flags "titel" — Property 'titel' does not exist on type 'CardProps'. Did you mean 'title'?
}
```

**What it hides:** An interface hides the runtime type-checking burden. Without TypeScript, you would write manual guards inside every function: `if (typeof title !== 'string') throw new Error(...)`. An interface checks every call site at *edit time*, before any code runs, across the entire codebase.

**The protected invariant:** Once an interface exists, TypeScript guarantees that every caller provides all required properties with the correct types. The component author can write the function body trusting that `props.title` is a string — no defensive checks required.

**Canonical example:**

An interface is a contract. It says: "anything that calls itself a `CardProps` must have these fields with these types. No exceptions."

```ts
interface Point {
  x: number;
  y: number;
}

function printPoint(p: Point) {
  console.log(`(${p.x}, ${p.y})`);
}

printPoint({ x: 10, y: 20 });        // ✓ valid
printPoint({ x: 10 });               // ✗ TypeScript error: missing 'y'
printPoint({ x: 10, y: "hello" });   // ✗ TypeScript error: 'y' must be number
printPoint({ x: 10, y: 20, z: 5 }); // ✗ TypeScript error: 'z' does not exist on Point
```

**Project application:** We will define a `CardProps` interface with two required string fields: `title` and `description`. The `Card` function will declare its parameter as `props: CardProps`. TypeScript will then verify every `<Card />` usage in the entire codebase.

**You will see this again in:** Every TypeScript function that receives an object. API response types, database models, component props, event payloads — interfaces define the shape of data everywhere in professional TypeScript. This is a foundational skill for any TypeScript role.

**Watch for:** An interface only exists at edit time. TypeScript erases all type information before the code runs. If a value arrives from an API or user input, the interface does not protect you at runtime — only at compile time.

---

## Concept: `.tsx` vs `.ts` — Which File Extension to Use

**What it is:** `.ts` is a TypeScript file. `.tsx` is a TypeScript file that is also allowed to contain JSX syntax.

**The problem before:**

TypeScript's compiler treats `<Card />` inside a `.ts` file as a syntax error. It expects TypeScript, not JSX tags. React components can only live in `.tsx` files.

**The solution:** Use `.tsx` for any file that contains JSX. Use `.ts` for any file that contains only TypeScript — utility functions, types, constants, API calls, business logic with no JSX.

```
Card.tsx       ← has JSX: return <div>...</div>
App.tsx        ← has JSX: return <Card />
utils.ts       ← no JSX: just functions and types
constants.ts   ← no JSX: just data
```

**Why it matters:** Keeping `.tsx` and `.ts` separated is a signal to every developer on the team — and to TypeScript itself — about what a file is responsible for. A `.ts` file that imports React is a red flag. A `.tsx` file with no JSX is a smell that it should be split.

**Project application:** Our `Card` component goes in `src/components/Card.tsx` — it has JSX. If we later add utility functions like `formatDate()`, they go in `src/utils/date.ts` — no JSX, no `.tsx`.

**You will see this again in:** Every React + TypeScript project. The `.tsx` / `.ts` split is universal. GitHub, VS Code, and all TypeScript tooling treat them differently.

**Watch for:** Forgetting the `x` in `.tsx` when creating a component file. The error message — "JSX expressions are not allowed in '.ts' files" — is the clear signal that you created `.ts` instead of `.tsx`.

---

## Concept: export and import

**What it is:** `export` makes a value, function, or type available for other files to use. `import` brings an exported item into the current file.

**The problem before:**

Without export/import, every function and type would have to live in one massive file. Every browser script tag would have to be carefully ordered — a function used before it is defined causes a crash.

**The solution:** Files are modules. Each file exports only what it intends to share. Other files import exactly what they need. The connection is explicit, named, and tracked by TypeScript.

**Two kinds of export — the one you need to know now:**

```ts
// Named export — the name matters, must be imported with the same name
export function Card() { ... }
export interface CardProps { ... }

// Default export — the file has one main thing to share
export default function Card() { ... }

// Importing named exports
import { Card, CardProps } from './components/Card';

// Importing a default export — you choose the name on import
import Card from './components/Card';
import WhateverName from './components/Card'; // same thing
```

**We use named exports in this series** because they are explicit — the exported name and the imported name must match, so TypeScript can catch mistakes. Default exports allow any name on import, which creates confusion in larger codebases.

**Alternative:** Default exports are common in tutorials and smaller projects. The specific tradeoff: default exports are slightly less typing but allow name drift — `import Crd from './Card'` is valid and TypeScript will not flag the typo. Named exports prevent this.

**Project application:** `Card.tsx` will use `export function Card(...)`. `App.tsx` will use `import { Card } from './components/Card'`.

**You will see this again in:** Every JavaScript/TypeScript file in every project. Import/export is the universal module system. Node.js, browser apps, React, Vue, Angular — all use it.

**Watch for:** Importing from the wrong path. `./components/Card` means "in a `components` folder next to the current file." `../components/Card` means "go up one folder, then find `components/Card`." Getting this wrong gives a "Cannot find module" error.

---

## Concept: Component Tree

**What it is:** A component tree is the parent-child hierarchy of components that makes up the visible UI. Every component is either the parent of others, the child of a parent, or both.

**What it looks like for FlowBoard:**

```
App                        ← root, renders everything
└── Card                   ← child of App right now
    ├── h3 (title)         ← built-in HTML element
    └── p  (description)   ← built-in HTML element
```

**Why it matters:** Understanding the tree tells you two critical things:
1. Where data comes from — data flows down, from parent to child via props
2. Where to put state — state belongs in the nearest parent that needs to share it

Right now the tree is shallow. In later labs it will grow:

```
App
└── Board
    ├── List (column 1)
    │   ├── Card
    │   └── Card
    └── List (column 2)
        └── Card
```

Every lab adds one more layer to this tree.

**Project application:** Today, `App` is the parent. `Card` is its child. `App` owns the data (the card's title and description) and passes it down via props.

**You will see this again in:** Every React app. The component tree is the primary mental model for reasoning about data flow, re-render scope, and where to place logic. Interviewers ask about it. Tools like React DevTools visualize it.

---

## Step 1 — Create the `components` folder and `Card.tsx`

Your `src/` folder currently has no `components/` subfolder. Before writing a component, you need a home for it. Component files always live in `src/components/`.

Open the terminal in `flowbard/` and run:

```
(no terminal command needed — just create the file in VS Code)
```

In VS Code's Explorer panel, right-click the `src` folder and select **New Folder**. Name it `components`.

Then right-click `src/components` and select **New File**. Name it `Card.tsx`.

Your file tree now looks like:

```
src/
├── components/
│   └── Card.tsx       ← new
├── App.tsx
├── App.css
├── index.css
└── main.tsx
```

Open `Card.tsx`. It is empty. You will fill it in the next steps.

---

## Step 2 — Write the interface first

Before writing the component function, define the shape of its data. This is the rule: **define the contract before writing the code that fulfills it.** The interface is the specification. The function is the implementation.

In `Card.tsx`, type this exactly:

```tsx
// Card.tsx

// This interface declares the shape of data a Card component requires.
// Any caller that passes the wrong type or omits a required field
// will get a TypeScript error immediately — before running the app.
export interface CardProps {
  title: string;       // the short name of the task
  description: string; // the longer explanation of what needs to be done
}
```

### SAVE AND TRY

Save `Card.tsx`. Nothing visible changes yet — this is only a type declaration, not any runnable code. But TypeScript is now checking it.

**Verify TypeScript accepted it:** Look at the VS Code tab for `Card.tsx`. There should be no red underline anywhere in the file and no errors in the Problems panel (View → Problems). If there are errors, check your typing against the code above exactly.

**What you have right now:** A named type that says "a card has a title string and a description string." No component, no JSX, no rendering — just the contract.

---

## Step 3 — Write the component function (structure only, no style)

Now write the function that uses the interface. Add this below the interface in `Card.tsx`:

```tsx
// Card.tsx

export interface CardProps {
  title: string;
  description: string;
}

// Card is a React component — a function that takes props and returns JSX.
// The ": CardProps" after "props" is the TypeScript annotation that connects
// this function's parameter to the interface above.
// TypeScript will now verify every caller provides { title, description }.
export function Card(props: CardProps) {
  return (
    // A div is the container for the card.
    // Right now it has no style — we will add that after we confirm the structure works.
    <div>
      {/* h3 renders the title as a heading */}
      <h3>{props.title}</h3>

      {/* p renders the description as a paragraph */}
      <p>{props.description}</p>
    </div>
  );
}
```

**Reading the JSX:** `{props.title}` is JSX's way of embedding a JavaScript expression inside markup. The curly braces mean "evaluate this and insert the result as text." `props.title` evaluates to the string passed by the parent.

**What `export` does here:** The `export` keyword before `function` makes `Card` available to other files. Without it, `Card.tsx` defines the function but locks it inside the file — no other file can import it.

### SAVE AND TRY

Save `Card.tsx`. Still nothing visible in the browser — `Card` exists but nobody has used it yet. That is correct. A component is a template; it renders nothing until it is placed in the tree.

Check the Problems panel. Zero errors = you are ready for the next step.

---

## Step 4 — Use `Card` in `App.tsx`

Now place `Card` in the component tree. Open `App.tsx`. It currently looks like the default Vite scaffold:

```tsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  // ... lots of default content
}
```

You are going to replace all of that with a minimal version that renders your `Card`. **Delete everything in `App.tsx`** and replace it with:

```tsx
// App.tsx

// Import the Card component from the file you just created.
// The path './components/Card' means: look in src/components/Card.tsx
// (TypeScript and Vite automatically try .ts and .tsx extensions)
import { Card } from './components/Card';

// App is the root component of the entire application.
// Everything visible on screen is a descendant of what App returns.
function App() {
  return (
    // A div wrapping the whole app. We will make this more meaningful in later labs.
    <div>
      {/* Place a Card in the tree. These values are the props being passed down.
          App owns the data. Card displays it. */}
      <Card
        title="Fix login button"
        description="The login button does not respond on mobile screens."
      />
    </div>
  );
}

// App must be exported so main.tsx can import and render it.
export default App;
```

### SAVE AND TRY

Save `App.tsx`. Look at your browser.

**You should see:**

```
Fix login button
The login button does not respond on mobile screens.
```

The text will be plain — no styling yet. The title will be slightly larger than the description because `<h3>` has default browser heading styles.

**Verify the component tree is working:** Open Chrome DevTools (F12 or right-click → Inspect). Click the **Elements** tab. Find the structure:

```html
<div>
  <div>
    <h3>Fix login button</h3>
    <p>The login button does not respond on mobile screens.</p>
  </div>
</div>
```

The outer `div` is from `App`. The inner `div`, `h3`, and `p` are from `Card`. This is the component tree made real in the DOM.

**Verify TypeScript is protecting you:** In `App.tsx`, deliberately break the props. Remove the `description` prop:

```tsx
<Card title="Fix login button" />
```

Save. Look at the Problems panel or the red underline in the editor. You should see:

```
Property 'description' is missing in type '{ title: string; }' but required in type 'CardProps'.
```

TypeScript caught the error before the app ran. Now put `description` back.

**Change something:** Change the `title` to your own task name. Save. The browser updates instantly with your new text. This is HMR — you saw it in Lab 00. Now you are experiencing it while building real components.

---

## Step 5 — Verify props flow works end-to-end

You have one card. Before adding any styling, verify the entire data flow is working correctly.

Add a second `Card` below the first in `App.tsx`:

```tsx
function App() {
  return (
    <div>
      <Card
        title="Fix login button"
        description="The login button does not respond on mobile screens."
      />
      <Card                                          {/* ← add this */}
        title="Update the homepage hero image"       {/* ← add this */}
        description="New design approved in Figma."  {/* ← add this */}
      />                                             {/* ← add this */}
    </div>
  );
}
```

### SAVE AND TRY

Save. You should see two cards stacked vertically:

```
Fix login button
The login button does not respond on mobile screens.

Update the homepage hero image
New design approved in Figma.
```

Both use the same `Card` function. Different props produce different content. The component tree is now:

```
App
├── Card (title="Fix login button", description="...")
└── Card (title="Update the homepage hero image", description="...")
```

**Console check:** Open DevTools → Console. There should be no errors or warnings. React sometimes warns about missing `key` props when cards come from an array — you are not using an array yet, so no warning. You will learn about keys in Lab 02, when this exact warning will appear naturally.

---

## 🎯 Challenge: Add a `priority` prop

**You know:** TypeScript interfaces, props, and how to add fields to both

**Task:** Add an optional `priority` field to `CardProps`. The field should accept the string values `"low"`, `"medium"`, or `"high"` only. Display it inside the `Card` below the description. If no priority is passed, the card should still render correctly without crashing.

**Starting code:** Your current `Card.tsx` from Step 3.

**Hints:**

1. In TypeScript, a union type lets a field accept only specific string values: `"low" | "medium" | "high"`
2. In TypeScript, a field with `?` after its name is optional: `priority?: "low" | "medium" | "high"`

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// Card.tsx

export interface CardProps {
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high'; // ← optional union type
}

export function Card(props: CardProps) {
  return (
    <div>
      <h3>{props.title}</h3>
      <p>{props.description}</p>
      {/* Conditional rendering: only show if priority was passed.
          props.priority is undefined when omitted, which is falsy,
          so the && short-circuits and renders nothing. */}
      {props.priority && <p>Priority: {props.priority}</p>}
    </div>
  );
}
```

**Key insight:** The `?` in `priority?` tells TypeScript the field is optional. Inside the component, TypeScript knows `props.priority` might be `undefined`, so it will warn you if you try to use it without checking. The `{props.priority && ...}` pattern is how React conditionally renders — if the left side is falsy, the right side is never rendered.

</details>

---

## Final Check

Every feature in this lab — confirmed with an exact verification method.

| Feature | How to Verify |
|---|---|
| `Card.tsx` exists in `src/components/` | Check VS Code Explorer panel |
| `CardProps` interface defines `title` and `description` as strings | Open `Card.tsx` — both fields typed `string` |
| `Card` function accepts `props: CardProps` | Open `Card.tsx` — function signature shows `: CardProps` |
| Card renders in the browser | Browser shows "Fix login button" and description text |
| Two different cards show different content | Both titles visible, different text per card |
| Removing `description` from a `<Card />` shows a TypeScript error | Delete `description` from one card in `App.tsx`, check Problems panel |
| Restoring `description` clears the error | Put it back, error disappears |
| No console errors | DevTools → Console is empty |
| Component tree visible in Elements tab | DevTools → Elements shows nested `div > div > h3 + p` |

---

## Quick Check Answers

**1. What makes `App.tsx` a "component" rather than just a regular function?**

Two things: it returns JSX (a React-specific syntax that describes UI), and its name starts with a capital letter. React treats any function that starts with a capital letter as a component. A function named `app` (lowercase) would not be treated as a component — JSX would render it as a literal `<app>` DOM element. The capital letter is the signal to React that this is a component, not an HTML tag.

**2. If you write `<Card />` in JSX, where does React look for the code?**

React does not look anywhere automatically. You must import `Card` explicitly at the top of the file: `import { Card } from './components/Card'`. The `import` statement is what creates the connection. If you write `<Card />` without importing it, TypeScript gives you: "Cannot find name 'Card'". The JSX tag name is just a reference to whatever `Card` is in the current file's scope — that binding comes from the import.

**3. What would happen if you pass a number to a component that expects a string?**

TypeScript would catch it at edit time and show an error: "Type 'number' is not assignable to type 'string'." The browser would not run the broken code at all — TypeScript shows the error before you can save and try. If you somehow bypassed TypeScript (for example, by using `any` or receiving data from an unchecked API), JavaScript would still render the number — because in JSX, `{42}` renders as the text "42". But you would lose type safety and future errors would not be caught.

---

## Next Lab

In **LAB-02**, you will render multiple cards from an array of data. Right now `App.tsx` has two hardcoded `<Card />` elements — that approach breaks down completely at 20 cards. The next lab introduces `Array.map()` and the `key` prop, and you will see the exact error React gives you when keys are missing — before learning why they are required.
