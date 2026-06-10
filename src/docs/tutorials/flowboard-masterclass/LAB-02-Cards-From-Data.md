# FlowBoard Masterclass — LAB 02 — Cards From Data

**Prerequisites:** LAB-01 — Your First Component. You have a `Card` component that accepts `title` and `description` props and renders them in the browser.

**What this lab adds:**
- Multiple cards rendered automatically from an array of data
- No manual duplication — one line of code handles 1 card or 100
- Understanding of why React requires a `key` prop, learned by seeing the exact warning it produces first

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now `App.tsx` has two `<Card />` elements written manually. What do you think would happen to the code if you needed to show 50 cards?
> 2. In JavaScript, `[1, 2, 3].map(n => n * 2)` produces `[2, 4, 6]`. What do you think `cards.map(card => <Card title={card.title} />)` produces?
> 3. If two list items look identical on screen, why might React still need a way to tell them apart?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab, your browser shows multiple cards rendered from an array, not from hand-written JSX tags. You can add a new card to the data array and it appears on screen automatically — no new JSX to write.

```
┌─────────────────────────────────┐
│  Fix login button               │
│  The login button is broken     │
│  on mobile screens.             │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Update homepage hero image     │
│  New design approved in Figma.  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│  Write onboarding email         │
│  Three-step welcome sequence    │
│  for new signups.               │
└─────────────────────────────────┘
```

All three cards come from a single array. Add a fourth object to the array and a fourth card appears. Remove one and it disappears. The JSX never changes.

---

## Concept: `Array.map()` for Rendering

**What it is:** `Array.map()` is a JavaScript method that transforms every element in an array using a function you provide, and returns a new array of the transformed results. In React, you use it to transform an array of data objects into an array of JSX elements.

**The problem before:**

Right now `App.tsx` has two hardcoded `<Card />` elements. Adding a third means writing a third. Adding fifty means writing fifty. If the card structure changes — say, you add a `priority` badge — you update every hardcoded card individually. This is copy-paste programming and it breaks down immediately.

```tsx
// Hardcoded — does not scale, every addition is manual
<Card title="Fix login button" description="..." />
<Card title="Update homepage" description="..." />
<Card title="Write onboarding email" description="..." />
// ... 47 more to write by hand?
```

**The solution:** Store the data in an array. Use `.map()` to transform each data item into a `<Card />` element. React accepts an array of JSX elements wherever a single JSX element is valid.

```tsx
const cards = [
  { title: "Fix login button", description: "..." },
  { title: "Update homepage", description: "..." },
];

// map transforms each data object into a <Card /> JSX element
{cards.map(card => (
  <Card title={card.title} description={card.description} />
))}
```

**What `.map()` produces:** Not text, not HTML — a JavaScript array of JSX objects. React knows how to take that array and append each element to the DOM. The result looks identical to hand-written `<Card /><Card />` — but it required zero extra JSX for each additional card.

**Canonical example:**

`.map()` transforms each item in a list using the same rule, producing a new list of the same length. Think of it as an assembly line: every item goes in, every item gets the same transformation applied, every transformed item comes out.

```ts
// Non-React example first — pure JavaScript
const prices = [10, 20, 30];
const discounted = prices.map(price => price * 0.9);
// discounted = [9, 18, 27] — same length, each element transformed

// React equivalent — data → JSX
const names = ["Alice", "Bob", "Carol"];
const elements = names.map(name => <p>{name}</p>);
// elements = [<p>Alice</p>, <p>Bob</p>, <p>Carol</p>]
// React renders all three paragraphs
```

**The transformation rule:** `.map()` never adds or removes items. Input array length = output array length. Every transformation applies to every item. No exceptions. This predictability is why `.map()` is the standard React rendering tool.

**Project application:** We have an array of card data objects. We use `.map()` to transform each one into a `<Card />` element with the correct `title` and `description` props. The array lives in `App.tsx` — the component that owns the data.

**You will see this again in:** Every React application. List rendering with `.map()` is the most common pattern in all of React. Search results, notifications, comments, products, tasks — any list of any kind is rendered with `.map()`. It is also a core JavaScript skill used in Python (as `map()`), Ruby (as `map`/`collect`), and every other modern language.

**Watch for:** `.map()` returns a new array — it does not modify the original. If you call `cards.map(...)` and do not use the return value (e.g., you forget the curly braces in JSX or forget to use `return` inside the callback), nothing renders and no error appears. The silent empty render is the most confusing beginner `.map()` mistake.

---

## Concept: The `key` Prop

**What it is:** `key` is a special React prop — not a prop you define in your interface — that gives each element in a rendered list a stable identity React can track between re-renders.

**You will see the problem first.** Then you will understand why `key` exists.

---

## Step 1 — Move the card data into an array

Open `App.tsx`. You are going to replace the two hardcoded `<Card />` elements with an array and a `.map()` call.

First, add the data array. Change `App.tsx` to look like this:

```tsx
// App.tsx

import { Card } from './components/Card';

// The card data lives here — in the component that owns it.
// This is a plain JavaScript array of objects.
// The objects match the shape of CardProps (title: string, description: string).
// We will type this more precisely in a later lab.
const INITIAL_CARDS = [
  {
    title: 'Fix login button',
    description: 'The login button does not respond on mobile screens.',
  },
  {
    title: 'Update homepage hero image',
    description: 'New design approved in Figma.',
  },
  {
    title: 'Write onboarding email',
    description: 'Three-step welcome sequence for new signups.',
  },
];

function App() {
  return (
    <div>
      {/* .map() transforms each data object into a <Card /> element.
          card is the name we give each object as .map() iterates. */}
      {INITIAL_CARDS.map(card => (
        <Card
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  );
}

export default App;
```

### SAVE AND TRY

Save `App.tsx`. Look at the browser.

**You should see:** Three cards rendered vertically. The content matches the three objects in `INITIAL_CARDS`.

**Look at the console:** Open DevTools (F12) → Console tab. You will see a warning:

```
Warning: Each child in a list should have a unique "key" prop.
```

This warning is not an error — the cards still render. But React is telling you that something is missing. You will fix this in Step 2 after understanding why it matters.

**The warning is intentional here.** You are going to understand the problem by seeing it, not by being told to avoid it.

**Change something:** Add a fourth object to `INITIAL_CARDS`:

```tsx
{
  title: 'Set up error tracking',
  description: 'Configure Sentry before the production launch.',
},
```

Save. Four cards appear. You wrote zero new JSX. That is the entire point of `.map()`.

Remove the fourth object. Three cards again. This is data-driven rendering — the UI follows the data.

---

## Why React Needs `key` — See the Problem First

Before adding keys, look at what React is doing under the hood when a list changes.

Imagine you have a list of three cards: A, B, C. You delete card B. The list becomes: A, C.

**Without keys, React compares by position:**

```
Before:  position 1 = A,  position 2 = B,  position 3 = C
After:   position 1 = A,  position 2 = C,  (position 3 gone)
```

React sees position 2 changed from B to C, and position 3 was removed. So it updates position 2's content and removes position 3. That sounds correct — but it becomes a serious problem when components have their own internal state (like a text input with typed content, or an animation in progress). React updates the content but reuses the DOM node. The internal state — which belongs to B — is now sitting inside C's position. C inherits B's leftover state. This is a subtle, hard-to-debug bug.

**With keys, React compares by identity:**

```
Before:  key="A" = A,  key="B" = B,  key="C" = C
After:   key="A" = A,  key="C" = C
```

React sees key="B" is gone. It destroys B's DOM node entirely. Key="C" moved from position 3 to position 2 but its identity is intact — React reuses the existing DOM node and moves it. No state leak. No bug.

**The key is not about performance** (a common misconception). It is about correctness — giving React the information it needs to match old nodes to new nodes by identity rather than position.

---

## Concept: The `key` Prop

**What it is:** A special React prop you provide on each element in a `.map()` rendered list. It must be unique among siblings and stable — the same item must have the same key every time the list re-renders.

**What it hides:** The reconciliation algorithm — React's internal process of comparing the previous virtual DOM tree to the new one and calculating the minimum set of DOM operations needed. Without keys, React falls back to index-based comparison, which breaks whenever list items can be deleted, reordered, or inserted.

**The protected invariant:** Each item in a list maintains its own component identity across re-renders. State and DOM nodes are correctly preserved or destroyed based on identity, not position.

**Smallest possible example:**

```tsx
const fruits = ['apple', 'banana', 'cherry'];

// Without key — React warns and uses position (fragile)
fruits.map(fruit => <p>{fruit}</p>)

// With key — React tracks identity correctly
fruits.map(fruit => <p key={fruit}>{fruit}</p>)
```

**What makes a good key:**
- **Unique among siblings** — two cards cannot share a key
- **Stable** — the same card gets the same key every render
- **Not the array index** — if items can be deleted or reordered, index keys cause the same position-mismatch bug keys were supposed to prevent

**Why not use index?** If you delete item at index 1, item at index 2 becomes index 1, item at index 3 becomes index 2. The keys shifted. React sees position 1 changed content — same bug as no keys at all. Index keys are only safe when the list never reorders and never deletes. That is almost never true in a real app.

**The correct key:** An ID that comes with the data. A database ID, a UUID, a slug — any value that is permanently tied to that specific item regardless of its position.

**Project application:** Our `INITIAL_CARDS` objects need an `id` field. That `id` becomes the `key`.

**You will see this again in:** Every `.map()` in every React application. The key prop is mandatory for all list rendering. Job interview questions frequently ask about it — specifically why index keys are wrong and what the correct alternative is.

**Watch for:** `key` is not available inside the component as `props.key`. React consumes it internally and does not pass it down. If you need the ID inside `Card`, pass it as a separate named prop: `<Card key={card.id} id={card.id} ... />`.

---

## Step 2 — Add IDs to the data and `key` to the map

Update `INITIAL_CARDS` to include an `id` field on each object, then add `key` to the `.map()` call.

```tsx
// App.tsx

import { Card } from './components/Card';

// Each card object now has an id.
// The id is stable — it never changes for that card, regardless of array position.
// We use simple string IDs here. In later labs, these will come from the database.
const INITIAL_CARDS = [
  {
    id: 'card-1',                                    // ← add this
    title: 'Fix login button',
    description: 'The login button does not respond on mobile screens.',
  },
  {
    id: 'card-2',                                    // ← add this
    title: 'Update homepage hero image',
    description: 'New design approved in Figma.',
  },
  {
    id: 'card-3',                                    // ← add this
    title: 'Write onboarding email',
    description: 'Three-step welcome sequence for new signups.',
  },
];

function App() {
  return (
    <div>
      {INITIAL_CARDS.map(card => (
        <Card
          key={card.id}              // ← add this — key uses the stable id
          title={card.title}
          description={card.description}
        />
      ))}
    </div>
  );
}

export default App;
```

### SAVE AND TRY

Save `App.tsx`. Look at the browser — three cards still visible, identical to before.

**Verify the warning is gone:** Open DevTools → Console. The "Each child in a list should have a unique key prop" warning should be absent. A clean console = keys are working correctly.

**Verify the DOM:** DevTools → Elements. The structure is the same as before — React does not add `key` as an HTML attribute. It only exists in React's virtual DOM. Looking at the Elements tab, you cannot see keys — they are invisible to the browser.

---

## Step 3 — Verify `key` must be unique (try to break it)

Try the wrong key. Change all three `key` values to the same string to prove uniqueness matters:

```tsx
{INITIAL_CARDS.map(card => (
  <Card
    key="same-key-for-everyone"  // ← wrong — all three share one key
    title={card.title}
    description={card.description}
  />
))}
```

### SAVE AND TRY

Save. All three cards still render — React does not crash. But open the Console. You will see:

```
Warning: Encountered two children with the same key, `same-key-for-everyone`.
Keys should be unique so that components maintain their identity across updates.
```

React is warning you: duplicate keys mean it cannot correctly identify which item is which. The rendering appears correct now, but any list mutation — add, delete, reorder — will silently produce wrong behavior.

Restore the correct keys (`key={card.id}`) before continuing.

---

## Step 4 — Pass objects as props (cleaner syntax)

Right now the `.map()` destructures card properties one by one:

```tsx
<Card title={card.title} description={card.description} />
```

This is explicit — you can see exactly what each prop receives. An alternative is the spread operator, which passes all matching object properties at once:

```tsx
<Card {...card} />  // spreads title, description, id as separate props
```

**We will not use spread for props in this series.** Here is why: spread passes every property on the object, including `id`, which `CardProps` does not declare. This causes a TypeScript error. More importantly, spread hides what the component receives — you cannot tell at a glance what props `Card` gets. Explicit props are more readable and TypeScript-checkable.

**Alternative — destructure in the map callback:**

There is a slightly cleaner syntax that keeps explicitness while reducing repetition:

```tsx
{INITIAL_CARDS.map(({ id, title, description }) => (
  <Card
    key={id}
    title={title}
    description={description}
  />
))}
```

The `{ id, title, description }` syntax in the callback parameter is called **destructuring** — it unpacks those specific fields from the object automatically. The result is identical to `card.id`, `card.title`, `card.description` but without the `card.` prefix on each line.

Update your `App.tsx` to use this form:

```tsx
function App() {
  return (
    <div>
      {/* Destructured map — unpacks id, title, description from each card object */}
      {INITIAL_CARDS.map(({ id, title, description }) => (
        <Card
          key={id}
          title={title}
          description={description}
        />
      ))}
    </div>
  );
}
```

### SAVE AND TRY

Save. Three cards, clean console. Functionally identical — but the syntax is the form used in professional React codebases.

---

## 🎯 Challenge: Add a fourth card and verify it works

**You know:** `Array.map()`, the `key` prop, the `CardProps` interface

**Task:** Add a fourth card to `INITIAL_CARDS` with a unique `id`, a `title`, and a `description` of your choice. Verify that it appears on screen without any changes to the JSX in `App`'s return statement.

**Starting code:** Your current `App.tsx`.

**Hints:** None needed — this tests that you understood the pattern.

Try for 2 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
const INITIAL_CARDS = [
  {
    id: 'card-1',
    title: 'Fix login button',
    description: 'The login button does not respond on mobile screens.',
  },
  {
    id: 'card-2',
    title: 'Update homepage hero image',
    description: 'New design approved in Figma.',
  },
  {
    id: 'card-3',
    title: 'Write onboarding email',
    description: 'Three-step welcome sequence for new signups.',
  },
  {
    id: 'card-4',                                           // ← new
    title: 'Set up error tracking',                        // ← new
    description: 'Configure Sentry before launch.',        // ← new
  },
];
```

**Key insight:** The JSX in `App`'s return statement is unchanged. Only the data array changed. This is the payoff of data-driven rendering — the UI automatically reflects the data without any manual JSX updates.

</details>

---

## 🎯 Challenge: Type the data array

**You know:** TypeScript interfaces from Lab 01, the `CardProps` interface

**Task:** Create a new interface called `CardData` in `App.tsx` (or import `CardProps` from `Card.tsx`) that types the objects in `INITIAL_CARDS`. Annotate `INITIAL_CARDS` as an array of `CardData`. Verify TypeScript catches an error when you remove a required field from one of the objects.

**Hints:**

1. An array type in TypeScript is written as `Type[]` — for example, `string[]` for an array of strings, `CardData[]` for an array of `CardData` objects
2. You annotate a `const` variable: `const INITIAL_CARDS: CardData[] = [...]`

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```tsx
// App.tsx

import { Card } from './components/Card';

// CardData describes the shape of each item in the data array.
// Note: CardData includes 'id' which CardProps does not — because the component
// does not need to know about the id, but the array manager (App) does.
interface CardData {
  id: string;
  title: string;
  description: string;
}

// TypeScript now verifies every object in this array has { id, title, description }
const INITIAL_CARDS: CardData[] = [
  {
    id: 'card-1',
    title: 'Fix login button',
    description: 'The login button does not respond on mobile screens.',
  },
  // ... rest of cards
];

function App() {
  return (
    <div>
      {INITIAL_CARDS.map(({ id, title, description }) => (
        <Card
          key={id}
          title={title}
          description={description}
        />
      ))}
    </div>
  );
}

export default App;
```

**Key insight:** `CardData` and `CardProps` are related but distinct. `CardData` is the shape of items in the data layer — it includes `id` because the data layer needs it for keys and future lookups. `CardProps` is the shape of what the `Card` component receives — it only declares what the component uses. This separation becomes important in later labs when the data model grows much larger than what any single component needs.

</details>

---

## Final Check

| Feature | How to Verify |
|---|---|
| Three cards render from the `INITIAL_CARDS` array | Browser shows three card titles |
| No "key" warning in the console | DevTools → Console is clean |
| Adding an object to `INITIAL_CARDS` adds a card | Add a fourth object, save, fourth card appears |
| Removing an object removes the card | Remove one, save, it disappears |
| `key` does not appear as an HTML attribute | DevTools → Elements — no `key` attribute on any `<div>` |
| Destructured `.map()` syntax is in place | `App.tsx` shows `({ id, title, description }) => ...` |
| No TypeScript errors | Problems panel is clear |

---

## Quick Check Answers

**1. What would happen to the code if you needed to show 50 cards?**

With hardcoded `<Card />` elements, you would need 50 separate lines of JSX. If the data changes — say you rename a field — you update 50 places. If you add a new prop to `Card`, you update 50 call sites. With `.map()`, you update zero JSX — only the data array changes. The code length stays constant regardless of how many items there are.

**2. What does `cards.map(card => <Card title={card.title} />)` produce?**

A JavaScript array of JSX elements: `[<Card title="..." />, <Card title="..." />, <Card title="..." />]`. React accepts this array wherever JSX is expected and renders each element into the DOM. The result is visually identical to writing `<Card /><Card /><Card />` by hand — but it required no manual JSX per item.

**3. Why does React need to tell identical-looking items apart?**

Because identical appearance does not mean identical identity. Two cards can look the same but have different IDs, different internal state (a text input the user has typed in), or different animation progress. When the list changes — an item is deleted, reordered, or inserted — React needs to know which DOM node corresponds to which data item. Without keys, React guesses by position, which produces state leaks when items move. With keys, React knows by identity, and preserves or destroys DOM nodes correctly.

---

## Next Lab

In **LAB-03**, you will style the `Card` component. Right now it shows plain text with default browser fonts. The next lab introduces the CSS box model — padding, margin, and border — and the `className` prop. You will first see how ugly the cards look without styling, then build the styles one rule at a time, seeing each change in isolation.
