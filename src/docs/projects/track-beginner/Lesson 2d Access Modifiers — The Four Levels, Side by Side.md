# Lesson 2d: Access Modifiers — The Four Levels, Side by Side

**What you will build:** A throwaway lab with four classes across two
packages, proving exactly who can see what. The transferable problem:
`onCreate` in Lesson 2c was `protected`, and you saw *that* it mattered
(the OS could call it), but not *why* `protected` specifically, versus
Java's other three access levels. Seeing just one level in isolation
doesn't show what makes it different from the other three. This lesson
puts all four side by side, in one small real experiment, rather than
meeting each one separately, once, scattered across many future
lessons.

**What you need to know first:** Lesson 2a (fields, `new`, objects —
`Vault` below is a class with fields, same shape as `LightSwitch`).
Lesson 1 (packages — this lab specifically needs two different
packages to show the difference between "same package" and "a
subclass in a different package"). Lesson 2c (`extends`, and that
`protected` matters — this lesson explains exactly how much).

---

## Concept Unit: Access Modifiers — The Four Levels, Side by Side

### The Problem

Four Java keywords control who can see a field or method:
`public`, `protected`, no keyword at all (called **package-private**),
and `private`. You've now seen `public` (Lesson 1's classes) and
`protected` (Lesson 2c's `onCreate`) individually, but not what
distinguishes all four from each other in one place.

### Introduce the Concept in Isolation

This lab needs two real Java packages (Lesson 1's package/folder rule —
each package name must match a real folder), so it needs real folders,
not just files. From a terminal, create this structure:

```
mkdir -p accessdemo/vaultpkg accessdemo/otherpkg
```

That's one folder, `accessdemo`, containing two subfolders,
`vaultpkg` and `otherpkg` — matching the two `package` declarations
you're about to write. Everything in this lab happens inside
`accessdemo`; `cd` into it before running any `javac`/`java` command
below.

Inside `vaultpkg/`, create a file named exactly `Vault.java` — four
fields, one field per access level:

```java
package vaultpkg;

public class Vault {
    public int publicField = 1;
    protected int protectedField = 2;
    int packagePrivateField = 3;   // no modifier at all
    private int privateField = 4;
}
```

`Vault` has no `main` — nothing here ever runs `java vaultpkg.Vault`
directly; it's only ever built and read by the other three files below
(Lesson 2a's "only the class you actually run needs `main`" rule).

Also inside `vaultpkg/`, create a second file, `SamePackageAccess.java`
— same package as `Vault`, an unrelated class:

```java
package vaultpkg;

public class SamePackageAccess {
    public static void main(String[] args) {
        Vault v = new Vault();
        System.out.println("Same-package class sees: " + v.publicField
            + ", " + v.protectedField + ", " + v.packagePrivateField);
    }
}
```

Inside `otherpkg/`, create `Sub.java` — a different package, but a
**subclass** of `Vault`:

```java
package otherpkg;
import vaultpkg.Vault;

public class Sub extends Vault {
    public static void main(String[] args) {
        Sub s = new Sub();
        System.out.println("Subclass in another package sees: "
            + s.publicField + ", " + s.protectedField);
    }
}
```

Also inside `otherpkg/`, create `Unrelated.java` — a different
package, no inheritance at all:

```java
package otherpkg;
import vaultpkg.Vault;

public class Unrelated {
    public static void main(String[] args) {
        Vault v = new Vault();
        System.out.println("Unrelated class in another package sees: "
            + v.publicField);
    }
}
```

`import vaultpkg.Vault;` — **first appearance of `import`.** Every
class you've written until now lived in the same package as whatever
used it, so nothing needed importing. `Sub` and `Unrelated` live in
`otherpkg` but need to reference `Vault`, which lives in `vaultpkg` — a
different package. `import vaultpkg.Vault;` tells the compiler "when I
write `Vault` in this file, I mean the one at that package path,"
exactly the same package-path addressing from Lesson 1, now being
looked *up* instead of declared.

`Vault v = new Vault();` here is exactly Lesson 2a's object-creation
pattern — four `int` fields set directly at declaration instead of
through a constructor, which is legal shorthand for "set this field's
starting value the moment any object is built," equivalent to writing
it inside a constructor that runs before anything else touches the
object.

Your `accessdemo` folder should now contain exactly four files across
two subfolders: `vaultpkg/Vault.java`, `vaultpkg/SamePackageAccess.java`,
`otherpkg/Sub.java`, `otherpkg/Unrelated.java`. From inside `accessdemo`,
compile and run all four yourself:

```
javac vaultpkg/Vault.java vaultpkg/SamePackageAccess.java otherpkg/Sub.java otherpkg/Unrelated.java
java vaultpkg.SamePackageAccess
java otherpkg.Sub
java otherpkg.Unrelated
```

Real output — verified this session:

```
Same-package class sees: 1, 2, 3
Subclass in another package sees: 1, 2
Unrelated class in another package sees: 1
```

What this proves, reading the three lines together: `publicField`
(`1`) is visible in all three. `protectedField` (`2`) is visible to
`SamePackageAccess` (same package) *and* `Sub` (a subclass, even in a
different package) but not to `Unrelated`. `packagePrivateField` (`3`,
no modifier) is visible only to `SamePackageAccess` — same package,
inheritance doesn't matter. `privateField` (`4`) appears nowhere except
`Vault` itself — not printed by any of the three.

Now see the compiler actually enforce each boundary. Create three more
small files, one at a time, and try to compile each — leave the four
files from above exactly as they are.

Inside `vaultpkg/`, create `PrivateTest.java` — trying to read
`privateField` from outside `Vault`:

```java
package vaultpkg;

public class PrivateTest {
    public static void main(String[] args) {
        System.out.println(new Vault().privateField);
    }
}
```

```
javac vaultpkg/PrivateTest.java
```

Real compiler output, this session:

```
vaultpkg/PrivateTest.java:5: error: privateField has private access in Vault
        System.out.println(new Vault().privateField);
                                      ^
1 error
```

Delete `PrivateTest.java` (or just leave it broken — it won't affect
the other files), then inside `otherpkg/`, create
`PackagePrivateTest.java` — a subclass of `Vault` in a different
package, trying to read `packagePrivateField`:

```java
package otherpkg;
import vaultpkg.Vault;

public class PackagePrivateTest extends Vault {
    public static void main(String[] args) {
        System.out.println(new PackagePrivateTest().packagePrivateField);
    }
}
```

```
javac otherpkg/PackagePrivateTest.java
```

Real compiler output, this session:

```
otherpkg/PackagePrivateTest.java:6: error: packagePrivateField is not public in Vault; cannot be accessed from outside package
        System.out.println(new PackagePrivateTest().packagePrivateField);
                                                   ^
1 error
```

Finally, also inside `otherpkg/`, create `ProtectedTest.java` — no
inheritance this time, trying to read `protectedField`:

```java
package otherpkg;
import vaultpkg.Vault;

public class ProtectedTest {
    public static void main(String[] args) {
        System.out.println(new Vault().protectedField);
    }
}
```

```
javac otherpkg/ProtectedTest.java
```

Real compiler output, this session:

```
otherpkg/ProtectedTest.java:5: error: protectedField has protected access in Vault
        System.out.println(new Vault().protectedField);
                                      ^
1 error
```

All three — verified this session — fail to *compile*, not just at
runtime; the compiler is checking these rules for every single field
access, everywhere, all the time.

### Discard the Throwaway Example

Delete the whole `accessdemo` folder (`vaultpkg/` and `otherpkg/`
together) — the real project's own access
levels (private fields with getters starting Lesson 7, package-private
fields starting Lesson 6) are the ones that matter from here on, now
with a real reference point for what each level actually guarantees.

### Mechanical Walkthrough

- `public` — visible everywhere, no restriction at all.
- `protected` — visible within the same package, *and* to subclasses
  anywhere, even in a different package — this second half is
  specifically why Lesson 2c's OS-to-`onCreate` call works even though
  your app's code and Android's own platform code aren't in the same
  package: `AppCompatActivity`'s ancestor classes call `onCreate` on
  `this` (Lesson 2a's `this` — the object the call happens through),
  and that object — your actual `MainActivity` subclass instance — is
  exactly the "subclass, anywhere" case `protected` allows.
- *(no modifier at all)* — **package-private** (sometimes called
  default access): visible only within the same package, regardless of
  inheritance. This is the level a data holder class's field will use
  starting in a later lesson, on purpose.
- `private` — visible only inside the exact class it's declared in,
  full stop — not even a subclass gets access.

### CS Lens

This is Java's version of a much more general idea: **encapsulation
boundaries with more than one visibility scale**, not just a binary
"hidden" vs. "exposed." Also recognized in: C++'s identical four-way
split (`public`/`protected`/(package doesn't exist there,
namespace-based instead)/`private`), Python's naming-convention-only
approach (`_single_underscore`, `__double_underscore` — unenforced by
the language itself, unlike Java, where these are compiler-checked
rules, not just a hint to other programmers), and JavaScript's more
recent `#privateField` syntax, which is enforced at runtime but has no
equivalent to Java's middle two levels (`protected` and
package-private) at all.

### SE Lens

**Why four levels, instead of just `public` and `private` — wouldn't
two be simpler?** Two levels force a false choice: either a field is
open to literally everyone, forever, or it's closed to everyone,
including code that has a genuine, structural reason to touch it — a
subclass extending the behavior, or a sibling class in the same package
that's really part of the same unit of work. `protected` and
package-private exist specifically for that middle ground: controlled
collaboration between code that's meant to cooperate, without opening
the field to every other class in the entire project. This is the
same engineering idea as least-privilege access control in any system
— grant exactly the access a legitimate caller needs, and no more,
because every level of access granted is also a level of access that
can be misused or accidentally depended on later. `Vault`'s own four
fields make the cost of getting this wrong concrete: mark something
`public` that should have stayed `private`, and every class in the
project can now read or corrupt it directly, with no way to add a
check later without finding and fixing every place that touched it
directly.

### Connection

Every field and method declared from here on, in every remaining
lesson, uses one of these four levels — you now have a real, verified
reference point for what each one actually guarantees, rather than
learning them one at a time, scattered across many lessons.

---

## Connect the Pieces

One trace through this lesson: `Vault`'s four fields, one access level
each, sat in `vaultpkg`. Three other classes — one in the same
package, one a subclass in a different package, one wholly unrelated
in a different package — each tried to read every field, and the
compiler allowed or blocked each attempt based on nothing but the
combination of (a) which package the reading code is in and (b)
whether it's a subclass. That combination is the entire rule set
behind all four modifiers; everything else in this lesson was just
demonstrating it concretely.

## What Breaks Without This

In `SamePackageAccess`, try to read `Vault`'s `privateField` directly
(`v.privateField`). Run `javac` and read the real error — it will name
the exact field and the exact rule violated. This is the same category
of error you already triggered above; the point of repeating it here
is to see that *same-package* access doesn't override `private` the
way it overrides package-private — `private` really does mean "this
exact class only," with no exceptions for anything.

## Exercises

1. Add a fifth field to `Vault`: a `protected` field, then write a
   *fifth* class — same package as `Vault`, no inheritance — and
   confirm it can see the new `protected` field (because same-package
   access always works for `protected`, independent of the subclass
   rule).
2. Predict, before running anything, whether a subclass of `Vault` *in
   the same package* as `Vault` (not `otherpkg`) could see
   `packagePrivateField`. Write it and check yourself.

## Definition of Done

- [ ] You ran the `Vault`/`Sub`/`Unrelated` lab yourself and your
      output matched what's shown here.
- [ ] You triggered all three compiler errors yourself, not just read
      them.
- [ ] You can state, for each of the four levels, exactly who can and
      can't see a field with that modifier.
- [ ] No git commit for this lesson — nothing here becomes part of
      Pocket Inventory; everything was deleted per the instructions
      above.

Next lesson: the generated `R` class — where `R.layout.activity_main`
from Lesson 2c actually comes from.
