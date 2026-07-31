# Lesson 4h: `Context`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 4f's `Intent`, Lesson 0l's
inheritance.

**Terms introduced in this lesson:**

- **`Context`** — an Android object representing the
  environment/identity a request originates from — an Activity is one
  kind of Context, used any time a component needs to say who it is.

---

## Concept Unit: `Context`

### The Problem

Many Android APIs need to know *which* app, and often which specific
component, a request originates from — building an `Intent` (Lesson
4f), reading a resource (Lesson 2j), and many other framework calls all
require identifying the calling environment somehow.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Intent intent = new Intent(this, SettingsActivity.class);
```

`this`, in this call, is a `Context` — **first appearance**: an
Android object representing the environment/identity a request
originates from — an Activity is one kind of Context, used any time a
component needs to say who it is. Every Activity *is* a `Context`
(through inheritance, Lesson 0l) — which is why `this`, inside an
Activity, can be passed anywhere a `Context` is required, identifying
this specific Activity, and the app it belongs to, as the origin of the
request.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent(this, SettingsActivity.class)` — **(b) reappearing**
   `Intent` construction from Lesson 4f, `this` now examined explicitly
   as a `Context` rather than glossed over.

### CS Lens

`Context` is Android's own answer to "which environment is this
request coming from" — every component that needs to identify itself
to the framework, or reach a framework service, does so through a
`Context`, the same underlying identity concept regardless of which
specific API is being called.

Also recognized in: any framework's own "current environment" or
"current request" object passed implicitly or explicitly through a
call chain (a web framework's request context, a dependency-injection
container's own scope object).

### SE Lens

This unit deliberately stops at recognition — `Context`'s full type
hierarchy and different flavors (Activity Context versus Application
Context) are a later lesson's own subject; the goal here is only naming
what `this` has represented, unexplained, since it first appeared
passed to `Intent`'s constructor.

---

## Connect the Pieces

Lesson 4f's `Intent` constructor took `this` as its first argument,
unexplained. This lesson named it: a `Context`, the environment a
request originates from. The next lesson (Capability Scoping) shows
another way a component's own reachability is explicitly declared,
rather than left open by default.

## What Breaks Without This

Passing an object that is not a `Context` (a plain, unrelated class,
say) where a `Context` is required fails to compile — the type system
itself enforces that only a real `Context` (or something extending it,
like an Activity) can be passed there.

## Exercises

1. Explain, in your own words, why every Activity can be passed
   anywhere a `Context` is required.
2. Explain, in your own words, why `Context` matters even for an API
   that has nothing to do with launching a new screen.
3. Name, from memory, the one other place in this course `this` has
   already been passed as an implicit `Context`.

## Definition of Done

- [ ] You read the real `Context` example and can explain what `this`
      represents inside an Activity.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why an
      Activity can be passed anywhere a `Context` is expected.
