# 013 — What Is State?

*The concept of mutable application data, why components need it, and what React's state model means*

---

## What You Will Build

You will convert the static lab gallery from lesson 012 into an interactive one: clicking a lab card transitions the view from the gallery to a "lab detail" screen. The active lab's name appears in the header. Clicking "Back" returns to the gallery. No page reload. No URL change yet.

The mechanism that makes this possible is **state**: a piece of data that, when it changes, causes the UI to re-render.

---

## What You Need to Know First

Lesson 012 — Component Composition. You have the complete layout with `AppShell`, `AppHeader`, `ContentArea`, `Card`, and `LabCard`. This lesson adds interactivity to that layout.

---

## The Lesson

### What state is

In lesson 011, `LabCard` received `onLaunch` as a function prop and called it when clicked. In `App`, the handler logged the lab ID. Nothing visible changed.

Why did nothing change? Because `App` has no way to re-render itself based on what was clicked. A regular variable does not cause re-renders:

```javascript
export default function App() {
  let activeLabId = null  // regular variable

  function handleLaunch(labId) {
    activeLabId = labId  // this assignment does nothing visible
    console.log('Changed activeLabId to:', activeLabId)
  }

  // The JSX always renders the same thing because React only renders
  // when it is told to — and changing a regular variable does not tell it.
  return <div>...</div>
}
```

The component renders once when it mounts. From that point, React does not know that `activeLabId` changed — React never reads the variable again unless the component re-renders. The component re-renders only when its parent re-renders or when its **state** changes.

**State** is a value managed by React, not by a regular variable. When state changes, React schedules a re-render of the component that owns the state. On re-render, the component function runs again, reads the new state value, and returns new JSX. React diffs the new JSX against the previous output and updates the DOM.

This is the mechanism that makes the UI reactive — the UI reacts to state changes.

---

**CS lens — mutable state and the observer pattern:**

**Mutable state** is data that can change over the lifetime of a program. In functional terms, a component with state is no longer a pure function: the same component function, called twice, can return different JSX depending on the current state.

React's state model uses the **observer pattern**: the UI (the observer) registers an interest in a piece of state. When the state changes, the observer (React's reconciler) is notified and updates the UI.

In React, you do not set up this observation explicitly. When you use `useState` (lesson 014) to declare state, React automatically registers the component as an observer. When you call the state setter, React marks the component as needing re-render (the notification) and schedules a re-render on the next animation frame.

The pattern is: state → UI. State changes → UI updates. The UI never directly modifies state (unidirectional data flow). State changes are always initiated by event handlers or effects, never by rendering.

---

**SE lens — state as the source of truth:**

In lesson 008 (imperative DOM), the state was split between JavaScript variables (`currentExpression`, `history`, `isError`) and the DOM (the element text contents). Two sources of truth for the same data.

In React's model, there is **one source of truth**: the state variable. The DOM is always derived from state by the render function. The DOM is never read to make decisions. This is the "single source of truth" principle.

For the lab gallery: the question "which lab is currently active?" has one answer: the state variable `activeLabId`. The header breadcrumb is derived from it. The content area is derived from it. There is no ambiguity about which lab is open — you check the state variable, not the DOM.

This is why the imperative approach accumulated bugs over time: two sources of truth (variables + DOM) could diverge. The React model makes that impossible — the DOM is output, never input.

---

### How state changes cause re-renders

Before writing the code, understand the sequence:

1. `App` renders. `activeLabId` is `null`. JSX shows the gallery.
2. User clicks "Launch Lab" on the Robot Arm card.
3. `handleLaunch('robot-arm')` is called.
4. `handleLaunch` calls the state setter with `'robot-arm'`.
5. React marks `App` as needing re-render.
6. React calls the `App` function again.
7. Inside `App`, `activeLabId` is now `'robot-arm'`.
8. `App` returns JSX that shows the lab detail view.
9. React diffs the new JSX against the gallery JSX.
10. React updates the DOM: replaces the gallery with the lab detail.
11. The browser repaints.

The key insight: **the component function runs again** (step 6). This is how React achieves "reactive" UI — not by patching variables in place, but by re-running the render function with new state, producing a new description, and reconciling the DOM.

This means everything you compute inside the component function is recomputed on every render. The JSX you return is recomputed. Conditional expressions are re-evaluated. `.map()` calls run again. The values may be the same (React's reconciler optimises this) or different. Either way, the function runs fresh.

---

**CS lens — the rendering model and closures:**

When `App` renders, every variable and function defined inside `App` is a closure over the state at the time of that render:

```javascript
function App() {
  const [activeLabId, setActiveLabId] = useState(null)

  // handleLaunch is defined fresh each render
  function handleLaunch(labId) {
    setActiveLabId(labId)  // captures setActiveLabId from this render's closure
  }

  // JSX captures handleLaunch from this render's closure
  return <LabCard onLaunch={() => handleLaunch(lab.id)} />
}
```

When `handleLaunch` is called 200ms after the render (when the user clicks), it uses `setActiveLabId` from the closure of the render that produced it. `setActiveLabId` is stable across renders (React guarantees this), so the closure captures the correct setter.

State values in closures behave differently — they capture the value at the time of render, not the current value. This produces the "stale closure" problem (covered in lesson 016 when we discuss `useEffect`). For now: event handlers accessing state from closures is safe because event handlers run synchronously before the next render.

---

### Design the state structure

Before writing code, identify what state the `App` needs.

Question: "What data, if it changed, would require the UI to update?"

1. **Which lab is active** — determines whether to show the gallery or the lab detail
2. That is all.

The lab list itself does not change — it is static configuration data, not state. The header text is derived from the active lab ID — not separate state. The lab detail content is derived from the active lab ID — not separate state.

A common mistake when first learning state is to store derived values as state:

```javascript
// Wrong — derived values as state
const [activeLabId, setActiveLabId] = useState(null)
const [activeLabTitle, setActiveLabTitle] = useState('')  // derived
const [isGalleryVisible, setIsGalleryVisible] = useState(true)  // derived
```

`activeLabTitle` is always derivable from `activeLabId` (look it up in the `labs` array). `isGalleryVisible` is always `activeLabId === null`. Storing derived values as state requires keeping them in sync — the state-render coordination problem from lesson 008 applied to React state.

The principle: **minimise state to the values that cannot be derived from other state or props.** Then derive everything else.

```javascript
// Correct — one state, two derived values
const [activeLabId, setActiveLabId] = useState(null)
const activeLab    = labs.find((lab) => lab.id === activeLabId) ?? null  // derived
const isShowingLab = activeLabId !== null  // derived
```

When `activeLabId` changes, `activeLab` and `isShowingLab` automatically compute the correct values on the next render, without any synchronisation logic.

---

**SE lens — state minimisation and accidental complexity:**

Over-specified state is a form of **accidental complexity** — complexity introduced by the implementation choice rather than inherent in the problem.

The problem requires: "show the gallery when no lab is selected, show the lab when one is selected." That problem has one variable: which lab is selected. An implementation with three state variables (`activeLabId`, `activeLabTitle`, `isGalleryVisible`) has three variables — all three must be updated together, all three must be consistent.

Minimising state is a design skill: identifying the irreducible set of values that determine the application's state space. Every state variable beyond the minimum adds synchronisation complexity. Every synchronisation adds a potential inconsistency.

---

### Update App.jsx with a state-driven view

This lesson introduces `useState` for the first time. The full explanation of `useState` is in lesson 014. Here, focus on the state concept — the mechanics are preview.

```jsx
// src/App.jsx

import { useState } from 'react'
import AppShell    from './AppShell.jsx'
import AppHeader   from './AppHeader.jsx'
import ContentArea from './ContentArea.jsx'
import Card        from './Card.jsx'
import LabCard     from './LabCard.jsx'

const labs = [
  { id: 'robot-arm',      title: 'Robot Arm Simulator',       description: 'Program a 3-axis robot arm using real MATLAB and Python commands. Complete 10 engineering missions.',          category: 'code',    difficulty: 'intermediate' },
  { id: 'rubiks-cube',    title: "Rubik's Cube Solver",       description: "Explore group theory through the Rubik's Cube. Learn the rotation matrix algorithm that powers every solver.", category: 'math',    difficulty: 'advanced'     },
  { id: 'space-invaders', title: 'Space Invaders',            description: 'Build a fully functional Space Invaders game from scratch. Game loops, collision detection, sprite animation.',  category: 'code',    difficulty: 'intermediate' },
  { id: 'linear-algebra', title: 'Linear Algebra Visualiser', description: 'See matrix multiplication, eigenvectors, and transformations in real time.',                                   category: 'math',    difficulty: 'beginner'     },
]

function LabGallery({ labs, onLaunch }) {
  return (
    <Card padding="24px 32px" elevation="raised">
      <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>Labs</h1>
      <p style={{ margin: '0 0 24px', color: '#666' }}>{labs.length} interactive labs available</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '16px',
      }}>
        {labs.map((lab) => (
          <LabCard
            key={lab.id}
            title={lab.title}
            description={lab.description}
            category={lab.category}
            difficulty={lab.difficulty}
            onLaunch={() => onLaunch(lab.id)}
          />
        ))}
      </div>
    </Card>
  )
}

function LabDetail({ lab, onBack }) {
  return (
    <Card padding="24px 32px" elevation="raised">
      <button
        onClick={onBack}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#1a1a2e',
          fontSize: '14px',
          padding: '0',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        ← Back to Labs
      </button>

      <h1 style={{ margin: '0 0 8px', fontSize: '22px' }}>{lab.title}</h1>
      <p style={{ margin: '0 0 24px', color: '#666', lineHeight: 1.6 }}>{lab.description}</p>

      <div style={{ padding: '60px 24px', background: '#f8f9fa', borderRadius: '8px', textAlign: 'center', color: '#999' }}>
        <p style={{ margin: 0 }}>Lab content loads here.</p>
        <p style={{ margin: '8px 0 0', fontSize: '13px' }}>
          (Lesson 022 wires in the real component)
        </p>
      </div>
    </Card>
  )
}

export default function App() {
  const [activeLabId, setActiveLabId] = useState(null)

  const activeLab    = labs.find((lab) => lab.id === activeLabId) ?? null
  const isShowingLab = activeLabId !== null

  return (
    <AppShell>
      <AppHeader
        platformName="my-platform"
        activeLabName={activeLab?.title ?? null}
      />
      <ContentArea>
        {isShowingLab && activeLab !== null
          ? <LabDetail lab={activeLab} onBack={() => setActiveLabId(null)} />
          : <LabGallery labs={labs} onLaunch={(id) => setActiveLabId(id)} />
        }
      </ContentArea>
    </AppShell>
  )
}
```

**Walkthrough:**

`import { useState } from 'react'` — imports the `useState` hook from React. Hooks are functions that let components access React features (state, side effects, context). The name convention is `use...`. Hooks can only be called inside component functions, at the top level (not inside loops or conditionals).

`const [activeLabId, setActiveLabId] = useState(null)` — declares a state variable. `useState` returns an array of two values: the current state value and a setter function. Array destructuring assigns them to `activeLabId` and `setActiveLabId`. The argument to `useState` (`null`) is the **initial value** — what the state is on first render.

This is a preview. Lesson 014 covers `useState` in detail. For now: `activeLabId` is the current value; `setActiveLabId(newValue)` changes it and triggers a re-render.

`const activeLab = labs.find((lab) => lab.id === activeLabId) ?? null` — derived value. `Array.find()` returns the first element for which the callback returns `true`, or `undefined` if none is found. `?? null` converts `undefined` to `null` (preference for explicit `null` over `undefined` for "no value").

`activeLab?.title` — the **optional chaining operator** `?.`. If `activeLab` is `null` or `undefined`, the expression short-circuits and returns `undefined` instead of throwing a `TypeError`. `activeLab?.title` is safe whether or not `activeLab` is null. `?? null` converts the resulting `undefined` to `null`.

`{isShowingLab && activeLab !== null ? <LabDetail .../> : <LabGallery .../>}` — conditional rendering. If `isShowingLab` is `true` and there is an active lab, renders `LabDetail`. Otherwise renders `LabGallery`. The `&& activeLab !== null` guard prevents rendering `LabDetail` with a null lab — a defensive check.

`onBack={() => setActiveLabId(null)}` — a function prop. When the back button is clicked in `LabDetail`, it calls this function, which sets `activeLabId` back to `null`. This re-renders `App`, `isShowingLab` becomes `false`, and the gallery renders.

---

**CS lens — state as a finite state machine:**

The `App` component has two visible states: gallery (no lab selected) and detail (lab selected). The transitions are: `onLaunch(id)` → gallery to detail, `onBack()` → detail to gallery.

This is a **finite state machine (FSM)** — a computational model with a fixed set of states, transitions between states triggered by events, and outputs (UI) determined by the current state.

The state machine model is useful for thinking about UI correctness: are all transitions handled? Can the machine reach an invalid state? For this simple machine, the answer is clearly yes and no — there are two states, two transitions, and no invalid states (the initial state `null` and any valid lab ID are both handled).

Larger applications have more complex state machines. Lesson 017 (derived state) connects directly to this: computed values are the FSM's output function — given a state, produce a value.

---

**SE lens — extracting components by responsibility:**

`LabGallery` and `LabDetail` are extracted as separate functions rather than defined inline in `App`. Each has one responsibility:

- `LabGallery` — renders the grid of lab cards. Receives `labs` and `onLaunch`. Has no concept of state.
- `LabDetail` — renders the detail view for a single lab. Receives `lab` and `onBack`. Has no concept of state.
- `App` — owns the state and decides which view to show. Passes relevant data and callbacks.

The state management is in one place (`App`). The rendering is in separate components. This separation makes each component independently understandable: `LabDetail` can be read without understanding how `App` decides when to show it.

---

Open `localhost:5173`. Click any "Launch Lab" button. The gallery disappears; the detail view appears. The header updates with the lab name. Click "← Back to Labs" — the gallery reappears. No page reload. No URL change. State change causing UI transition.

---

## Connect the Pieces

**Connection to lesson 008:** The state variables `currentExpression`, `history`, and `isError` in the imperative calculator are the same concept as `activeLabId` — mutable values that drive UI. The difference: in lesson 008, you manually called render functions after changing them. Here, React handles re-rendering automatically.

**Connection to lesson 014:** `useState` is previewed here. Lesson 014 covers the full mechanics: what happens on initial render, how the state value is preserved across renders, what happens when you call the setter, batched updates, and the functional update form.

**Connection to lesson 018:** When React Router is added, navigating between gallery and detail will also update the URL, so users can link to specific labs and the browser back button works. The state-driven navigation here is the foundation.

**Connection to lesson 022:** `LabDetail` currently shows a placeholder. Lesson 022 replaces the placeholder with the actual lab component loaded from the registry.

---

## What Breaks Without This

**Changing a regular variable instead of calling the setter:**

```javascript
function App() {
  let activeLabId = null  // regular variable, not state

  function handleLaunch(labId) {
    activeLabId = labId  // does not trigger re-render
  }

  // App never re-renders after handleLaunch is called.
  // The gallery always shows. The variable changes, the UI does not.
}
```

This is the most common React beginner mistake. The variable changes; the UI does not update. The fix is always: use `useState` and call the setter.

**Setting state inside the render function (infinite loop):**

```javascript
function App() {
  const [count, setCount] = useState(0)
  setCount(count + 1)  // called every render → triggers re-render → called again → ...
  return <div>{count}</div>
}
```

```
Warning: Too many re-renders. React limits the number of renders to prevent an infinite loop.
```

State setters must only be called in event handlers or effects (lesson 016), never directly in the render function. Calling a setter in the render function triggers a re-render, which calls the setter again, producing an infinite loop. React detects this and throws an error.

**Relying on the state value immediately after calling the setter:**

```javascript
function handleLaunch(labId) {
  setActiveLabId(labId)
  console.log(activeLabId)  // still null! state update is asynchronous
}
```

`setActiveLabId` does not immediately update `activeLabId`. It schedules a re-render. The next time `App` runs, `activeLabId` will have the new value. In the current event handler, `activeLabId` still holds the old value.

This is one of the most confusing aspects of React state for developers coming from imperative backgrounds. The fix: if you need the new value inside the same handler, use the variable you are setting: `const newLabId = labId; setActiveLabId(newLabId); use(newLabId)`.

---

## Definition of Done

- [ ] `src/App.jsx` has `const [activeLabId, setActiveLabId] = useState(null)`
- [ ] `LabGallery` and `LabDetail` are extracted as separate component functions
- [ ] Clicking "Launch Lab" transitions to the lab detail view
- [ ] The header shows the active lab name when a lab is open
- [ ] Clicking "← Back to Labs" returns to the gallery
- [ ] You can explain why a regular variable (`let activeLabId`) does not cause re-renders
- [ ] You can explain why `activeLab` and `isShowingLab` are derived values rather than state
- [ ] You can explain the state machine model: two states, two transitions, no invalid states
- [ ] You can explain what happens when `setActiveLabId(null)` is called
- [ ] Git commit:
  ```
  git add src/App.jsx
  git commit -m "Add state-driven view switching between gallery and lab detail

  App owns a single activeLabId state. Null = gallery, ID = detail.
  activeLab and isShowingLab are derived, never stored separately.
  LabGallery and LabDetail are pure components receiving data + callbacks.
  Clicking Launch/Back transitions views without page reload."
  ```
