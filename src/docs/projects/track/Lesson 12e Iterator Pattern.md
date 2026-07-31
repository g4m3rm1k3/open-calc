# Lesson 12e: Iterator Pattern

**What you will build:** A small, fully runnable, plain Java lab.

**What you need to know first:** Lesson 12d's primary key.

**Terms introduced in this lesson:**

- **Iterator Pattern** — traversing a sequence one element at a time via
  a stateful cursor/position object, without the whole collection needing
  to be materialized in memory up front.

---

## Concept Unit: Iterator Pattern

### The Problem

Different kinds of sequences — an in-memory `ArrayList`, a database
result set read from disk — look superficially different underneath, but
"step through this one element at a time" is the exact same problem for
both. Writing separate, custom stepping code for each kind of sequence
would duplicate the same shape over and over.

### Introduce the Concept in Isolation

```
mkdir lesson-12e
cd lesson-12e
```

Create `Main.java`:

```java
import java.util.Iterator;
import java.util.List;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>();
        names.add("Wrench");
        names.add("Bolt");
        names.add("Hammer");

        Iterator<String> iterator = names.iterator();
        while (iterator.hasNext()) {
            String name = iterator.next();
            System.out.println(name);
        }
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
Wrench
Bolt
Hammer
```

This is the `Iterator Pattern` — **first appearance**: traversing a
sequence one element at a time via a stateful cursor/position object,
without the whole collection needing to be materialized in memory up
front. `iterator.hasNext()` and `iterator.next()` are one uniform pair —
one method to check "is there more," one to advance and retrieve —
regardless of whether the underlying sequence is an in-memory
`ArrayList` or a database result set read from disk, the subject of the
next few lessons.

#### Execution Trace

Trace of the `while (iterator.hasNext())` loop:

1. `iterator.hasNext()` returns `true`; `iterator.next()` advances past
   `"Wrench"` and returns it; `Wrench` is printed.
2. `iterator.hasNext()` returns `true`; `iterator.next()` advances past
   `"Bolt"` and returns it; `Bolt` is printed.
3. `iterator.hasNext()` returns `true`; `iterator.next()` advances past
   `"Hammer"` and returns it; `Hammer` is printed.
4. `iterator.hasNext()` returns `false` — no elements remain — and the
   loop ends.

### Discard the Throwaway Example

This version is deleted now. It will not appear in the project again.

### Mechanical Walkthrough

1. `Iterator<String> iterator = names.iterator();` — **(a) first
   appearance**: obtains an iterator positioned before the first element
   — no element has been read yet.
2. `while (iterator.hasNext())` — **(a) first appearance**: checks whether
   another element remains, without advancing.
3. `iterator.next()` — **(a) first appearance**: advances to, and returns,
   the next element — `"Wrench"`, then `"Bolt"`, then `"Hammer"`, each on
   a separate call.

### CS Lens

The Iterator Pattern's whole point is decoupling "how do I step through
this" from "how is this sequence actually stored" — a `for`-each loop
over any `Iterable` in Java is sugar over exactly this same
`hasNext()`/`next()` pair, whether the underlying sequence is an
`ArrayList`, a database result set, or any other iterable source.

Also recognized in: iterators/generators in virtually every mainstream
language (Python's own iterator protocol, C#'s `IEnumerator`), any API
exposing "step through my elements" without exposing internal storage.

### SE Lens

The alternative — exposing a sequence's own internal storage directly (an
array, an internal index) for callers to walk manually — was not chosen
because it would force every caller to know, and depend on, that internal
representation; the Iterator Pattern lets the underlying storage change
freely (an `ArrayList` today, a database result set tomorrow) without
breaking any code that only ever calls `hasNext()`/`next()`.

---

## Connect the Pieces

`iterator.hasNext()`/`iterator.next()` is a uniform way of stepping
through any sequence, in-memory or not. The next few lessons wire an
Android database into that same shape.

## What Breaks Without This

Without a uniform iteration interface, code stepping through an
`ArrayList` and code stepping through a database result set would need
two entirely separate, custom traversal mechanisms, even though the
underlying problem — "give me the next element" — is identical.

## Exercises

1. Change `names` to hold a fourth entry and confirm the loop correctly
   prints all four without any other code change.
2. Explain, in your own words, why `iterator.hasNext()` is checked
   before every `iterator.next()` call, rather than only once before the
   loop starts.
3. Explain, in your own words, why decoupling "how to step through" from
   "how it's stored" is useful even for a sequence that will never
   change its underlying storage.

## Definition of Done

- [ ] You ran the `Iterator` example and saw the real, ordered output.
- [ ] You completed Exercise 1.
- [ ] You can state, without looking back at this lesson, what
      `hasNext()` and `next()` each do.
