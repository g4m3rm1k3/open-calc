# Lesson 4: Turning Tokens Into Commands

## What you will build

`core/parser.py`'s `Parser` class — the first code in this project that
remembers something *across* multiple lines of a program. Given
`"G0 X10 Y20\nX30\nG1 Z-5 F100"`, it produces three structured commands:
`{"motion": "G0", "x": 10, "y": 20}`, `{"motion": "G0", "x": 30}` (no `G`
on this line — it *inherits* `G0` from the line before), and
`{"motion": "G1", "z": -5, "f": 100}`. Wired to a new `POST /api/parse`
route and a textarea on the page. The transferable problem: **G-code is
modal** — a value set on one line stays in effect on every following line
until something changes it — and modal state is really just the general
problem of **a sequence of events where each one's meaning depends on
everything that happened before it**, which shows up far beyond G-code.

## What you need to know first

Lesson 2: `tokenize()`/the word regex. Lesson 3: `strip_comment()` and
`parse_line()`, which this lesson calls per line. Lessons 1–3's Flask
routing, request validation, and `fetch` patterns, reused without
re-explanation.

## Concepts cataloged from this lesson

Every concept this lesson introduces now has its own isolated, runnable
entry in `../concepts/` (per `extraction.md`'s Concept Catalog Rule):

`sticky-state-modal-behavior` · `python-classes-instances` ·
`dict-as-lookup-table` · `python-f-strings` · `python-custom-exceptions` ·
`python-try-except` · `fail-fast-validation` ·
`exception-translation-at-boundary` · `html-textarea-element`

## Pipeline diagram

```
Text → Tokens → Commands → Machine State → Points → Picture
```
This lesson builds the **second** stage, `Tokens → Commands`, for the
first time. Concrete value carried through both stages built so far:
the text line `"X30"` (no `G` word at all) becomes the token
`{"X": 30.0}` (Lesson 2/3), which this lesson turns into the command
`{"motion": "G0", "x": 30.0}` — the `"motion"` key exists in the command
even though it existed nowhere in the token, because it was *carried over*
from a previous line. `Machine State`, `Points`, and `Picture` remain
empty boxes — nothing yet computes an actual resulting position from
these commands.

---

## Concept Unit: Modal State — What "G0" Really Means

*(Full standalone treatment: `../concepts/sticky-state-modal-behavior.md`
(the CS Lens below).)*

### The Problem

Real G-code almost never repeats itself. A rapid move to three points is
usually written:
```
G0 X10 Y20
X30
X40 Y50
```
not
```
G0 X10 Y20
G0 X30
G0 X40 Y50
```
The second and third lines have no `G`-word at all — and yet a real
machine still moves rapidly (`G0`) on those lines too, because `G0` was
declared "modal": once set, it stays the active motion mode until a
different motion `G`-code appears. Lesson 2/3's `parse_line` has no memory
between calls — every line is tokenized in total isolation — so nothing
built so far can answer "what motion mode is *this* line using?" for a
line with no `G`-word on it at all.

### Reference Source, Read for Real This Session

`cnc/CNCEngine.ts` lines 954 and 961, inside `ChannelState`'s constructor:
```ts
if (!this.modals.motion) this.modals.motion = "G00";
// ...
this.motionMode = this.modals.motion || "G00";
```
This is the real machine's power-on default: with no G-code processed
yet, the motion mode is already `"G00"` (rapid) — not "unset," not an
error state. And `cnc/CNCEngine.ts` lines 1735–1747, inside
`_applyGCode`, real (abridged to the four cases this lesson ports):
```ts
switch (Math.floor(g2)) {
  case 0:
    ch.motionMode = "G00";
    break;
  case 1:
    ch.motionMode = "G01";
    break;
  case 2:
    ch.motionMode = "G02";
    break;
  case 3:
    ch.motionMode = "G03";
    break;
  // ... (real cases 17, 70-76, 80, etc. — not ported this lesson)
```
`ch.motionMode` is a property on `ChannelState` — a real, stateful object
that persists across every line of a whole program's execution. Setting
it on one line and reading it again on the next line, unchanged, *is*
modal behavior — there's no separate "modal logic," just an assignment
that happens to live longer than one function call.

**Named, deliberate scope for this lesson:** the reference's real switch
handles many more `G`-codes (`17` for plane selection, `70`–`76` for
lathe canned cycles, `80` to cancel a cycle, and more) — none of those
exist in this project yet. Only cases `0`–`3` are ported. Any other
`G`-code, and every `M`-code, is a named, later lesson — not silently
ignored, as shown in this lesson's own error-handling unit below.

### CS Lens

A value that persists across repeated operations, updated by some inputs
and read by others, is **state** — the same general concept as an object's
instance variables (next unit), a database row, or a running total in a
loop. "Modal" is G-code's own domain word for a specific, very common
shape of state: *sticky* state, that stays whatever it was last set to
until explicitly changed, rather than resetting each time.

Also recognized in: a text editor's current font/bold setting (stays on
until you turn it off), a terminal's current working directory (`cd`
changes it for every command after, not just one), CSS's cascade and
inheritance, a video game's current weapon (stays equipped across many
turns until switched).

### SE Lens

The alternative — require every single line to restate its motion mode
explicitly — is real, valid G-code (some post-processors deliberately
generate it that way, precisely to avoid depending on modal memory). It's
rejected as *this project's* only supported input because real-world
G-code overwhelmingly relies on modal behavior, and a parser that can't
read it can't read real files, which is this whole curriculum's point.

---

## Concept Unit: A Class to Hold State Across Calls

*(Full standalone treatment: `../concepts/python-classes-instances.md`.)*

### The Problem

Lesson 2 and 3's functions (`tokenize`, `strip_comment`, `parse_line`) are
all **stateless** — call them twice with the same input, get the same
output, every time, with nothing remembered between calls. Modal state is
the opposite by definition: calling "parse this line" twice, on two
different lines, needs the *second* call to know what the *first* call
decided. A plain function has no way to remember anything between two
separate calls to it — something has to hold that memory, outside any
single function.

### The Concept, Isolated

```python
class Counter:
    def __init__(self):
        self.count = 0

    def increment(self):
        self.count += 1
        return self.count


a = Counter()
b = Counter()
print(a.increment())
print(a.increment())
print(b.increment())
```
**Real output, run this session:**
```
1
2
1
```
**What this proves:** `a` and `b` are two separate `Counter`
**instances** — each created by calling the class like a function
(`Counter()`). Each instance gets its *own* `self.count`, starting at `0`
independently. Calling `a.increment()` twice in a row shows `count`
persisting *across* those two separate calls (`1`, then `2`) — proving an
instance remembers state between method calls, unlike Lesson 2's
`tokenize`. Calling `b.increment()` afterward and getting `1`, not `3`,
proves that memory is *per-instance* — `b` never saw anything that
happened to `a`.

**Mechanical notes, first appearance of every piece:**
- `class Counter:` declares a new type. Everything indented under it is
  part of that type's definition.
- `def __init__(self):` is a special method Python calls automatically
  every time `Counter()` is called to create a new instance — its job is
  to set up that instance's starting state. The name `__init__` (with the
  double underscores) is a Python convention for methods the interpreter
  calls itself, rather than ones you call directly by name.
- `self` is the first parameter of every method on a class, and refers to
  *this specific instance* — the one the method was called on.
  `self.count = 0` means "on *this* instance specifically, store `0`
  under the name `count`" — not a shared value all `Counter`s see.
- `a = Counter()` **calls** the class, which Python recognizes as "create
  a new instance," automatically invoking `__init__(self)` with `self`
  bound to the brand-new, empty instance being built — you never pass
  `self` yourself; Python supplies it.
- `a.increment()` looks up `increment` on `a`'s class (`Counter`), and
  calls it with `self` automatically bound to `a`. Inside, `self.count +=
  1` reads and rewrites `a`'s own `count`, then `return self.count` hands
  back that instance's current value.

### Discard

This `Counter` example is deleted now. It will not appear in the project
again — it existed only to prove that a class instance remembers state
between separate method calls, and that two instances don't share it.

### Project Change

- **Reference Source** — none; classes are a Python language feature.
  `ChannelState` (the real reference's stateful object, cited above) is
  the *design* this project's own stateful `Parser` class is modeled
  after in spirit — a real, persistent object holding modal state — but
  `ChannelState` itself is a much larger object (position, spindle,
  tool, coolant, offsets, and more) this project hasn't built yet; only
  the "an object remembers modal state across calls" idea is ported here,
  not `ChannelState` itself.
- **Files affected** — new `cnc-service/core/parser.py`.
- **Change type** — add.
- **Location** — `core/`, alongside `lexer.py`.
- **Dependencies** — `core.lexer.parse_line`, from Lessons 2–3.

---

## Concept Unit: One Line at a Time, Remembering the Last Motion Mode

### The New Code

```python
from core.lexer import parse_line

_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}


class Parser:
    def __init__(self):
        self.current_motion = "G0"
```

### The Updated Project

The start of the new `core/parser.py` — nothing precedes it yet:
```python
from core.lexer import parse_line

_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}


class Parser:
    def __init__(self):
        self.current_motion = "G0"
```
As a whole so far: a `Parser` instance, once created, starts with
`"G0"` already active — matching the real reference's own power-on
default read above — ready to parse a first line even if that line never
mentions `G` at all.

### Mechanical Walkthrough

- `from core.lexer import parse_line` — **(b) reappearing** import syntax
  (Lesson 2), now reaching across two modules inside `core/`.
- `_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}` — already-known
  basic Python (dict literal); this is a **lookup table**, ported
  directly from the reference's `switch` statement above — each `case N`
  becomes one dict entry, an intentional, direct translation of one
  language's dispatch construct into another's data structure, not a
  reinterpretation.
- `class Parser:` / `def __init__(self):` — **(b) hard concept
  reappearing**, the exact mechanism just proven with `Counter`, applied
  now to something the project will actually use.
- `self.current_motion = "G0"` — **(b) reappearing** self-attribute
  assignment; the *value* `"G0"` is **(a) a first real-project instance**
  of the CS Lens above: a genuine port of the reference's real default,
  not an arbitrary starting value.

---

## Concept Unit: Recognizing a Command, Line by Line

*(Full standalone treatment: `../concepts/dict-as-lookup-table.md`
(`_MOTION_CODES`, ported from the reference's `switch`).)*

### Incremental Practice — an escalating sequence, run for real this session

```python
tests = [
    "G0 X10",
    "G0 X10\nY20",
    "G0 X10\nG1 X20",
    "G1 X10\nX20\nX30",
    "G0 X10\nG2 X20 Y20",
]
for t in tests:
    print(repr(t), "->", Parser().parse(t))
```
```
'G0 X10' -> [{'motion': 'G0', 'x': 10.0}]
'G0 X10\nY20' -> [{'motion': 'G0', 'x': 10.0}, {'motion': 'G0', 'y': 20.0}]
'G0 X10\nG1 X20' -> [{'motion': 'G0', 'x': 10.0}, {'motion': 'G1', 'x': 20.0}]
'G1 X10\nX20\nX30' -> [{'motion': 'G1', 'x': 10.0}, {'motion': 'G1', 'x': 20.0}, {'motion': 'G1', 'x': 30.0}]
'G0 X10\nG2 X20 Y20' -> [{'motion': 'G0', 'x': 10.0}, {'motion': 'G2', 'x': 20.0, 'y': 20.0}]
```
Each case changes exactly one thing: a second line with no `G` at all
(proving inheritance), an explicit mode switch, three consecutive lines
sharing one mode, and finally `G2` (arc mode) carried the same way — this
lesson only tracks *which* mode is active; it doesn't yet compute an arc's
actual geometry (a named gap, closed by a much later lesson once `I`/`J`
center words are supported).

### The New Code

```python
    def parse(self, text):
        commands = []
        for raw_line in text.split("\n"):
            words = parse_line(raw_line)["words"]
            if not words:
                continue
            commands.append(self._parse_block(words))
        return commands

    def _parse_block(self, words):
        if "G" in words:
            g_int = int(words["G"])
            if g_int in _MOTION_CODES:
                self.current_motion = _MOTION_CODES[g_int]

        command = {"motion": self.current_motion}
        for axis in ("X", "Y", "Z"):
            if axis in words:
                command[axis.lower()] = words[axis]
        if "F" in words:
            command["f"] = words["F"]
        return command
```
(The real, final version — with the "fail loudly" checks — is the next
unit's job; this version establishes the core inheritance behavior first,
against well-formed input only.)

### The Updated Project

The full `core/parser.py` at this point in the lesson, nothing elided:
```python
from core.lexer import parse_line

_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}


class Parser:
    def __init__(self):
        self.current_motion = "G0"

    def parse(self, text):
        commands = []
        for raw_line in text.split("\n"):
            words = parse_line(raw_line)["words"]
            if not words:
                continue
            commands.append(self._parse_block(words))
        return commands

    def _parse_block(self, words):
        if "G" in words:
            g_int = int(words["G"])
            if g_int in _MOTION_CODES:
                self.current_motion = _MOTION_CODES[g_int]

        command = {"motion": self.current_motion}
        for axis in ("X", "Y", "Z"):
            if axis in words:
                command[axis.lower()] = words[axis]
        if "F" in words:
            command["f"] = words["F"]
        return command
```
As a whole: `parse()` is the public entry point — feed it a whole
program's text, get back a list of commands. `_parse_block` is a private
helper (leading underscore, same convention as Lesson 2's `_WORD_RE`) that
figures out *one* line's command, given the words already extracted for
it, and updates `self.current_motion` if this line changes the mode.

### Mechanical Walkthrough

- `def parse(self, text):` — **(b) reappearing** method syntax; `text` is
  a whole multi-line program, not one line.
- `for raw_line in text.split("\n"):` — already-known basic Python
  (`str.split`), applied to newlines specifically — **(b) reappearing**
  from Lesson 1's own `python -m venv` unit, which used `\n`'s conceptual
  cousin only in prose; here it's real code splitting a program into
  individual lines for the first time in this project.
- `words = parse_line(raw_line)["words"]` — **(b) reappearing**
  (Lesson 3); this lesson only needs the `"words"` half of `parse_line`'s
  return value — `"comment"` is read and discarded here, a **named,
  deliberate simplification**: nothing in this project displays or acts
  on a comment yet, so there's nothing meaningful to do with it at this
  call site; the moment something does, this line is exactly where it
  would be threaded through.
- `if not words: continue` — **(b) reappearing** (`continue`, Lesson 2);
  skips blank lines and comment-only lines (both already return `{}` from
  `parse_line`, per Lessons 2–3), so they contribute no command at all,
  rather than an empty or garbage one.
- `commands.append(self._parse_block(words))` — already-known basic
  Python (`list.append`); `self._parse_block(...)` calls the method below
  *on this same instance*, so any state it updates (`self.current_motion`)
  is visible on the *next* loop iteration — this single fact is the entire
  mechanism modal state depends on.
- `if "G" in words: g_int = int(words["G"]); if g_int in _MOTION_CODES:
  self.current_motion = _MOTION_CODES[g_int]` — **(a) first appearance**
  of the actual modal-update logic: only *touch* `self.current_motion`
  when this line actually has a `G`-word *and* it's one of the four this
  project understands; otherwise, `self.current_motion` is left exactly
  as the previous line (or the constructor) last set it — the entire
  mechanism of "inheriting" a mode is simply *not overwriting* the
  variable, not some separate lookup-the-previous-value step.
- `command = {"motion": self.current_motion}` — **(a) first appearance**
  of reading `self.current_motion` back out — every command, whether or
  not its own line had a `G`-word, carries whichever mode is currently
  active.
- The `for axis in ("X", "Y", "Z"): if axis in words: command[axis.lower()]
  = words[axis]` and `if "F" in words: command["f"] = words["F"]` lines —
  **(c) already established** dict/loop patterns from Lesson 2, applied to
  a new dict being built up instead of `tokenize`'s.

### Execution Trace

The escalating-input table above shows final results per program, but
never `self.current_motion`'s own value carried line to line — worth
tracing directly for `"G1 X10\nX20\nX30"` (mode set once, inherited
twice), against one fresh `Parser()` (`self.current_motion` starts `"G0"`):

```
Before the loop: self.current_motion = "G0" (from __init__)

Line 1: "G1 X10" → words = {"G": 1.0, "X": 10.0}
  "G" in words? Yes. g_int=1. 1 in _MOTION_CODES? Yes.
  → self.current_motion = _MOTION_CODES[1] = "G1"
  command = {"motion": "G1"} → axis loop adds "x": 10.0
  commands = [{"motion": "G1", "x": 10.0}]

Line 2: "X20" → words = {"X": 20.0}   (no "G" word at all)
  "G" in words? No → self.current_motion is NOT touched, stays "G1"
  command = {"motion": "G1"} → axis loop adds "x": 20.0
  commands = [..., {"motion": "G1", "x": 20.0}]

Line 3: "X30" → words = {"X": 30.0}
  "G" in words? No → self.current_motion still "G1" (unchanged since Line 1)
  command = {"motion": "G1"} → axis loop adds "x": 30.0
  commands = [..., {"motion": "G1", "x": 30.0}]

Final: [{"motion":"G1","x":10.0}, {"motion":"G1","x":20.0}, {"motion":"G1","x":30.0}]
```

`self.current_motion` is written exactly once across all three
lines — Lines 2 and 3 each read the value Line 1 set, because nothing
between those calls ever resets it. This is the entire mechanism modal
inheritance depends on: the same instance attribute, read on every
iteration, written only when a line actually says to.

### CS Lens

`self.current_motion` surviving across many calls to `_parse_block` on
the same `Parser` instance is exactly the `Counter` lab's lesson, applied
for real: an object's instance attribute is memory that outlives any
single method call, shared only between calls made on that *same*
instance — which is precisely why `Parser()` is created fresh once per
program parsed (shown in the route, later this lesson), not reused across
unrelated programs. This is **encapsulation**: `current_motion` lives
*inside* the instance, reachable only through it, instead of as a bare
module-level variable every function could reach in and mutate directly —
the same reason `Counter.count` was only ever changed through
`increment()`, never poked at from outside.

Also recognized in: a bank account object's own balance (accessible only
through `deposit`/`withdraw`, never a public mutable field), a web
framework's per-request `session` object, and a database connection's own
internal cursor state — anywhere an object's data is paired with the
methods that are allowed to change it, rather than left exposed for
anything to reach in and mutate.

### SE Lens

An alternative design — a bare function taking and returning the current
motion mode explicitly (`parse_block(words, current_motion) ->
(command, new_motion)`) — would avoid a class entirely, staying just as
stateless as Lesson 2/3's functions, at the cost of every caller having to
manually thread that value through every call, in order, without mistakes.
The class trades a small amount of hidden state (you can't tell
`_parse_block`'s behavior purely from its own arguments anymore — it
depends on when it's called, on which instance) for removing that
bookkeeping from every caller. This is a real, honest cost — hidden state
is exactly what makes some bugs hard to reproduce — accepted here because
modal state is not incidental complexity being smuggled in; it is the
actual, real behavior of G-code itself.

---

## Concept Unit: Failing Loudly Instead of Doing the Wrong Thing Silently

*(Full standalone treatment: `../concepts/python-custom-exceptions.md`,
`../concepts/python-f-strings.md` (the error messages), and
`../concepts/fail-fast-validation.md` (the CS Lens below).)*

### The Problem

The version above silently ignores anything it doesn't recognize: an
unsupported `G`-code (say, `G17`, plane selection) just never updates
`self.current_motion`, and an `M`-code or any other letter is dropped with
no trace at all. That matches the real reference's own actual behavior —
its `switch` statement (cited above) has no `default` case, so an
unmatched `G` genuinely falls through and does nothing. **Named,
deliberate deviation from that real behavior, not an oversight:** this
project chooses to fail loudly instead, specifically because this parser
supports a deliberately narrow slice (`G0`–`G3`, `X`/`Y`/`Z`/`F` only) of
what real G-code contains, and a student typing a real file deserves to
know immediately and specifically which line used something this project
doesn't understand yet — not to have it silently produce a plausible-
looking but wrong result.

### The Concept, Isolated

```python
class TooColdError(Exception):
    pass


def check_temp(t):
    if t < 0:
        raise TooColdError(f"{t} is below freezing")
    return "ok"


try:
    check_temp(-5)
except TooColdError as e:
    print("caught:", e)

print(check_temp(10))
```
**Real output, run this session:**
```
caught: -5 is below freezing
ok
```
**What this proves:** `class TooColdError(Exception): pass` defines a
brand-new, custom error type — `(Exception)` means it **inherits** from
Python's built-in `Exception` class, so it automatically works everywhere
a normal exception does (can be raised, caught, carries a message);
`pass` means it adds nothing extra of its own — the *name* itself is the
entire point, making `except TooColdError` catch specifically this kind
of failure and no other. `raise TooColdError(...)` immediately stops
normal execution and jumps to the nearest matching `except` block. The
final `print(check_temp(10))` proves the function still returns normally
for valid input — raising is not the only path through it.

### Discard

This `TooColdError`/`check_temp` example is deleted now. It will not
appear in the project again.

### The New Code

```python
class UnsupportedCodeError(Exception):
    pass


class Parser:
    # ...
    def _parse_block(self, words):
        for letter in words:
            if letter not in ("G", "X", "Y", "Z", "F"):
                raise UnsupportedCodeError(f"{letter}-word is not supported yet")

        if "G" in words:
            g_value = words["G"]
            if isinstance(g_value, list):
                raise UnsupportedCodeError(
                    f"multiple G words on one line not supported yet: {g_value}"
                )
            g_int = int(g_value)
            if g_int not in _MOTION_CODES:
                raise UnsupportedCodeError(
                    f"G{g_int} is not a supported motion code yet (only G0-G3)"
                )
            self.current_motion = _MOTION_CODES[g_int]
        # ... rest unchanged
```

### The Updated Project

The full, final `core/parser.py` for this lesson, nothing elided:
```python
from core.lexer import parse_line

_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F")


class UnsupportedCodeError(Exception):
    pass


class Parser:
    def __init__(self):
        self.current_motion = "G0"

    def parse(self, text):
        commands = []
        for raw_line in text.split("\n"):
            words = parse_line(raw_line)["words"]
            if not words:
                continue
            commands.append(self._parse_block(words))
        return commands

    def _parse_block(self, words):
        for letter in words:
            if letter not in _SUPPORTED_WORDS:
                raise UnsupportedCodeError(f"{letter}-word is not supported yet")

        if "G" in words:
            g_value = words["G"]
            if isinstance(g_value, list):
                raise UnsupportedCodeError(
                    f"multiple G words on one line not supported yet: {g_value}"
                )
            g_int = int(g_value)
            if g_int not in _MOTION_CODES:
                raise UnsupportedCodeError(
                    f"G{g_int} is not a supported motion code yet (only G0-G3)"
                )
            self.current_motion = _MOTION_CODES[g_int]

        command = {"motion": self.current_motion}
        for axis in ("X", "Y", "Z"):
            if axis in words:
                command[axis.lower()] = words[axis]
        if "F" in words:
            command["f"] = words["F"]
        return command
```
As a whole: `_parse_block` now checks *every* word on a line against an
explicit allow-list before doing anything else, so an unsupported letter
or G-code stops the whole parse with a specific, named reason, rather than
producing a command that quietly omitted something the input actually
asked for.

### Mechanical Walkthrough (new lines only)

- `class UnsupportedCodeError(Exception): pass` — **(b) reappearing**,
  same shape as the disposable `TooColdError` lab, applied for real.
- `for letter in words: if letter not in _SUPPORTED_WORDS: raise ...` —
  **(a) first appearance** of validating *every key* of a dict up front,
  before any of them are used — `_SUPPORTED_WORDS` is the exact same kind
  of allow-list idea as `_MOTION_CODES`, applied to letters instead of
  G-code numbers.
- `if isinstance(g_value, list): raise ...` — **(b) reappearing**
  `isinstance` (Lesson 2's `tokenize`, in the opposite direction — there,
  a list meant "a repeated word, keep appending"; here, a repeated `G`
  word on one line is nonsensical for motion mode specifically, so it's
  rejected instead).
- `f"{letter}-word is not supported yet"` / the other two `raise` messages
  — **(b) hard concept reappearing**, **f-strings** (already-known basic
  Python likely, or covered whenever first seen in this curriculum);
  named here specifically because a good error message is itself a real,
  worthwhile design decision: each one states exactly *what* was found
  and *why* it's rejected, not a generic "parse error."

### Execution Trace

The validation loop against two real inputs — `words = {"G": 0.0, "X": 10.0}`
(all supported) and `words = {"G": 0.0, "M": 3.0}` (one unsupported):

```
words = {"G": 0.0, "X": 10.0}:
  letter="G": "G" in ("G","X","Y","Z","F")? Yes → not not in → continue loop
  letter="X": "X" in (...)? Yes → continue loop
  Loop exhausts both keys, nothing raised → falls through to the rest
  of _parse_block normally

words = {"G": 0.0, "M": 3.0}:
  letter="G": "G" in (...)? Yes → continue loop
  letter="M": "M" in ("G","X","Y","Z","F")? No
    → raise UnsupportedCodeError("M-word is not supported yet")
  → the loop never reaches a third key (there isn't one here), and
    _parse_block exits immediately via the exception — nothing after
    the loop ever runs for this input
```

The loop checks keys in dict iteration order (insertion order, in
Python) — `"M"` happens to be checked second here only because it was
the second word `tokenize()` inserted; the loop would raise on whichever
unsupported letter it reaches first, not necessarily the "worst" one.

### CS Lens

Rejecting input the moment it's recognized as invalid, rather than
processing it partway and producing a wrong-but-plausible result, is
**fail-fast validation** — the same principle Lesson 2's request-body
checks already applied at the HTTP boundary, now applied *inside* the
engine itself, at the boundary between "text a human might type" and
"structured data the rest of this project can trust."

Also recognized in: a compiler refusing to produce an executable from
code with a type error (rather than guessing and running anyway), a real
CNC controller alarming out on an unrecognized code rather than
attempting some default motion, database constraints rejecting an invalid
row at insert time rather than after it's already stored.

### SE Lens

This is a real, deliberate trade against the reference's own actual
behavior, named honestly rather than hidden: the reference silently
tolerates G-codes it doesn't implement (useful for *it*, since it aims to
run large, real, messy files end-to-end without stopping); this project,
at this early stage, chooses the opposite tradeoff — narrower support, but
zero silent gaps — because the goal right now is a student trusting every
result completely, not maximum file compatibility. As real G-code coverage
grows in later lessons, each newly-supported code moves from "rejected
loudly" to "handled correctly," never from "rejected" straight to
"silently ignored."

---

## Concept Unit: A Route That Turns an Exception Into an HTTP Response

*(Full standalone treatment: `../concepts/python-try-except.md` and
`../concepts/exception-translation-at-boundary.md` (the CS Lens below).)*

### The New Code

```python
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
```

### The Updated Project

The full, current `cnc-service/app.py`, nothing elided:
```python
from flask import Flask, render_template, request

from core.lexer import parse_line
from core.parser import Parser, UnsupportedCodeError

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


if __name__ == "__main__":
    app.run(debug=True)
```
As a whole, `app.py` now has four routes; this newest one is the first to
call code that can genuinely `raise`, and the first to translate a
Python-level failure into an HTTP-level one on purpose.

### Mechanical Walkthrough

- `Parser()` — **(b) reappearing** instantiation; a **fresh** instance is
  created for every single request — **(a) worth naming explicitly**: if
  one shared `Parser` were reused across requests, one user's program
  would leave its last motion mode active for the *next* unrelated
  request, a real, subtle cross-request state leak. Creating a new
  instance per request is what keeps each parse independent, the same
  guarantee `Counter`'s `a`/`b` independence proved earlier in this
  lesson, now load-bearing for correctness rather than just demonstrated.
- `try: commands = Parser().parse(body["program"]) except
  UnsupportedCodeError as error:` — **(a) first appearance** of
  `try`/`except` in this project. Code inside `try:` runs normally unless
  it raises; if it raises specifically an `UnsupportedCodeError` (or any
  subclass of it — none exist yet), execution jumps into the `except`
  block instead of crashing the whole request. `as error` binds the
  actual exception object to the name `error`, so `str(error)` (already-
  known basic Python string conversion) retrieves the exact message
  passed to `raise UnsupportedCodeError(...)` deep inside the parser.
- `return {"error": str(error)}, 400` — **(b) reappearing** tuple-return
  pattern (Lesson 2), turning an internal Python exception into the exact
  same shape of client-facing error this project has used since its first
  `POST` route.

### CS Lens

Catching one specific exception type and translating it into a
different-layer error response (an HTTP status, here) is the general
pattern of **exception translation at a boundary** — the code that knows
*how* to detect a problem (`core/parser.py`) is different from the code
that knows *how to tell a client about it* (`app.py`), and `try`/`except`
is the mechanism that lets those two concerns stay in their own layers
without either one needing to know about the other's format.

### SE Lens

This route deliberately catches `UnsupportedCodeError` **specifically** —
not a bare `except:` (which would also swallow real programming mistakes,
like a typo causing an `AttributeError`, and misreport them to the client
as if they were the user's fault). Catching a specific, named exception
type is what keeps a real bug in this project's own code from
masquerading as "your G-code is invalid" — a real, concrete failure mode
avoided by naming exactly what's expected to go wrong versus letting
everything else surface honestly (in debug mode, as a real traceback).

### Commands and Real Output

Server restarted; real, live verification:
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/parse" -Method Post -ContentType "application/json" -Body '{"program": "G0 X10 Y20\nX30\nG1 Z-5 F100"}'
```
```json
{
  "commands": [
    { "motion": "G0", "x": 10.0, "y": 20.0 },
    { "motion": "G0", "x": 30.0 },
    { "motion": "G1", "z": -5.0, "f": 100.0 }
  ]
}
```
```
Invoke-RestMethod ... -Body '{"program": "G17 X10"}'
# 400: {"error": "G17 is not a supported motion code yet (only G0-G3)"}

Invoke-RestMethod ... -Body '{"program": "M03 S1000"}'
# 400: {"error": "M-word is not supported yet"}
```
Two genuinely different rejections (an unsupported `G`-code; a completely
unsupported letter) each produce a specific, accurate message naming
exactly what was rejected and why.

---

## Concept Unit: A Multi-Line Textarea

*(Full standalone treatment: `../concepts/html-textarea-element.md`.)*

### The New Code

```html
<textarea id="program-input" rows="6" cols="40">G0 X10 Y20
X30
G1 Z-5 F100</textarea>
<button id="parse-button">Parse</button>
<pre id="parse-result"></pre>
```

### Mechanical Walkthrough

- `<textarea rows="6" cols="40">...</textarea>` — **(a) first
  appearance**: unlike `<input type="text">` (Lesson 2), a `<textarea>`
  accepts multiple lines and is sized in rows/columns of text rather than
  pixels. Its starting content is written *between* its opening and
  closing tags (not a `value="..."` attribute like `<input>`), which is
  exactly why the sample program above is typed literally inside it,
  newlines and all.
- The rest — `.value`, `addEventListener("click", ...)`,
  `fetch(..., {method: "POST", ...})` — **(c) already established**,
  identical pattern to Lesson 2/3's tokenize form, reused with a different
  field name (`program` instead of `line`) and a different result element.

### CS Lens / SE Lens

Same event-driven, POST-with-JSON-body patterns already taught twice; no
new lens owed for genuinely repeated shape, per the Repetition Rule — the
one-sentence restatement above is the correct amount for a routine reuse,
not a new full treatment.

### Commands and Run

```
((Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing).Content -match "parse-button")
True
```
Open `http://127.0.0.1:5000/` yourself, edit the textarea, click Parse.

---

## Connect the Pieces

`"G0 X10 Y20\nX30\nG1 Z-5 F100"`, traced through every stage built across
Lessons 2–4:

1. The textarea's three lines are sent as `{"program": "..."}` to
   `POST /api/parse`.
2. A fresh `Parser()` is created (`self.current_motion = "G0"`).
   `.parse(text)` splits it into three raw lines.
3. Line 1, `"G0 X10 Y20"`: `parse_line` (Lessons 2–3) strips no comment,
   tokenizes to `{"G": 0.0, "X": 10.0, "Y": 20.0}`. `_parse_block` sees
   `G` = `0`, sets `self.current_motion = "G0"` (no change), and returns
   `{"motion": "G0", "x": 10.0, "y": 20.0}`.
4. Line 2, `"X30"`: tokenizes to `{"X": 30.0}` — no `G` at all.
   `_parse_block` leaves `self.current_motion` untouched (still `"G0"`
   from the previous line) and returns `{"motion": "G0", "x": 30.0}` —
   the actual proof of modal inheritance, produced by code, not asserted.
5. Line 3, `"G1 Z-5 F100"`: tokenizes to `{"G": 1.0, "Z": -5.0, "F":
   100.0}`. `_parse_block` sees `G` = `1`, updates
   `self.current_motion = "G1"`, and returns
   `{"motion": "G1", "z": -5.0, "f": 100.0}`.
6. The three commands are returned as JSON, and the page displays exactly
   the real, verified output shown above.

## What Breaks Without This

Caused for real, this session — reverting the modal-update line to always
run unconditionally, even for unsupported codes, before the validation
check:
```python
# temporarily reordered, run directly, no server:
def broken_parse_block(self, words):
    if "G" in words:
        self.current_motion = _MOTION_CODES.get(int(words["G"]), self.current_motion)
    for letter in words:
        if letter not in _SUPPORTED_WORDS:
            raise UnsupportedCodeError(f"{letter}-word is not supported yet")
    # ...
```
**Real, run-this-session proof of the corruption, using `"G1 M3"` (a
valid motion code plus an unsupported word on the same line):**
```python
p = BrokenParser()
print("before:", p.current_motion)          # G0
try:
    p._parse_block({"G": 1.0, "M": 3.0})
except UnsupportedCodeError as e:
    print("raised:", e)                      # M-word is not supported yet
print("current_motion after the REJECTED line:", p.current_motion)  # G1 !
```
```
before: G0
raised: M-word is not supported yet
current_motion after the REJECTED line: G1
```
The whole line was rejected — the client gets a `400`, never sees a
command for it — and yet `current_motion` is now permanently `"G1"`,
because the mutation ran *before* the validation that ultimately rejected
the line. The *next* line, even a perfectly valid one with no `G`-word at
all, would now silently inherit a mode that was never actually accepted.
This is a real, subtle bug class: **validation must run before mutation**,
not after — the real, correct version (shown earlier in this lesson)
checks every word first and only updates `self.current_motion` once the
line is known-good, confirmed by the identical test against the real
`Parser` class producing no corruption:
```python
from core.parser import Parser, UnsupportedCodeError
p = Parser()
try:
    p._parse_block({"G": 1.0, "M": 3.0})
except UnsupportedCodeError as e:
    print("raised:", e)
print("current_motion (correctly still G0):", p.current_motion)
```
```
raised: M-word is not supported yet
current_motion (correctly still G0): G0
```

## Exercises

1. Send `"G2 X10 Y10 I5 J5"` — a real arc with center words. Confirm it
   raises `UnsupportedCodeError` naming `I`, and explain from this
   lesson's scope note why `I`/`J` aren't supported yet even though `G2`
   itself is recognized.
2. Send an empty program, `""`. Confirm `commands` comes back as an empty
   list `[]`, and trace why through `parse()`'s loop.
3. Create two `Parser()` instances yourself in a Python shell, call
   `.parse("G1 X10")` on the first one only, then call `.parse("X20")` on
   the *second* one. Predict the second call's motion mode before running
   it — this is the exact `Counter` `a`/`b` independence proof, applied to
   the real class.

## Definition of Done

- [ ] `core/parser.py`'s `Parser` exists, imports nothing from `flask`.
- [ ] `Parser().parse("G0 X10 Y20\nX30\nG1 Z-5 F100")`, run directly with
      no server, returns the three commands shown in this lesson, with
      line 2 correctly inheriting `"G0"`.
- [ ] `POST /api/parse` with an unsupported `G`-code and with an `M`-code
      both return `400` with a message naming exactly what was rejected.
- [ ] You reproduced the validation-ordering bug (mutating state before
      validating) yourself and understood why it's a real, subtle
      correctness bug, not just a style preference.
- [ ] Opening the page, editing the textarea, and clicking Parse shows
      real, correct commands for your own input.
- [ ] A git commit exists explaining *why* (the engine can now turn a
      real multi-line program into structured commands, tracking modal
      state the same way the real reference does, with unsupported codes
      failing loudly by name instead of silently doing nothing).
