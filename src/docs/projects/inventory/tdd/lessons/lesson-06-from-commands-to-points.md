# Lesson 6: From Commands to Points

## What you will build

`core/path.py`'s `compute_path()` — the "scan" version of Lesson 5's
"fold": instead of only the final position, it returns **every**
intermediate position the machine passed through, including where it
started. `"G0 X10 Y20\nX30\nG1 Z-5 F100"` now produces four points, not
one: the origin, then after each of the three commands. Wired to a new
`POST /api/path` route and a Path button. This lesson also makes good on
a promise named explicitly in Lesson 5: a real, live demonstration of
exactly why `MachineState.position()` had to return a fresh dict every
call, by deliberately building the broken version and watching it fail.

## What you need to know first

Lesson 5: `MachineState`, its fold in `apply()`/`position()`, and the
fold/scan distinction named there but not yet demonstrated with a second
example. Lesson 4: `Parser` producing commands. This lesson does not
change either of those — it only calls them differently.

## Concepts cataloged from this lesson

Almost entirely reuse of `../concepts/fold-vs-scan.md` and
`../concepts/mutable-object-aliasing.md` (both Lesson 5) — this lesson is
their real, live demonstration, not new territory. One genuinely new
concept:

`python-is-vs-equals`

## Pipeline diagram

```
Text → Tokens → Commands → Machine State → Points → Picture
```
This lesson builds the **fourth** stage, `Machine State → Points`, for
the first time. Concrete value carried through all four stages built so
far: `"X30"` becomes the token `{"X": 30.0}`, the command
`{"motion": "G0", "x": 30.0}`, and — where Lesson 5 stopped — silently
folded into a `MachineState` with no visible trace of the intermediate
step. This lesson is what makes that intermediate step visible at all:
after processing `"G0 X10 Y20"` then `"X30"`, the *second* recorded point
is `{"x": 30.0, "y": 20.0, "z": 0.0}` — a real, distinct entry in a list,
not something that only ever existed transiently inside a fold. `Picture`
remains the one empty box — nothing draws these points yet.

---

## Concept Unit: Recording Every Step, Not Just the Last One

### The Problem

Lesson 5's `/api/simulate` answers "where does the machine end up" — the
right question for a final-position readout, and the wrong question for
a visualizer. A backplotting tool (this project's own stated priority
#1, per `CURRICULUM.md`) needs to draw a *line* through every point the
tool passed through, not a single dot at the end.

### Reference Source, Read for Real This Session

This project's own `core/machine.py` and `core/parser.py`, both already
real and ported — this unit doesn't port new reference logic from
`CNCEngine.ts`; it recombines what Lessons 4–5 already built, the way the
reference's own `_executeBlock` loop (already read in full for Lesson 4's
research, lines 1616–1731) repeatedly calls `_applyMotion` once per block
and lets each call's path-recording side effects (`_addPathPoint`,
mentioned but not yet ported — `CNCEngine.ts` line 2041 onward, real
distance/feed-rate/cutter-comp logic well beyond this project's current
scope) accumulate into a growing path. **Named, deliberate scope**: this
lesson ports only the *shape* of "record a point after every command" —
`_addPathPoint`'s own real logic (distance calculation, cutter
compensation, feed-rate-based effective speed) is real, later work, not
yet needed since nothing in this project draws or measures a path yet.

### The New Code

```python
from core.machine import MachineState


def compute_path(commands):
    state = MachineState()
    points = [state.position()]
    for command in commands:
        state.apply(command)
        points.append(state.position())
    return points
```

### The Updated Project

The complete, new `core/path.py` — nothing precedes it:
```python
from core.machine import MachineState


def compute_path(commands):
    state = MachineState()
    points = [state.position()]
    for command in commands:
        state.apply(command)
        points.append(state.position())
    return points
```
As a whole: given a list of commands, this returns a list one element
longer — the starting position, plus one recorded position after each
command is applied.

### Mechanical Walkthrough

- `from core.machine import MachineState` — **(b) reappearing** import
  syntax, reaching into a sibling module inside `core/` for the first
  time from *another* `core/` module rather than from `app.py` —
  **(a) worth naming**: `core/path.py` importing `core/machine.py`
  directly is still entirely within the `core` boundary (Lesson 2) —
  that boundary is about `core` never depending on `flask`, not about
  modules inside `core` staying isolated from each other.
- `state = MachineState()` — **(b) reappearing** instantiation.
- `points = [state.position()]` — **(a) first appearance** of recording
  the **starting** position before any command runs at all — a real,
  deliberate choice: a path with `n` commands produces `n + 1` points,
  because a line needs both a start and an end, and the very first
  command's "start" is the origin itself, which no command ever
  explicitly states.
- `for command in commands: state.apply(command); points.append(state.position())`
  — already-known basic Python (`for`, `list.append`); `state.apply` is
  **(b) reappearing** (Lesson 5); the **(a) genuinely new decision** is
  calling `state.position()` **again**, immediately after each `apply`,
  and keeping *every* one of those results instead of only the loop's
  final value — the one-line difference between this lesson's scan and
  Lesson 5's fold.
- `return points` — already-known basic Python.

### Execution Trace

`compute_path` against a real 2-command program, `"G0 X10\nX20 Y5"`,
run this session:

```
state = MachineState() → state.position() = {'x':0.0,'y':0.0,'z':0.0}
points = [{'x':0.0,'y':0.0,'z':0.0}]   ← the starting point, before any command

command 1 ("G0 X10"): state.apply({'x':10.0, ...})
  state.position() = {'x':10.0,'y':0.0,'z':0.0}
  points.append(...) → points = [{'x':0.0,...}, {'x':10.0,'y':0.0,'z':0.0}]

command 2 ("X20 Y5"): state.apply({'x':20.0,'y':5.0, ...})
  state.position() = {'x':20.0,'y':5.0,'z':0.0}
  points.append(...) → points = [{'x':0.0,...}, {'x':10.0,...}, {'x':20.0,'y':5.0,'z':0.0}]

Loop ends (2 commands) → return points (3 entries)
```

2 real commands produced 3 real points — `n + 1`, exactly as the
Project Change step above states: the starting point (before anything
runs) plus one point per command. Compare against Lesson 5's own fold
over this same kind of loop: a fold would only ever keep the *last* of
these three entries; this scan keeps all of them.

### CS Lens

Returning the *entire sequence* of intermediate results, not just the
final accumulated value, is a **scan** (sometimes `scanl`/`itertools.
accumulate` in languages that name it explicitly) — the direct
generalization of Lesson 5's fold: a fold answers "what's the final
total"; a scan answers "what was the running total after each step,"
which is exactly a running balance history, a step-by-step undo log, or
— here — a toolpath.

Also recognized in: `itertools.accumulate` in Python's own standard
library (a real, built-in scan), a spreadsheet's running-total column, a
version control system's history of a file (each commit is a "point"
along a sequence of edits), and, again, directly: a real CNC backplotting
tool's entire reason to exist — it draws the scan, never just the fold.

### SE Lens

`compute_path` recomputes the whole simulation from scratch, exactly like
Lesson 5's `/api/simulate` route does relative to `/api/parse` — the same
"recompute for correctness over reuse for speed" tradeoff named there,
now compounded: `/api/path` and `/api/simulate` both create their own
fresh `MachineState` and independently replay every command, rather than
one computing off the other's result. A real alternative — have
`/api/simulate` call `compute_path` internally and just return its last
element — was considered and rejected here specifically to keep `Machine
State` (Lesson 5) and `Points` (this lesson) as genuinely separate,
independently-understandable pipeline stages matching the project's own
named architecture, rather than quietly merging them the moment it's
convenient.

---

## Concept Unit: The Bug Lesson 5 Named in Advance

### The Problem

Lesson 5's own SE Lens named this exact risk without demonstrating it:
*"the next lesson (a list of positions over time) is exactly where
returning a shared mutable reference instead would silently corrupt
history."* This unit makes good on that, for real.

### The Concept, Isolated — Caused, Observed, Reverted

```python
class BuggyMachine:
    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0
        self._shared = {}

    def apply(self, command):
        if "x" in command: self.x = command["x"]
        if "y" in command: self.y = command["y"]
        if "z" in command: self.z = command["z"]

    def position_shared_bug(self):
        self._shared["x"] = self.x
        self._shared["y"] = self.y
        self._shared["z"] = self.z
        return self._shared  # same dict object, every call


commands = [{"x": 10.0, "y": 20.0}, {"x": 30.0}, {"z": -5.0}]

state = BuggyMachine()
points_buggy = [state.position_shared_bug()]
for c in commands:
    state.apply(c)
    points_buggy.append(state.position_shared_bug())
print("BUGGY:", points_buggy)
```
**Real output, run this session:**
```
BUGGY: [{'x': 30.0, 'y': 20.0, 'z': -5.0}, {'x': 30.0, 'y': 20.0, 'z': -5.0}, {'x': 30.0, 'y': 20.0, 'z': -5.0}, {'x': 30.0, 'y': 20.0, 'z': -5.0}]
```
**What this proves:** all four "different" points in the list are
**identical** — every one shows the *final* position, `{"x": 30.0, "y":
20.0, "z": -5.0}`, even the very first entry, which should have been the
origin. `points_buggy` is a Python `list` holding four references to
*the same one dict object* (`self._shared`), because
`position_shared_bug` returns that same object every time instead of
building a new one. Mutating `self._shared` on any later call retroactively
changes what *every* earlier list entry appears to hold, since they were
never independent copies to begin with — they're four names for one
object.

**The real `compute_path`, using the real `MachineState.position()`
(Lesson 5's fresh-dict-every-call design), run against the identical
commands, for direct comparison:**
```python
from core.parser import Parser
from core.path import compute_path

commands = Parser().parse("G0 X10 Y20\nX30\nG1 Z-5 F100")
print("CORRECT:", compute_path(commands))
```
```
CORRECT: [{'x': 0.0, 'y': 0.0, 'z': 0.0}, {'x': 10.0, 'y': 20.0, 'z': 0.0}, {'x': 30.0, 'y': 20.0, 'z': 0.0}, {'x': 30.0, 'y': 20.0, 'z': -5.0}]
```
Four genuinely distinct dicts, each capturing the real position at that
exact moment — because `position()` builds a brand-new dict literal every
single call, so no two calls can ever share one mutable object.

### Discard

The `BuggyMachine` class above is deleted now. It will not appear in the
project again — it existed only to prove, concretely, why Lesson 5's
`position()` was designed the way it was, one lesson before this list
existed to actually expose the danger.

### CS Lens

This is **aliasing** — two or more variables (here, four list elements)
referring to the exact same object in memory, rather than independent
copies with equal *values*. Python (like JavaScript, like most languages)
assigns and returns objects **by reference** for mutable types (`dict`,
`list`) — `points.append(some_dict)` stores a reference to `some_dict`,
not a snapshot of its current contents. Two references to the same
object will always show the object's *current* state, no matter which
reference you look through.

Also recognized in: this exact bug's JavaScript mirror (this project's
own future frontend lessons will hit the identical trap with objects
pushed into an array), C/C++ pointers aliasing the same memory, and any
"cache the same mutable object and hand it out repeatedly" pattern in any
language — a genuinely universal gotcha, not a Python-specific quirk.

### SE Lens

The fix costs literally nothing at the call site — `compute_path` didn't
need to change at all once `MachineState.position()` was already built
correctly in Lesson 5; the discipline of "always return a fresh copy from
an accessor" paid for itself a full lesson later, silently, by making an
entire category of bug simply impossible to write by accident here. This
is the real, concrete payoff of a design decision that looked like a
minor detail (`return {...}` instead of returning a stored attribute
directly) at the moment it was made.

---

## Concept Unit: A Route for the Whole Path

### The New Code

```python
@app.route("/api/path", methods=["POST"])
def path_program():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "program" not in body:
        return {"error": 'expected a JSON body like {"program": "G0 X10\\nX20"}'}, 400
    try:
        commands = Parser().parse(body["program"])
    except UnsupportedCodeError as error:
        return {"error": str(error)}, 400
    return {"points": compute_path(commands)}
```

### Mechanical Walkthrough

Identical validation/`try`/`except` shape to `/api/parse` and
`/api/simulate` — **(c) already established**, no new explanation owed.
The **only** difference from `/api/simulate` is the last two lines:
`compute_path(commands)` (returning every point) instead of manually
folding with a loop and returning one `position()` call. This is itself
worth naming: the *route* barely changed at all between "give me the
final answer" and "give me every step" — almost all of the real
difference lives inside `core/`, exactly where the fold-vs-scan design
decision belongs, not smeared across the HTTP layer.

### Commands and Real Output

```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/path" -Method Post -ContentType "application/json" -Body '{"program": "G0 X10 Y20\nX30\nG1 Z-5 F100"}'
```
```json
{
  "points": [
    { "x": 0.0,  "y": 0.0,  "z": 0.0 },
    { "x": 10.0, "y": 20.0, "z": 0.0 },
    { "x": 30.0, "y": 20.0, "z": 0.0 },
    { "x": 30.0, "y": 20.0, "z": -5.0 }
  ]
}
```
Four real, distinct points — the origin, then one after each command —
matching this lesson's own isolated `compute_path` test exactly.
Regression check — all five routes now live, confirmed still correct
together: `/api/status`, `/api/tokenize`, `/api/parse`, `/api/simulate`,
`/api/path`.

---

## Concept Unit: A Third Button, One More View of the Same Program

### The New Code

```html
<button id="path-button">Path (every point)</button>
```
```js
document.getElementById("path-button").addEventListener("click", () => {
    const program = document.getElementById("program-input").value;
    fetch("/api/path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ program: program }),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("parse-result").textContent = JSON.stringify(data, null, 2);
        });
});
```
**(c) Entirely already-established** — identical shape to the Simulate
button (Lesson 5), writing into the same shared result element for the
same reason (always show the most recently requested view, never a stale
one). No new walkthrough owed; the value of this unit is the page now
offering three consistent lenses (Parse / Simulate / Path) onto one typed
program, matching the three real backend functions built across Lessons
4–6.

### Commands and Run

```
((Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing).Content -match "path-button")
True
```
Open the page, type a program, and click all three buttons in turn —
Parse, Simulate, Path — to see the same underlying computation answer
three different real questions about it.

---

## Connect the Pieces

`"G0 X10 Y20\nX30\nG1 Z-5 F100"`, through all four stages built so far:

1. Tokenized and parsed into three commands, exactly as traced in Lessons
   4–5.
2. `compute_path` creates a fresh `MachineState`, records its starting
   position — `{"x": 0.0, "y": 0.0, "z": 0.0}` — as the first point.
3. After command 1 (`x=10, y=20`): second point,
   `{"x": 10.0, "y": 20.0, "z": 0.0}`.
4. After command 2 (`x=30` only): third point,
   `{"x": 30.0, "y": 20.0, "z": 0.0}` — `y` and `z` carried forward from
   the previous point, the same inheritance Lesson 5 proved, now visible
   as a distinct, real recorded step rather than folded away.
5. After command 3 (`z=-5`): fourth point,
   `{"x": 30.0, "y": 20.0, "z": -5.0}` — matching `/api/simulate`'s final
   answer exactly, as it must: the last point of a path and the fold's
   final answer are the same value, computed two different ways.
6. All four points are returned as JSON and displayed — the first data
   this project has produced that's actually shaped like something a
   visualizer (this project's next major goal) could draw a line through.

## What Breaks Without This

Already demonstrated in full, live, this lesson: reusing one shared,
mutated dict instead of building a fresh one every call collapses an
entire path down to four identical copies of the final position — shown
above with real output, then contrasted directly against the real,
correct `compute_path` result on the identical input.

## Exercises

1. Call `/api/path` with a single-command program, `"G0 X10"`. Confirm
   you get exactly **two** points (the origin, then after the one
   command), not one — and explain why from `compute_path`'s own first
   line (`points = [state.position()]`, before the loop even starts).
2. Call it with an empty program, `""`. Confirm you still get exactly
   **one** point — the origin — since the `for` loop never executes.
3. In a Python shell, create two separate lists by calling
   `compute_path` twice on the *same* commands. Confirm the two lists are
   `==` (equal contents) but not the same list object (`is` returns
   `False`) — the JavaScript-vs-Python mirror of Lesson 5's own
   `.get`/`in` distinction, now applied to whole lists instead of dict
   keys. *(Full standalone treatment: `../concepts/python-is-vs-equals.md`.)*

## Definition of Done

- [ ] `core/path.py`'s `compute_path` exists, imports nothing from
      `flask`.
- [ ] Run directly, no server: `compute_path(Parser().parse("G0 X10
      Y20\nX30\nG1 Z-5 F100"))` returns the four points shown in this
      lesson, in order.
- [ ] `POST /api/path` with the same program, through the running
      server, returns the same four points as real JSON.
- [ ] You reproduced the shared-dict bug yourself and saw all four points
      collapse to the same value, then confirmed the real `compute_path`
      doesn't have this problem.
- [ ] Opening the page and clicking Parse, Simulate, and Path in turn on
      the same program shows three consistent, correct views.
- [ ] A git commit exists explaining *why* (the engine can now produce a
      real toolpath — every point, not just the destination — the fourth
      pipeline stage, and a concrete, lived proof of why Lesson 5's
      fresh-dict design decision mattered).
