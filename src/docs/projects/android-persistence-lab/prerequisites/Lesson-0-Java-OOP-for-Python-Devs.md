# Lesson 0: The Java Ideas Python Doesn't Force You to Learn

## What you will build
Nothing shippable — five tiny, throwaway Java programs, each one isolating
a single idea. Every one of them is compiled and actually run below; the
output shown is real, not imagined. The transferable problem this lesson
solves: `InventoryAdapter` (the real class you're trying to read) uses six
Java features in its first twenty lines that don't have a direct one-line
equivalent in everyday Python. If you meet all six for the first time
*inside* that class, you're debugging the concept and the Android
framework at the same time. This lesson strips each one down to nothing
but itself first.

## What you need to know first
Basic Python: functions, variables, `def`, calling methods on objects
(`"hi".upper()`), and the general idea of a `for` loop. Nothing about Java.

## Terms used in this lesson
- **class** — a *blueprint* for objects, not a value itself. In Python you
  already write `class Dog:` — the word means the same thing in Java. The
  reason it exists: without it, every object with the same shape (a name,
  a bark method) would need its fields and methods hand-written again for
  every single instance.
- **object / instance** — a concrete thing built from a class's blueprint,
  living at its own address in memory, with its own copy of the class's
  fields. Two `Dog` objects built from the same `Dog` class are still two
  separate dogs — changing one's name doesn't touch the other.
- **constructor** — a special method, named exactly after the class, that
  runs once, automatically, at the moment `new ClassName(...)` executes,
  and whose entire job is to set the new object's fields to sensible
  starting values. It exists because an object with fields nobody
  initialized is a bug waiting to happen — Java's constructor is the
  language forcing that initialization step to actually happen.
- **field** — a variable that belongs to an object, not to a single
  method call. It exists so an object can remember something (a dog's
  name) across multiple separate method calls, the same job Python's
  `self.name` does.
- **`this`** — inside a method, a reference to the specific object the
  method is currently running on. It exists to disambiguate a field from
  a same-named parameter (`this.name = name` — "the field on *this*
  object" vs. the parameter just passed in). Python spells the identical
  idea `self`, except Python makes you write `self` as an explicit first
  parameter on every method; Java's `this` is implicit and only appears
  when you need to resolve a naming clash or pass the current object
  somewhere.
- **inheritance / `extends`** — a way for one class to say "I am a more
  specific version of that other class," automatically getting every
  field and method the parent class has, without retyping them. It
  exists to avoid duplicating shared behavior across many similar
  classes — the parent writes it once, every child gets it for free.
- **method overriding / `@Override`** — a child class replacing a
  specific method it inherited with its own version. `@Override` itself
  is not the override — it's an *annotation*, a marker with no runtime
  effect of its own, that tells the compiler "check that this method
  signature really does match something in the parent; if it doesn't,
  that's a typo, fail the build." It exists to turn a silent bug (you
  meant to override `describe()` but misspelled it `describle()`, so
  Java quietly compiled a brand-new unrelated method instead) into a
  compile error instead.
- **interface** — a contract listing method signatures with no bodies: a
  promise that "any class implementing me will provide real code for
  these methods," with no opinion on what that code does. It exists so
  different, unrelated pieces of code can agree to talk to each other
  through a shared shape, without either one needing to know the other's
  concrete class.
- **functional interface** — an interface with exactly one abstract
  method. It exists as the specific shape Java allows you to satisfy with
  a **lambda expression** instead of writing out a full class — because
  "exactly one method" is unambiguous about which method the lambda's
  body is standing in for.
- **lambda expression** — a short, unnamed block of code, written inline
  as `(parameters) -> { body }`, that gets passed around as a value and
  supplies the single method body a functional interface asks for. It
  exists to replace the ceremony of writing a whole named class just to
  hand someone one piece of behavior.
- **generics / type parameter (`<T>`)** — a way to write one class or
  method that works with *any* type, chosen later, while still getting
  compile-time checking that you don't accidentally mix types. It exists
  so you don't have to write `StringBox`, `IntBox`, `DogBox`, ... as
  separate, near-identical classes for every type you'll ever store.
- **static nested class** — a class declared *inside* another class, for
  namespacing and close association, that does **not** get an automatic
  reference to an instance of the outer class (that's what "static" means
  here — "not tied to a specific outer instance"). It exists for small
  helper classes that logically belong to one outer class and have no
  reason to exist anywhere else, without needing their own top-level file.
- **`final`** — applied to a field, means that field can be assigned
  exactly once (usually in the constructor) and never reassigned after.
  It exists to make "this can't silently change later" a fact the
  compiler enforces, not a convention you have to trust yourself to obey.

## Objects and methods used
This lesson's "subject" isn't a framework API — it's five plain-Java
language features. Because they aren't real external classes, they get
their full treatment inline in the Concept Units below rather than in
this table, per how this schema separates *language concepts* (Terms,
above) from *real external classes/methods* (Objects and methods,
normally here). There are none of the latter in this lesson.

---

## Concept Unit: Class vs. Object

### The Problem
In Python, `class Dog:` defines a blueprint, and `Dog("Rex")` builds one
instance. Java looks almost identical on the surface but has one
difference that trips people up immediately: **every field must be
declared, with a type, before it can be used** — there's no equivalent of
Python quietly creating `self.name` the first time you assign to it
inside `__init__`.

### Isolated example
```java
class Dog {
    String name;
    Dog(String name) { this.name = name; }
    String bark() { return name + " says Woof!"; }
}

public class Blueprint {
    public static void main(String[] args) {
        Dog a = new Dog("Rex");
        Dog b = new Dog("Fido");
        System.out.println(a.bark());
        System.out.println(b.bark());
        System.out.println("a and b are different objects: " + (a != b));
    }
}
```
Compiled with `javac Blueprint.java`, run with `java Blueprint`. Real
output:
```
Rex says Woof!
Fido says Woof!
a and b are different objects: true
```
This proves two things at once: (1) the same class produced two
independently-behaving objects — changing what `a` prints didn't touch
`b` — because each `new Dog(...)` allocates its own separate storage for
the `name` field; and (2) `this.name = name` inside the constructor is
resolving a naming clash — the parameter `name` and the field `name`
share a spelling on purpose (idiomatic Java), and `this.name` is how the
constructor says "the field on the object being built," not "the
parameter."

### Discard
This `Dog`/`Blueprint` pair is now discarded. It won't reappear — it only
existed to isolate "class blueprint → distinct object instances" from
everything else.

### CS lens
This is the core idea behind **object-oriented programming**: bundling
data (`name`) and the behavior that acts on it (`bark()`) into one unit,
where every instance carries its own copy of the data. Also recognized
in: Python's own `class` statement, a database row versus its table
schema, a struct in C paired with the functions that operate on it, a
spreadsheet template versus each filled-in copy.

### SE lens
The alternative Java (and Python) rejected is a *procedural* style: one
big `bark(String name)` free function, with names passed around
everywhere as plain strings. That works fine at small scale. It breaks
down once a `Dog` needs five related fields (`name`, `age`, `breed`,
`owner`) — a procedural style forces every function that touches a dog to
take all five as separate parameters, in the right order, forever; OOP
lets you pass one `Dog` instead. The cost: an extra layer of indirection
(`a.bark()` instead of `bark(a_name)`) that a beginner has to learn to
read through.

---

## Concept Unit: Inheritance and Overriding

### The Problem
Sometimes you want a class that's *almost* like an existing one, except
for one piece of behavior. Rewriting the whole class from scratch
duplicates everything that didn't change.

### Isolated example
```java
class Animal {
    String describe() { return "some generic animal sound"; }
}

class Cat extends Animal {
    @Override
    String describe() { return "Meow"; }
}

public class Overriding {
    public static void main(String[] args) {
        Animal generic = new Animal();
        Animal petThatIsActuallyACat = new Cat();
        System.out.println(generic.describe());
        System.out.println(petThatIsActuallyACat.describe());
    }
}
```
Real output:
```
some generic animal sound
Meow
```
This is the important part to stare at: the variable `petThatIsActuallyACat`
is *declared* as type `Animal`, yet calling `.describe()` on it printed
`Cat`'s version, not `Animal`'s. That's **dynamic dispatch** — which
method body actually runs is decided by the object's *real* type at
runtime, not by the type written in the variable's declaration. This is
exactly the mechanism Android relies on: framework code holds a reference
typed as the generic parent (`RecyclerView.Adapter<VH>`), calls
`.onCreateViewHolder(...)` on it, and *your* overridden version runs —
the framework never needed to know your specific subclass's name.

### Discard
`Animal`/`Cat`/`Overriding` are discarded now.

### CS lens
This is **dynamic dispatch**, the mechanical engine underneath
**polymorphism** — "many forms," the idea that code written against a
general type can transparently run more specific behavior without being
rewritten. Also recognized in: a plugin system calling a common
`run()` method on every plugin regardless of which one it is, a video
game calling `.update()` on every `GameObject` in a scene regardless of
whether it's a `Player` or an `Enemy`, GUI toolkits calling `.draw()` on
every shape in a canvas.

### SE lens
The alternative is a single class with an `if type == "cat": ... elif
type == "dog": ...` branch inside one big `describe()` method. That
avoids `extends` entirely — and it's a real, valid choice for a small,
fixed set of variants. It gets expensive the moment a new animal type
needs adding: you have to find and edit that one growing function again,
and every unrelated animal type's logic sits in the same file, able to
accidentally interfere with each other. `extends` trades that for a
different cost — the behavior for `Cat` is now defined *away* from
`Animal`, so understanding the full set of animal types means finding
every subclass, not reading one function top to bottom.

---

## Concept Unit: Interfaces, Functional Interfaces, and Lambdas

### The Problem
Suppose an object needs to say "call me back later, whenever a specific
thing happens" — without knowing, when it's written, what code will
actually run at that moment. This is exactly the shape of a button click:
the button is written and compiled long before you write the code that
should run when *your particular* button gets tapped.

### Isolated example
```java
interface OnPressListener {
    void onPress(String who);
}

class Doorbell {
    private OnPressListener callback;
    void setOnPressListener(OnPressListener callback) { this.callback = callback; }
    void press() {
        System.out.println("Doorbell.press() running...");
        if (callback != null) callback.onPress("visitor");
    }
}

public class Listener {
    public static void main(String[] args) {
        Doorbell doorbell = new Doorbell();
        doorbell.setOnPressListener(
            (who) -> System.out.println("Chime rings because " + who + " pressed the button")
        );
        System.out.println("Listener registered. Nothing has rung yet.");
        doorbell.press();
    }
}
```
Real output:
```
Listener registered. Nothing has rung yet.
Doorbell.press() running...
Chime rings because visitor pressed the button
```
This is a **timing** trace, not a values trace — the point is *when*
each line runs, not what changes:
1. `doorbell.setOnPressListener((who) -> ...)` — this is a **lambda
   expression**. It builds an object that satisfies the
   `OnPressListener` interface's single method, `onPress(String who)`,
   and *stores* it inside `doorbell`. Nothing prints yet, because
   nothing called `onPress` — it only got handed over and saved.
2. `System.out.println("Listener registered...")` — this deliberately
   prints *before* the chime, proving step 1 really didn't fire
   anything; it only registered a callback for later.
3. `doorbell.press()` — only now does `Doorbell`'s own code, inside
   `press()`, decide to call `callback.onPress("visitor")`. That's the
   moment the lambda's body actually executes, and only because
   `Doorbell`'s author chose to call it there.

This is precisely the shape of `holder.deleteButton.setOnClickListener((view) -> {
...
})` in the real `InventoryAdapter` code: `setOnClickListener` is
`OnPressListener` renamed; the lambda is stored, not run, at the line
where you see it; it only actually executes later, whenever Android's
touch-handling system decides the button was really tapped.

### Discard
`OnPressListener`/`Doorbell`/`Listener` are discarded.

### CS lens
This is the **Observer pattern** — an object (`Doorbell`) holds a
reference to a listener and calls it back when its own state changes,
without needing to know anything about what that listener actually does.
Also recognized in: JavaScript's `addEventListener`, Python's own
callback-based libraries (e.g., a `matplotlib` event handler), a stock
ticker notifying every subscribed display, pub/sub messaging systems, a
`git` pre-commit hook.

### SE lens
The alternative is *polling*: `Doorbell` could instead expose an
`wasPressed()` method that `Listener`'s code checks in a loop,
repeatedly, forever. That avoids interfaces and lambdas entirely — and
wastes CPU checking something that changes rarely, and adds a delay
between "actually pressed" and "code notices." The callback style costs
a small amount of extra machinery (defining the interface shape) in
exchange for reacting instantly and never spinning idle. This is exactly
why UI frameworks — Android included — are callback-based rather than
poll-based: a screen sitting idle waiting for a tap shouldn't be burning
battery checking "was I tapped?" in a tight loop.

---

## Concept Unit: Generics

### The Problem
A container class — something that just holds one value and gives it
back — shouldn't need to be rewritten once per type it might hold.

### Isolated example
```java
class Box<T> {
    private T contents;
    void put(T item) { this.contents = item; }
    T get() { return contents; }
}

public class Generics {
    public static void main(String[] args) {
        Box<String> stringBox = new Box<>();
        stringBox.put("hello");
        String s = stringBox.get();
        System.out.println("stringBox holds: " + s);

        Box<Integer> intBox = new Box<>();
        intBox.put(42);
        Integer n = intBox.get();
        System.out.println("intBox holds: " + n);
    }
}
```
Real output:
```
stringBox holds: hello
intBox holds: 42
```
One `Box` class definition served two completely different, unrelated
types. `T` is a **type parameter** — a placeholder filled in at the
point each `Box` is created (`Box<String>`, `Box<Integer>`); inside the
class body, `T` behaves like a real type for every purpose that matters,
including that `stringBox.get()` returns something the compiler already
knows is a `String`, with no manual casting needed.

This is exactly what `class InventoryAdapter extends
RecyclerView.Adapter<InventoryAdapter.InventoryViewHolder>` is doing:
`RecyclerView.Adapter` is written once, generically, by the Android team,
and `<InventoryAdapter.InventoryViewHolder>` is *your* fill-in-the-blank,
telling it "the specific holder type I'm using is this one" — so every
method the adapter contract requires (`onCreateViewHolder`, etc.) is
compiler-checked to actually return and accept your specific holder type,
not some generic placeholder.

### Discard
`Box`/`Generics` are discarded.

### CS lens
This is **parametric polymorphism**, more commonly just called generics —
writing one algorithm or container that's correct for many types at once,
checked at compile time rather than trusted at runtime. Also recognized
in: Python's `typing.Generic` and type hints like `list[str]`, C++
templates, TypeScript's `<T>`, SQL's generic table/index machinery
underneath strongly-typed ORMs.

### SE lens
The alternative, before generics existed in Java, was a `Box` that
stored `Object` (Java's universal base type) and required a manual cast
back to the real type every time you called `get()` — `String s =
(String) stringBox.get();`. That compiles for *any* type, which is
exactly the problem: nothing stops you from accidentally putting an
`Integer` into a box you meant only for `String`s, and the mistake
surfaces as a crash at runtime, potentially far from where the bad `put`
happened. Generics move that exact same mistake to a compile error,
at the line where it happened — the tradeoff is genuinely one-sided in
generics' favor for this case, which is why virtually no modern Java
code still writes the old `Object`-based style by choice.

---

## Concept Unit: Static Nested Classes

### The Problem
`InventoryAdapter` needs a small helper class that exists *only* to
serve `InventoryAdapter` — nothing else in the codebase should ever need
it standalone. Giving it its own top-level file suggests a level of
independence it doesn't have.

### Isolated example
```java
class Library {
    static class Book {
        final String title;
        Book(String title) { this.title = title; }
    }

    public static void main(String[] args) {
        Library.Book b = new Library.Book("Effective Java");
        System.out.println("Book title: " + b.title);
    }
}
```
Real output:
```
Book title: Effective Java
```
`Book` is declared *inside* `Library`, and referenced from outside as
`Library.Book` — the outer class's name becomes part of the nested
class's own address, the same way a folder name becomes part of a file's
path. The `static` keyword here means `Book` does **not** automatically
carry a hidden reference back to any particular `Library` instance —
building a `Book` doesn't require having a `Library` object on hand at
all, which is exactly what happened above: no `Library` instance was
ever created, only a `Book`.

### Discard
`Library`/`Book` are discarded.

### CS lens
This is namespacing plus tight coupling made explicit in the type
system: the nested class's *name itself* documents "this only makes
sense in the context of its outer class." Also recognized in: a
`Node` class nested inside a `LinkedList` class, an `Iterator` nested
inside the collection it iterates, Python's convention of a small
"private" helper class defined inside a module rather than exported.

### SE lens
The alternative is a separate top-level `Book.java` file. That's the
right call when `Book` genuinely might be reused by unrelated code
elsewhere. Nesting it costs nothing but a level of visual indentation,
and gains an explicit signal, readable straight from the type's own
name (`Library.Book`), that this class's whole reason for existing is
tied to one specific outer class — exactly `InventoryAdapter`'s own
situation with `InventoryViewHolder`.

---

## Closing

**Connect the pieces.** Picture `InventoryAdapter` itself, unread, and
walk one sentence through everything above: it's a **class** (blueprint)
that **extends** `RecyclerView.Adapter`, filling in that parent's
**generic** type parameter with its own **static nested class**
`InventoryViewHolder`; its constructor uses **`final`** fields set once
and never reassigned; several of its methods carry `@Override`, meaning
the compiler is checking them against a real inherited contract; and
inside those methods, `setOnClickListener((view) -> {...})` is a
**lambda** satisfying a **functional interface**, registered now,
running later. Every one of those six words is now something you've
personally compiled and watched run, not just read a definition of.

**What breaks without this.** Try deleting `@Override` from one of
`InventoryAdapter`'s real methods and misspelling the method name by one
letter (try it in a copy, not the real project). Without `@Override`,
Java compiles it silently as an unrelated new method that nothing ever
calls — your list quietly never updates, with no error anywhere. Put
`@Override` back and make the same typo: now it's a compile error,
immediately, at the exact line. That's the entire reason `@Override`
exists, made visible instead of asserted.

**Exercises.**
1. Modify the `Doorbell` demo (from memory, or retyped) so `press()` can
   only be called once — a second `press()` should print a message
   instead of ringing again. This is the same shape as guarding against
   a double-tap.
2. Modify `Box<T>` to be `Box<T extends Comparable<T>>` and add a method
   that compares its contents to another `Box<T>`'s contents. (This will
   require looking up `Comparable` — a deliberate small push past what
   this lesson covered.)

**Definition of done.**
- [ ] All five demos above compiled and ran locally, matching the shown
      output.
- [ ] You can say, out loud, without looking back at this lesson, what
      problem each of the six terms in "Connect the pieces" solves —
      not just what it's called.
- [ ] Proceed to **Lesson 1: Reading `InventoryAdapter`**, which assumes
      everything in this lesson and spends its full attention on the
      Android-specific ideas layered on top.
