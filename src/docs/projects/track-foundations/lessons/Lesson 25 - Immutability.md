# Lesson 25: Immutability

**What you will build:** A disposable lab, same pattern as earlier
Java-only lessons. Today's case study: a guarantee stronger than "I don't
currently reassign this."

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Immutability (`final`)** — a value that, once assigned, is guaranteed
  by the compiler — not by convention — never to be reassigned again.

---

## Concept Unit: Immutability — A Compiler-Checked Guarantee

### The Problem

A variable that a program simply never happens to reassign looks
identical, in the source code, to one that genuinely *cannot* be
reassigned — until a later edit, by someone unfamiliar with the original
intent, adds a reassignment that breaks an assumption the rest of the
code was quietly relying on. "I don't currently reassign this" and "this
can never be reassigned" are different guarantees, and only one of them
survives a future edit.

### Introduce the Concept in Isolation

```
mkdir lesson-25
cd lesson-25
```

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        final int maxRetries = 3;
        System.out.println("Max retries: " + maxRetries);
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Max retries: 3
```

Now try adding a reassignment:

```java
public class Main {
    public static void main(String[] args) {
        final int maxRetries = 3;
        maxRetries = 5;
        System.out.println("Max retries: " + maxRetries);
    }
}
```

Trying to compile this now produces a real compiler error:

```
error: cannot assign a value to final variable maxRetries
        maxRetries = 5;
        ^
```

`final` is `immutability` — **first appearance**: a value that, once
assigned, is guaranteed by the compiler — not by convention — never to be
reassigned again. Without `final`, nothing stops `maxRetries = 5;` from
compiling; with it, the compiler itself refuses, before the program ever
runs.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `final int maxRetries = 3;` — **(a) first appearance.** `final`
   applies to the variable's assignment, not its type — `maxRetries` is
   still an ordinary `int`, just permanently locked to `3` the moment
   this line runs.
2. `maxRetries = 5;` — an ordinary reassignment, genuinely basic syntax
   on its own, sorted **(c)** — except that `final` makes this specific
   one illegal, caught at compile time rather than silently accepted.

### CS Lens

`final` converts a variable's non-reassignment from an unstated
convention into a real, compiler-checked fact — the same kind of upgrade
Lesson 04's `private` already made for field access: a guarantee enforced
by the language itself, not merely intended by whoever wrote the code
originally.

Also recognized in: `const` in JavaScript (an almost identical
guarantee — reassignment blocked, though a `const` object's own fields
can still change, a subtlety worth knowing but outside this lesson's
scope), immutable bindings in many functional languages by default.
Python has no compiler-enforced equivalent at all — only a convention
(`ALL_CAPS` naming) that nothing actually checks.

### SE Lens

The alternative — relying on a comment (`// do not reassign this`) or a
naming convention alone — was not chosen because neither is actually
enforced; a future edit, made by someone who didn't read the comment
carefully or didn't know the convention, can silently violate the
original intent with no warning at all. `final` costs nothing to add and
converts that risk into an immediate, impossible-to-miss compile error at
the exact moment someone tries to violate it.

---

## Connect the Pieces

`final int maxRetries = 3;` compiles and runs normally. Adding `maxRetries
= 5;` afterward fails to compile, with a real, specific error naming the
exact problem — the concrete difference between a value that merely isn't
reassigned yet and one that structurally cannot be.

## What Breaks Without This

This lesson's own second code example already demonstrated the concrete
failure directly: attempting to reassign a `final` variable produces the
real "cannot assign a value to final variable" compiler error shown
above — proof the guarantee is enforced by the compiler, not left to
convention.

## Exercises

1. Declare a `final` `String` instead of an `int`, attempt to reassign
   it, and confirm the same category of compiler error appears.
2. Remove `final` from this lesson's own example, confirm the
   reassignment now compiles, then restore `final`.
3. Explain, in your own words, why a `final` field on a class (rather
   than a local variable, as shown in this lesson) would need to be
   assigned either at declaration or inside every constructor — reason
   through this without needing to compile it.

## Definition of Done

- [ ] You ran the `final` example and saw the real output.
- [ ] You attempted the reassignment, saw the real "cannot assign a
      value to final variable" compiler error, and removed the
      offending line.
- [ ] You can state, without looking back at this lesson, the difference
      between "a variable that isn't currently reassigned" and "a
      `final` variable."
