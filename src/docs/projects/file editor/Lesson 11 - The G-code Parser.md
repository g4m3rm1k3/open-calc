# Lesson 11: A Flat List Still Isn't Structure

## What you will build

A parser that turns one line's flat token list — Lesson 10's own output —
into a `Block`: a real node with a line number, a list of ordinary words,
and an optional comment, each in its own named place instead of mixed
together in one list. The feature is a "Blocks" panel next to Tokens; the
actual subject is the difference between *recognizing* pieces (what a
lexer does) and *understanding how they relate* (what a parser does) —
the second stage of this project's own stated pipeline, `Text → Lexer →
Parser → AST → ...`.

## What you need to know first

`Lesson 10 - The G-code Lexer.md` — `Token`, `tokenize_line`,
`tokenize_program`, the `gcode/` package, the cursor-scanning technique
(not reused directly here, but its output is this lesson's input),
`.output-panel`, `.map()`. `Lesson 6`'s dispatch-table reasoning, echoed
here for a different problem.

---

## Concept Unit: a flat list still isn't structure

### The Problem

`tokenize_line("N60 G00 X10. Y10.")` — real output, from Lesson 10 —
returns four `Token` objects, side by side in one list:

```
[Token(type='WORD', text='N60', letter='N', value=60.0),
 Token(type='WORD', text='G00', letter='G', value=0.0),
 Token(type='WORD', text='X10.', letter='X', value=10.0),
 Token(type='WORD', text='Y10.', letter='Y', value=10.0)]
```

Nothing in that list says `N60` is different in *kind* from the other
three — it's a `WORD` token exactly like `G00`, sitting in the same flat
list, distinguishable only by happening to have `letter='N'`. Every piece
of code that ever needs "the line number" would have to search this list
by hand, checking `letter == "N"` on every token, every single time.

### What This Proves

A lexer's job stops at recognizing *what* each piece is. It deliberately
doesn't decide *what the pieces mean together* — that a line number is
special, that a comment belongs to the line it trails, that everything
else is an ordinary parameter. A **parser** is the next stage precisely
because that decision needs to happen somewhere, once, rather than being
re-derived by every piece of code that later needs it.

---

## Concept Unit: a Block as a real node

### The Problem

Once the line number and any comment are pulled out, what's left needs
somewhere to live too — a shape a reader can look at and immediately
know "line number here, ordinary words here, comment here," instead of
one undifferentiated list.

### Project Change

- **Files affected** — `backend/gcode/parser.py`, new file.
- **Change type** — create.
- **Dependencies** — `Token`, from `backend/gcode/lexer.py`.

### The New Code — type this

```python
from dataclasses import dataclass

from gcode.lexer import Token


@dataclass
class Block:
    line_number: int | None
    words: list[Token]
    comment: str | None
```

### The Updated Project — where this lives

This is the entire file so far — nothing exists in `parser.py` yet for
this to sit alongside.

### Mechanical Walkthrough
`from dataclasses import dataclass` and `@dataclass` both reuse Lesson
10's exact shapes — structure without validation, the right tool again
for a type this project's own code constructs, never untrusted input.
`from gcode.lexer import Token` is new in one specific way: every earlier
`from X import Y` in this project has pulled `Y` from an installed
package (`fastapi`, `pydantic`) or Python's own standard library
(`dataclasses`, `ast`, `subprocess`). This is the first time one part of
- *this project's own code* imports directly from another — `gcode.parser`
depending on `gcode.lexer`, both written in this same lesson series, the
same `import` syntax working identically either way. `line_number: int |
None`, `words: list[Token]`, and `comment: str | None` are three typed
fields — the first two reuse the union-type and typed-list shapes from
Lesson 10; `words: list[Token]` is new only in holding a list of this
project's *own* type rather than a built-in one, the same relationship
`list[Token]` already had to `Token` in `tokenize_line`'s own return
type.

---

## Concept Unit: recognizing the line number

### The Problem

Something has to actually walk one line's tokens and sort them: pull the
`N` word out as `line_number`, pull any comment out separately, and leave
everything else in `words`.

### Project Change

- **Files affected** — `backend/gcode/parser.py`, existing file.
- **Change type** — add, a new `parse_block` function, after `Block`.
- **Dependencies** — `Block` and `Token` from the previous unit.

### The New Code — type this

```python
def parse_block(tokens: list[Token]) -> Block:
    line_number = None
    words = []
    comment = None

    for token in tokens:
        if token.type == "COMMENT":
            comment = token.text
        elif token.type == "WORD" and token.letter == "N":
            line_number = int(token.value) if token.value is not None else None
        else:
            words.append(token)

    return Block(line_number=line_number, words=words, comment=comment)
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added after `Block` —
nothing existing is modified, so there's no enclosing structure to show
it inside of; the block above is everything there is to see.

### Mechanical Walkthrough
`line_number = None`, `words = []`, and `comment = None` initialize the
- three eventual `Block` fields before anything is known — the same
accumulate-then-return shape `list_files` used since Lesson 2, just
three accumulators instead of one. `for token in tokens:` reuses the
plain `for` loop from Lesson 2, over this line's already-tokenized
`Token` list rather than filesystem entries. `if token.type ==
"COMMENT":` reuses the exact type-checking string comparison from
Lesson 10's own lexer code, here reading a `Token`'s field instead of
writing one. `elif token.type == "WORD" and token.letter == "N":` reuses
- `and` — first introduced back in Lesson 1's `require_auth` — combining
two conditions: this token must be a real word, *and* specifically an
`N`. `int(token.value) if token.value is not None else None` is a
ternary, reused from Lesson 2, guarding a real case: `token.value` is a
`float` (`60.0`, from the lexer), and a line number reads more naturally
- as a plain integer (`60`) than a decimal one — `int(...)` converts it,
but only when there's an actual number to convert, since a bare `N` with
no digits would otherwise make `int(None)` crash. The final `else:
words.append(token)` catches everything that's neither a comment nor an
- `N` word — every ordinary parameter, and also any `UNKNOWN` token from
Lesson 10's lexer, preserved rather than silently dropped. `return
Block(line_number=line_number, words=words, comment=comment)`
constructs the actual node, all three accumulators handed in by name.

### CS Lens — the same dispatch shape as Lesson 6, one level down

Lesson 6's `RUNNERS` dictionary decided *which function* to run based on
a file extension. This `if`/`elif`/`else` chain decides *which
accumulator* a token belongs to, based on its type and letter — a
smaller-scale version of the identical underlying question: given one
piece of input, which of several possible treatments does it get. A
dictionary lookup wasn't reached for here because there are only three
outcomes, not an open-ended, growing set of languages — the same
tradeoff named in Lesson 6's own SE Lens, just landing on the opposite
side of it for a different-shaped problem.

### Run It

```python
parse_block(tokenize_line("N60 G00 X10. Y10."))
```

Actual output:

```
Block(line_number=60,
      words=[Token(type='WORD', text='G00', letter='G', value=0.0),
             Token(type='WORD', text='X10.', letter='X', value=10.0),
             Token(type='WORD', text='Y10.', letter='Y', value=10.0)],
      comment=None)
```

Now a line that also carries a comment:

```python
parse_block(tokenize_line("N70 G01 Z-5. F500 (plunge)"))
```

Actual output:

```
Block(line_number=70,
      words=[Token(type='WORD', text='G01', letter='G', value=1.0),
             Token(type='WORD', text='Z-5.', letter='Z', value=-5.0),
             Token(type='WORD', text='F500', letter='F', value=500.0)],
      comment='(plunge)')
```

Confirmed directly: the `N` word is gone from `words` entirely — it's
`line_number` now — and the comment sits in its own field, both real
proof this is genuinely restructured data, not the same flat list with a
new name.

---

## Concept Unit: parsing a whole program

### The Problem

`parse_block` handles one line. A real `.nc` file, already split into
per-line token lists by `tokenize_program`, needs every one of those
lines parsed in order.

### Project Change

- **Files affected** — `backend/gcode/parser.py`, existing file.
- **Change type** — add, a new `parse_program` function, after
  `parse_block`.
- **Dependencies** — `parse_block` from the previous unit.

### The New Code — type this

```python
def parse_program(lines: list[list[Token]]) -> list[Block]:
    return [parse_block(tokens) for tokens in lines]
```

### The Updated Project — where this lives

This is a complete, freestanding new function, added after `parse_block`
— nothing existing is modified, so there's no enclosing structure to
show it inside of; the line above is everything there is to see.

### Mechanical Walkthrough
`[parse_block(tokens) for tokens in lines]` reuses the exact list
- comprehension shape from Lesson 10's own `tokenize_program` — "the list of `parse_block(tokens)`, for every `tokens`" — the identical pattern,

one level higher: `tokenize_program` turned lines of text into lines of
tokens; `parse_program` turns lines of tokens into a list of `Block`s.
`list[list[Token]]` as the parameter type is `tokenize_program`'s own
return type from Lesson 10, named directly — this function's input is
defined in terms of the previous stage's output, the same
pipeline-shaped relationship `BRD.md` describes for the whole
architecture, now visible in two real, adjacent function signatures.

---

## Concept Unit: a route that exposes the parser

### The Problem

Something has to expose `parse_program` over the network, gated and
sandboxed exactly like every other file-touching route in this project.

### Project Change

- **Files affected** — `backend/main.py`, existing file.
- **Change type** — add.
- **Location** — `from gcode.parser import parse_program` added among
  the existing imports; a new `@app.post("/parse")` route added after
  `tokenize_file`.
- **Dependencies** — the `gcode.parser` module built in this lesson.

### The New Code — type this

```python
@app.post("/parse", dependencies=[Depends(require_auth)])
def parse_file(path: str = ""):
    target_file = (CONTENT_DIR / path).resolve()

    if not target_file.is_relative_to(CONTENT_DIR):
        raise HTTPException(status_code=400, detail="Invalid path")

    if not target_file.is_file():
        raise HTTPException(status_code=404, detail="File not found")

    if target_file.suffix != ".nc":
        raise HTTPException(status_code=400, detail="Only .nc files can be parsed")

    content = target_file.read_text(encoding="utf-8")

    blocks = []
    for block in parse_program(tokenize_program(content)):
        blocks.append({
            "line_number": block.line_number,
            "words": [
                {"letter": token.letter, "value": token.value}
                for token in block.words
            ],
            "comment": block.comment,
        })

    return {"path": path, "blocks": blocks}
```

### The Updated Project — where this lives

The import lands among the existing ones:

```python
from gcode.lexer import tokenize_program
from gcode.parser import parse_program   # ← new
```

`parse_file` itself is a complete, freestanding new function, added
after `tokenize_file` — nothing existing is modified, so there's no
enclosing structure to show it inside of; the block above is everything
there is to see.

### Mechanical Walkthrough
The first three checks reuse the identical traversal, existence, and
`.nc`-only pattern from `tokenize_file`. `parse_program(tokenize_program(content))`
chains this lesson's function directly onto Lesson 10's — the lexer's
output feeding the parser's input, in one expression, the same pipeline
relationship named in the previous unit's CS Lens, now actually running.
`for block in parse_program(...): blocks.append({...})` reuses the
explicit-dictionary-construction pattern from `tokenize_file`, one level
deeper: `"words": [{"letter": token.letter, "value": token.value} for
token in block.words]` is a *nested* list comprehension, converting each
`Block`'s own list of `Token` objects into a list of small dictionaries
- — every `Token` field serialized explicitly except `type` and `text`,
deliberately left out since, inside a parsed `Block`, every remaining
word is already known to be a `WORD` token and its `letter`/`value` say
everything `text` would have said less directly.

### Run It

```
POST /parse?path=src/sample.nc →
{"path":"src/sample.nc","blocks":[
  {"line_number":null,"words":[],"comment":"(Facing operation)"},
  {"line_number":10,"words":[{"letter":"G","value":90.0},{"letter":"G","value":94.0}],"comment":null},
  ...
]}

POST /parse?path=src/main.py → 400 {"detail":"Only .nc files can be parsed"}
```

Confirmed directly against the real running server — 12 real blocks for
`sample.nc`, condensed above for space; `/tokens` and `/run` both
regression-checked against the same server and still behave exactly as
Lessons 5 and 10 left them.

---

## Concept Unit: a Blocks panel

### The Problem

The parsed structure needs its own place on screen, readable at a
glance — line number, words, comment — not the raw JSON a `curl` request
returns.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. A new `#blocks-output` element, reusing
  `.output-panel` from Lesson 10; a new `parseFile` function; a new
  "Blocks" button; one more clearing line inside `renderEditor`
  (Lesson 4/9/10), alongside its existing `#tokens-output` clearing.
- **Location** — the button sits after "Tokens"; `#blocks-output` sits
  after `#tokens-output`, both inside `#editor-pane`; `parseFile` is
  placed directly after `tokenizeFile`; the new `renderEditor` line
  sits right after the one it already has for `#tokens-output`.
- **Dependencies** — the `/parse` route above.

### The New Code — type this

```javascript
function parseFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("blocks-output");

    if (!activeTabPath.endsWith(".nc")) {
        outputElement.textContent = "Not a G-code file.";
        return;
    }

    outputElement.textContent = "Parsing...";

    fetch("http://127.0.0.1:8000/parse?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
        headers: {
            "Authorization": "Bearer " + authToken,
        },
    })
        .then((response) => response.json())
        .then((data) => {
            const lines = data.blocks.map((block) => {
                const lineLabel = block.line_number === null ? "?" : block.line_number;
                const words = block.words.map((word) => word.letter + "=" + word.value).join("  ");
                const commentLabel = block.comment ? "  " + block.comment : "";
                return "N" + lineLabel + ": " + words + commentLabel;
            });
            outputElement.textContent = lines.join("\n");
        })
        .catch((error) => {
            outputElement.textContent = "Could not parse file.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`tokenizeFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The button and panel it targets:

```html
<div>
    <button id="save-button">Save</button>
    <button id="run-button">Run</button>
    <button id="tokens-button">Tokens</button>
    <button id="blocks-button">Blocks</button>   <!-- ← new -->
    <span id="save-status"></span>
</div>
<div id="diagnostics-output"></div>
<div id="run-output" class="output-panel"></div>
<div id="tokens-output" class="output-panel"></div>
<div id="blocks-output" class="output-panel"></div>   <!-- ← new -->
```

And the listener, alongside the existing ones:

```javascript
document.getElementById("tokens-button").addEventListener("click", tokenizeFile);
document.getElementById("blocks-button").addEventListener("click", parseFile);   // ← new
```

`#blocks-output` is this project's *third* element using
`.output-panel` — no further CSS change needed at all, which is exactly
the payoff Lesson 10's refactor was for. `renderEditor` needs one more
line, clearing this new panel the same moment it already clears
`#tokens-output`:

```javascript
document.getElementById("tokens-output").textContent = "";
document.getElementById("blocks-output").textContent = "";   // ← new
```

Without it, switching from a file whose Blocks panel was showing real
output to a brand-new tab would leave that stale output on screen —
the same reason `renderEditor` has cleared `#run-output` since Lesson
5, now extended to a fourth panel.

### Mechanical Walkthrough
`if (activeTabPath === null)`, the `.endsWith(".nc")` guard, and the
`fetch(...)` shape all reuse `tokenizeFile` exactly, unit for unit.
`data.blocks.map((block) => { ... })` reuses `.map()` from Lesson 10,
now over parsed `Block` objects instead of raw per-line token arrays.
`block.line_number === null ? "?" : block.line_number` is a ternary,
reused from Lesson 2, displaying `"?"` for the one real case a line has
no `N` word at all (`sample.nc`'s opening comment line, confirmed in
this lesson's `Run It` output above). `block.words.map((word) =>
word.letter + "=" + word.value).join("  ")` reuses the identical
nested-map-then-join shape `tokenizeFile` already established, over a
`Block`'s `words` instead of a raw line's tokens. `block.comment ? "  "
+ block.comment : ""` reuses the `||`-adjacent truthy-check idiom from
- Lesson 5's `data.stdout || "(no output)"` — here as a full ternary since
the "nothing" case needs an empty string, not a fallback message.

---

## Connect the pieces

Clicking Blocks on `sample.nc`: `parseFile()` confirms the file is open
and ends in `.nc`, then sends `POST /parse?path=src/sample.nc`. On the
backend, `parse_file` runs the shared traversal/existence/extension
checks, reads the file, and chains `tokenize_program` directly into
- `parse_program` — one call producing the raw tokens, the next
restructuring them into `Block`s, line number and comment pulled out of
each line's `words` into their own named fields. Every `Block` and its
nested `Token` list get converted explicitly into plain dictionaries
before the response returns as JSON. The frontend receives twelve
blocks, and `parseFile`'s two nested `.map()` calls turn each one back
- into one readable line — `N60: G=0.0  X=10.0  Y=10.0`, line number
first, words in original order, comment trailing if there is one —
displayed in `#blocks-output`, sitting right next to the raw token view
Lesson 10 built, each panel showing a different, real stage of the same
pipeline running against the same file.

## What breaks without this

Already demonstrated concretely above, not hypothetically:
`tokenize_line("N60 G00 X10. Y10.")` alone returns `N60` as an ordinary
- `WORD` token, indistinguishable in kind from `G00`, `X10.`, or `Y10.` —
confirmed directly in this lesson's first unit. Only after `parse_block`
runs does `N60` become `line_number=60`, structurally separated from the
three real parameter words left behind in `words`.

## Exercises

1. Open `src/sample.nc` through the running app, click Blocks, and
   compare its output line by line against clicking Tokens on the same
- file — confirm every `N` word is gone from the Blocks view and shows
   up as that line's number instead.
2. Add a line to `sample.nc` with no `N` word at all (a bare `G04 P500`,
   for instance) and confirm its block shows `N?:` in the panel.
- 3. Trace `parse_block(tokenize_line("G01 (rapid) X10"))` on paper first — predict `line_number`, `words`, and `comment` — then run it and

   compare. Notice the comment sits *between* two words in the source
   line; confirm it still ends up correctly separated regardless of
   where it appeared.

## Definition of done

- [ ] You've parsed `sample.nc` through the real running app and
      compared its Blocks view against its Tokens view
- [ ] You can explain, in your own words, the difference between what a
      lexer decides and what a parser decides
- [ ] You can explain why `gcode.parser` importing from `gcode.lexer` is
      a different kind of import from anything earlier in this project
- [ ] You can explain why `line_number` is converted with `int(...)`
      instead of staying a `float` like every other word's `value`
- [ ] `git commit` this lesson's code with a message explaining why
