# Lesson 10a: Activity Result Reporting (`setResult`)

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 2e's `Activity`, Lesson 4f's
`Intent`.

**Terms introduced in this lesson:**

- **Activity result reporting (`setResult`)** — an Activity can hand back
  a result — a result code plus optional Intent data — before finishing,
  rather than only ever performing an action and vanishing.

---

## Concept Unit: Activity Result Reporting

### The Problem

Launching a new screen with an `Intent` (Lesson 4f) returns immediately
— it fires the request and moves on, with no channel back to whoever
launched it. Some screens genuinely need to hand something back: a
screen where the user picks a value, meant to return that value to
whatever launched it, rather than just performing an action and
vanishing.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
Intent resultIntent = new Intent();
resultIntent.putExtra("selected_color", "blue");
setResult(RESULT_OK, resultIntent);
finish();
```

This is `activity result reporting` — **first appearance**: an Activity
can hand back a result — a result code plus optional Intent data —
before finishing, rather than only ever performing an action and
vanishing. `setResult(RESULT_OK, resultIntent)` attaches both a status
(`RESULT_OK`, meaning "the user completed this successfully," as opposed
to cancelling) and data (an `Intent` carrying `"selected_color"`) to this
Activity's own eventual finish — `finish()` itself, already used by
`track/Lesson 9`'s own capstone code, is what actually closes the screen
and delivers that attached result back to whoever launched it.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent()` — **(b) reappearing** `Intent` construction from Lesson
   4f, this time built with no target class at all — this `Intent` is
   never handed to `startActivity`; it exists purely to carry result
   data back, not to route anywhere.
2. `resultIntent.putExtra("selected_color", "blue")` — **(a) first
   appearance**: attaches a named piece of data to the `Intent`, keyed by
   a string (`"selected_color"`), readable by whoever eventually receives
   this `Intent` back.
3. `setResult(RESULT_OK, resultIntent)` — **(a) first appearance**:
   records the result code and data this Activity will report, without
   yet closing the screen — a separate step from `finish()`, allowing
   `setResult` to be called conditionally (only on success, for instance)
   before the screen actually closes.
4. `finish()` — reappearing from `track/Lesson 9`'s own capstone code,
   now shown specifically as the trigger that delivers whatever
   `setResult` most recently recorded back to the launching Activity.

### CS Lens

Activity result reporting turns a one-way `Intent` launch (Lesson 4f)
into a genuine request/response shape: `startActivity` alone is a
fire-and-forget message; `setResult` plus `finish()` is the second half
of a round trip, delivering a response back to wherever the original
request came from.

Also recognized in: a function call that returns a value versus one
returning `void` — the exact same one-way-versus-round-trip distinction,
here expressed across two entirely separate, independently-running
Activities instead of within one function call.

### SE Lens

The alternative — the launched Activity somehow calling back into the
launching Activity directly — was not chosen because Activities, per
Lesson 2e, are never constructed or held as direct references by
application code at all; there is no object either Activity could hold a
reference to the other through. `setResult`/`finish()` works entirely
through the OS-mediated channel Lesson 4f's `Intent` already established,
the only channel that actually exists between two Activities.

---

## Connect the Pieces

`setResult(RESULT_OK, resultIntent)` plus `finish()` reports a result —
a status code and optional data — back through the same OS-mediated
channel Lesson 4f's `Intent` already established. The next lesson shows
how the *launching* Activity actually receives that result.

## What Breaks Without This

Without `setResult`, `finish()` alone discards whatever data the
launched screen produced, leaving no channel back to whoever launched
it — the launching Activity has no way to know anything beyond "this
screen closed."

## Exercises

1. Add a second `putExtra` to the result `Intent` (a `"quantity"` `int`,
   for instance).
2. Explain, in your own words, why `setResult` and `finish()` are two
   separate calls rather than one combined method.
3. Explain, in your own words, why the launched Activity cannot simply
   hold a direct reference back to whichever Activity launched it.

## Definition of Done

- [ ] You read the `setResult`/`finish()` example and can explain what
      each of `setResult`'s two arguments represents.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why plain
      `finish()` alone cannot hand back any data.
