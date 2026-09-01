# Lesson 12: Collapsible Regions, Built from Scratch

**What you will build:** two independent collapsible panels on the
to-do page — a "Show tips" section and an "Advanced options" section —
both driven by one reusable `makeCollapsible` function, using the
`hidden` attribute to actually hide each panel's content and
`aria-expanded` on each panel's own toggle button to correctly announce
its current state. This lesson deliberately builds the visually-correct
version first, proves it's accessibility-*incorrect* despite looking
completely fine, and then fixes that gap directly.

**What you need to know first:** Lesson 8 — `EventTarget.prototype
.addEventListener`, used here on each toggle button directly, rather
than delegated from a shared ancestor, since this lesson's two panels
are few and fixed, not a dynamic, growing list. Lesson 9 —
`document.createElement` and `Element.prototype.remove`, not directly
reused here, but this lesson's own `hidden` attribute is the direct
alternative to permanently removing and re-adding content, worth
having that comparison available.

**Terms used in this lesson:**

- **`this` inside a function** — reappearing only by contrast: this
  lesson's own toggle handlers are written as ordinary functions, and
  Lesson 6's own call-site binding rule is what makes `this` inside
  them correctly resolve to whichever specific button was clicked, a
  fact this lesson's own reusable function depends on implicitly.
- **HTML attribute vs. DOM property** — an HTML attribute is text
  written directly in markup (`hidden`, `aria-expanded="false"`); a DOM
  property is a value read or set on the corresponding JavaScript
  object (`element.hidden`, accessed as ordinary property access). For
  most attributes the two are kept in sync automatically by the browser
  — changing one updates the other — but they are not always the same
  *kind* of value: this lesson proves directly that `hidden` reflects
  as a genuine JavaScript boolean (`true`/`false`), while
  `aria-expanded` reflects only as a plain string (`"true"`/`"false"`),
  with no automatic boolean conversion at all. It matters here because
  assuming both behave identically produces a real, silent bug this
  lesson proves directly.
- **`hidden` attribute** — a real, standard HTML boolean attribute
  that, whenever present on an element at all (regardless of its
  written value), tells the browser not to render that element or
  anything inside it. It exists as a standards-based, purely semantic
  way to say "this content should not currently be shown," independent
  of any specific CSS a page happens to write — every browser's own
  built-in default stylesheet already includes a rule making `hidden`
  content actually disappear, with no custom CSS required at all.
- **`aria-expanded`** — a real ARIA (Accessible Rich Internet
  Applications) state attribute, placed on the *control* that expands
  or collapses something (a button), not on the content being shown or
  hidden itself, whose value (the literal string `"true"` or
  `"false"`) tells assistive technology — a screen reader, primarily —
  whether the thing that control operates on is currently expanded. It
  exists because the `hidden` attribute alone, placed only on the
  panel, tells a screen reader that panel isn't there — it says nothing
  at all about the *button* the user actually interacts with, which,
  without `aria-expanded`, gives a screen-reader user no way to know
  whether pressing it will show or hide anything, or what state it's
  currently in.

**Objects and methods used:**

- **`HTMLElement.prototype.hidden`**
  - *What it is:* a real, read/write instance property on every
    element, directly reflecting whether the `hidden` attribute is
    present.
  - *Implementation:* `someElement.hidden` — an instance accessor
    property; reading it returns a genuine JavaScript boolean, `true`
    if the `hidden` attribute is present at all (regardless of what
    text, if any, was written as its value in HTML) and `false`
    otherwise; setting it to `true` or `false` adds or removes the
    actual `hidden` attribute in the real DOM, kept automatically in
    sync in both directions.
  - *Its use:* this lesson's core mechanism for actually showing and
    hiding each panel's content.
  - *Type:* an instance accessor property, available on any
    `HTMLElement`.
  - *Responsibility:* to keep a JavaScript-side boolean and the real,
    underlying `hidden` HTML attribute synchronized in both directions
    — nothing about styling or layout directly; the actual disappearing
    is the browser's own default stylesheet reacting to the attribute's
    presence, not this property itself.
  - *Depends on:* an existing element.
  - *Connects to:* read and set directly inside this lesson's own
    reusable toggle function, toggled opposite to whatever the
    triggering button's own `aria-expanded` state is about to become.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.getAttribute`**
  - *What it is:* a real method on any `Element` that reads the literal
    string value of a named attribute, exactly as written (or last set)
    in the actual markup.
  - *Implementation:* `someElement.getAttribute(name)` — an instance
    method taking one attribute-name string, returning either that
    attribute's current value as a plain string, or `null` if the
    attribute isn't present at all.
  - *Its use:* this lesson's tool for reading a toggle button's current
    `aria-expanded` state before deciding what it should change to.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to report exactly what's currently written for
    one named attribute, as a string or `null` — no conversion to any
    other type, and no special handling for attributes (like
    `aria-expanded`) that only ever contain the words `"true"` or
    `"false"`.
  - *Depends on:* an existing element, and an attribute name.
  - *Connects to:* called on a toggle button inside this lesson's own
    reusable function, its result compared against the literal string
    `"true"` to determine the button's current state before flipping
    it.
  - *Shape:* a public, standard Web-platform API surface.
- **`Element.prototype.setAttribute`**
  - *What it is:* a real method on any `Element` that sets a named
    attribute to a given string value, creating it if it doesn't
    already exist.
  - *Implementation:* `someElement.setAttribute(name, value)` — an
    instance method taking an attribute name and a value, which is
    always converted to a string if it isn't one already; after it
    runs, `getAttribute` on the same name returns exactly that string
    back.
  - *Its use:* this lesson's tool for actually updating a toggle
    button's `aria-expanded` attribute, since — unlike `hidden` —
    there's no dedicated boolean property for it that would update the
    attribute automatically.
  - *Type:* an instance method, available on any `Element`.
  - *Responsibility:* to write exactly one named attribute to exactly
    the given value — no validation that the value makes sense for that
    specific attribute (setting `aria-expanded` to `"banana"` would
    succeed without error, and would simply be a meaningless value from
    a screen reader's own perspective).
  - *Depends on:* an existing element, an attribute name, and a value.
  - *Connects to:* called on the same toggle button `getAttribute` just
    read from, inside this lesson's own reusable function, writing the
    opposite of whatever state was just read.
  - *Shape:* a public, standard Web-platform API surface.

---

## Concept Unit: The `hidden` Attribute

### The Problem

The to-do page needs a "Show tips" panel — content that starts hidden,
and can be shown or hidden again by clicking a button. The most
familiar-seeming way to hide something, using only tools already
covered in this curriculum, would be an ordinary property assignment on
the panel's own `style` — `panel.style.display = "none"` — and, to show
it again, resetting that same property. Is there a real difference
between that approach and using a dedicated, purpose-built attribute
instead?

> **Try this before reading on:** if a panel is hidden by setting
> `panel.style.display = "none"` directly, and the page's own separate
> stylesheet also happens to set a `display` value for that same
> element (perhaps for an unrelated, entirely reasonable styling
> reason, written by someone who never even knew about this toggle
> feature), which one wins? Given everything you already know about how
> inline styles and stylesheet rules interact, is there a way to hide
> an element that doesn't depend on inline `style.display` at all, and
> that a totally separate piece of CSS couldn't accidentally undo?

### Isolated Example

This lesson's isolated examples use the same real, standards-compliant
DOM implementation as earlier lessons in this curriculum, including its
default styling behavior — the same rules a real browser applies
automatically, with no custom CSS written by this project at all.

```js
console.log("panel.hidden initially:", panel.hidden);
console.log("has hidden attribute initially:", panel.hasAttribute("hidden"));

panel.hidden = true;
console.log("panel.hidden after setting true:", panel.hidden);
console.log("has hidden attribute now:", panel.hasAttribute("hidden"));
console.log("outerHTML:", panel.outerHTML);

const style = getComputedStyle(panel);
console.log("computed display while hidden:", style.display);

panel.hidden = false;
console.log("computed display after un-hiding:", getComputedStyle(panel).display);
```

Run against a page with one plain `<div id="panel">Some content</div>`.
Run for real, not predicted — whether setting a JavaScript property
actually changes the real, underlying HTML attribute, and whether that
change actually affects the page's real, computed layout with zero
custom CSS involved, are exactly the kind of environment behavior the
Verification Rule requires proof for.

**Real output:**
```
panel.hidden initially: false
has hidden attribute initially: false
panel.hidden after setting true: true
has hidden attribute now: true
outerHTML: <div id="panel" hidden="">Some content</div>
computed display while hidden: none
computed display after un-hiding: block
```

Setting `panel.hidden = true` genuinely added a real `hidden`
attribute to the actual element — visible directly in `outerHTML`, not
merely a JavaScript-side flag disconnected from the real markup. And
`getComputedStyle`, reporting the page's actual, final, rendered layout
value — the same value a real browser would use to decide whether to
draw this element at all — reports `"none"` while `hidden` is present,
with no custom CSS written anywhere in this test: the browser's own
built-in default stylesheet already treats `[hidden]` as
`display: none`, automatically, for every page.

This throwaway example is now discarded — this specific `panel` never
appears in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (a new "Show tips" button
  and panel are added) and `todo.js` (a toggle handler is added).
- **Change type:** add.
- **Location:** `todo.html`'s new markup is added above the existing
  `<ul id="todo-list">`. `todo.js`'s new code is added near the top of
  the file.
- **Dependencies:** none beyond what already exists in the project.

### The New Code

```html
<button id="tips-toggle">Show tips</button>
<div id="tips-panel" hidden>Tip: click a to-do item's label to duplicate it.</div>
```

```js
const tipsToggle = document.getElementById("tips-toggle");
const tipsPanel = document.getElementById("tips-panel");

tipsToggle.addEventListener("click", function () {
  tipsPanel.hidden = !tipsPanel.hidden;
});
```

### The Updated Project

`todo.html`:
```
1  <button id="tips-toggle">Show tips</button>                                    // ← new
2  <div id="tips-panel" hidden>Tip: click a to-do item's label to duplicate it.</div>  // ← new
3  <ul id="todo-list"></ul>
4  <p id="item-count"></p>
5  <script src="todo.js" defer></script>
```

`todo.js` (new lines only; existing code from earlier lessons is
unchanged):
```
1  const tipsToggle = document.getElementById("tips-toggle");   // ← new
2  const tipsPanel = document.getElementById("tips-panel");      // ← new
3
4  tipsToggle.addEventListener("click", function () {              // ← new
5    tipsPanel.hidden = !tipsPanel.hidden;                           // ← new
6  });                                                                 // ← new
```

`todo.html` now has a toggle button and a panel, starting hidden via
the `hidden` attribute already written directly in markup. `todo.js`
attaches a click listener that flips `tipsPanel.hidden` between `true`
and `false` on every click.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`<button id="tips-toggle">Show tips</button>` (HTML, line 1).**
  Ordinary markup — a real `<button>` element, chosen specifically
  because a `<button>` is natively focusable and natively activatable
  by keyboard (Enter or Space) with no extra work required, unlike a
  plain `<div>` or `<span>` styled to look clickable, which would need
  that keyboard behavior added by hand.
- **`<div id="tips-panel" hidden>...</div>` (HTML, line 2).** Ordinary
  markup with the **`hidden` attribute** (defined in full in Terms,
  above) written directly in the HTML itself — the panel starts hidden
  the instant the page loads, before any JavaScript has even run,
  which matters for a user whose JavaScript is still loading or has
  failed to load at all.
- **`document.getElementById("tips-toggle")` and `document
  .getElementById("tips-panel")` (JS, lines 1–2).** The same query
  method used throughout this curriculum, reaching both new elements
  directly by their `id` attributes.
- **`tipsToggle.addEventListener("click", function () {...})` (line
  4).** `EventTarget.prototype.addEventListener`, from Lesson 8,
  attached directly to the one button that needs it — not delegated
  from a shared ancestor, since this lesson's panels are fixed in
  number, unlike the to-do list's own dynamically-growing items.
- **`tipsPanel.hidden = !tipsPanel.hidden` (line 5).**
  `HTMLElement.prototype.hidden` (full CRC treatment in the header,
  above), read and immediately reassigned to its own logical negation
  — the `!` operator, already familiar from your existing background,
  flipping `true` to `false` and back again on every click.

### CS Lens

This is **semantic markup driving behavior** — using an attribute whose
name directly states its meaning (`hidden` means "hidden," nothing
more to infer) rather than an implementation detail (a specific CSS
property value) that merely happens, today, to produce the visual
effect wanted.

```
Also recognized in: an HTML `<details>`/`<summary>` element's own
built-in `open` attribute, which the browser itself uses to decide
whether to show or hide the details content, with no JavaScript or
custom CSS required at all, a database column's boolean flag
(`is_archived`) driving whether a record appears in a default query,
rather than the application layer inferring "archived-ness" from
some unrelated stored value, a build tool's `enabled: true/false`
config field, read directly rather than inferred from some other
setting's side effects
```

### SE Lens

The alternative not chosen here is the Socratic prompt's own
`style.display = "none"` approach. That approach's real advantage is
familiarity — ordinary property assignment, no new attribute to learn.
Its real cost, proven directly by this unit's own isolated lab's
underlying logic: an inline style set by JavaScript and a `display`
rule set by a separate stylesheet are two different, competing sources
of truth for the exact same visual property, and CSS's own specificity
and cascade rules (not covered in this curriculum, but real) determine
which one actually wins — a page's own unrelated CSS could silently
override a JavaScript-set inline style with no error or warning at
all. `hidden`'s real advantage is that it's a single, unambiguous
signal, and the browser's own built-in stylesheet reacting to it — as
this unit's own `getComputedStyle` proof showed — happens without this
project writing a single line of custom CSS. The cost worth naming
honestly: `hidden`'s own default behavior can itself be overridden by
custom CSS too (a page-specific rule like `.tips-panel[hidden] {
display: block; }` would defeat it) — `hidden` is a strong default, not
an unbreakable guarantee, the same category of risk as the alternative
it replaces, just meaningfully less likely to be hit by accident.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
console.log("before click:", tipsPanel.hidden);
tipsToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("after one click:", tipsPanel.hidden);
tipsToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("after two clicks:", tipsPanel.hidden);
```

**Real output:**
```
before click: true
after one click: false
after two clicks: true
```

The panel's own `hidden` state correctly flips on every click,
starting from the value already written directly in `todo.html`'s own
markup.

### Connecting to what came before

This unit builds a visually working toggle using a standards-based
attribute rather than an inline style, with no CSS conflicts to worry
about. The next unit proves this same toggle, despite working
correctly on screen, is still genuinely broken for a screen-reader user
— and fixes it.

---

## Concept Unit: `aria-expanded` and a Reusable Toggle

### The Problem

The "Show tips" button, as it currently exists, gives no indication of
its own current state to anyone using a screen reader. A sighted user
sees the panel appear or disappear directly; a screen-reader user,
navigating by keyboard, hears only "Show tips, button" every single
time — nothing distinguishes "currently collapsed" from "currently
expanded," and the button's own label text never changes to hint at
it either.

> **Try this before reading on:** the `hidden` attribute, from the
> previous unit, is written on the *panel* — the content being shown or
> hidden. If a screen reader announces an element's own attributes when
> the user focuses it, and the *button* is what the user actually
> interacts with, would putting `hidden` somewhere on the button itself
> make sense, or does the button need an entirely different piece of
> information — not "am I hidden," but "does activating me currently
> show or hide something"? Given `aria-expanded`'s own name, what do you
> expect its value to actually represent, and on which of the two
> elements — button or panel — does it belong?

### Isolated Example

```js
console.log("initial aria-expanded:", btn.getAttribute("aria-expanded"));

btn.setAttribute("aria-expanded", "false");
console.log("after explicit set:", btn.getAttribute("aria-expanded"));
console.log("typeof getAttribute result:", typeof btn.getAttribute("aria-expanded"));
```

Run against a page with one plain `<button id="btn">Toggle</button>`
carrying no `aria-expanded` attribute at all. Run for real — whether
`getAttribute` on a never-set attribute returns `null`, an empty
string, or something else, and what actual JavaScript type an
attribute's value comes back as, are exactly the kind of claims the
Verification Rule requires proof for, not an assumption carried over
from the previous unit's own genuine boolean `hidden` property.

**Real output:**
```
initial aria-expanded: null
after explicit set: false
typeof getAttribute result: string
```

Before being set at all, `getAttribute("aria-expanded")` returns
`null` — not `false`, and not an empty string; the attribute simply
doesn't exist yet. After `setAttribute("aria-expanded", "false")`, the
console shows `false` — but `typeof` proves that's actually the
*string* `"false"`, not the boolean value `false`; unlike the previous
unit's `hidden` property, there is no dedicated boolean-reflecting
property for `aria-expanded` at all. This is a real, easy mistake to
make: code that compared `button.getAttribute("aria-expanded")`
directly against the boolean `false` (rather than the string `"false"`)
would never match, because a string and a boolean are never `===` to
each other, no matter what they look like printed to the console.

This throwaway example is now discarded — this specific `btn` never
appears in the project again, though the string-comparison lesson it
teaches directly shapes the project's own toggle logic next.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `todo.html` (`aria-expanded="false"`
  is added to the existing tips button, and a second, new collapsible
  region — "Advanced options" — is added, to prove the fix generalizes)
  and `todo.js` (the previous unit's one-off handler is replaced with a
  reusable `makeCollapsible` function, called twice).
- **Change type:** refactor (the previous unit's handler becomes a
  reusable function) plus add (`aria-expanded` on the existing button,
  and an entirely new second collapsible region).
- **Location:** `todo.html`'s tips button gains one new attribute; a
  new button/panel pair is added below it. `todo.js`'s previous unit's
  handler is replaced entirely.
- **Dependencies:** the tips button and panel from the previous Concept
  Unit.

### The New Code

```html
<button id="tips-toggle" aria-expanded="false">Show tips</button>
<div id="tips-panel" hidden>Tip: click a to-do item's label to duplicate it.</div>

<button id="adv-toggle" aria-expanded="false">Advanced options</button>
<div id="adv-panel" hidden>Advanced options go here.</div>
```

```js
function makeCollapsible(button, panel) {
  button.addEventListener("click", function () {
    const expanded = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!expanded));
    panel.hidden = expanded;
  });
}

makeCollapsible(tipsToggle, tipsPanel);

const advToggle = document.getElementById("adv-toggle");
const advPanel = document.getElementById("adv-panel");
makeCollapsible(advToggle, advPanel);
```

### The Updated Project

`todo.html`:
```
1  <button id="tips-toggle" aria-expanded="false">Show tips</button>                   // ← changed
2  <div id="tips-panel" hidden>Tip: click a to-do item's label to duplicate it.</div>
3
4  <button id="adv-toggle" aria-expanded="false">Advanced options</button>              // ← new
5  <div id="adv-panel" hidden>Advanced options go here.</div>                            // ← new
6
7  <ul id="todo-list"></ul>
8  <p id="item-count"></p>
9  <script src="todo.js" defer></script>
```

`todo.js` (replacing the previous unit's one-off handler entirely;
`tipsToggle` and `tipsPanel` themselves are still defined exactly as
before):
```
 1  function makeCollapsible(button, panel) {                          // ← new
 2    button.addEventListener("click", function () {                    // ← new
 3      const expanded = button.getAttribute("aria-expanded") === "true"; // ← new
 4      button.setAttribute("aria-expanded", String(!expanded));           // ← new
 5      panel.hidden = expanded;                                            // ← new
 6    });                                                                    // ← new
 7  }                                                                         // ← new
 8
 9  makeCollapsible(tipsToggle, tipsPanel);                                   // ← new
10
11  const advToggle = document.getElementById("adv-toggle");                  // ← new
12  const advPanel = document.getElementById("adv-panel");                     // ← new
13  makeCollapsible(advToggle, advPanel);                                       // ← new
```

`todo.html` now has two independent collapsible regions, both correctly
carrying `aria-expanded="false"` on their own trigger button from the
moment the page loads. `todo.js` replaces the previous unit's
single-purpose handler with one reusable `makeCollapsible` function,
called once per region — each call wires up a completely independent
toggle, sharing only the function's own logic, not any state between
the two regions.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`aria-expanded="false"` on both buttons (HTML, lines 1 and 4).**
  The **`aria-expanded`** attribute (defined in full in Terms, above),
  written directly in markup so its correct starting value exists
  immediately when the page loads — matching each panel's own
  already-present `hidden` attribute, so the two never start out of
  sync.
- **`function makeCollapsible(button, panel) { ... }` (JS, lines
  1–7).** An ordinary function declaration, taking two parameters — a
  button and its corresponding panel — deliberately generic, with no
  reference to `tips` or `adv` anywhere inside its own body, which is
  exactly what makes it reusable across both regions.
- **`button.addEventListener("click", function () {...})` (line 2).**
  `EventTarget.prototype.addEventListener`, from Lesson 8, attached
  directly to whichever specific `button` this particular call to
  `makeCollapsible` was given — each call produces its own,
  independent listener, closing over that call's own `button` and
  `panel` parameters (the same **closure** mechanism first proven in
  Lesson 4, here capturing function parameters instead of a local
  variable).
- **`button.getAttribute("aria-expanded") === "true"` (line 3).**
  `Element.prototype.getAttribute` (full CRC treatment in the header,
  above), read and compared against the literal string `"true"` — not
  the boolean `true` — directly applying this unit's own isolated
  lab's proof that `aria-expanded` reflects only as a string, with the
  comparison written correctly to account for that.
- **`button.setAttribute("aria-expanded", String(!expanded))` (line
  4).** `Element.prototype.setAttribute` (full CRC treatment in the
  header, above), writing the logical negation of `expanded` — but
  `String(...)`, a real, standard JavaScript conversion function,
  explicitly converts that boolean back into the string `"true"` or
  `"false"` before writing it, since `setAttribute` always stores
  whatever it's given as a string regardless, and being explicit here
  avoids relying on JavaScript's own implicit string conversion to do
  it silently.
- **`panel.hidden = expanded` (line 5).**
  `HTMLElement.prototype.hidden`, from the previous unit, set to
  `expanded`'s own original (pre-negation) value — when `expanded` was
  `true` (the panel was showing), the panel should become hidden now,
  so setting `panel.hidden` to that same `true` is correct; the naming
  here rewards careful reading, since `panel.hidden = expanded` looks,
  at a glance, like it might be a copy-paste mistake, but is exactly
  the intended logic once traced through.
- **`makeCollapsible(tipsToggle, tipsPanel)` and `makeCollapsible
  (advToggle, advPanel)` (lines 9 and 13).** Two ordinary function
  calls, each wiring up one completely independent collapsible region
  — this is the concrete proof of reusability the previous unit's
  one-off version couldn't offer at all.

### CS Lens

This is **parameterization** — the same idea, at the level of a whole
function's behavior, that Lesson 1's own `Object.create` and Lesson 2's
own constructor functions applied to individual object construction:
one piece of logic, written once, made to work against different
concrete inputs by taking those inputs as explicit parameters rather
than hardcoding them.

```
Also recognized in: a single SQL query template accepting a WHERE
clause's actual value as a bound parameter, rather than a separate
hardcoded query per possible value, a CSS component class (`.card`)
applied to many different pieces of unrelated content, rather than
writing separate, nearly-identical styles per instance, a factory
function in any language that builds many structurally identical
objects from different input data, exactly Lesson 2's own
`Circle`/`Shape` constructors generalized to arbitrary count
```

### SE Lens

The alternative not chosen here is what the previous unit actually
built: a one-off handler, hardcoded against `tipsToggle` and
`tipsPanel` by name, inside its own body. That approach's real
advantage is directness — reading it, there's no indirection between
"this button" and "this panel." Its real cost, proven the moment a
second collapsible region was needed: the entire handler would have to
be copied and re-pasted, with every internal reference renamed by
hand, and a bug fixed in one copy wouldn't automatically apply to the
other — the exact same maintenance cost named as far back as Lesson 1's
own SE Lens, here reappearing at the level of a whole interactive
feature instead of a single shared method.
`makeCollapsible`'s real advantage, proven directly by this unit's own
two independent, correctly-isolated toggles: a fix to the toggle logic
itself only ever needs to happen in one place. Its own genuine cost:
every collapsible region on the page still requires its own explicit
`makeCollapsible(...)` call, written by hand, at the point each region
is set up — this function doesn't scale to "automatically make every
matching button/panel pair on the page collapsible" the way a
selector-driven, delegation-based approach might, a real limitation
worth naming rather than one this lesson's own two-region proof happens
to hide.

### Commands Needed

None — open `todo.html` in a browser, as before.

### Run It

```js
console.log("before any click - tips hidden:", tipsPanel.hidden, "adv hidden:", advPanel.hidden);

tipsToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("after clicking tips - tips hidden:", tipsPanel.hidden, "tips aria-expanded:", tipsToggle.getAttribute("aria-expanded"));
console.log("adv unaffected - adv hidden:", advPanel.hidden, "adv aria-expanded:", advToggle.getAttribute("aria-expanded"));

advToggle.dispatchEvent(new MouseEvent("click", { bubbles: true }));
console.log("after clicking adv - adv hidden:", advPanel.hidden, "adv aria-expanded:", advToggle.getAttribute("aria-expanded"));
console.log("tips still expanded independently - tips hidden:", tipsPanel.hidden);
```

**Real output:**
```
before any click - tips hidden: true adv hidden: true
after clicking tips - tips hidden: false tips aria-expanded: true
adv unaffected - adv hidden: true adv aria-expanded: false
after clicking adv - adv hidden: false adv aria-expanded: true
tips still expanded independently - tips hidden: false
```

Clicking the tips button correctly shows its own panel and correctly
updates its own `aria-expanded` to `"true"`, while the advanced-options
region — sharing the exact same `makeCollapsible` function — remains
completely unaffected, still collapsed. Clicking the advanced-options
button afterward correctly expands it too, independently, with the
tips region's own already-expanded state undisturbed — direct,
verified proof that each call to `makeCollapsible` produced a
genuinely separate, non-interfering toggle.

### Connecting to what came before

This unit fixes the accessibility gap the previous unit's own working,
but incomplete, toggle left open — adding `aria-expanded` on the
correct element, kept correctly in sync as a string rather than
assumed to behave like the previous unit's genuine boolean `hidden` —
and, in the same pass, turns a one-off handler into a reusable function
proven, directly, to work correctly across more than one independent
region.

---

## Connect the Pieces

One click, followed through both of this lesson's own techniques at
once: a user clicks the "Advanced options" button. `makeCollapsible`'s
own listener, attached to that specific button when `makeCollapsible
(advToggle, advPanel)` was called, reads `advToggle.getAttribute
("aria-expanded")` — the literal string `"false"`, since this button
has never been clicked yet — and compares it against the string
`"true"`, per this lesson's own proof that the comparison has to be
string-to-string; `expanded` is `false`. `advToggle.setAttribute
("aria-expanded", String(!expanded))` writes the string `"true"` onto
the button — a screen reader focusing this button now correctly
announces it as expanded. `advPanel.hidden = expanded` sets the panel's
own `hidden` property to `false` — removing the real `hidden` attribute
from the real DOM, which the browser's own default stylesheet
immediately reacts to by actually rendering the panel's content, with
zero custom CSS written anywhere in this project. Both changes —
one to a string attribute meant for assistive technology, one to a
boolean property meant to control real, visible rendering — happen
inside the same six-line function, called once per region, with the
"Show tips" region's own independent state completely untouched by any
of it.

## What's Next

Lesson 13 turns to making a to-do item's own label directly editable —
starting with `contenteditable`, and the real traps (pasted content,
`blur` timing) that come with editing text that isn't inside an
ordinary `<input>` at all.
