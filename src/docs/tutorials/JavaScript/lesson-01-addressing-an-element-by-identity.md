# Lesson 1: Addressing a Live Element by Identity

- **What you will build.** A button that, on click, reveals a hidden
  message on the page. The working feature is small on purpose. The
  transferable problem underneath it: JavaScript running in a browser
  is not editing an HTML file — it is reaching into a live, in-memory
  tree the browser has already built, finding one specific node in
  that tree by a pattern, and reacting to something the *user* does,
  rather than running top-to-bottom and finishing.

- **What you need to know first.** Nothing — this is Lesson 1.

- **Terms used in this lesson**

  - **DOM (Document Object Model)** — the browser's live, in-memory
    tree representation of the page. It exists because a browser can't
    treat HTML as a static block of text once the page is loaded — the
    page has to be inspectable and mutable while it's running (a user
    clicks something, a script wants to change what's on screen), so
    the browser parses the HTML once into a tree of objects and lets
    JavaScript read and change that tree directly. Changing the tree is
    what makes the browser re-render what you see; JavaScript never
    edits the original HTML file at all.
  - **CSS selector** — a pattern, written as a short string (`#id`,
    `.class`, `tagname`), that describes which element or elements in
    the DOM tree to match. It exists because a page can contain
    thousands of nodes, and JavaScript needs a compact, standard way to
    say "that one" or "all of these" without walking the tree by hand.
    It's the same syntax already used in stylesheets, reused here so
    there's only one pattern language to learn for "which element(s) do
    I mean."
  - **`const`** — a variable declaration keyword meaning "this name
    will be bound to a value, and that binding will not be reassigned
    later in this scope." It exists so that a reader (or the JS engine
    itself) can tell, just from the declaration, that a name is never
    going to point somewhere else — which makes code easier to reason
    about than a language where every variable might be reassigned
    anywhere.
  - **Event** — a signal the browser generates and dispatches when
    something happens: a click, a keypress, the page finishing loading.
    It exists because JavaScript reacting to user interaction *can't*
    be written as "check repeatedly whether the user has clicked yet" —
    that would mean constantly running code for no reason, burning
    battery and CPU, and it would still be slow to notice the click.
    Events let the browser tell your code the instant something
    happens, instead of your code having to ask over and over.
  - **Callback function** — a function you write and hand over *as a
    value*, without calling it yourself, so that something else (here,
    the browser) can call it later, at the moment it's actually needed.
    It exists because "run this code when X happens" requires giving
    the browser something it can invoke on your behalf — you can't
    write `if (user clicked) { ... }` as literal JS syntax, so instead
    you hand over a function and the browser calls it for you when the
    click actually occurs.
  - **CSS class** — a label (or several, space-separated) that can be
    attached to an HTML element via its `class` attribute, normally
    used so a stylesheet can target it. It exists as a *grouping*
    mechanism distinct from `id`: many elements can share the same
    class, while an `id` is meant to be unique to one element. This
    lesson uses a class not for styling directly in the CSS sense, but
    as an on/off flag JavaScript can add or remove to represent state
    ("hidden" vs. not).

- **Objects and methods used**

  - **`document`**
    - *What it is:* the single, global object every page gets,
      representing the whole loaded page.
    - *Implementation:* provided automatically by the browser to every
      script running on a page; there's exactly one per page, and you
      never construct it yourself.
    - *Its use:* it's the entry point — the object you start from any
      time you need to reach into the DOM tree at all.
    - *Type:* a global, browser-provided object (an instance of the
      `Document` interface).
    - *Responsibility:* represents the entire loaded page and acts as
      the root access point for every DOM-reading and DOM-writing
      operation a script performs — every element lookup this lesson
      does starts by calling a method *on* this object.
    - *Depends on:* nothing from your code — it's created by the
      browser before any of your script runs, from the HTML it parsed.
    - *Connects to:* your script calls methods on it (like
      `querySelector`, below); it in turn is backed by the actual DOM
      tree the browser built from the page's HTML, which is what those
      method calls actually search.
    - *Shape:* a public, global API surface — the outermost boundary
      between your script and the browser's internal page
      representation.

  - **`document.querySelector(selector)`**
    - *What it is:* a method that searches the entire DOM tree for the
      *first* element matching a given CSS selector.
    - *Implementation:* takes one argument, a string containing a CSS
      selector (like `'#toggleBtn'`), and returns either the first
      matching `Element` found, or `null` if nothing matches. It always
      returns at most one element, even if the selector could match
      several.
    - *Its use:* this lesson's project needs to grab two specific,
      already-existing elements — a button and a message — by their
      unique IDs, so it can register behavior on the button and change
      the message later.
    - *Type:* an instance method, called on the `document` object.
    - *Responsibility:* search the live DOM tree once, using the given
      selector pattern, and hand back a real reference to the first
      matching element (or `null`) — nothing more; it doesn't create
      elements, doesn't watch for future matches, and doesn't run
      again automatically if the page changes later.
    - *Depends on:* a valid CSS selector string, and a DOM tree that
      has already been built (calling this before the relevant HTML
      has loaded would find nothing).
    - *Connects to:* called on `document`; the string you pass it
      comes from your own HTML's `id`/`class` attributes; the `Element`
      it returns is what later code (like `addEventListener`, below)
      gets called on.
    - *Shape:* a public read API — a query into the DOM tree, not a
      mutation of it.

  - **`element.addEventListener(type, callback)`**
    - *What it is:* a method, available on any DOM element, that
      registers a function to be called whenever a specific kind of
      event happens on that element.
    - *Implementation:* takes two arguments here — a string naming the
      event type (`'click'`), and a function to call when that event
      fires. It doesn't return anything meaningful (`undefined`); its
      whole effect is registering the callback for later.
    - *Its use:* this is *the* mechanism for "do something when the
      user interacts with this button" — there's no other way in
      standard JS to react to a click.
    - *Type:* an instance method, called on an `Element` (here, the
      button returned by `querySelector`).
    - *Responsibility:* maintain, internally, a list of callback
      functions registered for a given event type on this specific
      element, and invoke each one, in the order registered, every time
      that event actually fires on this element — for as long as the
      page (or this specific listener) exists.
    - *Depends on:* an element to call it on, a valid event-type string,
      and a callback function to invoke.
    - *Connects to:* called on the `Element` `querySelector` handed
      back; the callback you pass it is *your* code, which the browser
      — not you — decides when to actually run, based on real user
      clicks.
    - *Shape:* a callback boundary — the seam between your application
      code and the browser's own event-dispatch system. You hand code
      over; you don't control exactly when it runs.

  - **`element.classList`**
    - *What it is:* a live property on every DOM element that gives
      you an object representing that element's current set of CSS
      classes.
    - *Implementation:* not a plain array — it's a `DOMTokenList`, a
      compound object whose members include `.toggle(name)`,
      `.add(name)`, `.remove(name)`, and `.contains(name)`, each
      operating on the underlying space-separated `class` attribute.
      This lesson only calls `.toggle()`, shown below, but the object
      it's called on genuinely holds more than that one method.
    - *Its use:* it's the standard way to add/remove/check a single CSS
      class without manually splitting and rejoining the whole
      `class="..."` attribute string yourself.
    - *Type:* an instance property (returns a live `DOMTokenList`
      object) on any `Element`.
    - *Responsibility:* keep an always-current view of exactly which
      classes are on this element right now, and expose methods to
      change that set safely — without a caller ever touching the raw
      `class` attribute string directly.
    - *Depends on:* the element it belongs to; nothing else — no
      arguments to access it, since it's a property, not a method call.
    - *Connects to:* accessed off the `Element` `querySelector`
      returned; `.toggle()` (below) is called on the object it returns.
    - *Shape:* a public API surface — a structured view over what would
      otherwise be raw attribute-string manipulation.

  ```
  // DOMTokenList's real declared shape (the members this lesson touches)
  interface DOMTokenList {
    toggle(token: string, force?: boolean): boolean;
    contains(token: string): boolean;
    add(...tokens: string[]): void;
    remove(...tokens: string[]): void;
  }
  ```

  - **`classList.toggle(className)`**
    - *What it is:* a method on `DOMTokenList` that flips a single
      class on or off.
    - *Implementation:* if `className` is currently present in the
      list, it removes it and returns `false`; if it's absent, it adds
      it and returns `true`. This lesson doesn't use the return value,
      but it's real and documented — every call reports which state the
      class ended up in.
    - *Its use:* this is the actual mechanism behind "toggle" in this
      lesson's feature — one call, no manual if/else needed to check
      current state first.
    - *Type:* an instance method on the object `element.classList`
      returns.
    - *Responsibility:* answerable for exactly one class name's
      presence/absence on this element's `class` attribute, each time
      it's called — add if missing, remove if present, and report which
      one happened.
    - *Depends on:* a class-name string, and an underlying `classList`
      to operate on.
    - *Connects to:* called on `element.classList`; its effect (adding
      or removing a class) is what the page's CSS then reads to decide
      whether the element is visually hidden.
    - *Shape:* a mutation API — this is where the DOM tree actually
      changes as a result of user interaction.

---

## Concept Unit: Selecting a Single Element with `document.querySelector`

### The Problem

Before any code can react to a click, or change what a message says, it
first needs an actual reference to *that specific button* and *that
specific message* out of everything on the page. HTML describes what
elements exist; it says nothing about how a running script gets its
hands on one of them.

> **Before reading on:** if you had to describe, in plain English, how
> you'd tell a program "the element with `id="toggleBtn"`, out of
> everything on this page" — what would that description need to
> contain? What does the browser already have, sitting in memory, that
> a lookup like this could search through, rather than starting from
> the raw HTML text every time?

### Introduce the Concept in Isolation

Throwaway HTML, throwaway script — a single `<div id="box">hello</div>`
and nothing else:

```js
const found = document.querySelector('#box');
console.log(found.tagName);
console.log(found.textContent);
```

Real run, via a headless DOM (Node + jsdom, since this lab isn't
running inside an actual browser tab):

```
found: true
found.tagName: DIV
found.textContent: "hello"
```

This proves two things: `document.querySelector` genuinely found the
element (`found` isn't `null`), and what it found is a real object with
real properties (`tagName`, `textContent`) reflecting the actual HTML —
not a string, not a copy, an object connected to the live page. This
mechanism — searching by a CSS-selector-shaped string and getting back
a real, connected object — is called **element selection**, and
`document.querySelector` is the specific method that performs it.

### Discard the Throwaway Example

This `<div id="box">` and its lookup are not part of the real project.
They existed only to prove `querySelector` finds a real element and
hands back a usable reference to it.

### Project Change

- **Reference Source:** No reference counterpart — this is a
  from-scratch addition; there's no existing implementation this
  project is being ported from.
- **Files affected:** `index.html` (new file), `script.js` (new file).
- **Change type:** add.
- **Location:** brand-new files — nothing to locate a position within
  yet.
- **Dependencies:** none — this runs in any browser with no setup.

### The New Code

```js
const button = document.querySelector('#toggleBtn');
const message = document.querySelector('#message');
```

### The Updated Project

Both files are brand new, so there's no larger enclosing structure to
return to yet — this *is* the whole new structure so far. Here's the
full state of both files after this unit:

`index.html`:
```html
 1  <!DOCTYPE html>
 2  <html>
 3  <body>
 4    <button id="toggleBtn">Show message</button>
 5    <p id="message" class="hidden">Hello, this was hidden.</p>
 6    <script src="script.js"></script>
 7  </body>
 8  </html>
```

`script.js`:
```js
 1  const button = document.querySelector('#toggleBtn');   // ← new
 2  const message = document.querySelector('#message');    // ← new
```

Right now `script.js` does nothing visible yet — it just grabs two
references and holds onto them. Nothing on the page reacts to anything
yet; that starts in the next unit.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`const`** — declares a new variable binding, `button`, that this
  scope will never reassign. Explained in full above (Terms); reused
  here as the declaration form for a DOM reference specifically —
  useful because the *element itself* can still be mutated (its
  classes, its content) even though the variable `button` will always
  point at that same element.
- **`button`** — the variable name being declared; chosen to describe
  what it holds (the clickable button element), not how it's obtained.
- **`=`** — the assignment operator; binds the value on the right to
  the name on the left. Read left to right this reads as "let `button`
  refer to whatever `document.querySelector('#toggleBtn')` returns."
- **`document`** — the global page object, explained in full in the
  Header above; the object this lookup is performed against.
- **`.`** — property/method access; reaches into `document` to find
  something it owns, here a method.
- **`querySelector`** — the method itself, explained in full in the
  Header above; the operation that actually performs the search.
- **`(`...`)`** — the call syntax, invoking `querySelector` with one
  argument.
- **`'#toggleBtn'`** — a string literal containing a CSS selector. The
  leading `#` is CSS selector syntax meaning "match by `id`" — it says
  "find the element whose `id` attribute is exactly `toggleBtn`," not
  "find something named toggleBtn" in any more general sense. This is
  the same `#id` syntax a stylesheet would use to target the same
  element.
- **`;`** — statement terminator, ending the declaration.
- The second line repeats every one of the above with `message` and
  `'#message'` in place of `button` and `'#toggleBtn'` — same
  mechanism, different target, so no new syntax appears, but the
  targets differ: this time the CSS selector `#message` matches the
  `<p>` element by its own `id`, not the button.

### CS Lens

**Element selection over a tree structure** is a specific case of a
much older, general idea: querying a tree for nodes matching a
predicate, rather than manually walking parent-to-child links yourself.

Also recognized in: file-system path lookups (`/home/user/file.txt`
walks a tree the same way an `id` selector walks the DOM), XPath
queries over XML documents, CSS itself matching selectors to elements
for styling, database index lookups (finding one row by a key instead
of scanning every row), and the `find()`-style tree-search functions
built into most GUI frameworks.

### SE Lens

The alternative *not* chosen here is manually walking the tree — e.g.,
`document.body.children[0]` — reaching an element by its *position* in
the structure instead of by a stable identifier. That approach is
extremely fragile: insert one new element above it in the HTML, and
every positional reference silently points at the wrong thing, with no
error at all. Selecting by `id` instead means the lookup keeps working
regardless of where the element physically sits in the page, as long
as its `id` doesn't change. The real cost this project is taking on:
every element this script wants to reach now needs a unique `id` in the
HTML — a small amount of upfront naming discipline, in exchange for
lookups that don't silently break when the page's structure shifts
around them later.

### Commands Needed

None yet — this is plain HTML and JS, openable directly in a browser
with no build step or server required.

### Run It

Real output, from a headless DOM run (Node + jsdom) proving the exact
same lookup mechanism against elements matching this project's actual
IDs:

```
button found: true | tagName: BUTTON
message found: true | tagName: P
message initial className: "hidden"
```

This confirms both `querySelector` calls succeed and return the
correct element types, and that `message` starts out already carrying
the `hidden` class from the HTML — which the next units will act on.

### Connection

This unit gets the two element references the rest of the lesson needs
— nothing reacts to anything yet, but without a real reference to
`button`, there's nothing to attach a click reaction to next.

---

## Concept Unit: The Arrow Function as a Value to Pass Around

### The Problem

The next unit needs to hand the browser a piece of code to run *later*,
at click time — not run it immediately. Regular function calls in JS
run the instant they're written. Something different is needed: a way
to write a function and pass it *as a value*, without calling it.

> **Before reading on:** if you already know how to declare a named
> function in JS (`function greet() { ... }`), could you pass `greet`
> itself — not the result of calling it — as an argument to another
> function? What would you write to pass "the function" instead of
> "the function's result"? What does it mean, concretely, for a
> function to be a value at all?

### Introduce the Concept in Isolation

Throwaway code, no DOM involved at all — plain JS:

```js
const shout = (word) => word.toUpperCase() + '!';
console.log(shout('hi'));
```

Real run (Node):

```
shout("hi") = HI!
```

`shout` is a variable whose value happens to be a function. The
`(word) => word.toUpperCase() + '!'` syntax is called an **arrow
function** — a way to write a function as an expression (a value) that
can be assigned to a variable, passed as an argument, or stored in a
data structure, rather than only ever declared standalone with the
`function` keyword. This run proves it behaves like any other function
once called: `shout('hi')` runs the body with `word` bound to `'hi'`
and produces `'HI!'`.

### Discard the Throwaway Example

`shout` and this uppercase-and-exclaim behavior aren't part of the
toggle-message project. This existed only to prove arrow functions are
real, callable values.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after the two `const` declarations from the previous
  unit.
- **Dependencies:** the `button` variable from the previous unit (an
  arrow function alone, with nothing to hand it to yet, wouldn't do
  anything visible — the next unit is what actually uses it).

### The New Code

```js
() => {
  message.classList.toggle('hidden');
}
```

This fragment alone can't run standalone yet — an arrow function
written like this, on its own, just describes a piece of behavior; it
needs to be *handed to something* that will call it, which is exactly
what the next unit does.

### The Updated Project

This fragment isn't its own statement yet — it only makes sense as an
argument to something else, which the next unit provides. There's
nothing to show it sitting inside on its own; showing it here in
isolation, without what it's being passed to, would misrepresent it as
a complete statement when it isn't one. It connects into real code in
the very next unit.

### Mechanical Walkthrough

- **`(`...`)`** before the arrow — the arrow function's parameter list.
  It's empty here: this function takes no arguments, because nothing
  about *which* click happened matters to what it does — it always does
  the same thing regardless.
- **`=>`** — the arrow itself; the syntax that marks this as an arrow
  function rather than a value like a number or string. Read as "goes
  to" or "maps to": empty parameters *goes to* the block that follows.
- **`{`...`}`** — a block body, containing one or more statements to
  run when the function is called. (An arrow function with a single
  expression and no braces can skip both the braces and an explicit
  `return`, as `shout` did above — this one uses braces because it
  contains a statement, `message.classList.toggle('hidden')`, which
  needs to be treated as a statement to run, not a value to return.)
- **`message.classList.toggle('hidden')`** — the one statement inside;
  every piece of this (`message`, `.classList`, `.toggle`, `'hidden'`)
  gets its own full explanation in the next Concept Unit, where it's
  actually shown running for real — introducing it here as a
  placeholder for "some behavior" and re-explaining it there would
  split one explanation across two places for no benefit; instead this
  walkthrough focuses only on the arrow function syntax wrapping it.

### CS Lens

An arrow function here is a concrete instance of a **first-class
function** — a function treated as a regular value: assignable,
passable as an argument, storable in a data structure, same as a
number or a string.

Also recognized in: sorting a list with a custom comparison function
passed in, a GUI button's `onClick` prop in almost every UI framework,
Python's `lambda`, `map`/`filter`/`reduce` in every language that has
them, and Unix shell pipelines where each stage is itself a callable
program being handed to the next.

### SE Lens

The alternative not chosen here is a named, standalone function
declared elsewhere (`function revealMessage() { ... }`) and referenced
by name. That's a completely valid choice too, and for something reused
in several places, or complex enough to want a descriptive name, it's
often the better one — a named function shows up with a real name in
stack traces during debugging, while an anonymous arrow function often
shows up as `(anonymous)`. The tradeoff this project is accepting: for
a short, single-use, one-line reaction like this one, writing it inline
as an arrow function avoids inventing and maintaining a name for
something used in exactly one place — at the real cost of slightly
harder-to-read stack traces if this specific callback ever throws an
error and needs debugging.

### Commands Needed

None — still plain JS, no build step.

### Run It

Already shown above: `shout("hi") = HI!`, proving arrow functions
evaluate and can be called like any other function. The actual toggle
behavior inside *this* project's arrow function can't run standalone
yet — it references `message`, which exists, but nothing calls this
function until the next unit registers it as a click handler.

### Connection

This unit produces the piece of behavior — "toggle the hidden class" —
as a value; the next unit is what actually tells the browser when to
run it.

---

## Concept Unit: Registering a Click Handler with `addEventListener`

### The Problem

There's now a button reference and a piece of behavior written as an
arrow function — but nothing connects them. Nothing on the page
currently reacts to a click at all.

> **Before reading on:** given that `button` is a real reference to the
> `<button>` element, and this lesson already introduced the idea of an
> "event" the browser dispatches — what do you think the *name* of the
> method that says "run this function when a click event happens on
> this element" might look like, based on what it needs to do? What two
> pieces of information does it need from you to do its job — what kind
> of event, and what to do about it?

### Introduce the Concept in Isolation

Throwaway HTML — a single `<button id="b">go</button>` — and this
script:

```js
console.log('step 1: calling addEventListener...');
btn.addEventListener('click', () => {
  console.log('step 3: the callback is running now, because the click event fired');
});
console.log('step 2: addEventListener call has returned, nothing has printed from the callback yet');

btn.dispatchEvent(new Event('click'));
console.log('step 4: dispatchEvent has returned, callback already ran above');
```

Real run (Node + jsdom, `dispatchEvent` used here to simulate a real
click the same way a user's actual click would be dispatched by the
browser):

```
step 1: calling addEventListener...
step 2: addEventListener call has returned, nothing has printed from the callback yet
step 3: the callback is running now, because the click event fired
step 4: dispatchEvent has returned, callback already ran above
```

This is a **control-flow / timing trace**, not a changing-value trace —
the interesting thing here isn't a value changing, it's *when* each
line runs relative to the others:

1. `btn.addEventListener('click', () => {...})` — registers the
   callback and returns immediately. Nothing inside the arrow function
   has run yet; registering a listener is not the same as calling it.
2. `console.log('step 2: ...')` — prints *before* the callback's own
   `console.log`, proving step 1 really didn't invoke anything on the
   spot — it only stored the function for later.
3. `btn.dispatchEvent(new Event('click'))` — only at this exact line
   does the browser's event system decide to actually call the
   registered callback, which is why "step 3" prints here and not
   earlier.
4. `console.log('step 4: ...')` — runs after, confirming the callback
   had already finished by the time control returned to this line.

This proves `addEventListener` doesn't run your code — it *stores* your
code and waits. This mechanism is called **event registration**, and
the specific method that performs it is `addEventListener`.

### Discard the Throwaway Example

This `<button id="b">` and its numbered `console.log` steps aren't
part of the toggle-message project — they existed only to prove
registering a listener and firing it are two separate moments in time.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `script.js` (modified).
- **Change type:** add.
- **Location:** after the arrow function fragment introduced in the
  previous unit — that fragment becomes the second argument here.
- **Dependencies:** the `button` variable and the arrow function body,
  both from the previous two units.

### The New Code

```js
button.addEventListener('click', () => {
  message.classList.toggle('hidden');
});
```

### The Updated Project

`script.js` now reads, in full:

```js
 1  const button = document.querySelector('#toggleBtn');
 2  const message = document.querySelector('#message');
 3
 4  button.addEventListener('click', () => {         // ← new
 5    message.classList.toggle('hidden');             // ← new
 6  });                                                // ← new
```

The file now does something real end to end: lines 1–2 get real
references to the button and message; lines 4–6 tell the browser
"whenever this specific button is clicked, run this specific piece of
code" — and that piece of code, per the next unit, flips whether the
message is hidden.

### Mechanical Walkthrough

- **`button`** — the variable from Concept Unit 1, holding the real
  `<button>` element reference; reused here as the object the method
  call below is performed on.
- **`.`** — property/method access on `button`.
- **`addEventListener`** — the method itself, explained in full in the
  Header above; the call that registers a callback for a given event
  type on this specific element.
- **`(`...`)`** — the call syntax, invoking `addEventListener` with two
  arguments.
- **`'click'`** — a string literal naming which event type to listen
  for. This exact string is defined by the browser's event system, not
  something this project invented — `'click'` specifically fires when a
  pointer press-and-release happens on the element (or a few
  equivalent interactions, like pressing Enter on a focused button).
  Other strings (`'keydown'`, `'submit'`, `'mouseover'`) name other
  event types the same mechanism can listen for; this project only
  needs `'click'`.
- **`,`** — separates the two arguments to `addEventListener`.
- **`() => { message.classList.toggle('hidden'); }`** — the arrow
  function from the previous unit, now actually being *used* as the
  second argument rather than sitting disconnected. This is the exact
  same syntax explained fully there; what's new here is only that it's
  now plugged into a real call site instead of floating alone.
- **`;`** — ends the `addEventListener(...)` statement.

### CS Lens

This is the **Observer pattern**: one party (the browser's event
system) maintains a registry of interested listeners for a given kind
of occurrence, and notifies each registered listener when that
occurrence happens, without the thing generating the occurrence needing
to know anything about what the listeners actually do.

Also recognized in: GUI frameworks generally (every framework with an
`onClick`/`onChange`-style prop or handler), pub/sub messaging systems,
a spreadsheet recalculating dependent cells when one cell changes,
stock-ticker "watch this price" alerts, and a filesystem watcher
notifying a build tool when a source file changes on disk.

### SE Lens

The alternative not chosen — and the one this whole unit exists to
rule out — is **polling**: repeatedly checking, on some timer, "has the
button been clicked since I last checked?" That would need its own
tracking variable, a running interval, and would still introduce lag
between the actual click and the check noticing it, while burning CPU
the entire time nothing is happening. Event registration instead lets
the browser notify your code exactly once, exactly when the real event
occurs, with zero polling overhead. The cost this project accepts in
exchange: you don't control *when* your callback runs — only the
browser's event system decides that — which is exactly what Lab C's
timing trace, above, was built to make concrete instead of asserted.

### Commands Needed

None — still plain JS, no build step.

### Run It

Real output, from a headless DOM run against this project's own actual
button and message elements, showing the listener firing correctly on
a simulated click and doing nothing before it:

```
message.classList.contains("hidden"): true      (before any click)
message.classList.contains("hidden"): false     (after first click)
```

### Connection

This unit is what actually wires the button to the behavior — clicking
now does something, for the first time in this project.

---

## Concept Unit: Toggling a CSS Class with `classList.toggle`

### The Problem

The click handler is wired up and running on click — but what does it
actually do, mechanically, to make a hidden message become visible?

> **Before reading on:** the message element starts with
> `class="hidden"` in the HTML, and this project's CSS (not shown yet)
> hides anything with that class. If you needed to write code that
> "removes the `hidden` class if it's there, or adds it back if it's
> not" — using only what this lesson has already covered (variables,
> method calls) — what would you need to check first, before deciding
> whether to add or remove?

### Introduce the Concept in Isolation

Throwaway HTML — `<div id="d" class="a b"></div>` — and this script:

```js
console.log('before:', el.className);
const result1 = el.classList.toggle('b');
console.log('after toggle #1:', el.className, '| returned:', result1);
const result2 = el.classList.toggle('b');
console.log('after toggle #2:', el.className, '| returned:', result2);
```

Real run (Node + jsdom):

```
before: "a b"
after toggle #1, className: "a" | toggle() returned: false
after toggle #2, className: "a b" | toggle() returned: true
```

This proves `classList.toggle('b')` genuinely inspects current state
before acting: the first call sees `'b'` is present, removes it (down
to just `"a"`), and reports `false` (meaning "it's now absent"); the
second call sees `'b'` is *now* absent, adds it back, and reports
`true` (meaning "it's now present"). This is called **toggling** — no
separate if/else needed in your own code to check current state first,
because `toggle()` already does that check internally.

### Discard the Throwaway Example

This `<div id="d" class="a b">` isn't part of the toggle-message
project. It existed only to prove `toggle()` inspects current state and
flips it, rather than blindly adding or blindly removing.

### Project Change

- **Reference Source:** No reference counterpart — from-scratch
  addition.
- **Files affected:** `script.js` (already contains this code, added
  as part of the previous unit's New Code — this unit explains the one
  statement inside that arrow function's body that the previous unit's
  walkthrough deliberately deferred); `index.html` (add a
  `<style>` block so the `hidden` class actually does something
  visible); `style.css` is not used — the style block is added inline
  to keep this unit's file count small.
- **Change type:** add (the `<style>` block); the JS line itself
  already exists from the previous unit.
- **Location:** inside `index.html`'s `<head>` — this project doesn't
  have a `<head>` yet, so one is added.
- **Dependencies:** the `message` variable and the `hidden` class
  already present in the HTML from Concept Unit 1.

### The New Code

```html
<style>
  .hidden { display: none; }
</style>
```

(The JS statement this unit is actually *about* —
`message.classList.toggle('hidden')` — was already typed in the
previous unit, as the body of the click handler. This unit adds the
one piece that was still missing: CSS that makes the presence or
absence of that class actually visible.)

### The Updated Project

`index.html`, in full:

```html
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4    <style>                          ← new
 5      .hidden { display: none; }     ← new
 6    </style>                         ← new
 7  </head>
 8  <body>
 9    <button id="toggleBtn">Show message</button>
10    <p id="message" class="hidden">Hello, this was hidden.</p>
11    <script src="script.js"></script>
12  </body>
13  </html>
```

`script.js`, unchanged from the previous unit, shown here again in full
per this schema's own rule against eliding just-shown code:

```js
1  const button = document.querySelector('#toggleBtn');
2  const message = document.querySelector('#message');
3
4  button.addEventListener('click', () => {
5    message.classList.toggle('hidden');
6  });
```

With both files in this state, the feature is complete: the page loads
with the message hidden (CSS line 5 hides anything carrying the
`hidden` class, and the `<p>` starts with that class per line 10);
clicking the button runs line 5 of the JS, which removes `hidden` (so
the CSS in line 5 of the HTML no longer applies, and the message
becomes visible) — and clicking again adds it back, hiding the message
once more.

### Mechanical Walkthrough

- **`message`** — the variable from Concept Unit 1, holding the real
  `<p>` element reference; reused here as the object `classList` is
  read from.
- **`.classList`** — the property, explained in full in the Header
  above; returns the live `DOMTokenList` representing this element's
  current classes.
- **`.toggle`** — the method, explained in full in the Header above;
  called here on the `DOMTokenList` `classList` returned.
- **`(`...`)`** — call syntax, invoking `toggle` with one argument.
- **`'hidden'`** — a string literal naming the exact class to flip. It
  has to match, character-for-character, the class already present in
  `index.html`'s `class="hidden"` attribute (Concept Unit 1) — if this
  string were misspelled, `toggle` would still run without error, but
  it would be adding/removing a *different*, nonexistent class, and the
  message would never actually show or hide, silently.
- **`;`** — ends the statement.
- **`.hidden { display: none; }`** in the CSS — a CSS rule, not JS;
  included here because it's what makes the class's presence or absence
  actually visible. `.hidden` is a CSS class selector (the same `.`
  syntax as `#toggleBtn`'s `#` earlier, but `.` selects by class instead
  of by `id`) targeting any element carrying that class; `display:
  none;` is the specific CSS declaration that removes an element from
  the page's layout entirely — not just invisible, but not taking up
  space either.

### CS Lens

Using the mere *presence or absence of a label* to represent a binary
state (shown/hidden) — rather than, say, a separate `isVisible`
boolean variable your JS has to keep in sync by hand — is an instance
of **state encoded structurally**, where the structure itself (here,
the DOM's own class list) *is* the state, instead of a parallel
variable that could drift out of sync with what's actually on screen.

Also recognized in: a file's read-only flag encoding permission state
directly in the filesystem rather than in a separate database; a
traffic light's actual bulb color being the state, with no separate
"current color" variable elsewhere; version-control "staged" markers on
files; and database rows using a status column value directly, rather
than a separate lookup table tracking "what status is row 5 in."

### SE Lens

The alternative not chosen is tracking visibility in a plain JS
variable — `let isVisible = false;` — and manually setting
`message.style.display` based on it. That would work, but creates two
sources of truth that have to be kept in sync by hand: the variable,
and whatever's actually rendered. `classList.toggle` avoids that by
making the DOM itself the only place the state lives — there's nothing
to get out of sync with, because there's only one thing. The real
tradeoff: this only works cleanly for state that maps naturally onto a
CSS class (shown/hidden, active/inactive, expanded/collapsed); state
that isn't naturally a yes/no per element — a running total, a list of
selected items — doesn't fit this pattern and does need a real
variable instead.

### Commands Needed

None — this remains plain HTML/CSS/JS with no build step.

### Run It

Real output, from a headless DOM run against this project's actual
files, showing the full click-toggle-click sequence:

```
before any click:
  message.classList.contains("hidden"): true

after first click:
  message.classList.contains("hidden"): false

after second click:
  message.classList.contains("hidden"): true
```

The class is present at load (matching the HTML's own
`class="hidden"`), absent after the first click (message now visible),
and present again after the second (message hidden again) — exactly
the toggle behavior this unit set out to build.

### Connection

This unit is what the click handler from the previous unit actually
*does* — the missing piece that turns "something runs on click" into
"the message visibly appears and disappears."

---

## Closing

**Connect the pieces.** Follow one real value through the whole
feature, start to finish: the page loads, and `index.html` line 10
gives the `<p>` element `class="hidden"` — which line 5 of the same
file's `<style>` block says means `display: none`, so the message
isn't visible yet. `script.js` line 1 runs
`document.querySelector('#toggleBtn')`, finding that exact `<button>`
by its `id` and storing the reference as `button`; line 2 does the same
for `#message`, storing the `<p>` reference as `message`. Line 4 calls
`button.addEventListener('click', ...)`, registering — not yet
running — the arrow function on lines 4–6 as `button`'s click callback.
Nothing else happens until a real click occurs.

The moment a user clicks the button, the browser's event system, not
this project's own code, decides to invoke that stored callback. Line
5 runs: `message.classList.toggle('hidden')` checks `message`'s current
class list, finds `'hidden'` present, removes it, and returns `false`.
With `hidden` now gone from the `<p>`'s `class` attribute, the CSS rule
`.hidden { display: none; }` no longer applies to it — the browser
re-renders, and the message becomes visible. A second click repeats
line 5: this time `toggle` finds `'hidden'` absent, adds it back, and
the CSS rule applies again, hiding the message once more. One button,
one message element, one class, one method — that's the entire feature,
and every step from HTML load to visible toggle traces through exactly
the four things this lesson built: a real element reference, a
callback value, a registered listener, and a class flip.
