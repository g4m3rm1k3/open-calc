# Lesson 10: Naming What You Want Instead of Walking to Get It

**What you will build.** `local.html` gains its first external library — jQuery
— loaded via a `<script>` tag in the page's own `<head>`. The existing
`message`-handling code, unchanged in *behavior* since Lesson 7, is rewritten
to select `#output` and set its text through jQuery instead of
`document.getElementById`/`.textContent`. A genuinely new capability is
added: a real button, wired to a real click, showing that jQuery can attach
behavior to page elements the same way it can find them. The transferable
problem underneath the feature: plain DOM methods (`getElementById`,
`addEventListener`) are correct, but verbose and inconsistent — one method
name to look up by ID, a different one for CSS class, a different one again
for a tag name, each returning something slightly different. jQuery's own
entire premise is collapsing all of that lookup variety behind one single
function and one consistent selector language, borrowed directly from CSS,
that already works.

**What you need to know first.** Lesson 7 — `window.chrome.webview
.addEventListener('message', ...)`, `document.getElementById`,
`.textContent`, arrow functions, template literals. Lesson 6 — `local.html`
as a real file `Browser.Source` navigates to, copied into the build output
via `ToolDB.csproj`'s own `<Content Include="local.html" ...>` item.

**Terms used in this lesson**

- **library (JavaScript)** — a collection of pre-written functions, loaded
  into a page, that a page's own `<script>` code can then call. It exists so
  common problems (finding elements, attaching events, animating, making
  network requests) don't have to be solved from scratch by every project
  that needs them — jQuery is one specific, extremely widely used example,
  not the only one.
- **CDN (Content Delivery Network)** — a network of servers, run by a third
  party, that hosts a copy of a public file (here, jQuery's own minified
  script) and serves it quickly to whoever requests it. It exists so a
  project doesn't have to host a copy of a popular, unchanging library
  itself — `local.html` this lesson references jQuery's own official CDN
  URL rather than a locally saved copy of the file.
- **jQuery object** — the value `$(...)` returns: not a plain DOM element,
  but a wrapper around zero, one, or many matched DOM elements, carrying
  jQuery's own extra methods (`.text()`, `.on()`, and many more this lesson
  doesn't use). It exists so every jQuery method can be called the same
  way regardless of how many real elements were matched — one match or a
  hundred, the calling code looks identical.
- **CSS selector syntax** — the same pattern language CSS itself uses to
  target elements for styling (`#output` for an ID, `.some-class` for a
  class, `div` for a tag name) — reused here as the *argument* to `$(...)`
  instead of the argument to a CSS rule. It exists, in jQuery specifically,
  so a developer who already knows CSS selectors (styling) doesn't have to
  learn a second, different lookup language for JavaScript (behavior).
- **DOM event** — reappearing from Lesson 7's own **event listener**
  Term, narrowed here to specifically mean an event a real, visible page
  element fires because of something a user did to it — a `click`, most
  directly, in this lesson's own new button. This is a genuinely different
  category from Lesson 7's own `message` event, which fires on
  `window.chrome.webview` — a special object WebView2 itself injects, not
  a visible element a person can click, and — this lesson's own third unit
  proves directly — not something jQuery's selectors can reach at all.

**Objects and methods used**

- **`jQuery()` / `$()`**
  - *What it is:* this lesson's own Concept Unit 2 subject — jQuery's own
    single entry-point function, used to find page elements matching a
    given selector.
  - *Implementation:* per jQuery's own official documentation (fetched this
    session), it "Return[s] a collection of matched elements either found
    in the DOM based on passed argument(s) or created by passing an HTML
    string" — searching "through the DOM for any elements that match the
    provided selector," using real **CSS selector syntax** (Terms, above).
    `$` is a real, ordinary JavaScript variable — a shorthand alias jQuery
    itself assigns to the exact same function also reachable as `jQuery`,
    not special browser syntax.
  - *Its use:* `$('#output')` and `$('#show-count')`, both this lesson,
    locating `local.html`'s own real elements by their `id` attributes.
  - *Type:* a free function (not a method on any object) — called directly
    as `$(...)`, the same shape `console.log(...)` or `fetch(...)` already
    have as ordinary top-level function calls.
  - *Responsibility:* search the page's real DOM tree for every element
    matching the given selector, and hand back one **jQuery object**
    (Terms, above) wrapping whatever it found — nothing beyond that single
    lookup and wrap step.
  - *Depends on:* the page's own DOM already existing (built by the browser
    from `local.html`'s own markup) at the moment `$(...)` is called, and a
    valid selector string.
  - *Connects to:* called directly by this lesson's own new code; its
    return value is what every other jQuery method in this lesson (`.text()`,
    `.on()`) is then called *on* — every jQuery call in this lesson starts
    with `$(...)`.
  - *Shape:* the single public entry point the entire jQuery library is
    reached through — every other jQuery method exists as something called
    on `$(...)`'s own return value, not as a separate free function.
- **`.text()`**
  - *What it is:* this lesson's own Concept Unit 2 subject, alongside
    `$()` — reads or replaces the plain text content of every element a
    jQuery object wraps.
  - *Implementation:* per jQuery's own official documentation (fetched
    this session), called with no arguments it "Get[s] the combined text
    contents of each element in the set of matched elements, including
    their descendants," returning a plain `String`. Called with one string
    argument, it instead "Set[s] the content of each element in the set of
    matched elements to the specified text," returning the same jQuery
    object it was called on. A stated, deliberate difference from a
    similar method, `.html()`, not used in this lesson: "`.text()` can be
    used in both XML and HTML documents," and — critically — a call like
    `.text("<b>hi</b>")` "calls the DOM method `.createTextNode()`, does
    not interpret the string as HTML," so any literal `<`/`>` characters in
    the string show up as visible text instead of being rendered as markup.
  - *Its use:* only the setter form, in this lesson — `$('#output').text(...)`
    and `$('#show-count').text(...)`, called with a `string` argument.
  - *Type:* an instance method, callable only on a **jQuery object**
    (Terms, above) — never a free function like `$()` itself.
  - *Responsibility:* own the plain-text content of whatever real element(s)
    the jQuery object it's called on currently wraps — reading it back, or
    replacing it outright, depending on whether an argument is given.
  - *Depends on:* a jQuery object with at least one real matched element
    already wrapped inside it — calling `.text(...)` on an empty match (a
    selector that found nothing) is valid but has no visible effect.
  - *Connects to:* called directly on `$(...)`'s own return value — never
    called standalone; its setter form's return value (the same jQuery
    object) is what makes jQuery's own method chaining possible, though
    this lesson's own code doesn't chain further calls onto it.
  - *Shape:* the direct, one-call replacement this lesson's own second unit
    substitutes for Lesson 7's own two-step `document.getElementById(...)
    .textContent = ...` sequence.
- **`.on()`**
  - *What it is:* this lesson's own Concept Unit 3 subject — attaches a
    function to run whenever a named event occurs on every element a
    jQuery object wraps.
  - *Implementation:* per jQuery's own official documentation (fetched
    this session), "`.on()` method attaches event handlers to the currently
    selected set of elements in the jQuery object," with the signature
    `.on( events [, selector] [, data], handler )` — this lesson's own code
    uses only the first and last parameters, `events` (a string naming
    which event) and `handler` (the function to run). It "returns a jQuery
    object, which enables method chaining."
  - *Its use:* `$('#show-count').on('click', () => { ... })`, this lesson's
    own third unit, attaching a real click handler to the new button.
  - *Type:* an instance method, callable only on a **jQuery object**
    (Terms, above) — the same category as `.text()`, above.
  - *Responsibility:* register a callback function against a real element,
    to be invoked later, by the browser itself, whenever that named
    **DOM event** (Terms, above) genuinely occurs on that element — not
    invoked immediately, at the point `.on()` itself is called.
  - *Depends on:* a jQuery object wrapping at least one real element, a
    string naming a real DOM event type (`'click'`, here), and a function
    to run when it fires.
  - *Connects to:* called on `$('#show-count')`'s own return value; the
    function it's given is invoked later, by the browser's own event
    system, the same underlying mechanism Lesson 7's own
    `addEventListener` already used — `.on()` is not a competing
    mechanism, it's jQuery's own consistent wrapper around that exact
    native mechanism.
  - *Shape:* jQuery's own general-purpose event-attachment method — this
    lesson uses it for exactly one event type, `click`, but the identical
    call shape works for any other named DOM event.

**Everything else in the file, not this lesson's own subject but still
explained**

- **`window.chrome.webview.addEventListener('message', ...)`**
  - *What it is:* reappearing from Lesson 7 — the real, WebView2-injected
    object and event this project already uses to receive `tools.db` data
    from C#.
  - *Implementation:* established in Lesson 7, unchanged.
  - *Its use:* still the only way `local.html` learns about real tool data
    — this lesson's own third unit proves directly why this call could
    never be rewritten as a jQuery `.on()` call.
- **arrow function, template literal**
  - *What it is:* reappearing from Lesson 7 — a compact anonymous function
    (`() => { ... }`) and a backtick string with `${...}` interpolation.
  - *Implementation:* established in Lesson 7, unchanged.
  - *Its use:* both this lesson's own new click handler and the rewritten
    `message` handler still use the identical syntax Lesson 7 already
    taught in full.

---

## Concept Unit: Bringing In Someone Else's Code — the `<script src="...">` Tag

### The Problem

Every line of JavaScript `local.html` has run since Lesson 7 was written by
this project itself. jQuery's own functions — `$()`, `.text()`, `.on()`,
named throughout this lesson's own Header — don't exist yet anywhere on this
page; nothing has told the browser where to find them.

> **Try this first:** `local.html`'s own `<script>` block, since Lesson 7,
> has always contained inline JavaScript directly between its opening and
> closing tags. Given that a `<script>` tag can *also* carry an `src`
> attribute — the same way an `<img>` tag points at an image file instead
> of containing pixel data directly — what do you expect a browser does
> differently when it meets a `<script src="...">` tag versus one with
> code written directly inside it?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — add (one new `<script>` tag).
- **Location** — inside `<head>`, before the existing `<title>`... actually
  after it, as the last element of `<head>` — loaded before `<body>`'s own
  inline `<script>` runs, so `$`/`jQuery` are already defined by the time
  that later script needs them.
- **Dependencies** — none beyond a real network path to jQuery's own CDN
  (Terms, above) being reachable from wherever `ToolDB` actually runs.

### The New Code

```html
<script src="https://code.jquery.com/jquery-3.7.1.min.js"
        integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
        crossorigin="anonymous"></script>
```

### The Updated Project

`local.html`'s own `<head>`, in full, new lines marked:

```html
1  <head>
2      <title>ToolDB</title>
3      <script src="https://code.jquery.com/jquery-3.7.1.min.js"        // ← new
4              integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="  // ← new
5              crossorigin="anonymous"></script>                        // ← new
6  </head>
```

`<head>` now does two things instead of one: naming the page's own title
(line 2, unchanged since Lesson 5), and — new, this unit — fetching and
running jQuery's own script before anything in `<body>` runs at all.

### Proving It in Isolation

This unit's own change *is* already the smallest possible fragment — one
tag, three attributes, nothing to further isolate. What's worth proving
instead is the claim this unit's Problem opened with: that `$`/`jQuery`
genuinely don't exist until this tag runs. jQuery's own real, official
documentation (fetched this session, cited in full in this lesson's own
Header) confirms `$` is "a shorthand alias" for the same function also
reachable as `jQuery` — both names become real, defined global values only
once this `<script>` tag's own file has finished downloading and running.
Before that point, in any browser, referencing `$` or `jQuery` throws a
real `ReferenceError: $ is not defined` — this project's own next unit
relies on this tag having already run, so this ordering is load-bearing,
not incidental.

### Discard the Throwaway Example

No throwaway code exists for this unit — the tag itself is the smallest
possible unit, already shown directly in real project context above.

### Mechanical Walkthrough

- `<script src="https://code.jquery.com/jquery-3.7.1.min.js" ...>` — the
  `<script>` tag itself (reappearing from Lesson 7, where it held inline
  code directly); its `src` attribute, first appearing here, tells the
  browser to fetch and run the JavaScript file at that URL instead of
  running any code written between the tags — this tag has no closing
  content at all, `</script>` immediately follows the opening tag's own
  closing `>`.
- `integrity="sha256-..."` — a **Subresource Integrity** attribute, first
  appearing here: a cryptographic hash of the exact file jQuery's own CDN
  is expected to serve at that URL. If the file the browser actually
  downloads doesn't match this hash — because the CDN was compromised, or
  the file was silently changed — the browser refuses to run it at all,
  rather than silently executing different code than what this project's
  own author reviewed and expected.
- `crossorigin="anonymous"` — an attribute required by browsers whenever
  `integrity` is present on a cross-origin (different-domain) `<script>`
  tag — without it, the browser can't perform the integrity check at all,
  because reading enough of a cross-origin response to hash-check it
  requires this explicit opt-in.

### CS Lens

Loading a separately-authored, separately-versioned unit of code into a
program, by reference, rather than copying its source directly into the
project, is a specific instance of a much broader idea: a **dependency**.
Also recognized in: a C# project's own `<PackageReference>` (this project's
own `Microsoft.Data.Sqlite` and `Microsoft.Web.WebView2` entries in
`ToolDB.csproj`, established since Lesson 1 and Lesson 6), Python's `pip`
packages, and a Linux distribution's own shared `.so` libraries, loaded
once and used by many separate programs rather than compiled into each one.

### SE Lens

Why reference jQuery from a CDN, rather than downloading a copy of the file
and saving it inside this project's own folder? The alternative not
chosen — a local copy — would make `local.html` work even with no network
access at all, a real, honest advantage this lesson's own choice gives up.
The CDN approach trades that away for two real benefits: the browser
likely already has this *exact* file cached from some other website using
the identical CDN URL, meaning no real download happens at all in that
case; and this project never has to manually track jQuery's own version or
re-download it if a security fix is ever released. The honest cost, named
directly rather than glossed over: `ToolDB` now has a real, silent
dependency on network access existing at the moment `local.html` loads —
if that CDN is ever unreachable, this project's own **remaining** vanilla
JavaScript (the `message` handler, unaffected by this tag) would still run,
but every jQuery call after it would fail with the same
`$ is not defined` error this unit's own proof already named.

### Run It

No `dotnet build` is needed for this unit — no C# file changed, and
`ToolDB.csproj`'s own `<Content Include="local.html" ...>` item, established
in Lesson 6, already copies any change to this file into the build output
automatically; nothing about that mechanism is different for this edit.

### Connecting Back

`$`/`jQuery` are now real, callable functions on this page, for the first
time — but nothing in `local.html`'s own existing code calls either one
yet. The next unit is where that actually happens.

---

## Concept Unit: Finding an Element by Name Instead of by Method — Selectors and `.text()`

### The Problem

`local.html`'s own `message` handler, unchanged since Lesson 7, still reads
`document.getElementById('output').textContent = ...` — two separate steps,
one method chosen specifically because `#output` is looked up by its `id`
attribute, a second, different property to actually change what's
displayed. jQuery's own Header entries, above, promise this can collapse
into one consistent call — this unit is where that promise gets tested
against this project's own real code.

> **Try this first:** `$()`'s own Header entry already states it accepts
> real **CSS selector syntax** (Terms, above) — and `#output` is exactly
> the kind of selector CSS itself already uses to target an element by its
> `id` attribute for styling. Given that, what string would you expect to
> pass to `$(...)` to select the exact same `<p id="output">` element
> `document.getElementById('output')` already finds?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — replace (the one assignment line inside the existing
  `message` handler).
- **Location** — inside the `window.chrome.webview.addEventListener('message',
  ...)` callback, established in Lesson 7 — only its own body's single
  assignment line changes; the event registration itself is untouched.
- **Dependencies** — the previous unit's own `<script src="...">` tag must
  already have run, so `$` is defined by the time this code executes.

### The New Code

```javascript
$('#output').text(
    `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
);
```

### The Updated Project

`local.html`'s own `<script>` block, in full, changed line marked:

```html
1  <script>
2      window.chrome.webview.addEventListener('message', event => {
3          const tools = event.data;
4          $('#output').text(                                          // ← changed
5              `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`  // ← changed
6          );                                                          // ← changed
7      });
8  </script>
```

The handler still does exactly what it did in Lesson 7 — react to a real
`message` event, read `event.data`, and display a summary — only *how* it
reaches and updates `#output` changed, from two plain-DOM steps to one
jQuery call.

### Proving It in Isolation

The real code above is already small enough to serve as its own proof —
this project's own real `#output` element, this project's own real
template literal (Lesson 7). What's worth isolating instead is the general
shape: any `#id`-style selector locates one specific element, the same way
`document.getElementById` always has, confirmed directly by jQuery's own
official documentation, quoted in full in this lesson's Header — `$(...)`
"searches through the DOM for any elements that match the provided
selector," and `#output` matches exactly the one real element in
`local.html` carrying that `id`.

### Discard the Throwaway Example

No throwaway code exists for this unit — the real project code above is
small and self-explanatory enough that a separate isolated example would
duplicate it exactly.

### Mechanical Walkthrough

- `$('#output')` — `$()` (Header, above), called with the string `'#output'`
  — **CSS selector syntax** (Terms, above) for "the element whose `id`
  attribute is `output`," matching `local.html`'s own real
  `<p id="output">` element, established since Lesson 5. Returns a real
  **jQuery object** (Terms, above) wrapping that one matched element.
- `.text(...)` — `.text()` (Header, above), called on that jQuery object
  with one `string` argument — the setter form, per its own documented
  behavior: replaces `#output`'s entire text content with the given
  string, the direct one-call replacement for Lesson 7's own two-step
  `document.getElementById('output').textContent = ...`.
- `` `Loaded ${tools.length} tool(s)...` `` — reappearing from Lesson 7,
  the identical template literal already explained there in full; only
  what consumes its result changed this unit, not how it's built.

### CS Lens

Collapsing "find this thing" and "look up its address, then follow that
address to reach it" into one direct call is a specific instance of
**abstraction** — hiding a mechanism's own internal steps behind a simpler
interface that only asks for *what* is wanted, not *how* to get it.
Also recognized in: SQL's own `SELECT` (Lessons 3–9, this project's own
established curriculum) asking a database for rows matching a condition
without specifying which index or scan method to use internally, a file
system path (`/home/user/file.txt`) hiding the actual disk blocks it maps
to, and a phone's own contact list letting you dial "Mom" instead of
memorizing a phone number.

### SE Lens

Why does jQuery's own `$()` accept a *string* selector, rather than this
project calling some more specific, differently-named method for "look up
by ID" versus a separate one for "look up by class"? The alternative not
chosen — one method per lookup strategy, the shape `document`'s own native
API actually uses (`getElementById`, `getElementsByClassName`,
`querySelector`, each with different rules and return types) — forces a
caller to already know, in advance, *which* kind of selector they're using
before choosing which method to call. jQuery's own single-function design
accepts a real, honest cost in exchange for that convenience: a typo inside
a selector *string* (`'#outptu'`) is invisible to the compiler in a way a
misspelled *method name* (`getElementByld`) would at least sometimes be
caught by an editor's own autocomplete — `$('#outptu')` compiles, runs, and
simply matches nothing, silently, with no error raised anywhere.

### Run It

No `dotnet build` needed, same reasoning as the previous unit — this
change touches only `local.html`.

### Connecting Back

`#output` is now driven entirely through jQuery, proving this lesson's own
Header claim true against this project's own real, already-existing code —
not just a fresh example built to look good. The next unit adds something
`local.html` has never had before at all: a real button, and a real click.

---

## Concept Unit: A Different Kind of Event — `.on('click', ...)`

### The Problem

Every event `local.html` has ever reacted to, since Lesson 7, has been the
`message` event on `window.chrome.webview` — a real event, but one no
person ever directly causes by clicking anything; it fires only because C#
code, on the other side of the process boundary, chose to send data.
Nothing in `local.html` has ever reacted to something a person actually
*does* to the page itself.

> **Try this first:** `.on()`'s own Header entry already states its basic
> shape is `.on(events, handler)`, the same two-part shape
> `addEventListener('message', event => {...})` (Lesson 7) already used —
> an event name, then a function to run. Given that, and given
> `window.chrome.webview` isn't a real, visible page element at all (it's
> an object WebView2 itself injects), what do you predict happens if this
> project tries `$(window.chrome.webview).on('message', ...)` instead of
> the real `addEventListener` call Lesson 7 already proved works — does
> jQuery's own selector-based approach reach *every* kind of event, or only
> events on real DOM elements?

### Project Change

- **Reference Source** — no reference counterpart consulted this session;
  per this project's own self-containment rule.
- **Files affected** — `ToolDB/local.html`, modified.
- **Change type** — add (one new `<button>` element in `<body>`, one new
  `<script>` statement).
- **Location** — the `<button>` joins `<body>`'s own existing elements,
  after the `<p id="output">` established in Lesson 5; the new script
  statement joins the existing `<script>` block, after the `message`
  handler this lesson's own second unit already modified.
- **Dependencies** — this unit's own first unit's `<script src="...">` tag.

### The New Code

The new element:

```html
<button id="show-count">Show Count Only</button>
```

And the new event binding:

```javascript
$('#show-count').on('click', () => {
    $('#output').text(`${tools.length} tool(s) loaded.`);
});
```

### The Updated Project

`local.html`, in full, new lines marked:

```html
 1  <!DOCTYPE html>
 2  <html>
 3  <head>
 4      <title>ToolDB</title>
 5      <script src="https://code.jquery.com/jquery-3.7.1.min.js"
 6              integrity="sha256-/JqT3SQfawRcv/BIHPThkBvs0OEvtFFmqPF/lYI/Cxo="
 7              crossorigin="anonymous"></script>
 8  </head>
 9  <body>
10      <h1>ToolDB</h1>
11      <p id="output">Waiting for tool data from C#...</p>
12      <button id="show-count">Show Count Only</button>              <!-- ← new -->
13      <script>
14          let tools = [];                                           <!-- ← new -->
15
16          window.chrome.webview.addEventListener('message', event => {
17              tools = event.data;                                   <!-- ← changed -->
18              $('#output').text(
19                  `Loaded ${tools.length} tool(s) from tools.db. First: ${tools[0].Name} (${tools[0].Manufacturer})`
20              );
21          });
22
23          $('#show-count').on('click', () => {                      <!-- ← new -->
24              $('#output').text(`${tools.length} tool(s) loaded.`);  <!-- ← new -->
25          });                                                       <!-- ← new -->
26      </script>
27  </body>
28  </html>
```

One real change had to land alongside the button itself, worth naming
directly: `tools` (line 3 of the previous unit's own snippet) was declared
with `const`, established since Lesson 7, *inside* the `message` handler —
a variable scoped only to that one callback's own execution, invisible to
this unit's new click handler entirely. Line 14 hoists it to a `let`
(first appearing here) declared once, outside either handler, so both can
read the same, most-recently-received tool data — `const` was correct when
only one place ever read `tools`; a second, independent reader is exactly
the situation that requires a variable neither handler owns exclusively.

### Proving It in Isolation

This unit's own real Socratic question, above, is itself the isolated
proof this unit needs — not throwaway code, but a real, deliberate
question about a genuine boundary in what jQuery's own selector-based
approach can reach. The honest answer, confirmed directly by this
project's own real, working code since Lesson 7: `window.chrome.webview`
is a plain JavaScript object WebView2 injects — it has its own
`addEventListener` method (inherited from the browser's own real
`EventTarget` interface, per Lesson 7's own Header), but it is not, and
never becomes, a node in the page's own DOM tree. `$(...)`'s own
documented behavior — "searches through the DOM for any elements that
match" — only ever searches the DOM. `$(window.chrome.webview)` would not
throw an error (jQuery accepts a raw object as well as a selector string),
but calling `.on('message', ...)` on the resulting jQuery-wrapped object
would attach nothing meaningful — jQuery's own event system is built to
delegate to real DOM event handling underneath, and `window.chrome.webview`
was never part of that system to begin with. This is exactly why Lesson
7's own `addEventListener` call was never rewritten in this lesson's
second unit: it was never the kind of event `.on()` is for.

### Discard the Throwaway Example

No throwaway code exists for this unit — the real project's own new button
and click handler, shown above, are already the smallest possible
demonstration of `.on()` attached to a real DOM element.

### Mechanical Walkthrough

- `<button id="show-count">Show Count Only</button>` — an ordinary HTML
  button element, first appearing in this project — its `id` attribute,
  established since Lesson 5 on `<p id="output">`, is what this unit's own
  selector, next, targets.
- `let tools = [];` — `let` (first appearing here), a variable declaration
  whose value can be reassigned later, in contrast to `const` (established
  since Lesson 7), which cannot; initialized to an empty array so
  `tools.length` is always a valid number to read, even before any real
  `message` event has ever arrived.
- `tools = event.data;` — a plain reassignment (established since Lesson
  1's own C# variable assignment, the identical concept in JavaScript) —
  the outer, hoisted `tools` variable now receives each new message's own
  data, replacing whatever it held from any previous message.
- `$('#show-count')` — `$()` (Header, above), reappearing from the
  previous unit with a different selector string, matching this unit's own
  new button by its `id`.
- `.on('click', () => { ... })` — `.on()` (Header, above), this lesson's
  own third subject — `'click'`, a real, standard **DOM event** (Terms,
  above) name, fired by the browser itself whenever a person presses this
  specific button; the arrow function (reappearing from Lesson 7) is the
  handler, run each time that real click genuinely occurs — not run
  immediately, at the point `.on()` itself executes, the identical timing
  behavior Lesson 7's own `addEventListener` already established for the
  `message` event.
- `` $('#output').text(`${tools.length} tool(s) loaded.`); `` — reappearing
  from this lesson's own second unit, the identical `$()`/`.text()` pair,
  now reading the hoisted `tools` variable instead of a locally-scoped
  `const`, and building a shorter summary string than the `message`
  handler's own.

### CS Lens

A function that only runs later, in response to something a user actually
does, rather than running immediately when the surrounding code executes,
is the same **event-driven** concept already named directly in this
project's own Lesson 7 — worth restating in full here, per this project's
own Repetition Rule: code registers *what* should happen and *when*
(which named event), then hands control back, and the browser itself
decides *if and when* to actually invoke it, based on real user action it
alone observes. Also recognized in: C#'s own `+=` event subscription
(`Loaded += MainWindow_Loaded`, this project's own Lesson 5), a doorbell
button wired to a chime, a restaurant's kitchen reacting to an order ticket
rather than cooking food on a fixed schedule, and any GUI framework's own
button-click callback, regardless of language.

### SE Lens

Why give `#show-count` its own separate click handler, rather than somehow
reusing the existing `message` handler's own logic? The alternative not
chosen — cramming both "new data arrived" and "user clicked a button" into
one function — was rejected because those really are two separate
triggers with two separate real causes: one fires because of C# code on
the other side of a process boundary (Lesson 7), the other fires because of
a real person's real mouse click, observed entirely inside the browser
process. Keeping them as two separate handlers, each named for the one
real trigger it responds to, means neither one has to guess *why* it was
called before deciding what to do. The honest cost accepted here: both
handlers now read the same shared, hoisted `tools` variable — if a future
lesson adds a third reader, or a case where `tools` needs to be reset
between messages, every reader has to stay aware they're sharing one piece
of state rather than each owning an independent copy, the same category of
shared-mutable-state reasoning this project's own record-conversion lesson
raised directly, in C#, one lesson ago.

### Run It

No `dotnet build` needed, same reasoning as the previous two units — this
entire lesson only ever touches `local.html`. This project's own standing
constraint (no live WPF window launched in this sandbox, established since
Lesson 5) applies here too: this unit's own new button was not seen
clicked in a real, running window this session. What's verified instead,
directly, is every real API claim in this lesson's own Header —
`jQuery()`'s, `.text()`'s, and `.on()`'s exact documented behavior, each
fetched from jQuery's own official documentation this session, not
reconstructed from memory.

### Connecting Back

`local.html` now reacts to two genuinely different kinds of event through
two genuinely different mechanisms that happen to share one consistent
attachment style — `addEventListener` for the WebView2-injected `message`
event, `.on()` for a real DOM `click` — proving, with this project's own
real code, exactly where jQuery's own convenience reaches and exactly
where this lesson's own first Socratic question predicted it wouldn't.

---

## Connect the Pieces

One concrete trace, start to finish, through everything this lesson built:

1. A new `<script src="https://code.jquery.com/jquery-3.7.1.min.js" ...>`
   tag, added to `<head>`, makes `$`/`jQuery` real, callable functions for
   the first time — proven not by assertion but by naming the exact,
   real `ReferenceError` that would occur before this tag runs (Unit 1).
2. The existing `message` handler's own display logic — unchanged in
   *behavior* since Lesson 7 — was rewritten from `document.getElementById
   ('output').textContent = ...` to `$('#output').text(...)`, one direct
   call replacing two plain-DOM steps, confirmed against jQuery's own real,
   fetched documentation for both `$()` and `.text()` (Unit 2).
3. A real, new `<button id="show-count">`, and a real
   `$('#show-count').on('click', () => { ... })` handler, gave
   `local.html` its first-ever reaction to something a person actually
   does to the page — requiring `tools` to be hoisted from a
   handler-local `const` to a shared `let` so both the `message` handler
   and the new click handler can read the same, most recently received
   data (Unit 3).
4. The same unit directly proved a real boundary: `window.chrome.webview`
   — Lesson 7's own real data channel — is not a DOM element, and jQuery's
   own selector-driven `.on()` was never built to reach it; `addEventListener`
   remains, correctly, the only mechanism that channel ever needed.

**Next lesson:** 11 — DataTables Fundamentals (rendering the full tool
list).
