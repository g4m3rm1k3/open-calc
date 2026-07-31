# Lesson 11d: `SharedPreferences`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 11c's process death.

**Terms introduced in this lesson:**

- **`SharedPreferences`** — a small, durable key-value store backed by a
  file on the device's persistent storage, surviving process death, read
  and written by string keys.

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
   genuinely different from Lesson 0y's own exception-based error
   handling, since a missing key here is not treated as a failure.

### CS Lens

`SharedPreferences` is real, load-bearing non-volatile storage — Lesson
11b's own concept, made concrete: a value written through
`editor.apply()` genuinely survives not just a configuration change
(Lesson 5d) but full process death (Lesson 11c), because it's written to
a real file on the device's own persistent storage, entirely outside
this app's own process memory.

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

Lesson 11a's `onResume` re-reads state that might change within a
running process. Lessons 11b and 11c drew the line between volatile
state and the process death that ends it. `SharedPreferences`, writing
to a real, durable file via `editor.apply()`, is what actually survives
process death — the concrete, non-volatile alternative this group of
lessons has been building toward.

## What Breaks Without This

Relying on `onSaveInstanceState` alone to persist a setting across app
relaunches produces a real, observable bug: force-stopping the app (or
letting the OS reclaim it under memory pressure) and reopening it later
shows the setting reset to its default — not because of any error, but
because `onSaveInstanceState`'s own rescued `Bundle` does not reliably
survive process death.

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

- [ ] You read the real `SharedPreferences` example and can explain what
      `editor.apply()` actually does.
- [ ] You completed Exercise 3.
- [ ] You can state, without looking back at this lesson, why
      `onSaveInstanceState` is not a substitute for `SharedPreferences`.
