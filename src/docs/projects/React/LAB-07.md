# PyReact — LAB 7 — Incremental Updates: Fixing What We Skipped

**Prerequisites:** Labs 1–6. Full file set intact. `uvicorn app:app --reload --port 8000` and `npm run dev` both run without errors. The counter from Lab 6 works end-to-end.

**What this lab adds:**
- A listener registry that prevents event handler accumulation
- Batched rendering so multiple state changes produce one render
- Automatic WebSocket reconnection with exponential backoff
- Keyed children so list reordering produces correct minimal patches
- A more complex demo UI that exercises every fix

**Time:** 90–105 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. A button has `onClick` added in render 1. In render 2, `onClick` changes to a new function. Our current patcher calls `addEventListener` for the new function but never removes the old one. What happens when the button is clicked after render 2?
> 2. A user's internet drops for 3 seconds. Our current WebSocket client does nothing on `close`. What does the user see? What should happen instead?
> 3. You have a list: `[A, B, C]`. You remove `B` from the middle. Our index-based diff sees: position 0 unchanged, position 1 changed (B→C), position 2 removed. What's wrong with this? What information would fix it?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will have a todo list application that exercises every fix:

```
[ ] Buy groceries        [✓ Done]  [✗ Remove]
[ ] Write lab notes      [✓ Done]  [✗ Remove]
[✓] Call dentist         [✓ Done]  [✗ Remove]

[Add Todo]  [input field]
```

- Adding, removing, and completing todos exercises keyed diffing
- Rapid clicking exercises batched rendering
- Disconnecting and reconnecting exercises the reconnection strategy
- Every interactive element exercises the fixed event listener system

---

## Bug 1: Event Listener Accumulation

Before writing any fixes, let's see the bug clearly.

### Concept: The Listener Registry

**What it is:** A data structure that tracks which event listeners are currently attached to which DOM nodes, so old listeners can be removed before new ones are added.

**The problem, concretely:**

```javascript
// Render 1: button created with onClick handler A
element.addEventListener("click", handlerA);

// Render 2: UPDATE_PROPS fires because onClick changed to handler B
element.addEventListener("click", handlerB);
// handlerA is STILL attached — we never removed it

// User clicks the button:
// handlerA fires  ← wrong, stale
// handlerB fires  ← correct
// Both run. Both may update state. Two renders happen for one click.
```

For a counter, this means clicking `[+]` after the second render increments by 2 instead of 1. For a todo app, clicking `[Remove]` might remove the item twice. The bug compounds — after N renders, N handlers fire on each click.

**The solution:** Before adding a new event listener, check if this node already has a listener for this event type. If it does, remove the old one first.

**What it hides:** The registry hides the multi-step "remove old, add new" protocol from every call site. Without it, every place that adds an event listener would need to remember and remove the previous one. The invariant it protects: **at any moment, each DOM node has at most one listener per event type registered through our framework.**

**Canonical example (General):**

A hotel key card system. Each room has exactly one active key card. When a guest checks in, the front desk deactivates the previous card before issuing a new one. Without this rule, old cards keep working — previous guests could re-enter their old room. The registry is the front desk's record of which card is currently active for each room.

**Project application (The "Why" here):**

We need a `WeakMap` — a JavaScript data structure that maps DOM nodes to their current listeners. `WeakMap` is specifically the right tool here because it holds its keys weakly: when a DOM node is removed from the page and no other code holds a reference to it, the `WeakMap` entry is garbage collected automatically. A regular `Map` would retain the node in memory forever even after it's removed from the DOM.

**Watch for:** The registry maps `node → { eventType → handlerFunction }`. We need both the node (to call `removeEventListener`) and the event type (to identify which listener to remove). The registry stores both.

---

## Step 1 — Add the Listener Registry to patcher.js

Open `patcher.js`. Add the following near the top of the file, before any functions:

```javascript
// ─── Listener Registry ────────────────────────────────────────

const _listenerRegistry = new WeakMap();
// WeakMap: maps DOM nodes → their currently attached event listeners
// WeakMap chosen over Map because:
//   - Keys must be objects (DOM nodes qualify)
//   - Keys are held weakly — when a node is removed from the DOM and
//     nothing else references it, its registry entry is garbage collected
//   - A regular Map would retain removed nodes in memory indefinitely

function _setListener(element, eventType, handler) {
    // _setListener: attach an event listener, removing any previous one first.
    // element:   the DOM node
    // eventType: the event name without "on" prefix, e.g. "click" not "onClick"
    // handler:   the function to call when the event fires

    if (!_listenerRegistry.has(element)) {
        _listenerRegistry.set(element, {});
        // First time we've seen this element — create an empty registry entry
        // {} will map eventType → handler for this element
    }

    const elementListeners = _listenerRegistry.get(element);
    // Retrieve the map of { eventType: handler } for this element

    if (elementListeners[eventType]) {
        element.removeEventListener(eventType, elementListeners[eventType]);
        // An old listener exists for this event type on this element
        // Remove it before adding the new one
        // removeEventListener requires the EXACT same function reference
        // that was passed to addEventListener — this is why we store it
    }

    element.addEventListener(eventType, handler);
    // Attach the new listener

    elementListeners[eventType] = handler;
    // Record the new handler so we can remove it next time
}
```

**Why does `removeEventListener` need the exact function reference?**

`removeEventListener` identifies listeners by reference equality — the function object itself, not its code. If you do:

```javascript
element.addEventListener("click", () => doThing());
element.removeEventListener("click", () => doThing());
// Does NOT work — two different arrow function objects, even if identical code
```

The second arrow function is a different object from the first, even though they look the same. This is why we store the handler in the registry — we need the exact same object back to remove it.

### SAVE AND TRY

Save `patcher.js`. Check `npm run dev` — no errors.

Open browser console and test the registry directly:

```javascript
const btn = document.createElement("button");
document.body.appendChild(btn);

let callCount = 0;
_setListener(btn, "click", () => callCount++);
_setListener(btn, "click", () => callCount++);
// Two calls to _setListener — but the first handler should be removed

btn.click();
btn.click();
console.log(callCount);
```

**Expected:** `2` — not `4`. Each click fires only one handler because the first was removed when the second was added. If you see `4`, the registry isn't working — re-check the `removeEventListener` call.

---

## Step 2 — Use the Registry Everywhere

Now replace every raw `addEventListener` call in `patcher.js` with `_setListener`. There are three places.

**In `buildNode`**, find:

```javascript
            element.addEventListener(eventName, value);
```

Replace with:

```javascript
            _setListener(element, eventName, value);
            // ← was: element.addEventListener(eventName, value)
            // _setListener removes any previous listener for this event type first
```

**In `applyOperation`, inside `UPDATE_PROPS`, in the `added` loop**, find:

```javascript
                element.addEventListener(key.slice(2).toLowerCase(), value);
```

Replace with:

```javascript
                _setListener(element, key.slice(2).toLowerCase(), value);
                // ← was: element.addEventListener(...)
```

**In `applyOperation`, inside `UPDATE_PROPS`, in the `changed` loop**, find:

```javascript
                element.addEventListener(key.slice(2).toLowerCase(), value);
```

Replace with:

```javascript
                _setListener(element, key.slice(2).toLowerCase(), value);
                // ← was: element.addEventListener(...)
```

### SAVE AND TRY

Refresh `http://localhost:8000`. Click `[+]` rapidly ten times.

**Expected:** Count reaches exactly 10. In the broken version, after a few renders the count would jump by 2 per click. With the registry, each click fires exactly one handler regardless of how many renders have occurred.

Open DevTools → Console. No errors should appear.

**Change something:** Open the DevTools → Elements panel. Click the `[+]` button to select it. Look for an `onclick` attribute or similar — there should be none. Event listeners attached via `addEventListener` don't appear as attributes, only as listeners in the DevTools → Event Listeners panel. Verify only one `click` listener is shown there.

---

## Bug 2: No Render Batching

### Concept: Batched Rendering

**What it is:** Collecting multiple state changes that occur in the same synchronous block and executing one render cycle for all of them, instead of one render per change.

**The problem, concretely:**

Imagine a future event handler that updates two things at once:

```python
elif event == "reset-all":
    state["count"] = 0       # change 1
    state["step"] = 1        # change 2
    # In our current architecture, we'd need two events for this
    # or the server re-renders after every individual line
```

On the client side in Lab 5, if two setters fired in sequence:

```javascript
setCount(0);   // scheduleRender() called → full render
setStep(1);    // scheduleRender() called → full render again
```

Two renders for one logical update. In a large UI this is wasteful. In a fast loop it can cause visible flicker.

**The solution:** A flag — `_renderPending`. When `scheduleRender` is called, instead of rendering immediately, it sets the flag and schedules the render to happen "soon" using `setTimeout(fn, 0)`. If `scheduleRender` is called again before the timeout fires, the flag is already set — no second timeout is created. The render happens once, after all synchronous code in the current event has finished.

**What it hides:** Batching hides the scheduling decision from state setters. A setter calls `scheduleRender()` and forgets about it — it doesn't care whether the render happens immediately or is deferred. The invariant it protects: **no matter how many times `scheduleRender` is called synchronously, the render function runs exactly once per event loop tick.**

**Canonical example (General):**

A restaurant server taking orders at a table. Customer A orders. Customer B orders. Customer C orders. The server doesn't run to the kitchen after each person — they wait until everyone at the table has ordered, then make one trip. `setTimeout(fn, 0)` is the server finishing the table before going to the kitchen. Multiple `scheduleRender` calls are the customers ordering one after another.

**The `setTimeout(fn, 0)` trick:**

```javascript
setTimeout(fn, 0)
// "Execute fn as soon as the current synchronous code finishes"
// 0ms delay doesn't mean "run immediately" — it means:
// "add fn to the task queue; run it after the current call stack empties"
// All synchronous code in the current event runs first, then fn runs once
```

**Project application (The "Why" here):**

Our server sends one event at a time, so batching doesn't help Lab 6 much. But our client-side `useState` from Lab 5 benefits immediately. And as our apps grow more complex — multiple state updates per event — batching prevents unnecessary renders and potential flicker.

**Watch for:** `setTimeout(fn, 0)` defers to the next task, not the next microtask. Promises resolve in microtasks (before the next task). This ordering matters in complex apps but not in ours — we'll note it and move on.

---

## Step 3 — Add Batching to runtime.js

Open `runtime.js`. Find `scheduleRender` and replace the entire function:

```javascript
// ← replace the existing scheduleRender function with this:

let _renderPending = false;
// _renderPending: flag that prevents duplicate render scheduling
// false = no render is queued
// true = a render is already queued, don't queue another

function scheduleRender() {
    if (!_root || !_componentFn) return;
    // Guard: init() hasn't been called yet

    if (_renderPending) return;
    // Guard: a render is already scheduled — don't schedule another
    // This is the batching mechanism: the second, third, nth call
    // to scheduleRender in the same synchronous block all hit this return

    _renderPending = true;
    // Mark that a render is now queued

    setTimeout(() => {
        // setTimeout(fn, 0): run fn after the current call stack empties
        // By the time this runs, all synchronous state changes are done

        _renderPending = false;
        // Reset the flag — the next state change can schedule a new render

        _currentSlot = 0;
        const newVNode = _componentFn();
        const patch = diff(_currentVNode, newVNode);

        if (patch.length > 0) {
            applyPatch(_root, patch);
        }

        _currentVNode = newVNode;
    }, 0);
    // 0ms: "as soon as the current synchronous work is done"
}
```

### SAVE AND TRY

Save `runtime.js`. Rebuild fires automatically.

To test batching, open the browser console and manually call the client-side `useState` setters twice in sequence (this requires the Lab 5 app to be mounted — if you're running Lab 6's server-driven mode, test this conceptually and verify no errors appear):

```javascript
// Verify the flag concept works:
console.log(typeof scheduleRender);  // function
```

**Expected:** `function` — confirming `scheduleRender` is still accessible.

For a more concrete test: rapidly click `[+]` in the counter ten times very quickly. Open the Network → WS tab. Count the patch messages. You should see exactly 10 patches — one per click — not 20 or 30 (which would indicate multiple renders per click).

---

## Bug 3: No WebSocket Reconnection

### Concept: Exponential Backoff

**What it is:** A reconnection strategy that waits progressively longer between each failed attempt, preventing the client from flooding the server with rapid reconnection requests.

**The problem before:**

If the server restarts (during development, this happens constantly — uvicorn's `--reload` restarts on every Python file save), the WebSocket connection drops. Our current client does nothing. The user sees a frozen UI and must manually refresh.

A naive fix — reconnect immediately and loop on failure — is worse:

```javascript
// BAD: thundering herd
socket.addEventListener("close", () => {
    connectWebSocket(root);  // immediately try again
});
// If 1000 clients are connected and server restarts:
// All 1000 clients attempt to reconnect simultaneously
// Server gets hammered the moment it comes back up
```

**The solution:** Wait before reconnecting. Double the wait time after each failure. Cap the wait at a maximum (e.g. 30 seconds). This spreads reconnection attempts out over time and gives the server a chance to stabilize.

```
Attempt 1: wait 1 second
Attempt 2: wait 2 seconds
Attempt 3: wait 4 seconds
Attempt 4: wait 8 seconds
Attempt 5: wait 16 seconds
Attempt 6+: wait 30 seconds (capped)
```

**What it hides:** Exponential backoff hides the retry scheduling logic from the rest of the connection code. The invariant it protects: **the client will always eventually reconnect after a server restart, without flooding the server, and without requiring user action.**

**Canonical example (General):**

You're trying to call a friend whose phone is busy. First attempt fails — you wait a minute and try again. Still busy — you wait two minutes. Then four. You don't call every second (flooding), and you don't give up after one attempt (no reconnection). Exponential backoff is the polite, persistent caller.

**Project application (The "Why" here):**

During development, uvicorn restarts every time we save `app.py`. Without reconnection logic, every Python save breaks the browser connection permanently until manual refresh. With exponential backoff, the browser automatically reconnects within 1–2 seconds of the server coming back up — invisible to the developer.

---

## Step 4 — Add Reconnection to patcher.js

Replace the entire `connectWebSocket` function in `patcher.js`:

```javascript
// ← replace the existing connectWebSocket function with this:

export function connectWebSocket(rootElement) {
    let retryDelay = 1000;
    // retryDelay: milliseconds to wait before the next reconnection attempt
    // Starts at 1 second, doubles on each failure, caps at 30 seconds

    const MAX_DELAY = 30000;
    // MAX_DELAY: the maximum wait between reconnection attempts (30 seconds)
    // Without a cap, delay grows forever: 1, 2, 4, 8, 16, 32, 64...
    // 30 seconds is long enough to avoid flooding, short enough to feel responsive

    function connect() {
        // connect: creates one WebSocket and wires up its event handlers.
        // Called initially and on each reconnection attempt.

        const socket = new WebSocket("ws://localhost:8000/ws");

        socket.addEventListener("open", () => {
            console.log("PyReact: WebSocket connected");
            retryDelay = 1000;
            // Reset the delay on successful connection
            // The next disconnection starts fresh from 1 second
            // Without this reset, a successful connection followed by a disconnect
            // would start retrying at whatever delay we left off at
        });

        socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "mount") {
                mount(rootElement, message.vnode);
            } else if (message.type === "patch") {
                applyPatch(rootElement, message.patch);
            }
        });

        socket.addEventListener("close", () => {
            console.log(`PyReact: disconnected — retrying in ${retryDelay}ms`);

            setTimeout(() => {
                connect();
                // Recursive call: connect() calls itself via setTimeout
                // This is not infinite recursion — each call is deferred
                // and only happens after the previous socket has closed
            }, retryDelay);

            retryDelay = Math.min(retryDelay * 2, MAX_DELAY);
            // Double the delay for next time, but cap it at MAX_DELAY
            // Math.min returns the smaller of two values:
            // Math.min(2000, 30000) = 2000
            // Math.min(32000, 30000) = 30000 ← capped
        });

        socket.addEventListener("error", () => {
            // Errors are followed by a close event — the close handler
            // handles reconnection. We just log here for debugging.
            console.error("PyReact: WebSocket error");
        });

        return socket;
    }

    return connect();
    // Start the first connection attempt and return the socket
}
```

**Why does `retryDelay` live inside `connectWebSocket` instead of at module level?**

`retryDelay` belongs to one specific connection attempt sequence. If you called `connectWebSocket` twice (for two different root elements), they should each have their own independent retry state. Module-level variables are shared across all calls. The closure inside `connectWebSocket` gives each call its own `retryDelay` — the same closure pattern as `useState`'s slot capture.

### SAVE AND TRY

Save. Rebuild fires. Refresh `http://localhost:8000`.

Click `[+]` a few times to confirm the counter works.

Now test reconnection: go to the terminal running uvicorn and press Ctrl+C to stop it. 

**You should see** in the browser console:
```
PyReact: disconnected — retrying in 1000ms
PyReact: disconnected — retrying in 2000ms
```

Now restart uvicorn:
```
uvicorn app:app --reload --port 8000
```

**Within 1–2 seconds**, the browser console should show:
```
PyReact: WebSocket connected
```

And the counter UI should reappear — from 0, because server state was reset on restart. No manual refresh required.

**Change something:** Save `app.py` without making any changes (just open it and save). uvicorn's `--reload` detects the file change and restarts. Watch the browser console — you should see a disconnect and reconnect happen automatically.

---

## Bug 4: Index-Based Diffing Weakness

### Concept: Keyed Children

**What it is:** A mechanism for giving each child in a list a stable identity, so the reconciler can match children across renders by identity rather than position.

**The problem, concretely:**

```
Old list: [Todo(id=1, "Buy milk"), Todo(id=2, "Call dentist"), Todo(id=3, "Pay bills")]
New list: [Todo(id=1, "Buy milk"), Todo(id=3, "Pay bills")]
                                   ↑ id=2 was removed from the middle
```

Index-based diff compares by position:
```
Position 0: "Buy milk" == "Buy milk" → no change ✓
Position 1: "Call dentist" vs "Pay bills" → UPDATE_TEXT  ✗ wrong
Position 2: "Pay bills" removed → REMOVE_CHILD
```

Two operations, and the wrong text node gets updated. The correct answer is one operation: remove the child at index 1.

**The solution:** A `key` prop on each child. When children have keys, the reconciler matches old children to new children by key before comparing by position.

```
Old keys: [1, 2, 3]
New keys: [1, 3]

key=1 exists in both → compare them (no change)
key=2 exists in old, not new → REMOVE_CHILD
key=3 exists in both → compare them (no change)
```

One operation. Correct.

**What it hides:** The keyed diff algorithm hides the identity-matching problem from components. Without keys, every component that renders a dynamic list must be aware of the positional diffing weakness and work around it. With keys, the component just provides a stable `key` prop and the reconciler handles identity correctly. The invariant it protects: **as long as each child in a list has a unique stable key, the reconciler produces the minimal correct patch regardless of insertions, deletions, or reordering.**

**Canonical example (General):**

A school attendance sheet. Without names (no keys): the teacher marks the first seat, second seat, third seat — if a student moves seats, they're counted as absent. With names (keys): the teacher calls "Alice?" "Bob?" "Carol?" — it doesn't matter where they're sitting. The name is the identity, not the seat position.

**Project application (The "Why" here):**

Our todo list will render each todo as a child with a unique `key`. When a todo is removed from the middle, the keyed diff matches remaining todos by their keys and produces one REMOVE_CHILD operation — not a cascade of text updates.

**Watch for:** Keys must be unique within a list of siblings — not globally unique. Two different lists can both have a child with `key="1"` without conflict. Keys should be stable — don't use array indices as keys, because if an item is removed, all subsequent items shift indices and their keys change, defeating the purpose.

---

## Step 5 — Add Keyed Diffing to Both Reconcilers

### Python reconciler first

Open `reconciler.py`. Find `_diff_children` and replace it entirely:

```python
def _diff_children(old_node, new_node, patch, path):
    old_children = old_node.children
    new_children = new_node.children

    # ─── Keyed path ───────────────────────────────────────────
    # If ANY child in either list has a key prop, use keyed diffing
    def get_key(child):
        # Extract the key from a child node's props
        # Returns None if the child is a string or has no key prop
        if isinstance(child, str):
            return None
        return child.props.get("key")
        # .get("key") returns None if "key" is not in props

    old_keys = [get_key(c) for c in old_children]
    new_keys = [get_key(c) for c in new_children]
    # Build lists of keys — None for unkeyed children

    has_keys = any(k is not None for k in old_keys + new_keys)
    # any() returns True if at least one element is truthy
    # If any child has a key, we use keyed diffing for the whole list

    if has_keys:
        _diff_keyed_children(old_children, new_children, patch, path)
        return
        # Keyed diffing handles the rest — return early

    # ─── Unkeyed path (original algorithm) ────────────────────
    shared_count = min(len(old_children), len(new_children))

    for index in range(shared_count):
        diff(
            old_children[index],
            new_children[index],
            patch,
            path + [index]
        )

    if len(new_children) > len(old_children):
        for index in range(shared_count, len(new_children)):
            patch.append({
                "type": ADD_CHILD,
                "path": path,
                "index": index,
                "new_node": new_children[index]
            })

    elif len(old_children) > len(new_children):
        for index in range(shared_count, len(old_children)):
            patch.append({
                "type": REMOVE_CHILD,
                "path": path,
                "index": index
            })
```

Now add the keyed children helper above `_diff_children`:

```python
def _diff_keyed_children(old_children, new_children, patch, path):
    # Build a map from key → (index, child) for old children
    old_key_map = {}
    for index, child in enumerate(old_children):
        # enumerate() gives (index, value) pairs for each item in a list
        key = child.props.get("key") if not isinstance(child, str) else None
        if key is not None:
            old_key_map[key] = (index, child)
            # Store the old index and old child node by key

    new_key_set = set()
    # set(): an unordered collection of unique values
    # We'll use it to track which old keys still exist in the new list

    for new_index, new_child in enumerate(new_children):
        key = new_child.props.get("key") if not isinstance(new_child, str) else None

        if key is not None and key in old_key_map:
            # This child existed before — diff it against its old version
            old_index, old_child = old_key_map[key]
            diff(old_child, new_child, patch, path + [old_index])
            # Use old_index for the path — the child is at old_index in the DOM right now
            new_key_set.add(key)
        else:
            # New child with no matching old key — it needs to be added
            patch.append({
                "type": ADD_CHILD,
                "path": path,
                "index": new_index,
                "new_node": new_child
            })

    # Any old key not in new_key_set was removed
    for index, child in enumerate(old_children):
        key = child.props.get("key") if not isinstance(child, str) else None
        if key is not None and key not in new_key_set:
            patch.append({
                "type": REMOVE_CHILD,
                "path": path,
                "index": index
                # index is the child's current position in the DOM
            })
```

### SAVE AND TRY

Open Python interactive session:

```python
from vdom import create_element
from reconciler import diff, print_patch

# Test: remove from middle with keys
old = create_element("ul", {},
    create_element("li", {"key": "a"}, "Apple"),
    create_element("li", {"key": "b"}, "Banana"),
    create_element("li", {"key": "c"}, "Cherry")
)
new = create_element("ul", {},
    create_element("li", {"key": "a"}, "Apple"),
    create_element("li", {"key": "c"}, "Cherry")
)

patch = []
diff(old, new, patch)
print_patch(patch)
```

**Expected:** One REMOVE_CHILD operation — not a text update followed by a remove.

```python
# Verify unkeyed still works
patch = []
old2 = create_element("div", {}, create_element("p", {}, "Hello"))
new2 = create_element("div", {}, create_element("p", {}, "Goodbye"))
diff(old2, new2, patch)
print_patch(patch)
```

**Expected:** One UPDATE_TEXT — unkeyed path still works correctly.

---

## Step 6 — Add Keyed Diffing to reconciler.js

Open `reconciler.js`. Replace the entire `diffChildren` function:

```javascript
function diffChildren(oldNode, newNode, patch, path) {
    const oldChildren = oldNode.children || [];
    const newChildren = newNode.children || [];

    // ─── Keyed path ───────────────────────────────────────────
    function getKey(child) {
        if (typeof child === "string") return null;
        return (child.props && child.props.key) || null;
        // child.props && child.props.key: safe access —
        // if props is null/undefined, short-circuit and return null
    }

    const hasKeys = [...oldChildren, ...newChildren].some(
        child => getKey(child) !== null
    );
    // spread operator (...) combines both arrays into one
    // .some() returns true if any element satisfies the condition
    // same logic as Python's any()

    if (hasKeys) {
        diffKeyedChildren(oldChildren, newChildren, patch, path);
        return;
    }

    // ─── Unkeyed path (original algorithm) ────────────────────
    const sharedCount = Math.min(oldChildren.length, newChildren.length);

    for (let i = 0; i < sharedCount; i++) {
        diff(oldChildren[i], newChildren[i], patch, [...path, i]);
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
```

Now add the keyed helper above `diffChildren`:

```javascript
function diffKeyedChildren(oldChildren, newChildren, patch, path) {
    // Build map from key → { index, child } for old children
    const oldKeyMap = new Map();
    // Map: a JavaScript built-in that stores key → value pairs
    // Unlike plain objects, Map keys can be any type (not just strings)
    // Here keys are strings (the key prop values)

    oldChildren.forEach((child, index) => {
        // forEach: calls a function for each element, passing (value, index)
        const key = typeof child === "string" ? null : (child.props && child.props.key);
        if (key != null) {
            oldKeyMap.set(key, { index, child });
            // .set(key, value) adds or updates an entry
        }
    });

    const newKeySet = new Set();
    // Set: an unordered collection of unique values (like Python's set)
    // We use it to track which old keys still appear in the new list

    newChildren.forEach((newChild, newIndex) => {
        const key = typeof newChild === "string" ? null : (newChild.props && newChild.props.key);

        if (key != null && oldKeyMap.has(key)) {
            // Child existed before — diff it
            const { index: oldIndex, child: oldChild } = oldKeyMap.get(key);
            // Destructuring: extract index and child from the stored object
            // { index: oldIndex } means "get the 'index' field and call it oldIndex"

            diff(oldChild, newChild, patch, [...path, oldIndex]);
            newKeySet.add(key);
        } else {
            // New child — add it
            patch.push({ type: ADD_CHILD, path, index: newIndex, new_node: newChild });
        }
    });

    // Remove old children that no longer exist
    oldChildren.forEach((child, index) => {
        const key = typeof child === "string" ? null : (child.props && child.props.key);
        if (key != null && !newKeySet.has(key)) {
            patch.push({ type: REMOVE_CHILD, path, index });
        }
    });
}
```

### SAVE AND TRY

Save. Rebuild. In the browser console:

```javascript
const patch = diff(
    { tag: "ul", props: {}, children: [
        { tag: "li", props: { key: "a" }, children: ["Apple"] },
        { tag: "li", props: { key: "b" }, children: ["Banana"] },
        { tag: "li", props: { key: "c" }, children: ["Cherry"] }
    ]},
    { tag: "ul", props: {}, children: [
        { tag: "li", props: { key: "a" }, children: ["Apple"] },
        { tag: "li", props: { key: "c" }, children: ["Cherry"] }
    ]}
);
console.log(patch);
```

**Expected:** One REMOVE_CHILD operation for index 1 (Banana's position). No text updates.

---

## Step 7 — Build the Todo App

Now we wire all four fixes together in a real demo. Update `app.py` to implement a todo list:

```python
# Replace get_initial_state and render in app.py

def get_initial_state():
    return {
        "todos": [
            {"id": 1, "text": "Buy groceries",  "done": False},
            {"id": 2, "text": "Write lab notes", "done": False},
            {"id": 3, "text": "Call dentist",    "done": True},
        ],
        "next_id": 4,
        # next_id: the id to assign to the next new todo
        # Incrementing this guarantees unique ids — never reuse a deleted id
        "input": ""
        # input: the current value of the text field
        # Stored in server state so the server can read it when "add" fires
    }
```

Add the render function:

```python
def render(state):
    todos = state["todos"]
    input_value = state["input"]

    todo_items = [
        create_element(
            "div", {"key": str(todo["id"]), "class": "todo"},
            # key=str(todo["id"]): stable unique key — keyed diffing uses this
            # str() because keys must be strings

            create_element(
                "span",
                {"class": "done" if todo["done"] else "pending"},
                "✓ " if todo["done"] else "○ "
            ),
            create_element("span", {}, todo["text"]),
            create_element(
                "button",
                {"data-event": f"toggle-{todo['id']}"},
                # f-string embeds the id: "toggle-1", "toggle-2", etc.
                # The event handler reads the id from the event name
                "Done" if not todo["done"] else "Undo"
            ),
            create_element(
                "button",
                {"data-event": f"remove-{todo['id']}"},
                "Remove"
            ),
        )
        for todo in todos
        # List comprehension: creates one VNode per todo
        # Equivalent to a for loop that builds a list
    ]

    return create_element(
        "div", {"id": "app"},
        create_element("h1", {}, "Todo List"),
        *todo_items,
        # *todo_items: spread operator — inserts each item as a separate argument
        # create_element("div", {}, *[a, b, c]) = create_element("div", {}, a, b, c)
        create_element(
            "div", {"class": "add-row"},
            create_element(
                "input",
                {
                    "type": "text",
                    "value": input_value,
                    "data-event": "input-change",
                    "placeholder": "New todo..."
                }
            ),
            create_element(
                "button",
                {"data-event": "add-todo"},
                "Add"
            ),
        ),
    )
```

Now update the event handler section in `websocket_endpoint`. Replace the existing `if/elif` block:

```python
            if event == "increment":      # ← remove these three lines
                state["count"] += 1
            elif event == "decrement":
                state["count"] -= 1
            elif event == "reset":
                state["count"] = 0
```

With:

```python
            if event == "add-todo":
                text = state["input"].strip()
                # .strip() removes leading/trailing whitespace
                if text:
                    # Only add if input is not empty
                    state["todos"].append({
                        "id": state["next_id"],
                        "text": text,
                        "done": False
                    })
                    state["next_id"] += 1
                    state["input"] = ""
                    # Clear the input after adding

            elif event == "input-change":
                value = message.get("value", "")
                # The browser will send the input's current value
                # alongside the event name — we read it from the message
                state["input"] = value

            elif event.startswith("toggle-"):
                todo_id = int(event.split("-")[1])
                # split("-") splits "toggle-3" into ["toggle", "3"]
                # [1] gets "3", int() converts it to the integer 3
                for todo in state["todos"]:
                    if todo["id"] == todo_id:
                        todo["done"] = not todo["done"]
                        # not inverts a boolean: True → False, False → True
                        break
                        # break exits the loop once we've found and updated the todo

            elif event.startswith("remove-"):
                todo_id = int(event.split("-")[1])
                state["todos"] = [
                    t for t in state["todos"] if t["id"] != todo_id
                ]
                # List comprehension filter: keep all todos EXCEPT the one being removed
                # t["id"] != todo_id: True for everything we want to keep
```

The `input-change` event needs the input's value. Update `setupEventDelegation` in `patcher.js` to send the value when the event is from an input:

```javascript
    document.body.addEventListener("click", (event) => {
        const target = event.target;
        const eventName = target.dataset.event;
        if (!eventName) return;

        socket.send(JSON.stringify({ event: eventName }));
    });

    // ← add this new listener below the click listener:
    document.body.addEventListener("input", (event) => {
        // "input" fires whenever an <input> element's value changes
        const target = event.target;
        const eventName = target.dataset.event;
        if (!eventName) return;

        socket.send(JSON.stringify({
            event: eventName,
            value: target.value
            // Send the current input value alongside the event name
            // The server reads message.get("value") to update state["input"]
        }));
    });
```

### SAVE AND TRY

uvicorn reloads from the Python changes. Rebuild fires from the JS changes. Refresh `http://localhost:8000`.

**You should see:**
```
Todo List

○  Buy groceries    [Done] [Remove]
○  Write lab notes  [Done] [Remove]
✓  Call dentist     [Undo] [Remove]

[input field]  [Add]
```

Test each feature:

**Click `[Done]` on "Buy groceries":**
Expected: `○` becomes `✓`, button changes to `[Undo]`

**Click `[Remove]` on "Write lab notes":**
Expected: That row disappears. "Call dentist" stays in place — keyed diffing produces one REMOVE_CHILD, not a cascade of text updates.

**Type "Read a book" in the input, click `[Add]`:**
Expected: New todo appears at the bottom. Input clears.

**Click `[Remove]` on the first todo:**
Expected: First todo disappears. Others shift up. All text remains correct — keyed diffing matches by id, not position.

Open DevTools → Network → WS tab. Watch the messages. Each remove should produce one REMOVE_CHILD patch — not multiple UPDATE_TEXT operations.

---

## 🎯 Challenge: Add Filtering

**You know:** State is a Python dict. `render(state)` is a pure function. New UI elements need `data-event` attributes. The server handles events in `elif` branches.

**Task:** Add a filter to the todo list. Three buttons: `[All]`, `[Active]`, `[Done]`. The active filter is stored in state. Only matching todos are shown.

**Expected UI:**
```
Todo List

[All]  [Active]  [Done]    ← filter buttons, active one visually distinct

(filtered list of todos)

[input]  [Add]
```

**Starting state:**
```python
def get_initial_state():
    return {
        "todos": [...],
        "next_id": 4,
        "input": "",
        "filter": "all"   # ← add this
    }
```

**Hints:**

1. In `render()`, filter `todos` before building `todo_items`:
   ```python
   filtered = [t for t in todos if ...]
   ```
2. Use `data-event="filter-all"`, `data-event="filter-active"`, `data-event="filter-done"` for the filter buttons.
3. To visually distinguish the active filter, add a different `class` prop: `{"class": "active"}` vs `{"class": ""}`.

Try for at least 10 minutes before revealing.

---

<details>
<summary>▶ Show Solution</summary>

```python
def get_initial_state():
    return {
        "todos": [
            {"id": 1, "text": "Buy groceries",  "done": False},
            {"id": 2, "text": "Write lab notes", "done": False},
            {"id": 3, "text": "Call dentist",    "done": True},
        ],
        "next_id": 4,
        "input": "",
        "filter": "all"
    }

def render(state):
    todos = state["todos"]
    input_value = state["input"]
    current_filter = state["filter"]

    # Apply filter
    if current_filter == "active":
        filtered = [t for t in todos if not t["done"]]
    elif current_filter == "done":
        filtered = [t for t in todos if t["done"]]
    else:
        filtered = todos

    todo_items = [
        create_element(
            "div", {"key": str(todo["id"]), "class": "todo"},
            create_element("span", {}, "✓ " if todo["done"] else "○ "),
            create_element("span", {}, todo["text"]),
            create_element("button", {"data-event": f"toggle-{todo['id']}"}, 
                          "Undo" if todo["done"] else "Done"),
            create_element("button", {"data-event": f"remove-{todo['id']}"}, "Remove"),
        )
        for todo in filtered
    ]

    def filter_btn(label, value):
        return create_element(
            "button",
            {
                "data-event": f"filter-{value}",
                "class": "active-filter" if current_filter == value else ""
            },
            label
        )

    return create_element(
        "div", {"id": "app"},
        create_element("h1", {}, "Todo List"),
        create_element(
            "div", {"class": "filters"},
            filter_btn("All", "all"),
            filter_btn("Active", "active"),
            filter_btn("Done", "done"),
        ),
        *todo_items,
        create_element(
            "div", {"class": "add-row"},
            create_element("input", {
                "type": "text", "value": input_value,
                "data-event": "input-change", "placeholder": "New todo..."
            }),
            create_element("button", {"data-event": "add-todo"}, "Add"),
        ),
    )

# Add to event handler:
            elif event.startswith("filter-"):
                state["filter"] = event.split("-")[1]
                # "filter-active" → ["filter", "active"] → "active"
```

**Key insight:** The filter is pure server-side logic. The browser sends `"filter-active"`. Python updates `state["filter"]`. `render(state)` applies the filter before building `todo_items`. The diff sees some todo rows disappear (REMOVE_CHILD) and the active filter button's class change (UPDATE_PROPS). Zero JavaScript changes. This demonstrates the full power of server-authoritative state: complex UI logic with no client-side code.

</details>

---

## Clean Up

Delete `server.py` — it's been replaced by `app.py`:

```
rm server.py
```

Update `package.json` to document the correct run commands:

```json
{
  "scripts": {
    "dev": "esbuild app.jsx --bundle --outfile=bundle.js --watch",
    "build": "esbuild app.jsx --bundle --outfile=bundle.js --minify"
  }
}
```

`--minify` produces a compressed `bundle.js` for production — removes whitespace and shortens variable names. Use `npm run build` when deploying, `npm run dev` during development.

---

## Production Considerations

**Keyed diffing and reordering:** Our keyed diff handles removal and addition correctly. It does not handle reordering — if you move item `key="b"` from position 1 to position 0, our diff doesn't produce a MOVE operation. It produces a remove and an add. Supporting true moves requires adding a `MOVE_CHILD` operation type and a DOM `insertBefore` call in the patcher. We leave this as a known limitation.

**Input handling latency:** Our input sends every keystroke to the server as an `input-change` event. At low latency (local development) this is seamless. Over a real network, each keystroke has round-trip latency — the input feels laggy. Phoenix LiveView solves this with "optimistic updates": the browser updates the input value locally and also sends the event. If the server disagrees (validation failure), it sends a correcting patch. We leave this for an advanced extension.

**WebSocket message ordering:** We assume messages arrive in order. TCP (which WebSocket runs over) guarantees ordering. If you ever move to UDP-based transports, ordering guarantees disappear and the patch protocol would need sequence numbers and reordering logic.

---

## Final Check

| Feature | How to verify |
|---|---|
| Listener registry prevents accumulation | Rapid clicks produce exactly one increment per click |
| `_setListener` used in buildNode | Source check: no raw `addEventListener` for event props |
| Batching works | `_renderPending` flag exists in runtime.js source |
| Reconnection triggers on close | Stop uvicorn → browser console shows retry messages |
| Reconnection succeeds | Restart uvicorn → browser reconnects within ~1 second |
| Retry delay resets on success | After reconnect, next disconnect starts at 1000ms again |
| Python keyed diff: remove from middle | Python test: remove key "b" → one REMOVE_CHILD, no UPDATE_TEXT |
| JS keyed diff: remove from middle | Console test → one REMOVE_CHILD operation |
| Todo app renders | Three todos visible on load |
| Add todo works | Type text, click Add → new todo appears, input clears |
| Remove todo works | Click Remove → correct todo disappears |
| Toggle done works | Click Done/Undo → status changes |
| Keyed removal is correct | Remove middle todo → others unchanged (check WS messages) |

---

## Quick Check Answers

**1. What happens when the button is clicked after the second render with accumulation?**

Both `handlerA` and `handlerB` fire. `handlerA` was attached in render 1 and never removed. `handlerB` was attached in render 2. A click event triggers all listeners registered for that event type on that element. Both run. If both call `setCount(count + 1)`, you get two state updates, two renders, and count increments by 2 instead of 1. After 5 renders, 5 handlers fire per click and count jumps by 5. The bug compounds with every render.

**2. What does the user see when the connection drops with no reconnection logic?**

The UI freezes. Clicks send nothing (the socket is closed, `socket.send` either throws or silently fails). The counter shows the last value before disconnect and never updates. The user must manually refresh to get a new connection — losing all context about what they were doing. With exponential backoff reconnection, the UI recovers automatically within seconds of the server coming back, invisible to the user.

**3. What's wrong with index-based diffing for list removal? What would fix it?**

The reconciler doesn't know that "Banana" moved to index 1 because "Apple" was removed — it only knows that the value at index 1 changed. It patches what it sees positionally, producing unnecessary UPDATE_TEXT operations and potentially incorrect DOM updates. What fixes it: a stable identity for each child — a `key` prop. With keys, the reconciler can ask "where did the child with key=`b` go?" rather than "what changed at index 1?" The identity-based comparison produces the correct minimal patch regardless of position changes.

---

## ▶ Next Session Prompt

```
Series: PyReact — Build React in Python
Completed: Lab 1 — VNode + serialization
           Lab 2 — Reconciler + patch format
           Lab 3 — DOM Patcher + HTTP server
           Lab 4 — JSX Runtime
           Lab 5 — Reactive State (useState)
           Lab 6 — FastAPI + WebSocket server-authoritative state
           Lab 7 — Incremental updates: four bug fixes + todo app
Next: Lab 8 — Developer Experience: Hot Reload, Project Structure, and the MVP

What we built:
  - Listener registry: _listenerRegistry WeakMap + _setListener() in patcher.js
  - Batched rendering: _renderPending flag + setTimeout(fn, 0) in runtime.js
  - WebSocket reconnection: exponential backoff in connectWebSocket, MAX_DELAY=30s
  - Keyed diffing: _diff_keyed_children (Python) + diffKeyedChildren (JS)
    in both reconciler.py and reconciler.js
  - Todo app: app.py with todos/next_id/input state, keyed VNode list,
    toggle/remove/add/input-change events
  - Input delegation: "input" event listener added to setupEventDelegation
  - server.py deleted (replaced by app.py)
  - package.json: added "build" script with --minify

Key files:
  pyreact/vdom.py         — VNode, create_element, serialize, deserialize
  pyreact/reconciler.py   — diff (keyed + unkeyed), print_patch, serialize_node
  pyreact/reconciler.js   — diff (keyed + unkeyed), browser-side
  pyreact/app.py          — FastAPI + WebSocket + todo app state + render
  pyreact/index.html      — HTML shell
  pyreact/patcher.js      — _listenerRegistry, _setListener, buildNode,
                            applyOperation, mount, applyPatch,
                            connectWebSocket (with backoff), setupEventDelegation
  pyreact/runtime.js      — jsx, Fragment, useState, init,
                            scheduleRender (with _renderPending batching)
  pyreact/app.jsx         — bootstrap: connectWebSocket + setupEventDelegation
  pyreact/bundle.js       — compiled output, do not edit
  pyreact/package.json    — dev + build scripts

Run commands:
  Terminal 1: uvicorn app:app --reload --port 8000
  Terminal 2: npm run dev

Known remaining limitations:
  - Keyed diff: no MOVE_CHILD operation (reorder = remove + add)
  - Input events: no optimistic updates (laggy over real network)
  - No useEffect / cleanup lifecycle
  - No CSS-in-JS or style system
  - No client-side routing

Lab 8 will cover:
  - Reviewing the complete framework from end to end
  - Adding minimal CSS to make the todo app presentable
  - Creating a clean project template (what a new user would clone)
  - Writing a README that explains how to build an app with PyReact
  - Discussing the path from this educational framework to production
  - What you now understand that most developers don't

Start Lab 8.
```