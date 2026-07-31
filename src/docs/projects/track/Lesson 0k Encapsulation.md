# Lesson 0k: Encapsulation — The Principle `private` Serves

**What you will build:** No new code — this lesson names a principle
already demonstrated in the previous one.

**What you need to know first:** Lesson 0j's access-level enforcement.

**Terms introduced in this lesson:**

- **Encapsulation** — controlling which parts of a system are allowed
  to depend on which other parts, by restricting direct access to a
  class's own internals.

---

## Concept Unit: Encapsulation — The Principle `private` Serves

### The Problem

`private`/`public` are Java's specific *mechanism*. The *reason* to use
them at all is a more general idea, one that shows up in every part of
software design, not just field access: deciding, deliberately, which
parts of a system are allowed to depend on which other parts, so that
changing one part doesn't silently break another.

### Introduce the Concept in Isolation

This concept doesn't need new code to isolate — Lesson 0j's lab already
demonstrates it directly; the point here is naming what that lab was
actually doing at a level above the Java keywords themselves. Look
again at `Dog`'s shape:

```java
class Dog {
    private int age;

    public void setAge(int newAge) {
        if (newAge >= 0) {
            age = newAge;
        }
    }

    public int getAge() {
        return age;
    }
}
```

This shape is `encapsulation` — **first appearance**: controlling which
parts of a system are allowed to depend on which other parts, by
restricting direct access to a class's own internals. `Main` (and any
other code) is allowed to depend only on `Dog`'s public surface —
`setAge`, `getAge` — never on the fact that `age` happens to be stored
as a plain `int` field internally. That distinction has a real
consequence: `Dog` could later change how it stores age (say, as a
`birthYear` computed against the current year instead) and, as long as
`getAge()` still returns the right number, `Main` would never need to
change at all.

### Discard the Throwaway Example

No new throwaway code was introduced in this unit — it names a
principle already demonstrated, rather than requiring a fresh lab.

### Mechanical Walkthrough

No new syntax appears in this unit; there is nothing to enumerate
beyond Lesson 0j's own code. This unit's entire content is the CS/SE
framing below.

### CS Lens

Encapsulation is the general software engineering idea that
access-level-enforcement is one concrete *mechanism* for. The two are
not the same thing: encapsulation is a design goal ("hide internal
details behind a stable, minimal public surface"); `private`/`public`
is Java's specific, compiler-enforced tool for achieving it. A language
with no access modifiers at all could still practice encapsulation by
convention (as Python does), just without a compiler backing the
boundary up.

Also recognized in: any module that exposes a small public API while
hiding its internal implementation, any class library's documented
public methods versus its undocumented internals, the general
principle behind "information hiding" in every software design
discipline, not just object-oriented ones.

### SE Lens

The alternative — exposing every field publicly and relying on callers
to "just be careful" — was already shown broken in Lesson 0j's own
problem statement (`myDog.age = -50;` compiling with nothing to stop
it). Encapsulation's payoff compounds over a program's lifetime: every
field kept `private` behind a small public surface is a field `Dog` can
freely change the internal representation of later, without that
change ever being visible to, or breaking, any other class that only
ever depended on the public surface. The cost is upfront — writing
`setAge`/`getAge` instead of just exposing `age` directly — traded for
never having to audit every caller in the program when the internal
representation eventually needs to change.

---

## Connect the Pieces

Lesson 0j's `private int age;` restricted direct access using Java's
specific, compiler-checked mechanism. Encapsulation is the reason that
mechanism is worth using at all: deliberately controlling which code is
allowed to depend on which other code, so `Dog`'s internal storage can
change later without breaking anything that only ever used its public
methods.

## What Breaks Without This

Recall Lesson 0j's own real compiler error for `myDog.age = -50;` —
that error is encapsulation's boundary being enforced concretely. This
is the difference between Java's compiler-checked enforcement and a
convention-only approach (like Python's leading underscore): a
convention can be ignored by accident; a compiler error cannot.

## Exercises

1. In Lesson 0j's `Dog`, change `age`'s internal storage to a
   `birthYear` field instead, computing the returned age inside
   `getAge()`. Confirm `Main`'s own code never needs to change.
2. Explain, in your own words, why encapsulation is a design principle
   and `private`/`public` are just one language's mechanism for it.
3. Name one other place (outside this lesson's `Dog` example) where you
   depend only on a public surface without knowing or caring about the
   internal implementation behind it.

## Definition of Done

- [ ] You completed Exercise 1 and confirmed `Main` needed no changes.
- [ ] You can state, without looking back at this lesson, the
      difference between access-level-enforcement and encapsulation.
