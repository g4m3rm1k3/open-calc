# Lesson 6: `this`, Binding, and Arrow Functions Inside Methods

**What you will build:** a real bug — a `Counter`'s `increment` method,
extracted and stored in a plain list of callbacks the way an event
system stores handlers, breaking the instant it's actually called
because `this` no longer refers to the `Counter` it came from. This
lesson reproduces that break with a real thrown error, then fixes it
three separate ways: `Function.prototype.bind`, an arrow-function
wrapper at the call site, and an arrow function stored as a class
field. The transferable problem this lesson is actually about: `this`
is never determined by where a method is written — only by how it's
actually called — and every technique in this lesson is a different
way of pinning that down in advance instead of leaving it to chance.

**What you need to know first:** Lesson 1 — `this` resolving to
whatever object a method is called on. Lesson 4 — private class
fields (`#`-prefixed), as a point of contrast against this lesson's
own, differently-scoped class field syntax.

**Terms used in this lesson:**

- **`this` inside a function** — a value bound fresh on every call,
  determined entirely by *how* the function was actually called, never
  by where the function was written or which object's code it appears
  inside. This lesson is the first to build a case where that rule
  produces a real, broken program instead of just explaining how a
  correct call already worked.
- **Own property** — a property that exists directly on an object
  itself, found before any delegation happens. It matters in this
  lesson because one of this lesson's three fixes changes *where* a
  method physically lives — from the shared prototype to the instance
  itself — and this lesson proves that difference directly.
- **Call-site binding** — the rule that determines what `this` actually
  is inside a function body: not fixed at the moment the function is
  defined, but decided fresh, every single time, based on the exact
  expression used to call it. `obj.method()` binds `this` to `obj`;
  calling that same function value with no receiver at all —
  `const fn = obj.method; fn();` — binds `this` to `undefined` (inside
  a `class` body specifically, which this lesson's own proof shows
  always runs in strict mode) rather than to `obj`, even though the
  function's own code never changed. It exists as the underlying reason
  every fix in this lesson works: each one is a different way of
  deciding, once, in advance, what `this` should be, instead of leaving
  that decision to whatever code happens to call the function later.
- **`Function.prototype.bind`** covered below, under Objects and
  methods, since it's a real method rather than a keyword or operator.
- **Arrow function** — a function written with `(...) => {...}` syntax
  instead of the `function` keyword, with one behavioral difference
  from every function this curriculum has used so far that matters
  more than the shorter syntax: an arrow function has no `this` of its
  own at all. Reading `this` inside an arrow function does not use
  call-site binding the way an ordinary function does — it reads
  whatever `this` already was in the surrounding code where the arrow
  function was *written*, permanently, regardless of how the arrow
  function itself later gets called or stored. It exists specifically
  to sidestep call-site binding in situations exactly like this
  lesson's bug, where a function is going to be extracted and called by
  code that has no idea it's supposed to supply a particular `this`.
- **Public class field** — a class member declared directly in a class
  body as `name = value;`, with no `#` prefix, initialized on every new
  instance before the (explicit or implicit) `constructor` body's own
  code runs. It exists to give own-property initialization a place to
  live directly alongside a class's other members, without requiring an
  explicit `constructor` method just to hold one assignment. This
  lesson's own private-field syntax from Lesson 4 (`#count`) restricts
  a field to being reachable only from inside its own class body; a
  public class field, with no `#`, carries no such restriction — it's
  an ordinary, externally-readable own property, initialized through
  class-field syntax rather than through a `this.name = value` line
  inside `constructor`.

**Objects and methods used:**

- **`Function.prototype.bind`**
  - *What it is:* a real instance method every function object has
    (through `Function.prototype`), used to produce a brand-new
    function permanently bound to a specific `this` value, regardless
    of how that new function is later called.
  - *Implementation:* `someFunction.bind(thisArg, ...presetArgs)` — an
    instance method, called on any function value, returning a new
    function value; calling that new function later, however it's
    called, always runs the original function with `this` set to
    `thisArg`, ignoring whatever `this` the new call site would
    otherwise have supplied.
  - *Its use:* this lesson's first fix — producing a version of
    `counter.increment` that keeps working correctly even after being
    extracted into a plain callback list, because its `this` was
    permanently decided at the moment `.bind` was called, not at the
    moment the callback list later invokes it.
  - *Type:* an instance method, available on every function value via
    `Function.prototype`.
  - *Responsibility:* to produce a new function value wrapping the
    original, whose `this` (and, optionally, whose leading arguments)
    are fixed permanently at the time `.bind` is called — it does not
    modify or call the original function itself.
  - *Depends on:* a function to call it on, and the `this` value that
    should be permanently attached.
  - *Connects to:* called once, directly on `counter.increment`, with
    `counter` itself as the argument; its return value — a new,
    separate function — is what actually gets stored in this lesson's
    callback list, not the original method.
  - *Shape:* a public, standard-library method every function
    inherits — general-purpose, applied here to solve the specific
    problem of a detached method call.

---

## Concept Unit: Call-Site Binding — Why an Extracted Method Loses `this`

### The Problem

A `Counter` instance's own `increment` method works correctly every
time it's called as `counter.increment()` — every lesson so far has
relied on exactly that call shape without incident. But event-driven
code — a button's click handler, a timer's callback, anything that
registers a function now to be called later by code that doesn't know
or care what object it "belongs" to — routinely takes just the function
itself, detached from the object, and calls it bare. What happens to
`counter.increment` once it's handed to code like that, with no `.`
in front of it at the moment it's actually invoked?

> **Try this before reading on:** Lesson 1 already established that
> `this` inside a method resolves to whatever object the method is
> *called on* — not the object the method happens to be *defined on*.
> If a method is stored in a plain array — `const listeners = [];
> listeners.push(counter.increment);` — and later invoked as
> `listeners[0]()`, what is actually written to the left of the
> parentheses at the moment it's called? Is there an object there at
> all? Given Lesson 1's own rule, what would you predict `this` ends up
> being inside `increment`'s body at that specific call — and what do
> you think happens next when that body tries to read `this.count`?

### Isolated Example

```js
class Probe {
  check() {
    console.log(this);
  }
}

const p = new Probe();
const bare = p.check;
bare();
```

Run for real, not predicted — what `this` actually is inside a class
method called with no receiver at all is exactly the kind of internal
runtime behavior the Verification Rule requires proof for, not an
assumption carried over from every earlier lesson's correctly-called
examples.

**Real output:**
```
undefined
```

Storing `p.check` in `bare` and calling `bare()` — with nothing to the
left of the parentheses — produces `this === undefined` inside
`check`'s own body. This is not the same as a plain, non-strict
JavaScript function called with no receiver, which would default `this`
to the global object instead; class bodies are always implicitly
strict, and in strict mode, a call with no receiver leaves `this` as
genuinely `undefined`, not silently substituted with anything else.
This confirms **call-site binding** (defined in Terms, above): `check`'s
own code never changed between `p.check()` (which would have worked)
and `bare()` (which didn't) — only the call site did.

This throwaway example is now discarded — `Probe`, `p`, and `bare`
never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** created — `counter-events.js` (new file).
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
class Counter {
  constructor() {
    this.count = 0;
  }

  increment() {
    this.count += 1;
    return this.count;
  }
}

const counter = new Counter();
const listeners = [];
listeners.push(counter.increment);
```

### The Updated Project

```js
 1  class Counter {              // ← new
 2    constructor() {              // ← new
 3      this.count = 0;             // ← new
 4    }                              // ← new
 5
 6    increment() {                  // ← new
 7      this.count += 1;               // ← new
 8      return this.count;              // ← new
 9    }                                  // ← new
10  }                                     // ← new
11
12  const counter = new Counter();       // ← new
13  const listeners = [];                 // ← new
14  listeners.push(counter.increment);     // ← new
```

`counter-events.js` now defines an ordinary `Counter` class, one real
instance of it, and a plain array standing in for the kind of
callback-registration list a real event system keeps internally —
holding, at this point, one bare reference to `increment`, detached
from `counter` entirely.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`class Counter { ... }` (lines 1–10).** The same `class` and
  `constructor` pattern used throughout this curriculum — `this.count =
  0` is an ordinary own-property assignment, and `increment`'s own body
  (`this.count += 1; return this.count;`) is exactly the pattern used
  for `Counter`'s closure-based and private-field versions back in
  Lesson 4, this time with `count` as a fully ordinary, externally
  visible own property rather than hidden behind either of those
  techniques.
- **`const counter = new Counter()` (line 12).** The same `new`
  operator from Lesson 2, run against a `class` constructor exactly as
  Lesson 3 explained — nothing about this line is different from any
  earlier lesson's instance creation.
- **`const listeners = []` (line 13).** An array literal, holding
  nothing yet — a plain, ordinary data structure, chosen deliberately
  instead of any real event-registration API, so this lesson's own bug
  is reproducible with only tools already covered, without depending on
  a browser or any API this curriculum hasn't reached yet.
- **`listeners.push(counter.increment)` (line 14).** `counter.increment`
  here is a **property access expression with nothing calling it** —
  reading the value of `increment` off `counter` (found, per
  delegation, on `Counter.prototype`, the same placement Lesson 3
  proved for every class method) without invoking it, the same way
  `counter.count` would read a value without calling anything. That
  value — a plain function — is what gets pushed into the array.
  Nothing about this line runs `increment`'s own code yet, and nothing
  about it preserves any information about which object `increment`
  was originally read from.

### CS Lens

The underlying idea here — a function's behavior depending on *how* it
was invoked, not on where its code lives — is sometimes called
**dynamic `this` binding** or **late binding of the receiver**, and it
sits in direct contrast with languages where a method is permanently,
lexically tied to the instance it belongs to the moment it's defined.

```
Also recognized in: Python's own explicit `self` parameter, which
makes the same underlying receiver-passing mechanism visible in
every method signature instead of leaving it implicit the way
JavaScript does, a C function pointer that's just an address with
no memory of which struct instance it was originally pulled from, a
detached DOM event handler passed as a bare function reference to
`addEventListener` — the exact real-world shape of the bug this
lesson's own `listeners` array is standing in for
```

### SE Lens

The alternative not chosen here — and the reason this bug exists at
all — is that JavaScript could have made methods permanently
self-binding, the way some other object-oriented languages effectively
do, at the cost of every method call carrying overhead to check and
enforce that binding. JavaScript's actual design keeps `this` fully
dynamic and decided purely by the call site, which is a real
capability, not just a footgun: it's exactly what lets one function —
`Array.prototype.forEach`'s own callback mechanism, or any generic
utility function — operate correctly against whatever object calls it,
without that function needing to be rewritten per object. The real cost
is precisely this lesson's own bug: any code that extracts a method
from its object — intentionally, to pass it somewhere as a callback —
has to take on the responsibility of preserving `this` itself, because
nothing in the language does it automatically. This lesson's next three
units are three different ways of taking on that responsibility, each
with its own tradeoff.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node counter-events.js`; no build step or package has been
introduced.

### Run It

```js
try {
  listeners.forEach(fn => fn());
} catch (e) {
  console.log(e.constructor.name + ": " + e.message);
}
```

**Real output:**
```
TypeError: Cannot read properties of undefined (reading 'count')
```

`listeners.forEach(fn => fn())` calls the stored `increment` reference
exactly the way the isolated lab's `bare()` did — with nothing to the
left of the parentheses. Per this unit's own proof, `this` inside that
call is `undefined`; `this.count += 1` then tries to read a `count`
property off `undefined`, which is not a value that has properties at
all, producing this real, thrown `TypeError` rather than silently doing
nothing.

### Connecting to what came before

This unit reproduces, as a genuine break rather than a description, the
exact call-site-dependence Lesson 1 first explained as the reason
`describe()` correctly reached `circle`'s own data — the same rule,
run here in the one direction it was never previously exercised, where
the call site supplies no receiver at all. The next unit fixes this
specific break using `Function.prototype.bind`.

---

## Concept Unit: Fixing It with `Function.prototype.bind`

### The Problem

`counter.increment` needs to keep working correctly even after being
stored in `listeners` and called later, detached, with no receiver at
the call site. Nothing about *when* it gets called can be controlled —
that's the entire point of a callback list — so the fix has to happen
earlier, at the moment the reference is created, before it's ever
handed off.

> **Try this before reading on:** if `this`'s value is decided by the
> call site, and you can't control what the call site looks like once
> a function has been handed off to other code, what would it mean to
> "pre-decide" `this` before that handoff happens at all — to produce a
> version of `increment` that already knows, permanently, which object
> it belongs to, no matter how it's later called? What would such a
> tool need as its input, beyond the original function itself?

### Isolated Example

```js
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}

const person = { name: "Ann" };
const bound = greet.bind(person);
console.log(bound("Hi"));
```

Run for real — whether `.bind`'s returned function actually ignores
its own call site's receiver in favor of the one fixed at bind-time is
exactly the kind of behavioral claim the Verification Rule requires
proof for.

**Real output:**
```
Hi, Ann
```

`bound` is called here with no receiver at all — `bound("Hi")`, nothing
to its left — the identical detached call shape that broke `increment`
in the previous unit. Yet `this.name` still correctly resolves to
`"Ann"`. This proves `.bind(person)` permanently attached `person` as
`greet`'s `this`, at the moment `.bind` was called, completely
independent of how `bound` itself is later invoked.

This throwaway example is now discarded — `greet`, `person`, and
`bound` never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `counter-events.js`.
- **Change type:** replace (line 14's `push` call).
- **Location:** replacing the single `listeners.push(counter.increment)`
  line from the previous Concept Unit; everything above it in the file
  is unchanged.
- **Dependencies:** the `Counter` class and `counter` instance from the
  previous Concept Unit in this same lesson must already exist.

### The New Code

```js
listeners.push(counter.increment.bind(counter));
```

### The Updated Project

```js
 1  class Counter {
 2    constructor() {
 3      this.count = 0;
 4    }
 5
 6    increment() {
 7      this.count += 1;
 8      return this.count;
 9    }
10  }
11
12  const counter = new Counter();
13  const listeners = [];
14  listeners.push(counter.increment.bind(counter));   // ← changed
```

`counter-events.js`'s registration line now stores a *different*
function value than before — not `increment` itself, but a new function
`.bind` produced, permanently carrying `counter` as its `this` — while
every other line, including `Counter`'s own definition, is untouched.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block:

- **`counter.increment` (part of line 14).** The same property-access
  expression as before — reading the function value off `counter`,
  found through delegation on `Counter.prototype`, without calling it.
- **`.bind(counter)` (part of line 14).** `Function.prototype.bind`
  (full CRC treatment in the header, above), called on that function
  value, with `counter` itself passed as the argument that becomes the
  permanent `this`. The return value is a brand-new function — not
  `increment` itself, a separate function value that internally wraps
  it — which is what actually gets passed to `listeners.push`.

### CS Lens

This is sometimes called **partial application of the receiver** — using
`.bind` to lock in one specific piece of a function's eventual call
(here, `this`, rather than an ordinary argument) ahead of time, so the
code that performs the actual call later doesn't need to know or supply
it.

```
Also recognized in: currying in functional programming (fixing one
argument of a multi-argument function ahead of time, producing a
new function expecting only the rest), a database connection pool
handing out a connection object pre-configured with a specific
schema so calling code never has to specify it per query, a
UI framework's `bindActionCreators`-style utilities doing exactly
this same `.bind` pattern at scale across many handlers at once
```

### SE Lens

The alternative not chosen here is what the previous unit's bug
actually did — hand off the raw, unbound method and hope the calling
code happens to invoke it in a way that preserves `this`, which is
exactly the assumption that broke. `.bind`'s real advantage is that it
works on *any* existing function, including ones you don't control the
definition of — it's a call-site-side fix, applicable after the fact.
Its real cost: every `.bind` call allocates a brand-new function object,
separate from the original — calling `.bind` on the same method
repeatedly (once per registration, say, in a loop) produces a different
function value each time, which matters if that reference later needs
to be found again and removed from a listener list; `.bind`'s returned
function is `===`-different from both the original method and from any
other call to `.bind` against the same method, a real debt this
technique alone doesn't resolve.

### Commands Needed

None yet — runnable directly via `node counter-events.js`.

### Run It

```js
listeners.forEach(fn => fn());
listeners.forEach(fn => fn());
console.log(counter.count);
```

**Real output:**
```
2
```

Both calls now succeed with no error — `this` inside `increment` is
`counter` on both calls, exactly as it would have been had `increment`
been called directly as `counter.increment()`, even though the actual
call site, inside `forEach`, still supplies no receiver at all.

### Connecting to what came before

`.bind` fixes the previous unit's break by pre-deciding `this` at
registration time rather than leaving it to the call site — the next
unit reaches the identical result through a completely different
mechanism: an arrow function, which never had call-site-dependent
`this` in the first place.

---

## Concept Unit: Fixing It with an Arrow Function at the Call Site

### The Problem

`.bind` solves the problem by producing a new, permanently-bound
function ahead of time. A different, and in some codebases more common,
fix doesn't touch `increment` or its binding at all — it changes *what*
actually gets registered: not `increment` itself, but a small wrapper
function that, when called, calls `counter.increment()` the ordinary,
correctly-bound way.

> **Try this before reading on:** if the actual registered callback
> were instead a brand-new, tiny function — one whose entire body is
> just `counter.increment()`, written as a normal method call, with
> `counter` visible directly in the surrounding code where this new
> function is defined — would that new function's own `this` matter at
> all to whether `increment` runs correctly? What is actually being
> called at the call site now, and is it still `increment` itself, or
> something else entirely that merely calls `increment` on `counter`'s
> behalf?

### Isolated Example

```js
const person = {
  name: "Ann",
  regularGreet: function () {
    return function () {
      return this === globalThis
        ? "regular: this is the global object, not person"
        : "regular: this is something else";
    };
  },
  arrowGreet: function () {
    return () => `arrow: this.name is ${this.name}`;
  }
};

const regular = person.regularGreet();
const arrow = person.arrowGreet();
console.log(regular());
console.log(arrow());
```

Run for real — whether an arrow function actually ignores call-site
binding entirely, in favor of whatever `this` was in its surrounding
code at the moment it was defined, is exactly the kind of behavioral
claim the Verification Rule requires proof for.

**Real output:**
```
regular: this is the global object, not person
arrow: this.name is Ann
```

`regularGreet` returns an ordinary `function`, called later with no
receiver — per **call-site binding**, its own `this` ends up the global
object, completely disconnected from `person`, the object it was
*defined inside of*. `arrowGreet` returns an **arrow function**
(defined in Terms, above) instead — called the exact same detached way,
with nothing to its left at the call site — and its `this.name` still
correctly reports `"Ann"`. The arrow function never performed call-site
binding at all; it simply reused whatever `this` already was in
`arrowGreet`'s own body at the moment the arrow function was written —
which was `person`, because `arrowGreet` itself was called as
`person.arrowGreet()`, an ordinary, correctly-bound call.

This throwaway example is now discarded — `person`, `regular`, and
`arrow` never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `counter-events.js`.
- **Change type:** replace (line 14).
- **Location:** replacing the `.bind`-based registration line from the
  previous Concept Unit.
- **Dependencies:** the `Counter` class and `counter` instance from the
  first Concept Unit in this lesson must already exist.

### The New Code

```js
listeners.push(() => counter.increment());
```

### The Updated Project

```js
 1  class Counter {
 2    constructor() {
 3      this.count = 0;
 4    }
 5
 6    increment() {
 7      this.count += 1;
 8      return this.count;
 9    }
10  }
11
12  const counter = new Counter();
13  const listeners = [];
14  listeners.push(() => counter.increment());   // ← changed
```

`counter-events.js`'s registration line now stores neither `increment`
itself nor a `.bind`-produced copy of it, but a brand-new arrow
function whose entire body performs an ordinary, correctly-receiver'd
call to `counter.increment()` — the array's contents changed shape
again, while `Counter`'s own definition remains completely untouched.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block:

- **`() => counter.increment()` (part of line 14).** An **arrow
  function** (defined in Terms, above) taking no parameters, with a
  single expression as its body: a call to `counter.increment()`. This
  arrow function itself has no `this` of its own at all — but nothing
  inside its body reads `this`, so that fact doesn't come into play
  here the way it did in the isolated lab; what matters is only that
  the *inner* call, `counter.increment()`, is written as an ordinary
  method call, with `counter` named explicitly, which per **call-site
  binding** correctly sets `this` to `counter` regardless of how the
  outer arrow function itself gets invoked later.
- **`counter.increment()` (inside the arrow function's body).** An
  ordinary method call — the exact call shape every earlier lesson has
  used successfully — invoked from *inside* the arrow function's body
  at the moment that arrow function is finally called, not at the
  moment it was registered.

### CS Lens

This technique is sometimes called a **thunk** — a small, deliberately
deferred wrapper function whose entire job is to package up "the actual
call to make, later," so that the code holding the wrapper never has to
know the details (here, which object, or what arguments) of the real
call underneath it.

```
Also recognized in: a lazy-evaluation language deferring a
computation behind a small callable wrapper until its result is
actually needed, a UI framework's `onClick={() => doSomething(id)}`
pattern for passing a per-item argument into a shared handler, a
build tool's deferred task definition, where `() => runTests()` is
registered now but its body doesn't execute until the task runner
actually invokes it later
```

### SE Lens

The alternative not chosen here is the previous unit's `.bind`. Both
fixes solve the identical problem; the real, practical tradeoff between
them is what each one costs to write and read at the call site. `.bind`
requires no extra function nesting — `counter.increment.bind(counter)`
is a single expression built directly from the method itself. The
arrow-wrapper version requires writing out the call by hand
(`() => counter.increment()`), which becomes the natural place to also
pass extra arguments the original callback signature didn't anticipate
(`() => counter.increment(someExtraArg)`), something `.bind` can also
do (via its own extra arguments) but less readably once more than one
is involved. Neither fixes the `.bind`-side identity cost named in the
previous unit's own SE Lens — this wrapper is *also* a brand-new
function value, `===`-different from `increment` itself and from any
other arrow wrapper written around the same call, carrying the
identical downside for removal from a listener list later.

### Commands Needed

None yet — runnable directly via `node counter-events.js`.

### Run It

```js
listeners.forEach(fn => fn());
listeners.forEach(fn => fn());
console.log(counter.count);
```

**Real output:**
```
2
```

The identical correct result as the `.bind` version — two increments
successfully applied to `counter.count` — reached through a completely
different mechanism: not a pre-bound copy of `increment` itself, but a
small wrapper that performs a correctly-bound call each time it runs.

### Connecting to what came before

Where `.bind` fixed the problem by producing a permanently-bound copy
of `increment` itself, this unit's arrow wrapper never touches
`increment`'s own binding at all — it sidesteps the entire problem by
making sure the actual call to `increment` is always written as an
ordinary, correctly-receiver'd method call, deferred until later. The
next unit applies the same arrow-function property — no binding of its
own — directly inside the class itself, removing the need for any
wrapper at the registration site at all.

---

## Concept Unit: Fixing It at the Source with a Class Field Arrow Function

### The Problem

Both fixes so far repair the problem at the *registration* site —
`.bind`, or an arrow wrapper, both applied at the moment `increment` (or
a call to it) gets handed to `listeners`. Every future place that needs
a correctly-bound reference to `increment` would need to repeat one of
those two fixes again, by hand, at each new call site. Is there a way
to make `increment` itself simply never lose its binding in the first
place, no matter how or where it's later extracted?

> **Try this before reading on:** an arrow function's `this` is
> whatever `this` already was in the code where it was written, not
> where it's later called. If an arrow function were written directly
> inside a class body — not as a method, but as the *value* of a
> **public class field** — at the exact moment that field is
> initialized for a given instance (which Lesson 4's `#`-prefixed
> version already showed happens once, per instance, as part of
> construction), what would `this` already be, right there, at the
> point that arrow function is being created? Would that make every
> future extraction of that specific field automatically safe, without
> needing a `.bind` or a wrapper at each new call site?

### Isolated Example

```js
class Counter {
  count = 0;
  increment = () => {
    this.count += 1;
    return this.count;
  };
  decrementRegular() {
    this.count -= 1;
    return this.count;
  }
}

const a = new Counter();
const b = new Counter();
console.log(a.increment === b.increment);
console.log(a.decrementRegular === b.decrementRegular);
```

Run for real — whether a class-field arrow function ends up as one
shared function (like an ordinary method) or a separate function per
instance is exactly the kind of internal-structure claim the
Verification Rule requires proof for, and it directly affects whether
this fix has a real cost worth naming.

**Real output:**
```
false
true
```

`a.increment === b.increment` is `false` — two different `Counter`
instances have two genuinely different `increment` function values,
each one created fresh during that specific instance's own
construction, with `this` already fixed to that specific instance at
creation time — the arrow function's own lexical-`this` rule, applied
inside a class body. `a.decrementRegular === b.decrementRegular` is
`true` — an ordinary method, per Lesson 3's own proof, is placed once
on `Counter.prototype` and shared by every instance through delegation,
the same as always. This is the concrete tradeoff this technique
carries: safety from the call-site problem, at the cost of one separate
function object per instance instead of one shared function for the
whole class.

This throwaway example is now discarded — this exact `Counter`, `a`,
and `b` never appear in the project again (the real project's own
`Counter`, built next, keeps `count` as a public field for a different,
unrelated reason: to remain directly comparable to this unit's own
proof).

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `counter-events.js`.
- **Change type:** refactor (`Counter`'s own `increment` method becomes
  a class field) plus replace (the registration line reverts to storing
  the method reference directly, since it no longer needs a wrapper).
- **Location:** the entire `Counter` class body, and the registration
  line, both from the first Concept Unit in this lesson.
- **Dependencies:** none beyond what already exists in the file.

### The New Code

```js
class Counter {
  count = 0;

  increment = () => {
    this.count += 1;
    return this.count;
  };
}
```

### The Updated Project

```js
 1  class Counter {              // ← changed
 2    count = 0;                  // ← changed
 3
 4    increment = () => {          // ← changed
 5      this.count += 1;            // ← changed
 6      return this.count;           // ← changed
 7    };                              // ← changed
 8  }
 9
10  const counter = new Counter();
11  const listeners = [];
12  listeners.push(counter.increment);   // ← changed
```

`counter-events.js`'s `Counter` class no longer has an explicit
`constructor` method or an ordinary `increment` method — `count` is now
a public class field initialized directly to `0`, and `increment` is
now a public class field too, whose value happens to be an arrow
function rather than a plain number. The registration line goes back to
storing `counter.increment` directly, with no `.bind` and no wrapper,
because the fix now lives inside `Counter` itself.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block:

- **`count = 0;` (line 2).** A **public class field** (defined in Terms,
  above) — no `#`, meaning `count` remains an ordinary, externally
  readable own property, exactly as it always has been in this lesson;
  what's different from every earlier `Counter` in this curriculum is
  only that there's no explicit `constructor` method performing this
  assignment — the class-field syntax performs it automatically, once
  per instance, before any other class-body code runs for that
  instance.
- **`increment = () => { this.count += 1; return this.count; };`
  (lines 4–7).** The same **public class field** syntax, this time with
  an **arrow function** (defined in Terms, above) as its value instead
  of a number. Because this initializer runs once per instance, at
  construction time, the arrow function it creates is a brand-new
  function object for *that* instance specifically — and because it's
  an arrow function, its `this` is permanently whatever `this` already
  was at the exact moment it was created, which, during that instance's
  own construction, is that same instance. `this.count += 1` inside it
  is the same compound-assignment mechanism used throughout this
  lesson, now guaranteed to always find the right `count`, no matter
  how `increment` itself is later extracted or called.

### CS Lens

This is the same **encapsulation of correctness** idea running through
several of this curriculum's earlier lessons — moving a guarantee from
"every caller must remember to do this correctly" (Lesson 2's manual
constructor stealing, this lesson's earlier `.bind`-at-registration
fix) into "the object itself makes the mistake impossible" (Lesson 3's
`class`/`extends` doing chaining automatically, this unit's binding
happening automatically at construction).

```
Also recognized in: a config object that validates and normalizes
its own fields the moment it's constructed, rather than trusting
every piece of code that reads those fields to validate them
correctly each time, a UI framework's official style guide for
class components specifically recommending arrow-function class
fields for event handlers for this exact reason, immutable value
objects in general, which prevent an entire category of
external-mutation bugs by making the mistake structurally
impossible rather than merely discouraged
```

### SE Lens

The alternative not chosen here is either of this lesson's earlier two
fixes, both of which repair the problem once per registration site
rather than once per class. This technique's real advantage: write
`increment` this way exactly once, inside `Counter` itself, and every
future piece of code anywhere in the program that extracts
`counter.increment` — whether this lesson's own `listeners` array, a
real event system's `addEventListener`, or code not yet written — gets
a correctly-bound function automatically, with no fix required at the
call site at all. The real, proven cost: this unit's own isolated lab
showed `a.increment !== b.increment` — unlike an ordinary method, which
Lesson 3 proved lives once on the shared prototype, a class-field arrow
function is a separate function object per instance, allocated freshly
on every single `new Counter()` call. For a class with only a handful
of instances, that cost is negligible; for a class instantiated by the
thousands, it's a real, measurable memory cost the two call-site fixes
from earlier in this lesson never carried, because both of those left
`increment` itself as a single, ordinary, prototype-shared method and
only ever created extra function objects at the specific registration
sites that actually needed one.

### Commands Needed

None yet — runnable directly via `node counter-events.js`.

### Run It

```js
listeners.forEach(fn => fn());
listeners.forEach(fn => fn());
console.log(counter.count);
console.log(counter.hasOwnProperty("increment"));
console.log(counter.hasOwnProperty("count"));
```

**Real output:**
```
2
true
true
```

The same correct result as both earlier fixes — two increments
successfully applied — this time with `counter.increment` pushed
directly into `listeners`, no `.bind`, no wrapper. `hasOwnProperty`
confirms this unit's own claim directly on the real project code:
both `increment` and `count` are genuine own properties of `counter`
itself, not reached through delegation to `Counter.prototype` the way
an ordinary method would be — the concrete, verified shape of this
fix's real memory tradeoff.

### Connecting to what came before

This unit moves the exact fix the previous two units applied at each
registration site directly into `Counter`'s own definition, trading a
per-instance memory cost — proven directly, not assumed — for a
guarantee that holds automatically everywhere `increment` is ever
extracted, present or future.

---

## Connect the Pieces

One value, traced across all three fixes: the number stored in
`counter.count`, starting at `0`. In the `.bind` version, calling the
registered callback runs the *original* `increment` function, but with
`this` permanently pre-set to `counter` at the moment `.bind` was
called — `this.count += 1` finds the right object because `.bind`
decided that in advance. In the arrow-wrapper version, calling the
registered callback runs a small, freshly-written function whose entire
job is to make one ordinary, correctly-bound call,
`counter.increment()` — `this.count += 1` finds the right object
because the call itself, at the moment it finally runs, is written the
normal way. In the class-field version, calling the registered callback
runs an arrow function that was created once, back when `counter` was
first constructed, whose `this` was permanently fixed at that exact
moment to `counter` itself — `this.count += 1` finds the right object
because the function never had any other `this` available to it, ever,
from the instant it was created. Three different points in the
program's lifetime — bind-time, call-time, and construction-time —
each one a different moment to permanently answer the same question
call-site binding would otherwise leave open every single time.

## What's Next

This closes Module A. The next module turns from JavaScript's own
object model to the DOM itself — starting with traversal, live versus
static collections, and the first real use of `addEventListener`, the
exact API this lesson's own `listeners` array was standing in for all
along.
