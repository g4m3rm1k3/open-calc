# Lesson 20: Activity Results

**What you will build:** Both units read real Android API contracts
directly — nothing here compiles with plain `javac`.

**What you need to know first:** Lesson 10's `Activity` and `callback`,
Lesson 19's `Intent`.

**Terms introduced in this lesson:**

- **Activity result reporting (`setResult`)** — an Activity can hand back
  a result — a result code plus optional Intent data — before finishing,
  rather than only ever performing an action and vanishing.
- **Activity result registration (`ActivityResultLauncher`)** —
  registering ahead of time, before `onCreate` runs, to receive a
  launched Activity's eventual result via a callback, keyed to this
  specific launch rather than a hardcoded target class.

---

## Concept Unit: Activity Result Reporting

### The Problem

Lesson 19's `startActivity(intent)` launches a new screen and returns
immediately — it fires the request and moves on, with no channel back to
whoever launched it. Some screens genuinely need to hand something back:
a screen where the user picks a value, meant to return that value to
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
Activity's own eventual finish — `finish()` itself, already used since an
earlier lesson, is what actually closes the screen and delivers that
attached result back to whoever launched it.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `new Intent()` — **(b) reappearing** `Intent` construction from Lesson
   19, this time built with no target class at all — this `Intent` is
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
4. `finish()` — **(b) reappearing** from an earlier lesson, now shown
   specifically as the trigger that delivers whatever `setResult` most
   recently recorded back to the launching Activity.

### CS Lens

Activity result reporting turns a one-way `Intent` launch (Lesson 19)
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
Lesson 10, are never constructed or held as direct references by
application code at all; there is no object either Activity could hold a
reference to the other through. `setResult`/`finish()` works entirely
through the OS-mediated channel Lesson 19 already established `Intent`
provides, the only channel that actually exists between two Activities.

---

## Concept Unit: Activity Result Registration

### The Problem

The previous unit's Activity can report a result — but nothing yet shows
how the *launching* Activity actually receives it. Plain
`startActivity(intent)`, from Lesson 19, has no hook anywhere for a later
callback to attach to; it simply requests a screen and returns
immediately, with no mechanism for anything to run once that screen
eventually finishes and reports back.

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
Lesson 06) that runs later, whenever `ColorPickerActivity` actually
finishes and reports its result — the exact same registered-callback
shape Lesson 10's own `Button`/`ClickHandler` example already built in
miniature.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `registerForActivityResult(new ActivityResultContracts
   .StartActivityForResult(), result -> { ... })` — **(a) first
   appearance.** The first argument names *what kind* of result is
   expected (a plain Activity result, here); the second is the callback,
   **(b) reappearing** lambda expression from Lesson 06, run later, not
   at registration time.
2. `result.getResultCode() == RESULT_OK` — **(b) reappearing** result-code
   check, matching what the previous unit's `setResult(RESULT_OK, ...)`
   actually sent.
3. `result.getData().getStringExtra("selected_color")` — **(a) first
   appearance** of reading data back out of a result `Intent`, matching
   the exact key (`"selected_color"`) the previous unit's `putExtra` used
   to put it in.
4. `launcher.launch(new Intent(this, ColorPickerActivity.class))` —
   **(a) first appearance** of actually starting the launch: unlike
   Lesson 19's plain `startActivity(intent)`, launching through
   `launcher` is what connects this specific launch to the callback
   registered above it — the same `Intent` construction, routed through a
   result-aware launcher instead of a plain, forgetful `startActivity`.

### CS Lens

This is Lesson 10's callback concept, applied specifically to a screen
transition: the callback is registered *before* the screen ever opens,
tied to this one specific launch — not to `ColorPickerActivity` as a
class in general, since the same launcher could, in principle, be reused
to launch different target Activities, each triggering the same
registered callback with whatever result they individually report.

Also recognized in: any asynchronous request/response API that requires
registering a response handler before making the request (rather than
being handed a return value directly, since the response genuinely isn't
available yet at the moment the request is made) — a shape this
curriculum's own later lessons on background work return to directly.

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

`setResult(RESULT_OK, resultIntent)` plus `finish()` reports a result —
a status code and optional data — back through the same OS-mediated
channel Lesson 19's `Intent` already established.
`registerForActivityResult(...)`, called ahead of time, registers exactly
the callback that will run once that specific launch's result comes
back, and `launcher.launch(...)` is what ties a specific `Intent` launch
to that registered callback. Together, these turn Lesson 19's one-way
`startActivity` into a real round trip: launch, wait, receive a result,
react to it.

## What Breaks Without This

Launching with plain `startActivity(intent)` instead of through a
registered launcher provides no way at all to receive
`ColorPickerActivity`'s reported result — there is no compiler error, no
crash, simply no callback anywhere for the result to reach. This is the
concrete, silent failure mode `activity result registration` exists to
prevent: `setResult`/`finish()`, from the previous unit, still runs
correctly on the launched side, but with nothing registered to receive
it on the launching side, that reported result is simply discarded.

## Exercises

1. Add a second `putExtra` to the result `Intent` (a `"quantity"` `int`,
   for instance) and read it back inside the registered callback,
   alongside `"selected_color"`.
2. Change the callback to also handle a cancelled result — check for a
   result code other than `RESULT_OK` and print a different message —
   confirming the callback receives *every* result, not only successful
   ones.
3. Explain, in your own words, why `launcher.launch(...)` is required
   instead of plain `startActivity(...)` for this specific launch to
   trigger the registered callback at all.

## Definition of Done

- [ ] You read the `setResult`/`finish()` example and can explain what
      each of `setResult`'s two arguments represents.
- [ ] You read the `registerForActivityResult`/`launcher.launch` example
      and can explain when the registered callback actually runs.
- [ ] You completed Exercise 1 and can explain how to both put and read
      back a second piece of result data.
- [ ] You can state, without looking back at this lesson, why plain
      `startActivity` provides no way to receive a launched Activity's
      result.
