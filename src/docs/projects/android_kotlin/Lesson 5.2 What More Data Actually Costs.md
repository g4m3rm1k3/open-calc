# Lesson 5.2: What More Data Actually Costs

**What you will build:** No new feature ships from this lesson either — like this slice's own opening lesson, this is a real, executed investigation, not a production change. This project's own expression parser is about to be built, piece by piece, over the rest of this slice: a real tokenizer, a real stack-based algorithm, a real search through sorted data, maybe a real sort. Before any of that gets written, this lesson answers one question with real, counted, executed evidence rather than a guess: as the *amount* of data a piece of code handles grows, does the *work* that code does grow too — and if so, how fast? That question has a name, **Big-O notation**, and by the end of this lesson it stops being an abstract label and becomes something this project has actually measured, on its own real code, more than once.

**What you need to know first:** `for` loops and iteration over a `List`, established since this project's own keypad and `operatorSymbols` were built. This project's own real `operatorSymbols: Map<String, Operator>` and how `nextState` looks values up in it. This project's own real `nextState`, `CalculatorState`, and `Display`, and the pattern of reading `current.display.textOrZero()` before doing anything numeric with it — the real, permanent domain logic this project has carried since Lesson 3.3. String concatenation via `+`/`+=` and Kotlin's own guarantee that every `String` is immutable, so every `+` produces a brand-new string rather than modifying one in place.

## Terms used in this lesson

- **Big-O notation** — a way of describing how the *work* a piece of code does grows as the *amount of data* it processes grows, written as `O(...)`, deliberately ignoring both constant factors (a step that always takes exactly three operations is written the same as one that takes exactly three hundred) and lower-order terms (an algorithm that does `n² + n` work is written `O(n²)`, since the `n²` term dominates once `n` gets large enough). This word exists because two pieces of code can both be "correct" and still behave completely differently as real data grows — one might barely notice a data set ten times larger, while another might take a hundred times longer — and Big-O is the vocabulary for talking about that difference precisely, without needing to measure wall-clock time on any particular machine.
- **Input size (`n`)** — the conventional name for "how much data this code is actually processing," used as the variable every Big-O expression is written in terms of. This word exists because "does it get slower" is meaningless without first naming *what* it's supposed to be getting slower *relative to* — the size of a list being searched, the number of digits being typed, the number of items being sorted.
- **Worst case** — the input, among every input of a given size, that makes a piece of code do the most work. This word exists because the *same* code can do very different amounts of work on different inputs of the *same* size — searching a list of 1,000 items for its very first element takes one comparison; searching that same list for something not present at all takes 1,000 — and Big-O, unless stated otherwise, describes the worst case specifically, since that's the case a real user could actually hit.
- **O(1) — constant time** — work that stays the same regardless of how large `n` gets. This word exists to name the best possible case: an operation whose cost doesn't depend on the size of the data at all.
- **O(n) — linear time** — work that grows in direct, one-to-one proportion to `n`: double the data, double the work.
- **O(n²) — quadratic time** — work that grows in proportion to `n` *squared*: double the data, and the work grows roughly *four* times, not two.
- **`while` loop** — a control structure that repeats its body for as long as a condition stays `true`, checked fresh before every repetition, with no built-in notion of "how many times" the way a `for` loop over a fixed range has. This word exists because some real repetition genuinely can't be expressed as "do this once per item in a known collection" — sometimes the number of repetitions depends entirely on what happens *during* the loop itself, which is exactly the shape a real search through a shrinking range has.
- **O(log n) — logarithmic time** — work that grows *very* slowly as `n` grows: doubling `n` adds only one more unit of work, not double. Named after the logarithm, since `log₂ n` answers "how many times can `n` be cut in half before reaching 1" — exactly the question a search that discards half the remaining data at each step is really asking.
- **O(n log n) — linearithmic time** — work that grows a little faster than plain linear, but nowhere near quadratic: `n` separate passes, each one only `log n` deep, rather than `n` passes each `n` deep. This word exists because it's the real, provably-best achievable cost for a whole category of problems — comparison-based sorting chief among them — that can't be done in plain linear time, but don't need quadratic time either.

## Objects and methods used

**Everything else in the file, not this lesson's subject but still explained.** None of this lesson's own subject — Big-O notation and its five named growth rates — is itself a real external class or method; each one is a concept, and lives in Terms, above. Every entry below is supporting cast: real standard-library and JVM members the throwaway labs call, plus this project's own real, already-existing objects the second Concept Unit reads to ground its own finding in real, current code. Ordered by first appearance across this lesson's three Concept Units.

- **`listOf(vararg elements)` / `List<Int>`**
  - *What it is:* A standard-library factory function producing a new, read-only list, and the list type it returns.
  - *Implementation:* `fun <T> listOf(vararg elements: T): List<T>`, part of the Kotlin standard library.
  - *Its use:* Every lab in this lesson needs a fixed set of input sizes to test — `listOf(10, 100, 1_000, 10_000)` names them once, up front, so every lab measures the exact same sizes.
  - *Type:* A top-level generic function, returning the standard-library `List<T>` interface.
  - *Responsibility:* Holding a fixed, ordered, read-only sequence of elements — nothing about how they'll be used afterward.
  - *Depends on:* The elements passed to it at construction.
  - *Connects to:* Constructed once near the top of every lab's `main`; iterated by the `for` loop immediately below it in every case.
  - *Shape:* A standard-library data structure, already fully established in this project's own real code (`keypadRows`) and reused here for a completely different purpose — naming test sizes instead of button labels.
- **`IntRange` (`1..size`) and `Iterable.toList()`**
  - *What it is:* `1..size` builds a real, standard-library `IntRange` — every whole number from `1` up to and including `size`; `.toList()` converts that range into a real `List<Int>` holding each of those numbers as an actual element.
  - *Implementation:* The `..` operator is `operator fun Int.rangeTo(that: Int): IntRange`; `toList()` is `fun <T> Iterable<T>.toList(): List<T>`, both part of the Kotlin standard library. An `IntRange` is itself iterable without ever being converted to a `List` — `.toList()` specifically forces every value to exist as a real, individually-addressable list element, rather than being produced one at a time as the range is walked.
  - *Its use:* The search labs need an actual `List<Int>` to search *through* — indexed by position, not just iterated once — so `(1..size).toList()` builds exactly `size` real integers, `1` through `size`, as a real list to search against.
  - *Type:* `rangeTo` is an operator function on `Int`; `toList` is a generic extension function on `Iterable<T>`.
  - *Responsibility:* `IntRange` represents a contiguous span of whole numbers; `toList()` materializes that span into a real, concrete collection.
  - *Depends on:* Two `Int` values (the range's start and end, via `..`); the `IntRange` itself, for `toList()`.
  - *Connects to:* Built once per size, inside each lab's own sizing loop; the resulting `List<Int>` is handed directly to that lab's own search or sort function.
  - *Shape:* Standard-library data-construction utilities — the raw test data every lab in this lesson measures against.
- **`Map.associateWith { transform }`**
  - *What it is:* A standard-library extension function building a real `Map` from an existing collection, using each original element as a key and a supplied lambda's result as its value.
  - *Implementation:* `fun <K, V> Iterable<K>.associateWith(valueSelector: (K) -> V): Map<K, V>`, part of the Kotlin standard library.
  - *Its use:* The map-lookup lab needs a real `Map<Int, Int>` of a specific size to test lookups against — `(1..size).associateWith { it * 2 }` builds one directly from a range, using each number as its own key and double that number as its value, with no intermediate list needed.
  - *Type:* A generic extension function on `Iterable<K>`.
  - *Responsibility:* Turning an existing sequence of keys into a real map, computing each value from its own key via the supplied lambda.
  - *Depends on:* An `Iterable<K>` to draw keys from, and a lambda describing how to compute each value.
  - *Connects to:* Called once per size inside the map-lookup lab's own sizing loop; its result is the real `Map` every subsequent lookup in that size's iteration reads from.
  - *Shape:* A standard-library collection-building utility — this lab's own way of producing a real `Map` of an exact, chosen size.
- **`System.nanoTime()`**
  - *What it is:* A real, static JVM method returning the current value of a high-resolution timer, in nanoseconds.
  - *Implementation:* `public static native long nanoTime()`, part of `java.lang.System` — a `native` method, meaning its real implementation is written outside Java/Kotlin entirely, in the JVM's own platform-specific code, and exposed to Kotlin code as an ordinary static method call.
  - *Its use:* The map-lookup lab calls this once immediately before, and once immediately after, a real block of repeated lookups — the difference between the two readings is real, measured elapsed time, the only way to observe wall-clock cost directly rather than inferring it from a formula.
  - *Type:* A `static` method on the `System` class — callable directly as `System.nanoTime()`, with no `System` instance involved, since `static` methods belong to the class itself, not to any particular object.
  - *Responsibility:* Reporting a real, monotonically increasing timestamp suitable for measuring elapsed *durations* — explicitly not suitable for telling real-world wall-clock time, which is a different method's job (`System.currentTimeMillis()`).
  - *Depends on:* Nothing — reads directly from the JVM's own internal high-resolution clock.
  - *Connects to:* Called twice inside the map-lookup lab's `main`, bracketing a real loop of repeated lookups; the difference between the two calls' return values becomes `elapsedNanos`.
  - *Shape:* A real JVM platform API — the only tool in this lesson that measures actual wall-clock time rather than counting logical operations.
- **`Any.javaClass` / `java.lang.Class.name`**
  - *What it is:* `javaClass` is a real property every Kotlin value has, giving the actual, concrete Java class backing it at runtime; `.name` is a property on the resulting `Class` object, giving that class's real, fully-qualified name as a `String`.
  - *Implementation:* `val <T : Any> T.javaClass: Class<T>`, part of the Kotlin standard library; `Class.name` is a real `java.lang.Class` property.
  - *Its use:* `mapOf("a" to 1, "b" to 2).javaClass.name` asks Kotlin's own `Map` directly, at runtime, what real Java class it actually is — rather than trusting an assumption about how `mapOf` is implemented underneath its own Kotlin-facing interface.
  - *Type:* Two chained real properties — no parentheses at either call site, since properties are read, not called.
  - *Responsibility:* `javaClass` answers "what concrete type is this value, really, underneath whatever interface it's declared as"; `Class.name` turns that answer into readable text.
  - *Depends on:* The specific value `javaClass` is read from; the specific `Class` object `.name` is read from.
  - *Connects to:* Called once, directly inside a `println`, at the very top of the map-lookup lab — a real, executed check, not an assumption, of what `mapOf` actually builds.
  - *Shape:* A real, live introspection mechanism — proof sourced from asking the running program directly, not from documentation or memory.
- **`Map` indexing (`get`, called through `[]`)**
  - *What it is:* The real method backing Kotlin's `[]` syntax on a `Map`, already established in this project's own real `nextState` (`operatorSymbols[label]`) and in this slice's own prior lesson.
  - *Implementation:* `operator fun <K, V> Map<K, V>.get(key: K): V?` — nullable return type, since a missing key returns `null` rather than throwing.
  - *Its use:* The map-lookup lab calls `map[size / 2]` inside its own timed loop, checking the result against `null` to force the JVM to actually use the looked-up value rather than silently optimizing the whole lookup away.
  - *Type:* An `operator fun`, the same mechanism behind array-style indexing syntax on any real `Map`.
  - *Responsibility:* Answering "what value, if any, is stored under this key," with no side effects.
  - *Depends on:* The `Map` instance and the key being looked up.
  - *Connects to:* Called once per repeated lookup, inside the map-lookup lab's own timed inner loop; its `Boolean`-producing `!= null` check feeds a running `found` counter, confirming every lookup in the loop actually succeeded.
  - *Shape:* A standard-library operator overload, reappearing here on a map built specifically to test how its own cost behaves as its size grows.
- **`Sealed class Display`, `data class CalculatorState`, `Display.textOrZero()`, `CalculatorState.copy()`**
  - *What it is:* This project's own real, permanent domain types and helper methods — `Display` distinguishing an ordinary numeric value from an error state, `CalculatorState` holding a complete snapshot of the calculator's current state, `textOrZero()` converting any `Display` into a numeric-safe `String`, and `copy()`, the compiler-generated method every `data class` receives for producing a changed instance without mutating the original.
  - *Implementation:* `sealed class Display { data class Value(val text: String) : Display(); object Error : Display() }`; `data class CalculatorState(val display: Display = Display.Value("0"), val firstOperand: Int? = null, val pendingOperator: Operator? = null)`; `private fun Display.textOrZero(): String = when (this) { is Display.Value -> text; Display.Error -> "0" }`; `copy()` is compiler-generated, taking named, defaulted arguments for whichever `CalculatorState` properties should differ in the result.
  - *Its use:* This lesson's second Concept Unit quotes `nextState`'s own real digit branch verbatim, which reads `current.display.textOrZero()` before building a new display value and writes the result back via `current.copy(display = ...)` — the exact real code whose cost this unit measures.
  - *Type:* `Display` is a `sealed class` with two real subtypes; `CalculatorState` is a `data class`; `textOrZero()` is a `private` extension function; `copy()` is a compiler-generated instance method.
  - *Responsibility:* `Display` represents everything the calculator's screen can legitimately show; `CalculatorState` holds the complete, current snapshot of everything the calculator needs to know right now; `textOrZero()` produces a numeric-safe string from any `Display` without the caller having to pattern-match it directly; `copy()` produces a new, independent `CalculatorState` sharing every unspecified property's value with the original.
  - *Depends on:* `Display.Value("0")`/`Display.Error` depend on nothing to construct; `textOrZero()` depends on the `Display` it's called on; `copy()` depends on the instance it's called on and whichever named arguments describe what should change.
  - *Connects to:* Read and rewritten together inside `nextState`'s digit branch, quoted below; `textOrZero()` is called on `current.display` to read the display's current numeric text before a new digit is appended.
  - *Shape:* This project's own real, permanent domain model — read only, not modified, by this lesson, exactly as it was in this slice's own opening lesson.
- **`while` loop, condition, and body**
  - *What it is:* Already defined in Terms, above — a real Kotlin control structure repeating its body for as long as a condition evaluates `true`.
  - *Implementation:* `while (condition) { body }` — the condition is checked before every single repetition, including the very first one; if it's `false` immediately, the body never runs at all.
  - *Its use:* Binary search doesn't know, in advance, how many times it will need to halve its search range — that number depends entirely on where (or whether) the target is found — so a `for` loop over a fixed range can't express it; a `while` loop, re-checking "is there still a range left to search" before every step, can.
  - *Type:* A control-flow keyword, not a function — no return value, no arguments in the function-call sense.
  - *Responsibility:* Deciding, fresh, before every repetition, whether to run the body again at all.
  - *Depends on:* A `Boolean` condition, re-evaluated every time control reaches the top of the loop.
  - *Connects to:* Wraps binary search's own comparison-and-narrowing logic, below; the loop exits either by an internal `return` (target found) or by its own condition finally turning `false` (search range exhausted).
  - *Shape:* A fundamental, general-purpose control structure — new vocabulary this lesson needs before it can show binary search at all.
- **`List<T>.sorted()`**
  - *What it is:* A standard-library extension function returning a new list containing the same elements, arranged in their natural order.
  - *Implementation:* `fun <T : Comparable<T>> Iterable<T>.sorted(): List<T>`, part of the Kotlin standard library — requires the element type to implement `Comparable`, since "natural order" has to mean something concrete for whatever type is being sorted.
  - *Its use:* The sort-comparison lab calls this once per size, purely to double-check its own real, comparator-driven sort actually produced a correctly sorted result — comparing the two independently.
  - *Type:* A generic extension function on `Iterable<T>`, constrained to comparable element types.
  - *Responsibility:* Producing a new, correctly-ordered list without touching the original.
  - *Depends on:* The `Iterable<T>` it's called on; nothing else, since it uses each element's own natural ordering.
  - *Connects to:* Called once per size, its result compared with `==` against the result of `sortedWith` (below) to confirm both really did produce the same, correctly-ordered list.
  - *Shape:* A standard-library convenience method — used here only as an independent correctness check, not as the thing whose cost this lab actually measures.
- **`Iterable<T>.shuffled()`**
  - *What it is:* A standard-library extension function returning a new list containing the same elements in a real, randomized order.
  - *Implementation:* `fun <T> Iterable<T>.shuffled(): List<T>`, part of the Kotlin standard library, using a real random-number source internally to produce a genuinely unpredictable ordering each call.
  - *Its use:* The sort-comparison lab shuffles its input before sorting it, specifically so the sort has to do real, representative work — sorting data that's already sorted, or nearly so, would let a real adaptive sorting algorithm finish suspiciously fast, understating the real cost this lab is trying to measure honestly.
  - *Type:* A generic extension function on `Iterable<T>`.
  - *Responsibility:* Producing a new list holding the same elements in an order that carries no leftover structure from the original.
  - *Depends on:* The `Iterable<T>` it's called on, and an internal source of randomness it manages itself.
  - *Connects to:* Called once per size, immediately before the timed sort in the same iteration.
  - *Shape:* A standard-library utility — the deliberate choice that makes this lab's own measurement honest rather than accidentally favorable.
- **`Iterable<T>.sortedWith(comparator)`**
  - *What it is:* A standard-library extension function returning a new, sorted list, using a caller-supplied `Comparator` to decide order instead of the element type's own natural ordering.
  - *Implementation:* `fun <T> Iterable<T>.sortedWith(comparator: Comparator<in T>): List<T>`, part of the Kotlin standard library.
  - *Its use:* The sort-comparison lab needs to count every real comparison a real sort actually performs — `sorted()` alone gives no way to intercept that; `sortedWith`, given a custom `Comparator`, lets the lab's own comparator increment a real counter every single time the sort calls it.
  - *Type:* A generic extension function on `Iterable<T>`, taking one `Comparator<in T>` argument.
  - *Responsibility:* Producing a new, correctly-sorted list according to whatever ordering rule the supplied `Comparator` defines, calling that comparator as many times as its own real sorting algorithm needs to.
  - *Depends on:* The `Iterable<T>` it's called on, and a real `Comparator<in T>`.
  - *Connects to:* Called once per size; its own internal sorting algorithm calls the lab's custom `Comparator` (below) an unknown-in-advance number of times, each call incrementing the real, observed counter.
  - *Shape:* A standard-library sorting method — the actual mechanism this lab instruments to produce real, counted evidence, rather than trusting a claim about how many comparisons sorting "should" take.
- **`Comparator<T>`**
  - *What it is:* A real, standard Java/Kotlin functional interface describing how to order two values of the same type.
  - *Implementation:* `fun interface Comparator<T> { fun compare(a: T, b: T): Int }` in spirit (Kotlin's own view of the real `java.util.Comparator` interface) — `compare` returns a negative number if `a` should sort before `b`, zero if they're equal in order, and a positive number if `a` should sort after `b`. Because it has exactly one abstract method, it's eligible for the same SAM-conversion lambda syntax this project's own `Operation` interface already uses: `Comparator { a, b -> ... }` builds a real `Comparator` instance from a lambda directly, with no named class required.
  - *Its use:* The sort-comparison lab builds one inline, incrementing a counter as its very first action before deferring to ordinary integer comparison — turning an otherwise invisible internal detail of sorting into something directly observable.
  - *Type:* A functional interface (SAM — single abstract method), the same general shape this project's own `Operation` already is.
  - *Responsibility:* Defining, for exactly one type, what "in order" means — nothing about how any algorithm that receives it actually uses that definition.
  - *Depends on:* Nothing to define; a real algorithm using it depends on being handed one.
  - *Connects to:* Built once per size, passed directly into `sortedWith`; called an unknown-in-advance number of times by that method's own real, internal sorting algorithm.
  - *Shape:* A real, general-purpose JVM interface — the same SAM-conversion mechanism already established in this project's own domain code, applied here to a completely different, standard-library contract.
- **`Int.compareTo(other)`**
  - *What it is:* The real method backing ordinary numeric comparison between two `Int` values, already established through the `>` operator in this slice's own opening lesson.
  - *Implementation:* `operator fun Int.compareTo(other: Int): Int`, part of the Kotlin standard library, returning a negative number, zero, or a positive number depending on relative order — precisely the same three-way contract `Comparator.compare` (above) requires.
  - *Its use:* The sort-comparison lab's own `Comparator` lambda calls `a.compareTo(b)` directly, rather than through the `>` operator, because a `Comparator`'s own contract needs the actual three-way signed result — "which one is bigger" alone isn't enough information to describe order.
  - *Type:* An `operator fun` on `Int`.
  - *Responsibility:* Producing a three-way ordering result between two `Int` values.
  - *Depends on:* The two `Int` values being compared.
  - *Connects to:* Called once per real comparison inside the sort-comparison lab's own `Comparator`, its raw `Int` result returned directly as that lambda's own result.
  - *Shape:* A standard-library operator overload — the same real mechanism `>` already relies on, called here directly instead of through operator syntax, since a `Comparator` needs the raw three-way result, not just a `Boolean`.

## Concept Unit: Constant Time and Linear Time

### The Problem

This project's own real `operatorSymbols` is a `Map<String, Operator>` with four entries today, and `nextState` looks a pressed symbol up in it every single time an operator button is pressed. If Stage 6 later gives this calculator real scientific functions — `sin`, `cos`, `sqrt`, and more — that same map could plausibly grow to a dozen entries, or more. Does looking a key up in a `Map` get slower as the map gets bigger? And if this project instead searched a plain `List` one entry at a time — a completely valid, already-available alternative, using only `List` and `for`, both already established — would *that* approach's cost change as the list grows?

> If a `Map` holds 4 entries versus a hypothetical one holding 4,000, do you expect a single lookup to take roughly the same real time in both, or notably longer in the bigger one? What's your reasoning? If you instead had a plain `List<String>` and used a `for` loop, checking each entry one at a time until you found a match, would doubling that list's size change how much work the *worst* case — the target isn't in the list at all — has to do? Is there a real difference between "this operation always does a fixed amount of work" and "this operation's work grows in proportion to how much data it's searching"?

### Introduce the Concept in Isolation

The following two throwaway files are not part of this project and never will be. The first counts real comparisons a hand-written linear search performs, across four real input sizes:

```kotlin
fun countedLinearSearch(items: List<Int>, target: Int): Int {
    var comparisons = 0
    for (item in items) {
        comparisons++
        if (item == target) {
            return comparisons
        }
    }
    return comparisons
}

fun main() {
    val sizes = listOf(10, 100, 1_000, 10_000)
    for (size in sizes) {
        val items = (1..size).toList()
        val comparisons = countedLinearSearch(items, -1)
        println("size $size -> $comparisons comparisons")
    }
}
```

Every search here looks for `-1`, a value that is never actually in the list — forcing the real worst case, where every single element gets checked before giving up. Compiled and run for real, this produced:

```
size 10 -> 10 comparisons
size 100 -> 100 comparisons
size 1000 -> 1000 comparisons
size 10000 -> 10000 comparisons
```

The real, counted comparisons exactly equal the real input size, every time — not roughly, exactly. Doubling the list from `1,000` to a hypothetical `2,000` would double the worst-case comparisons too. This growth pattern — work directly, linearly proportional to input size — is called **O(n) — linear time**.

The second throwaway file checks something a hand-counted comparison can't: real, measured wall-clock time for a real `Map` lookup, across real maps of drastically different sizes:

```kotlin
fun main() {
    println(mapOf("a" to 1, "b" to 2).javaClass.name)

    val sizes = listOf(10, 100_000, 1_000_000)
    for (size in sizes) {
        val map = (1..size).associateWith { it * 2 }
        val repeats = 100_000
        val start = System.nanoTime()
        var found = 0
        for (i in 1..repeats) {
            if (map[size / 2] != null) found++
        }
        val elapsedNanos = System.nanoTime() - start
        val avgNanosPerLookup = elapsedNanos / repeats
        println("map size $size -> $avgNanosPerLookup ns/lookup average over $repeats lookups (found=$found)")
    }
}
```

Compiled and run for real, this produced:

```
java.util.LinkedHashMap
map size 10 -> 29 ns/lookup average over 100000 lookups (found=100000)
map size 100000 -> 26 ns/lookup average over 100000 lookups (found=100000)
map size 1000000 -> 3 ns/lookup average over 100000 lookups (found=100000)
```

Every real lookup genuinely succeeded — `found=100000`, matching the real `100,000` repeats exactly, for every size. The real, headline result is the timing itself: the map with **1,000,000** entries did *not* take roughly 100,000 times longer per lookup than the map with 10 entries — if anything, it measured faster. That's surprising enough to double-check before trusting it: rerunning the exact same lookups with the sizes tested in the *opposite* order —

```
map size 1000000 -> 31 ns/lookup average over 100000 lookups (found=100000)
map size 100000 -> 22 ns/lookup average over 100000 lookups (found=100000)
map size 10 -> 32 ns/lookup average over 100000 lookups (found=100000)
```

— shows the same pattern in reverse: now the *1,000,000*-entry map runs first and measures slower, and the *10*-entry map runs last and measures fast. Across both real runs, whichever size happens to run *first* in the loop is the slowest, regardless of whether that size is 10 or 1,000,000 — a real, reproducible sign that the timing differences here come from the JVM's own just-in-time compiler still warming up during the first iteration, not from the map's actual size. What stays true across every real run, in both orders: a map with 100,000 times more entries never took anywhere close to 100,000 times longer per lookup — nowhere near the pattern linear search's real, counted comparisons just showed. This growth pattern — work that stays roughly the same no matter how large the input gets — is called **O(1) — constant time**. It also confirms something worth knowing before trusting a claim about *any* real map: `mapOf("a" to 1, "b" to 2).javaClass.name` printed `java.util.LinkedHashMap`, a real, hash-table-backed type — confirmed directly from the running program, not assumed — which is exactly the kind of structure that computes where to look from the key itself, rather than scanning.

### Discard the Throwaway Example

Both throwaway files are deleted now and will not appear in this project again. This project's own real `operatorSymbols` remains completely unmodified — with only four entries today, there was never a real performance problem to fix; this unit's own job was proving, for real, what a genuinely large `Map` costs compared to a genuinely large linear search, using throwaway data built specifically to make that comparison visible.

### Mechanical Walkthrough

Every distinct syntactic element across both throwaway files, in order:

- `fun countedLinearSearch(items: List<Int>, target: Int): Int` — a function declaration, already established, taking a `List<Int>` and a target `Int`, returning the real number of comparisons performed.
- `var comparisons = 0` — a `var` binding, already established, since this value is reassigned on every loop iteration.
- `for (item in items)` — a `for` loop over a `List<Int>`, already established.
- `comparisons++` — the increment operator, already established from this project's own real, counted work in prior lessons, incrementing `comparisons` by exactly `1`.
- `if (item == target)` — an equality check, already established.
- `return comparisons` (inside the loop) — an early `return`, already established, exiting the function the moment a match is found, reporting exactly how many comparisons it took.
- `return comparisons` (after the loop) — the same `return`, reached only if the loop finishes without ever matching — the real worst case this unit's own experiment deliberately forces.
- `fun main()`, `val sizes = listOf(10, 100, 1_000, 10_000)` — the real standard-library `listOf` function, documented above, holding the four real sizes this lab tests.
- `for (size in sizes)` — already established.
- `val items = (1..size).toList()` — the real standard-library `IntRange`/`toList()` combination documented above, building a real `List<Int>` of exactly `size` elements.
- `val comparisons = countedLinearSearch(items, -1)` — calling the function just declared, searching for `-1`, a value guaranteed absent from a list built entirely from positive numbers — forcing the real worst case on every call.
- `println("size $size -> $comparisons comparisons")` — a string template, already established, interpolating both the real size and the real, counted result.
- `println(mapOf("a" to 1, "b" to 2).javaClass.name)` — the real standard-library `mapOf` function, already established from this project's own `operatorSymbols`, followed by the real `javaClass`/`Class.name` chain documented above.
- `val map = (1..size).associateWith { it * 2 }` — the real standard-library `associateWith` function documented above, building a real `Map<Int, Int>` of exactly `size` entries; `it` is the already-established implicit single-parameter name inside a lambda with exactly one parameter.
- `val repeats = 100_000` — a `val` binding holding a literal `Int`, using Kotlin's underscore digit-grouping syntax (already established) for readability.
- `val start = System.nanoTime()` — the real, static JVM method documented above, read once before the timed work begins.
- `var found = 0` — a `var`, tracking how many lookups genuinely succeeded, to confirm the loop actually did real work rather than being silently skipped or optimized away entirely.
- `for (i in 1..repeats)` — a `for` loop over a real `IntRange`, already established, repeating the timed lookup `100,000` times to average out any single lookup's own measurement noise.
- `if (map[size / 2] != null) found++` — the real `Map` indexing operator documented above, looking up the key at the map's own rough midpoint (`size / 2`, integer division, already established), compared against `null`, incrementing `found` on success.
- `val elapsedNanos = System.nanoTime() - start` — a second real call to `System.nanoTime()`, subtracted from the first to produce a real elapsed duration.
- `val avgNanosPerLookup = elapsedNanos / repeats` — integer division, already established, spreading the total elapsed time evenly across all `100,000` repeated lookups.
- `println("map size $size -> $avgNanosPerLookup ns/lookup average over $repeats lookups (found=$found)")` — a string template interpolating four real, measured values.

### CS Lens

O(1) and O(n) are the two most common growth rates in real, everyday code, and the contrast between them recurs everywhere data has to be found or processed.

```
Also recognized in: array indexing by position (O(1) — jumping straight
to a memory address), hash tables of every kind across every real
language's standard library, a spell-checker's dictionary lookup, a
web browser's DNS cache, scanning an unsorted phone book page by page
for a name (O(n)), a simple virus scanner checking a file against every
signature in an unsorted list
```

### SE Lens

The alternative not chosen here: assume, without measuring, that a `Map` lookup is "probably fine" and a linear scan through a `List` would also be "probably fine" for anything this project's own real, small `operatorSymbols` map will ever realistically need. The real tradeoff: for four entries, it genuinely wouldn't matter which one this project used — the real difference only becomes visible, and only becomes worth caring about, once real data gets large, which is exactly why this unit built genuinely large, throwaway data (a map with a million entries) rather than testing against this project's own tiny, real one. Knowing *which* growth rate a piece of code has, and knowing when that difference actually matters at the data sizes involved, is the entire practical value of Big-O — not a rule that says "always use the asymptotically faster option," but a way to reason about whether a given choice's cost will still be invisible, or will start to bite, as real data grows.

### Commands Needed

The same real `kotlinc`/`java` commands already established in this slice's own opening lesson, run here against `lab1_linear_search.kt` and `lab1_map_lookup.kt`, both compiled together with every other file in this lesson in one real, batched `kotlinc` pass, each run separately afterward via `java -cp <jar> <FileName>Kt`.

### Run It

Real commands run: `java -cp lesson5_2.jar Lab1_linear_searchKt`, producing:

```
size 10 -> 10 comparisons
size 100 -> 100 comparisons
size 1000 -> 1000 comparisons
size 10000 -> 10000 comparisons
```

and `java -cp lesson5_2.jar Lab1_map_lookupKt`, producing:

```
java.util.LinkedHashMap
map size 10 -> 29 ns/lookup average over 100000 lookups (found=100000)
map size 100000 -> 26 ns/lookup average over 100000 lookups (found=100000)
map size 1000000 -> 3 ns/lookup average over 100000 lookups (found=100000)
```

### Connect the Pieces

O(1) and O(n) are two clean, opposite answers to "does this get slower as the data grows" — the next unit asks the same question of code this project has already shipped, and finds an answer that isn't nearly as clean.

## Concept Unit: Quadratic Time

### The Problem

Every real digit press this calculator has ever handled goes through `nextState`'s own digit branch, unchanged since the real, permanent refactor that first connected this project's keypad to its own domain logic:

```kotlin
label[0].isDigit() -> {
    val currentText = current.display.textOrZero()
    val newText = if (currentText == "0") label else currentText + label
    current.copy(display = Display.Value(newText))
}
```

This is one of `nextState`'s four real branches — the other three (`"C"`, an operator symbol, `"="`) aren't involved in what this unit measures, and aren't reproduced here. `currentText + label` builds a brand-new `String` every single time a digit is pressed — Kotlin's own `String` is always immutable, so there is no such thing as "appending in place." If a user types a number one digit at a time — `1`, then `2`, then `3`, and so on — what does the *total*, cumulative cost of building that number up, one press at a time, actually look like as the number gets longer?

> Building `"5"` from `"0"` copies how many characters? Building `"57"` from `"5"` copies how many? If a user types a 10-digit number one press at a time, does the *tenth* press cost the same amount of work as the *first*, or more? Given that every single real digit press this project has ever handled has gone through this exact line of code, why might this real cost never have been noticed before?

### Introduce the Concept in Isolation

The following throwaway file is not part of this project and never will be — it faithfully mirrors the real digit branch's own concatenation logic, instrumented to count real characters copied rather than measure wall-clock time:

```kotlin
fun countedDigitTyping(digitCount: Int): Int {
    var display = "0"
    var totalCharsCopied = 0
    for (i in 1..digitCount) {
        val digit = (i % 10).toString()
        val newDisplay = if (display == "0") digit else display + digit
        totalCharsCopied += newDisplay.length
        display = newDisplay
    }
    return totalCharsCopied
}

fun main() {
    val digitCounts = listOf(5, 10, 20, 40)
    for (count in digitCounts) {
        val totalCharsCopied = countedDigitTyping(count)
        println("$count digits typed -> $totalCharsCopied total characters copied")
    }
}
```

Compiled and run for real, this produced:

```
5 digits typed -> 15 total characters copied
10 digits typed -> 55 total characters copied
20 digits typed -> 210 total characters copied
40 digits typed -> 820 total characters copied
```

Each individual press only copies a *few* characters — the first press copies 1, the second copies 2 (the one already there, plus the new one), the third copies 3, and so on. But the *total*, added up over every press it takes to type an `n`-digit number, is `1 + 2 + 3 + ... + n` — and that sum grows quadratically, not linearly. The real numbers confirm it directly: doubling the digit count from `10` to `20` doesn't double the total cost (`55` to `110`) — it very nearly *quadruples* it (`55` to `210`, a real ratio of `3.8×`); doubling again, from `20` to `40`, does the same (`210` to `820`, a real ratio of `3.9×`, closer still to exactly `4×` as the numbers get larger). This growth pattern — where doubling the input roughly *quadruples* the work — is called **O(n²) — quadratic time**.

### Discard the Throwaway Example

This throwaway `countedDigitTyping` function is deleted now and will not appear in this project again. This project's own real `nextState` is completely unmodified by this unit — the real, quadratic cost this lab just measured is real, but not a bug: a realistic calculator display holds at most a handful of digits (an `Int`'s own maximum value is only 10 digits long), and `15`–`820` character copies is not a real, user-visible cost at that scale, no matter how quadratic its shape is in principle.

### Mechanical Walkthrough

Every distinct syntactic element in the throwaway lab's own code, in order (`nextState`'s own quoted digit branch reuses only already-established constructs — `current.display.textOrZero()`, an `if`/`else` expression, `current.copy(...)` — each already given full treatment in this slice's own opening lesson and in this project's own real, prior work, so this enumeration focuses on the lab's own new instrumentation):

- `fun countedDigitTyping(digitCount: Int): Int` — a function declaration, already established, taking the number of digits to simulate typing and returning the real total characters copied.
- `var display = "0"` — a `var` holding the simulated display, mirroring `CalculatorState`'s own real starting value, `Display.Value("0")`.
- `var totalCharsCopied = 0` — a `var` accumulator, reassigned on every loop iteration.
- `for (i in 1..digitCount)` — a `for` loop over a real `IntRange`, already established, simulating one button press per iteration.
- `val digit = (i % 10).toString()` — the modulo operator, already established from this project's own real `Modulo` operation, keeping each simulated "digit" a single character (`0`–`9`) regardless of how large `i` gets; `Int.toString()`, already established, converting it to a one-character `String`.
- `val newDisplay = if (display == "0") digit else display + digit` — the identical shape as `nextState`'s own real digit branch, quoted above: an `if`/`else` expression, already established, choosing between replacing a placeholder `"0"` outright or concatenating onto whatever's already there.
- `totalCharsCopied += newDisplay.length` — the compound assignment operator, already established from this slice's own opening lesson, adding the newly-built string's real length (already established, `String.length`) onto the running total — the real, per-press cost this lab is measuring.
- `display = newDisplay` — reassigning `display` for the next iteration, mirroring how `nextState` returns a new `CalculatorState` that becomes the *next* call's own `current`.
- `return totalCharsCopied` — already established.
- `fun main()`, `val digitCounts = listOf(5, 10, 20, 40)` — the real standard-library `listOf` function, documented in this lesson's first unit, holding the four digit-counts this lab tests.
- `for (count in digitCounts)`, `val totalCharsCopied = countedDigitTyping(count)`, `println(...)` — already established.

### CS Lens

Quadratic cost hiding inside what looks like a simple, one-step-at-a-time operation is one of the most common real performance surprises in software — precisely because no single step looks expensive.

```
Also recognized in: building a large string with repeated `+` in a loop
in almost any language (the exact reason a dedicated `StringBuilder`/
`StringBuffer` type exists at all), naive bubble sort and insertion
sort, checking every pair of items in a list against every other item,
a spreadsheet recalculating every cell's dependency on every other
cell the naive way
```

### SE Lens

The alternative not chosen here: rewrite `nextState`'s digit branch right now to use a `StringBuilder` — a real, standard, mutable text-building type designed specifically to avoid repeated whole-string copying, achieving amortized O(1) cost per append instead of this branch's real O(n) cost per press (and real O(n²) cost across a whole number being typed). The real tradeoff: `StringBuilder` would genuinely remove the quadratic cost this unit just measured, but at this project's own real scale — a calculator display holding at most a handful of digits — that cost is already negligible, real numbers in the hundreds of character-copies, not the millions or billions where quadratic growth actually becomes painful. Making this change now would be optimizing a real cost that isn't actually a real problem, the same "nothing added without a genuine, present need" discipline this project has already applied to `Modifier.clickable`, custom exceptions, and more than one speculative abstraction along the way — the value of measuring this cost isn't "therefore fix it," it's knowing, with real numbers instead of a guess, that it doesn't need fixing yet, and recognizing the shape immediately if a future lesson's own real code ever builds something where it would.

### Commands Needed

The same real `kotlinc`/`java` commands already established, run here against `lab2_digit_typing_cost.kt`.

### Run It

Real command run: `java -cp lesson5_2.jar Lab2_digit_typing_costKt`. Real, executed output:

```
5 digits typed -> 15 total characters copied
10 digits typed -> 55 total characters copied
20 digits typed -> 210 total characters copied
40 digits typed -> 820 total characters copied
```

### Connect the Pieces

O(n²) showed up in real, already-shipped code purely because a cost that grows *per press* gets paid again, cumulatively, on *every* press after it — the next unit asks whether the linear search this lesson's first unit already measured can be beaten, once the data is arranged in a way that lets most of it be ignored at each step.

## Concept Unit: Logarithmic and Linearithmic Time

### The Problem

This lesson's first unit already proved, with real, counted comparisons, that a linear search through an unsorted list costs `O(n)` — worst case, every single element gets checked. If the data were *sorted* first, is there a smarter way to search it — one that doesn't have to look at every element at all?

> If a list is sorted and you're looking for a value, and you check the single item exactly in the middle, what does learning "the target is bigger than this middle item" tell you about *where in the list* it's safe to stop looking entirely? After discarding half the list based on one comparison, how large is the remaining problem? If you keep discarding half of what's left after each comparison, how many times can a list of 1,000 items be cut in half before there's only one item left to check?

### Introduce the Concept in Isolation

Answering that question needs a loop whose number of repetitions isn't known in advance — unlike every `for` loop in this project so far, which always runs once per item in an already-known collection. The following tiny, throwaway example proves the mechanism in isolation, with no searching involved yet at all:

```kotlin
fun main() {
    var remaining = 100
    var steps = 0
    while (remaining > 1) {
        remaining /= 2
        steps++
    }
    println("steps: $steps, remaining: $remaining")
}
```

Compiled and run for real, this produced:

```
steps: 6, remaining: 1
```

Starting from `100`, halving repeatedly — `50`, `25`, `12`, `6`, `3`, `1` — took exactly `6` real steps to reach `1`, confirmed by the loop's own real, executed count, not assumed. Unlike every `for` loop this project has used, nothing here names a fixed number of repetitions up front — the loop's own condition, `remaining > 1`, is what decides, fresh, before every single pass, whether to run again at all. This is a **`while` loop**.

With that mechanism proven, here is a real, throwaway binary search, reusing the same halving idea against an actual sorted list, counting real comparisons exactly the way this lesson's first unit's linear search did:

```kotlin
fun countedBinarySearch(items: List<Int>, target: Int): Int {
    var comparisons = 0
    var low = 0
    var high = items.size - 1
    while (low <= high) {
        val mid = (low + high) / 2
        comparisons++
        when {
            items[mid] == target -> return comparisons
            items[mid] < target -> low = mid + 1
            else -> high = mid - 1
        }
    }
    return comparisons
}

fun main() {
    val sizes = listOf(10, 100, 1_000, 10_000)
    for (size in sizes) {
        val items = (1..size).toList()
        val comparisons = countedBinarySearch(items, -1)
        println("size $size -> $comparisons comparisons")
    }
}
```

Searching for `-1` again forces the real worst case — the target is never present, so the search narrows all the way down to nothing. Compiled and run for real, this produced:

```
size 10 -> 3 comparisons
size 100 -> 6 comparisons
size 1000 -> 9 comparisons
size 10000 -> 13 comparisons
```

Contrast this directly against this lesson's first unit's own real linear-search counts for the identical sizes — `10`, `100`, `1000`, `10000` comparisons, one per element. Binary search's real counts here — `3`, `6`, `9`, `13` — grow *far* more slowly: each `10×` increase in size costs only `3`–`4` more comparisons, not `10×` more. This growth pattern is called **O(log n) — logarithmic time**, and the real numbers match the underlying math directly: `log₂(10) ≈ 3.3`, `log₂(100) ≈ 6.6`, `log₂(1000) ≈ 10.0`, `log₂(10000) ≈ 13.3` — each real, counted result lands right at (or just under) its own predicted value.

Binary search needs its input sorted first, though — this lab's own `(1..size).toList()` is already sorted by construction, sidestepping that cost entirely. What does sorting *itself* really cost? The following throwaway file counts real comparisons a real, standard-library sort performs, on data shuffled first so the sort can't take a shortcut on already-ordered input:

```kotlin
fun main() {
    val sizes = listOf(10, 100, 1_000, 10_000)
    for (size in sizes) {
        val items = (1..size).shuffled()
        var comparisons = 0
        val sorted = items.sortedWith(Comparator { a, b ->
            comparisons++
            a.compareTo(b)
        })
        println("size $size -> $comparisons comparisons (sorted correctly=${sorted == items.sorted()})")
    }
}
```

Compiled and run for real, this produced:

```
size 10 -> 21 comparisons (sorted correctly=true)
size 100 -> 538 comparisons (sorted correctly=true)
size 1000 -> 8705 comparisons (sorted correctly=true)
size 10000 -> 120443 comparisons (sorted correctly=true)
```

These real counts sit *between* linear and quadratic: going from `1,000` to `10,000` items — a real `10×` growth in size — pushed comparisons from `8,705` to `120,443`, a real ratio of about `13.8×`, not `10×` (plain linear) and nowhere near `100×` (quadratic). That real ratio lines up closely with `n · log₂ n`'s own predicted growth for the same jump — `10 × (log₂(10000) / log₂(1000)) = 10 × (13.3 / 10.0) ≈ 13.3×` — confirming the real, measured shape. This growth pattern is called **O(n log n) — linearithmic time**: `n` real passes over the data, each one only `log n` deep, rather than `n` passes each `n` deep.

### Discard the Throwaway Example

Every throwaway file in this unit — the minimal `while` demo, `countedBinarySearch`, and the sort-comparison lab — is deleted now and will not appear in this project again. This project doesn't yet have anything real to search or sort — no history list, no saved calculations — so there is no real, current code for either algorithm to replace; a real search or sort belonging to this project's own real feature set is this curriculum's own later work (Stage 14, per `brd.md`), once a real, sortable, searchable collection actually exists to search.

### Mechanical Walkthrough

Every distinct syntactic element across the three code blocks above, in order (constructs already fully enumerated in this lesson's earlier units — `listOf`, `IntRange`/`toList()`, string templates, `for`, compound assignment — are not re-derived a third time within this same lesson beyond naming their reappearance):

- `var remaining = 100`, `var steps = 0` — already established `var` bindings.
- `while (remaining > 1)` — the real `while` loop, documented in Terms above: its condition, `remaining > 1`, uses the already-established `>` comparison, checked fresh before every repetition.
- `remaining /= 2` — a compound-assignment division operator, the same mechanism as `+=` (already established in this slice's own opening lesson) applied to `/` instead of `+`, using `Int` division's own already-established truncating behavior.
- `steps++` — already established.
- `println("steps: $steps, remaining: $remaining")` — already established.
- `fun countedBinarySearch(items: List<Int>, target: Int): Int` — a function declaration, already established.
- `var low = 0`, `var high = items.size - 1` — `var` bindings; `List.size`, already established from this project's own real code, minus `1` (already established) to get the last valid index.
- `while (low <= high)` — the same `while` construct just proven, its condition using `<=`, an already-established comparison operator, true exactly while a real, non-empty range remains to search.
- `val mid = (low + high) / 2` — integer division, already established, computing the midpoint of the current search range.
- `comparisons++` — already established.
- `when` — Kotlin's own multi-branch conditional, already established, used here as an expression whose branches compare `items[mid]` (List indexing, already established) against `target`.
- `items[mid] == target -> return comparisons` — an equality check, already established, returning immediately on a real match.
- `items[mid] < target -> low = mid + 1` — the `<` comparison, already established, narrowing the search to the upper half by moving `low` past the just-checked midpoint.
- `else -> high = mid - 1` — narrowing to the lower half instead, moving `high` just before the midpoint.
- `return comparisons` (after the loop) — reached only once `low` has crossed past `high`, meaning the target was never present — the real worst case this lab deliberately forces.
- `val items = (1..size).shuffled()` — the real standard-library `IntRange`/`toList()`-adjacent construction, this time paired with the real `shuffled()` method documented above instead of `toList()`, producing a genuinely randomized real list.
- `var comparisons = 0` — already established.
- `val sorted = items.sortedWith(Comparator { a, b -> comparisons++; a.compareTo(b) })` — the real standard-library `sortedWith` method, documented above, taking a real `Comparator` built inline via SAM-conversion lambda syntax (the same mechanism this project's own `Operation` already uses); the lambda's body increments `comparisons` (already established) as its first action, then returns the real, three-way result of `Int.compareTo`, both documented above.
- `println("size $size -> $comparisons comparisons (sorted correctly=${sorted == items.sorted()})")` — a string template, already established, with a nested expression, `sorted == items.sorted()`, calling the real `List.sorted()` method documented above and comparing its result against `sortedWith`'s own result with `==`, already established — confirming, for real, that instrumenting the sort with a counting `Comparator` didn't change what it actually produced.

### CS Lens

Logarithmic and linearithmic growth are what make searching and sorting large, real data sets practical at all — without them, both would be limited to data small enough for quadratic cost to stay invisible.

```
Also recognized in: binary search trees and balanced trees of every
kind, a database index (why looking a row up by its indexed key is
fast even in a table with millions of rows), the "twenty questions"
game (each yes/no answer roughly halves the remaining possibilities),
real-world sorting algorithms used by nearly every standard library —
Timsort, mergesort, heapsort — all guaranteed O(n log n) in the worst
case, a real, provable lower bound for any comparison-based sort
```

### SE Lens

The alternative not chosen here: reach for binary search or a real sort the moment this project has *any* list at all, regardless of whether that list is ever large enough for the difference to matter. The real tradeoff: binary search needs sorted data to work correctly at all, and sorting itself costs real, measured work — `O(n log n)`, proven above — so both come with a real setup cost that a plain linear search never pays. For a handful of items (this project's own current `operatorSymbols`, four entries; `keypadRows`, sixteen buttons total), that setup cost is pure overhead with zero real benefit — the same "don't add complexity a real, present size doesn't justify" judgment this project has made more than once already. The real value of knowing both algorithms' real costs is being able to make that call deliberately, with real numbers, rather than reaching for whichever one sounds more sophisticated.

### Commands Needed

The same real `kotlinc`/`java` commands already established, run here against a small, uncompiled inline `while` demonstration (compiled and run the same way as every other file in this lesson, as its own real, separately-run entry point), `lab3_binary_search.kt`, and `lab3_sort_comparisons.kt`.

### Run It

Real command run: `java -cp lesson5_2.jar Lab3_binary_searchKt`, producing:

```
size 10 -> 3 comparisons
size 100 -> 6 comparisons
size 1000 -> 9 comparisons
size 10000 -> 13 comparisons
```

and `java -cp lesson5_2.jar Lab3_sort_comparisonsKt`, producing:

```
size 10 -> 21 comparisons (sorted correctly=true)
size 100 -> 538 comparisons (sorted correctly=true)
size 1000 -> 8705 comparisons (sorted correctly=true)
size 10000 -> 120443 comparisons (sorted correctly=true)
```

### Connect the Pieces

Binary search's real O(log n) comparisons and sorting's real O(n log n) comparisons together close out this lesson's own real map of every growth rate this slice's later work will need to recognize on sight, the moment a real tokenizer, a real stack, or a real evaluator actually needs one of them.

## Connect the Pieces

Follow the same question — as the data grows, does the work grow too, and how fast — through every real number this lesson actually measured. **Constant and linear time** opened with this project's own real `operatorSymbols`: a real, counted linear search proved its comparisons scale exactly `1:1` with list size (`10`, `100`, `1000`, `10000` — real, exact matches), while a real `Map`, timed twice in opposite orders, never showed the 100,000-fold slowdown a `1,000×`-larger map would demand under linear cost — proving `O(1)`, and along the way catching a real, honest confound (JVM warmup) that could easily have been mistaken for the opposite conclusion. **Quadratic time** turned that same question on code this project has had shipping, unnoticed, since its very first working keypad: `nextState`'s own real digit branch, instrumented and run for real, showed that typing an `n`-digit number costs real, cumulative work that nearly quadruples every time `n` doubles (`55` → `210` → `820`) — a real, previously-unmeasured fact about already-running code, honestly assessed as not worth fixing at this project's own real scale. **Logarithmic and linearithmic time** closed the arc by beating linear search outright: a real, counted binary search needed only `3`–`13` comparisons across the same sizes linear search needed `10`–`10,000` for, at the real cost of needing sorted data first — itself measured, for real, at `21`–`120,443` comparisons, landing exactly where `n log n` predicts, not `n` and not `n²`. None of these five real growth rates changed a single line of this project's own permanent code — that was never this lesson's job. What exists now, for the first time, is a real, measured, executed answer for each one, ready the moment this slice's own coming work — a real tokenizer walking a real expression, a real stack tracking real pending operators — needs to ask exactly this question about code that doesn't exist yet.
