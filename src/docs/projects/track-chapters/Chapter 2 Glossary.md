# Chapter 2 Glossary

**Capstone:** Lesson 2E, "The OS Calls `onCreate` — You Never Do"
(originally `track/`'s Lesson 2, "Why Android Isn't `main()`").

Every term below was found by reading the capstone's own text and
asking what it uses without explaining. Grouped by which lesson in this
chapter actually teaches it — not alphabetical, so the grouping itself
shows the dependency order. One entry, `new`/instantiation, was found
only by reading the capstone's actual code (`Child c = new Child();`),
not from any topic list — the capstone uses it cold and never explains
it at all.

## Covered in 2A — Objects, Classes, and `new`

- **Object / instance** — an actual, individual thing built from a
  class (the blueprint), holding its own copy of the class's fields.
- **`new`** — the keyword that constructs a brand-new object in memory
  and hands back a reference to it.
- **Instance method** — a method with no `static` keyword; belongs to a
  specific object and can only be called through one.

## Covered in 2B — Annotations

- **Annotation** — `@`-prefixed metadata attached to a code
  declaration, not executable code itself; inert by default, only
  meaningful if some separate tool specifically looks for it.
- **`@Override`** — one of the small handful of annotations `javac`
  itself has real, specific logic for: checks that a method really does
  replace one from the parent class, turning a typo'd method name into
  a compile error instead of a silent bug.

## Covered in 2C — Inheritance, Overriding, and `super`

- **`extends`** — declares that a class inherits another class's fields
  and methods, plus whatever it adds or overrides itself.
- **Parent class / child class** — the class being inherited from, and
  the class doing the inheriting.
- **Overriding** — a subclass supplying its own body for a method the
  parent class already declared, replacing what runs when that method
  is called on an object of the subclass.
- **`super`** — refers to "the parent class's own version of this,"
  used to explicitly call a parent's implementation of a method you've
  overridden.
- **Dynamic dispatch** — which specific method body actually runs is
  decided by the object's real type at the moment of the call, not by
  the type of the variable holding the reference.
- **Template Method pattern** — a base class defines a fixed algorithm
  and calls out to specific points a subclass overrides to fill in.

## Covered in 2D — The Manifest

- **XML** — a text format built from nested `<tag>...</tag>` pairs
  carrying `attribute="value"` pairs, describing structured data or
  configuration rather than executable code.
- **Manifest / `<application>`** — the file (and its root
  application-wide element) that declares every component an Android
  app has, read by the OS before any of the app's own code ever runs.
- **`<activity>` declaration** — the manifest entry connecting a
  compiled `Activity` class to the running app; without it, the class
  compiles fine but the OS has no idea it's launchable.
- **Intent filter / `MAIN` / `LAUNCHER`** — the declaration of which
  Activity is a valid entry point (`MAIN`) and which one specifically
  appears on the home screen/app drawer (`LAUNCHER`).
- **Resource reference (`@mipmap/...`, `@string/...`, `@style/...`)** —
  points at a named resource defined elsewhere instead of hardcoding a
  value inline.

## Covered in 2E — The OS Calls `onCreate` (the capstone itself)

- **`protected`** — an access modifier meaning callable by the class
  itself, its subclasses, and framework code in the same package —
  what lets the OS call `onCreate` without it being fully `public`.
- **`onCreate` / the Activity lifecycle callback** — the method the OS
  calls on your Activity object at a moment it decides, not one you
  ever call yourself.
- **`Bundle` (recognition only)** — a parameter holding saved state
  from a previous run; not used for real until a later chapter.
- **`setContentView` / `R.layout` reference (first sight only)** — the
  call that puts a layout on screen; what `R.layout` actually is gets
  its own lesson in Chapter 3.
- **`Log.d` / Logcat** — Android's filterable debugging output channel,
  separate from plain console output.

## Deferred — not covered in this chapter, on purpose

- **Package-private / private access** — needs real classes with
  multiple fields to compare against; deferred to wherever this project
  first uses package-private deliberately.
- **The generated `R` class, in depth** — used here only passively
  (reading an existing entry); deferred to Chapter 3, the first time a
  new entry actually gets generated, a more concrete hook to teach it
  against.

**Lessons in this chapter, in reading order:**
1. `Chapter 2a Objects, Classes, and new.md` — written
2. `Chapter 2b Annotations.md` — written
3. `Chapter 2c Inheritance, Overriding, and super.md` — written
4. `Chapter 2d The Manifest.md` — written
5. `Chapter 2e The OS Calls onCreate.md` — written
