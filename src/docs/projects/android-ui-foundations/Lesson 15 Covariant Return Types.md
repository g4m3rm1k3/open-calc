# Lesson 15: Covariant Return Types

**What you will build:** Nothing app-related yet — a disposable example
proving that an overriding method is allowed to declare a *more
specific* return type than its parent did, before meeting this exact
behavior on `EditText`'s real, inherited `getText()` method. The
transferable problem: overriding (Lesson 06) was taught with both the
parent and child method returning the exact same type; real framework
code often narrows the return type on override instead, and that's a
distinct, legal, separately-named piece of the same mechanism, not a
special case to just accept when it shows up.

**What you need to know first:** Lesson 06 (`extends`, overriding,
`@Override`).

**Terms introduced in this lesson:**
- **Covariant return type** — a subclass overriding a method and
  declaring a *more specific* return type than the parent declared,
  allowed as long as the more specific type is itself a subtype of the
  original.

**Objects and methods used:** Covariant return types are this lesson's
own subject, given full treatment below.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`System.out.println(...)`**
  - *What it is:* Java's `static` print-to-standard-output method.
  - *Implementation:* given full treatment in Lesson 01.
  - *Its use:* prints both objects' `getContents()` results, showing the
    narrower type's value alongside the wider one.
- **`extends`**
  - *What it is:* a class inheriting another's fields and methods.
  - *Implementation:* given full treatment in Lesson 06.
  - *Its use:* `LabeledBox extends Container`, the relationship whose
    override this lesson narrows the return type on.
- **`@Override`**
  - *What it is:* the compiler-checked override annotation.
  - *Implementation:* given full treatment in Lesson 06.
  - *Its use:* marks `LabeledBox.getContents()` as replacing
    `Container`'s version, with the narrower return type this lesson's
    own subject makes legal.

---

## Concept Unit: Narrowing a Return Type on Override

### The Problem

Lesson 06's `Dog.makeSound()` overrode `Animal.makeSound()` while keeping
the exact same return type, `String`. Is an override ever allowed to
declare a *different* return type than its parent — and if so, how
different?

### Introduce the Concept in Isolation

```java
class Container {
    Object getContents() {
        return "generic contents";
    }
}

class LabeledBox extends Container {
    @Override
    String getContents() {
        return "labeled contents";
    }
}

public class CovariantDemo {
    public static void main(String[] args) {
        Container plain = new Container();
        LabeledBox labeled = new LabeledBox();

        Object fromPlain = plain.getContents();
        String fromLabeled = labeled.getContents();

        System.out.println(fromPlain);
        System.out.println(fromLabeled);
    }
}
```

Compile and run:

```
javac CovariantDemo.java
java CovariantDemo
```

Real output:

```
generic contents
labeled contents
```

### Mechanical Walkthrough

`Container.getContents()` is declared returning `Object` — Java's own
most general type, the ultimate ancestor of every class. `LabeledBox`
**overrides** `getContents()` (Lesson 06's concept, reappearing) and
declares it returning `String` instead — a *narrower*, more specific
type than the parent declared. This compiles and runs correctly because
`String` genuinely *is* a kind of `Object` (every class in Java is,
ultimately, a kind of `Object`); the override is only allowed to narrow
the return type to some subtype of what the parent declared, never to an
unrelated type. Try changing `LabeledBox`'s return type to something
unrelated, like `int`, and recompile — real error:

```
error: getContents() in LabeledBox cannot override getContents() in Container
  return type int is not compatible with Object
```

confirming the boundary precisely: narrower is fine, unrelated is not.
This is called a **covariant return type**. The direct, observable
payoff of the legal version: `fromLabeled` is usable as a real `String` —
able to call `String`-only methods on it directly — with zero cast
written anywhere, purely because `LabeledBox`'s own override already
committed to the narrower type.

### Discard the Throwaway Example

`Container`, `LabeledBox`, and `CovariantDemo` are deleted now — the
concept carries forward; this exact code does not. `EditText.getText()`,
met properly once this project next wires a button's click listener, is
the same override-narrowing-a-return-type mechanism, applied to
`TextView`'s real `getText()` instead of a disposable `Container`.

### CS Lens

A covariant return type is a controlled relaxation of Lesson 06's
overriding rule: normally an override must match its parent's signature
exactly; covariant returns are the one deliberate exception, allowed
specifically because a caller expecting the parent's return type can
always safely treat the narrower subtype as if it were that parent type
too (a `String` can always be used wherever an `Object` is expected) —
the relaxation never breaks a caller who only knew about the wider
parent type.

Also recognized in: C++ and C#'s own covariant return type support (same
rule, same name), and, more generally, the **Liskov Substitution
Principle** — a subclass should always be usable anywhere its parent
class is expected — which covariant returns exist specifically to
preserve rather than violate.

### SE Lens

**Why does Java allow this at all, instead of requiring every override
to repeat the parent's exact return type?** Forcing an exact match would
mean a subclass that legitimately always produces a more specific,
more useful type would still have to declare the vaguer parent type and
force every caller to cast it back down manually — exactly the
unnecessary-cast cost Lesson 12 already named for a non-generic method.
Covariant returns let a subclass be more specific and more useful to its
own callers, without breaking any existing code written against the
parent's wider type.

---

## Connect the Pieces

One trace: `Container.getContents()` promised only the general `Object`.
`LabeledBox`'s override promised the narrower `String` instead — legal,
because `String` is genuinely a kind of `Object`, and directly useful,
because `fromLabeled` needed no cast to be used as a real `String`. The
very next lesson meets `EditText.getText()` doing exactly this against
`TextView`'s wider `CharSequence`.

## What Breaks Without This

Already shown above: changing `LabeledBox.getContents()`'s return type
to `int` (unrelated to `Object`) produces a real compiler error naming
the incompatibility directly. Restore `String` before moving on.

## Exercises

1. Add a third class, `NumberBox extends Container`, overriding
   `getContents()` to return `Integer` instead. Confirm this also
   compiles — a second, independent proof that any subtype of `Object`
   is a legal covariant narrowing, not something special about `String`
   specifically.
2. Try overriding `getContents()` in `LabeledBox` to return
   `CharSequence` instead of `String` (`String` itself already
   implements `CharSequence`). Confirm this also compiles, and reason
   about why: `CharSequence` is narrower than `Object` but wider than
   `String` — still a legal narrowing step, just a smaller one.

## Definition of Done

- [ ] You ran the lab and saw a narrower return type work correctly with
      no cast.
- [ ] You triggered the real compile error from an unrelated return type
      and can state the exact rule it's enforcing.
- [ ] You can define "covariant return type" in your own words.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: wiring the login buttons for real — `View.OnClickListener`, and
`EditText.getText()`'s own real covariant override of `TextView`.
