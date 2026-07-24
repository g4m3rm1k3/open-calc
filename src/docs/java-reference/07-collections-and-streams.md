# Collections and Streams

`List`, `Set`, `Map`, `Iterator`, the `Collections` utility class, and
the Stream API — Java's standard-library toolkit for working with
groups of data. Every example on this page was compiled and run for
real.

---

## `List` — Ordered, Allows Duplicates, Resizable

Unlike a plain array (see
[01-syntax-basics.md](01-syntax-basics.md)), a `List` can grow and
shrink after creation.

```java
List<String> names = new ArrayList<>();
names.add("Charlie");
names.add("Alice");
names.add("Bob");
names.get(1);           // "Alice"
names.remove("Alice");
names.contains("Bob");   // true
names.size();             // 2
```

Real output:

```text
[Charlie, Alice, Bob]
get(1)=Alice
after remove: [Charlie, Bob]
contains Bob=true
size=2
```

`List<String>` is the **interface**; `ArrayList<String>` is the
concrete implementation actually being used — this "declare by
interface, construct the implementation" pattern is idiomatic Java,
letting code that only ever calls `List` methods swap implementations
later with no other changes.

---

## `Set` — No Duplicates, Unordered

```java
Set<String> uniqueNames = new HashSet<>();
uniqueNames.add("Alice");
uniqueNames.add("Bob");
uniqueNames.add("Alice");   // duplicate — silently ignored
uniqueNames.size();          // 2, not 3
```

Real output:

```text
size=2
contains Alice=true
```

A `HashSet` relies on `.equals()`/`.hashCode()` (see
[02-classes-and-objects.md](02-classes-and-objects.md)) to detect
duplicates — for your own classes, both must be correctly overridden
or a `HashSet` will silently treat genuinely-equal objects as distinct.

---

## `Map` — Key/Value Pairs

```java
Map<String, Integer> ages = new HashMap<>();
ages.put("Alice", 30);
ages.put("Bob", 25);
ages.get("Alice");                    // 30
ages.get("Nobody");                   // null — no exception
ages.getOrDefault("Nobody", -1);      // -1
ages.containsKey("Bob");              // true

for (Map.Entry<String, Integer> entry : ages.entrySet()) {
    System.out.println(entry.getKey() + " -> " + entry.getValue());
}
```

Real output:

```text
Alice's age=30
Unknown key=null
getOrDefault=-1
containsKey Bob=true
Bob -> 25
Alice -> 30
```

**Gotcha:** `.get()` on a missing key returns `null`, not an exception
— always check with `.containsKey(...)` or use `.getOrDefault(...)` if
a missing key is a real possibility, or a later `null` will surface as
a `NullPointerException` far from where the actual lookup happened.

**Gotcha:** a plain `HashMap`'s iteration order is **not guaranteed**
and can vary between runs — notice `Bob` printed before `Alice` above,
even though `Alice` was `put` first. Use `LinkedHashMap` if insertion
order needs to be preserved, or `TreeMap` for sorted-by-key order.

---

## `Iterator` — Safely Removing While Looping

Removing from a `List` with a plain `for`/enhanced-for loop while
iterating over it throws a real `ConcurrentModificationException`. The
safe way:

```java
List<Integer> numbers = new ArrayList<>(Arrays.asList(1, 2, 3, 4, 5));
Iterator<Integer> it = numbers.iterator();
while (it.hasNext()) {
    int n = it.next();
    if (n % 2 == 0) {
        it.remove();   // removes the element .next() just returned
    }
}
```

Real output: `after removing evens: [1, 3, 5]`

`it.remove()` is the *only* safe way to remove elements while actively
iterating — it exists specifically because the collection itself has
no safe way to know a removal happened mid-loop otherwise.

---

## The `Collections` Utility Class

Static helper methods (see
[09-static-final-and-nested-classes.md](09-static-final-and-nested-classes.md))
for common operations on any `List`:

```java
List<Integer> unsorted = new ArrayList<>(Arrays.asList(5, 3, 1, 4, 2));
Collections.sort(unsorted);      // [1, 2, 3, 4, 5]
Collections.reverse(unsorted);   // [5, 4, 3, 2, 1]
Collections.max(unsorted);        // 5
```

Real output:

```text
sorted=[1, 2, 3, 4, 5]
reversed=[5, 4, 3, 2, 1]
max=5
```

`Collections` (utility class, all `static` methods) is easy to confuse
with `Collection`/`Collections` the *interfaces* (`List`, `Set`, `Map`
all extend `Collection`) — different things sharing a very similar
name, a real, common source of confusion worth naming directly.

---

## Streams — Declarative Data Processing

A **stream** describes a pipeline of operations over a collection's
data, without you writing the loop yourself:

```java
List<String> words = Arrays.asList("apple", "banana", "kiwi", "fig", "cherry");

List<String> longWords = words.stream()
    .filter(w -> w.length() > 4)     // keep only words longer than 4 chars
    .map(String::toUpperCase)         // transform each into uppercase
    .sorted()                          // sort alphabetically
    .collect(Collectors.toList());    // gather back into a real List
```

Real output: `filtered/mapped/sorted=[APPLE, BANANA, CHERRY]`

- `.filter(Predicate<T>)` — keep only elements matching a condition
  (see [05-interfaces-and-lambdas.md](05-interfaces-and-lambdas.md)
  for `Predicate`).
- `.map(Function<T, R>)` — transform each element into something else.
- `.sorted()` — sort using natural ordering (or `.sorted(Comparator)`
  for custom ordering).
- `.collect(Collectors.toList())` — a stream is "used up" once — this
  is how you turn it back into a real, reusable `List`.

More stream operations:

```java
int totalLength = words.stream()
    .mapToInt(String::length)
    .sum();
```

Real output: `totalLength=24`

```java
Optional<String> longest = words.stream()
    .reduce((a, b) -> a.length() >= b.length() ? a : b);
```

Real output: `longest=banana`

`.reduce(...)` combines every element, two at a time, into one final
result — here, always keeping whichever of the two is longer.
`Optional<String>` (rather than a plain `String`) is returned because
`.reduce` on an *empty* stream would have nothing to return — `Optional`
forces the caller to consciously handle that case (via `.get()`,
`.orElse(...)`, or `.isPresent()`) rather than silently getting `null`.

```java
long count = words.stream()
    .filter(w -> w.startsWith("a") || w.startsWith("b"))
    .count();
```

Real output: `count starting a/b=2`

**Why use streams instead of a plain loop?** A stream pipeline reads as
a description of *what* result you want ("the uppercase, sorted,
long words") rather than *how* to compute it step by step — genuinely
clearer once you're used to the syntax, at the cost of being much less
obvious to someone seeing `.filter`/`.map`/`.collect` for the first
time, which is exactly why this page exists.
