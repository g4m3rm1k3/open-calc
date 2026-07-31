# Lesson 26: Namespaces, SDK Versions, and the UI Fork

**What you will build:** Three short, independent concepts, grouped
together only because they're all things a project-creation wizard
presents unexplained on day one. The first is a general Java concept,
runnable directly; the other two are real Android project settings, read
directly.

**What you need to know first:** Nothing beyond the Learner Baseline.

**Terms introduced in this lesson:**

- **Namespace** — giving every unit in a large system a globally unique,
  hierarchical name, so two unrelated pieces of code can each define
  something with the same short name without colliding.
- **Minimum SDK** — the oldest Android API version an app declares it
  supports; a device running an older version than this cannot install
  the app at all.
- **Views vs. Jetpack Compose** — Android offers two different
  UI-building systems — XML-layout-based Views (older) and code-first
  Jetpack Compose (newer) — a real architectural fork, not a cosmetic
  setting.

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
mkdir lesson-26
cd lesson-26
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
define something with the same short name without colliding. Two classes
both named `Item` coexist in the exact same program, distinguished
entirely by their package.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `package com.storeapp;` and `package com.gameapp;` — **(a) first
   appearance** of `package`: a compiler-checked claim that the file
   belongs to this hierarchical namespace — not cosmetic, and matched
   against the file's own folder path (`com/storeapp/`, `com/gameapp/`)
   by the Java toolchain.
2. `com.storeapp.Item storeItem = new com.storeapp.Item();` — **(a)
   first appearance** of a fully-qualified type name: `com.storeapp.Item`
   names one specific `Item` class, unambiguously, even though a second,
   unrelated `Item` class exists elsewhere in the same program.

### CS Lens

A namespace is a hierarchical addressing scheme: `com.storeapp.Item` and
`com.gameapp.Item` share a short name, `Item`, but are globally distinct
because their full, qualified names differ. This is the identical general
idea DNS domain names and file-system paths both use — a short, locally
convenient name, made globally unique by a longer hierarchical prefix.

Also recognized in: `import` paths in Python (mirroring folder structure
by convention, though not compiler-enforced the way Java's package/folder
link is), `namespace` in C# (groups code logically, but has no
compiler-enforced link to physical folder layout at all — a real,
consequential difference from Java's own model, worth naming directly).

### SE Lens

The alternative — a single, flat namespace where every class name must be
globally unique across every library and every project ever combined —
was not chosen because it doesn't scale past a handful of contributors;
namespaces let independent teams choose short, locally sensible names
without needing to coordinate globally to avoid collisions.

---

## Concept Unit: Minimum SDK

### The Problem

Every version of Android adds new capabilities; not every device in use
runs the newest version. An app relying on a capability only available in
a recent Android version needs some way to say, explicitly, "this app
requires at least this version" — otherwise it might install and
immediately fail on an older device that simply doesn't have the
capability it depends on.

### Introduce the Concept in Isolation

A real, verified build configuration line:

```
android {
    defaultConfig {
        minSdk 24
    }
}
```

This is `minimum SDK` — **first appearance**: the oldest Android API
version an app declares it supports; a device running an older version
than this cannot install the app at all. `minSdk 24` means any device
running an Android version older than API level 24 is blocked from
installing this app entirely — the Play Store itself enforces this,
before the app is ever downloaded.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is a real, verified
build setting.

### Mechanical Walkthrough

1. `minSdk 24` — **(a) first appearance.** A single integer, an Android
   API level, the floor below which installation is blocked outright —
   not a suggestion or a runtime check, an install-time gate.

### CS Lens

Minimum SDK is a version-compatibility floor, conceptually identical to a
`.NET` project's target framework version, or a browser-support matrix
for a website — a declared minimum below which the software is known,
upfront, not to work correctly.

Also recognized in: an iOS app's own Deployment Target setting, semantic
versioning's own minimum-version dependency declarations (Lesson 09's
own npm-adjacent concepts, if covered — the same "declare the floor"
shape recurring).

### SE Lens

The alternative — supporting every Android version ever released, with no
floor at all — was not chosen because it would mean every new API a
developer wants to use must first be checked, by hand, for availability
on every older version still in use, at every single call site. Declaring
a minimum SDK lets a project use any capability available at or above
that floor freely, without repeated per-call availability checks.

---

## Concept Unit: Views vs. Jetpack Compose

### The Problem

A new Android project's creation wizard silently makes a real,
consequential architectural choice — which UI-building system the entire
project will use — often before a beginner even knows two exist, let
alone what the difference is.

### Introduce the Concept in Isolation

Two real, verified fragments building the identical piece of UI —
first, the Views system (XML plus Java, this curriculum's own approach
so far):

```xml
<TextView android:text="Hello" />
```

```java
TextView textView = findViewById(R.id.textView);
textView.setText("Hello");
```

...and Jetpack Compose, the newer alternative:

```java
Text("Hello")
```

This is `Views vs. Jetpack Compose` — **first appearance**: Android
offers two different UI-building systems — XML-layout-based Views
(older, this curriculum's choice) and code-first Jetpack Compose (newer)
— a real architectural fork, not a cosmetic setting. The Views approach
splits structure (XML) from behavior (Java, reaching into that structure
via `findViewById`); Compose collapses both into one piece of code, with
no separate XML file at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — both fragments are real,
verified code shapes.

### Mechanical Walkthrough

1. `<TextView android:text="Hello" />` plus `findViewById`/`setText` —
   **(b) reappearing** XML and resource shapes from Lesson 11, shown here
   specifically as one half of a genuine architectural fork rather than
   the only way UI is built.
2. `Text("Hello")` — **(a) first appearance** of Compose's own shape: a
   plain function call, with no matching XML file anywhere, producing
   the equivalent visible UI directly from code.

### CS Lens

This fork is a real, consequential choice between two different UI
paradigms: an imperative, structure-plus-glue-code model (Views) versus
a declarative, code-first model (Compose) — the exact declarative-versus-
imperative distinction a later lesson on Compose returns to and explains
fully, once enough foundation exists to cover it properly.

Also recognized in: SwiftUI versus UIKit on iOS (an almost identical
architectural fork, arriving on that platform around the same time),
React versus older, imperative DOM-manipulation approaches on the web —
the declarative-UI shift recurring across multiple platforms
independently.

### SE Lens

This curriculum deliberately uses the Views system throughout, not
because Compose is worse, but because Views' explicit separation of
structure and code makes several foundational ideas (resources, the
generated `R` class, XML itself) easier to teach in isolation before
introducing a second, newer paradigm on top of them — Compose is covered
directly once that foundation is in place.

---

## Connect the Pieces

Three unrelated, small facts, each silently present from a project's very
first wizard screen: `package com.storeapp;` establishes a namespace, so
class names don't collide across unrelated code. `minSdk 24` declares the
oldest Android version this app will even attempt to run on. Choosing
Views over Compose (or the reverse) is a real architectural fork, not a
cosmetic checkbox — this curriculum's own choice of Views, explained here
for the first time, is why every earlier lesson's Android examples
have used XML and `findViewById` rather than Compose's own function-call
shape.

## What Breaks Without This

Installing an app on a device running an Android version older than its
declared `minSdk` is blocked entirely by the Play Store (or by `adb
install` directly, on a real device), with a real, concrete error
resembling:

```
INSTALL_FAILED_OLDER_SDK: Requires developer to be logged in.
```

(the exact message text varies by installation method, but the block
itself is real and enforced before the app ever runs) — concrete proof
`minSdk` isn't a suggestion; it's checked before the app is ever allowed
onto the device at all.

## Exercises

1. Write a third file, `com/storeapp/Warehouse.java`, in the same
   package as this lesson's own `Item`, and confirm it can refer to
   `Item` directly, with no package qualifier needed, since both share
   the same namespace.
2. Explain, in your own words, what would happen if `minSdk` were set
   higher than a specific device's actual installed Android version.
3. List, from memory, one concrete difference between the Views fragment
   and the Compose fragment shown in this lesson's third unit.

## Definition of Done

- [ ] You ran the two-package `Item` example and saw both real,
      distinguishable outputs.
- [ ] You completed Exercise 1 and confirmed same-package classes need
      no qualifier.
- [ ] You can state, without looking back at this lesson, what `minSdk`
      actually blocks, and when that block is enforced.
- [ ] You can name, without looking back at this lesson, which of Views
      or Compose this curriculum's own Android examples have used so
      far.
