# Lesson 10: Turning Characters Into Structured Tokens

## What you will build

A real, hand-written lexer for G-code — no regular expressions, per this
project's own `BRD.md`, which explicitly calls for "a real lexer/parser
producing an AST (not regex-based)" — plus a `/tokens` route and an
on-screen panel showing exactly what it found. The feature is "show me
the tokens"; the actual subject is the first stage of this project's own
stated architecture, `Text → Lexer → Parser → AST → Semantic Analysis →
IR`, and the specific scanning technique every real lexer is actually
built from underneath, regardless of language.

## What you need to know first

`Lesson 2 - Browsing the File System.md` — the `for` loop, `.split()`/
`.join()`. `Lesson 3`'s `BaseModel`, contrasted here with a different
kind of structured class. `Lesson 5`/`Lesson 6` — the traversal/existence/
suffix checks, reused unchanged again. `Lesson 9`'s Problems panel — this
lesson's Tokens panel reuses its exact shape. `Lesson 4`'s `.className`
assignment — reused, then revised, in this lesson's second half.

---

## Concept Unit: why splitting on whitespace isn't a real lexer

### The Problem

Every backend route in this project has treated file content as a plain
string. G-code needs more than that — it needs to be broken into the
individual pieces (`G01`, `X10.5`, `F500`, ...) a parser could eventually
reason about. The obvious first instinct is `line.split()`, the same
method already used on paths back in Lesson 2. Real G-code breaks that
instinct immediately: spaces between words are *optional* — a controller
that receives `G01X10.5Y-20F500` runs it exactly the same as
`G01 X10.5 Y-20 F500`. Confirmed directly:

```python
line = "G01X10.5Y-20F500"
print(line.split())
```

Actual output:

```
['G01X10.5Y-20F500']
```

`.split()` returns the entire line as one single item — it has no idea
`G01`, `X10.5`, `Y-20`, and `F500` are four separate, meaningful pieces,
because nothing in the string actually separates them the way `.split()`
requires.

### What This Proves

A real lexer can't rely on a delimiter existing at all — it has to
recognize *where one meaningful piece ends and the next begins* purely
from the shape of the characters themselves: a letter followed by a
number is one piece, regardless of whether whitespace happens to
surround it. That's a fundamentally different kind of scanning than
splitting on a character that may or may not be there.

---

## Concept Unit: scanning with a cursor

### The Problem

Recognizing "a letter, then however many digits follow it, then stop"
needs a technique that can look at one character, decide how *many more*
characters belong with it, and move forward by exactly that many — not
something `.split()`, `.join()`, or a plain `for char in text:` loop can
do, since none of them let you look ahead or control how far you advance
per step.

### Concept Lab

```python
text = "ab123cd45"
i = 0
tokens = []
while i < len(text):
    char = text[i]
    if char.isdigit():
        start = i
        while i < len(text) and text[i].isdigit():
            i += 1
        tokens.append(text[start:i])
    else:
        tokens.append(char)
        i += 1
print(tokens)
```

Run it. Actual output:

```
['a', 'b', '123', 'c', 'd', '45']
```

### What This Proves

`i = 0` is a **cursor** — a plain integer this code controls by hand,
tracking exactly one position in the string. `while i < len(text):` is
the outer loop, bounded by the cursor instead of iterating the string
directly. `text[i]` reads the character at the cursor without consuming
anything — a **lookahead**: checking what's there before deciding what
to do. When that character is a digit, a *second*, inner `while` loop
advances `i` for as long as digits keep appearing, and `text[start:i]`
slices out the whole run at once — `"123"` and `"45"` each collected as
one token, not three or two separate ones. When it isn't a digit, the
cursor advances by exactly one and that single character becomes its own
token. This is the core technique: a mutable cursor, plus a loop that
can advance it by a *variable* number of steps depending on what it
finds — something no built-in string method hands you directly.

### Discard

This code is deleted now — `text`, `tokens`, and this exact loop never
appear in the project. The real lexer applies this identical
cursor-and-lookahead technique to actual G-code words, not letters and
digit runs in a throwaway string.

---

## Concept Unit: a place for a real lexer to live

### The Problem

This project's backend has been one file, `main.py`, since Lesson 1.
`BRD.md` names G-code as a **language plugin** — its own lexer, parser,
AST, and semantic analysis, explicitly meant to plug into this platform
without requiring changes to anything else. Adding a hand-rolled
tokenizer directly into `main.py` would work today, but it would also be
the first crack in that boundary — the moment a second language plugin
needs its own lexer, `main.py` becomes the one file everything is
tangled into.

### Project Change

- **Files affected** — `backend/gcode/__init__.py` (new, empty — marks
  `gcode` as an importable Python package) and `backend/gcode/lexer.py`
  (new).
- **Change type** — create.
- **Dependencies** — none; `dataclasses` is part of Python's standard
  library.

### SE Lens — a module boundary, drawn before it's forced

This is the same instinct behind Lesson 6's `RUNNERS` dictionary —
keeping one concern (running code) from growing branches inside another
(the route itself) — applied one level higher, at the level of *files*
instead of *functions*. Putting G-code's lexer in its own `gcode/`
package costs nothing today, since nothing else imports from it yet, but
it's the same principle `BRD.md` names explicitly as a deliberate,
up-front decision for this exact reason: a second language plugin,
whenever it arrives, gets its own package too, and neither one has any
reason to touch the other's files.

---

## Concept Unit: a token as a plain structured record

### The Problem

A scan needs somewhere to put what it finds — at minimum, what *kind* of
thing it found, and the original text — plus, for a word specifically, a
letter and a numeric value.

### Project Change

- **Files affected** — `backend/gcode/lexer.py`, the new empty file.
- **Change type** — add; this is the first code in the file.

### The New Code — type this

```python
from dataclasses import dataclass


@dataclass
class Token:
    type: str
    text: str
    letter: str | None = None
    value: float | None = None
```

### The Updated Project — where this lives

This is the entire file so far — nothing exists in `lexer.py` yet for
this to sit alongside.

### Mechanical Walkthrough
`from dataclasses import dataclass` imports a decorator from Python's
standard library — the same **import statement** shape used throughout
- this project, a new specific name.
- `@dataclass` is a new decorator — the
same underlying mechanism as `@app.get(...)` back in Lesson 1, attaching
- behavior to `Token` without modifying its body directly — but where
`@app.get` registers a route, `@dataclass` automatically writes an
`__init__` method (and a few others) *for* the class, based purely on
the field declarations below it, so nothing here has to hand-write
`def __init__(self, type, text, letter=None, value=None): ...` the way
plain Python normally would. `type: str` and `text: str` declare two
required fields, typed exactly like the `BaseModel` fields from Lesson
3's `FileEdit`. `letter: str | None = None` is new on two counts: `str |
- None` is a **union type** — this field's declared type is *either* a
`str` *or* specifically the value `None`, the first time this project
has said a value is allowed to be one of two different types rather than
exactly one; ` = None` gives it a default, so a `Token` can be
constructed without supplying `letter` at all. `value: float | None =
None` is the identical shape, for a numeric field instead of a string
one.

### CS Lens — a record, not a validated model

`Token` looks like `FileEdit` from Lesson 3 — a class with typed fields —
but it's a fundamentally different tool. `BaseModel` *validates*:
constructing a `FileEdit` with the wrong type actively fails, as
demonstrated with `Dog` in Lesson 3's own concept lab. `@dataclass`
*structures*: it exists purely to hold named data conveniently, with no
runtime check that `type` is really a string or `value` is really a
number or `None` — nothing stops `Token(type=123, text=None)` from
constructing successfully. `Token` doesn't need Pydantic's guarantee,
because it's never built from untrusted external input the way
`FileEdit` is — it's built entirely by this project's own lexer code, a
few lines from now, which is already trusted to get it right. Reaching
for the lighter, unvalidated tool once validation isn't actually buying
anything is itself a real engineering decision, not a shortcut.

---

## Concept Unit: recognizing a comment

### The Problem

G-code comments are wrapped in parentheses and can contain literally
anything inside them, including spaces and even other punctuation — the
lexer can't just consume one character and move on; it has to find the
matching close-paren, wherever it is.

### Project Change

- **Files affected** — `backend/gcode/lexer.py`, existing file.
- **Change type** — add, a new `tokenize_line` function.
- **Dependencies** — `Token` from the previous unit.

### The New Code — type this

```python
def tokenize_line(line: str) -> list[Token]:
    tokens = []
    i = 0
    length = len(line)

    while i < length:
        char = line[i]

        if char.isspace():
            i += 1
            continue

        if char == "(":
            end = line.find(")", i)
            if end == -1:
                end = length - 1
            text = line[i:end + 1]
            tokens.append(Token(type="COMMENT", text=text))
            i = end + 1
            continue
```

### The Updated Project — where this lives

`tokenize_line` is a brand-new function — the whole block above is
everything there is to see; the word-recognition branch and the closing
return are built in the next two units, directly inside this same
function.

### Mechanical Walkthrough
`def tokenize_line(line: str) -> list[Token]:` reuses the parameter-type
- and return-type annotation shapes from Lessons 1 and 6 — `list[Token]`
is new only in being a list *of* a project-defined type, the same
bracket syntax already used for `list[list[Token]]` nowhere yet but
familiar from ordinary typed lists. `tokens = []`, `i = 0`, and `length =
len(line)` set up the exact cursor-and-collector shape from the concept
- lab — `i` is the cursor, `tokens` collects results, `length` is computed
once instead of calling `len(line)` repeatedly inside the loop. `while i
< length:` and `char = line[i]` reuse the concept lab's outer loop and
- lookahead exactly.
- `char.isspace()` — reused from Python's string methods, the same family as `.isdigit()` from the lab — skips whitespace

without producing a token for it at all; `continue` reuses the loop-skip
keyword, jumping straight back to the `while` condition. `char == "("`
tests for the start of a comment. `line.find(")", i)` is new: `.find()`
searches a string for a substring — here, a single character — starting
from position `i`, and returns its index, or `-1` if it's never found at
all, the same "not found" convention Python's dictionaries used with
- `.get()` back in Lesson 6.
- `if end == -1: end = length - 1` handles a
genuinely broken input — an unterminated comment with no closing
parenthesis — by treating the rest of the line as the comment instead of
crashing; confirmed directly:

```python
tokenize_line("(unterminated comment")
```

Actual output:

```
[Token(type='COMMENT', text='(unterminated comment', letter=None, value=None)]
```

- `line[i:end + 1]` slices out the comment, parentheses included — `+ 1`
because slicing excludes its end index, and the closing `)` itself needs
to be part of the captured text. `tokens.append(Token(type="COMMENT",
- text=text))` constructs a `Token` — `letter` and `value` are left
unset, falling back to the `None` defaults declared in the previous
unit, since a comment has neither. `i = end + 1` moves the cursor past
the whole comment in one jump, not one character at a time.

---

## Concept Unit: recognizing a word

### The Problem

Everything else meaningful in a line of G-code is a **word**: a single
letter immediately followed by a number, which may be negative and may
have a decimal point — `G01`, `X-10.5`, `F500` are all the same shape.

### Project Change

- **Files affected** — `backend/gcode/lexer.py`, existing file.
- **Change type** — add, continuing directly inside `tokenize_line`,
  immediately after the comment branch from the previous unit.
- **Dependencies** — none new.

### The New Code — type this

```python
        if char.isalpha():
            letter = char.upper()
            start = i
            i += 1
            if i < length and line[i] in "+-":
                i += 1
            while i < length and (line[i].isdigit() or line[i] == "."):
                i += 1
            text = line[start:i]
            number_text = text[1:]
            value = float(number_text) if number_text not in ("", "-", "+") else None
            tokens.append(Token(type="WORD", text=text, letter=letter, value=value))
            continue

        start = i
        i += 1
        tokens.append(Token(type="UNKNOWN", text=line[start:i]))

    return tokens
```

### The Updated Project — where this lives

Now see the complete function, every branch in place:

```python
def tokenize_line(line: str) -> list[Token]:
    tokens = []
    i = 0
    length = len(line)

    while i < length:
        char = line[i]

        if char.isspace():
            i += 1
            continue

        if char == "(":
            end = line.find(")", i)
            if end == -1:
                end = length - 1
            text = line[i:end + 1]
            tokens.append(Token(type="COMMENT", text=text))
            i = end + 1
            continue

        if char.isalpha():                                              # ← new
            letter = char.upper()                                        # ← new
            start = i                                                    # ← new
            i += 1                                                       # ← new
            if i < length and line[i] in "+-":                           # ← new
                i += 1                                                   # ← new
            while i < length and (line[i].isdigit() or line[i] == "."):  # ← new
                i += 1                                                   # ← new
            text = line[start:i]                                         # ← new
            number_text = text[1:]                                       # ← new
            value = float(number_text) if number_text not in ("", "-", "+") else None  # ← new
            tokens.append(Token(type="WORD", text=text, letter=letter, value=value))  # ← new
            continue                                                     # ← new

        start = i                                                        # ← new
        i += 1                                                           # ← new
        tokens.append(Token(type="UNKNOWN", text=line[start:i]))         # ← new

    return tokens                                                        # ← new
```

`tokenize_line` is now complete: whitespace is skipped, comments are
captured whole, words are captured as letter-plus-number pairs, and
anything matching none of those three (a stray character this lesson's
minimal grammar doesn't recognize) becomes a one-character `UNKNOWN`
token instead of silently vanishing or crashing the whole scan.

### Mechanical Walkthrough
`char.isalpha()` tests for a letter, the branch this whole unit adds.
`letter = char.upper()` reuses `.upper()` from Lesson 8's decorator lab,
here for a real reason: some real G-code is written in lowercase, and
normalizing to uppercase means `g01` and `G01` produce the identical
token. `start = i` marks where this word begins, the same
mark-then-slice-later pattern from the concept lab. `i += 1` moves past
the letter itself. `if i < length and line[i] in "+-": i += 1` is new: an
- optional sign — `in "+-"` checks whether a single character is one of
two specific characters, reusing the `in` operator against a string
rather than a collection like `valid_tokens` in Lesson 8; if a sign is
there, the cursor consumes it, and if not, this `if` simply does
nothing, leaving `i` right where it was. The `while` loop directly below
it is the concept lab's exact digit-scanning technique, with one
addition: `or line[i] == "."`, so a decimal point is treated the same as
- a digit — both keep the number growing.
- `text = line[start:i]` slices out the whole word, letter and number together — `"X10.5"`, `"G01"`,

whatever was actually scanned. `number_text = text[1:]` reuses ordinary
string slicing to drop just the first character — the letter — leaving
only the numeric part. `float(number_text) if number_text not in ("",
"-", "+") else None` is a ternary, reused from Lesson 2, guarding a real
edge case: a bare letter with no digits after it (just `X`, or a lone
`+`/`-` with nothing following) would make `float(...)` raise a
- `ValueError` if called directly — the condition checks for exactly those
three broken cases first and produces `None` instead. Confirmed directly
against a line ending in a bare `X`:

```python
tokenize_line("G01 X")
```

Actual output:

```
[Token(type='WORD', text='G01', letter='G', value=1.0),
 Token(type='WORD', text='X', letter='X', value=None)]
```

`tokens.append(Token(type="WORD", ...))` constructs
the token, all four fields supplied this time. Falling through to the
bottom of the function: `start = i; i += 1;
tokens.append(Token(type="UNKNOWN", text=line[start:i]))` is the
fallback for any character that's neither whitespace, a comment-opener,
nor a letter — captured as its own one-character token rather than
causing the whole line to fail. `return tokens` reuses ordinary
function-return syntax to hand back everything collected.

### Run It

```python
tokenize_line("G01 X10.5 Y-20 F500")
```

Actual output:

```
[Token(type='WORD', text='G01', letter='G', value=1.0),
 Token(type='WORD', text='X10.5', letter='X', value=10.5),
 Token(type='WORD', text='Y-20', letter='Y', value=-20.0),
 Token(type='WORD', text='F500', letter='F', value=500.0)]
```

Now the identical program, with every space removed:

```python
tokenize_line("G01X10.5Y-20F500")
```

Actual output:

```
[Token(type='WORD', text='G01', letter='G', value=1.0),
 Token(type='WORD', text='X10.5', letter='X', value=10.5),
 Token(type='WORD', text='Y-20', letter='Y', value=-20.0),
 Token(type='WORD', text='F500', letter='F', value=500.0)]
```

Confirmed directly: the spaced and unspaced versions of the exact same
program produce *identical* tokens — the real proof this lexer solves
the problem the very first unit demonstrated `.split()` could not.

---

## Concept Unit: tokenizing a whole program

### The Problem

`tokenize_line` handles exactly one line. A real `.nc` file is many
lines, and something needs to run the scan once per line and keep the
results in order.

### Project Change

- **Files affected** — `backend/gcode/lexer.py`, existing file.
- **Change type** — add, a new `tokenize_program` function, after
  `tokenize_line`.
- **Dependencies** — `tokenize_line` from the previous two units.

### The New Code — type this

```python
def tokenize_program(text: str) -> list[list[Token]]:
    return [tokenize_line(line) for line in text.splitlines()]
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added after
`tokenize_line` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the line above is everything there is to
see.

### Mechanical Walkthrough
`text.splitlines()` reuses `.splitlines()` from Lesson 7's `git log`
parsing — splitting a whole block of text into one string per line,
without the trailing newline characters. `[tokenize_line(line) for line
- in text.splitlines()]` is this project's first **list comprehension** —
a way to build a list by writing what each item *is*, in one expression,
instead of Lesson 2's explicit pattern: create an empty list, `for` over
something, `.append()` inside the loop. This one line is exactly
equivalent to:

```python
result = []
for line in text.splitlines():
    result.append(tokenize_line(line))
return result
```

except the comprehension states the same idea more directly — "the list
- of `tokenize_line(line)`, for every `line`" — with no separate
initialization step and no explicit `.append()` call. `list[list[Token]]`
as the return type is a direct consequence: one line becomes one list of
tokens, so the whole program becomes a list of those lists — one entry
per line, in file order.

---

## Concept Unit: a route that exposes the lexer

### The Problem

Something has to expose `tokenize_program` over the network, gated and
sandboxed exactly like every other file-touching route in this project.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `from gcode.lexer import tokenize_program` added among
  the existing imports; a new `@app.post("/tokens")` route added after
  `diagnose_file`.
- **Dependencies** — the `gcode` package built in this lesson.

### The New Code — type this

```python
@app.post("/tokens", dependencies=[Depends(require_auth)])
def tokenize_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".nc":
        raise HTTPException(status_code=400, detail="Only .nc files can be tokenized")

    content = target_file.read_text(encoding="utf-8")

    lines = []
    for line_tokens in tokenize_program(content):
        lines.append([
            {"type": token.type, "text": token.text, "letter": token.letter, "value": token.value}
            for token in line_tokens
        ])

    return {"path": path, "lines": lines}
```

### The Updated Project — where this lives

The import lands among the existing ones:

```python
from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from gcode.lexer import tokenize_program   # ← new
```

`tokenize_file` itself is a complete, freestanding new function, added
after `diagnose_file` — nothing existing is modified, so there's no
enclosing structure to show it inside of; the block above is everything
there is to see.

### Mechanical Walkthrough
The first three checks reuse the identical traversal, existence, and
- extension-specific pattern from `diagnose_file` and `run_file` — a
`.nc`-only check this time, the same shape as the `.py`-only check
Lesson 5 introduced. `content = target_file.read_text(encoding="utf-8")`
reuses Lesson 3's pinned-encoding read. `tokenize_program(content)` is
this lesson's own function, called for real for the first time outside a
terminal. The `for line_tokens in tokenize_program(content):` loop and
its nested list comprehension are new only in *what* they're doing, not
their shapes: for each line's list of `Token` objects, a second list
- comprehension converts each individual `Token` into a plain dictionary —
`{"type": token.type, "text": token.text, "letter": token.letter,
- "value": token.value}` — reading each dataclass field explicitly by
name, the same explicit-dictionary-construction pattern `list_files` has
used since Lesson 2. `lines.append([...])` builds up one list of
dictionaries per line.

### CS Lens — a dataclass isn't automatically a dictionary

`return {"path": path, "commits": commits}`-style responses have worked
directly with plain dictionaries and lists since Lesson 1, because
Python's JSON encoder already knows how to turn those into text. A
`Token` is a custom class — FastAPI's encoder has no built-in idea what a
`Token` *is*, or which of its fields should end up in the response, so
handing back a `Token` object directly would fail. Converting each one to
a plain dictionary explicitly, field by field, is this project's own
version of **serialization** — the same word, and the same underlying
need, first named for `JSON.stringify` back in Lesson 3, now on the
sending side of a completely different, project-defined type.

### Run It

```
POST /tokens?path=src/sample.nc →
{"path":"src/sample.nc","lines":[
  [{"type":"COMMENT","text":"(Facing operation)","letter":null,"value":null}],
  [{"type":"WORD","text":"N10","letter":"N","value":10.0},
   {"type":"WORD","text":"G90","letter":"G","value":90.0},
   {"type":"WORD","text":"G94","letter":"G","value":94.0}],
  ...
]}

POST /tokens?path=src/main.py  → 400 {"detail":"Only .nc files can be tokenized"}
POST /tokens?path=src/sample.nc  (no token) → 401 {"detail":"Not authenticated"}
POST /tokens?path=../../../../Windows → 400 {"detail":"Invalid path"}
```

All four confirmed directly against the real running server — 12 lines
of real output for `sample.nc`, condensed above for space; the traversal
and extension guards behave exactly like every other route that shares
them.

---

## Concept Unit: a second dark panel, and the bug it exposes

### The Problem

The Tokens display needs its own space on screen — and it's going to
need the exact same look `#run-output` already has: fixed height,
monospace, dark background, scrollable. Lesson 9 added one custom-styled
panel already (`#diagnostics-output`); this would be the *second* panel
sharing `#run-output`'s specific look, not the first — which is exactly
the point past which duplicating the whole rule stops being the
better choice.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — refactor. `#run-output`'s existing CSS rule is
  renamed into a class, `.output-panel`, reused by a new
  `#tokens-output` element; a new `#tokens-output` element and
  `#tokens-button` are added.
- **Location** — the `<style>` block, and inside `#editor-pane`.
- **Dependencies** — none new.

### The New Code — type this

```css
.output-panel {
    width: 100%;
    height: 120px;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 13px;
    padding: 8px;
    background-color: #111;
    color: #ddd;
    white-space: pre-wrap;
    overflow: auto;
}
```

That's the exact same declaration block Lesson 5 wrote for `#run-output`
— only the selector changed, from an ID to a class, so more than one
element can use it. The HTML side needs both elements pointing at it:

```html
<div id="run-output" class="output-panel"></div>
<div id="tokens-output" class="output-panel"></div>
```

### The Updated Project — where this lives

The `<style>` block, with `#run-output`'s old ID-selector rule replaced:

```css
.tab-close:hover {
    color: #000;
}
#diagnostics-output {
    font-family: monospace;
    font-size: 13px;
    padding: 4px 0;
    color: #666;
}
#diagnostics-output.has-error {
    color: #c00;
}
.output-panel {                     /* ← changed: was "#run-output" */
    width: 100%;
    height: 120px;
    box-sizing: border-box;
    font-family: monospace;
    font-size: 13px;
    padding: 8px;
    background-color: #111;
    color: #ddd;
    white-space: pre-wrap;
    overflow: auto;
}
#run-output.has-error {
    color: #f88;
}
```

And the button row plus the two output elements, inside `#editor-pane`:

```html
<div>
    <button id="save-button">Save</button>
    <button id="run-button">Run</button>
    <button id="tokens-button">Tokens</button>   <!-- ← new -->
    <span id="save-status"></span>
</div>
<div id="diagnostics-output"></div>
<div id="run-output" class="output-panel"></div>          <!-- ← changed: added class -->
<div id="tokens-output" class="output-panel"></div>       <!-- ← new -->
```

`#run-output.has-error` stays exactly as it was — it only ever added a
text color on top of whatever `.output-panel` (formerly `#run-output`)
already provides, and that still works unchanged with a class selector
underneath it.

### Mechanical Walkthrough
- `.output-panel` reuses every property `#run-output` already had — only
the selector's *kind* changed, from `#` (matching one specific element by
its unique `id`) to `.` (matching any element carrying that class,
however many there are). `class="output-panel"` added to both
`<div>`s is the same attribute already used throughout this project
- (`class="tab"`, `class="clickable"`) — the only difference is that this
particular class is now shared on purpose, by two different elements,
rather than describing one element's one-off role.

### CS Lens — the bug this refactor causes, found by tracing the code, not by running it

`runFile()`, unchanged since Lesson 5, does this on every run:

```javascript
outputElement.className = "";
```

`.className = ""` doesn't add or remove one class — it **replaces the
entire attribute**, wiping out anything already there. Before this
refactor, that was harmless: `#run-output`'s box styling came from an ID
selector, completely untouched by whatever `.className` held. After this
refactor, `.output-panel` *is* what `.className` holds — so
`outputElement.className = ""`, run today, would silently strip the
class that gives `#run-output` its size, its dark background, and its
scrolling, the instant `runFile()` is clicked. Nothing in Lesson 5's
original code was wrong when it was written; this refactor changed the
ground underneath it. Catching this by actually reading what
`.className = ""` does, rather than by clicking Run and noticing the box
disappear, is the same discipline named back in Lesson 7 for the
backslash bug: tracing what code *actually* does instead of trusting
that it still means what it meant when it was written.

### SE Lens — the fix

`.className` treats "the whole attribute" as one value to overwrite.
What's actually needed here is finer-grained: toggle *one specific*
class (`has-error`) on and off, while leaving whatever else is already
there — `.output-panel` — completely alone. That's `.classList`, not
`.className`, and it's the very next unit's fix.

---

## Concept Unit: fixing runFile, and a place for tokens to appear

### The Problem

`runFile()`'s three `.className` assignments need to stop overwriting
the whole attribute, and the new Tokens panel needs its own function to
actually populate it.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — replace, inside `runFile`; add, a new `tokenizeFile`
  function and its button wiring.
- **Location** — `runFile`, from Lesson 5; a new function placed after
  it; `renderEditor`, from Lesson 4/9, gains one more clearing line.
- **Dependencies** — `.output-panel` from the previous unit.

### The New Code — type this

Clearing the error state now removes exactly one class instead of
wiping the whole attribute:

```javascript
outputElement.classList.remove("has-error");
```

Setting it adds that same class back, leaving anything else on the
element untouched:

```javascript
outputElement.classList.add("has-error");
```

### The Updated Project — where this lives

`runFile`, with every `.className` assignment replaced by the equivalent
`.classList` call:

```javascript
function runFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("run-output");
    outputElement.classList.remove("has-error");   // ← changed: was .className = ""
    outputElement.textContent = "Running...";

    fetch("http://127.0.0.1:8000/run?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authToken,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.stderr) {
                outputElement.classList.add("has-error");      // ← changed: was .className = "has-error"
                outputElement.textContent = data.stderr;
            } else {
                outputElement.classList.remove("has-error");   // ← changed: was .className = ""
                outputElement.textContent = data.stdout || "(no output)";
            }
        })
        .catch((error) => {
            outputElement.classList.add("has-error");          // ← changed: was .className = "has-error"
            outputElement.textContent = "Could not reach backend.";
        });
}
```

`renderEditor`, with its `#run-output` clearing updated the same way,
alongside a new line clearing `#tokens-output`:

```javascript
function renderEditor() {
    const emptyState = document.getElementById("editor-empty");
    const editorPane = document.getElementById("editor-pane");

    if (activeTabPath === null) {
        emptyState.style.display = "block";
        editorPane.style.display = "none";
        return;
    }

    const activeTab = openTabs.find((tab) => tab.path === activeTabPath);
    emptyState.style.display = "none";
    editorPane.style.display = "block";
    document.getElementById("file-content").value = activeTab.content;
    document.getElementById("save-status").textContent = "";
    document.getElementById("run-output").textContent = "";
    document.getElementById("run-output").classList.remove("has-error");   // ← changed: was .className = ""
    document.getElementById("diagnostics-output").textContent = "";
    document.getElementById("diagnostics-output").className = "";
    document.getElementById("tokens-output").textContent = "";             // ← new
}
```

`#diagnostics-output`'s own `.className` line is untouched — it was
never affected by this refactor, since it never shared `.output-panel`
in the first place.

### Mechanical Walkthrough

`.classList` is a property every element has, a set-like object of just
that element's classes. `.remove("has-error")` removes exactly that one
class if present, doing nothing if it isn't — never touching
`.output-panel` or anything else already there. `.add("has-error")` adds
exactly that one class, again leaving everything else alone. Both are
new to this project; every earlier class change used blanket `.className`
reassignment instead.

---

## Concept Unit: tokenizing on screen

### The Problem

Clicking a "Tokens" button needs to actually call `/tokens` and turn the
response into something readable, and it needs to do nothing useful for
a file that was never meant to be tokenized in the first place.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `tokenizeFile` function and its button
  listener.
- **Location** — placed after `runFile`; the listener alongside the
  existing button listeners near the bottom of the `<script>` block.
- **Dependencies** — the `/tokens` route, `#tokens-output` and
  `#tokens-button` from the previous two units.

### The New Code — type this

```javascript
function tokenizeFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("tokens-output");

    if (!activeTabPath.endsWith(".nc")) {
        outputElement.textContent = "Not a G-code file.";
        return;
    }

    outputElement.textContent = "Tokenizing...";

    fetch("http://127.0.0.1:8000/tokens?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authToken,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const lines = data.lines.map((lineTokens, index) => {
                const words = lineTokens.map((token) => {
                    if (token.type === "WORD") {
                        return token.letter + "=" + token.value;
                    }
                    return token.text;
                }).join("  ");
                return "Line " + (index + 1) + ": " + (words || "(empty)");
            });
            outputElement.textContent = lines.join("\n");
        })
        .catch((error) => {
            outputElement.textContent = "Could not tokenize file.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`runFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The button needs wiring, alongside the existing listeners:

```javascript
document.getElementById("save-button").addEventListener("click", saveFile);
document.getElementById("run-button").addEventListener("click", runFile);
document.getElementById("tokens-button").addEventListener("click", tokenizeFile);   // ← new
document.getElementById("login-button").addEventListener("click", login);
```

### Mechanical Walkthrough
`if (activeTabPath === null) { return; }` reuses the standard guard
clause. `!activeTabPath.endsWith(".nc")` is new: `.endsWith(...)` is a
string method testing whether a string finishes with the given text —
`!` negates it, so this branch runs precisely when the open file *isn't*
G-code, short-circuiting with a friendly message before ever sending a
request the backend would just reject with a `400` anyway. `fetch(...)`
with `method: "POST"` and the `Authorization` header reuses the exact
shape from `runFile`/`diagnoseFile`. Inside the success `.then()`,
`data.lines.map((lineTokens, index) => { ... })` is this project's
- **fourth** array iteration method — after `.forEach()` (Lesson 2), `.filter()` (Lesson 4), and `.find()` (Lesson 4) — and the first to use

its optional second callback parameter, `index`: every one of those
methods hands the current position in the array to the callback as a
second argument, available whenever it's actually needed, silently
ignored otherwise. Unlike `.forEach()`, which returns `undefined` and
exists purely for its side effects, `.map()` returns a *new* array
containing whatever the callback returns for each item — here, one
formatted string per line, not a side effect at all. Nested one level
in, `lineTokens.map((token) => { ... })` runs the identical idea again,
per line, turning each `Token`-shaped object into a short readable
string: `token.letter + "=" + token.value` for a `WORD`, reusing `+`
string concatenation, or just `token.text` for anything else (a
`COMMENT`, or an `UNKNOWN`). `.join("  ")` reuses `.join()` from Lesson
2 to glue that line's words into one string, two spaces between each.
`"Line " + (index + 1) + ": " + (words || "(empty)")` reuses `+`
concatenation and the `||` fallback idiom from Lesson 5's `"(no
output)"`, `index + 1` converting a zero-based position into a
one-based line number a person would actually expect to read.
`lines.join("\n")` reuses `.join()` a second time, at the outer level,
turning the whole array of per-line strings into one block of text with
a real line break between each.

---

## Connect the pieces

Opening `sample.nc` and clicking Tokens: `tokenizeFile()` confirms the
file is actually open, confirms its path ends in `.nc`, and sends `POST
/tokens?path=src/sample.nc`. On the backend, `tokenize_file` runs the
same traversal/existence/extension checks every file route shares, reads
the file, and calls `tokenize_program`, which splits it into lines and
- calls `tokenize_line` once per line — each call walking the line
character by character with the cursor technique from this lesson's
concept lab, recognizing comments by finding their closing parenthesis
and words by scanning a letter followed by an optional sign and a run of
digits/decimal points. Each recognized piece becomes a `Token`, converted
explicitly into a plain dictionary before the whole nested structure
returns as JSON. The frontend receives it, and two nested `.map()` calls
turn that same nested structure back into readable text — one line per
- line, `letter=value` per word — displayed in `#tokens-output`, a panel
that only exists at all because `#run-output`'s exact look was worth
sharing rather than duplicating, which is also the reason `runFile`'s
`.className` assignments needed fixing first.

## What breaks without this

Already demonstrated concretely above, not hypothetically: `.split()`
against real, legal, unspaced G-code (`"G01X10.5Y-20F500"`) returns the
entire line as one item, confirmed directly — this lexer's word-scanning
branch produces the identical four tokens whether or not the input has
spaces at all, confirmed directly against both versions of the same
line. And the `.className`/`.classList` bug: before the fix, clicking Run
after this lesson's CSS refactor would silently strip `#run-output`'s
entire box styling on every single run, not through any error, but
- because `.className = ""` does exactly what it says — replace the whole
attribute, not just the part that used to be the only part.

## Exercises

1. Open `src/sample.nc` through the running app, click Tokens, and
   confirm the panel shows one readable line per line of the file,
   `letter=value` for every word.
2. Click Tokens on `src/main.py` instead and confirm the friendly "Not a
   G-code file." message appears — with no network request sent at all.
- 3. In the concept lab, trace `tokenize_line("N10 G90")` on paper first — predict every token's `type`, `text`, `letter`, and `value` — then run

   it and compare.
4. Add a line to `sample.nc` with a real mistake this lexer's minimal
   grammar doesn't recognize (a bare `%` character, for instance), run it
   through Tokens, and confirm it becomes an `UNKNOWN` token instead of
   crashing the whole request.

## Definition of done

- [ ] You've tokenized `sample.nc` through the real running app and read
      the actual output
- [ ] You can explain, with the real proof from this lesson, why
      `.split()` can't tokenize G-code but this lexer can
- [ ] You can trace the cursor-and-lookahead technique by hand against a
      line you choose yourself
- [ ] You can explain the difference between `Token` (a `dataclass`) and
- `FileEdit` (a `BaseModel`) — what each one buys you, and why `Token`
      doesn't need what `FileEdit` needs
- [ ] You can explain, precisely, why `.className = ""` was safe before
      this lesson's CSS refactor and not safe after it
- [ ] You can name the difference between `.forEach()` and `.map()` —
      what each returns, and when you'd reach for one over the other
- [ ] `git commit` this lesson's code with a message explaining why
