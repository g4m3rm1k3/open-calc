# Lesson 51: Build Dependency Management and Template/Instance Separation

**What you will build:** The first unit reads a real Android/Gradle
mechanism directly. The second is a small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 11's XML and resources.

**Terms introduced in this lesson:**

- **Build dependency management** — declaring an external library your
  project needs in a build configuration file, which a build tool then
  downloads and makes available to your code.
- **Template/instance separation** — one small structural description
  gets instantiated many times against different data, rather than each
  occurrence being separately authored.

---

## Concept Unit: Build Dependency Management

### The Problem

`RecyclerView` (a later lesson's own subject) is not one of the classes
built into the Android SDK the way `Activity` or `TextView` are — its
code lives in a separate library, published outside the project entirely.
Simply writing `import androidx.recyclerview.widget.RecyclerView;` in
source code does nothing on its own if that library's code was never
brought into the project in the first place.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android/Gradle mechanism,
verified against the actual tooling:

```
// app/build.gradle
dependencies {
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
}
```

This is `build dependency management` — **first appearance**: declaring
an external library your project needs in a build configuration file,
which a build tool then downloads and makes available to your code. This
one line, inside the project's own `build.gradle` file, tells Gradle
(Android's build tool) to fetch the real `recyclerview` library, at
version `1.3.2`, from its publisher, and make its classes — including
`RecyclerView` itself — available to import and compile against. Without
this declaration present and synced, `import
androidx.recyclerview.widget.RecyclerView;` fails to resolve at all — the
class genuinely does not exist anywhere in the project yet.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android/Gradle configuration.

### Mechanical Walkthrough

1. `dependencies { ... }` — **(a) first appearance**: a block inside
   `build.gradle` (Lesson 16's own build-configuration file) listing every
   external library the project needs.
2. `implementation 'androidx.recyclerview:recyclerview:1.3.2'` — **(a)
   first appearance**: names the library's group (`androidx.recyclerview`),
   artifact (`recyclerview`), and exact version (`1.3.2`) to fetch;
   `implementation` (as opposed to other visibility keywords Gradle
   supports) makes the library available to this module's own code.
3. After this line is added and the project is synced, `RecyclerView`'s
   real class becomes importable — the class was never missing from the
   SDK by mistake; it was never present until explicitly declared.

### CS Lens

Build dependency management is the general "package manager" idea —
declare what you need, by name and version, and a tool resolves and
fetches it — recurring across virtually every modern language's own
tooling (npm for JavaScript, pip for Python, Cargo for Rust). Gradle's
`dependencies` block is Android's specific instance of this same general
shape.

Also recognized in: `package.json`'s own `dependencies` block, Python's
`requirements.txt`, any build or package tool separating "what my code
needs" from "the code I wrote myself."

### SE Lens

The alternative — manually downloading a library's `.jar` file and
copying it into the project by hand — was not chosen as Android's own
default because it leaves version tracking, transitive dependencies (a
library's own dependencies), and updates entirely manual and error-prone;
declaring a dependency by name and version lets Gradle resolve all of that
automatically, and lets the exact same declaration be read and understood
by anyone else opening the project.

---

## Concept Unit: Template/Instance Separation

### The Problem

A screen showing a list of a hundred inventory items should not require a
hundred separately hand-authored layout files, one per row — every row
needs the identical visual structure (an icon, a name, a quantity),
differing only in which specific data fills it.

### Introduce the Concept in Isolation

```
mkdir lesson-51
cd lesson-51
```

Create `Main.java`:

```java
public class Main {
    static String renderRow(String template, String name, int quantity) {
        return template.replace("{name}", name).replace("{quantity}", String.valueOf(quantity));
    }

    public static void main(String[] args) {
        String rowTemplate = "Item: {name}, Qty: {quantity}";
        System.out.println(renderRow(rowTemplate, "Wrench", 12));
        System.out.println(renderRow(rowTemplate, "Bolt", 340));
        System.out.println(renderRow(rowTemplate, "Hammer", 5));
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
Item: Wrench, Qty: 12
Item: Bolt, Qty: 340
Item: Hammer, Qty: 5
```

One `rowTemplate` string was written exactly once, then rendered three
separate times against three separate sets of data. This is `template
/instance separation` — **first appearance**: one small structural
description gets instantiated many times against different data, rather
than each occurrence being separately authored. `rowTemplate` is the
template — authored once; each call to `renderRow` produces one instance
of it, filled with that call's own specific data.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `String rowTemplate = "Item: {name}, Qty: {quantity}";` — **(a) first
   appearance**: the template itself, written exactly once, containing
   placeholders rather than real data.
2. `renderRow(rowTemplate, "Wrench", 12)` — the template is instantiated
   against this call's own specific data, producing one real, filled-in
   row string.
3. Two further calls to `renderRow`, same template, different data —
   proof the same template produces a different, independent instance
   each time, without being rewritten.

### CS Lens

Template/instance separation is the same underlying shape as a class
(Lesson 01's own subject) versus an object built from it — one authored
structure, instantiated repeatedly against different data — applied here
to a layout description rather than to executable code. Recognizing "this
is one template, rendered many times" is the transferable skill,
regardless of whether the template is a class, a row layout, or a string
format.

Also recognized in: HTML templating engines rendering the same markup
structure against many different data records, database query templates
(a single parameterized query executed against different parameter
values), any UI framework's own list/row rendering mechanism.

### SE Lens

The alternative — hand-authoring a separate, fully-written row for every
single inventory item — was not chosen because it doesn't scale: a
hundred items would require a hundred hand-written, nearly-identical
layout files, and a single visual change (say, making the quantity text
bold) would require editing all hundred instead of the one shared
template.

---

## Connect the Pieces

`build dependency management` is what makes `RecyclerView`'s own real
classes available to import in the first place — declared once, in
`build.gradle`, before any of its code can be written. `renderRow`
demonstrated the general shape `RecyclerView` itself relies on once
available: one small row template, authored once, instantiated repeatedly
against each inventory item's own data — never one hand-authored layout
file per row.

## What Breaks Without This

Writing `import androidx.recyclerview.widget.RecyclerView;` without first
declaring the dependency in `build.gradle` produces a real, immediate
compile error — the class genuinely doesn't exist in the project yet, no
matter how correctly the rest of the code is written; and authoring a
separate hand-written row layout per inventory item, instead of one
template instantiated repeatedly, means every visual change must be
manually repeated across every single row file, with nothing keeping them
in sync.

## Exercises

1. Explain, in your own words, why adding
   `import androidx.recyclerview.widget.RecyclerView;` alone, with no
   change to `build.gradle`, fails to compile.
2. Add a fourth call to `renderRow` in `main`, rendering a new item, and
   confirm the same template produces a correct, independent result.
3. Explain, in your own words, why one shared row template scales to a
   hundred inventory items better than a hundred hand-authored row
   layouts.

## Definition of Done

- [ ] You read the real `build.gradle` dependency declaration and can
      explain why `RecyclerView` is unavailable without it.
- [ ] You ran the `renderRow` example and saw the same template correctly
      produce three different, independent results.
- [ ] You can state, without looking back at this lesson, why a shared
      template scales better than one hand-authored instance per row.
