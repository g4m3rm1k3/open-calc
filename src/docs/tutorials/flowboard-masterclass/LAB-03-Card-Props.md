# FlowBoard Masterclass — LAB 03 — Card Props

**Prerequisites:** LAB-02 complete.  
You have: a `Card` component in `Card.tsx` with hardcoded text ("Fix the login bug", "Bug"), styled with `background-color`, `padding`, `border-radius`, `box-shadow`, `border`, `width`, and `margin-top`. `App.tsx` renders one `<Card />`.

**What this lab adds:**
- A TypeScript `interface` that defines the shape of a card's data
- Props on the `Card` component so it accepts data instead of hardcoding it
- A `cards` array in `App.tsx` with three different cards
- `.map()` to render all three from the array — no copy-pasting

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now your `Card` component always shows "Fix the login bug". If you write `<Card />` three times in App, all three show the same text. What would you need to change about `Card` so each one can show different text?
> 2. In plain JavaScript, if you have an array `['a', 'b', 'c']` and you want to produce a new array `['A', 'B', 'C']`, what method would you use?
> 3. TypeScript already knows that `16` is a number and `"hello"` is a string. Why might you still need to explicitly name the shape of something like a card?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

At the end of this lab, your browser shows three different cards, each with its own title and label:

```
┌─────────────────────────────────────────────┐
│               FlowBoard                     │
│        Your work, your way.                 │
│                     v0.1.0 - Alpha          │
│                                             │
│   ┌─────────────────────────┐               │
│   │  Fix the login bug      │               │
│   │  Bug                    │               │
│   └─────────────────────────┘               │
│   ┌─────────────────────────┐               │
│   │  Add dark mode          │               │
│   │  Feature                │               │
│   └─────────────────────────┘               │
│   ┌─────────────────────────┐               │
│   │  Write API docs         │               │
│   │  Docs                   │               │
│   └─────────────────────────┘               │
└─────────────────────────────────────────────┘
```

No new CSS. No new React hooks. Just the TypeScript and React data-flow concepts that make components genuinely reusable.

---

## Concept: TypeScript `interface`

**What it is:** An `interface` names the shape of an object — its property names and the type of each value. It is a compile-time tool only: it disappears completely from the JavaScript the browser runs.

**The problem before:**

```tsx
// Without an interface — the shape lives nowhere:
function Card(props) {
  return <div>{props.title}</div>;  // TypeScript: what is props? what is title?
}

<Card title="Fix bug" />         // fine
<Card tittle="Fix bug" />        // typo — TypeScript cannot catch it
<Card />                         // missing title — TypeScript cannot catch it
```

When the shape is unnamed, TypeScript cannot help. Typos and missing fields pass silently.

**The solution:**

```tsx
interface CardData {
  id: string;
  title: string;
  label: string;
}
```

Now TypeScript knows exactly what a `CardData` is. A typo or missing field is a compile error before the code ever runs.

**What it hides:** The need to re-check what fields an object has every time you use it. Invariant: anywhere a `CardData` is expected, TypeScript guarantees it has exactly these fields at exactly these types.

**Canonical example (General):**
A form template. The template says "this form must have: Name (text), Age (number), Email (text)." Anyone filling it out must provide those fields. The template stores no data — it only defines what valid data looks like.

**The three things an interface is NOT:**
1. Not a class — generates no code. Erased before the browser sees it.
2. Not a value — you cannot write `const x = CardData`.
3. Not a runtime check — TypeScript checks your source code, not what arrives from an API at runtime.

**Why it matters here:** You define `interface CardData` once. The component, the array, and the props all reference it. Add a field once — TypeScript immediately shows every place that needs updating.

**Watch for:** TypeScript is case-sensitive. `CardData` and `carddata` are two different names. Convention: interface names always start with a capital letter.

---

## Step 1 — Add the Interface to `Card.tsx`

Open `src/Card.tsx`. Add the interface above the function:

```tsx
import './Card.css';

interface CardData {          // ← add this block
  id: string;                 //   a unique identifier: "1", "abc", "uuid-xyz"
  title: string;              //   the card text: "Fix the login bug"
  label: string;              //   the category tag: "Bug", "Feature", "Docs"
}

function Card(){              // ← unchanged for now
    return(
        <div className="card">
            <h3 className="card-title">Fix the login bug</h3>
            <span className="card-label">Bug</span>
        </div>
    )
}

export default Card;
```

### SAVE AND TRY

Save. The browser shows the same card as before — nothing changed visually.

**This is expected.** The interface is a TypeScript declaration that lives only in the editor. The browser never sees it. Its value appears in the next step when TypeScript uses this definition to check your props.

**In VS Code:** Hover over `CardData` in the file. The editor shows the shape you just defined. That tooltip is TypeScript working.

**Change something:** Add `priority: number` as a fourth field. Save. Nothing breaks — the interface is defined but not yet used. Remove it and save.

---

## Concept: Props

**What it is:** Props are values passed into a component from the outside — the same way arguments are passed into a function. The component receives them as its first parameter and uses them in its JSX.

**The problem before:**

```tsx
// Hardcoded — only ever shows one thing:
function Card() {
  return (
    <div className="card">
      <h3 className="card-title">Fix the login bug</h3>
      <span className="card-label">Bug</span>
    </div>
  );
}
```

To show three different cards you need three different components, or three copy-pasted JSX blocks. Neither scales.

**The solution:**

```tsx
// Props-driven — shows whatever is passed in:
function Card(props: CardData) {
  return (
    <div className="card">
      <h3 className="card-title">{props.title}</h3>
      <span className="card-label">{props.label}</span>
    </div>
  );
}

<Card id="1" title="Fix the login bug" label="Bug" />
<Card id="2" title="Add dark mode"      label="Feature" />
```

**The `{}` syntax in JSX:**
`{props.title}` is a JSX expression. Curly braces switch JSX from text mode to JavaScript expression mode. Without them, `props.title` renders as the literal string "props.title" on screen — not the value.

**What it hides:** The internal structure of a component from the code that uses it. App does not care how Card renders the title — it passes data, Card handles display. Invariant: the component is the single source of truth for how its data is displayed.

**Canonical example (General):**
A function. `Math.max(3, 7)` returns 7. `Math.max(10, 2)` returns 10. Same function, different input, different output. `<Card title="Fix bug" />` and `<Card title="Add dark mode" />` are the same idea.

**Watch for:** Props flow one direction — from parent to child. App passes down to Card. Card cannot push back up to App via props. This one-way flow makes data movement predictable and easy to trace.

---

## Step 2 — Add Props to the Card Function

Update `Card.tsx` so the function accepts props typed as `CardData`:

```tsx
import './Card.css';

interface CardData {
  id: string;
  title: string;
  label: string;
}

function Card(props: CardData){          // ← was: function Card(){
    return(
        <div className="card">
            <h3 className="card-title">{props.title}</h3>    {/* ← was: "Fix the login bug" */}
            <span className="card-label">{props.label}</span> {/* ← was: "Bug" */}
        </div>
    )
}

export default Card;
```

```
function Card(props: CardData)
                    ↑
                    TypeScript: this parameter must match the CardData shape

{props.title}  ←  curly braces = expression mode; renders the value of props.title
{props.label}  ←  same
```

### SAVE AND TRY

Save. Look at `App.tsx` in your editor — the `<Card />` line now has a **red underline**.

**This is the interface working.** TypeScript says `<Card />` is missing required props — `id`, `title`, and `label`. You changed the contract of `Card` and TypeScript found the inconsistency immediately.

In the browser: blank page or error overlay. Expected — the caller has not been updated yet.

**Key insight:** A TypeScript error right now is a feature, not a failure. Without types, `undefined` would render silently on screen and you would not know where the data was missing.

---

## Step 3 — Pass Props in `App.tsx`

Open `src/App.tsx`. Add the three required props to `<Card />`:

```tsx
import './App.css';
import Card from './Card';

function App(){
  return(
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      <span className="version-badge">v0.1.0 - Alpha</span>
      <Card id="1" title="Fix the login bug" label="Bug" />  {/* ← was: <Card /> */}
    </div>
  )
}

export default App;
```

### SAVE AND TRY

Save. The TypeScript error clears. The browser shows the same card as before — "Fix the login bug / Bug" — but it is now driven by props.

**Verify TypeScript is checking the call site:**
- Delete `title="Fix the login bug"` and save → TypeScript error. Put it back.
- Change it to `title={42}` → TypeScript error (number is not a string). Change it back.

**Change something:** Change `label="Bug"` to `label="Feature"`. Save. The browser updates to "Feature". Change it back.

---

## Step 4 — Create the Cards Array

The props values are still literals in the JSX. Move the data into an array. Add it above the `return` in `App.tsx`:

```tsx
import './App.css';
import Card from './Card';

interface CardData {                         // ← add this (same interface, needed here too for now)
  id: string;
  title: string;
  label: string;
}

function App(){
  const cards: CardData[] = [              // ← add this array
    { id: '1', title: 'Fix the login bug', label: 'Bug' },
    { id: '2', title: 'Add dark mode',     label: 'Feature' },
    { id: '3', title: 'Write API docs',    label: 'Docs' },
  ];

  return(
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      <span className="version-badge">v0.1.0 - Alpha</span>
      <Card id="1" title="Fix the login bug" label="Bug" />   {/* ← still hardcoded for now */}
    </div>
  )
}

export default App;
```

`CardData[]` means "an array where every item must match the CardData shape." Try adding `{ id: '4', tittle: 'Typo' }` — TypeScript flags `tittle` as unknown. Remove it.

**Why is the interface in App.tsx too — can't we import it?**
Yes — and you should. In `Card.tsx`, add `export` to the interface: `export interface CardData { ... }`. In `App.tsx`, import it: `import Card, { CardData } from './Card'` and remove the duplicate block entirely.

The `{ CardData }` syntax is a **named export** — different from `Card` which is the `export default`. One file can have one default export and as many named exports as needed. The `export interface` and `export default` coexist fine in the same file.

The `types.ts` pattern (a dedicated file for shared types) becomes the right choice when three or more files need the same type — at that point importing from a component file feels wrong semantically. You will hit that naturally when `List` and `Board` types are added later.

### SAVE AND TRY

Save. Browser unchanged — the hardcoded `<Card />` still renders. The array exists but nothing uses it yet.

**Change something:** Add a fourth object to the array. Save. Nothing renders yet — but the array is valid. Remove it.

---

## Concept: `.map()` for Rendering Lists

**What it is:** `.map()` transforms every item in an array into something else, returning a new array of the results. In React it transforms data objects into JSX elements.

**The problem before:**

```tsx
// One <Card /> written by hand per item:
<Card id="1" title="Fix the login bug" label="Bug" />
<Card id="2" title="Add dark mode"     label="Feature" />
<Card id="3" title="Write API docs"    label="Docs" />
// 50 cards = 50 lines. Adding a field = editing 50 lines.
```

**The solution:**

```tsx
cards.map((card) => (
  <Card key={card.id} id={card.id} title={card.title} label={card.label} />
))
```

```
cards.map( (card) => <Card ... /> )
           ↑
           called once per item — card is the current item
           returns JSX for that item
           .map() collects all results into a new array
           React renders that array in order
```

`.map()` never modifies the original array. The result must be used inside JSX — if you call `.map()` and throw away the result, nothing renders.

**Why it matters here:** The `cards` array becomes the source of truth. Add an object to the array — a card appears. Remove one — it disappears. The JSX never changes.

---

## Concept: The `key` Prop

**What it is:** `key` is a special React prop required on every element produced inside `.map()`. It uniquely identifies each element so React can track it across re-renders.

**Why React needs it:**
When data changes — a card added, removed, or reordered — React re-runs `.map()` and compares the new array of JSX to the old one. Without `key`, React cannot match old elements to new ones and destroys everything to rebuild. With `key`, React sees "the element with key='2' moved" and only updates what changed.

```tsx
// Correct — use the item's stable unique identifier:
cards.map((card) => <Card key={card.id} ... />)

// Wrong — index causes bugs when items reorder:
cards.map((card, index) => <Card key={index} ... />)

// Wrong — missing key — React warns in the console:
cards.map((card) => <Card ... />)
```

**`key` is NOT a prop your component receives.** React intercepts it. If you need the ID inside `Card`, pass it separately: `key={card.id} id={card.id}`.

---

## Step 5 — Render the Array with `.map()`

Replace the hardcoded `<Card />` in `App.tsx`:

```tsx
  return(
    <div className="app-container">
      <h1 className="app-title">FlowBoard</h1>
      <p className="app-subtitle">Your work, your way.</p>
      <span className="version-badge">v0.1.0 - Alpha</span>
      {cards.map((card) => (                   {/* ← replace <Card id="1" ... /> */}
        <Card
          key={card.id}
          id={card.id}
          title={card.title}
          label={card.label}
        />
      ))}
    </div>
  )
```

```
{              ← open JSX expression block
  cards.map(
    (card) =>  ← card = the current item
    (
      <Card
        key={card.id}      ← React tracking id — not accessible inside Card
        id={card.id}       ← passed as prop so Card can use it
        title={card.title}
        label={card.label}
      />
    )
  )
}              ← close JSX expression block
```

### SAVE AND TRY

Save.

**You should see:** Three cards — "Fix the login bug / Bug", "Add dark mode / Feature", "Write API docs / Docs".

**In DevTools Console:** No React key warning. If you see one, check `key={card.id}` is present in your `.map()`.

**Change something:** Add a fourth object to the `cards` array:
```tsx
{ id: '4', title: 'Deploy to staging', label: 'DevOps' },
```
Save. A fourth card appears without touching the JSX. Remove it and save.

---

## 🎯 Challenge: Add an Optional `description` Field

**You know:** TypeScript `interface`, props, `.map()`

**Task:**
1. Add an optional `description` field to the `CardData` interface: `description?: string`
2. Add a `<p>` tag inside `Card`'s JSX to render it
3. Add a `description` to one card in the array — leave the other two without it
4. Make the `<p>` only render when a description exists

**Requirements:**
- [ ] `description?: string` in both `CardData` interfaces (the `?` makes it optional)
- [ ] One card shows a description paragraph, the other two do not
- [ ] Removing `description` from an array object does not cause an error
- [ ] No hardcoded text — the description comes from props

**When you're done:** The first card shows an extra line of text. The second and third cards look unchanged.

**Stuck?** Ask AI: "In React JSX, how do I conditionally render an element only when a prop value exists, using the `&&` operator?"

---

## Final Check

| What to check | How to verify |
|---|---|
| Three cards render | "Fix the login bug", "Add dark mode", "Write API docs" all visible |
| Each card shows its own label | Bug / Feature / Docs — all different |
| Cards use `.map()` — not three `<Card />` tags | Check `App.tsx` — only `.map()` in the JSX |
| `key` prop is present | DevTools Console — no React key warning |
| TypeScript catches missing props | Delete `title={card.title}` → error appears. Put it back. |
| TypeScript catches unknown fields | Add `colour="red"` to `<Card>` → error. Remove it. |
| Cards are styled | White cards, rounded corners, shadow from LAB-02 |

---

## Quick Check Answers

**1. What would you need to change so each `<Card />` shows different text?**
The component needs to accept data from the outside instead of hardcoding it. In React, data passed from the outside is called props. You change the function signature to `function Card(props: CardData)` and use `{props.title}` in the JSX. The caller passes the value: `<Card title="Add dark mode" />`.

**2. What method transforms one array into another?**
`.map()`. It takes a function, calls it once per item, and returns a new array of results. `['a','b','c'].map(x => x.toUpperCase())` produces `['A','B','C']`. The original array is unchanged.

**3. Why define the shape of a card explicitly, when TypeScript can infer primitive types?**
TypeScript infers the type of a single value — `const x = 16` is inferred as `number`. But an object has a shape: which fields exist, what type each is, which are optional. There is no single value to infer from when the object does not exist yet. An `interface` declares the intended shape so TypeScript can check every object that claims to be a `CardData` — in this file, in App.tsx, or returned from a database query.
