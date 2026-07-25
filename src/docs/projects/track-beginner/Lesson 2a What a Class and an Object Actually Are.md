# Lesson 2a: What a Class and an Object Actually Are

**What you will build:** Nothing added to Pocket Inventory yet — this
lesson is entirely a throwaway lab, run outside the Android project.
The transferable problem: every remaining lesson in this curriculum —
starting with the very next one — uses the words `new`, "field," and
"instance method" constantly, and calls methods on things it creates
with `new`, without re-explaining what any of that means. In Python you
manipulate values directly (`count = 0`, `count += 1`) or pass them
through functions. In Java, a huge amount of real code instead builds
**objects** — bundles of data with behavior attached — and calls
methods *on* them. If you don't know what an object actually is
mechanically, every Android lesson from here on will read as
memorized incantations instead of things you understand. This lesson
fixes that, once, completely, so nothing after it has to.

**What you need to know first:** Lesson 1 — the shape of a Java
program (`public class`, `public static void main`), and that
`System.out.println(...)` is a method call on a pre-built object,
`System.out`, using dot notation. This lesson explains, for the first
time, what "an object" and "a method call on it" actually are
underneath.

**How the labs in this lesson work:** Every code block below is a
*separate file*. Before the first Concept Unit, create one folder
anywhere outside the Android project — for example `~/java-labs/lesson2a/`
— and reuse that same folder for all three Concept Units in this
lesson, replacing its files as each unit instructs. Java requires a
file's name to exactly match its `public class` name (a compiler rule,
not a suggestion — you proved this in Lesson 1): `public class
LightSwitch` must live in a file named exactly `LightSwitch.java`;
`public class LightSwitchDemo` must live in `LightSwitchDemo.java`,
sitting next to it in the same folder. No project or IDE is needed for
any of this — a plain text editor and a terminal in that folder is
enough.

Two things you'd expect from Lesson 1 are deliberately missing from
these labs, and both are worth understanding before you type anything:

- **No `package` line.** Lesson 1's package lab specifically used
  `javac -d`, and `-d` is what makes the package/folder match get
  enforced. Plain `javac LightSwitch.java LightSwitchDemo.java` (no
  `-d`, what you'll run in this lesson) doesn't require a `package`
  line at all — a `.java` file with none compiles fine into Java's
  unnamed "default package." Every real file in the Pocket Inventory
  project has a `package` line (Android's build system requires it,
  and you'll use `-d`-equivalent behavior every time you build there);
  these throwaway labs don't need one, because nothing here has to be
  *found* by folder path the way Lesson 1's exercise was proving.
- **Only one file has a `main` method.** `main` is only required on
  whichever class you actually tell `java` to run — in this lesson,
  that's always `LightSwitchDemo` (or `BrokenDemo`, in the third unit),
  so only that file gets one. `LightSwitch` itself is never run
  directly — it's only ever built and used *by* `LightSwitchDemo` — so
  it doesn't need an entry point of its own. One Java program built
  from multiple files needs exactly one `main` in total, in whichever
  file you name on the `java` command line, not one per file.

---

## Concept Unit: A Class Is a Blueprint, an Object Is a Thing Built From It

### The Problem

In Python, if you want two independent light switches, each remembering
its own on/off state, you might reach for two separate variables
(`kitchen_is_on = False`, `bedroom_is_on = False`) or a dictionary per
switch. There's no single built-in "make a new thing with its own named
slots of data" mechanism baked into the language's syntax the way
there is in Java. Java's answer is the **class**: a blueprint describing
what data a thing has, and the **object**: an actual, individual thing
built from that blueprint, with its own independent copy of that data.
This is the single biggest structural difference between Java and what
you already know — not a new keyword to memorize, but a genuinely
different way of organizing a program.

### Introduce the Concept in Isolation

Create a file named exactly `LightSwitch.java` in your lesson folder.
This class describes "a light switch, which has an on/off state" — no
methods yet, just data:

```java
public class LightSwitch {
    boolean isOn;
}
```

Now create a second file in the *same* folder, named exactly
`LightSwitchDemo.java` — this is the file that has `main`, the one
you'll actually tell `java` to run:

```java
public class LightSwitchDemo {
    public static void main(String[] args) {
        LightSwitch kitchen = new LightSwitch();
        LightSwitch bedroom = new LightSwitch();
        kitchen.isOn = true;

        System.out.println("Kitchen: " + kitchen.isOn);
        System.out.println("Bedroom: " + bedroom.isOn);
    }
}
```

Your lesson folder should now contain exactly these two files, nothing
else. Compile and run both:

```
javac LightSwitch.java LightSwitchDemo.java
java LightSwitchDemo
```

Real output, this session:

```
Kitchen: true
Bedroom: false
```

Three statements, two separate objects, one value at a time:

```
Iteration 1: new LightSwitch() → kitchen built, kitchen.isOn = false (default)
Iteration 2: new LightSwitch() → bedroom built, bedroom.isOn = false (default)
Iteration 3: kitchen.isOn = true → kitchen.isOn = true, bedroom.isOn still false
```

What this proves: `LightSwitch` itself is not a light switch — it's a
description of one. `new LightSwitch()` is what actually builds an
individual light switch **object** (also called an **instance**) from
that description. You built two — `kitchen` and `bedroom` — and they
are genuinely separate: setting `kitchen.isOn = true` had no effect on
`bedroom.isOn`, which stayed at its default value, `false` (Java's
default for a `boolean` field that's never explicitly set — Lesson
2c/2d's `Vault` lab will lean on this same default-value behavior for
`int` fields, where the default is `0`).

### Mechanical Walkthrough

Enumerating every distinct piece across both files, in order:

- `public class LightSwitch { boolean isOn; }` — **first appearance of
  a field.** `boolean isOn;` inside the class body, with no method
  around it, is a **field** — a named piece of data every object built
  from this class will have its own copy of. This is different from a
  local variable inside a method (which you'll see plenty of starting
  Lesson 3) — a field lives as long as the object does, not just for
  one method call.
- `LightSwitch kitchen = new LightSwitch();` — **first appearance of
  object creation.** Reading right to left: `new LightSwitch()`
  constructs a brand-new `LightSwitch` object in memory and hands back
  a reference to it (a reference is, practically, "a way to find this
  specific object again" — you'll see what happens when two variables
  share the same reference in a later lesson, once it actually matters
  for a bug you can observe). `LightSwitch kitchen = ...` then declares
  a variable named `kitchen` whose *type* is `LightSwitch` and stores
  that reference in it — same declaration shape as `int count = 5;`
  would be, just with a class name instead of a primitive type name
  like `int` or `boolean`.
- `LightSwitch bedroom = new LightSwitch();` — **reappearing**, same
  line, called a second time. Each call to `new` builds a completely
  separate object — this is the concrete mechanism behind "each object
  has its own independent data" above.
- `kitchen.isOn = true;` — **first appearance of dot notation used to
  set a field.** You've already seen dot notation for *calling a
  method* (`System.out.println(...)`); this is the sibling operation —
  reaching into a specific object and changing one of its fields.
  `kitchen.isOn` and `bedroom.isOn` are two entirely different pieces
  of memory, even though they share a field *name*, because `kitchen`
  and `bedroom` are different objects.
- `"Kitchen: " + kitchen.isOn` — **reappearing**, `+` for string
  concatenation, already familiar from earlier output. `kitchen.isOn`
  here reads the field's current value rather than setting it — same
  dot notation, opposite direction, distinguished only by which side of
  `=` it's on (or whether there's an `=` at all).

### CS Lens

This is **encapsulation of state** — bundling data into a named unit
with a type, rather than tracking related values as separate loose
variables. Also recognized in: a database row (a `Vault` object here is
structurally the same idea as one row of a `light_switches` table, with
fields as columns), a JSON object in JavaScript (`{ isOn: true }` is
almost the same *data* shape — the difference Java adds is the fixed,
named, compiler-checked type describing exactly what fields must exist
and what type each one is), and a Python `dataclass` or plain object
instance (`self.is_on = True` inside `__init__`, which is doing
something extremely close to what you just did, syntax aside).

### SE Lens

**Why does Java force every field to belong to a declared class, when
Python lets you attach attributes to almost anything, and JavaScript
objects can have keys added on the fly?** The alternative — freeform,
dynamically-shaped data — is more flexible for quick scripts, but it
means nothing checks, before your program runs, whether a given object
actually has the field you're about to read. Java's tradeoff: you
declare the shape once, in the class, and the compiler then enforces
that shape everywhere that class is used — try to write
`kitchen.color = "red";` when `LightSwitch` has no `color` field, and
it's a compile error, not a bug you discover when the app is running on
someone's phone. The cost is upfront ceremony (you must define the
class's shape before you can use it) in exchange for that guarantee.

---

## Concept Unit: Instance Methods and `this`

### The Problem

Right now, changing a `LightSwitch`'s state means reaching in from
outside and flipping the field directly: `kitchen.isOn = true;`. That
works, but it means every piece of code that wants to toggle a switch
has to know and repeat the exact logic for doing so. Functions in
Python or JavaScript solve repeated logic by extracting a function.
Java's version of that, when the logic specifically belongs to *one
object's own data*, is a method that lives inside the class itself —
an **instance method** — rather than a free-floating function.

### Introduce the Concept in Isolation

Reuse the same lesson folder. Replace the contents of `LightSwitch.java`
with this — same filename as before, since it's still `public class
LightSwitch`, just with a method added:

```java
public class LightSwitch {
    boolean isOn;

    void toggle() {
        this.isOn = !this.isOn;
    }
}
```

Replace the contents of `LightSwitchDemo.java` too, same filename rule:

```java
public class LightSwitchDemo {
    public static void main(String[] args) {
        LightSwitch kitchen = new LightSwitch();
        System.out.println("Before: " + kitchen.isOn);

        kitchen.toggle();
        System.out.println("After one toggle: " + kitchen.isOn);

        kitchen.toggle();
        System.out.println("After two toggles: " + kitchen.isOn);
    }
}
```

Compile and run:

```
javac LightSwitch.java LightSwitchDemo.java
java LightSwitchDemo
```

Real output, this session:

```
Before: false
After one toggle: true
After two toggles: false
```

What this proves: `kitchen.toggle()` — called with no arguments — was
still able to read and change `kitchen`'s own `isOn` field specifically,
not some field floating in space. That's only possible because Java
secretly gives every instance method access to the exact object it was
called on.

### Mechanical Walkthrough

- `void toggle() { ... }` — **first appearance of an instance method.**
  Same method shape you learned in Lesson 1 (`void` return type, a
  name, parentheses for parameters — empty here), but written *inside*
  the class body, next to the `isOn` field, with no `static` keyword.
  That absence is the entire distinction: a `static` method (like
  `main`) belongs to the class itself and can be called with no object
  at all (`java LightSwitchDemo` calls `main` before any
  `LightSwitchDemo` object exists — Lesson 1 already relied on this).
  An instance method with no `static` belongs to *an object* and can
  only be called through one — `kitchen.toggle()`, never
  `LightSwitch.toggle()`. `static`'s full meaning, including *why*
  Java makes you choose explicitly, gets its own dedicated lesson soon;
  for now, the concrete rule is: no `static` keyword on a method means
  "this only makes sense in the context of one specific object."
- `this.isOn = !this.isOn;` — **first appearance of `this`.** Inside an
  instance method, `this` is a special, automatically-available
  reference meaning "the exact object this method was called on."
  When you wrote `kitchen.toggle()`, Java runs `toggle`'s body with
  `this` secretly set to `kitchen` — so `this.isOn` means `kitchen.isOn`
  for that call. Call `bedroom.toggle()` instead, and the very same
  method body runs with `this` now meaning `bedroom`. This is the
  mechanism, not an analogy: one method body, reused for every object
  of the class, disambiguated at call time by which object it was
  called through.
- `!this.isOn` — **first appearance of the logical NOT operator.** `!`
  flips a `boolean`: `!true` is `false`, `!false` is `true`. Same idea
  as Python's `not` or JavaScript's `!`, different spelling only in
  Python's case (JS also uses `!`).
- `kitchen.toggle();` — **reappearing dot-notation method call**,
  same shape as `System.out.println(...)` from Lesson 1, now on an
  object you built yourself instead of one Java provided.

### CS Lens

This is **message passing** — the object-oriented idea that you don't
reach in and manipulate another object's data directly from outside;
you send it a request (`toggle()`) and it decides, using its own
internal logic, how to respond. Also recognized in: any GUI widget's
public methods (`textBox.clear()` doesn't tell you *how* the box
clears itself, just that it will), Python's own instance methods
(`my_list.append(x)` — Python objects work exactly this way; the
difference is Java requires this shape for *everything*, where Python
lets you mix free functions and methods freely), and the general
software design idea "tell, don't ask" — you told `kitchen` to toggle
itself rather than asking for its state, computing the flip yourself,
and writing the result back in.

### SE Lens

**Why put `toggle()` inside `LightSwitch` at all, instead of a free
function `toggleSwitch(LightSwitch s)` that flips `s.isOn` from
outside?** Both would produce the same output here. The instance-method
version keeps the *rule* for how a light switch toggles physically
next to the *data* it operates on — if the rule ever gets more complex
(imagine a switch that refuses to toggle while "locked"), there's
exactly one place to change it, and every caller automatically gets the
new behavior through the same `switchObject.toggle()` call. The free-
function version works fine for one function, but scales badly: nothing
stops a second free function elsewhere in a large codebase from
reimplementing slightly different toggle logic, because the logic was
never tied to the data it belongs to.

---

## Concept Unit: Constructors — What Actually Runs When `new` Builds an Object

### The Problem

`new LightSwitch()` in the very first lab worked with no arguments at
all, and every new switch silently started with `isOn` at Java's
default (`false`). But real objects usually need to start in a
specific, deliberate state, not just a default one — you'll see this
directly in the next lesson's `Vault` class and `new Vault()`. Right
now, there's no way to say "build a `LightSwitch` that starts already
on." That's what a **constructor** is for.

### Introduce the Concept in Isolation

Same folder again. Replace `LightSwitch.java`:

```java
public class LightSwitch {
    boolean isOn;

    LightSwitch(boolean startsOn) {
        this.isOn = startsOn;
    }

    void toggle() {
        this.isOn = !this.isOn;
    }
}
```

Replace `LightSwitchDemo.java`:

```java
public class LightSwitchDemo {
    public static void main(String[] args) {
        LightSwitch kitchen = new LightSwitch(true);
        LightSwitch bedroom = new LightSwitch(false);

        System.out.println("Kitchen starts: " + kitchen.isOn);
        System.out.println("Bedroom starts: " + bedroom.isOn);
    }
}
```

Compile and run:

```
javac LightSwitch.java LightSwitchDemo.java
java LightSwitchDemo
```

Real output, this session:

```
Kitchen starts: true
Bedroom starts: false
```

The constructor argument sets each object's starting state directly:

```
Iteration 1: new LightSwitch(true) → kitchen built, kitchen.isOn = true
Iteration 2: new LightSwitch(false) → bedroom built, bedroom.isOn = false
```

Now prove the important side effect: try the *old* no-argument call
against this new version of the class. Create a **third** file in the
same folder, named exactly `BrokenDemo.java` — leave `LightSwitch.java`
and `LightSwitchDemo.java` as they are:

```java
public class BrokenDemo {
    public static void main(String[] args) {
        LightSwitch broken = new LightSwitch();
    }
}
```

`BrokenDemo` has its own `main`, same rule as before — it's the file
you're about to tell `java`/`javac` to run, so it needs one; `LightSwitch`
still doesn't, for the same reason as always.

```
javac BrokenDemo.java
```

Real compiler output, this session:

```
BrokenDemo.java:3: error: constructor LightSwitch in class LightSwitch cannot be applied to given types;
        LightSwitch broken = new LightSwitch();
                             ^
  required: boolean
  found:    no arguments
  reason: actual and formal argument lists differ in length
1 error
```

What this proves: every earlier lab in this lesson used
`new LightSwitch()` with no arguments successfully, even though the
class defined no constructor at all — that worked because Java
automatically supplies a free, no-argument **default constructor** for
any class that doesn't declare one itself. The instant you write your
*own* constructor — as you just did — that free default disappears
completely, and `new LightSwitch()` with no arguments becomes a
compile error, exactly like calling any other method with the wrong
number of arguments. This is a real, common beginner mistake in every
Java codebase: add a constructor to an existing class, and every
existing `new ClassName()` call elsewhere in the project stops
compiling until it's updated to match.

### Mechanical Walkthrough

- `LightSwitch(boolean startsOn) { ... }` — **first appearance of an
  explicit constructor.** A constructor looks like a method but has no
  return type at all (not even `void`) and its name must exactly match
  the class name. It's the code that runs, automatically, every single
  time `new LightSwitch(...)` executes — its job is to set up the
  object's fields to a valid starting state before anyone else can use
  it.
- `boolean startsOn` — **reappearing parameter syntax**, same shape as
  `main`'s `String[] args` from Lesson 1, just a `boolean` parameter
  named `startsOn` instead.
- `this.isOn = startsOn;` — **reappearing `this` usage** from the
  previous unit, now inside a constructor instead of an instance
  method — same rule: `this` means "the object currently being built."
  Note the parameter is named `startsOn`, not `isOn` — if it were also
  named `isOn`, `this.isOn` would still correctly mean the field
  (because of the `this.` prefix), but the plain `isOn` on the right
  side would refer to the *parameter*, not the field — a common source
  of confusion this lab sidesteps by naming the parameter differently.
- `new LightSwitch(true)`, `new LightSwitch(false)` — **reappearing
  `new` syntax**, now passing an argument that flows straight into the
  constructor's `startsOn` parameter.

### CS Lens

The default-constructor-disappears behavior is an instance of **no
implicit fallback once you've stated intent explicitly** — a pattern
Java applies in several places once you've shown the compiler you're
handling something yourself. Also recognized in: Python's `__init__`
(no built-in default once you define your own, same as here), C++
constructors (identical rule), and more generally the principle that a
language shouldn't silently guess what you meant once you've written
code that implies you meant to control it yourself.

### SE Lens

**Why does Java offer the free default constructor at all, instead of
always requiring one to be written explicitly?** The alternative —
always mandatory — would mean the very first `LightSwitch` lab in this
lesson couldn't have started as simply as it did; you'd have been
forced to learn constructors before objects at all, which is a harder
starting point. Java's tradeoff: let the simplest case (a class with no
setup logic) stay simple, but the moment a class needs *any* setup
logic, require it to be complete and explicit — no half-default,
half-custom state. The cost, as you just saw, is that adding a
constructor to an already-used class is a small breaking change every
time.

Delete `LightSwitch.java`, `LightSwitchDemo.java`, and `BrokenDemo.java`
now — they were only ever a throwaway lab and will not appear in the
real project again. But hold onto every idea from this lesson: class
vs. object, `new`, fields, instance methods, `this`, and constructors
are the vocabulary the next lesson's `Vault` and `Child` classes are
written in, without re-explaining any of it.

---

## Connect the Pieces

One concrete trace through this lesson: `LightSwitch` (the blueprint,
just a `.java` file with a field and some methods) became `kitchen`
(an actual object in memory, built by `new LightSwitch(true)`, holding
its own copy of `isOn`) — and every later mention in this curriculum
of "an instance of `Vault`," "an instance of `MainActivity`," or "an
Activity object the OS builds for you" is the exact same mechanism,
just with a different class doing the blueprinting.

## What Breaks Without This

Take the final version of `LightSwitch.java` (with the constructor) and
delete the constructor entirely, leaving only the field and `toggle()`.
Now `new LightSwitch(true)` in `LightSwitchDemo.java` won't compile —
run it and read the real error. It will look structurally identical to
the `BrokenDemo` error above, just in the opposite direction: you removed
the constructor that a caller depends on, instead of adding one a caller
didn't expect. Restore the constructor afterward.

## Exercises

1. Add a second field to `LightSwitch`, `String roomName`, and a second
   constructor parameter for it. Update both `new LightSwitch(...)`
   calls to pass a room name, and print it alongside `isOn`.
2. Write a `isOn()` method (no relation to the field access you did
   directly earlier) that returns the field's value instead of printing
   it directly, and call it from `main`. This previews a pattern —
   reading a field only through a method instead of directly — that
   Lesson 2d's `private` fields will make mandatory rather than
   optional.

## Definition of Done

- [ ] You ran all three `LightSwitch` labs yourself and your output
      matched what's shown here.
- [ ] You can explain, in your own words, the difference between a
      class and an object.
- [ ] You triggered the real "cannot be applied to given types" compiler
      error yourself by calling a no-argument constructor after adding
      an explicit one, and can explain why it happened.
- [ ] You can explain what `this` refers to inside an instance method,
      and why the same method body can act on different data depending
      on which object it's called through.
- [ ] No git commit for this lesson — nothing here becomes part of
      Pocket Inventory; everything was deleted per the instructions
      above. (The next lesson resumes editing the real project and its
      definition of done resumes requiring a commit.)

Next lesson picks up exactly where Lesson 1 left off: the Manifest file,
and then `extends AppCompatActivity` — which will now read as "a class
you didn't write, being instantiated by the OS instead of by you,"
using nothing but vocabulary you already have.
