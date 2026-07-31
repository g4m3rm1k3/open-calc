# Lesson 0j: Access-Level Enforcement — `private` and `public`

**What you will build:** A disposable lab, same pattern as before.
Today's case study: restricting which code is allowed to touch a
class's own fields directly.

**What you need to know first:** Lesson 0a's `class`, Lesson 0e's
method.

**Terms introduced in this lesson:**

- **Access-level enforcement (access modifiers, `private` / `public`)**
  — restricting which code can read or write a class member based on a
  declared visibility level, checked by the compiler before the program
  ever runs.

---

## Concept Unit: Access-Level Enforcement — `private` and `public`

### The Problem

Every field written so far — `name`, `age`, `totalDogsCreated` — has
been freely readable and writable from anywhere, including from `Main`,
code that has no business reaching directly into a `Dog`'s internals.
Nothing stops `myDog.age = -50;` from compiling and running, even
though a negative age is nonsense no real dog could have. Some way is
needed to say, at the language level, "this field can only be touched
from inside this class" — not as a comment or a naming convention, but
as something the compiler actually enforces.

### Introduce the Concept in Isolation

```
mkdir lesson-0j
cd lesson-0j
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
inside `Dog` itself — `Main` cannot write `myDog.age = -50;` at all,
not even accidentally; it would fail to compile. `public` means
`setAge` and `getAge` can be called from anywhere, including from
`Main`. The second call, `myDog.setAge(-50)`, shows the actual payoff:
age stays `3`, because `setAge`'s own check rejected the negative value
— a check `Main` has no way to bypass, since `age` itself is
unreachable from outside `Dog`.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `private int age;` — **(a) first appearance** of the `private`
   modifier: the field exists, but no code outside `Dog`'s own braces
   can reference it at all, checked at compile time, not left to
   convention.
2. `public void setAge(int newAge)` — **(a) first appearance** of the
   `public` modifier: this method is reachable from any code, anywhere,
   including outside `Dog`.
3. `if (newAge >= 0) { age = newAge; }` — genuinely basic conditional
   and assignment syntax. The one new fact: this check is the *only*
   path that can ever change `age`, because `age` itself is `private` —
   there is no other way into it.
4. `public int getAge() { return age; }` — a second `public` method,
   reappearing shape from Lesson 0e's methods that return a value.
5. `myDog.setAge(-50);` — calls the public method with an invalid
   value; the method's own internal check silently declines to apply
   it. `Main` cannot directly force `age` to `-50` even by trying,
   since `myDog.age = -50;` would not compile at all — try it, and see
   the error yourself in the exercises.

### CS Lens

Access-level enforcement is Java's real, compiler-checked contrast to
languages that only offer a *convention* — Python's leading-underscore
`_age`, for instance, signals "please don't touch this from outside"
but enforces nothing; any code can still write `myDog._age = -50` and
Python will not object. Java's `private` proves the compiler can catch
a whole category of mistake — reaching into a class's own internals
from outside it — before the program ever runs, not just discourage it
by convention.

Also recognized in: `private`/`protected`/`internal` in C#,
name-mangled double-underscore attributes in Python (a closer, though
still convention-based, attempt at the same idea), access modifiers in
every mainstream statically-typed object-oriented language.

### SE Lens

The alternative — leaving `age` a plain, publicly writable field and
trusting every caller to only ever set valid values — was not chosen
because trust doesn't scale: as a codebase grows, more and more code
ends up touching `age` directly, and there is no way to guarantee,
later, that every one of those call sites remembers the "no negative
ages" rule. Java gives `private` a real compiler check specifically so
that rule can be enforced in exactly one place — inside `setAge` —
instead of needing to be remembered correctly at every call site,
forever, by everyone who ever touches this class.

---

## Connect the Pieces

`private int age;` restricts direct access; `setAge`/`getAge` are the
only path in or out, and `setAge`'s own check is now the *only* place a
negative age could ever be rejected. The next lesson (Encapsulation)
names the broader design principle this mechanism serves.

## What Breaks Without This

Try to write directly to the private field from `Main`:

```java
myDog.age = -50;
```

Compile it yourself to see the real compiler error, resembling:

```
error: age has private access in Dog
```

This is a compile-time error, not a runtime crash — the program never
even finishes building. A convention can be ignored by accident; a
compiler error cannot.

## Exercises

1. Try the `myDog.age = -50;` line yourself from `Main`, read the real
   compiler error, then delete that line so the program compiles again.
2. Change `age`'s declaration from `private` to `public`, and confirm
   `myDog.age = -50;` now compiles — then run the program and observe
   that `setAge`'s validation can now be bypassed entirely. Change it
   back to `private` afterward.
3. Add a `private String name;` field with `public` `setName`/`getName`
   methods, where `setName` refuses to accept an empty string.

## Definition of Done

- [ ] You ran the `Dog` example and saw both `Age:` lines print
      correctly, including the rejected `-50`.
- [ ] You attempted `myDog.age = -50;` directly, saw the real "has
      private access" compiler error, and removed the line.
- [ ] You completed Exercise 2 and can explain, in your own words, what
      changing `private` to `public` actually breaks.
