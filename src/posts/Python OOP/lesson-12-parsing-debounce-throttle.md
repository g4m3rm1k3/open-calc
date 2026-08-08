# Lesson 12: Parsing While Someone Is Still Typing
### (Project 5 — Markdown Editor, JavaScript)

**What you will build.** A minimal Markdown-to-HTML parser and a live
preview pane that updates as text is typed into a `<textarea>` — first
naively, re-parsing on every single keystroke, then fixed with
**debounce**. The transferable problems this lesson is actually about:
turning text into structured output using pattern matching instead of
manual character-by-character logic, and recognizing when an event
fires *faster* than the work it triggers can reasonably keep up with —
a genuinely new kind of problem, since nothing built in this curriculum
so far has ever needed to care about *how often* something happened,
only *that* it happened.

**What you need to know first.** Lesson 10 — `addEventListener`,
DOM manipulation. Lesson 11 — the general shape of "one event handler's
job is small and specific."

---

## Concept Unit: Matching Patterns in Text

### The Problem

Markdown text — `# Heading`, `**bold**` — needs to become real HTML —
`<h1>Heading</h1>`, `<b>bold</b>`. Every string operation used so far in
this curriculum (`.slice()`, string concatenation, f-strings/template
literals) works on *exact*, known positions or exact literal characters.
None of them can express "find every place in this text that looks like
`**anything**` and replace it," where "anything" is different every
time and the surrounding text is unknown in advance.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `regex_lab.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file, new project directory.
- **Dependencies** — none; regular expressions are built into
  JavaScript itself.

### The New Code

```javascript
const text = "Buy **milk** and **eggs**";
const result = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
console.log(result);
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

Real output:

```
Buy <b>milk</b> and <b>eggs</b>
```

Both `**milk**` and `**eggs**` were found and replaced correctly, in one
call, with no loop written by hand — proving `/\*\*(.+?)\*\*/g` genuinely
matched a *pattern*, not a fixed string, and matched it twice, at two
different unknown positions. This is called a **regular expression**
(**regex**): `/\*\*.../ `is regex syntax (the slashes mark its start and
end), `\*\*` matches two literal asterisk characters (`\` is needed
because a bare `*` means something different in regex — "repeat the
previous thing," not "a literal asterisk"), `(.+?)` **captures** — saves
for later use — one or more characters, as *few* as possible before the
next part matches, and `g` (a **flag**) means "keep finding matches
across the whole string," not just the first one. `$1` in the
replacement string refers back to whatever `(.+?)` captured, one match
at a time.

### Discard the throwaway example

`regex_lab.js` is deleted — it only existed to prove a single regex can
find and transform multiple pattern matches in one call, isolated from
Markdown or headers entirely.

### Mechanical walkthrough

- `const text = "Buy **milk** and **eggs**";` — **(c) already basic.**
- `text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")` — **(a) first
  appearance** of `.replace()` used with a regex (JavaScript's
  `.replace()` also accepts a plain string, which would only replace the
  *first* literal match — the regex-plus-`g`-flag combination is what
  makes it find and replace every occurrence). `/\*\*(.+?)\*\*/` — **(a)
  first appearance** of regex literal syntax as a whole: everything
  between the slashes describes the pattern to find.
- `$1` — **(a) first appearance**: inside a replacement string,
  refers to the text captured by the first `(...)` group in the pattern
  — here, whatever sat between the two `**` pairs.

### CS lens

Regular expressions describe a **pattern-matching language** of their
own, small and specialized, embedded inside a general-purpose
programming language. Also recognized in: `grep`'s own pattern syntax
(effectively the same language), form validation (checking an email
address's shape), a compiler's lexer — Project 3's own REST API routing
could, in a more advanced version, use regex to match URL paths with
variable segments, exactly the gap flagged as an exercise back in
Lesson 8.

### SE lens

The alternative — walking the string character by character, tracking
"am I currently inside a `**...**` pair," manually — would work, and
would take real, careful, bug-prone code to get right, especially once
more than one pattern (headers *and* bold) needs handling at once.
Regex costs real up-front unfamiliarity — the syntax is dense and, by
most people's own account, genuinely hard to read at a glance — and in
exchange, a correct pattern match that would be tens of lines of manual
scanning becomes one line. The honest tradeoff: regex is also notorious
for becoming *unreadable* once a pattern grows complex enough; this
project's patterns are kept deliberately simple specifically to stay on
the right side of that line.

### Commands needed

`node regex_lab.js`.

### Run it

Shown above.

### Connecting sentence

One regex can find and transform every match of one pattern — the next
step is combining a few of these into an actual Markdown-to-HTML
converter.

---

## Concept Unit: A Minimal Markdown Parser

### The Problem

A real Markdown editor needs to recognize more than one pattern —
headings at different levels (`#`, `##`, `###`) and bold text — and
apply all of them, in the right order, to arrive at real HTML.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `markdown.js`.
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```javascript
function parseMarkdown(text) {
  let html = text;
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  return html;
}

module.exports = { parseMarkdown };
```

### The Updated Project

Brand-new file, shown whole above.

### Introduce the concept in isolation

No separate lab needed — every regex here builds directly on the
pattern just proven; this unit is applying it, not introducing new
mechanics, beyond two small additions explained directly below.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `let html = text;` — **(a) first appearance** of `let` used for a
  value that's reassigned afterward (`const` from earlier lessons is
  for values that never change after being set — `html` is deliberately
  overwritten four times below, so it needs `let`).
- `html.replace(/^### (.+)$/gm, "<h3>$1</h3>");` — **(a) first
  appearance** of two new regex pieces: `^` and `$` mean "start of a
  line" and "end of a line" respectively — not "start/end of the whole
  string" — specifically *because* of the `m` flag (**multiline**) added
  here alongside `g`, which tells the regex engine to treat `^`/`$` as
  matching every line's boundaries, not just the whole text's. Without
  `m`, `^###` would only match `###` if it were the very first three
  characters of the entire input, never a heading on a later line.
- The three heading replacements, `###` before `##` before `#` — **(a)
  first appearance** of a real ordering dependency: if `# (.+)` ran
  *first*, it would match the `#` at the start of `### Heading` too
  (since `.+` would just capture `## Heading` as the "rest" of the
  line), turning a level-3 heading into a level-1 one. Running the most
  specific pattern (`###`) first, and the least specific (`#`) last, is
  what keeps each heading level distinct.
- `html.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");` — **(b) hard concept
  reappearing**, the exact bold-matching regex from the isolated lab,
  run last, against whatever the heading replacements already produced.
- `return html;` — **(c) already basic.**

### CS lens

Nothing new beyond what the previous unit already covered for regex
matching in general — worth stating plainly. What is worth naming: this
is a **naive parser** — a real Markdown parser (or any real language
parser, echoing this curriculum's own recurring
`Text → Lexer → Parser → AST` pipeline mentioned early on) typically
builds an intermediate structured representation first, then renders
HTML from *that*, rather than doing text-to-text regex substitution
directly. This project's version is a deliberate simplification, named
honestly: fine for a handful of fixed patterns, and it would get
fragile fast with more complex Markdown features (nested formatting,
lists, code blocks) that don't reduce cleanly to independent
find-and-replace passes.

### SE lens

The ordering dependency just proven — headings from most to least
specific — is a real, easy-to-get-wrong detail: adding a new pattern to
this function later means thinking carefully about where in the
sequence it has to go, not just appending it at the end. That's a
genuine cost of the naive, sequential-replace approach named in the CS
lens above — a real parser with an intermediate structure wouldn't have
this ordering fragility, because each pattern would be recognized
independently rather than by scanning already-partially-transformed
text.

### Commands needed

None new.

### Run it

```javascript
const input = "# Lesson 12\n## Markdown Editor\nBuy **milk** and **eggs**";
console.log(parseMarkdown(input));
```

```
<h1>Lesson 12</h1>
<h2>Markdown Editor</h2>
Buy <b>milk</b> and <b>eggs</b>
```

### Connecting sentence

Real Markdown text now becomes real HTML — the next unit wires this to
an actual page, so a person can see that HTML update as they type.

---

## Concept Unit: A Live Preview, and Its Real Cost

### The Problem

`parseMarkdown` works — now it needs to run automatically, every time
the text in an editor changes, so a preview pane stays in sync with
what's being typed.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `editor_demo.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `markdown.js`, this lesson's previous unit.

### The New Code

```javascript
let renderCount = 0;
function render() {
  renderCount++;
  preview.innerHTML = parseMarkdown(source.value);
}

source.addEventListener("input", render);
```

### The Updated Project

Brand-new throwaway file, shown whole above — `renderCount` exists only
to measure what this unit is about to prove; the real project's version,
built two units from now, won't need it.

### Introduce the concept in isolation

No separate lab needed — `addEventListener` was fully proven in Lesson
10; the only genuinely new piece is the event type itself, `"input"`,
covered directly below.

### Discard the throwaway example

Not applicable.

### Mechanical walkthrough

- `source.addEventListener("input", render);` — **(a) first appearance**
  of the `"input"` event type: fires every single time a text field's
  value changes by any means — typing, pasting, deleting — distinct
  from `"click"` from Lesson 10, which only fires on a mouse click.
- `renderCount++` / `render()` itself — **(b) hard concept reappearing**,
  ordinary function and counter mechanics already established.

### CS lens

Nothing new beyond `addEventListener` itself, already covered — this
unit's real point isn't a new mechanic, it's a measurement, shown next.

### SE lens

Deferred to this unit's own Run It section below — the measurement
*is* the argument.

### Commands needed

None new.

### Run it

```javascript
function type(text) {
  source.value = text;
  source.dispatchEvent(new Event("input"));
}

type("# ");
type("# L");
type("# Le");
type("# Les");
type("# Less");
type("# Lesson 12");

console.log("preview:", preview.innerHTML);
console.log("render() was called", renderCount, "times for 6 keystrokes");
```

Real output:

```
preview: <h1>Lesson 12</h1>
render() was called 6 times for 6 keystrokes
```

The final preview is correct — but getting there took six full calls to
`parseMarkdown` (four regex passes each) and six full DOM writes, one
per character typed, for text that only mattered once it stopped
changing. That ratio — one full re-parse and re-render per keystroke —
is the real cost this lesson exists to fix; it's proven here with a
counter, not asserted.

### Connecting sentence

Six keystrokes genuinely triggered six full renders — the next unit
fixes that ratio without changing what gets shown, only *when*.

---

## Concept Unit: Debounce

### The Problem

Re-parsing and re-rendering on every keystroke, proven in the last unit,
wastes work: nobody reads the preview mid-keystroke, only once typing
pauses. A real editor should wait until the user has genuinely stopped
— even briefly — before doing the actual work, no matter how many
keystrokes happened in between.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `debounce_lab.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new; `setTimeout`, part of JavaScript itself.

### The New Code

```javascript
function debounce(fn, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

```javascript
let calls = 0;
const debouncedLog = debounce(() => {
  calls++;
  console.log("fired! total calls:", calls);
}, 100);

debouncedLog();
debouncedLog();
debouncedLog();
console.log("called debouncedLog 3 times synchronously, calls so far:", calls);

setTimeout(() => {
  console.log("after waiting past the delay, calls:", calls);
}, 200);
```

Real output, in the actual order it printed:

```
called debouncedLog 3 times synchronously, calls so far: 0
fired! total calls: 1
after waiting past the delay, calls: 1
```

`debouncedLog()` was called three times, immediately, one after
another — and the real underlying function fired exactly **once**, and
only *after* a 100ms pause with no further calls. This is called
**debouncing**: `clearTimeout(timeoutId)` cancels whatever pending timer
the *previous* call had already scheduled, every single time
`debouncedLog` is called again — so only the *last* call in a rapid
burst ever survives long enough for its `setTimeout` to actually fire.

### Discard the throwaway example

`debounce_lab.js`'s demonstration is deleted — the `debounce` function
itself is kept and reused, moved into a permanent `debounce.js`; only
the throwaway `calls`/`debouncedLog` demo around it is discarded.

### Project Change (real code)

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `debounce.js`; modified the editor
  wiring from the previous unit.
- **Change type** — add; wrap.
- **Location** — `render` gets wrapped before being passed to
  `addEventListener`.
- **Dependencies** — `debounce.js`.

### The New Code

```javascript
const debouncedRender = debounce(render, 100);
source.addEventListener("input", debouncedRender);
```

### The Updated Project

```javascript
let renderCount = 0;
function render() {
  renderCount++;
  preview.innerHTML = parseMarkdown(source.value);
}

const debouncedRender = debounce(render, 100);      // ← new
source.addEventListener("input", debouncedRender);    // ← changed
```

`render` itself didn't change at all — `debounce` wraps it from the
outside, the same "wrap without modifying" shape Project 3, Lesson 9's
Adapter used, here delaying and collapsing calls instead of translating
field names.

### Mechanical walkthrough

- `let timeoutId;` — **(a) first appearance**, conceptually: declared
  with no initial value, meaning `undefined` until the first call sets
  it — this is the closure-captured state (Project 3, Lesson 8's
  `make_handler(repo)` closure, the same mechanism) that lets each call
  to the debounced function know about the *previous* call's pending
  timer.
- `return function (...args) {` — **(b) hard concept reappearing**: a
  function returning another function, the same closure shape as
  `make_handler`; `...args` — **(a) first appearance** of a **rest
  parameter**: collects any number of arguments into a real array,
  so `debounce` works regardless of how many arguments the wrapped
  function actually takes.
- `clearTimeout(timeoutId);` — **(a) first appearance.** Cancels a
  previously scheduled `setTimeout`, if one exists — cancelling
  `undefined` (the very first call) is harmless and does nothing.
- `timeoutId = setTimeout(() => fn(...args), delay);` — **(a) first
  appearance** of `setTimeout`: schedules `fn(...args)` to run once,
  after `delay` milliseconds, *without blocking* anything else from
  running in the meantime — proven directly by the isolated lab's
  synchronous `console.log` line printing *before* `"fired!"`, even
  though `setTimeout` was called first.

### CS lens

Debouncing collapses a **burst** of rapid, related events into a single
delayed action. Also recognized in: a search box waiting until typing
pauses before firing an API request, a window-resize handler waiting
until resizing stops before recalculating layout, a save-draft feature
waiting for a pause before writing to disk.

### SE lens

The alternative — this lesson's own previous unit — runs correctly but
wastefully, doing real work (four regex passes, a DOM write) for every
single intermediate keystroke that nobody will ever actually see, since
each one is immediately overwritten by the next. `debounce` costs one
small wrapper function and, honestly, a real UX tradeoff: the preview
now visibly lags behind typing by the chosen delay (100ms here), which
has to be tuned — too short and the collapsing barely helps; too long
and the editor feels unresponsive. Proven directly against the real
editor:

```
immediately after 6 rapid keystrokes, renderCount: 0
preview right now: ""
--- after the debounce delay has passed ---
renderCount: 1
preview: <h1>Lesson 12</h1>
```

Six keystrokes, in the previous unit, meant six renders. Here, the exact
same six keystrokes mean **one** — and the final content is identical
either way.

### Commands needed

None new.

### Run it

Shown above, both the isolated lab and the real editor.

### Connecting sentence

Debounce fixed the burst-of-keystrokes problem by waiting for a pause —
but "wait for a pause" is a specific choice, not the only reasonable
one, and the next unit shows exactly where it stops being the right
one.

---

## Concept Unit: Throttle, and Why It's a Different Tool

### The Problem

Debounce assumes activity eventually *pauses*. Some real inputs don't:
imagine a live word-count display that should keep updating while
someone is typing continuously, for a long stretch, without ever really
stopping. Debounced, that display would never update at all until
typing genuinely stops — which might be much later than "never useful,"
for something meant to be watched *while* typing.

### Project Change

- **Reference Source** — No reference counterpart; from-scratch.
- **Files affected** — created `throttle_lab.js` (throwaway, this unit
  only).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none new.

### The New Code

```javascript
function throttle(fn, interval) {
  let lastCallTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastCallTime >= interval) {
      lastCallTime = now;
      fn(...args);
    }
  };
}
```

### The Updated Project

Brand-new throwaway file, shown whole above.

### Introduce the concept in isolation

First, proving debounce genuinely never fires during continuous,
never-pausing activity — not just "fires late," but truly never, for as
long as the activity continues:

```javascript
// simulating continuous "typing" every 30ms for 250ms, never pausing
```

Real output, using this lesson's own `debounce`, simulating input
firing every 30ms continuously for 250ms:

```
continuous typing for 250ms, debounce delay 100ms, never pausing:
debounce calls fired so far: 0
after typing actually stops and 150ms passes:
debounce calls fired: 1
```

Zero calls, for the entire 250ms of continuous activity — exactly the
gap this unit's Problem section described, now proven rather than
assumed. Now the same continuous simulation, through `throttle` instead:

```javascript
let calls = 0;
const throttledLog = throttle(() => {
  calls++;
}, 100);
// same 30ms-interval, 250ms-total simulation
```

Real output:

```
fired! total calls: 1 at 3562
fired! total calls: 2 at 3682
fired! total calls: 3 at 3803
done simulating, total calls over ~250ms of continuous input: 3
```

Three calls, roughly evenly spaced, *during* continuous activity that
never paused — proof that throttle guarantees regular execution at a
bounded rate, rather than waiting for silence the way debounce does.

### Discard the throwaway example

`throttle_lab.js`'s specific simulation is deleted; `throttle` itself
is kept, following the exact same pattern as `debounce.js`.

### Mechanical walkthrough

- `let lastCallTime = 0;` — **(b) hard concept reappearing**, closure-
  captured state, same shape as `debounce`'s `timeoutId`, here tracking
  *when* the function last actually ran instead of a pending timer.
- `const now = Date.now();` — **(a) first appearance.** Returns the
  current time, in milliseconds, as a plain number.
- `if (now - lastCallTime >= interval)` — **(a) first appearance** of
  the core throttle logic: only run `fn` if at least `interval`
  milliseconds have genuinely passed since the last time it actually
  ran — every call in between that check simply does nothing.
- `lastCallTime = now; fn(...args);` — **(b) hard concept reappearing**,
  the rest-parameter call-forwarding from `debounce`.

### CS lens

Throttling guarantees a **bounded rate** of execution — at most once
per `interval`, no matter how often the wrapped function is called —
rather than debounce's "wait for quiet." Also recognized in: an API
client capping outgoing requests to respect a server's rate limit, a
game loop capping physics updates to a fixed rate regardless of how fast
input events arrive, a scroll handler updating a "reading progress" bar
at a steady rate during continuous scrolling.

### SE lens

Debounce and throttle solve *different* problems, not the same problem
at different settings — this is worth being precise about, since they're
frequently confused. Debounce is right when only the *final* state
matters (a search box's actual query, this project's actual Markdown
content). Throttle is right when *ongoing* feedback matters during
continuous activity (a live word count, a progress indicator). Using
debounce for the word-count case, as this unit's own Problem section
showed, would mean it simply never updates during a long typing
session — not a performance issue, a correctness one, from picking the
wrong tool for what was actually being asked.

### Commands needed

None new.

### Run it

Both shown above.

### Connecting sentence

The Markdown preview keeps debounce, because only the final,
settled text matters for what gets parsed and shown — throttle is now
available, proven correct, and ready for the next feature that
genuinely needs ongoing updates during continuous activity instead.

---

## Closing

**Connect the pieces.** One typing session, through this entire lesson:
six rapid keystrokes each fire an `"input"` event; each one calls
`debouncedRender`, which cancels whatever timer the *previous*
keystroke had just scheduled and starts a fresh one; only the sixth
keystroke's timer ever survives long enough to fire, 100ms after typing
actually stopped; when it does, `render()` runs exactly once, calling
`parseMarkdown` — itself four ordered regex passes, most-specific
heading first — on the final, complete text, and writes the result into
`preview.innerHTML`. Six events, one real render, one correct result.

**What breaks without this.** Set the debounce delay to `0`:
`debounce(render, 0)`. Real behavior: it still collapses genuinely
synchronous, back-to-back calls (like this lesson's own rapid-fire
`type()` calls, which all happen before the event loop ever gets a
chance to run any pending timer) into one render — but the moment even
one real, human-scale gap exists between keystrokes (tens of
milliseconds, easily achieved by anyone typing at a normal pace), each
one fires its own render immediately, right back to the original
one-render-per-keystroke cost this lesson measured and fixed. A delay
of `0` isn't "no debouncing" exactly, but it's close enough to it in
practice that the fix stops doing its job — proof that the specific
delay value isn't a cosmetic detail, it's the entire mechanism.

**Exercises.**
1. Add italic support (`*text*`, single asterisks) to `parseMarkdown` —
   think carefully about ordering: does it need to run before or after
   the existing bold pattern, and why?
2. Change the debounce delay to `500` and, using real timers the way
   this lesson did, measure and describe in one sentence how the
   *feel* of the editor changes, even though the underlying code is
   identical.
3. Add a live word-count display, updated via `throttle` instead of
   `debounce` — justify in one sentence, referencing this lesson's own
   distinction, why throttle is the correct choice for this specific
   feature and debounce would be wrong.

**Definition of done.**
- [ ] `parseMarkdown` correctly handles `#`/`##`/`###` headings and
      `**bold**`, confirmed with real output matching what's shown
      above, including getting the heading ordering right.
- [ ] The live preview updates from real `"input"` events, and you've
      measured, with a real counter, that naive wiring means one render
      per keystroke.
- [ ] `debounce` is wired to the real render call, and you've confirmed,
      with real timers (not guessed), that six rapid keystrokes now
      produce exactly one render, with the correct final content.
- [ ] You've proven, not assumed, that debounce fires zero times during
      genuinely continuous activity, and that throttle fires at a
      regular, bounded rate during the exact same continuous activity.
- [ ] Commit with a message explaining why — e.g. `"Debounce the
      Markdown render so a burst of keystrokes produces one render
      instead of one per character, and prove throttle is the correct
      tool for continuous-feedback features instead"` — not `"add
      debounce"`.

**Next lesson** stays in Project 5: an **LRU cache** for parsed
Markdown, once re-parsing identical text repeatedly (undo, redo, retyping
something already seen) becomes worth avoiding entirely rather than just
delaying.
