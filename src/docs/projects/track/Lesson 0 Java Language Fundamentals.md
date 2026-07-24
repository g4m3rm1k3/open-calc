# Lesson 0: The Java You Need Before Any of This Makes Sense

**What you will build:** Nothing that survives — every example in this
lesson is a throwaway console program, run once, deleted, never touched
again. Lesson 1 is where Pocket Inventory actually starts. The problem
this lesson solves is narrower and more important than any single
feature: Lessons 1 onward assume you can read Java syntax fluently
enough that a new *Android* idea doesn't get lost behind unfamiliar
*Java* syntax standing next to it. That assumption was wrong the first
time this track was written, and this lesson exists to actually make it
true.

**What this lesson assumes you already know**, from Python and from
whatever stuck from your Java class — and will *not* re-explain: what a
variable, a loop, an `if` statement, and a string are; what a function
and a method are, in their plain form; what a class is, in its plain
form (a blueprint for objects with fields and methods); and basic
inheritance as an idea (a child type extending a parent type). If any
of those feel shaky too, that's fine — they'll still make sense from
context — but this lesson's actual job is everything past that line:
the specific Java syntax and semantics that have no clean Python
equivalent, or that look enough like something Python has to be
genuinely misleading.

**What you need to know first:** Nothing. This is the real starting
point.

---

## Concept Unit: Access Modifiers — `public`, `private`, `protected`

### The Problem

Python has no real enforcement for "this belongs only to this class" —
the underscore-prefix convention (`self._internal`) is a social
agreement, not something the language stops you from breaking; nothing
prevents outside code from reading or writing `obj._internal` anyway.
Java's access modifiers are not a convention. They're checked by the
compiler, and code that violates them simply does not compile.

### Introduce the Concept in Isolation

```java
class Wallet {
    public int visibleBalance;
    private int hiddenPin;
}

public class AccessDemo {
    public static void main(String[] args) {
        Wallet wallet = new Wallet();
        wallet.visibleBalance = 100;
        System.out.println(wallet.visibleBalance);
        wallet.hiddenPin = 1234; // try this and see what happens
    }
}
```

Compile it:

```
javac AccessDemo.java
```

Real output:

```
AccessDemo.java:11: error: hiddenPin has private access in Wallet
        wallet.hiddenPin = 1234;
              ^
1 error
```

Delete the offending line and it compiles and runs fine, printing `100`.

*What this proves:* `public` means any code, anywhere, can read or write
that field directly. `private` means only code *inside the same class*
(`Wallet` itself) can touch it — not even a subclass, and not code in
the same file that happens to be a different class. This is checked
before your program ever runs, the same "the compiler refuses broken
programs" behavior from the very first thing any Java-focused lesson
should have told you and didn't loudly enough: Java catches this class
of mistake at compile time; Python would have let `wallet.hiddenPin = 1234`
succeed silently, whether or not that was ever a good idea.

There's a third, unmarked option, worth seeing once:

```java
class Wallet {
    int packagePrivateBalance; // no modifier at all
}
```

No modifier at all (not `public`, not `private`) means **package-private**
— visible to any class in the same package (the same folder-matching
namespace from how Java organizes files), invisible outside it. You'll
see this used deliberately in real project code — a field left
unmarked on purpose so a tightly-related helper class in the same
package can reach it directly, without the ceremony of a getter.

`protected` is a fourth option: like package-private, plus visible to
subclasses even in a different package. You'll see it far less often in
this project; it's named here so the word isn't a mystery the one time
it appears.

### Discard the Throwaway Example

Delete `AccessDemo.java` and `Wallet`. Neither appears again — every
real class in this project (starting with `Item` in Lesson 7) uses these
exact four options for real fields, and now the choice between them is a
real decision you can read, not a magic word to copy.

### CS Lens

This is **encapsulation**, enforced by the compiler rather than by
convention — controlling which parts of a system are allowed to depend
on which other parts. Also recognized in: any language with a real
`private` keyword (C++, C#, TypeScript's `private`), REST APIs
distinguishing public endpoints from internal-only ones, and file
system permission bits.

### SE Lens

Why would you ever want a field *less* accessible than `public`, when
`public` always works? Because a `public` field can be changed by
literally any code anywhere, with zero warning if that turns out to be
wrong later — reducing visibility to exactly what's needed is what
lets a class's author change its internals later without silently
breaking code elsewhere that was never supposed to depend on them. The
real cost: more ceremony (getters/setters, covered properly in Lesson
7) for something a `public` field would let you skip.

---

## Concept Unit: `static` — Belongs to the Class, Not the Object

### The Problem

Every method you've called so far, in Python or Java, ran *on* some
specific object (`wallet.visibleBalance`, `"hello".upper()`). Java has a
second category entirely: things that belong to the *class itself*,
existing exactly once, with no object required to reach them at all.
Python's closest cousin — `@staticmethod` — looks similar but is used
far less centrally than Java's `static`, which you will see on the very
first line of code in this entire curriculum
(`public static void main(String[] args)`) and have never had explained.

### Introduce the Concept in Isolation

```java
class Counter {
    int instanceCount = 0;      // belongs to each object separately
    static int totalCreated = 0; // belongs to the class itself, shared

    Counter() {
        instanceCount++;
        totalCreated++;
    }
}

public class StaticDemo {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        Counter c = new Counter();

        System.out.println(a.instanceCount);       // this object's own count
        System.out.println(Counter.totalCreated);   // the class's shared count
    }
}
```

Run it:

```
javac StaticDemo.java
java StaticDemo
```

Real output:

```
1
3
```

*What this proves:* `a.instanceCount` is `1` because it's `a`'s own,
private copy — every `Counter` object gets its own `instanceCount`,
starting at `0`. `Counter.totalCreated` is `3` because there is only
ever **one** `totalCreated`, shared by every `Counter` that has ever
been created — notice it's read as `Counter.totalCreated`, off the
*class name*, not off any specific object, because it doesn't belong to
any specific object.

Now the payoff — explain `public static void main(String[] args)`,
finally: `static` here means the Java runtime can call `main` **without
ever constructing an object of your class first** — exactly the problem
a program's true entry point has: nothing exists yet to call a method
*on*, so the very first method that runs has to be one that doesn't
need an object at all.

### Discard the Throwaway Example

Delete `StaticDemo.java` and `Counter`. `static` itself isn't
discarded — you'll see it on utility methods, constants, and (starting
Lesson 13) the Singleton pattern for `AppDatabase.getInstance(...)`,
where `static` is exactly what lets you call it without an instance in
hand yet.

### CS Lens

This is the distinction between **class-level state** and
**instance-level state** — one shared value versus one value per object.
Also recognized in: C#'s identical `static` keyword, C++'s `static`
class members, and even outside OOP entirely — a module-level global
variable in Python (shared across every use of that module) is
conceptually the class-level case; a local variable inside a function
call is the instance-level case.

### SE Lens

Why not make everything `static` and skip constructing objects at all?
Because `static` state is **global** — every single caller shares the
exact same value, with no way to have two independent `Counter`s
tracking different things. Instance fields exist specifically because
most real data (an inventory item's name, a specific button's click
count) genuinely needs its own independent copy per object; `static`
is the deliberate, narrower exception for the rarer case where sharing
is actually correct.

---

## Concept Unit: `final` — Three Different Promises, Same Keyword

### The Problem

Python has no real equivalent to this at all — not even a convention as
strong as Java's. `final` means something different depending on what
it's attached to, and all three meanings matter in this project.

### Introduce the Concept in Isolation

```java
public class FinalDemo {
    public static void main(String[] args) {
        final int maxAttempts = 3;
        // maxAttempts = 5; // uncomment this line and try to compile
        System.out.println(maxAttempts);
    }
}
```

Run it as written — prints `3`. Uncomment the second line and try to
compile:

```
javac FinalDemo.java
```

Real output:

```
FinalDemo.java:4: error: cannot assign a value to final variable maxAttempts
        maxAttempts = 5;
        ^
1 error
```

*What this proves, for `final` on a local variable:* the value can be
set exactly once, at declaration, and never reassigned — the compiler
enforces it, not a comment saying "don't change this."

The other two meanings, seen without a full lab (you'll meet the real
versions in project code):

- `final` on a **field** (`private final String name;`) — the exact same
  "assigned once" rule, just scoped to an object's field instead of a
  local variable: it can be set in the constructor and never reassigned
  afterward, for the life of that object.
- `final` on a **method** (`public final void save() { ... }`) — a
  completely different meaning: this method cannot be overridden by any
  subclass. Not "the value can't change" — "the *behavior* can't be
  replaced by inheritance."
- `final` on a **class** (`public final class Item { ... }`) — the class
  itself cannot be subclassed at all, by anyone.

### Discard the Throwaway Example

Delete `FinalDemo.java`. `final` recurs constantly starting with
`Item`'s fields in Lesson 7 — now it's a deliberate choice you can read,
not a keyword you're trusting means something reasonable.

### CS Lens

This is **immutability**, enforced at compile time rather than by
discipline — a value, once set, is guaranteed (by the compiler, not by
promise) never to change again. Also recognized in: JavaScript/
TypeScript's `const`, Rust's default-immutable bindings (you have to
explicitly opt *into* mutability there, the opposite default from
almost every other language), and functional programming's general
preference for values that never change over variables that do.

### SE Lens

Why mark something `final` instead of just... not reassigning it?
Because "I don't currently reassign it" and "this can never be
reassigned, checked by the compiler" are different guarantees — the
first can be silently broken by a future edit (yours, or a teammate's)
six months from now; the second cannot, because the compiler refuses to
build a version of the program that breaks it. The cost: you have to
know, at the moment you write a field or variable, whether it's ever
legitimately going to need a new value later — genuinely not always
obvious up front.

---

## Concept Unit: `extends` and `@Override`, in Java's Actual Syntax

### The Problem

You already know inheritance as an idea. What you likely don't have
solid yet is Java's specific syntax for it, which looks meaningfully
different from Python's `class Child(Parent):`.

### Introduce the Concept in Isolation

```java
class Animal {
    public String makeSound() {
        return "...";
    }
}

class Dog extends Animal {
    @Override
    public String makeSound() {
        return "Woof";
    }
}

public class InheritanceDemo {
    public static void main(String[] args) {
        Animal generic = new Animal();
        Animal dog = new Dog();
        System.out.println(generic.makeSound());
        System.out.println(dog.makeSound());
    }
}
```

Run it:

```
javac InheritanceDemo.java
java InheritanceDemo
```

Real output:

```
...
Woof
```

*What this proves:* `extends Animal` is Java's inheritance syntax — one
keyword, not Python's parenthesized-parent-class shorthand. `Dog`
**is an** `Animal`, which is why a variable *typed* as `Animal` (`Animal dog = new Dog();`)
is legal even though the actual object is a `Dog` — this is worth
sitting with, since it looks odd coming from Python's untyped
variables: the *declared type* (`Animal`) and the *actual object type*
(`Dog`) can differ, as long as the actual type is the declared type or
a subclass of it. `dog.makeSound()` still calls `Dog`'s version, not
`Animal`'s, because Java always calls the *actual* object's version at
runtime, regardless of what type the variable was declared as — this
specific behavior has a name, **polymorphism**, worth knowing since
you'll hear it again.

`@Override` — you'll now recognize this from real project code since
Lesson 2 — is not required for a method to actually override its
parent's version; it's a compiler-checked **assertion**: "I intend this
to override something in the parent." Delete `makeSound()` from
`Animal` entirely and try to compile `Dog` unchanged — with `@Override`
still present, you get a real compile error (`method does not override
or implement a method from a supertype`), because there's nothing left
to override. Without `@Override`, the exact same mistake — say, a typo,
`makeSond()` instead of `makeSound()` — would compile silently as a
brand-new, unrelated method that nothing ever calls, a real, hard bug to
notice. This is worth trying yourself: rename `Dog`'s method to
`makeSond()`, keep `@Override`, and watch it fail to compile with that
exact error — proof the annotation is doing real, checked work, not
decoration.

### Discard the Throwaway Example

Delete `InheritanceDemo.java`, `Animal`, and `Dog`. You'll see this
exact shape for real starting Lesson 2, where `MainActivity extends AppCompatActivity`.

### CS Lens

**Polymorphism** — the same method call producing different behavior
depending on the actual runtime type of the object, resolved
automatically, without an `if`/`elif` chain checking "what type is
this." Also recognized in: literally every OOP language's method
overriding (Python included — you've been using it without the name),
and, at a larger scale, plugin architectures where a host system calls
one method name and different plugins each supply their own behavior.

### SE Lens

Why does `@Override` exist at all, if the language would override the
method correctly without it? Because the *typo* case — a near-miss
method name that silently becomes an unrelated, dead method — is a real,
recurring bug in languages without this check (including Python, which
has no equivalent at all). `@Override` costs one line and catches an
entire category of silent mistake at compile time instead of leaving it
to be discovered — if ever — at runtime.

---

## Concept Unit: `interface` and `implements`

### The Problem

Python has no true equivalent — duck typing ("if it has a `.quack()`
method, treat it like a duck") gets you something similar informally,
but nothing in Python *enforces* that a class actually provides every
method a role requires. Java's `interface` does.

### Introduce the Concept in Isolation

```java
interface Flyer {
    void fly();
}

class Bird implements Flyer {
    @Override
    public void fly() {
        System.out.println("Flapping wings");
    }
}

class Airplane implements Flyer {
    @Override
    public void fly() {
        System.out.println("Jet engines");
    }
}

public class InterfaceDemo {
    public static void main(String[] args) {
        Flyer[] flyers = { new Bird(), new Airplane() };
        for (Flyer flyer : flyers) {
            flyer.fly();
        }
    }
}
```

Run it:

```
javac InterfaceDemo.java
java InterfaceDemo
```

Real output:

```
Flapping wings
Jet engines
```

*What this proves:* `interface Flyer { void fly(); }` declares a
**contract** — any method signature listed has no body at all here, just
a promise that anything implementing this interface will supply one.
`implements Flyer` is Java's keyword for "I promise to fulfill this
contract" — distinct from `extends` (one class inheriting from one
parent's real implementation); a class can `implements` **several**
different interfaces at once (not shown here, but legal —
`class Foo implements Flyer, Swimmer { ... }`), where it can only
`extends` one class, ever. `Bird` and `Airplane` share no code, no
common parent beyond `Object` — they only share a *promise* about what
methods exist, which is exactly what let the loop treat both uniformly
as `Flyer`s.

### Discard the Throwaway Example

Delete `InterfaceDemo.java`, `Flyer`, `Bird`, `Airplane`. You'll build
your own real interfaces starting Lesson 8 (`OnItemClickListener`), and
you're already using framework-defined ones — `View.OnClickListener`,
since Lesson 4 — without this explanation existing yet.

### CS Lens

This is **programming to an interface, not an implementation** — code
depends on *what something can do* (`fly()`), never on *how* it does it
or *what concrete type* it actually is. Also recognized in: TypeScript's
`interface`, C#'s `interface` (used identically), Python's `abc.ABC`
abstract base classes (a closer, if less commonly used, equivalent than
duck typing), and USB as a physical example — any device implementing
the USB "interface" plugs into any USB port, regardless of what's
actually inside it.

### SE Lens

Why not just use inheritance (`extends`) for this — have `Airplane` and
`Bird` both extend some common `FlyingThing` base class instead? Because
inheritance implies a real "is-a" relationship *and* shared
implementation — an `Airplane` and a `Bird` share almost nothing about
*how* they fly, only *that* they do. Forcing them under one shared
parent class purely to guarantee they both have a `fly()` method would
be modeling a false relationship just to get the guarantee an interface
gives you honestly. This is the real reason Java allows multiple
`implements` but only one `extends`: an object can honestly promise to
do many unrelated things, but can only meaningfully be "a kind of" one
specific other thing.

---

## Concept Unit: Nested Classes and `Outer.Inner` Names

### The Problem

Sometimes a class exists purely to serve one other class and has no
meaningful identity outside it. Python nests classes rarely enough that
it's not a habit you'll have brought with you. Java does this
constantly — you already have a real, unexplained example sitting in
Lesson 6: `InventoryViewHolder`, declared entirely inside
`InventoryAdapter`'s own braces.

### Introduce the Concept in Isolation

```java
class Toolbox {
    static class Wrench {
        void turn() {
            System.out.println("Turning");
        }
    }
}

public class NestedDemo {
    public static void main(String[] args) {
        Toolbox.Wrench wrench = new Toolbox.Wrench();
        wrench.turn();
    }
}
```

Run it:

```
javac NestedDemo.java
java NestedDemo
```

Real output:

```
Turning
```

*What this proves:* `Wrench` is declared entirely inside `Toolbox`'s
`{ }` — a **nested class**. From *outside* `Toolbox`, you cannot refer
to `Wrench` by itself; you have to write its full, dot-qualified name,
`Toolbox.Wrench` — both as the variable's declared type and after `new`.
Read `Toolbox.Wrench` literally, out loud, as "the `Wrench` class that
lives inside `Toolbox`" — it is not multiplication, not a typo, and the
dot is not the "call a method" dot from `wrench.turn()` on the next
line, even though it's the identical character. This is exactly the
shape behind `InventoryAdapter.InventoryViewHolder`: `InventoryViewHolder`
nested inside `InventoryAdapter`, referred to from outside by its full,
qualified name.

### Discard the Throwaway Example

Delete `NestedDemo.java`, `Toolbox`, `Wrench`. `Outer.Inner` naming
recurs for real the moment you reread Lesson 6's `InventoryAdapter`.

### CS Lens

Nesting is a **scoping/namespacing mechanism** at the class level —
grouping a helper type under the one type it exclusively serves, the
same instinct as a private helper function defined inside another
function in Python, just one level up, at the type level instead of the
statement level.

### SE Lens

Why nest `Wrench` inside `Toolbox` at all, instead of just making it its
own separate, top-level class — Java doesn't require nesting here, and a
top-level `Wrench` class would work identically? Nesting is a
**readability signal**, not a technical requirement: it tells anyone
reading the code "this type has no meaning or use outside its outer
class," discoverable directly from the file structure instead of a
comment or a naming convention. The real cost, worth naming honestly: it
makes the *name itself* longer and more visually dense at every use site
— exactly the `Outer.Inner` shape you found confusing — trading a small,
real readability cost at the call site for a clearer statement of intent
at the declaration site.

---

## Concept Unit: Generics — `List<T>` and Type Parameters

### The Problem

You've seen `List<String>`, `List<Item>` used without full explanation.
Python's `list` holds anything, mixed types included, with no
complaint until something actually breaks at the point of use. Java's
`List<T>` is checked at compile time, and the `<...>` part is doing real
work you haven't had explained.

### Introduce the Concept in Isolation

```java
import java.util.ArrayList;
import java.util.List;

public class GenericsDemo {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Alice");
        // names.add(42); // uncomment and try to compile

        String first = names.get(0);
        System.out.println(first.toUpperCase());
    }
}
```

Run it as written:

```
javac GenericsDemo.java
java GenericsDemo
```

Real output:

```
ALICE
```

Uncomment `names.add(42);` and recompile:

```
GenericsDemo.java:8: error: no suitable method found for add(int)
        names.add(42);
              ^
1 error
```

*What this proves:* `List<String>` isn't just "a list" — the `<String>`
is a **type parameter**, a compile-time promise that this specific list
will only ever hold `String`s. Adding an `int` where a `String` is
promised is rejected before the program ever runs — the exact static-
typing guarantee you've now seen apply to a collection, not just a
single variable. This is also *why* `names.get(0)` can be assigned
directly to a `String first` with no cast needed, and why
`first.toUpperCase()` — a `String`-only method — is safe to call without
first checking what type `first` actually is: the compiler already
knows, because the list promised it.

`List` itself is an **interface** (this lesson's previous concept,
reused immediately) — `ArrayList` is one concrete class that
`implements List`; you'll occasionally see other implementations, not
in this project, but worth knowing `List<String> names = new ArrayList<>();`
is "program to the interface" from the previous unit, applied for real.

### Discard the Throwaway Example

Delete `GenericsDemo.java`. `List<T>` and generics generally recur
constantly from Lesson 6 onward — `List<Item>`, later
`RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`, and
`LiveData<List<Item>>` are all this exact same idea, just with the type
parameter filled in differently each time.

### CS Lens

**Generic programming** — writing one implementation (`ArrayList`'s
internal code) that works correctly for any type, while still getting
full compile-time type checking for each specific use. Also recognized
in: C#'s identical `List<T>`, C++ templates (a more powerful, differently-
behaving cousin), TypeScript generics, and Python's `typing.List[str]`
type hints (which, unlike Java's, are *not* enforced at all by the
Python runtime — a real, meaningful difference worth sitting with:
Python's version is documentation for humans and tools; Java's is a
guarantee).

### SE Lens

Why not just have one `List` type that holds `Object` (Java's most
general type, similar to "anything") and let every caller cast values
back to their real type when reading them out, the way pre-generics
Java (and Python, informally) actually works? Because that pushes the
type-safety check from compile time to every single read site, by
hand, with a real runtime crash (`ClassCastException`) if any caller
gets it wrong — generics move that check to one place (the
declaration) instead of scattering it across every use.

---

## Concept Unit: Stacking It Together — a Nested Class as a Generic's Type Parameter

### The Problem

`RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`, from
Lesson 6, is not one new idea — it's the previous two units, generics
and nested classes, *combined*, and this project jumped straight to the
combined, real version without ever showing the combination build up in
smaller steps. This unit exists specifically to fix that gap. Every step
below changes exactly one thing from the step before it.

### Introduce the Concept in Isolation

Step one — a plain generic, already familiar:

```java
List<String> names = new ArrayList<>();
```

Step two — a plain nested-class reference, from the previous unit:

```java
Toolbox.Wrench wrench = new Toolbox.Wrench();
```

Step three — combine them: a nested class used *as* a generic's type
parameter, nothing else new:

```java
List<Toolbox.Wrench> wrenches = new ArrayList<>();
wrenches.add(new Toolbox.Wrench());
wrenches.get(0).turn();
```

Run this (recreating `Toolbox`/`Wrench` from the previous unit if you
deleted them):

```
javac StackedDemo.java
java StackedDemo
```

Real output:

```
Turning
```

*What this proves:* `List<Toolbox.Wrench>` reads exactly like
`List<String>` did — "a list that only ever holds this one type" — the
type happening to be a nested one, `Toolbox.Wrench`, changes nothing
about how generics work; the `<...>` doesn't care whether the type
inside it is a plain name or a dot-qualified one.

Step four — the actual real-project line, decomposed piece by piece:

```
RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>
└──────┬──────┘        └───────────┬──────────┘
  Outer.Inner              Outer.Inner
  (a class nested        (a class YOU nested
   inside RecyclerView,    inside YOUR
   from the Android         InventoryAdapter,
   framework itself)        Lesson 6)
```

Read outward to inward: this declares "a `RecyclerView.Adapter`" — one
`Outer.Inner` name, exactly like `Toolbox.Wrench` — "specialized to work
with `InventoryAdapter.InventoryViewHolder`" — a *second*, unrelated
`Outer.Inner` name, filling the generic's type parameter, exactly like
step three's `List<Toolbox.Wrench>`. Nothing in this line is a new
mechanism beyond what step three already showed — it's only visually
denser because *both* halves happen to be nested-class names at once,
one from a framework you didn't write, one from a class you did.

### Discard the Throwaway Example

Delete `StackedDemo.java`. Go back and reread Lesson 6's
`InventoryAdapter` class declaration now — it should read as "two
`Outer.Inner` names, one plugged into the other's generic slot," not as
an unfamiliar wall of punctuation.

### CS Lens

There's no new CS concept here — this unit exists specifically to prove
that **composition of already-understood rules** (generics compose with
*any* type, including a nested one) explains the whole real line,
without needing a third, undiscovered rule to make sense of it.

### SE Lens

Why does Android's own `RecyclerView` nest `Adapter` inside itself in
the first place, rather than leaving it a top-level class? The same
readability reasoning from the previous unit's SE Lens, applied by the
Android framework's own authors: `Adapter` has no meaning outside a
`RecyclerView`, so nesting it communicates that directly. You're not
looking at an unusually convoluted example — you're looking at the same
ordinary nesting convention, from two different authors (Google's
framework team, and you), landing in the same line by coincidence of
both following the same, reasonable convention.

---

## Concept Unit: Casting and `instanceof`

### The Problem

You'll see code like `(Item) other` and `other instanceof Item` in real
project code (Lesson 7's `equals()`). Neither has a Python equivalent
worth calling similar — Python simply never asks "what type is this
variable, as far as the compiler is concerned" in the first place.

### Introduce the Concept in Isolation

```java
public class CastingDemo {
    public static void main(String[] args) {
        Object mystery = "a real string";

        if (mystery instanceof String) {
            String realString = (String) mystery;
            System.out.println(realString.toUpperCase());
        }
    }
}
```

Run it:

```
javac CastingDemo.java
java CastingDemo
```

Real output:

```
A REAL STRING
```

*What this proves:* `Object mystery = "a real string";` declares a
variable with the most general possible type (`Object` — every class in
Java is, ultimately, a kind of `Object`), which means the compiler
*only* knows it's some `Object`, not that it's specifically a `String` —
calling `.toUpperCase()` directly on `mystery` would fail to compile,
since `Object` has no such method. `mystery instanceof String` — (a
runtime check, evaluated as the program runs, unlike most of this
lesson's compile-time checks) — asks "is the *actual* object this
variable currently refers to really a `String`?" `(String) mystery` is
the **cast**: "trust me, treat this as a `String` from here on" —
legal syntax regardless of whether it's actually true, which is exactly
why the `instanceof` check has to come first, defensively; casting
something that *isn't* actually that type throws a real
`ClassCastException` at the moment of the cast, not a silent wrong
answer.

### Discard the Throwaway Example

Delete `CastingDemo.java`. You'll see this exact `instanceof`-then-cast
pattern for real in Lesson 7's `Item.equals()` method.

### CS Lens

This is a **runtime type check** paired with an explicit **downcast** —
narrowing a general type (`Object`) back down to a specific one
(`String`), verified rather than assumed. Also recognized in: C#'s
identical `is`/cast pattern, TypeScript's type guards, and any
dynamically-dispatched system that has to ask "what am I actually
holding" before doing something type-specific with it.

### SE Lens

Why would a variable ever be declared as the vague `Object` in the
first place, instead of its real, specific type? Sometimes a method's
contract genuinely can't know the specific type ahead of time — `equals(Object other)`,
inherited from Java's own root class, has to accept literally anything,
since you can ask "is this string equal to this integer?" and expect a
sensible `false`, not a compile error. The cost of that generality is
exactly what this unit showed: the receiving code has to check and cast
before doing anything type-specific, work a more specific parameter type
would have made unnecessary.

---

## Concept Unit: Lambdas — `() -> { }`

### The Problem

Python has lambdas too (`lambda x: x + 1`), which makes this a real trap:
Java's lambdas look similar but work under meaningfully different
rules, and you've already been typing them since Lesson 4
(`v -> { ... }`) without this explanation existing.

### Introduce the Concept in Isolation

```java
interface Greeter {
    String greet(String name);
}

public class LambdaDemo {
    public static void main(String[] args) {
        Greeter formal = (name) -> "Good day, " + name;
        Greeter casual = name -> "Hey " + name + "!";

        System.out.println(formal.greet("Dr. Alvarez"));
        System.out.println(casual.greet("Sam"));
    }
}
```

Run it:

```
javac LambdaDemo.java
java LambdaDemo
```

Real output:

```
Good day, Dr. Alvarez
Hey Sam!
```

*What this proves:* `(name) -> "Good day, " + name` is shorthand for
"an object implementing `Greeter`, whose `greet` method does exactly
this" — Java's lambdas only work because `Greeter` is a **functional
interface**: an interface with *exactly one* abstract method. The
compiler infers, purely from context (`Greeter formal = ...`), which
interface and which method this lambda is actually implementing —
there's no way to write a Java lambda with no target type at all, unlike
Python's, which is just a value on its own. `name -> "Hey " + name + "!"`
drops the parentheses around a single parameter — legal shorthand, both
forms compile to the same thing. This is exactly what
`openButton.setOnClickListener(v -> { ... })` has been since Lesson 4:
`View.OnClickListener` is a functional interface (one method, `onClick`),
and `v -> { ... }` is shorthand for an object implementing it.

### Discard the Throwaway Example

Delete `LambdaDemo.java`, `Greeter`. Every click listener, every
`Runnable`, and Lesson 8's `OnItemClickListener` in this project use
this exact mechanism.

### CS Lens

This is **first-class functions treated as values** — a chunk of
behavior, assignable to a variable and passed around, the same core
idea Python's lambdas and functions-as-arguments already gave you, with
Java's specific restriction: it must always target exactly one abstract
method on some interface, never a bare, typeless function value.

Also recognized in: JavaScript arrow functions, C#'s lambda expressions
(`x => x + 1`, nearly identical syntax), and the general "pass behavior,
not just data" pattern behind every callback-based API you'll ever use.

### SE Lens

Why does Java require a target interface at all, instead of a lambda
just being a value like Python's? Because Java has no true standalone
function type — every value has to have *some* class or interface type,
even a chunk of behavior. Requiring a single-method interface as the
target is what lets the compiler know exactly what parameters and
return type the lambda must match, checked at compile time, the same
guarantee every other part of this lesson has been building toward.

---

## Concept Unit: Annotations — `@Something`

### The Problem

You've seen `@Override`, and later you'll see `@NonNull`, `@Entity`,
`@Test`. Python's decorators (`@staticmethod`) look identical in
syntax, and that similarity is misleading about what's actually
happening.

### The Concept, Briefly

An **annotation** is metadata attached to code — a class, method, or
field — read by the compiler, by a tool, or by a library, *not*
executed as part of your program's normal flow. `@Override` (this
lesson's earlier unit) is read by the compiler itself, at compile time,
to check a real condition. Later in this project, `@NonNull` is read by
Android Studio's static analysis tool, not the compiler; `@Entity`
(Lesson 13) is read by a separate code-generation tool at build time to
generate real database code; `@Test` (Lesson 30) is read by a test
runner to know which methods to execute. In every case, the annotation
itself does nothing on its own — some other tool has to be watching for
it and reacting.

This is the real, meaningful difference from Python's `@staticmethod`:
a Python decorator is actual, executable code that runs and can
transform the function it's attached to, at the moment the class body
executes. A Java annotation, by itself, changes nothing about how the
annotated code runs — it's inert unless read by something external.

### CS Lens

This is **declarative metadata**, read by tooling rather than executed
directly — the same underlying idea as HTML attributes read by a
browser, or a database column's constraint definition read by the
database engine rather than "run" as a program.

### SE Lens

Why put this information in an annotation instead of a comment, which a
human could read just as easily? Because a comment is invisible to
tooling — the compiler, Android Studio's analyzer, and Room's code
generator all genuinely *read* an annotation and act on it; none of
them parse a comment for meaning. Annotations are how a codebase talks
to the tools building and checking it, not just to the humans reading
it.

---

## Concept Unit: `try` / `catch` and Checked Exceptions

### The Problem

Python's `try`/`except` looks almost identical to Java's `try`/`catch`,
which is fair — the core idea transfers directly. What doesn't transfer
is Java's **checked exception** system: some methods force you, at
compile time, to acknowledge a specific failure is possible, in a way
Python never does.

### Introduce the Concept in Isolation

```java
public class ExceptionDemo {
    public static void main(String[] args) {
        String[] inputs = {"12", "not a number", "45"};

        for (String input : inputs) {
            try {
                int parsed = Integer.parseInt(input);
                System.out.println(input + " parsed as: " + parsed);
            } catch (NumberFormatException e) {
                System.out.println(input + " is not a valid number");
            }
        }
    }
}
```

Run it:

```
javac ExceptionDemo.java
java ExceptionDemo
```

Real output:

```
12 parsed as: 12
not a number is not a valid number
45 parsed as: 45
```

*What this proves:* `try { ... }` wraps code that might fail;
`catch (NumberFormatException e) { ... }` runs only if that specific
kind of failure happens, and the loop continues to the next item
regardless — the program never crashes, even on genuinely bad input.
`NumberFormatException` here is an **unchecked** exception — the
compiler doesn't force you to catch it; the program would compile fine
without the `try`/`catch` at all, and would simply crash at runtime the
first time bad input actually reached `Integer.parseInt`.

Java also has **checked** exceptions — a category unchecked exceptions
aren't part of — where the compiler refuses to build code that doesn't
either catch them or explicitly declare that it might throw them
onward. You'll meet a real one directly: `InterruptedException`, in
Lesson 14, attached to `Thread.sleep(...)`. The compiler-enforced
difference is real and worth remembering the name for when you hit it:
an unchecked exception is a *possible* runtime failure the compiler
trusts you to have already considered; a checked exception is one the
compiler refuses to let you forget about.

### Discard the Throwaway Example

Delete `ExceptionDemo.java`. This exact `try`/`catch` shape reappears
for real in Lesson 9's form validation.

### CS Lens

This is **structured exception handling** — a failure interrupts normal
control flow and transfers to a designated handler, rather than the
alternative (common in older or lower-level languages) of every
function needing to check a special error return value after every
single call. Also recognized in: Python's identical `try`/`except`,
JavaScript's `try`/`catch`, and — Java's specific checked-exception
twist — a function signature in Rust or Haskell that must declare it
can fail, checked by the compiler rather than trusted to documentation.

### SE Lens

Why does Java bother distinguishing checked from unchecked exceptions
at all, instead of treating every possible failure the same way? Checked
exceptions exist for failures a caller is expected to have a real,
different plan for — usually anything involving the outside world (a
file that might not exist, a network call that might time out) — where
silently ignoring the possibility would be a real bug. The cost, widely
considered a real design misstep even inside Java's own community: it's
easy to overuse checked exceptions for failures that don't actually
need this ceremony, which is part of why modern Java code (and this
project) leans on unchecked exceptions for most everyday validation.

---

## Concept Unit: Constructors, Overloading, and `this`

### The Problem

Python has exactly one constructor per class, `__init__`. Java allows
**several**, distinguished only by their parameter lists — and Java's
`this` is a different animal from Python's `self`: never a required
parameter, and legal to simply omit.

### Introduce the Concept in Isolation

```java
class Point {
    int x;
    int y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    Point() {
        this(0, 0); // calls the other constructor above
    }
}

public class ConstructorDemo {
    public static void main(String[] args) {
        Point origin = new Point();
        Point custom = new Point(5, 10);
        System.out.println(origin.x + "," + origin.y);
        System.out.println(custom.x + "," + custom.y);
    }
}
```

Run it:

```
javac ConstructorDemo.java
java ConstructorDemo
```

Real output:

```
0,0
5,10
```

*What this proves:* `Point` has **two** constructors — this is
**overloading**: same method name (a constructor always shares its
class's name), different parameter lists, and Java picks the right one
based purely on what arguments you actually pass at the call site
(`new Point()` versus `new Point(5, 10)`). `this.x = x;` uses `this` to
mean "the field on the object currently being constructed," needed
specifically because the parameter is *also* named `x` — without
`this.`, `x = x;` would just assign the parameter to itself, doing
nothing to the field at all, a real and easy mistake to make. `this(0, 0);`
is a different use of the same keyword: calling *another constructor on
this same class*, must be the very first line of a constructor if used
at all — this is exactly the mechanism `Item`'s convenience constructor
uses starting Lesson 13.

Worth naming plainly: Java's `this` is never a parameter you write in a
method's own signature, unlike Python's `self`, which every instance
method must declare explicitly as its first parameter. Java's `this`
exists implicitly inside every instance method and constructor, usable
whenever needed, never declared.

### Discard the Throwaway Example

Delete `ConstructorDemo.java` and `Point`. You've already met one
overloaded-constructor case without this explanation, in Lesson 8's
`Item(long id, ...)` alongside `Item(String name, ...)`.

### CS Lens

**Method overloading** — several methods (or constructors) sharing one
name, distinguished entirely by parameter type and count, resolved at
compile time based on what's actually passed. Also recognized in: C++
and C#'s identical overloading rules, and — a genuine, useful contrast —
Python's complete lack of this feature, where a redefined method with
the same name simply *replaces* the earlier one rather than coexisting
alongside it.

### SE Lens

Why offer several constructors instead of one with optional/default
parameters (which Java, unlike Python, doesn't support directly)?
Overloading is Java's actual mechanism for "this can reasonably be
constructed a couple of different ways" — a `Point()` with sensible
defaults, and a `Point(x, y)` for the general case — without needing a
single constructor riddled with `null` checks for "was this argument
actually provided." The cost: every overload is a genuinely separate
method signature to maintain, and Java offers no shorthand (like
Python's `def __init__(self, x=0, y=0):`) to collapse them into one.

---

## Concept Unit: Primitives Versus Objects (`int` vs. `Integer`)

### The Problem

In Python, everything is an object — `5` genuinely is an instance of
`int`, with methods and identity, no exceptions. Java has a real,
visible split you'll hit constantly: `int` is not an object at all;
`Integer` is a completely different type that wraps one.

### Introduce the Concept in Isolation

```java
public class PrimitiveDemo {
    public static void main(String[] args) {
        int primitive = 5;
        Integer wrapped = 5;

        System.out.println(primitive + 1);
        System.out.println(wrapped + 1);

        Integer missing = null; // legal — Integer is an object reference
        // int reallyMissing = null; // try uncommenting this
    }
}
```

Run it as written — both print `6`, no visible difference yet. Uncomment
the final line and try to compile:

```
PrimitiveDemo.java:10: error: incompatible types: <null> cannot be converted to int
        int reallyMissing = null;
                             ^
1 error
```

*What this proves:* `int` is a **primitive** — a raw value, not an
object, with no such thing as `null` for it; it always holds a real
number, minimum `0` if uninitialized as a field. `Integer` is a real
**object**, a thin wrapper around an `int` value, which — being an
object — genuinely can be `null`, meaning "no value at all," a concept
`int` cannot express. Java quietly converts between them for you in
common cases (`Integer wrapped = 5;` — this automatic conversion is
called **autoboxing**, worth knowing the name for), which is exactly
why this distinction is easy to miss until it matters: `List<int>`
would not compile at all — generics (this lesson's earlier unit)
require an object type, which is one real, concrete reason `Integer`
exists rather than everything just being `int`.

### Discard the Throwaway Example

Delete `PrimitiveDemo.java`. You'll meet this distinction for real in
Lesson 14's `Integer` return from a validation function (using `null`
specifically to mean "not a valid number," something an `int` return
could never express on its own).

### CS Lens

This is the general split between **value types** and **reference
types** — a primitive is copied by value every time it's assigned or
passed; an object reference is copied *as a reference*, both variables
then pointing at the same underlying object. Also recognized in: C#'s
identical `int`/struct versus class distinction, C's raw types versus
pointers, and — the cleanest real contrast — Python's total absence of
this split, where the value/reference distinction is hidden from you
entirely (immutable types like `int` behave *as if* copied by value;
mutable types like `list` are genuinely shared by reference, and Python
never makes you declare which is which).

### SE Lens

Why does Java keep primitives around at all, instead of making
everything an object the way Python does? Performance and memory: a
primitive `int` is a few raw bytes, stored directly, with no object
overhead (no separate memory allocation, no reference to follow). For
values used constantly — loop counters, arithmetic, anything at true
scale — that difference is real. The cost is exactly this lesson's
unit: two related but genuinely different types for "a number," and a
real decision (can this ever legitimately be absent/`null`?) about
which one to use.

---

## Closing

### Connect the Pieces

None of this lesson's code survives into Pocket Inventory — every
example here was disposable on purpose, per the Concept Isolation Rule
every real lesson in this track follows. What survives is that the next
time a real lesson's Mechanical Walkthrough says "first appearance" next
to `static`, `final`, `<T>`, `implements`, a lambda, `@Something`,
`instanceof`, or `this(...)`, you have an actual, run-it-yourself
reference to connect it to instead of trusting the one-sentence
explanation to carry the whole idea by itself.

### What Breaks Without This

Go back to Lesson 6's `RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>`
and reread its Mechanical Walkthrough's explanation of the `<...>` part
now, directly after this lesson's Generics unit. If it reads as an
obvious restatement of something you already understand, rather than a
new idea introduced too fast — that's the actual, concrete proof this
lesson did its job.

### Exercises

- Go back through Lessons 1–6 and find one real, unmodified use each of
  `static`, `final`, and a lambda. For each, write one sentence in your
  own words explaining what it's doing, using this lesson's vocabulary.
- In the `AccessDemo` lab, add a `protected` field and a subclass of
  `Wallet` in a comment describing (you don't need a second file) what
  would and wouldn't be reachable from that subclass, then check your
  answer against this lesson's explanation.
- Rewrite `GenericsDemo`'s `List<String>` as a raw `List` (no type
  parameter at all — legal, if discouraged, Java) and observe that
  `names.get(0)` now requires an explicit `(String)` cast to compile
  where it didn't before — direct, felt proof of what the type
  parameter was actually buying you.

### Definition of Done

- [ ] You ran every lab in this lesson yourself, including the
      deliberately-broken versions (the commented-out lines), and saw
      the real compiler errors, not just read about them.
- [ ] You can explain, without looking back, the difference between
      `extends` and `implements`, and why a class can only do one of
      them multiple times.
- [ ] You can explain what `static` on `public static void main` has
      actually been doing since Lesson 1.
- [ ] You reread Lesson 6's generics explanation and it now reads as
      familiar rather than new.
- [ ] No commit for this lesson — nothing here becomes part of Pocket
      Inventory. Lesson 1 is where the real project, and real commits,
      begin.
