# Python Tool Database — LAB 34 — Signals and Slots

**Prerequisites:** Lab 33. You have a window with a search field and an "Add Tool" button. Nothing happens when you type or click. This lesson wires them up.

**What this lab adds:**
- What a signal is and what a slot is
- `.connect()` — the one method that links them
- Built-in signals: `clicked`, `textChanged`, `returnPressed`
- Why this is better than passing callbacks directly
- Live search: typing in the search bar filters a list

**Time:** 35–45 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A button is clicked. Before your code runs, what has to happen? (Name at least two steps.)
> 2. You connect the same signal to three different slots: `button.clicked.connect(a)`, `button.clicked.connect(b)`, `button.clicked.connect(c)`. All three are connected. When the button is clicked, how many slots are called?
> 3. `button.clicked.connect(self.on_click)` vs `button.clicked.connect(lambda: self.on_click())` — the first passes the method, the second wraps it in a lambda. When does the lambda form matter?
>
> *(Answers at the end)*

---

## Signals and Slots: The Observer Pattern

Every interactive widget has **signals** — named events it can emit. A `QPushButton` emits `clicked` when pressed. A `QLineEdit` emits `textChanged` whenever its text changes. A `QComboBox` emits `currentIndexChanged` when the selection changes.

A **slot** is any Python callable — a method, a function, a lambda — that you connect to a signal. When the signal fires, Qt calls every connected slot.

```python
button.clicked.connect(self.on_save)   # connect signal to slot

def on_save(self):                      # the slot
    print("Save clicked")
```

This is the Observer pattern: the button (subject) knows nothing about `on_save`. It just emits `clicked`. The connection is made externally. The button could be replaced, the slot could change, neither needs to know about the other.

---

## Step 1 — Connect the Add Tool Button

Update `_build_ui` in `ToolDatabaseWindow` to store the button, then add a slot:

```python
def _build_ui(self):
    ...
    self.add_button = QPushButton("Add Tool")
    self.add_button.clicked.connect(self._on_add_tool)   # ← connect here
    button_row.addWidget(self.add_button)
    ...

def _on_add_tool(self):
    print("Add Tool clicked")   # placeholder — Lesson 39 builds the real dialog
```

Run. Click the button. "Add Tool clicked" appears in the terminal.

The slot runs on the GUI thread — the same thread the event loop runs on. For quick operations (opening a dialog, updating a label) this is fine. For slow operations (querying a large database, reading a file), you must not block the GUI thread or the window will freeze. That comes later.

---

## Step 2 — Live Search with `textChanged`

Replace the placeholder label with a list widget, and connect the search field to filter it.

Update your imports:

```python
from PySide6.QtWidgets import (
    QApplication, QWidget, QLabel, QLineEdit, QPushButton,
    QVBoxLayout, QHBoxLayout, QListWidget,
)
```

Update `_build_ui` — replace the placeholder:

```python
def _build_ui(self):
    root = QVBoxLayout(self)

    root.addWidget(QLabel("Tool Database"))

    search_row = QHBoxLayout()
    search_row.addWidget(QLabel("Search:"))
    self.search_input = QLineEdit()
    self.search_input.setPlaceholderText("Filter by name...")
    self.search_input.textChanged.connect(self._on_search_changed)  # ← NEW
    search_row.addWidget(self.search_input)
    root.addLayout(search_row)

    self.tool_list = QListWidget()                                   # ← NEW
    self._populate_tool_list(self._all_tools())                      # ← NEW
    root.addWidget(self.tool_list)

    button_row = QHBoxLayout()
    button_row.addStretch()
    self.add_button = QPushButton("Add Tool")
    self.add_button.clicked.connect(self._on_add_tool)
    button_row.addWidget(self.add_button)
    root.addLayout(button_row)
```

Add the data and slot methods:

```python
def _all_tools(self) -> list[str]:
    # Hard-coded for now — Lesson 36 replaces this with a real database query
    return [
        "EM-0500-4FL-C — 0.5\" endmill, carbide",
        "EM-0375-4FL-C — 0.375\" endmill, carbide",
        "EM-0750-4FL-C — 0.75\" endmill, carbide",
        "DR-0250-HSS — 0.25\" drill, HSS",
        "DR-0500-HSS — 0.5\" drill, HSS",
        "FM-1000-C — 1.0\" facemill, carbide",
        "EM-0625-4FL-C — 0.625\" endmill, carbide",
        "TAP-0250-HSS — 1/4-20 tap, HSS",
    ]

def _populate_tool_list(self, tools: list[str]) -> None:
    self.tool_list.clear()
    for tool in tools:
        self.tool_list.addItem(tool)

def _on_search_changed(self, text: str) -> None:
    text = text.lower()
    filtered = [t for t in self._all_tools() if text in t.lower()]
    self._populate_tool_list(filtered)
    
def _on_add_tool(self):
    print("Add Tool clicked")
```

Run it. Type in the search field. The list filters as you type.

---

## Step 3 — What `textChanged` Carries

`textChanged` emits the current full text of the field each time it changes. The slot receives it as a parameter:

```python
def _on_search_changed(self, text: str) -> None:
    # text is the complete current content of the QLineEdit
```

Compare with `returnPressed`, which emits when the user presses Enter but carries no data — the slot takes no parameters (or checks `self.search_input.text()` manually):

```python
self.search_input.returnPressed.connect(self._on_search_submitted)

def _on_search_submitted(self):
    text = self.search_input.text()
    print(f"Submitted: {text}")
```

Both signals are useful for different UX patterns: `textChanged` for live filtering, `returnPressed` for form submission.

---

## Step 4 — SAVE AND TRY

**Experiment 1: Connect to a lambda**

Sometimes you want to pass extra data to a slot that the signal doesn't provide. Lambda is the tool:

```python
self.add_button.clicked.connect(lambda: print(f"clicked, search is: {self.search_input.text()}"))
```

The lambda captures `self` from the enclosing scope, letting you read the search field even though `clicked` carries no text. Replace the lambda with the real slot after experimenting.

**Experiment 2: Connect one signal to two slots**

```python
self.search_input.textChanged.connect(self._on_search_changed)
self.search_input.textChanged.connect(lambda text: print(f"also heard: {text}"))
```

Both slots fire every time the text changes. One signal, two handlers, no coordination needed. This is why the observer pattern scales — you can add a third observer later without changing the signal or the first observer.

**Experiment 3: Disconnect**

```python
# Inside a method:
self.search_input.textChanged.disconnect(self._on_search_changed)
```

After this, typing in the search field no longer filters the list. `disconnect()` removes a specific connection; `disconnect()` with no arguments removes all connections to that signal. Useful for temporarily disabling a signal during programmatic updates (to avoid feedback loops).

---

## Concept: Why Not Just Pass Callbacks?

You could skip signals entirely and do this:

```python
class SearchBar:
    def __init__(self, callback):
        self._callback = callback

    def on_text_change(self, text):
        self._callback(text)
```

This works but tightly couples `SearchBar` to whatever uses it. It can only notify one listener. To add a second listener you have to change `SearchBar`.

Signals decouple the emitter from the listener. `QLineEdit` doesn't know anything about your `_on_search_changed` method. It emits `textChanged` and Qt handles the dispatch. Any number of slots can connect; `QLineEdit` does not change.

---

## Challenge

When the user clicks a tool in the list, show the selected tool name in the status label at the bottom. Use `QListWidget.currentItemChanged` or `QListWidget.itemClicked`.

```python
self.tool_list.itemClicked.connect(self._on_tool_selected)

def _on_tool_selected(self, item):
    self.status_label.setText(f"Selected: {item.text()}")
```

If you added the status label in Lesson 33's challenge, wire it up. If not, add it now.

<details>
<summary>Answer</summary>

In `_build_ui`, after creating `self.tool_list`:

```python
self.tool_list.itemClicked.connect(self._on_tool_selected)
```

Add the slot:

```python
def _on_tool_selected(self, item):
    self.status_label.setText(f"Selected: {item.text()}")
```

`itemClicked` carries the `QListWidgetItem` that was clicked. `item.text()` returns its display string. The status label updates instantly because it runs on the GUI thread — the whole operation takes microseconds.

</details>

---

## Final Check

| | |
|--|--|
| Clicking "Add Tool" prints to the terminal | ✓ |
| Typing in the search field filters the list in real time | ✓ |
| The same signal can be connected to multiple slots | ✓ tried it |
| `textChanged` carries the current text; `returnPressed` carries nothing | ✓ |

---

## Quick Check Answers

1. **The OS detects the mouse button press and release over the widget, sends a mouse event to Qt, Qt determines which widget was under the cursor, Qt emits the widget's `clicked` signal, Qt dispatches the signal to all connected slots.** Your Python function is called at the end of this chain.

2. **All three slots are called**, in the order they were connected. Signals are multicast — one emission, many listeners. Qt iterates the connection list and calls each slot.

3. **The lambda form matters when you need to pass arguments that the signal doesn't provide**, or when you want to call a method with different parameters than the signal carries. `button.clicked.connect(self.on_click)` only works if `on_click` accepts the same arguments that `clicked` emits (for `clicked`, a `checked: bool`). `lambda: self.on_click()` ignores the `checked` argument entirely, which is usually what you want for a simple button.
