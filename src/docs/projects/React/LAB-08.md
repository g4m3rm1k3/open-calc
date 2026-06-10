# PyReact — LAB 8 — Developer Experience: The MVP

**Prerequisites:** Labs 1–7. The complete file set. The todo app runs end-to-end with keyed diffing, reconnection, and batching.

**What this lab adds:**
- Minimal CSS that makes the todo app presentable without obscuring the framework
- A clean project template structure any developer could clone and start from
- A README that documents PyReact as a real framework
- An honest end-to-end architecture review — every layer, why it exists, what it cost
- A clear map of what you now understand and where to go next

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. You've built a virtual DOM, a reconciler, a DOM patcher, a JSX runtime, a reactive state system, a WebSocket protocol, and a server-authoritative rendering architecture. Which of these does React also have? Which does Phoenix LiveView have?
> 2. If someone cloned your project and wanted to build a different app — a chat interface instead of a todo list — which files would they change and which would they leave untouched?
> 3. Hot reload means "see your changes without manually refreshing." You already have half of it. What's the missing half, and what would it take to add it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab the project looks like this:

```
pyreact/
  framework/           ← the framework itself (don't touch when building apps)
    vdom.py
    reconciler.py
    reconciler.js
    patcher.js
    runtime.js
  app/                 ← the application (this is what developers write)
    app.py
    app.jsx
    style.css
  index.html           ← entry point
  package.json
  README.md            ← how to use PyReact
```

The todo app will look like this in the browser:

```
┌─────────────────────────────────────┐
│  ✓ PyReact Todo                     │
├─────────────────────────────────────┤
│  [All]  [Active]  [Done]            │
│                                     │
│  ○  Buy groceries    [Done][Remove] │
│  ○  Write lab notes  [Done][Remove] │
│  ✓  Call dentist     [Undo][Remove] │
│                                     │
│  [___________________] [Add]        │
│                                     │
│  3 items · 1 completed              │
└─────────────────────────────────────┘
```

Clean. Usable. Built entirely by the framework you wrote.

---

## Part 1 — Reorganize the Project

### Concept: Separation of Framework and Application

**What it is:** A structural boundary between the code that is the framework (generic, reusable, not app-specific) and the code that uses the framework (specific to one application).

**The problem before:**

Right now all files sit in one flat directory. A developer who wants to build a new app with PyReact can't easily tell which files are the framework and which are the demo app. They'd have to read every file to figure out what to keep and what to replace.

**The solution:** Two folders. `framework/` contains code that never changes when building an app. `app/` contains code the developer writes. This boundary makes PyReact usable as an actual framework — not just a collection of files.

**What it hides:** The directory structure hides the complexity of "which files are mine to edit" from application developers. The invariant it protects: **a developer building with PyReact never needs to open or modify anything in `framework/`. Everything they write goes in `app/`.**

**Project application (The "Why" here):**

When you open-source PyReact, other developers will clone it and replace the contents of `app/` with their own application. The `framework/` folder is the library they depend on. This is the same separation that exists in every framework: you don't modify React's source to build a React app.

---

## Step 1 — Create the New Structure

In your terminal from `pyreact/`:

```
mkdir framework
mkdir app
```

Move the framework files:

```
mv vdom.py framework/
mv reconciler.py framework/
mv reconciler.js framework/
mv patcher.js framework/
mv runtime.js framework/
```

Move the application files:

```
mv app.py app/
mv app.jsx app/
```

Your folder now looks like:

```
pyreact/
  framework/
    vdom.py
    reconciler.py
    reconciler.js
    patcher.js
    runtime.js
  app/
    app.py
    app.jsx
  index.html
  bundle.js      ← generated, will be regenerated
  package.json
```

### SAVE AND TRY

Update the run command in `package.json` to point to the new location:

```json
{
  "scripts": {
    "dev":   "esbuild app/app.jsx --bundle --outfile=bundle.js --watch",
    "build": "esbuild app/app.jsx --bundle --outfile=bundle.js --minify"
  }
}
```

Update `app/app.jsx` — the import paths need to reflect the new structure:

```jsx
/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment } from "../framework/runtime.js";
// ← was: "./runtime.js" — now one level up, then into framework/

import { connectWebSocket, setupEventDelegation } from "../framework/patcher.js";
// ← was: "./patcher.js"

const root = document.getElementById("root");
const socket = connectWebSocket(root);
setupEventDelegation(socket);
window.PyReactSocket = socket;
```

Update `app/app.py` — Python imports need the new paths:

```python
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'framework'))
# sys.path is the list of directories Python searches when you write "import X"
# We insert the framework/ directory at position 0 (highest priority)
# os.path.dirname(__file__) = the directory containing app.py (i.e. app/)
# os.path.join(..., '..', 'framework') = one level up, then into framework/
# This lets us write "from vdom import ..." without changing the import statements

# All other imports remain exactly the same:
import json
import asyncio
from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from vdom import create_element, serialize
from reconciler import diff, serialize_node
```

Update the `app.mount` line at the bottom of `app.py` — the static files are now served from the parent directory:

```python
app.mount("/", StaticFiles(directory="..", html=True), name="static")
# ← was: directory="."
# Now we serve from the parent (pyreact/) because index.html is there
```

Update the uvicorn run command — we now point to the app directory:

```
uvicorn app.app:app --reload --port 8000
```

**What `app.app:app` means:** `app.app` is the Python module path — the `app` folder, then the `app.py` file inside it. The final `:app` is the FastAPI object named `app` inside that file.

Run both terminals:

```
Terminal 1: uvicorn app.app:app --reload --port 8000
Terminal 2: npm run dev
```

**You should see:** The todo app working exactly as before — same behavior, new structure.

---

## Part 2 — Add CSS

### Concept: Separation of Style from Structure

**What it is:** Writing visual presentation in a dedicated CSS file rather than inline `style` attributes, so structure (HTML/VNodes) and appearance (CSS) are independently maintainable.

**The problem before:**

Our VNodes use `class` attributes like `"todo"`, `"done"`, `"pending"`, `"filters"`. These class names exist but no CSS rules define what they look like. The app is functional but visually raw — unstyled HTML.

**The solution:** One CSS file that targets our class names. No framework changes required — CSS works on the DOM that our patcher already builds. The VNode class names we already have are the hook points.

**Project application (The "Why" here):**

We write CSS now — not to make the framework look polished, but to prove a real point: the entire visual layer is completely decoupled from the framework. We didn't build CSS support. We didn't add a styling system. CSS just works because our patcher builds real DOM nodes with real class attributes. That's the right outcome.

---

## Step 2 — Create the Stylesheet

Create `app/style.css`:

```css
/* style.css — PyReact Todo App */
/* This file has zero framework-specific code — it targets plain HTML class names */

*, *::before, *::after {
    box-sizing: border-box;
    /* box-sizing: border-box means padding and border are included in an element's
       stated width/height. Without this, padding adds to the width, making layout
       math unintuitive. This rule applies to every element (*) and its
       pseudo-elements (::before, ::after) */
}

body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    /* -apple-system uses the native system font on each OS:
       San Francisco on macOS/iOS, Segoe UI on Windows, etc.
       This makes the app feel native without loading a custom font */
    background: #f5f5f5;
    /* Light grey background so the white card stands out */
    display: flex;
    justify-content: center;
    /* Center the app card horizontally */
    padding: 40px 16px;
}

#app {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 500px;
    /* max-width keeps the card readable on wide screens */
    overflow: hidden;
    /* clip children to the card's rounded corners */
}

h1 {
    margin: 0;
    padding: 20px 24px;
    font-size: 20px;
    font-weight: 600;
    border-bottom: 1px solid #eee;
    color: #1a1a1a;
}

/* ── Filter bar ───────────────────────────────────── */

.filters {
    display: flex;
    padding: 12px 24px;
    gap: 8px;
    /* gap: space between flex children — cleaner than margin */
    border-bottom: 1px solid #eee;
    background: #fafafa;
}

.filters button {
    padding: 4px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #555;
    cursor: pointer;
    font-size: 13px;
}

.filters button.active-filter {
    background: #4f46e5;
    /* Indigo — the active filter gets a solid color background */
    border-color: #4f46e5;
    color: white;
}

/* ── Todo items ───────────────────────────────────── */

.todo {
    display: flex;
    align-items: center;
    padding: 12px 24px;
    gap: 10px;
    border-bottom: 1px solid #f0f0f0;
}

.todo:last-of-type {
    border-bottom: none;
    /* Remove border from the last todo so it doesn't double up
       with the add-row border */
}

.done {
    color: #4f46e5;
    font-size: 18px;
    width: 20px;
    flex-shrink: 0;
    /* flex-shrink: 0 prevents the status icon from being squeezed
       when the todo text is long */
}

.pending {
    color: #aaa;
    font-size: 18px;
    width: 20px;
    flex-shrink: 0;
}

.todo span:nth-child(2) {
    /* The text span — second child of .todo */
    flex: 1;
    /* flex: 1 makes this span take all available space,
       pushing the buttons to the right */
    color: #333;
    font-size: 15px;
}

.todo button {
    padding: 3px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    color: #555;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
    /* white-space: nowrap prevents button text from wrapping to a second line */
}

.todo button:last-child {
    /* The Remove button */
    color: #dc2626;
    /* Red — destructive action */
    border-color: #fecaca;
}

/* ── Add row ──────────────────────────────────────── */

.add-row {
    display: flex;
    padding: 12px 24px;
    gap: 8px;
    border-top: 1px solid #eee;
}

.add-row input {
    flex: 1;
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    outline: none;
    /* outline: none removes the default browser focus ring */
}

.add-row input:focus {
    border-color: #4f46e5;
    /* Replace the removed outline with a colored border on focus */
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
    /* Subtle glow that matches the focus color */
}

.add-row button {
    padding: 6px 16px;
    background: #4f46e5;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

/* ── Summary line ─────────────────────────────────── */

.summary {
    padding: 10px 24px;
    font-size: 13px;
    color: #888;
    border-top: 1px solid #eee;
    background: #fafafa;
}
```

Link the CSS in `index.html`. Open `index.html` and add inside `<head>`:

```html
  <link rel="stylesheet" href="/app/style.css">
  <!-- ← add this line after <meta charset="UTF-8"> -->
  <!-- /app/style.css: served from our static file server -->
```

### CSS AND SEE

Refresh `http://localhost:8000`.

**You should see:** The todo app inside a centered white card with a subtle shadow. Filter buttons in a grey bar. Each todo row with proper spacing. The Add button in indigo. The Remove button with a red tint.

**Compare:** Open the Elements panel. Nothing changed in the HTML structure — only `<link rel="stylesheet">` was added to the head. The framework produced the same DOM. CSS did all the visual work.

**Change something:** Change the `#4f46e5` indigo color in `style.css` to `#059669` (green). Save. Refresh. The active filter button, Add button, and done indicators all turn green. Change it back.

---

## Step 3 — Add the Summary Line to the App

The wireframe showed `"3 items · 1 completed"`. Add this to `app.py`'s `render` function.

Inside `render`, after building `todo_items` and before the final `return`, add:

```python
    total = len(todos)
    completed = sum(1 for t in todos if t["done"])
    # sum() adds up values from an iterable
    # (1 for t in todos if t["done"]) is a generator expression:
    # it produces 1 for each completed todo, 0 for others implicitly by filtering
    # sum of those 1s = count of completed todos

    summary_text = f"{total} item{'s' if total != 1 else ''} · {completed} completed"
    # Pluralization: "1 item" not "1 items"
    # f-string with conditional: {'s' if total != 1 else ''} adds 's' when total > 1
```

Add the summary element to the returned VNode. Inside the final `create_element("div", {"id": "app"}, ...)`, add after `*todo_items` and the add-row:

```python
        create_element("div", {"class": "summary"}, summary_text),
        # ← add this as the last child of the #app div
```

### SAVE AND TRY

uvicorn reloads. Refresh.

**You should see:** `"3 items · 1 completed"` in a grey bar at the bottom of the card.

Click `[Done]` on a todo. The summary updates: `"3 items · 2 completed"`. This is a server-side computed value — no JavaScript arithmetic, no client-side state. Python counts, renders, diffs, sends the patch, browser updates the one text node.

**Change something:** Add a third todo. Verify the count updates to `"4 items · 1 completed"`. Remove a completed todo. Verify completed count decreases.

---

## Part 3 — Write the README

A framework without documentation isn't a framework — it's a pile of files. The README is what turns your work into something communicable.

## Step 4 — Create README.md

Create `pyreact/README.md`:

```markdown
# PyReact

A minimal server-authoritative UI framework with a Python backend and JSX frontend.

Built as an educational project to understand how React, Phoenix LiveView,
and WebSocket-driven UIs work internally.

## What It Is

PyReact renders UI components written in Python, sends them to the browser
over a WebSocket, and patches the DOM incrementally on every state change.
The browser is a display terminal. Python is the authority.

```
Python state → Python component → VNode tree → JSON patch → DOM update
```

## Architecture

| Layer | File | What it does |
|---|---|---|
| Virtual DOM | `framework/vdom.py` | VNode class, create_element, serialize |
| Reconciler (Python) | `framework/reconciler.py` | diff two VNode trees → patch |
| Reconciler (JS) | `framework/reconciler.js` | same algorithm, browser-side |
| DOM Patcher | `framework/patcher.js` | applies patches to real DOM |
| JSX Runtime | `framework/runtime.js` | jsx(), useState(), init() |
| Server | `app/app.py` | FastAPI + WebSocket endpoint |
| App | `app/app.jsx` | bootstrap: connect WebSocket |

## How To Run

**Requirements:** Python 3.12+, Node.js 18+

```bash
# Install Python dependencies
pip install fastapi uvicorn

# Install JavaScript dependencies
npm install

# Terminal 1: start the server
uvicorn app.app:app --reload --port 8000

# Terminal 2: start the JS build watcher
npm run dev

# Open http://localhost:8000
```

## How To Build An App

**1. Write your state:**

```python
# app/app.py
def get_initial_state():
    return {"count": 0}
```

**2. Write your component:**

```python
def render(state):
    return create_element("div", {},
        create_element("p", {}, f"Count: {state['count']}"),
        create_element("button", {"data-event": "increment"}, "+"),
    )
```

**3. Handle events:**

```python
# Inside websocket_endpoint, in the event loop:
if event == "increment":
    state["count"] += 1
```

**4. That's it.** The framework handles:
- Diffing the old and new VNode trees
- Sending only the changed operations over WebSocket
- Applying patches to the browser DOM
- Reconnecting if the connection drops

## Key Concepts Implemented

- **Virtual DOM** — UI represented as a Python object tree before touching the browser
- **Reconciliation** — O(n) tree diff algorithm with keyed children support
- **DOM Patching** — five operation types: REPLACE, UPDATE_PROPS, UPDATE_TEXT, ADD_CHILD, REMOVE_CHILD
- **JSX Runtime** — `jsx()` function + esbuild compile step
- **Reactive State** — `useState` hook with slot-based persistence across renders
- **WebSocket Protocol** — mount message on connect, patch messages on events
- **Event Delegation** — one listener on document.body, routed by `data-event` attribute
- **Exponential Backoff** — automatic reconnection after network interruption
- **Keyed Diffing** — stable child identity for correct list operations
- **Render Batching** — multiple state changes produce one render cycle

## Known Limitations

- No MOVE_CHILD operation (reordering = remove + add)
- No useEffect / cleanup lifecycle
- No client-side routing
- No optimistic updates for input latency
- Single-user per connection (shared state requires pub/sub layer)
- Not production-hardened

## What To Study Next

| Topic | Resource |
|---|---|
| How React Fiber works | [React Fiber Architecture](https://github.com/acdlite/react-fiber-architecture) |
| Phoenix LiveView | [LiveView docs](https://hexdocs.pm/phoenix_live_view) |
| Signals (alternative to hooks) | [SolidJS docs](https://www.solidjs.com/docs/latest) |
| Production WebSockets | FastAPI WebSocket docs |
| ASGI in depth | [ASGI spec](https://asgi.readthedocs.io) |
```

### SAVE AND TRY

Open `README.md` in your editor. Read it as if you are a developer who has never seen PyReact.

**Does it answer:**
- What is this? ✓
- How do I run it? ✓
- How do I build something with it? ✓
- What does it actually do under the hood? ✓
- What are its limits? ✓
- Where do I go next? ✓

A README that answers all six questions is a complete README.

---

## Part 4 — The Architecture Review

This is not a step — it's a reading. It is the most important part of Lab 8.

Before this lab you built things. This section explains what you built in the language senior engineers use to describe systems. Read it carefully.

---

### The Full Data Flow, End to End

```
1. Developer writes render(state) in Python
   └── Uses create_element() to build a VNode tree
   └── VNode is a plain Python object: {tag, props, children}

2. Browser connects via WebSocket
   └── Server calls get_initial_state()
   └── Server calls render(state) → VNode tree
   └── Server calls serialize(vnode) → plain dict
   └── Server sends JSON: {"type": "mount", "vnode": {...}}

3. Browser receives mount message
   └── JSON.parse() → JavaScript object
   └── mount(root, vnode) called
   └── buildNode(vnode) recursively creates DOM nodes
   └── DOM inserted into #root

4. User clicks a button with data-event="increment"
   └── Delegated listener on document.body fires
   └── event.target.dataset.event === "increment"
   └── socket.send(JSON.stringify({event: "increment"}))

5. Server receives event
   └── json.loads(text) → {"event": "increment"}
   └── state["count"] += 1
   └── new_vnode = render(state)
   └── diff(old_vnode, new_vnode, patch)
   └── patch = [{type: UPDATE_TEXT, path: [0,0], old: "0", new: "1"}]
   └── json.dumps({"type": "patch", "patch": patch})
   └── websocket.send_text(...)

6. Browser receives patch message
   └── JSON.parse() → {type: "patch", patch: [...]}
   └── applyPatch(root, patch)
   └── For UPDATE_TEXT: getNodeAtPath(root, [0,0]).textContent = "1"
   └── One DOM node updated. Screen repaints that text.

7. old_vnode = new_vnode. Loop continues.
```

Every lab you wrote contributed one piece of this flow. None of it is magic. Every step is a function call you wrote and understand.

---

### What You Now Understand That Most Developers Don't

Most developers who use React, Vue, or Svelte treat the framework as a black box. They know the API. They don't know the mechanism. You now know the mechanism.

Specifically, you can answer:

**"What is JSX really?"**
Syntax sugar. A compiler replaces `<div>` with `jsx("div", ...)`. The browser never sees JSX. The `jsx()` function returns a plain object. That's the whole story.

**"What does React actually do when state changes?"**
It re-runs the component function. It gets a new VNode tree. It diffs the old tree against the new one using a heuristic O(n) algorithm with the two assumptions (same position + different type = replace, children by index). It produces a minimal list of operations. It applies them to the DOM. That's the whole story.

**"What is the virtual DOM?"**
A plain JavaScript object that describes what one element looks like: its tag, its attributes, and its children. Nothing more. The "virtual" just means it exists in memory, not in the browser's rendering engine.

**"How does Phoenix LiveView work?"**
Exactly like Lab 6. State lives on the server. The server renders, diffs, and sends patches over a WebSocket. The browser applies them. The client is thin. The server is authoritative. You didn't just read about LiveView — you built a minimal version of it.

**"What is a hook?"**
A function that uses a slot index to persist a value across renders of the component that called it. The slot index advances by one on each call. It resets at the start of each render. The value lives outside the component in a shared array. `useState` is the simplest possible hook.

**"What is reconciliation?"**
Comparing two trees, node by node, by position. Recording differences as typed operations. Applying those operations to the real DOM. The O(n) bound comes from the heuristic: if types differ, replace and stop — don't recurse into children.

---

### Where React Goes Further

You built the simplest coherent version. Here's what React adds on top:

**Fiber:** React's reconciler doesn't do the full diff in one synchronous pass. It splits work into units and can yield between them — allowing the browser to handle user input mid-render. This is "concurrent mode." Our reconciler blocks the thread for the entire diff. Fine for small trees. Breaks for trees with tens of thousands of nodes.

**Synthetic Events:** React doesn't use `addEventListener` directly. It normalizes browser event inconsistencies into a unified event object. We use raw DOM events — they're fine for modern browsers.

**Component Instances:** React tracks which component instance rendered which part of the tree. This enables error boundaries, context, and ref forwarding. Our framework treats the entire app as one flat render — no component identity tracking.

**useEffect:** A hook that runs after render, with a cleanup function that runs before the next effect or on unmount. Used for subscriptions, timers, and external system synchronization. Our framework has no lifecycle hooks.

**Keys in depth:** React's key matching handles all four cases: add, remove, move, and update. Our implementation handles add, remove, and update. Move (MOVE_CHILD) requires DOM's `insertBefore` — a fifth operation type we deliberately skipped.

---

### The Path to Production

If you wanted to evolve PyReact toward production, the priority order is:

```
1. Shared state across connections
   → Module-level state dict + broadcast patches to all connected sockets
   → asyncio.Queue per connection for thread-safe message passing

2. Database persistence
   → Load state from DB on connect, save after each event
   → State dict becomes a Pydantic model for validation

3. Authentication
   → Validate session token in WebSocket handshake (before accept())
   → Per-user state isolation using authenticated user ID as key

4. useEffect equivalent
   → Lifecycle callbacks on mount/unmount
   → Cleanup functions for subscriptions and timers

5. MOVE_CHILD operation
   → DOM insertBefore in patcher.js
   → Reorder detection in both reconcilers

6. Optimistic updates for inputs
   → Browser updates local value immediately
   → Server patch corrects if validation fails

7. Production deployment
   → npm run build (minified bundle)
   → uvicorn with multiple workers behind nginx
   → WebSocket sticky sessions (connections must reach same worker)
```

Each of these is a well-defined engineering problem. You now have the vocabulary and mental model to research and implement any of them.

---

## 🎯 Final Challenge: Add One Feature Independently

**You know:** The entire framework. Every layer. Every data flow.

**Task:** Add one feature to the todo app entirely on your own, without hints. Choose one:

**Option A — Priority levels**
Each todo has a priority: Low, Medium, High. A new button cycles through priorities. The todo displays a colored indicator. High-priority todos sort to the top.

**Option B — Persistence**
When the server restarts, todos are not lost. Store state in a JSON file (`state.json`). Load it on startup. Save it after every event.

**Option C — Edit in place**
Clicking a todo's text makes it editable. Pressing Enter or clicking away saves the change. Pressing Escape cancels.

**Rules:**
- No hints
- No `<details>` block for this one — implement it, then review your own solution
- Time yourself: a fluent PyReact developer should complete any of these in 30–45 minutes
- After finishing, ask yourself: which files did you touch? Was the change localized or scattered?

This challenge has no posted solution because the goal is not the solution — it's the experience of building in a framework you fully understand. Notice how different it feels from vibe-coding. You know where things go. You know why. You know what will break and what won't.

---

## Final Check — The Whole Series

This table covers the entire framework:

| Concept | Where it lives | How to verify |
|---|---|---|
| VNode structure | `framework/vdom.py` | `python -c "from framework.vdom import VNode; print(VNode('div').tag)"` |
| Serialization | `framework/vdom.py` | `serialize(create_element("div"))` → plain dict |
| Python diff | `framework/reconciler.py` | Remove keyed child → one REMOVE_CHILD |
| JS diff | `framework/reconciler.js` | Browser console diff test → same result |
| DOM patching | `framework/patcher.js` | applyPatch with UPDATE_TEXT → text changes |
| Event listeners | `framework/patcher.js` | Rapid clicks → count correct, no accumulation |
| Reconnection | `framework/patcher.js` | Stop server → retry messages → restart → reconnects |
| JSX compilation | `app/app.jsx` + esbuild | bundle.js contains `jsx(` not `<` |
| useState slots | `framework/runtime.js` | Two state values update independently |
| Render batching | `framework/runtime.js` | `_renderPending` flag in source |
| WebSocket mount | `app/app.py` | Network tab → first message is `{"type":"mount"}` |
| WebSocket patch | `app/app.py` | Click → Network tab → `{"type":"patch"}` |
| Event delegation | `framework/patcher.js` | One click listener on body, not per element |
| Keyed diffing | both reconcilers | Remove middle todo → one REMOVE_CHILD patch |
| CSS separation | `app/style.css` | Delete style.css → app works, just unstyled |
| Project structure | `framework/` vs `app/` | Framework files unchanged when building new app |

---

## Quick Check Answers

**1. Which of these does React have? Which does Phoenix LiveView have?**

React has: virtual DOM, reconciler, DOM patcher, JSX runtime, and reactive state (useState). React does not have server-authoritative state — React's state lives in the browser.

Phoenix LiveView has: server-authoritative state, WebSocket protocol, server-side render, and diff-based patch transport. LiveView does not use JSX (it uses HEEx templates) and does not have a client-side virtual DOM — it sends HTML diff patches rather than VNode patches.

PyReact has elements of both: JSX and useState from the React model, server-authoritative state and WebSocket patching from the LiveView model. This hybrid is the architecture you built across eight labs.

**2. Which files would a developer change to build a new app?**

Change: `app/app.py` (state, render function, event handlers), `app/app.jsx` (if they need client-side components), `app/style.css` (visual design), `index.html` (page title, meta tags).

Leave untouched: everything in `framework/`. The virtual DOM, reconciler, patcher, and JSX runtime are the library — they're correct and generic. An application developer never opens them. This is the framework/application boundary working exactly as intended.

**3. What's the missing half of hot reload?**

You have: esbuild `--watch` (JavaScript recompiles on save) and uvicorn `--reload` (Python restarts on save). What you don't have: automatic browser refresh after those recompiles. Right now you must manually press F5 after saving. Full hot reload would have a small script in the browser that listens on a secondary WebSocket for a "reload" signal — the dev server sends this signal after every recompile. The browser receives it and calls `location.reload()`. This is exactly what Vite's dev server does. Implementing it requires a second WebSocket endpoint (not the app's `/ws` but a dev-only `/dev-reload`) and a script tag in `index.html` that only loads in development. The framework code would be unchanged — it's purely a dev tooling addition.

---

## The Series Is Complete

You have built, from scratch, with full understanding of every line:

```
Lab 1 — VNode: the data structure that makes it all possible
Lab 2 — Reconciler: O(n) tree diffing with five operation types
Lab 3 — DOM Patcher: translating patches into real browser changes
Lab 4 — JSX Runtime: what JSX actually is and how it compiles
Lab 5 — Reactive State: useState, slots, closures, and render loops
Lab 6 — FastAPI + WebSocket: server-authoritative UI architecture
Lab 7 — Incremental Updates: four real bugs, four real fixes
Lab 8 — Developer Experience: structure, style, documentation, review
```

The next time someone describes React, Phoenix LiveView, virtual DOM diffing, WebSocket-driven UI, or reactive state systems — you won't be nodding along hoping it makes sense. You'll know exactly what they're describing, because you built it.

That's what this series was for.

---

*PyReact — a complete educational UI framework.*
*8 labs. ~2,500 lines of explained code. Zero magic.*