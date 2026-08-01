---
series: java-fundamentals
level: 16
title: Collections & Streams
lang: java
---

# Collections & Streams

Level 2's plain arrays have a fixed size, decided the moment they're created. `java.util` provides the **Java Collections Framework** — `ArrayList`, `HashMap`, `HashSet`, and more — all generic (Level 12's `<T>`, applied throughout the standard library itself), resizable, and type-safe. Java 8 added the **Streams API** on top, letting data transformations (filter, map, sort, collect) be expressed as a declarative pipeline of lambdas (Level 14) rather than a manually written loop.

## ArrayList&lt;E&gt;

```java
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> names = new ArrayList<>();
        names.add("Alice");
        names.add("Bob");
        names.add("Charlie");
        names.add("Dave");

        System.out.println("Size: " + names.size());
        System.out.println("First: " + names.get(0));

        names.remove("Bob");
        Collections.sort(names);

        for (String name : names) {
            System.out.println(name);
        }
    }
}
```

```text
Size: 4
First: Alice
Alice
Charlie
Dave
```

`ArrayList<String>` — a resizable array, `Box<T>`'s own idea (Level 12) applied to a real, standard-library collection: `<String>` fixes the element type for this specific list, checked at compile time. `new ArrayList<>()` — the diamond operator (Level 12) again, inferring `<String>` from the variable's own declared type.

`names.get(0)` — O(1) random access. Unlike a plain array (Level 2), there is no `names[0]` syntax — every access goes through a real method call instead. `names.remove("Bob")` — O(n) linear scan to find and remove the first matching element. `Collections.sort(names)` — sorts alphabetically, using `String`'s own `compareTo` (Level 4) internally.

`for (String name : names)` — the enhanced `for` loop, first seen back in Level 2's array iteration, works identically here — it accepts any `Iterable<T>`, which `ArrayList<T>` is.

## HashMap&lt;K, V&gt;

```java
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        HashMap<String, Integer> scores = new HashMap<>();
        scores.put("Alice", 92);
        scores.put("Bob", 78);
        scores.put("Charlie", 85);

        System.out.println(scores.get("Alice"));
        System.out.println(scores.containsKey("Dave"));
        scores.put("Bob", 80);

        for (var entry : scores.entrySet()) {
            System.out.println(entry.getKey() + ": " + entry.getValue());
        }
    }
}
```

```text
92
false
Alice: 92
Bob: 80
Charlie: 85
```

`scores.put(key, value)` — inserts or overwrites; calling `put("Bob", 80)` a second time replaces the earlier `78`, rather than adding a second entry. `scores.get(key)` — O(1) average lookup; returns `null` if the key doesn't exist (a real case where `Optional`, from Level 13, would be a genuine improvement over `HashMap`'s own historical `null`-returning `get`). `scores.containsKey(key)` — O(1) existence check, the safe way to test for a key without risking a `null` result.

`scores.entrySet()` — returns a `Set<Map.Entry<K,V>>`; each entry exposes `.getKey()` and `.getValue()`. `var entry` — Java infers `entry`'s real type (`Map.Entry<String, Integer>`) from the loop's own source, the same inference the diamond operator already relied on.

**CS lens:** `HashMap` is a real hash table: each key is hashed to a bucket index, and its value is stored in that bucket. Average O(1) `put`/`get`; worst case O(n) if many keys collide into the same bucket. Iteration order is not guaranteed — the order entries print in isn't the order they were inserted, and isn't required to stay consistent across runs. `LinkedHashMap` preserves insertion order; `TreeMap` keeps entries sorted by key — both real, standard alternatives when order actually matters.

## The Streams API

```java
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> scores = Arrays.asList(88, 92, 75, 95, 83, 62, 91);

        List<Integer> passing = scores.stream()
            .filter(s -> s >= 70)
            .sorted()
            .collect(Collectors.toList());

        double avg = scores.stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0);

        List<String> labels = scores.stream()
            .map(s -> s >= 70 ? "pass" : "fail")
            .collect(Collectors.toList());

        System.out.println(passing);
        System.out.printf("Average: %.1f%n", avg);
        System.out.println(labels);
    }
}
```

```text
[75, 83, 88, 91, 92, 95]
Average: 83.7
[pass, pass, pass, pass, pass, fail, pass]
```

`scores.stream()` — creates a `Stream<Integer>` from the list. Streams are **lazy** — nothing is actually computed yet, just described.

`.filter(s -> s >= 70)` — the lambda from Level 14, now used as a `Predicate` (also Level 14): keeps only elements where it returns `true`. `.sorted()` — sorts in natural order. `.collect(Collectors.toList())` — the **terminal operation** that finally materializes the whole pipeline into a real `List`; nothing before this line actually ran until `collect` demanded a result.

`.mapToInt(Integer::intValue)` — converts `Stream<Integer>` to an `IntStream` for numeric-specific operations; `Integer::intValue` is the method reference syntax from Level 14. `.average()` — returns an `OptionalDouble` (Level 13's own `Optional` idea, specialized for primitives — an empty stream genuinely has no average to report). `.orElse(0)` — unwraps it, falling back to `0` if the stream had been empty.

`.map(s -> s >= 70 ? "pass" : "fail")` — transforms each `Integer` into a `String`, returning `Stream<String>` — Level 7's ternary operator, now used inside a lambda.

**SE lens:** The Streams API follows the same lazy-pipeline model as C#'s LINQ or Python's generators, if you've encountered either. Building the pipeline (`.filter(...).sorted()...`) is cheap and does no real work; computation happens only at the terminal operation (`collect`, `average`, `forEach`). This laziness lets the JVM fuse operations together — a `filter` immediately followed by a `map` immediately followed by `collect` can run in a single pass over the data, rather than building a full intermediate list after every single step the way a naive, eager implementation would.

## Challenge: word_frequency

Given a `List<String>` of words, write a method `HashMap<String, Integer> wordFrequency(List<String> words)` that returns a map from each word to the number of times it appears. Use a loop and `getOrDefault`.

`getOrDefault(key, defaultValue)` — returns the value for the key, or `defaultValue` if the key is absent.

```challenge
static HashMap<String, Integer> wordFrequency(List<String> words) {
    // TODO
}
```

```test
List<String> words = new ArrayList<>();
words.add("the"); words.add("quick"); words.add("brown");
words.add("fox"); words.add("the"); words.add("quick");
words.add("the");
HashMap<String, Integer> freq = wordFrequency(words);
assert freq.get("the") == 3
assert freq.get("quick") == 2
assert freq.get("fox") == 1
assert freq.get("brown") == 1
assert freq.getOrDefault("missing", 0) == 0
```
