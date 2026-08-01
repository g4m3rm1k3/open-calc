# Lesson 6b: Cache an Expensive Lookup on First Use

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 6a's eager vs. lazy
evaluation.

**Terms introduced in this lesson:**

- **Cache an expensive lookup on first use** — doing an expensive
  computation or lookup exactly once, storing the result, and reusing
  the cached result on every subsequent need.

---

## Concept Unit: Cache an Expensive Lookup on First Use

### The Problem

Even a lazily-built row's own internal lookups — finding each of its
child views, say — might still be repeated unnecessarily if the same
row is looked at again later without remembering the result of the
first lookup.

### Introduce the Concept in Isolation

```
mkdir lesson-6b
cd lesson-6b
```

Create `Main.java`:

```java
class ExpensiveLookup {
    private String cachedResult;

    String getResult() {
        if (cachedResult == null) {
            System.out.println("Performing expensive lookup...");
            cachedResult = "Found Value";
        }
        return cachedResult;
    }
}

public class Main {
    public static void main(String[] args) {
        ExpensiveLookup lookup = new ExpensiveLookup();

        System.out.println("First call: " + lookup.getResult());
        System.out.println("Second call: " + lookup.getResult());
        System.out.println("Third call: " + lookup.getResult());
    }
}
```

Compile and run it:

```
javac Main.java
java Main
```

Here is the real output:

```
Performing expensive lookup...
First call: Found Value
Second call: Found Value
Third call: Found Value
```

`"Performing expensive lookup..."` prints only once, even though
`getResult()` was called three times. This is caching an expensive
lookup on first use — **first appearance**: doing an expensive
computation or lookup exactly once, storing the result, and reusing
the cached result on every subsequent need.

### Discard the Throwaway Example

This version is deleted now. It will not appear again.

### Mechanical Walkthrough

1. `private String cachedResult;` — **(b) reappearing** field
   declaration, starting `null` — the field's own lifetime outlives any
   one method call, which is exactly what lets it remember, across
   separate calls, whether the expensive work has already run.
2. `if (cachedResult == null) { ... cachedResult = "Found Value"; }` —
   **(a) first appearance** of this exact caching shape: the
   expensive work runs only when no cached result exists yet.
3. Three separate `getResult()` calls — only the first triggers the
   expensive work; the second and third simply return the
   already-cached value.

### CS Lens

This is lazy evaluation (Lesson 6a) combined with memory: not just
deferring work until needed, but remembering the result so it's never
redone once it's already been done. This is the entire reason
`ViewHolder` (a later lesson's own subject) exists: `findViewById`'s
tree walk (Lesson 4j) is cached once per holder, instead of repeated
on every scroll frame.

Also recognized in: memoization in functional programming generally,
any "lazy-initialized" field pattern across other languages, HTTP
response caching (avoiding repeating an expensive network request for
the identical resource).

### SE Lens

The alternative — recomputing the expensive lookup every single time
it's needed — was not chosen because the cost compounds with how
often the value is requested; caching trades a small amount of memory
(storing the cached value) for avoiding repeated, unnecessary
expensive work.

---

## Connect the Pieces

Lesson 6a showed doing less work by deferring it; this lesson showed
doing it at most once, ever, by remembering the result. The next
lesson (View Recycling) applies this exact idea to entire row View
objects, not just one lookup.

## What Breaks Without This

Removing the `if (cachedResult == null)` check entirely, running the
expensive work on every call instead, would print
`"Performing expensive lookup..."` three times instead of once — real,
repeated, unnecessary work for a result that never actually changes.

## Exercises

1. Remove the `if` check and confirm, by running it, that the
   expensive message now prints three times instead of once.
2. Add a second cached field, `int callCount`, incremented only inside
   the `if` block, and print it to confirm the expensive path really
   only ran once.
3. Explain, in your own words, why caching trades memory for saved
   work.

## Definition of Done

- [ ] You ran the example and saw the expensive message print exactly
      once across three calls.
- [ ] You completed Exercise 1 and observed the real, repeated output.
- [ ] You can state, without looking back at this lesson, what
      condition controls whether the expensive work runs again.
