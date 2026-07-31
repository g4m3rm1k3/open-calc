# Lesson 4k: The Observer Pattern

**What you will build:** No new code — this lesson names a pattern
already built and run in Lesson 2b.

**What you need to know first:** Lesson 2b's callback.

**Terms introduced in this lesson:**

- **Observer pattern** — registering a piece of code (a
  listener/callback) ahead of time with a source of events, so it gets
  called later whenever the relevant event actually occurs, rather than
  being called immediately.

---

## Concept Unit: The Observer Pattern

### The Problem

Registering a piece of code ahead of time, to be called later whenever
some event happens, has already appeared — Lesson 2b's own
`Button`/`ClickHandler` — without ever being named as one specific,
recognized design pattern.

### Introduce the Concept in Isolation

This concept doesn't need new code to isolate — it names a shape
already built and run, back in Lesson 2b:

```java
button.setOnClickListener(() -> System.out.println("Handler ran!"));
```

This is the `observer pattern` — **first appearance**: registering a
piece of code (a listener/callback) ahead of time with a source of
events, so it gets called later whenever the relevant event actually
occurs, rather than being called immediately. `button` is the
**subject** (the source of events); the lambda is the **observer**,
registered ahead of time and invoked later, exactly once per actual
click.

### Discard the Throwaway Example

No new code was introduced in this unit — it names a pattern already
demonstrated by Lesson 2b's own real, executed code.

### Mechanical Walkthrough

No new syntax appears in this unit; its content is the CS/SE framing
below, applied to code already built and run in Lesson 2b.

### CS Lens

The observer pattern is Lesson 2b's own callback concept, given its
formal, widely-recognized design-pattern name: a subject maintains a
list of registered observers (here, just one), and notifies them when
a relevant event occurs, without the subject needing to know anything
about what each observer actually does in response.

Also recognized in: this exact pattern by name across virtually every
object-oriented design-pattern catalog, `addEventListener` in
JavaScript, publish/subscribe systems generally — a genuinely
foundational, widely-recurring shape.

### SE Lens

Naming this pattern explicitly matters because recognizing "this is
the observer pattern" transfers understanding across contexts: a list
click listener, a system event receiver, and a plain Java `Button`
listener are all the identical pattern, once recognized, rather than
three unrelated things to learn separately — a recognition this course
returns to directly once a real Android list and a real
system-broadcast receiver are each covered in full.

---

## Connect the Pieces

`Dog.class` (Lesson 4g), `this` as `Context` (Lesson 4h),
`android:exported="false"` (Lesson 4i), and `findViewById` (Lesson 4j)
each named a mechanism already used informally. This lesson closes
Gap 4 the same way: naming the registered-callback shape Lesson 2b's
own click listener has already been using.

## What Breaks Without This

Nothing new breaks in this unit — the value here is recognition, not a
new mechanism: failing to recognize a system's own event-registration
API as "the observer pattern," already verified against Lesson 2b's own
real output, means re-learning its shape from scratch each time, rather
than transferring understanding from `Button`'s own already-familiar
`setOnClickListener`.

## Exercises

1. Explain, in your own words, why `button` is called the "subject"
   and the lambda is called the "observer."
2. Name, from memory, one other place in this course a registered
   callback has already appeared.
3. Explain, in your own words, why naming this pattern explicitly is
   useful beyond just understanding `Button` itself.

## Definition of Done

- [ ] You can state, without looking back at this lesson, which part
      of Lesson 2b's own example is the subject and which is the
      observer.
- [ ] You completed Exercise 2.
- [ ] You can state, without looking back at this lesson, why
      recognizing this pattern by name is useful.
