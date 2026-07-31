# Lesson 14f: `runOnUiThread`

**What you will build:** No new code to compile — this reads real
Android code directly.

**What you need to know first:** Lesson 14e's main thread UI constraint,
Lesson 14d's `ExecutorService`.

**Terms introduced in this lesson:**

- **`runOnUiThread`** — explicitly posting a piece of code to run on the
  main thread from a background thread — the required return trip before
  touching any View.

---

## Concept Unit: `runOnUiThread`

### The Problem

Background database work (via `ExecutorService`, Lesson 14d) can safely
read and write the database off the main thread — but its results still
need to reach the screen eventually, and the main thread UI constraint
(Lesson 14e) forbids updating `RecyclerView`'s adapter directly from
that same background thread.

### Introduce the Concept in Isolation

This is not a throwaway lab — it's real Android code, verified against
the actual framework source:

```java
executor.submit(() -> {
    List<Item> items = database.itemDao().getAll();

    runOnUiThread(() -> {
        adapter.updateItems(items);
        adapter.notifyDataSetChanged();
    });
});
```

This is `runOnUiThread` — **first appearance**: explicitly posting a
piece of code to run on the main thread from a background thread — the
required return trip before touching any View. `database.itemDao()
.getAll()` runs safely on the background thread, respecting Room's own
half of the main thread constraint; the code passed to `runOnUiThread`
then hands `adapter`'s update back to the main thread's event loop
(Lesson 14b) — the *only* place `RecyclerView` permits its own views to
be touched.

### Discard the Throwaway Example

Nothing here is a throwaway lab to discard — this is real, verified
Android code.

### Mechanical Walkthrough

1. `executor.submit(() -> { ... });` — **(b) reappearing**
   `ExecutorService` call from Lesson 14d, running the real database
   query off the main thread.
2. `List<Item> items = database.itemDao().getAll();` — **(b) reappearing**
   Room `@Dao` call from Lesson 13g, now safely run on a background
   thread rather than the main thread.
3. The code passed to `runOnUiThread` — **(a) first appearance**: hands
   this exact block of code to the main thread's own event loop, to run
   there instead of on the current background thread.
4. `adapter.notifyDataSetChanged();` — **(b) reappearing**
   `RecyclerView.Adapter` call from Lesson 6h, now safely executed on the
   main thread, satisfying Lesson 14e's own constraint.

### CS Lens

`runOnUiThread` is a real, concrete bridge between two threads,
connecting directly to Lesson 14b's own Event Loop: the code passed to
it doesn't run immediately, on the calling background thread — it's
queued onto the main thread's own event loop, and runs only once that
loop reaches it, exactly like any other queued callback.

Also recognized in: dispatch-to-main-thread APIs across virtually every
mainstream UI framework (`DispatchQueue.main.async` in iOS's Swift,
`Dispatcher.Invoke` in WPF) — the same "hand this back to the one thread
allowed to touch the UI" idea.

### SE Lens

The alternative — calling `adapter.notifyDataSetChanged()` directly from
inside the background thread's own task, skipping `runOnUiThread`
entirely — was not chosen because it violates the main thread UI
constraint directly, producing the real `CalledFromWrongThreadException`
Lesson 14e demonstrated.

---

## Connect the Pieces

`ExecutorService` (Lesson 14d) provides a real, reused pool of background
threads. The main thread UI constraint (Lesson 14e) explains *why* that
background work can't simply update the screen directly once finished.
`runOnUiThread` is the real, concrete bridge connecting the two — handing
a background thread's finished results back to the main thread's own
event loop. The next lesson shows what happens if slow work runs on the
main thread anyway.

## What Breaks Without This

Calling `adapter.notifyDataSetChanged()` directly from a background
thread, skipping `runOnUiThread`, produces a real
`CalledFromWrongThreadException` crash.

## Exercises

1. Rewrite this lesson's own `runOnUiThread` example so the database
   query itself accidentally runs inside the `runOnUiThread(...)` block
   instead of before it, and explain, in your own words, what real
   problem that reintroduces.
2. Explain, in your own words, why the database read happens outside
   `runOnUiThread`'s own block, but the adapter update happens inside it.
3. Explain, in your own words, why `runOnUiThread` doesn't run its
   argument immediately, on the calling thread.

## Definition of Done

- [ ] You read the real `runOnUiThread` example and can explain what
      would happen if it were removed from the code shown.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, why
      `runOnUiThread` is needed even though the database work already
      runs safely off the main thread.
