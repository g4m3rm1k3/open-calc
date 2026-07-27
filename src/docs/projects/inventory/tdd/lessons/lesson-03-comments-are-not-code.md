# Lesson 3: Comments Are Not Code

## What you will build

A fix for the real bug Lesson 3 (wait — Lesson 2) named and left open on
purpose: `core/lexer.py` gains `strip_comment()`, and a new `parse_line()`
that composes it with the existing `tokenize()`. `"G0 X10 (move to home
Y5)"` now correctly produces `{"words": {"G": 0.0, "X": 10.0}, "comment":
"move to home Y5"}` instead of hallucinating a real `Y` move out of a
comment. The transferable problem: **text that looks like data isn't
always data** — a comment, a string literal, a quoted CSV field all share
this same shape (content that must be recognized and set aside *before*
the real parsing rules run, or it corrupts them).

## What you need to know first

Lesson 2: `re.compile`, capture groups, `tokenize()`'s fold-into-a-dict
pattern, and the exact bug this lesson closes — a comment's `Y5` was
mistaken for a real `Y` word because comment text was never removed
before the word regex ran.

## Concepts cataloged from this lesson

Every concept this lesson introduces now has its own isolated, runnable
entry in `../concepts/` (per `extraction.md`'s Concept Catalog Rule).
Smaller than Lessons 1-2's lists — most of what this lesson needs (regex
basics, `re.compile`, capture groups) is a real 100% match to what Lesson 2
already cataloged, reused rather than retaught:

`regex-negated-character-class` · `python-regex-sub` ·
`python-tuple-unpacking` · `function-composition` ·
`open-closed-principle` · `lexer-preprocessing-before-parsing`

## Pipeline diagram

Still `Text → Tokens → Commands → Machine State → Points → Picture`, still
only the `Text → Tokens` stage. Concrete value carried through: the same
buggy input from Lesson 2's own "What Breaks" section,
`"G0 X10 (move to home Y5)"`, now produces the *correct* tokens,
`{"G": 0.0, "X": 10.0}` — no `Y` — proving the fix, not just describing it.

---

## Concept Unit: Comments Are a Lexer Concern, Not a Parser Concern

*(Full standalone treatment: `../concepts/lexer-preprocessing-before-parsing.md`
(the CS Lens below).)*

### The Problem

Lesson 2 demonstrated the bug live: a G-code comment's contents can
contain letters and numbers that look exactly like real words. If
comment-removal happens *after* word extraction, there's no way to tell
"real X10" from "the X10 someone happened to write inside a comment" —
by the time word-extraction runs, that distinction is already lost.
Comment-removal has to happen strictly *before* word extraction.

### Reference Source, Read for Real This Session

`cnc/CNCEngine.ts` lines 1120–1137, inside `GCodeParser._parseLine`:
```ts
// Extract comment
let cmt = "";
let clean = rest;
if (this.syntax.blockComment) {
  const [o, c] = this.syntax.blockComment;
  const cm = rest.match(new RegExp(`\\${o}([^\\${c}]*)\\${c}`));
  if (cm) cmt = cm[1].trim();
  clean = rest
    .replace(new RegExp(`\\${o}[^\\${c}]*\\${c}`, "g"), "")
    .trim();
}
if (this.syntax.lineComment) {
  const idx = clean.indexOf(this.syntax.lineComment);
  if (idx >= 0) {
    cmt = cmt || clean.slice(idx + 1).trim();
    clean = clean.slice(0, idx).trim();
  }
}
```
**Named, deliberate deviations from this real source, stated honestly
rather than silently:**
1. The reference reads comment delimiters (`this.syntax.blockComment`,
   `this.syntax.lineComment`) from a per-dialect `MachineSyntax` config —
   different machine controllers use different comment characters. That
   config system (`MACHINE_DEFINITIONS`) doesn't exist in this project
   yet — it's `CURRICULUM.md`'s build-order priority #4, "machine types,"
   several lessons away. This lesson hardcodes the two nearly-universal
   forms instead: parenthetical comments `( ... )` and semicolon-to-end-
   of-line `; ...`. When real per-dialect syntax config is built, this
   function is the one that will read from it instead of a hardcoded
   pattern — named forward debt, not hidden.
2. The reference does this inside `_parseLine`, a larger function that
   also handles block-skip (`/`), sub-program detection (`O`-numbers),
   sequence numbers, and channel tags — none of which exist in this
   project yet. Comment-handling is pulled out here as its own function,
   `strip_comment()`, living in `core/lexer.py` next to `tokenize()`
   rather than folded into one larger function — a deliberate choice
   explained in this unit's SE Lens below, not a claim that the reference
   structures its code identically.

The actual algorithm — find a parenthetical comment, remember its
content, remove all such comments from the line, then check for a
semicolon and do the same — is ported faithfully; only the *packaging*
differs, for stated reasons.

### The Concept, Isolated — Escalating Real Input

No new regex syntax is needed beyond what Lesson 2 already taught
(`re.compile`, capture groups, `.search`, `.sub`) — this unit reuses it
directly rather than re-teaching it, per the Repetition Rule. Verified
directly against the real function, in increasing complexity, this
session:

```python
from core.lexer import strip_comment

tests = [
    "G0 X10 (move to home Y5)",
    "G0 X10 ; move fast",
    "(start) G0 (rapid) X10",
    "G0 X10 Y20",
]
for t in tests:
    print(repr(t), "->", strip_comment(t))
```
```
'G0 X10 (move to home Y5)' -> ('G0 X10', 'move to home Y5')
'G0 X10 ; move fast' -> ('G0 X10', 'move fast')
'(start) G0 (rapid) X10' -> ('G0  X10', 'start')
'G0 X10 Y20' -> ('G0 X10 Y20', '')
```
Each case changes one thing: a trailing block comment, a trailing line
comment, *two* block comments on one line (proving only the *first* one's
text is kept as `comment`, while *all* of them are removed from `clean`),
and a line with no comment at all (proving nothing is altered when there's
nothing to strip).

### Project Change

- **Reference Source** — `cnc/CNCEngine.ts` lines 1120–1137, quoted and
  reconciled above, with two named deviations (hardcoded universal
  delimiters instead of per-dialect config; a standalone function instead
  of folded into a larger one).
- **Files affected** — `cnc-service/core/lexer.py` (modified).
- **Change type** — add (a new function, `tokenize` unchanged).
- **Location** — `core/lexer.py`, alongside the existing `_WORD_RE` and
  `tokenize`.
- **Dependencies** — none beyond `re`, already imported.

*(The pattern itself: `../concepts/regex-negated-character-class.md`
(`[^)]`), and `../concepts/python-regex-sub.md` (`.sub`, used below).)*

### The New Code

```python
_BLOCK_COMMENT_RE = re.compile(r"\(([^)]*)\)")


def strip_comment(line):
    comment = ""
    match = _BLOCK_COMMENT_RE.search(line)
    if match:
        comment = match.group(1).strip()
    clean = _BLOCK_COMMENT_RE.sub("", line).strip()

    semicolon_index = clean.find(";")
    if semicolon_index >= 0:
        if not comment:
            comment = clean[semicolon_index + 1:].strip()
        clean = clean[:semicolon_index].strip()

    return clean, comment
```

### The Updated Project

The full, current `core/lexer.py`, nothing elided:

```python
import re

_WORD_RE = re.compile(r"([A-Za-z])\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")
_BLOCK_COMMENT_RE = re.compile(r"\(([^)]*)\)")


def strip_comment(line):
    comment = ""
    match = _BLOCK_COMMENT_RE.search(line)
    if match:
        comment = match.group(1).strip()
    clean = _BLOCK_COMMENT_RE.sub("", line).strip()

    semicolon_index = clean.find(";")
    if semicolon_index >= 0:
        if not comment:
            comment = clean[semicolon_index + 1:].strip()
        clean = clean[:semicolon_index].strip()

    return clean, comment


def tokenize(line):
    words = {}
    for match in _WORD_RE.finditer(line):
        letter = match.group(1).upper()
        value = float(match.group(2))
        if letter in ("N", "O"):
            continue
        if letter not in words:
            words[letter] = value
        elif isinstance(words[letter], list):
            words[letter].append(value)
        else:
            words[letter] = [words[letter], value]
    return words


def parse_line(line):
    clean, comment = strip_comment(line)
    return {"words": tokenize(clean), "comment": comment}
```
As a whole, `core/lexer.py` now has three functions instead of one:
`strip_comment` (new), `tokenize` (Lesson 2, byte-for-byte unchanged), and
`parse_line` (new — explained in the next unit), which is what the rest of
the project will actually call going forward.

### Mechanical Walkthrough

- `_BLOCK_COMMENT_RE = re.compile(r"\(([^)]*)\)")` — **(b) `re.compile`
  reappearing** (Lesson 2); the pattern itself is **(a) first
  appearance**: `\(` and `\)` — literal parenthesis characters, escaped
  with `\` because bare `(`/`)` in a regex mean "start/end a capture
  group," not "match a literal parenthesis." `([^)]*)` — a capture group
  matching zero-or-more characters that are *not* a closing paren:
  `[^)]` is a **negated character class** (the `^` immediately inside
  `[...]` means "anything except what follows" — a different meaning
  than `^` used outside brackets, which anchors to the start of a
  string, worth distinguishing explicitly since both use the same
  character). `*` (zero-or-more) rather than `+` (one-or-more, used for
  the number pattern in Lesson 2) because an empty comment, `()`, is
  valid and should match too.
- `match = _BLOCK_COMMENT_RE.search(line)` — **(b) reappearing**
  (`.search`, Lesson 2's disposable lab) — finds the *first* parenthetical
  comment only, matching the reference's own `rest.match(...)` (a
  non-global match, first-only) at line 1124.
- `comment = match.group(1).strip()` — **(b) reappearing** `.group(1)`
  (Lesson 2); `.strip()` is already-known basic Python (removes leading/
  trailing whitespace).
- `clean = _BLOCK_COMMENT_RE.sub("", line).strip()` — **(a) first
  appearance** of `.sub(replacement, text)`: replaces *every* match of the
  pattern in `text` with `replacement` — here, `""`, meaning "delete every
  parenthetical comment," matching the reference's `.replace(regex, "",
  "g")` (JavaScript's `g` flag for "replace all," which Python's `.sub`
  does *by default* with no flag needed — a real, small, worth-naming
  difference between the two languages' regex APIs doing the same job
  with different defaults).
- `semicolon_index = clean.find(";")` — already-known basic Python
  (`str.find`, returns the index of the first match or `-1`); applied
  here to look for a line-comment marker in whatever text is left after
  block comments were already removed — matching the reference's
  `clean.indexOf(...)` running on its own already-block-comment-stripped
  `clean` at line 1132, same order of operations.
- `if semicolon_index >= 0:` — a plain comparison, already-known basic
  Python; `>= 0` rather than `!= -1` is a stylistic choice matching how
  the reference itself checks the identical condition at line 1133.
- `if not comment: comment = clean[semicolon_index + 1:].strip()` — a
  **slice** (already-known basic Python), taking everything *after* the
  semicolon; only assigned if `comment` is still empty (no block comment
  was found first) — this is Python's version of the reference's
  `cmt = cmt || clean.slice(idx + 1).trim()` (JavaScript's `||` returning
  its right side only when its left side is "falsy" — an empty string
  counts as falsy in both languages, which is exactly why `if not
  comment:` faithfully reproduces that same "prefer the block comment,
  fall back to the line comment" precedence).
- `clean = clean[:semicolon_index].strip()` — a slice taking everything
  *before* the semicolon, discarding the comment text from the code side.
- `return clean, comment` — returning two values as a **tuple** — already
  covered basic Python syntax (returning multiple comma-separated values
  from a function bundles them into a tuple automatically); the calling
  code (`clean, comment = strip_comment(line)`, in the next unit) is what
  actually unpacks it back into two separate names.

### Execution Trace

The escalating-input table above shows final results for 4 real lines,
but never the internal `search`-vs-`sub` split — worth tracing directly
for the one genuinely interesting case, `"(start) G0 (rapid) X10"`
(two block comments on one line):

```
line = "(start) G0 (rapid) X10"

match = _BLOCK_COMMENT_RE.search(line)
  → finds the FIRST parenthetical only: "(start)", group(1) = "start"
  comment = "start".strip() = "start"

clean = _BLOCK_COMMENT_RE.sub("", line).strip()
  → .sub() removes EVERY match, not just the first:
    "(start)" removed, AND "(rapid)" removed
  → "  G0  X10".strip() = "G0  X10"   (the double space between G0 and
    X10 is real — it's where "(rapid)" used to be, .sub() doesn't
    collapse the gap it leaves behind)

semicolon_index = clean.find(";") on "G0  X10" → -1 (no semicolon)
  if semicolon_index >= 0: → False, skipped entirely

return ("G0  X10", "start")
```

`search()` and `sub()` run independently against the *same* original
`line`, not one after another on shrinking text — `search()` only ever
looks for the first match (which is why `"rapid"` never becomes
`comment`), while `sub()` separately finds and removes every match
regardless of what `search()` found. That's the real mechanism behind
"only the first block comment's text is kept, but all of them are
removed."

### CS Lens

Recognizing and discarding a specific sub-pattern (a comment) before the
"real" grammar's rules apply is exactly what a real lexer's
**comment/whitespace-skipping rule** does — this project's own earlier
`Guide.md` names this precise reason for splitting lexing from parsing at
all: *"we separate tokenising from parsing because the parser should
never have to think about whitespace, comments, or raw characters."* This
unit is that principle's first real, working instance in this codebase,
not just a quoted idea.

Also recognized in: every real programming language's lexer stripping
`//` and `/* */` comments before tokenizing actual code, HTML parsers
discarding `<!-- -->`, CSV parsers handling quoted fields that may
contain the delimiter character itself (a different flavor of the exact
same "content that looks like structure but isn't" problem).

### SE Lens

*(Full standalone treatment: `../concepts/open-closed-principle.md`.)*

Folding comment-stripping directly into `tokenize()` (making one bigger
function do both jobs) was a real, considered alternative — fewer total
functions, one call site instead of two. It was rejected here for a
concrete, statable reason: `tokenize()`'s whole existing test coverage
and behavior (Lesson 2, byte-for-byte unchanged above) had zero reason to
change to fix a comment bug, and it still doesn't — proof, not just
assertion, of the **open/closed principle**: `tokenize` stayed closed for
modification; new behavior arrived by composing a new function alongside
it (in the next unit), the same shape as Lesson 2's own restated instance
of this principle. The real cost of *not* separating: a future change to
comment syntax (say, adding `#`-style comments) would risk touching
word-extraction code that has nothing to do with comments at all,
widening the blast radius of an unrelated change.

---

## Concept Unit: Composing Two Small Functions Into One Real Operation

*(Full standalone treatment: `../concepts/python-tuple-unpacking.md`
(`clean, comment = ...`) and `../concepts/function-composition.md` (the CS
Lens below).)*

### The Problem

`strip_comment()` alone doesn't tokenize anything; `tokenize()` alone
doesn't know about comments. Something needs to run them in the right
order and package both results together — since a route needs one
concrete answer to send back, not two separate function calls'-worth of
loose ends.

### The New Code

```python
def parse_line(line):
    clean, comment = strip_comment(line)
    return {"words": tokenize(clean), "comment": comment}
```

### The Updated Project

Already shown whole in the previous unit's "Updated Project" — this unit's
walkthrough covers this function specifically.

### Mechanical Walkthrough

- `def parse_line(line):` — already-known basic Python.
- `clean, comment = strip_comment(line)` — **(a) first appearance** of
  **tuple unpacking**: `strip_comment` returns one two-element tuple;
  writing two comma-separated names on the left assigns the tuple's first
  element to `clean` and second to `comment` in one line, rather than
  indexing (`result[0]`, `result[1]`) — the same general Python feature
  that lets `for match in ...:` implicitly unpack, though this is its
  first *explicit*, standalone appearance in this project.
- `return {"words": tokenize(clean), "comment": comment}` — a dict
  literal, already-known basic Python, calling **(b) `tokenize`
  reappearing**, unchanged since Lesson 2, now given the *cleaned* text
  instead of the raw line — this single word, `clean` instead of `line`,
  is the entire fix for the bug Lesson 2 demonstrated.

### CS Lens

Two small, single-purpose functions combined by a third, thin function
that only sequences them is **function composition** — building a bigger
capability out of smaller, independently-understandable, independently-
testable pieces, rather than one function that does everything at once.

Also recognized in: Unix pipes (`cat file | grep pattern | sort` — each
program does one job, composed by the shell), functional-programming
pipelines generally, and this project's own eventual `Text → Tokens →
Commands → Machine State → Points → Picture` pipeline, which is this same
idea at a much larger scale — a chain of focused stages, not one giant
function.

### SE Lens

`parse_line` is now the *real* public entry point for turning a line of
text into structured data — `tokenize` and `strip_comment` are lower-level
pieces it's built from. Naming this distinction matters: a future caller
(the parser being built in an upcoming lesson) should call `parse_line`,
not `tokenize` directly, or it'll reintroduce the exact comment bug this
lesson just fixed. That's a real, human convention this code can't enforce
by itself (Python won't stop something from calling `tokenize` directly) —
worth stating honestly as a limit of this design, not glossed over.

---

## Concept Unit: The Route That Didn't Need to Change Its Shape

### Project Change

- **Reference Source** — none; this is wiring already-ported logic into
  the existing route.
- **Files affected** — `cnc-service/app.py` (modified).
- **Change type** — replace (one import, one function call).
- **Location** — the `tokenize_line` route function.
- **Dependencies** — `core.lexer.parse_line`, from the previous unit.

### The New Code

```python
from core.lexer import parse_line

# ...

@app.route("/api/tokenize", methods=["POST"])
def tokenize_line():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "line" not in body:
        return {"error": 'expected a JSON body like {"line": "G0 X10"}'}, 400
    return parse_line(body["line"])
```

### Mechanical Walkthrough

- `from core.lexer import parse_line` replaces Lesson 2's
  `from core.lexer import tokenize` — **(c) already-established** import
  syntax, just naming a different function.
- `return parse_line(body["line"])` replaces Lesson 2's
  `return {"words": tokenize(body["line"])}` — the route no longer builds
  the response dict itself; `parse_line` already returns the exact right
  shape (`{"words": ..., "comment": ...}`). The route's validation logic
  (the `if not isinstance(...)` check above it) is **completely
  untouched** — it never needed to know anything changed underneath it.

### CS Lens / SE Lens

*(Full standalone treatment: `../concepts/open-closed-principle.md`.)*

Same open/closed instance as the first unit's SE Lens, viewed from the
caller's side this time: the route's *validation* logic (what makes a
request well-formed) and the *parsing* logic (what a well-formed request's
data means) are different concerns, and neither had to change to
accommodate the other changing. This is the concrete, visible payoff of
Lesson 2's `core`/`app` boundary: a real bug fix inside `core/` required
editing `app.py` in exactly one place — a single function name — with the
frontend needing **zero changes at all**, verified next.

### Commands and Real Output

Server restarted; the exact bug case from Lesson 2's "What Breaks"
section, re-run:
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tokenize" -Method Post -ContentType "application/json" -Body '{"line": "G0 X10 (move to home Y5)"}'

comment          words
-------          -----
move to home Y5  @{G=0.0; X=10.0}
```
No phantom `Y`. Regression check — Lesson 1 and 2's existing behavior,
confirmed still correct:
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/status"

machine    position               status
-------    --------               ------
mill-3axis @{x=0.0; y=0.0; z=0.0} idle

Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tokenize" -Method Post -ContentType "application/json" -Body '{"line": "G0 X10 Y20"}'

comment words
------- -----
        @{G=0.0; X=10.0; Y=20.0}
```
The frontend (`templates/index.html`) was not touched at all this
lesson — opening it in a browser and tokenizing a line with a comment
now shows the correct `words` *and* a new `comment` field, entirely
because the page already just displays whatever JSON comes back,
unchanged since Lesson 1.

---

## Connect the Pieces

The exact value from Lesson 2's own "What Breaks Without This," traced
through the fix:

1. `"G0 X10 (move to home Y5)"` is sent as `{"line": "..."}` to
   `POST /api/tokenize` — same request shape as Lesson 2, no frontend
   change needed.
2. The route's validation (Lesson 2, unchanged) confirms the body is a
   dict with a `"line"` key, then calls `parse_line(body["line"])`.
3. `parse_line` calls `strip_comment(line)` first: `_BLOCK_COMMENT_RE`
   finds `"(move to home Y5)"`, captures `"move to home Y5"` as the
   comment, and removes it, leaving `clean = "G0 X10"`.
4. `parse_line` then calls `tokenize(clean)` — **not** `tokenize(line)` —
   so the word regex only ever sees `"G0 X10"`, correctly producing
   `{"G": 0.0, "X": 10.0}` with no phantom `Y`.
5. `{"words": {"G": 0.0, "X": 10.0}, "comment": "move to home Y5"}` is
   returned, serialized to JSON by Flask exactly as in Lesson 1 and 2,
   and displayed by the same, untouched frontend code.

## What Breaks Without This

Already shown as this lesson's entire motivating problem — reverting
`parse_line` to call `tokenize(line)` (the raw line) instead of
`tokenize(clean)` would silently reintroduce Lesson 2's exact bug. Real,
caused, then reverted, this session:
```python
# temporarily reverted, run directly, no server:
def parse_line_broken(line):
    clean, comment = strip_comment(line)
    return {"words": tokenize(line), "comment": comment}  # bug: line, not clean

print(parse_line_broken("G0 X10 (move to home Y5)"))
```
```
{'words': {'G': 0.0, 'X': 10.0, 'Y': 5.0}, 'comment': 'move to home Y5'}
```
The phantom `Y` is back — a single-word difference (`line` instead of
`clean`) between correct and broken, which is exactly why this bug was so
easy to introduce silently in the first place, and why it's worth seeing
reproduced on purpose once.

## Exercises

1. In the browser, tokenize `"X10 (fast) Y20 (slow)"` — two block
   comments on one line. Predict which comment's text will show in the
   `comment` field before clicking; confirm from this lesson's
   walkthrough which line of code makes that specific one win.
2. Tokenize a line that is *only* a comment, e.g. `"(just a note)"`.
   Confirm `words` comes back as an empty object `{}` and explain, from
   `tokenize`'s own Lesson 2 code (unchanged), why an empty string input
   produces that.
3. Tokenize `"G0 X10 ;"` — a semicolon with nothing after it. Confirm
   `comment` comes back as an empty string rather than an error, and
   trace why through `strip_comment`'s slicing.

## Definition of Done

- [ ] `core/lexer.py` has `strip_comment`, `tokenize` (byte-for-byte
      unchanged from Lesson 2), and `parse_line`.
- [ ] `from core.lexer import parse_line; parse_line("G0 X10 (move to
      home Y5)")`, run directly with no server, returns
      `{'words': {'G': 0.0, 'X': 10.0}, 'comment': 'move to home Y5'}`.
- [ ] `POST /api/tokenize` with that same line, through the running
      server, returns the same corrected result.
- [ ] You reproduced the broken version (`tokenize(line)` instead of
      `tokenize(clean)`) yourself and saw the phantom `Y` return, then
      restored the fix.
- [ ] You completed Exercises 1–3 and observed the described behavior.
- [ ] A git commit exists explaining *why* (a real, previously-named bug
      is now fixed, and the fix required touching `core/` in one place
      with zero changes to `app.py`'s validation logic or the frontend),
      not just *what* changed.
