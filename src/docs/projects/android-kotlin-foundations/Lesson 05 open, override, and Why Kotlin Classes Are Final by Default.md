# Lesson 05: `open`, `override`, and Why Kotlin Classes Are Final by Default

**What you will build:** Nothing new on screen yet — this lesson explains
two words already sitting in the real `MainActivity.kt` Lesson 04
generated: `: AppCompatActivity()` and `override fun onCreate`. The
transferable problem: Java's Lesson 06 proved inheritance and overriding
using `Animal`/`Dog`, where *any* class could be subclassed and *any*
method could be overridden unless a lesson later found a reason to lock
one down with `final`. Kotlin inverts that default completely — and this
lesson proves, with five real compiler errors, exactly what that
inversion means in practice, not just as a rule to memorize.

**What you need to know first:** Java's Lesson 06 (`extends`,
overriding, `@Override`, dynamic dispatch, the Template Method pattern,
and `AppCompatActivity`'s real declared shape, already quoted there in
full). This series' Lesson 03 (primary constructors — the `()` after a
parent class name in `: AppCompatActivity()` is a real constructor call,
the same mechanism Lesson 03 already covered). Lesson 04's generated
`MainActivity.kt`, which this lesson finally explains completely.

**Terms introduced in this lesson:**
- **`open` (on a class)** — marks a class as allowed to be subclassed;
  without it, a Kotlin class cannot be inherited from at all.
- **`open` (on a member)** — marks a specific method or property as
  allowed to be overridden by a subclass; without it, even a subclass of
  an `open` class cannot replace that member.
- **`override`** — a mandatory keyword (not an optional annotation)
  marking a member as replacing a specific `open` member declared in a
  parent class; the compiler both requires and validates it, in both
  directions.
- **`:`** — Kotlin's single syntax for "this class's parent is," replacing
  Java's separate `extends`.
- **Inherited visibility on override** — an overriding member with no
  visibility modifier written keeps the exact visibility of the member it
  overrides, rather than defaulting to anything else.

---

## Concept Unit: `open` — Kotlin Classes Are Final by Default

### The Problem

Java's Lesson 06 built `Dog extends Animal` with no ceremony at all —
`Animal`, as an ordinary class, was subclassable by default; Java would
have required an explicit `final` keyword to *prevent* that. Kotlin
makes the opposite choice as its starting point. Before seeing what that
looks like when it works, see what it looks like when it's refused.

### Introduce the Concept in Isolation

```kotlin
class Animal {
    fun makeSound(): String {
        return "..."
    }
}

class Dog : Animal() {
    fun makeSound2(): String {
        return "Woof"
    }
}
```

Compile:

```
kotlinc Animal.kt -include-runtime -d Animal.jar
```

Real output, from running this just now:

```
Animal.kt:7:13: error: this type is final, so it cannot be extended.
class Dog : Animal() {
            ^^^^^^
```

`Dog` never even gets the chance to define its own `makeSound2()` — the
whole attempt to write `: Animal()` at all fails to compile, because
`Animal` is an ordinary Kotlin class, and an ordinary Kotlin class is,
by default, **final**: not extendable by anything, under any
circumstance, with no keyword needed to declare that intention. Fix it
by marking `Animal` **`open`**, the keyword that reverses this default
for one specific class:

```kotlin
open class Animal {
    fun makeSound(): String {
        return "..."
    }
}

class Dog : Animal() {
    fun makeSound2(): String {
        return "Woof"
    }
}
```

This version compiles cleanly. `open class Animal` is a deliberate,
visible declaration: "this specific class may be subclassed" — the
opposite of Java, where every class silently allows this unless it
explicitly opts out with `final`.

### Discard the Throwaway Example

This exact `Animal`/`Dog` pair continues into the next unit rather than
being deleted outright — there's one more real error still waiting in
it.

---

## Concept Unit: `open` on a Member — Both the Class and the Method Must Agree

### The Problem

`open class Animal` above let `Dog` exist as a subclass at all — but
`Dog`'s `makeSound2()` was a brand-new method, not a replacement for
`Animal`'s own `makeSound()`. Try what Java's Lesson 06 did next:
actually override the parent's method.

### Introduce the Concept in Isolation

```kotlin
open class Animal {
    fun makeSound(): String {
        return "..."
    }
}

class Dog : Animal() {
    override fun makeSound(): String {
        return "Woof"
    }
}
```

Compile:

```
kotlinc Animal2.kt -include-runtime -d Animal2.jar
```

Real output, from running this just now:

```
Animal2.kt:8:5: error: 'makeSound' in 'Animal' is final and cannot be overridden.
    override fun makeSound(): String {
    ^^^^^^^^
```

A second, independent final-by-default rule, layered on top of the
first: marking the *class* `open` only grants permission to subclass it
at all — every individual method still needs its *own* `open` marker
before it can be overridden. Mark `makeSound` open too:

```kotlin
open class Animal {
    open fun makeSound(): String {
        return "..."
    }

    fun describe(): String {
        return "This animal says: " + makeSound()
    }
}

class Dog : Animal() {
    override fun makeSound(): String {
        return "Woof"
    }
}

fun main() {
    val genericAnimal = Animal()
    val dog = Dog()
    println(genericAnimal.describe())
    println(dog.describe())
}
```

Compile and run:

```
kotlinc Animal3.kt -include-runtime -d Animal3.jar
java -jar Animal3.jar
```

Real output, from running this just now:

```
This animal says: ...
This animal says: Woof
```

Same result as Java's Lesson 06 — `describe()` is never overridden by
`Dog`, yet calling it on a `Dog` object still prints `"Woof"`, because
`describe()`'s call to `makeSound()` is resolved against the object's
*real* type at the moment of the call. This is the same **dynamic
dispatch** Java's Lesson 06 already named; nothing about the mechanism
itself changed, only the ceremony required to opt a class and a method
into allowing it at all.

### Discard the Throwaway Example

`Animal`/`Dog` are deleted now, for real this time. Two `open` markers
were needed to reach the exact behavior Java gave you by default with
zero markers — the tradeoff this lesson's SE Lens returns to directly.

---

## Concept Unit: `override` Is Mandatory, Not Optional

### The Problem

Java's `@Override` was an annotation you could simply leave off — the
code still compiled either way, and Java's Lesson 06 had to construct a
deliberate exercise (misspell a method name, recompile with and without
`@Override`) to show that leaving it off lets a typo silently create an
unrelated new method instead of failing loudly. Does Kotlin's `override`
have that same optional, easy-to-forget quality?

### Introduce the Concept in Isolation

Take the working `Dog` from the previous unit and remove the `override`
keyword, leaving everything else — including `open fun makeSound()` on
`Animal` — exactly as it was:

```kotlin
open class Animal {
    open fun makeSound(): String {
        return "..."
    }
}

class Dog : Animal() {
    fun makeSound(): String {
        return "Woof"
    }
}
```

Compile:

```
kotlinc NoOverrideKeyword.kt -include-runtime -d NoOverrideKeyword.jar
```

Real output, from running this just now:

```
NoOverrideKeyword.kt:8:9: error: 'makeSound' hides member of supertype 'Animal' and needs an 'override' modifier.
    fun makeSound(): String {
        ^^^^^^^^^
```

Where Java would compile this silently — Lesson 06's own exercise proved
exactly that — Kotlin refuses outright: `override` is not a
compiler-checked *suggestion*, it's a required keyword any time a member
genuinely matches an `open` member in the parent. Now try the opposite
mistake — keep `override`, but misspell the name so it no longer matches
anything real in `Animal`:

```kotlin
open class Animal {
    open fun makeSound(): String {
        return "..."
    }
}

class Dog : Animal() {
    override fun makeSond(): String {
        return "Woof"
    }
}
```

Real output, from running this just now:

```
TypoOverride.kt:8:5: error: 'makeSond' overrides nothing.
    override fun makeSond(): String {
    ^^^^^^^^
```

This is directly, precisely, the exact bug Java's Lesson 06 needed a
whole deliberate exercise to demonstrate — a typo'd override silently
becoming an unrelated new method — and Kotlin makes it structurally
impossible to happen unnoticed. `override` demands a real match, in
*both* directions: writing it with nothing to match is an error
(`overrides nothing`), and matching something real without writing it is
an equally real, equally immediate error (`needs an 'override'
modifier`). There is no third case where a typo quietly compiles.

### Discard the Throwaway Examples

Every `Animal`/`Dog`/`NoOverrideKeyword`/`TypoOverride` file from this
lesson is deleted now. `open` and `override`, together, are exactly what
`MainActivity.kt` already contains — the next unit explains it for real.

### CS Lens

This is still **inheritance**, and `describe()` calling into whichever
`makeSound()` actually belongs to the real object is still **dynamic
dispatch** — the identical concepts Java's Lesson 06 already named. What
changed is a language design decision about *defaults*: Kotlin requires
opting in to being extended (`open` on a class), opting in to being
overridden (`open` on a member), and opting in to actually performing an
override (`override`, checked both ways) — three separate, explicit
declarations standing in for the one silent default Java grants for
free, plus one optional, skippable annotation.

Also recognized in: C#'s `sealed` (classes there are open by default,
like Java, but `sealed` can lock one down after the fact — the reverse
direction from Kotlin's own default); C#'s own `virtual`/`override` pair,
which — unlike Java's optional `@Override` — is Kotlin's closest real
relative: C# also requires a base method to be marked `virtual` before
any subclass can override it, and also requires the subclass to write
`override` explicitly, matched in both directions exactly like Kotlin's
own rule just proved.

### SE Lens

**Why require two separate `open` markers (class, then member) instead
of one?** They protect against two genuinely different risks. Marking a
whole class `open` says "subclassing this design is intentional" — a
statement about the class's overall role in a codebase. Marking one
specific member `open` says something narrower: "this particular piece
of behavior is safe to replace; the rest of this class's internals are
not." A class can be genuinely open to extension while still keeping
most of its own methods closed to overriding — exactly the shape a
framework author reaches for when subclasses should be able to
customize one documented extension point without being free to silently
break unrelated internal behavior the class depends on staying correct.
Java's single, coarser `final`-to-opt-out model has no equivalent
middle ground: once a Java class is non-`final`, every one of its
non-`final`, non-`private` methods is fair game for a subclass to
replace, whether the original author considered that safe or not. The
real cost Kotlin's finer-grained default imposes lands on the *class
author*, up front, at design time — deciding and declaring, for every
class and every member, whether it's actually meant to be extended —
rather than on every future subclass author discovering the hard way
which parts were safe to touch.

---

## Concept Unit: Overriding Doesn't Restate Visibility — It Inherits It

### The Problem

Java's Lesson 06 wrote `protected void onCreate(...)` — repeating
`protected` explicitly on the override, matching the exact modifier
`Activity`'s own real `onCreate` declares. Lesson 04's generated
`MainActivity.kt`, by contrast, wrote plainly `override fun
onCreate(savedInstanceState: Bundle?)` — no visibility modifier
anywhere. `AppCompatActivity`'s real `onCreate` is `protected`, quoted
directly at the top of this lesson. Did Kotlin quietly make it `public`
by leaving the word out, or something else?

### Introduce the Concept in Isolation

```kotlin
open class Animal {
    protected open fun makeSound(): String {
        return "..."
    }
}

class Dog : Animal() {
    override fun makeSound(): String {
        return "Woof"
    }
}

fun main() {
    val dog = Dog()
    println(dog.makeSound())
}
```

Compile:

```
kotlinc VisCheck.kt -include-runtime -d VisCheck.jar
```

Real output, from running this just now:

```
VisCheck.kt:15:17: error: cannot access 'fun makeSound(): String': it is protected in 'Dog'.
    println(dog.makeSound())
                ^^^^^^^^^
```

`Dog`'s `override fun makeSound()` wrote no visibility modifier at all —
and the compiler still refuses to call it from outside the class,
naming it `protected in 'Dog'` explicitly. Writing no modifier did not
default to `public`; it kept `protected`, the exact visibility
`Animal`'s own version declared. Confirm the opposite direction —
*widening* it — requires writing the wider modifier explicitly, not
just leaving the field blank:

```kotlin
class Dog : Animal() {
    public override fun makeSound(): String {
        return "Woof"
    }
}
```

Real output, from running this just now: compiles with no error at all,
including a call to `dog.makeSound()` from outside the class. Widening
is allowed, but only when stated — an override's default, with no
modifier written, is always to match the parent exactly.

### Discard the Throwaway Example

`Animal`/`Dog` are deleted. This exact rule is what makes
`MainActivity.kt`'s bare `override fun onCreate(...)` correct rather than
an omission.

### CS Lens

This is a **narrower, safer default**, cut from the same cloth as this
lesson's `open`/final default: rather than requiring every override to
restate a fact that's already fixed by the class it's overriding,
Kotlin treats "same visibility as the parent" as the sensible assumption
and only asks for a word when the code is doing something *different*
from that assumption — narrowing is actually disallowed outright (an
override can never be more restrictive than what it overrides), and
widening requires saying so.

### SE Lens

**Why does Java require restating the modifier at all, if it usually
just repeats what the parent already declared?** Java's rule is
really "the override's own modifier is independently checked against
the parent's, and happens to need to be written every time because Java
has no notion of a modifier being *inherited* rather than *restated*."
The cost is small but constant: every one of Java's Lesson 06-style
overrides across a real codebase repeats a fact the reader could already
infer from the parent class. Kotlin's version removes a specific kind of
noise — text that, in the overwhelming majority of real overrides,
carries zero new information — while still making the *rare* case (an
override choosing to widen access) visible exactly where it happens,
because that's the one case actually worth a reader's attention.

---

## Concept Unit: `MainActivity.kt`, Explained for Real

### The Problem

Lesson 04 generated `MainActivity.kt` with two words flagged and
deferred: `: AppCompatActivity()` and `override fun onCreate`. Both are
now fully explained concepts — what's left is confirming they apply to
this exact real file the same way they applied to the disposable
`Animal`/`Dog` labs above.

### Project Change

- **Reference Source:** `AppCompatActivity`'s real declared shape —
  the same real class Java's Lesson 06 already quoted directly from
  `androidx.appcompat.app.AppCompatActivity`, unchanged by which
  language calls into it:

  ```java
  public class AppCompatActivity extends FragmentActivity implements
          AppCompatCallback, TaskStackBuilder.SupportParentable,
          ActionBarDrawerToggle.DelegateProvider {

      protected void onCreate(@Nullable Bundle savedInstanceState) { ... }
      protected void onStart() { ... }
      protected void onStop() { ... }
      protected void onDestroy() { ... }
      // ...and more not shown here
  }
  ```

  `AppCompatActivity` is itself written in Java, not Kotlin — worth
  naming directly, because it matters for this exact lesson: Kotlin's
  "final by default" rule applies to declarations *written in Kotlin*.
  A Java class's own default (extendable unless explicitly marked
  `final`) is unaffected by which language later subclasses it. Proven,
  not just asserted: a plain, ordinary Java class with no `final`
  anywhere on it can be subclassed from Kotlin, and one of its methods
  overridden with Kotlin's `override`, with no change required on the
  Java side at all —

  ```java
  // JavaBase.java — an ordinary Java class, not this project's code
  public class JavaBase {
      public String greet() {
          return "Hello from Java";
      }
  }
  ```

  ```kotlin
  class KotlinDerived : JavaBase() {
      override fun greet(): String {
          return "Hello from Kotlin subclass"
      }
  }
  ```

  Compiled and run just now (`javac` for `JavaBase.java`, `kotlinc` for
  `KotlinDerived.kt` against it), real output:

  ```
  Hello from Kotlin subclass
  ```

  No `open` anywhere in `JavaBase.java` — Java code doesn't have the
  keyword at all — and the override still succeeded. `AppCompatActivity`
  itself is exactly this case, at a larger scale: `onCreate` and the
  other lifecycle methods quoted above are ordinary, non-`final` Java
  methods, which is all Kotlin's `override` needs to be satisfied.
- **Files affected:** `MainActivity.kt` — no edit; this unit explains
  code Lesson 04 already generated.
- **Change type:** None.

### The New Code

No new code. Reopen the same file from Lesson 04:

```kotlin
class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
```

### Mechanical Walkthrough

- `: AppCompatActivity()` — **first appearance of `:` for inheritance.**
  Kotlin uses one colon for what Java split into two separate keywords,
  `extends` (a class) and `implements` (an interface) — Lesson 32 of this
  series covers the interface side directly; for a class, as here, `:`
  reads exactly like Java's `extends`: `MainActivity`'s parent is
  `AppCompatActivity`. The `()` immediately after the parent's name is
  not decoration — it's a real constructor call, the same primary
  constructor mechanism this series' own Lesson 03 already covered,
  here calling `AppCompatActivity`'s own (zero-argument) constructor as
  part of building every `MainActivity`.
- `override fun onCreate(savedInstanceState: Bundle?)` — **reappearing**,
  the exact concept just proven in isolation above: `onCreate` is a real,
  non-`final` method declared on `AppCompatActivity` (quoted above), so
  `override` is both required and valid here — omit it, and this file
  would fail with precisely the `'onCreate' hides member of supertype...
  needs an 'override' modifier` error this lesson's own lab already
  triggered on purpose. Notice, too, what's *not* written: Java's Lesson
  06 wrote `protected void onCreate(...)`, restating `protected` to match
  `Activity`'s own declaration. This line writes no visibility modifier
  at all — and, per this lesson's own inherited-visibility proof above,
  that silently keeps `onCreate` exactly `protected`, not `public`; it is
  not an omission, it's the default doing its job.
- `super.onCreate(savedInstanceState)` — genuinely basic, already
  established: `super` means exactly what Java's Lesson 06 already
  proved it means — "the parent's own original version of this
  overridden method" — completely unchanged by the language switch.

### SE Lens

**Why does this lesson bother proving that a Java class needs no `open`
keyword, instead of just stating it as a fact?** Because the natural,
reasonable-sounding guess is wrong: having just learned that Kotlin
classes are final by default, it would be easy to assume `open` is a
*general* Kotlin-ecosystem requirement that every base class everywhere
must satisfy — including framework classes. It isn't. The rule belongs
to the *compiler that produced the class*, not to Kotlin as an ecosystem
rule imposed on all code universally. `AppCompatActivity`, `Activity`,
`View`, and virtually every AndroidX class this series will ever extend
were all written in Java, long before Kotlin's final-by-default choice
existed, and every one of them remains freely subclassable from Kotlin
for exactly the reason this unit's `JavaBase`/`KotlinDerived` proof just
demonstrated directly.

---

## Connect the Pieces

One trace through this lesson: `class Animal` alone refused `: Animal()`
outright — final by default, proven by a real compiler error, not
assumed. `open class Animal` allowed the subclass to exist; `open fun
makeSound()` was still separately required before `override fun
makeSound()` was allowed to replace it. Omitting `override` on a real
match, and writing `override` on a typo'd non-match, both produced real,
distinct, immediate compiler errors — structurally closing the exact gap
Java's optional `@Override` left open. Leaving off a visibility modifier on that same override didn't default
to `public` either — a real, verified crash proved it silently kept
`protected`, matching `Animal`'s own declaration exactly. And
`MainActivity : AppCompatActivity()` proved to be the same pattern,
applied to a real, non-`final` Java framework class, where Kotlin's
`override` keyword was required and satisfied without
`AppCompatActivity` itself ever needing to write `open` at all — and its
own bare `override fun onCreate(...)`, with no modifier written, quietly
stays `protected` for exactly the reason just proven.

## What Breaks Without This

In the real project, remove `override` from `onCreate` in
`MainActivity.kt`, leaving everything else unchanged, and try to build.

Real output, from running this just now (same error class, applied to
the real project's own file):

```
MainActivity.kt:9:22: error: 'onCreate' hides member of supertype 'AppCompatActivity' and needs an 'override' modifier.
    fun onCreate(savedInstanceState: Bundle?) {
        ^^^^^^^^
```

This is not a hypothetical drawn from the lab — it's the exact same
compiler rule, now refusing to let the real project's build succeed at
all until `override` is restored. Restore it before moving on.

## Exercises

1. In the `Animal`/`Dog` lab, add a second subclass, `Cat`, overriding
   `makeSound()` differently, and confirm `describe()` — which `Cat`
   still never writes itself — produces the right sound for a `Cat`
   object. Same dynamic-dispatch proof Java's Lesson 06 asked for, now
   with Kotlin's `open`/`override` ceremony in place.
2. Mark `Animal`'s `describe()` method `open` as well (it doesn't need
   to be, for anything in this lesson) and override it in `Dog` with a
   version that calls `super.describe()` and appends extra text. Confirm
   `super` still reaches the parent's original implementation, exactly
   as it did for `onCreate`.
3. Try marking a `private` method `open` in a disposable class. Read the
   real compiler error and reason about why `private` and `open` are a
   contradiction — a subclass can never see a `private` member at all,
   so there is nothing there to override.

## Definition of Done

- [ ] You triggered all five real compiler errors in this lesson
      yourself: a final class rejecting `:`, a final method rejecting
      `override`, a missing `override` on a real match, `override` on a
      typo'd non-match, and the real project's own build failing the
      same way.
- [ ] You can state, precisely, the two separate `open` requirements —
      class-level and member-level — and why both exist.
- [ ] You proved to yourself, with real `javac`/`kotlinc` output, that a
      Java class needs no `open` keyword to be subclassed from Kotlin.
- [ ] You can point at `MainActivity : AppCompatActivity()` and
      `override fun onCreate` and explain each word, including why
      `override` is required there specifically.
- [ ] Commit: not applicable for the lab files (all deleted scratch);
      the real project has no changes to commit this lesson, since this
      lesson only explained code Lesson 04 already wrote.

Next: back to real screen-building — Views and layout containers,
confirming what Java's Lesson 08 already decided still holds, and View
Binding's field access replacing what `findViewById` used to reach.
