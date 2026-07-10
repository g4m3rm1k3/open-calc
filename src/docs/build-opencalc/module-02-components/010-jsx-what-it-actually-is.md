# 010 — JSX: What It Actually Is

*The compilation target, why JSX is not HTML, and what `React.createElement` produces*

---

## What You Will Build

You will write a component twice: once with JSX (the normal syntax) and once with only `React.createElement` calls (no JSX). Both versions will produce identical output in the browser. Seeing the JSX-free version makes the compilation target concrete — JSX is a syntax convenience over code that already exists in plain JavaScript.

---

## What You Need to Know First

Lesson 009 — React Components. You have `<CalculatorDisplay>` and `<CalculatorButton>` working. This lesson explains exactly what those JSX tags compile to.

---

## The Lesson

### JSX is syntactic sugar

**Syntactic sugar** is a term for syntax in a programming language that does not add new capability — it provides a more convenient or readable way to express something the language could already express.

JSX is syntactic sugar over `React.createElement`. These two expressions are identical:

```jsx
// With JSX
const element = <h1 className="heading">Hello</h1>
```

```javascript
// Without JSX
const element = React.createElement('h1', { className: 'heading' }, 'Hello')
```

Vite's React plugin (the `@vitejs/plugin-react` package from lesson 007) transforms the first into the second at compile time. The browser never sees JSX — it sees the compiled JavaScript.

---

**CS lens — compilation and intermediate representations:**

A **compiler** reads source code in one language and produces code in another. Vite's React plugin is a compiler: it reads JSX (source) and produces `React.createElement` calls (target).

Between source and target, compilers often work with an **intermediate representation (IR)** — a data structure that represents the program's structure independent of syntax. For JSX, the IR is the Abstract Syntax Tree (AST): a tree where each node represents a piece of syntax (an element, a prop, a child).

The compilation pipeline for a JSX file:

1. **Tokenize** — split the text into tokens: `<`, `h1`, `className`, `=`, `"heading"`, `>`, `Hello`, `<`, `/`, `h1`, `>`
2. **Parse** — build the AST from tokens: a JSXElement node with type "h1", props `{className: "heading"}`, and children `["Hello"]`
3. **Transform** — convert each JSXElement AST node to a `React.createElement` call
4. **Generate** — output the JavaScript source code

Vite uses `esbuild` for this transformation. `esbuild` is written in Go and is significantly faster than Babel (the previous standard), but produces the same output.

---

### `React.createElement` in detail

```javascript
React.createElement(type, props, ...children)
```

Three arguments:

**`type`** — either a string (for HTML elements) or a function (for components):
- `'div'`, `'h1'`, `'button'` — built-in HTML elements, as strings
- `CalculatorDisplay`, `App` — component functions, as references

**`props`** — a plain object containing all props:
- HTML element props: `{ className: 'heading', id: 'main', onClick: handler }`
- Component props: `{ expression: '1+2', isError: false }`
- `null` if no props

**`...children`** — zero or more additional arguments, each a child element or string:
- `React.createElement('div', null, 'text')` — one text child
- `React.createElement('div', null, child1, child2)` — two children
- Children can be strings, numbers, React elements, or arrays of those

The function returns a plain JavaScript object — a **React element**:

```javascript
{
  $$typeof: Symbol(react.element),  // internal identifier
  type: 'h1',
  key: null,
  ref: null,
  props: {
    className: 'heading',
    children: 'Hello'
  }
}
```

`$$typeof` is an internal field React uses to distinguish React elements from plain objects. `Symbol(react.element)` cannot be serialised to JSON — this prevents a security vulnerability where a server sends JSON that gets treated as a React element and rendered as arbitrary markup.

`key` and `ref` are extracted from props if present. `key` becomes `element.key`, not `element.props.key`. When React compares `element.props` from two renders, it does not see `key` — it uses `element.key` for reconciliation separately.

---

### Write a component without JSX

Create `src/DisplayNoJSX.jsx`:

```jsx
// src/DisplayNoJSX.jsx
//
// CalculatorDisplay written without JSX.
// The output is identical to CalculatorDisplay.jsx.
// This file exists to make the JSX compilation target visible.

import React from 'react'

export default function DisplayNoJSX({ expression, isError }) {
  const displayValue = isError
    ? 'Error'
    : expression !== ''
      ? expression
      : '0'

  const displayColor = isError ? '#ff6b6b' : '#ffffff'

  // JSX version (for reference — not used here):
  //   return (
  //     <div style={{ background: '#1a1a2e', color: displayColor, ... }}>
  //       <div style={{ fontSize: '13px', ... }}>
  //         {expression !== '' ? `${expression} =` : ''}
  //       </div>
  //       <div style={{ fontSize: '36px', ... }}>
  //         {displayValue}
  //       </div>
  //     </div>
  //   )

  // Without JSX — identical to what the compiler produces:
  return React.createElement(
    'div',
    {
      style: {
        background: '#1a1a2e',
        color: displayColor,
        padding: '20px 16px 12px',
        textAlign: 'right',
        borderRadius: '8px 8px 0 0',
      }
    },
    React.createElement(
      'div',
      {
        style: {
          fontSize: '13px',
          color: '#aaa',
          minHeight: '18px',
          marginBottom: '4px'
        }
      },
      expression !== '' ? `${expression} =` : ''
    ),
    React.createElement(
      'div',
      {
        style: {
          fontSize: '36px',
          fontWeight: 300,
          letterSpacing: '-1px'
        }
      },
      displayValue
    )
  )
}
```

**Walkthrough:**

`import React from 'react'` — in older React (before 17), this import was required in every file using JSX because the JSX compiler produced `React.createElement(...)` — a reference to `React`, which had to be in scope. In React 17+ with the "automatic runtime," the compiler inserts the import automatically, so you do not need to write it. This file explicitly uses `React.createElement`, so the import is required here.

The outer `React.createElement('div', { style: {...} }, child1, child2)` — the first argument is the element type, the second is the props object, and the third and fourth arguments are children. Multiple children are passed as additional arguments (variadic arguments, denoted `...children` in the function signature).

The inner calls produce React elements for the preview line and the display value. Nesting `React.createElement` calls produces a tree — the same tree structure as nested JSX elements.

---

**SE lens — why JSX exists:**

Reading the JSX-free version is significantly harder than reading the JSX version. The nesting level is the same, but JSX's visual hierarchy (indented tags) maps to the DOM structure it produces. The `React.createElement` version requires reading function argument positions to understand parent-child relationships.

JSX was designed to make component structure readable at a glance. This is an engineering decision that trades one complexity (a compilation step) for another (readability at scale). For small components the difference is minor; for a component tree with ten levels of nesting, JSX is dramatically clearer.

The Vite React plugin handles the compilation step transparently — you never see `React.createElement` unless you write it yourself. The tradeoff is fully in favour of JSX for component rendering.

The exception: React elements constructed programmatically, where the type or props are not known at write time. In those cases `React.createElement` is the appropriate tool:

```javascript
// Type is determined at runtime — JSX cannot express this
const type = isHeading ? 'h1' : 'p'
const element = React.createElement(type, null, children)
```

---

### What JSX is not

JSX looks like HTML but is not HTML. Several differences matter:

**`class` vs `className`:**

```jsx
// HTML
<div class="container">

// JSX
<div className="container">
```

`class` is a reserved word in JavaScript (it declares a class). JSX is compiled to JavaScript, so it uses `className` instead. React maps `className` to the DOM property `className`, which corresponds to the HTML attribute `class`.

**`for` vs `htmlFor`:**

```jsx
// HTML
<label for="email-input">Email</label>

// JSX
<label htmlFor="email-input">Email</label>
```

Same reason: `for` is a reserved word (the `for` loop). JSX uses `htmlFor`.

**Event handler names:**

```jsx
// HTML
<button onclick="handleClick()">Click me</button>

// JSX
<button onClick={handleClick}>Click me</button>
```

HTML event attributes are all lowercase. JSX uses camelCase: `onClick`, `onChange`, `onSubmit`, `onKeyDown`, `onMouseEnter`. JSX event handlers are also JavaScript values (function references), not strings.

**Self-closing tags:**

```jsx
// HTML — these do not need closing tags
<img src="photo.jpg">
<input type="text">
<br>

// JSX — all elements must be closed
<img src="photo.jpg" />
<input type="text" />
<br />
```

In HTML, void elements (elements that cannot have children) do not need closing tags. In JSX, every element must be closed — either with a matching closing tag or a self-closing `/>`.

**Comments:**

```jsx
// Inside JSX, JavaScript comments require the {} wrapper:
<div>
  {/* This is a JSX comment */}
  <p>Content</p>
</div>

// HTML comments do NOT work in JSX:
<!-- This will cause a compilation error -->
```

JSX is inside a JavaScript expression. The only way to write a comment inside JSX is with `{/* ... */}` — a JavaScript block comment wrapped in a JSX expression.

---

**CS lens — why JSX compiles to `React.createElement` and not to DOM operations:**

`React.createElement` produces JavaScript objects (React elements), not DOM nodes. This is an intentional design.

If JSX compiled directly to `document.createElement('div')` calls, React could only run in a browser. Instead, `React.createElement` produces a framework-agnostic description of the UI.

Different renderers consume that description:
- `react-dom` renders it to the browser DOM (the renderer you use)
- `react-native` renders it to iOS and Android native views
- `react-pdf` renders it to PDF elements
- `@testing-library/react` renders it to a lightweight test DOM

Because components produce React elements (plain objects), not DOM nodes, the same components run in all of these contexts without modification. The component code is renderer-agnostic; only the renderer (the package that reads React elements and produces output) is environment-specific.

This is why `react` and `react-dom` are separate packages: `react` (the core) is environment-agnostic; `react-dom` is the browser-specific renderer.

---

### JSX expressions

Inside JSX, `{}` embeds any JavaScript expression. The expression must evaluate to something React can render:

- **String** — rendered as text: `{'Hello'}` → the text "Hello"
- **Number** — rendered as text: `{42}` → the text "42"
- **React element** — rendered normally: `{<span>inner</span>}`
- **Array** — each element rendered in sequence: `{['a', 'b', 'c']}` → "abc"
- **null, undefined, false** — renders nothing (empty): `{null}`, `{undefined}`, `{false}` → nothing rendered. This is how **conditional rendering** works:

```jsx
{isError && <p className="error">Something went wrong.</p>}
```

If `isError` is `false`, the `&&` short-circuits and the whole expression evaluates to `false`. React renders nothing. If `isError` is `true`, the expression evaluates to the `<p>` element. React renders the paragraph.

This pattern — `{condition && <Element />}` — is idiomatic React for showing/hiding elements based on state. It replaces the `if (condition) { element.style.display = 'block' }` pattern from imperative DOM code.

**What JSX cannot contain:**

- **Statements** — `if/else`, `for`, `while`, `switch`. Expressions only. Use ternary (`? :`) and `&&` for conditionals; use `.map()` for iteration.
- **Variable declarations** — `const`, `let`, `var`. Define variables before the `return`.
- **Multiple root elements** — JSX must return a single root element. To return multiple elements without adding a wrapper `<div>`, use **React Fragment** syntax: `<>` and `</>`.

```jsx
// Error — multiple root elements
return (
  <h1>Title</h1>
  <p>Content</p>
)

// Correct — wrapped in a fragment
return (
  <>
    <h1>Title</h1>
    <p>Content</p>
  </>
)
```

A fragment compiles to `React.createElement(React.Fragment, null, child1, child2)`. React renders fragments without adding a DOM element — no extra `<div>` wrapper appears in the document.

---

**SE lens — fragments and the "extra div problem":**

Before fragments (React 16.2, 2017), every component had to return a single DOM element. If a component needed to render two adjacent elements, it was wrapped in a `<div>`. This produced unnecessary `<div>` elements in the DOM — sometimes dozens in a large application.

Unnecessary DOM nodes cause problems:
- **Layout bugs** — `display: flex` or `display: grid` on a parent affects all direct children. An extra `<div>` wrapper becomes a child of the flex container, breaking the layout.
- **CSS specificity** — a parent's CSS rules now apply to an intermediate `<div>` instead of the intended children.
- **Accessibility** — screen readers traverse the DOM tree. Extra `<div>` elements add noise.

Fragments eliminate the wrapper `<div>` while still satisfying JSX's "single root" rule. When you see `<>` in React code, that is a fragment — semantically saying "these elements are siblings, but I am not adding a DOM node to group them."

---

### Add DisplayNoJSX to App.jsx to verify

Update `src/App.jsx` to compare both components side by side:

```jsx
// src/App.jsx

import CalculatorDisplay from './CalculatorDisplay.jsx'
import DisplayNoJSX      from './DisplayNoJSX.jsx'
import CalculatorButton  from './CalculatorButton.jsx'

export default function App() {
  function handleClick(label) {
    console.log('Clicked:', label)
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '840px', margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ fontSize: '18px', marginBottom: '24px' }}>JSX vs React.createElement</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h2 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>With JSX</h2>
          <CalculatorDisplay expression="12+3" isError={false} />
        </div>
        <div>
          <h2 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Without JSX (same output)</h2>
          <DisplayNoJSX expression="12+3" isError={false} />
        </div>
      </div>

      <div style={{ marginTop: '24px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
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

Open `localhost:5173`. Two display components appear side by side — identical output, one using JSX and one using `React.createElement` directly. The browser developer tools Elements panel shows the same DOM for both.

---

## Connect the Pieces

**Connection to lesson 009:** Every component you wrote in lesson 009 uses JSX. Now you know exactly what those JSX tags produce: `React.createElement` calls returning plain objects. The component model from lesson 009 is built on this compilation.

**Connection to lesson 007:** The React plugin in `vite.config.js` is the compilation step that transforms JSX to `React.createElement` calls. Without the plugin, JSX is a syntax error.

**Connection to lesson 026 (testing):** Tests render components by calling `render(<Component />)`. Now you know this calls `React.createElement(Component, props)` which returns a React element object, which the test renderer converts to a lightweight DOM. Understanding the compilation chain helps when tests fail in unexpected ways.

---

## What Breaks Without This

**Using `class` instead of `className`:**

```jsx
<div class="calculator">
```

React logs a warning: `Warning: Invalid DOM property 'class'. Did you mean 'className'?`. The element renders, but the CSS class is not applied — the DOM node has no `class` attribute. This is a silent style failure.

**Returning two root elements:**

```jsx
return (
  <h1>Title</h1>
  <p>Body</p>
)
```

Compilation error: `Adjacent JSX elements must be wrapped in an enclosing tag. Did you want a JSX fragment <>...</>?`

**A statement inside JSX:**

```jsx
return (
  <div>
    {if (isError) { return <p>Error</p> }}
  </div>
)
```

Compilation error. Use a ternary: `{isError ? <p>Error</p> : null}`.

**`0` as a condition:**

```jsx
{items.length && <List items={items} />}
```

If `items.length` is `0`, JavaScript evaluates `0 && ...` to `0`. React renders the number `0` as text. The page shows "0" instead of nothing.

```jsx
{items.length > 0 && <List items={items} />}
```

`items.length > 0` is either `true` (renders the list) or `false` (renders nothing). `false` is one of the values React renders as empty; `0` is not.

---

## Definition of Done

- [ ] `src/DisplayNoJSX.jsx` exists and uses only `React.createElement`, no JSX
- [ ] Both `CalculatorDisplay` and `DisplayNoJSX` render identically in the browser
- [ ] You can write out the `React.createElement` call for `<p className="error">Error</p>` without looking it up
- [ ] You can explain the difference between `class` (HTML) and `className` (JSX)
- [ ] You can explain why JSX compiles to React element objects rather than DOM nodes
- [ ] You can explain what `<>` and `</>` are and when to use them
- [ ] You can explain why `{0 && <X />}` renders "0" and how to fix it
- [ ] Git commit:
  ```
  git add src/DisplayNoJSX.jsx src/App.jsx
  git commit -m "Add DisplayNoJSX to expose JSX compilation target

  Same component written with React.createElement instead of JSX.
  Side-by-side rendering confirms identical output.
  Establishes what the JSX compiler produces before adding state."
  ```
