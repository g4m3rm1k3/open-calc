# Lesson 2: Text Has No Structure Until You Impose One

## What you will build

The first real piece of the actual CNC engine: `core/lexer.py`'s
`tokenize()`, which takes a raw line of G-code text (e.g. `"G0 X10 Y20"`)
and turns it into a structured Python `dict` (`{"G": 0.0, "X": 10.0, "Y":
20.0}`) — ported directly from the reference app's real word-extraction
logic, not reinvented. Wired into a new `POST /api/tokenize` route and a
small form on the page so you can type a line and see it tokenized live.
The transferable problem: **a string of characters has no meaning to a
program until something imposes structure on it** — this is true of
G-code, JSON, a URL, a CSV file, or any text a program ever reads.

## What you need to know first

Lesson 1: the `app` object, `@app.route`, returning a `dict` for
automatic JSON, and `fetch`/`.then`/arrow functions on the frontend. Those
are reused here without re-explanation.

## Concepts cataloged from this lesson

Every concept this lesson introduces now has its own isolated, runnable
entry in `../concepts/` (per `extraction.md`'s Concept Catalog Rule) — a
later lesson only skips re-teaching one of these on a **100% match**, never
on resemblance. Added retroactively; the teaching below is unchanged.

`python-package-init` · `layered-architecture-dependency-direction` ·
`python-regex-search-findall` · `regex-capture-groups` ·
`python-regex-compile` · `python-leading-underscore-convention` ·
`regular-language-finite-state-machine` · `python-iterators` ·
`python-isinstance` · `fold-reduce-pattern` · `flask-request-object` ·
`http-methods-get-post` · `input-validation-at-boundary` ·
`flask-tuple-status-code-response` · `http-status-codes` ·
`html-input-element` · `html-button-element` · `dom-add-event-listener` ·
`fetch-post-with-body` · `event-driven-ui-callbacks`

Also reused from Lesson 1, unchanged: `python-import-statement`,
`fetch-api`, `javascript-promises-async`, `javascript-arrow-functions`,
`dom-get-element-by-id`, `json-stringify`,
`flask-implicit-dict-to-json`, `http-routing-dispatch-table`.

## Pipeline diagram (first appearance)

This project's full pipeline, as established in `CURRICULUM.md`, is:

```
Text → Tokens → Commands → Machine State → Points → Picture
```

This lesson builds the **first** stage only: `Text → Tokens`. Nothing
past "Tokens" exists yet — there is no concept of a "command" (a G0 move,
a tool change) in this project until the next lesson. Carrying one
concrete value through the one stage that exists so far: the text
`"G0 X10 Y20"` becomes the tokens `{"G": 0.0, "X": 10.0, "Y": 20.0}`. That
is the entire pipeline this lesson can show — everything after "Tokens" is
still a named, empty box.

---

## Concept Unit: Python Packages and the `core`/`app` Boundary

*(Full standalone treatment: `../concepts/python-package-init.md` (the
`__init__.py` mechanism) and
`../concepts/layered-architecture-dependency-direction.md` (the boundary
principle, CS/SE Lens below).)*

### The Problem

`app.py` currently mixes two different jobs: deciding what a G-code line
*means* (a job with no idea Flask exists) and deciding how an HTTP request
gets turned into a response (a job with no idea what G-code is). Mixing
them from the start means every future lesson that touches parsing also
has to wade through Flask, and vice versa. This is cheap to prevent now,
while there's almost nothing to untangle, and expensive to fix later once
dozens of routes depend on the tangle.

### The Concept, Isolated

No disposable lab needed — the smallest real demonstration of "a package
with no framework knowledge" *is* the package itself, verified two
independent ways rather than staged separately:

```
core/__init__.py   (empty)
core/lexer.py      (imports only Python's own `re` module)
```

**Real, run-this-session proof it has zero Flask knowledge:**
```
grep -ri flask core/*.py
(no output — exit code 1, meaning "no match found")
```
**Real proof it works with no server running at all** — imported directly
in a plain Python shell, no Flask, no HTTP, nothing:
```python
from core.lexer import tokenize
print(tokenize("G0 X10"))
```
```
{'G': 0.0, 'X': 10.0}
```

### Project Change

- **Reference Source** — none; Python packages are a language/tooling
  concept, not something the (TypeScript) reference app has an
  equivalent of. The *boundary principle itself* — the engine knowing
  nothing about the transport layer — is a deliberate architectural
  addition named in `CURRICULUM.md`'s target architecture, motivated by
  wanting `core/` portable to a future C++ rewrite without dragging
  Flask-shaped assumptions along.
- **Files affected** — new `cnc-service/core/__init__.py` (empty),
  new `cnc-service/core/lexer.py`.
- **Change type** — add.
- **Location** — a new `core/` folder inside `cnc-service/`, a sibling of
  `app.py` and `templates/`.
- **Dependencies** — none beyond Python's standard library.

### Mechanical Walkthrough
- `core/__init__.py`, **empty** — **(a) first appearance.** A file named
  exactly `__init__.py` inside a folder is what (traditionally) tells
  Python "this folder is a package — a collection of modules importable
  as a unit," rather than just a folder that happens to contain `.py`
  files. It can be completely empty, as here — its *presence* is the
  signal, not its contents. Named honestly: Python 3.3+ can actually treat
  folders without an `__init__.py` as "namespace packages" too, so this
- file is technically optional on this Python version (`3.13.14`) — it's
  included anyway because it's the explicit, unambiguous, widely-
  recognized convention, and being explicit here costs nothing.
- `from core.lexer import tokenize` — **(b) reappearing**, same
  `from X import Y` syntax taught in Lesson 1; the only new part is that
  `core.lexer` is a *path* through a package (`core`) to a module inside
  it (`lexer`), mirroring the real folder structure on disk.

### CS Lens

This is **modularity / information hiding** — a module that only exposes
what other code needs (`tokenize`) and hides how it works internally. The
`core` package as a whole enforces a **dependency direction**: `core`
never imports `flask` or `app`; `app.py` imports `core`. Dependencies only
point one way.

Also recognized in: any layered architecture (a database layer with no
knowledge of the UI on top of it), the classic "domain layer knows nothing
about the presentation layer" rule in enterprise software, a game engine's
physics module having no idea a renderer exists.

### SE Lens

The alternative — write `tokenize()` directly inside `app.py`, no
`core/` package — is genuinely less typing today. The real, concrete cost
shows up the moment this project targets a second interface: `CURRICULUM.md`
names a future C++ rewrite as a real goal, and a from-scratch test suite
(a later lesson) will want to import and test `tokenize()` with zero Flask
installed. Both become free the moment the boundary is drawn now, and both
require an actual refactor — touching every route — if drawn later. This
is a real debt being deliberately *not* taken on, not a hypothetical one.

---

## Concept Unit: Regular Expressions

*(Full standalone treatment: `../concepts/python-regex-search-findall.md`
(`re.search`/`re.findall`, raw strings), `../concepts/regex-capture-groups.md`
(the `(...)` groups this lesson's real pattern depends on),
`../concepts/python-regex-compile.md` (`re.compile`, below),
`../concepts/python-leading-underscore-convention.md` (`_WORD_RE`'s name),
and `../concepts/regular-language-finite-state-machine.md` (the CS Lens).)*

### The Problem

`"G0 X10 Y20"` is just a string. To turn it into `{"G": 0.0, "X": 10.0,
"Y": 20.0}`, something has to recognize the *pattern* "a letter, optionally
followed by a space, followed by a number" repeated across the line —
character-by-character string slicing would work but be long and fragile.
Python's `re` (regular expressions) module is built exactly for
recognizing text patterns like this.

### The Concept, Isolated

```python
import re

match = re.search(r"\d+", "abc123def")
print(match.group())
```
**Real output:**
```
123
```
`re.search(pattern, text)` scans `text` for the first place `pattern`
matches, and returns a `Match` object (or `None` if nothing matched).
`r"\d+"` is the pattern: `\d` means "any single digit," `+` means "one or
more of the previous thing" — together, "one or more consecutive digits."
The `r` before the string makes it a **raw string** — inside a raw
string, backslash (`\`) is not treated as an escape character (so `\d`
stays literally backslash-d, rather than Python trying to interpret
`\d` as some other special character), which is why regex patterns in
Python are almost always written with the `r` prefix. `.group()` on the
`Match` object returns the actual text that matched — here, `"123"`.

**Varying the input to show a second facet — finding every match, not
just the first:**
```python
print(re.findall(r"\d+", "a1 b22 c333"))
```
```
['1', '22', '333']
```
`re.findall` returns every match in the string as a list, instead of
stopping at the first one.

**A third variation — capturing pieces of each match separately:**
```python
print(re.findall(r"([a-z])(\d+)", "a1 b22"))
```
```
[('a', '1'), ('b', '22')]
```
Parentheses `(...)` in a pattern create **capture groups** — instead of
just matching, the pattern remembers *which part* matched each
parenthesized piece. `[a-z]` matches one lowercase letter; `\d+` matches
one-or-more digits, same as before. With two groups, `findall` returns a
list of tuples — one tuple per match, one element per group — instead of
whole-match strings. This is the exact mechanism `tokenize()` needs: one
group for the letter (`G`, `X`, `Y`...), one for the number that follows
it.

### Discard

This `re.search`/`re.findall` example is deleted now. It never appears in
the project — it existed only to prove what capture groups do before
meeting the real, denser pattern below.

### Project Change

- **Reference Source** — `cnc/CNCEngine.ts` lines 1209–1221 (inside
  `GCodeParser._extractWords`), quoted verbatim:
  ```ts
  // Standard word extraction for plain numeric values
  const re = /([A-Za-z])\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/g;
  let m;
  while ((m = re.exec(str)) !== null) {
    const k = m[1].toUpperCase(),
      v = parseFloat(m[2]);
    if (k === "N" || k === "O") continue;
    if (words[k] == null)
      words[k] = v; // only set if not already set as macro expr
    else if (typeof words[k] === "number") {
      if (!Array.isArray(words[k])) words[k] = [words[k], v];
      else words[k].push(v);
    }
  }
  ```
  **Named, deliberate deviation from the rest of the real
  `_extractWords`** (lines 1188–1231 as a whole): the reference also
  handles Siemens algebraic assignment syntax (`X=R5`, lines 1190–1197),
  macro-variable expressions (`X#104`, lines 1198–1207), and lathe T-word
  splitting (`T0303` → tool 3 / offset 3, lines 1222–1229). None of those
  are ported yet — this lesson is the plain numeric case only, the
  smallest real vertical slice of this function. Each deferred case is a
  named, future lesson, not a silent gap.
- **Files affected** — `cnc-service/core/lexer.py` (created in the
  previous unit, code below).
- **Change type** — add.
- **Location** — the whole content of `core/lexer.py`.
- **Dependencies** — none beyond `re`, part of Python's standard
  library — no `pip install` needed.

### The New Code

```python
import re

_WORD_RE = re.compile(r"([A-Za-z])\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")
```

### The Updated Project

The full, current `core/lexer.py` — nothing elided:

```python
import re

_WORD_RE = re.compile(r"([A-Za-z])\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)")


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
```
As a whole, this module now defines the exact pattern that recognizes a
G-code "word" (a letter plus its number), and a function that applies that
pattern repeatedly across a whole line, building up the token dict. The
`tokenize` function itself is explained in the next unit — this one is
about the pattern alone.

### Mechanical Walkthrough
- `_WORD_RE = re.compile(r"...")` — **(a) first appearance** of
  `re.compile`: pre-building a `Pattern` object once, instead of passing
  the raw pattern string to `re.findall`/`re.search` every call (as the
  disposable lab above did). Functionally identical either way; `compile`
  is a real, small performance win when the same pattern is reused many
  times (this function will run once per line of a whole G-code
  program, potentially thousands of times), and it's why the name starts
  with a leading underscore — **(a) first appearance** of a Python naming
  convention: a single leading underscore signals "internal to this
  module, not meant to be imported and used elsewhere," a convention, not
  an enforced rule (Python doesn't actually block `from core.lexer import
  _WORD_RE`; it's a documented intention, not a lock).
- The pattern itself, `([A-Za-z])\s*([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)`,
  piece by piece, all **(a) first appearance**:
  - `([A-Za-z])` — capture group 1: exactly one letter, upper or
    lowercase (`G`, `x`, `Y`...).
  - `\s*` — zero or more whitespace characters (not captured) — allows
    both `"G0"` and `"G 0"` to match identically.
  - `([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)` — capture group 2, the number,
    built from smaller pieces: `[-+]?` (an optional leading `+` or `-`
- sign), `\d*` (zero or more digits before a decimal point — zero,
    because `.5` alone is a valid number), `\.?` (an optional literal
- decimal point — the `\` escapes `.`, which would otherwise mean "any character"), `\d+` (one or more digits — required, since something

    has to be a digit for this to be a number at all), then
- `(?:[eE][-+]?\d+)?` — an optional, non-capturing group (`(?:...)` — parentheses that group pieces together without creating

    a numbered capture, used here purely to attach the trailing `?` to
    the whole scientific-notation suffix at once) matching scientific
    notation like `1e-3` if present.

### CS Lens

A pattern like this is a compact description of a **regular language** —
the formal-languages term for exactly the class of patterns regular
expressions can recognize (as opposed to, say, matching balanced
parentheses, which regular expressions alone cannot do — a real,
named limit that matters the moment G-code needs bracket-matching for
expressions, a later lesson's problem). Regex matching itself runs on a
**finite state machine** internally — the same abstract machine named
generically all the way back in this lesson's own reused vocabulary (a
concept this curriculum will build a hand-written instance of directly
once modal G-code state appears, next lesson).

Also recognized in: every real compiler's own lexer (regex or
hand-written state machines doing the identical job), `grep` itself (the
tool, named after "global regular expression print"), form-input
validation (email/phone patterns), log-file parsing, syntax highlighters.

### SE Lens

The alternative to one dense regex is hand-written character-by-character
scanning (a loop reading one character at a time, deciding "is this a
letter? a digit? a sign?"). That alternative is arguably *more*
readable to someone who's never seen regex, and it's what a real
lexer/parser textbook usually teaches first, for exactly that reason.
The reference app's own author chose regex — real, working, shipped
code — trading a steeper one-time learning cost for far less code (one
line handles every valid number shape: `10`, `-5.5`, `1e-3`) and easier
long-term maintenance (one pattern to adjust, not a scanning loop's worth
of branches) — which is exactly the tradeoff this lesson names honestly
rather than picking one and pretending there was no alternative.

---

## Concept Unit: Building the Token Dictionary

*(Full standalone treatment: `../concepts/python-iterators.md`
(`.finditer`, iterators vs. lists), `../concepts/python-isinstance.md`, and
`../concepts/fold-reduce-pattern.md` (the CS Lens below).)*

### The Problem

The regex above finds each individual word (`G`, `0`) one at a time,
scattered through the line. Something has to walk every match and
assemble them into the one structured `dict` the rest of this project will
actually use.

### Incremental Practice — an escalating sequence, run for real this session

```python
from core.lexer import tokenize

tests = ["G0", "G0 X10", "G0 X10 Y20", "X-5.5", "N10 G0 X10",
         "G0X10Y20", "G01 X10 Y10 X20", ""]
for t in tests:
    print(repr(t), "->", tokenize(t))
```
```
'G0' -> {'G': 0.0}
'G0 X10' -> {'G': 0.0, 'X': 10.0}
'G0 X10 Y20' -> {'G': 0.0, 'X': 10.0, 'Y': 20.0}
'X-5.5' -> {'X': -5.5}
'N10 G0 X10' -> {'G': 0.0, 'X': 10.0}
'G0X10Y20' -> {'G': 0.0, 'X': 10.0, 'Y': 20.0}
'G01 X10 Y10 X20' -> {'G': 1.0, 'X': [10.0, 20.0], 'Y': 10.0}
'' -> {}
```
Each input changes exactly one thing from the one before it: adding a
second word, adding a third, a negative decimal, a leading sequence
number, removing all whitespace, and finally a *repeated* letter on one
line. That last one is the interesting case the next block of code
exists for.

### The New Code

```python
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
```
(Already shown whole in the previous unit's "Updated Project" — repeated
here since this unit's walkthrough is about this function specifically,
not the pattern above it.)

### Mechanical Walkthrough
- `def tokenize(line):` — already-known basic Python.
- `words = {}` — an empty dict literal, already-known basic Python; this
  is the structure being built up, one word at a time.
- `for match in _WORD_RE.finditer(line):` — **(a) first appearance.**
  `.finditer(line)` runs the compiled pattern against `line` and returns
- an **iterator** — something a `for` loop can step through one item at a time — yielding one `Match` object per place the pattern matched,

  left to right, in order. (`.findall`, used in the disposable regex lab,
  returns a plain list of strings/tuples immediately; `.finditer` instead
  yields full `Match` objects lazily, one at a time, which is what makes
- `.group(1)` / `.group(2)`, used next, available at all — `findall`
  would have already reduced each match down to a plain tuple, losing the
  richer `Match` object.)
- `letter = match.group(1).upper()` — `match.group(1)` retrieves capture
  group 1 (the letter) from *this specific* match; `.upper()` is
  already-known basic Python (string method), applied here so `"x10"` and
  `"X10"` both end up stored under the same key, `"X"`.
- `value = float(match.group(2))` — `match.group(2)` retrieves capture
  group 2 (the number, as a string, e.g. `"10"` or `"-5.5"`); `float(...)`
  converts it to an actual number. Already-known basic Python conversion,
  applied to newly-available data (a regex capture group).
- `if letter in ("N", "O"): continue` — **(b) hard concept reappearing**
- (`continue`, a loop-control keyword — if already covered in "basic
  Python," reused without re-explanation; if not yet seen, it skips the
  rest of *this* loop iteration and moves to the next match, without
- running the code below it).
- `N` is a sequence number (`N10` — a line
  label, not a G-code instruction) and `O` marks a sub-program number
- (`O100`) in the reference dialects — neither is a real "word" this
  project's engine acts on yet, so both are explicitly discarded here,
  matching the real reference's own identical exclusion at line 1214.
- `if letter not in words: words[letter] = value` — the first time a
  letter appears on this line, store its value directly.
- `elif isinstance(words[letter], list): words[letter].append(value)` —
- **(a) first appearance** of `isinstance` — checks whether
  `words[letter]`'s *current* value is already a `list` (meaning this
  letter has appeared at least twice before); if so, this third-or-later
  repeat just appends onto the existing list.
- `else: words[letter] = [words[letter], value]` — the *second*
  appearance of a letter on one line: its current single value and the
  new value are combined into a two-element list, converting the stored
  value from "just a number" to "a list of numbers" at exactly the moment
  a second one shows up — matching the real reference's identical
  behavior at lines 1217–1220.
- `return words` — already-known basic Python.

### CS Lens

Building a `dict` by scanning left to right and folding each new piece of
input into an accumulator is a **fold** (also called `reduce` in some
languages) — the same general shape as summing a list of numbers one at a
time, just accumulating into a dict instead of a single number.

### SE Lens

The reference's own choice to silently turn a repeated word into a list,
rather than raising an error or simply overwriting the first value, is a
real design decision worth stating plainly: a repeated axis word on one
G-code line is unusual but not meaningless in some real dialects (some
canned-cycle syntax legitimately repeats a word). Silently overwriting
would lose data with no warning; raising an error would reject input a
real machine controller might legitimately need to accept. Porting the
list-based behavior faithfully, rather than "cleaning it up" to something
that looked more sensible in isolation, is exactly `LessonContract`'s
"Reading the Real Source" rule in practice — the reference's choice here
is deliberate, not an oversight to improve on.

---

## Concept Unit: A Real Failure — What Tokenizing Alone Cannot Do

### Caused for real, this session

```python
from core.lexer import tokenize
print(tokenize("G0 X10 (move to home Y5)"))
```
```
{'G': 0.0, 'X': 10.0, 'Y': 5.0}
```
The `Y5` written *inside the parentheses* — a G-code comment, not a real
move — was picked up as a real `Y` word. The correct result should be
`{'G': 0.0, 'X': 10.0}` (no `Y` at all). This is not a bug to fix right
now — it's a real, concrete demonstration of a boundary named honestly:
the real reference's own `_extractWords` (ported this lesson) never
receives comment text in the first place, because a *separate* function,
`_parseLine` (lines 1120–1138, not yet read closely or ported), strips
comments out *before* calling `_extractWords`. Comment-stripping is a
distinct concern from word-extraction in the reference's own real design
— this project has ported the second without yet building the first.
**Named, deliberate, deferred gap — next lesson's job**, exactly the way
the original bootstrap plan called it out.

---

## Concept Unit: A Real Endpoint for Real Input

*(Full standalone treatment: `../concepts/flask-request-object.md`
(`request`/`get_json`), `../concepts/http-methods-get-post.md`
(`methods=["POST"]`), `../concepts/input-validation-at-boundary.md` (the CS
Lens below), `../concepts/flask-tuple-status-code-response.md` (the
`(body, 400)` return), and `../concepts/http-status-codes.md` (`400` vs.
`404` vs. `500`).)*

### The Problem

`tokenize()` works, proven above — but only from inside a Python
interpreter. The whole point of `cnc-service` is answering requests from a
browser, so this needs a route.

### The New Code

```python
@app.route("/api/tokenize", methods=["POST"])
def tokenize_line():
    body = request.get_json(silent=True)
    if not isinstance(body, dict) or "line" not in body:
        return {"error": 'expected a JSON body like {"line": "G0 X10"}'}, 400
    return {"words": tokenize(body["line"])}
```

### The Updated Project

The full, current `cnc-service/app.py`, nothing elided:

```python
from flask import Flask, render_template, request

from core.lexer import tokenize

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
    return {"words": tokenize(body["line"])}


if __name__ == "__main__":
    app.run(debug=True)
```
As a whole, `app.py` now has three routes: a page, a fake-status GET
endpoint, and a real tokenizer POST endpoint — the first route in this
project whose answer depends on what the *client* sends, not just a fixed
value.

### Mechanical Walkthrough
- `from flask import Flask, render_template, request` — **(b) reappearing**
- import syntax; `request` is **(a) first appearance** — a Flask-provided
  object representing the *current* incoming HTTP request being handled
  (available inside any route function while it runs).
- `@app.route("/api/tokenize", methods=["POST"])` — **(b) hard concept
  reappearing** (the routing decorator, Lesson 1) with **(a) a genuinely
  new argument**: every route so far defaulted to answering only `GET`
  requests (a browser navigating to a URL, or `fetch` with no `method`
  specified). `methods=["POST"]` restricts this route to `POST` requests
  only — the HTTP method meant for "here is data, act on it," as opposed
  to `GET`'s "just give me something, I'm not sending you data." A `GET`
  request to this exact path would now get Flask's own built-in
- `405 Method Not Allowed`, without any code written for that case — the
  same way Lesson 1's Exercises showed a `404` for an unmatched path
  entirely for free.
- `body = request.get_json(silent=True)` — **(a) first appearance.**
  `.get_json()` reads the request's body and parses it as JSON, returning
  a Python `dict`/`list`/etc. `silent=True` tells it: if the body isn't
- valid JSON at all, return `None` instead of raising an exception —
  verified for real below, sending genuinely malformed text.
- `if not isinstance(body, dict) or "line" not in body:` — **(a) first
  appearance** of real request validation. Two real failure cases folded
  into one check: `body` might be `None` (not valid JSON, or empty), or a
  valid JSON value that *isn't* an object (e.g. a JSON array, `[1,2,3]`),
  or a valid JSON object missing the one required key. `in` on a dict
  checks for key presence — already-known basic Python, applied to
  request data instead of a hand-written literal for the first time.
- `return {"error": ...}, 400` — **(a) first appearance** of a route
  returning a **tuple** `(body, status_code)` instead of just a value.
  Flask recognizes this two-element form and uses the second element as
  the HTTP status code instead of the default `200`. `400 Bad Request` is
  the standard HTTP status meaning "the client sent something malformed" —
  distinct from `404` (nothing lives at this path) or `500` (the server
  itself broke while handling an otherwise-valid request).
- `return {"words": tokenize(body["line"])}` — **(b) reappearing**
  dict-to-JSON auto-conversion (Lesson 1); `tokenize` is **(b) reappearing**
  too, called here for the first time with data that came from a real
  network request instead of typed directly into a Python shell.

### CS Lens

Checking untrusted input's *shape* before acting on it — is it the right
type, does it have the field we need — is **input validation at a
boundary**: the one place data crosses from "anything the outside world
could possibly send" into code that assumes a specific structure.
Everything past this check can safely assume `body["line"]` exists and is
a string-shaped value the parser can hand to `tokenize`.

Also recognized in: literally every real API endpoint that exists, a
compiler's own front-end rejecting malformed source before any real
analysis begins, a CNC controller rejecting a corrupt G-code file before
attempting to move an axis based on garbage data.

### SE Lens

The alternative — skip validation, call `tokenize(body["line"])`
directly — works for every well-formed request and crashes with a raw,
unhelpful Python `TypeError`/`KeyError` (visible to the client as an ugly
`500` with a stack trace, in debug mode) the moment anything malformed
arrives. Four lines of validation trade a small amount of upfront code for
turning an opaque crash into a specific, actionable `400` response —
exactly the category of fix the original plan named as a much later
"security audit" lesson; doing it here, at the very first `POST` route
this project has, means there's no backlog of unvalidated routes to
retrofit later.

### Commands and Real Output

Server restarted (`.venv\Scripts\python.exe app.py`) after this change,
then, from a second terminal, three real requests:

```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tokenize" -Method Post -ContentType "application/json" -Body '{"line": "G0 X10 Y20"}'

words
-----
@{G=0.0; X=10.0; Y=20.0}
```
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tokenize" -Method Post -ContentType "application/json" -Body '{}'
# 400
{
  "error": "expected a JSON body like {\"line\": \"G0 X10\"}"
}
```
```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tokenize" -Method Post -ContentType "application/json" -Body '{not valid json'
# 400 (get_json(silent=True) returned None, caught by the same check)
{
  "error": "expected a JSON body like {\"line\": \"G0 X10\"}"
}
```
Two genuinely different failure causes (a well-formed-but-wrong-shaped
body; text that isn't JSON at all) both land on the exact same validation
line and the exact same honest error message — proof the check is broad
enough to catch both, not narrowly written for just one.

---

## Concept Unit: Sending Data, Not Just Asking For It

*(Full standalone treatment: `../concepts/html-input-element.md`,
`../concepts/html-button-element.md`,
`../concepts/dom-add-event-listener.md`,
`../concepts/fetch-post-with-body.md` (the new `method`/`headers`/`body`
options-object form), and `../concepts/event-driven-ui-callbacks.md` (the CS
Lens below).)*

### The Problem

The page can already *display* fetched data (Lesson 1). It has no way yet
to *send* something to the server — needed now that a route exists that
expects a request body.

### The New Code

```html
<input id="line-input" type="text" value="G0 X10 Y20" />
<button id="tokenize-button">Tokenize</button>
<pre id="tokenize-result"></pre>

<script>
document.getElementById("tokenize-button").addEventListener("click", () => {
    const line = document.getElementById("line-input").value;
    fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ line: line }),
    })
        .then((response) => response.json())
        .then((data) => {
            document.getElementById("tokenize-result").textContent = JSON.stringify(data, null, 2);
        });
});
</script>
```

### The Updated Project

The full, current `cnc-service/templates/index.html`:

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8">
    <title>cnc-service</title>
</head>
<body>
    <h1>Machine Status</h1>
    <pre id="status">loading...</pre>

    <h1>Tokenize a G-code Line</h1>
    <input id="line-input" type="text" value="G0 X10 Y20" />
    <button id="tokenize-button">Tokenize</button>
    <pre id="tokenize-result"></pre>

    <script>
        fetch("/api/status")
            .then((response) => response.json())
            .then((data) => {
                document.getElementById("status").textContent = JSON.stringify(data, null, 2);
            });

        document.getElementById("tokenize-button").addEventListener("click", () => {
            const line = document.getElementById("line-input").value;
            fetch("/api/tokenize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ line: line }),
            })
                .then((response) => response.json())
                .then((data) => {
                    document.getElementById("tokenize-result").textContent = JSON.stringify(data, null, 2);
                });
        });
    </script>
</body>
</html>
```
As a whole, the page now does two independent things: on load, it
fetches and shows the fake status (Lesson 1, unchanged); on a button
click, it sends whatever text is in the input box to the real tokenizer
and shows the structured result.

### Mechanical Walkthrough
- `<input id="line-input" type="text" value="G0 X10 Y20" />` — **(a)
  first appearance** of an HTML `<input>` element: a box the user can
  type into. `type="text"` (as opposed to `type="number"`, `type="checkbox"`,
  etc. — other input types not needed yet) makes it a free-text box.
  `value="..."` sets its *initial* contents, shown before the user
  types anything.
- `<button id="tokenize-button">Tokenize</button>` — **(a) first
- appearance** of a `<button>` element — clickable, with no default
  behavior of its own (unlike a `<form>`'s submit button, not used here);
  its behavior comes entirely from the JavaScript attached below.
- `document.getElementById("tokenize-button")` — **(b) reappearing**
  (Lesson 1).
- `.addEventListener("click", () => { ... })` — **(a) first appearance.**
  `.addEventListener(eventName, callback)` registers `callback` to run
- every time the named event happens on this element — here, `"click"`.
  Nothing runs immediately when this line executes; the arrow function is
  only *stored*, to be called later, potentially many times (once per
  click), or never, if the button is never clicked. This is the same
  general "store a function to run later" idea as Lesson 1's `.then`,
  applied to a user action instead of a network response finishing.
- `const line = document.getElementById("line-input").value;` — **(a)
- first appearance** of reading `.value` from an `<input>` — the box's
  *current* text, whatever the user has typed at the moment of the click
  (not the original `value="..."` attribute, which only set the starting
  content).
- `fetch("/api/tokenize", { method: "POST", headers: {...}, body: ... })`
- — **(b) hard concept reappearing** (`fetch`, Lesson 1) with **(a) a
  genuinely new second argument**: Lesson 1's `fetch` took only a URL,
  defaulting to a `GET` request with no body. This call passes an options
  object: `method: "POST"` matches the server's `methods=["POST"]`
- restriction exactly — a `GET` here would hit that route's `405`, shown
  in the previous unit. `headers: { "Content-Type": "application/json" }`
  tells the server what format the body is in, so `request.get_json()`
  on the Flask side knows to parse it as JSON rather than something
- else.
- `body: JSON.stringify({ line: line })` — **(b) reappearing**
  `JSON.stringify` (Lesson 1), here converting a small JavaScript object
  *into* JSON text to send, the exact reverse direction of Lesson 1's use
  of it (there, converting *received* data into readable text for
  display).
- The rest (`.then((response) => response.json())`, `.then((data) => {
- ... .textContent = ... })`) — **(c) already established**, identical
  pattern to Lesson 1's status fetch, reused with no new explanation
  owed.

### CS Lens

Registering a callback for `"click"` and returning immediately, with the
actual work happening later and possibly many times, is **event-driven
programming** — the same fundamental shape as this lesson's earlier
`fetch`/Promise chain, just triggered by a human action instead of a
network response.

Also recognized in: every GUI toolkit that has ever existed, game input
handling, and — directly relevant here — a real CNC controller's physical
"Cycle Start" button, which is exactly this same pattern: register once,
react every time it's pressed, for as long as the machine is powered on.

### SE Lens

`type="text"` with no server-side length limit means a user could type an
arbitrarily long line and send it — not exploitable today (there's no
database, no other user, nothing this could corrupt), but a real, named
category of concern (resource exhaustion via unbounded input) worth
remembering the moment this project gains persistence or multiple users.
Not fixed now — correctly scoped out, since there's genuinely nothing yet
for an oversized line to damage.

### Commands and Run

Server already running from the previous unit. Real, live confirmation the
new markup is present:
```
((Invoke-WebRequest -Uri "http://127.0.0.1:5000/" -UseBasicParsing).Content -match "tokenize-button")
True
```
Open `http://127.0.0.1:5000/` in your own browser, type a line, click
Tokenize, and watch the real structured result appear — this is part of
verifying this lesson yourself, not optional.

---

## Connect the Pieces

One concrete value, `"G0 X10 Y20"`, traced through every unit built this
lesson:

1. Typed into the `<input id="line-input">` box (or left at its default).
2. Clicking `<button id="tokenize-button">` fires the registered `"click"`
   listener, which reads `.value` from the input, wraps it as
   `{"line": "G0 X10 Y20"}`, and `fetch`es `POST /api/tokenize` with that
   JSON as the body.
3. Flask's routing table matches `/api/tokenize` + `POST` to
   `tokenize_line()`. `request.get_json(silent=True)` parses the body into
   a real Python dict; the validation check passes (it *is* a dict, it
   *does* have `"line"`).
4. `tokenize(body["line"])` calls into `core/lexer.py` — a module that has
   never heard of Flask, HTTP, or this request. `_WORD_RE.finditer(...)`
   walks the string, finding three matches: `("G", "0")`, `("X", "10")`,
   `("Y", "20")`. Each becomes a dict entry: `{"G": 0.0, "X": 10.0, "Y":
   20.0}`.
5. `{"words": {...}}` is returned from the route. Flask serializes it to
   JSON, sends it back with `200` and `Content-Type: application/json`.
6. The browser's `fetch` Promise resolves; `.json()` parses it back into a
   JavaScript object; `JSON.stringify(data, null, 2)` formats it; the
   result appears inside `<pre id="tokenize-result">`, replacing whatever
   was there before — real, live, verified this session.

## What Breaks Without This

Already caused and shown above, in its own Concept Unit: a comment
embedded in a line (`"G0 X10 (move to home Y5)"`) produces
`{'G': 0.0, 'X': 10.0, 'Y': 5.0}` — a phantom `Y` move that was never
really commanded, because comment-stripping doesn't exist yet. This is
the single biggest reason this lexer is not yet safe to run against real
G-code files, and it's named here, not hidden, as next lesson's opening
problem.

## Exercises

1. In your browser, type `"G0 X10 X20 X30"` (the same axis three times)
   into the tokenize box. Predict the shape of the result before clicking
   — a list of how many elements? — then click and check.
2. Type `"g0 x10"` (lowercase). Confirm the result still has uppercase
   `G`/`X` keys, and explain, from this lesson's walkthrough, which single
   line of code makes that true.
3. Send a request with `Content-Type` left as the browser's default
   instead of `application/json` (remove that line from the `fetch` options
   temporarily, refresh, and try again) and observe what changes — a real,
   live demonstration of why that header exists rather than data just
   happening to work anyway.

## Definition of Done

- [ ] `cnc-service/core/lexer.py` exists, imports nothing from `flask`,
      and `grep -ri flask core/*.py` produces no output.
- [ ] `from core.lexer import tokenize; tokenize("G0 X10")` run directly
      in a Python shell (no server involved) returns
      `{'G': 0.0, 'X': 10.0}`.
- [ ] The server runs and `POST /api/tokenize` with
      `{"line": "G0 X10 Y20"}` returns
      `{"words": {"G": 0.0, "X": 10.0, "Y": 20.0}}`.
- [ ] The same request with a missing `"line"` key, and with genuinely
      malformed JSON text, both return `400` with the same error message.
- [ ] Opening the page in your own browser, typing a line, and clicking
      Tokenize shows the real structured result.
- [ ] You reproduced the comment-parsing failure yourself and understand
      why it happens and why it's deliberately not fixed this lesson.
- [ ] A git commit exists for this lesson's code, explaining *why* (the
      engine gained its first real, ported piece of logic, cleanly
      separated from the web layer from day one) not just *what* changed.
