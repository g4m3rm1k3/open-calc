# Lesson 20: Infrastructure Nobody Could See

## What you will build

A real History panel — finally exposing the `/history` route Lesson 7
built. The feature is small; the actual subject is a real, standing gap
this project has been carrying since Lesson 7 without anyone noticing:
a working backend route with no way to ever reach it from the running
app, caught only now, rereading `LessonContract`'s own words closely —
"a lesson that delivers only infrastructure — types, utilities,
helpers — with no visible result is not a vertical slice. It is
waterfall with extra steps."

## What you need to know first

`Lesson 7 - Version History.md` — `/history`, and the exact shape of
data it returns: `hash`, `timestamp`, `message`, oldest commits first...
actually newest first, per `git log`'s own default order. `Lesson 19`'s
`authenticatedFetch`, reused unchanged. `Lesson 10`'s `.output-panel`.

---

## Concept Unit: infrastructure nobody could see

### The Problem

`/history`, gated, tested, and verified, has existed since Lesson 7.
Nothing in `index.html` has ever called it. Confirmed directly —
searching this project's own frontend code for any reference to
`/history`, `historyFile`, or a History button, before this lesson,
returns nothing at all. A student who finished Lesson 7 and opened the
running app would never find any trace of what that lesson built.

### What This Proves

This is a real violation of a rule this curriculum is supposed to
follow, caught only by rereading `LessonContract` closely: "the first
thing built in any project with a visual output is the visual output...
never build invisible infrastructure first." Lesson 7 built the
infrastructure — a real, correct, gated route — and never built the
visible half. The fix isn't just adding a feature; it's closing a gap
this project has been carrying, unnoticed, since Lesson 7.

---

## Concept Unit: a place on screen for history

### The Problem

The commit list needs its own space on screen, next to every other
panel this editor pane already has.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add. A new `#history-output` element, reusing
  `.output-panel`; a new "History" button.
- **Location** — the button sits after "Analyze"; `#history-output`
  sits after `#analysis-output`, both inside `#editor-pane`.
- **Dependencies** — none new.

### The New Code — type this

```html
<button id="history-button">History</button>
```

And the panel it will write into:

```html
<div id="history-output" class="output-panel"></div>
```

### The Updated Project — where this lives

```html
<div>
    <button id="save-button">Save</button>
    <button id="run-button">Run</button>
    <button id="tokens-button">Tokens</button>
    <button id="blocks-button">Blocks</button>
    <button id="analyze-button">Analyze</button>
    <button id="history-button">History</button>   <!-- ← new -->
    <span id="save-status"></span>
</div>
<div id="diagnostics-output"></div>
<div id="run-output" class="output-panel"></div>
<div id="tokens-output" class="output-panel"></div>
<div id="blocks-output" class="output-panel"></div>
<div id="analysis-output" class="output-panel"></div>
<div id="history-output" class="output-panel"></div>   <!-- ← new -->
```

`#history-output` is this project's *fifth* element using
`.output-panel` — still no CSS change required, five real panels now
resting on one rule written once, back in Lesson 10.

### Mechanical Walkthrough

`<button id="history-button">History</button>` reuses ordinary button
markup, identical in shape to every other button in this row since
Lesson 5. `<div id="history-output" class="output-panel"></div>` reuses
the exact empty, class-tagged container shape every other output panel
already has.

---

## Concept Unit: displaying real commits

### The Problem

Something has to actually call `/history` and turn the real commit list
it returns into readable text.

### Project Change

- **Files affected** — `index.html`, existing file.
- **Change type** — add, a new `historyFile` function, placed directly
  after `analyzeFile`; a new button listener.
- **Dependencies** — the `/history` route (Lesson 7), `authenticatedFetch`
  (Lesson 19).

### The New Code — type this

```javascript
function historyFile() {
    if (activeTabPath === null) {
        return;
    }

    const outputElement = document.getElementById("history-output");
    outputElement.textContent = "Loading history...";

    authenticatedFetch("http://127.0.0.1:8000/history?path=" + encodeURIComponent(activeTabPath))
        .then((response) => response.json())
        .then((data) => {
            if (data.commits.length === 0) {
                outputElement.textContent = "No history found.";
                return;
            }
            const lines = data.commits.map((commit) => {
                const shortHash = commit.hash.slice(0, 7);
                return shortHash + "  " + commit.timestamp + "  " + commit.message;
            });
            outputElement.textContent = lines.join("\n");
        })
        .catch((error) => {
            outputElement.textContent = "Could not load history.";
        });
}
```

### The Updated Project — where this lives

This is a complete, freestanding new function, placed directly after
`analyzeFile` — nothing existing is modified, so there's no enclosing
structure to show it inside of; the block above is everything there is
to see. The button needs wiring, alongside the existing listeners:

```javascript
document.getElementById("analyze-button").addEventListener("click", analyzeFile);
document.getElementById("history-button").addEventListener("click", historyFile);   // ← new
```

### Mechanical Walkthrough

The guard clause and `authenticatedFetch` call both reuse shapes
established since Lesson 19 — no `method` needed at all, since `/history`
is a plain `GET` route, the same no-options-object shape `loadFolder`
already uses. `data.commits.length === 0` reuses the empty-check pattern
from Lesson 13's `analyzeFile`. `data.commits.map((commit) => { ... })`
reuses `.map()`, now iterating real commit records instead of tokens or
diagnostics. `commit.hash.slice(0, 7)` is new in one specific way:
`.slice(start, end)` has already been taught, back in Lesson 2, on an
*array* — `currentPath.split("/").slice(0, -1)`. `String.prototype.slice`
is a genuinely separate method from `Array.prototype.slice`, but an
identical one: called on a string, it returns a new string containing
the characters from `start` up to, but excluding, `end` — the same
half-open range already explained for arrays, the same method name,
applied to a different type. `commit.hash` is a full 40-character `git`
hash; `.slice(0, 7)` keeps just the first seven characters — a real
`git` convention, the same short-hash length `git log --oneline` shows
by default. `shortHash + "  " + commit.timestamp + "  " + commit.message`
reuses `+` string concatenation, two spaces between each field for
readability. `.join("\n")` reuses the same array-to-text join from every
other panel since Lesson 10.

### Run It

```
GET /history?path=src/utils.py →
6d69cdd  2026-07-16T17:37:50-04:00  Edit src/utils.py
7c8dae9  2026-07-16T17:37:50-04:00  Edit src/utils.py
6a4be19  2026-07-16T07:09:13-04:00  Edit src/utils.py
b740c62  2026-07-16T07:08:10-04:00  Edit src\utils.py
0b852f0  2026-07-16T07:08:09-04:00  Edit src\utils.py
7a0495a  2026-07-16T07:07:21-04:00  Initial commit: sample content folder
```

Confirmed directly, against this project's own real, already-existing
commit history — and worth noticing without prompting: the two oldest
edits still read `Edit src\utils.py`, backslash, the exact real artifact
Lesson 7 found and explained as its own bug, still sitting in this
project's actual git history, unaltered, because fixing the *code* going
forward never rewrites commits already made. History panel, real
history, real bug, still visible six commits later.

---

## Connect the pieces

Clicking History on `src/utils.py`: `historyFile()` confirms the file is
open, sends `GET /history?path=src/utils.py` through
`authenticatedFetch` exactly like every other gated call since Lesson
19, and receives the same six real commits `/history` has always
returned since Lesson 7. `.map()` turns each one into one readable line
— short hash, timestamp, message — and `#history-output` displays them,
newest first, exactly the order `git log` itself produces. Nothing about
`/history` changed at all; only the fact that a person can now actually
see what it returns.

## What breaks without this

Already demonstrated concretely, not hypothetically: before this
lesson, `/history` was fully functional and completely unreachable from
the running app — confirmed by searching this project's own frontend
code for any reference to it and finding none. A real feature, invisible
since the lesson that built it.

## Exercises

1. Open a file with real edit history through the running app, click
   History, and confirm the real commit list appears, newest first.
2. Open a file with no edits since its initial commit and confirm
   exactly one commit appears — the original "Initial commit: sample
   content folder."
3. Compare `historyFile`'s guard clause and `authenticatedFetch` call
   against `analyzeFile`'s — confirm they're identical except for the
   URL and what happens with the response, the same way every gated
   function in this project has looked since Lesson 19.

## Definition of done

- [ ] You've clicked History on a real file through the running app and
      seen its actual commit history
- [ ] You can explain why this gap existed since Lesson 7 and what
      specific rule it violated
- [ ] You can explain the difference between `Array.prototype.slice` and
      `String.prototype.slice` — what's different, and what's identical
- [ ] `git commit` this lesson's code with a message explaining why
