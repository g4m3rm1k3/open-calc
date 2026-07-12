---
series: react-fundamentals
level: 0
title: What React Is and Why It Exists
lang: javascript
---

# What React Is and Why It Exists

React is a JavaScript library for building user interfaces. Before understanding what React does, you need to understand what the problem was that made it necessary: the DOM is slow, stateful, and increasingly complex to manage directly.

React was created at Facebook in 2013 to solve a specific problem: as web applications became more dynamic (updating parts of the page in response to user actions without full page reloads), the code for keeping the UI in sync with the application's data became increasingly complex and error-prone. By the end of this lesson you will understand the core problem React solves, the virtual DOM model, the component mental model, and the two types of data in a React application.

## The problem: manual DOM synchronisation

```javascript
// WITHOUT REACT: you update the DOM manually to reflect data changes
let count = 0

function updateDisplay() {
  // Every time data changes, you must manually find and update every DOM element
  document.getElementById('count-display').textContent = count
  document.getElementById('increment-btn').disabled = count >= 10
  document.getElementById('status').textContent = count === 10 ? 'Maximum reached' : ''
  // As the app grows, this function grows without bound.
  // Forget to update one element → it shows stale data.
  // Data and DOM are two separate things you have to keep in sync by hand.
}

document.getElementById('increment-btn').addEventListener('click', () => {
  count++
  updateDisplay()  // you must remember to call this
})

updateDisplay()    // and call it on initial render too
```

```text
THE DOM SYNCHRONISATION PROBLEM:
  
  As an app grows:
  → More state (count, loading, error, user, selectedTab, isOpen, ...)
  → More DOM elements that depend on that state
  → Every state change must manually update every relevant DOM element
  → Missing one update = UI shows wrong data
  → Order of updates matters → bugs from stale reads
  
  Facebook's news feed had hundreds of pieces of state.
  Each state change needed to update many parts of the UI.
  Manual synchronisation led to bugs where the Like count showed different
  values in different parts of the page after a click.
  
  ROOT CAUSE: data (application state) and display (DOM) are separate things
  that must be manually kept in sync. As complexity grows, this doesn't scale.
```

## React's solution: UI as a function of state

React solves this by making the UI a **function of state**: `UI = f(state)`. You describe what the UI should look like for any given state. React figures out how to make the DOM match that description.

```javascript
// WITH REACT: you describe the UI, React handles the DOM
function Counter({ count }) {
  // This is a description of what the UI should look like when count = N.
  // It is NOT instructions for updating the DOM.
  // React reads this and produces the correct DOM.
  return (
    <div>
      <span>{count}</span>
      <button disabled={count >= 10}>Increment</button>
      {count === 10 && <p>Maximum reached</p>}
    </div>
  )
}
```

```text
UI = f(state) — the fundamental React model:

  state        →  UI description (JSX)  →  React  →  DOM
  { count: 5 }    <span>5</span>             ↓         <span>5</span>
                  <button>Increment</button   ↓         <button>Increment</button>
  
  When state changes:
  { count: 6 }    React re-runs f(state)
                  Compares new description with previous
                  Updates ONLY the parts of the DOM that changed
                  → <span>6</span> updates; button is unchanged
  
  You no longer say "update the count display to 6."
  You say "state is now { count: 6 }" and React handles the display.
  
  INVARIANT: at any point in time, the DOM reflects the current state.
  You cannot forget to update a DOM element — there are no manual updates.
```

**CS lens:** The `UI = f(state)` model is **declarative programming** — you describe the desired outcome (what the UI should look like) not the steps to achieve it (update this element, then update that one). Imperative DOM manipulation describes the steps. React translates your declarative description into the imperative DOM operations, insulating you from the complexity. SQL is declarative for the same reason: you describe the desired rows, not the algorithm for retrieving them. The database optimises the algorithm. React optimises the DOM updates.

## The virtual DOM

React doesn't update the real DOM directly on every state change. It maintains a virtual DOM — a lightweight JavaScript representation of the DOM. When state changes, React:

1. Runs `f(newState)` to get a new virtual DOM tree
2. **Diffs** the new virtual DOM against the previous one (the reconciliation algorithm)
3. Computes the minimal set of real DOM changes needed
4. Applies only those changes to the real DOM

```text
WHY THE VIRTUAL DOM:

  DIRECT DOM UPDATES ARE SLOW because:
    → Every DOM read (offsetHeight, getComputedStyle) forces a layout recalculation
    → Every DOM write triggers reflow (recalculate positions) and repaint (redraw pixels)
    → Reading then writing triggers "layout thrashing" — reads and writes alternate,
      each invalidating the last layout, causing cascading recalculations
  
  VIRTUAL DOM IS FAST because:
    → Virtual DOM is plain JavaScript objects — reads and writes are instant
    → React batches all changes, then applies them to the real DOM in one pass
    → Only changed parts of the real DOM are updated — not the whole tree
  
  RECONCILIATION (the diff algorithm):
    React compares trees by type and key:
    → Same type, same position → update props/children if different
    → Different type or missing → unmount old, mount new
    → Lists: use the `key` prop to identify elements across renders
```

## Components

React applications are built from **components**. A component is a function that takes data as input (called props) and returns a description of the UI (JSX).

```javascript
// A component is a function. By convention, component names are PascalCase.
function UserCard({ name, email, role }) {
  // props: data passed in from the parent component
  return (
    <div className="user-card">
      <h2>{name}</h2>
      <p>{email}</p>
      <span className={`badge badge-${role}`}>{role}</span>
    </div>
  )
}

// USAGE: components are used like HTML tags in JSX
function UserList({ users }) {
  return (
    <ul>
      {users.map(user => (
        <UserCard
          key={user.id}           // key prop: required for lists (identifies elements)
          name={user.name}
          email={user.email}
          role={user.role}
        />
      ))}
    </ul>
  )
}
```

```text
COMPONENT MENTAL MODEL:
  
  A component is a function: props → JSX
  Props are the component's inputs (like function arguments).
  JSX is the component's output (the UI description).
  
  COMPONENT TREE:
    App
    ├── Header
    │   └── NavLink (×3)
    ├── UserList
    │   └── UserCard (×N)
    └── Footer
  
  Data flows DOWN: parent passes data to children via props.
  Events flow UP: children call functions (passed as props) to notify parents.
  This one-way data flow makes apps predictable: you always know where data comes from.
  
  COMPONENT REUSE:
    A component is defined once, used anywhere.
    <UserCard> can appear in search results, in a dropdown, in a modal.
    All three show the same UI from the same logic.
    Change UserCard once → all three update.
```

## JSX

JSX is a syntax extension that looks like HTML but is actually JavaScript. Every JSX expression is a call to `React.createElement`.

```javascript
// This JSX:
const element = <h1 className="title">Hello, {name}</h1>

// Is compiled to this JavaScript:
const element = React.createElement('h1', { className: 'title' }, 'Hello, ', name)

// JSX rules (differs from HTML):
// className instead of class (class is a JS keyword)
// htmlFor instead of for (for is a JS keyword)
// Event names are camelCase: onClick not onclick, onChange not onchange
// Self-closing tags must close: <img /> not <img>
// JavaScript expressions in {}: { count }, { user.name }, { isLoggedIn && <Nav /> }
```

**SE lens:** JSX is an application of the **principle of co-location**: the structure (JSX), style (className → CSS), and behaviour (onClick) of a component live in one file. This is the opposite of traditional web development where HTML, CSS, and JavaScript live in separate files. Co-location makes components self-contained: to understand or change a component, you read one file. Traditional separation of concerns by file type forces you to trace across three files to understand one UI element. React's component model is a different, more maintainable separation of concerns: by feature/component rather than by technology.

**Common mistakes:**
- Thinking of components as objects — a component is a function, not an object. React calls it. You don't instantiate it with `new`. Each call with the same props returns the same JSX (for pure components). Thinking of it as an object leads to trying to call methods on it directly or mutate its properties.
- Forgetting `key` for list items — rendering `items.map(item => <Item item={item} />)` without `key={item.id}` produces the React warning "Each child in a list should have a unique key prop." Without keys, React can't identify which list item corresponds to which DOM element across renders. If items reorder, React will render incorrect items because it can't track them.
- Mutations in JSX — `{count++}` inside JSX runs on every render and is a side effect inside a pure function. JSX should be a pure description. Side effects (data fetching, timers, mutations) belong in `useEffect`.

**Debug tip:** React DevTools is a browser extension (available for Chrome and Firefox). Install it, then open DevTools → Components tab. You can inspect the component tree, see the current props and state of any component, and identify which component renders a particular DOM element. When a UI shows wrong data, use React DevTools to find the component responsible and inspect its props/state to locate where the wrong value came from.

## Challenge: jsxConceptCheck

Verify understanding of the React model.

```challenge
function reactConceptCheck(question) {
  // Returns the correct answer string for each conceptual question.
  //
  // 'what-does-react-render-return'
  //   → 'jsx'   (React components return JSX — a description of the UI)
  //
  // 'where-does-data-flow'
  //   → 'down'  (Data flows down from parent to child via props)
  //
  // 'what-triggers-rerender'
  //   → 'state-change'  (A re-render is triggered by a state change)
  //
  // 'purpose-of-key-prop'
  //   → 'identity'  (The key prop identifies list elements across renders)
  //
  // 'what-is-jsx'
  //   → 'syntax-sugar'  (JSX compiles to React.createElement calls)
}
```

```test
assert reactConceptCheck('what-does-react-render-return') === 'jsx'
assert reactConceptCheck('where-does-data-flow') === 'down'
assert reactConceptCheck('what-triggers-rerender') === 'state-change'
assert reactConceptCheck('purpose-of-key-prop') === 'identity'
assert reactConceptCheck('what-is-jsx') === 'syntax-sugar'
```
