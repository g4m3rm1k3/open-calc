# Lesson 6b: Nested Classes, and What `static` Actually Changes

**What you will build:** Nothing added to Pocket Inventory yet — two
throwaway labs, run outside the Android project. The transferable
problem: the `ViewHolder` you're about to build (Lesson 6c) lives
*inside* `InventoryAdapter` — a class defined inside another class.
Java allows this, but a nested class can be written two different ways
with a real behavioral difference between them, and the keyword that
decides which one you get is the same `static` keyword you've already
seen used to mean something else entirely, on `main` itself. Both uses are worth seeing together, once, rather than
guessing at `static`'s meaning fresh each time it reappears.

**What you need to know first:** Lesson 2a (class, object, `new`,
fields, instance methods, constructors, `this`) and Lesson 1 (`static`
on `main`, briefly: "belongs to the class, callable with no object").
This lesson explains `static` completely for the first time.

**Terms introduced in this lesson:**
- **Non-static nested class** (also called an **inner class**) — a
  nested class whose instances each hold a hidden reference to the
  specific enclosing-class instance that created them.
- **Static nested class** — a nested class marked `static`; its
  instances hold no reference to any enclosing instance at all.
- **Qualified class instance creation expression** (Java Language
  Specification §15.9) — `expr.new ClassName()`; an existing object
  supplies the new object's enclosing instance.
- **Unqualified class instance creation expression** (JLS §15.9) — the
  ordinary `new ClassName()` form; no enclosing instance involved.
- **Enclosing instance** — the specific outer-class object a non-static
  nested class's hidden reference points to.
- **`this$0`** — the actual compiler-generated field (confirmed via
  `javap`) that stores the enclosing instance.
- **Static field** (also called a **class variable**) — a field
  declared with `static`; exactly one copy exists, shared by every
  instance of the class, rather than one copy per instance.

---

## Concept Unit: Nested Classes — `Inner` Versus `static Inner`

### The Problem

A class can be declared *inside* another class's body — a **nested
class**. Java gives you two different versions of this, and they
behave differently in a way that matters for what you're about to
build: whether the nested class secretly carries a reference back to
the specific outer object that created it, or not.

### Introduce the Concept in Isolation

Create a folder for this lesson's labs (plain folder, no `package`
line needed — same convention as every lab so far). Inside it, create a file named `Outer.java`:

```java
class Outer {
    private int secret = 42;

    class Inner {
        void reveal() {
            System.out.println("Inner can see Outer's secret: " + secret);
        }
    }

    static class StaticNested {
        void reveal() {
            System.out.println("StaticNested has no access to any Outer instance's fields");
        }
    }
}
```

`Outer` has no `public` and no `main` — it's a package-private class
that exists only to be used by the file below, which is
where `main` lives.

In the same folder, create `NestedDemo.java`:

```java
public class NestedDemo {
    public static void main(String[] args) {
        Outer outer = new Outer();

        Outer.Inner inner = outer.new Inner();
        inner.reveal();

        Outer.StaticNested nested = new Outer.StaticNested();
        nested.reveal();
    }
}
```

Compile and run this yourself:

```
javac Outer.java NestedDemo.java
java NestedDemo
```

Real output — verified this session:

```
Inner can see Outer's secret: 42
StaticNested has no access to any Outer instance's fields
```

### Execution Trace — Why `Inner` Can Reach `secret` With No Parameter

Prose asserting "`Inner` secretly holds a reference" isn't proof — walking
every line of `NestedDemo.main` in order, and saying exactly what the
compiler does at each one, is:

1. `Outer outer = new Outer();` — builds a real `Outer` object in memory,
   its `secret` field already set to `42`.
2. `Outer.Inner inner = outer.new Inner();` — builds a real `Inner`
   object, but tied to this specific `outer`: the `outer.new` syntax is
   what hands the new `Inner` a hidden, invisible reference back to
   `outer` — nothing in `Inner`'s own field list shows this reference
   exists, because the compiler generated it, not you. This exact shape
   — an existing object, `.`, then `new` — has an official name in the
   Java Language Specification: a **qualified class instance creation
   expression**. "Qualified" specifically means *qualified by an
   existing object* placed before `.new`; that object is what the spec
   calls the new `Inner`'s **enclosing instance**.
3. `inner.reveal();` — runs `Inner.reveal()`'s body,
   `System.out.println("Inner can see Outer's secret: " + secret)`.
   `secret` resolves through that hidden reference straight to `outer`'s
   own field — this is the exact line where the hidden reference
   actually gets used, printing `Inner can see Outer's secret: 42`.
4. `Outer.StaticNested nested = new Outer.StaticNested();` — builds a
   `StaticNested` object with the standard `new ClassName()` form used
   everywhere else in this curriculum so far — the spec's name for
   *this* shape is an **unqualified class instance creation
   expression**, "unqualified" meaning exactly the opposite of step 2:
   no existing object supplies an enclosing instance, because none is
   needed. Called "ordinary `new`" from here on, now that it has a real
   name to be "ordinary" in contrast *to*.
5. `nested.reveal();` — runs `StaticNested.reveal()`'s body, which
   prints its own fixed message and never touches `secret` — it
   *couldn't*, even if it wanted to, since step 4 never gave it any
   reference to an `Outer` instance to read from.

Step 2 asserted that `Inner`'s own field list shows no such reference —
worth proving, not trusting. `javap` is a JDK tool, installed alongside
`javac`, that reads a *compiled* `.class` file directly and prints
exactly what fields and methods actually ended up inside it — not what
the `.java` source shows, what the compiler actually produced, which
can genuinely differ:

```
javap -p Outer$Inner
```

(`-p` — show `private` members too; without it, `javap` hides anything
not `public`, and this hidden field is not `public`.)

Real output, this session:

```
Compiled from "Outer.java"
class Outer$Inner {
  final Outer this$0;
  Outer$Inner(Outer);
  void reveal();
}
```

`final Outer this$0;` — a real field, sitting in the compiled class,
that appears nowhere in `Outer.java`'s source. This is the hidden
reference from step 2, made visible: the compiler added it during
compilation, named it `this$0` itself (a name you are not allowed to
write by hand — `$` in an identifier is legal Java syntax, but this
exact name is reserved for compiler-generated code), and wired
`Inner`'s constructor to accept and store an `Outer` the moment you
write `outer.new Inner()`. Compare against the class with no hidden
reference:

```
javap -p Outer$StaticNested
```

```
Compiled from "Outer.java"
class Outer$StaticNested {
  Outer$StaticNested();
  void reveal();
}
```

Zero fields — matching exactly what's written in `StaticNested`'s
source, because there's no hidden reference for the compiler to add.

One more thing worth proving about `this$0`, not just its existence:
is it a live link to `outer`, or a frozen copy of `outer`'s state at
the moment `Inner` was built? `secret` is `private`, so `NestedDemo`
can't reach it directly. Try it — add this one line to
`NestedDemo.main`, after the existing `inner.reveal();` call:

```java
outer.secret = 999;
```

```
javac NestedDemo.java
```

Real compiler output, this session — this fails to compile:

```
NestedDemo.java:7: error: secret has private access in Outer
        outer.secret = 999;
             ^
1 error
```

Delete that line again. Mutating `secret` needs a real path through
`Outer`'s own code, exactly like production code would use. Add one
method to `Outer`, back in `Outer.java`:

```java
void setSecret(int value) {
    secret = value;
}
```

Then add two lines to `NestedDemo.main`, after the existing
`inner.reveal();` call — mutating `secret` through `outer` directly,
then reading it back through `inner`, deliberately through two
different paths:

```java
outer.setSecret(999);
inner.reveal();
```

Real output, this session:

```
Inner can see Outer's secret: 42
Inner can see Outer's secret: 999
```

The second call prints `999`, not `42`, even though the mutation went
through `outer` and the read went through `inner` — proof `this$0` holds a
genuine object *reference*, the same kind every non-primitive field
in Java holds, not a snapshot of `secret`'s value taken back when
`Inner` was constructed. `final Outer this$0;`'s `final` only means
`this$0` itself can never be reassigned to point at a *different*
`Outer` object — it says nothing about that one `Outer` object's own
fields being frozen. This is the same reference semantics already
proven for any object field in this curriculum; nothing about it
being compiler-generated or hidden changes how references normally
behave.

Notice `outer.new Inner()` — genuinely unusual-looking syntax, and
worth seeing why it's required. In the same folder, create a third
file, `BadNested.java`, trying to create an `Inner` the way you'd
expect, with no `Outer` instance involved:

```java
public class BadNested {
    public static void main(String[] args) {
        Outer.Inner inner = new Outer.Inner();
    }
}
```

```
javac BadNested.java
```

Real compiler output, this session — this fails to compile:

```
BadNested.java:3: error: an enclosing instance that contains Outer.Inner is required
        Outer.Inner inner = new Outer.Inner();
                            ^
1 error
```

What this proves: a non-static (`Inner`) nested class silently carries
a hidden reference to *the specific `Outer` instance that created it* —
that's how `reveal()` reaches `secret` with no parameter passed at all
— and the compiler refuses to create one without that instance existing
first. `StaticNested`, by contrast, carries no such hidden reference:
it can be created with a plain `new`, and it has no way to reach any
particular `Outer`'s fields at all, even if it wanted to.

### Mechanical Walkthrough

- `class Inner { ... }` declared inside `Outer`'s body — **first
  appearance of a non-static nested class.** Every instance of `Inner`
  is tied to exactly one instance of `Outer`, created through it.
- `outer.new Inner()` — **first appearance of this syntax**, named in
  the execution trace above: a **qualified class instance creation
  expression**. Read as "ask this specific `outer` object to build me
  an `Inner` tied to itself" — the object before `.new` supplies the
  enclosing instance `reveal()` needs.
- `static class StaticNested { ... }` — **first appearance of a static
  nested class.** The `static` keyword here means "this nested class
  does *not* get a hidden reference to any enclosing `Outer` instance
  — it's really just an ordinary class that happens to be organized
  inside `Outer` for namespacing/grouping purposes."
- `new Outer.StaticNested()` — **first appearance of this syntax**, also
  named above: an **unqualified class instance creation expression** —
  no enclosing object needed — `Outer.StaticNested` is just this
  class's full name, the same way `Outer` groups it, the same shape as
  `R.layout` naming a nested class by its outer class's name.
- `secret` read directly inside `Inner.reveal()` with no `outer.`
  prefix — **reappearing** (a field read), worth naming
  precisely here: this only works because of `Inner`'s hidden
  reference; `StaticNested.reveal()` has no equivalent way to reach
  `secret` at all, which is exactly why its own version prints a
  different message.

### CS Lens

A nested class is Java's version of **namespacing combined with
optional lexical closure** — `static class` is pure namespacing (group
this type under `Outer` for organization, nothing more); a non-static
inner class additionally captures its creating instance, similar in
spirit to a closure capturing variables from its surrounding scope in
JavaScript or Python, except here what's captured is an entire object,
not just one variable.

### SE Lens

**If `Inner` needs to reach `Outer`'s fields, why not just pass `Outer`
as an explicit constructor parameter instead of relying on the
compiler's automatic hidden reference?** You could — that's a real,
valid alternative, and it's exactly what `static class` plus a manual
constructor parameter amounts to. The automatic version's advantage is
brevity at every call site: `outer.new Inner()` is shorter than
threading a parameter through by hand, everywhere an `Inner` gets
built. The real cost is that the coupling becomes invisible — nothing
in `Inner`'s own declaration announces "I hold onto an `Outer`," a
reader has to already know the `class Inner` versus `static class
Inner` distinction to see it, and any `Inner` instance kept alive
longer than expected (stored in a list, held by a callback) silently
keeps its entire `Outer` alive too, memory the reader never explicitly
asked to hold onto. Default to `static` unless the nested class
genuinely, unavoidably needs its enclosing instance — the next unit's
`ViewHolder` decision is a real, concrete case of exactly that choice.

---

## Concept Unit: `static` on a Field — One Copy, Shared

### The Problem

`static` on a nested class (above) controls whether it holds a hidden
reference to an enclosing object. `static` on a field is a related but
distinct idea, worth seeing concretely rather than assumed to be "the
same thing."

### Introduce the Concept in Isolation

In the same folder (or a fresh one — this lab is independent), create
`Counter.java`:

```java
class Counter {
    static int totalCreated = 0;
    int id;

    Counter() {
        totalCreated++;
        id = totalCreated;
    }
}
```

Create `StaticDemo.java`:

```java
public class StaticDemo {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        Counter c = new Counter();

        System.out.println("a.id=" + a.id + ", b.id=" + b.id + ", c.id=" + c.id);
        System.out.println("Counter.totalCreated=" + Counter.totalCreated);
    }
}
```

Compile and run:

```
javac Counter.java StaticDemo.java
java StaticDemo
```

Real output — verified this session:

```
a.id=1, b.id=2, c.id=3
Counter.totalCreated=3
```

#### Execution Trace

Three constructions, one shared value climbing, three separate `id`
fields each frozen at a different moment:

1. `Counter a = new Counter();` — runs the constructor, which
   increments the one shared `totalCreated` (`0 → 1`) before copying
   that value into `a`'s own `id` — because `id` is a plain,
   non-`static` field, this copy belongs to `a` alone.
2. `Counter b = new Counter();` — runs again, incrementing that same
   shared `totalCreated` (`1 → 2`) — since there is only one
   `totalCreated` for the whole class, not one per instance, `a`'s copy
   from step 1 is untouched by this call.
3. `Counter c = new Counter();` — runs a third time, incrementing
   `totalCreated` once more (`2 → 3`) into `c`'s own `id` — `a.id` and
   `b.id` stay frozen at `1` and `2` respectively, because each was
   copied once, at its own construction, and never recalculated
   afterward.

What this proves: `id` (no `static`) gets its own separate copy per
`Counter` instance — `1`, `2`, `3`, one each, exactly like the
independent `kitchen.isOn`/`bedroom.isOn` fields from before. `totalCreated` (`static`)
has exactly **one** copy, shared by every `Counter` that has ever been
created — each constructor call increments the *same* number before
copying its current value into that instance's own `id`, which is why
`a`, `b`, and `c` end up with three different frozen values while
`Counter.totalCreated` itself correctly reads `3`, addressable through
the class name rather than through any particular instance.

### Discard the Throwaway Example

Delete `Outer.java`, `NestedDemo.java`, `BadNested.java`, `Counter.java`,
and `StaticDemo.java` — the real project's own static nested class,
`InventoryViewHolder`, is built in the next lesson file (6c).

### Mechanical Walkthrough

- `static int totalCreated = 0;` — **first appearance of a static
  field.** Declared once, on the class, not once per object.
- `totalCreated++;` inside the constructor — **reappearing**
  (increment operator), now mutating the one shared copy —
  every `Counter` constructor call increments the *same* number.
- `id = totalCreated;` — **reappearing** (field assignment),
  reading the just-incremented shared value into this object's
  own, separate `id` field at the moment it's built.
- `Counter.totalCreated` — **first appearance of reading a static
  field through the class name.** No object needed, same shape as
  `Math`-style built-in constants — because there's exactly one copy,
  it doesn't belong to any particular `a`, `b`, or `c`.

### CS Lens

Both uses of `static` are really the same underlying idea, applied in
two different positions: **"belongs to the type itself, not to any one
instance of it."** A `static` field is shared, one copy, across every
instance — not "this object's own copy" like `id` is. A `static` nested
class is not tied to any one *enclosing* instance — it doesn't get the
hidden reference a non-static nested class does. Neither reads or
depends on "which particular object are we inside of right now"; that's
the one idea underneath both, and it's also exactly what made
`main` itself work in your very first program: `static` there meant
the JVM could call it with no object of your class existing yet.

Also recognized in: a database sequence/auto-increment column (shared,
class-level counter, same shape as `totalCreated`), a singleton's
single shared instance field (the pattern a shared database-connection
object will use later in this series), and any language's module-level
(as opposed to instance-level) variables.

### SE Lens

**Why would `InventoryViewHolder` — built in the very next lesson file
— want to give up the hidden reference to its enclosing `Adapter`,
isn't more access generally more useful?** Not here: a `ViewHolder`
only ever needs to know about the one row's own views, never about the
`Adapter` that built it. A non-static inner class would still compile
and work, but it would silently hold onto a reference to its specific
`Adapter` instance for the `ViewHolder`'s entire lifetime, for no actual
benefit — an unnecessary coupling, and, at real scale, an unnecessary
memory cost (as long as any single `ViewHolder` is kept alive, its
hidden enclosing reference keeps the whole `Adapter` alive too). `static`
here is a deliberate "this class genuinely doesn't need that," stated
directly rather than left as an accident of which syntax happened to be
used.

### Connection

`InventoryViewHolder`, next, is a `static` nested class for exactly this
reason — and later in this series, `static` reappears once more on a
field (a database's single shared instance) — the same
"shared, not per-instance" idea from `Counter.totalCreated` here,
applied to a real, larger design.

---

## Connect the Pieces

Both labs in this lesson prove the same underlying rule from two
angles: a `static` nested class and a `static` field both mean "this
belongs to the type itself, evaluated once, not recreated per
instance." `Inner` and `id` are the opposite case in each lab — tied
to one specific object. Holding both pairs in mind at once is what
makes `static class InventoryViewHolder` in the next lesson file read
as a decision, not a syntax rule to memorize.

## What Breaks Without This

In the `Counter` lab (before deleting it), remove the `static` keyword
from `totalCreated`, leaving `int totalCreated = 0;`. Recompile and
run. `Counter.totalCreated` no longer compiles at all — read the real
error (it will say something like "non-static field totalCreated
cannot be referenced from a static context"), because without
`static`, `totalCreated` is now a per-instance field like `id`, and
there is no single "the" `totalCreated` to reach through the class name
anymore. Restore `static` afterward, before deleting the lab per the
instructions above.

## Exercises

1. In the `Outer`/`Inner` lab, add a second field to `Outer`,
   `private String label = "outer-label"`, and have `Inner.reveal()`
   print it too, alongside `secret`. Confirm it works the same way
   `secret` did — no `outer.` prefix needed, thanks to the hidden
   reference.
2. Predict, then verify: if `StaticNested` tried to reference `secret`
   directly (add `System.out.println(secret);` inside its `reveal()`
   and attempt to compile), what happens? Read the real error and
   explain why in your own words.

## Definition of Done

- [ ] You ran the `Outer`/`Inner`/`StaticNested` lab and the `Counter`
      lab yourself and your output matched what's shown here.
- [ ] You triggered the real "enclosing instance ... required" error
      yourself.
- [ ] You can explain, concretely, both what `static` changes on a
      nested class and what it changes on a field — two related but
      distinct effects of the same keyword.
- [ ] No git commit for this lesson — nothing here becomes part of
      Pocket Inventory; everything was deleted per the instructions
      above.

Lesson 6c is next: `ViewHolder` — using exactly the `static class`
pattern from this lesson, for the exact reason the SE Lens above named.
