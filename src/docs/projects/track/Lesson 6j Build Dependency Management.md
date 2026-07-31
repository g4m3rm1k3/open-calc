# Lesson 6j: Build Dependency Management

**What you will build:** No new code to compile — this reads a real
Android/Gradle mechanism directly.

**What you need to know first:** Lesson 6i's `RecyclerView.LayoutManager`.

**Terms introduced in this lesson:**

- **Build dependency management** — declaring an external library your
  project needs in a build configuration file, which a build tool then
  downloads and makes available to your code.

---

## Concept Unit: Build Dependency Management

### The Problem

`RecyclerView` (Lessons 6h/6i's own subject) is not one of the classes
built into the Android SDK the way `Activity` or `TextView` are — its
code lives in a separate library, published outside the project
entirely. Simply writing `import
androidx.recyclerview.widget.RecyclerView;` in source code does
nothing on its own if that library's code was never brought into the
project in the first place.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android/Gradle mechanism,
verified against the actual tooling:

```
// app/build.gradle
dependencies {
    implementation 'androidx.recyclerview:recyclerview:1.3.2'
}
```

This is `build dependency management` — **first appearance**:
declaring an external library your project needs in a build
configuration file, which a build tool then downloads and makes
available to your code. This one line, inside the project's own
`build.gradle` file, tells Gradle (Android's build tool) to fetch the
real `recyclerview` library, at version `1.3.2`, from its publisher,
and make its classes — including `RecyclerView` itself — available to
import and compile against. Without this declaration present and
synced, `import androidx.recyclerview.widget.RecyclerView;` fails to
resolve at all — the class genuinely does not exist anywhere in the
project yet.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android/Gradle configuration.

### Mechanical Walkthrough

1. `dependencies { ... }` — **(a) first appearance**: a block inside
   `build.gradle` (the project's own build-configuration file) listing
   every external library the project needs.
2. `implementation 'androidx.recyclerview:recyclerview:1.3.2'` — **(a)
   first appearance**: names the library's group
   (`androidx.recyclerview`), artifact (`recyclerview`), and exact
   version (`1.3.2`) to fetch; `implementation` (as opposed to other
   visibility keywords Gradle supports) makes the library available to
   this module's own code.
3. After this line is added and the project is synced, `RecyclerView`'s
   real class becomes importable — the class was never missing from
   the SDK by mistake; it was never present until explicitly declared.

### CS Lens

Build dependency management is the general "package manager" idea —
declare what you need, by name and version, and a tool resolves and
fetches it — recurring across virtually every modern language's own
tooling (npm for JavaScript, pip for Python, Cargo for Rust). Gradle's
`dependencies` block is Android's specific instance of this same
general shape.

Also recognized in: `package.json`'s own `dependencies` block,
Python's `requirements.txt`, any build or package tool separating
"what my code needs" from "the code I wrote myself."

### SE Lens

The alternative — manually downloading a library's `.jar` file and
copying it into the project by hand — was not chosen as Android's own
default because it leaves version tracking, transitive dependencies (a
library's own dependencies), and updates entirely manual and
error-prone; declaring a dependency by name and version lets Gradle
resolve all of that automatically.

---

## Connect the Pieces

`build dependency management` is what makes `RecyclerView`'s own real
classes (Lessons 6h/6i) available to import in the first place —
declared once, in `build.gradle`, before any of its code can be
written. The next lesson (Template/Instance Separation) shows the
general shape `RecyclerView` itself relies on once available.

## What Breaks Without This

Writing `import androidx.recyclerview.widget.RecyclerView;` without
first declaring the dependency in `build.gradle` produces a real,
immediate compile error — the class genuinely doesn't exist in the
project yet, no matter how correctly the rest of the code is written.

## Exercises

1. Explain, in your own words, why adding `import
   androidx.recyclerview.widget.RecyclerView;` alone, with no change
   to `build.gradle`, fails to compile.
2. Explain, in your own words, why declaring a dependency by name and
   version is preferable to manually downloading and copying a
   `.jar` file.
3. Name, from memory, one other language's own package-declaration
   mechanism serving the same purpose as Gradle's `dependencies`
   block.

## Definition of Done

- [ ] You read the real `build.gradle` dependency declaration and can
      explain why `RecyclerView` is unavailable without it.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why a build
      tool resolving dependencies automatically is preferable to
      manual `.jar` management.
