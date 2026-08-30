# Lesson 4: Encapsulation — Closures vs. Private Fields (`#`)

**What you will build:** a `Counter` with genuinely private internal
state, built two different ways — once as a closure-based factory
function, with no `class` involved at all, and once as a `class` using
the `#`-prefixed private-field syntax. Both versions expose the same
three operations (`increment`, `decrement`, `value`) and hide the same
underlying number. The transferable problem this lesson is actually
about: every version of `Circle` built across the last three lessons
left `radius` completely exposed — any code holding a reference to an
instance could read or overwrite it directly, bypassing `area()`
entirely. This lesson builds the first two real techniques for
preventing that, and proves, for each one, exactly what is and isn't
actually hidden — not just described as hidden.

**What you need to know first:** Lesson 1 — `this`, own property.
Lesson 3 — `class`, the `constructor` method.

**Terms used in this lesson:**

- **`this` inside a function** — a value bound fresh on every call,
  determined by *how* the function was called, not where it was
  written. It exists so one function body, defined once, can operate on
  whichever object it's actually invoked on.
- **Own property** — a property that exists directly on an object
  itself, found at the very first step of a property lookup. It matters
  in this lesson because it's exactly what this lesson's proofs check
  for: whether a piece of supposedly-private data shows up as a
  property of the object at all.
- **`class`** — a declaration that packages a constructor function and
  a set of shared, prototype-level methods into one syntactic block. It
  matters here because this lesson's second technique, private fields,
  is only available inside a `class` body — there is no equivalent
  syntax for a plain object literal or a plain constructor function.
- **The `constructor` method** — the specially-named method inside a
  `class` body that becomes the function `new` actually runs when
  building an instance. It matters here because it's where this
  lesson's private field gets its own starting value assigned.
- **Function scope** — the region of code where a variable declared
  inside a function (with `let`, `const`, or `var`) is actually visible.
  A variable declared inside a function's body cannot be read or
  written by any code outside that function — not by accident, not by
  any special syntax. It exists so a function can keep its own local
  bookkeeping without that bookkeeping leaking into, or being
  overwritten by, whatever code called it or sits alongside it.
  Function scope alone is not new to this lesson conceptually — you
  already know a variable declared inside one function can't be read by
  a sibling function sitting next to it — but this lesson is the first
  to build on it deliberately, as a hiding mechanism.
- **Closure** — a function that continues to have access to the
  variables from the scope it was originally defined in, even after
  that outer scope has already finished running and would otherwise be
  gone. It exists to let a function carry private, persistent state of
  its own — state that lives *only* in that captured scope, reachable
  only through the function(s) that closed over it — without needing an
  object, a class, or any external mechanism to hold that state.
- **Private class field (`#` syntax)** — a data field declared inside a
  `class` body with a name prefixed by `#` (for example, `#count`).
  Code outside that exact class's own body cannot read, write, or even
  *reference* a `#`-prefixed name belonging to it — this is enforced by
  the language itself, at the level of what the parser will accept, not
  left to convention or a runtime check that could be worked around. It
  exists to give `class`-based code a hiding mechanism with a guarantee
  closures don't naturally provide inside a class body: private state
  that's still organized as a normal-looking field, directly alongside
  the class's own methods, rather than requiring a separate enclosing
  function.
- **Encapsulation** — the software engineering principle of bundling
  data together with the methods that operate on it, and restricting
  access to that data so external code can only interact with it
  through those methods, never directly. It exists to let an object (or
  a closure) protect its own internal consistency — a `Counter`'s
  `count`, for instance, should only ever change by exactly `1` at a
  time, and encapsulation is what makes it possible to *guarantee* that
  from outside, rather than merely hope external code plays along.

**Objects and methods used:**

- **`Object.keys`**
  - *What it is:* a built-in static function that lists the names of an
    object's own, enumerable string-keyed properties.
  - *Implementation:* `Object.keys(obj)` — a `static` function taking
    one object and returning a plain array of strings, one per
    qualifying own property.
  - *Its use:* this lesson's central proof tool for the closure-based
    `Counter` — used to show that the object returned by the
    closure-based factory function only actually contains the three
    exposed methods, with no property at all corresponding to `count`.
  - *Type:* a `static` function on the `Object` global.
  - *Responsibility:* strictly read-only inspection, listing exactly
    the own, enumerable string-keyed property names of the object it's
    given — nothing about the object's prototype chain, and nothing
    about non-enumerable or symbol-keyed properties.
  - *Depends on:* a single object to inspect.
  - *Connects to:* called directly on this lesson's closure-based
    `counter` value, with its result logged and inspected for the
    presence or absence of a `count` entry.
  - *Shape:* a public, standard-library inspection API, used here as
    proof rather than description, per this schema's own
    demystification standard.
- **`Object.getOwnPropertyNames`**
  - *What it is:* a built-in static function that lists the names of
    *all* of an object's own string-keyed properties, including
    non-enumerable ones — a stricter, more exhaustive version of the
    same idea as `Object.keys`.
  - *Implementation:* `Object.getOwnPropertyNames(obj)` — a `static`
    function taking one object and returning a plain array of every own
    string-keyed property name, regardless of whether each one is
    enumerable.
  - *Its use:* this lesson's proof tool for the `#`-field-based
    `Counter` specifically, because `Object.keys` alone leaves open the
    question of whether `#count` might still exist as a *non-enumerable*
    own property that simply doesn't show up in `Object.keys`'s more
    limited listing; this method closes that gap by checking
    exhaustively.
  - *Type:* a `static` function on the `Object` global.
  - *Responsibility:* strictly read-only inspection, exhaustively
    listing every own string-keyed property name an object has, with no
    filtering by enumerability.
  - *Depends on:* a single object to inspect.
  - *Connects to:* called on this lesson's `#`-field `Counter` instance,
    with its result compared against `Object.keys`'s result on the same
    instance to show they agree — neither lists `#count` at all.
  - *Shape:* a public, standard-library inspection API — deliberately
    the more exhaustive of the two tools this lesson uses, chosen
    specifically because the private-field claim needs the stronger
    check.

---

## Concept Unit: Hiding State with a Closure

### The Problem

Every version of `Circle` built so far stores `radius` as a plain own
property — `circle.radius` is directly readable and directly
overwritable by any code holding a reference to the instance, with
nothing preventing `circle.radius = -999` from silently corrupting
whatever `area()` computes next. A `Counter` with the same problem would
be worse in a different way: its whole *purpose* is that `count` only
ever changes by exactly one, via `increment`/`decrement` — direct
outside access to `count` would defeat the object's entire reason for
existing, not just risk a bad value.

> **Try this before reading on:** you already know that a variable
> declared with `let` inside one function's body can't be read by code
> outside that function — you've relied on that every time you've
> written two separate functions that don't interfere with each other.
> Given only that fact, if a function declared a local variable and
> then *returned another function from inside itself* — one that reads
> or changes that local variable — what do you think happens to that
> local variable once the outer function has already finished running
> and returned? Does it get thrown away, the way you might expect an
> ordinary local variable to be, or does something have to keep it
> alive for the returned function to still use it?

### Isolated Example

```js
function outer() {
  let secret = "hidden";
  function inner() {
    return secret;
  }
  return inner;
}

const revealSecret = outer();
console.log(revealSecret());
console.log(typeof secret);
```

Run for real, not predicted — whether a local variable actually
survives after the function that declared it has already returned is
exactly the kind of claim about invisible runtime behavior the
Verification Rule requires proof for, not an assumption carried over
from ordinary function-scope reasoning.

**Real output:**
```
hidden
undefined
```

`revealSecret()` — called well after `outer()` has already finished
running and returned — still produces `"hidden"`. `outer()`'s own
`secret` variable was not thrown away when `outer()` returned, the way
an ordinary local variable normally would be, because `inner` still
references it. `typeof secret`, evaluated in the surrounding code
outside either function, reports `undefined` — proving `secret` is not
merely difficult to reach from outside, it genuinely doesn't exist as
any kind of accessible name out there at all. This — a function
retaining access to variables from the scope it was defined in, even
after that scope has finished executing — is called a **closure**.

This throwaway example is now discarded — `outer`, `inner`, and
`revealSecret` never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, introducing a new project separate from the shape hierarchy
  built across the last three lessons, because encapsulation is best
  taught against a small, single-purpose example rather than layered
  onto `Shape`/`Circle`.
- **Files affected:** created — `counter-closure.js` (new file).
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
function createCounter() {
  let count = 0;
  return {
    increment() {
      count += 1;
      return count;
    },
    decrement() {
      count -= 1;
      return count;
    },
    value() {
      return count;
    }
  };
}
```

### The Updated Project

```js
 1  function createCounter() {   // ← new
 2    let count = 0;              // ← new
 3    return {                     // ← new
 4      increment() {               // ← new
 5        count += 1;                // ← new
 6        return count;               // ← new
 7      },                             // ← new
 8      decrement() {                  // ← new
 9        count -= 1;                   // ← new
10        return count;                  // ← new
11      },                                // ← new
12      value() {                          // ← new
13        return count;                     // ← new
14      }                                    // ← new
15    };                                      // ← new
16  }                                          // ← new
```

`counter-closure.js` now defines one function, `createCounter`, whose
entire job is to build and return a fresh object exposing exactly three
methods, each one of them a closure sharing access to the same single
`count` variable — a variable that exists only inside `createCounter`'s
own scope and is never itself part of the returned object.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`function createCounter() { ... }` (lines 1–16).** An ordinary
  function declaration — not a constructor function in the sense of
  Lesson 2 (it's never called with `new`, and it doesn't rely on `this`
  at all); its entire job is to run once per call and build a fresh,
  independent object each time.
- **`let count = 0` (line 2).** An ordinary local variable declaration,
  scoped to `createCounter`'s own function body per **function scope**
  (defined in Terms, above) — under that rule alone, `count` would
  simply cease to be reachable the moment `createCounter` finishes
  running. What changes that outcome is entirely the three methods
  below, each one referencing `count` directly.
- **The returned object literal `{ increment() {...}, decrement()
  {...}, value() {...} }` (lines 3–15).** Ordinary object-literal
  syntax with method shorthand, the same construct used for `shape` in
  Lesson 1 — three methods, each one a function value, stored as own
  properties of one freshly-built object.
- **`count += 1` inside `increment` (line 5), `count -= 1` inside
  `decrement` (line 9), and `return count` inside all three methods
  (lines 6, 10, 13).** Each of these three method bodies references the
  exact same `count` variable declared on line 2 — not a copy, not a
  separately-scoped variable per method, the identical binding. This is
  the concrete mechanism behind the term **closure**: because each of
  these three function bodies was defined lexically inside
  `createCounter`, each one closes over `createCounter`'s own local
  scope, and all three end up sharing access to that one `count`
  variable rather than each capturing its own independent copy.
  `count += 1` and `count -= 1` are ordinary compound-assignment
  operators, already familiar from your existing background,
  reassigning that one shared variable's value.

### CS Lens

This is the **closure** mechanism, named as a computational concept in
its own right — a function paired permanently with the environment
(the set of variable bindings) it was created in, so that calling the
function later still has access to that environment even though the
code that originally created it has already finished running.

```
Also recognized in: a partially-applied function in functional
programming (a function pre-loaded with some of its arguments,
"remembering" them for every future call), an event handler
registered with a loop variable it needs to remember after the
loop itself has ended, a generator function in Python or JavaScript
resuming exactly where it left off because its local state was
never actually discarded between calls
```

### SE Lens

The alternative not chosen here is exactly what every version of
`Circle` has done so far: store the data as a plain, directly
accessible own property (`this.radius = radius`), with no attempt to
hide it. That approach's real advantage is simplicity — no extra
function nesting, no indirection between "the data" and "the code that
reads it." Its real cost, which this lesson's `Counter` is specifically
designed to make painful, is that nothing stops external code from
reaching in and corrupting the data directly, silently, with no
opportunity for the object itself to reject or validate the change. The
closure-based approach trades that simplicity for a real guarantee:
`count` can only ever be reached through `increment`, `decrement`, or
`value`, because those are the only three functions that were ever
defined inside `createCounter`'s own scope. The debt this specific
technique carries: because the hiding mechanism is an ordinary function
scope rather than any dedicated privacy syntax, nothing about reading
`createCounter`'s code signals "this variable is intentionally private"
the way a keyword would — a reader has to recognize the pattern (local
variable, closed over by returned methods, never itself returned) to
know hiding was the actual intent, rather than being told so directly
by the syntax itself.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node counter-closure.js`; no build step or package has been
introduced.

### Run It

```js
const counter = createCounter();
counter.increment();
counter.increment();
console.log(counter.value());
console.log(counter.count);
console.log(Object.keys(counter));
```

**Real output:**
```
2
undefined
[ 'increment', 'decrement', 'value' ]
```

`counter.value()` reports `2`, proving two real calls to `increment`
actually mutated the shared, closed-over `count` variable, not two
independent, disconnected copies of it. `counter.count` is `undefined`
— there is no property named `count` on the returned object at all;
`count` was never put there, it stayed inside `createCounter`'s own
scope the entire time. `Object.keys(counter)` (full CRC treatment in
the header, above) confirms this exhaustively: the object's own
property names are exactly the three exposed methods, with nothing
corresponding to the hidden state anywhere in the list.

### Connecting to what came before

This unit's `Counter` reuses the exact function-scope rule you already
relied on in every earlier lesson — a local variable not being visible
outside its own function — and gets real hiding out of it for free,
simply by defining the exposing methods *inside* that same scope
instead of outside it. The next unit builds the identical
`increment`/`decrement`/`value` interface a second time, this time
inside a `class`, using a dedicated privacy syntax instead of relying
on function scope at all.

---

## Concept Unit: Hiding State with a Private Class Field

### The Problem

The closure-based `Counter` works, but it isn't a `class` — it can't
be built with `new`, it has no `constructor` method, and none of
Lesson 3's `class`/`extends`/`super` machinery applies to it at all.
Every real `class`-based object built across Lessons 1 through 3 has
stored its data as a plain, exposed own property, because nothing about
`class` syntax on its own provides a hiding mechanism equivalent to
what the previous unit's function scope naturally gave a closure.

> **Try this before reading on:** the previous unit's hiding trick
> depended entirely on `count` being declared *outside* the methods
> that use it, in an enclosing function scope those methods close over.
> A `class` body's own fields, by contrast, are normally declared
> directly on the instance itself (`this.name = name`, as every
> `Shape`/`Circle` version has done) — there's no separate enclosing
> function scope for a class's own data to hide inside. Given that,
> what kind of solution do you think a language would need to add if it
> wanted class-based data to be hidden the same way — a way to reuse
> the existing closure trick somehow, or a genuinely new piece of
> syntax with its own rule enforced directly by the language?

### Isolated Example

```js
class Box {
  #contents = "empty";
  fill(value) {
    this.#contents = value;
  }
  peek() {
    return this.#contents;
  }
}

const b = new Box();
b.fill("treasure");
console.log(b.peek());
console.log(b.contents);
console.log(Object.keys(b));
```

Run for real — whether a `#`-prefixed field actually shows up as an own
property under any standard inspection is exactly the kind of internal
structure claim the Verification Rule requires proof for, not a
description of what the syntax is *supposed* to do.

**Real output:**
```
treasure
undefined
[]
```

`b.peek()` proves `fill` and `peek` both reached the same private
field. `b.contents` (no `#`) is `undefined` — there is no ordinary
property by that name at all; `#contents` and `contents` are not the
same name with different visibility, they are entirely different
identifiers, and only `#contents` was ever declared. `Object.keys(b)`
returns an empty array — `#contents` doesn't merely fail to show up
under the property name `contents`, it doesn't show up under any name,
because private fields are excluded from ordinary property enumeration
entirely. This is the **private class field** syntax, and the `#`
itself is not a naming convention or a style hint — it's part of the
identifier's actual name, permanently baked into how the field must be
written wherever it's used.

**A second run, proving what happens if code outside the class tries
to reference `#contents` directly** — not by reading a wrong value,
but by attempting to write the reference at all:

```js
class Box2 {
  #contents = "empty";
}

const b2 = new Box2();
console.log(b2.#contents);
```

**Real output (this file fails to run at all):**
```
SyntaxError: Private field '#contents' must be declared in an enclosing class
```

This is not a runtime error
caught after the code started running — it's a parse-time failure. The
file never executes a single line, because `b2.#contents` outside
`Box2`'s own class body isn't valid JavaScript syntax at all, the same
way writing `2 +` with nothing after it wouldn't be. This is a stronger
guarantee than the previous unit's closure ever made: a closure's
`count` is unreachable because no reference to it was ever exposed, but
nothing in the language itself would reject an attempt to write
`counter.count` — it simply evaluates to `undefined`. A `#`-prefixed
reference outside its own class, by contrast, cannot even be written
down in syntactically valid code in the first place.

This throwaway example is now discarded — `Box`, `Box2`, `b`, and `b2`
never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** created — `counter-class.js` (new file). This
  deliberately does not modify `counter-closure.js`; both versions stay
  independently comparable.
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
class Counter {
  #count = 0;

  increment() {
    this.#count += 1;
    return this.#count;
  }

  decrement() {
    this.#count -= 1;
    return this.#count;
  }

  value() {
    return this.#count;
  }
}
```

### The Updated Project

```js
 1  class Counter {              // ← new
 2    #count = 0;                 // ← new
 3
 4    increment() {                // ← new
 5      this.#count += 1;           // ← new
 6      return this.#count;          // ← new
 7    }                               // ← new
 8
 9    decrement() {                   // ← new
10      this.#count -= 1;              // ← new
11      return this.#count;             // ← new
12    }                                  // ← new
13
14    value() {                          // ← new
15      return this.#count;               // ← new
16    }                                    // ← new
17  }                                      // ← new
```

`counter-class.js` now defines one `class`, `Counter`, whose entire
private state is a single field, `#count`, declared directly in the
class body and readable or writable only from methods that are
themselves part of that same class body — the same three-method public
interface as the closure-based version, built on a completely different
hiding mechanism underneath.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`class Counter { ... }` (lines 1–17).** The same **`class`**
  declaration from Lesson 3 — a block packaging a constructor (implicit
  here, since none is written explicitly) and a set of methods placed
  automatically onto `Counter.prototype`, exactly as `Shape` and
  `Circle` did.
- **`#count = 0` (line 2).** A **private class field** declaration
  (defined in full in Terms, above) — a class field, syntactically
  distinct from an ordinary field, whose name is permanently `#count`,
  not `count`. The `= 0` initializes it to `0` on every new instance,
  running as part of the (here implicit) construction process, the same
  timing `this.name = name` would run at inside an explicit
  `constructor` method in earlier lessons.
- **`this.#count += 1` inside `increment` (line 5) and `this.#count -=
  1` inside `decrement` (line 10).** `this` resolves exactly as it
  always has — to whatever `Counter` instance the method is actually
  called on. `.#count` accesses the private field on that specific
  instance; this access is only legal because `increment` and
  `decrement` are themselves defined inside `Counter`'s own class body
  — the exact restriction this unit's second isolated-lab run proved by
  triggering the opposite case. `+=` and `-=` are the same
  compound-assignment operators used in the previous unit's closure
  version, here reassigning the private field instead of a closed-over
  variable.
- **`return this.#count` (lines 6, 11, 15).** The same `this.#count`
  access pattern, this time reading rather than writing — `value`'s
  entire body is exactly this one line, exposing the current private
  value without exposing any way to set it arbitrarily (there is no
  method here that would let external code jump `#count` directly to,
  say, `1000000` — only `increment`/`decrement`, one step at a time,
  which is the actual point of hiding it in the first place).

### CS Lens

This is still **encapsulation**, the same principle named in this
lesson's own Terms — but where the previous unit achieved it by
repurposing an existing, general-purpose mechanism (function scope) for
a hiding effect, private fields are a dedicated, purpose-built language
feature whose *only* job is enforcing exactly this restriction.

```
Also recognized in: a database's column-level access grants
restricting which stored procedures may read a sensitive column
directly, an operating system's memory protection preventing one
process from reading another process's private memory pages
regardless of intent, a compiled language's `private` access
modifier being checked and enforced by the compiler itself rather
than by convention
```

### SE Lens

The alternative not chosen here is the previous unit's closure
technique, reused inside a `class`-like wrapper (which is possible, but
awkward — it would mean abandoning `class` entirely and going back to a
factory function, losing `new`, `constructor`, and everything Lesson 3
built). Private fields' real advantage: the hiding guarantee is
enforced by the parser itself, provably stronger than the closure
version, as this unit's own `SyntaxError` proved — there is no way to
even attempt an illegal external access, whereas a closure's hidden
variable is unreachable only because no reference to it happens to be
exposed, a guarantee resting on the author never accidentally exposing
one (returning `count` itself from some future method added carelessly
would break it silently, with no error at all). The real cost: private
fields only exist inside `class` bodies — the closure technique from
the previous unit works anywhere a function can be written, with no
dependency on `class` syntax at all, which matters directly for any
code in this curriculum's future lessons that needs private state
without wanting a class's other machinery (a constructor, a prototype
chain, `new`) at all.

### Commands Needed

None yet — private field syntax requires no separate build step in a
current JavaScript runtime; this lesson's code runs directly via
`node counter-class.js` or in a current browser's console.

### Run It

```js
const c2 = new Counter();
c2.increment();
c2.increment();
console.log(c2.value());
console.log(c2.count);
console.log(Object.keys(c2));
console.log(Object.getOwnPropertyNames(c2));
```

**Real output:**
```
2
undefined
[]
[]
```

`c2.value()` reports `2`, the identical result the closure-based
version produced from the same two `increment()` calls — proving both
techniques genuinely track the same kind of state correctly. `c2.count`
is `undefined`, for the same reason `b2.contents` was in the isolated
lab: `count` and `#count` are different names, and only the second was
ever declared. `Object.keys(c2)` returns an empty array — weaker proof
alone, since `Object.keys` only reports *enumerable* properties, and a
private field might in principle have been excluded from enumeration
while still existing as some other kind of own property.
`Object.getOwnPropertyNames(c2)` (full CRC treatment in the header,
above) closes that gap: it lists every own property regardless of
enumerability, and it also returns empty — `#count` does not exist as
an own property of `c2` under any name or any visibility setting that
standard reflection can see at all.

### Connecting to what came before

This unit rebuilds the previous unit's exact `Counter` interface —
same three methods, same underlying number, same guarantee that
external code can't reach it — but replaces function scope with a
dedicated, parser-enforced privacy mechanism, and this unit's own
`SyntaxError` proof showed that guarantee is strictly stronger, not
just differently spelled.

---

## Connect the Pieces

One value, traced start to finish through the `#`-field version: the
private field `#count`, declared on line 2 as `0`. The first call to
`increment()` runs `this.#count += 1` — legal only because `increment`
is written inside `Counter`'s own class body — bringing the hidden
value to `1`; a second call brings it to `2`. Calling `value()` reads
`this.#count` back out, returning `2` to the caller — the only path any
outside code ever had to that number, since no method on `Counter`
ever returns `this` itself or otherwise exposes the field directly. An
attempt to reach `#count` from anywhere outside `Counter`'s own body —
proven directly in this unit's second isolated lab — doesn't produce a
wrong answer or a runtime error to catch; it fails before the program
can even start running, which is the strongest form of hiding either
technique in this lesson achieved.

## What's Next

Lesson A5 turns from hiding data to a different structural question:
every hierarchy built so far has used inheritance (`extends`) to share
behavior between `Shape` and `Circle`, and inheritance chains built this
way tend to grow brittle as more shapes are added. Lesson A5 refactors
a deep, breaking inheritance chain into composed behaviors instead —
small, independent pieces mixed together — with a concrete scene
showing exactly how and why the inheritance version broke first.
