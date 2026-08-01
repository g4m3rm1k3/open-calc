# Lesson 03: Classes, Properties, and Constructors

**What you will build:** A disposable `Lightbulb` class — the exact same
example Java's Lesson 02 used to prove what `new` actually does —
rebuilt in Kotlin across five small experiments, each disassembled with
`javap` to show precisely what Kotlin's shorter syntax actually compiles
down to. The transferable problem: Java's Lesson 13 needed a `private`
field plus a hand-written getter method just to expose one piece of
state safely; this lesson answers, with real bytecode evidence rather
than a claim, exactly how much of that ceremony Kotlin's compiler now
writes for you, and what — if anything — is lost when it does.

**What you need to know first:** Java's Lesson 02 (`new`, objects,
references, aliasing — reference semantics carries over to Kotlin
completely unchanged, so this lesson never re-proves it), Java's Lesson
13 (`private`, fields, encapsulation). This series' Lesson 01
(`kotlinc`/`javap` tooling) and Lesson 02 (nullable types — used below
for a constructor parameter with no default).

**Terms introduced in this lesson:**
- **Instantiation without `new`** — Kotlin builds an object with just
  `ClassName(...)`, no keyword.
- **Primary constructor property** — a `val`/`var` written directly in a
  class's parameter list, which becomes a real field plus a generated
  getter (and setter, for `var`) in one declaration.
- **Custom getter** — a property whose value is computed by a function
  body every time it's read, backed by no stored field at all.
- **Default parameter value** and **named argument** — a constructor (or
  function) parameter that supplies its own fallback when the caller
  omits it, and the syntax for supplying arguments out of order by name.
- **`private set`** — a property readable from outside a class but
  writable only from inside it.

---

## Concept Unit: Instantiation Without `new`

### The Problem

Java's Lesson 02 built two independent `Lightbulb` objects with `new
Lightbulb()`, proving that `new` does two things: allocate a real object,
and hand back a reference to it. Kotlin runs on the same JVM and needs to
do the exact same two things every time an object is created — so does
it keep the same keyword?

### Introduce the Concept in Isolation

```kotlin
class Lightbulb {
    var isOn: Boolean = false

    fun describe(): String {
        if (isOn) {
            return "on"
        } else {
            return "off"
        }
    }
}

fun main() {
    val kitchenBulb = Lightbulb()
    val bedroomBulb = Lightbulb()

    kitchenBulb.isOn = true

    println("Kitchen: " + kitchenBulb.describe())
    println("Bedroom: " + bedroomBulb.describe())
}
```

Compile and run:

```
kotlinc ObjectDemo.kt -include-runtime -d ObjectDemo.jar
java -jar ObjectDemo.jar
```

Real output, from running this just now:

```
Kitchen: on
Bedroom: off
```

Same result Java's Lesson 02 produced, same reference semantics
underneath (`kitchenBulb` and `bedroomBulb` are two separate objects;
nothing here aliases them) — but `Lightbulb()` has no `new` in front of
it. Confirm that isn't just a stylistic omission but an actual rule by
trying the Java form on purpose:

```kotlin
fun main() {
    val bulb = new Lightbulb()
}
```

Real output, from running this just now:

```
WithNew.kt:5:16: error: unresolved reference 'new'.
    val bulb = new Lightbulb()
               ^^^
WithNew.kt:5:30: error: syntax error: Expecting an expression.
    val bulb = new Lightbulb()
                             ^
```

Kotlin doesn't have a `new` keyword at all — `new` isn't reserved, isn't
special-cased, it's simply an unrecognized name, which is exactly what
that first error says. `ClassName(...)` alone is a full **constructor
call** in Kotlin: it still allocates a real object and still returns a
reference, identically to Java's `new`, with one less word to type.

### Discard the Throwaway Examples

`ObjectDemo.kt` and `WithNew.kt` are deleted. Every remaining unit in
this lesson keeps building on `Lightbulb`, but as its own fresh,
still-disposable version each time — none of these become the real
project either.

---

## Concept Unit: The Primary Constructor — Declaring Properties in the Class Header

### The Problem

Java's Lesson 13 needed three separate pieces to expose one safe,
read-only value: a `private` field, a constructor (or inline
initializer) setting it, and a hand-written getter method returning it.
`Lightbulb` above needed a separate `var isOn: Boolean = false` field
declaration *and* required every caller to set `isOn` manually after
construction, with no way to require a starting value up front. Can
Kotlin fold "declare the field" and "accept it as a constructor
argument" into one thing?

### Introduce the Concept in Isolation

```kotlin
class Lightbulb(var isOn: Boolean)

fun main() {
    val kitchenBulb = Lightbulb(false)
    kitchenBulb.isOn = true
    println("Kitchen isOn: " + kitchenBulb.isOn)
}
```

Compile and run:

```
kotlinc PrimaryCtor.kt -include-runtime -d PrimaryCtor.jar
java -jar PrimaryCtor.jar
```

Real output, from running this just now:

```
Kitchen isOn: true
```

The entire class is one line: `class Lightbulb(var isOn: Boolean)`. The
parameter list right after the class name is Kotlin's **primary
constructor**, and writing `var` in front of a parameter there does not
just accept a value — it declares `isOn` as a real, readable, writable
**property** on every `Lightbulb`, in the same single line. Asserting
that "this becomes a real field and getter and setter" is exactly the
kind of hidden-behavior claim worth proving rather than trusting, so
disassemble the actual compiled class:

```
javap -p Lightbulb.class
```

Real output, from running this just now:

```
public final class Lightbulb {
  private boolean isOn;
  public Lightbulb(boolean);
  public final boolean isOn();
  public final void setOn(boolean);
}
```

Four real members, generated from one line of Kotlin source: a `private
boolean isOn` field — proving the value really is stored, not recomputed
— a constructor taking a `boolean`, a getter, and a setter. This is
exactly the shape Java's Lesson 13 wrote out by hand for a bank balance
(`private int balanceInCents` plus `getBalanceInCents()`); Kotlin's
compiler generates the field-plus-getter-plus-setter trio for you from a
single declaration, rather than requiring you to write all three
yourself. One naming detail worth noting directly, since it's easy to
guess wrong: the getter is named `isOn()`, not `getIsOn()` — Kotlin
special-cases a `Boolean` property already starting with `is` and reuses
that name directly for the getter, rather than doubling it.

### Discard the Throwaway Example

`PrimaryCtor.kt` is deleted. Primary-constructor properties are the
standard, idiomatic way every class in the rest of this series declares
its state — this pattern is what Lesson 10's `data class` builds directly
on top of.

---

## Concept Unit: Custom Getters — a Property Backed by No Stored Field at All

### The Problem

`describe()` in this lesson's very first example was a method, called
with `()`. But conceptually, `describe()` doesn't *do* anything — it has
no side effect, takes no argument, and just computes a value from
existing state, which is exactly what reading a property feels like from
the caller's side. Can a property be *read* like a plain field while
still running real logic each time, instead of only ever returning a
value stored in a field?

### Introduce the Concept in Isolation

```kotlin
class Lightbulb(var isOn: Boolean) {
    val description: String
        get() {
            if (isOn) {
                return "on"
            } else {
                return "off"
            }
        }
}

fun main() {
    val bulb = Lightbulb(false)
    println("Before: " + bulb.description)
    bulb.isOn = true
    println("After: " + bulb.description)
}
```

Compile and run:

```
kotlinc CustomGetter.kt -include-runtime -d CustomGetter.jar
java -jar CustomGetter.jar
```

Real output, from running this just now:

```
Before: off
After: on
```

`bulb.description` is read exactly like a field (`bulb.description`, no
parentheses) but its value changed between the two calls with no
assignment to `description` anywhere — because `description` has no
stored value at all. `val description: String` declares the property's
type; `get() { ... }` is a **custom getter** — a function body that runs
fresh every single time the property is read, computing the answer from
`isOn` at that exact moment rather than returning something stashed away
earlier. Confirm there's really no backing field, the same way the
previous unit confirmed one existed:

```
javap -p Lightbulb.class
```

Real output, from running this just now:

```
public final class Lightbulb {
  private boolean isOn;
  public Lightbulb(boolean);
  public final boolean isOn();
  public final void setOn(boolean);
  public final java.lang.String getDescription();
}
```

There is a `getDescription()` method, but no `description` field
anywhere in the class — only `isOn` is stored. `getDescription()` is a
real method under the hood, called fresh on every read, which is exactly
why `bulb.description` printed a different answer the second time
without ever being assigned.

### Discard the Throwaway Example

`CustomGetter.kt` is deleted. Custom getters reappear the moment this
series needs a value that's always derived from other state rather than
tracked independently — an inventory row's "low stock" status, computed
from a quantity field, rather than stored and kept in sync by hand.

---

## Concept Unit: Default Parameter Values and Named Arguments

### The Problem

`Lightbulb(false)` above forces every single caller to specify a
starting value, even callers who'd be perfectly happy with an ordinary
default like "off." Java has no way to make a constructor parameter
optional without writing a second, overloaded constructor by hand for
every combination of arguments callers might want to skip.

### Introduce the Concept in Isolation

```kotlin
class Lightbulb(var isOn: Boolean = false, var brightness: Int = 100)

fun main() {
    val bulb1 = Lightbulb()
    val bulb2 = Lightbulb(true)
    val bulb3 = Lightbulb(brightness = 40, isOn = true)

    println("bulb1: isOn=" + bulb1.isOn + " brightness=" + bulb1.brightness)
    println("bulb2: isOn=" + bulb2.isOn + " brightness=" + bulb2.brightness)
    println("bulb3: isOn=" + bulb3.isOn + " brightness=" + bulb3.brightness)
}
```

Compile and run:

```
kotlinc Defaults.kt -include-runtime -d Defaults.jar
java -jar Defaults.jar
```

Real output, from running this just now:

```
bulb1: isOn=false brightness=100
bulb2: isOn=true brightness=100
bulb3: isOn=true brightness=40
```

`= false` and `= 100` after each parameter's type are **default
parameter values** — used automatically whenever a caller doesn't
supply that argument. `Lightbulb()` uses both defaults; `Lightbulb(true)`
supplies `isOn` positionally (by its position in the parameter list,
same rule Java always used) and lets `brightness` default. `bulb3` does
something Java's plain positional arguments can't: `Lightbulb(brightness
= 40, isOn = true)` supplies both arguments by name, in whatever order is
convenient, rather than by position — this is called a **named
argument**. Naming an argument makes the call self-describing at the
call site (`isOn = true` is unambiguous, whereas a bare `true` at a
glance requires knowing the parameter order by heart) and is exactly
what makes skipping an *earlier* default while still supplying a *later*
one possible at all — with only positional arguments, skipping
`brightness` to reach `isOn` would be impossible without naming it.

### Discard the Throwaway Example

`Defaults.kt` is deleted. Default and named arguments both reappear
constantly for the rest of this series, especially once Composable
functions (Lesson 14 onward) commonly take a dozen optional parameters at
once.

---

## Concept Unit: `private set` — Public Read, Private Write

### The Problem

The Primary Constructor unit's `var isOn: Boolean` generated a public
getter *and* a public setter — meaning any code anywhere can reassign
`isOn` directly, the exact unrestricted access Java's Lesson 13 used
`private` specifically to prevent for a bank balance. Is there a middle
ground for a property that outside code should be able to *read* freely,
but never *write* directly — only through a class's own controlled
method?

### Introduce the Concept in Isolation

```kotlin
class Lightbulb(isOnInitially: Boolean) {
    var isOn: Boolean = isOnInitially
        private set

    fun toggle() {
        isOn = !isOn
    }
}

fun main() {
    val bulb = Lightbulb(false)
    bulb.toggle()
    println("isOn: " + bulb.isOn)
}
```

Compile and run:

```
kotlinc PrivateSet.kt -include-runtime -d PrivateSet.jar
java -jar PrivateSet.jar
```

Real output, from running this just now:

```
isOn: true
```

`private set` written on the line right after a `var` property
restricts only the **setter** to `private` — the getter above it stays
public, so `bulb.isOn` is still freely readable from `main`. Only
`toggle()`, a method belonging to `Lightbulb` itself, is allowed to
change it, using ordinary assignment (`isOn = !isOn`) as if `isOn` were a
plain field from inside the class. Confirm the restriction is real, not
cosmetic, by trying to assign it from outside:

```kotlin
fun main() {
    val bulb = Lightbulb(false)
    bulb.toggle()
    bulb.isOn = false
}
```

Real output, from running this just now:

```
PrivateSet.kt:14:10: error: cannot access 'isOn': it is private in 'Lightbulb'.
    bulb.isOn = false
         ^^^^
```

A genuine compiler error, from outside the class, at the exact call
site. Disassembling the compiled class confirms this isn't just a
compiler-side suggestion, either — `javap -p` on this version shows no
`setOn` method at all, public or private:

```
public final class Lightbulb {
  private boolean isOn;
  public Lightbulb(boolean);
  public final boolean isOn();
  public final void toggle();
}
```

With nothing outside the class ever allowed to call it, Kotlin doesn't
bother generating a separate setter method at all — `toggle()`'s own
compiled code writes straight to the private `isOn` field directly,
because from inside the declaring class, a `var` is always just an
ordinary, freely mutable variable, private setter restriction or not.

One more detail worth naming here: `isOnInitially`, the constructor
parameter, has **no** `val` or `var` in front of it. Leaving both off
means it is *not* a property at all — just a plain parameter, usable only
once, during construction (here, to compute `isOn`'s starting value),
with no corresponding field, getter, or setter generated for it at
all — confirmed directly above: `javap -p` shows no member named
`isOnInitially` anywhere in the compiled class.

### Discard the Throwaway Example

`PrivateSet.kt` is deleted. `private set` is exactly the pattern the
inventory grid (Milestone 4) uses once an item's data needs to be
readable by the UI but only ever changeable through the class's own
methods.

### CS Lens

Every property flavor in this lesson — a stored `var`, a computed
`get()`, and a `private set` — is still the same **encapsulation**
principle Java's Lesson 13 named: controlling access to an object's
internal state through a deliberate, chosen interface rather than
exposing raw data. What's different is where the *cost* of that control
lands. Java's version costs lines of code — a field, a constructor
assignment, a getter method, all written by hand. Kotlin's version costs
nothing extra to *write*, because the compiler generates the equivalent
shape for you — but, as this lesson's repeated `javap` checks showed, the
generated shape is real and inspectable, not magic: the same field,
getter, and setter Java would have needed are still sitting in the
compiled `.class` file, whether or not your source code shows them to
you directly.

### SE Lens

**Why does Kotlin bother distinguishing `val`/`var` constructor
parameters (properties) from plain ones at all, instead of just always
generating a property for every constructor parameter?** A property that
generates a field, a getter, and possibly a setter is a real, permanent
commitment — every property becomes part of a class's long-term public
shape, something other code can come to depend on reading (or writing).
A plain parameter like `isOnInitially`, needed only to compute a starting
value once, would be pure clutter if Kotlin forced it to become a
full property nobody ever needed to read again after construction. The
tradeoff cost of getting this wrong runs in the opposite direction, too:
declaring `var` when `private set` (or no setter at all) was actually
what the design called for is exactly the same encapsulation mistake
Java's Lesson 13 warned against — Kotlin makes the *safe* choice easier
to write than the *permissive* one, but it does not make the permissive
one impossible, and choosing `var` out of habit rather than intent
carries the same real risk it always did.

---

## Connect the Pieces

One trace through this lesson: `Lightbulb(false)` allocated a real
object with no `new` keyword — proven, not just asserted, once `new`
itself produced a real compiler error. `var isOn: Boolean` in the
constructor generated a private field, a public getter, and a public
setter in one line — proven by disassembling the compiled class, the
exact shape Java's Lesson 13 required three separate hand-written pieces
for. `description`'s custom `get()` proved a property doesn't need a
backing field at all, only a function that runs on every read. Default
values and named arguments let `Lightbulb()`'s constructor serve callers
who want every default and callers who want to override one specific
value by name. And `private set` proved the getter/setter pair
generated automatically can be split apart deliberately — readable
everywhere, writable only from inside — with the compiled class itself
confirming no public setter exists at all once that restriction is in
place.

## What Breaks Without This

Take the `private set` version, remove `private set` entirely (leaving a
plain `var isOn: Boolean = isOnInitially`), and re-run the exact same
`bulb.isOn = false` line from outside the class that failed to compile
above.

Real output, from running this just now:

```
(compiles and runs with no error at all)
```

No crash, no warning — `isOn` is silently, permanently writable from
anywhere the moment `private set` is removed, exactly the unrestricted
access Java's Lesson 13 built an entire lesson around closing off for a
bank balance. Restore `private set` before moving on.

## Exercises

1. Add a second custom-getter property to the `private set` version,
   `val statusLabel: String`, computing `"Lit"` or `"Unlit"` from `isOn`,
   the same way `description` did earlier. Confirm with `javap -p` that
   it produces a `getStatusLabel()` method and no backing field, exactly
   like `description` did.
2. Change `Lightbulb`'s constructor to `Lightbulb(var isOn: Boolean =
   false, val brightness: Int = 100)` — note `brightness` is now `val`,
   not `var`. Try to compile a line that assigns
   `bulb.brightness = 50` from `main` and read the real compiler error.
   Explain, in your own words, why a `val` property behaves like a
   `private set` for its setter specifically, even though nothing says
   `private` anywhere.
3. Using `javap -p`, confirm your answer to Exercise 2 by disassembling
   the compiled class and checking whether any `setBrightness` method
   exists at all.

## Definition of Done

- [ ] You ran every lab above yourself, including every `javap`
      disassembly, and can point to the exact generated field, getter,
      or setter (or its absence) each one proved.
- [ ] You triggered the real "unresolved reference 'new'" error and the
      real "cannot access 'isOn': it is private" error yourself.
- [ ] You can state, precisely, the difference between a primary
      constructor parameter written `var x: T`, one written `val x: T`,
      and one written with neither — and what each one does or doesn't
      generate.
- [ ] You can explain what a custom getter's `get() { ... }` body runs
      against, and why `bulb.description` can return two different
      answers with no assignment between the two reads.
- [ ] Commit: not applicable yet — every example in this lesson was a
      deleted scratch file, not part of any tracked project.

Next: a real Kotlin Android Studio project, and the first real platform
choice this series makes differently from Java's Lesson 05 — View
Binding, generated from a layout file, in place of `findViewById`.
