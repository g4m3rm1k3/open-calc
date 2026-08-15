# Lesson 03: Interfaces, Anonymous Classes, and Lambdas

**What you will build:** a real, hand-written single-method interface,
satisfied three progressively shorter ways — a named class, an anonymous
class, and a real Java 8 lambda — proving all three produce identical,
working behavior before this series' framework arc leans on the pattern
for every Android listener.

**What you need to know first:** [Lesson 01](lesson-01-java-syntax-at-a-glance.md).
Real interfaces (the `interface` keyword, `implements`) already known
from this curriculum's own prior Java/Kotlin Android work.

**Terms introduced in this lesson:**
- **Functional interface** — a real interface with exactly one abstract
  method; the specific shape a lambda can satisfy.
- **Anonymous class** — a real, unnamed class, declared and instantiated
  in a single expression, implementing an interface (or extending a
  class) inline.
- **Lambda expression (Java)** — `(params) -> body`, Java 8's own inline
  function-literal syntax, usable only where a functional interface is
  expected.

**Objects and methods used:** none beyond a hand-declared interface,
this lesson's own subject throughout.

---

## Concept Unit: A Single-Method Interface — the Real Shape Behind Every Listener

### The Problem

"Run this specific code when something happens" — a button click, in the
real Android framework this series' next arc will meet — needs some way
to hand a piece of behavior to code that doesn't yet exist when the
button itself is declared. Java has no first-class function type the way
Kotlin (`(Int) -> Boolean`, this series' Lesson 08) or C#
(`wpf-foundations` Lesson 05's `delegate`) do — what's Java's real
answer?

### Introduce the Concept in Isolation

```java
interface ClickListener {
    void onClick();
}

class Button {
    private ClickListener listener;

    void setOnClickListener(ClickListener listener) {
        this.listener = listener;
    }

    void simulateClick() {
        if (listener != null) {
            listener.onClick();
        }
    }
}
```

```java
class PrintListener implements ClickListener {
    public void onClick() {
        System.out.println("Clicked via named class!");
    }
}

Button button = new Button();
button.setOnClickListener(new PrintListener());
button.simulateClick();
```

Output:
```
Clicked via named class!
```

`interface ClickListener { void onClick(); }` — a real interface with
**exactly one** abstract method — this specific shape is called a
**functional interface**, and it's Java's real, standing answer to "pass
behavior as a value": rather than a function type, Java wraps the
behavior in an object implementing a single-method contract.
`setOnClickListener(ClickListener listener)` accepts *any* object
implementing `ClickListener`, without knowing or caring which concrete
class it actually is — `button.simulateClick()` calls `listener.onClick()`
through the interface reference, and whichever real implementation was
passed in is what actually runs.

### Discard

`PrintListener` is disposable — this exact real-world pattern
(`Button`/`ClickListener`) is, closely paraphrased, the actual shape
Android's own `View.OnClickListener` takes; nothing here is a
simplification invented just for this lesson.

### Mechanical Walkthrough

- `interface ClickListener { void onClick(); }` — **(a) first
  appearance** as this lesson's subject, explained above.
- `class Button { private ClickListener listener; ... }` — **(c) already
  basic** as class/field declaration; `listener`'s type being an
  interface, not a concrete class — **(a) first appearance** of this
  specific idea: any real implementation of `ClickListener` can be
  stored here, decided entirely by whoever calls `setOnClickListener`.
- `class PrintListener implements ClickListener { public void onClick()
  { ... } }` — **(c) already basic** as interface implementation syntax,
  already familiar; `public` here specifically — **(a) first
  appearance** of a real Java requirement: an interface method's
  implementation must be declared `public`, even though the interface
  itself declared no access modifier at all (interface methods are
  implicitly `public abstract` by default).
- `button.setOnClickListener(new PrintListener());` — **(c) already
  basic** as method call and object construction; passing a real,
  separate object *as* the behavior is this unit's own point.

## Concept Unit: An Anonymous Class — the Behavior, With No Separate Class Declared

### The Problem

Declaring `PrintListener` as a whole separate, named, top-level class
just to use it once, right here, is real, avoidable ceremony — the
identical real problem Kotlin's Lesson 08 and `wpf-foundations`
Lesson 05 both named for their own languages. Does Java offer something
more direct?

### Introduce the Concept in Isolation

```java
Button button = new Button();
button.setOnClickListener(new ClickListener() {
    public void onClick() {
        System.out.println("Clicked via anonymous class!");
    }
});
button.simulateClick();
```

Output:
```
Clicked via anonymous class!
```

`new ClickListener() { public void onClick() { ... } }` — an **anonymous
class**: `new ClickListener()` looks like constructing an interface
directly (illegal on its own — an interface can never be instantiated),
but the `{ }` immediately following it supplies a real, complete,
*unnamed* implementation inline, in the same expression — Java
constructs a real, one-off class satisfying `ClickListener`, with no
separate `class PrintListener` declaration anywhere. The real, produced
behavior is identical to the previous unit's — only how it's expressed
changed.

### Discard

This proof is disposable; the next unit's lambda replaces this same
shape with far less syntax.

### Mechanical Walkthrough

- `new ClickListener() { ... }` — **(a) first appearance** of anonymous
  class syntax itself, explained above.
- `public void onClick() { ... }` — **(b) hard concept reappearing**,
  the identical method signature and `public` requirement from the
  previous unit's `PrintListener`, now written inline instead of inside
  a separately named class.

## Concept Unit: A Lambda — the Same Behavior, Minimal Syntax

### The Problem

An anonymous class is shorter than a full named class, and still real
ceremony — `new ClickListener() { public void onClick() { ... } }`
repeats the interface name and the method signature, neither of which
carries new information the compiler couldn't already infer from
context. Does Java 8's lambda syntax remove that remaining ceremony?

### Introduce the Concept in Isolation

```java
Button button = new Button();
button.setOnClickListener(() -> System.out.println("Clicked via lambda!"));
button.simulateClick();
```

Output:
```
Clicked via lambda!
```

`() -> System.out.println("Clicked via lambda!")` — a real Java 8
**lambda expression**: `()` is the (empty, matching `onClick()`'s own
zero parameters) parameter list, `->` separates it from the body,
`System.out.println(...)` is the body. No `ClickListener` name, no
`onClick` name, no `public` — the compiler infers all of it from
`setOnClickListener`'s own declared parameter type, exactly the same
real inference this series' Lesson 08 already proved for Kotlin's own
trailing lambdas. The real, produced behavior is, once again, identical
to both previous units'.

### Discard

Nothing here is disposable — this is the real, standard modern Java
shape for exactly this pattern, used throughout Android's own real Java
code wherever a single-method listener interface is involved.

### Mechanical Walkthrough

- `() -> System.out.println(...)` — **(a) first appearance** of Java's
  own lambda syntax, explained above.
- `button.setOnClickListener(...)` — **(c) already basic** as a method
  call; accepting a lambda directly, with no visible interface or method
  name at the call site at all, is this unit's own proof — confirmed by
  the identical, correct output shared across all three of this lesson's
  units.

### CS Lens

**(b) hard concept, real restatement.** A lambda satisfying a
single-method interface is Java's own real version of a **first-class
function** — the identical idea `wpf-foundations` Lesson 05 named for
C#'s `delegate`/lambda pair and this series' own Lesson 08 named for
Kotlin's function types — arrived at through a genuinely different
mechanism (wrapping the behavior in an object satisfying an interface,
rather than a dedicated function type), because Java's own type system,
unlike Kotlin's or C#'s, has no separate concept of "a function" distinct
from "an object."

Also recognized in: every pre-Java-8 GUI framework's listener pattern
(this is real Java history — anonymous classes were, for years, the only
concise option, which is exactly why so much real, older Android code
still uses them instead of lambdas), and any callback-based API in any
language lacking a true first-class function type.

### SE Lens

The real, honest tradeoff across all three forms proven in this lesson:
a **named class** (`PrintListener`) is reusable by name from multiple
call sites and shows up with a real, findable name in a debugger or
stack trace — genuine value once the same listener logic is needed more
than once. An **anonymous class** keeps the logic local to where it's
used, at the real cost of more syntax than strictly necessary, and (not
exercised directly in this lesson, but real) the ability to hold its own
fields and multiple methods if a listener genuinely needs more than one
callback. A **lambda** is the least ceremony, correct specifically
because `ClickListener` has exactly one method — the moment an interface
needs two or more real methods implemented together, a lambda cannot
satisfy it at all, and an anonymous class (or named class) becomes
required again, not a stylistic choice.

## Connect the pieces

One trace: a single-method interface (`ClickListener`) is Java's real
answer to "pass behavior as a value," with no first-class function type
in the language. A named class satisfies it, reusable but ceremonious. An
anonymous class satisfies it inline, with no separate declaration, but
still repeats the interface and method names. A lambda satisfies it with
minimal syntax, inferred entirely from context — proven, across all
three forms, to produce identical, correct behavior through
`button.simulateClick()`, confirming the choice between them is a real,
honest readability/reusability tradeoff, never a functional one.

## What breaks without this

Attempt a lambda against an interface with **two** real abstract
methods, not one:

```java
interface TwoMethods {
    void first();
    void second();
}

TwoMethods bad = () -> System.out.println("Nope");
```

This does **not** compile:

```
error: incompatible types: TwoMethods is not a functional interface
    multiple non-overriding abstract methods found in interface TwoMethods
```

Direct, provable proof a lambda's own real, load-bearing requirement —
exactly one abstract method — is enforced by the compiler, not a
style guideline; `TwoMethods` genuinely cannot be satisfied by a lambda
at all, only by a named or anonymous class providing both real methods.

## Exercises

1. Reproduce the real `TwoMethods` failure yourself, then satisfy it
   with an anonymous class implementing both `first()` and `second()`,
   confirming it compiles and both methods run correctly when called.
2. Declare a second functional interface,
   `interface Transformer { int transform(int x); }`, and a method
   `apply(int value, Transformer t)` returning `t.transform(value)`.
   Call it with a lambda that doubles its input, confirming the real,
   correct result.

## Definition of Done

- [ ] You built the real `ClickListener`/`Button` pair and satisfied it
      with a named class, confirming correct output.
- [ ] You satisfied the identical interface with an anonymous class and
      a lambda, confirming identical output from all three forms.
- [ ] You caused the real "not a functional interface" compile error and
      understand exactly why a lambda cannot satisfy a two-method
      interface.
- [ ] You completed both exercises.

## Next

[Lesson 04 — Classes and the Object Contract](lesson-04-classes-and-the-object-contract.md)
covers `equals()`/`hashCode()`/`toString()` — the real methods every
Java object already has, proven broken by default and fixed by hand,
the direct contrast to Kotlin's own `data class` (this series'
Lesson 09).
