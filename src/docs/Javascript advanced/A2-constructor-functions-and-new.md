# Lesson 2: Constructor Functions and `new`

**What you will build:** the same two-shape hierarchy from before — a
general `Shape` and a specific `Circle` — rebuilt a second time, this
time using `function` constructors, the `new` operator, and the
`prototype` property, instead of calling `Object.create` and assigning
properties by hand. The transferable problem this lesson is actually
about: `new` is not a separate feature bolted onto JavaScript's object
system — it's a shorthand that runs the exact same
create-an-object-and-link-its-prototype mechanism you already built by
hand, plus a few automatic steps, every single time it's called.

**What you need to know first:** Lesson 1 — `Object.create`,
prototype, prototype chain, delegation, and `this` resolving to
whatever object a method is called on.

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
  delegation happens. It matters here because it's what distinguishes
  "this particular circle's own radius" from "the `describe` method
  every shape shares."
- **`this` inside a function** — a value bound fresh on every call,
  determined by *how* the function was called, not where it was
  written. Inside an ordinary function called as `obj.method()`, `this`
  is `obj`. It exists so one function body, defined once, can operate
  on whichever object it's actually invoked on, rather than being
  hardwired to one specific object.
- **Constructor function** — an ordinary `function`, given no special
  syntax of its own, that is *intended* to be called with the `new`
  operator to produce new objects sharing a common shape and shared
  methods. Nothing in the language marks a function as a constructor
  except the convention (capitalized name, like `Shape`) and the fact
  that it's called with `new`. It exists because writing
  `Object.create(shape)` plus a handful of manual property assignments,
  by hand, for every single new object, doesn't scale past one object —
  a constructor function packages that repeated recipe into something
  callable.
- **The `new` operator** — a keyword placed before a function call
  (`new Shape("circle")`) that changes what the function call actually
  does, running four steps automatically instead of the function's
  ordinary behavior: (1) create a brand-new, empty object; (2) link
  that new object's internal prototype to the calling function's own
  `prototype` property; (3) call the function with `this` bound to that
  new object; (4) return the new object, unless the function explicitly
  returns some other object itself. It exists to collapse the exact
  multi-step recipe Lesson 1 performed by hand — `Object.create` plus
  manual assignment — into one keyword, run identically every time,
  with no step left out by accident.
- **The `prototype` property** — every ordinary function object
  automatically has a real property named `prototype`, pointing at a
  plain object the engine creates for it, distinct from the function
  itself. It exists specifically to give `new` something to link new
  instances to in step 2 above — it is the one piece of a constructor
  function's setup that isn't optional or a matter of style, because
  `new` reads it directly.
- **Constructor stealing (call-based inheritance)** — calling one
  constructor function from inside another, with the second
  constructor's own `this`, so the first constructor's own-property
  setup runs against the second's new object instead of building a
  separate one. It exists to reuse a parent constructor's own-property
  logic (like `Shape` setting `this.name`) without duplicating that
  logic inside every constructor that wants it.

**Objects and methods used:**

- **`Object.create`**
  - *What it is:* a built-in static function on the global `Object`
    object that constructs a brand-new object with a specified
    prototype.
  - *Implementation:* `Object.create(proto[, propertiesObject])` — a
    `static` function taking an object (or `null`) as its first
    argument and returning a new, empty object whose internal
    prototype link points at that argument.
  - *Its use:* this lesson uses it a second time, but for a different
    job than before — not to build an instance directly, but to build
    the *link between two constructors' `.prototype` objects*, so that
    `Circle`'s prototype chain actually reaches `Shape`'s prototype.
  - *Type:* a `static` function on the `Object` global — not a
    constructor, not an instance method.
  - *Responsibility:* to allocate a new, empty plain object and wire
    its internal prototype link to whatever was passed as the first
    argument; it does not copy properties from that argument.
  - *Depends on:* the object to use as the new object's prototype must
    already exist and be passed in as the first argument.
  - *Connects to:* called directly in this lesson's own top-level code,
    with `Shape.prototype` as its argument; its return value is
    assigned to `Circle.prototype`, replacing the plain object the
    engine auto-created for `Circle` when the function was defined.
  - *Shape:* a public, standard-library API surface — the same
    primitive this lesson's own `new` operator is itself built on top
    of internally, which is exactly why it reappears here.
- **`Object.getPrototypeOf`**
  - *What it is:* a built-in static function that reads back an
    object's internal prototype link.
  - *Implementation:* `Object.getPrototypeOf(obj)` — a `static`
    function taking one object argument and returning whatever object
    (or `null`) that object's internal prototype link currently points
    to.
  - *Its use:* this lesson uses it twice as proof — once to confirm
    that `new Shape(...)` really links a new instance to `Shape`'s own
    `.prototype` object, and again to confirm that `Circle`'s prototype
    chain really does reach `Shape.prototype` after this lesson's
    manual chaining step.
  - *Type:* a `static` function on the `Object` global.
  - *Responsibility:* strictly read-only inspection of the internal
    prototype link; it never modifies the object it's given.
  - *Depends on:* any single object to inspect.
  - *Connects to:* called on values produced by `new`, with its return
    value compared by identity (`===`) against a constructor's own
    `.prototype` object, to prove linkage rather than similarity.
  - *Shape:* a public, standard-library inspection API, used here for
    the same reason step 7's demystification standard requires it —
    turning a claim about invisible internal structure into something
    actually shown.
- **`Function.prototype.call`**
  - *What it is:* a real instance method that every function object
    has (because every function is itself an object, and every
    function object's own prototype chain includes
    `Function.prototype`), used to invoke that function with an
    explicitly chosen `this` value.
  - *Implementation:* `someFunction.call(thisArg, arg1, arg2, ...)` —
    an instance method, called on any function value, taking the
    desired `this` binding as its first argument and the function's
    ordinary arguments after that; it runs the function immediately and
    returns whatever the function returns.
  - *Its use:* this lesson uses it to run `Shape`'s own constructor
    logic — the part that sets `this.name` — with `this` pointing at
    the brand-new object `new Circle(...)` is currently building,
    instead of letting `Shape` build a separate object of its own.
  - *Type:* an instance method, available on every function value via
    `Function.prototype`.
  - *Responsibility:* to invoke the function it's called on exactly
    once, with the `this` value and arguments explicitly supplied by
    the caller — nothing about deciding *what* `this` should be; that
    decision belongs entirely to whoever calls `.call`.
  - *Depends on:* a function to call it on, and an explicit value to
    use as `this`.
  - *Connects to:* called from inside the `Circle` constructor, on the
    `Shape` function, passing `Circle`'s own in-progress `this` through
    to it — the two constructors end up cooperating on one object
    instead of each building their own.
  - *Shape:* a public, standard-library method every function
    inherits — a general-purpose tool, not something specific to
    constructors, that this lesson applies to the specific problem of
    constructor reuse.

---

## Concept Unit: The Constructor Function and the `new` Operator

### The Problem

Building one `circle` by hand earlier meant calling `Object.create`
once and then writing three separate property assignments underneath
it. That was fine for exactly one object. A second circle would mean
repeating all four lines again, by hand, with different values — and a
typo in one of the repeats (forgetting `radius`, say) wouldn't be
caught by anything; it would just silently produce a broken circle.

> **Try this before reading on:** if you needed to build five different
> circles, each with a different radius, using only what you already
> know (`Object.create`, plain assignment, and ordinary functions),
> what would you actually write? Could you wrap the repeated part in an
> ordinary function that takes a radius and returns a finished object?
> What would that function's body have to contain, line for line? Now
> look at the name `new` — a keyword you may have already typed without
> thinking about it (`new Date()`, `new Array()`) — what do you think a
> keyword with that name might be doing to a function call that a plain
> function call by itself doesn't do?

### Isolated Example

```js
function Point(x, y) {
  this.x = x;
  this.y = y;
}

const p = new Point(1, 2);
console.log(p.x, p.y);
console.log(Object.getPrototypeOf(p) === Point.prototype);
```

This is run for real, not predicted, because what `new` actually does
internally — specifically, what object `this` ends up bound to inside
the function body, and what `p`'s own prototype link actually points
at — is exactly the kind of invisible mechanism the Verification Rule
requires proof for rather than a confident sentence.

**Real output:**
```
1 2
true
```

The first line proves `this.x = x` and `this.y = y`, run inside
`Point`, ended up as own properties on `p` — meaning `this`, inside the
function body, was already bound to a real object *before* the
function's own code ran a single line. The second line proves that
object is linked, by identity, to `Point`'s own `.prototype` property —
not a coincidentally similar object, the exact same one. This
new-object-plus-prototype-link pair is exactly the two things
`Object.create` produced by hand earlier; `new` is what's called a
**constructor function** call here, and the automatic four-step
sequence it ran to produce both of those facts is called, precisely,
the **`new` operator**'s own algorithm.

This throwaway example is now discarded — `Point` never appears in the
project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition, exploring a second technique for the same shape hierarchy
  built earlier.
- **Files affected:** created — `constructor-shapes.js` (new file).
  This deliberately does not modify `shapes.js`; the `Object.create`
  version stays exactly as it was, so it can still be compared against
  this one directly, line for line, once both exist.
- **Change type:** add.
- **Location:** top of the new, empty file.
- **Dependencies:** none — plain JavaScript, no packages.

### The New Code

```js
function Shape(name) {
  this.name = name;
}

const s = new Shape("shape");
```

### The Updated Project

```js
1  function Shape(name) {   // ← new
2    this.name = name;      // ← new
3  }
4
5  const s = new Shape("shape");   // ← new
```

`constructor-shapes.js` now defines one constructor function, `Shape`,
whose entire job — for now — is to take a `name` and store it as an
own property on whatever object `new` hands it, and one call site,
`s`, proving the constructor actually runs and produces a real,
usable object.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`function Shape(name) { ... }` (lines 1–3).** Ordinary function
  syntax you already know — nothing here marks this function as
  special or different from any other function you could write. What
  makes it a **constructor function** (defined above, in Terms) is not
  syntax at all; it's the convention of the capitalized name `Shape`
  signaling intent, combined with how it's about to be called on line
  5.
- **`this.name = name` (line 2).** An ordinary property assignment —
  the same mechanism as any `obj.prop = value` you've already used —
  but written *inside* the function body, targeting whatever `this`
  turns out to be bound to at the moment this line actually runs, which
  depends entirely on how `Shape` gets called.
- **`new Shape("shape")` (line 5).** The **`new` operator** (defined in
  full in Terms, above) applied to a call to `Shape`. This is not an
  ordinary function call — writing `Shape("shape")` without `new` would
  run the exact same function body, but with `this` bound to something
  else entirely (either the global object or `undefined`, depending on
  strict mode — a case this lesson deliberately doesn't exercise,
  because it isn't the technique being taught). With `new` present, the
  engine runs its own four fixed steps before, during, and after
  calling `Shape`: it creates a brand-new empty object; it links that
  new object's internal prototype to `Shape.prototype` — the automatic
  object every function carries, defined above under **The `prototype`
  property**; it calls `Shape`'s own code with `this` bound to that new
  object, which is what makes line 2's `this.name = name` land on the
  right target; and finally, because `Shape`'s body doesn't explicitly
  return an object of its own, it returns that same new object as the
  overall value of the `new Shape("shape")` expression, which is what
  gets stored into `s`.

**Execution trace — timing, not changing values.** `new`'s own
algorithm is a fixed sequence of steps whose *order*, not any looping
or changing data, is the entire point:

1. `new Shape("shape")` begins — before any of `Shape`'s own code runs,
   the engine creates a brand-new, completely empty object. Nothing
   inside `Shape`'s body has executed yet.
2. That new object's internal prototype link is set to `Shape.prototype`
   — the object automatically attached to every function, distinct from
   `Shape` itself. This step is why `Object.getPrototypeOf` on the
   final result will report `Shape.prototype`, proven in the isolated
   example above.
3. `Shape`'s own body now runs, for the first time, with `this` bound
   to that new object — this is the moment `this.name = "shape"`
   actually executes, adding an own property to the object built in
   step 1.
4. `Shape`'s body finishes without an explicit `return` of its own
   object, so `new` returns the object from steps 1–3 as the value of
   the whole expression — this is what ends up stored in `s`.

### CS Lens

This is still the same **Prototype pattern** from before — objects
sharing behavior by delegating to a linked object at runtime — but
`new` adds a second, distinct idea on top of it: **object
initialization as a fixed protocol**, a guaranteed sequence of steps
(allocate, link, initialize, return) that runs identically no matter
what the constructor function's own body contains.

```
Also recognized in: a database ORM's row-hydration step (allocate
a blank model instance, then populate its fields from a query
result, in that fixed order), a game engine's entity-spawning
pipeline (allocate an entity slot, attach its component data, then
run its own init hook), Python's `__init__` running only after
`__new__` has already produced the object
```

### SE Lens

The alternative not chosen here is what Lesson 1 actually did: call
`Object.create` and perform every assignment by hand, at every call
site that needs a new object. That approach keeps every step fully
visible and inspectable at the point of use — nothing is implicit —
which is exactly why it was the right choice for a first lesson meant
to expose the mechanism. Its real cost is that the recipe has to be
retyped, correctly, at every single call site; nothing enforces that
two different call sites building two different circles actually agree
on which properties get set. A constructor function trades that
per-call-site visibility for a guarantee: every object built by calling
`new Shape(...)` went through the identical four-step process, with the
property-setting logic written exactly once, in one place, rather than
copy-pasted at every use. The cost that shows up later, once
inheritance enters the picture (as it does in this lesson's next unit),
is that `new`'s automatic steps are opaque *unless* you already know
the algorithm — a reader unfamiliar with it sees `new Shape("shape")`
and has to already know what those four steps are to predict what `s`
actually contains, which is precisely why this unit traced them
explicitly rather than asserting the result.

### Commands Needed

None yet — this lesson's code runs directly in a browser console or via
`node constructor-shapes.js`; no build step or package has been
introduced.

### Run It

```js
console.log(s.name);
console.log(Object.getPrototypeOf(s) === Shape.prototype);
```

**Real output:**
```
shape
true
```

The first line confirms `this.name = name` really did land on `s`
rather than being lost or misdirected. The second confirms `s`'s
internal prototype link really does point at `Shape.prototype` — the
same identity-based proof used in the isolated example above, now run
against the actual project code instead of throwaway code.

### Connecting to what came before

This unit rebuilds, with `new` doing the work automatically, the exact
same two facts that were produced by hand earlier: a new object with
its own properties, linked by prototype to a shared object. The next
unit adds the piece this one deliberately left out — a *second*
constructor, `Circle`, that needs to both reuse `Shape`'s own-property
setup and sit further down the same prototype chain.

---

## Concept Unit: Constructor Stealing and Chaining Two Prototypes

### The Problem

`Shape` alone can build shape objects with a `name`, but nothing about
`circle`-specific data — a `radius`, or an `area()` calculation — exists
yet. A second constructor, `Circle`, needs to both set up its own
`radius` *and* reuse whatever `Shape` already does for `name`, without
copying `Shape`'s own-property logic into `Circle`'s body by hand. And
for `describe()` (which lives, as before, on `Shape.prototype`) to work
on a `Circle` instance at all, `Circle`'s own prototype chain has to
somehow reach `Shape.prototype` — but every function's `.prototype`
property, including `Circle`'s, starts out as a fresh, empty,
unconnected object created automatically the moment the function is
defined; nothing links it to `Shape.prototype` on its own.

> **Try this before reading on:** you already have `Function.prototype
> .call` available conceptually — any function can be invoked with an
> explicitly chosen `this`. If `Circle`'s own constructor body could
> call `Shape`'s constructor body directly, passing along `Circle`'s
> own in-progress `this`, what would that accomplish for the `name`
> property, without writing `this.name = name` a second time inside
> `Circle`? Separately: `Circle.prototype` and `Shape.prototype` start
> out as two completely unrelated plain objects the moment each
> function is defined. What tool you already have from the previous
> lesson could you use to make one of those objects' own prototype link
> point at the other?

### Isolated Example

```js
function Animal(sound) {
  this.sound = sound;
}

function Dog(name) {
  Animal.call(this, "bark");
  this.name = name;
}

const d = new Dog("Rex");
console.log(d.sound, d.name);
```

Run for real, not predicted — whether `Animal.call(this, "bark")`
actually deposits `sound` onto the *same* object `Dog`'s own
`this.name = name` writes to, rather than onto some separate object
`Animal` builds for itself, is exactly the kind of claim about
invisible object identity the Verification Rule requires proof for.

**Real output:**
```
bark Rex
```

Both properties landed on one object, `d`, even though they were set
by two different functions' code. This proves `Animal.call(this, ...)`
did not build a new object of its own — it ran `Animal`'s own
`this.sound = sound` line against whatever `this` already was inside
`Dog`, which at that point was the same in-progress object `new Dog(...)`
had already allocated. This technique — calling one constructor from
inside another, with the second constructor's own `this`, so the first
one's setup logic runs against the second's object instead of building
a separate one — is called **constructor stealing**, sometimes also
called call-based inheritance.

This throwaway example is now discarded — `Animal` and `Dog` never
appear in the project again.

### Project Change

- **Reference Source:** No reference counterpart — a from-scratch
  addition.
- **Files affected:** modified — `constructor-shapes.js`.
- **Change type:** add (a second constructor, plus the chaining code
  that links it to the first).
- **Location:** appended after the `Shape` constructor and its
  `s` instance from the previous Concept Unit; the earlier code in the
  file is left exactly as it was.
- **Dependencies:** the `Shape` constructor function from the previous
  Concept Unit in this same lesson must already exist in the file.

### The New Code

```js
Shape.prototype.describe = function () {
  return `${this.name}, area ${this.area()}`;
};

function Circle(radius) {
  Shape.call(this, "circle");
  this.radius = radius;
}

Circle.prototype = Object.create(Shape.prototype);
Circle.prototype.constructor = Circle;

Circle.prototype.area = function () {
  return Math.PI * this.radius * this.radius;
};
```

### The Updated Project

```js
 1  function Shape(name) {
 2    this.name = name;
 3  }
 4
 5  const s = new Shape("shape");
 6
 7  Shape.prototype.describe = function () {        // ← new
 8    return `${this.name}, area ${this.area()}`;   // ← new
 9  };                                                // ← new
10
11  function Circle(radius) {          // ← new
12    Shape.call(this, "circle");      // ← new
13    this.radius = radius;            // ← new
14  }                                  // ← new
15
16  Circle.prototype = Object.create(Shape.prototype);  // ← new
17  Circle.prototype.constructor = Circle;               // ← new
18
19  Circle.prototype.area = function () {              // ← new
20    return Math.PI * this.radius * this.radius;      // ← new
21  };                                                   // ← new
```

`constructor-shapes.js` as a whole now defines two constructor
functions instead of one. `Shape` still builds a bare object with just
a `name`, and now also carries one shared method, `describe`, reachable
by anything whose prototype chain passes through `Shape.prototype`.
`Circle` builds a more specific object — reusing `Shape`'s own `name`
setup via constructor stealing, adding its own `radius`, and sitting on
a prototype chain that was manually re-pointed at `Shape.prototype` so
that both `describe` (inherited) and `area` (`Circle`'s own) are
reachable from any `Circle` instance.

### Mechanical Walkthrough

Enumerating every distinct syntactic element in the New Code block, in
order:

- **`Shape.prototype.describe = function () {...}` (lines 7–9).** An
  ordinary property assignment, but its target is notable: not `s`
  (one specific instance) and not `Shape` itself, but `Shape.prototype`
  — the automatic object described under **The `prototype` property**,
  above, that every instance built by `new Shape(...)` is linked to.
  Assigning here, once, means the method becomes reachable through
  **delegation** (defined in Terms) from every current and future
  `Shape` instance, without being copied onto any of them individually.
- **`${this.name}` and `${this.area()}` inside `describe` (line 8).**
  `this` here resolves the same way it always has — to whatever object
  `describe` is actually called *on*, not to `Shape` or
  `Shape.prototype` themselves. `this.area()` in particular is a
  forward reference to a method that doesn't exist on `Shape.prototype`
  at all — it only resolves successfully once `describe` is called on a
  `Circle` instance, whose own prototype chain supplies `area`.
- **`function Circle(radius) { ... }` (lines 11–14).** A second
  constructor function, structurally identical in kind to `Shape` —
  ordinary function syntax, made a **constructor function** purely by
  convention and by how it's called (with `new`, later in this lesson's
  Run It step), exactly as explained for `Shape` in the previous unit.
- **`Shape.call(this, "circle")` (line 12).** `Function.prototype.call`
  (given full treatment in the header's Objects and methods section,
  above), invoked on `Shape`. The first argument, `this`, is `Circle`'s
  own in-progress `this` — the new object `new Circle(...)` already
  allocated before this line ran, per the four-step algorithm from the
  previous unit. The second argument, `"circle"`, becomes `Shape`'s own
  `name` parameter. This is **constructor stealing** (defined in Terms,
  and proven in this unit's isolated example, above): `Shape`'s
  `this.name = name` line runs against `Circle`'s object, not a
  separate one.
- **`this.radius = radius` (line 13).** An ordinary own-property
  assignment, the same mechanism used throughout this lesson and the
  one before it — this one runs *after* line 12, so by the time it
  executes, the same `this` already carries the `name` property line 12
  just set.
- **`Circle.prototype = Object.create(Shape.prototype)` (line 16).**
  Two things happen here, worth separating even though they're one
  line. First, `Object.create(Shape.prototype)` (full CRC treatment in
  the header, above) builds a brand-new, empty object whose own
  internal prototype link points at `Shape.prototype`. Second, an
  ordinary assignment (the same mechanism as any `obj.prop = value`)
  replaces `Circle`'s automatically-created `.prototype` object
  entirely with that new one — the plain object the engine gave
  `Circle` for free when the function was defined is discarded and
  never used again. This is the step that actually chains the two
  constructors' prototype objects together: after this line,
  `Circle.prototype`'s own prototype is `Shape.prototype`, which is
  exactly the missing link the Problem, above, identified.
- **`Circle.prototype.constructor = Circle` (line 17).** An ordinary
  property assignment, fixing a side effect of the line before it.
  Every plain object the engine creates automatically carries a
  `constructor` property pointing back at whatever function built it;
  the object `Object.create(Shape.prototype)` just produced on line 16
  has its own `constructor` pointing at `Object` itself, not `Circle` —
  because nothing about `Object.create`'s own job (rebuilding a link,
  not tracking which function eventually adopts the result) sets that
  correctly. This line manually restores the expectation that
  `someCircleInstance.constructor` reports `Circle`, not `Object`.
- **`Circle.prototype.area = function () {...}` (lines 19–21).** The
  same shared-method-on-prototype pattern as `describe` on line 7-9,
  applied to `Circle.prototype` instead of `Shape.prototype` — placed
  here, on the prototype, rather than as an own-property assignment
  inside the constructor (the way `circle.area` was built by hand
  earlier), so that every `Circle` instance shares one `area` function
  instead of each carrying its own separate copy.
- **`Math.PI * this.radius * this.radius` (line 20).** `Math.PI`, a
  built-in numeric constant computed once by the engine, never a
  function or object with behavior of its own; `this.radius` resolves
  through `this` to whatever `Circle` instance `area` is actually
  called on, reaching the value line 13 set; ordinary multiplication,
  already familiar from your existing background, computes the result.

### CS Lens

This unit is still the **Prototype pattern** underneath everything, but
constructor stealing plus manual prototype chaining together form what
JavaScript programmers, before `class` existed, called **pseudoclassical
inheritance** — simulating a class hierarchy's two separate concerns
(shared, inherited behavior via the prototype chain; per-instance state
via constructor logic) using two distinct mechanisms glued together by
hand, because the language itself offered no single keyword for either
concern until later.

```
Also recognized in: C's manual vtable-pointer wiring before C++
added virtual dispatch as a language feature, early Java-to-C
compilers hand-generating v-tables the same way, any framework's
"mixin" utility that copies or links behavior onto an object at
runtime instead of through a language-level `extends`
```

### SE Lens

The alternative not chosen here is what the next lesson in this series
does instead: `class Circle extends Shape { ... }`. That syntax
performs both of this unit's manual steps — constructor stealing and
prototype chaining — automatically, behind `extends` and `super(...)`.
The real tradeoff: writing it by hand, as this unit just did, makes
every piece of the mechanism a separate, visible, individually-editable
line — nothing is hidden, and nothing happens that this lesson's own
code didn't explicitly cause. The cost is exactly what this unit's
walkthrough had to spend most of its length on: two easy-to-miss steps
(the `.constructor` reassignment on line 17, and the exact ordering of
`Shape.call` before `this.radius = radius` on lines 12–13) that `class`
syntax will handle automatically and correctly every time, but that
hand-written code silently gets wrong if either line is forgotten or
reordered — a `Circle` instance would still mostly work, `describe()`
included, even with line 17 deleted, which is exactly the kind of quiet
correctness bug that's expensive to notice later.

### Commands Needed

None yet — still runnable directly via `node constructor-shapes.js` or
a browser console; no build step or package has been introduced.

### Run It

```js
const c = new Circle(4);
console.log(c.describe());
console.log(Object.getPrototypeOf(Circle.prototype) === Shape.prototype);
console.log(c.constructor === Circle);
```

**Real output:**
```
circle, area 50.26548245743669
true
true
```

The first line proves the whole chain works end to end: `describe`
(defined only on `Shape.prototype`) and `area` (defined only on
`Circle.prototype`) both resolved correctly for one `Circle` instance,
and `name` (set via constructor stealing) and `radius` (set directly)
both had the right values. The second line proves the manual chaining
on line 16 actually took effect — `Circle.prototype`'s own prototype
really is `Shape.prototype`, by identity. The third line proves the
`.constructor` fix on line 17 worked — without it, this would have
printed `false`, reporting `Object` instead of `Circle`.

### Connecting to what came before

This unit's `Circle` is doing, by hand and in two separate steps
(constructor stealing, then manual prototype chaining), exactly what
the previous unit's plain `new Shape(...)` did in one automatic step
for a hierarchy with no parent to reach — the same underlying
prototype-linking mechanism from the very first lesson, now stacked two
levels deep and stitched together by explicit code instead of a single
built-in step.

---

## Connect the Pieces

One value, traced start to finish: the literal `4`, passed as
`new Circle(4)`. Before `Circle`'s own body runs at all, `new` already
completed its first two automatic steps — allocating a brand-new empty
object and linking that object's internal prototype to
`Circle.prototype` (which itself, thanks to this lesson's manual
chaining step, is separately linked onward to `Shape.prototype`).
`Circle`'s body then runs with `this` bound to that new object: first,
`Shape.call(this, "circle")` reuses `Shape`'s own logic to set `name`
directly on it; then `this.radius = radius` stores the `4` as a second
own property on that same object. Calling `.describe()` afterward walks
the prototype chain twice in one expression — once to find `describe`
itself (not on the instance, not on `Circle.prototype`, found on
`Shape.prototype`), and, inside that method, a second time to find
`area` (not on the instance, not on `Shape.prototype`, found on
`Circle.prototype`) — which is the method that finally reads the `4`
back out of `this.radius` to compute the area. One number, stored once,
reached through two constructors and two levels of a prototype chain
built entirely by hand.

## What's Next

Lesson A3 rebuilds this same two-level hierarchy a third time using
`class`, `extends`, and `super` — and proves, using
`Object.getPrototypeOf` exactly as this lesson did, that it compiles
down to the identical prototype-chain structure this lesson just built
by hand, rather than some different mechanism hidden behind nicer
syntax.
