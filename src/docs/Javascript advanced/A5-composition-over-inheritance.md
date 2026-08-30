# Lesson 5: Composition Over Inheritance

**What you will build:** a small animal hierarchy that starts out
exactly the way every hierarchy in this curriculum has been built so
far — `Animal` → `Bird` → `FlyingBird`, and separately `Animal` → `Fish`
→ `SwimmingFish` — and then genuinely breaks the moment a new
requirement arrives: a `Duck`, which needs to both fly and swim. This
lesson proves, with a real thrown error, exactly why single-inheritance
`extends` cannot solve that requirement at all, then refactors the
entire hierarchy away from deep inheritance chains and onto small,
independent, combinable behaviors instead — the technique called
composition.

**What you need to know first:** Lesson 1 — prototype, prototype
chain, delegation, own property, `this`. Lesson 3 — `class`, `extends`,
the `constructor` method.

**Terms used in this lesson:**

- **Prototype** — every JavaScript object has an internal link to
  another object (or to `null`), called its prototype. It exists so
  objects can share behavior without each object carrying its own copy
  of every method.
- **Prototype chain** — the sequence of linked prototypes a property
  lookup walks through: object → its prototype → that prototype's own
  prototype → ... → `null`.
- **Delegation** — the algorithm the engine runs on every `obj.prop`
  read: check `obj` itself first, then its prototype, and so on up the
  chain, returning `undefined` only once the chain ends.
- **Own property** — a property that exists directly on the object
  itself, found before any delegation happens. It matters in this
  lesson because it's what this lesson's own proof checks: whether a
  method added through composition ends up copied onto every instance,
  or shared through delegation the same way inherited methods are.
- **`this` inside a function** — a value bound fresh on every call,
  determined by how the function was called, not where it was written.
  It matters in this lesson because the whole composition technique
  depends on a mixin's own methods still correctly resolving `this` to
  whichever object they eventually get attached to, not to the mixin
  object itself.
- **`class`** and **`extends`** — a `class` declaration packages a
  constructor and shared, prototype-level methods into one block;
  `extends`, in a `class` declaration's header, automatically links a
  new class's `.prototype` to a parent class's `.prototype`. Both
  matter in this lesson because this lesson's central problem is a real
  restriction on `extends` specifically: a `class` declaration accepts
  exactly one expression after `extends`, never more than one.
- **Mixin** — a plain object holding one or more reusable methods,
  intended to be copied onto some other object (commonly a class's
  `.prototype`) to add behavior, without establishing any inheritance
  relationship between the mixin and whatever it's added to. It exists
  to let unrelated classes share a specific piece of behavior — flying,
  say — without forcing every class that can fly to sit on the same
  inheritance branch, which is exactly the constraint this lesson's
  `Duck` problem runs into.
- **Composition (over inheritance)** — the software engineering
  principle of building an object's full behavior by combining several
  small, independent, focused pieces, rather than expressing every
  shared capability as a single "is-a" relationship through an
  inheritance chain. It exists because real-world capabilities
  (flying, swimming, barking, fetching) don't naturally arrange
  themselves into one strict tree the way "every `Circle` is a
  `Shape`" does — an animal can fly and swim at once, but a class can
  only `extends` one thing.

**Objects and methods used:**

- **`Object.assign`**
  - *What it is:* a built-in static function that copies the own,
    enumerable properties of one or more source objects onto a target
    object.
  - *Implementation:* `Object.assign(target, ...sources)` — a `static`
    function taking a target object first, followed by any number of
    source objects; it copies each source's own enumerable properties
    onto the target, later sources overwriting earlier ones on any
    naming collision, and returns the same target object it was given.
  - *Its use:* this lesson's core technique — copying each mixin
    object's methods directly onto a class's `.prototype` object, so
    every instance of that class gains those methods through the exact
    same delegation mechanism inherited methods use, without any
    `extends` relationship to the mixin at all.
  - *Type:* a `static` function on the `Object` global.
  - *Responsibility:* to copy properties from one or more source
    objects onto a single target object and return that target — it
    does not create a new object, and it does not establish any
    ongoing link between the target and the sources; once the copy is
    done, the sources and the target have no further relationship.
  - *Depends on:* a target object to copy onto, and at least one source
    object to copy from.
  - *Connects to:* called directly in this lesson's own project code,
    with a class's `.prototype` object as the target and one or more
    mixin objects as the sources; its effect is what makes each mixin's
    methods reachable, afterward, through ordinary delegation on any
    instance of that class.
  - *Shape:* a public, standard-library API surface — general-purpose,
    used here for the specific job of implementing the mixin pattern,
    but not itself specific to mixins in any way.

---

## Concept Unit: Why a Class Can Only `extends` One Thing

### The Problem

An existing animal hierarchy already has exactly the shape every
hierarchy in this curriculum has used so far: `Animal` is the base,
`Bird extends Animal`, and `FlyingBird extends Bird` adds a `fly()`
method; separately, `Fish extends Animal`, and `SwimmingFish extends
Fish` adds a `swim()` method. Both branches work correctly on their
own. Now a new requirement arrives: build a `Duck`, which needs both
`fly()` and `swim()`.

> **Try this before reading on:** given everything you know about
> `extends` from Lesson 3 — that it links one class's `.prototype`
> chain to exactly one other class's `.prototype` — what do you expect
> to happen if you write a class declaration naming two different
> classes after a single `extends` keyword? Is there any way, using
> only `extends` as you've learned it so far, to make one class
> genuinely sit on *two* separate prototype chains at once? If not,
> what would the two realistic workarounds be — and what would each one
> cost?

### Isolated Example

```js
class Base {}
class Left extends Base {}
class Right extends Base {}
class Both extends Left, Right {}
```

Run for real, not predicted — whether `extends` accepts more than one
class name at all is a question about the actual JavaScript grammar,
not something worth guessing at from a plausible-sounding assumption.

**Real output (this file fails to run at all):**
```
SyntaxError: Unexpected token ','
```

This is a parse-time failure, exactly like the private-field access
error from the previous lesson — the file never runs a single line.
`extends` is grammatically defined to accept exactly one expression
after it; a comma there isn't a rarely-used feature or a version
restriction, it's simply not part of the language's grammar at all.
There is no way to make one `class` declaration link its `.prototype`
chain to two different parent classes through `extends` — not with
different syntax, not with a workaround inside the class body; the
restriction is structural, not a limitation of this particular attempt.

This throwaway example is now discarded — `Base`, `Left`, `Right`, and
`Both` never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, introducing a new project separate from `Shape`/`Circle`
  and `Counter`, because this lesson's own problem needs a hierarchy
  wide enough to genuinely need two independent behaviors, which
  neither earlier project was built to demonstrate.
- **Files affected:** created — `animals.js` (new file).
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Bird extends Animal {}

class FlyingBird extends Bird {
  fly() {
    return `${this.name} flies`;
  }
}

class Fish extends Animal {}

class SwimmingFish extends Fish {
  swim() {
    return `${this.name} swims`;
  }
}
```

### The Updated Project

```js
 1  class Animal {              // ← new
 2    constructor(name) {        // ← new
 3      this.name = name;         // ← new
 4    }                            // ← new
 5  }                               // ← new
 6
 7  class Bird extends Animal {}   // ← new
 8
 9  class FlyingBird extends Bird {   // ← new
10    fly() {                          // ← new
11      return `${this.name} flies`;    // ← new
12    }                                  // ← new
13  }                                     // ← new
14
15  class Fish extends Animal {}          // ← new
16
17  class SwimmingFish extends Fish {     // ← new
18    swim() {                             // ← new
19      return `${this.name} swims`;        // ← new
20    }                                      // ← new
21  }                                         // ← new
```

`animals.js` now defines five classes in two separate three-level
chains, both rooted at `Animal`: one chain ending in `FlyingBird`, with
`fly()` reachable only through that specific branch; one chain ending
in `SwimmingFish`, with `swim()` reachable only through that separate
branch — and, per this unit's own isolated lab, no legal way to build a
sixth class that sits on both branches through `extends` alone.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`class Animal { constructor(name) { this.name = name; } }` (lines
  1–5).** The same **`class`** declaration and **constructor method**
  pattern from every hierarchy so far — a single own property, `name`,
  set on every instance through ordinary `this.name = name` assignment,
  the identical mechanism used in every prior lesson.
- **`class Bird extends Animal {}` (line 7).** The same **`extends`**
  keyword from Lesson 3 — this class body is empty, contributing no new
  methods of its own; its only purpose is to sit as an intermediate
  link in the chain, exactly the kind of structure the next unit's
  refactor questions the necessity of.
- **`class FlyingBird extends Bird { fly() {...} }` (lines 9–13).**
  `extends` again, this time linking to `Bird` rather than directly to
  `Animal` — a third link in the chain. `fly()` is a method placed
  automatically onto `FlyingBird.prototype`, the same automatic
  placement explained in full in Lesson 3; `${this.name}` inside it
  resolves through `this` to whatever instance `fly` is actually called
  on, reaching `name` by delegating all the way up through
  `FlyingBird.prototype` → `Bird.prototype` → `Animal.prototype`, since
  `name` itself is only ever set as an own property, never redeclared
  on any of the intermediate classes.
- **`class Fish extends Animal {}` (line 15) and `class SwimmingFish
  extends Fish { swim() {...} }` (lines 17–21).** The identical pattern
  as `Bird`/`FlyingBird`, built as a completely separate three-level
  chain rooted at the same `Animal` — this is the second branch that
  this unit's isolated lab already proved cannot be merged with the
  first through `extends` alone.

### CS Lens

This chain's own shape is called **single inheritance** — a class may
`extends` at most one other class, so every class's ancestors form one
straight line, never a tree with more than one direct parent. The
`Duck` requirement this unit opened with is a concrete instance of what
's often called the **diamond problem**: needing behavior from two
independent lineages at once, in a language whose inheritance model
only supports one lineage per class.

```
Also recognized in: Java and C# both restricting classes to
`extends` exactly one parent for this exact reason (while still
allowing multiple `implements`, a different, narrower mechanism),
C++'s own multiple inheritance existing specifically to allow what
JavaScript's single-`extends` rule forbids — and being notorious for
real diamond-problem ambiguity when it's used, the biology term
"convergent evolution" describing two unrelated lineages (bats and
birds) independently gaining the same capability (flight) without
sharing a common flying ancestor, which is structurally the same
shape this lesson's `Duck` needs to model
```

### SE Lens

The two realistic workarounds the Socratic prompt above asked about are
both genuinely bad, and it's worth being honest about why before the
next unit replaces both with something better. The first: duplicate
`fly()`'s own code directly inside a new `Duck` class instead of
reusing `FlyingBird`'s version — this works, but the moment `fly()`'s
logic needs to change, there are now two copies to find and update,
with nothing enforcing that they stay identical; this is the exact
maintenance cost Lesson 1's own SE Lens already named for a completely
different mechanism (raw copying instead of delegation), reappearing
here at the class level instead of the single-object level. The
second: restructure the whole hierarchy — make `FlyingBird extend
SwimmingFish` (or the reverse) so `Duck` can extend whichever one ends
up on top — which technically produces one legal chain, but now every
`SwimmingFish` that was never meant to fly (a `Goldfish`, say) either
has to sit awkwardly outside the new merged branch or, worse, ends up
inheriting `fly()` it was never supposed to have, purely as a side
effect of restructuring the tree to satisfy one new class's needs. Both
workarounds are symptoms of the same underlying mismatch: `extends`
encodes a strict, single-branch "is-a" relationship, and "can fly" and
"can swim" were never actually is-a relationships about `Duck` in the
first place — they're capabilities, and the next unit's technique is
built specifically to model capabilities without forcing them through
an inheritance tree at all.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node animals.js`; no build step or package has been introduced.

### Run It

```js
const sparrow = new FlyingBird("Sparrow");
const goldfish = new SwimmingFish("Goldfish");
console.log(sparrow.fly());
console.log(goldfish.swim());
```

**Real output:**
```
Sparrow flies
Goldfish swims
```

Both branches work correctly in isolation — this is what makes the
`Duck` requirement a genuine design problem rather than a bug: nothing
here is broken yet, the hierarchy simply has no room in it for an
animal that needs both branches' behavior at once.

**A second run, proving the actual break using this lesson's own real
class names, not just the generic isolated lab above:**

```js
class Duck extends FlyingBird, SwimmingFish {}
```

**Real output (this file fails to run at all):**
```
SyntaxError: Unexpected token ','
```

The identical failure as the isolated lab, now against the real
`FlyingBird` and `SwimmingFish` this project actually built — confirming
this isn't a quirk of the throwaway example, it's the same grammar rule
applying to this project's own code.

### Connecting to what came before

This unit rebuilds a hierarchy shaped exactly like every one before it
in this curriculum — and, for the first time, runs directly into a
requirement that shape genuinely cannot satisfy, proven with a real
parse failure rather than assumed from the pattern. The next unit
refactors this same file, replacing the two three-level chains with a
single shared base and small, independent, combinable behaviors
instead.

---

## Concept Unit: Composing Behaviors with `Object.assign`

### The Problem

`fly()` and `swim()` need to be reachable from any class that needs
them — `FlyingBird`, `SwimmingFish`, and now `Duck`, which needs both —
without requiring any of those classes to sit on a shared branch of one
single-inheritance tree. The previous unit's `Bird` and `Fish` classes,
in particular, contribute no behavior of their own at all; their entire
job was providing a place in the chain for `FlyingBird` and
`SwimmingFish` to attach to, which is exactly the kind of structural
overhead this unit's refactor should be able to remove entirely.

> **Try this before reading on:** a mixin, as a plain object holding
> methods, isn't itself a class and has no `.prototype` of its own
> in the sense a class does — it's just an ordinary object with some
> functions on it, the same kind of object you built by hand in Lesson
> 1. If you already have a tool that copies properties from one object
> onto another (`Object.assign`, used elsewhere in this curriculum's
> own code, though this is its first appearance here), what do you
> think would happen if you used it to copy a mixin's methods directly
> onto a class's `.prototype` object, instead of onto one specific
> instance? Would every instance of that class end up with its own
> separate copy of the mixin's methods, or would they end up shared the
> same way inherited methods are — and how could you actually check,
> using tools from earlier lessons, which one actually happened?

### Isolated Example

```js
const canBark = {
  bark() {
    return "Woof!";
  }
};

const canFetch = {
  fetch() {
    return `${this.name} fetches the ball`;
  }
};

class Robot {
  constructor(name) {
    this.name = name;
  }
}

Object.assign(Robot.prototype, canBark, canFetch);

const r = new Robot("Rex-9000");
console.log(r.bark());
console.log(r.fetch());
console.log(r.hasOwnProperty("bark"));
console.log(Object.getPrototypeOf(r) === Robot.prototype);
```

Run for real, not predicted — whether methods copied by `Object.assign`
end up as own properties of each instance or stay shared through
delegation is exactly the kind of internal-structure claim the
Verification Rule requires proof for.

**Real output:**
```
Woof!
Rex-9000 fetches the ball
false
true
```

`r.bark()` and `r.fetch()` both work, even though neither method was
ever written inside `Robot`'s own class body — they were copied onto
`Robot.prototype` after the fact, from two completely unrelated plain
objects. `r.hasOwnProperty("bark")` is `false` — `bark` is not an own
property of `r` itself, meaning `Object.assign(Robot.prototype, ...)`
copied the methods onto the shared prototype object, not onto each
future instance individually; every `Robot` instance reaches `bark`
through the exact same delegation mechanism `describe` used on
`Shape.prototype` all the way back in Lesson 1. `r`'s own prototype
link is still, unchanged, `Robot.prototype` — `Object.assign` never
touched `Robot`'s inheritance structure at all, only added plain
properties to one object that happened to be `Robot.prototype`.
`${this.name}` inside `fetch`, defined on `canFetch` — an object that
never itself has a `name` property — still correctly resolved to
`"Rex-9000"`, because `this` inside any ordinary method resolves to
whatever object it's actually called *on*, not the object it happened
to be *written* on; `canFetch.fetch` and `Robot.prototype.fetch` end up
being the exact same function value after copying, and that value's
`this` behaves identically regardless of which object it's reached
through.

This throwaway example is now discarded — `Robot`, `canBark`,
`canFetch`, and `r` never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** modified — `animals.js`. The `Bird` and `Fish`
  classes from the previous unit are removed entirely, since their only
  job was providing an attachment point for `extends`, a job this
  refactor no longer needs; `FlyingBird` and `SwimmingFish` are rebuilt
  directly against `Animal`, renamed `Sparrow` and `Goldfish` to reflect
  that they're now ordinary animals with an added capability rather
  than named after the capability itself; and a new `Duck` class is
  added.
- **Change type:** refactor (remove two classes, restructure two more)
  plus add (mixins, and `Duck`).
- **Location:** the entire file below `Animal`'s own declaration (lines
  1–5 from the previous unit, which are unchanged) is replaced.
- **Dependencies:** the `Animal` class from the previous Concept Unit
  in this same lesson must still exist.

### The New Code

```js
const canFly = {
  fly() {
    return `${this.name} flies`;
  }
};

const canSwim = {
  swim() {
    return `${this.name} swims`;
  }
};

class Sparrow extends Animal {}
Object.assign(Sparrow.prototype, canFly);

class Goldfish extends Animal {}
Object.assign(Goldfish.prototype, canSwim);

class Duck extends Animal {}
Object.assign(Duck.prototype, canFly, canSwim);
```

### The Updated Project

```js
 1  class Animal {
 2    constructor(name) {
 3      this.name = name;
 4    }
 5  }
 6
 7  const canFly = {                          // ← new
 8    fly() {                                  // ← new
 9      return `${this.name} flies`;            // ← new
10    }                                          // ← new
11  };                                            // ← new
12
13  const canSwim = {                            // ← new
14    swim() {                                     // ← new
15      return `${this.name} swims`;                // ← new
16    }                                              // ← new
17  };                                                // ← new
18
19  class Sparrow extends Animal {}                  // ← new
20  Object.assign(Sparrow.prototype, canFly);         // ← new
21
22  class Goldfish extends Animal {}                  // ← new
23  Object.assign(Goldfish.prototype, canSwim);        // ← new
24
25  class Duck extends Animal {}                       // ← new
26  Object.assign(Duck.prototype, canFly, canSwim);     // ← new
```

`animals.js` now defines one base class, `Animal`, two mixins,
`canFly` and `canSwim`, and three classes built directly against
`Animal` with no intermediate layer — each one gaining exactly the
capabilities it needs, `Duck` gaining both, by copying methods onto its
own `.prototype` rather than by inheriting from a class named after
that capability.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`const canFly = { fly() {...} }` (lines 7–11) and `const canSwim =
  { swim() {...} }` (lines 13–17).** Two **mixins** (defined in Terms,
  above) — ordinary object literals, the same construct used for
  `shape` in Lesson 1, each holding exactly one method. Neither object
  is ever instantiated with `new`, extended, or treated as anything
  other than a plain bag of reusable methods waiting to be copied
  elsewhere.
- **`class Sparrow extends Animal {}` (line 19).** The same **`class`**
  and **`extends`** from Lesson 3 — `Sparrow` genuinely *is an*
  `Animal` (it needs `name`, set through `Animal`'s own constructor),
  which is exactly the kind of relationship `extends` is suited for;
  what's different from the previous unit is that `Sparrow` no longer
  extends a `Bird` class that existed purely to hold `fly()`.
- **`Object.assign(Sparrow.prototype, canFly)` (line 20).**
  `Object.assign` (full CRC treatment in the header, above), called
  with `Sparrow.prototype` as the target and `canFly` as the sole
  source. This copies `canFly`'s own `fly` method directly onto
  `Sparrow.prototype`, the exact same object `extends` would have
  linked a `FlyingBird.prototype` to in the previous unit's version —
  the destination is identical, only the mechanism for getting a method
  there has changed.
- **`class Goldfish extends Animal {}` (line 22) and
  `Object.assign(Goldfish.prototype, canSwim)` (line 23).** The
  identical pattern as `Sparrow`, applied to `canSwim` instead of
  `canFly` — included as its own enumerated pair rather than folded
  into the `Sparrow` explanation, per this schema's enumeration rule.
- **`class Duck extends Animal {}` (line 25).** The same `extends`
  pattern a third time — `Duck` also genuinely *is an* `Animal`, and
  this is the exact requirement the previous unit proved `extends`
  alone could not satisfy on its own once two behaviors were both
  needed; here, `extends` is only being asked to establish the `Animal`
  relationship, nothing more.
- **`Object.assign(Duck.prototype, canFly, canSwim)` (line 26).** The
  same `Object.assign` call as before, but with *two* source objects
  instead of one — proving directly that copying isn't limited to one
  mixin at a time the way `extends` was limited to one parent class at
  a time. Both `canFly`'s `fly` and `canSwim`'s `swim` end up on
  `Duck.prototype` from this single call, resolving the exact
  requirement `extends` could not express.

### CS Lens

This is **composition** (defined in full in Terms, above) — assembling
an object's behavior from small, independent pieces combined at the
point of use, rather than through a single fixed inheritance
relationship decided once, structurally, at the class-declaration
level.

```
Also recognized in: React's own move from class-based component
inheritance toward composing small, independent hooks and
higher-order functions instead, Go's language design deliberately
omitting class inheritance entirely in favor of interface
satisfaction and struct embedding, Unix's own small-composable-tools
philosophy (piping `grep` into `sort` into `uniq` rather than
building one large program that does all three), a music
production DAW's plugin chain, where each effect (reverb,
compression, EQ) is added independently to a track rather than
being baked into one fixed "reverb-and-compression-and-EQ" unit
```

### SE Lens

The alternative not chosen here, throughout this refactor, is exactly
what the previous unit built and then hit a wall with: encoding every
shared capability as an `extends` relationship, one layer per
capability. That approach's real advantage, when it does fit — the
`Animal` → `Sparrow` relationship here still uses it — is that a single
`extends` clause expresses both "shares this behavior" and "is
fundamentally this kind of thing" in one place, which is genuinely
appropriate when both are simultaneously true. Its cost, proven
directly by this lesson's own `Duck` problem, is that it can only ever
express *one* such relationship per class — the moment two independent
capabilities are both needed, the inheritance-only approach has no
answer that doesn't involve either duplicating code or restructuring
an entire tree around one new requirement. `Object.assign`-based
composition's own cost, worth stating honestly rather than glossing
over: nothing about `Object.assign(Duck.prototype, canFly, canSwim)`
is checked by the language the way `extends`'s single-parent rule is —
if `canFly` and `canSwim` had both defined a method with the same name,
`Object.assign` would silently let the later source overwrite the
earlier one, with no warning and no error, whereas at least `extends`'s
restriction to one parent makes name collisions between two full class
hierarchies structurally impossible in the first place. Composition
trades a hard, enforced structural limit for a soft, silent one — a
real tradeoff, not a strictly better replacement.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node animals.js`; no build step or package has been introduced.

### Run It

```js
const duck = new Duck("Duck");
console.log(duck.fly());
console.log(duck.swim());
console.log(duck.hasOwnProperty("fly"), duck.hasOwnProperty("swim"));
console.log(Object.getPrototypeOf(duck) === Duck.prototype);

const sparrow = new Sparrow("Sparrow");
console.log(sparrow.fly());
console.log(typeof sparrow.swim);
```

**Real output:**
```
Duck flies
Duck swims
false false
true
Sparrow flies
undefined
```

`duck.fly()` and `duck.swim()` both work — the exact requirement the
first unit proved `extends` alone could never satisfy, solved here with
one `Object.assign` call taking two sources at once.
`duck.hasOwnProperty("fly")` and `duck.hasOwnProperty("swim")` are both
`false` — proving, on this lesson's own real project code rather than
just the isolated lab, that both methods live on `Duck.prototype`
through delegation, not copied individually onto every future `Duck`
instance. `Object.getPrototypeOf(duck) === Duck.prototype` confirms
`Duck`'s own `Animal` inheritance is completely intact — composition
added capabilities on top of it without disturbing it at all.
`sparrow.fly()` still works exactly as before the refactor, and
`typeof sparrow.swim` reports `undefined` — proving the refactor didn't
accidentally leak `canSwim`'s method onto a class that was never given
it; each class received exactly the mixins it was actually assigned.

### Connecting to what came before

This unit keeps the one part of the previous unit's structure that
genuinely earned its place — `extends Animal`, expressing a real is-a
relationship — and replaces the part that didn't: two intermediate
classes that existed only to carry one capability each, now carried
instead by small, independent mixin objects combined with a single
`Object.assign` call, solving exactly the requirement the previous
unit's own `SyntaxError` proved was otherwise unreachable.

---

## Connect the Pieces

One value, traced start to finish: the string `"Duck"`, passed as
`new Duck("Duck")`. Because `Duck extends Animal`, `new` runs `Animal`'s
own `constructor` logic (no explicit `constructor` was written on
`Duck` itself, so the implicit default simply forwards to `Animal`'s),
setting `this.name = "Duck"` as an own property — the same mechanism
used in every lesson since Lesson 1. Calling `duck.fly()` afterward
walks the prototype chain from the instance to `Duck.prototype`, where
it finds `fly` — not because `Duck` was declared to extend anything
related to flying, but because `Object.assign(Duck.prototype, canFly,
canSwim)` copied `canFly`'s `fly` method there directly, after the
class itself was already fully declared. Inside that call, `this.name`
resolves through `this` — still bound to the same `duck` object the
whole way through — back to the exact `"Duck"` string passed in at
construction. One capability, added after the fact, without a single
line of `Duck`'s own inheritance structure ever needing to change to
make room for it.

## What's Next

Lesson A6 turns to a bug this lesson's own mixins are one step away
from qualifying for: what happens to `this` when a method — like this
lesson's `canFly.fly`, or any of the earlier lessons' instance methods
— gets pulled out of the object it's attached to and used somewhere
else, like an event handler, where it's no longer being called as
`obj.method()` at all. Lesson A6 builds that exact bug for real, watches
it break, and fixes it three separate ways.
