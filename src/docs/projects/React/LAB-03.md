That means a lot — and I want to give you an honest answer before writing Lab 3.

---

**What "the whole series" actually means:**

Based on the phase plan in your original prompt, here's the full scope:

```
Lab 1  ✅ — VNode, create_element, serialize
Lab 2  ✅ — Reconciler, diff, patch format
Lab 3  — DOM Patcher (JavaScript + browser)
Lab 4  — JSX Runtime (how JSX actually compiles)
Lab 5  — Reactive State (useState equivalent)
Lab 6  — FastAPI + WebSocket integration
Lab 7  — Incremental updates over WebSocket
Lab 8  — Developer experience (hot reload, project structure)
```

That's 6 more labs at the same depth as Labs 1 and 2. Each one will be this long. **I can write all of them, in this window, to exactly this standard.** The format will not drift — you've seen two labs now and can call out any deviation immediately.

---

**One honest constraint:**

Lab 3 introduces JavaScript. Not as a "now learn a whole new language" moment — but because the DOM only exists in browsers, and browsers only speak JavaScript. Every concept will be explained the same way Python was: why this exists, what it hides, what the alternative would look like.

If at any point the JavaScript feels unexplained, stop me with:

> "You described that, you didn't explain it."

Same rule as always.

---

Ready. Writing Lab 3 now.

---

# PyReact — LAB 3 — The DOM Patcher: Applying Patches to the Browser

**Prerequisites:** Lab 1 (`vdom.py`) and Lab 2 (`reconciler.py`). You know what a VNode is, what a patch is, and what the five operation types mean. You have Python installed and can run a `.py` file from the terminal.

**What this lab adds:**
- A Python file that serves an HTML page over HTTP
- A JavaScript file that receives a patch and applies it to the real browser DOM
- A visible webpage that gets updated by our Python reconciler's output — no page reload

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. You have a patch that says `[UPDATE_TEXT] at path [0, 1]`. To apply this in a browser, what do you need to find first — and how would you find it?
> 2. The browser already has its own tree of elements. What is that tree called, and how does JavaScript interact with it?
> 3. If our Python reconciler runs on the server and produces a patch — how does that patch get to the browser? What has to happen in between?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will:

1. Run `python server.py` in your terminal
2. Open `http://localhost:8000` in your browser
3. See a real webpage rendered from our VNode tree
4. Open the browser console and paste a patch
5. Watch the DOM update live — no reload

```
Terminal:                    Browser:
$ python server.py    →      ┌─────────────────┐
  Serving on :8000           │  Hello, world   │
                             │  [Click me]     │
                             └─────────────────┘
                                     ↓ paste patch in console
                             ┌─────────────────┐
                             │  Goodbye, world │
                             │  [Submit]       │
                             └─────────────────┘
```

---

## Concept: The Browser DOM

**What it is:** A tree of live objects that the browser maintains in memory to represent the current state of a webpage. Every HTML element becomes a node object in this tree. JavaScript can read and modify these objects, and the browser automatically repaints the screen to reflect changes.

**The problem before:**

Without the DOM, the only way to change what's on screen would be to reload the entire page — send a new HTML file from the server, let the browser re-parse it, redraw everything. This is how the web worked in the 1990s. Every interaction required a full round-trip to the server and a full page repaint.

**The solution:** The browser keeps the parsed page as a live object tree in memory. JavaScript can reach into that tree, change one node, and the browser updates only the affected pixels — no reload, no round-trip. This is what makes interactive web apps possible.

**What it hides:** The DOM API hides the browser's internal rendering pipeline — layout calculation, paint, composite — behind simple method calls. You call `element.textContent = "hello"` and the browser figures out which pixels changed and redraws them. The invariant it protects: **any change made through the DOM API is immediately reflected on screen. You never need to manually trigger a repaint.**

**Canonical example (General):**

Think of the browser as a theater. The DOM is the stage — a live, physical arrangement of props and actors. The HTML file you download is the script — it describes the initial arrangement. JavaScript is the stage manager who can walk onto the stage during a performance and move props around. The audience (the user) sees the changes instantly, without the curtain dropping and resetting.

**Project application (The "Why" here):**

Our Python reconciler produces patches. Those patches describe changes to a VNode tree. The DOM patcher is a JavaScript program that receives those patches, navigates the real browser DOM to find the right nodes, and applies the changes. The DOM is the target — the actual thing being modified when a user sees the UI update.

**Watch for:** The browser DOM and our VNode tree are parallel structures — they represent the same UI, one in Python memory and one in browser memory. Keeping them in sync is the core responsibility of the patcher. If they ever diverge, the user sees something different from what the server thinks they're seeing.

---

## Concept: The DOM API

**What it is:** A set of JavaScript functions and properties that let you create, read, modify, and delete nodes in the browser DOM tree.

**The problem before:**

Without a standard API, every browser would have its own proprietary way to modify the page. Code written for one browser would break in another. Web development in the early 2000s was largely an exercise in working around these differences.

**The solution:** The W3C standardized the DOM API. Every modern browser implements the same interface. The methods we'll use are:

```javascript
// Creating nodes
document.createElement("div")     // create a new element node
document.createTextNode("hello")   // create a new text node

// Reading the tree
element.children                   // list of child elements
element.childNodes                 // list of all child nodes (including text)

// Modifying the tree
parent.appendChild(child)          // add child at the end of parent
parent.removeChild(child)          // remove a specific child from parent
parent.replaceChild(newNode, old)  // swap one child for another

// Modifying properties
element.setAttribute("id", "app") // set an attribute
element.removeAttribute("class")   // remove an attribute
element.textContent = "hello"      // replace all text content
```

**What it hides:** The DOM API hides pointer manipulation and memory management. Without it, adding a child node would require manually updating linked list pointers inside the browser's internal C++ data structures. The invariant it protects: **every DOM operation leaves the tree in a valid state — no dangling references, no orphaned nodes, no broken parent-child links.**

**Canonical example (General):**

`document.createElement("div")` is like ordering a new piece of furniture from a warehouse. It exists — it's a real object — but it isn't in the room yet. `parent.appendChild(child)` is placing the furniture in the room. Until it's appended somewhere, the element exists in memory but is invisible.

**Project application (The "Why" here):**

Each of our five patch operation types maps directly to one or more DOM API calls:

```
REPLACE       → parent.replaceChild(newNode, oldNode)
UPDATE_PROPS  → element.setAttribute / element.removeAttribute
UPDATE_TEXT   → textNode.textContent = newValue
ADD_CHILD     → parent.appendChild(newElement)
REMOVE_CHILD  → parent.removeChild(child)
```

The DOM patcher is the translation layer between our patch format and these calls.

**Watch for:** `element.children` returns only element nodes (divs, ps, buttons). `element.childNodes` returns all nodes including text nodes. We need `childNodes` when navigating paths, because our VNode tree includes text children.

---

## Step 1 — Set Up the Project Structure

Add three new files to your `pyreact` folder:

```
pyreact/
  vdom.py          ← Lab 1, unchanged
  reconciler.py    ← Lab 2, unchanged
  server.py        ← new: Python HTTP server
  index.html       ← new: the webpage
  patcher.js       ← new: JavaScript DOM patcher
```

Create `index.html` first. Type this exactly:

```html
<!DOCTYPE html>
<!-- DOCTYPE tells the browser this is modern HTML5, not legacy HTML -->
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- charset=UTF-8 means the browser uses Unicode — handles any character -->
  <title>PyReact</title>
</head>
<body>

  <div id="root">
    <!-- This is the mount point — our framework will render into this div -->
    <!-- It starts empty. JavaScript will populate it. -->
  </div>

  <script src="/patcher.js"></script>
  <!-- Load our patcher after the body so the DOM exists when the script runs -->
  <!-- /patcher.js is a URL path — our Python server will serve this file -->

</body>
</html>
```

**Why does the `<script>` tag go at the bottom of `<body>`?**

Scripts run the moment the browser encounters them. If the script is in `<head>`, it runs before the browser has parsed `<body>` — which means `document.getElementById("root")` returns `null` because the `div` doesn't exist yet. Placing the script at the bottom of `<body>` guarantees all HTML above it has already been parsed into the DOM.

### CSS AND SEE

Open `index.html` directly in your browser (double-click the file).

**You should see:** A blank white page. No errors in the browser console (open with F12 → Console tab).

This is correct. The `div#root` exists in the DOM but is empty. The script will populate it.

---

## Concept: The HTTP Server

**What it is:** A program that listens for requests from browsers and responds with files — HTML, JavaScript, images, and data.

**The problem before:**

If you open `index.html` by double-clicking it, the browser uses the `file://` protocol. This works for HTML but blocks many browser security features that require `http://` — including the WebSocket connections we'll add in Lab 6. We need a real HTTP server from the start.

**The solution:** Python's standard library includes `http.server` — a minimal HTTP server that serves files from a directory. Two lines of code, no dependencies, works everywhere.

**What it hides:** The HTTP server hides the TCP socket layer — accepting connections, reading raw bytes, parsing HTTP request headers, writing HTTP response headers, and closing connections. The invariant it protects: **any file in the server's directory is accessible via `http://localhost:8000/filename` with correct HTTP headers, without you managing any socket code.**

**Canonical example (General):**

An HTTP server is a librarian. A browser walks up and says "I'd like `index.html`." The librarian finds it, hands it over with a card that says "this is an HTML file, 1,432 bytes long." The browser reads the card, then reads the file. The HTTP protocol is the standardized format of that card — every browser and server speaks it.

**Project application (The "Why" here):**

We need the server now so `patcher.js` can be loaded via `<script src="/patcher.js">`. A `file://` URL can't make requests to `/patcher.js` — that's an HTTP path. Also, starting with a real server now means Lab 6's WebSocket integration requires zero changes to this layer.

**Watch for:** Python's built-in server serves files from the directory you run it from. Always run `python server.py` from inside the `pyreact/` folder, or the server won't find `index.html` and `patcher.js`.

---

## Step 2 — Create the Python Server

Create `server.py` and type the following:

```python
# server.py
# A minimal HTTP server that serves files from the current directory.
# This is a standard library server — no pip install required.

import http.server   # Python's built-in HTTP server module
import socketserver  # handles the socket lifecycle (accept, read, write, close)

PORT = 8000
# The port number our server listens on.
# 8000 is the conventional port for local development servers.
# (Port 80 is the standard HTTP port but requires admin privileges on most systems.)

Handler = http.server.SimpleHTTPRequestHandler
# SimpleHTTPRequestHandler handles one request type: GET
# For every GET request it receives, it looks for a matching file
# in the current directory and sends it back with correct headers.

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    # ("", PORT) means: listen on all network interfaces, on PORT 8000
    # "" means "any IP address on this machine" — equivalent to "0.0.0.0"
    print(f"Serving at http://localhost:{PORT}")
    httpd.serve_forever()
    # serve_forever() is a blocking call — it runs until you press Ctrl+C
    # Each request is handled synchronously, one at a time
```

### SAVE AND TRY

Save `server.py`. In your terminal, navigate to the `pyreact/` folder and run:

```
python server.py
```

**You should see:**
```
Serving at http://localhost:8000
```

Open your browser and go to `http://localhost:8000`.

**You should see:** A blank white page — the same `index.html` as before, but now served over HTTP.

Open DevTools (F12) → Network tab. Refresh the page. You should see two requests: one for `index.html` and one for `patcher.js` (which will 404 for now — that's fine, we haven't created it yet).

**Change something:** Go to `http://localhost:8000/vdom.py` in your browser. You should see your Python source code rendered as plain text. This is the server serving any file in the directory — it doesn't know or care what type it is. Press Ctrl+C in the terminal to stop the server when you're done exploring.

---

## Concept: Navigating the DOM With a Path

**What it is:** A function that takes our path format (a list of child indices like `[0, 2, 1]`) and walks the DOM tree to find the exact node at that address.

**The problem before:**

Our patch operations specify locations as paths: `[0, 1]` means "the root's first child's second child." The DOM API has no built-in method that accepts this format. You can't call `document.getNodeAtPath([0, 1])`.

**The solution:** Write a function that starts at the root node and follows the path step by step — take the first child, then take the second child of that, then return whatever node we've arrived at.

**What it hides:** Path navigation hides the manual chain of `childNodes` accesses. Without it, every patch operation would contain its own navigation loop. The invariant it protects: **given a valid path and a root node, `getNodeAtPath` always returns the exact node that path refers to, or throws a clear error if the path is invalid.**

**Canonical example (General):**

Following a trail of breadcrumbs. You start at the trailhead (root). The first number says "take the third path." You walk it. The second number says "take the first path." You walk it. You've arrived. Each number is one decision at one fork in the trail.

```javascript
// path = [0, 2] means:
// start at root
// → take child at index 0
// → take child at index 2
// → you're there

function getNodeAtPath(root, path) {
    let node = root;                    // start at the root
    for (const index of path) {         // follow each step in the path
        node = node.childNodes[index];  // move to the child at this index
    }
    return node;                        // return wherever we ended up
}
```

**Project application (The "Why" here):**

Every patch operation starts with "navigate to this path." By extracting this into one function, every operation handler is shorter and all navigation bugs are in one place. If something navigates wrong, there's exactly one function to fix.

**Watch for:** We use `childNodes` not `children`. `children` only counts element nodes — it skips text nodes. Our paths treat text nodes as real children (index 0 of a `<p>` that contains text is that text node). `childNodes` includes everything, which matches our VNode model.

---

## Step 3 — Create the JavaScript Patcher (Navigation)

Create `patcher.js` and type the following. This is the first JavaScript in this series — every new piece of syntax is explained inline.

```javascript
// patcher.js
// The DOM patcher: receives patches from our Python reconciler
// and applies them to the real browser DOM.

// ─── Path Navigation ──────────────────────────────────────────

function getNodeAtPath(root, path) {
    // root: the DOM node to start from (our #root div)
    // path: array of child indices, e.g. [0, 2, 1]

    let node = root;
    // let declares a variable that can be reassigned
    // We start at the root and will walk it forward

    for (const index of path) {
        // for...of loops over each VALUE in an array
        // const index is each step in the path, one at a time
        node = node.childNodes[index];
        // childNodes is a live list of ALL child nodes (elements AND text)
        // [index] picks the child at that position
        // We reassign node to move one step deeper
    }

    return node;
    // After following all steps, node is the target
}
```

**Why `let` for `node` but `const` for `index`?**

`let` declares a variable that can be reassigned — we need to update `node` at each step of the loop. `const` declares a variable that cannot be reassigned — `index` is a fresh value each iteration and we never need to change it. Using `const` wherever possible is a modern JavaScript convention: it signals to anyone reading the code that this value won't change, which reduces the mental load of tracking state.

### SAVE AND TRY

Stop your server (Ctrl+C) and restart it:
```
python server.py
```

Open `http://localhost:8000` and open DevTools (F12) → Console tab.

Type directly in the console:

```javascript
const root = document.getElementById("root");
console.log(root);
```

**Expected:** The `<div id="root"></div>` element logged to the console. Click it — you'll see it highlighted in the Elements panel.

Now test path navigation (the root is currently empty, so we'll add a test node first):

```javascript
root.innerHTML = "<p>Hello</p>";
const result = getNodeAtPath(root, [0]);
console.log(result);
```

**Expected:** The `<p>` element. `[0]` means "first child of root" — which is the `<p>` we just added.

```javascript
const textResult = getNodeAtPath(root, [0, 0]);
console.log(textResult);
```

**Expected:** A text node containing `"Hello"`. This is index 0 of the `<p>` — the text node inside it.

**Change something:** Try `getNodeAtPath(root, [0, 0, 0])`. You should get `undefined` because the text node has no children. This is the kind of error that will happen if our paths are wrong — good to see what it looks like now.

---

## Concept: Building DOM Nodes From VNodes

**What it is:** A function that takes a serialized VNode (a plain JavaScript object from JSON) and creates a real DOM node from it.

**The problem before:**

Our patch's `ADD_CHILD` and `REPLACE` operations include a `new_node` field — the VNode to insert. That VNode arrives as a JavaScript object (parsed from JSON). The DOM API doesn't know what a VNode is — it only understands real DOM nodes. We need to translate.

**The solution:** A recursive function that converts a VNode object into a DOM node. If the VNode is a string, create a text node. If it's an element, create an element node, set its props, and recursively build and append its children.

**What it hides:** `buildNode` hides the multi-step process of creating a DOM subtree. Without it, every operation that needs to insert a new node would repeat the create → set props → build children → append loop. The invariant it protects: **any valid serialized VNode passed to `buildNode` produces a complete, correctly structured DOM subtree — props set, children appended, ready to insert.**

**Canonical example (General):**

A factory assembly line. Raw materials come in one end (a VNode object). At each station, one operation is performed: create the frame, attach the props, install the children. A finished product comes out the other end (a live DOM node). The factory doesn't care what model it's building — it follows the same steps for every VNode.

**Project application (The "Why" here):**

`buildNode` is called by two patch operations: `REPLACE` (needs to build the replacement node) and `ADD_CHILD` (needs to build the new child node). Extracting it into one function means both operations stay simple — they call `buildNode` and get back a ready-to-use DOM node.

**Watch for:** `buildNode` is recursive for the same reason `serialize` and `deserialize` were — a node's children are also nodes. The recursion bottoms out at text nodes, which have no children.

---

## Step 4 — Add the Node Builder

Add to `patcher.js` below the navigation section:

```javascript
// ─── Node Builder ─────────────────────────────────────────────

function buildNode(vnode) {
    // vnode: a plain JavaScript object from parsed JSON
    // e.g. { tag: "div", props: { id: "app" }, children: ["Hello"] }
    // OR: a plain string for text nodes, e.g. "Hello"

    if (typeof vnode === "string") {
        // typeof returns the type of a value as a string
        // typeof "hello" === "string" → true
        // typeof {} === "object" → true
        return document.createTextNode(vnode);
        // createTextNode makes a bare text node — no tag, no attributes
        // This is the leaf node of our tree — the base case of the recursion
    }

    const element = document.createElement(vnode.tag);
    // createElement creates a new DOM element with the given tag name
    // It is NOT yet in the document — it exists only in memory

    for (const [key, value] of Object.entries(vnode.props)) {
        // Object.entries converts { id: "app", color: "blue" } into
        // [["id", "app"], ["color", "blue"]] — an array of [key, value] pairs
        // for...of with destructuring [key, value] unpacks each pair
        element.setAttribute(key, value);
        // setAttribute adds or updates one attribute on the element
    }

    for (const child of vnode.children) {
        // Loop over each child VNode (could be a string or an object)
        element.appendChild(buildNode(child));
        // Recursively build the child, then append it to this element
        // appendChild adds a node as the LAST child of the parent
    }

    return element;
    // Return the fully constructed element, ready to be inserted somewhere
}
```

### SAVE AND TRY

Restart the server. Open `http://localhost:8000` → Console.

```javascript
const vnode = {
    tag: "div",
    props: { id: "test" },
    children: [
        { tag: "p", props: {}, children: ["Hello from buildNode"] }
    ]
};

const domNode = buildNode(vnode);
console.log(domNode);
```

**Expected:** A `<div id="test">` element logged to the console. Expand it — you should see a `<p>` child containing the text.

```javascript
document.getElementById("root").appendChild(domNode);
```

**Expected:** The text "Hello from buildNode" appears on the page.

**Change something:** Build a VNode with two children and a prop. Confirm both children appear when appended. Then try `buildNode("just a string")` — confirm it returns a text node (check `domNode.nodeType` — text nodes have `nodeType === 3`, elements have `nodeType === 1`).

---

## Step 5 — Implement the Five Patch Operations

Add to `patcher.js` below the node builder:

```javascript
// ─── Patch Operations ─────────────────────────────────────────

function applyOperation(root, op) {
    // root: the mount point (#root div) — all paths are relative to this
    // op: one operation object from the patch array

    if (op.type === "REPLACE") {
        const target = getNodeAtPath(root, op.path);
        // Navigate to the node being replaced

        const newNode = buildNode(op.new_node);
        // Build the replacement DOM node from the VNode

        target.parentNode.replaceChild(newNode, target);
        // parentNode is the parent of target in the DOM tree
        // replaceChild(new, old) swaps old for new inside the parent
        // We need the parent because replaceChild is called ON the parent
    }

    else if (op.type === "UPDATE_PROPS") {
        const target = getNodeAtPath(root, op.path);

        for (const key of Object.keys(op.removed)) {
            // Object.keys returns just the keys of an object as an array
            target.removeAttribute(key);
            // removeAttribute deletes an attribute entirely from the element
        }

        for (const [key, value] of Object.entries(op.added)) {
            target.setAttribute(key, value);
        }

        for (const [key, value] of Object.entries(op.changed)) {
            target.setAttribute(key, value);
            // setAttribute handles both add and update — the same call works
            // for changed values as for added ones
        }
    }

    else if (op.type === "UPDATE_TEXT") {
        const target = getNodeAtPath(root, op.path);
        target.textContent = op.new;
        // textContent replaces ALL text content inside a node
        // For a text node specifically, this changes its displayed value
    }

    else if (op.type === "ADD_CHILD") {
        const parent = getNodeAtPath(root, op.path);
        // op.path is the PARENT's path — navigate to the parent

        const newChild = buildNode(op.new_node);
        parent.appendChild(newChild);
        // appendChild adds the new child at the END of parent's children
        // This matches our reconciler: ADD_CHILD indices are always at the end
        // (they're beyond the length of the old children list)
    }

    else if (op.type === "REMOVE_CHILD") {
        const parent = getNodeAtPath(root, op.path);
        const childToRemove = parent.childNodes[op.index];
        // Navigate to the parent, then find the specific child by index
        parent.removeChild(childToRemove);
        // removeChild detaches the node from the DOM entirely
    }
}
```

**Why does `REPLACE` use `target.parentNode` instead of navigating to the parent with the path?**

Because computing the parent's path from the child's path would require stripping the last element (`op.path.slice(0, -1)`). That works but adds complexity. The DOM already knows every node's parent via `parentNode` — using it directly is simpler and more reliable. This is an example of using the DOM's own structure rather than re-deriving information we already have.

### SAVE AND TRY

Restart server. Open `http://localhost:8000` → Console.

First, build an initial tree in the root:

```javascript
const root = document.getElementById("root");
const initial = buildNode({
    tag: "div", props: {},
    children: [
        { tag: "p", props: {}, children: ["Hello"] },
        { tag: "button", props: {}, children: ["Click me"] }
    ]
});
root.appendChild(initial);
```

**You should see** "Hello" and "Click me" on the page.

Now apply a text update:

```javascript
applyOperation(root, {
    type: "UPDATE_TEXT",
    path: [0, 0, 0],
    old: "Hello",
    new: "Goodbye"
});
```

**Expected:** The page now shows "Goodbye" — no reload.

Test a prop update:

```javascript
applyOperation(root, {
    type: "UPDATE_PROPS",
    path: [0, 1],
    added: { style: "color: red" },
    removed: {},
    changed: {}
});
```

**Expected:** The button text turns red.

**Change something:** Apply a REMOVE_CHILD operation to remove the button (path `[0]`, index `1`). Confirm it disappears from the page. Then apply ADD_CHILD to add a new `span` with text `"New!"`.

---

## Step 6 — Add the Mount and Apply Functions

Add to `patcher.js` at the bottom:

```javascript
// ─── Public API ───────────────────────────────────────────────

function mount(rootElement, vnode) {
    // mount: perform the initial render — build the full DOM from a VNode tree
    // rootElement: the DOM node to render into (our #root div)
    // vnode: the complete initial VNode tree

    rootElement.innerHTML = "";
    // Clear any existing content in the mount point
    // innerHTML = "" is the fastest way to remove all children

    rootElement.appendChild(buildNode(vnode));
    // Build the full tree and insert it in one operation
}

function applyPatch(rootElement, patch) {
    // applyPatch: apply a list of operations to the live DOM
    // rootElement: same mount point as mount()
    // patch: array of operation objects from our Python reconciler

    for (const op of patch) {
        applyOperation(rootElement, op);
        // Apply each operation in order
        // Order matters: a REPLACE must happen before operations on its children
    }
}

// Make these available in the browser console for testing
window.PyReact = { mount, applyPatch, buildNode };
// window is the global object in browsers — anything on window is accessible everywhere
// We namespace everything under PyReact to avoid polluting the global scope
// "Polluting" means adding names that might conflict with other scripts
```

### SAVE AND TRY

Restart server. Open `http://localhost:8000` → Console.

```javascript
const root = document.getElementById("root");

PyReact.mount(root, {
    tag: "div", props: {},
    children: [
        { tag: "p",     props: {},              children: ["Hello, world"] },
        { tag: "button", props: { id: "btn" }, children: ["Click me"] }
    ]
});
```

**You should see:** "Hello, world" and a button labeled "Click me" appear on the page.

Now apply a multi-operation patch:

```javascript
PyReact.applyPatch(root, [
    {
        type: "UPDATE_TEXT",
        path: [0, 0, 0],
        old: "Hello, world",
        new: "Goodbye, world"
    },
    {
        type: "UPDATE_TEXT",
        path: [0, 1, 0],
        old: "Click me",
        new: "Submit"
    }
]);
```

**Expected:** Both texts update simultaneously — no reload.

**Change something:** Write a patch that changes the button's `id` prop from `"btn"` to `"submit-btn"`. Confirm it by inspecting the element in DevTools → Elements panel.

---

## Step 7 — Connect Python Output to the Browser

Now we close the loop: generate a patch in Python and apply it in the browser.

Add the following to the bottom of `reconciler.py` (replace the existing `if __name__ == "__main__"` block):

```python
if __name__ == "__main__":
    import json
    from vdom import create_element

    old = create_element(
        "div", {},
        create_element("p", {}, "Hello, world"),
        create_element("button", {"id": "btn"}, "Click me")
    )

    new = create_element(
        "div", {},
        create_element("p", {}, "Goodbye, world"),
        create_element("button", {"id": "submit-btn"}, "Submit")
    )

    patch = []
    diff(old, new, patch)

    # Serialize the patch to JSON so the browser can consume it
    print(json.dumps(patch, default=serialize_node, indent=2))
    # default=serialize_node tells json.dumps how to handle VNode objects
    # json.dumps doesn't know how to serialize our VNode class by default
```

Add this helper above the `if __name__` block:

```python
def serialize_node(obj):
    # This function is called by json.dumps whenever it encounters
    # an object it doesn't know how to serialize (like a VNode)
    from vdom import VNode, serialize
    if isinstance(obj, VNode):
        return serialize(obj)
        # serialize() converts VNode to a plain dict — json.dumps handles dicts
    raise TypeError(f"Cannot serialize {type(obj)}")
    # If it's not a VNode, we don't know what it is — raise an error
```

### SAVE AND TRY

In your terminal (stop the server first with Ctrl+C):

```
python reconciler.py
```

**You should see** a JSON patch. Copy the entire output.

Restart the server:
```
python server.py
```

Open `http://localhost:8000` → Console. Mount the initial tree:

```javascript
PyReact.mount(document.getElementById("root"), {
    tag: "div", props: {},
    children: [
        { tag: "p", props: {}, children: ["Hello, world"] },
        { tag: "button", props: { id: "btn" }, children: ["Click me"] }
    ]
});
```

Now paste the JSON patch output from Python directly into the console:

```javascript
PyReact.applyPatch(document.getElementById("root"), [
    /* paste your Python output here */
]);
```

**Expected:** Both the paragraph text and button text update. The button's id changes. All driven by our Python reconciler's output.

This is the full pipeline working end to end — Python describes the change, JSON carries it, JavaScript applies it.

---

## 🎯 Challenge: Apply a Patch That Adds and Removes Children

**You know:** The full `applyPatch` function handles all five operation types including ADD_CHILD and REMOVE_CHILD.

**Task:**

1. In Python (`reconciler.py` interactive or a new `test_patcher.py`), create an old tree with three children and a new tree with only two (the middle one removed)
2. Run the diff to get the patch JSON
3. Mount the old tree in the browser
4. Apply the patch and verify the correct child disappears

**Starting point for Python:**

```python
from vdom import create_element
from reconciler import diff, serialize_node
import json

old = create_element("div", {},
    create_element("p", {}, "First"),
    create_element("p", {}, "Second"),   # this one should disappear
    create_element("p", {}, "Third")
)

new = create_element("div", {},
    create_element("p", {}, "First"),
    create_element("p", {}, "Third")
)

patch = []
diff(old, new, patch)
print(json.dumps(patch, default=serialize_node, indent=2))
```

**Hint:** Look carefully at what path and index the REMOVE_CHILD operation produces. Does it remove "Second" or "Third"? Think about why — this connects back to Lab 2's discussion of index-based diffing.

Try before revealing.

---

<details>
<summary>▶ Show Solution</summary>

**Python output:**
```json
[
  {
    "type": "UPDATE_TEXT",
    "path": [1, 0],
    "old": "Second",
    "new": "Third"
  },
  {
    "type": "REMOVE_CHILD",
    "path": [],
    "index": 2
  }
]
```

**Browser:**
```javascript
PyReact.mount(document.getElementById("root"), {
    tag: "div", props: {},
    children: [
        { tag: "p", props: {}, children: ["First"] },
        { tag: "p", props: {}, children: ["Second"] },
        { tag: "p", props: {}, children: ["Third"] }
    ]
});

PyReact.applyPatch(document.getElementById("root"), [
    { type: "UPDATE_TEXT", path: [0, 1, 0], old: "Second", new: "Third" },
    { type: "REMOVE_CHILD", path: [0], index: 2 }
]);
```

**Key insight:** The reconciler doesn't "know" that Second was removed from the middle. It compares by index: position 0 is identical (First = First), position 1 changed (Second → Third), position 2 disappeared. So it updates position 1's text and removes position 2 — which produces the correct visual result through an indirect path. This is the index-based diffing limitation from Lab 2, visible in action. The page looks right, but the patch is less efficient than optimal. This is exactly why React keys exist.

</details>

---

## Production Considerations

**What we built:** A synchronous, single-threaded patcher that applies operations one by one.

**What production systems do differently:**

Batching DOM writes: every `setAttribute`, `appendChild`, and `replaceChild` call can trigger a browser layout recalculation. React batches all DOM writes and applies them in one pass after reading is complete — alternating reads and writes ("layout thrashing") is the most common DOM performance problem.

Error boundaries: if `applyOperation` throws (because a path is invalid, or a node was removed externally), our patcher crashes. React wraps component trees in error boundaries that catch failures and render a fallback UI instead of a white screen.

Keyed reconciliation: as we saw in the challenge, index-based diffing produces suboptimal patches for list reordering. Production reconcilers use keys to match nodes by identity rather than position.

---

## Final Check

| Feature | How to verify |
|---|---|
| Server serves files | `python server.py` → `http://localhost:8000` → page loads |
| `patcher.js` loads without errors | DevTools Console → no red errors on page load |
| `getNodeAtPath` navigates correctly | Console: add element, `getNodeAtPath(root, [0])` returns it |
| `buildNode` creates elements | Console: `buildNode({tag:"p", props:{}, children:["hi"]})` → p element |
| `buildNode` creates text nodes | Console: `buildNode("hello").nodeType === 3` → true |
| `mount` renders a full tree | Call `PyReact.mount` → tree appears on page |
| `UPDATE_TEXT` changes text | Apply op → text changes without reload |
| `UPDATE_PROPS` sets attributes | Apply op → inspect element → attribute changed in DevTools |
| `REPLACE` swaps a node | Apply op → old element gone, new element present |
| `ADD_CHILD` adds a node | Apply op → new child appears |
| `REMOVE_CHILD` removes a node | Apply op → child disappears |
| Python patch applies in browser | Copy JSON from `python reconciler.py` → paste in console → DOM updates |

---

## Quick Check Answers

**1. To apply UPDATE_TEXT at path [0, 1] — what do you find first?**

You navigate to the node at that path using `getNodeAtPath`. Starting from the root, take child at index 0, then take that node's child at index 1. That's the target node. Then set its `textContent` to the new value. The path is the address; navigation is the act of following the address; the DOM API call is the final operation.

**2. What is the browser's tree called, and how does JavaScript interact with it?**

It's called the DOM — the Document Object Model. JavaScript interacts with it through the DOM API: a standardized set of methods and properties like `createElement`, `appendChild`, `setAttribute`, and `textContent`. Every modern browser implements the same API, so JavaScript written to the standard works everywhere.

**3. How does a Python-generated patch get to the browser?**

Right now, manually — we copy the JSON from the terminal and paste it in the console. This is intentional for this lab: it proves the pipeline works before we add network complexity. In Lab 6, a WebSocket will replace the copy-paste step. Python will send the JSON patch directly to the browser over a persistent connection, and the browser will call `applyPatch` automatically when the message arrives. The patcher code won't change — only the delivery mechanism will.

---

## ▶ Next Session Prompt

```
Series: PyReact — Build React in Python
Completed: Lab 1 — VNode + serialization
           Lab 2 — Reconciler + patch format
           Lab 3 — DOM Patcher + HTTP server
Next: Lab 4 — JSX Runtime: How JSX Actually Works

What we built:
  - server.py: Python HTTP server (port 8000, serves current directory)
  - index.html: mount point (<div id="root">), loads patcher.js
  - patcher.js: getNodeAtPath, buildNode, applyOperation, mount, applyPatch
  - serialize_node helper in reconciler.py for JSON-serializing patches
  - window.PyReact = { mount, applyPatch, buildNode } public API

Key files:
  pyreact/vdom.py         — VNode, create_element, print_tree, serialize, deserialize
  pyreact/reconciler.py   — diff, print_patch, serialize_node, operation constants
  pyreact/server.py       — SimpleHTTPRequestHandler on port 8000
  pyreact/index.html      — HTML shell with <div id="root"> and <script src="/patcher.js">
  pyreact/patcher.js      — complete DOM patcher with window.PyReact API

Key decisions made:
  - childNodes (not children) used for path navigation — includes text nodes
  - parentNode used in REPLACE (not re-deriving parent path)
  - ADD_CHILD uses appendChild (end-of-list only — matches reconciler assumption)
  - window.PyReact namespace prevents global scope pollution
  - serialize_node passed as json.dumps default= handler for VNode objects
  - Script tag at bottom of body (DOM must exist before script runs)

Lab 4 will cover:
  - What JSX actually is (syntax sugar, not a language)
  - How Babel transforms JSX into function calls
  - What a JSX pragma is and how to set one
  - Writing a jsx() function that matches the transform target
  - Setting up esbuild (fastest JS bundler, single binary) to compile JSX
  - Writing our first .jsx component file that renders into our VNode system

Start Lab 4.
```