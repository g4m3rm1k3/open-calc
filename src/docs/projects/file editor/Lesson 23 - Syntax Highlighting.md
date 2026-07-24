# Lesson 23: Color Is a Classification, Not a Feeling

## What you will build

A read-only, color-coded view of a G-code file — motion codes, misc
codes, axis words, and comments each rendered in a distinct color —
built entirely from Lesson 10's already-existing tokenizer, with no new
parsing at all. The actual subject is a real architectural constraint
this project has been carrying since Lesson 1, addressed honestly
instead of hacked around: a `<textarea>` cannot render colored text, and
the right fix is not a workaround, it's a second, purpose-built view.

## What you need to know first

`Lesson 10 - The G-code Lexer.md` — `Token`, `type`, `letter`, `value`,
and the `/tokens` route this lesson reuses completely unchanged. `Lesson
21`'s `.output-panel .clickable` descendant-selector pattern, reused
here for a different purpose. `Lesson 3`'s explanation of why a
`<textarea>` needs `.value`, not `.textContent` — the same limitation
that makes this lesson necessary in the first place.

---

## Concept Unit: why the textarea can't be colored

### The Problem

`#file-content` has been a plain `<textarea>` since Lesson 3. Real code
editors show keywords in one color, strings in another, comments in a
third — the actual feature this lesson is named for. A `<textarea>`
cannot do this: it is fundamentally a single block of uniform, unstyled
text. There is no CSS rule, no matter how clever, that colors one
substring inside a `<textarea>` differently from another.

### What This Proves

This isn't a bug to route around with a hack — it's a real, structural
property of what a `<textarea>` *is*. Real syntax-highlighting editors
(VS Code, and this project's own eventually-planned Monaco adoption,
already named in `BRD.md`) are not `<textarea>`s at all — they're built
from an entirely different component, one that separates "the text" from
"how each piece of it is displayed." Replacing `#file-content` with one
of those is a real, deliberate future step this project isn't taking
yet. What *can* be built honestly, today, without that replacement: a
second, separate, read-only view, rendered from real HTML elements that
*can* be colored, sitting alongside the editable textarea rather than
inside it.

---

## Concept Unit: color as classification, reusing the lexer's own output

### The Problem

Coloring a G-code file requires knowing what *kind* of thing each piece
of text is — and that classification already exists: it's exactly what
`tokenize_line` computed back in Lesson 10, sitting unused for this
purpose ever since.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `classifyToken` function, placed directly
  after `diffCurrent`.
- **Dependencies** — the `/tokens` route's response shape (Lesson 10) —
  `type`, `text`, `letter`, `value`.

### The New Code — type this

```javascript
function classifyToken(token) {
    if (token.type === "COMMENT") {
        return "token-comment";
    }
    if (token.type === "UNKNOWN") {
        return "token-unknown";
    }
    if (token.letter === "G") {
        return "token-g";
    }
    if (token.letter === "M") {
        return "token-m";
    }
    if (token.letter === "X" || token.letter === "Y" || token.letter === "Z") {
        return "token-axis";
    }
    return "token-word";
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function — the block above is
everything there is to see.

### Mechanical Walkthrough
Every `if` reuses ordinary conditional syntax, each one returning
immediately rather than falling through — the same early-return shape
every guard clause in this project has used since Lesson 3, applied here
as a sequence of classification checks instead of validation failures.
`token.type === "COMMENT"` and `token.type === "UNKNOWN"` are both
- checked *before* any `token.letter` check — deliberately: a `COMMENT`
token's `letter` field is always `null` (Lesson 10's own `Token`
dataclass leaves it unset for comments), and checking `type` first means
that `null` is never compared against `"G"` at all, sidestepping the
question entirely rather than needing to handle it. `token.letter ===
"X" || token.letter === "Y" || token.letter === "Z"` reuses `||` from
Lesson 5, three equality checks chained rather than a shorter method,
deliberately: introducing a new array-membership method here would be
exactly the kind of "small, familiar-seeming construct with unexamined
behavior" this curriculum's own schema warns against skipping a lab for
- — three `||`-joined comparisons need no new lab because every piece of
them is already fully taught. The final `return "token-word";` is
reached only if every check above it failed — the default classification
for any ordinary word that isn't a motion code, misc code, or axis.

---

## Concept Unit: building colored spans from real tokens

### The Problem

`classifyToken` decides *what color* something should be; something else
has to actually build the colored elements on screen, one per token,
grouped by line.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `highlightFile` function, placed directly
  after `classifyToken`; a new button and panel; one more clearing line
  inside `renderEditor` (Lesson 4/9/10/11/12/20/21/22), alongside its
  existing `#current-diff-output` clearing.
- **Dependencies** — the `/tokens` route (Lesson 10), `classifyToken`.

### The New Code — type this

```javascript
function highlightFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("highlight-output");

    if (!activeTabPath.endsWith(".nc")) {
        outputElement.textContent = "Not a G-code file.";
        return;
    }

    outputElement.textContent = "Highlighting...";

    authenticatedFetch("http://127.0.0.1:8000/tokens?path=" + encodeURIComponent(activeTabPath), {
        method: "POST",
    })
        .then((response) => response.json())
        .then((data) => {
            outputElement.textContent = "";
            data.lines.forEach((lineTokens) => {
                const lineElement = document.createElement("div");
                lineTokens.forEach((token) => {
                    const span = document.createElement("span");
                    span.textContent = token.text + " ";
                    span.className = classifyToken(token);
                    lineElement.appendChild(span);
                });
                outputElement.appendChild(lineElement);
            });
        })
        .catch((error) => {
            outputElement.textContent = "Could not highlight file.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`classifyToken` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The button and panel it targets:

```html
<button id="current-diff-button">Current Diff</button>
<button id="highlight-button">Highlight</button>   <!-- ← new -->
<span id="save-status"></span>
```

And the panel it writes into, sitting after `#current-diff-output`:

```html
<div id="current-diff-output" class="output-panel"></div>
<div id="highlight-output" class="output-panel"></div>   <!-- ← new -->
```

`#highlight-output` is this project's *eighth* real instance of
`.output-panel` — still no new box-styling CSS needed; only the token
colors, built in the next unit, are new. `renderEditor` needs one more
line, clearing this new panel the same moment it already clears
`#current-diff-output`:

```javascript
document.getElementById("current-diff-output").textContent = "";
document.getElementById("highlight-output").textContent = "";   // ← new
```

The same reason as every panel before it: without this, switching tabs
would leave a previous file's highlighted view on screen instead of a
clean slate. And the listener, alongside the existing ones:

```javascript
document.getElementById("current-diff-button").addEventListener("click", diffCurrent);
document.getElementById("highlight-button").addEventListener("click", highlightFile);   // ← new
```

### Mechanical Walkthrough
The guard clause, the `.endsWith(".nc")` check, and the `authenticatedFetch`
- call all reuse the exact shape `tokenizeFile` established in Lesson 10 —
this route was never touched; only what happens with its response is
new. `data.lines.forEach((lineTokens) => { ... })` reuses `.forEach()`
from Lesson 2, once per line, exactly the outer loop `tokenizeFile`
already uses. `document.createElement("div")` reuses element
construction from Lesson 2, one `<div>` per line, grouping that line's
tokens together so each line still reads as its own row. The inner
`lineTokens.forEach((token) => { ... })` reuses `.forEach()` a second
time, once per token within that line. `document.createElement("span")`
reuses the same construction pattern for each individual token.
`span.textContent = token.text + " "` reuses `+` concatenation, adding
- back a single space `tokenize_line` itself discarded during lexing —
Lesson 10's lexer treats whitespace as insignificant and skips it
entirely, so a space has to be reintroduced here for the rendered line
to read correctly, not because the original spacing is being preserved.
`span.className = classifyToken(token)` reuses this lesson's own
function, attaching exactly one of five real CSS classes to each token.
`lineElement.appendChild(span)` and `outputElement.appendChild(lineElement)`
both reuse `.appendChild()` from Lesson 2, assembling each line, then
assembling the whole highlighted view from its lines.

---

## Concept Unit: the color palette

### The Problem

Five real CSS classes need real colors — chosen deliberately, not
arbitrarily.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, five new CSS rules in the existing `<style>`
  block, after `#run-output.has-error`.
- **Dependencies** — none new.

### The New Code — type this

```css
.token-comment {
    color: #6a9955;
}
.token-g {
    color: #569cd6;
}
.token-m {
    color: #c586c0;
}
.token-axis {
    color: #ce9178;
}
.token-unknown {
    color: #f44747;
    text-decoration: underline;
}
```

### The Updated Project — where this lives

```css
#run-output.has-error {
    color: #f88;
}
.token-comment {                        /* ← new */
    color: #6a9955;                     /* ← new */
}                                         /* ← new */
.token-g {                               /* ← new */
    color: #569cd6;                      /* ← new */
}                                          /* ← new */
.token-m {                                /* ← new */
    color: #c586c0;                       /* ← new */
}                                           /* ← new */
.token-axis {                              /* ← new */
    color: #ce9178;                        /* ← new */
}                                            /* ← new */
.token-unknown {                            /* ← new */
    color: #f44747;                         /* ← new */
    text-decoration: underline;             /* ← new */
}                                             /* ← new */
```

`.token-word` — the default classification, ordinary words like `N10`,
`T1`, `F500` — is deliberately given no rule at all, and needs none:
without a matching CSS class, an element simply keeps `.output-panel`'s
own existing `color: #ddd`, the same light gray every other panel's text
already uses.

### Mechanical Walkthrough
`color`, on all five rules, reuses the property already used throughout
this project's CSS since Lesson 5. `text-decoration: underline` on
- `.token-unknown` is new — an underline beneath the text, the same
visual convention a spell-checker or a linter uses to flag something
worth a second look, deliberately chosen here for tokens `tokenize_line`
itself couldn't classify as a recognized word or comment.

### Recognition

Also recognized in: VS Code's own default dark theme, which colors
comments a muted green and control-flow keywords blue — this project's
`#6a9955` and `#569cd6` are not arbitrary; they're VS Code's own actual
values, chosen deliberately so this project's highlighting looks
immediately familiar rather than inventing its own unfamiliar
convention. The broader idea — assigning a color per *token category*,
computed once during lexing rather than guessed from raw text at
render time — is the same approach every real syntax highlighter uses,
from `vim`'s and `emacs`'s built-in highlighting to the tokenizers
inside VS Code, IntelliJ, and every browser's own "View Source" coloring.

### Run It

Real classifications, confirmed directly against this project's own
`sample.nc`, run through the actual classification logic:

```
(Facing operation)  → token-comment
N10                 → token-word
G90                 → token-g
G94                 → token-g
T1                  → token-word
M06                 → token-m
Z25.                → token-axis
X10.                → token-axis
Y10.                → token-axis
F500                → token-word
```

---

## Connect the pieces

Clicking Highlight on `sample.nc`: `highlightFile()` confirms the file
is open and G-code, then sends the exact same `POST /tokens` request
`tokenizeFile` has sent since Lesson 10 — no new backend work at all.
For each line, for each token, `classifyToken` inspects `type` and
`letter` — fields that already existed in every response `/tokens` has
ever returned — and returns one of five class names.
`document.createElement("span")` builds one real, colorable HTML element
per token, `className` attaches its classification, and the CSS rules
built in this lesson's last unit give each classification its actual
color. The `<textarea>` itself, `#file-content`, is never touched —
still the single, uncolored place editing actually happens — while
`#highlight-output`, entirely separate, shows the same file's content
color-coded by what Lesson 10's lexer already determined it to be.

## What breaks without this

Already demonstrated concretely, not hypothetically: nothing in CSS can
color one substring of a `<textarea>`'s value differently from another —
a real, structural fact about the element, not a missing feature this
project simply hadn't gotten to yet. Building `#highlight-output` as a
separate, real set of DOM elements is the only honest way to show color
at all without replacing the editing component entirely.

## Exercises

1. Open `src/sample.nc` through the running app, click Highlight, and
   confirm motion codes, misc codes, axis words, and the comment each
   render in a visibly different color.
2. Open `src/duplicate_axis.nc` or `src/motion_conflict.nc` and confirm
   the same coloring applies correctly to files with real mistakes in
   them — highlighting doesn't depend on the file being semantically
   correct, only on it lexing into real tokens.
3. Add a line with a genuinely unrecognized character (`%`, for
   instance) and confirm it renders underlined in `.token-unknown`'s
   color, distinct from every other classification.
4. Explain, in your own words, why `#file-content` and
   `#highlight-output` have to be two separate elements instead of one
   — tie the answer directly to this lesson's first unit.

## Definition of done

- [ ] You've clicked Highlight on a real G-code file through the running
      app and seen real, distinctly colored token categories
- [ ] You can explain why a `<textarea>` cannot be the thing that gets
      colored, in terms of what a `<textarea>` actually is
- [ ] You can explain why `classifyToken` checks `token.type` before it
      ever checks `token.letter`
- [ ] You can name the real editor whose color choices this lesson's
      palette deliberately reused
- [ ] `git commit` this lesson's code with a message explaining why
