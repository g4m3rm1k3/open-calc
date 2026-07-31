# Chapter 2, Lesson A: Objects, Classes, and `new`

**What you will build:** Nothing app-related yet — two tiny classes,
run with the raw `javac`/`java` tools, entirely outside of Android. The
transferable problem: the very next lesson in this chapter is going to
show you a line like `Child c = new Child(); c.run();` and expect you
to already know what that means. Nothing in Chapter 1 explained it — a
class was just "the box every Java file's code must be written
inside." That's true, but incomplete: a class is also a *blueprint*,
and `new` is how you build a real, individual thing from it. This
lesson closes that gap before the next one needs it.

**What you need to know first:** Chapter 1 (`class`, `public`,
`static void main`, method-call syntax like `System.out.println(...)`).

**Terms introduced in this lesson:**
- **Field** — a named piece of data, declared inside a class body with
  no method around it, that every object built from that class has its
  own independent copy of.
- **Object / instance** — an actual, individual thing built from a
  class (the blueprint), holding its own copy of the class's fields.
- **`new`** — the keyword that constructs a brand-new object in memory
  and hands back a reference to it.
- **Instance method** — a method with no `static` keyword; it belongs
  to a specific object and can only be called through one
  (`kitchen.toggle()`), never through the class name directly.

---

## Concept Unit: A Class Is a Blueprint, an Object Is a Thing Built From It

### The Problem

In Python, if you want two independent light switches, each remembering
its own on/off state, you might reach for two separate variables
(`kitchen_is_on = False`, `bedroom_is_on = False`). There's no single
built-in "make a new thing with its own named slot of data" mechanism
baked into the language's syntax the way there is in Java. Java's
answer is the **class**: a blueprint describing what data a thing has,
and the **object**: an actual, individual thing built from that
blueprint, with its own independent copy of that data.

### Introduce the Concept in Isolation

Create a folder for this lab (a plain folder, no `package` line
needed — Chapter 1B explained why). Inside it, create
`LightSwitch.java` — no methods yet, just data:

```java
public class LightSwitch {
    boolean isOn;
}
```

Now create `LightSwitchDemo.java` in the same folder — this is the file
with `main`, the one you'll actually run:

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

Compile and run both:

```
javac LightSwitch.java LightSwitchDemo.java
java LightSwitchDemo
```

Real output, this session:

```
Kitchen: true
Bedroom: false
```

#### Execution Trace

1. `LightSwitch kitchen = new LightSwitch();` — builds a real
   `LightSwitch` object in memory, its `isOn` field defaulting to
   `false` because a `boolean` field never explicitly set gets Java's
   default value.
2. `LightSwitch bedroom = new LightSwitch();` — a second, separate call
   to `new`, building a genuinely different object with its own default
   `isOn`, unrelated to `kitchen`'s.
3. `kitchen.isOn = true;` — changes only `kitchen`'s own copy of
   `isOn`, because `kitchen` and `bedroom` are different objects in
   memory, even though they share a field *name*; `bedroom.isOn` stays
   `false`, which is exactly why the two `println` calls print
   different values.

What this proves: `LightSwitch` itself is not a light switch — it's a
description of one. `new LightSwitch()` is what actually builds an
individual light switch **object** (also called an **instance**) from
that description. You built two — `kitchen` and `bedroom` — and they
are genuinely separate: setting `kitchen.isOn = true` had no effect on
`bedroom.isOn`, which stayed at its default value, `false` (Java's
default for a `boolean` field that's never explicitly set).

### Discard the Throwaway Example

Delete `LightSwitch.java` and `LightSwitchDemo.java` — they never
appear again. The next lesson in this chapter reuses this exact
vocabulary — class, object, `new`, instance method — on a class you
didn't write.

### Mechanical Walkthrough

- `public class LightSwitch { boolean isOn; }` — **first appearance of
  a field.** `boolean isOn;` inside the class body, with no method
  around it, is a **field** — a named piece of data every object built
  from this class will have its own copy of.
- `LightSwitch kitchen = new LightSwitch();` — **first appearance of
  object creation.** Reading right to left: `new LightSwitch()`
  constructs a brand-new `LightSwitch` object in memory and hands back
  a reference to it. `LightSwitch kitchen = ...` then declares a
  variable named `kitchen` whose *type* is `LightSwitch` and stores
  that reference in it — same declaration shape as `int count = 5;`
  would be, just with a class name instead of a primitive type name.
- `LightSwitch bedroom = new LightSwitch();` — **reappearing**, same
  line, called a second time. Each call to `new` builds a completely
  separate object.
- `kitchen.isOn = true;` — **first appearance of dot notation used to
  set a field.** You've already seen dot notation for *calling a
  method* (`System.out.println(...)`, Chapter 1); this is the sibling
  operation — reaching into a specific object and changing one of its
  fields. `kitchen.isOn` and `bedroom.isOn` are two entirely different
  pieces of memory, even though they share a field *name*, because
  `kitchen` and `bedroom` are different objects.

### CS Lens

This is **encapsulation of state** — bundling data into a named unit
with a type, rather than tracking related values as separate loose
variables. Also recognized in: a database row (fields as columns), a
JSON object in JavaScript (`{ isOn: true }` is almost the same *data*
shape — the difference Java adds is the fixed, named, compiler-checked
type describing exactly what fields must exist), and a Python
`dataclass` or plain object instance (`self.is_on = True` inside
`__init__`).

### SE Lens

**Why does Java force every field to belong to a declared class, when
Python lets you attach attributes to almost anything?** The
alternative — freeform, dynamically-shaped data — is more flexible for
quick scripts, but it means nothing checks, before your program runs,
whether a given object actually has the field you're about to read.
Java's tradeoff: you declare the shape once, in the class, and the
compiler then enforces that shape everywhere that class is used — try
to write `kitchen.color = "red";` when `LightSwitch` has no `color`
field, and it's a compile error, not a bug you discover when the app is
running on someone's phone.

---

## Concept Unit: Instance Methods — Behavior That Belongs to One Object

### The Problem

Right now, changing a `LightSwitch`'s state means reaching in from
outside and flipping the field directly: `kitchen.isOn = true;`. Java's
version of "logic that belongs specifically to one object's own data"
is a method that lives inside the class itself — an **instance
method** — rather than a free-floating function.

### Introduce the Concept in Isolation

Reuse the same lesson folder. Replace the contents of
`LightSwitch.java`:

```java
public class LightSwitch {
    boolean isOn;

    void toggle() {
        isOn = !isOn;
    }
}
```

Replace the contents of `LightSwitchDemo.java`:

```java
public class LightSwitchDemo {
    public static void main(String[] args) {
        LightSwitch kitchen = new LightSwitch();
        System.out.println("Before: " + kitchen.isOn);

        kitchen.toggle();
        System.out.println("After one toggle: " + kitchen.isOn);
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
```

What this proves: `kitchen.toggle()` — called with no arguments — was
still able to read and change `kitchen`'s own `isOn` field specifically,
not some field floating in space. That's only possible because Java
secretly gives every instance method access to the exact object it was
called on.

### Discard the Throwaway Example

Delete `LightSwitch.java` and `LightSwitchDemo.java` again.

### Mechanical Walkthrough

- `void toggle() { ... }` — **first appearance of an instance method.**
  Same method shape you learned in Chapter 1 (`void` return type, a
  name, parentheses for parameters — empty here), but written *inside*
  the class body, next to the `isOn` field, with no `static` keyword.
  That absence is the entire distinction: a `static` method (like
  `main`) belongs to the class itself and can be called with no object
  at all. An instance method with no `static` belongs to *an object*
  and can only be called through one — `kitchen.toggle()`, never
  `LightSwitch.toggle()`.
- `kitchen.toggle();` — **reappearing dot-notation method call**, same
  shape as `System.out.println(...)` (Chapter 1), now on an object you
  built yourself instead of one Java provided.

### CS Lens

This is **message passing** — the object-oriented idea that you don't
reach in and manipulate another object's data directly from outside;
you send it a request (`toggle()`) and it decides, using its own
internal logic, how to respond. Also recognized in: any GUI widget's
public methods (`textBox.clear()` doesn't tell you *how* the box
clears itself, just that it will), Python's own instance methods
(`my_list.append(x)`), and the general software design idea "tell,
don't ask."

### SE Lens

**Why put `toggle()` inside `LightSwitch` at all, instead of a free
function `toggleSwitch(LightSwitch s)` that flips `s.isOn` from
outside?** Both would produce the same output here. The instance-method
version keeps the *rule* for how a light switch toggles physically next
to the *data* it operates on — if the rule ever gets more complex,
there's exactly one place to change it, and every caller automatically
gets the new behavior through the same `switchObject.toggle()` call.

---

## Connect the Pieces

One trace through this lesson: `LightSwitch` (the blueprint, just a
`.java` file with a field and a method) became `kitchen` (an actual
object in memory, built by `new LightSwitch()`, holding its own copy of
`isOn`) — and every later mention in this course of "an instance of
`MainActivity`," or "an Activity object the OS builds for you," is the
exact same mechanism, just with a different class doing the
blueprinting.

## What Breaks Without This

In the second lab, delete the `isOn` field entirely from `LightSwitch`
but leave `toggle()`'s body (`isOn = !isOn;`) unchanged. Try to compile.
Read the real error — `toggle()` refers to a field that no longer
exists, and the compiler catches it immediately, at the exact line.
Restore the field afterward.

## Exercises

1. Add a second `LightSwitch` object, `hallway`, in `LightSwitchDemo`,
   toggle it twice, and print its final value. Predict the output
   before running it.
2. Add a second field to `LightSwitch`, `String roomName`, set it
   directly with dot notation (`kitchen.roomName = "Kitchen";`), and
   print it alongside `isOn`.

## Definition of Done

- [ ] You ran both `LightSwitch` labs yourself and your output matched
      what's shown here.
- [ ] You can explain, in your own words, the difference between a
      class and an object.
- [ ] You can explain what makes an instance method different from a
      `static` one, using `toggle()` and `main` as your two examples.

Next: Chapter 2, Lesson B — `@Override` has been sitting unexplained in
every Activity you've opened; annotations, and what that one specific
annotation actually checks.
