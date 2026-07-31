# Lesson 02: Behavior, Construction, and This

**What you will build:** Another disposable lab, same pattern as Lesson
01 — nothing added to Pocket Inventory. Today's case study: giving a class
real behavior beyond plain data, and the moment-of-birth setup step every
object gets exactly once.

**What you need to know first:** Lesson 01 — specifically `class` (a
blueprint), `object` (a real thing built from a class), and `object
creation` (`new`, the act of building one).

**Terms introduced in this lesson:**

- **Method** — a function attached to a class, callable on an object of
  that class.
- **Constructor** — a special method that runs exactly once,
  automatically, during object creation, used to set up an object's
  initial state.
- **Current object reference (`this`)** — an implicit reference, available
  inside any instance method or constructor, to the object currently being
  operated on.
- **Method overloading** — several methods or constructors sharing one
  name, distinguished only by their parameter lists, with the compiler
  choosing which one runs based on what's actually passed at the call
  site.

---

## Concept Unit: Methods — Behavior Attached to a Class

### The Problem

Lesson 01's `Dog` had fields (`name`, `age`) but only one small piece of
behavior, `bark()`, introduced without stopping to name what it actually
was. A class that only ever holds data and never does anything with it
is rare in real programs — almost every class needs some behavior that
operates on its own fields. That behavior needs a home, the same way a
field needs a home: attached to the class, callable on a specific object.

### Introduce the Concept in Isolation

Create a new folder for this lesson and move into it:

```
mkdir lesson-02
cd lesson-02
```

Create `Main.java`:

```java
class Dog {
    String name;
    int age;

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }

    boolean isPuppy() {
        return age < 1;
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.name = "Rex";
        myDog.age = 3;

        myDog.describe();
        System.out.println("Puppy? " + myDog.isPuppy());
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

The terminal prints:

```
Rex is 3 years old.
Puppy? false
```

`void describe() { ... }` and `boolean isPuppy() { ... }` are both
`method`s — **first appearance**: a function attached to a class, callable
on an object of that class via `.` — `myDog.describe()`, not a bare
`describe()` with no object in front of it. Two things distinguish a
method from an ordinary function: it lives inside a class's braces, and
when called through an object (`myDog.describe()`), it can read that
specific object's own fields — `describe()` reads `myDog`'s `name` and
`age` with no extra plumbing, because the method already knows which
object it's running against.

`isPuppy()` additionally shows that a method can return a value —
`boolean` (true or false) here, contrasted with `describe()`'s `void`
(returns nothing). `age < 1` is a comparison expression, already
established syntax; `return` hands the comparison's result back to
whoever called `isPuppy()`.

### Discard the Throwaway Example

This `describe()`/`isPuppy()` pair is deleted now. It will not appear in
the project again — its only job was to make "a method reads the object
it's called on" observable in the smallest possible program.

### Mechanical Walkthrough

1. `void describe() { ... }` — **(a) first appearance.** A method
   returning nothing (`void`), taking no parameters.
2. `name` and `age`, read inside `describe()` — **(b) reappearing** fields
   from Lesson 01, now read from inside a method rather than set from
   outside it — the same fields, a new angle: a method automatically has
   access to the fields of whatever object it's called on.
3. `boolean isPuppy() { ... }` — a second method, this time returning a
   value. `boolean` is Java's true/false type — **(a) first appearance**.
4. `age < 1` — a comparison producing a `boolean` value. Genuinely basic,
   already-established syntax, sorted **(c)**.
5. `return age < 1;` — **(a) first appearance** of `return` used to
   produce a value: hands the `boolean` result of the comparison back to
   the call site, ending the method immediately.
6. `myDog.describe();` and `myDog.isPuppy()` — calling both methods
   through `.`, reused from Lesson 01's `myDog.bark()`, sorted **(c)**.
7. `System.out.println("Puppy? " + myDog.isPuppy());` — string
   concatenation with a `boolean` value; Java converts `false` to the text
   `"false"` automatically when concatenated with `+`. Basic syntax,
   sorted **(c)**.

### CS Lens

A method is the mechanism by which an object's **behavior** stays bundled
with its **data** — the core of what "object" means in object-oriented
programming, beyond just "a bundle of fields." Calling `myDog.describe()`
is fundamentally different from calling a free function `describe(myDog)`:
the method already knows which object it's operating on before it starts,
without that object being passed as an explicit argument the way a plain
function would need it.

Also recognized in: every method on every class in every object-oriented
language (Python, C#, JavaScript classes), every "member function" in C++,
every API you've ever called with a dot (`"hello".length()`,
`list.append(x)`) — the dot is always this same idea: behavior attached to
a specific value.

### SE Lens

The alternative — a free function `describeDog(Dog d)` taking the `Dog` as
an explicit argument — was not chosen because it separates behavior from
the data it operates on, which scales badly: every new free function that
needs a `Dog` has to repeat "takes a `Dog` as its first argument" by
convention, with nothing in the language enforcing that convention or
grouping those functions together. A method makes the association
structural instead of conventional — every method of `Dog` is guaranteed
to be found by anyone looking at `Dog`'s own declaration, and calling one
always reads as "this specific object, doing this," not "this function,
given an object."

---

## Concept Unit: Constructors — Setting Up an Object the Moment It's Built

### The Problem

Lesson 01's `Dog` needed three separate lines to become useful: `new
Dog()`, then `myDog.name = "Rex";`, then `myDog.age = 3;`. Nothing
enforces that all three actually happen — a `Dog` built with `new Dog()`
and never given a `name` compiles and runs, silently holding `name` as
`null` (Java's "no object here" value for anything that isn't a
primitive), which crashes the moment `describe()` tries to use it. Setup
needs to be guaranteed to happen at the moment of creation, not left to
whichever code happens to run `new` and hope it remembers the follow-up
lines.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Dog {
    String name;
    int age;

    Dog(String dogName, int dogAge) {
        name = dogName;
        age = dogAge;
    }

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog("Rex", 3);
        myDog.describe();
    }
}
```

Compile and run it the same way as before (`javac Main.java`, then `java
Main`). The terminal prints:

```
Rex is 3 years old.
```

`Dog(String dogName, int dogAge) { ... }` is a `constructor` — **first
appearance**: a special method that runs exactly once, automatically,
during object creation, used to set up an object's initial state. Three
things mark it as a constructor rather than an ordinary method: its name
is exactly the class's name (`Dog`, not `describe` or anything else), it
has no return type at all — not even `void` — and it's the code that
actually runs the moment `new Dog("Rex", 3)` executes, not code that has
to be called separately afterward.

### Discard the Throwaway Example

This constructor version is deleted now. The next unit replaces it again
to demonstrate a related failure mode.

### Mechanical Walkthrough

1. `Dog(String dogName, int dogAge) { ... }` — **(a) first appearance.**
   Named exactly `Dog`, matching the class. No return type precedes the
   name — not `void Dog(...)`, just `Dog(...)` — which is precisely what
   marks it as a constructor rather than a method that happens to share
   the class's name.
2. `String dogName, int dogAge` — constructor parameters, genuinely basic
   parameter-list syntax already established from ordinary functions,
   sorted **(c)** — the only new fact is that these particular parameter
   names (`dogName`, `dogAge`) were deliberately chosen to *not* match the
   field names (`name`, `age`), which the next unit explains.
3. `name = dogName;` and `age = dogAge;` — assigns each field from the
   matching constructor parameter. Basic assignment syntax, sorted **(c)**.
4. `new Dog("Rex", 3)` — **(b) reappearing** `object creation` from Lesson
   01, now shown passing arguments: the values in the parentheses are
   handed directly to the constructor's parameters, `dogName` receiving
   `"Rex"` and `dogAge` receiving `3`, in that order.

### CS Lens

A constructor guarantees an **invariant**: some condition that's true for
every object of a class, enforced at the one point objects come into
existence. Here, the invariant is "every `Dog` has a `name` and `age` set
the moment it exists" — because the *only* way to get a `Dog` at all is
through `new Dog(name, age)`, and that path always runs the assignments.

Also recognized in: `__init__` in Python, a constructor in C# or C++,
every framework's "initialization" hook, database schema `NOT NULL`
constraints — all different mechanisms enforcing the same idea: certain
setup must happen before something is usable, guaranteed structurally
rather than by convention.

### SE Lens

The alternative — building with bare `new Dog()` and setting fields
afterward, as Lesson 01 did — was not chosen going forward because nothing
enforces the follow-up lines actually run; a `Dog` can exist, fully
uninitialized, for however long it takes some other code to remember to
set `name` and `age`, and any code that reads it in between sees a broken
object. A constructor closes that gap by making initialization part of
construction itself — there is no way to get a `Dog` that skips it. The
cost: every place that builds a `Dog` now must supply a name and age up
front, which is a real constraint, not just added convenience — that
tradeoff is exactly why Java also allows more than one constructor,
covered later in this lesson.

---

## Concept Unit: The Current Object Reference — `this`

### The Problem

The previous unit's constructor deliberately used `dogName`/`dogAge`
instead of `name`/`age` as parameter names, specifically to dodge a
problem: what happens when a constructor parameter is named exactly the
same as the field it's meant to initialize? That's not a hypothetical —
matching a parameter's name to the field it sets is the natural, common
way to write a constructor, and Java needs a way to say "the field, not
the parameter" when both share one name.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Dog {
    String name;
    int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog("Rex", 3);
        myDog.describe();
    }
}
```

Compile and run it. The terminal prints:

```
Rex is 3 years old.
```

Same output as before — but the constructor's parameters are now named
identically to the fields (`name`, `age`), which is only possible because
of `this.name` / `this.age`. `this` is the `current object reference` —
**first appearance**: an implicit reference, available inside any instance
method or constructor, to the object currently being operated on. Inside
this constructor, `this` refers to whichever `Dog` is actually being built
— `this.name = name;` reads as "the new object's own `name` field gets
the value of the plain local variable `name`," which is the constructor's
parameter, not the field.

### Discard the Throwaway Example

This version is deleted now. `this` is now understood and carried forward
without re-explanation, per the Repetition Rule.

### Mechanical Walkthrough

1. `Dog(String name, int age) { ... }` — same constructor shape as before,
   but the parameters are now named `name` and `age`, identical to the
   fields. Without `this`, `name = name;` inside the body would assign the
   parameter to itself and leave the field untouched — a real, silent bug
   this exact shape would otherwise cause.
2. `this.name = name;` — **(a) first appearance** of `this` used to
   disambiguate. Left of `=`: `this.name`, the current object's field.
   Right of `=`: `name`, the plain local parameter (Java always resolves
   an unqualified name to the *closest* matching declaration, which is the
   parameter here, not the field — this is why the qualifier is required
   at all). `this.age = age;` follows the identical shape.

**Execution trace.** No loop or repeated construction here — the trace
that matters is *which* `name` each side of the assignment refers to,
which isn't visible from the values alone:

1. `new Dog("Rex", 3)` is called — a new `Dog` object is allocated, and
   its constructor starts running with `this` bound to that new object,
   the parameter `name` bound to `"Rex"`, and the parameter `age` bound to
   `3`.
2. `this.name = name;` runs — `this.name` (the new object's field,
   currently unset) is assigned the value of the local variable `name`
   (the parameter, `"Rex"`). After this line, the object's own `name`
   field holds `"Rex"`; the parameter `name` is unaffected by the
   assignment, it was only ever the *source* of the value.
3. `this.age = age;` runs the same way — the object's `age` field is set
   to `3` from the parameter `age`.
4. The constructor finishes; `myDog` now refers to a fully-initialized
   `Dog` whose fields were set from `this`-qualified assignments, not from
   the bare parameters directly.

### CS Lens

`this` is how a method or constructor refers to *its own receiver* — the
specific object it's currently running against — without that object
being an explicit parameter anywhere in the method's declared signature.
Every instance method secretly has access to this reference; Java just
never requires writing it out except when a name collision, like this
one, makes it necessary to disambiguate.

Also recognized in: `self` in Python (the direct equivalent, except
Python requires writing it as an explicit first parameter on every
method, where Java makes it implicit), `this` in C++, C#, and JavaScript
— nearly every object-oriented language has some name for exactly this
concept, because any language with methods needs some way for a method to
refer to the object it's running on.

### SE Lens

The alternative — keeping the earlier unit's mismatched parameter names
(`dogName`/`dogAge`) forever, specifically to avoid ever needing `this` —
was not chosen going forward because it doesn't scale: a class with ten
fields would need ten awkwardly-renamed parameters, each one a small,
permanent readability cost paid to dodge a problem `this` solves directly.
Using matching parameter names plus `this` is the idiomatic Java shape;
avoiding it via renaming is technically valid but reads, to anyone
familiar with the language, as working around a tool rather than using it.

---

## Concept Unit: Method Overloading — Same Name, Different Parameters

### The Problem

Sometimes a class genuinely needs to be constructed — or a method
genuinely needs to be called — a couple of different, equally valid ways.
A `Dog` might reasonably be built knowing its name and age both, or built
knowing only its name, with age assumed unknown for now. Java has no
optional or default parameters (unlike Python's `def __init__(self, name,
age=0):`), so a single constructor can't make `age` optional on its own —
Java's mechanism for "this can reasonably be built more than one way" is
different.

### Introduce the Concept in Isolation

Replace `Main.java`'s contents:

```java
class Dog {
    String name;
    int age;

    Dog(String name, int age) {
        this.name = name;
        this.age = age;
    }

    Dog(String name) {
        this.name = name;
        this.age = 0;
    }

    void describe() {
        System.out.println(name + " is " + age + " years old.");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog rex = new Dog("Rex", 3);
        Dog stray = new Dog("Stray");

        rex.describe();
        stray.describe();
    }
}
```

Compile and run it. The terminal prints:

```
Rex is 3 years old.
Stray is 0 years old.
```

#### Execution Trace

Two `new Dog(...)` calls, each choosing a different constructor — which
one is chosen isn't visible from the values alone, so it's traced
separately here:

1. `new Dog("Rex", 3)` — the compiler looks at this call site and sees two
   arguments, a `String` and an `int`. Only the two-parameter constructor
   `Dog(String name, int age)` matches that shape, so that's the one that
   runs. `rex` now refers to a `Dog` with `name = "Rex"`, `age = 3`.
2. `new Dog("Stray")` — one argument, a `String`. Only the one-parameter
   constructor `Dog(String name)` matches, so *that* one runs instead —
   nothing about this call could match the two-parameter version, since
   there's no second argument to give it. `stray` now refers to a `Dog`
   with `name = "Stray"`, `age = 0` (the explicit default set inside that
   constructor).
3. `rex.describe()` and `stray.describe()` each read their own object's
   fields, printing the two different results shown above — proof the two
   constructors really did build two independently-initialized objects,
   not the same one twice.

Two constructors, both named `Dog`, distinguished only by their parameter
lists — one takes `(String, int)`, the other takes only `(String)`. This
is `method overloading` — **first appearance**: several methods or
constructors sharing one name, distinguished only by their parameter
lists, with the compiler choosing which one runs based on what's actually
passed at the call site. `new Dog("Rex", 3)` matches the two-parameter
constructor; `new Dog("Stray")` matches the one-parameter constructor —
the compiler decides which by counting and typing the arguments at each
call site, not at runtime.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Dog(String name, int age) { ... }` — the same two-parameter
   constructor as the previous unit, **(b) reappearing**.
2. `Dog(String name) { ... }` — **(a) first appearance** of a second
   constructor with the same name, `Dog`, but a different parameter list
   (one `String`, no `int`). This is legal specifically because Java
   distinguishes methods and constructors by name *and* parameter list
   together, not by name alone.
3. `this.age = 0;` — inside the one-parameter constructor, `age` is set
   to a default value explicitly, since nothing was passed for it. `this`
   here is **(c)**, already established in the previous unit.
4. `new Dog("Rex", 3)` and `new Dog("Stray")` — two calls with different
   argument counts, each resolved by the compiler to a different one of
   the two constructors above. This resolution is **(a) first
   appearance** as a named mechanism: Java inspects the number and types
   of arguments at each call site and picks the one constructor (or
   method) declaration whose parameter list actually matches; if no
   declared version matches, or more than one could ambiguously match,
   compilation fails instead of guessing.

### CS Lens

Overload resolution is a compile-time decision — the compiler looks only
at each call site's argument list, matches it against every declared
version of the name, and picks one, before the program ever runs. This is
different from `this`'s resolution (settled at construction/call time
based on which real object is involved) — overloading is settled purely
from the *shapes* of the declarations and call sites, with no object
involved in the decision at all.

Also recognized in: overloaded operators in C++ (`+` meaning something
different for `int` vs. a custom `Vector` type), overloaded constructors
in C# (identical mechanism to Java's), function overloading in many
statically-typed languages generally — always the same shape: one name,
several declared shapes, the compiler choosing by argument shape.

### SE Lens

The alternative — one constructor with a `boolean` flag or a sentinel
value like `age = -1` meaning "unknown" — was not chosen because it makes
every call site harder to read (`new Dog("Stray", -1)` doesn't say
"unknown age" the way `new Dog("Stray")` does) and pushes a runtime check
("is age actually -1?") into every method that uses `age`, rather than
letting the *type system* express "this Dog simply wasn't given an age."
Method overloading is Java's real mechanism for "this can reasonably be
built or called a couple of different ways," used here in place of the
optional/default parameters some other languages provide directly.

---

## Connect the Pieces

Tracing `new Dog("Rex", 3)` through everything built in this lesson: `new`
triggers the two-parameter constructor (chosen over the one-parameter
version by overload resolution, matching the argument count and types);
inside it, `this` refers to the specific object being built, so
`this.name = name;` and `this.age = age;` set *that* object's fields from
the constructor's own parameters, disambiguated from them by name; once
built, `rex.describe()` calls a method — behavior attached to the class,
automatically able to read whichever object it's called through, printing
that object's own `name` and `age`. Four separate ideas, one line of code
each connects to feed directly into the next.

## What Breaks Without This

Remove `this` from the two-parameter constructor, keeping the matching
parameter names:

```java
Dog(String name, int age) {
    name = name;
    age = age;
}
```

This compiles with no error at all — and that's exactly the danger. Run
it:

```
null is 0 years old.
```

`name = name;` assigns the parameter to itself; the field `name` is never
touched, and stays at its default value, `null` (Java's "no object"
value for any non-primitive field never explicitly set). `age = age;`
does the same for the field `age`, which stays at `0`, the default value
for `int`. No compiler error, no crash — just silently wrong data, because
without `this`, both sides of `name = name;` refer to the same,
closer-in-scope parameter, and the field is never reached at all. This is
the concrete proof that `this` is not optional ceremony — removing it
while keeping matching parameter names produces a program that runs
without complaint and gets every single field wrong.

## Exercises

1. Add a third constructor to `Dog`, taking no parameters at all
   (`Dog()`), that sets `name` to `"Unnamed"` and `age` to `0`. Build a
   `Dog` with `new Dog()` and confirm `describe()` prints the defaults.
2. Add a method `void haveBirthday()` that increments `age` by one, using
   `this.age = this.age + 1;`. Call it twice on the same `Dog` and confirm
   `age` increases both times — proof the object's own field, not a copy,
   is what's being changed.
3. Try declaring two methods with the exact same name *and* the exact
   same parameter list (e.g. two `void describe()` methods with identical
   signatures) and read the real compiler error. It will name the actual
   rule overloading depends on: distinct parameter lists, not just
   distinct bodies.

## Definition of Done

- [ ] You ran all three versions of `Main.java` in this lesson yourself
      and saw each one's real output.
- [ ] You deliberately removed `this` from a matching-parameter-name
      constructor, saw the silent `null is 0 years old.` output, and
      restored it.
- [ ] You completed Exercise 1 and can explain why `Dog()` with no
      arguments is legal alongside the two other constructors.
- [ ] You can state, without looking back at this lesson, what
      distinguishes a constructor from an ordinary method.
- [ ] You can state, in one sentence, why `this` was needed once
      parameter names started matching field names.
