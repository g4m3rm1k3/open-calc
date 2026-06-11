# PyX — LAB 26 — A PyX To-Do App

**Prerequisites:** Lab 25 complete. The counter works end-to-end in the browser.

**What this lab adds:**
- A complete to-do list application in PyX
- Multiple components, props passing, list rendering with keys
- `useEffect` to persist to `localStorage`
- The first real PyX application beyond "hello world"

**Time:** 60–80 minutes.

---

## What You Will Build

A to-do list at `examples/todo-app/` with:
- Add items, mark complete, delete items
- State persisted to localStorage
- Three components: `TodoApp`, `TodoItem`, `AddForm`

---

> **Quick Check:**
>
> 1. The to-do list has three components. Which one holds the items state, and why?
> 2. `useEffect` with `[items]` as deps persists items on every change. What format should you use to store an array in localStorage?
> 3. A `TodoItem` component needs an `onToggle` and `onDelete` callback. How do you pass functions as props in PyX?
>
> *(Answers at the end)*

---

## Step 1 — Create the App Files

Create `examples/todo-app/app.pyx`:

```python
from pyx import useState, useEffect
import json

def TodoItem(props):
    item = props["item"]
    on_toggle = props["onToggle"]
    on_delete = props["onDelete"]

    done_class = "todo-item done" if item["done"] else "todo-item"

    return (
        <li class={done_class}>
            <span onClick={lambda: on_toggle(item["id"])}>{item["text"]}</span>
            <button class="delete" onClick={lambda: on_delete(item["id"])}>×</button>
        </li>
    )


def AddForm(props):
    on_add = props["onAdd"]
    text, set_text = useState("")

    def handle_submit(e):
        if text.strip():
            on_add(text.strip())
            set_text("")

    return (
        <form class="add-form" onSubmit={handle_submit}>
            <input
                type="text"
                value={text}
                onInput={lambda e: set_text(e.target.value)}
                placeholder="Add a task..."
            />
            <button type="submit">Add</button>
        </form>
    )


def TodoApp():
    items, set_items = useState([])
    next_id, set_next_id = useState(1)

    useEffect(lambda: localStorage.setItem("pyx-todo", json.dumps(items)), [items])

    def add_item(text):
        new_item = {"id": next_id, "text": text, "done": False}
        set_items(items + [new_item])
        set_next_id(next_id + 1)

    def toggle_item(id):
        updated = [
            {"id": i["id"], "text": i["text"], "done": not i["done"]}
            if i["id"] == id else i
            for i in items
        ]
        set_items(updated)

    def delete_item(id):
        set_items([i for i in items if i["id"] != id])

    done_count = len([i for i in items if i["done"]])
    total = len(items)

    return (
        <div class="todo-app">
            <h1>PyX To-Do</h1>
            <p class="stats">{done_count}/{total} complete</p>
            <AddForm onAdd={add_item} />
            <ul class="todo-list">
                {[<TodoItem
                    key={item["id"]}
                    item={item}
                    onToggle={toggle_item}
                    onDelete={delete_item}
                /> for item in items]}
            </ul>
        </div>
    )
```

---

## Step 2 — Compile and Run

```
> pyxc build examples/todo-app/app.pyx --output app/src/todo.jsx
```

Update `app/src/main.jsx` to use the TodoApp:

```jsx
import { TodoApp } from './todo.jsx';
import { renderRoot } from 'pyx-runtime';

renderRoot(TodoApp, document.getElementById('root'));
```

Add basic CSS to `app/src/style.css`:

```css
.todo-app { max-width: 400px; margin: 40px auto; font-family: sans-serif; }
.todo-list { list-style: none; padding: 0; }
.todo-item { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
.todo-item.done span { text-decoration: line-through; opacity: 0.5; }
.add-form { display: flex; gap: 8px; margin: 16px 0; }
.add-form input { flex: 1; padding: 8px; }
.delete { background: none; border: none; cursor: pointer; color: red; }
.stats { color: #666; font-size: 0.9em; }
```

---

### SAVE AND TRY

Start the Vite dev server and verify:
- Adding items works
- Clicking an item toggles the strikethrough
- Clicking × removes the item
- The counter (`done_count/total`) updates correctly
- Refreshing the page does NOT preserve items yet (localStorage with JSON is a challenge)

---

## Challenge: Load From localStorage on Mount

**Task:** Update `TodoApp` to load saved items from localStorage when the app starts. On every change, save the items to localStorage under the key `"pyx-todo"`.

Try writing the persistence logic before revealing the solution.

---

<details>
<summary>▶ Show Solution</summary>

```python
from pyx import useState, useEffect

def TodoApp():
    items, set_items = useState([])

    # Load from localStorage on mount
    def load_from_storage():
        saved = localStorage.getItem("pyx-todo")
        if saved:
            set_items(JSON.parse(saved))

    useEffect(load_from_storage, [])

    # Save to localStorage whenever items change
    def save_to_storage():
        localStorage.setItem("pyx-todo", JSON.stringify(items))

    useEffect(save_to_storage, [items])

    # ... rest of component
```

**Key insight:** Two separate `useEffect` calls with different deps arrays do two different jobs. `useEffect(load, [])` runs once on mount — the empty deps array guarantees it only runs once. `useEffect(save, [items])` runs every time `items` changes. The separation keeps the logic clean and avoids writing a combined effect that tries to do both.

</details>

---

## Final Check

| Feature | How to verify |
|---|---|
| Add item | Type in input, press Add → item appears in list |
| Toggle complete | Click item text → strikethrough toggles |
| Delete item | Click × → item removed |
| Counter updates | `done/total` number changes correctly |
| Keys present | No "missing key" warnings in console |

---

## Your Complete Files

### New file this lab

**`examples/todo.pyx`** — the complete to-do app. Full content in Steps 1–2.

**`examples/todo.jsx`** — generated by `pyxc build examples/todo.pyx`.

### Project structure at end of Lab 26

```
pyx/
├── .venv/
├── compiler/              ← unchanged
├── runtime/               ← unchanged
├── examples/
│   ├── counter.pyx  /  counter.jsx  /  counter.jsx.map
│   ├── hello.pyx
│   └── todo.pyx          ← new
│       todo.jsx           ← generated
└── pyproject.toml
```

---

## Quick Check Answers

**1. Which component holds the items state?**

`TodoApp` — the top-level component. State should live in the lowest common ancestor of all components that need it. `TodoItem` needs to read an item and call `onToggle`/`onDelete`. `AddForm` needs to call `onAdd`. The items list is needed by both, so it lives in their common parent: `TodoApp`. This is the "lift state up" pattern — a fundamental React/PyX principle.

**2. What format for localStorage?**

`JSON.stringify(items)` to store (an array becomes a JSON string), `JSON.parse(saved)` to load. localStorage only stores strings. Arrays and objects must be serialised to JSON. Python's `json.dumps` and `json.loads` are the equivalent in Python; in the generated JavaScript these become calls to `JSON.stringify` and `JSON.parse`.

**3. How do you pass functions as props?**

`<TodoItem onToggle={toggle_item} />` — a function reference in `{curly_braces}`. The code generator emits `onToggle={toggle_item}` in JSX. Functions are first-class values in Python and JavaScript — they can be assigned to variables, stored in objects, and passed as arguments. The `toggle_item` function closes over the `set_items` setter and the `items` state — when called inside `TodoItem`, it updates the state in `TodoApp`.

---

*End of LAB 26.*

*Lab 27 adds a FastAPI backend that serves a REST API — the PyX frontend fetches from it using `useEffect` and `fetch`. Data is real, not hardcoded. FastAPI serves the static Vite-built frontend as well.*
