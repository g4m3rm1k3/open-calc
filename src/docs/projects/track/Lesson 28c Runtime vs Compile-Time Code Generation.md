# Lesson 28c: Runtime vs. Compile-Time Code Generation

**What you will build:** No new code to compile — this contrasts two
real Android mechanisms directly.

**What you need to know first:** Lesson 28b's Retrofit, Lesson 4g's
Class Object Reflection.

**Terms introduced in this lesson:**

- **Runtime vs. Compile-Time Code Generation** — code generation can
  happen at compile/build time (producing an inspectable generated file)
  or at runtime via reflection (producing a working implementation live,
  with no separate generated source to inspect) — genuinely different
  mechanisms with different tradeoffs.

---

## Concept Unit: Runtime vs. Compile-Time Code Generation

### The Problem

This course has already seen more than one example of "a working
implementation appears with no hand-written class implementing an
interface" — Lesson 28b's Retrofit, and Room's own generated DAOs
(Lesson 13g). These are not all the same mechanism, even though they can
look similar from the outside; recognizing which is which matters for
understanding what's actually inspectable and when the generation
actually happens.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real contrast between two Android
mechanisms, verified against their actual implementations:

```java
// Compile-time: Room generates a real, inspectable Java file
// (RoomDatabase_Impl.java, or similar) during the build, before the
// app ever runs. That file genuinely exists on disk after compiling.

// Runtime: Retrofit generates a working implementation live, when
// the app actually executes this line — no separate source file for
// it exists anywhere, before or after.
CatalogApi api = retrofit.create(CatalogApi.class);
```

This is `Runtime vs. Compile-Time Code Generation` — **first
appearance**: code generation can happen at compile/build time (producing
an inspectable generated file) or at runtime via reflection (producing a
working implementation live, with no separate generated source to
inspect) — genuinely different mechanisms with different tradeoffs.
Room's annotation processor runs during the build, producing a real,
readable generated `.java` file a developer could open and read.
Retrofit's `.create(...)` (Lesson 28b) runs when the app itself
executes, using reflection (Lesson 4g's own `Class` object) to build a
working implementation on the spot, with no generated source file ever
produced at all.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this contrasts two real
Android mechanisms.

### Mechanical Walkthrough

1. Room's own compile-time generation — **(a) first appearance**
   examined explicitly: happens once, during the build, producing a real
   file that exists on disk, inspectable independent of ever running the
   app.
2. `retrofit.create(CatalogApi.class)` — **(b) reappearing** from Lesson
   28b, now examined specifically as runtime generation: `CatalogApi
   .class` (Lesson 4g's own `Class` object) is used via reflection to
   build a working object live, the moment this line actually executes —
   nothing is generated ahead of time, and nothing is left behind to
   inspect afterward.

### CS Lens

The tradeoff is real and consequential: compile-time generation catches
certain classes of error earlier (a malformed annotation fails the build
itself, before the app ever runs) and produces genuinely inspectable
output; runtime generation via reflection is more flexible (no separate
build step required) but defers any errors to the moment the code
actually runs, and produces nothing a developer can directly read
beforehand.

Also recognized in: compile-time code generation across many languages
(Rust macros, C# source generators) versus runtime reflection-based
proxies (dynamic proxies in Java's own standard library, runtime-
generated mocks in many testing frameworks) — the same fundamental
tradeoff recurring wherever code generation exists at all.

### SE Lens

Recognizing which mechanism a given tool actually uses matters
practically: a compile-time-generated file can be opened and read
directly to understand exactly what's happening; a runtime-generated
implementation cannot be inspected the same way — understanding its
actual behavior requires reading the *generating* library's own
documentation or source, since no generated artifact exists to read
directly.

---

## Connect the Pieces

Room's own generated database implementation (Lesson 13g) is produced
once, during the build — a real file exists afterward. Retrofit's
`.create(CatalogApi.class)` (Lesson 28b) produces a working
implementation live, using reflection, the moment the app actually runs
that line — no file is ever produced. Both look similar from the outside
("a working implementation with no hand-written class") but are
genuinely different mechanisms, with different tradeoffs around when
errors surface and what's actually inspectable.

## What Breaks Without This

Assuming Retrofit's generated implementation can be opened and read the
same way Room's compile-time-generated file can leads to a real, wasted
search: no such file exists anywhere in the compiled output for a
runtime-reflection-based mechanism, because nothing was ever generated
ahead of time to begin with — understanding what `retrofit.create(...)`
actually produces requires reading Retrofit's own documentation, not
searching for a generated source file that was never created.

## Exercises

1. Identify, from Lesson 19d's own Safe Args material (a build-time
   plugin), which category — compile-time or runtime — it belongs to,
   and explain your reasoning.
2. Explain, in your own words, why a compile-time-generated
   implementation can catch certain mistakes earlier than a
   runtime-generated one.
3. Explain, in your own words, why searching for "the generated
   `CatalogApi` implementation file" in a real Android project's build
   output would be a wasted effort.

## Definition of Done

- [ ] You read the real Room-versus-Retrofit contrast and can explain
      the difference between the two mechanisms.
- [ ] You completed Exercise 1 and correctly categorized Safe Args.
- [ ] You can state, without looking back at this lesson, why a
      runtime-generated implementation has no file to inspect, while a
      compile-time-generated one does.
