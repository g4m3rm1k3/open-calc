# 011 — Props: The Component Contract

*Data flow, the props interface, and why components should not reach outside themselves*

---

## What You Will Build

You will build a reusable `<LabCard>` component driven entirely by props — the same design used for lab cards in the real open-calc platform. The card will display a lab's title, description, category tag, and a launch button. You will render six different cards from one component definition, demonstrating that a single component can produce diverse output from different data.

---

## What You Need to Know First

Lesson 009 — React Components. You need to understand what a component is and how JSX renders one.

Lesson 010 — JSX. You need to know what props are at the `React.createElement` level.

---

## The Lesson

### What props are

In lesson 009, `CalculatorDisplay` accepted `{ expression, isError }`. These two values come from outside the component — from whatever renders `<CalculatorDisplay>`. They are **props** (short for properties).

Props are how data flows from a parent component to a child component. In React, data flows in one direction: from parent to child, always. This is called **unidirectional data flow**.

```
App
 └── CalculatorDisplay (receives expression, isError from App)
      └── no children
```

`App` owns `expression` and `isError`. It decides what values they have and passes them down. `CalculatorDisplay` receives them, uses them to compute `displayValue`, and renders. It cannot set them — it has no write access to the props it receives.

---

**CS lens — parameters and the function interface:**

Props are function parameters. A component is a function; props are its arguments. The component's **interface** — what it accepts and what it expects — is defined by its props.

```javascript
function CalculatorDisplay({ expression, isError }) { ... }
```

`expression` and `isError` are the parameters. The interface is `{ expression: string, isError: boolean }`. Anyone who renders `<CalculatorDisplay>` must know this interface. If they pass `expression={42}` (a number), they have violated the interface.

Interfaces have two halves:
- **Preconditions** — what the caller must provide (the right types, valid values)
- **Postconditions** — what the component guarantees (will render correctly given valid props)

In lesson 023 (TypeScript), you will make these preconditions explicit with types:

```typescript
interface CalculatorDisplayProps {
  expression: string
  isError:    boolean
}
```

For now they are implicit — enforced by convention and documented in prop names and comments.

---

**SE lens — the component as a unit of reuse:**

The value of a component interface is reuse. A component that accepts all its display data as props can be used anywhere, with any data, without modification.

In the open-calc platform, there is one `LabCard` component and dozens of labs. Each lab passes different data to the same `LabCard`. The card renders correctly for all of them because it is driven entirely by props — it contains no hardcoded lab names, descriptions, or categories.

This is the difference between a component and a template. A hardcoded template can only produce one output. A component with a clean props interface produces correct output for any valid inputs.

The alternative — one component per lab (`MathLabCard`, `PhysicsLabCard`, `RobotArmCard`) — duplicates the display logic and means any design change (new font, new layout, new colour scheme) must be applied to every version. A single `LabCard` with props changes once and updates everywhere.

---

### Build the LabCard component

Create `src/LabCard.jsx`:

```jsx
// src/LabCard.jsx

export default function LabCard({ title, description, category, difficulty, onLaunch }) {
  const categoryColors = {
    math:     { bg: '#e3f2fd', text: '#1565c0' },
    science:  { bg: '#e8f5e9', text: '#2e7d32' },
    code:     { bg: '#f3e5f5', text: '#6a1b9a' },
    language: { bg: '#fff3e0', text: '#e65100' },
  }

  const difficultyLabels = {
    beginner:     { label: 'Beginner',     color: '#2e7d32' },
    intermediate: { label: 'Intermediate', color: '#f57f17' },
    advanced:     { label: 'Advanced',     color: '#c62828' },
  }

  const catStyle  = categoryColors[category]  ?? { bg: '#f5f5f5',  text: '#616161' }
  const diffStyle = difficultyLabels[difficulty] ?? { label: difficulty, color: '#616161' }

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      background: '#fff',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          padding: '3px 8px',
          borderRadius: '12px',
          background: catStyle.bg,
          color: catStyle.text,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {category}
        </span>
        <span style={{ fontSize: '12px', color: diffStyle.color, fontWeight: 500 }}>
          {diffStyle.label}
        </span>
      </div>

      <div>
        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 600, color: '#1a1a2e' }}>
          {title}
        </h3>
        <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
          {description}
        </p>
      </div>

      <button
        onClick={onLaunch}
        style={{
          padding: '10px 16px',
          background: '#1a1a2e',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 500,
          alignSelf: 'flex-start',
        }}
      >
        Launch Lab
      </button>
    </div>
  )
}
```

**Walkthrough:**

`{ title, description, category, difficulty, onLaunch }` — five props, destructured from the props object. Each has a role:
- `title` — the lab name, rendered as a heading
- `description` — one or two sentences about the lab, rendered as a paragraph
- `category` — a short string (`'math'`, `'code'`, etc.) that determines the tag colour
- `difficulty` — determines the difficulty label colour
- `onLaunch` — a **function prop**, called when the launch button is clicked

`onLaunch` is a prop that carries a function — not a string, not a boolean, but an executable function. The parent component decides what should happen when the button is clicked, and passes that logic down as a prop. The `LabCard` component calls it:

```jsx
<button onClick={onLaunch}>Launch Lab</button>
```

`onClick={onLaunch}` passes `onLaunch` (the function) as the `onClick` prop to the native `<button>`. When the user clicks, React calls `onLaunch()`.

Function props are how child components communicate back up to their parents — by calling functions the parent provided. Data flows down as props; events communicate back up by calling function props. This is the unidirectional data flow pattern.

`categoryColors[category] ?? { bg: '#f5f5f5', text: '#616161' }` — same nullish coalescing pattern from lesson 009. If `category` is `'math'`, returns the math colours. If `category` is not in the map (any unknown category string), returns neutral grey. The component degrades gracefully for unknown inputs rather than crashing.

`display: 'flex', flexDirection: 'column', gap: '12px'` — CSS flexbox layout. `flexDirection: 'column'` stacks children vertically. `gap: '12px'` adds 12 pixels of space between each child. This is applied via the `style` prop as a JavaScript object (camelCase property names).

`alignSelf: 'flex-start'` on the button — in a flex column, all children stretch to fill the full width by default. `alignSelf: 'flex-start'` makes the button only as wide as its content, keeping it compact rather than full-width.

---

**CS lens — the lookup table pattern:**

`categoryColors` is a **lookup table** — a data structure that maps keys to values, used as a substitute for a series of `if/else` or `switch` statements.

```javascript
// Without a lookup table
let bg, textColor
if (category === 'math')     { bg = '#e3f2fd'; textColor = '#1565c0' }
else if (category === 'code') { bg = '#f3e5f5'; textColor = '#6a1b9a' }
else if ...

// With a lookup table
const categoryColors = {
  math: { bg: '#e3f2fd', text: '#1565c0' },
  code: { bg: '#f3e5f5', text: '#6a1b9a' },
}
const catStyle = categoryColors[category] ?? defaultStyle
```

Both produce the same result, but the lookup table version:
- Scales in O(1) — adding a new category is one new key-value pair, no additional conditionals
- Is data, not code — it can be extracted to a configuration file, changed without modifying logic
- Is a pattern the reader recognises immediately

Lookup tables are a fundamental pattern in computing: hash maps, dispatch tables, routing tables, symbol tables — all implement the same idea of key → value association.

---

**SE lens — the default value pattern and graceful degradation:**

`?? { bg: '#f5f5f5', text: '#616161' }` is a **graceful degradation** — a fallback for unexpected inputs that keeps the component functional.

The alternative is to let `categoryColors[unknownCategory]` return `undefined`, then try to destructure it:

```javascript
const { bg, text } = categoryColors[category]
// If category is unknown: TypeError: Cannot destructure property 'bg' of undefined
```

This crashes the component. The browser shows nothing — the entire card disappears and the JavaScript error propagates up.

With the default value, an unknown category renders with neutral grey styling. The user sees a working card with a grey tag instead of no card at all. This is a better failure mode.

The principle: **components should not crash on unexpected input.** Input validation at the boundary is good; crashing mid-render over an unknown category string is not. Provide sensible defaults, log a warning in development, render something useful.

---

### Add default prop values with destructuring

JavaScript destructuring supports default values in the parameter list:

```jsx
export default function LabCard({
  title,
  description,
  category    = 'general',
  difficulty  = 'beginner',
  onLaunch    = () => {},
}) {
```

`category = 'general'` — if `category` is not provided (or is `undefined`), it defaults to `'general'`. This means callers do not have to pass `category` for every card — it only appears in the parameter list definition.

`onLaunch = () => {}` — if `onLaunch` is not provided, it defaults to an empty function (a **no-op**). Clicking the button calls `() => {}`, which does nothing. The button is not disabled, no error occurs. The card is functional even when no handler is provided.

Update `LabCard.jsx` to use these defaults:

```jsx
export default function LabCard({
  title,
  description,
  category    = 'general',
  difficulty  = 'beginner',
  onLaunch    = () => {},
}) {
  // ... rest of component unchanged
}
```

---

### Render six cards in App.jsx

Update `src/App.jsx` to render a lab gallery:

```jsx
// src/App.jsx

import LabCard from './LabCard.jsx'

const labs = [
  {
    id: 'robot-arm',
    title: 'Robot Arm Simulator',
    description: 'Program a 3-axis robot arm using real MATLAB and Python commands. Complete 10 engineering missions from basic rotation to full pick-and-place sequences.',
    category: 'code',
    difficulty: 'intermediate',
  },
  {
    id: 'rubiks-cube',
    title: "Rubik's Cube Solver",
    description: "Explore group theory through the Rubik's Cube. Learn the rotation matrix algorithm that underlies every modern solver.",
    category: 'math',
    difficulty: 'advanced',
  },
  {
    id: 'space-invaders',
    title: 'Space Invaders',
    description: 'Build a fully functional Space Invaders game from scratch. Learn game loops, collision detection, and sprite animation.',
    category: 'code',
    difficulty: 'intermediate',
  },
  {
    id: 'linear-algebra',
    title: 'Linear Algebra Visualiser',
    description: 'See matrix multiplication, eigenvectors, and transformations in real time. Interactive 2D and 3D visualisations.',
    category: 'math',
    difficulty: 'beginner',
  },
  {
    id: 'periodic-table',
    title: 'Periodic Table Explorer',
    description: 'Interactive periodic table with electron configuration visualiser, bonding simulation, and element comparison tools.',
    category: 'science',
    difficulty: 'beginner',
  },
  {
    id: 'grammar-checker',
    title: 'Grammar Analyser',
    description: 'Parse sentences into constituent parts, identify grammatical errors, and explore syntax trees with real NLP algorithms.',
    category: 'language',
    difficulty: 'intermediate',
  },
]

export default function App() {
  function handleLaunch(labId) {
    console.log('Launching lab:', labId)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>my-platform</h1>
      <p style={{ color: '#666', marginBottom: '32px' }}>
        {labs.length} labs available
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '20px',
      }}>
        {labs.map((lab) => (
          <LabCard
            key={lab.id}
            title={lab.title}
            description={lab.description}
            category={lab.category}
            difficulty={lab.difficulty}
            onLaunch={() => handleLaunch(lab.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

**Walkthrough:**

`const labs = [...]` — an array of lab configuration objects defined at module scope (outside the component function). This array does not change — it is static data. Defining it outside the component means it is created once when the module loads, not every time `App` renders.

If the array were defined inside the component:

```javascript
function App() {
  const labs = [...]  // re-created on every render
  // ...
}
```

It would be re-created on every render as a new array object. This is harmless for a static array but is a pattern that causes problems when the value is passed to `useEffect` or `useMemo` as a dependency (covered in lesson 016). The habit of placing static data at module scope is correct.

`labs.map((lab) => ( <LabCard key={lab.id} ... /> ))` — maps the data array to a React element array. Each lab object becomes a `LabCard` element.

`key={lab.id}` — using the lab's ID string as the key. The ID is unique per lab and stable (it does not change between renders). This is the correct use of `key` — a stable, unique identifier from the data.

`onLaunch={() => handleLaunch(lab.id)}` — a function that captures `lab.id` from the surrounding scope. This is a **closure** — the arrow function remembers `lab` from the `.map()` callback even after `.map()` has finished. Each card's `onLaunch` closes over a different `lab.id`. When clicked, it calls `handleLaunch` with the specific ID.

The alternative — passing `lab.id` as a prop and having `LabCard` call `onLaunch(lab.id)` — would violate the component's design: `LabCard` would need to know how to construct its own event argument. The parent should control what `onLaunch` does; the child should just call it.

`gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))'` — CSS Grid with `auto-fill`. This creates as many columns as fit in the container, each at least 280px wide. The `1fr` means each column grows to fill available space equally. On a 900px container, this produces 3 columns. Resize the browser — the grid reflows to 2 columns, then 1 column, without any JavaScript.

---

**CS lens — closures in callbacks:**

In `labs.map((lab) => () => handleLaunch(lab.id))`, the inner `() => handleLaunch(lab.id)` is a closure — it "closes over" `lab` from the outer function's scope.

JavaScript's closure mechanism works because functions capture references to their enclosing scope, not copies of values. The `lab` variable in the inner function refers to the `lab` parameter of the `.map()` callback. When `.map()` calls the callback with different `lab` objects for different iterations, each inner function captures a reference to its specific iteration's `lab`.

Without closures, passing per-item data to callbacks would require a different mechanism — usually passing extra arguments or using a data attribute on the DOM element (the pre-ES6 pattern). Closures make this natural.

---

**SE lens — data-driven UI and the configuration-as-code pattern:**

The `labs` array is **data-driven UI** — the UI structure and content are driven by a data array. To add a new lab to the gallery, add one object to `labs`. The component renders it automatically.

This is a preview of the registry pattern (lesson 022): in the real open-calc platform, labs register themselves into a central list. The shell reads that list and renders the appropriate component for the current route. Adding a lab means registering it — no changes to the shell, no changes to the routing logic, no changes to the gallery component.

The `labs` array in this lesson is a simple static version of that registry. The structure (id, title, description, category) matches the real lab configuration objects in `src/`.

---

## Connect the Pieces

**Connection to lesson 008:** In the imperative calculator, adding a new "category" indicator to the history items would require modifying `renderHistory()` and potentially other functions. With `LabCard`, adding a new visual feature (say, a star rating) means adding one prop and one JSX element inside `LabCard`. Nothing else changes.

**Connection to lesson 013:** The `onLaunch` function prop currently only logs. When state is added (lesson 013), clicking a lab card will update the application's active lab state, which will change what component renders in the main area.

**Connection to lesson 022:** The `labs` array here maps to the lab registry. Each object in the array is a lab's registration record. The registry in lesson 022 is the same data structure, dynamically assembled from module imports instead of a hardcoded array.

**Connection to lesson 023:** TypeScript gives the `LabCard` props interface a formal type. Without TypeScript, if a caller passes `difficulty="expert"` (not in the lookup table), the component silently renders with the default style. With TypeScript, `difficulty="expert"` is a compile error.

---

## What Breaks Without This

**Not providing a required prop:**

```jsx
<LabCard title="Robot Arm" />
```

`description`, `category`, `difficulty`, and `onLaunch` are all `undefined`. The JSX renders `{undefined}` (nothing) where `description` should go. The category lookup `categoryColors[undefined]` returns `undefined`, triggering the `??` fallback. The destructuring `const { bg, text } = undefined` would crash — the `??` prevents this.

With TypeScript (lesson 023), missing required props are a compile error. Without TypeScript, they render as missing content — a visual error, not a crash.

**Passing the wrong type:**

```jsx
<LabCard title={42} description={null} category="math" difficulty="beginner" />
```

`{42}` renders as the text "42" — React renders numbers as text. `{null}` renders as nothing. The component renders without crashing because React tolerates most types in JSX. The visual result is wrong (the title is a number), but no error is thrown.

**Mutating props inside the component:**

```javascript
// Wrong — props are read-only
function LabCard(props) {
  props.title = 'Overridden'  // do not do this
}
```

React props are conceptually immutable — the child component receives them but should not modify them. Mutating `props` modifies the object passed from the parent, but React does not detect this mutation and does not re-render. The parent's data is corrupted; the UI shows stale values. React's model assumes props are not mutated; violations produce subtle, hard-to-track bugs.

In practice, React in strict mode will freeze props objects in development to prevent mutation. Attempting to mutate would throw a `TypeError: Cannot assign to read only property`.

---

## Definition of Done

- [ ] `src/LabCard.jsx` exists with `title`, `description`, `category`, `difficulty`, `onLaunch` props
- [ ] Default prop values are defined for `category`, `difficulty`, and `onLaunch`
- [ ] `src/App.jsx` renders six lab cards from the `labs` array
- [ ] Opening `localhost:5173` shows a responsive grid of six cards with different colours
- [ ] Clicking "Launch Lab" on any card logs "Launching lab: [id]" to the console
- [ ] You can explain why `onLaunch` is a function prop rather than having `LabCard` manage the click directly
- [ ] You can explain what `key={lab.id}` does and why `key={index}` would be worse here
- [ ] You can explain why the `labs` array is defined outside the component rather than inside it
- [ ] You can explain why `?? { bg: '#f5f5f5', text: '#616161' }` is safer than not having it
- [ ] Git commit:
  ```
  git add src/LabCard.jsx src/App.jsx
  git commit -m "Add LabCard component and data-driven lab gallery

  LabCard is a pure function of its props: title, description,
  category, difficulty, onLaunch. Six labs render from one component.
  App composes cards from the labs array with onLaunch closures.
  Preview of the registry pattern: add to data array, UI updates."
  ```
