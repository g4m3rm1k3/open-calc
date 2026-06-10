# Python Tool Database — LAB 32 — What is Qt and the Event Loop

**Prerequisites:** Lab 31. You have a working service layer, validation, and test suite. Nothing about Python scripts changes — but the mental model for GUI programs is completely different from scripts, and you need that mental model before writing a single widget.

**What this lab adds:**
- What Qt is and where it comes from
- The event loop — the fundamental difference between a script and a GUI program
- `QApplication` — the one object that owns the loop
- Running your first window

**Time:** 25–35 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A Python script runs top to bottom and exits. A GUI program runs until the user closes it. What is keeping the GUI program alive?
> 2. You click a button. Something happens. How does the click get from the operating system to your Python function?
> 3. Every Qt program starts with `app = QApplication(sys.argv)`. Why does it need `sys.argv`?
>
> *(Answers at the end)*

---

## The Problem a Script Can't Solve

A script has a clear execution path:

```
line 1 → line 2 → line 3 → done
```

A GUI program has no such path. At any moment the user might:
- Click a button
- Type in a field
- Resize the window
- Press a keyboard shortcut
- Do nothing for an hour

A script cannot handle this. It cannot say "wait here until the user does something, then respond to whatever that was, then wait again."

The answer is an **event loop**.

---

## The Event Loop

An event loop is exactly what it sounds like — a loop:

```python
while True:
    event = wait_for_next_event()   # blocks until something happens
    dispatch(event)                 # call the right function for that event
```

Qt runs this loop internally. Every mouse click, keypress, timer tick, and window resize becomes an event object. Qt delivers each event to the widget that should handle it. Your code provides the handlers; Qt provides the dispatch.

This is why a GUI program stays alive: `app.exec()` starts the event loop and does not return until the loop exits (when the last window closes).

```
your code →  app.exec()  →  [loop runs]
                                ↓
                        user closes window
                                ↓
             app.exec() returns  ←
your code → sys.exit(...)
```

---

## Qt and PySide6

**Qt** is a C++ framework for building cross-platform applications. It has been around since 1991. Qt handles windows, widgets, networking, databases, multimedia, and more — all from one library, working on Windows, macOS, and Linux.

**PySide6** is the official Python binding for Qt6. You write Python; PySide6 calls the underlying C++ Qt library. The result runs as fast as native Qt because the actual widget rendering happens in C++, not Python.

**PySide6 vs PyQt6:** Two different Python bindings for the same Qt library. PySide6 is maintained by The Qt Company (official). PyQt6 is maintained by Riverbank Computing (third party, more restrictive license). Either works. PySide6 is the better long-term choice.

---

## Install

```
pip install PySide6
```

Verify:

```python
python -c "from PySide6.QtWidgets import QApplication; print('ok')"
```

---

## Step 1 — The Minimum Qt Program

Create `tooldb_ui/main.py`:

```python
import sys
from PySide6.QtWidgets import QApplication, QLabel

app = QApplication(sys.argv)   # one per program — owns the event loop

label = QLabel("Tool Database")
label.setWindowTitle("Tool Database")
label.resize(300, 100)
label.show()                   # make the widget visible

sys.exit(app.exec())           # start the loop; exit when it ends
```

Run it:

```
python tooldb_ui/main.py
```

You should see a small window with the text "Tool Database". Close the window — the program exits.

That is the complete pattern. Every Qt program you write will have this structure:
1. Create `QApplication`
2. Create and show at least one widget
3. Call `app.exec()`

---

## What Each Line Does

**`app = QApplication(sys.argv)`**

`QApplication` is a singleton — only one per program. It initializes Qt, reads command-line arguments that Qt understands (like `--style fusion` for a different visual style), and owns the event loop. `sys.argv` passes any command-line flags through.

**`label = QLabel("Tool Database")`**

`QLabel` is a widget that displays text. When a widget has no parent, Qt treats it as a top-level window with a title bar. This is why the label becomes a window here — it has no parent widget.

**`label.show()`**

Widgets are hidden by default. `.show()` makes it visible. Nothing appears on screen until you call this.

**`app.exec()`**

Starts the event loop. This call blocks — it does not return until the loop exits. The loop exits when the last top-level window is closed.

**`sys.exit(app.exec())`**

`app.exec()` returns an exit code (0 for clean exit). `sys.exit()` passes that code to the operating system. This matters for scripts that check exit codes; for interactive use it's just convention.

---

## Step 2 — SAVE AND TRY

Run the program, then try these:

**Resize the window.** The label stays in the top-left corner — it is not inside a layout yet. You will fix this in Lesson 33.

**Run from a different directory:**
```
python -m tooldb_ui.main
```
This requires `tooldb_ui/__init__.py` to exist. Create it (empty file). Now both `python tooldb_ui/main.py` and `python -m tooldb_ui.main` work.

**Try removing `app.exec()`:**
```python
label.show()
# sys.exit(app.exec())  ← commented out
```
Run it. The window flashes and disappears immediately — there is no event loop to keep it alive. This is the most direct demonstration of what the event loop does.

---

## The Folder Structure Going Forward

```
python-tooldb/          ← existing project root
    tooldb/             ← existing service/data layer
    tests/              ← existing tests
    tooldb_ui/          ← NEW: all UI code lives here
        __init__.py
        main.py
```

The `tooldb/` package does not import from `tooldb_ui/`. The data and service layers know nothing about Qt. The UI imports from `tooldb/`; never the reverse. This is the layered architecture from Lesson 20 in action.

---

## Challenge

Change the label text to show today's date:

```python
from datetime import date
label = QLabel(f"Tool Database — {date.today()}")
```

Then try setting a minimum window size so the window can't be resized smaller than 400×150:

```python
label.setMinimumSize(400, 150)
```

<details>
<summary>Why setMinimumSize on a label?</summary>

Because the label *is* the window right now — it has no parent, so Qt promotes it to a top-level window. `setMinimumSize` on any top-level widget sets the minimum window size. When we restructure in Lesson 33 with a proper `QMainWindow`, this will move to the window object instead.

</details>

---

## Final Check

| | |
|--|--|
| `app.exec()` removed — window appears and disappears instantly | ✓ tried it |
| `app.exec()` present — window stays until you close it | ✓ works |
| `tooldb_ui/` folder created with `__init__.py` | ✓ |
| `tooldb/` does not import from `tooldb_ui/` | ✓ verified |

---

## Quick Check Answers

1. **The event loop.** `app.exec()` is a loop that blocks until the last window closes. It is what keeps the program running while waiting for user input.

2. **The operating system delivers a mouse-click event to Qt. Qt puts it in the event queue. The event loop dequeues it and dispatches it to the widget under the cursor. If a slot is connected to that widget's `clicked` signal, Qt calls that slot.** Your Python function is at the end of that chain — you never see the OS event directly.

3. **Qt reads command-line arguments to configure itself** — things like `--style`, display settings on Linux, high-DPI flags. Your program may not use any of these, but passing `sys.argv` lets Qt pick them up if present. Passing an empty list (`QApplication([])`) also works but suppresses Qt's own flag handling.
