# Lesson 34e: Static Analysis vs. Runtime Reflection Blind Spot

**What you will build:** No new code to compile — this contrasts two
real Android build-tooling behaviors directly.

**What you need to know first:** Lesson 34d's R8, Lesson 4g's Class
Object Reflection.

**Terms introduced in this lesson:**

- **Static Analysis vs. Runtime Reflection Blind Spot** — a tool that
  analyzes code by reading its structure (a shrinker, linter, type
  checker) can only reason about calls it can actually see — a call made
  indirectly, by looking up a name as a string at runtime, is invisible
  to that analysis by construction.

---

## Concept Unit: Static Analysis vs. Runtime Reflection Blind Spot

### The Problem

R8 (Lesson 34d's own build-time shrinker) removes and renames anything it
determines is unused, by reading the project's own code and tracing every
call it can find. `Item`'s fields, though, are never called directly
anywhere in the app's own source — Retrofit (Lesson 28b) and Room
(Lesson 13i) only ever reach them through reflection, by looking up a
field's *name* as a string at runtime. R8, reading the source
structurally, has no call site to trace to those fields at all, and —
left to its default behavior — will strip or rename them anyway, breaking
Room and Retrofit the moment the app actually runs.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real contrast between two Android
build-tooling behaviors, verified against their actual documented
mechanisms:

```java
class Item {
    private String name;
    private int quantity;
}

// A direct call — R8 can see this, structurally, just by reading the code:
Item item = new Item();
item.getName();

// A reflective lookup — R8 cannot see this as a call to Item.name at all;
// "name" only exists here as a plain string, resolved at runtime:
Field field = Item.class.getDeclaredField("name");
```

This is `Static Analysis vs. Runtime Reflection Blind Spot` — **first
appearance**: a tool that analyzes code by reading its structure (a
shrinker, linter, type checker) can only reason about calls it can
actually see — a call made indirectly, by looking up a name as a string
at runtime, is invisible to that analysis by construction. R8's shrinker
reads `item.getName()` and correctly traces it as a real call it must
preserve. `Item.class.getDeclaredField("name")` (Lesson 4g's own `Class`
object, used via reflection) gives R8 nothing to trace — from R8's own
structural reading of the code, `"name"` is just a string, indistinguishable
from any other string in the program, not a reference to `Item`'s field
at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this contrasts two real
build-tooling behaviors.

### Mechanical Walkthrough

1. `item.getName();` — **(a) first appearance** examined explicitly as a
   directly-traceable call: R8 reads this line and can follow it straight
   to `Item.getName()`'s own declaration.
2. `Item.class.getDeclaredField("name")` — **(b) reappearing** use of
   Lesson 4g's own `Class` object via reflection, now examined
   specifically as the source of the blind spot: R8 sees a method call to
   `getDeclaredField`, taking a plain `String` argument — nothing in R8's
   own structural reading connects that string to `Item`'s actual `name`
   field.

### CS Lens

This is the same fundamental limit every static analysis tool runs into:
a type checker, linter, or shrinker reasons about a program's *structure*,
not its full runtime behavior — and reflection is specifically designed
to defer a lookup to runtime, by name, which is exactly the category of
behavior static structure-reading cannot see. This is not a bug in R8; it
is a fundamental property of what static analysis can and cannot observe,
true of every reflection-capable language and every static-analysis tool
built for it.

Also recognized in: any static analyzer failing to trace calls made
through `eval`, dynamic dispatch by string name, or runtime-loaded plugins
in other languages — the identical blind spot recurring wherever a
language allows deferring a lookup to a runtime string.

### SE Lens

Because R8 genuinely cannot see reflective access, the responsibility
shifts to the developer: keep-rule configuration files (Room's and
Retrofit's own libraries ship these by default) explicitly tell R8 "do
not strip or rename this class or its fields, even though you can't see
why they're needed" — the tool's blind spot is worked around by an
explicit, human-authored exception, not by R8 somehow being taught to
see the reflective call.

---

## Connect the Pieces

Lesson 28c already established that Retrofit's `.create(...)` generates a
working implementation live, via reflection, with nothing for a developer
to inspect ahead of time. This lesson names the matching cost on the
tooling side: R8's shrinker, reading the project's source structurally,
has that exact same blind spot — it cannot see a reflective lookup by
name any more than a developer can casually inspect Retrofit's generated
implementation. Both are the same underlying fact (reflection defers
resolution to runtime, invisible to anything reading the source
structurally) surfacing in two different places.

## What Breaks Without This

Shipping a Room/Retrofit-backed app with R8 shrinking enabled and no keep
rules produces a real, observed failure: R8 strips or renames `Item`'s
fields (since it finds no traceable call to them), and the app crashes or
silently returns corrupted data at runtime, the first time Room or
Retrofit tries to look up a field name that no longer exists under that
name — a failure that never shows up in the IDE or at compile time, only
after the shrunk build actually runs.

## Exercises

1. Explain, in your own words, why `item.getName()` is safe from R8's
   shrinker but `Item.class.getDeclaredField("name")` is not.
2. Explain, in your own words, why this same blind spot would apply to a
   linter checking for "unused private field" warnings, not just R8's
   shrinker specifically.
3. Explain, in your own words, why the fix is a human-authored keep rule
   rather than R8 being changed to "see" reflective calls.

## Definition of Done

- [ ] You read the real `getName()`-versus-`getDeclaredField(...)`
      contrast and can explain why only one is traceable by R8.
- [ ] You completed Exercise 2 and connected the blind spot to static
      analysis tools generally, not just R8.
- [ ] You can state, without looking back at this lesson, why a
      reflection-only field reference is invisible to a tool that only
      reads a program's structure.
