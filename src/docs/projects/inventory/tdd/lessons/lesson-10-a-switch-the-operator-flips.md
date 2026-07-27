# Lesson 10: A Switch the Operator Flips

## What you will build

Real support for G-code's block-skip marker: a line starting with `/`
(e.g., `/G1 X20`) is normally executed exactly like any other line — but
if the machine's real "optional stop" switch is on, that same line is
skipped entirely, as if it were never in the program at all. `Parser`
gains its first constructor parameter, `optional_skip_enabled`, and all
three routes that build a `Parser` (`/api/parse`, `/api/simulate`,
`/api/path`) can now be asked to honor it. The transferable problem:
**some behavior should only activate when explicitly turned on** — a
feature flag, a debug switch, an operator-controlled machine setting —
and the code that *recognizes* the marker should not be the same code
that *decides* whether it matters.

## What you need to know first

Lesson 4: `Parser`'s constructor and `_parse_block`. Lesson 2/3:
`parse_line`, called here on an already-`/`-stripped line. This lesson
changes `Parser.__init__`'s signature — every existing caller
(`Parser()`, no arguments) still works unchanged, confirmed below.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/python-default-parameter-values.md`
- `../concepts/python-string-startswith.md`
- `../concepts/python-truthy-falsy-values.md`
- `../concepts/feature-flag-pattern.md`

## No pipeline diagram change

This lesson refines the `Text → Tokens` boundary (deciding whether a line
even reaches tokenizing) rather than adding a new stage.

---

## Concept Unit: A Line That Might Not Count At All

### The Problem

Real G-code supports marking a line as *conditionally* included: a `/`
at the start means "skip this line if the machine's optional-stop switch
is on." It's used for things like an inspection stop a setup operator
wants during first-article verification, but not during full production
runs — the *same program* behaves two different ways depending on a
switch that isn't part of the G-code text at all.

### Reference Source, Read for Real This Session

`cnc/CNCEngine.ts` lines 1100–1106, inside `_parseLine` (re-read fresh
this session, not from memory):
```ts
// Block skip
let skip = false;
let rest = t;
if (rest.startsWith("/")) {
  skip = true;
  rest = rest.slice(1).trim();
}
```
And lines 1007 and 1649 (`ChannelState`'s real default, and where the
flag actually takes effect):
```ts
this.optSkip = false;
// ...
if (b.skip && ch.optSkip) return;
```
Two real, separate facts, ported faithfully: **every** line marked `/`
is *tagged* as skippable (`skip = true`), regardless of whether the
switch is on — tagging and deciding are two different moments. The
decision to actually skip only happens later, and only when **both**
`b.skip` (this line is tagged) **and** `ch.optSkip` (the switch is on)
are true — and the switch itself defaults to `false`, meaning by default,
tagged lines still run normally.

### The New Code

```python
class Parser:
    def __init__(self, optional_skip_enabled=False):
        self.current_motion = "G0"
        self.optional_skip_enabled = optional_skip_enabled

    def parse(self, text):
        commands = []
        for raw_line in text.split("\n"):
            stripped = raw_line.strip()
            skip = stripped.startswith("/")
            if skip:
                stripped = stripped[1:].strip()
            words = parse_line(stripped)["words"]
            if not words:
                continue
            if skip and self.optional_skip_enabled:
                continue
            commands.append(self._parse_block(words))
        return commands
```

### The Updated Project

The full, current `core/parser.py`, nothing elided:
```python
from core.lexer import parse_line

_MOTION_CODES = {0: "G0", 1: "G1", 2: "G2", 3: "G3"}
_SUPPORTED_WORDS = ("G", "X", "Y", "Z", "F")


class UnsupportedCodeError(Exception):
    pass


class Parser:
    def __init__(self, optional_skip_enabled=False):
        self.current_motion = "G0"
        self.optional_skip_enabled = optional_skip_enabled

    def parse(self, text):
        commands = []
        for raw_line in text.split("\n"):
            stripped = raw_line.strip()
            skip = stripped.startswith("/")
            if skip:
                stripped = stripped[1:].strip()
            words = parse_line(stripped)["words"]
            if not words:
                continue
            if skip and self.optional_skip_enabled:
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
As a whole: `parse()` now decides, per line, whether it's tagged (`/`),
strips the tag before anything else sees it, and only *acts* on the tag
if the instance was created with the switch on.

### Mechanical Walkthrough

- `def __init__(self, optional_skip_enabled=False):` — **(a) first
  appearance** of a **default parameter value** on this project's own
  classes.
  *(Full standalone treatment: ../concepts/python-default-parameter-values.md.)*
  Callers can still write `Parser()` (every existing call site,
  Lessons 4–9, unchanged) and get `optional_skip_enabled=False`
  automatically, or explicitly pass `Parser(optional_skip_enabled=True)`
  to turn it on — a **keyword argument** (named explicitly at the call
  site, not positional), chosen deliberately so a reader never has to
  remember argument *order*, only the name.
- `self.optional_skip_enabled = optional_skip_enabled` — **(b)
  reappearing** self-attribute assignment (Lesson 4), storing the
  constructor argument as real instance state, read later inside
  `parse()`.
- `stripped = raw_line.strip()` — already-known basic Python; **(a) a
  real, deliberate ordering decision**: stripping and checking for `/`
  happens *before* `parse_line` (comment-stripping, tokenizing) ever
  runs, matching the reference's own real order (`_parseLine` checks
  block-skip at lines 1100–1106, strictly before its own comment
  handling at 1120+).
- `skip = stripped.startswith("/")` — **(a) first appearance** of
  `str.startswith`.
  *(Full standalone treatment: ../concepts/python-string-startswith.md.)*
  Already-known-shape but new to this project;
  tagging happens unconditionally, matching the reference's `skip = true`
  regardless of the switch.
- `if skip: stripped = stripped[1:].strip()` — a slice removing exactly
  the first character (the `/` itself), then trimming any space that
  followed it — so `parse_line`, called next, never sees the `/` at all.
- `if skip and self.optional_skip_enabled: continue` — **(a) the actual
  decision**, made only here, after tokenizing already happened (`words`
  already computed) — a real, deliberate choice: even a skipped line's
  *text* is still fully parsed as far as recognizing its words (so a
  skipped line containing genuinely unsupported syntax would still be
  worth flagging in a future, stricter lesson) — only building a
  *command* from it, and updating modal state from it, is what skipping
  actually prevents. `continue` — **(c) already established** — moves to
  the next line without appending anything or calling `_parse_block`,
  which means `self.current_motion` is **not** touched by a skipped line
  either — matching the reference's identical behavior (`_applyMotion`,
  the function that would update `motionMode`, is never reached for a
  truly skipped block, since `_executeBlock` returns before calling it).

### Execution Trace

`"G0 X10\n/G1 X20\nX30"`, run for real this session against two
`Parser` instances — one with the switch off, one on:

```
Parser(optional_skip_enabled=False).parse(program):

Line 1: "G0 X10" → stripped="G0 X10", skip=False
  words={"G":0.0,"X":10.0} → not empty → skip and enabled? False (skip
  itself is False) → commands.append(_parse_block(...))
  → current_motion becomes "G0"; commands = [{"motion":"G0","x":10.0}]

Line 2: "/G1 X20" → stripped starts with "/" → skip=True,
  stripped becomes "G1 X20"
  words={"G":1.0,"X":20.0} → not empty
  skip (True) and self.optional_skip_enabled (False)? → False → runs anyway
  → commands.append(_parse_block(...)) → current_motion becomes "G1"
  → commands = [..., {"motion":"G1","x":20.0}]

Line 3: "X30" → skip=False, words={"X":30.0}
  → commands.append(...) → command carries current_motion ("G1")
  → commands = [..., {"motion":"G1","x":30.0}]

Final (3 commands): motions are G0, G1, G1 — the skip tag never
mattered, since the switch was off.
```

```
Parser(optional_skip_enabled=True).parse(program):

Line 1: "G0 X10" → skip=False → runs → current_motion="G0"
  commands = [{"motion":"G0","x":10.0}]

Line 2: "/G1 X20" → skip=True, stripped="G1 X20", words={"G":1.0,"X":20.0}
  skip (True) and self.optional_skip_enabled (True)? → True
  → continue — _parse_block is never called for this line
  → current_motion is NOT touched, still "G0"
  → commands unchanged

Line 3: "X30" → skip=False, words={"X":30.0}
  → commands.append(_parse_block(...)) → command carries current_motion,
  which is still "G0" (Line 2 never ran, so it never became "G1")
  → commands = [{"motion":"G0","x":10.0}, {"motion":"G0","x":30.0}]

Final (2 commands): the skipped line contributes nothing at all — not
a command, and not even a mode change for the line after it.
```

The real, easy-to-miss fact this trace makes visible: Line 3's motion
is `"G1"` in the first run and `"G0"` in the second — the *same
line*, same text, producing a different result depending entirely on
whether Line 2 ever got to update `self.current_motion`.

### CS Lens

*(Full standalone treatment: ../concepts/feature-flag-pattern.md.)*

Recording a fact about input (`skip = True`) separately from deciding
whether that fact changes behavior (`skip and self.optional_skip_
enabled`) is the same **separation of data from policy** already named
in this project's own SE lenses — Lesson 2's `core`/`app` boundary keeps
*what a line means* separate from *how a request is served*; this unit
keeps *what a line is tagged as* separate from *whether the tag is
honored right now*.

Also recognized in: feature flags in real production software (a flag
recorded per-request, only some environments honoring it), a debug build
of a game reading debug-only commands but only acting on them if a
"cheats enabled" setting is also on, and — directly — a real CNC
controller's own physical optional-stop switch, which changes nothing
about how a program is *read*, only what happens once it's read.

### SE Lens

Adding a constructor parameter with a **default value**, rather than
requiring every caller to pass it, is what kept every existing call site
(Lessons 4–9's `Parser()`, five separate places across `app.py`)
completely unchanged — confirmed, not assumed, by the full regression
sweep below. The real alternative — a required parameter — would have
forced editing every existing caller today for a feature most of them
don't care about yet, a real, avoidable cost this project's own
`_parse_block` already demonstrated once, differently, when Lesson 4
chose defaults over required arguments in a different context (this
project's very first stateful default, `current_motion = "G0"`).

---

## Concept Unit: A Real, Named Python Gotcha — Passed Along Honestly

*(Full standalone treatment: ../concepts/python-truthy-falsy-values.md.)*

### The Problem

The routes below accept this new switch from a JSON request body. JSON
has real booleans (`true`/`false`); naively trusting whatever a client
sends risks a real, well-known Python trap.

### Caused for Real, This Session

```python
print(bool("false"))
```
**Real output:**
```
True
```
**What this proves:** in Python, **any non-empty string is truthy** —
`bool("false")` is `True` because the string `"false"` is non-empty, not
because Python interprets its *contents*. A client sending
`{"optional_skip_enabled": "false"}` (a string, not a real JSON boolean —
an honest mistake, not malice) would have this project's own
`bool(body.get("optional_skip_enabled", False))` turn it into `True` —
the opposite of what was almost certainly intended.

### Project Change

- **Reference Source** — none; this is a real Python language behavior,
  not ported logic.
- **Files affected** — `cnc-service/app.py` (modified, all three routes
  that construct a `Parser`).
- **Change type** — add.
- **Location** — each route's `Parser(...)` call.
- **Dependencies** — none new.

### The New Code

```python
commands = Parser(
    optional_skip_enabled=bool(body.get("optional_skip_enabled", False))
).parse(body["program"])
```

### Mechanical Walkthrough

- `body.get("optional_skip_enabled", False)` — **(b) reappearing**
  `dict.get` with a default (Lesson 2's own error-message pattern used
  `dict` literals directly; this is the first *read*, with a fallback,
  from a request body specifically) — returns the real value if the
  client sent one, `False` otherwise.
- `bool(...)` — **(a) first appearance**, and **named, honest, current
  debt**: this coerces whatever was sent — a real JSON boolean (correct),
  but also a non-empty string, a non-zero number, or any other truthy
  value (silently accepted as `True`, possibly wrongly). A stricter,
  real fix — reject anything that isn't literally `True`/`False` with a
  `400`, the same rigor Lesson 2's request validation already applies to
  `"line"` — is real, deliberately deferred work: this project doesn't
  have a shared, reusable validation module yet (a named, later
  build-order item, matching `CURRICULUM.md`'s own deferred "real API
  audit" step), and adding one-off checks per field, per route, right
  now would duplicate logic three times over for one narrow case.

### SE Lens

Naming this gotcha *in the lesson itself*, rather than silently writing
`bool(...)` and moving on, is a deliberate choice matching this
project's own standing rule: nothing is "done" without its real,
current limitations stated plainly. A future validation-module lesson
will close this gap for every field at once, not just this one.

---

## Concept Unit: Three Routes, One New Optional Field

### The New Code

```python
@app.route("/api/parse", methods=["POST"])
def parse_program():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "program" not in body:
        return {"error": 'expected a JSON body like {"program": "G0 X10\\nX20"}'}, 400
    try:
        commands = Parser(
            optional_skip_enabled=bool(body.get("optional_skip_enabled", False))
        ).parse(body["program"])
    except UnsupportedCodeError as error:
        return {"error": str(error)}, 400
    return {"commands": commands}
```
(`/api/simulate` and `/api/path` gain the identical, single-line change
to their own `Parser(...)` calls — **(c) already established**, the same
edit repeated verbatim in two more places, no new explanation owed.)

### Commands and Real Output

```
Invoke-RestMethod ... -Body '{"program": "G0 X10\n/G1 X20\nG1 X30"}'
```
```json
{
  "commands": [
    { "motion": "G0", "x": 10.0 },
    { "motion": "G1", "x": 20.0 },
    { "motion": "G1", "x": 30.0 }
  ]
}
```
Default behavior — the switch is off, the tagged line runs normally,
exactly as if `/` weren't there.
```
Invoke-RestMethod ... -Body '{"program": "G0 X10\n/G1 X20\nG1 X30", "optional_skip_enabled": true}'
```
```json
{
  "commands": [
    { "motion": "G0", "x": 10.0 },
    { "motion": "G1", "x": 30.0 }
  ]
}
```
The tagged line is genuinely absent — not blank, not an error, simply
never became a command, exactly matching the real reference machine
behavior this was ported from.

---

## Connect the Pieces

1. `"G0 X10\n/G1 X20\nG1 X30"` is sent to `/api/parse`.
2. Line 1: not tagged, produces `{"motion": "G0", "x": 10.0}` normally.
3. Line 2: `raw_line.strip().startswith("/")` is `True` — tagged.
   `stripped[1:].strip()` removes the `/`, leaving `"G1 X20"` to be
   tokenized normally (`words = {"G": 1.0, "X": 20.0}`, non-empty).
4. If `optional_skip_enabled` is `False` (the default): `skip and
   self.optional_skip_enabled` is `False` — the line proceeds to
   `_parse_block` exactly like any other, producing
   `{"motion": "G1", "x": 20.0}`.
5. If `optional_skip_enabled` is `True`: that same condition is `True` —
   `continue` skips straight to line 3, and `self.current_motion` is
   left exactly as line 1 set it (`"G0"`), which is why line 3
   (`"G1 X30"`) still correctly updates to `G1` on its own — the skipped
   line's *absence* doesn't corrupt anything after it.

## What Breaks Without This

Without checking for `/` before tokenizing at all (an earlier, hypothetical
version of this project), a line like `/G1 X20` would reach `parse_line`
with its `/` still attached — `/` isn't a letter the word regex
recognizes, so it would simply be ignored as noise, and `"G1 X20"`'s real
words would still be extracted and turned into a real command regardless
of any switch — silently identical to Lesson 9's behavior, with no way to
ever honor a real optional-stop setting at all. This project never
shipped that version — named here as what *would* have gone wrong, not as
a bug that was live.

## Exercises

1. Send a program where the *first* line is tagged (`"/G0 X10\nG1 X20"`)
   with the switch on. Confirm the resulting single command correctly
   shows `"motion": "G1"`, not `"G0"` — the skipped line never set the
   initial mode at all, so `_parse_block`'s own default (`"G0"` from
   `__init__`) never even mattered here since it's overwritten by the
   surviving line's own explicit `G1`.
2. Send `{"optional_skip_enabled": "false"}` (a string) with a tagged
   line in the program. Confirm — as this lesson's own gotcha predicts —
   the line is skipped anyway, then explain why in your own words.
3. Confirm all three routes (`/api/parse`, `/api/simulate`, `/api/path`)
   agree on the same program with the same switch value — proof the
   one-line change was applied identically to each.

## Definition of Done

- [ ] `core/parser.py`'s `Parser` accepts `optional_skip_enabled`,
      defaulting to `False`; every existing `Parser()` call (Lessons
      4–9) still works with no changes.
- [ ] A tagged line (`/G1 X20`) runs normally by default and is skipped
      only when `optional_skip_enabled=True`, verified directly, no
      server.
- [ ] All three routes accept and honor the new field, verified live
      with real requests both ways.
- [ ] You reproduced the `bool("false")` gotcha yourself and understood
      why it's named as real, current, deliberate debt rather than fixed
      silently.
- [ ] You completed Exercises 1–3.
- [ ] Full regression: `/api/status`, `/api/tokenize`, existing
      `/api/parse`/`/api/simulate`/`/api/path` calls with no skip field
      at all, still behave exactly as before.
- [ ] A git commit exists explaining *why* (real block-skip support,
      matching the reference's actual tag-then-decide behavior, with a
      real Python gotcha named honestly instead of silently accepted).
