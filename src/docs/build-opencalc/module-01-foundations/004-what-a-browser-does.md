# 004 — What a Browser Actually Does

*The DOM, the event loop, and why JavaScript can make a page change without reloading it*

---

## What You Will Build

You will write a raw HTML file — no framework, no build step, no npm — that the browser loads directly. The page will display a heading, a paragraph, and a button. When the button is clicked, the paragraph text changes without the page reloading.

Open this file in a browser and you will see exactly what a browser does with HTML and JavaScript: parse the markup into a tree, execute the script, and react to user events by modifying the tree.

This is the foundation that React, routing, and every UI pattern in this series is built on. Understanding it directly — not through a framework — is what allows you to understand the framework when it appears in lesson 009.

---

## What You Need to Know First

Lesson 001 — What Is Software Engineering? The concepts of interfaces and contracts apply to the HTML-JavaScript relationship examined here.

Lesson 002 — Your Environment. You need a browser. Any modern browser works — Chrome, Firefox, Safari, Edge.

Lesson 003 — Version Control First. You will commit this file.

---

## The Lesson

### How the browser turns text into a page

A browser is, at its core, a program that receives text — HTML — and produces a visual, interactive page from it. Understanding this pipeline is the foundation of web development.

The pipeline has four stages:

1. **Parse** — the browser reads the HTML text and constructs a tree of objects
2. **Style** — the browser applies CSS rules to determine how each element looks
3. **Layout** — the browser calculates the position and size of each element on screen
4. **Paint** — the browser draws pixels to the screen

The tree produced in stage 1 is called the **DOM** — the Document Object Model. It is the browser's internal representation of the page. Every tag in your HTML becomes a **node** in this tree. Every attribute becomes a property on that node. Every piece of text between tags becomes a **text node**.

When JavaScript runs and modifies the DOM, the browser re-runs stages 2, 3, and 4 for the affected parts. The user sees the change without a page reload. This is how every interactive web page works — not just React pages, but all pages.

---

**CS lens — the DOM as a tree data structure:**

A tree is a hierarchical data structure: one root node at the top, each node can have zero or more children, every node (except the root) has exactly one parent.

The DOM is a tree of HTML elements. The `<html>` element is the root. It has two children: `<head>` and `<body>`. Inside `<body>` might be an `<h1>`, a `<p>`, and a `<button>`. Those are children of `<body>` and siblings of each other.

Tree traversal — finding and modifying nodes — is the fundamental DOM operation. `document.getElementById('my-id')` traverses the DOM tree searching for a node whose `id` attribute equals `'my-id'`. This is a depth-first search returning the first match, or `null` if none is found.

---

**SE lens — the DOM as an interface:**

The DOM is the **interface** between HTML markup and JavaScript code. HTML declares what the page contains. JavaScript modifies what the page contains by manipulating the DOM. Neither needs to know how the other works internally — they communicate through this defined interface.

This is the separation of concerns applied to the browser: HTML owns the structure, CSS owns the presentation, JavaScript owns the behaviour. When these concerns are separated, you can change the structure without breaking the behaviour, and change the behaviour without changing the structure.

React is a library that manages DOM modifications for you. But React's output is DOM nodes — it is still calling the same browser APIs you will call directly in this lesson. Understanding what React does means understanding what the DOM is first.

---

### Write the first HTML file

Create a file called `index.html` in your project folder:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>my-platform</title>
</head>
<body>
  <h1>my-platform</h1>
  <p id="status-message">No application code has been built yet.</p>
  <button id="toggle-button">Show requirements</button>

  <script src="browser-intro.js"></script>
</body>
</html>
```

**Walkthrough — every element:**

`<!DOCTYPE html>` — declares that this is an HTML5 document. This line is not an HTML element — it is a processing instruction to the browser. Without it, some browsers enter "quirks mode" and render pages using rules from the 1990s, producing inconsistent layouts.

`<html lang="en">` — the root element. Every other element in the document is a descendant of this one. `lang="en"` is an attribute that declares the document's language. Screen readers use this to select the correct pronunciation model. Search engines use it for language-targeted results.

`<head>` — contains metadata about the document: information for the browser and search engines, not content displayed to users.

`<meta charset="UTF-8" />` — declares the character encoding. **UTF-8** is a character encoding scheme that can represent every character in the Unicode standard — all letters, numbers, symbols, and emoji from all human writing systems. Without this declaration, the browser must guess the encoding, and it sometimes guesses wrong, producing garbled text (known as mojibake).

`<meta name="viewport" content="width=device-width, initial-scale=1.0" />` — controls how the page scales on mobile devices. Without this, mobile browsers assume the page was designed for a desktop screen and zoom out to show the full 980-pixel-wide page at once. With it, the page renders at the device's actual screen width. This is essential for any page that must be usable on phones.

`<title>my-platform</title>` — the text shown in the browser tab and used as the page name in bookmarks, browser history, and search engine results.

`<body>` — contains all the visible content: text, images, buttons, inputs. Everything displayed to users lives here.

`<h1>` — a heading element. HTML has six heading levels: `<h1>` through `<h6>`. `<h1>` is the most important — used for the primary title of the page. Screen readers and search engines use headings to understand the page's structure and hierarchy.

`<p id="status-message">` — a paragraph element. The `id` attribute assigns a unique identifier to this element. An `id` must be unique within a document — no two elements may share the same `id`. JavaScript uses `id` values to find specific elements.

`<button id="toggle-button">` — a button element. Buttons are interactive — the browser gives them a default style and makes them respond to keyboard focus and click events without any JavaScript. The `id` is used to find this element from JavaScript.

`<script src="browser-intro.js"></script>` — loads and executes a JavaScript file. The `src` attribute is the path to the file. This tag is placed at the bottom of `<body>`, not in `<head>`, for a specific reason: when the browser encounters a `<script>` tag, it stops parsing HTML, downloads and executes the script, and then resumes parsing. If the script is in `<head>`, the browser executes it before the `<body>` elements exist — `document.getElementById('status-message')` would return `null` because the element has not been created yet. Placing `<script>` at the bottom of `<body>` guarantees all elements exist before the script runs.

---

### Write the JavaScript

Create `browser-intro.js` in the same folder:

```javascript
// browser-intro.js
//
// Runs in the browser after the HTML is parsed.
// Demonstrates: finding elements, reading the DOM, modifying the DOM,
// and responding to user events.

const statusMessage = document.getElementById('status-message')
const toggleButton  = document.getElementById('toggle-button')

if (statusMessage === null) {
  throw new Error('Element with id "status-message" not found. Check index.html.')
}
if (toggleButton === null) {
  throw new Error('Element with id "toggle-button" not found. Check index.html.')
}

const requirements = [
  'A learner can open any lab and interact with it',
  'A learner can navigate between labs without losing state',
  'A broken lab fails in isolation without affecting the shell',
]

let isShowingRequirements = false

function buildRequirementsList() {
  const list = document.createElement('ul')
  requirements.forEach((requirementText) => {
    const listItem = document.createElement('li')
    listItem.textContent = requirementText
    list.appendChild(listItem)
  })
  return list
}

function toggleRequirements() {
  if (isShowingRequirements) {
    statusMessage.textContent = 'No application code has been built yet.'
    toggleButton.textContent  = 'Show requirements'
    isShowingRequirements     = false
  } else {
    statusMessage.textContent = ''
    statusMessage.appendChild(buildRequirementsList())
    toggleButton.textContent  = 'Hide requirements'
    isShowingRequirements     = true
  }
}

toggleButton.addEventListener('click', toggleRequirements)
```

**Walkthrough — every part:**

`document.getElementById('status-message')` — `document` is a global object automatically available in the browser. It represents the entire HTML document and provides methods to find and manipulate elements. `getElementById` is a method on `document` — a function you call to find a specific element. It takes a string, traverses the DOM tree searching for an element whose `id` attribute matches, and returns that element as a JavaScript object, or `null` if no match exists.

`null` is a deliberate empty value — it means "no object." Not zero, not undefined, not an empty string — specifically no object. In JavaScript, `null` and `undefined` are different: `null` is an explicitly set empty value, `undefined` means a variable exists but no value has been assigned. `getElementById` returns `null` (explicitly none) when no element matches.

The `if (statusMessage === null)` check is a **guard clause** — code that detects an error condition at the start of a function or block and throws immediately rather than letting the code proceed and fail in a confusing way later. Without this check, `statusMessage.textContent = ...` on line 30 would throw "Cannot set property 'textContent' of null", which is less clear than "Element with id 'status-message' not found."

`throw new Error('...')` — `throw` is a JavaScript keyword that stops execution and propagates an error. `new Error('message')` creates an **Error object** — an object that carries a message and a **stack trace** (the chain of function calls that led to this point). When an uncaught error reaches the browser, it appears in the browser console. The `F12` key (or Cmd+Option+J on Mac) opens the browser developer tools where you can read errors.

`let isShowingRequirements = false` — `let` declares a variable whose binding can be reassigned. We use `let` instead of `const` here because this variable's value will change when the button is clicked. `false` is the initial value — a **boolean**. Booleans have exactly two values: `true` and `false`. They are used for binary states like "is showing / is not showing."

`document.createElement('ul')` — creates a new DOM element that does not yet exist anywhere in the document. `'ul'` specifies the element type — an unordered list. The element is created in memory but not yet inserted into the page — it is like creating an object without attaching it to anything. Other element types: `'li'` (list item), `'div'` (generic container), `'p'` (paragraph), `'button'` (button), `'input'` (input field).

`listItem.textContent = requirementText` — sets the text content of the `listItem` element. `textContent` is a property on all DOM elements — it gets or sets the text inside the element. Setting `textContent` replaces any existing content with plain text. This is the **safe** way to insert user-provided text — it treats the value as literal text, not HTML.

**Security note — `textContent` versus `innerHTML`:** `innerHTML` sets the HTML content of an element, which means any HTML tags in the value are parsed and executed by the browser. If that value came from user input, a malicious user could inject `<script>alert('XSS')</script>` and have it execute. This is **Cross-Site Scripting (XSS)** — one of the most common web vulnerabilities. `textContent` treats its value as plain text regardless of what it contains. `document.createElement` combined with `textContent` is always safe. `innerHTML` with user-supplied content is almost always dangerous. Use `textContent`.

`list.appendChild(listItem)` — appends `listItem` as the last child of `list`. This builds the DOM tree in memory. After the loop, `list` is a `<ul>` element containing multiple `<li>` children, one per requirement. The whole structure exists in memory but has not been added to the visible page yet.

`statusMessage.appendChild(buildRequirementsList())` — calls `buildRequirementsList()` (which returns the `<ul>` element built in memory) and appends it as a child of `statusMessage`. This is the moment the list appears on the page — when it is inserted into the DOM, the browser re-renders the affected area immediately.

`statusMessage.textContent = ''` — sets the text content to an empty string, which removes all existing text (and any child elements that were created via `textContent`) from the element. This clears the "No application code..." message before inserting the requirements list.

`toggleButton.addEventListener('click', toggleRequirements)` — registers an **event listener**. An event listener is a function that the browser calls when a specific event occurs on a specific element. `'click'` is the event type. `toggleRequirements` is the function to call. When the user clicks `toggleButton`, the browser calls `toggleRequirements()` automatically.

`addEventListener` is the standard way to respond to user events. There is an older approach using HTML attributes (`onclick="..."`) but it mixes JavaScript into HTML markup, violating separation of concerns. `addEventListener` keeps the behaviour in JavaScript where it belongs.

---

**CS lens — the event loop:**

JavaScript in a browser is **single-threaded** — one thing happens at a time. But the page can respond to many events: clicks, keypresses, network responses, timers. How?

The browser uses an **event loop**: a continuous loop that checks whether there are any pending events and, if so, runs the registered handler. When you click a button, the browser queues a click event. The event loop picks it up, finds the registered listener (`toggleRequirements`), and calls it. While `toggleRequirements` is running, no other JavaScript runs — this is the "single-threaded" part. When `toggleRequirements` finishes, the event loop checks for the next event.

This has a performance implication: code that runs too long in a handler blocks the event loop. The browser cannot respond to any other events — including rendering — until the handler returns. If a click handler takes 2 seconds to complete, the page freezes for 2 seconds. This is why long-running operations (network requests, large calculations) are handled **asynchronously** — they are handed off to the browser, which calls your code back when they complete, without blocking the event loop.

---

**SE lens — imperative DOM manipulation and its limits:**

The code in `browser-intro.js` is **imperative** — it describes how to make changes step by step: find this element, create this node, set this property, append this child. Imperative code is direct and understandable for small amounts of interaction.

It scales poorly. Adding a third state to the button (a loading state while data is being fetched) requires changing `isShowingRequirements` from a boolean to a three-value enum, updating every conditional, adding a new branch to `toggleRequirements`, and ensuring the DOM reflects each state correctly. The state tracking and the DOM manipulation are interleaved in ways that make the code hard to follow and easy to get wrong.

Lesson 008 will show this breaking point explicitly. React's model — describe what the UI should look like for a given state, and let the framework handle the DOM — exists to solve this exact problem. But you need to see the problem before the solution makes sense.

---

### Open in the browser

Open `index.html` directly in your browser. On Mac, right-click the file and select "Open With" → your browser. Or drag the file into an open browser window.

The URL bar will show something like `file:///Users/yourname/my-platform/index.html`. The `file://` prefix means the browser is reading this file directly from your file system, not from a web server.

You should see:
- A heading: "my-platform"
- A paragraph: "No application code has been built yet."
- A button: "Show requirements"

Click the button. The paragraph changes to show the requirements list. Click again. It reverts. The page never reloads.

Open the browser developer tools: press `F12` or right-click anywhere on the page and select "Inspect." Click the "Elements" tab. Expand the DOM tree and find the `<p>` element. Click the button on the page and watch the DOM tree update in real time. This is the browser's live view of the DOM — you are watching nodes appear and disappear.

Click the "Console" tab. This is where JavaScript errors and `console.log()` output appear. Add `console.log('button clicked')` inside `toggleRequirements` in your JavaScript file, save, refresh the browser, click the button, and read the console.

---

**CS lens — the browser as a debugger:**

The browser developer tools are a runtime debugger. In the "Sources" tab, find `browser-intro.js`. Click a line number to set a **breakpoint** — the browser will pause execution at that line the next time it runs. Refresh the page, click the button, and the browser pauses at the breakpoint. You can inspect the value of every variable at that exact moment. Click the resume button (▶) to continue.

This technique — setting a breakpoint, pausing at a specific line, reading variable values — is how you diagnose runtime errors. The error you are looking for is not always the one thrown — it is the state that led to the throw. The debugger shows you that state.

---

**SE lens — the browser console is not the production environment:**

Errors you see in the console are not errors users see. Users see a broken page. Errors in the console are signals to the developer during development.

In production, JavaScript errors must be caught and handled gracefully — showing the user a useful message, not a blank page. Error boundaries (lesson 021) are the React mechanism for this. But the underlying principle is: errors in the developer console during development are expected and informative; errors reaching users in production are failures.

---

## Connect the Pieces

This lesson establishes the foundation everything else in this series is built on.

The DOM is not a React concept. The event loop is not a React concept. `document.getElementById` is not a React API. They are browser fundamentals. React is a library that manages DOM manipulation for you — but it is still manipulating the DOM. Understanding the DOM directly means understanding React's output, not just its input.

**Connection to lesson 001:**

The `textContent` versus `innerHTML` security distinction is an application of the trust model from the security section of lesson 001. User input is data that crosses a boundary from outside your code. The moment you render it, you must decide whether to treat it as trusted (HTML) or untrusted (text). Always treat user input as untrusted.

**Connection to lesson 008:**

The imperative DOM manipulation in `browser-intro.js` is about to show its limits. Lesson 008 adds a loading state and an error state to the button interaction — three states total. You will see exactly where imperative DOM management breaks, which is the motivation for declarative UI frameworks.

**Connection to lesson 009:**

React replaces `document.createElement`, `appendChild`, and `addEventListener` with a declarative description of what the UI should look like. The browser APIs remain — React calls them internally. Your code describes the desired state; React figures out which DOM calls to make.

---

## What Breaks Without This

If you start building React components without understanding the DOM:

When something goes wrong in a React component — an element is not rendering, an event is not firing, a value is not updating — the diagnosis requires understanding what React is doing to the DOM. If you do not know what the DOM is, you cannot read the "Elements" tab in developer tools, you cannot understand what React's reconciler is doing, and you cannot diagnose rendering bugs.

The concrete failure:

```javascript
// A common React bug — misunderstanding what happens to the DOM
function BrokenComponent() {
  const element = document.getElementById('my-input')
  // This is null — React has not rendered the element yet.
  // getElementById searches the DOM, which does not contain this
  // element until React's render cycle adds it.
  element.focus() // TypeError: Cannot read properties of null
}
```

Understanding that `document.getElementById` searches the current DOM tree — and that React adds elements to the DOM after the component function runs — explains exactly why this fails. Without that mental model, the error "Cannot read properties of null" is mysterious.

---

## Definition of Done

- [ ] `index.html` exists in your project folder and opens in a browser without errors
- [ ] `browser-intro.js` exists and is loaded by `index.html`
- [ ] Clicking "Show requirements" displays the list; clicking "Hide requirements" reverts it
- [ ] You have opened developer tools and watched the DOM update in the Elements tab
- [ ] You have opened the Console tab and read it — no errors should appear
- [ ] You can explain what `null` means as a return value from `getElementById`
- [ ] You can explain the difference between `textContent` and `innerHTML` and which is safe with user input
- [ ] You can explain what the event loop is in one sentence
- [ ] Git commit:
  ```
  git add index.html browser-intro.js
  git commit -m "Add raw HTML page demonstrating DOM manipulation and event handling

  index.html is loaded directly by the browser — no build step.
  browser-intro.js demonstrates: finding DOM elements, creating nodes,
  responding to click events, and safe text insertion via textContent.
  This is the foundation React is built on."
  ```
