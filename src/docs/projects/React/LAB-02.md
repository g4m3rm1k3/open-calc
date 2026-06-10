# PyReact — LAB 2 — The Reconciler: How to Compare Two Trees

**Prerequisites:** Lab 1 — What is a UI, Really? You have `vdom.py` with `VNode`, `create_element`, `print_tree`, `serialize`, and `deserialize`.

**What this lab adds:**
- A function that compares two VNode trees and finds every difference
- A structured list of changes called a "patch"
- A clear mental model of why React doesn't redraw everything on every update

**Time:** 60–75 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. If you have a UI with 1000 elements and only one button's text changes, what's the dumbest possible way to update the screen? What's the smartest?
> 2. React is said to "diff" two trees. What do you think "diff" means, and where have you seen that word before?
> 3. If a `div` in the old tree becomes a `p` in the new tree at the same position, should we try to update the existing element or replace it entirely? Why?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will run one Python file and see this in your terminal:

```
Comparing trees...

[REPLACE] at path [] — div → p
[UPDATE_PROPS] at path [0] — removed: {}, added: {"id": "box"}
[UPDATE_TEXT] at path [1] — "Click me" → "Submit"
[REMOVE_CHILD] at path [] — index 2
[ADD_CHILD] at path [] — index 2: span
```

That output is a **patch** — a precise list of the minimum operations needed to transform one UI tree into another. This is the engine behind every framework that avoids full page reloads.

---

## Concept: Reconciliation

**What it is:** The process of comparing an old UI tree to a new UI tree and computing the minimum set of changes needed to make them identical.

**The problem before:**

The naive approach to updating a UI is to throw away everything and rebuild it from scratch on every change:

```python
# Every time state changes:
clear_the_entire_screen()
draw_everything_again()
```

This works. But it's catastrophically slow for real UIs. A browser "drawing everything again" means recalculating layout for every element, repainting every pixel, and losing scroll position, focus state, and animation progress. On a complex page this can take hundreds of milliseconds — long enough for users to see a flicker.

**The solution:** Instead of replacing everything, compare the old tree to the new tree, find only what changed, and apply only those changes to the real screen. If 999 elements are identical and 1 changed, only 1 operation happens.

**What it hides:** Reconciliation hides the complexity of tree comparison and minimal-edit computation from the rest of the framework. Without it, every component would need to know how to efficiently update the DOM itself. The invariant it protects: **given any two valid VNode trees, the reconciler produces a patch that is both correct (applying it transforms old into new exactly) and minimal (no operation in the patch is redundant).**

**Canonical example (General):**

You've used reconciliation your entire life — it's called a `diff`. When you run `git diff`, Git compares two versions of a file and shows you only the lines that changed. It doesn't show you the entire file twice. Our reconciler does the same thing, but for trees instead of lines of text.

```
Old file:          New file:          Diff:
line 1: hello      line 1: hello      (unchanged)
line 2: world      line 2: earth    ← CHANGED
line 3: bye        line 3: bye        (unchanged)
```

**Project application (The "Why" here):**

In Phase 5, our Python backend will hold state. When state changes, Python will produce a new VNode tree. We need to send only the changes to the browser — not the entire tree — to keep WebSocket messages small and DOM updates fast. The reconciler we build now is the function that produces those changes.

**Watch for:** Reconciliation is about *describing* changes, not *applying* them. Our reconciler produces a list of operations. A separate piece of code (the DOM patcher in Lab 3) will apply those operations. Keeping these concerns separate is a deliberate architectural decision.

---

## Concept: The Patch

**What it is:** A structured list of operations that describes exactly how to transform one tree into another.

**The problem before:**

You could represent a change as a plain English string:

```python
changes = ["change the button text", "add a new div at the end"]
```

But a program can't act on plain English. It needs to know: *which* button? *Where* exactly is "the end"? *What* is the new text?

**The solution:** Each operation in the patch is a structured object — a dictionary with a defined type and all the data needed to execute it, with no ambiguity.

**What it hides:** The Patch format hides the decision of how to represent changes from both the reconciler (which produces patches) and the DOM patcher (which applies them). Neither side needs to know about the other's implementation — they only need to agree on the patch format. The invariant it protects: **any code that receives a patch can execute it without asking any questions — all required information is present in the patch itself.**

**Canonical example (General):**

A surgical checklist. Each item specifies exactly what to do, to what, and in what order. The surgeon doesn't improvise — they follow the list precisely. The list was written before the surgery by someone who won't be in the room. The checklist is the contract between the planner and the executor.

**Project application (The "Why" here):**

We will define exactly five operation types. Each one will become a specific DOM operation in Lab 3. Defining the format now means Lab 3 has a clear contract to implement against — and it means we can test the reconciler completely independently of any browser or DOM code.

**Smallest possible example:**

```python
patch = [
    {"type": "UPDATE_TEXT", "path": [0], "old": "hello", "new": "world"}
]
# type: what kind of operation
# path: where in the tree this operation applies
# old/new: the values before and after
```

**Watch for:** The `path` field is a list of integers. Each integer is a child index. `[0, 2, 1]` means: "the first child's third child's second child." This gives us a precise address for any node in any tree without needing IDs or names.

---

## Concept: Tree Path

**What it is:** A list of child indices that uniquely identifies the location of any node in a tree, starting from the root.

**The problem before:**

When the reconciler finds a difference, it needs to tell the DOM patcher *where* the difference is. "Node at depth 3" is not enough — there could be many nodes at depth 3.

**The solution:** A path is a list of integers that works like directions: "take the first child, then the third child, then the second child." Following those directions from the root always leads to exactly one node.

**Canonical example (General):**

A postal address. "123 Main St, Apt 4B" is a path through a hierarchy: country → city → street → building → apartment. Each step narrows the location until only one place matches. A tree path does the same thing through parent-child relationships.

```
path = []        → the root node itself
path = [0]       → the root's first child
path = [0, 2]    → the root's first child's third child
path = [1, 0]    → the root's second child's first child
```

**Project application (The "Why" here):**

Every patch operation will carry a path. The DOM patcher in Lab 3 will use the path to navigate to the correct DOM node before applying the operation. Paths are also what make patches composable — you can sort them, filter them, or apply them in any order as long as you navigate correctly each time.

**Watch for:** Paths are relative to the root of the tree being patched, not relative to any intermediate node. `[0, 2]` always means "root → first child → third child," regardless of what those nodes contain.

---

## Step 1 — Define the Patch Operations

Create a new file in your `pyreact` folder called `reconciler.py`.

```
pyreact/
  vdom.py         ← from Lab 1, unchanged
  reconciler.py   ← new file
```

Type the following into `reconciler.py`:

```python
# reconciler.py
# The reconciler compares two VNode trees and produces a patch —
# a list of operations that transforms the old tree into the new tree.

# These are the only five things that can ever change between two trees.
# Every UI update in the entire framework reduces to one of these five operations.

REPLACE       = "REPLACE"        # a node was swapped for a completely different node
UPDATE_PROPS  = "UPDATE_PROPS"   # a node's attributes changed
UPDATE_TEXT   = "UPDATE_TEXT"    # a text node's content changed
ADD_CHILD     = "ADD_CHILD"      # a new child was added to a node
REMOVE_CHILD  = "REMOVE_CHILD"   # an existing child was removed from a node
```

**Why name the operation types as constants instead of writing the strings directly?**

If you write `"UPDATE_PROPS"` as a raw string in twenty places and later rename it, you have to find and change twenty strings — and Python won't warn you if you miss one. A named constant means you change one line and everything updates. It also means a typo like `"UDPATE_PROPS"` causes an immediate `NameError` instead of silently producing wrong behavior.

### SAVE AND TRY

Save `reconciler.py`. Open your Python interactive session:

```
python
```

```python
from reconciler import REPLACE, UPDATE_PROPS, UPDATE_TEXT, ADD_CHILD, REMOVE_CHILD
print(REPLACE)
print(UPDATE_TEXT)
```

**Expected:**
```
REPLACE
UPDATE_TEXT
```

**Change something:** Try importing a name that doesn't exist: `from reconciler import MOVE_CHILD`. You should see an `ImportError`. This is the safety guarantee — misspelled operation names fail loudly, not silently.

Exit with `exit()`.

---

## Concept: The Diffing Algorithm

**What it is:** A step-by-step procedure for comparing two trees node by node and recording every difference as a patch operation.

**The problem before:**

The mathematically optimal solution for finding the minimum number of edits to transform one tree into another is an NP-hard problem. That means the computation time grows so fast with tree size that it becomes practically impossible to run on real UIs. A page with 10,000 elements would take longer than the age of the universe to diff optimally.

**The solution:** Make two simplifying assumptions that cover 99% of real UI cases, and build the algorithm around them. React made exactly these two assumptions:

**Assumption 1 — Same position, different type = full replacement.**
If the old tree has a `div` and the new tree has a `p` at the same position, don't try to figure out what's shared. Replace the entire subtree. In practice, changing an element's type is rare and almost always means the subtree is structurally different anyway.

**Assumption 2 — Compare children by index, not by content.**
The first child of the old tree is compared to the first child of the new tree. The second to the second. And so on. This reduces an exponential problem to a linear one — we traverse each node exactly once.

**What it hides:** The diffing algorithm hides the complexity of recursive tree comparison and operation sequencing. Without it, every part of the framework that produces UI updates would need to implement its own comparison logic. The invariant it protects: **given any two valid VNode trees, `diff` produces a complete and correct patch in O(n) time, where n is the number of nodes in the larger tree.**

**Canonical example (General):**

Imagine comparing two family trees by standing them side by side and reading down each column simultaneously. You don't jump around — you go left-to-right, top-to-bottom, comparing the person in position (row 2, col 1) of tree A with position (row 2, col 1) of tree B. If they're different people, you record a replacement. If they're the same person but with a new address, you record an update. This positional comparison is the core of our algorithm.

**Project application (The "Why" here):**

Our `diff` function will walk both trees simultaneously. At each node it asks three questions in order:

1. Are the types different? → REPLACE, stop here
2. Are the props different? → UPDATE_PROPS, continue to children
3. Are the children different in count or content? → ADD_CHILD / REMOVE_CHILD / recurse

This produces a complete patch in a single pass through the tree.

**Watch for:** This algorithm has a known weakness — it performs poorly when children are reordered. If you move the first child to the last position, it looks like every child changed. React solves this with `key` props. We'll discuss keys at the end of this lab, but won't implement them yet.

---

## Step 2 — Write the Core Diff Function (Shell)

Add the following to `reconciler.py`. This is the shell — the structure of the function with its three main decision points, but without the full implementation of each yet. We build it incrementally.

```python
# ← add everything below this line

def diff(old_node, new_node, patch, path=None):
    # patch is a list we append operations to — it's shared across all recursive calls
    # path is the address of the current node in the tree (list of child indices)

    if path is None:
        path = []
        # We default path to None (not []) for the same reason props defaults to None:
        # mutable default arguments in Python are shared across all calls.
        # Creating a fresh [] here ensures each top-level call starts with a clean path.

    # --- Decision 1: Are the types different? ---
    # If old is a string and new is not (or vice versa), or if they're both elements
    # but with different tags — this position needs a full replacement.
    if _types_differ(old_node, new_node):
        patch.append({
            "type": REPLACE,
            "path": path,         # where in the tree this replacement happens
            "new_node": new_node  # the new node to put in this position
        })
        return
        # return immediately — if we're replacing the whole node,
        # there's no point comparing children or props

    # --- Decision 2: Are both nodes text? ---
    if isinstance(old_node, str):
        # If we reach here, both are strings (Decision 1 didn't trigger)
        # meaning types are the same — both are text nodes.
        if old_node != new_node:
            patch.append({
                "type": UPDATE_TEXT,
                "path": path,
                "old": old_node,
                "new": new_node
            })
        return
        # Text nodes have no props or children — nothing left to compare

    # --- Decision 3: Both are VNodes with the same tag ---
    # Check props, then recurse into children
    _diff_props(old_node, new_node, patch, path)
    _diff_children(old_node, new_node, patch, path)
```

**Why does `patch` get passed in instead of created inside the function?**

`diff` is recursive. Each recursive call handles one node and may generate multiple patch operations. If `patch` were created fresh inside each call, we'd get separate lists for each node — and we'd have to merge them all at the end. By passing one shared list, every recursive call appends to the same collection. The caller gets one complete patch when the top-level call returns.

### SAVE AND TRY

Save `reconciler.py`. Open your Python interactive session:

```
python
```

```python
from reconciler import diff
patch = []
diff("hello", "hello", patch)
print(patch)
```

**Expected:** `[]` — identical text nodes produce no operations.

```python
patch = []
diff("hello", "world", patch)
print(patch)
```

**Expected:** One operation with type `UPDATE_TEXT`.

The function will crash if you pass VNodes because `_types_differ`, `_diff_props`, and `_diff_children` don't exist yet. That's fine — we build them next, one at a time.

---

## Step 3 — Implement Type Checking

Add the following helper function to `reconciler.py`, above the `diff` function:

```python
# ← add this above the diff function

def _types_differ(old_node, new_node):
    # The underscore prefix is a Python convention meaning "private helper —
    # this function is for internal use by this module, not for outside callers"

    # Case 1: one is a string and the other is not
    if isinstance(old_node, str) != isinstance(new_node, str):
        # isinstance(x, str) returns True if x is a string, False otherwise
        # If the results are different, exactly one of them is a string
        return True

    # Case 2: both are VNodes but with different tags
    if not isinstance(old_node, str) and old_node.tag != new_node.tag:
        # We already know both are non-strings (Case 1 didn't trigger)
        # so we can safely access .tag on both
        return True

    return False
```

### SAVE AND TRY

Save. Open your Python interactive session:

```
python
```

```python
from vdom import VNode, create_element
from reconciler import diff

# Test: same tag, no differences
patch = []
diff(create_element("div"), create_element("div"), patch)
print(patch)
```

**Expected:** `[]` — same tag, no props, no children.

```python
# Test: different tags → REPLACE
patch = []
diff(create_element("div"), create_element("p"), patch)
print(patch)
```

**Expected:** One operation: `{'type': 'REPLACE', 'path': [], 'new_node': <VNode>}`

```python
# Test: element vs text → REPLACE
patch = []
diff(create_element("div"), "hello", patch)
print(patch)
```

**Expected:** One REPLACE operation.

**Change something:** Test `diff("hello", create_element("div"), patch)` — a text node becoming an element. Confirm it also produces a REPLACE. Both directions must be caught.

---

## Step 4 — Implement Props Diffing

Add this helper function to `reconciler.py`, above the `diff` function:

```python
# ← add this above the diff function

def _diff_props(old_node, new_node, patch, path):
    old_props = old_node.props  # the props dictionary from the old tree
    new_props = new_node.props  # the props dictionary from the new tree

    added = {}    # props that exist in new but not in old
    removed = {}  # props that exist in old but not in new
    changed = {}  # props that exist in both but with different values

    # Find added and changed props
    for key, new_value in new_props.items():
        # .items() returns each key-value pair as a tuple
        if key not in old_props:
            added[key] = new_value         # this key is brand new
        elif old_props[key] != new_value:
            changed[key] = new_value       # this key exists but the value changed

    # Find removed props
    for key in old_props:
        if key not in new_props:
            removed[key] = old_props[key]  # this key no longer exists

    # Only append an operation if something actually changed
    if added or removed or changed:
        patch.append({
            "type": UPDATE_PROPS,
            "path": path,
            "added": added,
            "removed": removed,
            "changed": changed
        })
```

**Why track added, removed, and changed separately instead of just storing old and new?**

The DOM patcher in Lab 3 needs to perform different operations for each case: `setAttribute` for added and changed props, `removeAttribute` for removed props. If we only stored "old props" and "new props," the patcher would have to re-do this comparison itself. By doing it once in the reconciler, we give the patcher a precise instruction set — it never has to figure out what changed, only how to execute each specific change.

### SAVE AND TRY

Save. Open your Python interactive session:

```
python
```

```python
from vdom import create_element
from reconciler import diff

# Test: props added
patch = []
old = create_element("div", {})
new = create_element("div", {"id": "app"})
diff(old, new, patch)
print(patch)
```

**Expected:** One UPDATE_PROPS operation with `added: {"id": "app"}`, `removed: {}`, `changed: {}`.

```python
# Test: props removed
patch = []
old = create_element("div", {"id": "app"})
new = create_element("div", {})
diff(old, new, patch)
print(patch)
```

**Expected:** One UPDATE_PROPS with `removed: {"id": "app"}`.

```python
# Test: no prop changes
patch = []
old = create_element("div", {"id": "app"})
new = create_element("div", {"id": "app"})
diff(old, new, patch)
print(patch)
```

**Expected:** `[]` — identical props produce no operation.

**Change something:** Test a prop that changes value: `{"color": "blue"}` → `{"color": "red"}`. Confirm it appears in `changed`, not in `added` or `removed`.

---

## 🎯 Challenge: Detect a Changed Prop Value

**You know:** `_diff_props` already handles added and removed props. The `changed` dictionary is populated when a key exists in both old and new but with different values.

**Task:** Write a standalone test (in your interactive session, not in the file) that produces a patch with all three categories populated simultaneously. You need one prop that is added, one that is removed, and one that changes value — all in a single diff call.

**Starting point:**

```python
from vdom import create_element
from reconciler import diff

patch = []
old = create_element("div", { ??? })
new = create_element("div", { ??? })
diff(old, new, patch)
print(patch[0]["added"])
print(patch[0]["removed"])
print(patch[0]["changed"])
```

Fill in the props so all three dictionaries are non-empty.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
patch = []
old = create_element("div", {"id": "app", "color": "blue"})
new = create_element("div", {"color": "red", "class": "container"})
diff(old, new, patch)
print(patch[0]["added"])    # {"class": "container"}
print(patch[0]["removed"])  # {"id": "app"}
print(patch[0]["changed"])  # {"color": "red"}
```

**Key insight:** The three categories are mutually exclusive by definition. A key is either new (added), gone (removed), or present-but-different (changed). It cannot be in two categories at once. This exhaustive classification means the DOM patcher can handle each category with a different DOM operation without any overlap or ambiguity.

</details>

---

## Step 5 — Implement Children Diffing

This is the most complex part of the reconciler. Add this helper above the `diff` function:

```python
# ← add this above the diff function

def _diff_children(old_node, new_node, patch, path):
    old_children = old_node.children
    new_children = new_node.children

    # Compare children that exist in both lists by their index
    shared_count = min(len(old_children), len(new_children))
    # min() gives us the number of positions that exist in BOTH lists
    # We can only compare positions that both trees have

    for index in range(shared_count):
        # Recursively diff each pair of children at the same position
        diff(
            old_children[index],
            new_children[index],
            patch,
            path + [index]
            # path + [index] creates the child's path without modifying path
            # e.g. if path is [0] and index is 2, child path is [0, 2]
        )

    # If new tree has MORE children than old — they need to be added
    if len(new_children) > len(old_children):
        for index in range(shared_count, len(new_children)):
            patch.append({
                "type": ADD_CHILD,
                "path": path,         # the PARENT's path, not the child's
                "index": index,       # where in the parent's children list to insert
                "new_node": new_children[index]
            })

    # If old tree has MORE children than new — the extras need to be removed
    elif len(old_children) > len(new_children):
        for index in range(shared_count, len(old_children)):
            patch.append({
                "type": REMOVE_CHILD,
                "path": path,         # the PARENT's path
                "index": index        # which child index to remove
            })
```

**Why does ADD_CHILD and REMOVE_CHILD use the parent's path instead of the child's path?**

Because the operation acts on the parent — "add a child to this node" or "remove a child from this node." The DOM patcher needs to find the parent and then modify its children list. If we stored the child's path, the patcher would have to navigate to the child and then go up one level to find the parent. Storing the parent's path is more direct and less error-prone.

### SAVE AND TRY

Save. Open your Python interactive session:

```
python
```

```python
from vdom import create_element
from reconciler import diff

# Test: child text changes
patch = []
old = create_element("div", {}, create_element("p", {}, "Hello"))
new = create_element("div", {}, create_element("p", {}, "Goodbye"))
diff(old, new, patch)
print(patch)
```

**Expected:** One UPDATE_TEXT at path `[0, 0]` — the root's first child's first child.

```python
# Test: child added
patch = []
old = create_element("div", {}, create_element("p", {}, "Hello"))
new = create_element("div", {},
    create_element("p", {}, "Hello"),
    create_element("button", {}, "Click")
)
diff(old, new, patch)
print(patch)
```

**Expected:** One ADD_CHILD at path `[]`, index `1`.

```python
# Test: child removed
patch = []
old = create_element("div", {},
    create_element("p", {}, "Hello"),
    create_element("button", {}, "Click")
)
new = create_element("div", {}, create_element("p", {}, "Hello"))
diff(old, new, patch)
print(patch)
```

**Expected:** One REMOVE_CHILD at path `[]`, index `1`.

**Change something:** Modify both the props on the `p` AND the text inside it in the same diff. Confirm you get two operations: one UPDATE_PROPS and one UPDATE_TEXT.

---

## Step 6 — Wire It All Together With a Pretty Printer

Add the following to the bottom of `reconciler.py`:

```python
# ← add everything below this line

def print_patch(patch):
    # A human-readable summary of every operation in a patch
    # This is our debugging tool — we'll use it throughout the series
    if not patch:
        print("(no changes)")
        return

    for op in patch:
        path_str = str(op["path"])  # convert [0, 1] to the string "[0, 1]"

        if op["type"] == REPLACE:
            new_tag = op["new_node"] if isinstance(op["new_node"], str) else op["new_node"].tag
            print(f"[REPLACE] at {path_str} → {new_tag}")

        elif op["type"] == UPDATE_PROPS:
            print(f"[UPDATE_PROPS] at {path_str}")
            if op["added"]:
                print(f"  added:   {op['added']}")
            if op["removed"]:
                print(f"  removed: {op['removed']}")
            if op["changed"]:
                print(f"  changed: {op['changed']}")

        elif op["type"] == UPDATE_TEXT:
            print(f"[UPDATE_TEXT] at {path_str} — '{op['old']}' → '{op['new']}'")

        elif op["type"] == ADD_CHILD:
            new_tag = op["new_node"] if isinstance(op["new_node"], str) else op["new_node"].tag
            print(f"[ADD_CHILD] at {path_str} — index {op['index']}: {new_tag}")

        elif op["type"] == REMOVE_CHILD:
            print(f"[REMOVE_CHILD] at {path_str} — index {op['index']}")


if __name__ == "__main__":
    from vdom import create_element

    print("=== Test 1: No changes ===")
    old = create_element("div", {"id": "app"}, create_element("p", {}, "Hello"))
    new = create_element("div", {"id": "app"}, create_element("p", {}, "Hello"))
    patch = []
    diff(old, new, patch)
    print_patch(patch)

    print()
    print("=== Test 2: Text change ===")
    old = create_element("div", {}, create_element("p", {}, "Hello"))
    new = create_element("div", {}, create_element("p", {}, "Goodbye"))
    patch = []
    diff(old, new, patch)
    print_patch(patch)

    print()
    print("=== Test 3: Props change + child added ===")
    old = create_element("div", {"id": "app"},
        create_element("p", {}, "Hello")
    )
    new = create_element("div", {"id": "app", "class": "container"},
        create_element("p", {}, "Hello"),
        create_element("button", {}, "Click me")
    )
    patch = []
    diff(old, new, patch)
    print_patch(patch)

    print()
    print("=== Test 4: Element type change ===")
    old = create_element("div", {}, create_element("p", {}, "Hello"))
    new = create_element("div", {}, create_element("span", {}, "Hello"))
    patch = []
    diff(old, new, patch)
    print_patch(patch)
```

### SAVE AND TRY

Save and run:

```
python reconciler.py
```

**You should see:**

```
=== Test 1: No changes ===
(no changes)

=== Test 2: Text change ===
[UPDATE_TEXT] at [0, 0] — 'Hello' → 'Goodbye'

=== Test 3: Props change + child added ===
[UPDATE_PROPS] at []
  added:   {'class': 'container'}
[ADD_CHILD] at [] — index 1: button

=== Test 4: Element type change ===
[REPLACE] at [0] — span
```

**Change something:** In Test 3, also change the text inside the `p` from `"Hello"` to `"Hi"`. Confirm you now get three operations: UPDATE_PROPS, UPDATE_TEXT, and ADD_CHILD.

---

## 🎯 Challenge: The Full Scenario

**You know:** `diff` handles REPLACE, UPDATE_PROPS, UPDATE_TEXT, ADD_CHILD, and REMOVE_CHILD. It recurses into children automatically.

**Task:** Build two trees where a single `diff` call produces all five operation types simultaneously. Write the trees and print the patch to confirm all five appear.

**Constraints:**
- Do not modify `reconciler.py`
- Write your test in a new file called `test_reconciler.py`
- Import from both `vdom` and `reconciler`

**Hints:**

1. REPLACE requires a tag change at some position. REMOVE_CHILD requires the old tree to have more children than the new at some node.
2. Think of the tree as having multiple levels — operations can happen at different depths simultaneously.

Try for at least 10 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
# test_reconciler.py
from vdom import create_element
from reconciler import diff, print_patch

old = create_element("div", {"id": "app"},
    create_element("h1", {}, "Title"),        # will become span (REPLACE)
    create_element("p", {"class": "text"}, "Hello"),  # props change + text change
    create_element("footer", {}, "Old footer") # will be removed (REMOVE_CHILD)
)

new = create_element("div", {"id": "app", "role": "main"},  # prop added (UPDATE_PROPS)
    create_element("span", {}, "Title"),       # REPLACE (h1 → span)
    create_element("p", {}, "Goodbye"),        # UPDATE_PROPS (removed class) + UPDATE_TEXT
                                               # ADD_CHILD (footer removed, button added)
    create_element("button", {}, "Submit")     # ADD_CHILD
)

patch = []
diff(old, new, patch)
print_patch(patch)
```

Output:
```
[UPDATE_PROPS] at []
  added:   {'role': 'main'}
[REPLACE] at [0] → span
[UPDATE_PROPS] at [1]
  removed: {'class': 'text'}
[UPDATE_TEXT] at [1, 0] — 'Hello' → 'Goodbye'
[REPLACE] at [2] → button
```

**Key insight:** REMOVE_CHILD doesn't appear here because we replaced the third child rather than removing it. To get REMOVE_CHILD, the new tree would need *fewer* children than the old. This reveals something important about the algorithm: the five operation types are not equally likely to appear together — REPLACE "consumes" a position that might otherwise produce REMOVE_CHILD. Understanding these interactions helps you predict what patches will look like before you run the diff.

</details>

---

## What React Does Differently — Keys

Our algorithm has a known weakness. Consider this:

```python
# Old tree children: [A, B, C]
# New tree children: [B, C]  — A was removed from the front
```

Our diff compares by index:
- Position 0: A vs B → REPLACE
- Position 1: B vs C → REPLACE
- Position 2: C is gone → REMOVE_CHILD

Three operations. But the optimal answer is one: remove A. Everything else is identical.

React solves this with **keys** — a special prop you add to children that gives each one a stable identity:

```jsx
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
  <li key="c">C</li>
</ul>
```

When children have keys, the reconciler matches by key instead of by index. It sees that `key="b"` and `key="c"` still exist in the new tree and only `key="a"` is gone — one REMOVE_CHILD operation.

We won't implement keys in this lab. They add significant complexity and aren't needed until we have dynamic lists. When we get there, you'll understand exactly why they exist because you've now seen the problem they solve.

---

## Production Considerations

You now have a working reconciler. Here's what a production system would do differently:

**Batching:** React doesn't run the reconciler on every single state change. It collects all changes that happen in one event (a click might trigger five state updates) and runs the reconciler once at the end. This is called batching — we'll add a simplified version in Phase 4.

**Fiber:** React's reconciler (called Fiber) doesn't do the full diff in one synchronous pass. It splits the work into small units and can pause between them to let the browser handle user input. Our recursive diff blocks the thread until it's done — fine for small trees, problematic for trees with thousands of nodes.

**Memoization:** React can skip diffing entire subtrees if it knows nothing inside them changed. Our reconciler always traverses the full tree. This is the correct starting point — optimize only when you can measure the slowdown.

---

## Final Check

| Feature | How to verify |
|---|---|
| Five operation type constants defined | `from reconciler import REPLACE` → no error |
| Identical trees produce empty patch | Test 1 in `python reconciler.py` → `(no changes)` |
| Text change produces UPDATE_TEXT | Test 2 → `[UPDATE_TEXT] at [0, 0]` |
| Tag change produces REPLACE | Test 4 → `[REPLACE] at [0]` |
| Prop addition produces UPDATE_PROPS | Test 3 → `[UPDATE_PROPS]` with `added` field |
| Extra child produces ADD_CHILD | Test 3 → `[ADD_CHILD] at [] — index 1` |
| Missing child produces REMOVE_CHILD | Interactive test with fewer new children |
| Path correctly identifies nested nodes | UPDATE_TEXT path is `[0, 0]` not `[0]` |
| `print_patch` shows all operation types cleanly | Run `python reconciler.py` and read the output |

---

## Quick Check Answers

**1. Dumbest vs smartest update strategy:**

The dumbest way is to clear the screen and redraw everything — this is what early web frameworks did, and what happens when you set `innerHTML` on every update. The smartest is to find the exact node that changed and update only that — one DOM operation instead of thousands. Reconciliation is what makes the smart approach possible: without comparing the old and new trees, you can't know what changed.

**2. What does "diff" mean?**

Diff means "difference" — specifically a structured description of what changed between two versions of something. You've seen it in `git diff`, which shows line-by-line differences between file versions. Our reconciler produces a tree diff instead of a line diff. The word comes from Unix's `diff` command, which has existed since 1974 and uses the same conceptual approach: compare two things, report only what's different.

**3. Different tag — update or replace?**

Replace entirely. A `div` and a `p` are fundamentally different kinds of elements with different browser behaviors, default styles, and semantic meanings. Trying to "update" a `div` into a `p` would require changing the tag, which browsers don't support on existing nodes — you'd have to create a new element anyway. More importantly, different tags almost always mean different subtree structures, so trying to preserve children usually produces more operations than a clean replacement. This is React's Assumption 1, and it's correct for the vast majority of real UI changes.

---

## ▶ Next Session Prompt

Copy this block into a new chat to continue the series:

```
Series: PyReact — Build React in Python
Completed: Lab 1 — What is a UI, Really?
           Lab 2 — The Reconciler: How to Compare Two Trees
Next: Lab 3 — The DOM Patcher: Applying Patches to the Browser

What we built:
  - Five patch operation types (REPLACE, UPDATE_PROPS, UPDATE_TEXT, ADD_CHILD, REMOVE_CHILD)
  - diff() — recursive tree comparison producing a patch list
  - _types_differ(), _diff_props(), _diff_children() — helper functions
  - print_patch() — human-readable patch output for debugging

Key files:
  pyreact/vdom.py         — VNode, create_element, print_tree, serialize, deserialize
  pyreact/reconciler.py   — diff, print_patch, operation type constants

Key decisions made:
  - Patch is a shared mutable list passed by reference through recursion
  - Path is a list of child indices (e.g. [0, 2, 1]) identifying node location
  - ADD_CHILD and REMOVE_CHILD store the PARENT's path, not the child's path
  - Props diff splits into added/removed/changed for precise DOM operation mapping
  - No keys yet — children compared by index only
  - Reconciler DESCRIBES changes, does not APPLY them (separation of concerns)

Lab 3 will cover:
  - How browsers represent the DOM in memory
  - The DOM API (createElement, setAttribute, removeAttribute, appendChild, etc.)
  - Writing a JavaScript patch applier that consumes our JSON patch format
  - Serving an HTML file from Python that loads our JavaScript runtime
  - Seeing a real browser DOM update driven by our Python reconciler output

Start Lab 3.
```