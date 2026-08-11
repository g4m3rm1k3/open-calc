# Lesson 21: Package-Private Access

**What you will build:** Nothing app-related yet — a disposable, two-
package example proving the real, exact boundary of Java's third access
level, before meeting it on a real project class that relies on it. The
transferable problem: Lesson 06 (`AppCompatActivity`) and Lesson 13
(`private`, `protected`) already proved two access levels with real
compiler errors; this project's next real class deliberately uses
neither of those and instead uses no modifier at all — a genuinely
different, third option, not a lesser version of one already covered.

**What you need to know first:** Lesson 13 (`private`, `protected`,
proven with real compiler errors).

**Terms introduced in this lesson:**
- **Package-private access** — the access level a class or member gets
  by declaring no access modifier at all: visible to any other code in
  the same package, invisible to code in a different package, regardless
  of any inheritance relationship.

**Objects and methods used:** Package-private access is this lesson's
own subject, given full treatment above.

**Everything else in the file, not this lesson's subject but still
explained:**
- **`System.out.println(...)`**
  - *What it is:* Java's `static` print-to-standard-output method.
  - *Implementation:* given full treatment in Lesson 01.
  - *Its use:* prints `Widget.describe()`'s result from `SameyPackageUser`,
    proving same-package access works before the cross-package rejection
    is shown.

---

## Concept Unit: No Modifier at All Is Still a Real, Specific Choice

### The Problem

Lesson 13 proved `private` (visible only inside the declaring class) and
`protected` (visible to subclasses anywhere, plus same-package code)
with real compiler errors. Declaring a class or member with **no**
modifier at all is not "forgetting" to choose one — it's choosing a
third, real, specific access level, narrower than `public`, but
distinct from both `private` and `protected` in its own way.

### Introduce the Concept in Isolation

Two packages, proving the exact boundary rather than describing it:

```java
// pkgdemo/inside/Widget.java
package inside;

class Widget {
    String describe() {
        return "a widget";
    }
}
```

```java
// pkgdemo/inside/SameyPackageUser.java
package inside;

public class SameyPackageUser {
    public static void main(String[] args) {
        Widget w = new Widget();
        System.out.println(w.describe());
    }
}
```

```
javac inside/Widget.java inside/SameyPackageUser.java
java inside.SameyPackageUser
```

Real output:

```
a widget
```

Now add a third file in a **different** package, attempting the same
thing:

```java
// pkgdemo/outside/OutsidePackageUser.java
package outside;

import inside.Widget;

public class OutsidePackageUser {
    public static void main(String[] args) {
        Widget w = new Widget();
        System.out.println(w.describe());
    }
}
```

```
javac inside/Widget.java outside/OutsidePackageUser.java
```

Real error:

```
outside/OutsidePackageUser.java:6: error: Widget is not public in inside; cannot be accessed from outside package
import inside.Widget;
             ^
```

### Mechanical Walkthrough

`class Widget` — no modifier at all — is **package-private**:
`SameyPackageUser`, in the *same* package (`inside`), could construct and
call it freely, with zero modifiers involved anywhere. `OutsidePackageUser`,
in a different package (`outside`), was rejected by the compiler at the
very `import` line, before even reaching the constructor call. Notice
this boundary depends **only** on package location — unlike `protected`
(Lesson 13), there's no inheritance-based exception here at all;
`OutsidePackageUser` would be rejected identically whether or not it
extended anything related to `Widget`.

### Discard the Throwaway Example

`pkgdemo`, `Widget`, `SameyPackageUser`, and `OutsidePackageUser` are
deleted now. This project's very next lesson declares a real class the
same way — no modifier — relying on exactly this boundary.

### CS Lens

Package-private access completes the full picture of Java's access
control spectrum, from narrowest to widest: `private` (declaring class
only) → package-private (same package only) → `protected` (same package,
plus subclasses anywhere) → `public` (anywhere). Each step widens
visibility along a genuinely different axis — package-private widens by
*location*; `protected` widens further by adding an *inheritance*
exception on top of that same location-based rule.

Also recognized in: most access-control systems distinguishing "local
group" visibility from "anyone with an inheritance relationship" —
package-private has no exact equivalent in Python or JavaScript (neither
has a package/module-based *enforced* privacy boundary the compiler
checks the way Java's does), which is part of why it's easy for a
newcomer from those languages to skip past it as "just no keyword"
rather than a real, distinct rule.

### SE Lens

**Why would a class ever want package-private access instead of just
being `public`?** A class meant only to support other classes in the
same package — an implementation detail of that package, not part of
what the package exposes to the rest of the app — gains a real, compiler-
enforced guarantee by staying package-private: nothing outside the
package can ever come to depend on it directly, which means it can be
freely changed or removed later without breaking any code outside its
own package. This is the same **minimize the public surface** principle
already met when deciding which methods a class exposes, applied here to
whether a whole class is exposed at all.

---

## Connect the Pieces

One trace: `Widget`, declared with no modifier, was fully usable from
`SameyPackageUser` in the same package, and completely unreachable from
`OutsidePackageUser` in a different one — rejected at the `import` line
itself. The very next lesson's real project class relies on this exact
boundary, deliberately, rather than defaulting to `public` out of habit.

## What Breaks Without This

This lesson's second compile *is* the "what breaks" case: attempting to
`import` a package-private class from outside its package fails
immediately, before any object is ever constructed — already shown and
explained above.

## Exercises

1. Move `OutsidePackageUser` into the `inside` package (same package as
   `Widget`) and confirm it now compiles and runs successfully with no
   changes to `Widget` at all — direct proof the boundary is about
   package location alone.
2. Add a class in `outside` that `extends` nothing related to `Widget`
   at all, versus one that does, and confirm both are rejected
   identically when attempting to reach a package-private class from a
   different package — proving package-private grants no
   inheritance-based exception the way `protected` does.

## Definition of Done

- [ ] You ran both compiles and saw the real success and the real
      rejection.
- [ ] You can state, precisely, how package-private differs from both
      `private` and `protected`.
- [ ] You can explain why a class might deliberately choose
      package-private over `public`.
- [ ] Commit: not applicable — the example is a throwaway lab.

Next: a real project class, deliberately declared with no access
modifier at all, relying on exactly this boundary.
