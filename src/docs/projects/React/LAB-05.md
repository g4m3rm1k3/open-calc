# PyReact — LAB 5 — Reactive State: Building useState

**Prerequisites:** Labs 1–4. You have the full file set: `vdom.py`, `reconciler.py`, `server.py`, `index.html`, `patcher.js`, `runtime.js`, `app.jsx`. Both `python server.py` and `npm run dev` run without errors.

**What this lab adds:**
- A `useState` function that stores a value and triggers re-renders when it changes
- A render loop that connects state changes to our diff + patch pipeline
- A working counter component that updates the DOM reactively — no page reload, no manual patch calls

**Time:** 75–90 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. Right now `App()` is called once. The VNode it returns is mounted. Nothing ever calls `App()` again. If a variable inside `App` changes, what happens to the screen?
> 2. A function in JavaScript can "remember" a variable even after the function that created that variable has finished running. What is this called, and can you think of an example?
> 3. React's `useState` returns two things: a value and a function to change it. Why do you think it returns a setter function instead of letting you assign the variable directly?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will have a counter component that works like this:

```
Browser shows:
  Count: 0
  [+]  [-]

Click [+]:
  Count: 1   ← DOM updated, no reload

Click [+] again:
  Count: 2   ← DOM updated again

Click [-]:
  Count: 1   ← DOM updated
```

Every click calls our `diff()` reconciler, produces a patch, and calls `applyPatch()` on the live DOM. The pipeline you built across Labs 1–3 finally runs end-to-end, automatically, driven by user interaction.

---

## Concept: The Stale UI Problem

**What it is:** The gap between a component's current state and what the DOM is currently showing — which opens the moment any data changes after the initial render.

**The problem, concretely:**

Right now our render pipeline runs exactly once:

```javascript
mount(root, App());   // App() runs → VNode produced → DOM built → done
```

If `App` contains a variable `count = 0` and something changes it to `1`, the DOM still shows `0`. Nothing told the framework to re-run `App()` and update the screen. The UI is stale.

**The naive fix** — re-run `App()` and replace everything:

```javascript
function onCountChange() {
    root.innerHTML = "";           // wipe the DOM
    mount(root, App());            // rebuild everything from scratch
}
```

This works. But it destroys and rebuilds the entire DOM on every change — losing focus state, scroll position, CSS transitions, and input values. It's the same problem reconciliation was invented to solve.

**The correct fix:** Re-run the component function to get a new VNode tree, diff it against the old VNode tree, and apply only the patch. This is exactly the pipeline we already built.

```javascript
let oldVNode = App();
mount(root, oldVNode);

function onCountChange() {
    const newVNode = App();           // re-run the component
    const patch = [];
    diff(oldVNode, newVNode, patch);  // find what changed
    applyPatch(root, patch);          // apply only the changes
    oldVNode = newVNode;              // new becomes old for next comparison
}
```

**This pattern — run, compare, patch, remember — is the entire reactive rendering loop.** Everything else is details about when and how to trigger it.

---

## Concept: Closure

**What it is:** A function that retains access to variables from the scope where it was defined, even after that outer scope has finished executing.

**The problem before:**

In most mental models, when a function finishes running, its local variables disappear. This is true in many languages. If closures didn't exist, there would be no way for an inner function to remember anything from its creation context.

**The solution:** In JavaScript, a function created inside another function permanently holds a reference to the outer function's variables. Those variables stay alive as long as the inner function exists.

**What it hides:** Closure hides the complexity of explicitly passing state between calls. Without closures, you would need to pass every piece of shared state as an argument to every function that needs it, or store it in global variables. The invariant it protects: **a closed-over variable is accessible only to the functions that closed over it — it cannot be accidentally modified by unrelated code, because unrelated code has no reference to it.**

**Canonical example (General):**

A closure is like a backpack. When a function is created inside another function, it packs the surrounding variables into a backpack before leaving. No matter where the inner function travels later — passed as a callback, stored in an array, called minutes later — it still has its backpack and can reach into it for those variables.

```javascript
function makeCounter() {
    let count = 0;          // this variable lives in makeCounter's scope

    function increment() {
        count += 1;         // increment closes over count
        console.log(count); // still accessible — it's in the backpack
    }

    return increment;       // makeCounter finishes — but count survives
}

const tick = makeCounter(); // makeCounter is done — count should be gone...
tick(); // logs 1  — but it isn't gone. increment's backpack kept it alive.
tick(); // logs 2
tick(); // logs 3
```

**Project application (The "Why" here):**

`useState` needs to store a value that persists between renders. Each render is a fresh call to the component function — local variables inside the component are reset every time. The only way to survive a re-render is to store the value *outside* the component function. Closure is how `useState` achieves this: the state value lives in `useState`'s scope, not in the component's scope. The getter and setter functions close over it, keeping it alive across renders.

**Watch for:** Closures retain a *reference* to the variable, not a *copy* of its value at creation time. If the variable changes, all functions that closed over it see the new value. This is powerful — but it's also the source of the "stale closure" bug, which we'll address at the end of this lab.

---

## Step 1 — Understand the Re-render Loop Before Writing It

Before writing any code, trace through exactly what needs to happen when a button is clicked. Read this carefully — it describes the architecture we're about to build.

```
1. User clicks [+]

2. The click handler runs:
      setCount(count + 1)

3. setCount does three things:
   a. Updates the stored value:  count = 1
   b. Re-runs the component:     newVNode = App()
   c. Diffs and patches:         diff(oldVNode, newVNode) → applyPatch()

4. App() runs again with count now equal to 1
   It returns a new VNode tree where "Count: 0" is now "Count: 1"

5. diff() compares the old VNode to the new one
   It finds one UPDATE_TEXT operation

6. applyPatch() applies that one operation
   The text node in the DOM changes from "Count: 0" to "Count: 1"

7. oldVNode is updated to the new VNode
   Ready for the next click
```

The render loop lives in `runtime.js`. It needs access to:
- The root DOM node (where to apply patches)
- The component function (what to re-run)
- The last VNode (what to diff against)

These three things form the render context. We'll store them in variables that `useState` can close over.

---

## Concept: The Hook Call Order Invariant

**What it is:** The rule that hooks (functions like `useState`) must always be called in the same order on every render of a component.

**The problem before:**

`useState` needs to match each call site to its stored value across renders. On the first render, `useState(0)` creates a storage slot and stores `0`. On the second render, `useState(0)` must return the *same* storage slot — not create a new one.

The only way to match call sites across renders without a unique identifier is by position — the first `useState` call gets slot 0, the second gets slot 1, and so on. This only works if the calls happen in the same order every time.

**The solution:** A slot index that increments on each `useState` call, and resets to zero at the start of each render. Render 1: call 1 → slot 0, call 2 → slot 1. Render 2: call 1 → slot 0 again, call 2 → slot 1 again. Same order = same slots.

**What it hides:** The slot system hides the bookkeeping of which state value belongs to which `useState` call. Without it, you'd have to give every piece of state a unique name or key, and `useState` would need a lookup system. The invariant it protects: **as long as hooks are called in the same order on every render, each `useState` call always retrieves exactly the state value it created — no collisions, no mismatches.**

**Canonical example (General):**

Imagine filling out the same form every day. Field 1 is always "Name," field 2 is always "Email," field 3 is always "Phone." The form doesn't label the fields — it just has slots in order. As long as you always fill them in the same order, the form processor correctly associates slot 1 with your name. If one day you skip "Name" and start with "Email," slot 1 now contains your email — and everything is wrong. The hook order rule is exactly this: never skip a slot.

**Project application (The "Why" here):**

We'll implement this with a `slots` array and a `currentSlot` index. At the start of each render, `currentSlot` resets to 0. Each `useState` call reads `slots[currentSlot]` and increments `currentSlot`. The values persist in `slots` between renders because `slots` lives outside the component function.

**Watch for:** This is why React's rules of hooks say "don't call hooks inside if statements or loops." An `if` that sometimes runs and sometimes doesn't would skip a slot, misaligning all subsequent slots.

---

## Step 2 — Build the Render Context in runtime.js

Open `runtime.js`. Add the following below the existing `jsx` and `Fragment` functions:

```javascript
// ─── Render Context ───────────────────────────────────────────
// These variables are shared across all renders.
// They live here — outside any component — so they survive re-renders.

let _root = null;
// _root: the DOM node we're rendering into (the <div id="root">)
// Set once by init(), used by scheduleRender()

let _componentFn = null;
// _componentFn: the top-level component function to re-run on each render
// e.g. App — the function itself, not its output

let _currentVNode = null;
// _currentVNode: the VNode tree from the LAST render
// Used as the "old" tree in diff() on the next render

let _slots = [];
// _slots: persistent storage for all useState values
// slots[0] holds the first useState's value, slots[1] the second, etc.
// Persists across renders — this is what keeps state alive

let _currentSlot = 0;
// _currentSlot: which slot the next useState call should use
// Resets to 0 at the start of every render
// Increments by 1 for each useState call during a render
```

**Why underscore prefixes on all these variables?**

The underscore is a convention meaning "module-private — do not access from outside this file." JavaScript doesn't enforce this (unlike Python's name mangling or Java's `private` keyword) — it's a signal to other developers. These variables are implementation details of the runtime. Components shouldn't read or write them directly.

### SAVE AND TRY

Save `runtime.js`. In your terminal running `npm run dev`, confirm no build errors appear.

These variables don't produce any visible output yet — they're infrastructure. We verify them indirectly in the next step.

---

## Step 3 — Build the useState Function

Add the following to `runtime.js`, below the render context variables:

```javascript
// ─── useState ─────────────────────────────────────────────────

export function useState(initialValue) {
    // initialValue: the value to use the very first time this slot is accessed
    // On subsequent renders, the stored value is used instead

    const slot = _currentSlot;
    // Capture the current slot index into a local constant.
    // Why capture it? Because _currentSlot will increment before
    // the setter function runs. The setter needs to know ITS slot index,
    // not whatever _currentSlot happens to be when it's called later.
    // This is closure in action: slot is captured now, used later.

    _currentSlot += 1;
    // Move to the next slot for the next useState call in this component

    if (_slots[slot] === undefined) {
        _slots[slot] = initialValue;
        // First render: this slot hasn't been set yet — initialize it
        // undefined means "never been set" — we use initialValue
    }
    // On subsequent renders: _slots[slot] already has the value from last time
    // We skip the if block and use the existing stored value

    const value = _slots[slot];
    // Read the current value from the slot
    // First render: this is initialValue (we just set it above)
    // Later renders: this is whatever setValue stored last time

    function setValue(newValue) {
        // This is the setter — what components call to change state
        // e.g. setCount(count + 1)

        _slots[slot] = newValue;
        // Store the new value in this specific slot
        // slot is closed over — this function always updates the right slot
        // no matter when it's called

        scheduleRender();
        // Trigger a re-render now that state has changed
        // scheduleRender is defined next — it runs the diff + patch pipeline
    }

    return [value, setValue];
    // Return an array with two elements — exactly like React's useState
    // Components destructure this: const [count, setCount] = useState(0)
    // Array destructuring: const [first, second] = [value, setValue]
}
```

**Why return an array instead of an object like `{ value, setValue }`?**

Arrays let the caller name the values whatever they want during destructuring:

```javascript
const [count, setCount] = useState(0);      // clear name
const [name, setName]   = useState("");     // different name, same pattern
```

With an object you'd have to rename explicitly:

```javascript
const { value: count, setValue: setCount } = useState(0);  // verbose
```

React chose arrays for exactly this reason — ergonomics. We make the same choice.

### SAVE AND TRY

Save. Check `npm run dev` — no errors.

We can't fully test `useState` until `scheduleRender` exists. But we can test the slot logic manually. Add this temporary test to `app.jsx` above the `App` function (we'll remove it after):

```jsx
// Temporary test — remove after verifying
import { useState } from "./runtime.js"; // ← add useState to existing import

// Simulate what happens during a render:
// (In real use, this runs inside a component during render)
window._slots = [];      // reset slots manually
window._currentSlot = 0; // reset slot index

// We can't call useState outside a render context yet
// But we can verify the import works:
console.log("useState imported:", typeof useState);
```

Rebuild. Open browser console.

**Expected:** `useState imported: function`

Remove the temporary test lines from `app.jsx` before continuing.

---

## Concept: The Render Loop

**What it is:** The cycle of run → compare → patch → remember that executes every time state changes.

**The problem before:**

State changed. We stored the new value. Now we need to update the DOM. But the DOM patcher needs the old VNode to diff against. And after patching, the new VNode becomes the old VNode for next time. This bookkeeping — track old, run new, diff, patch, update old — needs to happen in one place, consistently, every time.

**The solution:** A single `scheduleRender` function that owns the entire update cycle. Every state setter calls it. It always does the same four things in the same order.

**What it hides:** The render loop hides the multi-step update protocol from state setters. A setter only needs to know "call `scheduleRender`." It doesn't need to know about VNodes, diffs, patches, or the root DOM node. The invariant it protects: **after `scheduleRender` completes, the DOM exactly reflects the current state — no partial updates, no stale nodes, no missed patches.**

**Canonical example (General):**

A photocopier's "copy" button. You press it once. Behind the scenes: scan the original, process the image, send to printer, eject the copy, reset the scanner. You don't press "scan," then "process," then "print" separately. One button, one complete cycle, every time. `scheduleRender` is that button.

**Project application (The "Why" here):**

Our render loop does exactly four things:

```
1. Reset _currentSlot to 0       (hook call order resets)
2. Run _componentFn()            (get new VNode)
3. diff(_currentVNode, newVNode) (find changes)
4. applyPatch + update _currentVNode  (apply changes, remember new state)
```

Step 1 is critical and easy to forget: if `_currentSlot` isn't reset, the second render's first `useState` call reads slot 1 instead of slot 0 — completely wrong.

**Watch for:** `scheduleRender` is synchronous in our implementation — it runs immediately when called. React's scheduler is asynchronous — it batches multiple state changes that happen in the same event into one render. We'll discuss this tradeoff after building the synchronous version.

---

## Step 4 — Build scheduleRender and init

Add the following to `runtime.js`, below `useState`:

```javascript
// ─── Render Loop ──────────────────────────────────────────────

function scheduleRender() {
    // Called by every state setter when state changes.
    // Runs the full diff + patch cycle.

    if (!_root || !_componentFn) {
        // Guard clause: if init() hasn't been called yet, do nothing.
        // This prevents errors if a setter is somehow called before mounting.
        return;
    }

    _currentSlot = 0;
    // CRITICAL: reset the slot index before running the component.
    // Every render must start hook calls from slot 0.
    // Without this reset, the second render's useState(0) reads slot 1 —
    // which belongs to a different piece of state.

    const newVNode = _componentFn();
    // Re-run the top-level component function.
    // During this call, each useState inside the component:
    //   - reads _slots[_currentSlot] for its current value
    //   - increments _currentSlot
    // By the end of this call, all hooks have run in order.

    const patch = [];
    diff(_currentVNode, newVNode, patch);
    // Compare the previous VNode tree to the new one.
    // diff() is imported from our reconciler — same function from Lab 2.

    if (patch.length > 0) {
        applyPatch(_root, patch);
        // Only call applyPatch if something actually changed.
        // If nothing changed, skip the DOM work entirely.
    }

    _currentVNode = newVNode;
    // The new VNode becomes the old VNode for the next render.
    // This line closes the loop.
}

export function init(rootElement, componentFn) {
    // init() is the entry point — called once to bootstrap the framework.
    // rootElement: the DOM node to render into
    // componentFn: the top-level component (e.g. App)

    _root = rootElement;
    // Store the root for scheduleRender to use on every update

    _componentFn = componentFn;
    // Store the component function for re-running on each render

    _slots = [];
    // Start with empty slots — first render will initialize all of them

    _currentSlot = 0;
    // Start slot index at 0

    _currentVNode = _componentFn();
    // Run the component once to get the initial VNode.
    // This also initializes all useState slots with their initial values.

    mount(_root, _currentVNode);
    // Build the real DOM from the initial VNode and insert it.
}
```

**Why does `init` call `_componentFn()` instead of `scheduleRender()`?**

On the first call, `_currentVNode` is `null`. `scheduleRender` calls `diff(_currentVNode, newVNode)` — diffing `null` against a tree would require special handling. `init` bypasses the diff entirely and uses `mount` directly, which is correct for the first render: build the full DOM from scratch. After `init`, `_currentVNode` is set, and every subsequent render correctly uses `scheduleRender`.

Now add the missing imports at the top of `runtime.js`. Update the file's top to include:

```javascript
// ← add these two imports at the very top of runtime.js
import { diff } from "./reconciler.js";
// diff compares two VNode trees and produces a patch list

import { mount, applyPatch } from "./patcher.js";
// mount builds initial DOM; applyPatch applies a patch to the live DOM
```

**Wait — reconciler.js is Python. How do we import it in JavaScript?**

We don't. We need a JavaScript version of `diff`. This is the moment where our architecture splits clearly: Python holds the server-side reconciler (used in Lab 6 for server-driven updates). The browser needs its own reconciler for client-side reactive state.

Create `pyreact/reconciler.js`:

```javascript
// reconciler.js
// JavaScript port of our Python reconciler.
// Same algorithm, same patch format — different language.
// This runs in the browser for client-side state updates.
// The Python version will run on the server in Lab 6.

const REPLACE      = "REPLACE";
const UPDATE_PROPS = "UPDATE_PROPS";
const UPDATE_TEXT  = "UPDATE_TEXT";
const ADD_CHILD    = "ADD_CHILD";
const REMOVE_CHILD = "REMOVE_CHILD";

function typesDiffer(oldNode, newNode) {
    if (typeof oldNode === "string" !== typeof newNode === "string") {
        return true;
        // One is a string, the other is not
    }
    if (typeof oldNode !== "string" && oldNode.tag !== newNode.tag) {
        return true;
        // Both are VNodes but with different tags
    }
    return false;
}

function diffProps(oldNode, newNode, patch, path) {
    const oldProps = oldNode.props || {};
    const newProps = newNode.props || {};

    const added   = {};
    const removed = {};
    const changed = {};

    for (const [key, newValue] of Object.entries(newProps)) {
        if (!(key in oldProps)) {
            added[key] = newValue;
        } else if (oldProps[key] !== newValue) {
            changed[key] = newValue;
        }
    }

    for (const key of Object.keys(oldProps)) {
        if (!(key in newProps)) {
            removed[key] = oldProps[key];
        }
    }

    if (Object.keys(added).length || Object.keys(removed).length || Object.keys(changed).length) {
        patch.push({ type: UPDATE_PROPS, path, added, removed, changed });
    }
}

function diffChildren(oldNode, newNode, patch, path) {
    const oldChildren = oldNode.children || [];
    const newChildren = newNode.children || [];
    const sharedCount = Math.min(oldChildren.length, newChildren.length);

    for (let i = 0; i < sharedCount; i++) {
        diff(oldChildren[i], newChildren[i], patch, [...path, i]);
        // [...path, i] creates a new array — path + [i]
        // Same as Python's path + [index]
    }

    if (newChildren.length > oldChildren.length) {
        for (let i = sharedCount; i < newChildren.length; i++) {
            patch.push({ type: ADD_CHILD, path, index: i, new_node: newChildren[i] });
        }
    } else if (oldChildren.length > newChildren.length) {
        for (let i = sharedCount; i < oldChildren.length; i++) {
            patch.push({ type: REMOVE_CHILD, path, index: i });
        }
    }
}

export function diff(oldNode, newNode, patch = [], path = []) {
    // patch = [] and path = [] are default parameter values in JavaScript
    // Unlike Python, JavaScript default parameters are evaluated fresh each call
    // so mutable defaults ARE safe here — no shared-mutable-default bug

    if (typesDiffer(oldNode, newNode)) {
        patch.push({ type: REPLACE, path, new_node: newNode });
        return patch;
    }

    if (typeof oldNode === "string") {
        if (oldNode !== newNode) {
            patch.push({ type: UPDATE_TEXT, path, old: oldNode, new: newNode });
        }
        return patch;
    }

    diffProps(oldNode, newNode, patch, path);
    diffChildren(oldNode, newNode, patch, path);
    return patch;
}
```

**Why is the JavaScript default parameter `patch = []` safe when Python's `props={}` was not?**

In Python, default argument values are evaluated *once* when the `def` statement runs — all calls share the same object. In JavaScript, default parameter values are evaluated *fresh on every call* — each call gets a new `[]`. This is a genuine language difference, not a style choice. The Python fix (use `None`, create inside) is unnecessary in JavaScript.

### SAVE AND TRY

Save all files. Check `npm run dev` — no build errors.

Open the browser console:

```javascript
// The diff function is now bundled — test it directly
const patch = diff(
    { tag: "p", props: {}, children: ["Hello"] },
    { tag: "p", props: {}, children: ["Goodbye"] }
);
console.log(patch);
```

**Expected:** One UPDATE_TEXT operation — same output format as our Python reconciler.

**Change something:** Test `diff` with a tag change — confirm it produces REPLACE. Test with identical trees — confirm the patch is empty.

---

## Step 5 — Update app.jsx to Use useState and init

Replace the entire contents of `app.jsx` with the following:

```jsx
/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment, useState, init } from "./runtime.js";
// useState: hook for reactive state
// init: framework bootstrap — replaces our manual mount() call

function Counter() {
    const [count, setCount] = useState(0);
    // useState(0): first render → count is 0, stored in _slots[0]
    //              next renders → count is whatever setCount stored last
    // setCount: calling this stores a new value and triggers scheduleRender()

    return (
        <div id="app">
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>+</button>
            <button onClick={() => setCount(count - 1)}>-</button>
        </div>
    );
    // onClick compiles to: jsx("button", { onClick: () => setCount(count+1) }, "+")
    // onClick is stored in the VNode's props — but our patcher doesn't handle it yet
    // We'll wire it up in Step 6
}

const root = document.getElementById("root");
init(root, Counter);
// init() replaces our old: mount(root, App())
// It runs Counter(), mounts the result, and sets up the render loop
```

**Why does `onClick` not work yet?**

Our `buildNode` in `patcher.js` calls `element.setAttribute(key, value)` for every prop. `setAttribute("onClick", fn)` sets a DOM attribute named `"onClick"` — it does not register an event listener. DOM attributes and DOM event listeners are different things. We need to handle event props specially in `buildNode`. That's Step 6.

### SAVE AND TRY

Save. Rebuild fires automatically. Refresh `http://localhost:8000`.

**You should see:**
```
Count: 0
[+] [-]
```

The buttons are visible but clicking them does nothing yet — event listeners aren't wired up.

Open DevTools → Elements. Inspect the `+` button. You'll see it has an attribute `onclick="..."` (the string representation of the function). This is wrong — that's an HTML attribute, not a JavaScript event listener. Step 6 fixes this.

**Change something:** In `Counter`, add a second `useState`:

```jsx
const [name, setName] = useState("World");
```

And add `<p>Hello, {name}!</p>` to the returned JSX. Confirm it renders. This verifies the slot system handles multiple state values — `count` stays in slot 0, `name` in slot 1.

Remove that addition before continuing.

---

## Step 6 — Wire Up Event Listeners in the Patcher

Open `patcher.js`. Find the `buildNode` function. We need to change how props are applied — event props (`onClick`, `onChange`, etc.) need `addEventListener`, not `setAttribute`.

Find this section inside `buildNode`:

```javascript
    for (const [key, value] of Object.entries(vnode.props)) {
        element.setAttribute(key, value);
    }
```

Replace it with:

```javascript
    for (const [key, value] of Object.entries(vnode.props)) {
        // ← was: element.setAttribute(key, value)

        if (key.startsWith("on") && typeof value === "function") {
            // Event handler props: onClick, onChange, onSubmit, etc.
            // startsWith("on") detects the React event naming convention
            // typeof value === "function" confirms it's a real handler, not a string

            const eventName = key.slice(2).toLowerCase();
            // slice(2) removes the "on" prefix: "onClick" → "Click"
            // toLowerCase() makes it lowercase: "Click" → "click"
            // The DOM event name is "click", not "onClick" or "Click"

            element.addEventListener(eventName, value);
            // addEventListener registers the function as a real event handler
            // When the user clicks, the browser calls value() directly
        } else {
            element.setAttribute(key, String(value));
            // String(value) converts numbers/booleans to strings
            // setAttribute requires string values — passing a number works
            // in most browsers but String() makes it explicit
        }
    }
```

**Why does React use `onClick` (camelCase) instead of the DOM's `addEventListener("click", ...)`?**

React normalizes all event names to camelCase (`onClick`, `onChange`, `onKeyDown`) to match JavaScript naming conventions and to create a consistent, predictable API. Under the hood, React also uses event delegation — it attaches one listener to the root element instead of one per element, which is more memory-efficient for large trees. We attach one listener per element — simpler to understand, fine for an educational framework.

We also need to update `applyOperation` to handle event props in `UPDATE_PROPS`. Find the `UPDATE_PROPS` block in `applyOperation` and update the `added` and `changed` loops:

```javascript
        for (const [key, value] of Object.entries(op.added)) {
            // ← replace the single setAttribute line with:
            if (key.startsWith("on") && typeof value === "function") {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, String(value));
            }
        }

        for (const [key, value] of Object.entries(op.changed)) {
            // ← replace the single setAttribute line with:
            if (key.startsWith("on") && typeof value === "function") {
                element.addEventListener(key.slice(2).toLowerCase(), value);
            } else {
                element.setAttribute(key, String(value));
            }
        }
```

### SAVE AND TRY

Save `patcher.js`. Rebuild fires. Refresh `http://localhost:8000`.

**You should see:**
```
Count: 0
[+] [-]
```

Click `[+]`.

**Expected:** The page shows `Count: 1` — no reload.

Click `[+]` again.

**Expected:** `Count: 2`.

Click `[-]`.

**Expected:** `Count: 1`.

Open DevTools → Console. Watch for errors as you click. There should be none.

Open DevTools → Elements. Click `[+]` and watch the Elements panel. You should see the text node inside `<p>` flash — the browser highlighting a DOM change. This is the reconciler + patcher working live.

**Change something:** Add a third button that resets the count:

```jsx
<button onClick={() => setCount(0)}>Reset</button>
```

Rebuild. Confirm clicking Reset sets the count back to 0 from any value.

---

## 🎯 Challenge: A Two-State Component

**You know:** Multiple `useState` calls in one component use different slots. Each setter only updates its own slot. `scheduleRender` re-runs the full component.

**Task:** Build a component called `Profile` that has two independent pieces of state:
- A name (starts as `"Anonymous"`)
- A score (starts as `0`)

The UI should show both values and have buttons to change each independently:

```
Name: Anonymous    [Change Name]
Score: 0           [+10]
```

Clicking `[Change Name]` should cycle through three names: `"Anonymous"` → `"Alice"` → `"Bob"` → `"Anonymous"` → ...

Clicking `[+10]` should add 10 to the score.

Both pieces of state must update independently — clicking `[+10]` must not affect the name, and vice versa.

**Starting point:**

```jsx
function Profile() {
    const [name, setName] = useState("Anonymous");
    const [score, setScore] = useState(0);

    const names = ["Anonymous", "Alice", "Bob"];
    // hint: names.indexOf(name) gives you the current index

    return (
        <div id="app">
            {/* your JSX here */}
        </div>
    );
}

const root = document.getElementById("root");
init(root, Profile);
```

**Hints:**

1. To cycle through names: find the current index, add 1, use `%` (modulo) to wrap around.
2. The modulo operator `%` gives the remainder after division. `4 % 3 === 1`. Used for wrapping: `(index + 1) % names.length` always stays within bounds.

Try for at least 10 minutes before revealing.

---

<details>
<summary>▶ Show Solution</summary>

```jsx
/** @jsx jsx */
/** @jsxFrag Fragment */
import { jsx, Fragment, useState, init } from "./runtime.js";

function Profile() {
    const [name, setName] = useState("Anonymous");
    // slot 0: the current name string

    const [score, setScore] = useState(0);
    // slot 1: the current score number

    const names = ["Anonymous", "Alice", "Bob"];
    // The list of names to cycle through

    function cycleName() {
        const currentIndex = names.indexOf(name);
        // indexOf returns the position of name in the array
        // "Anonymous" → 0, "Alice" → 1, "Bob" → 2

        const nextIndex = (currentIndex + 1) % names.length;
        // % names.length wraps back to 0 after the last name
        // (2 + 1) % 3 === 0 → wraps from "Bob" back to "Anonymous"

        setName(names[nextIndex]);
        // Store the next name — triggers scheduleRender
    }

    return (
        <div id="app">
            <p>Name: {name}</p>
            <button onClick={cycleName}>Change Name</button>
            <p>Score: {score}</p>
            <button onClick={() => setScore(score + 10)}>+10</button>
        </div>
    );
}

const root = document.getElementById("root");
init(root, Profile);
```

**Key insight:** `name` lives in `_slots[0]` and `score` in `_slots[1]`. When `cycleName` calls `setName(...)`, it writes to `_slots[0]` and calls `scheduleRender`. The render re-runs `Profile()`, which reads `_slots[0]` (new name) and `_slots[1]` (unchanged score). The diff finds only the name text changed — one UPDATE_TEXT operation. The score DOM node is untouched. This is why slot isolation matters: two pieces of state, two slots, zero interference.

</details>

---

## The Stale Closure Problem

There is a subtle bug in our `useState` implementation. Consider this:

```jsx
const [count, setCount] = useState(0);

// Later, a click handler runs:
setTimeout(() => {
    setCount(count + 1);  // count here is 0 — always
}, 3000);
```

If the user clicks three times in 3 seconds before the timeout fires, `count` inside the timeout callback is still `0` — it captured `count` from when the function was *created*, not when it *runs*. The timeout will set count to `1` instead of `4`.

This is the stale closure bug. The function closed over `count` at its creation time. The actual `_slots[0]` value has moved on, but the closed-over `count` hasn't.

**React's solution:** Accept a function as the argument to the setter:

```javascript
setCount(prev => prev + 1);
// prev is always the actual current value from the slot
// not the closed-over snapshot
```

We'll add this in the production considerations. For now, understand that it exists and why.

---

## Production Considerations

**Synchronous rendering:** Our `scheduleRender` runs immediately when a setter is called. If two setters fire in the same event handler:

```javascript
setCount(1);    // renders
setName("hi");  // renders again
```

That's two full render cycles for one user action. React batches these: both state updates are collected first, then one render happens. React 18 made automatic batching the default. Our framework re-renders twice — wasteful but correct.

**Event listener accumulation:** Our current `UPDATE_PROPS` handler adds new event listeners for changed handlers but never removes the old ones. Every re-render that updates an `onClick` prop adds another listener. The button ends up with multiple listeners firing on each click. The fix is to track which listeners are attached and remove them before adding new ones. We'll address this in Lab 7.

**No cleanup:** Components that unmount (REMOVE_CHILD) may have state in `_slots` that's never reclaimed. For a small educational framework this is fine. Production frameworks use component instance tracking with cleanup callbacks (`useEffect`'s return function) to reclaim memory.

---

## Final Check

| Feature | How to verify |
|---|---|
| `useState` returns `[value, setter]` | Console: `useState(5)` (after init) → array with 5 and a function |
| Initial value renders correctly | Page shows `Count: 0` on load |
| Click `[+]` increments count | Count increases by 1, no reload |
| Click `[-]` decrements count | Count decreases by 1 |
| Only changed nodes update | DevTools Elements panel flashes only the text node, not the buttons |
| Two independent state values work | Challenge: name and score update independently |
| `onClick` uses addEventListener | DevTools → Elements → no `onclick` attribute on buttons |
| Slot index resets each render | Multiple clicks work correctly (no slot misalignment) |
| `reconciler.js` diff matches Python output | Console diff test produces same patch format |

---

## Quick Check Answers

**1. If a variable inside `App` changes, what happens to the screen?**

Nothing — unless something re-runs `App()` and updates the DOM. The initial `mount(root, App())` runs the component once and builds the DOM. After that, the component function is never called again automatically. The DOM has no connection to the JavaScript variables that produced it. Changing a variable inside `App` after mount is like editing the blueprints after a house is built — the house doesn't change. This is why reactive state requires an explicit mechanism to re-run the component and patch the DOM.

**2. A function that remembers variables from its creation scope — what is this called?**

A closure. The classic example is a counter factory: `function makeCounter() { let n = 0; return () => ++n; }`. The returned function closes over `n` — `n` survives even after `makeCounter` finishes. Every call to the returned function reads and modifies the same `n`. Our `useState` uses this: `setValue` closes over `slot`, so it always updates the correct slot regardless of when it's called.

**3. Why does useState return a setter function instead of letting you assign directly?**

Because direct assignment — `count = 1` — is invisible to the framework. The framework has no way to know the variable changed, so it can't trigger a re-render. The setter function is the hook: when you call `setCount(1)`, the framework intercepts that call, stores the new value, and triggers the render cycle. Direct assignment would update the variable but leave the DOM showing the old value. The setter is the contract between your component and the framework's update mechanism.

---

## ▶ Next Session Prompt

```
Series: PyReact — Build React in Python
Completed: Lab 1 — VNode + serialization
           Lab 2 — Reconciler + patch format
           Lab 3 — DOM Patcher + HTTP server
           Lab 4 — JSX Runtime
           Lab 5 — Reactive State (useState)
Next: Lab 6 — FastAPI + WebSocket: Server-Authoritative State

What we built:
  - reconciler.js: JavaScript port of Python reconciler (diff, same patch format)
  - runtime.js additions: _slots, _currentSlot, _root, _componentFn state;
    useState(initialValue) → [value, setter]; scheduleRender(); init(root, fn)
  - patcher.js additions: event prop detection (startsWith "on") →
    addEventListener instead of setAttribute
  - app.jsx: Counter component with useState, init() bootstrap

Key files:
  pyreact/vdom.py         — VNode, create_element, serialize, deserialize
  pyreact/reconciler.py   — Python diff, print_patch, serialize_node
  pyreact/reconciler.js   — JavaScript diff (same algorithm, browser-side)
  pyreact/server.py       — Python HTTP server port 8000
  pyreact/index.html      — HTML shell, loads patcher.js + bundle.js
  pyreact/patcher.js      — buildNode (with event listeners), applyOperation,
                            mount, applyPatch
  pyreact/runtime.js      — jsx(), Fragment, useState(), init(), scheduleRender()
  pyreact/app.jsx         — Counter component (or Profile from challenge)
  pyreact/bundle.js       — compiled output, do not edit
  pyreact/package.json    — npm project, "dev" script runs esbuild --watch

Key decisions made:
  - JavaScript default params (patch=[]) are safe unlike Python mutable defaults
  - Slot system: _slots array + _currentSlot index, reset to 0 each render
  - init() uses mount() directly (no diff on first render — _currentVNode is null)
  - scheduleRender() is synchronous — no batching yet (Lab 7 adds this)
  - Event props: key.startsWith("on") && typeof value === "function" → addEventListener
  - eventName: key.slice(2).toLowerCase() ("onClick" → "click")
  - Known issue: event listener accumulation on re-render (fixed in Lab 7)
  - Known issue: stale closure in setTimeout-style handlers (use setter fn form)

Lab 6 will cover:
  - What ASGI is and why FastAPI uses it
  - WebSocket protocol — persistent two-way connection vs HTTP request/response
  - Installing FastAPI and uvicorn
  - Building a WebSocket endpoint that holds server-side state
  - Sending VNode trees from Python to the browser as JSON
  - Browser receiving patches and calling applyPatch automatically
  - A counter whose state lives in Python — the browser is just a display

Start Lab 6.
```