# Lesson 1a: Namespace / Addressing Scheme

**What you will build:** A disposable lab. Today's case study: a fact
`track/Lesson 1` presents unexplained on day one — a project's package
structure.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Namespace** — giving every unit in a large system a globally
  unique, hierarchical name, so two unrelated pieces of code can each
  define something with the same short name without colliding.

---

## Concept Unit: Namespace

### The Problem

Two entirely unrelated projects might both reasonably want to name a
class `Item` — a store's inventory item, a game's collectible item.
Without some way to keep those two `Item` classes from colliding when
both projects' code somehow ends up in the same running program (a
library dependency, for instance), only one `Item` could ever exist at
all.

### Introduce the Concept in Isolation

```
mkdir lesson-1a
cd lesson-1a
```

Create two files. `com/storeapp/Item.java`:

```java
package com.storeapp;

public class Item {
    public String toString() {
        return "A store item";
    }
}
```

`com/gameapp/Item.java`:

```java
package com.gameapp;

public class Item {
    public String toString() {
        return "A game item";
    }
}
```

And `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        com.storeapp.Item storeItem = new com.storeapp.Item();
        com.gameapp.Item gameItem = new com.gameapp.Item();

        System.out.println(storeItem);
        System.out.println(gameItem);
    }
}
```

Compile and run it:

```
javac Main.java com/storeapp/Item.java com/gameapp/Item.java
java Main
```

Here is the real output:

```
A store item
A game item
```

`package com.storeapp;` and `package com.gameapp;` are a `namespace` —
**first appearance**: giving every unit in a large system a globally
unique, hierarchical name, so two unrelated pieces of code can each
define something with the same short name without colliding. Two
classes both named `Item` coexist in the exact same program,
distinguished entirely by their package.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `package com.storeapp;` and `package com.gameapp;` — **(a) first
   appearance** of `package`: a compiler-checked claim that the file
   belongs to this hierarchical namespace — not cosmetic, and matched
   against the file's own folder path (`com/storeapp/`,
   `com/gameapp/`) by the Java toolchain.
2. `com.storeapp.Item storeItem = new com.storeapp.Item();` — **(a)
   first appearance** of a fully-qualified type name: `com.storeapp
   .Item` names one specific `Item` class, unambiguously, even though a
   second, unrelated `Item` class exists elsewhere in the same program.

### CS Lens

A namespace is a hierarchical addressing scheme: `com.storeapp.Item`
and `com.gameapp.Item` share a short name, `Item`, but are globally
distinct because their full, qualified names differ. This is the
identical general idea DNS domain names and file-system paths both
use — a short, locally convenient name, made globally unique by a
longer hierarchical prefix.

Also recognized in: `import` paths in Python (mirroring folder
structure by convention, though not compiler-enforced the way Java's
package/folder link is), `namespace` in C# (groups code logically, but
has no compiler-enforced link to physical folder layout at all — a
real, consequential difference from Java's own model, worth naming
directly).

### SE Lens

The alternative — a single, flat namespace where every class name must
be globally unique across every library and every project ever
combined — was not chosen because it doesn't scale past a handful of
contributors; namespaces let independent teams choose short, locally
sensible names without needing to coordinate globally to avoid
collisions.

---

## Connect the Pieces

`package com.storeapp;` establishes a namespace, so class names don't
collide across unrelated code — the exact fact `track/Lesson 1` assumes
without ever pausing to explain it.

## What Breaks Without This

Remove the `package` declarations from both `Item.java` files (placing
both in the default, unnamed package) and try to compile both together.
Compile it yourself to see the real compiler error — two classes named
`Item` cannot coexist without some namespace distinguishing them.

## Exercises

1. Write a third file, `com/storeapp/Warehouse.java`, in the same
   package as this lesson's own `Item`, and confirm it can refer to
   `Item` directly, with no package qualifier needed, since both share
   the same namespace.
2. Try referring to `com.gameapp.Item` from inside a file declared
   `package com.storeapp;` with no fully-qualified name or `import`,
   and read the real compiler error.
3. Explain, in your own words, why `com.storeapp.Item` and
   `com.gameapp.Item` can coexist in one running program.

## Definition of Done

- [ ] You ran the two-package `Item` example and saw both real,
      distinguishable outputs.
- [ ] You completed Exercise 1 and confirmed same-package classes need
      no qualifier.
- [ ] You can state, without looking back at this lesson, why two
      classes with the same short name can coexist in one program.
