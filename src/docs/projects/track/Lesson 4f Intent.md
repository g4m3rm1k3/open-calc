# Lesson 4f: `Intent` — Android's Real Broker

**What you will build:** No new code to compile — this reads a real
Android mechanism directly.

**What you need to know first:** Lesson 4e's message passing through a
broker, Lesson 2e's `Activity`.

**Terms introduced in this lesson:**

- **`Intent`** — a data object describing a desired action or
  destination, handed to the Android OS to route, rather than the
  source component calling the destination directly.

---

## Concept Unit: `Intent` — Android's Real Broker

### The Problem

Lesson 2e built and read `MainActivity`, but never showed how one
Activity could ask Android to open a *different* Activity. Activities
cannot hold direct references to each other and call `new` on one
another — nothing in Android permits an Activity to simply construct
another Activity object directly; the OS itself owns that entire
lifecycle, exactly as Lesson 2e established. Some indirection is
required.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Intent intent = new Intent(this, SettingsActivity.class);
startActivity(intent);
```

This is an `Intent` — **first appearance**: a data object describing a
desired action or destination, handed to the Android OS to route,
rather than the source component calling the destination directly.
`new Intent(this, SettingsActivity.class)` does not construct a
`SettingsActivity` at all — it constructs a description: "open
whatever `SettingsActivity` is." `startActivity(intent)` hands that
description to the OS, which is what actually constructs and drives
the real `SettingsActivity` object, exactly as Lesson 2e established
Android alone does.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent(this, SettingsActivity.class)` — **(a) first
   appearance** of `Intent`'s own constructor shape: `this` identifies
   the requesting Activity (the environment this request originates
   from — the next lesson gives this its own full treatment);
   `SettingsActivity.class` names the *class* to route to, not an
   object of it — there is no `new SettingsActivity()` anywhere in
   this code.
2. `startActivity(intent)` — **(a) first appearance**: hands the
   `Intent`'s description to the Android OS. This call does not return
   the new screen, or block until it appears — it simply requests that
   the OS route this description somewhere, the same fire-and-describe
   shape as Lesson 4e's own `broker.dispatch(new Request(...))`.

### CS Lens

`Intent` is Lesson 4e's own broker pattern, applied at the scale of an
entire operating system: `SettingsActivity.class` plays the same role
Lesson 4e's own `"OPEN_SETTINGS"` string did — a description of a
desired destination, not a direct reference to it — and the Android OS
plays the role `Broker` played, deciding what actually happens with
that description, including constructing and driving the real
destination Activity, which the requesting Activity itself never does
directly.

Also recognized in: any OS-level inter-process communication mechanism
generally (one process can't hold a direct object reference into
another's memory space at all — some broker, mediated by the OS, is
always required), the same shape recurring wherever two
independently-running components need to communicate without shared
memory.

### SE Lens

The alternative — Activities holding direct references to each other
and calling methods directly — was not chosen because Android's own
inversion of control (Lesson 2a) already means no Activity constructs
another Activity directly; only the OS does. `Intent` is the required
description-based indirection that makes requesting a screen change
possible at all, given that the OS, not the requesting Activity, is
solely responsible for actually constructing and driving the next
screen.

---

## Connect the Pieces

Lesson 4e's `Broker.dispatch(new Request("OPEN_SETTINGS"))`
established the general shape: describe a request as data, hand it to
a central dispatcher, never hold a direct reference to what actually
handles it. `new Intent(this, SettingsActivity.class)` plus
`startActivity(intent)` is that exact pattern, real: `SettingsActivity
.class` is the description, the Android OS is the broker, and the
requesting Activity never constructs the destination Activity itself.

## What Breaks Without This

Android provides no supported way to construct another Activity
directly, bypassing `Intent` entirely — there is no `new
SettingsActivity()` call that would produce a correctly OS-managed
screen, because a directly-constructed Activity object never receives
the lifecycle calls (`onCreate`, `onStart`, and the rest of Lesson
2f's own sequence) the OS is solely responsible for triggering.

## Exercises

1. Read `Intent`'s real constructor shape again and explain, in your
   own words, why the destination is named as `SettingsActivity.class`
   rather than `new SettingsActivity()`.
2. Explain, in your own words, why `startActivity(intent)` doesn't
   return the new screen directly.
3. Compare `Intent`/`startActivity` directly against Lesson 4e's own
   `Request`/`Broker.dispatch` — name which part plays which role.

## Definition of Done

- [ ] You read `Intent`'s real constructor and `startActivity` call
      and can explain what each of `Intent`'s two constructor
      arguments means.
- [ ] You completed Exercise 3.
- [ ] You can state, without looking back at this lesson, why
      `SettingsActivity.class` appears in `Intent`'s constructor
      instead of `new SettingsActivity()`.
