Thank you — that means a lot. Let's keep the momentum.

---

# PyReact — LAB 4 — The JSX Runtime: How JSX Actually Works

**Prerequisites:** Labs 1–3. You have `vdom.py`, `reconciler.py`, `server.py`, `index.html`, and `patcher.js`. You can run the server and apply patches in the browser console.

**What this lab adds:**
- A clear mental model of what JSX actually is (and is not)
- A `jsx()` function that is the target of JSX compilation
- A build step using `esbuild` that compiles `.jsx` files to plain JavaScript
- A `.jsx` component file that renders a real UI tree through our VNode system

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. JSX looks like HTML inside JavaScript. Do browsers understand JSX natively?
> 2. When you write `<div className="app">` in React, what do you think that actually becomes after compilation?
> 3. React has a function called `React.createElement`. Based on what you built in Lab 1, what do you think this function does?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will have a `.jsx` file that looks like this:

```jsx
function App() {
    return (
        <div id="app">
            <p>Hello from JSX</p>
            <button>Click me</button>
        </div>
    );
}
```

And when you run the build step and open the browser, you will see that UI rendered on screen — driven entirely by our `VNode` system from Lab 1 and our patcher from Lab 3.

No React. No ReactDOM. Just our framework.

---

## Concept: JSX Is Not a Language

**What it is:** JSX is a syntax extension for JavaScript — a shorthand notation that a compiler transforms into plain JavaScript function calls before the browser ever sees it. The browser never sees JSX. It only sees the compiled output.

**The problem before:**

Without JSX, you describe UI in plain JavaScript function calls:

```javascript
createElement("div", { id: "app" },
    createElement("p", {}, "Hello"),
    createElement("button", {}, "Click me")
)
```

This works, but it becomes hard to read as trees get deeper. A real component with a header, sidebar, main content, and footer — nested three levels deep — becomes a wall of function calls that bears no visual resemblance to the UI it describes.

**The solution:** JSX lets you write the same thing in a notation that mirrors the structure of the UI:

```jsx
<div id="app">
    <p>Hello</p>
    <button>Click me</button>
</div>
```

A compiler (Babel or esbuild) reads this and rewrites it as the function call version before anything runs. The browser receives plain JavaScript. JSX is purely a developer convenience — it has zero runtime cost.

**What it hides:** JSX hides the mechanical translation between visual UI structure and function call syntax. Without it, a developer must mentally convert a nested tree into nested function calls every time they write or read UI code. The invariant it protects: **the visual structure of JSX always corresponds exactly to the structure of the VNode tree it produces — indentation matches nesting, attributes match props, children match children.**

**Canonical example (General):**

A JSX compiler is exactly like a translator between two languages that mean the same thing but look different. Spanish "Hola mundo" and English "Hello world" carry identical meaning — one is just more familiar to certain readers. JSX is the notation developers find readable; the compiled JavaScript is what the runtime needs. The translator (compiler) bridges them.

```jsx
// What the developer writes:
<button id="btn">Click me</button>

// What the compiler produces:
jsx("button", { id: "btn" }, "Click me")

// These two lines are identical in meaning.
// The first never reaches the browser.
```

**Project application (The "Why" here):**

We want our framework to feel like React to developers. Developers expect to write JSX. So we need two things: a compile step that transforms JSX syntax into function calls, and a function for those calls to target. The function we write — `jsx()` — is what every JSX element becomes after compilation. It's the most important function in our runtime.

**Watch for:** JSX attributes use `camelCase` (`className`, `onClick`, `htmlFor`) not HTML's `kebab-case` (`class`, `onclick`, `for`). This is because JSX compiles to JavaScript, where `class` is a reserved keyword. Our framework will accept both — we'll note where this matters.

---

## Concept: The JSX Transform

**What it is:** The specific rule a JSX compiler uses to convert each JSX element into a function call.

**The problem before:**

A compiler needs to know *which function* to call when it encounters a JSX element. `React.createElement`? `h`? `jsx`? There's no universal standard — different frameworks use different function names.

**The solution:** A JSX pragma — a configuration setting that tells the compiler exactly which function to call. The pragma is either set in a config file or declared in a comment at the top of each file:

```javascript
/** @jsx jsx */
// This comment tells the compiler: when you see JSX, call "jsx()"
```

When the compiler sees:
```jsx
<div id="app">Hello</div>
```

It applies the transform rule:
```
jsx(tag, props, ...children)
```

And produces:
```javascript
jsx("div", { id: "app" }, "Hello")
```

**The full transform rule:**

| JSX | Compiled output |
|---|---|
| `<div>` | `jsx("div", null)` |
| `<div id="x">` | `jsx("div", { id: "x" })` |
| `<div>Hello</div>` | `jsx("div", null, "Hello")` |
| `<div><p/></div>` | `jsx("div", null, jsx("p", null))` |
| `<App />` | `jsx(App, null)` |

**That last row is critical.** When the tag starts with a capital letter, the compiler passes the function itself — not a string. `<App />` becomes `jsx(App, null)` not `jsx("app", null)`. This is how React distinguishes HTML elements (lowercase) from components (uppercase). We'll use the same convention.

**Project application (The "Why" here):**

Our `jsx()` function needs to handle both cases: when `tag` is a string like `"div"`, create a VNode directly. When `tag` is a function like `App`, call that function with the props and children, and let it return a VNode. This is the entire component model — a component is just a function that returns a VNode.

**Watch for:** The compiled output passes `null` for props when a JSX element has no attributes — not an empty object `{}`. Our `jsx()` function must handle `null` props gracefully.

---

## Step 1 — Install esbuild

`esbuild` is a JavaScript bundler and compiler written in Go. It compiles JSX to JavaScript, bundles multiple files into one, and is roughly 100x faster than Babel. It's a single binary with no configuration required for basic use.

In your terminal, from the `pyreact/` folder:

```
npm init -y
```

**What this does:** Creates a `package.json` file — the standard configuration file for JavaScript projects. `-y` accepts all defaults so you don't have to answer prompts. `package.json` tracks which tools your project depends on.

```
npm install esbuild --save-dev
```

**What this does:** Downloads `esbuild` and saves it to a `node_modules/` folder. `--save-dev` records it as a development dependency — a tool used during development, not shipped to users.

Your folder now looks like:

```
pyreact/
  node_modules/     ← esbuild lives here (don't touch this folder)
  vdom.py
  reconciler.py
  server.py
  index.html
  patcher.js
  package.json      ← new: project configuration
```

### SAVE AND TRY

```
npx esbuild --version
```

**Expected:** A version number like `0.21.0`. `npx` runs a tool from `node_modules` without installing it globally.

**What this confirms:** esbuild is installed and runnable. We'll use it in Step 4.

---

## Concept: The jsx() Function

**What it is:** The runtime function that every compiled JSX element calls — it receives a tag, props, and children and returns a VNode.

**The problem before:**

After JSX is compiled, every element is a function call like `jsx("div", { id: "app" }, "Hello")`. Something has to receive those arguments and produce a VNode. Without this function, the compiled output calls something that doesn't exist.

**The solution:** Our `jsx()` function is that something. It's the bridge between the compiled JSX output and our VNode system. It needs to handle:

1. String tags (`"div"`) → create a VNode directly
2. Function tags (`App`) → call the function, get a VNode back
3. Null props → treat as empty object
4. Children as individual arguments → collect into an array

**What it hides:** `jsx()` hides the distinction between primitive elements and component functions from the calling code. JSX always produces `jsx(something, props, ...children)` — the caller doesn't need to know whether `something` is a string or a function. The invariant it protects: **any valid JSX expression, after compilation, produces a valid VNode when `jsx()` is called — regardless of whether it's a primitive element or a component.**

**Canonical example (General):**

A universal adapter plug. No matter what country's outlet you plug into (string tag or function tag), the adapter (jsx) converts it to the standard format your device (VNode system) expects. The device doesn't care what outlet it came from.

**Smallest possible example:**

```javascript
function jsx(tag, props, ...children) {
    if (typeof tag === "function") {
        return tag({ ...props, children });  // call the component
    }
    return { tag, props: props || {}, children };  // create a VNode
}
```

**Project application (The "Why" here):**

This function is the entire JSX runtime. React's equivalent (`React.createElement` / the new JSX transform) does the same thing — the implementation is more complex, but the contract is identical. When we're done, a developer can write components in JSX and our framework handles the rest.

**Watch for:** Children arrive as individual arguments after props — `jsx("div", {}, child1, child2, child3)`. The `...children` rest parameter collects them into an array. A single child arrives as a one-element array. No children means an empty array. Your jsx function must handle all three cases.

---

## Step 2 — Create the JSX Runtime

Create a new file `pyreact/runtime.js`:

```javascript
// runtime.js
// The JSX runtime — the function every compiled JSX element calls.
// This file is the bridge between JSX syntax and our VNode system.

export function jsx(tag, props, ...children) {
    // export makes this function importable from other files
    // ...children is a rest parameter — collects all arguments after props
    // into an array called children

    const normalizedProps = props || {};
    // JSX with no attributes compiles to jsx("div", null, ...)
    // null is falsy, so props || {} safely replaces null with an empty object
    // This prevents "cannot read property of null" errors downstream

    const flatChildren = children.flat();
    // .flat() flattens one level of array nesting
    // Why? Sometimes children is [["text"]] instead of ["text"]
    // This happens when JSX children are passed as an array expression
    // .flat() normalizes both cases to a simple array

    if (typeof tag === "function") {
        // A capitalized JSX tag compiles to the function itself, not a string
        // <App /> becomes jsx(App, props) — tag IS the App function
        return tag({ ...normalizedProps, children: flatChildren });
        // { ...normalizedProps } spreads the props object into a new object
        // The spread operator (...) copies all key-value pairs
        // We add children as a prop — this is how React passes children too
        // Calling tag() executes the component function and returns its VNode
    }

    return {
        tag,
        // tag is a string like "div", "p", "button"
        props: normalizedProps,
        // props is the attributes object (or {} if none)
        children: flatChildren.filter(child => child !== null && child !== undefined)
        // .filter() removes null and undefined children
        // JSX conditional rendering like {condition && <p/>} produces null
        // when condition is false — we discard those silently
    };
}

export function Fragment({ children }) {
    // Fragment is a special component that renders its children with no wrapper element
    // In JSX: <></> or <Fragment></Fragment>
    // React uses this when you need to return multiple elements without a parent div
    // We return children directly — no VNode wrapper
    return children.length === 1 ? children[0] : children;
}
```

**Why does `jsx()` return a plain object `{ tag, props, children }` instead of a `VNode` instance?**

Two reasons. First, JavaScript doesn't have our Python `VNode` class — we haven't ported it. Second, and more importantly, a plain object is sufficient. Our `patcher.js` already works with plain objects — `buildNode` checks `vnode.tag`, `vnode.props`, `vnode.children`. Those fields exist whether the object is a `VNode` instance or a plain `{}`. We don't need the class machinery in JavaScript. This is a deliberate simplification that works because JavaScript is structurally typed — if it has the right fields, it works.

### SAVE AND TRY

We can't test `runtime.js` directly in the browser yet — it uses `export`, which requires a module system. We'll verify it works correctly in Step 4 after the build step is in place. For now, confirm the file saves without syntax errors by checking it in a text editor or running:

```
npx esbuild runtime.js --bundle 2>&1 | head -5
```

**Expected:** Either a version line or a warning about no entry point — no syntax errors. If you see `error:` lines, there's a typo in the file.

---

## Concept: The Build Step

**What it is:** A command you run that transforms your source files (`.jsx`, `.ts`, ES modules with `import/export`) into a single plain JavaScript file that any browser can load.

**The problem before:**

Browsers have two problems with modern JavaScript source files:

1. They don't understand JSX syntax — `<div>` inside JavaScript is a syntax error
2. `import/export` (ES modules) works in modern browsers, but requires exact file paths and doesn't bundle — every `import` becomes a separate network request

**The solution:** A bundler like `esbuild` reads your source files, resolves all imports, compiles JSX, and outputs one plain `.js` file. The browser loads one file, no JSX, no imports — just working JavaScript.

**What it hides:** The build step hides the gap between the code developers want to write (JSX, modules, modern syntax) and the code browsers can execute (plain ES5/ES6 JavaScript). The invariant it protects: **the output file always contains self-sufficient, browser-executable JavaScript — no external dependencies, no unresolved imports, no non-standard syntax.**

**Canonical example (General):**

A printing press. You write in your own handwriting (JSX source). The press takes your manuscript, typeset it into standard print format (compiled JavaScript), and produces copies anyone can read (browser-compatible output). Your original manuscript never leaves the workshop. Readers only ever see the printed version.

**Project application (The "Why" here):**

We'll run esbuild with one command that compiles our `.jsx` source into `bundle.js`, which `index.html` will load. We'll also use `--watch` mode so esbuild recompiles automatically whenever we save a file — instant feedback without manual rebuilding.

**Watch for:** esbuild outputs to a file you specify. If you change the output filename, you must update `index.html` to match. The build step and the HTML file are coupled by this filename.

---

## Step 3 — Update index.html for the Bundle

Update `index.html`. Find the existing script tag and replace it:

```html
  <script src="/patcher.js"></script>
```

With:

```html
  <script src="/patcher.js"></script>   <!-- ← keep this line -->
  <script src="/bundle.js"></script>    <!-- ← add this line -->
  <!-- bundle.js is the compiled output of our JSX source files -->
  <!-- esbuild will create this file — it doesn't exist yet -->
```

### CSS AND SEE

Open `http://localhost:8000` (server running). Open DevTools → Console.

**You should see:** One error: `GET /bundle.js 404 (Not Found)`. This is expected — we haven't built the bundle yet. The error confirms `index.html` is trying to load it, which is exactly right.

---

## Step 4 — Write the First JSX Component

Create `pyreact/app.jsx`:

```jsx
// app.jsx
// Our first JSX component file.
// This is the source file — esbuild will compile it to bundle.js

/** @jsx jsx */
// This comment is the JSX pragma — it tells esbuild's JSX compiler:
// "when you encounter a JSX element, call the function named 'jsx'"
// Without this, esbuild would call React.createElement by default

/** @jsxFrag Fragment */
// This tells esbuild what to call for <> </> fragment syntax
// We won't use fragments in this lab but the pragma should be set

import { jsx, Fragment } from "./runtime.js";
// Import our jsx function so it's in scope when the compiled JSX calls it
// esbuild will inline this import into bundle.js — no separate network request

import { mount } from "./patcher.js";
// Import mount so we can do the initial render from this file
// esbuild will inline patcher.js too — bundle.js contains everything

function App() {
    // A component is a function that returns a VNode (or JSX that compiles to one)
    // Capital A — React and our framework both use capitalization to distinguish
    // components from HTML elements
    return (
        <div id="app">
            <p>Hello from JSX</p>
            <button id="btn">Click me</button>
        </div>
    );
    // This JSX compiles to:
    // jsx("div", { id: "app" },
    //     jsx("p", null, "Hello from JSX"),
    //     jsx("button", { id: "btn" }, "Click me")
    // )
    // Which calls our jsx() function, which returns a plain VNode object
}

const root = document.getElementById("root");
// Find our mount point in the DOM

mount(root, App());
// App() calls the component function — it returns a VNode
// mount() takes that VNode and builds the real DOM from it
// After this line, the browser shows our UI
```

**Why do we call `App()` instead of `<App />`?**

`<App />` would compile to `jsx(App, null)` — which calls `jsx()`, which calls `App()` internally and returns the result. Both work. We call `App()` directly here because we're in the bootstrap code — not inside JSX, so JSX syntax doesn't apply. In a later lab when we nest components inside other components, we'll use `<App />` naturally.

### SAVE AND TRY

Run the build command in your terminal (keep the server running in a separate terminal tab):

```
npx esbuild app.jsx --bundle --outfile=bundle.js --servedir=.
```

**What each flag does:**
- `app.jsx` — the entry point file to start from
- `--bundle` — follow all imports and combine into one file
- `--outfile=bundle.js` — write the output to this file
- `--servedir=.` — also serve files from the current directory (we won't use this — our Python server handles serving)

You should see output like:
```
  bundle.js  2.1kb

⚡ Done in 3ms
```

Now open `http://localhost:8000` in your browser.

**You should see:**
```
Hello from JSX
[Click me]
```

Rendered on the page — from JSX, through our `jsx()` runtime, through `mount()`, into the real DOM.

Open DevTools → Elements. Expand `<div id="root">`. You should see:

```html
<div id="root">
  <div id="app">
    <p>Hello from JSX</p>
    <button id="btn">Click me</button>
  </div>
</div>
```

**Change something:** Change `"Hello from JSX"` to `"Hello from my framework"` in `app.jsx`. Run the build command again. Refresh the browser. Confirm the new text appears.

---

## Step 5 — See the Compiled Output

Before moving on, read what esbuild actually produced. Open `bundle.js` in your text editor.

You will see something like this (simplified):

```javascript
// runtime.js
function jsx(tag, props, ...children) {
  // ... our code, inlined
}

// patcher.js  
function mount(rootElement, vnode) {
  // ... our code, inlined
}

// app.jsx — compiled
function App() {
  return jsx("div", { id: "app" },
    jsx("p", null, "Hello from JSX"),
    jsx("button", { id: "btn" }, "Click me")
  );
}

var root = document.getElementById("root");
mount(root, App());
```

**This is the key insight of this entire lab.** The JSX is completely gone. Every `<tag>` became `jsx("tag", ...)`. The `import` statements are gone — the code from `runtime.js` and `patcher.js` was copied inline. The browser runs this file and never knew JSX existed.

### SAVE AND TRY

In the browser console, with the page loaded:

```javascript
// The jsx function is now in scope (bundled into the page)
// Let's call it directly — exactly as the compiler does
const vnode = jsx("p", { id: "test" }, "Built manually");
console.log(vnode);
```

**Expected:** A plain object `{ tag: "p", props: { id: "test" }, children: ["Built manually"] }` — a VNode, built by the same function that JSX compilation calls.

```javascript
// Mount it to confirm it works
mount(document.getElementById("root"), vnode);
```

**Expected:** The page now shows only "Built manually" — mount cleared the old content and rendered the new VNode.

**Change something:** Call `jsx` with a nested structure — a `div` containing a `p` and a `button`. Mount it. Confirm the nesting renders correctly.

---

## Step 6 — Add a Child Component

Update `app.jsx` to add a second component. Add the `Greeting` function above `App`:

```jsx
function Greeting({ name }) {
    // { name } is destructuring — it extracts the "name" key from the props object
    // When jsx() calls a function component, it passes props as the first argument
    // Destructuring lets us access props.name as just name
    return <p>Hello, {name}!</p>;
    // {name} inside JSX is a JavaScript expression — the curly braces
    // tell the JSX compiler "evaluate this as JavaScript, not text"
    // It compiles to: jsx("p", null, "Hello, ", name, "!")
    // Three children: the literal string, the variable value, and the literal string
}
```

Now update the `App` function to use `Greeting`:

```jsx
function App() {
    return (
        <div id="app">
            <Greeting name="World" />
            {/* {/* */} is a JSX comment — it won't appear in the output */}
            <Greeting name="PyReact" />
            <button id="btn">Click me</button>
        </div>
    );
    // <Greeting name="World" /> compiles to:
    // jsx(Greeting, { name: "World" })
    // jsx() sees that Greeting is a function, so it calls:
    // Greeting({ name: "World", children: [] })
    // Which returns the VNode for <p>Hello, World!</p>
}
```

### SAVE AND TRY

Run the build again:

```
npx esbuild app.jsx --bundle --outfile=bundle.js
```

Refresh `http://localhost:8000`.

**You should see:**
```
Hello, World!
Hello, PyReact!
[Click me]
```

Open DevTools → Elements. Confirm there are two `<p>` elements, each with the correct text.

**Change something:** Add a third `<Greeting name="..." />` with your own name. Build and refresh. Confirm it appears.

---

## 🎯 Challenge: Build a Card Component

**You know:** A component is a function that accepts props and returns JSX. Components can be used inside other components with `<ComponentName prop="value" />`.

**Task:** Create a `Card` component that accepts `title` and `body` props and renders them in a structured layout. Use it three times in `App` with different content.

The output in the browser should look like:

```
┌─────────────────┐
│ Card Title One  │
│ Body text here  │
└─────────────────┘
┌─────────────────┐
│ Card Title Two  │
│ Different body  │
└─────────────────┘
```

(No actual box borders needed — just the right elements in the right structure.)

**Expected HTML structure for each card:**
```html
<div class="card">
  <h2>Card Title</h2>
  <p>Body text</p>
</div>
```

**Starting point:**

```jsx
function Card({ title, body }) {
    // your JSX here
}

function App() {
    return (
        <div id="app">
            <Card title="???" body="???" />
            {/* add two more */}
        </div>
    );
}
```

**Hints:**

1. In JSX, `class` is a reserved JavaScript word — use `className` instead. Our `jsx()` passes it through as-is to the VNode props.
2. Remember to rebuild with esbuild after every change.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```jsx
/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "./runtime.js";
import { mount } from "./patcher.js";

function Card({ title, body }) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>{body}</p>
        </div>
    );
    // Compiles to:
    // jsx("div", { className: "card" },
    //     jsx("h2", null, title),
    //     jsx("p", null, body)
    // )
}

function App() {
    return (
        <div id="app">
            <Card title="Getting Started" body="Build your first component." />
            <Card title="How It Works" body="JSX compiles to function calls." />
            <Card title="What's Next" body="Reactive state in Lab 5." />
        </div>
    );
}

const root = document.getElementById("root");
mount(root, App());
```

**Key insight:** Each `<Card ... />` compiles to `jsx(Card, { title: "...", body: "..." })`. Our `jsx()` sees that `Card` is a function, calls it with those props, and gets back a VNode. The outer `App` component never knows or cares how `Card` builds its VNode — it just uses it. This is the component model: composable, self-contained units that communicate only through props.

</details>

---

## Step 7 — Add a Watch Script

Running the build command manually after every change gets tedious. Add a watch script to `package.json`.

Open `package.json`. Find the `"scripts"` section and add the `dev` entry:

```json
{
  "scripts": {
    "dev": "esbuild app.jsx --bundle --outfile=bundle.js --watch"
  }
}
```

**What `--watch` does:** esbuild monitors your source files. The moment you save any file that `app.jsx` imports (including `app.jsx` itself, `runtime.js`, and `patcher.js`), esbuild recompiles automatically. You still need to refresh the browser — but the build is instant.

### SAVE AND TRY

In a terminal tab (separate from your Python server):

```
npm run dev
```

**Expected:**
```
[watch] build finished, watching for changes...
```

Now change the text inside any component in `app.jsx` and save. Within milliseconds you should see:

```
[watch] build finished
```

Refresh the browser and confirm the change appears.

From this point forward: one terminal runs `python server.py`, one runs `npm run dev`. Save a file, refresh, see the result.

---

## What React Does Differently

**The new JSX transform:** React 17 introduced a new JSX transform that doesn't require importing React in every file. Instead of a pragma comment, the compiler automatically imports from `react/jsx-runtime`. We use the pragma approach because it's explicit — you can see exactly which function is being called. React's approach is more ergonomic but hides the mechanism.

**`React.createElement` vs `jsx`:** The classic React transform called `React.createElement`. The new transform calls `jsx` (for single children) and `jsxs` (for multiple children) from the JSX runtime. The difference is a performance optimization — `jsxs` pre-marks the children array as static so React knows it doesn't need to copy it. We use one function for both cases — the simplification is negligible for our purposes.

**TypeScript:** Real projects use TypeScript — JSX with static types. The `tsx` extension marks TypeScript JSX files. esbuild supports TypeScript natively, stripping types before compilation. Types don't reach the browser either — they're another compile-time-only feature, like JSX itself.

---

## Final Check

| Feature | How to verify |
|---|---|
| esbuild installed | `npx esbuild --version` → version number |
| `runtime.js` exports `jsx` | `npx esbuild runtime.js --bundle` → no errors |
| JSX pragma set correctly | `bundle.js` contains `jsx(` calls, not `React.createElement(` |
| String tags produce VNodes | Console: `jsx("p", null, "hi")` → `{ tag: "p", props: {}, children: ["hi"] }` |
| Function tags call the component | `jsx(App, null)` returns the same VNode as `App()` |
| Null props normalized | `jsx("div", null).props` → `{}` not `null` |
| `app.jsx` renders in browser | `http://localhost:8000` shows "Hello from JSX" |
| Child components work | Two `<Greeting>` elements render with different names |
| `npm run dev` rebuilds on save | Change text, save, rebuild message appears in terminal |
| `bundle.js` contains no JSX | Open `bundle.js` — no `<` angle bracket JSX syntax |

---

## Quick Check Answers

**1. Do browsers understand JSX natively?**

No. JSX is a syntax extension that only exists in source code. If you put a raw `.jsx` file in a `<script>` tag, the browser throws a syntax error the moment it hits the first `<` inside JavaScript. Browsers only understand standard JavaScript. The build step (esbuild) transforms JSX into plain `jsx("tag", ...)` function calls before the browser ever sees the file.

**2. What does `<div className="app">` become after compilation?**

It becomes `jsx("div", { className: "app" })` — a call to whatever function the JSX pragma specifies. In React's case that's `React.createElement("div", { className: "app" })`. In our case it's our `jsx("div", { className: "app" })`. The attributes become a plain JavaScript object. The tag becomes the first argument string. Nothing about this is magical — it's a mechanical text substitution performed by the compiler.

**3. What does `React.createElement` do?**

Exactly what our `create_element` from Lab 1 does — it takes a tag, props, and children, and returns a plain object (VNode) describing the element. React's version is `React.createElement(type, props, ...children)`. Our `jsx()` function is the same contract. The entire React runtime, Fiber reconciler, and hook system are built on top of these plain objects — the complexity is in how they're compared and applied, not in how they're created.

---

## ▶ Next Session Prompt

```
Series: PyReact — Build React in Python
Completed: Lab 1 — VNode + serialization
           Lab 2 — Reconciler + patch format
           Lab 3 — DOM Patcher + HTTP server
           Lab 4 — JSX Runtime
Next: Lab 5 — Reactive State: Building useState

What we built:
  - runtime.js: jsx() function + Fragment component
  - app.jsx: JSX component file with pragma, imports, App + Greeting components
  - bundle.js: compiled output (generated by esbuild, do not edit)
  - package.json: npm project with esbuild dev script (npm run dev)
  - Updated index.html: loads both patcher.js and bundle.js

Key files:
  pyreact/vdom.py         — VNode, create_element, serialize, deserialize
  pyreact/reconciler.py   — diff, print_patch, serialize_node
  pyreact/server.py       — Python HTTP server port 8000
  pyreact/index.html      — HTML shell, loads patcher.js + bundle.js
  pyreact/patcher.js      — getNodeAtPath, buildNode, applyOperation, mount, applyPatch
  pyreact/runtime.js      — jsx(), Fragment
  pyreact/app.jsx         — JSX components (App, Greeting, Card from challenge)
  pyreact/bundle.js       — compiled output, do not edit

Key decisions made:
  - JSX pragma (@jsx jsx) used instead of new JSX transform — keeps mechanism visible
  - jsx() returns plain objects, not VNode class instances — structural typing
  - Function components receive { ...props, children } as single argument
  - null props normalized to {} inside jsx() — prevents downstream null errors
  - children.flat() normalizes array wrapping edge cases
  - esbuild --watch for automatic rebuilds during development
  - patcher.js kept separate from bundle.js — loaded independently by index.html

Lab 5 will cover:
  - Why components need to re-render when data changes
  - What a closure is and why useState depends on one
  - Building a minimal useState hook (signal-style, not fiber-style)
  - Triggering a re-render when state changes
  - Connecting state changes to our existing diff + patch pipeline
  - Seeing a counter component update the DOM reactively

Start Lab 5.
```