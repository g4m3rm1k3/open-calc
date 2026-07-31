# Lesson 10b: `ActivityResultLauncher` / `registerForActivityResult`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 10a's activity result reporting,
Lesson 2b's callback.

**Terms introduced in this lesson:**

- **Activity result registration (`ActivityResultLauncher`)** —
  registering ahead of time, before `onCreate` runs, to receive a
  launched Activity's eventual result via a callback, keyed to this
  specific launch rather than a hardcoded target class.

---

## Concept Unit: Activity Result Registration

### The Problem

The previous lesson's Activity can report a result — but nothing yet
shows how the *launching* Activity actually receives it. Plain
`startActivity(intent)` has no hook anywhere for a later callback to
attach to; it simply requests a screen and returns immediately, with no
mechanism for anything to run once that screen eventually finishes and
reports back.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
ActivityResultLauncher<Intent> launcher = registerForActivityResult(
    new ActivityResultContracts.StartActivityForResult(),
    result -> {
        if (result.getResultCode() == RESULT_OK) {
            String color = result.getData().getStringExtra("selected_color");
            System.out.println("User picked: " + color);
        }
    }
);

launcher.launch(new Intent(this, ColorPickerActivity.class));
```

This is `activity result registration` — **first appearance**:
registering ahead of time, before `onCreate` runs, to receive a launched
Activity's eventual result via a callback, keyed to this specific launch
rather than a hardcoded target class. `registerForActivityResult(...)`
is called once, up front, supplying a callback (a lambda here, per
Lesson 0t) that runs later, whenever `ColorPickerActivity` actually
finishes and reports its result — the exact same registered-callback
shape Lesson 2b's own callback material already built in miniature.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `registerForActivityResult(new ActivityResultContracts
   .StartActivityForResult(), result -> { ... })` — **(a) first
   appearance.** The first argument names *what kind* of result is
   expected (a plain Activity result, here); the second is the callback,
   **(b) reappearing** lambda expression from Lesson 0t, run later, not
   at registration time.
2. `result.getResultCode() == RESULT_OK` — **(b) reappearing** result-code
   check, matching what Lesson 10a's own `setResult(RESULT_OK, ...)`
   actually sent.
3. `result.getData().getStringExtra("selected_color")` — **(a) first
   appearance** of reading data back out of a result `Intent`, matching
   the exact key (`"selected_color"`) Lesson 10a's own `putExtra` used
   to put it in.
4. `launcher.launch(new Intent(this, ColorPickerActivity.class))` —
   **(a) first appearance** of actually starting the launch: unlike a
   plain `startActivity(intent)`, launching through `launcher` is what
   connects this specific launch to the callback registered above it —
   the same `Intent` construction, routed through a result-aware
   launcher instead of a plain, forgetful `startActivity`.

### CS Lens

This is Lesson 2b's callback concept, applied specifically to a screen
transition: the callback is registered *before* the screen ever opens,
tied to this one specific launch — not to `ColorPickerActivity` as a
class in general, since the same launcher could, in principle, be reused
to launch different target Activities, each triggering the same
registered callback with whatever result they individually report.

Also recognized in: any asynchronous request/response API that requires
registering a response handler before making the request (rather than
being handed a return value directly, since the response genuinely isn't
available yet at the moment the request is made) — a shape the next
lesson's own plain-Java asynchronous-result material returns to
directly.

### SE Lens

The alternative — a global, hardcoded method somehow always called
whenever *any* Activity finishes, regardless of who launched what — was
not chosen because it would require every launching Activity to inspect
which specific launch a given result belongs to, by hand, every time.
Registering a callback tied to one specific launch means the correct
handler runs automatically, with no manual bookkeeping about which
result belongs to which request.

---

## Connect the Pieces

`registerForActivityResult(...)`, called ahead of time, registers
exactly the callback that will run once a specific launch's result
comes back, and `launcher.launch(...)` is what ties a specific `Intent`
launch to that registered callback. Together with Lesson 10a's
`setResult`/`finish()`, these turn a one-way `startActivity` into a real
round trip: launch, wait, receive a result, react to it.

## What Breaks Without This

Launching with plain `startActivity(intent)` instead of through a
registered launcher provides no way at all to receive
`ColorPickerActivity`'s reported result — there is no compiler error, no
crash, simply no callback anywhere for the result to reach. Lesson 10a's
`setResult`/`finish()` still runs correctly on the launched side, but
with nothing registered to receive it on the launching side, that
reported result is simply discarded.

## Exercises

1. Change the callback to also handle a cancelled result — check for a
   result code other than `RESULT_OK` and print a different message —
   confirming the callback receives *every* result, not only successful
   ones.
2. Explain, in your own words, why `launcher.launch(...)` is required
   instead of plain `startActivity(...)` for this specific launch to
   trigger the registered callback at all.
3. Explain, in your own words, why the callback is registered before
   `onCreate` even runs, rather than at the moment the launch happens.

## Definition of Done

- [ ] You read the `registerForActivityResult`/`launcher.launch` example
      and can explain when the registered callback actually runs.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why plain
      `startActivity` provides no way to receive a launched Activity's
      result.
