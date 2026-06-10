# PyReact — LAB 1 — What is a UI, Really?

**Prerequisites:** You can write basic Python. You know what a variable, function, and dictionary are. You have Python installed and can run a `.py` file from the terminal.

**What this lab adds:**
- A Python class that represents a single piece of UI in memory
- A function that builds a tree of UI pieces
- A way to print that tree so you can see its exact structure
- The mental model that React, the browser, and our framework all share

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading further:**
>
> 1. When you look at a webpage, what do you think the browser is actually storing in memory to represent what's on screen?
> 2. React is described as a "tree of components." What do you think that means — what is a tree, and why would a UI be shaped like one?
> 3. If you wanted to describe a `<button>` inside a `<div>` to someone using only Python dictionaries, what would that look like?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

By the end of this lab you will run one Python file and see this in your terminal:

```
div
  p
    "Hello, world"
  button
    "Click me"
```

That output is your framework's first heartbeat. It is a UI tree — the same fundamental structure React uses internally, the same structure your browser builds when it reads HTML, and the foundation every subsequent lab builds on.

No browser yet. No visuals. Just the data structure that makes all of it possible.

---

## Concept: The UI Tree

**What it is:** A way of representing an entire user interface as a hierarchy of nested nodes in memory, where each node describes one element and its children.

**The problem before:**

Imagine trying to describe a webpage to another program using only a string:

```python
ui = "<div><p>Hello</p><button>Click</button></div>"
```

This works for humans to read, but a program can't easily answer questions like:
- How many children does the `div` have?
- What is the second child's type?
- What text does the button contain?

To answer any of those, you'd have to parse the string character by character — slow, fragile, and painful.

**The solution:** Store the UI as a data structure instead of text. Each element becomes an object with explicit fields for its type, its properties, and its children. The program can then traverse, inspect, and modify the UI without ever touching a string.

**What it hides:** A UI tree hides the messy reality of nested, recursive structure behind a clean interface. Without it, every piece of code that wants to know "what are this element's children?" would have to implement its own parsing or traversal logic. The invariant the tree protects is this: **a node always knows its own type, properties, and children — and nothing outside the node can corrupt that relationship without going through the node's own interface.**

**Canonical example (General):**

A family tree is the universally understood version of this structure. A grandparent has children. Each child has their own children. Each person is a node. The relationship is always the same: one parent, zero or more children.

```
grandparent
  parent-A
    child-1
    child-2
  parent-B
    child-3
```

A UI tree works identically. `div` is the grandparent. `p` and `button` are its children. The text inside `p` is `p`'s child.

**Project application (The "Why" here):**

Our framework needs to represent UI in Python on the server, send it to the browser, and later compare two versions to find what changed. A tree of Python objects is the only structure that supports all three operations cleanly. A string cannot be compared node-by-node. A flat list loses the parent-child relationships. A tree preserves everything.

**Watch for:** The most common confusion is thinking of a tree as a visual diagram. A tree is not a picture — it is a data structure. The picture is just how we draw it to help our brains understand it.

---

## Concept: The Node

**What it is:** A single unit in a tree — one element with a type, optional properties, and a list of children.

**The problem before:**

You could represent a UI element as a plain Python dictionary:

```python
button = {
    "tag": "button",
    "props": {"color": "blue"},
    "children": []
}
```

This works for one element. But the moment you nest elements, you need dictionaries inside dictionaries inside dictionaries — and there's no guarantee any of them have the right keys. One typo (`"childre"` instead of `"children"`) silently breaks everything with no error message.

**The solution:** A class with defined fields. The class guarantees every node has exactly the fields it needs — no more, no less. If you forget a field, Python tells you immediately.

**What it hides:** The Node class hides the decision of how UI elements are stored and validated. Without it, every function that creates a UI element would have to remember to include `tag`, `props`, and `children` and spell them correctly every time. The invariant it protects: **every node in the tree is guaranteed to have a valid type, a props dictionary, and a children list — you can write code that relies on those fields existing without defensive checks everywhere.**

**Canonical example (General):**

Think of a node as a form with exactly three fields that must be filled out:

```
┌─────────────────────────────┐
│ NODE                        │
│ tag:      "button"          │
│ props:    {"color": "blue"} │
│ children: [...]             │
└─────────────────────────────┘
```

Every element in your entire UI fills out this same form. A `div` fills it out. A `p` fills it out. Even a plain text string is a special kind of node.

**Project application (The "Why" here):**

Later in this series, we will serialize these nodes to JSON and send them over a WebSocket to the browser. A class with consistent fields serializes cleanly and predictably. The browser will always know exactly what fields to expect because our class guarantees them.

**Smallest possible example:**

```python
class Node:
    def __init__(self, tag, props, children):
        self.tag = tag
        self.props = props
        self.children = children

button = Node("button", {"color": "blue"}, [])
print(button.tag)  # "button"
```

**Watch for:** `props` is short for "properties" — the attributes of an element, like `color`, `id`, or `onClick`. This is React's exact terminology. We use it from the start so the vocabulary is familiar when you read React code later.

---

## Step 1 — Create the Project and the Node Class

Create a new folder called `pyreact`. Inside it, create a file called `vdom.py`.

This is the only file for this lab.

```
pyreact/
  vdom.py
```

Open `vdom.py` and type the following. Do not copy-paste — typing it builds the muscle memory and forces you to read every character.

```python
# vdom.py
# vdom = "virtual DOM" — a representation of UI in memory, not in the browser

class VNode:
    # VNode = Virtual Node — one element in our UI tree
    # "Virtual" means it exists in Python memory, not in the real browser DOM
    def __init__(self, tag, props=None, children=None):
        self.tag = tag
        # props holds element attributes: {"id": "main", "color": "blue"}
        # We default to an empty dict if none are provided
        self.props = props if props is not None else {}
        # children is a list of VNodes (or strings for text content)
        # We default to an empty list if none are provided
        self.children = children if children is not None else []
```

**Why `props=None` instead of `props={}`?**

This is a Python-specific trap that every developer hits once. In Python, default argument values are created *once* when the function is defined — not each time it's called. If you write `props={}`, every node that uses the default would share the *exact same dictionary*. Modifying one would modify all of them. Using `None` as the default and creating a fresh `{}` inside the function avoids this entirely.

### SAVE AND TRY

Save `vdom.py`. Open your terminal, navigate to the `pyreact` folder, and run:

```
python vdom.py
```

**You should see:** Nothing. No output, no errors. A clean exit.

That's correct. We defined the class but haven't used it yet.

**In your terminal, open a Python interactive session:**

```
python
```

Then type:

```python
from vdom import VNode
node = VNode("div")
print(node.tag)
print(node.props)
print(node.children)
```

**Expected:**
```
div
{}
[]
```

**Change something:** Create a node with props: `VNode("button", {"color": "blue"})`. Print `node.props`. You should see `{'color': 'blue'}`. Then try creating two nodes with no props and confirm their `props` dictionaries are different objects: `node1.props is node2.props` should print `False`. This confirms the `None` default is working correctly.

Exit the interactive session with `exit()`.

---

## Concept: Recursive Structure

**What it is:** A structure where each element can contain more elements of the same type — a tree is recursive because each node's children are also nodes.

**The problem before:**

If you tried to represent nesting with a flat list:

```python
elements = ["div", "p", "Hello", "button", "Click me"]
```

You've lost all information about which elements are inside which. There's no way to know that `"p"` is inside `"div"`, or that `"Hello"` is inside `"p"`.

**The solution:** Each node holds its own children list. To nest a `p` inside a `div`, you put the `p` node *inside* the `div` node's children list. The nesting in the data mirrors the nesting in the UI.

**Canonical example (General):**

Russian nesting dolls. Each doll can contain another doll of the same type. The outermost doll doesn't know or care how many dolls are inside — it just knows it contains one thing, which itself may contain things.

```python
# A p node containing text
p_node = VNode("p", {}, ["Hello, world"])

# A div node containing the p node
div_node = VNode("div", {}, [p_node])

# div_node.children[0] is the p_node
# div_node.children[0].children[0] is "Hello, world"
```

**Project application (The "Why" here):**

Every real UI is recursive. A page contains sections. Sections contain cards. Cards contain buttons. Buttons contain text. Our VNode structure mirrors this naturally — a VNode's children list can hold other VNodes, which can hold other VNodes, indefinitely. This is the same structure React uses, the same structure the browser uses internally, and the same structure we'll traverse to generate DOM updates later.

**Watch for:** Text content (like `"Hello, world"`) is stored as a plain Python string in the children list, not as a VNode. This is a deliberate simplification — text nodes are leaf nodes that can't have children, so wrapping them in a VNode would be unnecessary overhead.

---

## Step 2 — Build a UI Tree

Add the following to the bottom of `vdom.py`:

```python
# ← add everything below this line

def create_element(tag, props=None, *children):
    # *children captures any number of additional arguments as a tuple
    # create_element("div", {}, child1, child2, child3)
    # → children becomes (child1, child2, child3)
    return VNode(tag, props, list(children))
    # list() converts the tuple to a list so VNode always stores a list
```

**Why a function instead of calling `VNode()` directly?**

Two reasons. First, this signature — `create_element(tag, props, ...children)` — is the exact signature React uses. When we build the JSX compiler in a later lab, it will call a function with this exact shape. Starting now means the connection will be obvious later. Second, a function gives us one place to add validation or transformation later without changing every call site.

### SAVE AND TRY

Save `vdom.py`. Open your Python interactive session again:

```
python
```

```python
from vdom import VNode, create_element

# Build a tree: div containing a p and a button
tree = create_element(
    "div", {},
    create_element("p", {}, "Hello, world"),
    create_element("button", {}, "Click me")
)

print(tree.tag)                        # div
print(tree.children[0].tag)            # p
print(tree.children[0].children[0])   # Hello, world
print(tree.children[1].tag)           # button
```

**Expected:**
```
div
p
Hello, world
button
```

**Change something:** Add a second paragraph inside the div. Confirm it appears at `tree.children[1]` and the button moves to `tree.children[2]`.

---

## Concept: Tree Traversal

**What it is:** The process of visiting every node in a tree exactly once, in a defined order, to perform some operation on each node.

**The problem before:**

You have a tree in memory. You want to print every node. You can't write:

```python
print(tree)         # just prints the object's memory address
print(tree.children) # prints a list of objects, not their contents
```

The tree is nested to an unknown depth. You don't know how many levels it has when you write the code. You can't write a fixed number of loops.

**The solution:** A function that calls itself — recursion. The function processes one node, then calls itself on each of that node's children. It naturally handles any depth because each call handles exactly one level.

**What it hides:** Recursive traversal hides the complexity of "how deep is this tree and how do I visit every level?" Without it, you'd need to know the maximum depth in advance and write that many nested loops. The invariant it protects: **every node in the tree will be visited exactly once, regardless of depth or shape, without the caller needing to know anything about the tree's structure.**

**Canonical example (General):**

Imagine you're in a building and must visit every room. Each room may have doors leading to other rooms. Your rule: enter a room, do your task, then go through every door and repeat the rule in the new room. You don't need to know the building's layout in advance — the rule handles any layout automatically.

```python
def visit(room):
    do_task(room)           # handle this room
    for door in room.doors: # then handle every room reachable from here
        visit(door)         # same rule, applied to the next room
```

**Project application (The "Why" here):**

We need to print the tree so we can inspect it. Later we'll traverse the tree to serialize it to JSON, to compare two trees and find differences, and to generate DOM operations. The traversal function we write now is the pattern all of those will follow.

**Smallest possible example:**

```python
def traverse(node, depth=0):
    print("  " * depth + node.tag)  # indent based on depth
    for child in node.children:
        traverse(child, depth + 1)  # recurse, one level deeper
```

**Watch for:** The `depth` parameter increases by 1 with each recursive call. This is how we track indentation without any external counter. Each call to `traverse` is responsible for exactly one node — the indentation takes care of itself.

---

## Step 3 — Print the Tree

Add the following to the bottom of `vdom.py`:

```python
# ← add everything below this line

def print_tree(node, depth=0):
    # depth tracks how many levels deep we are — starts at 0 for the root
    indent = "  " * depth
    # "  " * 0 = ""  (no indent for root)
    # "  " * 1 = "  " (two spaces for first level)
    # "  " * 2 = "    " (four spaces for second level)

    if isinstance(node, str):
        # isinstance checks whether node is a string
        # Text content is stored as plain strings, not VNodes
        # We print it in quotes so it's visually distinct from element tags
        print(f'{indent}"{node}"')
        return
        # return here because strings have no children — nothing left to do

    print(f"{indent}{node.tag}")
    # Print the tag name (div, p, button, etc.) with correct indentation

    for child in node.children:
        print_tree(child, depth + 1)
        # Recurse into each child, incrementing depth by 1
        # This is the recursive call — print_tree calls itself
```

### SAVE AND TRY

Save `vdom.py`. Run:

```
python vdom.py
```

**You should see:** Nothing — we haven't called `print_tree` yet from the file itself.

Add the following to the very bottom of `vdom.py`:

```python
# ← add everything below this line

# This block only runs when you execute this file directly
# It does NOT run when another file imports from this file
if __name__ == "__main__":
    tree = create_element(
        "div", {},
        create_element("p", {}, "Hello, world"),
        create_element("button", {}, "Click me")
    )
    print_tree(tree)
```

**Why `if __name__ == "__main__"`?**

Every Python file has a built-in variable called `__name__`. When you run a file directly (`python vdom.py`), `__name__` is set to `"__main__"`. When another file imports from it (`from vdom import VNode`), `__name__` is set to the file's own name (`"vdom"`). This guard means our test code runs when we execute the file directly, but stays silent when another module imports from it. Every Python file that has test or demo code at the bottom should use this guard.

Save and run again:

```
python vdom.py
```

**You should see:**
```
div
  p
    "Hello, world"
  button
    "Click me"
```

**Change something:** Add a second button inside the div, with the text `"Cancel"`. Run again. Confirm it appears at the same indentation level as the first button, below it. Then add a `span` inside the first `p` — give it the text `"world"` — and confirm it appears indented one level deeper than `p`.

---

## 🎯 Challenge: Add an ID to Every Node's Output

**You know:** The `print_tree` function visits every node. The `VNode` class has a `props` dictionary that can hold any attribute, including `id`.

**Task:** Modify `print_tree` so that if a node has an `id` in its props, the output includes it like this:

```
div#app
  p
    "Hello, world"
  button#submit
    "Click me"
```

Create this tree to test it:

```python
tree = create_element(
    "div", {"id": "app"},
    create_element("p", {}, "Hello, world"),
    create_element("button", {"id": "submit"}, "Click me")
)
```

**Hints:**

1. You only need to change one line in `print_tree` — the line that prints the tag name.
2. `props.get("id")` returns `None` if there is no id, which is falsy in Python.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def print_tree(node, depth=0):
    indent = "  " * depth

    if isinstance(node, str):
        print(f'{indent}"{node}"')
        return

    # Check for an id in props — if it exists, append it with a # prefix
    node_id = node.props.get("id")          # returns None if key doesn't exist
    id_suffix = f"#{node_id}" if node_id else ""  # only add suffix if id exists
    print(f"{indent}{node.tag}{id_suffix}")  # ← was: print(f"{indent}{node.tag}")

    for child in node.children:
        print_tree(child, depth + 1)
```

**Key insight:** `props.get("id")` is safer than `props["id"]` because it returns `None` instead of raising a `KeyError` when the key doesn't exist. This pattern — using `.get()` with a fallback — is one you'll use constantly when working with dictionaries whose keys are optional.

</details>

---

## Concept: Serialization

**What it is:** Converting a data structure in memory into a format that can be stored or transmitted — in our case, converting a VNode tree into JSON text.

**The problem before:**

Right now our UI tree is a Python object in memory. It only exists while our program is running. We can't send it to a browser over a network, save it to a file, or compare two versions of it as text. It's trapped inside Python.

**The solution:** Serialize the tree to JSON — a text format every programming language understands. The browser will receive JSON over a WebSocket, reconstruct the tree in JavaScript, and use it to build the actual DOM. This is the bridge between our Python backend and the browser.

**What it hides:** Serialization hides the complexity of translating between a language-specific in-memory object and a universal exchange format. Without it, you'd have to manually format strings, escape special characters, handle nesting, and ensure the output is valid JSON every time. The invariant it protects: **any VNode tree that enters `serialize` will produce valid, consistently structured JSON that any compliant JSON parser can read.**

**Canonical example (General):**

A fax machine serializes a physical document into audio tones for transmission over a phone line, then deserializes it back into a physical document on the other end. Both sides agree on the format in advance. Neither side cares about the other's internal implementation — only the agreed format matters.

**Project application (The "Why" here):**

In Phase 5, a WebSocket will carry our UI tree from Python to the browser on every state change. JSON is the natural format for that transmission. Building serialization now means Phase 5 has one less problem to solve — the tree already knows how to describe itself.

**Watch for:** Python's `json` module can't serialize custom objects automatically. It handles dicts, lists, strings, numbers, and booleans natively — but a `VNode` instance is none of those. We have to convert the VNode to a plain dictionary first.

---

## Step 4 — Serialize the Tree to JSON

At the top of `vdom.py`, add the import:

```python
import json   # ← add this as the very first line
# json is Python's built-in module for encoding and decoding JSON
# It handles dicts, lists, strings, numbers, booleans natively
```

Then add the serialization function before the `if __name__ == "__main__"` block:

```python
# ← add this function above the if __name__ block

def serialize(node):
    # Base case: if the node is a string (text content), return it as-is
    # JSON strings are valid JSON, so no conversion needed
    if isinstance(node, str):
        return node

    # Recursive case: convert VNode to a plain dict that json.dumps understands
    return {
        "tag": node.tag,
        # node.tag is already a string — no conversion needed

        "props": node.props,
        # node.props is already a plain dict — no conversion needed

        "children": [serialize(child) for child in node.children]
        # Each child may be a VNode or a string
        # We call serialize() on each one — this is the recursive call
        # The result is a list of already-serialized children
    }
```

Now update the `if __name__ == "__main__"` block to also print the JSON:

```python
if __name__ == "__main__":
    tree = create_element(
        "div", {},
        create_element("p", {}, "Hello, world"),
        create_element("button", {}, "Click me")
    )

    print_tree(tree)

    print()  # blank line for visual separation  ← add this line

    # serialize() converts our VNode tree to plain dicts/lists
    # json.dumps() converts that to a JSON string
    # indent=2 makes it human-readable with 2-space indentation
    print(json.dumps(serialize(tree), indent=2))  # ← add this line
```

### SAVE AND TRY

Save and run:

```
python vdom.py
```

**You should see:**

```
div
  p
    "Hello, world"
  button
    "Click me"

{
  "tag": "div",
  "props": {},
  "children": [
    {
      "tag": "p",
      "props": {},
      "children": [
        "Hello, world"
      ]
    },
    {
      "tag": "button",
      "props": {},
      "children": [
        "Click me"
      ]
    }
  ]
}
```

**Change something:** Add `{"id": "app"}` as the props for the `div`. Confirm `"props": {"id": "app"}` appears in the JSON output. This is the exact JSON our WebSocket will send to the browser in Phase 5.

---

## 🎯 Challenge: Deserialize JSON Back Into a VNode Tree

**You know:** `serialize()` converts a VNode tree into a plain dict structure. JSON is symmetric — if you can go one direction, you can go the other.

**Task:** Write a function `deserialize(data)` that takes the output of `serialize()` (a plain dict or string) and reconstructs a VNode tree.

Test it like this:

```python
original = create_element("div", {}, create_element("p", {}, "Hello"))
json_string = json.dumps(serialize(original))
data = json.loads(json_string)   # json.loads converts JSON string back to Python dict
reconstructed = deserialize(data)
print_tree(reconstructed)
# Should print:
# div
#   p
#     "Hello"
```

**Hints:**

1. A serialized node is either a string (text node) or a dict with `tag`, `props`, and `children` keys.
2. The function needs a base case and a recursive case — just like `serialize`.

Try for at least 5 minutes before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
def deserialize(data):
    # Base case: if it's a string, it's a text node — return it directly
    if isinstance(data, str):
        return data

    # Recursive case: reconstruct a VNode from the dict
    return VNode(
        data["tag"],
        data["props"],
        [deserialize(child) for child in data["children"]]
        # Reconstruct each child — same recursive pattern as serialize
    )
```

**Key insight:** `serialize` and `deserialize` are mirror images. Both are recursive, both have the same base case (strings pass through unchanged), and both handle children by applying themselves to each child in the list. Any time you build a serializer, you should immediately think about whether you also need a deserializer — round-trip integrity (serialize then deserialize returns the original) is a fundamental correctness check.

</details>

---

## Final Check

Verify every feature added in this lab:

| Feature | How to verify |
|---|---|
| `VNode` class exists with `tag`, `props`, `children` | `python` → `from vdom import VNode` → `VNode("div").tag` → prints `div` |
| Props default to `{}` not shared | `VNode("a").props is VNode("b").props` → prints `False` |
| Children default to `[]` not shared | `VNode("a").children is VNode("b").children` → prints `False` |
| `create_element` builds nested trees | `create_element("div", {}, create_element("p", {}, "hi"))` runs without error |
| `print_tree` shows correct indentation | `python vdom.py` → tree printed with 2-space indentation per level |
| Text nodes printed in quotes | `"Hello, world"` appears with surrounding quotes in output |
| `serialize` produces valid JSON | `json.dumps(serialize(tree))` runs without error |
| JSON structure matches VNode structure | `tag`, `props`, `children` appear in JSON output |
| `if __name__` guard works | `from vdom import VNode` in interactive session produces no printed output |

---

## The Complete File

Your final `vdom.py` should look exactly like this — use it to check your work:

```python
import json

class VNode:
    def __init__(self, tag, props=None, children=None):
        self.tag = tag
        self.props = props if props is not None else {}
        self.children = children if children is not None else []

def create_element(tag, props=None, *children):
    return VNode(tag, props, list(children))

def print_tree(node, depth=0):
    indent = "  " * depth
    if isinstance(node, str):
        print(f'{indent}"{node}"')
        return
    print(f"{indent}{node.tag}")
    for child in node.children:
        print_tree(child, depth + 1)

def serialize(node):
    if isinstance(node, str):
        return node
    return {
        "tag": node.tag,
        "props": node.props,
        "children": [serialize(child) for child in node.children]
    }

def deserialize(data):
    if isinstance(data, str):
        return data
    return VNode(
        data["tag"],
        data["props"],
        [deserialize(child) for child in data["children"]]
    )

if __name__ == "__main__":
    tree = create_element(
        "div", {},
        create_element("p", {}, "Hello, world"),
        create_element("button", {}, "Click me")
    )
    print_tree(tree)
    print()
    print(json.dumps(serialize(tree), indent=2))
```

---

## Quick Check Answers

**1. When you look at a webpage, what is the browser actually storing in memory?**

The browser parses your HTML and builds a tree of objects called the DOM — the Document Object Model. Each HTML tag becomes a node object with properties (attributes) and children (nested tags). The browser then uses that tree to decide what to draw on screen. When JavaScript changes the page, it modifies nodes in that tree, and the browser redraws only what changed. Our `VNode` tree is a simplified Python mirror of this exact structure.

**2. What is a tree, and why would a UI be shaped like one?**

A tree is a data structure where each node has exactly one parent (except the root, which has none) and zero or more children. UIs are naturally tree-shaped because containment is hierarchical: a page contains sections, sections contain cards, cards contain buttons, buttons contain text. Each element is "inside" exactly one other element — which is the definition of a tree. A flat list can't represent containment. A tree can.

**3. If you wanted to describe a button inside a div using only Python dictionaries:**

```python
{
    "tag": "div",
    "props": {},
    "children": [
        {
            "tag": "button",
            "props": {},
            "children": ["Click me"]
        }
    ]
}
```

This is almost exactly what our `serialize()` function produces. The VNode class is just a cleaner, safer way to work with this same structure before serialization.

---

## ▶ Next Session Prompt

Copy this block into a new chat to continue the series:

```
Series: PyReact — Build React in Python
Completed: Lab 1 — What is a UI, Really?
Next: Lab 2 — The Reconciler: How to Compare Two Trees

What we built:
  - VNode class (tag, props, children)
  - create_element() function matching React's signature
  - print_tree() recursive traversal
  - serialize() / deserialize() for JSON transport

Key file: pyreact/vdom.py (complete file is at end of Lab 1)

Key decisions made:
  - Props default to None (not {}) to avoid shared mutable default bug
  - Text nodes stored as plain strings, not VNodes
  - create_element uses *children (variadic) to match React's JSX signature
  - serialize produces {"tag", "props", "children"} structure for WebSocket transport

Lab 2 will cover:
  - What reconciliation means and why it exists
  - How to compare two VNode trees
  - How to produce a list of changes (a "patch")
  - Why React's diffing algorithm is O(n) instead of O(n³)

Start Lab 2.
```