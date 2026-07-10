# 009 — React Components

*The component model, what a component is, and how React renders one to the DOM*

---

## What You Will Build

You will write a React component that renders the same calculator display from lesson 008 — current expression, display value, error state — but with no render function calls, no manual DOM operations, and no coordination logic. The component will describe what the UI looks like for any given state. React will handle translating that description into DOM operations.

By the end of this lesson: a `<CalculatorDisplay>` component is visible in the browser at `localhost:5173`, and you understand exactly how it got there.

---

## What You Need to Know First

Lesson 007 — Build Tools and the Dev Server. Vite is running and the project has `src/App.jsx` as its entry component. This lesson adds a component to that project.

Lesson 008 — The DOM Manipulation Problem. This lesson references the specific problems from 008 and shows how the component model addresses them.

---

## The Lesson

### What a component is

In lesson 008, you had functions that produced DOM nodes:

```javascript
function renderDisplay() {
  displayEl.textContent = currentExpression || '0'
}
```

This function is **imperative**: it mutates an existing element. Its output is a side effect — it modifies the DOM.

A React component is a function that **returns a description** of what the UI should look like:

```jsx
function CalculatorDisplay({ expression, isError }) {
  const displayValue = isError ? 'Error' : (expression || '0')
  return (
    <div className="display">
      {displayValue}
    </div>
  )
}
```

This function does not touch the DOM. It takes input (the `expression` and `isError` values, received as a **props object**) and returns a **React element** — a description of what should be rendered.

React reads that description and performs the DOM operations. This is the fundamental shift.

---

**CS lens — a component as a pure function:**

A **pure function** has two properties:
1. Given the same inputs, it always returns the same output
2. It produces no side effects (does not modify anything outside its own scope)

A well-written React component is a pure function of its props. Given the same `expression` and `isError`, it always returns the same JSX tree. It does not read from or write to the DOM directly. It does not modify any variables outside its own scope.

Pure functions are predictable, testable, and composable. To test a pure function, you call it with known inputs and verify the output. The function has no hidden state that can make its output unpredictable.

In lesson 027, you will write unit tests for this component. Because it is a pure function of its props, the test is straightforward: call `render(<CalculatorDisplay expression="1+2" isError={false} />)` and assert the rendered output contains "1+2".

---

**SE lens — declarative vs imperative and why it scales:**

From lesson 008, adding a memory feature to the imperative calculator required updating 6 handlers. In the component model, adding a new piece of state and a new UI element requires:

1. Add `memory` to the state that the parent component manages
2. Pass `memory` as a prop to a `<MemoryDisplay>` component
3. Write `<MemoryDisplay>` as a function that returns JSX

Step 3 is self-contained. `MemoryDisplay` does not know about or interact with any other component. If it is wrong, the error stays inside `MemoryDisplay`. The parent's event handlers do not change — they update state, and React automatically re-renders every component whose props changed.

The per-feature cost in the imperative model grows with the number of existing handlers. In the component model, it stays constant: one new component, one state variable, one prop passed to the parent.

---

### JSX: the short version

Before writing the component, you need to understand what JSX is producing.

Lesson 010 covers JSX in full. For now: JSX is **syntactic sugar** — a shorter syntax for function calls that already exist in JavaScript.

When Vite's React plugin encounters JSX:

```jsx
<div className="display">
  <span>{displayValue}</span>
</div>
```

It compiles it to:

```javascript
React.createElement(
  'div',
  { className: 'display' },
  React.createElement('span', null, displayValue)
)
```

`React.createElement(type, props, ...children)` returns a plain JavaScript object — a **React element** — that describes what should be rendered:

```javascript
{
  type: 'div',
  props: {
    className: 'display',
    children: {
      type: 'span',
      props: { children: displayValue }
    }
  }
}
```

This object is not a DOM node. It is a description of a DOM node. React reads this description and decides what DOM operations to perform. If the previous render produced the same structure with only `displayValue` different, React updates only the text node — not the `<div>`, not the `<span>`, just the text.

---

**CS lens — the virtual DOM:**

The tree of React elements produced by a render is called the **virtual DOM** — a lightweight JavaScript representation of the DOM. It is "virtual" because it exists only in memory, not in the browser's document.

When state changes and a component re-renders, React produces a new virtual DOM tree. It then **diffs** the new tree against the previous tree using a reconciliation algorithm. The result of the diff is a minimal set of DOM operations — the fewest DOM changes that will transition from the old tree to the new tree.

This is what eliminates the rebuilding problem from lesson 008. In the imperative calculator, `renderHistory()` deleted and recreated all history items on every update. React's reconciliation adds only the new item because the diff shows that all existing items are unchanged.

The reconciliation algorithm runs in O(n) time (where n is the number of nodes in the tree) using two heuristics:
1. Elements of different types produce completely different trees (no attempt to diff across types)
2. The `key` prop identifies elements across renders (a list item with `key="abc"` in the old tree maps to `key="abc"` in the new tree)

You will see `key` appear in lesson 016 when rendering lists.

---

### Create the CalculatorDisplay component

Create `src/CalculatorDisplay.jsx`:

```jsx
// src/CalculatorDisplay.jsx

export default function CalculatorDisplay({ expression, isError }) {
  const displayValue = isError
    ? 'Error'
    : expression !== ''
      ? expression
      : '0'

  const displayColor = isError ? '#ff6b6b' : '#ffffff'

  return (
    <div style={{
      background: '#1a1a2e',
      color: displayColor,
      padding: '20px 16px 12px',
      textAlign: 'right',
      borderRadius: '8px 8px 0 0',
    }}>
      <div style={{ fontSize: '13px', color: '#aaa', minHeight: '18px', marginBottom: '4px' }}>
        {expression !== '' ? `${expression} =` : ''}
      </div>
      <div style={{ fontSize: '36px', fontWeight: 300, letterSpacing: '-1px' }}>
        {displayValue}
      </div>
    </div>
  )
}
```

**Walkthrough:**

`export default function CalculatorDisplay({ expression, isError })` — the function name `CalculatorDisplay` starts with a capital letter. In React, **components must start with a capital letter**. When JSX sees `<div>`, it calls `React.createElement('div', ...)` — a string, for a built-in HTML element. When JSX sees `<CalculatorDisplay>`, it calls `React.createElement(CalculatorDisplay, ...)` — a reference to the function you defined. Lowercase names are HTML elements; capitalised names are components.

`{ expression, isError }` — **destructuring** in the parameter list. React passes all props as a single object: `{ expression: '1+2', isError: false }`. Destructuring unpacks that object into individual variables. This is equivalent to:

```javascript
function CalculatorDisplay(props) {
  const expression = props.expression
  const isError    = props.isError
  // ...
}
```

The destructuring syntax in the parameter list is common in React because it makes it immediately clear what props the component accepts.

`const displayValue = isError ? 'Error' : expression !== '' ? expression : '0'` — a **ternary chain** (also called a nested ternary). Reading it as English: "if isError, display 'Error'; otherwise if expression is non-empty, display the expression; otherwise display '0'." This is the same logic as `renderDisplay()` from lesson 008, but expressed as a value computation rather than a DOM mutation.

The important difference: this produces a string value that is used inside JSX. There is no `displayEl.textContent = ...`. The component returns JSX that contains this value; React writes it to the DOM.

`style={{ ... }}` — in JSX, the `style` prop accepts a JavaScript object (not a CSS string). The outer `{{ }}` means: the `{}` is JSX syntax "embed a JavaScript expression," and the inner `{}` is an object literal. CSS property names use camelCase instead of kebab-case: `backgroundColor` instead of `background-color`, `textAlign` instead of `text-align`.

The `display` value for `style` inline objects is a string: `'flex'`, `'none'`, `'block'`. Unlike `display.style.display`, which allows setting display-related properties programmatically, JSX style props are just object properties mapped to CSS.

`{expression !== '' ? \`${expression} =\` : ''}` — a conditional expression in JSX. The `{}` embeds a JavaScript expression. If `expression` is empty, this renders nothing (empty string). If non-empty, it renders the expression followed by ` =` — the preview line showing what is being evaluated.

Template literal: the backtick string `` `${expression} =` `` embeds the value of `expression` into the string. This is JavaScript template literal syntax (lesson 001). The backtick is the template literal delimiter; `${...}` is the interpolation syntax.

---

### Use the component in App.jsx

Update `src/App.jsx` to render `CalculatorDisplay`:

```jsx
// src/App.jsx

import CalculatorDisplay from './CalculatorDisplay.jsx'

export default function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '400px', margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '24px' }}>Calculator — React Version</h1>

      <div style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <CalculatorDisplay expression="123+45" isError={false} />
      </div>

      <p style={{ marginTop: '24px', color: '#666', fontSize: '14px' }}>
        The display is a React component. The values are passed as props.
        No DOM operations were written to render this.
      </p>
    </div>
  )
}
```

**Walkthrough:**

`import CalculatorDisplay from './CalculatorDisplay.jsx'` — default import. `CalculatorDisplay` exports its component as the default export. This import gives us the function under the name `CalculatorDisplay`.

`<CalculatorDisplay expression="123+45" isError={false} />` — using the component with props.

- `expression="123+45"` — the `expression` prop, passed as a string. String props use `"..."` syntax.
- `isError={false}` — the `isError` prop, passed as a boolean. Non-string props use `{...}` syntax. `{false}` embeds the JavaScript boolean `false`.
- The `/>` at the end is a **self-closing tag** — used when the component has no children. Equivalent to `<CalculatorDisplay ... ></CalculatorDisplay>`.

Open `localhost:5173`. The calculator display renders with "123+45 =" in the preview line and "123+45" in the display. The dark background and white text match the CSS from `calculator.html` in lesson 008 — same design, zero DOM manipulation code.

---

### Change the props and observe the result

Update `App.jsx` with different prop values:

```jsx
<CalculatorDisplay expression="" isError={false} />
```

The display shows "0" and the preview line is empty.

```jsx
<CalculatorDisplay expression="1/0" isError={true} />
```

The display shows "Error" in red. The preview line shows "1/0 =".

No DOM operation code changed. No `getElementById`. No `textContent` assignment. The component's output (the JSX tree) changed because its inputs (the props) changed, and React updated the DOM to match.

This is the declarative model working. The component describes what the UI looks like for any given state. React handles the transition from one state to another.

---

**CS lens — referential transparency and component purity:**

`CalculatorDisplay` is **referentially transparent**: you can substitute a call to `CalculatorDisplay({ expression: '1+2', isError: false })` with the JSX it returns and get the same result. The function has no observable side effects.

Referential transparency is a property of pure functions. It means the function can be:
- **Tested in isolation** — call it with known inputs, assert the output matches expectation
- **Memoized** — if the inputs have not changed, skip the call and return the cached output. React uses this for performance optimisation: if a component's props have not changed since the last render, React can skip re-rendering it.
- **Composed** — use it inside other components without worrying about what it does internally

This is why "components should be pure functions of their props" is a first-class principle in React. The entire optimisation and testing story relies on it.

---

**SE lens — the component as a unit of encapsulation:**

`CalculatorDisplay.jsx` contains everything needed to render the display: the layout, the styling, the display logic. If the display design changes, only `CalculatorDisplay.jsx` changes. Nothing else.

From lesson 005, encapsulation means: modules hide their internals and expose only a defined interface. `CalculatorDisplay`'s interface is `{ expression: string, isError: boolean }`. Its internal implementation (how it computes `displayValue`, what CSS it applies) is invisible to `App.jsx`.

If you change the background colour, the font size, or the expression preview format inside `CalculatorDisplay.jsx`, `App.jsx` does not change. The interface (the props) is the only contract between the two.

This is what enables independent development: one developer can work on `CalculatorDisplay` while another works on the parent layout, because the only coupling between them is the props interface.

---

### Components rendering components

The power of the component model is composition: components can render other components, building up a UI from small, testable, reusable pieces.

Add a second component to the same file to see this immediately. Add `CalculatorButton.jsx`:

```jsx
// src/CalculatorButton.jsx

export default function CalculatorButton({ label, onClick, variant = 'default' }) {
  const colours = {
    default:  { background: '#fff',     color: '#333' },
    operator: { background: '#fff3e0',  color: '#e65100' },
    equals:   { background: '#2ed573',  color: '#fff' },
    clear:    { background: '#ff9f43',  color: '#fff' },
  }

  const { background, color } = colours[variant] ?? colours.default

  return (
    <button
      onClick={onClick}
      style={{
        padding: '16px',
        fontSize: '18px',
        cursor: 'pointer',
        border: '1px solid #eee',
        background,
        color,
        borderRadius: '4px',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  )
}
```

**Walkthrough:**

`variant = 'default'` — a **default parameter**. If `variant` is not passed as a prop (or is explicitly `undefined`), it defaults to `'default'`. This makes the prop optional — callers can pass `variant="operator"` or omit it entirely.

```javascript
const colours = { ... }
```

A lookup table: a JavaScript object used as a map from variant names to colour values. This is the same pattern as `requiredElements` from lesson 008, but for styling instead of validation.

`const { background, color } = colours[variant] ?? colours.default` — two operations:

1. `colours[variant]` — **bracket notation** for property access. Equivalent to `colours.operator` when `variant` is `'operator'`. Used when the property name is a variable (not known at write time).

2. `?? colours.default` — the **nullish coalescing operator**. Returns the left side unless it is `null` or `undefined`, in which case it returns the right side. If `variant` is `'invalid'`, `colours['invalid']` is `undefined`, and `?? colours.default` returns the default colour. Prevents crashes from unknown variant names.

`onClick={onClick}` — passes the `onClick` prop to the native button element's `onClick` event handler. The native HTML button has an `onclick` attribute; in JSX, event handlers are camelCase (`onClick`). React attaches the event listener internally.

`{label}` — the component's visual content, received as a prop. In JSX, `{label}` embeds the JavaScript variable `label` as a child of the element.

---

Now update `App.jsx` to use both components:

```jsx
// src/App.jsx

import CalculatorDisplay from './CalculatorDisplay.jsx'
import CalculatorButton  from './CalculatorButton.jsx'

export default function App() {
  function handleClick(label) {
    console.log('Clicked:', label)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '400px', margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '24px' }}>Calculator — React Components</h1>

      <div style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <CalculatorDisplay expression="12+3" isError={false} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', background: '#eee' }}>
          {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map((label) => (
            <CalculatorButton
              key={label}
              label={label}
              onClick={() => handleClick(label)}
              variant={['+','-','*','/'].includes(label) ? 'operator' : label === '=' ? 'equals' : 'default'}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Walkthrough:**

`function handleClick(label)` — a function defined inside the component function. This is valid JavaScript — functions can contain other functions. In React, event handlers are commonly defined inside the component that renders the element they handle.

`console.log('Clicked:', label)` — writes to the browser console. Open developer tools to see click events. This is temporary — lessons 013 and 014 add state so clicks actually update the display.

`.map((label) => ( <CalculatorButton ... /> ))` — the `.map()` array method applies a function to each element and returns a new array. JSX can render arrays of elements. React sees the array and renders each element in order.

The function passed to `.map()` returns a `<CalculatorButton />` element for each label string. This produces an array of React elements, which JSX renders as a sequence.

`key={label}` — the `key` prop is required when rendering lists in React. React uses `key` to track which elements are which across re-renders. Without `key`, React cannot determine which element changed when the list updates — it falls back to position-based matching, which is fragile. With `key`, React can identify that the element previously at position 2 has the same key as the element now at position 3, and can move the DOM node instead of recreating it.

The key must be unique within the list and stable across renders. Using `label` is acceptable here because button labels do not change. For data from a database, use the database ID.

`variant={['+','-','*','/'].includes(label) ? 'operator' : label === '=' ? 'equals' : 'default'}` — computes the variant for each button inline. `[...].includes(label)` returns true if `label` is in the array. The nested ternary assigns `'operator'` for operators, `'equals'` for `=`, and `'default'` for digits.

Open `localhost:5173`. The calculator layout appears with the display and a 4×4 button grid. Click any button — the browser console logs "Clicked: [label]". Nothing else happens yet (no state, no calculator logic). That comes in lesson 013.

---

## Connect the Pieces

This lesson establishes the foundation for every lesson in modules 002 and 003.

**Connection to lesson 008:** The `CalculatorDisplay` component contains the same logic as `renderDisplay()` + `renderExpression()` from lesson 008 — but as a pure value computation instead of DOM mutations. The `isError ? 'Error' : expression || '0'` expression appears in both. In lesson 008 it produces a side effect (writes to DOM); here it produces a string value (used in JSX).

**Connection to lesson 014:** The `handleClick` function currently only logs. Lesson 014 adds `useState` and connects `handleClick` to state updates, turning the buttons into a working calculator.

**Connection to lesson 022:** The component model is what makes the lab registry possible. Labs are components. The registry holds references to components. The shell renders the current lab component. Components can be passed around as values (functions can be values in JavaScript) — the registry is a map from lab IDs to component functions.

**Connection to lesson 027:** `CalculatorDisplay` has no side effects and is a pure function of its props. That makes it directly testable: pass props, assert the rendered output.

---

## What Breaks Without This

**Rendering a lowercase component:**

```jsx
<calculatorDisplay expression="1+2" isError={false} />
```

React treats lowercase names as HTML element types. It calls `React.createElement('calculatordisplay', ...)`, which creates an unknown HTML element. The browser renders nothing visible and shows no error — `calculatordisplay` is an unknown element, not an error. The component function never runs.

**Forgetting `key` on list items:**

```
Warning: Each child in a list should have a unique "key" prop.
```

React logs a warning (not an error) in development. The list renders, but React's reconciliation falls back to position-based matching. If list items are reordered or removed, React may update the wrong DOM node — producing a category of subtle, hard-to-reproduce bugs where UI elements show stale content.

**Calling the component directly:**

```javascript
// Wrong — bypasses React's rendering pipeline
const element = CalculatorDisplay({ expression: '1+2', isError: false })
```

React components should always be used via JSX (or `React.createElement`), not called directly. Direct calls bypass React's rendering lifecycle, context system, and reconciliation — the component renders once and is never updated. Hooks (covered in lesson 014) throw errors when called outside React's rendering pipeline.

---

## Definition of Done

- [ ] `src/CalculatorDisplay.jsx` exists with the `expression` and `isError` props
- [ ] `src/CalculatorButton.jsx` exists with `label`, `onClick`, and `variant` props
- [ ] `src/App.jsx` renders both components
- [ ] Opening `localhost:5173` shows the calculator display and button grid
- [ ] Clicking any button logs "Clicked: [label]" to the browser console
- [ ] You can explain what a React element is (the plain object returned by `React.createElement`)
- [ ] You can explain why component names must start with a capital letter
- [ ] You can explain what the `key` prop does and what breaks without it
- [ ] You can explain how `CalculatorDisplay` solves the double-source-of-truth problem from lesson 008
- [ ] Git commit:
  ```
  git add src/CalculatorDisplay.jsx src/CalculatorButton.jsx src/App.jsx
  git commit -m "Add CalculatorDisplay and CalculatorButton components

  Display component is a pure function of expression/isError props.
  Button component accepts variant for styling without DOM manipulation.
  App composes both to produce the calculator layout.
  Replaces render coordination from lesson 008 with declarative JSX."
  ```
