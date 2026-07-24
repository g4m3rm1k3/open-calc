# Lesson 13: Codes That Can't Coexist

## What you will build

A second, independent semantic check: two motion codes — `G00`, `G01`,
`G02`, `G03` — in the same block, which no real machine can honor, since
each one claims to set the *same* thing (what kind of move this is) to a
different value at once. The feature needs no new route and no frontend
change at all — the actual subject is what that says about how Lesson
12's analyzer was built, and a real architectural choice: run *every*
check, rather than picking one.

## What you need to know first

`Lesson 12 - Semantic Analysis.md` — `Diagnostic`, `analyze_block`,
`analyze_program`, the real false-positive bug and why `G`/`M` codes were
excluded from the duplicate-address check. `Lesson 6`'s `RUNNERS`
dispatch table, contrasted here with a differently-shaped composition
problem.

---

## Concept Unit: a different kind of mistake

### The Problem

```
N10 G00 G01 X10 Y10
```

Lesson 12's `check_duplicate_addresses` — formerly `analyze_block`
itself — deliberately skips every `G` and `M` word, precisely because
`G90 G94` on one line is normal, correct G-code. That exclusion was the
right call for *that* rule, but it leaves this line completely
unchecked: `G00` (rapid positioning) and `G01` (linear feed move) aren't
independent settings the way `G90` and `G94` are — they're two different
answers to the exact same question, "what kind of move is this block."
Confirmed directly, against this exact line, with Lesson 12's code
exactly as it was left:

```python
check_duplicate_addresses(parse_block(tokenize_line("N10 G00 G01 X10 Y10")))
```

Actual output:

```
[]
```

### What This Proves

`check_duplicate_addresses` was never wrong — it was never meant to
catch this. `G00`/`G01` conflicting isn't a *duplicate address* problem;
it's a **modal group** problem: real G-code organizes codes into groups
where, by definition, only one member of the group can be active at a
time, and motion codes are exactly one such group. Catching this needs
its own rule, built around its own real knowledge — which specific
codes belong to that one group — not a generalization of the rule
already built.

---

## Concept Unit: a lookup set for a modal group

### The Problem

Something needs to know, concretely, which numeric `G` values belong to
the motion group, to check membership against.

### Project Change

- **Files affected** — `backend/gcode/analyzer.py`, existing file.
- **Change type** — add, a new module-level constant, between the two
  check functions.
- **Dependencies** — none new.

### The New Code — type this

```python
MOTION_CODES = {0, 1, 2, 3}
```

### The Updated Project — where this lives

This sits between the two check functions in `analyzer.py` — the next
unit shows exactly where.

### Mechanical Walkthrough
- `MOTION_CODES = {0, 1, 2, 3}` reuses set-literal syntax — the same curly-
brace construct as `valid_tokens = set()` from Lesson 8, here written
with actual starting members instead of built empty. `ALL_CAPS` naming
is new only as a convention, not a language rule: Python treats this
exactly like any other variable, but naming it in capitals signals — to
any reader, including this project's own future code — that it's meant
to be read, not reassigned, the same intent a real constant expresses in
languages that enforce it directly.

---

## Concept Unit: finding the motion words in one block

### The Problem

Given one block's `words`, something needs to pull out just the ones
that are `G` words *and* whose value is in `MOTION_CODES` — everything
else in the block is irrelevant to this specific check.

### Project Change

- **Files affected** — `backend/gcode/analyzer.py`, existing file.
- **Change type** — add, a new `check_motion_conflict` function, after
  `MOTION_CODES`.
- **Dependencies** — `MOTION_CODES` from the previous unit.

### The New Code — type this

```python
def check_motion_conflict(block: Block) -> list[Diagnostic]:
    motion_words = [word for word in block.words if word.letter == "G" and word.value in MOTION_CODES]

    if len(motion_words) > 1:
        codes = ", ".join(f"G{int(word.value):02d}" for word in motion_words)
        return [Diagnostic(
            line_number=block.line_number,
            message=f"Multiple motion codes in one block: {codes}",
        )]

    return []
```

### The Updated Project — where this lives

Now see both new pieces together, sitting between `check_duplicate_addresses`
and `analyze_block`:

```python
def check_duplicate_addresses(block: Block) -> list[Diagnostic]:
    diagnostics = []
    seen_letters = set()

    for word in block.words:
        if word.letter in ("G", "M"):
            continue
        if word.letter in seen_letters:
            diagnostics.append(Diagnostic(
                line_number=block.line_number,
                message=f"Address {word.letter} appears more than once in this block",
            ))
        seen_letters.add(word.letter)

    return diagnostics


MOTION_CODES = {0, 1, 2, 3}                                                       # ← new


def check_motion_conflict(block: Block) -> list[Diagnostic]:                     # ← new
    motion_words = [word for word in block.words if word.letter == "G" and word.value in MOTION_CODES]  # ← new

    if len(motion_words) > 1:                                                     # ← new
        codes = ", ".join(f"G{int(word.value):02d}" for word in motion_words)    # ← new
        return [Diagnostic(                                                       # ← new
            line_number=block.line_number,                                        # ← new
            message=f"Multiple motion codes in one block: {codes}",               # ← new
        )]                                                                         # ← new

    return []                                                                      # ← new
```

`check_duplicate_addresses` is completely untouched — this unit adds a
second, entirely independent check next to it, not a modification of the
first one.

### Mechanical Walkthrough
`[word for word in block.words if word.letter == "G" and word.value in
MOTION_CODES]` is this project's first list comprehension *with a
filter*: every earlier comprehension (`tokenize_program`,
`parse_program`) transformed every item, unconditionally. Adding `if
...` after the `for` clause keeps only the items where that condition is
- `true` — the exact same effect as a `for` loop with an `if`/`continue`
inside it, stated in one expression instead. `word.value in
MOTION_CODES` reuses set membership testing from Lesson 8. `if
len(motion_words) > 1:` reuses `.length`'s Python counterpart, `len()`,
already used in `tokenize_line`. `", ".join(f"G{int(word.value):02d}" for
word in motion_words)` is new on two counts: first, `f"G{int(word.value):02d}"
for word in motion_words`, with no surrounding `[]`, is a **generator
expression** — syntactically almost identical to a list comprehension,
but it produces values one at a time as `.join()` asks for them instead
of building a whole list first; handed directly to `.join()`, which only
ever needs to consume the values once, in order, building the whole list
first would be pure waste. Second, `:02d` inside the f-string is a
- **format spec** — `d` means "format as a decimal integer," `02` means
"pad with a leading zero to at least two digits wide" — confirmed
directly:

```python
value = 1.0
print(f"G{int(value):02d}")
```

Actual output:

```
G01
```

- — turning `1.0` into `"G01"`, not `"G1"`, matching real G-code
convention. `Diagnostic(...)` and the final `return []` both reuse
already-established shapes — one diagnostic when a conflict exists,
none when it doesn't.

### Run It

```python
check_motion_conflict(parse_block(tokenize_line("N10 G00 G01 X10 Y10")))
```

Actual output:

```
[Diagnostic(line_number=10, message='Multiple motion codes in one block: G00, G01')]
```

Confirmed directly, alongside a regression check against this project's
own real `sample.nc` — every one of its existing, correct lines,
including `N10 G90 G94`, still produces zero motion-conflict diagnostics,
since neither `90` nor `94` is in `MOTION_CODES`.

---

## Concept Unit: running every check, not picking one

### The Problem

Two independent check functions now exist. Something has to actually run
both of them against every block and combine whatever each one finds.

### Project Change

- **Files affected** — `backend/gcode/analyzer.py`, existing file.
- **Change type** — replace. `analyze_block` no longer contains
  duplicate-address logic directly — that moved to
  `check_duplicate_addresses` in the previous unit — and instead calls
  both check functions.
- **Dependencies** — `check_duplicate_addresses`, `check_motion_conflict`.

### The New Code — type this

```python
def analyze_block(block: Block) -> list[Diagnostic]:
    diagnostics = []
    diagnostics.extend(check_duplicate_addresses(block))
    diagnostics.extend(check_motion_conflict(block))
    return diagnostics
```

### The Updated Project — where this lives

This replaces what `analyze_block` used to be — Lesson 12's whole
function body — with three lines that call out to the two functions
built earlier in this lesson:

```python
def analyze_block(block: Block) -> list[Diagnostic]:
    diagnostics = []
    diagnostics.extend(check_duplicate_addresses(block))   # ← changed: was the duplicate-check loop itself
    diagnostics.extend(check_motion_conflict(block))       # ← new
    return diagnostics


def analyze_program(blocks: list[Block]) -> list[Diagnostic]:
    diagnostics = []
    for block in blocks:
        diagnostics.extend(analyze_block(block))
    return diagnostics
```

`analyze_program`, directly below it, is completely unchanged — it still
just calls `analyze_block` once per block, with no idea how many checks
that now runs, or what any of them look for.

### Mechanical Walkthrough

`diagnostics.extend(check_duplicate_addresses(block))` and
`diagnostics.extend(check_motion_conflict(block))` both reuse `.extend()`
from Lesson 12, at a new level: Lesson 12 used it to flatten *many
blocks'* diagnostics into one program-wide list; here it flattens *many
checks'* diagnostics into one block-wide list, the identical mechanism
solving a structurally identical problem one layer down.

### CS Lens — a different shape than `RUNNERS`, on purpose

Lesson 6's `RUNNERS` dictionary picks exactly *one* function to run,
selected by a key — `run_python` *or* `run_rust`, never both. This
lesson's `analyze_block` is the opposite composition: it runs *every*
check, unconditionally, every time, and combines all of their results.
Both are real, named patterns for attaching independent behavior without
tangling it together — a **dispatch table** selects one; what
`analyze_block` does here is closer to a **pipeline of independent
validators**, the same shape a real linter uses to run dozens of
unrelated rules against the same input and report everything wrong at
once, not just the first thing found.

### SE Lens — the actual cost of adding a third check

Adding a third rule later — say, checking for a feed rate (`F`) missing
on a `G01` move — means writing one new function, `check_missing_feed`,
and adding one line, `diagnostics.extend(check_missing_feed(block))`, to
`analyze_block`. Nothing about `check_duplicate_addresses`,
`check_motion_conflict`, `analyze_program`, the `/analyze` route, or the
frontend's Analyze panel needs to change at all — the same additive-only
property Lesson 6's `RUNNERS` was chosen for, now proven a second time in
a differently-shaped problem.

### Run It

```
POST /analyze?path=src/motion_conflict.nc →
{"path":"src/motion_conflict.nc","diagnostics":[
  {"line_number":10,"message":"Multiple motion codes in one block: G00, G01"}
]}

POST /analyze?path=src/sample.nc → {"path":"src/sample.nc","diagnostics":[]}
POST /analyze?path=src/duplicate_axis.nc → {"path":"src/duplicate_axis.nc","diagnostics":[
  {"line_number":10,"message":"Address X appears more than once in this block"}
]}
```

All three confirmed directly against the real running server — and
neither `backend/main.py` nor `index.html` needed a single line changed
to make this real: `/analyze` already returns whatever `analyze_program`
hands it, and the Analyze panel already renders whatever `diagnostics`
array comes back, exactly as generic as Lesson 12 left them.

---

## Connect the pieces

Clicking Analyze on `motion_conflict.nc` runs the exact same request
Lesson 12 built — nothing on the frontend knows a second check exists.
On the backend, `analyze_file` still calls `tokenize_program`,
`parse_program`, and `analyze_program`, unchanged. `analyze_program`
still calls `analyze_block` once per block, unchanged. Only
`analyze_block` itself is different: it now runs
`check_duplicate_addresses` *and* `check_motion_conflict` against every
block and flattens both results together with `.extend()`. Line 10 of
`motion_conflict.nc` — `G00 G01 X10 Y10` — passes the duplicate-address
check cleanly (`G` is excluded from it) and fails the motion-conflict
check (`G00` and `G01` are both motion codes), producing exactly one
diagnostic, which the Analyze panel displays exactly the way it already
displayed Lesson 12's duplicate-address diagnostic — because to that
panel, a `Diagnostic` is a `Diagnostic`, regardless of which check
produced it.

## What breaks without this

Already demonstrated concretely above, not hypothetically:
`check_duplicate_addresses` alone, run directly against
`"N10 G00 G01 X10 Y10"`, returns `[]` — confirmed real output, this
lesson's very first unit — a genuine motion conflict, completely
invisible to Lesson 12's code exactly as it was left.

## Exercises

1. Open `src/motion_conflict.nc` through the running app, click Analyze,
   and confirm the panel reports the real motion conflict on line 10.
2. Add a third motion code to the same line (`G02`, for instance) and
   confirm the message lists all three, in the order they appear.
3. Write your own `check_` function for a new rule of your choosing —
   for example, flagging any block with an `F` word but no `G01`/`G02`/
   `G03` motion code on the same line (a feed rate with nothing to
   apply it to) — and wire it into `analyze_block` following this
   lesson's exact pattern. Confirm it doesn't false-positive against
   `sample.nc` before trusting it.

## Definition of done

- [ ] You've run Analyze against `motion_conflict.nc` through the real
      app and confirmed the correct diagnostic appears
- [ ] You can explain why `check_duplicate_addresses` and
      `check_motion_conflict` needed to be two separate functions instead
      of one combined check
- [ ] You can explain the difference between `RUNNERS` (Lesson 6) and
      `analyze_block`'s two `.extend()` calls (this lesson) — same
      underlying goal, differently-shaped solution
- [ ] You can explain why this lesson required zero changes to
      `main.py` or `index.html`
- [ ] `git commit` this lesson's code with a message explaining why
