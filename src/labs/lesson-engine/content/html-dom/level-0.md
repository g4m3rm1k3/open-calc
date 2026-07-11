---
series: html-dom
level: 0
title: The Browser Environment
lang: javascript
---

# The Browser Environment

When JavaScript runs in a browser, it does not run in a vacuum. The browser hands JavaScript a set of objects — a pre-built environment that represents the page, the window, and everything the browser knows about the current session. Without this, JavaScript would have no way to read the URL, show alerts, or touch any part of the page.

This lesson teaches what the browser gives JavaScript and where in that environment the page lives.

## What the Browser Provides

When your script runs, the browser creates a global object called `window`. Every tab gets its own `window`. Everything the browser exposes to JavaScript lives on it:

```text
window
├── document      — the live HTML page as a tree of objects
├── console       — the developer console (console.log, console.error)
├── location      — the current URL (location.href, location.pathname)
├── history       — the browser navigation stack (history.back(), history.forward())
├── navigator     — information about the browser and device
├── localStorage  — persistent key/value storage for this origin
├── setTimeout    — schedule code to run after a delay
├── fetch         — make network requests
└── alert/confirm/prompt — modal dialogs (rarely used in real apps)
```

You never write `window.console.log(...)`. Because `window` is the global object, its properties are available as bare names: `console.log(...)`, `location.href`, `setTimeout(...)`. They are all on `window`; the prefix is just optional.

```javascript
console.log(typeof window)
console.log(typeof document)
console.log(typeof console)
console.log(location.href)
```

```text
object
object
object
(the URL of the current page)
```

**CS lens:** `window` is the **global object** — the root of the scope chain. When you write a bare name like `setTimeout` and it is not a local variable or function parameter, the JavaScript engine walks up the scope chain and eventually finds it on `window`. This is why global variables and browser APIs look identical from inside a function.

## document — The Page as an Object

`document` is the most important property on `window`. It represents the current HTML page as a live, navigable object tree. Every HTML element on the page is a node in that tree.

```javascript
console.log(document.title)
console.log(document.URL)
console.log(typeof document.body)
```

```text
(the page title)
(the page URL)
object
```

`document.title` — reads the current `<title>` tag content.
`document.body` — the `<body>` element. Every visible element on the page is a descendant of `document.body`.
`document.URL` — the URL of the current page. Same value as `location.href`.

The key fact: `document` is **live**. When JavaScript changes a property on any element, the browser immediately updates the visible page. There is no separate "render" step to trigger — the change is visible as soon as the JavaScript line executes.

## console — Your Direct Line to the Browser

`console.log(...)` — prints to the browser's developer console. Open it with F12 → Console tab in any browser.

```javascript
console.log("Simple message")
console.log(42, true, [1, 2, 3])
console.warn("This is a warning")
console.error("This is an error")
```

```text
Simple message
42 true [1, 2, 3]
This is a warning
This is an error
```

`console.log` accepts any number of arguments of any type, separated by commas. It is the primary debugging tool for browser JavaScript — the equivalent of Python's `print()`.

`console.warn` and `console.error` produce visually distinct output (yellow and red in most browsers) but are otherwise identical to `console.log`. They exist so you can filter by severity in the devtools console.

**SE lens:** In production code, `console.log` calls are left in only when they serve a deliberate purpose (audit logging, feature flags). Leaving debugging `console.log` calls in production is considered a code smell — it clutters the user's devtools. During development, they are indispensable.

## The Relationship Between HTML, the Browser, and JavaScript

```text
HTML file
    ↓  browser parses HTML
DOM tree (in browser memory)
    ↓  JavaScript reads and modifies
Updated DOM tree
    ↓  browser re-renders
Updated visible page
```

JavaScript does not write HTML. It writes to the DOM — the live object tree that the browser built from HTML. The browser then re-renders the page to reflect those changes. This distinction matters: `innerHTML` lets JavaScript write *HTML strings* that the browser then parses into DOM nodes, but JavaScript itself never touches a raw HTML file.

## Challenge: environment_info

Write a function `environmentInfo()` that returns an object with three properties:
- `hasDocument` — `true` if `document` exists, `false` otherwise
- `hasConsole` — `true` if `console` exists, `false` otherwise
- `windowType` — the result of `typeof window` as a string

`typeof name` — returns the type of a variable as a string. If the variable does not exist, returns `"undefined"` instead of throwing.

```challenge
function environmentInfo() {
  // TODO
}
```

```test
const info = environmentInfo()
assert info.hasDocument === true
assert info.hasConsole === true
assert info.windowType === "object"
assert typeof info === "object"
assert Object.keys(info).length === 3
```
