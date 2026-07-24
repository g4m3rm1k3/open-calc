# Lesson 41: A Blank Line Is Not the Same as an Empty One

**What you will build:** a new `Operations` tab in `cnc-web`, alongside
the existing Monaco `Code` editor (Lesson 35) — a read-only, structured
view of the same program: a `Program` container wrapping real
`Operation`s, each declaring its modal state (plane, WCS, spindle
direction, coolant, tool, SFM, chip-load-derived feed) once up front,
then a continuous `G X Y Z M F S` movement table interrupted only where
one of those fields actually changes. No reference counterpart exists
for this — `cnc-sim`'s own `trace` tab (`TraceHeader.jsx`/
`TraceLineList.jsx`) is real but much simpler: raw text lines, current-
line highlight, color by motion type only. This is new design, and the
transferable problem underneath it is bigger than the feature itself:
**a field you didn't check being empty is not proof the line was
blank.** That mistake shows up three separate times in this lesson, at
three different layers, and costs a real, working feature its own real
signal each time.

**What you need to know first:** `core/parser.py`'s modal-state model
and per-line dispatch (Lessons 4, 29, 32); `core/lexer.py`'s
`tokenize()`/`parse_line()` (Lessons 2, 3, 30); React `useState`/
`useEffect` and the `fetch`-body-`error`-field convention (Lessons 11,
26, 28); `core/tools.py`'s real, Mastercam-subset tool schema (Lessons
15, 17).

**Pipeline, so far:** `Text → Lexer (tokenize/parse_line) → Parser
(modal state, per-line command dict) → [Path / Simulate — unchanged] →
Operations view (new)`. One concrete line, carried through every stage
this lesson touches: the raw text `N1101` (nothing else on the line) —

```
Lexer.parse_line("N1101")
  → {"words": {}, "comment": "", "seq_n": 1101}
Parser._parse_block(words={}, comment="", seq_n=1101, raw="N1101",
                     has_real_seq_n=True, line_number=2)
  → {..., "seq_n": 1101, "has_real_seq_n": True, "line_number": 2, ...}
Operations view: buildOperations sees has_real_seq_n=True, seq_n=1101
  → starts a new operation group here, labeled "N1101"
```

---

## Concept Unit: A Regex That Only Extracts, Never Validates

### The Problem

`core/lexer.py`'s `tokenize()` already turns a cleaned G-code line into
a `{letter: number}` dict — but it deliberately skips `N` (and `O`):

```python
if letter in ("N", "O"):
    continue
```

That's correct for `tokenize()`'s own job (real G/M-code *data* words),
but it means a real, user-typed sequence number like `N1101` has never
been captured anywhere. The Operations view needs it — real N-numbers
are the signal a real machinist uses to mark a deliberate operation
boundary.

### Introduce the Concept in Isolation

Regex extraction with a capture group is not new to this curriculum —
`core/lexer.py`'s own `_KEYWORD_RE` (Lesson 30) and `strip_comment`
(Lesson 3) already use `re.compile`/`.search()`. This is the same
concept reapplied, so no new throwaway lab is needed — a brief
reminder instead: `re.search` scans for the *first* match anywhere in
the string and returns a `Match` object (or `None`), and `.group(1)`
reads back whatever the first parenthesized group captured.

```pycon
>>> import re
>>> m = re.compile(r"\bN(\d+)\b", re.IGNORECASE).search("N1101 G21")
>>> m.group(1)
'1101'
```

That single line proves the whole mechanism: the pattern finds `N`
followed by digits anywhere in a real line, and `.group(1)` hands back
just the digits, as a string.

### Project Change

- **Reference Source** — none. Real N-numbers were never captured by
  the reference either; this is new, project-specific data the
  Operations view needs that nothing upstream of it required before.
- **Files affected** — `cnc-service/core/lexer.py`, modified.
- **Change type** — add.
- **Location** — a new, standalone function placed right after the
  existing `_KEYWORD_RE` definition, and one new key added to
  `parse_line`'s existing return dict.
- **Dependencies** — none beyond the already-imported `re` module.

### The New Code

```python
_SEQ_N_RE = re.compile(r"\bN(\d+)\b", re.IGNORECASE)

def extract_seq_n(line):
    match = _SEQ_N_RE.search(line)
    return int(match.group(1)) if match else None
```

### The Updated Project

`parse_line` is the only caller, and it's a small, complete function —
shown whole, not elided:

```python
def parse_line(line):
    clean, comment = strip_comment(line)
    return {"words": tokenize(clean), "comment": comment, "seq_n": extract_seq_n(clean)}
    #                                                     ^ new
```

`parse_line` now returns three keys instead of two: the existing
`words`/`comment`, plus `seq_n` — `None` on any line without a real
N-word, a real `int` on any line that has one. Nothing about
`tokenize()` itself changed, so every existing caller of `words`/
`comment` is completely unaffected; this is purely additive.

### Mechanical Walkthrough

- `re.compile(r"\bN(\d+)\b", re.IGNORECASE)` — **reappearing** (Lesson
  30's `_KEYWORD_RE`): compiles a pattern once, at module load, instead
  of on every call. `\b` is a word boundary (so `N` inside a longer
  token, if one existed, wouldn't match); `N` is literal; `(\d+)` is a
  capture group matching one or more digits; `re.IGNORECASE` accepts a
  lowercase `n` too, matching this project's existing tolerance for
  case elsewhere in the lexer.
- `_SEQ_N_RE.search(line)` — **reappearing**: scans the whole string
  for the first match, returns a `Match` or `None`.
- `int(match.group(1)) if match else None` — **reappearing** (a
  conditional expression, already used throughout `core/parser.py`):
  `match.group(1)` is the captured digit string; `int(...)` converts
  it; the ternary supplies `None` when there was no match at all.

### CS Lens

Extraction without validation is a narrower, cheaper job than parsing —
this function doesn't care whether the rest of the line is valid
G-code, only whether an `N`-number exists anywhere in it. Keeping that
job separate from `tokenize()`'s real validation (`_SUPPORTED_WORDS`)
is the same separation-of-concerns idea already named in this
curriculum (Lesson 29's hardcoded-vs-data-driven dispatch is a
different instance of the same general principle: don't make one
function responsible for two independent decisions).

### SE Lens

The alternative was folding `N` back into `tokenize()`'s own word dict
— rejected, because `_SUPPORTED_WORDS` validation would then either
need to special-case `N`, or every caller of `tokenize()` (there are
several, including the still-passing test suite) would suddenly see a
new key it never asked for. A separate, additive function costs one
extra dict key on the return value and touches zero existing call
sites — the real tradeoff being avoided is a change to `tokenize()`'s
contract for the sake of one new consumer.

### Commands

None yet — this function has no standalone entry point; it's exercised
through `parse_line`, next.

### Run It

```pycon
>>> from core.lexer import parse_line
>>> parse_line("N1101")
{'words': {}, 'comment': '', 'seq_n': 1101}
>>> parse_line("G21 G90 G17")
{'words': {'G': [21, 90, 17]}, 'comment': '', 'seq_n': None}
```

Real output, both cases: a bare N-number line now reports `seq_n:
1101` with empty `words`; an ordinary line with no N-word reports
`seq_n: None`. This is the exact input `core/parser.py`'s loop reads
next.

---

## Concept Unit: A Field You Didn't Check Is Not Proof the Line Was Blank

### The Problem

`core/parser.py`'s main loop decided whether a line was worth turning
into a command like this:

```python
words = parse_line(stripped)["words"]
if not words:
    continue
```

A truly blank line has empty `words` — correctly skipped. But so does a
line that's *only* a comment (`(Start op 2)`) or *only* a real N-number
(`N1101`) — both have empty `words` too, for a completely different
reason. The check only ever looked at one field. It couldn't tell "this
line has nothing" apart from "this line has something, just not in the
one field I checked" — and silently treated both the same way. That's
exactly what happened live, this session: a real fixture (`O0003.nc`)
had two bare `N1101`/`N2101` lines, both were dropped before ever
reaching the frontend, and every real N-number the file actually had
vanished with them.

### Project Change

- **Reference Source** — none; this loop's original one-field check
  predates this feature and was never wrong for the reference's own
  needs (it never needed a comment-only or N-only line to survive).
- **Files affected** — `cnc-service/core/parser.py`, modified
  (`Parser.parse`).
- **Change type** — refactor (a stricter condition; the same loop, more
  cases considered before skipping).
- **Location** — inside `Parser.parse`'s `for` loop, right after
  `parse_line` is called.
- **Dependencies** — the previous unit's new `seq_n` key.

### The New Code

```python
if not words and not comment and real_seq_n is None:
    continue
```

### The Updated Project

```python
def parse(self, text):
    commands = []
    for line_number, raw_line in enumerate(text.split("\n"), start=1):
        stripped = raw_line.strip()
        skip = stripped.startswith("/")
        if skip:
            stripped = stripped[1:].strip()
        parsed = parse_line(stripped)
        words = parsed["words"]
        comment = parsed["comment"]
        real_seq_n = parsed["seq_n"]
        if not words and not comment and real_seq_n is None:  # ← was: `if not words:`
            continue
        if skip and self.optional_skip_enabled:
            continue
        if real_seq_n is not None:
            seq_n = real_seq_n
            self._next_seq_n = real_seq_n + 1
        else:
            seq_n = self._next_seq_n
            self._next_seq_n += 1
        commands.append(
            self._parse_block(
                words, comment, seq_n, raw_line, real_seq_n is not None, line_number
            )
        )
    return commands
```

The loop now also tracks `line_number` (via `enumerate(..., start=1)`,
the real, 1-indexed position in the source text — separate from
`seq_n`, covered in the next unit) and unpacks all three of
`parse_line`'s keys before deciding anything. A line only gets skipped
now if it's blank in *every* one of the three ways that matter; any one
real signal — words, a comment, or a real N-number — is enough to keep
it.

### Mechanical Walkthrough
- `enumerate(text.split("\n"), start=1)` — **first appearance** in this
  file (though `enumerate` itself is ordinary Python): pairs each
  element of the split-on-newline list with a running count starting at
- 1, not 0 — chosen deliberately so `line_number` matches a real
  editor's own 1-indexed line display.
- `not words and not comment and real_seq_n is None` — **first
  appearance of this exact three-way condition**: a boolean `and` chain
  (already-established syntax), but the *shape* — checking three
  independent signals before concluding "nothing here" — is the new
  idea, not the operators themselves.

### CS Lens

This is a boundary condition in a filter predicate: the function
answers "should this element survive?", and the bug was answering that
question using an incomplete view of the element's actual state. The
same shape of mistake — checking one field of a value and treating the
rest as if it agreed — recurs constantly: a null-check on one property
of an object that has three ways to be "present"; a cache invalidation
rule keyed on one field of a composite cache key; a permissions check
that verifies one role and assumes the others don't matter. The fix in
every case is the same: enumerate every independent way the thing you
care about could be true, and require all of them to be false before
concluding it's absent.

### SE Lens

The alternative — a `has_content(words, comment, real_seq_n)` helper
function — was considered and rejected here: three fields, checked
once, in one place, didn't earn the indirection of a named function
yet. That's a real, honest judgment call, not a rule; if a fourth
"does this line have anything real on it" signal is ever added, this
inline condition should become a named function instead of growing a
fourth `and` clause silently.

### Commands

None new.

### Run It

```pycon
>>> from core.parser import Parser
>>> with open("O0003.nc") as f:
...     program = f.read()
>>> commands = Parser().parse(program)
>>> [(c["line_number"], c["seq_n"], c["has_real_seq_n"]) for c in commands if c["has_real_seq_n"]]
[(2, 1101, True), (15, 2101, True)]
>>> len(commands)
26
```

Real output, against the real fixture: both previously-dropped lines
(2 and 15) now survive, correctly flagged `has_real_seq_n: True`, and
the total command count went from 24 (broken) to 26.

---

## Concept Unit: A Counter That Yields to Real, Authored Values

### The Problem

Every command needs *some* `seq_n` to group under — the Operations view
can't have gaps. But real files are sparse: `O0003.nc` has exactly two
real N-words in 26 real lines. Something has to fill in the rest
without colliding with a real, authored value that shows up later in
the same file.

### Project Change

- **Reference Source** — none; ported nothing, since the reference
  never tracked N-numbers at all.
- **Files affected** — `cnc-service/core/parser.py` (`Parser.__init__`,
  `Parser.parse`).
- **Change type** — add.
- **Location** — a new instance field in `__init__`; the counter logic
  sits in the same `parse` loop shown in the previous unit.
- **Dependencies** — none beyond the previous two units.

### The New Code

```python
self._next_seq_n = 1
```

```python
if real_seq_n is not None:
    seq_n = real_seq_n
    self._next_seq_n = real_seq_n + 1
else:
    seq_n = self._next_seq_n
    self._next_seq_n += 1
```

### The Updated Project

Already shown whole in the previous unit's Updated Project block (the
`if real_seq_n is not None: ... else: ...` lines are the same lines);
repeating the trace here instead, since this is stateful logic (the
Concept Unit sequence's own rule: a counter carrying state across
iterations gets a real execution trace, not just a code listing).

**Execution trace, first 4 real commands of `O0003.nc`:**

```
Line 1 "O0003 (CIRCULAR POCKET)": real_seq_n=None → seq_n=1,    _next_seq_n: 1 → 2
Line 2 "N1101":                   real_seq_n=1101 → seq_n=1101, _next_seq_n: 2 → 1102
Line 3 "G21 G90 G17":             real_seq_n=None → seq_n=1102, _next_seq_n: 1102 → 1103
Line 4 "T1 M06 G43 H1":           real_seq_n=None → seq_n=1103, _next_seq_n: 1103 → 1104
```

Line 2's real `N1101` doesn't just get used for that line — it
overwrites the counter itself (`self._next_seq_n = real_seq_n + 1`), so
every synthetic value from that point on continues from `1102`, not
from wherever the auto-counter had already reached. A real, authored
value always wins; the counter exists only to cover the gaps around it.

### Mechanical Walkthrough

- `self._next_seq_n = 1` — plain instance-attribute assignment,
  already-established syntax (Lesson 4's own `__init__`).
- `if real_seq_n is not None:` — **reappearing**: `is not None`, the
  correct way to test "did this optional value get supplied" without
  misfiring on a real, falsy-but-present value (already established
  where this project checks `css_speed_max`).

### CS Lens

This is the same idea a database's auto-increment primary key uses
when a row is inserted with an explicit ID: the sequence generator
doesn't just accept the explicit value, it fast-forwards its own
internal counter past it, so the *next* auto-generated row can never
collide with an ID a human already claimed. Also recognized in: Git's
own commit-hash-vs-branch-pointer relationship, DNS zone file serial
numbers (must increase, humans can bump them by hand), and any queue
that accepts both auto-assigned and client-supplied message IDs.

### SE Lens

The alternative — never trusting real N-words at all, always
generating a fresh sequential number — was seriously considered this
session (a real, sharp disagreement, resolved only after directly
re-confirming what "the user can override it" was actually supposed to
mean). It would have been simpler code, but it throws away exactly the
signal a real machinist deliberately put in the file. The tradeoff kept
here is real: correctness for the common case (sparse or absent
N-numbers) costs a stateful counter that has to be reasoned about
across the whole file, not just line by line.

### Commands

None new.

### Run It

Already shown in the previous unit's Run It block — the same
`Parser().parse(program)` call exercises this counter.

---

## Concept Unit: Grouping by the Last Real Key Seen, Not Raw Equality

### The Problem

`cnc-web`'s Operations view needs to turn a flat command list into
operation groups. Given real N-numbers exist, the obvious-looking
approach — group consecutive commands that share the same `seq_n` — is
wrong, and it produced a real, visible bug: a dozen fragmented
"operations," one per line, instead of two. The reason: only 2 of the
26 commands have a *real* `seq_n`; the other 24 each got a unique,
auto-generated value from the previous unit's counter, so no two of
them are ever equal to each other. Comparing raw `seq_n` values treats
every synthetic filler line as its own distinct group.

### Project Change

- **Reference Source** — none; this is new grouping logic with nothing
  to port.
- **Files affected** — `cnc-web/src/BlockList.tsx`, new file
  (`buildOperations` function).
- **Change type** — add.
- **Location** — module-level function, called once from `BlockList`.
- **Dependencies** — `has_real_seq_n`/`seq_n` from the backend units
  above.

### The New Code

```ts
let currentKey: number | null = null;
for (const command of commands) {
  if (command.has_real_seq_n && command.seq_n !== currentKey) {
    currentKey = command.seq_n;
    groups.push([command]);
  } else if (groups.length === 0) {
    groups.push([command]);
  } else {
    groups[groups.length - 1].push(command);
  }
}
```

### The Updated Project

```ts
function buildOperations(commands: Command[], hasRealSeqNumbers: boolean): Command[][] {
  const groups: Command[][] = [];

  if (hasRealSeqNumbers) {
    let currentKey: number | null = null;               // ← new
    for (const command of commands) {                   // ← new
      if (command.has_real_seq_n && command.seq_n !== currentKey) {  // ← new
        currentKey = command.seq_n;                      // ← new
        groups.push([command]);                          // ← new
      } else if (groups.length === 0) {                  // ← new
        groups.push([command]);                          // ← new
      } else {                                           // ← new
        groups[groups.length - 1].push(command);         // ← new
      }                                                  // ← new
    }                                                     // ← new
    return groups;                                        // ← new
  }

  // No real N-words to group by: fall back to tool-change/marker-comment
  // triggers (unchanged from the version reached earlier this session).
  let preamble: Command[] = [];
  for (const command of commands) {
    const isTrigger = isCommentOnly(command) || hasToolChange(command.words);
    if (isTrigger) {
      groups.push([...preamble, command]);
      preamble = [];
    } else if (groups.length === 0) {
      preamble.push(command);
    } else {
      groups[groups.length - 1].push(command);
    }
  }
  if (preamble.length > 0) {
    groups.push(preamble);
  }
  return groups;
}
```

`buildOperations` now branches on whether the program has *any* real
N-word anywhere (`hasRealSeqNumbers`, computed once by the caller): if
it does, real N-numbers are the only grouping signal used, sticky
across every non-real line in between; if it doesn't, the fallback
(unchanged) groups by tool change or a standalone comment instead.

### Mechanical Walkthrough
**Execution trace**, first 6 commands of `O0003.nc` (`hasRealSeqNumbers
= true`), `currentKey` starting `null`:

```
c1 (line 1, comment, has_real=false, seq_n=1):
  has_real false → skip first branch; groups.length===0 → new group [c1]
c2 (line 2, "N1101", has_real=true, seq_n=1101):
  has_real true, 1101 !== null → currentKey=1101, new group [c2]
c3 (line 3, "G21 G90 G17", has_real=false, seq_n=1102):
  has_real false → not first branch; groups.length>0 → push onto last group
  groups: [[c1], [c2, c3]]
c4 (line 4, "T1 M06...", has_real=false): → pushed onto same group
c5..: → pushed onto same group, until...
c_at_line_15 ("N2101", has_real=true, seq_n=2101):
  has_real true, 2101 !== 1101 → currentKey=2101, new group started
```

The key insight the trace makes visible: `c1` through the line right
before `N2101` all land in exactly **one** group, even though 23 of
- them carry 23 different, mutually-unequal `seq_n` values — because the
condition that starts a new group only fires on a *real* N-word whose
value differs from the current key, never on a synthetic one.

### CS Lens

This is run-length-style grouping (the same family as a classic
"group consecutive equal elements" reduce), but keyed on a *derived*,
sticky value rather than the raw element itself — closer to SQL's
`LAG()` window function pattern ("compare this row to the last row
that mattered, not the literally previous row") than a plain
`groupBy`. Also recognized in: modal state itself (a G-code's own
plane/WCS/coolant mode persists until a line explicitly changes it,
exactly the same "carry forward until a real change" shape); terminal
scrollback grouping consecutive identical log lines; video codecs'
keyframe-vs-delta-frame structure (a keyframe is the "real" marker,
every frame after it is diffed against it, not against raw frame
equality).

### SE Lens

The alternative that was actually implemented, briefly, mid-session —
grouping only by tool change, treating real N-numbers as pure display
data with zero effect on structure — is a real, defensible design (it
matches "in 20 years, I've never seen every line numbered"). It was
reverted specifically because it was the wrong reading of that same
feedback: *sparse* N-numbers are still real, deliberate, authored
signal, not noise to be ignored. The cost being paid for the version
that's actually here is a second, distinct code path (`hasRealSeqNumbers
? ... : ...`) rather than one uniform rule — a real maintenance
surface, honestly named.

### Concept File

The general "carry forward until explicitly changed" idea behind
`currentKey` is already cataloged: `concepts/sticky-state-modal-
behavior.md`. What's genuinely new here — a distinct application, not
just a restatement, per the Concept Catalog Rule's 100%-match test — is
using that sticky value to decide *array-partition boundaries*, not to
drive a read/format operation. That specific application now has its
own file: `concepts/group-consecutive-elements-by-a-sticky-key.md`,
prerequisite `sticky-state-modal-behavior.md`, with its own isolated,
project-independent example and Try It Yourself section.

### Commands

None new — verified via `npx tsc --noEmit` (frontend) and the direct
Python calls already shown, not a browser session, per this session's
own cost constraint.

### Run It

```pycon
# Backend confirms the real data this algorithm consumes:
>>> len(commands); [c["has_real_seq_n"] for c in commands].count(True)
26
2
```

The frontend side of this wasn't re-verified live in a browser this
session (see Closing) — `tsc --noEmit` passed clean, and the algorithm
was hand-traced above against the real backend output.

---

## Concept Unit: Declared Once, Re-Emitted Only on Change

### The Problem

Once an operation's commands are grouped, its modal state (plane, WCS,
rotation, coolant) needs to be shown once, up front — not repeated on
every line of the movement table below it, and not silently dropped
when it changes again mid-operation.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx` (`buildOperationRuns`).
- **Change type** — add.
- **Location** — module-level function, called once per operation from
  `OperationBlock`.
- **Dependencies** — the `declared` snapshot (the state right before
  the operation's first real movement — computed in `OperationBlock`,
  not shown separately here, since it's a small, one-line `findIndex`/
  ternary with no new concept in it).

### The New Code

```ts
if (hasCoolantWord(words)) {
  const label = coolantLabel(command);
  if (label !== lastCoolant) {
    runs.push({ type: "block", kind: "coolant", label: "Coolant", value: label, key: `co-${i}` });
    lastCoolant = label;
  }
}
```

### The Updated Project

```ts
function buildOperationRuns(rest: Command[], declared: Command): Run[] {
  const runs: Run[] = [];
  let lastCoolant: string = coolantLabel(declared);      // ← seeded from declared, not from rest[0]
  let lastRotation: string = rotationLabel(declared.spindle_dir);
  let lastPlane: string = declared.plane;
  let lastWcs: string = declared.active_wcs;

  rest.forEach((command, i) => {
    const { words } = command;
    if (hasToolChange(words) && !hasMovementWord(words)) return;
    if (hasCoolantWord(words)) {                          // ← new
      const label = coolantLabel(command);                // ← new
      if (label !== lastCoolant) {                         // ← new
        runs.push({ type: "block", kind: "coolant", label: "Coolant", value: label, key: `co-${i}` });  // ← new
        lastCoolant = label;                               // ← new
      }                                                    // ← new
    }
    if (hasRotationWord(words)) {
      const label = rotationLabel(command.spindle_dir);
      if (label !== lastRotation) {
        runs.push({ type: "block", kind: "rotation", label: "Rotation", value: label, key: `ro-${i}` });
        lastRotation = label;
      }
    }
    if (hasPlaneWord(words)) {
      if (command.plane !== lastPlane) {
        runs.push({ type: "block", kind: "plane", label: "Plane", value: command.plane, key: `pl-${i}` });
        lastPlane = command.plane;
      }
    }
    if (hasWcsWord(words)) {
      if (command.active_wcs !== lastWcs) {
        runs.push({ type: "block", kind: "wcs", label: "WCS", value: command.active_wcs, key: `wc-${i}` });
        lastWcs = command.active_wcs;
      }
    }
    if (hasMovementWord(words)) {
      const last = runs[runs.length - 1];
      if (last && last.type === "table") {
        last.commands.push(command);
      } else {
        runs.push({ type: "table", commands: [command] });
      }
    }
  });

  return runs;
}
```

`buildOperationRuns` walks every command after the declared snapshot,
emitting a new `"block"` run only the moment a tracked field's *value*
changes from what was last shown — and a continuous `"table"` run for
every real movement line, merging consecutive movement lines into one
table instead of starting a new one per line.

### Mechanical Walkthrough
- `let lastCoolant: string = coolantLabel(declared);` — **first
  appearance of this exact seeding pattern**: initializing the "last
  shown" tracker from the *declared* baseline, not from the first
  element of `rest`. This is the specific bug this function fixed
- earlier this session — without seeding from `declared`, the first
  real coolant word in `rest` that happened to match what was already
  declared up top would still fire (comparing against `undefined`/
  nothing), producing a redundant duplicate block.
- `rest.forEach((command, i) => { ... })` — **reappearing** (`Array.
  forEach` with an index, already used elsewhere in this codebase):
  runs the callback once per element, in order, index available as `i`.
- `if (label !== lastCoolant)` — plain inequality comparison against a
  variable captured in the enclosing closure — already-established
  syntax, the *pattern* (diff against a running "last known" value) is
  the reappearing idea from the previous unit, applied here to decide
  what to *render* rather than how to *group*.
- `const last = runs[runs.length - 1];` then `if (last && last.type ===
- "table")` — **reappearing** array-last-element access (already used
  in `buildOperations`); `last.type === "table"` is a TypeScript
- discriminated-union narrowing check — reading `last.type` first is
  what lets `last.commands.push(...)` type-check on the next line
  without a cast, since TypeScript narrows the union based on that
  comparison.

### CS Lens

This is the same "compare against the last real value, not the literal
previous element" idea as the previous unit's sticky-key grouping —
worth naming directly as the *same* pattern reapplied for a different
purpose: there, it decided partition boundaries; here, it decides
whether to emit anything at all. Also recognized in: diffing algorithms
generally (a diff shows you *changed* lines, not every line); React's
own reconciliation (only re-render what changed since the last commit);
delta encoding in video/audio compression.

### SE Lens

The alternative — resolving and showing every field's value on every
line, unconditionally — is what a naive block-list would do, and is
exactly what the user's own approved mockup explicitly rejected
("blocks are label:input fields," shown only when they're new
information). The real cost of the version built here: four
near-identical `if (hasXWord(words)) { if (value !== lastX) { ...
} }` blocks, one per tracked field, with no shared abstraction between
them yet — a real, named duplication this lesson leaves in place
rather than prematurely generalizing into a config-driven loop over
"tracked fields," since only four exist so far and the shape of a
fifth (SFM/CPT, handled separately, not through this function at all)
already diverges.

### Concept File

Same catalog note as the previous unit: the running `lastCoolant`/
`lastRotation`/`lastPlane`/`lastWcs` trackers are `concepts/sticky-state-
modal-behavior.md`'s idea again. The genuinely new application this
time — seeding that tracker from an *external* baseline (the `declared`
snapshot, not `rest`'s own first element) to decide whether to *emit*
output at all — has its own file: `concepts/emit-on-change-from-a-
seeded-baseline.md`, prerequisite `sticky-state-modal-behavior.md`. Its
own isolated example reproduces exactly the redundant-first-block bug
this project hit for real (Current Work, this session) before the fix.

### Commands

None new.

### Run It

Not independently runnable — this function only produces output when
called from `OperationBlock` with real `rest`/`declared` values, shown
together in the Closing section's full trace.

---

## Concept Unit: A Formula From Data That's Honestly Allowed to Be Missing

### The Problem

Two real machinist quantities — SFM (surface feet per minute) and feed
rate derived from chip load per tooth — need to be computed and shown
per operation. Both are standard, real formulas; SFM needs nothing new
from the database, but the chip-load formula needs a value
(`chip_load_per_tooth`) that doesn't exist anywhere in this project's
real tool schema yet.

### Introduce the Concept in Isolation

The formulas themselves are ordinary arithmetic, not new syntax — no
lab needed. The new *engineering* idea is the schema change underneath
them, covered in Project Change.

### Project Change

- **Reference Source** — none for `chip_load_per_tooth` itself (same
  real status as `tool_length_comp`'s H-word, already noted in
  `core/tools.py`: not a verified Mastercam `.TOOLDB` column, since no
  real file was available to confirm a name against — this project's
  own addition). SFM's formula (`π × diameter_inches × RPM / 12`) is a
  standard real machinist formula, not sourced from any file in this
  repo.
- **Files affected** — `cnc-service/core/tools.py` (`TlToolMill`,
  `_tool_to_dict`), `cnc-service/app.py` (`TOOL_FIELDS`, `create_tool`),
  `cnc-service/instance/cnc.db` (schema, via raw SQL — see Commands),
  `cnc-web/src/BlockList.tsx` (`computeSfm`, `computeFeedFromChipLoad`).
- **Change type** — add (a new nullable column; two new pure
  functions).
- **Location** — `ChipLoadPerTooth` added as a sibling to `TlToolMill`'s
  existing `ArborDiameter` field; `computeSfm`/`computeFeedFromChipLoad`
  as new module-level functions in `BlockList.tsx`.
- **Dependencies** — a running `cnc-service` dev database that already
  has rows in `TlToolMill` (the migration in Commands preserves them).

### The New Code

```python
ChipLoadPerTooth: Mapped[float | None] = mapped_column(default=None)
```

```ts
function computeSfm(tool: Tool, rpm: number): number {
  const diameterInches = tool.is_metric ? tool.diameter / 25.4 : tool.diameter;
  return (Math.PI * diameterInches * rpm) / 12;
}

function computeFeedFromChipLoad(tool: Tool, rpm: number): number | null {
  if (tool.chip_load_per_tooth == null) return null;
  return rpm * tool.flute_count * tool.chip_load_per_tooth;
}
```

### The Updated Project

```python
class TlToolMill(Base):
    # ...existing columns above (Id, ToolId, Diameter, FluteCount, CuttingDepth, ArborDiameter)...
    FluteCount: Mapped[int]
    CuttingDepth: Mapped[float]
    ArborDiameter: Mapped[float]
    ChipLoadPerTooth: Mapped[float | None] = mapped_column(default=None)  # ← new

    tool: Mapped[TlTool] = relationship(back_populates="mill")
    endmill: Mapped["TlToolEndmill | None"] = relationship(back_populates="mill", uselist=False)
```

`TlToolMill` gains one new, nullable column alongside its existing real
Mastercam-derived fields — nullable specifically so a tool with no
known chip-load figure stores that honestly as `None`, rather than
needing a placeholder number.

```ts
{tool && (
  <InfoBlock
    kind="cpt"
    label="CPT"
    value={
      tool.chip_load_per_tooth != null
        ? `${tool.chip_load_per_tooth} (feed ${chipLoadFeed!.toFixed(1)})`
        : "no data for this tool"
    }
  />
)}
```

The CPT block reads honestly off that same nullability: a tool with a
real `chip_load_per_tooth` shows its value plus the computed feed; a
tool without one shows `"no data for this tool"` — never a fabricated
number standing in for missing data.

### Mechanical Walkthrough

- `Mapped[float | None]` — **reappearing** (SQLAlchemy 2.0 typed
  mapping, already used throughout `core/tools.py` since Lesson 15);
  `| None` is what makes the column nullable at the ORM level.
- `mapped_column(default=None)` — **reappearing**: sets the Python-side
  default for a newly-constructed row; doesn't by itself alter an
  *existing* table's real schema (that's the migration, in Commands).
- `tool.diameter / 25.4` — plain arithmetic; `25.4` is the real
  mm-per-inch conversion constant, already used elsewhere in this
  project's `is_metric` handling.
- `Math.PI * diameterInches * rpm / 12` — SFM's real formula: surface
  speed of a rotating cylinder (`π × diameter × RPM` gives distance per
  minute in inches, `/ 12` converts inches to feet).
- `tool.chip_load_per_tooth == null` — **first appearance of this exact
  loose-equality idiom in this file**: `== null` (not `===`) is a
  deliberate, common TypeScript idiom that matches both `null` and
  `undefined` in one comparison; used here because the field really can
  be either, depending on whether a tool was ever given a value at all.

### CS Lens

Not a hard CS concept — this unit is domain math plus a schema
decision, not an algorithm.

### SE Lens

The real tradeoff here is "honest gap" versus "plausible-looking
fake": a seeded default chip-load value (say, a generic 0.002 in/tooth)
would make every tool's CPT block show *something*, but that something
would be wrong for the specific tool and material actually in use — a
real machinist trusting a fabricated number is a worse failure mode
than an admitted gap. The cost of the honest version: most tools in
this project's seed data show "no data for this tool" today, since none
of them were ever given a real chip-load figure.

### Concept File

The migration itself (below) is a 100% match, per the Concept Catalog
Rule — not merely similar — to an already-cataloged concept:
`concepts/database-migrations.md`'s own isolated example is the exact
same construct, same language, same purpose: `sqlite3` + `ALTER TABLE
... ADD COLUMN` in Python, adding a column to a table that already has
real rows, because the table-creation step in use (that file's `CREATE
TABLE IF NOT EXISTS`; here, SQLAlchemy's `Base.metadata.create_all()`)
silently does nothing once the table already exists. The command below
is this project's own real application of that already-taught concept,
not a first-time teaching of it.

### Commands

The ORM's own `Base.metadata.create_all()` does not alter an existing
table — it only creates tables that don't exist yet. The dev database
(`cnc-service/instance/cnc.db`, gitignored) already had a real
`TlToolMill` table with seeded test rows, and the file itself was
locked (`Device or resource busy` on delete, even with no `python.exe`
process running) — so the new column was added with a direct schema
migration instead of a delete-and-recreate:

```python
import sqlite3
conn = sqlite3.connect("cnc-service/instance/cnc.db")
conn.execute("ALTER TABLE TlToolMill ADD COLUMN ChipLoadPerTooth REAL")
conn.commit()
conn.close()
```

`ALTER TABLE ... ADD COLUMN` is SQLite's real, minimal migration
primitive: it adds a new column to every existing row, defaulting to
`NULL`, without touching any existing data. This is the same real idea
`missing concepts.md`'s own "Migrations" row names — versioning a
database schema change instead of always recreating from scratch — just
applied here by hand, once, rather than through a dedicated migration
tool (Alembic or similar), which this project doesn't have yet.

### Run It

```pycon
>>> from core.tools import list_tools
>>> [(t["tool_number"], t["chip_load_per_tooth"]) for t in list_tools()]
[(1, None), (2, None), ...]
```

Real output: every existing seed/test tool survived the migration
intact, and every one of them honestly reports `None` for
`chip_load_per_tooth` — no fabricated values were ever added.

---

## Concept Unit: The Reused View-Layer Pieces — Types, Fetch, Small Helpers

### The Problem

Before the two components in the next unit can be shown in context,
several small supporting pieces need to exist: the shapes a fetch
response and a component's props take, the network call itself, and a
handful of pure formatting helpers the movement table and block labels
read from. None of these introduce a new construct — every one reuses
a pattern already established earlier in this curriculum — but each is
real code this lesson's own commit added, and a mechanical diff-
coverage check (`scripts/check_lesson_diff_coverage.py`) confirmed none
of them had actually been shown here yet. Fixing that now.

### Project Change

- **Reference Source** — none for any piece in this unit.
- **Files affected** — `cnc-web/src/BlockList.tsx` (new file, same file
  as every earlier frontend unit in this lesson).
- **Change type** — add.
- **Location** — module scope, alongside the `Command`/`Tool`
  interfaces already shown in earlier units.
- **Dependencies** — the `Command`/`Tool` interfaces from earlier units;
  the fetch-error-field convention from Lesson 28.

### The New Code — Response and Props Shapes

```ts
interface ParseResponse {
  commands?: Command[];
  error?: string;
}
```

```ts
interface BlockListProps {
  program: string;
}
```

```ts
interface OperationBlockProps {
  commands: Command[];
  operationIndex: number;
  hasRealSeqNumbers: boolean;
  toolsByNumber: Map<number, Tool>;
}
```

`interface` itself is **reappearing** (already shown for `Command`/
`Tool` earlier in this lesson) — these three are the same construct,
just naming three new shapes: the raw `/api/parse` response body
(`ParseResponse`), and each component's own props (`BlockListProps`,
`OperationBlockProps`).

### The New Code — Fetching the Program's Commands

```ts
async function fetchBlocks(program: string): Promise<Command[]> {
  const response = await fetch("http://127.0.0.1:5000/api/parse", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: ParseResponse = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  logger.info(`fetchBlocks succeeded: ${data.commands!.length} blocks`);
  return data.commands!;
}
```

`fetchBlocks` is **reappearing** in every meaningful sense — the exact
`fetch`/`await response.json()`/check-the-body's-own-`error`-field
shape Lesson 28 established (`App.tsx`'s `fetchPath`, `MachineStatus.
tsx`'s `fetchState`), applied to a new endpoint and a new response
shape. No new construct here, only a new caller of an already-taught
pattern — worth showing in full regardless, since it's real code this
lesson's own commit added.

### The New Code — Formatting Helpers

```ts
function mValues(words: Command["words"]): number[] {
  if (!("M" in words)) return [];
  const m = words.M;
  return Array.isArray(m) ? m : [m];
}

function gValues(words: Command["words"]): number[] {
  if (!("G" in words)) return [];
  const g = words.G;
  return Array.isArray(g) ? g : [g];
}

function fmtWord(v: number | number[] | undefined): string {
  if (v == null) return "";
  return Array.isArray(v) ? v.map((n) => String(n)).join(",") : String(v);
}
```

`mValues`/`gValues` normalize a word that might be a single number or,
for a line with a repeated letter (`G21 G90 G17` — three `G` values on
one line), an array — into always-an-array, so every caller can iterate
uniformly rather than branching on the type every time it's read.
`fmtWord` does the reverse job for display: turn either shape back into
one string, comma-joining a real array. `Array.isArray` and the `?:`
ternary are both **reappearing** (already used throughout `core/
parser.py`'s TypeScript-side callers and `computeFeedFromChipLoad`,
shown earlier in this lesson) — no new language construct in any of
these three functions, only new, small, real logic worth showing rather
than describing only in prose.

### Commands

None new — `npx tsc --noEmit` (already run for this commit) covers
these.

### Run It

```pycon
# gValues/mValues/fmtWord have no Python analog to run directly here —
# their correctness is covered by tsc's type-check plus the movement
# table's real rendered output in the next unit.
```

---

## Concept Unit: The Two Real Components — Program and Operation

### The Problem

Every algorithm this lesson has taught so far (`buildOperations`,
`buildOperationRuns`, the SFM/CPT formulas) only produces *data* —
grouped commands, a list of runs, two numbers. Something has to
actually put that on screen: a collapsible `Program` header, a
collapsible `Operation` header showing its declared blocks and
movement table, and the small table components the movement rows use.

### Project Change

- **Reference Source** — none; no reference counterpart for this
  entire feature, stated at this lesson's own header.
- **Files affected** — `cnc-web/src/BlockList.tsx` (new file).
- **Change type** — add.
- **Location** — module scope; `BlockList` is the file's default
  export, calling `OperationBlock` once per group `buildOperations`
  produced.
- **Dependencies** — every function/interface from every earlier unit
  in this lesson (`buildOperations`, `buildOperationRuns`, `InfoBlock`
  — shown already — `computeSfm`, `computeFeedFromChipLoad`,
  `fetchBlocks`, `fetchTools`, the formatting helpers above).

### The New Code — the Movement Table's Own Small Components

```tsx
function MoveTableHead() {
  return (
    <thead>
      <tr>
        <th className="block-move-linenum"></th>
        <th>G</th>
        <th>X</th>
        <th>Y</th>
        <th>Z</th>
        <th>M</th>
        <th>F</th>
        <th>S</th>
      </tr>
    </thead>
  );
}
```

```tsx
function MoveTableRow({ command }: { command: Command }) {
  return (
    <tr className="block-move-row">
      <td className="block-move-linenum">{command.line_number}</td>
      <td>{command.motion}</td>
      <td>{command.x ?? ""}</td>
      <td>{command.y ?? ""}</td>
      <td>{command.z ?? ""}</td>
      <td>{fmtWord(command.words.M)}</td>
      <td>{fmtWord(command.words.F)}</td>
      <td>{fmtWord(command.words.S)}</td>
    </tr>
  );
}
```

`<thead>`/`<tr>`/`<th>`/`<tbody>`/`<td>` are **reappearing** — real
HTML table elements, already given full standalone treatment in
`concepts/html-table-elements.md` (first taught Lesson 13,
`ToolCardList.tsx`'s own real table). Nothing new about the elements
themselves here; what's new is only the specific columns (`G X Y Z M F
S`, plus a plain, muted, never-"N"-prefixed line-number column) and
`fmtWord` (previous unit) reading a possibly-array `words.M`/`words.F`/
`words.S` value back into one displayable string. `??` (nullish
coalescing, on `command.x ?? ""`) is **reappearing** — already used
elsewhere in this codebase's optional-field handling.

### The New Code — `OperationBlock`

```tsx
function OperationBlock({
  commands,
  operationIndex,
  hasRealSeqNumbers,
  toolsByNumber,
}: OperationBlockProps) {
  const [expanded, setExpanded] = useState(true);
  const first = commands[0];
  const displayNumber = hasRealSeqNumbers ? first.seq_n : operationIndex;
  const firstMoveIndex = commands.findIndex((c) => hasMovementWord(c.words));
  const declared =
    firstMoveIndex > 0
      ? commands[firstMoveIndex - 1]
      : (commands.find((c) => hasToolChange(c.words)) ?? first);
  const rest = commands.slice(1);
  const runs = buildOperationRuns(rest, declared);

  const tool = toolsByNumber.get(declared.active_t);
  const sfm = tool ? computeSfm(tool, declared.spindle_rpm) : null;
  const chipLoadFeed = tool ? computeFeedFromChipLoad(tool, declared.spindle_rpm) : null;

  const label =
    first.comment || (commands.some((c) => hasToolChange(c.words)) ? "Tool Change" : "Operation");

  return (
    <div className="block-operation">
      <button type="button" className="block-row-header" onClick={() => setExpanded((e) => !e)}>
        <span className="block-row-toggle">{expanded ? "▾" : "▸"}</span>
        <span className="block-row-seq">N{displayNumber}</span>
        <span className="block-row-label">{label}</span>
      </button>
      {expanded && (
        <div className="block-row-detail">
          <InfoBlock kind="plane" label="Plane" value={declared.plane} />
          <InfoBlock kind="wcs" label="WCS" value={declared.active_wcs} />
          <InfoBlock kind="rotation" label="Rotation" value={rotationLabel(declared.spindle_dir)} />
          <InfoBlock kind="coolant" label="Coolant" value={coolantLabel(declared)} />
          {tool && (
            <InfoBlock
              kind="tool"
              label="Tool"
              value={`T${declared.active_t} H${declared.active_h} (${tool.diameter}${tool.is_metric ? "mm" : "in"} dia, ${tool.flute_count} flute)`}
            />
          )}
          {sfm != null && <InfoBlock kind="sfm" label="SFM" value={sfm.toFixed(1)} />}
          {tool && (
            <InfoBlock
              kind="cpt"
              label="CPT"
              value={
                tool.chip_load_per_tooth != null
                  ? `${tool.chip_load_per_tooth} (feed ${chipLoadFeed!.toFixed(1)})`
                  : "no data for this tool"
              }
            />
          )}
          {runs.map((run) =>
            run.type === "block" ? (
              <InfoBlock key={run.key} kind={run.kind} label={run.label} value={run.value} />
            ) : (
              <table className="block-move-table block-move-table-run" key={`t-${run.commands[0].seq_n}`}>
                <MoveTableHead />
                <tbody>
                  {run.commands.map((c) => (
                    <MoveTableRow key={c.seq_n} command={c} />
                  ))}
                </tbody>
              </table>
            ),
          )}
        </div>
      )}
    </div>
  );
}
```

### Mechanical Walkthrough
- `useState(true)` — **reappearing** (established React hook, first
  taught Lesson 11, reused for a collapse toggle the same way `App.tsx`
  already uses it for `isConfigOpen`): `expanded` starts `true` (an
  operation opens expanded by default), `setExpanded` updates it.
- `commands.findIndex((c) => hasMovementWord(c.words))` — **reappearing**
  array method (`Array.prototype.findIndex`, already used elsewhere in
  this codebase): returns the index of the first command whose `words`
  carry a movement letter, or `-1` if none do.
- The `firstMoveIndex > 0 ? commands[firstMoveIndex - 1] : (... ?? first)`
  ternary chain — ordinary conditional expression, already established;
  the *reasoning* behind picking "the line right before the first real
  move" as `declared` (rather than always `commands[0]`) is prose-level
  domain logic, not new syntax, and is explained in this unit's own
  comment in the real file.
- `{expanded && (...)}` — **reappearing** JSX conditional-rendering
  idiom (already used throughout this codebase, e.g. `SidePanel`'s
  conditional tab content).
- `runs.map((run) => run.type === "block" ? <InfoBlock .../> : <table>...)`
- — **reappearing** `Array.prototype.map` returning JSX per element
  (already established since the earliest React lessons); the ternary
  branches on `run.type`, the same discriminated-union narrowing already
  named in `buildOperationRuns`'s own Mechanical Walkthrough earlier in
  this lesson.
- `<InfoBlock kind="plane" label="Plane" value={declared.plane} />` and
- its siblings — `InfoBlock` itself is this lesson's own component,
  **already shown in full** earlier (the "Declared Once, Re-Emitted
  Only on Change" unit's own surrounding code) — these lines are new
  *call sites* passing new props, not a new component definition.

### The New Code — `BlockList`

```tsx
function BlockList({ program }: BlockListProps) {
  const [commands, setCommands] = useState<Command[] | null>(null);
  const [tools, setTools] = useState<Tool[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [programExpanded, setProgramExpanded] = useState(true);

  useEffect(() => {
    fetchBlocks(program)
      .then((cmds) => {
        setCommands(cmds);
        setError(null);
      })
      .catch((err: Error) => {
        logger.error(`fetchBlocks failed: ${err.message}`);
        setError(err.message);
      });
  }, [program]);

  useEffect(() => {
    fetchTools()
      .then(setTools)
      .catch((err: Error) => logger.error(`fetchTools failed: ${err.message}`));
  }, []);

  if (error) {
    return <div className="code-error">{error}</div>;
  }
  if (!commands) {
    return <p>loading blocks...</p>;
  }

  const toolsByNumber = new Map<number, Tool>();
  for (const tool of tools) {
    if (!toolsByNumber.has(tool.tool_number)) toolsByNumber.set(tool.tool_number, tool);
  }

  const first = commands[0];
  const hasTitle = first && isCommentOnly(first);
  const programTitle = hasTitle ? first.comment : "Program";
  const remaining = hasTitle ? commands.slice(1) : commands;
  const hasRealSeqNumbers = remaining.some((c) => c.has_real_seq_n);
  const operations = buildOperations(remaining, hasRealSeqNumbers);

  return (
    <div className="block-list">
      <div className="block-program">
        <button
          type="button"
          className="block-program-header"
          onClick={() => setProgramExpanded((e) => !e)}
        >
          <span className="block-row-toggle">{programExpanded ? "▾" : "▸"}</span>
          <span className="block-program-title">{programTitle}</span>
        </button>
        {programExpanded &&
          operations.map((op, i) => (
            <OperationBlock
              key={op[0].seq_n}
              commands={op}
              operationIndex={i + 1}
              hasRealSeqNumbers={hasRealSeqNumbers}
              toolsByNumber={toolsByNumber}
            />
          ))}
      </div>
    </div>
  );
}
```

### Mechanical Walkthrough
- `useEffect(() => { fetchBlocks(program)... }, [program])` —
  **reappearing** (Lesson 27's own debounced-reparse effect shape, and
  Lesson 26's `.catch()` + `logger.error` convention): re-runs
  `fetchBlocks` whenever `program` (the debounced code from `App.tsx`)
  changes; the second effect (`fetchTools`, dependency array `[]`) runs
  exactly once, on mount — **reappearing**, the same "empty deps = mount
  only" idiom already used for `App.tsx`'s theme initializer.
  `fetchTools` here is a **new, separate function of the same name**
- as `ToolCardList.tsx`'s own `fetchTools` (Lesson 17) — a real name
  collision across two different files, not the same function reused;
  worth naming directly since a mechanical, name-only check can't tell
  the two apart.
- `const toolsByNumber = new Map<number, Tool>();` / the `for...of` loop
- — **reappearing** (`Map`, already used in this codebase); building a
  lookup that keeps only the first tool seen per `tool_number`, per this
  schema's own real, named, non-unique-number allowance (`core/tools.
  py`).
- Two early `return`s (`error`, then `!commands`) before any of the real
  render logic — **reappearing** conditional-return-for-loading/error-
  states pattern, already established (`MachineStatus.tsx`).
- The rest of the function (title detection, `hasRealSeqNumbers`,
  `buildOperations`) is calling functions already fully taught in
  earlier units of this lesson — no new logic here, only the real call
  site putting them together and rendering the result.

### CS Lens

Not a hard CS concept on its own — this unit is composition: two
components assembling already-taught data-producing functions
(`buildOperations`, `buildOperationRuns`, the SFM/CPT formulas) and
already-taught rendering idioms (conditional rendering, `.map` to JSX,
`useState`/`useEffect`) into a real, working screen. The teaching value
here is completeness — showing where the earlier units' output actually
goes — not a new abstraction.

### SE Lens

The real design decision worth naming: `BlockList` fetches both
`commands` and `tools` independently, in two separate effects, rather
than one combined fetch — meaning the movement table can render before
the tool list arrives (`tool` stays `undefined` until `fetchTools`
resolves, and every `tool &&`-gated block simply doesn't render yet).
The alternative — a single effect awaiting both before setting any
state — would guarantee tool-dependent blocks (Tool/SFM/CPT) never
flicker in a half-loaded state, at the cost of the whole view staying on
"loading blocks..." longer than necessary when only the tool list is
slow. This project chose the faster-partial-render tradeoff; not
verified live this session (named in Known Incomplete) whether the
resulting flicker is actually acceptable in practice.

### Concept File

`useState`, `useEffect`, JSX conditional rendering, and `Array.map`-to-
JSX are all already-cataloged, established concepts from earlier in
this curriculum (first taught around Lesson 11) — reused here, not
re-taught, per the Repetition Rule.

### Commands

None new — covered by the same `npx tsc --noEmit` run as every other
unit in this lesson.

### Run It

```pycon
# BlockList/OperationBlock have no Python analog; their real, correct
# output for O0003.nc was confirmed indirectly this session — via the
# backend calls shown earlier, hand-traced through buildOperations and
# buildOperationRuns's own logic — not a live browser render (named,
# deliberately, in Known Incomplete below).
```

---

## Concept Unit: The CSS Layer — Block Kinds as a Border Color, Not New Structure

### The Problem

Every component above renders real elements with real class names —
none of them have any visual layout yet without the CSS backing them.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/theme.css`, modified (~150 lines
  added).
- **Change type** — add.
- **Location** — appended after the existing `code-editor-panel`-area
  rules (Lesson 27/35).
- **Dependencies** — `--color-accent-blue`/`--color-accent-blue-bright`/
  `--color-status-ccw`/`--color-status-on`/`--color-amber`/
  `--color-accent-green`/`--color-accent-green-bright` (all pre-existing
  design tokens from Lesson 12/24's palette), `concepts/css-custom-
  properties.md`, `concepts/design-tokens-theming-pattern.md`,
  `concepts/css-flexbox-layout.md` — every mechanism this CSS uses was
  already taught; nothing here is a new CSS concept.

### The New Code

```css
.block-list {
  flex: 1;
  overflow-y: auto;
  font-family: "JetBrains Mono", monospace;
  font-size: 11px;
}
.block-program-title {
  color: var(--color-accent-green-bright);
}
.block-program-header,
.block-row-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 8px;
  background: none;
  border: none;
  color: var(--color-text);
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.block-program-header {
  border-bottom: 1px solid var(--color-border-strong);
  font-weight: 700;
}
.block-row-header:hover,
.block-program-header:hover {
  background: var(--color-panel);
}
.block-row-toggle {
  color: var(--color-muted);
  width: 10px;
  flex-shrink: 0;
}
.block-operation {
  border-bottom: 1px solid var(--color-border);
  border-left: 3px solid var(--color-accent-blue);
}
.block-row-seq {
  color: var(--color-accent-blue-bright);
  min-width: 42px;
  flex-shrink: 0;
}
.block-row-label {
  color: var(--color-text-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.block-row-detail {
  padding: 2px 8px 8px 30px;
  background: var(--color-bg);
}
.block-info {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px 2px 30px;
  font-size: 10px;
  border-left: 3px solid var(--color-border-strong);
}
.block-info-label {
  color: var(--color-muted);
  font-weight: 700;
  min-width: 46px;
  flex-shrink: 0;
}
.block-info-label::after {
  content: ":";
}
.block-info-value {
  color: var(--color-text);
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  padding: 1px 6px;
}
.block-info-plane {
  border-left-color: var(--color-accent-blue);
}
.block-info-wcs {
  border-left-color: var(--color-accent-blue-bright);
}
.block-info-rotation {
  border-left-color: var(--color-status-ccw);
}
.block-info-coolant {
  border-left-color: var(--color-status-on);
}
.block-info-tool {
  border-left-color: var(--color-amber);
}
.block-info-sfm,
.block-info-cpt {
  border-left-color: var(--color-accent-green);
}
.block-move-table {
  width: 100%;
  border-collapse: collapse;
}
.block-move-table-run {
  border-bottom: 1px solid var(--color-border);
}
.block-move-table th {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-muted);
  text-align: left;
  padding: 3px 8px;
  border-bottom: 1px solid var(--color-border);
}
.block-move-table td {
  padding: 2px 8px;
  color: var(--color-text);
  white-space: nowrap;
}
.block-move-table td.block-move-linenum {
  color: var(--color-muted);
  width: 28px;
}
.block-move-row:nth-child(even) {
  background: var(--color-panel);
}
.block-move-table:not(.block-move-table-run) th,
.block-move-table:not(.block-move-table-run) td {
  padding-left: 30px;
}
```

### Mechanical Walkthrough
- `.block-program-header, .block-row-header { display: flex; ... }` —
  **reappearing** flexbox layout (`concepts/css-flexbox-layout.md`,
  already established) — a comma-separated selector list applying one
  rule to two class names at once, already-established CSS syntax.
- `var(--color-accent-blue)` and every other `var(--color-...)` use —
  **reappearing** (`concepts/css-custom-properties.md`): reads a design
  token defined once, elsewhere, rather than a hardcoded literal color.
- `.block-info-plane { border-left-color: var(--color-accent-blue); }`
  and its five siblings — the specific, new *idea* worth naming (not a
  new CSS mechanism, a new *use* of one already taught): a block's
  `kind` prop (`InfoBlock`, shown earlier) selects a modifier class
  (`block-info-${kind}`), and each modifier only overrides one property,
- `border-left-color` — the base `.block-info` rule supplies everything
  else identically. This is `concepts/design-tokens-theming-pattern.md`'s
  own "swappable catalog of named values" idea, applied to *block kind*
  instead of *app theme*: seven kinds, one shared shape, one color each.
- `:nth-child(even)` on `.block-move-row` — **first appearance** of this
  exact pseudo-class in this project (a real, small new CSS construct):
  selects every second row of the movement table (alternating shading),
  matched by position among siblings rather than by any class or
  attribute.
- `.block-info-label::after { content: ":"; }` — **first appearance** of
  a **pseudo-element** in this project — a real, different kind of
  construct from every pseudo-*class* above it, marked with a double
  colon rather than one: a pseudo-*class* (`:hover`, `:nth-child`)
  selects an element that already exists, based on its state or
  position; a pseudo-*element* like `::after` generates a real, new
  rendered node with no matching tag anywhere in the actual HTML —
  `content: ":"` is what that generated node actually displays. Used
  here so every label's trailing colon is a purely visual detail, never
  a real character `EditableInfoBlock`'s own text has to include,
  strip, or accidentally let a user type into.
- `.block-move-table:not(.block-move-table-run) th` — **first
  appearance** of `:not()`, a **functional pseudo-class**: it takes
  another real selector as its own argument (`.block-move-table-run`)
  and matches anything that selector *doesn't*. Needed here because most
  movement tables sit inside a collapsed operation (indented, to align
  under that operation's own declared-info blocks), but the one table
  belonging to the *currently-running* block (`.block-move-table-run`)
- is shown flush, unindented, at the top level — `:not()` expresses
  "every other case" directly, rather than needing a second, positive
  class naming every table that *isn't* the running one.

### CS Lens

Not a hard CS concept — `:nth-child`, `::after`, and `:not()` are three
small, real, first-appearing CSS constructs, not computer-science ideas;
everything else in this unit is direct reuse of already-cataloged
concepts.

### SE Lens

The alternative to `border-left-color`-only modifier classes — a fully
separate CSS rule per kind, repeating every other property (padding,
font-size, layout) seven times — was rejected for the same reason
`design-tokens-theming-pattern.md` already names for the app's own
theme system: one shared shape, one varying value, is what actually
lets a reader (or a future kind, an eighth one) trust that every block
looks and behaves identically except for exactly the one thing that's
supposed to differ.

### Commands

None new.

### Run It

Verified for real this session — not by code review alone, per the
project's own real-verification standard — using Playwright against a
throwaway HTML file exercising the same three constructs:

```css
.label::after { content: ":"; color: red; }
table:not(.run) td { padding-left: 30px; }
table.run td { padding-left: 8px; }
```

**Real output, headless Chromium, reading real computed styles:**
```json
{"content": "\":\"", "color": "rgb(255, 0, 0)"}
```
```
plain table td padding-left: 30px
.run table td padding-left: 8px
```

`::after` really did generate a rendered node whose computed `content`
is the literal string `":"`, colored as declared — confirming a real
pseudo-element exists, not just a property set on the label itself.
`:not(.run)` correctly matched the plain table's cells (`30px`) and
correctly excluded the `.run`-classed table's cells, which took the
more specific direct rule instead (`8px`) — the real, working negation
this project's own `.block-move-table:not(.block-move-table-run)` rule
depends on.

---

## Concept Unit: Mounting the New Tab

### The Problem

`BlockList` renders nothing until something in `App.tsx` actually puts
it on screen as a real, selectable tab.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/App.tsx`, modified.
- **Change type** — add (extending existing structures, not new ones).
- **Location** — `ViewId`'s union type, `VIEW_LABELS`, and
  `renderViewContent`, all first built in Lesson 27 and already
  extended once since (Lesson 35's `code` entry).

### The New Code

```ts
type ViewId = "dro" | "tools" | "code" | "blocks";
```

```ts
const VIEW_LABELS: Record<ViewId, string> = {
  dro: "DRO",
  tools: "Tools",
  code: "Code",
  blocks: "Operations",
};
```

```tsx
if (id === "blocks") return <BlockList program={debouncedCode} />;
```

### Mechanical Walkthrough
All three lines **reappear** the exact mechanism Lesson 27 established
for adding a tab at all (and Lesson 35 already reused once for `code`):
a new member on the `ViewId` union, a matching new key in
`VIEW_LABELS` (which is what `RibbonToolbar`'s own toggle buttons are
generated from, for free), and one new `if` branch in
- `renderViewContent`. No new construct in any of these three lines —
`RibbonToolbar` needed zero changes to pick up a fourth toggle button
automatically, exactly as designed back in Lesson 27.

### CS Lens / SE Lens

Not repeated here — this is the same design already analyzed in full
when it was first built (Lesson 27) and first reused (Lesson 35): a
closed, small set of extension points (a union member, a labels-record
key, a render branch) that a new view plugs into without touching
`RibbonToolbar`, `SidePanel`, or the panel-management logic at all.

### Commands

None new.

### Run It

Already covered by the same `npx tsc --noEmit` pass as every other unit
in this lesson.

---

## Connect the Pieces

One real value, start to finish: the raw line `N1101` on `O0003.nc`'s
own line 2.

1. **Lexer** — `extract_seq_n("N1101")` returns `1101`; `parse_line`
   returns `{"words": {}, "comment": "", "seq_n": 1101}`.
2. **Parser's skip check** — `words` is empty and `comment` is empty,
   but `real_seq_n` (`1101`) is not `None`, so the line survives instead
   of being dropped as blank.
3. **Parser's counter** — `1101` is real, so `seq_n = 1101` and
   `self._next_seq_n` fast-forwards to `1102`; every synthetic line
   between here and the next real N-number continues from `1102`
   onward, never colliding with `1101` again.
4. **Command dict** — this line becomes a real command:
   `{"seq_n": 1101, "has_real_seq_n": True, "line_number": 2, "words":
   {}, "comment": "", ...every other modal field, unchanged...}`.
5. **`buildOperations`** — sees `has_real_seq_n: True`, `seq_n: 1101 !==
   currentKey (null)` → starts a new operation group here; every
   following command, real or synthetic, stays in this same group until
   `N2101` (line 15) starts the next one.
6. **`OperationBlock`** — `hasRealSeqNumbers` is true for this program,
   so `displayNumber = first.seq_n` → the operation header reads
   `N1101`, the real, authored value — not a synthetic ordinal.
7. **`buildOperationRuns`** — walks everything in this group after the
   declared snapshot, showing Plane/WCS/Rotation/Coolant/Tool/SFM/CPT
   once, then a continuous movement table, with a fresh block only
   where one of those fields genuinely changes again before `N2101`.

## What Breaks Without This

Reverting just the parser's skip-condition fix (Concept Unit 2) back to
`if not words: continue` and re-running against `O0003.nc`:

```pycon
>>> commands = Parser().parse(program)  # with the old, one-field check restored
>>> len(commands)
24
>>> any(c["has_real_seq_n"] for c in commands)
False
```

Both real N-number lines vanish again, `has_real_seq_n` is `False`
everywhere, and the frontend falls back to tool-change-based grouping —
the exact regression observed live this session, now understood and
fixed rather than worked around.

## Exercises

1. Add a third real N-number to `O0003.nc`, between the two existing
   operations (e.g. `N1150` right before a `G01` move partway through
   the first pocket). Trace by hand which operation it should split,
   and confirm `buildOperations` actually does it.
2. `buildOperationRuns` seeds `lastCoolant`/`lastRotation`/`lastPlane`/
   `lastWcs` from `declared` individually. Write out, in prose, what
   would go wrong if `lastCoolant` were instead seeded from `rest[0]`
   (the very first command *after* the declared snapshot) instead of
   from `declared` itself — and why that was the original, real bug
   this session found and fixed.
3. `computeSfm` assumes `tool.diameter` is already resolved to the
   right unit basis before use elsewhere in the app. Find the one line
   in `computeSfm` that does the actual mm→inch conversion, and explain
   why it would be wrong to skip that step for a metric tool.

## Known Incomplete — Named Directly, Not Forgotten

This entire feature is committed in a deliberately unfinished state,
by direct instruction: it's real, working scope for the ideas this
lesson teaches, not a finished product.

- **Read-only.** No field in the Operations view writes back into the
  source text yet — editing is real, distinct, later scope.
- **Single-program only.** No subprogram nesting; a real switch and
  user-specified naming scheme for that case is named, future scope,
  not started.
- **`chip_load_per_tooth` is `null` for every real tool** in this
  project's seed data — the CPT block will show "no data for this
  tool" for all of them until real figures are entered.
- **`tool_number` lookup takes the first match** when more than one
  tool shares a number (a real, allowed case in this schema) — an
  honestly-named limitation, not a safe assumed-unique lookup.
- **Not verified live in a browser this session**, past the point the
  grouping algorithm was hand-traced against real backend output — a
  direct, repeated, cost-driven instruction this session. The shape is
  confirmed correct by direct inspection and direct backend calls; a
  full visual/interaction pass (collapsing, CSS, multi-operation
  scrolling) is still owed before this is called done.
- **Four independent, near-identical `if (hasXWord...) { if (value !==
  lastX) ... }` blocks** in `buildOperationRuns` (Plane/WCS/Rotation/
  Coolant) — named in that unit's own SE Lens as real duplication, not
  yet generalized.

## Definition of Done

- [x] `extract_seq_n`/`parse_line` return a real `seq_n` for any line
      with a real N-word, `None` otherwise — verified directly.
- [x] `Parser.parse` no longer drops a comment-only or N-only line —
      verified directly against `O0003.nc` (24 → 26 commands).
- [x] `Parser._parse_block` exposes every real modal field, `raw`,
      `comment`, `seq_n`, `has_real_seq_n`, `line_number`, `words` on
      every command.
- [x] `chip_load_per_tooth` column added, migrated onto the real dev
      database without losing existing rows, exposed through
      `/api/tools`.
- [x] `BlockList.tsx`'s `buildOperations` groups by real N-numbers when
      present (sticky-key, not raw equality), falls back to
      tool-change/comment triggers otherwise.
- [x] `buildOperationRuns` seeds its "last shown" trackers from the
      declared snapshot, not from the first post-declaration command.
- [x] `npx tsc --noEmit` clean.
- [ ] Full live-browser verification across `O0002.nc`/`O0003.nc` —
      explicitly deferred, named above, not done this session.

```
git commit -m "Operations tab: real N-numbers, honest gaps, unfinished by design"
```

Committed as real, working, and explicitly incomplete — the user's own
next step is learning this shape well enough to decide what's next,
not this project (or its author) deciding it for them.
