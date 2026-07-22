# Lesson 5: Giving the Machine a Memory

## What you will build

`core/machine.py`'s `MachineState` — an object holding the one thing
nothing in this project has tracked yet: **where the machine actually
is.** Feed it the commands Lesson 4's `Parser` produces, one at a time,
and after `"G0 X10 Y20\nX30\nG1 Z-5 F100"` it reports the real final
position: `{"x": 30.0, "y": 20.0, "z": -5.0}`. Wired to a new
`POST /api/simulate` route and a Simulate button. The transferable
problem: **a sequence of relative instructions only means something once
something keeps a running total** — "turn left, then forward 10, then
right" is meaningless without something tracking current heading and
position after each step.

## What you need to know first

Lesson 4: `Parser`/`_parse_block` producing one command dict per line,
each command only containing the axes that line actually mentioned. Lesson
4's `Counter` lab (instance state surviving across method calls) — this
lesson is the second real use of that same idea, this time load-bearing
for the project's actual purpose rather than demonstrated in isolation.

## Concepts cataloged from this lesson

Most of this lesson's mechanics are real 100% matches to Lessons 2 and 4
(fold, classes, dict-to-JSON, Flask validation, fetch/events) — reused, not
retaught. Only three genuinely new concepts:

`fold-vs-scan` · `python-dict-get-method` · `mutable-object-aliasing`

## Pipeline diagram

```
Text → Tokens → Commands → Machine State → Points → Picture
```
This lesson builds the **third** stage, `Commands → Machine State`, for
the first time. Concrete value carried through all three stages built so
far: `"X30"` (no axes but X) becomes the token `{"X": 30.0}` (Lesson 2/3),
becomes the command `{"motion": "G0", "x": 30.0}` (Lesson 4, inheriting
`G0`), becomes — this lesson — a machine whose `x` is now `30.0` while
`y` and `z` remain whatever they already were. `Points` and `Picture`
remain empty boxes; nothing yet records the *path* the machine took to
get there, only where it ended up.

---

## Concept Unit: A Fold, Not a Scan — Only the Final Position, on Purpose

*(Full standalone treatment: `../concepts/fold-vs-scan.md`.)*

### The Problem

A list of commands describes *movements*, each relative to wherever the
machine already is at that moment (as far as which axes are present —
Lesson 4's commands never restate an axis that didn't change). Nothing
so far combines them into an actual position. Given three commands that
each mention different axes, "where did the machine end up" requires
carrying forward whichever axes a later command *doesn't* mention.

### Reference Source, Read for Real This Session

`cnc/CNCEngine.ts` line 941, inside `ChannelState`'s constructor:
```ts
this.pos = { X: 0, Y: 0, Z: 0, A: 0, B: 0, C: 0 };
```
And lines 2011–2013 and 2025–2027, inside `_applyMotion` (already read in
full for Lesson 4's own research; only the position-update lines cited
here):
```ts
const nx = w.X != null ? av(ch.pos.X, w.X) : ch.pos.X;
const ny = w.Y != null ? av(ch.pos.Y, w.Y) : ch.pos.Y;
const nz = w.Z != null ? av(ch.pos.Z, w.Z) : ch.pos.Z;
// ...
ch.pos.X = nx;
ch.pos.Y = ny;
ch.pos.Z = nz;
```
The pattern this project ports: for each axis, if the current command
specifies it, use that value; otherwise, keep whatever the position
already was. **Named, deliberate deviation:** the reference's `av(cur, v)`
helper additionally branches on `ch.posMode === "G90"` (absolute) versus
incremental (`G91`, where a new value is *added* to the current position
rather than replacing it) and resolves macro-expression values via
`ev.resolve(v)`. Neither `G91` nor macro expressions exist in this project
yet — `core/parser.py`'s commands only ever carry plain numbers, and
absolute positioning (`G90`) is the reference's own real default
(confirmed in Lesson 4's own research: `if (!this.modals.absInc)
this.modals.absInc = "G90";`), so this lesson ports the **absolute-only**
case, honestly narrower than the reference's full `av`, not a hidden gap.

### The Concept, Isolated

No new isolated lab needed — this unit reuses Lesson 4's `Counter`
concept directly (an instance remembering state across calls), applied
to a genuinely new kind of state (a position, not a count). Per the
Repetition Rule, the mechanism is reused without a new demonstration；
what's new is the specific update rule, shown next against real, escalating
input.

```python
m = MachineState()
print(m.position())
m.apply({"motion": "G0", "x": 10.0})
print(m.position())
m.apply({"motion": "G0", "y": 20.0})
print(m.position())
m.apply({"motion": "G1", "z": -5.0})
print(m.position())
```
**Real output, run this session:**
```
{'x': 0.0, 'y': 0.0, 'z': 0.0}
{'x': 10.0, 'y': 0.0, 'z': 0.0}
{'x': 10.0, 'y': 20.0, 'z': 0.0}
{'x': 10.0, 'y': 20.0, 'z': -5.0}
```
Each call changes exactly one axis; the other two carry forward
unchanged from the previous call — the concrete proof this is a **fold**
(each step combines the previous accumulated result with one new piece of
input) and not a **scan** (which would additionally *record* every
intermediate result, not just return the latest one) — the distinction
named explicitly because the next lesson (Points, tracking the whole
path) needs exactly the scan version of this same logic, and conflating
the two here would blur that difference when it actually matters.

### Project Change

- **Reference Source** — `cnc/CNCEngine.ts` line 941 (initial position)
  and lines 2011–2013/2025–2027 (position update), cited and reconciled
  above, with the named absolute-only deviation.
- **Files affected** — new `cnc-service/core/machine.py`.
- **Change type** — add.
- **Location** — `core/`, alongside `lexer.py` and `parser.py`.
- **Dependencies** — none beyond the commands `Parser` already produces
  (Lesson 4) — `machine.py` doesn't import `parser.py` at all; it only
  knows about plain command dicts, a design choice explained in this
  unit's SE Lens.

### The New Code

```python
class MachineState:
    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0

    def apply(self, command):
        if "x" in command:
            self.x = command["x"]
        if "y" in command:
            self.y = command["y"]
        if "z" in command:
            self.z = command["z"]

    def position(self):
        return {"x": self.x, "y": self.y, "z": self.z}
```

### The Updated Project

The complete, new `core/machine.py` — nothing precedes it:
```python
class MachineState:
    def __init__(self):
        self.x = 0.0
        self.y = 0.0
        self.z = 0.0

    def apply(self, command):
        if "x" in command:
            self.x = command["x"]
        if "y" in command:
            self.y = command["y"]
        if "z" in command:
            self.z = command["z"]

    def position(self):
        return {"x": self.x, "y": self.y, "z": self.z}
```
As a whole: a `MachineState`, once created, starts at the origin — the
real reference's own initial position — and `apply()` moves it one
command at a time, `position()` reporting wherever it currently is.

### Mechanical Walkthrough

- `class MachineState: def __init__(self): self.x = 0.0; ...` — **(b)
  hard concept reappearing**, the exact `Counter`/`Parser` class shape
  from Lesson 4, applied to a third kind of instance state. `0.0` (a
  `float` literal) rather than `0` (an `int`) is a **(a) small, deliberate
  choice worth naming**: every position value this project will ever
  compute is a real-world measurement (millimeters or inches, a later
  lesson), which is always meaningfully fractional — starting as a float
  keeps every position value the same type from the very first instant,
  rather than silently becoming a float only the first time a
  non-whole-number command arrives.
- `def apply(self, command):` — **(a) first appearance** of this specific
  method name in this project, though the shape (`self`, one parameter)
  is already established; `command` is one dict, shaped exactly like
  Lesson 4's `Parser` output (`{"motion": ..., "x": ..., ...}`) — though,
  worth noting explicitly, `apply` never reads `command["motion"]` at all.
  This lesson's `MachineState` only cares about position, not which
  motion mode produced it — a real, deliberate scope limit: distinguishing
  a rapid move from a feed move only matters once this project computes
  *speed* or *path shape* (arcs vs. straight lines), neither of which
  exists yet.
- `if "x" in command: self.x = command["x"]` (and the `y`/`z` equivalents)
  — **(a) first appearance** of the actual fold logic: check whether this
  specific command mentions this specific axis; if so, overwrite; if not,
  `self.x` simply isn't touched this call, which — because it's an
  instance attribute, not a local variable — means it still holds
  whatever the *previous* call to `apply` last set it to. This single
  fact (an untouched instance attribute keeps its old value across calls)
  is the entire mechanism; there is no separate "carry forward" step to
  write.
- `def position(self): return {"x": self.x, "y": self.y, "z": self.z}` —
  **(a) first appearance** (full standalone treatment:
  `../concepts/mutable-object-aliasing.md`), deliberately building and
  returning a **new** dict every single call, rather than exposing
  `self.x`/`self.y`/`self.z` directly. Named as a real, forward-looking decision even though its
  full payoff isn't visible yet: the moment a *list* of positions exists
  (next lesson, tracking the whole path), appending the *same* mutable
  object to that list repeatedly, instead of calling `position()` fresh
  each time, would make every entry in that list silently point at one
  shared, ever-changing object — every past position would appear to
  retroactively become the current one. `position()` already returns a
  fresh dict, so that specific bug has no way to occur here; the next
  lesson will demonstrate exactly this failure on purpose, once there's a
  list for it to actually corrupt.

### CS Lens

Combining a sequence of inputs into one running, updated value — where
each step only needs the *previous* accumulated result and the current
input, never the whole history — is a **fold** (also `reduce`): the exact
same shape named in Lesson 2's own CS Lens for `tokenize`'s word-building
loop, now applied to a richer accumulated value (a position) instead of a
dict of words.

Also recognized in: a bank account balance (each transaction folds into a
running total, not a list of every past balance), a game character's
health bar, `sum()`/`functools.reduce` in Python itself, and — directly —
a real CNC controller's own current-position register, which is exactly
this: one place holding "where the tool tip is right now," updated, never
rewound, by each new block executed.

### SE Lens

`MachineState` deliberately has **no idea `Parser` or `core.parser`
exist** — it only knows the *shape* of a command dict (`"x"`/`"y"`/`"z"`
keys, optionally present). This is the same **dependency direction**
discipline from Lesson 2's `core`/`app` boundary, applied *within*
`core/` itself: `machine.py` doesn't import `parser.py`, so either module
could be tested, changed, or even replaced independently, as long as
whatever produces commands keeps producing this same shape. The real,
concrete alternative — `MachineState.apply` calling into `Parser`
directly, or expecting a `Parser`-specific object instead of a plain dict
— would work today, at the cost of coupling two things that don't
actually need to know about each other, making either one harder to
change alone later.

---

## Concept Unit: A Route That Runs a Whole Program to One Answer

### Project Change

- **Reference Source** — none directly; this route composes two already-
  ported pieces (`Parser`, `MachineState`), neither of which the
  reference exposes as a standalone HTTP endpoint (it's a browser-only
  simulator with no server at all, per `CURRICULUM.md`'s architecture).
- **Files affected** — `cnc-service/app.py` (modified).
- **Change type** — add.
- **Location** — directly below the existing `/api/parse` route.
- **Dependencies** — `core.parser.Parser`/`UnsupportedCodeError` (Lesson
  4), `core.machine.MachineState` (this lesson).

### The New Code

```python
@app.route("/api/simulate", methods=["POST"])
def simulate_program():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "program" not in body:
        return {"error": 'expected a JSON body like {"program": "G0 X10\\nX20"}'}, 400
    try:
        commands = Parser().parse(body["program"])
    except UnsupportedCodeError as error:
        return {"error": str(error)}, 400
    state = MachineState()
    for command in commands:
        state.apply(command)
    return {"position": state.position()}
```

### The Updated Project

The full, current `cnc-service/app.py`, nothing elided:
```python
from flask import Flask, render_template, request

from core.lexer import parse_line
from core.parser import Parser, UnsupportedCodeError
from core.machine import MachineState

app = Flask(__name__)

FAKE_MACHINE_STATUS = {
    "machine": "mill-3axis",
    "status": "idle",
    "position": {"x": 0.0, "y": 0.0, "z": 0.0},
}


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/status")
def get_status():
    return FAKE_MACHINE_STATUS


@app.route("/api/tokenize", methods=["POST"])
def tokenize_line():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "line" not in body:
        return {"error": 'expected a JSON body like {"line": "G0 X10"}'}, 400
    return parse_line(body["line"])


@app.route("/api/parse", methods=["POST"])
def parse_program():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "program" not in body:
        return {"error": 'expected a JSON body like {"program": "G0 X10\\nX20"}'}, 400
    try:
        commands = Parser().parse(body["program"])
    except UnsupportedCodeError as error:
        return {"error": str(error)}, 400
    return {"commands": commands}


@app.route("/api/simulate", methods=["POST"])
def simulate_program():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "program" not in body:
        return {"error": 'expected a JSON body like {"program": "G0 X10\\nX20"}'}, 400
    try:
        commands = Parser().parse(body["program"])
    except UnsupportedCodeError as error:
        return {"error": str(error)}, 400
    state = MachineState()
    for command in commands:
        state.apply(command)
    return {"position": state.position()}


if __name__ == "__main__":
    app.run(debug=True)
```
As a whole, `app.py` now offers two different views onto the same parsed
program: `/api/parse` shows *every* command; `/api/simulate` shows only
where they *end up* — the fold's final answer, deliberately separate from
the list that produced it.

### Mechanical Walkthrough

- The validation and `try`/`except` block — **(c) already
  established**, byte-for-byte the same shape as `/api/parse` (Lesson 4);
  no new explanation owed, per the Repetition Rule.
- `state = MachineState()` — **(b) reappearing** instantiation; **(a)
  worth naming explicitly, same reasoning as Lesson 4's fresh `Parser()`
  per request**: a new `MachineState` is created for *every* request,
  specifically so one user's simulated program never leaks its final
  position into a different, unrelated request.
- `for command in commands: state.apply(command)` — already-known basic
  Python `for` loop; `commands` is the exact same list `/api/parse`
  already returns — this route simply *does something further* with it
  rather than returning it directly.
- `return {"position": state.position()}` — **(b) reappearing**
  dict-to-JSON auto-conversion; `state.position()` — **(b) reappearing**
  from this lesson's own first unit, called exactly once, after every
  command has already been applied.

### CS Lens

Two different routes computing two different "views" over the identical
underlying computation (`Parser().parse(...)`, then folding) is the same
general shape as a database query that can return every row versus one
that returns only an aggregate (`SUM`, `MAX`) over them — the aggregate
doesn't require a fundamentally different computation, just discarding
the intermediate results and keeping only the final one.

### SE Lens

`/api/simulate` recomputes `Parser().parse(...)` from scratch rather than
accepting an already-parsed command list from a previous `/api/parse`
call — a real, deliberate simplicity choice: passing a full command list
over HTTP instead of the original program text would save re-parsing
work, at the cost of a client having to keep that list around correctly
and the server having to trust a client-supplied "already parsed" claim
instead of re-deriving it from the one, authoritative source (the actual
G-code text). Recomputing is slightly wasteful, honestly, but keeps
`/api/simulate` trustworthy on its own, single input — a real, small
performance cost accepted for a real, larger correctness guarantee, worth
revisiting only if profiling ever shows re-parsing is genuinely slow
(it isn't, at this project's current size).

### Commands and Real Output

Server restarted; real, live verification:
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/simulate" -Method Post -ContentType "application/json" -Body '{"program": "G0 X10 Y20\nX30\nG1 Z-5 F100"}'
```
```json
{ "position": { "x": 30.0, "y": 20.0, "z": -5.0 } }
```
Matches this lesson's very first isolated test, run against the real,
full pipeline (text → tokens → commands → machine state) instead of
`MachineState` alone. Regression check — an unsupported code still
correctly rejected through this new route too:
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/simulate" -Method Post -ContentType "application/json" -Body '{"program": "G17 X10"}'
# 400: {"error": "G17 is not a supported motion code yet (only G0-G3)"}
```

---

## Concept Unit: A Second Button, the Same Program

### The New Code

```html
<button id="simulate-button">Simulate (final position)</button>
```
```js
document.getElementById("simulate-button").addEventListener("click", () => {
    const program = document.getElementById("program-input").value;
    fetch("/api/simulate", {
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

### Mechanical Walkthrough

Every individual piece here — `addEventListener`, reading `.value`,
`fetch` with a `POST`/JSON body, `.then` chaining, `JSON.stringify` — is
**(c) already established**, identical in shape to the Parse button added
in Lesson 4. **(a) The one genuinely new decision**, worth naming
explicitly rather than silently copying: this button writes its result
into the *same* `<pre id="parse-result">` element the Parse button uses,
rather than a new, separate element — a deliberate choice so the page
always shows the result of whichever action was clicked *most recently*,
instead of two panels that could show stale, inconsistent results from
different program edits if a user changed the textarea and only clicked
one of the two buttons.

### Commands and Run

```
((Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing).Content -match "simulate-button")
True
```
Open `http://127.0.0.1:5000/`, edit the program, click Simulate, and
compare against clicking Parse on the same text.

---

## Connect the Pieces

The same value from Lesson 4's own "Connect the Pieces," carried one
stage further:

1. `"G0 X10 Y20\nX30\nG1 Z-5 F100"` is parsed into three commands exactly
   as Lesson 4 traced: `{"motion": "G0", "x": 10.0, "y": 20.0}`,
   `{"motion": "G0", "x": 30.0}`, `{"motion": "G1", "z": -5.0, "f":
   100.0}`.
2. A fresh `MachineState()` starts at `{"x": 0.0, "y": 0.0, "z": 0.0}`.
3. `apply(command 1)`: `x` → `10.0`, `y` → `20.0`, `z` untouched (stays
   `0.0`).
4. `apply(command 2)`: `x` → `30.0` (overwriting `10.0`); this command has
   no `"y"` or `"z"` key at all, so both stay exactly as command 1 left
   them.
5. `apply(command 3)`: `z` → `-5.0`; `x` and `y` untouched, staying `30.0`
   and `20.0`.
6. `position()` returns `{"x": 30.0, "y": 20.0, "z": -5.0}` — the real,
   verified final answer, matching both this lesson's isolated test and
   the live server response above.

## What Breaks Without This

*(Full standalone treatment of the `.get(key, default)` trap this
demonstrates: `../concepts/python-dict-get-method.md`.)*

Caused for real, this session — reverting `apply` to *always* overwrite
every axis, using `.get(..., 0.0)` instead of checking `in` first:
```python
class Broken:
    def __init__(self):
        self.x = self.y = self.z = 0.0

    def apply(self, command):
        self.x = command.get("x", 0.0)
        self.y = command.get("y", 0.0)
        self.z = command.get("z", 0.0)


b = Broken()
b.apply({"x": 10.0, "y": 20.0})
print(b.__dict__)
b.apply({"x": 30.0})  # command 2 from this lesson's own example
print(b.__dict__)
```
**Real output:**
```
{'x': 10.0, 'y': 20.0, 'z': 0.0}
{'x': 30.0, 'y': 0.0, 'z': 0.0}
```
Command 2 (`{"x": 30.0}`, no `"y"`) *reset* `y` to `0.0` instead of
leaving it at `20.0` — the entire inheritance behavior this lesson exists
to provide, silently gone. `.get(key, default)` treats "key absent" and
"key present with this default value" as indistinguishable, which is
exactly wrong here: an axis a command doesn't mention must stay
*whatever it already was*, not reset to any fixed value. Reverted back to
the real, correct `if "x" in command:` version immediately after
confirming this, this session.

## Exercises

1. Simulate `"G0 X10\nG0 Y20\nG0 Z30"` (three separate lines, one axis
   each). Predict the final position before running it, then confirm.
2. Simulate an empty program, `""`. Confirm the position comes back as
   the origin, `{"x": 0.0, "y": 0.0, "z": 0.0}`, and explain why, from
   `MachineState.__init__` alone (the loop in `simulate_program` never
   executes at all).
3. Call `/api/parse` and `/api/simulate` with the *same* program with an
   unsupported code in it (e.g. `"G0 X10\nG17"`). Confirm both reject it
   identically — proof that adding `/api/simulate` didn't create a second,
   possibly inconsistent, place where validation could drift.

## Definition of Done

- [ ] `core/machine.py`'s `MachineState` exists, imports nothing from
      `flask` or `core.parser`.
- [ ] Run directly, no server: applying the three Lesson 4 commands in
      order produces `{"x": 30.0, "y": 20.0, "z": -5.0}`.
- [ ] `POST /api/simulate` with the same program, through the running
      server, returns the same final position.
- [ ] The same unsupported-code rejection from Lesson 4 (`G17`, `M03`)
      still works identically through `/api/simulate`.
- [ ] You reproduced the `.get(key, default)` bug yourself and saw an
      untouched axis incorrectly reset, then confirmed the real `apply`
      doesn't have this problem.
- [ ] Opening the page, clicking Simulate, and comparing its result
      against Parse on the same program shows the expected relationship
      (one final position vs. every intermediate command).
- [ ] A git commit exists explaining *why* (the engine can now answer
      "where does the machine end up," the third real pipeline stage, a
      fold building on Lesson 4's commands the same way Lesson 4's parser
      built on Lesson 2/3's tokens).
