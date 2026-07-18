# Lesson 12: A Mistake That Isn't a Syntax Error

## What you will build

An "Analyze" panel that checks a parsed `.nc` file for a real class of
mistake neither the lexer nor the parser can catch: the same axis
appearing twice in one block (`X10 X20` — which one actually wins?). The
feature is a fourth button next to Tokens and Blocks; the actual subject
is **semantic analysis** — the pipeline stage named directly in
`BRD.md`, and a real design bug this lesson's own first attempt produced
and caught before it ever shipped.

## What you need to know first

`Lesson 11 - The G-code Parser.md` — `Block`, `parse_block`,
`parse_program`, the `gcode/` package. `Lesson 8`'s `set`
(`valid_tokens`), reused here for the same reason. `Lesson 10`'s `.map()`
and `.output-panel`.

---

## Concept Unit: a mistake that isn't a syntax error

### The Problem

```
N10 G01 X10 X20 F500
```

This line is perfectly valid, by every check built so far. `tokenize_line`
recognizes four ordinary words plus a line number — no `UNKNOWN` tokens,
nothing malformed. `parse_block` builds a clean `Block` — a real line
number, a real `words` list, no comment. Confirmed directly:

```python
parse_block(tokenize_line("N10 G01 X10 X20 F500"))
```

Actual output:

```
Block(line_number=10,
      words=[Token(type='WORD', text='G01', letter='G', value=1.0),
             Token(type='WORD', text='X10', letter='X', value=10.0),
             Token(type='WORD', text='X20', letter='X', value=20.0),
             Token(type='WORD', text='F500', letter='F', value=500.0)],
      comment=None)
```

And yet this line is still wrong: `X` — the same physical machine axis —
is told to go to two different places in the same block. A real
controller reading this would have to pick one silently (usually the
last one), discarding the other with no warning at all.

### What This Proves

Neither `tokenize_line` nor `parse_block` has any way to catch this, and
that isn't a bug in either of them — it's outside what they're *for*.
The lexer only asks "is this shaped like a word." The parser only asks
"which named slot does this word belong in." Neither one ever asks "do
these words, taken together, actually make sense" — that's a
fundamentally different question, and it's the one **semantic analysis**
exists to answer: given a structure that's already syntactically correct,
what does it actually *mean*, and is that meaning valid.

---

## Concept Unit: a diagnostic as a real record

### The Problem

A semantic check needs somewhere to report what it found — which line,
and what's wrong with it.

### Project Change

- **Files affected** — `backend/gcode/analyzer.py`, new file.
- **Change type** — create.
- **Dependencies** — `Block`, from `backend/gcode/parser.py`.

### The New Code — type this

```python
from dataclasses import dataclass

from gcode.parser import Block


@dataclass
class Diagnostic:
    line_number: int | None
    message: str
```

### The Updated Project — where this lives

This is the entire file so far — nothing exists in `analyzer.py` yet for
this to sit alongside.

### Mechanical Walkthrough

Every piece here reuses shapes from `Token` and `Block` before it:
`@dataclass` a third time, `line_number: int | None` the identical field
`Block` already has, `message: str` an ordinary required string field.
`from gcode.parser import Block` reuses the cross-module import pattern
Lesson 11 introduced — `gcode.analyzer` now depends on `gcode.parser`,
which itself depends on `gcode.lexer`, a real three-stage chain matching
`BRD.md`'s own pipeline, one file per stage.

---

## Concept Unit: checking one block — and a real bug this lesson caught

### The Problem

Something has to walk a `Block`'s `words` and notice when the same
letter shows up twice.

### Project Change

- **Files affected** — `backend/gcode/analyzer.py`, existing file.
- **Change type** — add, a new `analyze_block` function, after
  `Diagnostic`.
- **Dependencies** — `Diagnostic` and `Block` from the previous unit.

### The New Code — type this

The first version written for this lesson was the obvious one: track
every letter seen so far in a `set`, and flag anything that shows up a
second time.

```python
def analyze_block(block):
    diagnostics = []
    seen_letters = set()

    for word in block.words:
        if word.letter in seen_letters:
            diagnostics.append(Diagnostic(
                line_number=block.line_number,
                message=f"Address {word.letter} appears more than once in this block",
            ))
        seen_letters.add(word.letter)

    return diagnostics
```

Run directly against this project's own real `sample.nc`, one specific
line — `N10 G90 G94`, absolute-positioning and feed-per-minute mode, both
set on the same line, completely standard, correct G-code:

```python
analyze_block(parse_block(tokenize_line("N10 G90 G94")))
```

Actual output:

```
[Diagnostic(line_number=10, message='Address G appears more than once in this block')]
```

### What This Proves

A real, false positive, caught by testing this exact function against
this project's own existing fixture file before shipping it — not
hypothetically. `G90` and `G94` are both `G` words, and the naive version
above treats *every* repeated letter as a mistake, with no exception. But
`G`/`M` codes are different from axis words by design: a single block
routinely carries several of them at once, each setting an independent
piece of machine state (motion mode, feed mode, plane selection, spindle
control — all separate modal groups) — repetition there is normal, even
required, not an error. Only address letters like `X`, `Y`, `Z`, `F` are
genuinely ambiguous when repeated, because each one names exactly one
physical value, and a block can only actually go to one place.

### The Fix

```python
        if word.letter in ("G", "M"):
            continue
```

### The Updated Project — where this lives

Placed as the very first check inside the loop, before the duplicate
test:

```python
def analyze_block(block: Block) -> list[Diagnostic]:
    diagnostics = []
    seen_letters = set()

    for word in block.words:
        if word.letter in ("G", "M"):          # ← new
            continue                            # ← new
        if word.letter in seen_letters:
            diagnostics.append(Diagnostic(
                line_number=block.line_number,
                message=f"Address {word.letter} appears more than once in this block",
            ))
        seen_letters.add(word.letter)

    return diagnostics
```

### Mechanical Walkthrough

`diagnostics = []` and `seen_letters = set()` set up two accumulators —
`set`, reused from Lesson 8's `valid_tokens`, exactly for the same
reason: only membership matters, not order or count. `for word in
block.words:` reuses the plain `for` loop, over a `Block`'s own field
this time. `word.letter in ("G", "M")` reuses the `in` operator against
a tuple of two literal strings, the same membership test already used
for `line[i] in "+-"` back in Lesson 10, testing a different kind of
collection. `continue` reuses the loop-skip keyword from Lesson 10's own
lexer — skipping straight to the next word without ever reaching the
duplicate check below it. `word.letter in seen_letters` reuses set
membership testing, the exact mechanism `require_auth` used for
`valid_tokens` in Lesson 8. `f"Address {word.letter} appears more than
once in this block"` reuses f-string interpolation from Lesson 6.
`seen_letters.add(word.letter)` reuses `.add()`, also from Lesson 8's
`valid_tokens.add(token)`.

### Run It

Re-run against the exact same line that produced the false positive:

```python
analyze_block(parse_block(tokenize_line("N10 G90 G94")))
```

Actual output:

```
[]
```

And against a genuine mistake:

```python
analyze_block(parse_block(tokenize_line("N10 G01 X10 X20 F500")))
```

Actual output:

```
[Diagnostic(line_number=10, message='Address X appears more than once in this block')]
```

Confirmed directly: the real modal-group line now produces zero
diagnostics, and the genuine duplicate-axis mistake still produces
exactly one.

### SE Lens — the check that mattered wasn't a unit test, it was the real fixture

Nothing about the naive version would have looked wrong reading the code
— `seen_letters`, the `in` check, the loop, all correct Python, doing
exactly what they were written to do. The bug was in the *rule itself*:
"any repeated letter is a mistake" is simply false for G-code. It surfaced
specifically because this function was run against `sample.nc` — a real,
already-correct file already committed to this project — before being
trusted, the same discipline named for the `.git` bug in Lesson 8 and the
`.className` bug in Lesson 10: verify against something real before
believing new code is right, not just that it runs without an error.

---

## Concept Unit: analyzing a whole program

### The Problem

`analyze_block` handles one block. A real file, already parsed into a
list of `Block`s, needs every one of them checked, and every block's
diagnostics collected into a single flat list.

### Project Change

- **Files affected** — `backend/gcode/analyzer.py`, existing file.
- **Change type** — add, a new `analyze_program` function, after
  `analyze_block`.
- **Dependencies** — `analyze_block` from the previous unit.

### The New Code — type this

```python
def analyze_program(blocks: list[Block]) -> list[Diagnostic]:
    diagnostics = []
    for block in blocks:
        diagnostics.extend(analyze_block(block))
    return diagnostics
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added after
`analyze_block` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see.

### Mechanical Walkthrough

`diagnostics = []` and the `for block in blocks:` loop reuse the
accumulate-then-return shape used throughout this project since Lesson
2. `diagnostics.extend(analyze_block(block))` is new: `.extend()` is a
list method that adds every item *from* another list into this one,
individually — different from `.append()`, which adds exactly one item,
*as* one item. `analyze_block(block)` already returns a list (possibly
empty, possibly several diagnostics); `.append()`-ing that list would put
the whole list itself in as a single item, nested one level too deep —
`diagnostics.extend(...)` instead flattens each block's diagnostics
directly into the running total. Confirmed directly, the difference
`.append()` would have caused:

```python
x = [1, 2]
x.append([3, 4])
print(x)
x = [1, 2]
x.extend([3, 4])
print(x)
```

Actual output:

```
[1, 2, [3, 4]]
[1, 2, 3, 4]
```

---

## Concept Unit: a route that exposes the analyzer

### The Problem

Something has to expose `analyze_program` over the network, gated and
sandboxed exactly like every other file-touching route in this project.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `from gcode.analyzer import analyze_program` added
  among the existing imports; a new `@app.post("/analyze")` route added
  after `parse_file`.
- **Dependencies** — the `gcode.analyzer` module built in this lesson.

### The New Code — type this

```python
@app.post("/analyze", dependencies=[Depends(require_auth)])
def analyze_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".nc":
        raise HTTPException(status_code=400, detail="Only .nc files can be analyzed")

    content = target_file.read_text(encoding="utf-8")

    blocks = parse_program(tokenize_program(content))
    diagnostics = analyze_program(blocks)

    return {
        "path": path,
        "diagnostics": [
            {"line_number": d.line_number, "message": d.message}
            for d in diagnostics
        ],
    }
```

### The Updated Project — where this lives

The import lands among the existing ones:

```python
from gcode.lexer import tokenize_program
from gcode.parser import parse_program
from gcode.analyzer import analyze_program   # ← new
```

`analyze_file` itself is a complete, freestanding new function, added
after `parse_file` — nothing existing is modified, so there's no
enclosing structure to show it inside of; the block above is everything
there is to see.

### Mechanical Walkthrough

The first three checks reuse the identical traversal, existence, and
`.nc`-only pattern from every route in this file since Lesson 5. `blocks
= parse_program(tokenize_program(content))` reuses Lesson 11's own
chained call directly. `diagnostics = analyze_program(blocks)` runs this
lesson's function against it — the full three-stage pipeline, lexer into
parser into analyzer, in two lines. The final list comprehension reuses
the explicit-dictionary-construction pattern every other route already
follows, converting each `Diagnostic` object into a plain dictionary by
name.

### Run It

```
POST /analyze?path=src/sample.nc →
{"path":"src/sample.nc","diagnostics":[]}

POST /analyze?path=src/duplicate_axis.nc →
{"path":"src/duplicate_axis.nc","diagnostics":[
  {"line_number":10,"message":"Address X appears more than once in this block"}
]}

POST /analyze?path=src/main.py → 400 {"detail":"Only .nc files can be analyzed"}
```

All three confirmed directly against the real running server —
`sample.nc` (already-correct, committed G-code) comes back completely
clean; `duplicate_axis.nc`, a new fixture committed specifically for this
lesson with a real duplicate-axis mistake on line 10, correctly reports
it. `/parse`, `/tokens`, and `/run` all regression-checked against the
same server and still behave exactly as their own lessons left them.

---

## Concept Unit: an Analyze panel

### The Problem

The analyzer's findings need a place on screen, readable at a glance —
"no problems," or exactly which lines have them.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. A new `#analysis-output` element, reusing
  `.output-panel`; a new `analyzeFile` function; a new "Analyze" button;
  one more clearing line inside `renderEditor` (Lesson 4/9/10/11),
  alongside its existing `#blocks-output` clearing.
- **Location** — the button sits after "Blocks"; `#analysis-output` sits
  after `#blocks-output`, both inside `#editor-pane`; `analyzeFile` is
  placed directly after `parseFile`; the new `renderEditor` line sits
  right after the one it already has for `#blocks-output`.
- **Dependencies** — the `/analyze` route above.

### The New Code — type this

```javascript
function analyzeFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("analysis-output");

    if (!activeTabPath.endsWith(".nc")) {
        outputElement.textContent = "Not a G-code file.";
        return;
    }

    outputElement.textContent = "Analyzing...";

    fetch("http://127.0.0.1:8000/analyze?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authToken,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.diagnostics.length === 0) {
                outputElement.textContent = "No problems found.";
                return;
            }
            const lines = data.diagnostics.map((diagnostic) => {
                const lineLabel = diagnostic.line_number === null ? "?" : diagnostic.line_number;
                return "Line " + lineLabel + ": " + diagnostic.message;
            });
            outputElement.textContent = lines.join("\n");
        })
        .catch((error) => {
            outputElement.textContent = "Could not analyze file.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`parseFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The button and panel it targets:

```html
<div>
    <button id="save-button">Save</button>
    <button id="run-button">Run</button>
    <button id="tokens-button">Tokens</button>
    <button id="blocks-button">Blocks</button>
    <button id="analyze-button">Analyze</button>   <!-- ← new -->
    <span id="save-status"></span>
</div>
<div id="diagnostics-output"></div>
<div id="run-output" class="output-panel"></div>
<div id="tokens-output" class="output-panel"></div>
<div id="blocks-output" class="output-panel"></div>
<div id="analysis-output" class="output-panel"></div>   <!-- ← new -->
```

And the listener, alongside the existing ones:

```javascript
document.getElementById("blocks-button").addEventListener("click", parseFile);
document.getElementById("analyze-button").addEventListener("click", analyzeFile);   // ← new
```

`#analysis-output` is this project's *fourth* element using
`.output-panel`, still with no CSS change required. `renderEditor` needs
one more line, clearing this new panel the same moment it already
clears `#blocks-output`:

```javascript
document.getElementById("blocks-output").textContent = "";
document.getElementById("analysis-output").textContent = "";   // ← new
```

The same reason as every panel before it: without this, switching tabs
would leave a previous file's analysis results on screen instead of a
clean slate.

### Mechanical Walkthrough

The guard clause, the `.endsWith(".nc")` check, and the `fetch(...)`
shape all reuse `parseFile`/`tokenizeFile` exactly. `data.diagnostics.length
=== 0` is new only in what it's checking, not the mechanism —
`.length` on an array was already read back in Lesson 4's `closeTab`
(`openTabs.length`); `=== 0` reuses strict equality from Lesson 2. When
there are none, the function returns early with a plain success message,
reusing the same early-return guard-clause shape used everywhere else in
this file. Otherwise, `data.diagnostics.map((diagnostic) => { ... })`
reuses `.map()` a third time this project, and `diagnostic.line_number
=== null ? "?" : diagnostic.line_number` reuses the exact ternary
`parseFile` already applies to a `Block`'s own `line_number`.

---

## Connect the pieces

Clicking Analyze on `duplicate_axis.nc`: `analyzeFile()` confirms the
file is open and G-code, then sends `POST
/analyze?path=src/duplicate_axis.nc`. On the backend, `analyze_file`
runs the shared checks, then chains all three pipeline stages built
across three lessons in two lines — `tokenize_program` into
`parse_program` into `analyze_program`. `analyze_block` walks each
block's words, skipping `G`/`M` codes entirely, and flags any other
letter seen twice — line 10's repeated `X` produces one `Diagnostic`;
line 20's `G90 G94`, a real modal-group line, produces none, exactly
because of the bug this lesson caught and fixed before it ever reached
this route. The frontend receives one diagnostic, and `analyzeFile`
turns it into `"Line 10: Address X appears more than once in this
block"`, displayed in `#analysis-output` — the fourth panel now sharing
Lesson 10's `.output-panel`, next to the raw tokens and parsed blocks
for the exact same file.

## What breaks without this

Already demonstrated concretely above, not hypothetically: the naive,
un-fixed `analyze_block` — no `G`/`M` exclusion — flagged this project's
own real, correct `sample.nc` on its very first real line of G-code,
confirmed with real output before the fix existed. Without the
`.extend()` vs. `.append()` distinction, `analyze_program` would nest
each block's diagnostics one list deep instead of flattening them,
confirmed directly against a small standalone example.

## Exercises

1. Open `src/duplicate_axis.nc` through the running app, click Analyze,
   and confirm the panel reports exactly the line 10 mistake — then click
   Analyze on `src/sample.nc` and confirm it reports none.
2. Edit `duplicate_axis.nc` to also repeat a second axis letter on a
   different line, save, and confirm Analyze reports both mistakes,
   correctly attributed to their own line numbers.
3. In `analyze_block`, temporarily remove the `word.letter in ("G", "M")`
   check, re-run against `sample.nc`, and read the real false positives
   yourself — then restore the check.
4. Predict, before checking, what `analyze_block` would report for a
   block with *three* `X` words in a row — then verify.

## Definition of done

- [ ] You've run Analyze against both `sample.nc` and
      `duplicate_axis.nc` through the real running app and seen the
      correct result for each
- [ ] You can explain why this mistake is invisible to both the lexer
      and the parser, specifically
- [ ] You can reproduce the real false-positive bug yourself and explain,
      in your own words, why `G`/`M` codes need the exception and axis
      words don't
- [ ] You can explain the difference between `.append()` and `.extend()`
      with your own example
- [ ] `git commit` this lesson's code with a message explaining why
