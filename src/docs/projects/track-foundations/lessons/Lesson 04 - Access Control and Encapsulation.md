# Lesson 04: Access Control and Encapsulation

**What you will build:** A disposable lab, same pattern as Lessons 01–03.
Today's case study: restricting which code is allowed to touch a class's
own fields directly, and the general design principle that restriction
serves.

**What you need to know first:** Lesson 01's `class` and `object`.

**Terms introduced in this lesson:**

- **Access-level enforcement (access modifiers, `private` / `public`)** —
  restricting which code can read or write a class member based on a
  declared visibility level, checked by the compiler before the program
  ever runs.
- **Encapsulation** — controlling which parts of a system are allowed to
  depend on which other parts, by restricting direct access to a class's
  own internals.

---

## Concept Unit: Access-Level Enforcement — `private` and `public`

### The Problem

Every field written so far — `name`, `age`, `totalDogsCreated` — has been
freely readable and writable from anywhere, including from `Main`, code
that has no business reaching directly into a `Dog`'s internals. Nothing
stops `myDog.age = -50;` from compiling and running, even though a
negative age is nonsense no real dog could have. Some way is needed to
say, at the language level, "this field can only be touched from inside
this class" — not as a comment or a naming convention, but as something
the compiler actually enforces.

### Introduce the Concept in Isolation

```
mkdir lesson-04
cd lesson-04
```

Create `Main.java`:

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

public class Main {
    public static void main(String[] args) {
        Dog myDog = new Dog();
        myDog.setAge(3);
        System.out.println("Age: " + myDog.getAge());

        myDog.setAge(-50);
        System.out.println("Age after bad input: " + myDog.getAge());
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
Age: 3
Age after bad input: 3
```

`private int age;` declares `age` with the `private` — **first
appearance** — modifier, and `setAge`/`getAge` are declared `public` —
**first appearance**. Together these are `access-level-enforcement`:
restricting which code can read or write a class member based on a
declared visibility level, checked by the compiler before the program
ever runs. `private` means `age` can only be read or written by code
inside `Dog` itself — `Main` cannot write `myDog.age = -50;` at all, not
even accidentally; it would fail to compile. `public` means `setAge` and
`getAge` can be called from anywhere, including from `Main`. The second
call, `myDog.setAge(-50)`, shows the actual payoff: age stays `3`, because
`setAge`'s own check rejected the negative value — a check `Main` has no
way to bypass, since `age` itself is unreachable from outside `Dog`.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `private int age;` — **(a) first appearance** of the `private`
   modifier: the field exists, but no code outside `Dog`'s own braces can
   reference it at all, checked at compile time, not left to convention.
2. `public void setAge(int newAge)` — **(a) first appearance** of the
   `public` modifier: this method is reachable from any code, anywhere,
   including outside `Dog`.
3. `if (newAge >= 0) { age = newAge; }` — genuinely basic conditional and
   assignment syntax, sorted **(c)**. The one new fact: this check is the
   *only* path that can ever change `age`, because `age` itself is
   `private` — there is no other way into it.
4. `public int getAge() { return age; }` — a second `public` method,
   reappearing shape from Lesson 02's methods that return a value, sorted
   **(b)**.
5. `myDog.setAge(-50);` — calls the public method with an invalid value;
   the method's own internal check silently declines to apply it. This is
   **(a) first appearance** as a concrete demonstration: `Main` cannot
   directly force `age` to `-50` even by trying, since `myDog.age = -50;`
   would not compile at all — try it, and see the error yourself in the
   exercises.

### CS Lens

Access-level enforcement is Java's real, compiler-checked contrast to
languages that only offer a *convention* — Python's leading-underscore
`_age`, for instance, signals "please don't touch this from outside" but
enforces nothing; any code can still write `myDog._age = -50` and Python
will not object. Java's `private` is the first proof, in this curriculum,
that the compiler can catch a whole category of mistake — reaching into a
class's own internals from outside it — before the program ever runs, not
just discourage it by convention.

Also recognized in: `private`/`protected`/`internal` in C#, name-mangled
double-underscore attributes in Python (a closer, though still
convention-based, attempt at the same idea), access modifiers in every
mainstream statically-typed object-oriented language.

### SE Lens

The alternative — leaving `age` a plain, publicly writable field and
trusting every caller to only ever set valid values — was not chosen
because trust doesn't scale: as a codebase grows, more and more code ends
up touching `age` directly, and there is no way to guarantee, later, that
every one of those call sites remembers the "no negative ages" rule. Java
gives `private` a real compiler check specifically so that rule can be
enforced in exactly one place — inside `setAge` — instead of needing to be
remembered correctly at every call site, forever, by everyone who ever
touches this class.

---

## Concept Unit: Encapsulation — The Principle `private` Serves

### The Problem

`private`/`public` are Java's specific *mechanism*. The *reason* to use
them at all is a more general idea, one that shows up in every part of
software design, not just field access: deciding, deliberately, which
parts of a system are allowed to depend on which other parts, so that
changing one part doesn't silently break another.

### Introduce the Concept in Isolation

This concept doesn't need new code to isolate — the previous unit's lab
already demonstrates it directly; the point here is naming what that lab
was actually doing at a level above the Java keywords themselves. Look
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
`setAge`, `getAge` — never on the fact that `age` happens to be stored as
a plain `int` field internally. That distinction has a real consequence:
`Dog` could later change how it stores age (say, as a `birthYear`
computed against the current year instead) and, as long as `getAge()`
still returns the right number, `Main` would never need to change at all.

### Discard the Throwaway Example

No new throwaway code was introduced in this unit — it names a principle
already demonstrated, rather than requiring a fresh lab.

### Mechanical Walkthrough

No new syntax appears in this unit; there is nothing to enumerate beyond
the previous unit's code. This unit's entire content is the CS/SE framing
below.

### CS Lens

Encapsulation is the general software engineering idea that
access-level-enforcement is one concrete *mechanism* for. The two are not
the same thing: encapsulation is a design goal ("hide internal details
behind a stable, minimal public surface"); `private`/`public` is Java's
specific, compiler-enforced tool for achieving it. A language with no
access modifiers at all could still practice encapsulation by convention
(as Python does), just without a compiler backing the boundary up.

Also recognized in: any module that exposes a small public API while
hiding its internal implementation, any class library's documented public
methods versus its undocumented internals, the general principle behind
"information hiding" in every software design discipline, not just
object-oriented ones.

### SE Lens

The alternative — exposing every field publicly and relying on callers to
"just be careful" — was already shown broken in the previous unit's
problem statement (`myDog.age = -50;` compiling with nothing to stop it).
Encapsulation's payoff compounds over a program's lifetime: every field
kept `private` behind a small public surface is a field `Dog` can freely
change the internal representation of later, without that change ever
being visible to, or breaking, any other class that only ever depended on
the public surface. The cost is upfront — writing `setAge`/`getAge`
instead of just exposing `age` directly — traded for never having to
audit every caller in the program when the internal representation
eventually needs to change.

---

## Connect the Pieces

`private int age;` restricts direct access to Java's specific,
compiler-checked mechanism — `setAge`/`getAge` are the only path in or
out. That mechanism is `access-level-enforcement`, and the reason it's
worth using at all is the broader principle it serves: `encapsulation`,
deliberately controlling which code is allowed to depend on which other
code, so `Dog`'s internal storage can change later without breaking
anything that only ever used its public methods.

## What Breaks Without This

Try to write directly to the private field from `Main`:

```java
myDog.age = -50;
```

This fails to compile with an error resembling:

```
error: age has private access in Dog
        myDog.age = -50;
             ^
```

This is a compile-time error, not a runtime crash — the program never
even finishes building. That's the concrete difference between Java's
enforcement and Python's underscore convention: there is no way to make
this line compile from outside `Dog` at all, short of changing `Dog`'s own
declaration. A convention can be ignored by accident; a compiler error
cannot.

## Exercises

1. Try the `myDog.age = -50;` line yourself from `Main`, read the real
   compiler error, then delete that line so the program compiles again.
2. Change `age`'s declaration from `private` to `public`, and confirm
   `myDog.age = -50;` now compiles — then run the program and observe
   that `setAge`'s validation can now be bypassed entirely, defeating the
   whole point of the lesson. Change it back to `private` afterward.
3. Add a `private String name;` field with `public` `setName`/`getName`
   methods, where `setName` refuses to accept an empty string. Confirm,
   from `Main`, that there is no way to give a `Dog` an empty name.

## Definition of Done

- [ ] You ran the `Dog` example and saw both `Age: 3` lines print
      correctly, including the rejected `-50`.
- [ ] You attempted `myDog.age = -50;` directly, saw the real "has private
      access" compiler error, and removed the line.
- [ ] You completed Exercise 2 and can explain, in your own words, what
      changing `private` to `public` actually breaks.
- [ ] You can state, without looking back at this lesson, the difference
      between access-level-enforcement and encapsulation.
