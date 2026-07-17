---
concept: 200-streams-api
name: Streams API (Java)
---

## Definition

The Streams API provides a functional-style pipeline for processing
sequences of elements — chaining operations like `filter`, `map`, and
`collect` to transform a collection declaratively, without writing
explicit loops or intermediate accumulator variables.

## Problem

Processing a collection with a traditional imperative loop (filter some
elements, transform the rest, collect into a new list) requires manually
managing an accumulator, a loop, and conditional logic all mixed together
— verbose and imperative. Streams express the SAME transformation as a
declarative CHAIN of operations, each doing one clear thing, closely
mirroring how the transformation would be described in plain English.

## Execution

A list of numbers is turned into a stream
↓
Filtering keeps only even numbers, mapping squares each, collecting
gathers the results into a new list
↓
Streams are LAZY — `filter` and `map` don't actually run anything until a
TERMINAL operation (`collect`, `forEach`, `sum`, etc.) is called; they
just build up a pipeline description
↓
The final result contains only the squares of the even numbers

## Computer Science

Streams are a Java-specific instance of the general map/filter/reduce
pattern (see Higher-Order Functions) — the LAZY, chained pipeline
structure means intermediate operations (`filter`, `map`) describe WHAT
should happen without immediately doing it, and the whole pipeline only
actually executes once a terminal operation triggers it, processing each
element through the ENTIRE chain before moving to the next (rather than
materializing a full intermediate list after each step).

Tags: Lazy evaluation, Map/filter/reduce, Functional pipelines, Terminal vs intermediate operations

## Software Engineering

Streams are generally preferred over manual loops for straightforward
collection transformations in modern Java, since they communicate the
SHAPE of a transformation directly (filter-then-map-then-collect) rather
than requiring a reader to trace through loop and accumulator logic —
though, like comprehensions in Python, overly long or deeply nested
stream chains can become harder to read than a plain loop.

Tags: Declarative code style, Readability tradeoffs, Modern Java idioms

## Common Mistakes

- Forgetting that streams are LAZY and that intermediate operations (`filter`, `map`) do nothing on their own — without a terminal operation like `.collect()` or `.forEach()`, the pipeline never actually executes.
- Trying to reuse the SAME stream object twice — a Java stream can only be consumed (traversed by a terminal operation) ONCE; a second attempt throws an `IllegalStateException`.

## Exercises

- Trace through what filtering alone (with no terminal operation) actually does when that line executes — does any filtering happen yet?
- Rewrite the filter-map-collect example as an equivalent traditional `for` loop, and compare which version communicates the transformation's intent more directly.

## java

```java
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

        List<Integer> result = numbers.stream()
            .filter(n -> n % 2 == 0)
            .map(n -> n * n)
            .collect(Collectors.toList());

        System.out.println(result);   // [4, 16, 36] -- squares of the even numbers (2, 4, 6)

        int sum = numbers.stream()
            .mapToInt(Integer::intValue)
            .sum();
        System.out.println(sum);   // 21 -- 1+2+3+4+5+6
    }
}
```
Walkthrough: `.filter(n -> n % 2 == 0)` keeps only `2, 4, 6`, `.map(n ->
n * n)` transforms each to `4, 16, 36`, and `.collect(Collectors.toList())`
materializes the final result as a list — none of this actually
executes until `.collect()` (the terminal operation) is called. `.sum()`
demonstrates a different terminal operation, reducing the whole stream
down to a single number.
