# Lesson 35: Process Death and SharedPreferences

**What you will build:** The first unit is a small, fully runnable, plain
Java lab. The remaining two read real Android mechanisms directly.

**What you need to know first:** Lesson 34's `configuration change`.

**Terms introduced in this lesson:**

- **Volatile vs. non-volatile state** — memory that exists only while a
  process runs (volatile) versus storage that outlives the process
  entirely (non-volatile).
- **Process death** — the Android OS terminating an app's entire process
  (swiped away, force-stopped, or reclaimed for memory), destroying
  everything in memory — including any state a configuration-change
  rescue like `onSaveInstanceState` would have saved.
- **`SharedPreferences`** — a small, durable key-value store backed by a
  file on the device's persistent storage, surviving process death, read
  and written by string keys.

---

## Concept Unit: Volatile vs. Non-Volatile State

### The Problem

Every variable, field, and object this curriculum has built so far has
lived in memory, for as long as the running program lasted — and
disappeared completely the instant that program ended. Some data
genuinely needs to survive longer than any single run of a program;
memory alone, no matter how carefully checkpointed within one run, cannot
provide that on its own.

### Introduce the Concept in Isolation

```
mkdir lesson-35
cd lesson-35
```

Create `Main.java`:

```java
public class Main {
    public static void main(String[] args) {
        int inMemoryCounter = 5;
        System.out.println("In-memory value: " + inMemoryCounter);
        System.out.println("Program ending now — this value will not survive.");
    }
}
```

Compile and run it twice in a row:

```
javac Main.java
java Main
java Main
```

Here is the real output, from both runs:

```
In-memory value: 5
Program ending now — this value will not survive.
In-memory value: 5
Program ending now — this value will not survive.
```

`inMemoryCounter` prints `5` both times — not because it survived between
runs, but because it's freshly recreated, from the literal `5` in the
source code, every single time the program starts. This is `volatile vs.
non-volatile state` — **first appearance**: memory that exists only while
a process runs (volatile) versus storage that outlives the process
entirely (non-volatile). `inMemoryCounter` is volatile — nothing in this
program writes its value anywhere that would persist between the first
`java Main` run and the second one.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `int inMemoryCounter = 5;` — an ordinary local variable, **(c)**
   genuinely basic syntax, examined here specifically for how long its
   value actually lasts rather than its declaration shape.
2. Running `java Main` twice — **(a) first appearance** of this exact
   demonstration: two separate, independent process runs, each starting
   fresh from the source code, with nothing carried over between them at
   all.

### CS Lens

Volatile state exists only within one running process's own memory;
non-volatile state is written somewhere that outlives the process
entirely — a file, a database, any real, persistent storage medium. This
distinction is orthogonal to Lesson 34's own configuration-change
rescue: `onSaveInstanceState` only ever bridges one Activity object's own
destruction within a *still-running* process — it says nothing at all
about surviving the process itself ending.

Also recognized in: RAM versus disk storage generally, a web browser's
in-memory JavaScript variables versus `localStorage` (which persists
across page reloads and browser restarts), any system distinguishing
"fast but temporary" from "slower but durable" storage.

### SE Lens

Recognizing which state genuinely needs non-volatile storage, versus
state that's fine being rebuilt fresh on every run, is a real design
decision with a real cost either way: over-persisting trivial state adds
unnecessary storage and complexity; under-persisting state a user
actually expects to survive produces a real, frustrating loss the moment
the program (or app) restarts.

---

## Concept Unit: Process Death

### The Problem

Lesson 34's configuration change destroys and recreates one Activity
object, but the surrounding Android process — and everything else in its
memory — keeps running the entire time. Something stronger can happen: the
Android OS can terminate the *entire process*, not just recreate one
Activity within it — a genuinely different, more severe event a
configuration-change rescue was never designed to survive.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's a real Android mechanism, verified against
the actual framework behavior, not runnable via plain `javac`:

```
(user swipes the app away from the recent-apps list)
  → Android may terminate the entire app process immediately
  → every object in memory is gone, with no further callbacks at all
  → (later) user reopens the app
  → Android starts a completely new process from scratch
  → InventoryActivity.onCreate(savedInstanceState) — but savedInstanceState
    is often null here too, since the process itself, not just one
    Activity, was destroyed
```

This is `process death` — **first appearance**: the Android OS
terminating an app's entire process (swiped away, force-stopped, or
reclaimed for memory), destroying everything in memory — including any
state a configuration-change rescue like `onSaveInstanceState` would
have saved. `onSaveInstanceState`'s own `Bundle` is itself held in
memory, by the OS, only for a limited time and only in some
circumstances — it is not a guarantee against process death the way it
is against a configuration change; assuming otherwise is a real, common,
and mistaken assumption this unit exists specifically to correct.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this traces a real,
verified Android mechanism.

### Mechanical Walkthrough

1. The app process is terminated entirely — **(a) first appearance** of
   this specific severity: not one Activity being destroyed and
   recreated within a continuing process (Lesson 34), but the entire
   process, and everything volatile within it (this lesson's first
   unit), ending.
2. A completely new process starts later — **(a) first appearance**:
   this is not a continuation of anything — every static field
   (Lesson 03), every object, everything volatile, has been rebuilt from
   nothing.

### CS Lens

Process death is a stronger event than a configuration change: a
configuration change destroys one Activity object while the process
itself, and its other volatile state, continues running; process death
ends the process itself, taking every volatile piece of state with it,
`onSaveInstanceState`'s own rescued `Bundle` included in many real
circumstances.

Also recognized in: an operating system terminating any background
process under memory pressure generally, a server process being
restarted (losing all in-memory state not written to a database first).

### SE Lens

The mistaken assumption this unit corrects — treating
`onSaveInstanceState` as a general-purpose persistence mechanism — has a
real, concrete cost: state that only exists in a rescued `Bundle`,
without ever being written to genuinely non-volatile storage, can still
be lost the moment process death (rather than a mere configuration
change) occurs. Anything that must survive process death specifically
needs this lesson's own next subject.

---

## Concept Unit: `SharedPreferences`

### The Problem

A value like a user's chosen low-stock threshold needs to survive not
just a configuration change, and not just the current process's
lifetime, but every future launch of the app, indefinitely, across
process death, device restarts, and app updates. Volatile, in-memory
state — the entirety of what this curriculum has used so far — cannot
provide that on its own.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
SharedPreferences prefs = getSharedPreferences("settings", Context.MODE_PRIVATE);

SharedPreferences.Editor editor = prefs.edit();
editor.putInt("low_stock_threshold", 5);
editor.apply();

int threshold = prefs.getInt("low_stock_threshold", 10);
```

This is `SharedPreferences` — **first appearance**: a small, durable
key-value store backed by a file on the device's persistent storage,
surviving process death, read and written by string keys. `editor.apply()`
writes the value to a real file on the device's own storage, outliving
this process entirely — the next time this app runs, even after full
process death, `prefs.getInt("low_stock_threshold", 10)` reads the same
`5` back, not the fallback `10`.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `getSharedPreferences("settings", Context.MODE_PRIVATE)` — **(a)
   first appearance**: retrieves (or creates, on first use) a named
   preferences file, `"settings"`, private to this app only.
2. `SharedPreferences.Editor editor = prefs.edit();` — **(a) first
   appearance**: `SharedPreferences` itself is read-only; a separate
   `Editor` object is required to make changes, a real, deliberate split
   between reading and writing this specific store.
3. `editor.putInt("low_stock_threshold", 5); editor.apply();` — **(a)
   first appearance** of `apply()`: commits the change to the real,
   underlying file, asynchronously — the write genuinely reaches durable
   storage, surviving process death from this point on.
4. `prefs.getInt("low_stock_threshold", 10)` — **(a) first appearance**
   of this read shape: the second argument, `10`, is a fallback value,
   used only if the key was never previously written at all —
   genuinely different from Lesson 09's own exception-based error
   handling, since a missing key here is not treated as a failure.

### CS Lens

`SharedPreferences` is real, load-bearing non-volatile storage — this
lesson's first unit's own concept, made concrete: a value written through
`editor.apply()` genuinely survives not just a configuration change
(Lesson 34) but full process death, because it's written to a real file
on the device's own persistent storage, entirely outside this app's own
process memory.

Also recognized in: `localStorage` in web browsers (a closely analogous
key-value store surviving page reloads and browser restarts),
`UserDefaults` on iOS (near-identical purpose and shape),
`NSUserDefaults`/plist-based settings on macOS.

### SE Lens

The alternative — relying on `onSaveInstanceState` for a setting meant
to persist indefinitely — was not chosen because it was never designed
for that: it protects against a configuration change specifically, not
process death, and not indefinitely across app relaunches days later.
`SharedPreferences` exists specifically for exactly this kind of small,
durable, key-value setting, a genuinely different problem
`onSaveInstanceState` doesn't solve.

---

## Connect the Pieces

`inMemoryCounter`, freshly rebuilt every run, demonstrated volatile state
directly. Process death is the real event that ends *all* of a process's
own volatile state at once — a stronger event than Lesson 34's
configuration change, and one `onSaveInstanceState`'s own rescued
`Bundle` does not reliably survive either. `SharedPreferences`, writing
to a real, durable file via `editor.apply()`, is what actually survives
process death — the concrete, non-volatile alternative this entire
lesson has been building toward.

## What Breaks Without This

Relying on `onSaveInstanceState` alone to persist a setting across app
relaunches produces a real, observable bug: force-stopping the app (or
letting the OS reclaim it under memory pressure) and reopening it later
shows the setting reset to its default — not because of any error, but
because `onSaveInstanceState`'s own rescued `Bundle` does not reliably
survive process death, the exact distinction this lesson's second unit
exists to establish.

## Exercises

1. Add a second `SharedPreferences` value, `"username"`, a `String`
   rather than an `int`, using `putString`/`getString` instead of
   `putInt`/`getInt`.
2. Explain, in your own words, why `SharedPreferences` requires a
   separate `Editor` object to write, rather than writing directly
   through `prefs` itself.
3. Explain, in your own words, why the fallback value in
   `prefs.getInt("low_stock_threshold", 10)` is needed, connecting it to
   what happens the very first time an app runs, before any value has
   ever been written under that key.

## Definition of Done

- [ ] You ran the two-process example and can explain why the value
      printed the same both times.
- [ ] You read the real process-death lifecycle trace and can state why
      it's a stronger event than a configuration change.
- [ ] You read the real `SharedPreferences` example and can explain what
      `editor.apply()` actually does.
- [ ] You can state, without looking back at this lesson, why
      `onSaveInstanceState` is not a substitute for `SharedPreferences`.
