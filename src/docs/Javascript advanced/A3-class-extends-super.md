# Lesson 3: `class`, `extends`, and `super` as Sugar, Not Magic

**What you will build:** the same two-level `Shape`/`Circle` hierarchy
a third time, now using `class`, `extends`, and `super` — and, at every
step, a real, run proof (via `Object.getPrototypeOf` and
`hasOwnProperty`) that this version produces the identical prototype
structure the hand-built version produced, rather than some different
mechanism hidden behind friendlier syntax. This lesson is also honest
about the one place that claim needs a caveat: `class` really does
enforce a few real rules `function` constructors never did, and this
lesson proves those too, with real errors, rather than glossing over
them to keep the "it's just sugar" story clean.

**What you need to know first:** Lesson 1 — `Object.create`, prototype,
prototype chain, delegation, own property, `this`. Lesson 2 —
constructor functions, the `new` operator's four-step algorithm, the
`prototype` property, `Function.prototype.call`, and constructor
stealing plus manual prototype chaining as the two-step technique used
to link `Circle` to `Shape`.

**Terms used in this lesson:**

- **Prototype** — every JavaScript object has an internal link to
  another object (or to `null`), called its prototype. It exists so
  objects can share behavior without each object carrying its own copy
  of every method — a lookup that fails on the object itself keeps
  going up this chain instead of failing immediately.
- **Prototype chain** — the sequence of linked prototypes a property
  lookup walks through: object → its prototype → that prototype's own
  prototype → ... → `null`. It exists because a single link wouldn't be
  enough to model multi-level sharing, like `Circle` sharing from
  `Shape`, with only one hop.
- **Delegation** — the algorithm the engine runs on every `obj.prop`
  read: check `obj` itself first; if not found, check `obj`'s
  prototype; repeat up the chain; return `undefined` only once the
  chain ends. It exists so shared behavior can live in exactly one
  place instead of being duplicated onto every object that uses it.
- **Own property** — a property that exists directly on the object
  itself, found at the very first step of a lookup, before any
  delegation happens. It matters in this lesson specifically because
  it's what this lesson's own proof relies on: showing that a `class`
  body's methods are *not* own properties of an instance is what proves
  they're reached by the same delegation mechanism as before.
- **`this` inside a function** — a value bound fresh on every call,
  determined by *how* the function was called, not where it was
  written. It exists so one function body, defined once, can operate on
  whichever object it's actually invoked on.
- **Constructor function** — an ordinary function, called with `new`,
  intended to produce new objects sharing a common shape and shared
  methods. It exists because manually calling `Object.create` and
  assigning properties by hand doesn't scale past one object.
- **The `new` operator** — a keyword that changes what a function call
  does, running four automatic steps: create a new object, link that
  object's prototype to the calling function's `.prototype` property,
  run the function with `this` bound to the new object, and return the
  new object. It exists to collapse a repeated manual recipe into one
  guaranteed-consistent keyword.
- **The `prototype` property** — every ordinary function automatically
  carries a real property named `prototype`, pointing at a plain object
  the engine creates for it. It exists to give `new` something concrete
  to link new instances to.
- **Constructor stealing** — calling one constructor function from
  inside another, with the second constructor's own `this`, so the
  first constructor's own-property logic runs against the second's
  object instead of building a separate one. It exists to reuse a
  parent constructor's setup logic without copying it.
- **`class`** — a declaration that packages a constructor function and
  a set of shared, prototype-level methods into one syntactic block. It
  exists to remove the two separate manual steps Lesson 2 needed —
  defining the function, then separately assigning each shared method
  onto its `.prototype` — by letting both live inside one block, with
  the engine handling the placement automatically. Under the hood, a
  `class` declaration still produces an ordinary function value with a
  real `.prototype` object; the class body's methods are placed onto
  that `.prototype` object by the engine, not by any code the class
  body's author had to write themselves.
- **The `constructor` method** — a specially-named method inside a
  `class` body (there can be at most one) that becomes the function
  `new` actually runs when building an instance — the exact role
  Lesson 2's whole function body played for a plain constructor
  function. It exists to give a `class` body one clearly-marked place
  for own-property setup logic, separate from the shared methods
  surrounding it.
- **`extends`** — a keyword in a `class` declaration
  (`class Circle extends Shape`) that automatically performs both of
  Lesson 2's manual chaining steps — linking the new class's
  `.prototype` object to the parent class's `.prototype` object, and
  wiring the resulting `.constructor` property back correctly — without
  either step being written out by hand.
- **`super`** — inside a subclass's `constructor` method, a call to
  `super(...)` runs the parent class's own `constructor` logic against
  the same in-progress object being built — the same effect Lesson 2's
  `Shape.call(this, ...)` achieved by hand, automated and, as this
  lesson proves with a real error, enforced by the language rather than
  left to convention: a derived class's `this` does not exist at all
  until `super(...)` has actually run.

**Objects and methods used:**

- **`Object.getPrototypeOf`**
  - *What it is:* a built-in static function that reads back an
    object's internal prototype link.
  - *Implementation:* `Object.getPrototypeOf(obj)` — a `static`
    function taking one object and returning whatever object (or
    `null`) that object's internal prototype link points to.
  - *Its use:* this lesson's central proof tool — used to show that a
    `class`-built instance's prototype link, and a subclass's
    `.prototype`-to-`.prototype` link, are identical in structure to
    the hand-built versions from Lesson 2.
  - *Type:* a `static` function on the `Object` global.
  - *Responsibility:* strictly read-only inspection of the internal
    prototype link; never modifies the object it's given.
  - *Depends on:* any single object to inspect.
  - *Connects to:* called on class instances and on one class's
    `.prototype` object, with results compared by identity (`===`)
    against another class's `.prototype` object.
  - *Shape:* a public, standard-library inspection API — the same tool
    used for the same reason in both of this lesson's previous
    counterparts.
- **`Object.prototype.hasOwnProperty`**
  - *What it is:* a real instance method every plain object inherits
    (through the default prototype chain every object ultimately
    reaches), used to check whether a given property exists directly
    on an object itself, as opposed to being reached only through
    delegation.
  - *Implementation:* `someObject.hasOwnProperty(propertyName)` — an
    instance method taking one string (or symbol) argument and
    returning a plain `true`/`false`.
  - *Its use:* this lesson's other central proof tool — used to show
    that a `class` body's methods (like `describe` and `area`) never
    become own properties of an instance, exactly like the
    hand-assigned `.prototype` methods from Lesson 2 never did, which
    is direct evidence they're placed on `.prototype`, not copied onto
    each instance.
  - *Type:* an instance method, available on ordinary objects via the
    default prototype chain.
  - *Responsibility:* answering exactly one question — does this
    specific property exist directly on this object — without walking
    any further up the prototype chain to check.
  - *Depends on:* an object to call it on, and a property name to check.
  - *Connects to:* called directly on class instances in this lesson's
    Run It steps, immediately after each instance is built, to inspect
    what `new` and the class body actually produced.
  - *Shape:* a public, standard-library inspection method — general
    purpose, applied here specifically to prove a claim about where a
    method actually lives.

---

## Concept Unit: `class` and the `constructor` Method

### The Problem

Building `Shape` by hand earlier meant three separate steps that had to
be written in the right order and never accidentally skipped: define
the constructor function, then, on a completely separate line, assign
the shared `describe` method onto `Shape.prototype`. Nothing tied those
two pieces together visually — a reader scanning the file has to notice
both pieces exist and mentally associate them, and nothing stops a
third, unrelated piece of code from sitting between them.

> **Try this before reading on:** if you had a single keyword that
> could contain both "the constructor's own-property setup" and "every
> method that should live on `.prototype`" inside one visually
> contained block, what do you think the engine would still have to be
> doing underneath that block, given everything you already know about
> `Object.create`, `.prototype`, and delegation? Does packaging two
> steps into one block change what actually happens to a new instance's
> own properties versus its shared methods, or only how the code that
> sets them up is arranged on the page?

### Isolated Example

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    return `hi, ${this.name}`;
  }
}

const p = new Person("Ann");
console.log(p.greet());
console.log(p.hasOwnProperty("name"));
console.log(p.hasOwnProperty("greet"));
console.log(Object.getPrototypeOf(p) === Person.prototype);
```

Run for real, not predicted — whether a `class` body's method actually
ends up as an own property of the instance or is only reachable through
delegation is exactly the kind of internal-structure claim the
Verification Rule requires proof for.

**Real output:**
```
hi, Ann
true
false
true
```

`p.hasOwnProperty("name")` is `true` — `name` really is set directly on
the instance, by the `constructor` method's own `this.name = name`
line, exactly as it would be inside a plain function constructor.
`p.hasOwnProperty("greet")` is `false` — `greet` is not on the instance
at all, even though `p.greet()` above just worked. Combined with the
last line proving `p`'s prototype link really is `Person.prototype` by
identity, this proves `greet` is reached the same way `describe` was
reached in Lesson 2: placed on `Person.prototype` by the engine, found
by delegation, not copied onto every instance.

This throwaway example is now discarded — `Person` never appears in the
project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, exploring a third technique for the same shape hierarchy
  built in the previous two lessons.
- **Files affected:** created — `class-shapes.js` (new file). This
  deliberately does not modify `shapes.js` or `constructor-shapes.js`;
  both earlier versions stay exactly as they were, so all three remain
  directly comparable.
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
class Shape {
  constructor(name) {
    this.name = name;
  }

  describe() {
    return `${this.name}, area ${this.area()}`;
  }
}

const s = new Shape("shape");
```

### The Updated Project

```js
 1  class Shape {                                     // ← new
 2    constructor(name) {                              // ← new
 3      this.name = name;                               // ← new
 4    }                                                  // ← new
 5
 6    describe() {                                       // ← new
 7      return `${this.name}, area ${this.area()}`;       // ← new
 8    }                                                    // ← new
 9  }                                                      // ← new
10
11  const s = new Shape("shape");                       // ← new
```

`class-shapes.js` now defines one `class`, `Shape`, whose body contains
both the own-property setup (inside `constructor`) and the one shared
method every instance will reach through delegation (`describe`), and
one call site building a real instance to inspect.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`class Shape { ... }` (lines 1–9).** The **`class`** declaration
  (defined in full in Terms, above). Under the hood, this single block
  produces exactly what Lesson 2 produced by hand across several
  separate statements: an ordinary function value, bound to the name
  `Shape`, carrying a real `.prototype` object — the class body doesn't
  add a new kind of object to JavaScript's model, it's a different way
  of writing code that builds the same kind of object Lesson 2 already
  built.
- **`constructor(name) { this.name = name; }` (lines 2–4).** The
  **`constructor` method** (defined in Terms, above) — the one
  specially-named method inside the class body that becomes the actual
  function `new` runs. `this.name = name` inside it is the identical
  own-property assignment mechanism used throughout the last two
  lessons; what's different is only that this logic lives inside a
  `class` body's `constructor` slot instead of being the entire body of
  a standalone `function Shape(name) { ... }`.
- **`describe() { ... }` (lines 6–8).** A method written inside the
  class body, outside `constructor`. This is where the engine's
  automatic placement described under **`class`**, above, actually
  happens: the engine takes this method and places it onto
  `Shape.prototype` itself — not onto any instance — which is exactly
  what Lesson 2 achieved by hand with the separate statement
  `Shape.prototype.describe = function () {...}`. Nothing about writing
  `describe()` here inside the class body causes it to become an own
  property of future instances; the isolated lab above proved that
  directly.
- **`${this.name}` and `this.area()` inside `describe` (line 7).**
  `this` resolves exactly as it always has — to whatever object
  `describe` is actually called on. `this.area()` is a forward
  reference to a method `Shape`'s own class body doesn't define at
  all — it only resolves once `describe` is called on a `Circle`
  instance, in this lesson's next unit.
- **`new Shape("shape")` (line 11).** The same **`new` operator** from
  Lesson 2, run against `Shape` — but `Shape` here is a `class`, not a
  plain function, and that distinction is not purely cosmetic. A plain
  function constructor can still be called *without* `new` (Lesson 2
  deliberately didn't exercise this, but it's legal — `this` just ends
  up bound to something else). A class constructor cannot: calling
  `Shape("shape")` directly, with no `new`, throws
  `TypeError: Class constructor Shape cannot be invoked without 'new'`
  — a real rule the engine enforces, not a convention `class` merely
  suggests.

### CS Lens

The core idea both class units in this lesson embody is **syntactic
sugar** — syntax that adds no new underlying capability to a language,
only a friendlier or more compact notation for something the language
could already express, that compiles or desugars down to the exact same
underlying mechanism either way. This lesson's own `Object.getPrototypeOf`
and `hasOwnProperty` proofs are what turn "syntactic sugar" from an
assertion into something actually demonstrated, rather than assumed.

```
Also recognized in: arrow functions as sugar over a function
expression plus a manually-bound `this`, Python's list
comprehensions as sugar over an explicit `for` loop with `.append`,
C#'s auto-implemented properties as sugar over a private backing
field plus a getter and setter, SQL's `JOIN` syntax as sugar over
an equivalent correlated subquery
```

### SE Lens

The alternative not chosen here is Lesson 2's own approach: write the
constructor function and each `.prototype` assignment as separate,
individually-typed statements. That approach's real advantage is that
every step stays independently visible and editable — nothing is
implicit, and nothing the engine does on your behalf can be misused
because you don't understand it. `class`'s real advantage is that it
makes an entire category of Lesson-2-style mistakes structurally
impossible instead of merely avoidable through discipline: there's no
separate `.prototype.method = ...` statement to forget, and no
`.constructor` property to remember to fix by hand (that repair — which
this lesson's next unit will show `extends` also automates). The
honest cost, and the reason this lesson's title insists on "sugar, not
magic" rather than just "sugar": `class` is not behaviorally identical
to a plain function constructor in every respect — the `TypeError`
proven above when a class is called without `new` is a real rule with
no function-constructor equivalent, and this lesson's next unit proves
a second one. A reader who only ever sees `class` syntax, with none of
this lesson's own `Object.getPrototypeOf`/`hasOwnProperty` proof
underneath it, has no way to tell these rules apart from the same
prototype mechanism dressed up differently — which is exactly the debt
this three-lesson sequence exists to pay down, once, up front.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node class-shapes.js`; no build step or package has been introduced.

### Run It

```js
console.log(s.hasOwnProperty("name"));
console.log(s.hasOwnProperty("describe"));
console.log(Object.getPrototypeOf(s) === Shape.prototype);
```

**Real output:**
```
true
false
true
```

Same shape of proof as the isolated lab, now run against the actual
project code: `name` is a real own property of `s`; `describe` is not,
meaning it's reached purely through delegation to `Shape.prototype`;
and `s`'s prototype link really is `Shape.prototype`, by identity — the
identical structure Lesson 2's hand-built `s` had, produced here with a
fraction of the code.

### Connecting to what came before

This unit's `class Shape` produces, automatically and in one block,
exactly the two facts Lesson 2 produced by hand across several
statements: an instance with its own `name`, and a shared `describe`
reachable only by delegation. The next unit adds the piece this one
deliberately left out — a subclass, using `extends` and `super`, that
this lesson can compare directly against Lesson 2's manually-chained
`Circle`.

---

## Concept Unit: `extends` and `super` — Automating the Chain

### The Problem

Linking `Circle` to `Shape` by hand, in the previous lesson, took two
separate, easy-to-forget steps: calling `Shape.call(this, ...)` inside
`Circle`'s own constructor to reuse its setup logic, and separately
reassigning `Circle.prototype` to `Object.create(Shape.prototype)` —
plus a third repair step, fixing the `.constructor` property that
reassignment broke. Does `class` provide a single mechanism that
performs all of that automatically, the same way it automated the
constructor-plus-shared-methods packaging in the previous unit?

> **Try this before reading on:** given that `extends` sits directly in
> a `class` declaration's own header (`class Circle extends Shape`),
> which of Lesson 2's two manual steps — the constructor-stealing call,
> or the `.prototype` reassignment — do you think `extends` itself is
> most likely responsible for automating, versus which one might need a
> second, separate keyword inside the constructor body specifically?
> And: in Lesson 2, `Shape.call(this, ...)` worked at any point inside
> `Circle`'s constructor because `this` already existed the moment the
> function started running. If a subclass's own object isn't fully
> built until its parent's setup logic has also run, what do you think
> should happen if a subclass's constructor tries to use `this` *before*
> triggering that parent setup?

### Isolated Example

```js
class Animal {
  constructor(sound) {
    this.sound = sound;
  }
}

class Dog extends Animal {
  constructor(name) {
    super("bark");
    this.name = name;
  }
}

const d = new Dog("Rex");
console.log(d.sound, d.name);
console.log(Object.getPrototypeOf(Dog.prototype) === Animal.prototype);
```

Run for real — both whether `super(...)` actually deposits properties
onto the same object `Dog`'s own code goes on to modify, and whether
`extends` actually links the two `.prototype` objects, are internal
structure claims the Verification Rule requires proof for.

**Real output:**
```
bark Rex
true
```

Both lines confirm the automation: `sound` (set inside `Animal`'s
constructor, via `super`) and `name` (set directly inside `Dog`'s own
constructor) both ended up on the same object, `d` — the identical
result Lesson 2's `Animal.call(this, ...)` produced by hand. And
`Dog.prototype`'s own prototype really is `Animal.prototype`, by
identity — the identical result Lesson 2's manual
`Circle.prototype = Object.create(Shape.prototype)` produced by hand,
here with no equivalent line written at all.

**A second run, proving the rule the Socratic prompt above asked
about** — what happens if a subclass constructor uses `this` before
calling `super(...)`:

```js
class Dog2 extends Animal {
  constructor(name) {
    this.name = name;
    super("bark");
  }
}

try {
  new Dog2("Rex");
} catch (e) {
  console.log(e.constructor.name + ": " + e.message);
}
```

**Real output:**
```
ReferenceError: Must call super constructor in derived class before accessing 'this' or returning from derived constructor
```

This is not a stylistic warning — it's a hard rule the engine enforces:
in a derived class's constructor, `this` genuinely does not exist yet
until `super(...)` has actually run, because building the object is
`super`'s own job, delegated down to the parent class's constructor
logic. Lesson 2's hand-written `Shape.call(this, ...)` had no
equivalent restriction — `this` already existed the moment `Circle`'s
plain function body started, because `new` had already built it before
calling the function at all, regardless of which order the body's own
statements ran in. This is this lesson's second real, verified
difference between `class`-based inheritance and the hand-built version
— not identical behavior wearing nicer syntax, but a genuinely new
constraint the language now enforces on your behalf.

This throwaway example is now discarded — `Animal`, `Dog`, and `Dog2`
never appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** modified — `class-shapes.js`.
- **Change type:** add (a subclass).
- **Location:** appended after the `Shape` class and its `s` instance
  from the previous Concept Unit; that earlier code is left exactly as
  it was.
- **Dependencies:** the `Shape` class from the previous Concept Unit in
  this same lesson must already exist in the file.

### The New Code

```js
class Circle extends Shape {
  constructor(radius) {
    super("circle");
    this.radius = radius;
  }

  area() {
    return Math.PI * this.radius * this.radius;
  }
}
```

### The Updated Project

```js
 1  class Shape {
 2    constructor(name) {
 3      this.name = name;
 4    }
 5
 6    describe() {
 7      return `${this.name}, area ${this.area()}`;
 8    }
 9  }
10
11  const s = new Shape("shape");
12
13  class Circle extends Shape {          // ← new
14    constructor(radius) {                // ← new
15      super("circle");                    // ← new
16      this.radius = radius;                // ← new
17    }                                       // ← new
18
19    area() {                                // ← new
20      return Math.PI * this.radius * this.radius;  // ← new
21    }                                         // ← new
22  }                                           // ← new
```

`class-shapes.js` as a whole now defines two classes. `Shape` is
unchanged from the previous unit. `Circle` reuses `Shape`'s own `name`
setup via `super`, adds its own `radius`, and — with no reassignment
statement written anywhere in this file — has a `.prototype` object
already linked to `Shape.prototype`, purely because `extends` was
written in its header.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`class Circle extends Shape { ... }` (lines 13–22).** The
  **`extends`** keyword (defined in Terms, above), attached directly to
  the `class` declaration itself. This single clause performs both of
  Lesson 2's separate manual steps at once: linking `Circle.prototype`'s
  own internal prototype to `Shape.prototype`, and correctly setting
  `Circle.prototype.constructor` back to `Circle` — the exact repair
  Lesson 2 needed a dedicated extra statement for, here requiring no
  code at all.
- **`constructor(radius) { ... }` (lines 14–17).** The same
  **`constructor` method** role from the previous unit, this time
  belonging to a subclass — which is exactly where this unit's second
  proven rule applies: this constructor's own `this` does not exist as
  a usable object until the very next line runs.
- **`super("circle")` (line 15).** The **`super`** keyword (defined in
  Terms, above), called as a function here — this specific form,
  `super(...)`, invokes `Shape`'s own `constructor` method, passing
  `"circle"` through to its `name` parameter, and this call is what
  actually builds the object `this` will refer to for the rest of
  `Circle`'s constructor. This is the automated replacement for Lesson
  2's `Shape.call(this, "circle")` — but where Lesson 2's version could
  legally run at any point in the function body, this version is
  mandatory and must run before `this` is touched at all, proven by the
  real `ReferenceError` in this unit's isolated lab, above.
- **`this.radius = radius` (line 16).** An ordinary own-property
  assignment, the same mechanism used throughout every lesson so far —
  this line is only legal *after* line 15, because before `super(...)`
  runs, there is no `this` for it to assign onto.
- **`area() { ... }` (lines 19–21).** A method written inside `Circle`'s
  class body, placed automatically onto `Circle.prototype` by the same
  engine behavior explained for `describe` in the previous unit — the
  identical automatic placement, applied to the subclass instead of the
  parent.
- **`Math.PI * this.radius * this.radius` (line 20).** `Math.PI`, a
  built-in numeric constant computed once by the engine; `this.radius`
  resolving through `this` to whatever `Circle` instance `area` is
  actually called on; ordinary multiplication, already familiar from
  your existing background.

### CS Lens

Still **syntactic sugar**, the same idea named in the previous unit —
but `extends`/`super` sugar over a slightly larger unit of work than
`class` alone: not just "package a constructor and its shared methods,"
but "wire two prototype objects together and guarantee construction
order between two cooperating constructors," the same two concerns
named in Lesson 2's own CS Lens as **pseudoclassical inheritance**, now
automated by the language instead of hand-assembled.

```
Also recognized in: C++ constructor initializer lists automatically
invoking a base class's constructor before the derived class's own
body runs, database migration tools automatically running a parent
schema's setup before applying a child schema's changes, a build
system's dependency graph guaranteeing a library target finishes
building before anything that depends on it starts
```

### SE Lens

The alternative not chosen here is Lesson 2's manual chaining, in full.
Its real advantage, again, is total visibility — every wiring step is a
statement you can see, step through, and modify independently, which is
exactly why this three-lesson sequence taught it first. `extends`'s
real advantage is eliminating an entire class of mistakes structurally:
forgetting the `.constructor` fix is no longer possible because there's
no statement to forget, and — as this unit's own broken example
proved — using `this` before the parent's setup has run is no longer a
silent bug (Lesson 2's hand-built `Circle` had no equivalent
protection; nothing there prevented `this.radius = radius` from running
*before* `Shape.call(this, "circle")`, and doing so would have quietly
worked, in the wrong order, with no error at all). The real debt this
convenience carries: a reader who has only ever seen `extends` has no
occasion to learn that `this` doesn't exist yet at the top of a derived
constructor, because the language simply enforces it rather than
requiring the reader to reason about *why* — which is precisely the gap
this lesson's own proof, run against a real thrown error rather than a
description of a rule, exists to close.

### Commands Needed

None yet — still runnable directly via `node class-shapes.js` or a
browser console; no build step or package has been introduced.

### Run It

```js
const c = new Circle(4);
console.log(c.describe());
console.log(Object.getPrototypeOf(Circle.prototype) === Shape.prototype);
console.log(c.constructor === Circle);
console.log(
  c.hasOwnProperty("name"),
  c.hasOwnProperty("radius"),
  c.hasOwnProperty("describe"),
  c.hasOwnProperty("area")
);
```

**Real output:**
```
circle, area 50.26548245743669
true
true
true true false false
```

The first line proves the whole chain works end to end, identically to
Lesson 2's hand-built version. The second and third lines are the same
identity proofs used throughout this lesson, confirming `extends`
really did perform both of Lesson 2's manual steps correctly with no
code written for either. The fourth line is this lesson's most direct
evidence for its own title: `name` and `radius` are real own
properties of `c` (set by `constructor` logic, exactly as before), while
`describe` and `area` are not (reached purely through delegation, one
level of the prototype chain apart from each other) — the exact same
own-vs-delegated split Lesson 1 and Lesson 2 each produced by
completely different means.

### Connecting to what came before

This unit's `Circle extends Shape` reaches the identical structure
Lesson 2's `Circle.prototype = Object.create(Shape.prototype)` plus
`Shape.call(this, ...)` reached by hand — proven here property by
property, with `super`'s one real behavioral addition (`this` not
existing before it runs) demonstrated with a genuine thrown error
rather than only claimed in prose.

---

## Connect the Pieces

One value, traced start to finish: the literal `4`, passed as
`new Circle(4)`. Because `Circle`'s class body wrote `extends Shape`,
`Circle.prototype`'s own internal prototype was already linked to
`Shape.prototype` before this call ever happened — no code in this
lesson performed that linking directly; it was a side effect of writing
one keyword in the class header, proven by this lesson's own
`Object.getPrototypeOf(Circle.prototype) === Shape.prototype` check.
`new` allocates a fresh object and links its own prototype to
`Circle.prototype`, then runs `Circle`'s `constructor`. That
constructor's first line, `super("circle")`, is mandatory before
anything else can run — it invokes `Shape`'s own `constructor` against
this same in-progress object, setting `name` to `"circle"` — after
which `this.radius = radius` finally becomes legal and stores the `4`
as a second own property. Calling `.describe()` afterward walks the
prototype chain exactly as it did in both earlier lessons: `describe`
itself found on `Shape.prototype`, and, inside that call, `area` found
one level further down on `Circle.prototype` — which reads the `4`
back out of `this.radius` to compute the final result. Three lessons,
three completely different-looking pieces of code, and — verified
directly, not assumed — the exact same object shape underneath every
one of them.

## What's Next

Lesson A4 turns to a different concern entirely: none of the three
versions of `Circle` built so far actually protect `radius` from being
read or overwritten by any code that has a reference to the instance —
`Circle`'s own data is fully exposed. Lesson A4 builds true
encapsulation two ways, using closures and using the `#` private-field
syntax, and proves — the same way this lesson proved `class` was sugar
— exactly what each technique does and does not actually hide.
