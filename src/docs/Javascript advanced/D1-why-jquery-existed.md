# Lesson 16: Why jQuery Existed, and What `$(...)` Actually Is

**What you will build:** a small, standalone comparison — not an
addition to the to-do app itself, since this lesson's whole subject is
comparative rather than feature-building — proving, against jQuery
4.0.0's own real, current source, exactly what `$(...)` returns, why it
can be called without `new` and still behave like a genuine
constructed object, why the result supports chaining, and, closing the
lesson, an honest, direct map from jQuery's own most common methods to
the vanilla DOM tools this curriculum has already built, natively,
since Module B.

**What you need to know first:** Lesson 1 — `Object.create`,
prototype, prototype chain, and delegation; jQuery's own real source,
read directly in this lesson, turns out to use exactly this same
manual-prototype-linking technique. Lesson 2 — constructor functions
and the `new` operator's own four-step algorithm; `$(...)`'s own real
implementation calls `new` internally, on a different function than
the one actually written in your own code, which only makes sense
against that four-step algorithm already being second nature. Lesson
7 — `querySelectorAll`, and `NodeList` as a real, array-like but
non-`Array` object; jQuery's own wrapped set turns out to be built on
exactly the same distinction.

**Terms used in this lesson:**

- **Prototype** — every JavaScript object has an internal link to
  another object, called its prototype, letting objects share behavior
  without each carrying its own copy of every method. It matters here
  because jQuery's own real, current source manually wires this link
  by hand, using the identical technique Lesson 2 already taught.
- **The `new` operator** — a keyword that, applied to a function call,
  automatically creates a new object, links its prototype to the
  called function's own `.prototype` property, runs the function with
  `this` bound to that new object, and returns it. It matters here
  because `$(...)`'s own real source calls `new` internally, on a
  function your own code never directly names.
- **Array-like object** — an object with a real, numeric `length`
  property and index-accessible values (`obj[0]`, `obj[1]`, and so on),
  behaving similarly to a real `Array` for reading purposes, without
  actually being one — `Array.isArray` on such an object reports
  `false`, and it lacks `Array.prototype`'s own methods unless
  something has deliberately added them. It matters here because
  Lesson 7's own `NodeList` already proved this exact category, and
  jQuery's own wrapped set turns out to be a second, independent
  example of the identical shape.

**Objects and methods used:**

- **`jQuery` (`$`)**
  - *What it is:* a real, third-party JavaScript library — not part of
    the Web platform itself, unlike everything else covered so far in
    this curriculum — providing one function, conventionally aliased to
    `$`, that queries the DOM and returns a wrapped set of matched
    elements with its own large collection of convenience methods
    attached.
  - *Implementation:* `$(selector)` — called as an ordinary function
    call, with no `new` required in your own code — internally
    constructs and returns a real object (covered in full in this
    lesson's first Concept Unit) representing every element matching
    `selector`, found via the same kind of query `document
    .querySelectorAll` already performs natively.
  - *Its use:* this lesson's whole subject — understanding exactly what
    this one function actually returns, and why it behaves the way it
    does, before this curriculum's next two lessons build on top of it.
  - *Type:* a real, third-party library function — loaded from a
    separate file or package, not a Web-platform built-in the way
    every other class or method this curriculum has covered has been.
  - *Responsibility:* to locate elements matching a selector (or wrap
    an already-existing element or set of elements) and return them
    packaged inside a real jQuery object, ready for that object's own
    further methods to be called on the result.
  - *Depends on:* a selector string, an existing DOM element, or
    another jQuery object, depending on how it's called.
  - *Connects to:* called directly in this lesson's own code; its
    return value is inspected directly, and, in this lesson's second
    Concept Unit, chained against directly.
  - *Shape:* a public, third-party library API — the single
    best-known JavaScript library in the web's own history, still
    genuinely present in a very large share of existing production
    code, which is exactly why understanding it matters even in a
    curriculum that otherwise favors native APIs.

---

## Concept Unit: The Problem jQuery Was Built to Solve

### The Problem

Every DOM technique this curriculum has built since Module B —
`querySelectorAll`, `addEventListener`, `classList`, `closest` — is
described, today, by one shared, standard specification that every
current browser implements consistently. That wasn't always true. In
the mid-2000s, when jQuery was first released, browsers implemented
genuinely different, incompatible versions of basic DOM operations —
not minor edge-case differences, but fundamentally different APIs for
the same task.

> **Try this before reading on:** if two different browsers offered two
> completely different ways to attach an event listener — one using a
> method resembling today's `addEventListener`, the other using an
> entirely different method with a different name and different
> argument order, with no third, universal option available at all —
> what would a website's own code have to do, concretely, to work
> correctly in both browsers at once? Would you expect that code to get
> simpler or more repetitive as more such inconsistencies piled up
> across dozens of different DOM operations — and what kind of tool
> would you reach for to avoid writing that same detection-and-branch
> logic separately, by hand, at every single place in a codebase that
> needed to touch the DOM at all?

### What Was Actually True Then

This reflects real, historical, settled fact rather than a claim about
current browser behavior, and is stated with that distinction in mind.
In the specific period jQuery was created, the most consequential
single inconsistency was event handling: one major browser of the era
used a method named `attachEvent`, with a different argument order and
different `this`-binding behavior than the `addEventListener` method
this curriculum has used since Lesson 8 — code supporting both had to
detect which one was available and branch accordingly, for literally
every single listener attached anywhere on a page. Querying the DOM had
similar splits: `document.querySelectorAll`, the very first tool this
curriculum built on in Module B, didn't exist at all in some
still-widely-used browsers of that era; developers fell back to slower,
more verbose, manual tree-walking to find elements matching anything
more specific than a tag name or an `id`. jQuery's own original,
explicit purpose was collapsing all of that browser-specific
detection-and-branching logic into one, single, consistent API —
`$(...)` for querying, one shared way to attach listeners, one shared
way to read and write styles and attributes — so that application code
never had to know or care which specific browser it was actually
running in.

### Project Change

This unit makes no code change of its own — it establishes the real
historical motivation the rest of this lesson, and the two lessons
after it, build directly on.

### CS Lens

This is a **compatibility shim**, generalized to cover an entire
platform's worth of inconsistent APIs at once rather than one single
function.

```
Also recognized in: a database driver library exposing one
consistent query interface over genuinely different underlying
database engines, a graphics library like OpenGL providing one API
that different graphics card vendors each implement according to
their own, sometimes inconsistent, real hardware, a shipping
company's own unified tracking API, hiding the fact that a package's
actual journey might involve several genuinely different carriers,
each with their own separate, incompatible systems underneath
```

### SE Lens

The alternative jQuery's original authors didn't choose was writing
the same browser-detection-and-branching logic separately, by hand, at
every point in a codebase that touched the DOM — genuinely how a
meaningful share of real code from that era was written, since no
shared solution yet existed. That approach's only real advantage was
that it required no additional library at all. Its real, well-documented
cost was exactly what this unit's own Problem named: the same
detection logic repeated, inconsistently, across an entire codebase,
with no single place to fix a browser-specific bug once discovered.
jQuery's own real cost, worth naming honestly rather than treating
jQuery as simply obsolete: every one of this curriculum's own Module B
lessons has shown a native API doing what jQuery's own equivalent
method already did — but that native convergence is itself a genuinely
recent, hard-won outcome; jQuery's own historical value, at the time it
mattered most, is not diminished by the platform later catching up to
solve the same problem natively.

---

## Concept Unit: `$(...)` as a Self-Instantiating Factory, and the Wrapped Set

### The Problem

`$(".todo-item")`, called with no `new` anywhere in sight, somehow
still behaves like a real, constructed object — it has its own methods,
its own real identity, and, as this unit proves directly, genuinely
reports `true` for `instanceof jQuery`. Lesson 2's own `new` operator,
by contrast, required writing `new` explicitly, every time, for exactly
this kind of behavior to happen at all. Something about `$`'s own
internal implementation must be doing that `new` on your behalf — the
real question is what, and how.

> **Try this before reading on:** Lesson 2 proved that `new SomeFunction
> (...)`, run against an ordinary function, performs four automatic
> steps — among them, calling that function with `this` bound to a
> freshly created object, itself linked to `SomeFunction.prototype`.
> If `$`'s own real body, written by its own authors, contained a
> `return new SomethingElse(...)` line — calling `new` internally, on a
> *different* function than `$` itself — would the object that
> ultimately comes back out of `$(...)` still be a genuine,
> `new`-constructed object, even though your own code never wrote `new`
> anywhere at all? What would that internal function's own `.prototype`
> need to be set to, for `instanceof jQuery` to still report `true`
> against an object actually built by a completely different
> constructor function under the hood?

### Isolated Example

This lesson's isolated examples run jQuery 4.0.0 — the current version
as of this session, loaded for real — against the same real,
standards-compliant DOM implementation used throughout this curriculum.

```js
const items = $(".todo-item");
console.log("items.length:", items.length);
console.log("items instanceof $:", items instanceof $);
console.log("Array.isArray(items):", Array.isArray(items));
console.log("items[0] instanceof Element:", items[0] instanceof Element);
console.log("$.fn === $.prototype:", $.fn === $.prototype);
```

Run against a page with two `.todo-item` elements. Run for real, not
predicted — exactly what kind of object `$(...)` returns, and whether
it's a genuine `Array` or only array-*like*, is precisely the kind of
claim the Verification Rule requires proof for, not an assumption
carried over from `NodeList`'s own already-proven shape.

**Real output:**
```
items.length: 2
items instanceof $: true
Array.isArray(items): false
items[0] instanceof Element: true
$.fn === $.prototype: true
```

`items.length` confirms this behaves like Lesson 7's own live and
static collections — a real, numeric count. `items instanceof $`
confirms the returned object genuinely is a jQuery instance, despite no
`new` appearing anywhere in this code. `Array.isArray(items)` reports
`false` — jQuery's own wrapped set is an **array-like object** (defined
in Terms, above), the identical category `NodeList` already belonged
to, not a real `Array`. `items[0] instanceof Element` confirms the
wrapped set holds genuine DOM elements at its numeric indices, exactly
as `querySelectorAll`'s own `NodeList` does. `$.fn === $.prototype`
confirms something worth investigating directly: jQuery's own methods
(`.addClass`, `.text()`, and every other method this lesson goes on to
use) live on an object literally named `$.fn` — and that object turns
out to be the exact same object as `$.prototype` itself.

**Proof from jQuery's own real, current source, read this session** —
`node_modules/jquery/dist/jquery.js`, lines 122–128:

```js
jQuery = function( selector, context ) {

	// The jQuery object is actually just the init constructor 'enhanced'
	// Need init if jQuery is called (just allow error to be thrown if not included)
	return new jQuery.fn.init( selector, context );
};
```

`$` itself — the function your own code calls — is not a constructor
function in the sense Lesson 2 taught at all; it's an ordinary function
whose entire body is one line, calling `new` internally on a
*different* function, `jQuery.fn.init`, and returning whatever that
produces. This is exactly the Socratic prompt's own question, answered
directly from the real source: your code never writes `new`, but `$`'s
own code does, on your behalf, every single time.

The second half of the puzzle — why the resulting object reports
`instanceof jQuery` as `true`, given that it was actually built by
`jQuery.fn.init`, a completely different function — is answered by two
more real lines from the same file, lines 2604 and 2705:

```js
init = jQuery.fn.init = function( selector, context ) {
	// ...
};
```
```js
// Give the init function the jQuery prototype for later instantiation
init.prototype = jQuery.fn;
```

This is the identical technique Lesson 2 taught by hand for `Circle`
and `Shape`: `init.prototype = jQuery.fn` manually links `init`'s own
`.prototype` to the same object `jQuery.fn` (and, per this unit's own
first proof, `jQuery.prototype` itself) already points to. Per Lesson
2's own four-step `new` algorithm, `new jQuery.fn.init(...)` links its
new object's prototype to `init.prototype` — which, because of this
one line, is the exact same object as `jQuery.prototype` — and
`instanceof` checks exactly that: whether an object's own prototype
chain reaches the constructor's `.prototype`. It does, because both
constructors were deliberately wired to share the identical prototype
object.

This throwaway example is now discarded — but every fact it proved
about `$(...)`'s real behavior applies unchanged to every further use
of jQuery in this lesson and the two after it.

### Project Change

- **Reference Source:** `node_modules/jquery/dist/jquery.js`, lines
  122–128 (the `jQuery` factory function itself), line 2604 (`jQuery.fn
  .init`'s own definition), and line 2705 (`init.prototype = jQuery.fn`)
  — jQuery 4.0.0, the current version as of this session, read
  directly from the real, installed package rather than recalled from
  memory or a secondhand summary.
- **Files affected:** created — `jquery-exploration.js` (new,
  standalone file; this lesson does not modify the to-do app itself,
  since its own subject is comparative understanding of a library, not
  a new application feature).
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** the jQuery library itself, loaded into the page.

### The New Code

```js
const items = $(".todo-item");
console.log(items.length, items instanceof $, Array.isArray(items));
```

### The Updated Project

`jquery-exploration.js`:
```
1  const items = $(".todo-item");                                          // ← new
2  console.log(items.length, items instanceof $, Array.isArray(items));      // ← new
```

This file exists purely to inspect what `$(...)` actually returns — a
deliberately minimal starting point this lesson's remaining units build
directly on top of.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`$(".todo-item")` (line 1).** `jQuery` (full CRC treatment in the
  header, above), called as an ordinary function — per this unit's own
  proof from the real source, this single call secretly performs a
  `new` internally, against `jQuery.fn.init`, not against `$` itself.
- **`items.length` (line 2).** An ordinary property read, the same
  shape as `NodeList.length` from Lesson 7 — a real, numeric count of
  matched elements.
- **`items instanceof $` (line 2).** The `instanceof` operator, already
  familiar from earlier lessons, here proven — via this unit's own
  reading of the real source — to succeed specifically because of the
  manual `init.prototype = jQuery.fn` linkage, not because `$` itself
  was ever called with `new` anywhere in this code.
- **`Array.isArray(items)` (line 2).** A real, standard method,
  reporting whether its argument is a genuine `Array` — `false` here,
  confirming the **array-like object** category (defined in Terms,
  above) applies to jQuery's own wrapped set exactly as it already did
  to `NodeList`.

### CS Lens

`init.prototype = jQuery.fn` is a real, production example of the
**self-instantiating factory function** pattern — a function callable
without `new` that still produces a genuine, prototype-linked instance,
by performing the `new` internally, against a different function whose
`.prototype` has been deliberately pointed at the same shared object
the outer function's own users expect `instanceof` to check against.

```
Also recognized in: Python's own `list()` and `dict()` built-ins,
callable without any special keyword yet still producing genuine
instances of their respective types, a database ORM's model
class exposing a plain factory function (`User.create(...)`) that
internally performs the equivalent of `new User(...)` on the
caller's behalf, a UI framework's `createElement`-style API,
letting component authors avoid `new` entirely while the framework
itself still constructs real, fully-featured internal objects
```

### SE Lens

The alternative jQuery's own authors didn't choose is requiring every
user of the library to write `new $(...)` explicitly, the ordinary way
Lesson 2 taught. That alternative's real advantage: it would have been
simpler to implement, requiring none of this unit's own
`init.prototype` indirection. Its real cost, and the reason jQuery's
authors chose otherwise: `new`, per Lesson 6's own call-site-binding
material, is easy to forget — a developer writing `$(...)` without
`new`, if `$` had been an ordinary constructor function relying on
`this` the plain way, would have silently produced a broken object
(exactly the same class of bug Lesson 2's own constructor functions
were always vulnerable to), with no error at all in older, non-strict
JavaScript. Making `$` work correctly either way — the actual, real
design choice, proven directly from the source above — removes that
entire failure mode for every one of jQuery's own users, at the cost of
the extra indirection this unit's own source-reading had to untangle.

### Commands Needed

None beyond including jQuery itself — for a real page, a `<script
src="https://code.jquery.com/jquery-4.0.0.js"></script>` tag (or an
equivalent local copy) loaded before any code that calls `$`.

### Run It

```js
console.log(items.length, items instanceof $, Array.isArray(items));
```

**Real output:**
```
2 true false
```

The same three facts already proven in this unit's own isolated
example, now against the project's own tracked file.

### Connecting to what came before

This unit answered, with real, current source rather than received
wisdom, exactly what `$(...)` returns and why it behaves like a
constructed object without `new` ever appearing in your own code — and
did so entirely by applying Lesson 1 and Lesson 2's own prototype and
`new` material to code neither of those lessons ever showed you
directly. The next unit turns to what jQuery's own methods actually do
once called on that returned object, and why so many of them can be
chained one after another.

---

## Concept Unit: Chaining, and an Honest Map to What You Already Know

### The Problem

Vanilla code that needs to add a class to every matched element and
then also change their color needs two separate statements — one call
to whatever adds the class, one to whatever sets the style — each
operating on the same underlying collection. jQuery code commonly
writes both as one single, connected expression instead. What makes
that possible, and is there a real cost to it?

> **Try this before reading on:** if a method, instead of returning
> some specific computed value, deliberately returned the exact same
> object it was called on — `this`, plain and simple — what would that
> let a caller do immediately afterward with that return value, given
> that it's the identical wrapped set the method itself was just called
> on? What kind of method would *not* want to do this — one whose whole
> job is answering a specific question (like `.length`, or a check like
> `Array.isArray`) rather than performing an action on every matched
> element?

### Isolated Example

```js
const result = $(".todo-item").addClass("highlighted").css("color", "blue");
console.log("result instanceof $:", result instanceof $);
console.log("result === $('.todo-item') (a fresh, separate query):", result === $(".todo-item"));
console.log("first item's real outerHTML:", $(".todo-item")[0].outerHTML);
```

Run for real — whether a chained call genuinely returns something
usable for a further chained call, and what the DOM actually looks like
afterward, are exactly the kind of claims the Verification Rule
requires proof for.

**Real output:**
```
result instanceof $: true
result === $('.todo-item') (a fresh, separate query): false
first item's real outerHTML: <li class="todo-item highlighted" style="color: blue;">Buy milk</li>
```

`.addClass("highlighted")` and `.css("color", "blue")` both ran, in
sequence, on the same wrapped set, with no intermediate variable
needed — `result instanceof $` confirms the chain's own final return
value is still a genuine jQuery object, capable of further chaining
itself. `result === $(".todo-item")` is `false` — a reminder that a
fresh call to `$(...)` always builds a brand-new wrapped set, never the
same object as an earlier one, even when it matches the identical
elements; chaining works because each method in the chain returns the
*same* object the previous one was called on, not because `$(...)`
itself is somehow cached or reused. The real markup, inspected
directly via `outerHTML`, confirms both changes actually landed on the
real element.

This throwaway example is now discarded — this specific chain never
appears in the project again.

### Project Change

- **Reference Source:** `node_modules/jquery/dist/jquery.js`, the same
  file already read in the previous Concept Unit — jQuery's own
  `addClass` and `css` methods, like nearly every method that mutates
  rather than reads, both end their own real implementation by
  returning `this`, the exact mechanism this unit's own isolated
  example demonstrates the effect of.
- **Files affected:** modified — `jquery-exploration.js`.
- **Change type:** add.
- **Location:** appended after the previous Concept Unit's own two
  lines.
- **Dependencies:** the `items` variable from the previous Concept
  Unit.

### The New Code

```js
items.addClass("highlighted").css("color", "blue");
```

### The Updated Project

`jquery-exploration.js`:
```
1  const items = $(".todo-item");
2  console.log(items.length, items instanceof $, Array.isArray(items));
3
4  items.addClass("highlighted").css("color", "blue");   // ← new
```

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code, in order:

- **`items.addClass("highlighted")` (line 4).** A real jQuery instance
  method, adding the class `"highlighted"` to every element in the
  wrapped set at once — a single call operating on however many
  elements `items` actually holds, unlike the vanilla equivalent
  (`items.forEach(el => el.classList.add(...))`, which this curriculum
  has already written by hand since Lesson 8) requiring an explicit
  loop.
- **`.css("color", "blue")` (chained onto the same line).** A second
  jQuery instance method, called directly on `addClass`'s own return
  value — legal, and immediately chainable, specifically because
  `addClass` returns `this`, per this unit's own Reference Source.

### CS Lens

This is the **fluent interface** pattern — designing a set of methods
specifically so that each one returns an object capable of continuing
the same chain, letting a sequence of operations read as one connected
expression rather than a series of separate statements each repeating
a reference to the same underlying object.

```
Also recognized in: a SQL query builder library chaining `.where
(...).orderBy(...).limit(...)` into one expression instead of
separate statements each reassigning a query variable, a test
assertion library chaining `.expect(x).to.be.greaterThan(5).and.
lessThan(10)`, a string-building utility chaining `.append(...)
.append(...).toString()` rather than reassigning an intermediate
variable at every step
```

### SE Lens

The alternative not chosen here, for a method like `addClass`, would be
returning nothing meaningful (`undefined`), the same as many ordinary
functions in this curriculum that perform an action without needing to
hand anything back. That alternative's real advantage: it makes
explicit, at each step, that a method was called for its side effect,
not its return value — arguably clearer about intent. Its real cost is
exactly what this unit's own isolated example demonstrates avoiding: a
sequence of several operations on the same collection would require
either re-querying `$(".todo-item")` fresh before every single call
(wasteful, and, as this lesson's own header entry for `$` notes,
genuinely re-searches the DOM every time) or storing an intermediate
variable and reusing it at every step. Chaining's own real cost, worth
naming: a long chain can be genuinely harder to debug than the
equivalent separate statements, since there's no natural place to set a
breakpoint or log an intermediate value between two chained calls
without breaking the chain apart first — the same real tradeoff that
led modern JavaScript style, broadly, away from long jQuery-style
chains and toward the kind of explicit, step-by-step vanilla code this
curriculum's own Module B has built throughout.

### Commands Needed

None beyond jQuery being loaded, as in the previous unit.

### Run It

```js
console.log($(".todo-item").hasClass("highlighted"));
console.log($(".todo-item").css("color"));
```

**Real output:**
```
true
rgb(0, 0, 255)
```

Both changes from the chained call persisted on the real page — a
fresh query for `.highlighted` confirms the class landed, and reading
the `color` style back (converted by the browser to its own canonical
`rgb(...)` representation, rather than echoing back the literal string
`"blue"` that was set) confirms the style landed too.

### An Honest Map to What This Curriculum Already Built

Every jQuery method demonstrated across this lesson has a direct,
already-covered vanilla equivalent — not a hypothetical one, but code
this curriculum has already written, working, and verified:

- **`$(selector)`** — `document.querySelectorAll(selector)` (Lesson 7),
  wrapped in the understanding that the result is array-like, not a
  real `Array`, exactly like jQuery's own wrapped set.
- **`.addClass(name)` / `.removeClass(name)`** —
  `element.classList.add(name)` / `.remove(name)`, used directly inside
  this curriculum's own delegated handlers since Module B; `classList`
  itself is a real, standard Web-platform API, not something this
  curriculum invented as a substitute.
- **`.css(property, value)`** — `element.style.property = value`,
  ordinary property assignment on an element's own `style` object,
  used as far back as Lesson 9's own `createTodoElement`-adjacent code.
- **`.text()`** — `element.textContent`, used throughout this
  curriculum since Lesson 7.
- **`.html()`** — `element.innerHTML`, deliberately avoided as a
  *writing* mechanism throughout this curriculum's own Lesson 13, for
  exactly the same pasted-content-safety reasons proven there.
- **`.on(event, handler)`** — `element.addEventListener(event,
  handler)`, from Lesson 8 — covered directly, with jQuery's own
  version of event delegation specifically, in this curriculum's very
  next lesson.

None of this is intended to suggest jQuery's own methods are poorly
designed — this unit's own SE Lens, and the previous unit's, both
argued the opposite, on real historical grounds. It's simply an honest
accounting of which specific problems this curriculum had already
solved, natively, before this lesson ever introduced jQuery at all.

### Connecting to what came before

This unit proved chaining works because of one deliberate, real design
choice — `this` returned from methods whose job is a side effect, not a
value — and closed by mapping every jQuery method this lesson actually
used back to this curriculum's own already-built, native equivalent.

---

## Connect the Pieces

One call, followed through everything this lesson proved: `$(".todo-item")`.
Reading `$`'s own real source, line 128, shows it's a single-line
function whose entire body is `return new jQuery.fn.init(selector,
context)` — `new`, called internally, on `jQuery.fn.init`, not on `$`
itself. Line 2705's `init.prototype = jQuery.fn` — the identical manual
prototype-linking technique Lesson 2 taught by hand for `Circle` and
`Shape` — is what makes the object that call actually produces report
`instanceof jQuery` as `true`, despite your own code never writing
`new` anywhere. That object, once built, is array-like — a real
`length`, real indexed access to genuine DOM elements, proven not to
be a true `Array` — the identical shape Lesson 7 already proved for
`NodeList`. Calling `.addClass("highlighted")` on it runs jQuery's own
internal loop over every matched element, then returns that exact same
wrapped-set object — `this` — letting `.css("color", "blue")` chain
directly onto it, reaching the real page in one connected expression
instead of two separate statements. And every one of those three
behaviors — the construction trick, the array-like wrapped set, the
`this`-returning chain — traces back to material this curriculum had
already built, natively or conceptually, well before this lesson ever
loaded jQuery for the first time.

## What's Next

Lesson 17 turns to jQuery's own `.on()` method and its own, built-in
version of event delegation — directly comparable, method for method,
against Lesson 8's own hand-built delegated click handler.
