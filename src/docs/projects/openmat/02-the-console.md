# OpenMAT — Lesson 02 — The Console

## What You Will Build

The empty panel from lesson 01 becomes a working console. You type text into
an input field, press Enter, and see it echoed back. The interpreter does not
exist yet — this lesson is about the *interface*: the input box, the output
area, and the mechanism that connects them.

```
┌─────────────────────────────┐  ┌──────────────────────────────────┐
│                             │  │  >> hello world                  │
│          /\                 │  │  hello world                     │
│         /  \                │  │                                  │
│        /    \               │  │  >> 3 + 4                        │
│       /______\              │  │  3 + 4                           │
│                             │  │                                  │
│                             │  │                                  │
│                             │  │──────────────────────────────────│
│                             │  │ >>  _                            │
└─────────────────────────────┘  └──────────────────────────────────┘
```

A scrollable output area at the top. An input row at the bottom. Each submitted
line appears as an echoed entry. In lesson 06, the echo is replaced by evaluation.

---

## What You Need to Know First

Lesson 01 complete. You have `index.html`, `src/style.css`, and `src/main.ts`.
The page shows a triangle on the canvas and an empty dark panel.

From lesson 01, briefly recalled where used here:
- **CSS custom properties** (`var()`, `:root`) — we add three new colour tokens
  to the existing `:root` block using the same pattern
- **`as HTMLInputElement` and `as HTMLDivElement`** — type assertions that tell
  TypeScript what concrete type `getElementById` returned; same mechanism as
  `as HTMLCanvasElement` in lesson 01
- **`!` non-null assertion** — used in lesson 01 to silence the "might be null"
  error; here we use a type assertion instead (same guarantee, richer type)

---

## Concept: DOM Events

The *Document Object Model* (DOM) is the browser's representation of the HTML
page as a tree of objects. Every element on the page — the canvas, the panel,
the input field — is a DOM node. JavaScript (and TypeScript) can read and
modify these nodes.

A *DOM event* is a signal that something happened to a node. Some events are
triggered by the user:

| Event | When it fires |
|-------|--------------|
| `keydown` | A key was pressed down |
| `keyup` | A key was released |
| `click` | A mouse button was clicked |
| `focus` | An element received focus |
| `input` | The value of an input changed |

Some events are triggered by the browser itself:

| Event | When it fires |
|-------|--------------|
| `load` | The page finished loading |
| `resize` | The window was resized |
| `scroll` | The page was scrolled |

You register interest in an event with `addEventListener`:

```typescript
element.addEventListener('keydown', function(event: KeyboardEvent): void {
  // this function runs every time the element receives a keydown event
});
```

The function you pass is the *event handler* (also called a listener). The
browser calls it when the event fires. You do not call it directly.

**`addEventListener` — first appearance:**

`element.addEventListener(eventName, handler)` accepts two arguments: a string
naming the event type (`'keydown'`, `'click'`, etc.) and a function to call
when that event fires. It returns nothing. It does not run the handler
immediately — it registers it. The browser stores the handler and calls it
later, each time the named event occurs on that element.

**Why `keydown` and not `keypress`:**

`keypress` is deprecated — browsers still support it, but it does not fire for
all keys (arrow keys, Escape, Delete do not trigger it). `keydown` fires for
every key press, including modifier keys. We then check `event.key` to filter
for the specific key we care about. `event.key === 'Enter'` is reliable across
all browsers and operating systems.

---

## Concept: The Event Loop

Understanding *why* `addEventListener` works the way it does requires a mental
model of how JavaScript executes code.

JavaScript is *single-threaded*: it can only run one piece of code at a time.
There is no parallel execution. Yet a web page responds to keyboard input,
runs animations, and handles network responses seemingly at once. How?

The answer is the *event loop* — JavaScript's mechanism for handling multiple
things without simultaneous execution:

```
┌─────────────────────┐
│     Call Stack      │  ← code runs here, one function at a time
│                     │
│ drawTriangle()      │
│ main.ts             │
└──────────┬──────────┘
           │ when stack becomes empty
           ↓
┌─────────────────────┐
│     Task Queue      │  ← events wait here while stack is busy
│                     │
│ keydown event       │
│ timer callback      │
└──────────┬──────────┘
           │ take next task
           ↓
┌─────────────────────┐
│     Call Stack      │  ← run the event handler
│                     │
│ keydown handler     │
└─────────────────────┘
```

The cycle:
1. JavaScript runs whatever is on the call stack
2. When the stack empties, the engine checks the task queue
3. If there is a waiting event, it moves the handler onto the call stack
4. The handler runs to completion, then the stack empties again
5. Repeat

**What this means for the console:**

When the user presses Enter, the browser does not interrupt your running code.
It adds the keydown event to the task queue. Your code finishes whatever it is
doing. The stack empties. The engine picks up the keydown event. The handler runs.

**Why polling would break everything:**

Consider the alternative — checking every millisecond whether Enter was pressed:

```typescript
// WRONG — never do this
while (true) {
  if (inputElement.value.endsWith('\n')) {
    processInput(inputElement.value);
  }
}
```

This `while (true)` loop never ends. The call stack never empties. The event
loop never gets to check the task queue. Events pile up and are never processed.
The page freezes instantly. Every interactive web application in existence uses
`addEventListener` instead of polling for exactly this reason.

**The real-world scope of this:**

The event loop is not just a browser concept. Node.js uses the same model for
handling incoming network requests. React's rendering is scheduled through the
event loop. Every JavaScript timer (`setTimeout`, `setInterval`) puts callbacks
in the task queue. If you understand the event loop, you understand why
JavaScript behaves the way it does in every environment you will encounter.

---

## Step 1 — Add the Console HTML

**The problem:** The console panel is empty. It needs an output area (where
results appear) and an input row (where the user types).

Open `index.html`. Replace the empty `<div class="console-panel" id="console-panel">` with:

```html
<div class="console-panel" id="console-panel">
  <div class="console-output" id="console-output"></div>
  <div class="console-input-row">
    <span class="console-prompt">&gt;&gt;</span>
    <input
      type="text"
      class="console-input"
      id="console-input"
      autocomplete="off"
      spellcheck="false"
      placeholder="type OpenMAT code"
    />
  </div>
</div>
```

**Why `autocomplete="off"` and `spellcheck="false"`:**

These are correct choices for a code input, not workarounds. Browser autocomplete
suggests words from previous entries — helpful for a name field, actively harmful
for a code REPL where you need to type exact identifiers. Spellcheck underlines
variable names in red. Both features are right for natural-language input and
wrong for code. Turning them off is specifying the correct behaviour for the
context.

**Why two nested divs inside the panel:**

The panel needs two children: the output area (which grows to fill available
space) and the input row (which is fixed at the bottom). A flex layout handles
this — the output area has `flex: 1` so it fills remaining space; the input row
is fixed height. We will add this CSS in step 2.

Save and reload. The panel now shows an input field at the bottom. The output
area above it is empty and invisible (no content, no border). That is correct.

---

## Step 2 — Style the Console

**The problem:** The input row needs to be pinned to the bottom of the panel.
The output area needs to grow to fill the rest of the panel and scroll when
content overflows.

Open `src/style.css`. First, add three missing colour tokens to `:root`:

```css
:root {
  /* add these three lines to the existing :root block */
  --colour-text:        #a9b1d6;
  --colour-text-input:  #e6f1ff;
  --colour-echo:        #7aa2f7;
}
```

These follow the same pattern as the tokens established in lesson 01: named
CSS custom properties in `:root` so that the colours are defined once and
referenced everywhere with `var()`. `--colour-echo` is the blue used when the
console echoes the user's input back.

Then add console layout rules at the bottom of the file:

```css
/* ── Console panel layout ───────────────────────────────────────────────── */

/* The panel is now a flex column: output takes remaining space, input stays bottom */
.console-panel {
  display: flex;
  flex-direction: column;
}

/* ── Output area ─────────────────────────────────────────────────────────── */

.console-output {
  flex: 1;              /* grows to fill whatever space the input row doesn't use */
  overflow-y: auto;     /* scrolls when content exceeds the height */
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: monospace;
  font-size: 13px;
}

.output-line {
  color: var(--colour-text);
  white-space: pre-wrap;  /* preserve spaces and line breaks; wrap long lines */
  line-height: 1.5;
}

.output-line.input-echo {
  color: var(--colour-echo);
}

/* ── Input row ────────────────────────────────────────────────────────────── */

.console-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--colour-border);
  flex-shrink: 0;  /* do not let the input row compress when output fills up */
}

.console-prompt {
  color: var(--colour-text);
  opacity: 0.5;
  font-size: 13px;
  user-select: none;   /* the >> prompt is decorative, not selectable text */
  font-family: monospace;
}

.console-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--colour-text-input);
  font-family: monospace;
  font-size: 13px;
}
```

**CS lens — `flex: 1` and `overflow-y: auto` working together.**

`flex: 1` tells the output area to take all available vertical space not claimed
by the input row. If the panel is 400px tall and the input row is 43px, the
output area gets 357px. `overflow-y: auto` tells the browser: if content in this
area exceeds 357px, show a scrollbar. Together they give the output area
exactly the space available and handle overflow gracefully. Without `flex: 1`,
the output area collapses to zero height (no visible content yet). Without
`overflow-y: auto`, content exceeds the panel and spills outside.

**Why `flex-shrink: 0` on the input row:**

Flex items shrink by default when the container is smaller than their total
content. Without `flex-shrink: 0`, the input row can shrink when many output
lines fill the panel. The input field becomes too small to type in. The input
row must maintain its fixed height regardless of how full the output area gets.

Save and reload. The panel now shows the styled input row pinned to the bottom.

---

## Concept: Component Boundaries

The console — collecting input and displaying output — is a self-contained
piece of behaviour. It does not need to know what the canvas is doing. The
canvas does not need to know how the console works internally.

In software engineering, this is *separation of concerns* (the same principle
used in lesson 01 to separate the canvas drawing from the HTML structure):
each module owns one thing and exposes a minimal interface to the rest of the
system. The console's interface is:

- **`initConsole(onSubmit)`** — wire up the input box; call `onSubmit` with
  the user's text when they press Enter
- **`printOutput(text)`** — add a line of output to the output area

`main.ts` calls these two functions. It does not touch the DOM elements inside
the console panel. It does not know whether the output area is a `<div>` or a
`<ul>`. When you redesign the console in lesson 12 (multi-line input for loops),
only `console.ts` changes — `main.ts` is untouched.

This is the *component boundary*. It is not an abstraction for its own sake.
It is a practical barrier that localises change: a modification to the console
affects the console file only.

---

## Step 3 — Create the Console Module

**The problem:** TypeScript code needs to wire up the input box and provide a
way to write to the output area. These DOM operations need to live in their own
module so `main.ts` stays clean.

Create `src/console.ts`:

```typescript
// console.ts owns all DOM interaction for the console panel.
// Nothing outside this file touches #console-output or #console-input.

const outputElement = document.getElementById('console-output') as HTMLDivElement;
const inputElement  = document.getElementById('console-input')  as HTMLInputElement;

function appendLine(text: string, kind: string = 'output'): void {
  const lineElement = document.createElement('div');
  lineElement.classList.add('output-line', kind);
  lineElement.textContent = text;
  outputElement.appendChild(lineElement);

  // Scroll to the newest line.
  // Without this, new lines appear below the visible area and the user has
  // to scroll down manually — the opposite of what a console should do.
  outputElement.scrollTop = outputElement.scrollHeight;
}

export function initConsole(onSubmit: (input: string) => void): void {
  inputElement.addEventListener('keydown', function(event: KeyboardEvent): void {
    if (event.key !== 'Enter') return;

    const userInput: string = inputElement.value.trim();
    if (!userInput) return;

    appendLine('>> ' + userInput, 'input-echo');
    inputElement.value = '';
    onSubmit(userInput);
  });
}

export function printOutput(text: string): void {
  appendLine(String(text));
}
```

**New file — `src/console.ts`:**

`src/console.ts` is the module responsible for all DOM interaction with the
console panel. It owns the output area and the input field completely. Nothing
outside this file queries `#console-output` or `#console-input`. The name
`console.ts` communicates this ownership directly. If you need to change how
the console looks or behaves — replace the `<div>` output with a `<canvas>`,
add multi-line input, throttle output for performance — you change this file
and only this file.

**Type assertions — `as HTMLDivElement` and `as HTMLInputElement`:**

`document.getElementById` always returns `HTMLElement | null`. We use the same
`as` type assertion pattern from lesson 01: `as HTMLDivElement` tells TypeScript
"trust me, this element is a div" and `as HTMLInputElement` says "this element
is an input". TypeScript then unlocks the `.value` property (specific to input
elements) for `inputElement`, and the `appendChild` / `scrollTop` / `scrollHeight`
properties for `outputElement`. Without the assertion, TypeScript would allow
only the properties common to all HTML elements.

**`document.createElement` — first appearance:**

`document.createElement('div')` creates a new `<div>` element in memory. It
is not yet attached to the page — it exists as a JavaScript object but has no
visible presence. It accepts a string tag name and returns an `HTMLElement` of
that type. `outputElement.appendChild(lineElement)` takes this in-memory element
and inserts it as the last child of `outputElement` — at that moment it becomes
visible in the page.

**`classList.add` — first appearance:**

`element.classList` is the list of CSS classes on an element. `.add('output-line', 'kind')` appends those class names to the list (it does not replace existing
classes). After `lineElement.classList.add('output-line', kind)`, the element
has both classes: `<div class="output-line output">` or
`<div class="output-line input-echo">` depending on the value of `kind`.

---

## Security: XSS and Why `textContent` Matters

This is the first lesson where user input enters the application. That means
it is also the first lesson where you need to think about security.

**The threat: Cross-Site Scripting (XSS)**

Imagine a user types this into the input field:

```
<img src=x onerror="alert(document.cookie)">
```

If the application displays this text using `innerHTML`, the browser parses
it as HTML. The `<img>` tag is created. The `src=x` fails to load (there is
no image at `x`). The browser fires the `onerror` handler: it executes
`alert(document.cookie)`. The user's session cookie — the token that proves
they are logged in — is exposed.

In a real application, `alert` would be replaced by code that sends the cookie
to a server the attacker controls. Anyone who visits the page and triggers the
stored input has their session stolen. This is Cross-Site Scripting: the attacker
injects script into a page that runs in the context of the victim's browser.

**How `appendLine` prevents it:**

Look at this line in `appendLine`:

```typescript
lineElement.textContent = text;
```

`textContent = userInput` is safe: the browser treats the entire string as
plain text, never parsing it as HTML. The `<img>` tag above becomes visible as
the literal characters `<img src=x onerror="...">` — readable as text in the
output area, not an image element, not an executed script.

`innerHTML = userInput` would be dangerous: the browser parses the string as
HTML and executes anything it finds. Setting `innerHTML` with user-controlled
data is one of the most common security bugs in web applications.

**The rule:** Never use `innerHTML` with any data that came from outside your
code — user input, network responses, URL parameters, anything external. Always
use `textContent` for plain text output. The choice between `textContent` and
`innerHTML` is a security decision, not a style preference.

---

## Walkthrough: `appendLine` and `initConsole`

**How `appendLine` executes:**

When `printOutput('hello')` is called, it calls `appendLine('hello')` with the
default `kind` of `'output'`.

`appendLine` creates a new `<div>` element in memory — it is not yet in the
page. It adds the CSS classes `output-line` and `output` to it. It sets
`textContent = 'hello'` — the security boundary discussed above. It calls
`outputElement.appendChild(lineElement)` — the div is inserted as the last
child of the output area and immediately becomes visible in the page.

Finally, `outputElement.scrollTop = outputElement.scrollHeight` sets the scroll
position. `scrollHeight` is the total pixel height of all content inside the
element, including any that overflows beyond the visible boundary. Setting
`scrollTop` to that value scrolls as far down as possible — the newest line
is always visible.

**How the event handler executes:**

When a user presses a key with the input focused, the browser creates a
`KeyboardEvent` and places it in the task queue. When the call stack empties,
the event loop picks it up and runs the `keydown` handler registered by
`initConsole`.

The handler checks `event.key === 'Enter'`. `event.key` is a string: `'a'`,
`'Enter'`, `'ArrowUp'`, etc. If it is anything other than `'Enter'`, the
`return` exits immediately — the handler does nothing for every key except Enter.

If the key is Enter, it reads `inputElement.value.trim()`. `inputElement.value`
is the raw string currently in the input field. `.trim()` is a built-in string
method that removes leading and trailing whitespace characters (spaces, tabs,
newlines). This gives `userInput`.

If `userInput` is empty after trimming, `return` exits without doing anything.
A user pressing Enter on a blank line produces nothing.

Otherwise: `appendLine('>> ' + userInput, 'input-echo')` adds the echoed line
in blue. `inputElement.value = ''` clears the input field. `onSubmit(userInput)`
calls the callback that `main.ts` passed in — passing the raw text before
trimming would strip intentional leading spaces from future multi-line input;
note it passes `userInput` (the trimmed value), which is correct for the REPL
case.

---

## Module Privacy: What `export` Means

`appendLine` is not exported. This means no code outside `console.ts` can call
it. Only `initConsole` and `printOutput` are exported.

**The ES module system's access control:**

When a file uses `export function`, that function becomes part of the file's
public API — other files can import it. Functions declared without `export` are
private to that file. No amount of importing can reach them.

This is the same principle as `private` in TypeScript classes — access control
applied at the file level rather than the class level. `appendLine` is an
implementation detail. It creates a `<div>` and appends it. That is a fact
about how this version of the console works. If the output area were redesigned
to use a `<canvas>` element drawn with the same APIs from lesson 01, `appendLine`
would be completely rewritten — and no caller outside `console.ts` would notice
or need to change, because no caller outside `console.ts` can call it.

**The public/private distinction as a design principle:**

The public surface of a module — everything it exports — is a promise to its
callers. Changing it requires updating every caller. The private surface can
change freely. Minimising the public surface minimises the cost of change.

`console.ts` exports two things: `initConsole` and `printOutput`. Everything
else — `outputElement`, `inputElement`, `appendLine` — is private. The
contract with the rest of the application is exactly those two functions.

**`export function initConsole(onSubmit: (input: string) => void): void`**

`onSubmit: (input: string) => void` is the first function type annotation in
this project. TypeScript types are not just for primitive values like `string`
or `number` — a function itself has a type, and this is how you write it.

The part before `=>` is the parameter list: `(input: string)` means this
function accepts one parameter, named `input`, of type `string`. The part after
`=>` is the return type: `void` means the function returns nothing. Read it
aloud: "a function that takes a string and returns nothing."

TypeScript will reject any call to `initConsole` that passes something other
than a function of exactly this shape. `initConsole(42)` is a compile error.
`initConsole(() => {})` works (a function taking no argument and returning
nothing also satisfies this — TypeScript function types are covariant in
parameters in this context). `initConsole(function(n: number) { return n; })`
is a compile error: the parameter type is wrong.

Function type annotations are compile-time contracts. They describe what the
rest of the system must provide. The type annotation is not documentation — it
is an enforcement mechanism.

**SE lens — why `onSubmit` is a callback parameter:**

`initConsole` does not know what to do with user input. Right now the caller
echoes it back. In lesson 06 the same `initConsole` call will pass a callback
that runs `tokenize → parse → evaluate`. In lesson 10, it will handle multi-line
blocks. Each time, the console module does not change — only the callback passed
by `main.ts` changes. The console is responsible for *collecting* input;
something else is responsible for *interpreting* it. Separating these lets each
evolve independently.

This pattern — passing behaviour in as a parameter rather than hardcoding it —
is called *dependency injection* at its simplest. The `initConsole` function
depends on an interpreter, but rather than importing one directly, it accepts
one as an argument. Whoever calls `initConsole` decides what the interpreter
does. This is the same pattern that makes React event handlers, Node.js callbacks,
and browser event listeners composable.

---

## Step 4 — Wire the Console into main.ts

**The problem:** `console.ts` exists but nothing calls it yet. `main.ts` needs
to initialise the console and specify what to do when the user submits input.

Open `src/main.ts`. Add an import at the top:

```typescript
import { initConsole, printOutput } from './console';
```

**What this import says:**

`console.ts` is the module responsible for all DOM interaction with the console
panel — it owns the output area and input field completely. `initConsole` is the
wiring function that connects the input box to a callback — calling it registers
the `keydown` listener and sets up everything the console needs to work.
`printOutput` is the only way the rest of the application may add output to the
console — it is the public API. The rest of `console.ts` is private to that file.

`'./console'` is a relative path: `./` means "the same directory as this file."
TypeScript resolves `./console` to `./console.ts`. The `.ts` extension is omitted
in import paths — the TypeScript compiler (and Vite) adds it automatically.

Add this at the bottom, after `drawTriangle()`:

```typescript
// ── Console ───────────────────────────────────────────────────────────────
// The callback is a placeholder — it echoes input as output.
// In lesson 06 this becomes: evaluate(parse(tokenize(userInput))).

initConsole(function(userInput: string): void {
  printOutput(userInput);
});
```

### SAVE AND TRY

Click the input field. Type `hello`. Press Enter.

You should see:
```
>> hello
hello
```

Type several more lines. Each appears below the previous. Type a long line —
it wraps at the panel boundary rather than overflowing. Scroll behaviour kicks
in once you have enough lines.

**Try pressing Enter on an empty input.** Nothing happens — `if (!userInput) return`
filters blank submissions. A console that echoes blank lines every time the user
accidentally hits Enter is irritating.

**Try typing the XSS payload from the security section:**
```
<img src=x onerror="alert(document.cookie)">
```

You will see the literal text appear in the output area. No image. No alert.
No script runs. `textContent` is doing its job.

---

## Connect the Pieces

```
index.html      structure — console elements now exist
src/style.css   appearance — console layout and colours added
src/main.ts     coordination — calls initConsole, passes a callback
src/console.ts  console behaviour — DOM interaction isolated here
```

The callback passed to `initConsole` is the seam where the interpreter connects
to the UI. Right now it is one line. In lesson 06 it becomes:

```typescript
initConsole(function(userInput: string): void {
  const tokens = tokenize(userInput);
  const tree   = parse(tokens);
  const result = evaluate(tree);
  printOutput(String(result));
});
```

The console does not change. Only `main.ts`'s callback changes. The component
boundary established here holds for the rest of the project.

The event loop model also holds. Every interactive feature added after this
lesson — keyboard shortcuts, canvas interactions, future animation — uses
`addEventListener` for the same reason: the call stack must be free for the
event loop to deliver events.

---

## What Breaks Without This

**Without `outputElement.scrollTop = outputElement.scrollHeight`:**

Type enough lines to fill the output area. New lines appear but are not visible —
they appear below the panel boundary. The user has to scroll down manually to see
the result of each submission. In a REPL, the most recent output is the most
important; it must always be visible without manual intervention. Remove this
line and experience why it cannot be omitted.

**With `console.ts` merged into `main.ts`:**

Move all of `console.ts` into `main.ts`. The file still works. Then, in lesson
10, you need to add multi-line input accumulation: the console must collect
several lines before submitting them as a block. With everything in `main.ts`,
this change touches the same file as the canvas drawing and the evaluator wiring.
A bug in the multi-line logic could accidentally break the canvas. The module
boundary prevents that. Separation of concerns is not about aesthetics — it is
about limiting the blast radius of a change.

**With `innerHTML` instead of `textContent`:**

Replace `lineElement.textContent = text` with `lineElement.innerHTML = text`.
Type `<img src=x onerror="alert(1)">` into the input and press Enter. The browser
parses the string as HTML, creates the image element, fails to load `src=x`, and
executes the `onerror` handler. The alert fires. In a deployed application, that
handler would be sending your session token to an attacker's server. One character
change — `textContent` to `innerHTML` — is the difference between safe and
exploitable.

---

## Definition of Done

- [ ] Typing text and pressing Enter shows the echoed input in blue and the output below it
- [ ] Pressing Enter on an empty input does nothing
- [ ] New lines auto-scroll the output area — the newest line is always visible
- [ ] Long lines wrap rather than overflow
- [ ] `src/console.ts` is a separate file; `main.ts` contains no DOM queries for console elements
- [ ] You can explain what the event loop is and why polling with `while(true)` freezes the page
- [ ] You can explain what a DOM event is and name three events other than `keydown`
- [ ] You can explain why `onSubmit` is passed as a parameter instead of called directly
- [ ] You can explain what `flex: 1` does on the output area
- [ ] You can explain why `textContent` is used instead of `innerHTML`, and what would happen if it were changed
- [ ] You can explain what `export` does and why `appendLine` is not exported
- [ ] You can read `onSubmit: (input: string) => void` aloud and explain what each part means
- [ ] `git add src/console.ts src/style.css index.html src/main.ts` then `git commit -m "Add working console: input echoes to output area, event loop wired up, security boundary established with textContent"`

---

*Next: Lesson 03 — Type Safety. We add the TypeScript build toolchain, enable
`strict` mode, and show the first compile-time error catching a bug that
JavaScript would silently ignore. Enums as contracts: a closed set of valid
values enforced before the code ever runs.*
